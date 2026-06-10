"""
ChromaDB Admin Management System (CAMS)
A modern web-based admin dashboard for ChromaDB vector databases
"""

__version__ = "1.0.0"
__author__ = "Neetpal Singh"
__email__ = "neetpal@ascentbusiness.co.in"

from .server import start_server
from .client import ChromaDBAdminClient

__all__ = ["start_server", "ChromaDBAdminClient", "__version__"]
