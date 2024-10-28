import json

from flask import Blueprint, request

from utils.helpers import has_api_key, query_db

users = Blueprint("users", __name__)


@users.route("/name", methods=["PUT"])
@has_api_key
def update_username():
    try:
        new_user_name = request.json["newUsername"]
        user_id = request.json["id"]

        query_string = "UPDATE users SET name = ? WHERE id = ?"
        query_db(query_string, [new_user_name, user_id])

        return {"message": "success"}, 200
    except Exception as e:
        print(e)
        return {"error": str(e)}, 500


# POST to change the user's password
@users.route("/password", methods=["PUT"])
@has_api_key
def update_user_password():
    try:
        user_id = request.json["id"]

        new_password = request.json["newPassword"]

        query_string = "UPDATE users SET password = ? WHERE id = ?"
        query_db(query_string, [new_password, user_id])

        return {"message": "success"}, 200
    except Exception as e:
        print(e)
        return {"error": str(e)}, 400
