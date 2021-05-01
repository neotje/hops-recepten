from typing import List

from bson.objectid import ObjectId
from hopsrecipes.user import User
from pymongo.errors import DuplicateKeyError
from mongoengine.errors import NotUniqueError

from hopsrecipes.helpers import documents
from hopsrecipes.helpers.exceptions import RecipeError

import logging
_LOGGER = logging.getLogger(__name__)


class Ingredient:
    amount: str
    name: str

    def __init__(self, amount: str, name: str):
        self.name = name
        self.amount = amount

    def __repr__(self) -> str:
        return f"{{\"amount\": \"{self.amount}\", \"name\": \"{self.name}\"}}"

    def to_dict(self) -> dict:
        return {
            "amount": self.amount,
            "name": self.name
        }


class Step:
    #number: int
    content: str

    def __init__(self, content: str) -> None:
        #self.number = number
        self.content = content

    def __repr__(self) -> str:
        return f"{{\"content\": \"{self.content}\"}}"

    def to_dict(self) -> dict:
        return {"content": self.content}


class Recipe:
    _recipe: documents.RecipeDoc

    def __init__(self, doc: documents.RecipeDoc):
        self._recipe = doc

    @property
    def id(self) -> ObjectId:
        return self._recipe.id

    @property
    def title(self) -> str:
        return self._recipe.title

    @title.setter
    def title(self, val: str):
        self._recipe.title = val
        self._recipe.save()

    @property
    def author(self) -> User:
        return User(self._recipe.author)

    @author.setter
    def author(self, val: User):
        self._recipe.author = val._usr
        self._recipe.save()

    @property
    def ingredients(self) -> List[Ingredient]:
        return [Ingredient(i.amount, i.name) for i in self._recipe.ingredients]

    @ingredients.setter
    def ingredients(self, a: List[Ingredient]):
        self._recipe.ingredients.clear()

        for i in a:
            self._recipe.ingredients.create(amount=i.amount, name=i.name)

        self._recipe.save()

    @property
    def gear(self) -> List[str]:
        return [g.name for g in self._recipe.gear]

    @property
    def steps(self) -> List[Step]:
        return [Step(s.content) for s in self._recipe.steps]

    def add_ingredient(self, amount: str, name: str) -> documents.IngredientDoc:
        if len(self._recipe.ingredients.filter(name=name)) > 0:
            raise RecipeError("ingredient already exists!")

        d = self._recipe.ingredients.create(amount=amount, name=name)
        self._recipe.save()
        return d

    def remove_ingredient(self, name: str):
        self._recipe.ingredients = self._recipe.ingredients.exclude(name=name)
        self._recipe.save()

    def add_gear(self, name: str):
        d = self._recipe.gear.append(name)
        self._recipe.save()
        return d

    def remove_gear(self, name: str):
        self._recipe.gear = self._recipe.gear.exclude(name)
        self._recipe.save()

    def add_step(self, content: str) -> documents.StepDoc:
        d = self._recipe.steps.create(content=content)
        self._recipe.save()
        return d

    def insert_step(self, pos: int, content: str) -> documents.StepDoc:
        d = documents.StepDoc(content=content)
        self._recipe.steps.insert(pos, d)
        self._recipe.save()
        return d

    def remove_step(self, content: str):
        self._recipe.steps = self._recipe.steps.exclude(content=content)
        self._recipe.save()

    def remove_step(self, pos: int):
        self._recipe.steps.pop(pos)
        self._recipe.save()

    def to_dict(self):
        return {
            "id": str(self.id),
            "title": self.title,
            "author": self.author.to_dict(),
            "ingredients": [i.to_dict() for i in self.ingredients],
            "gear": self.gear,
            "steps": [s.to_dict() for s in self.steps]
        }


def create_recipe(title: str, user: User) -> Recipe:
    _LOGGER.debug(f"Creating recipe: {title}")

    doc = documents.RecipeDoc(
        title=title.strip(),
        author=user._usr
    )

    doc.save()

    return Recipe(doc)


def get_recipes() -> List[Recipe]:
    return [Recipe(r) for r in documents.RecipeDoc.objects]


def get_by_id(id: str) -> Recipe:
    r = documents.RecipeDoc.objects(id=id)

    if len(r) == 0:
        raise RecipeError("recipe does not exist")

    return r.first()
