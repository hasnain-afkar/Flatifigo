"""
WSGI entry point for production deployments.

Usage with Gunicorn:
    gunicorn wsgi:application

Or using the Procfile:
    web: gunicorn wsgi:application
"""

from server import app, init_db

init_db()
application = app
