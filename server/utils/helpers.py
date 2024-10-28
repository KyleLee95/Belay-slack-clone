import random
import sqlite3
import string
from functools import wraps
import bcrypt
from flask import g, make_response, request, session, jsonify


def new_user():
    try:
        data = request.get_json()
        username = data["username"]
        email = data["email"]
        password = data["password"]

        bytes_password = password.encode("utf-8")
        salt = bcrypt.gensalt()
        hash_password = bcrypt.hashpw(bytes_password, salt)

        u = query_db(
            "INSERT INTO users (username, email, password) VALUES (?, ?, ?) RETURNING id, username, password",
            [username, email, hash_password],
            one=True,
        )
        id, username, password = u

        return {"username": username, "id": id, "password": password.decode("utf-8")}
    except Exception as e:
        print(e)
        return {"error": str(e)}, 500


def convert_messages_to_dicts(rows):
    result = []
    for row in rows:
        message_id, user_id, room_id, body = row  # Unpack the tuple
        message_dict = {
            "message_id": message_id,
            "user_id": user_id,
            "room_id": room_id,
            "body": body,
        }
        result.append(message_dict)
    return result


def convert_user_to_dict(row):
    username, id, password = row
    user_dict = {"id": id, "username": username, "password": password}
    return user_dict


def convert_channels_to_dicts(rows):
    result = []
    for row in rows:
        id, name = row  # Unpack the tuple
        message_dict = {"id": id, "name": name}
        result.append(message_dict)
    return result


def has_api_key(func):

    @wraps(func)
    def wrapper(*args, **kwargs):
        user_cookie = request.cookies.get("kchow1_belay_cookie")
        if not user_cookie:
            return {"error": "You are not authenticated"}, 401
        user_id_from_session = session["user_id"]

        return func(*args, **kwargs)

    return wrapper


def get_db():
    db = getattr(g, "_database", None)

    if db is None:
        db = g._database = sqlite3.connect("db/belay.sqlite3")
        db.row_factory = sqlite3.Row
        setattr(g, "_database", db)
    return db


def write_to_db(query, args=(), one=False):
    conn = sqlite3.connect("db/belay.sqlite3")
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    cur.execute(query, args)
    conn.commit()
    last_id = cur.lastrowid
    cur.close()
    conn.close()
    return last_id if one else last_id


def query_db(query, args=(), one=False):
    db = get_db()
    cursor = db.execute(query, args)
    rows = cursor.fetchall()
    db.commit()
    cursor.close()
    if rows:
        if one:
            return rows[0]
        return rows
    return None


def new_channel():
    name = request.json["channelName"]
    q_string = """
    INSERT INTO channels (name) VALUES (?) returning id, name
    """
    rows = query_db(
        q_string,
        [name],
        one=False,
    )
    channels = convert_channels_to_dicts(rows)
    # TODO: add error handling if channel already exists
    if not channels:
        return {"error": "Channel already exists"}
    return channels
