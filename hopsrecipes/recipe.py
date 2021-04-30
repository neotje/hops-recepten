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


class Step:
    number: int
    content: str

    def __init__(self, number: int, content: str) -> None:
        self.number = number
        self.content = content

    def __repr__(self) -> str:
        return f"{{\"number\": \"{self.number}\", \"content\": \"{self.content}\"}}"


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

    @property
    def author(self) -> User:
        return User(self._recipe.author)

    @property
    def ingredients(self) -> List[Ingredient]:
        return [Ingredient(i.amount, i.name) for i in self._recipe.ingredients]

    @property
    def gear(self) -> List[str]:
        return [g.name for g in self._recipe.gear]

    @property
    def steps(self) -> List[Step]:
        return [Step(s.number, s.content) for s in self._recipe.steps]

    def add_ingredient(self, amount: str, name: str) -> documents.IngredientDoc:
        d = self._recipe.ingredients.create(amount=amount, name=name)
        self._recipe.save()
        return d

    def remove_ingredient(self, amount: str, name: str):
        self._recipe.ingredients = self._recipe.ingredients.exclude(
            amount=amount, name=name)
        self._recipe.save()

    def add_gear(self, name: str):
        d = self._recipe.gear.append(name)
        self._recipe.save()
        return d

    def remove_gear(self, name: str):
        self._recipe.gear = self._recipe.gear.exclude(name)
        self._recipe.save()

    def add_step(self, content: str) -> documents.StepDoc:
        d = self._recipe.steps.create(content=content )
        self._recipe.save()
        return d

    def remove_ingredient(self, amount: str, name: str):
        self._recipe.ingredients = self._recipe.ingredients.exclude(
            amount=amount, name=name)
        self._recipe.save()


def create_recipe(title: str, user: User) -> Recipe:
    _LOGGER.debug(f"Creating recipe: {title}")

    doc = documents.RecipeDoc(
        title=title.strip(),
        author=user._usr
    )

    doc.save()

    return Recipe(doc)
