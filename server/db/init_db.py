import sqlite3

connection = sqlite3.connect("belay.sqlite3")
with open("schema.sql") as f:
    connection.executescript(f.read())


connection.commit()
connection.close()
