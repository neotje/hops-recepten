import yaml
from pathlib import Path

from hopsrecipes.helpers.exceptions import ConfigError

import logging
_LOGGER = logging.getLogger(__name__)


base_config = {
    "mongodb": {
        "url": "mongodb_srv://...",
        "database": "db-name"
    },
    "server": {
        "host": "localhost",
        "port": 9393
    }
}


def check_config():
    _LOGGER.info("checking config...")

    from hopsrecipes import helpers
    path = Path(helpers.__path__[0]) / ".." / ".." / "config" / "server.yaml"
    _LOGGER.debug(path)

    if not path.exists():
        raise ConfigError("Config does not exist!")

    with open(path, 'r') as f:
        config = yaml.full_load(f)

        _LOGGER.debug(config)

        if config is None:
            with open(path, 'w') as f:
                yaml.dump(base_config, f)
                raise ConfigError(
                    "Config is empty! filled it with default field. Please update the config.")

        if base_config == config:
            raise ConfigError(
                "Config has default values! please update your config")


def get_config() -> dict:
    from hopsrecipes import helpers
    path = Path(helpers.__path__[0]) / ".." / ".." / "config" / "server.yaml"

    if not path.exists():
        raise ConfigError("Config does not exist!")

    with open(path, 'r') as f:
        return yaml.full_load(f)
