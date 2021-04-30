from typing import Literal
from bson.objectid import ObjectId
from mongoengine.errors import NotUniqueError
from mongoengine.queryset.queryset import QuerySet
from pymongo.errors import DuplicateKeyError

from hopsrecipes.helpers import documents
from hopsrecipes.helpers.exceptions import UserError

import logging
_LOGGER = logging.getLogger(__name__)


USERTYPES = Literal["user", "writer", "admin"]


class User:
    _usr: documents.UserDoc

    def __init__(self, doc: documents.UserDoc):
        self._usr = doc

    @property
    def id(self) -> ObjectId:
        return self._usr.id

    @property
    def name(self) -> str:
        return self._usr.name

    @property
    def email(self) -> str:
        return self._usr.email

    @property
    def type(self) -> USERTYPES:
        return self._usr.type

    @property
    def password(self) -> str:
        return self._usr.password

    def to_dict(self):
        return {
            'name': self.name,
            'id': self.id,
            'email': self.email,
            'type': self.type
        }


def create_user(name: str, email: str, password: str, type: USERTYPES = "user") -> User:
    _LOGGER.debug(f"Creating user: {email}")

    doc = documents.UserDoc(
        name=name.strip(),
        email=email.lower().strip(),
        type=type,
        password=password.strip()
    )

    try:
        doc.save()
    except NotUniqueError or DuplicateKeyError:
        raise UserError("user already exists!")

    return User(doc)


def get_user_by_email(email: str) -> User:
    email = email.lower().strip()

    result: QuerySet = documents.UserDoc.objects(email=email)

    if result.first() is None:
        raise UserError("user does not exist!")

    return User(result.first())
