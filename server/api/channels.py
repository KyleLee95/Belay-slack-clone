from flask import Blueprint, request, session, jsonify
from datetime import datetime
from utils.helpers import (
    convert_channels_to_dicts,
    get_db,
    has_api_key,
    new_channel,
    query_db,
)

channels = Blueprint("channels", __name__)


@channels.route("/<int:channel_id>", methods=["GET"])
@has_api_key
def get_room_by_id(channel_id):
    try:

        q_string = """
        SELECT channels.*, m.*
        FROM channels
        INNER JOIN messages m ON channels.id = m.channel_id
        WHERE channels.id = ?
        """
        room = query_db(q_string, [channel_id], one=False)
        rooms_list = [dict(room) for room in room]

        print("rooms_list", rooms_list)
        room_dict = {
            "id": room["id"],
            "name": room["name"],
            "messages": room["messages"],
        }
        return room_dict, 200

    except Exception as e:
        print(e)
        return {"error": str(e)}, 500


@channels.route("/new", methods=["POST"])
@has_api_key
def create_channel():
    try:
        name = request.json["channelName"]
        q_string = """
        INSERT INTO channels (name) VALUES (?) returning id, name
        """
        rows = query_db(
            q_string,
            [name],
            one=False,
        )
        # TODO: add error handling if channel already exists
        channels = convert_channels_to_dicts(rows)
        return {"channel": channels}, 200
    except Exception as e:
        print(e)
        return {"error": str(e)}, 500


# POST to post a new message to a room
@channels.route("/<int:channel_id>/reply", methods=["POST"])
@has_api_key
def post_reply_to_room(channel_id):
    user_id = session["user_id"]
    text = request.json["message"]
    reply_to = request.json["replyTo"]

    try:
        insert_string = """
        INSERT INTO messages (user_id, channel_id, replies_to, text)
        VALUES (?, ?, ?, ?) RETURNING id, user_id;
        """
        # TODO: add error handling if channel already exists
        # include emoji reactions and replies and emoji reactions to the replies
        q_string = """
        SELECT
          m.id,
          m.text,
          m.replies_to,
          m.timestamp,
          u.id AS user_id,
          u.username AS user_name
        FROM
          messages m
          INNER JOIN users u ON m.user_id = u.id
        WHERE
          m.id = last_insert_rowid()
        UNION ALL
        SELECT
          m.id,
          m.text,
          m.replies_to,
          m.timestamp,
          u.id AS user_id,
          u.username AS user_name
        FROM
          messages m
          INNER JOIN users u ON m.user_id = u.id
        WHERE
          m.channel_id = :channel_id
          AND (:last_msg_id IS NULL OR m.id > :last_msg_id)
        ORDER BY
          timestamp ASC;
        """
        last_message = query_db(
            insert_string, [user_id, channel_id, reply_to, text], one=True
        )

        message = query_db(
            q_string,
            [
                last_message["id"],
                user_id,
            ],
            one=True,
        )

        return {"newMessage": [dict(message)]}, 200

    except Exception as e:
        print(e)
        return {"error": str(e)}, 500


# POST to post a new message to a room
@channels.route("/<int:channel_id>/message", methods=["POST"])
@has_api_key
def post_new_message_to_room(channel_id):
    user_id = session["user_id"]
    text = request.json["message"]

    try:
        insert_string = """
        INSERT INTO messages (user_id, channel_id, text)
        VALUES (?, ?, ?) RETURNING id, user_id;
        """

        q_string = """
        SELECT
          m.id,
          m.text,
          m.replies_to,
          m.timestamp,
          m.channel_id,
          u.id AS user_id,
          u.username AS user_name
        FROM
          messages m
          INNER JOIN users u ON m.user_id = u.id
        WHERE
          m.id = last_insert_rowid()
        UNION ALL
        SELECT
          m.id,
          m.text,
          m.replies_to,
          m.timestamp,
          m.channel_id,
          u.id AS user_id,
          u.username AS user_name
        FROM
          messages m
          INNER JOIN users u ON m.user_id = u.id
        WHERE
          m.channel_id = :channel_id
          AND (:last_msg_id IS NULL OR m.id > :last_msg_id)
        ORDER BY
          timestamp ASC;
        """
        last_message = query_db(
            insert_string, [user_id, channel_id, text], one=True)

        message = query_db(
            q_string,
            [
                last_message["id"],
                user_id,
            ],
            one=True,
        )

        return {"newMessage": [dict(message)]}, 200

    except Exception as e:
        print(e)
        return {"error": str(e)}, 500


@channels.route("/", methods=["GET"])
@has_api_key
def get_all_channels():
    try:
        rows = query_db("SELECT * FROM CHANNELS", [], one=False)
        channels_from_rows = convert_channels_to_dicts(rows)

        return {"channels": channels_from_rows}, 200
    except Exception as e:
        print(e)
        return {"error": str(e)}, 500


@channels.route("/<int:channel_id>/messages", methods=["GET"])
@has_api_key
def get_messages(channel_id):
    main_query = """
    WITH main_messages AS (
        SELECT
            m.id,
            m.text,
            m.replies_to,
            m.channel_id,
            m.timestamp,
            u.id AS user_id,
            u.username AS user_name
        FROM
            messages m
        INNER JOIN
            users u ON m.user_id = u.id
        WHERE
            m.channel_id = ?
            AND m.replies_to IS NULL
        ORDER BY
            m.timestamp ASC
    ),
    replies AS (
        SELECT
            r.id,
            r.text,
            r.replies_to,
            r.channel_id,
            r.timestamp,
            u.id AS user_id,
            u.username AS user_name
        FROM
            messages r
        INNER JOIN
            users u ON r.user_id = u.id
        WHERE
            r.channel_id = ?
            AND r.replies_to IS NOT NULL
        ORDER BY
            r.timestamp ASC
    ),
    reactions_count AS (
        SELECT
            r.message_id,
            r.emoji,
            COUNT(r.emoji) AS count,
            GROUP_CONCAT(u.username) AS users
        FROM
            reactions r
        INNER JOIN
            users u ON r.user_id = u.id
        GROUP BY
            r.message_id, r.emoji
    )
    SELECT
        m.id,
        m.text,
        m.replies_to,
        m.channel_id,
        m.timestamp,
        m.user_id,
        m.user_name,
        rc.emoji,
        rc.count,
        rc.users,
        reply.id AS reply_id,
        reply.text AS reply_text,
        reply.replies_to AS reply_replies_to,
        reply.timestamp AS reply_timestamp,
        reply.user_id AS reply_user_id,
        reply.user_name AS reply_user_name,
        rr.emoji AS reply_emoji,
        rr.count AS reply_count,
        rr.users AS reply_users
    FROM
        main_messages m
    LEFT JOIN
        reactions_count rc ON m.id = rc.message_id
    LEFT JOIN
        replies reply ON m.id = reply.replies_to
    LEFT JOIN
        reactions_count rr ON reply.id = rr.message_id
    ORDER BY
        m.timestamp ASC, reply.timestamp ASC;
    """

    messages = query_db(main_query, [channel_id, channel_id])
    message_dict = {}
    if messages:
        for row in messages:
            message_id = row["id"]
            if message_id not in message_dict:
                message_dict[message_id] = {
                    "id": row["id"],
                    "user_name": row["user_name"],
                    "text": row["text"],
                    "channel_id": row["channel_id"],
                    "timestamp": row["timestamp"],
                    "replies": [],
                    "reactions": [],
                }
            if row["emoji"]:
                reaction = {
                    "emoji": row["emoji"],
                    "count": row["count"],
                    "users": row["users"].split(",") if row["users"] else [],
                }
                if reaction not in message_dict[message_id]["reactions"]:
                    message_dict[message_id]["reactions"].append(reaction)
            if row["reply_id"]:
                reply_id = row["reply_id"]
                reply = {
                    "id": reply_id,
                    "user_name": row["reply_user_name"],
                    "text": row["reply_text"],
                    "timestamp": row["reply_timestamp"],
                    "reactions": [],
                }
                if reply not in message_dict[message_id]["replies"]:
                    message_dict[message_id]["replies"].append(reply)
                if row["reply_emoji"]:
                    reply_reaction = {
                        "emoji": row["reply_emoji"],
                        "count": row["reply_count"],
                        "users": (
                            row["reply_users"].split(
                                ",") if row["reply_users"] else []
                        ),
                    }
                    if reply_reaction not in reply["reactions"]:
                        reply["reactions"].append(reply_reaction)

    return {"messages": list(message_dict.values())}, 200


@channels.route("/<int:channel_id>/mark-read", methods=["POST"])
@has_api_key
def mark_current_channel_read(channel_id):
    try:
        user_id = session["user_id"]
        last_message_id = request.json["lastMessageId"]
        last_seen_timestamp = datetime.now().isoformat()

        query = """
            INSERT INTO user_message_views (user_id, channel_id, last_seen_message_id, last_seen_timestamp)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(user_id, channel_id) DO UPDATE SET
                last_seen_message_id = excluded.last_seen_message_id,
                last_seen_timestamp = excluded.last_seen_timestamp;
        """
        query_db(query, [user_id, channel_id,
                 last_message_id, last_seen_timestamp])
        return {"success": True}, 200
    except Exception as e:
        print(e)
        return {"error": str(e)}, 500


@channels.route("/unread-counts-for-user/<int:user_id>", methods=["GET"])
@has_api_key
def fetch_unread_messages(user_id):
    try:
        unread_messages = """
            SELECT
                channels.id AS channel_id,
                COUNT(messages.id) AS unread_count,
                MAX(messages.id) AS last_msg_id
            FROM
                channels
            LEFT JOIN
                messages ON channels.id = messages.channel_id
            LEFT JOIN
                user_message_views umv ON channels.id = umv.channel_id AND umv.user_id = ?
            WHERE
                messages.id > IFNULL(umv.last_seen_message_id, 0)
            GROUP BY
                channels.id;
            """
        results = query_db(unread_messages, [user_id], one=False)
        if not results:
            return jsonify({"unreadCounts": {}, "last_msg_id": None}), 200

        unread_counts = {
            row["channel_id"]: {"unread_count": row["unread_count"]} for row in results
        }

        last_msg_id = max(
            row["last_msg_id"] for row in results if row["last_msg_id"] is not None
        )

        response = {"unreadCounts": unread_counts, "last_msg_id": last_msg_id}

        return jsonify(response), 200
    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 500
