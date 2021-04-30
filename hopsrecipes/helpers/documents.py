from typing import Literal
from mongoengine import Document
from mongoengine.document import EmbeddedDocument
from mongoengine.fields import EmbeddedDocumentField, EmbeddedDocumentListField, IntField, ListField, MultiLineStringField, ReferenceField, StringField, EmailField


class UserDoc(Document):
    name = StringField(required=True, min_length=3)
    email = EmailField(required=True, unique=True)
    type = StringField(required=True)
    password = StringField(required=True, min_length=8)
    meta = {
        'collection': 'users',
        'indexes': [
            '$email'
        ]
    }


class IngredientDoc(EmbeddedDocument):
    amount = StringField()
    name = StringField(required=True)


class StepDoc(EmbeddedDocument):
    number = IntField(min_value=0, required=True)
    content = MultiLineStringField(required=True)


class RecipeDoc(Document):
    title = StringField(required=True)
    author = ReferenceField(UserDoc, required=True)
    ingredients = EmbeddedDocumentListField(IngredientDoc)
    gear = ListField(StringField())
    steps = EmbeddedDocumentListField(StepDoc)
    meta = {
        'collection': 'recipes'
    }