from os import name

from bson.objectid import ObjectId
from hopsrecipes.helpers.exceptions import UserError
from hopsrecipes import user
from hopsrecipes import recipe
from hopsrecipes.helpers import database, documents
import sys

import logging
logging.basicConfig(
    stream=sys.stdout,
    level=logging.INFO,
    format='%(levelname)s:%(name)s:%(funcName)s:[%(lineno)d]   %(message)s'
)
_LOGGER = logging.getLogger(__name__)

database.connect()

r = documents.RecipeDoc.objects(id=ObjectId('608c7a141be72d838ee7005d'))
_LOGGER.info(len(r))
