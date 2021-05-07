import sys

from hopsrecipes.helpers.config import check_config
from hopsrecipes.helpers import database
from hopsrecipes.server import run_app

import logging
logging.basicConfig(
    stream=sys.stdout,
    level=logging.DEBUG,
    format='%(levelname)s:%(name)s:%(funcName)s:[%(lineno)d]   %(message)s'
)
_LOGGER = logging.getLogger(__name__)

def main():
    check_config()
    database.connect()
    run_app()

if __name__ == "__main__":
    sys.exit(main())
