from setuptools import setup, find_packages
import os

PROJECT_NAME = "hops-recepten"
PROJECT_PACKAGE_NAME = "HopsRecipes"

PROJECT_GITHUB_USERNAME = "neotje"

PACKAGES = find_packages()

REQUIRED = [
    "pymongo==3.11.3",
    "mongoengine==0.23.0",
    "aiohttp==3.7.4.post0",
    "aiohttp-session==2.9.0",
    "dnspython==2.1.0",
    "PyYAML==5.4.1",
    "cryptography==3.4.7"
]

setup(
    name=PROJECT_PACKAGE_NAME,
    packages=PACKAGES,
    install_requires=REQUIRED,
    entry_points={"console_scripts": [
        "hopsrecipes = hopsrecipes.__main__:main"]}
)