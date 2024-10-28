import os
import datetime
import re


def read_schema(file_path):
    with open(file_path, "r") as file:
        return file.read()


def extract_table_name(sql_statement):
    match = re.search(r"CREATE TABLE IF NOT EXISTS (\w+)",
                      sql_statement, re.IGNORECASE)
    if match:
        return match.group(1)
    return None


def write_migration_file(migration_dir, table_name, migration_sql):
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d_%H%M%S")
    filename = f"{timestamp}_{table_name}.sql"
    filepath = os.path.join(migration_dir, filename)

    with open(filepath, "w") as file:
        file.write(migration_sql)

    print(f"Created migration file: {filename}")


def generate_migrations(schema_file, migration_dir):
    schema_sql = read_schema(schema_file)
    statements = schema_sql.strip().split(";")

    if not os.path.exists(migration_dir):
        os.makedirs(migration_dir)

    for statement in statements:
        statement = statement.strip()
        if statement:
            table_name = extract_table_name(statement)
            if table_name:
                write_migration_file(
                    migration_dir, table_name, statement + ";")
            else:
                print("Could not extract table name from statement:")
                print(statement)


# Configuration
schema_file = "schema.sql"
migration_dir = "migrations"

generate_migrations(schema_file, migration_dir)
