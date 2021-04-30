import mongoengine
from pymongo.mongo_client import MongoClient

from hopsrecipes.helpers.config import get_config

import logging
_LOGGER = logging.getLogger(__name__)

_config = get_config()

CLIENT: MongoClient

def connect():
    _LOGGER.info(f"Connecting to database: " + _config["mongodb"]["database"])
    CLIENT: MongoClient = mongoengine.connect(db=_config["mongodb"]["database"], host=_config["mongodb"]["url"])
    _LOGGER.debug(CLIENT.server_info())

