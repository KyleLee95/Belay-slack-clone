from flask import request, jsonify, session
from flask import Blueprint, make_response, request
from utils.helpers import convert_user_to_dict, has_api_key, new_user, query_db
import bcrypt

auth = Blueprint("auth", __name__)


@auth.route("/signup", methods=["GET", "POST"])
def signup():
    try:
        data = request.get_json()
        username = data["username"]
        email = data["email"]
        password = data["password"]

        bytes_password = password.encode("utf-8")
        salt = bcrypt.gensalt(12)
        hash_password = bcrypt.hashpw(bytes_password, salt)

        u = query_db(
            "INSERT INTO users (username, email, password) VALUES (?, ?, ?) RETURNING id, username, password",
            [username, email, hash_password],
            one=True,
        )
        id, username, password = u
        user_dict = {
            "id": id,
            "username": username,
            "password": password.decode("utf-8"),
        }
        hashed_user_id = bcrypt.hashpw(
            str(id).encode("utf-8"), bcrypt.gensalt(12))
        res = make_response(
            {"success": True, "message": "success", "user": user_dict})
        res.set_cookie(
            "kchow1_belay_cookie",
            hashed_user_id.decode("utf-8"),
        )
        return res, 200

    except Exception as e:
        print(e)
        return {"error": str(e)}, 500


@auth.route("/validateCookie", methods=["GET", "POST"])
def validate_cookie():

    # TODO: Decrypt cookie using Bcrypt to recover the user_id to use for the query
    user_id_from_session = session["user_id"]
    user_belay_cookie = request.cookies.get("kchow1_belay_cookie")
    is_valid_cookie = bcrypt.checkpw(
        user_id_from_session.encode("utf-8"), user_belay_cookie.encode("utf-8")
    )
    if is_valid_cookie:
        user = query_db(
            "SELECT username, id FROM users WHERE id = ?;",
            [user_id_from_session],
            one=True,
        )
        user_dict = {"id": user["id"], "username": user["username"]}

        return {"success": True, "message": "success", "user": user_dict}
    else:
        return {"succes": False, "message": "failed", "user": {}}


@auth.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")
    user_from_db = query_db(
        "SELECT username, id, password FROM users WHERE username = ?;",
        [username],
        one=True,
    )

    hashed_password_from_db = user_from_db["password"]

    bytes_password = password.encode("utf-8")
    salt = bcrypt.gensalt()
    hash = bcrypt.hashpw(bytes_password, salt)
    userBytes = password.encode("utf-8")

    # checking password
    is_valid_password = bcrypt.checkpw(userBytes, hash)

    if user_from_db and is_valid_password:
        session["user_id"] = str(user_from_db["id"])

        # bcrypt only works on strings
        user_id_str = str(user_from_db["id"]).encode("utf-8")
        # Generate the bcrypt hash
        hashed_user_id = bcrypt.hashpw(user_id_str, bcrypt.gensalt(12))
        user_dict = {"id": user_from_db["id"],
                     "username": user_from_db["username"]}

        res = make_response(
            {"success": True, "message": "success", "user": user_dict})
        res.set_cookie(
            "kchow1_belay_cookie",
            hashed_user_id.decode("utf-8"),
        )
        return res, 200
    else:
        return jsonify({"error": "Invalid username or password", "user": None}), 401


@auth.route("/logout", methods=["POST"])
# @has_api_key
def logout():
    resp = make_response()
    session.clear()
    resp.delete_cookie("kchow1_belay_cookie")
    return resp
