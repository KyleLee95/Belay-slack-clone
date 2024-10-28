import json
from datetime import datetime
from flask import Blueprint, request, session

from utils.helpers import has_api_key, query_db, write_to_db

messages = Blueprint("messages", __name__)


@messages.route("/", methods=["GET", "POST"])
@has_api_key
def get_messages():
    try:
        query_string = """
        SELECT * FROM messages;
        """
        messages = query_db(query_string)

        return {"messages": [dict(message) for message in messages]}, 200
    except Exception as e:
        print(e)
        return {"error": str(e)}, 500


@messages.route("/<int:message_id>/replies", methods=["GET", "POST"])
@has_api_key
def get_replies(message_id):
    try:
        query_string = """
    SELECT
        messages.id,
        messages.channel_id,
        messages.user_id,
        messages.text,
        messages.replies_to,
        messages.timestamp,
        users.username AS user_name
    FROM
        messages
    INNER JOIN
        users ON messages.user_id = users.id
    WHERE
        messages.replies_to = ?;
    """
        messages = query_db(query_string, [message_id])
        if not messages:
            return {"messages": []}, 200

        rows = [dict(message) for message in messages]
        return {"messages": rows}, 200
    except Exception as e:
        print(e)
        return {"error": str(e)}, 500


@messages.route("/last-seen/<int:message_id>/", methods=["GET", "POST"])
@has_api_key
def update_user_message_view(user_id, channel_id, last_seen_message_id):
    try:
        last_seen_timestamp = datetime.now().isoformat()

        query = """
        INSERT INTO user_message_views (user_id, channel_id, last_seen_message_id, last_seen_timestamp)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(user_id, channel_id) DO UPDATE SET
            last_seen_message_id = excluded.last_seen_message_id,
            last_seen_timestamp = excluded.last_seen_timestamp;
        """
        last_seen_message = query_db(
            query,
            [user_id, channel_id, last_seen_message_id, last_seen_timestamp],
            one=True,
        )
        return last_seen_message, 200
    except Exception as e:
        print(e)
        return {"error": str(e)}, 500


@messages.route("/<int:message_id>/", methods=["GET", "POST"])
def get_message_with_replies_by_id(message_id):
    try:
        # Fetch the main message
        query_string_main = """
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
                m.id = ?
        """
        main_message = query_db(query_string_main, [message_id], one=True)
        if not main_message:
            return {"message": {}}, 200

        # Fetch all replies to the main message
        query_string_replies = """
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
                m.replies_to = ?
            ORDER BY
                m.timestamp ASC;
        """
        replies = query_db(query_string_replies, [message_id]) or []
        print("replies", replies)

        # Fetch reactions for the main message
        query_string_reactions = """
            SELECT
                r.message_id,
                r.emoji,
                COUNT(r.emoji) AS count,
                GROUP_CONCAT(u.username) AS users
            FROM
                reactions r
            INNER JOIN
                users u ON r.user_id = u.id
            WHERE
                r.message_id = ?
            GROUP BY
                r.message_id, r.emoji
        """
        main_message_reactions = query_db(
            query_string_reactions, [message_id]) or []

        # Fetch reactions for all replies
        reply_ids = [reply["id"] for reply in replies] if replies else []
        reply_reactions = []
        if reply_ids:
            placeholders = ",".join("?" * len(reply_ids))
            query_string_reply_reactions = f"""
                SELECT
                    r.message_id,
                    r.emoji,
                    COUNT(r.emoji) AS count,
                    GROUP_CONCAT(u.username) AS users
                FROM
                    reactions r
                INNER JOIN
                    users u ON r.user_id = u.id
                WHERE
                    r.message_id IN ({placeholders})
                GROUP BY
                    r.message_id, r.emoji
            """
            reply_reactions = query_db(
                query_string_reply_reactions, reply_ids) or []

        # Combine reactions with messages and replies
        main_message_dict = dict(main_message)
        main_message_dict["replies"] = []
        main_message_dict["reactions"] = [
            {
                "emoji": reaction["emoji"],
                "count": reaction["count"],
                "users": reaction["users"].split(",") if reaction["users"] else [],
            }
            for reaction in main_message_reactions
        ]

        reply_dict = {reply["id"]: dict(reply) for reply in replies}
        print("reply_dict", reply_dict)
        for reply in reply_dict.values():
            reply["reactions"] = []
            print("reply", reply)
        if reply_reactions:
            for reaction in reply_reactions:
                reply_id = reaction["message_id"]
                if reply_id in reply_dict:
                    reply_dict[reply_id]["reactions"].append(
                        {
                            "emoji": reaction["emoji"],
                            "count": reaction["count"],
                            "users": (
                                reaction["users"].split(",")
                                if reaction["users"]
                                else []
                            ),
                        }
                    )

        main_message_dict["replies"] = list(reply_dict.values())

        return {"message": main_message_dict}, 200
    except Exception as e:
        print(e)
        return {"error": str(e)}, 500


@messages.route("/<int:message_id>/reaction", methods=["POST"])
@has_api_key
def add_reaction(message_id):
    try:
        user_id = session["user_id"]
        reaction = request.json["reaction"]
        query_string = """
        INSERT INTO reactions (message_id, user_id, emoji)
        VALUES (?, ?, ?)
        ON CONFLICT(message_id, user_id) DO UPDATE SET
            emoji = excluded.emoji;
        """
        write_to_db(query_string, [message_id, user_id, reaction])

        # Fetch the message and its reactions
        fetch_message_query = """
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
            m.id = ?
        """
        message_row = query_db(fetch_message_query, [message_id], one=True)

        if not message_row:
            return {"error": "Message not found"}, 404

        fetch_reactions_query = """
        SELECT
            r.emoji,
            COUNT(r.emoji) AS count,
            GROUP_CONCAT(u.username) AS users
        FROM
            reactions r
        INNER JOIN
            users u ON r.user_id = u.id
        WHERE
            r.message_id = ?
        GROUP BY
            r.emoji
        """
        reactions = query_db(fetch_reactions_query, [message_id]) or []

        # Fetch the replies
        fetch_replies_query = """
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
            m.replies_to = ?
        ORDER BY
            m.timestamp ASC
        """
        replies = query_db(fetch_replies_query, [message_id]) or []

        message = {
            "id": message_row["id"],
            "user_name": message_row["user_name"],
            "text": message_row["text"],
            "timestamp": message_row["timestamp"],
            "replies": [
                {
                    "id": reply["id"],
                    "user_name": reply["user_name"],
                    "text": reply["text"],
                    "timestamp": reply["timestamp"],
                    "reactions": [],
                }
                for reply in replies
            ],
            "reactions": [
                {
                    "emoji": reaction["emoji"],
                    "count": reaction["count"],
                    "users": reaction["users"].split(",") if reaction["users"] else [],
                }
                for reaction in reactions
            ],
        }

        # Fetch reactions for replies
        for reply in message["replies"]:
            reply_reactions_query = """
            SELECT
                r.emoji,
                COUNT(r.emoji) AS count,
                GROUP_CONCAT(u.username) AS users
            FROM
                reactions r
            INNER JOIN
                users u ON r.user_id = u.id
            WHERE
                r.message_id = ?
            GROUP BY
                r.emoji
            """
            reply_reactions = query_db(
                reply_reactions_query, [reply["id"]]) or []
            reply["reactions"] = [
                {
                    "emoji": reaction["emoji"],
                    "count": reaction["count"],
                    "users": reaction["users"].split(",") if reaction["users"] else [],
                }
                for reaction in reply_reactions
            ]

        return {"message": message}, 200

    except Exception as e:
        print(e)
        return {"error": str(e)}, 500
