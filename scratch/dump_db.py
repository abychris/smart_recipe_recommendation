import mysql.connector
import os

DB_CONFIG = {'host': 'localhost', 'user': 'root', 'password': '', 'database': 'smart_recipe_db', 'charset': 'utf8mb4'}

def dump_db():
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor(dictionary=True)
        
        with open('database/full_dump.sql', 'w', encoding='utf-8') as f:
            f.write("CREATE DATABASE IF NOT EXISTS smart_recipe_db;\n")
            f.write("USE smart_recipe_db;\n\n")
            
            tables = ['users', 'recipes', 'ingredients', 'recipe_ingredients', 'saved_recipes', 'user_pantry']
            
            for table in tables:
                # Get create table statement
                cursor.execute(f"SHOW CREATE TABLE {table}")
                create_stmt = cursor.fetchone()['Create Table']
                f.write(f"DROP TABLE IF EXISTS {table};\n")
                f.write(f"{create_stmt};\n\n")
                
                # Get data
                cursor.execute(f"SELECT * FROM {table}")
                rows = cursor.fetchall()
                if rows:
                    cols = rows[0].keys()
                    f.write(f"INSERT INTO {table} ({', '.join(cols)}) VALUES\n")
                    values_list = []
                    for row in rows:
                        vals = []
                        for col in cols:
                            val = row[col]
                            if val is None:
                                vals.append("NULL")
                            elif isinstance(val, (int, float)):
                                vals.append(str(val))
                            else:
                                escaped_val = str(val).replace("'", "''").replace("\\", "\\\\")
                                vals.append(f"'{escaped_val}'")
                        values_list.append(f"({', '.join(vals)})")
                    f.write(",\n".join(values_list) + ";\n\n")
            
        print("Successfully created database/full_dump.sql")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()

if __name__ == "__main__":
    dump_db()
