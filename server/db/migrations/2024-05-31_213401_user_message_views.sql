-- Create user_message_views table to capture the many-to-many relationship
-- between users and messages they have seen
CREATE TABLE IF NOT EXISTS user_message_views (
    user_id INTEGER NOT NULL,
    channel_id INTEGER NOT NULL,
    last_seen_message_id INTEGER,
    last_seen_timestamp DATETIME,
    PRIMARY KEY (user_id, channel_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (channel_id) REFERENCES channels(id),
    FOREIGN KEY (last_seen_message_id) REFERENCES messages(id)
);