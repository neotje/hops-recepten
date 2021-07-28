import json
from json.decoder import JSONDecodeError
import random
import base64
from typing import List
from cryptography.fernet import Fernet
from multidict import MultiDict

from aiohttp import web
from aiohttp.web_request import Request
from aiohttp.web_response import Response, json_response
from aiohttp_session import Session, get_session, setup
from aiohttp_session.cookie_storage import EncryptedCookieStorage
import aiohttp_cors

from hopsrecipes import recipe, user
from hopsrecipes.helpers.config import get_config
from hopsrecipes.helpers.exceptions import RecipeError, UserError

import logging
_LOGGER = logging.getLogger(__name__)


EDIT_GRP = ["admin", "writer"]


class REQUEST_ERRORS:
    MISSING_FIELDS = {"error": {
        "code": 100,
        "msg": "Missing required fields!"
    }}


class USER_ERRORS:
    ALREADY_LOGGED_IN = {"error": {
        "code": 200,
        "msg": "there is already someone logged in."
    }}

    DOES_NOT_EXIST = {"error": {
        "code": 201,
        "msg": "Requested user does not exist."
    }}

    INVALID_CREDENTIALS = {"error": {
        "code": 202,
        "msg": "Invalid credentials."
    }}

    NOT_LOGGED_IN = {"error": {
        "code": 203,
        "msg": "there is no user"
    }}

    PERMISSION_DENIED = {"error": {
        "code": 204,
        "msg": "permission denied!"
    }}


class RECIPE_ERRORS:
    CREATION_FAILED = {"error": {
        "code": 300,
        "msg": "failed to create a new recipe. check if title has a minimum length of 3 characters"
    }}

    DOES_NOT_EXIST = {"error": {
        "code": 301,
        "msg": "Requested recipe does not exist."
    }}


_sessions = {}

def _user_has_session(user: user.User) -> bool:
    for key in _sessions:
        if _sessions[key].id == user.id:
            return True
    return False


def _new_session(s: Session, user: user.User):
    new_id = f"{random.randint(1000, 9999)}-{random.randint(1000, 9999)}"
    _sessions[new_id] = user
    s['user'] = new_id

    _LOGGER.debug(f"New user session: {new_id}")

    return new_id


def _get_user_session(s: Session) -> user.User:
    return _sessions[s['user']]


def _remove_user_session(s: Session):
    _sessions.pop(s['user'])
    s.pop('user')


def _logged_in(s: Session) -> bool:
    return 'user' in s or s.get('user') is not None


async def _get_json(req: Request) -> dict:
    try:
        return await req.json()
    except JSONDecodeError:
        return {}


def _response(data) -> Response:
    return json_response(data, headers=HEADERS)


HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "*",
    "Access-Control-Request-Headers": "*",
    "Access-Control-Expose-Headers": "*"
}


"""
Routes
"""
routes = web.RouteTableDef()


@routes.get("/user")
async def current_user(req: Request):
    session: Session = await get_session(req)

    _LOGGER.debug(session)

    if not 'user' in session or session.get('user') is None:
        return json_response(USER_ERRORS.NOT_LOGGED_IN)

    u: user.User = _get_user_session(session)

    return json_response({
        "user": {
            "email": u.email,
            "name": u.name,
            "type": u.type
        }
    })


@routes.post("/user/login")
async def user_login(req: Request):
    session: Session = await get_session(req)
    body = await _get_json(req)

    # check for user session
    if 'user' in session and session.get('user') is not None:
        return json_response(USER_ERRORS.ALREADY_LOGGED_IN)

    # check for required fields
    if 'email' in body and 'password' in body:
        email = body.get('email').strip().lower()
        password = body.get('password').strip()

        # check if user exists
        try:
            u = user.get_user_by_email(email)
        except UserError:
            return json_response(USER_ERRORS.DOES_NOT_EXIST)
    else:
        return json_response(REQUEST_ERRORS.MISSING_FIELDS)

    # check if passwords match
    if not u.password == password:
        return json_response(USER_ERRORS.INVALID_CREDENTIALS)

    # check if user already has active session
    if _user_has_session(u):
        return json_response(USER_ERRORS.ALREADY_LOGGED_IN)

    # create new session
    _new_session(session, u)

    return json_response({
        "user": {
            "name": u.name,
            "email": u.email,
            "type": u.type
        }
    })


@routes.get("/user/logout")
async def user_logout(req: Request):
    session = await get_session(req)

    if 'user' in session and session.get('user') is not None:
        _remove_user_session(session)

        return json_response({
            "status": "ok"
        })

    return json_response(USER_ERRORS.NOT_LOGGED_IN)


"""
Recipes routes 
"""


@routes.get("/recipes/list")
async def recipes_list(req: Request):
    arr = recipe.get_recipes()

    return json_response({
        "recipes": [r.to_dict() for r in arr]
    })




@routes.post("/recipes/new")
async def create_recipe(req: Request):
    session: Session = await get_session(req)

    if not _logged_in(session):
        return json_response(USER_ERRORS.NOT_LOGGED_IN)

    u = _get_user_session(session)

    if not u.type in EDIT_GRP:
        return json_response(USER_ERRORS.PERMISSION_DENIED)

    if not 'title' in req.headers:
        return json_response(REQUEST_ERRORS.MISSING_FIELDS)

    title = req.headers.get('title').strip()

    try:
        r = recipe.create_recipe(title, u)
    except RecipeError:
        return json_response(RECIPE_ERRORS.CREATION_FAILED)

    return json_response({
        "recipe": r.to_dict()
    })


@routes.post("/recipes/{id}/image")
async def post_recipe_image(req: Request):
    session: Session = await get_session(req)

    # check if user is logged in
    if not _logged_in(session):
        return json_response(USER_ERRORS.NOT_LOGGED_IN)

    u = _get_user_session(session)

    # check if user has permission
    if not u.type in EDIT_GRP:
        return json_response(USER_ERRORS.PERMISSION_DENIED)

    # get recipe by id
    try:
        r = recipe.get_by_id(req.match_info['id'])
    except RecipeError:
        return json_response(RECIPE_ERRORS.DOES_NOT_EXIST)

    # check if writer is the author of the recipe
    if not u.type == 'admin' and not r.author.id == u.id:
        return json_response(USER_ERRORS.PERMISSION_DENIED)

    data = await req.post()
    img = data["image"]
    ctype = img.content_type

    _LOGGER.info(ctype)

    r._recipe.image.put(img.file, content_type=ctype)
    r._recipe.save()

    return json_response({"status": "ok"})


@routes.get("/recipes/{id}/image")
async def get_recipe_image(req: Request):
    # get recipe by id
    try:
        r = recipe.get_by_id(req.match_info['id'])
    except RecipeError:
        return json_response(RECIPE_ERRORS.DOES_NOT_EXIST)

    content = r._recipe.image.read()
    content_type = r._recipe.image.content_type

    return Response(body=content, headers=MultiDict({'CONTENT-TYPE': content_type}))


@routes.get("/recipes/{id}")
async def get_recipe(req: Request):
    # get recipe by id
    try:
        r = recipe.get_by_id(req.match_info['id'])
    except RecipeError:
        return json_response(RECIPE_ERRORS.DOES_NOT_EXIST)

    return json_response({
        "recipe": r.to_dict()
    })


@routes.post("/recipes/ingredients/add")
async def add_ingredient(req: Request):
    session: Session = await get_session(req)

    # check if user is logged in
    if not _logged_in(session):
        return json_response(USER_ERRORS.NOT_LOGGED_IN)

    u = _get_user_session(session)

    # check if user has permission
    if not u.type in EDIT_GRP:
        return json_response(USER_ERRORS.PERMISSION_DENIED)

    # check if required field are present
    if 'id' not in req.headers or 'name' not in req.headers:
        return json_response(REQUEST_ERRORS.MISSING_FIELDS)

    # get recipe by id
    try:
        r = recipe.get_by_id(req.headers.get('id'))
    except RecipeError:
        return json_response(RECIPE_ERRORS.DOES_NOT_EXIST)

    # check if writer is the author of the recipe
    if not u.type == 'admin' and not r.author.id == u.id:
        return json_response(USER_ERRORS.PERMISSION_DENIED)

    # add ingredient
    i = r.add_ingredient(req.headers.get('amount'), req.headers.get('name'))

    return json_response({
        "recipe": r.to_dict()
    })


@routes.post("/recipes/ingredients/set")
async def set_ingredients(req: Request):
    session: Session = await get_session(req)

    body = await _get_json(req)

    # check if user is logged in
    if not _logged_in(session):
        return json_response(USER_ERRORS.NOT_LOGGED_IN)

    u = _get_user_session(session)

    # check if user has permission
    if not u.type in EDIT_GRP:
        return json_response(USER_ERRORS.PERMISSION_DENIED)

    # check if required fields are present
    if 'id' not in req.headers or 'ingredients' not in body:
        return json_response(REQUEST_ERRORS.MISSING_FIELDS)

    # get recipe by id
    try:
        r = recipe.get_by_id(req.headers.get('id'))
    except RecipeError:
        return json_response(RECIPE_ERRORS.DOES_NOT_EXIST)

    # check if writer is the author of the recipe
    if not u.type == 'admin' and not r.author.id == u.id:
        return json_response(USER_ERRORS.PERMISSION_DENIED)

    r.ingredients = [
        recipe.Ingredient(i["amount"], i["name"]) for i in body["ingredients"]
    ]

    return json_response({
        'recipe': r.to_dict()
    })


@routes.post("/recipes/gear/set")
async def set_gear(req: Request):
    session: Session = await get_session(req)

    body = await _get_json(req)

    # check if user is logged in
    if not _logged_in(session):
        return json_response(USER_ERRORS.NOT_LOGGED_IN)

    u = _get_user_session(session)

    # check if user has permission
    if not u.type in EDIT_GRP:
        return json_response(USER_ERRORS.PERMISSION_DENIED)

    # check if required fields are present
    if 'id' not in req.headers or 'gear' not in body:
        return json_response(REQUEST_ERRORS.MISSING_FIELDS)

    # get recipe by id
    try:
        r = recipe.get_by_id(req.headers.get('id'))
    except RecipeError:
        return json_response(RECIPE_ERRORS.DOES_NOT_EXIST)

    # check if writer is the author of the recipe
    if not u.type == 'admin' and not r.author.id == u.id:
        return json_response(USER_ERRORS.PERMISSION_DENIED)

    r.gear = body['gear']

    return json_response({
        'recipe': r.to_dict()
    })


@routes.post("/recipes/steps/set")
async def set_gear(req: Request):
    session: Session = await get_session(req)

    body = await _get_json(req)

    # check if user is logged in
    if not _logged_in(session):
        return json_response(USER_ERRORS.NOT_LOGGED_IN)

    u = _get_user_session(session)

    # check if user has permission
    if not u.type in EDIT_GRP:
        return json_response(USER_ERRORS.PERMISSION_DENIED)

    # check if required fields are present
    if 'id' not in req.headers or 'steps' not in body:
        return json_response(REQUEST_ERRORS.MISSING_FIELDS)

    # get recipe by id
    try:
        r = recipe.get_by_id(req.headers.get('id'))
    except RecipeError:
        return json_response(RECIPE_ERRORS.DOES_NOT_EXIST)

    # check if writer is the author of the recipe
    if not u.type == 'admin' and not r.author.id == u.id:
        return json_response(USER_ERRORS.PERMISSION_DENIED)

    r.steps = [recipe.Step(s['content']) for s in body['steps']]

    return json_response({
        'recipe': r.to_dict()
    })


@routes.get("/routes")
async def get_routes(req: Request):
    return json_response({
        "routes": [
            r.get_info().get["path"] for r in list(req.app.router.routes())
        ]
    })


app = web.Application(client_max_size=20*(1024**2))
app.add_routes(routes)

# sessions
fernet_key = Fernet.generate_key()
secret_key = base64.urlsafe_b64decode(fernet_key)
setup(app, EncryptedCookieStorage(secret_key))

# cors
cors = aiohttp_cors.setup(app, defaults={
    "*": aiohttp_cors.ResourceOptions(
        allow_credentials=True,
        expose_headers="*",
        allow_headers="*",
        allow_methods="*",
    )
})

def run_app():
    config = get_config()

    # add cors to all routes
    for r in list(app.router.routes()):
        cors.add(r)

    web.run_app(app, host=config["server"]["host"],
                port=config["server"]["port"])
