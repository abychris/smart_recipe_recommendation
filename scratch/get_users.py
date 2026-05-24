import mysql.connector
import sys
sys.path.append('c:\\laragon\\www\\smart_recipe')
from config import DB_CONFIG

try:
    conn = mysql.connector.connect(**DB_CONFIG)
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT id, username, email, is_admin FROM users")
    users = cursor.fetchall()
    print("USERS FOUND IN DATABASE:")
    for user in users:
        print(f"ID: {user['id']} | Username: {user['username']} | Email: {user['email']} | Admin: {user['is_admin']}")
    cursor.close()
    conn.close()
except Exception as e:
    print("Error:", e)
