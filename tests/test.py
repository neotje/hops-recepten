from os import name
from hopsrecipes.helpers.exceptions import UserError
from hopsrecipes import user
from hopsrecipes import recipe
from hopsrecipes.helpers import database
import sys

import logging
logging.basicConfig(
    stream=sys.stdout,
    level=logging.INFO,
    format='%(levelname)s:%(name)s:%(funcName)s:[%(lineno)d]   %(message)s'
)
_LOGGER = logging.getLogger(__name__)

database.connect()

try:
    usr = user.create_user("test", "neo@hopjes.net", "test12345")
    _LOGGER.info(usr)
except UserError:
    usr = user.get_user_by_email("neo@hopjes.net")
    _LOGGER.info(usr.to_dict())

r = recipe.create_recipe("pannenkoeken", usr)
r.add_ingredient("500 gr", "meel")
_LOGGER.info(r.author.to_dict())
