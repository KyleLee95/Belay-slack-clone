# fmt: off

import os
import sqlite3
import sys

from flask import (Flask, abort, g, jsonify, redirect, request,
                   send_from_directory)

# Manually adding the path to the module path otherwise it doesn't work
sys.path.insert(1, os.path.dirname(os.path.abspath(__file__)))
from api.auth import auth
from api.channels import channels
from api.users import users
from api.messages import messages
from utils.db_manager import DatabaseManager
from utils.helpers import has_api_key, query_db
from utils.query_manager import Model

# Setup the app

app = Flask(__name__, static_folder='../client/dist')
app.config["SECRET_KEY"] = 'puppies'
# bcrypt = Bcrypt(app)
# Setup Database Manager
db_manager = DatabaseManager(app)
# Setup wannabe ORM
# Connect the model instance to the DB so that all of the subclasses can access it



# Register API blueprints
app.register_blueprint(users, url_prefix='/api/users/')
app.register_blueprint(auth, url_prefix='/api/auth')
app.register_blueprint(channels, url_prefix='/api/channels/')
app.register_blueprint(messages, url_prefix="/api/messages/")

@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def index(path):
    # print("path", path)
    # Redirect to Vite server in development for non-API requests
    if os.environ.get("FLASK_ENV") == "development" and not path.startswith("api/"):
        return redirect("http://localhost:5174")
    # Handle static files
    if path and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)

    # Fallback to index.html for SPA paths
    return send_from_directory(app.static_folder, "index.html")

    # Model.set_connection(db)


with app.app_context():
    db_manager = DatabaseManager()


if __name__ == "__main__":
    app.run(use_reloader=True, host="localhost", port=8080, threaded=True)
