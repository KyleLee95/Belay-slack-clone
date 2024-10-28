import sqlite3


def seed_db(db_file):
    print("Seeding database...")
    connection = sqlite3.connect(db_file)
    cursor = connection.cursor()

    # Users
    users = [
        ("johndoe", "john.doe@example.com", "hashedpassword1"),
        ("janedoe", "jane.doe@example.com", "hashedpassword2"),
        ("alice", "alice@example.com", "hashedpassword3"),
        ("kyle", "kyle@example.com", "kyle"),
    ]
    cursor.executemany(
        "INSERT INTO users (username, email, password) VALUES (?, ?, ?);", users
    )

    # Channels
    channels = [("General",), ("Random",), ("Technology",)]
    cursor.executemany("INSERT INTO channels (name) VALUES (?);", channels)

    # Messages
    messages = [
        (1, 1, "Hello everyone in General!"),
        (1, 2, "Hi John, nice to meet you here!"),
        (3, 3, "Has anyone checked the latest tech release?"),
    ]
    cursor.executemany(
        "INSERT INTO messages (channel_id, user_id, text) VALUES (?, ?, ?);", messages
    )

    # Reactions
    reactions = [(1, 2, "👍"), (2, 1, "👋"), (3, 1, "🤔")]
    cursor.executemany(
        "INSERT INTO reactions (message_id, user_id, emoji) VALUES (?, ?, ?);",
        reactions,
    )
    print("Database seeded successfully!")
    # Commit changes and close the connection
    connection.commit()
    connection.close()


db_file = "belay.sqlite3"
seed_db(db_file)
