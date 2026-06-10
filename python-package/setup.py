"""
ChromaDB Admin Management System (CAMS) - Python Package
Setup configuration for PyPI distribution
"""

from setuptools import setup, find_packages
from pathlib import Path

# Read the README file
this_directory = Path(__file__).parent
long_description = (this_directory / "README.md").read_text(encoding='utf-8')

setup(
    name='chromadb-admin',
    version='1.0.0',
    author='Neetpal Singh',
    author_email='neetpalsingh750@gmail.com',
    description='ChromaDB Admin Management System - A web-based admin dashboard for ChromaDB vector databases',
    long_description=long_description,
    long_description_content_type='text/markdown',
    url='https://github.com/neetpalsingh/ChromaDB-Admin-managment',
    project_urls={
        'Bug Reports': 'https://github.com/neetpalsingh/ChromaDB-Admin-managment/issues',
        'Source': 'https://github.com/neetpalsingh/ChromaDB-Admin-managment',
        'Documentation': 'https://github.com/neetpalsingh/ChromaDB-Admin-managment#readme',
    },
    packages=find_packages(where='src'),
    package_dir={'': 'src'},
    classifiers=[
        'Development Status :: 4 - Beta',
        'Intended Audience :: Developers',
        'Topic :: Database :: Database Engines/Servers',
        'Topic :: Scientific/Engineering :: Artificial Intelligence',
        'License :: OSI Approved :: MIT License',
        'Programming Language :: Python :: 3',
        'Programming Language :: Python :: 3.8',
        'Programming Language :: Python :: 3.9',
        'Programming Language :: Python :: 3.10',
        'Programming Language :: Python :: 3.11',
        'Programming Language :: Python :: 3.12',
        'Operating System :: OS Independent',
    ],
    keywords='chromadb vector-database admin dashboard management ui embeddings ai ml',
    python_requires='>=3.8',
    install_requires=[
        'chromadb>=0.4.0',
        'fastapi>=0.100.0',
        'uvicorn>=0.23.0',
        'pydantic>=2.0.0',
        'python-dotenv>=1.0.0',
        'requests>=2.31.0',
    ],
    extras_require={
        'dev': [
            'pytest>=7.0.0',
            'black>=23.0.0',
            'flake8>=6.0.0',
            'mypy>=1.0.0',
        ],
    },
    entry_points={
        'console_scripts': [
            'chromadb-admin=chromadb_admin.cli:main',
        ],
    },
    include_package_data=True,
    package_data={
        'chromadb_admin': [
            'static/*',
            'templates/*',
        ],
    },
    zip_safe=False,
)
