import os
import sqlite3
from datetime import datetime
from flask import current_app, g


class DatabaseManager:
    def __init__(self, app=None):
        self.app = app
        if app is not None:
            self.init_app(app)

    def init_app(self, app):
        app.teardown_appcontext(self.teardown)
        # Ensure the DATABASE and MIGRATION_DIR are properly configured
        app.config.setdefault("DATABASE", "db/belay.sqlite3")
        app.config.setdefault("MIGRATION_DIR", "db/migrations/")

    def get_db(self):
        if "db" not in g:
            db_path = os.path.join(current_app.config["DATABASE"])
            print("db_path", db_path)
            g.db = sqlite3.connect(
                db_path, detect_types=sqlite3.PARSE_DECLTYPES)
            g.db.row_factory = sqlite3.Row
        return g.db

    def teardown(self, exception=None):
        db = g.pop("db", None)
        if db is not None:
            db.close()

    def init_db(self):
        db = self.get_db()
        print("db in init", db)
        try:
            with current_app.open_resource("db/schema.sql", mode="r") as f:
                db.cursor().executescript(f.read())
            db.commit()
            print("Db successfully created!")
        except sqlite3.Error as e:
            current_app.logger.error(f"An error occurred: {e}")

    def run_migrations(self):
        db = self.get_db()
        migration_path = os.path.join(current_app.config["MIGRATION_DIR"])
        migration_files = sorted(os.listdir(migration_path))
        print("running migrations...")

        for filename in migration_files:
            if filename.endswith(".sql"):
                filepath = os.path.join(migration_path, filename)
                with open(filepath, "r") as f:
                    sql = f.read()
                    try:
                        db.cursor().executescript(sql)
                        print(f"Migration {filename} completed successfully.")
                        self.save_migration(sql)
                    except Exception as e:
                        print(f"Failed to execute {filename}: {e}")
                        break
        db.commit()

    def save_migration(self, sql):
        timestamp = datetime.now().strftime("%Y%m%dT%H%M%S")
        migration_filename = f"{timestamp}.sql"
        migration_path = os.path.join(
            current_app.config["MIGRATION_DIR"], migration_filename
        )

        with open(migration_path, "w") as f:
            f.write(sql)

        print(f"Migration saved as {migration_filename}")

    def add_modified_tables_and_columns(self, migration_sql):
        db = self.get_db()
        temp_table_prefix = "temp_"

        try:
            # Begin a transaction
            db.execute("BEGIN")

            # Parse the migration SQL to find table modifications
            lines = migration_sql.split(";")
            for line in lines:
                line = line.strip()
                if line.startswith("ALTER TABLE"):
                    table_name = line.split()[2]
                    # Create a temporary table with the new schema
                    create_temp_table_sql = self.create_temp_table_sql(
                        table_name)
                    db.execute(create_temp_table_sql)

                    # Copy the data from the original table to the temporary table
                    copy_data_sql = self.copy_data_sql(table_name)
                    db.execute(copy_data_sql)

                    # Drop the original table
                    db.execute(f"DROP TABLE {table_name}")

                    # Rename the temporary table to the original table name
                    # fmt: off
                    db.execute(f"ALTER TABLE {temp_table_prefix}{table_name} RENAME TO {table_name}"
                    )
                    # fmt: on

            # Commit the transaction
            db.commit()
            print("Tables and columns modified successfully.")
        except sqlite3.Error as e:
            db.rollback()
            print(f"An error occurred while modifying tables and columns: {e}")

    def create_temp_table_sql(self, table_name):
        # Get the schema of the existing table
        db = self.get_db()
        cursor = db.execute(f"PRAGMA table_info({table_name})")
        columns = cursor.fetchall()

        # Construct the CREATE TABLE SQL for the temporary table
        # fmt: off
        temp_table_name = f"temp_{table_name}"
        create_sql = f"CREATE TABLE {temp_table_name} ("
        create_sql += ", ".join([f"{col['name']} {col['type']}"for col in columns])
        # fmt: on
        create_sql += ")"
        return create_sql

    def copy_data_sql(self, table_name):
        # Get the column names of the existing table
        db = self.get_db()
        cursor = db.execute(f"PRAGMA table_info({table_name})")
        columns = cursor.fetchall()
        column_names = ", ".join([col["name"] for col in columns])

        # Construct the INSERT INTO SQL for copying data
        temp_table_name = f"temp_{table_name}"
        # fmt: off
        insert_sql = f"INSERT INTO {temp_table_name} ({column_names}) SELECT {column_names} FROM {table_name}"
        return insert_sql

    # fmt: on


# class DatabaseManager:
#     def __init__(self, app=None):
#         self.app = app
#         if app is not None:
#             self.init_app(app)
#
#     def init_app(self, app):
#         app.teardown_appcontext(self.teardown)
#         # Ensure the DATABASE and MIGRATION_DIR are properly configured
#         app.config.setdefault("DATABASE", "db/belay.sqlite3")
#         app.config.setdefault("MIGRATION_DIR", "db/migrations/")
#
#     def get_db(self):
#         if "db" not in g:
#             db_path = os.path.join(current_app.config["DATABASE"])
#             print("db_path", db_path)
#             g.db = sqlite3.connect(
#                 db_path, detect_types=sqlite3.PARSE_DECLTYPES)
#             g.db.row_factory = sqlite3.Row
#         return g.db
#
#     def teardown(self, exception=None):
#         db = g.pop("db", None)
#         if db is not None:
#             db.close()
#
#     def init_db(self):
#         db = self.get_db()
#         print("db in init", db)
#         try:
#             with current_app.open_resource("db/schema.sql", mode="r") as f:
#                 db.cursor().executescript(f.read())
#             db.commit()
#             print("Db successfully ceated!")
#         except sqlite3.Error as e:
#             current_app.logger.error(f"An error occurred: {e}")
#
#     def run_migrations(self):
#         db = self.get_db()
#         migration_path = os.path.join(current_app.config["MIGRATION_DIR"])
#         migration_files = sorted(os.listdir(migration_path))
#         print("running migrations...")
#
#         for filename in migration_files:
#             if filename.endswith(".sql"):
#                 filepath = os.path.join(migration_path, filename)
#                 with open(filepath, "r") as f:
#                     sql = f.read()
#                     try:
#                         db.cursor().executescript(sql)
#                         print(f"Migration {filename} completed successfully.")
#                         self.save_migration(sql)
#                     except Exception as e:
#                         print(f"Failed to execute {filename}: {e}")
#                         break
#         db.commit()
#
#     def save_migration(self, sql):
#         timestamp = datetime.now().strftime("%Y%m%dT%H%M%S")
#         migration_filename = f"{timestamp}.sql"
#         migration_path = os.path.join(
#             current_app.config["MIGRATION_DIR"], migration_filename
#         )
#
#         with open(migration_path, "w") as f:
#             f.write(sql)
#
#         print(f"Migration saved as {migration_filename}")
