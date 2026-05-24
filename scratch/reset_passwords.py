from werkzeug.security import generate_password_hash
import mysql.connector
import sys
sys.path.append('c:\\laragon\\www\\smart_recipe')
from config import DB_CONFIG

# Generate password hash for "password123"
new_password = "password123"
hashed_password = generate_password_hash(new_password)

try:
    conn = mysql.connector.connect(**DB_CONFIG)
    cursor = conn.cursor()
    
    # Update both accounts
    cursor.execute(
        "UPDATE users SET password_hash = %s WHERE email IN ('chef@test.com', 'user1@test.com')",
        (hashed_password,)
    )
    conn.commit()
    print("SUCCESS: Default passwords successfully updated!")
    print(f"Both accounts now have the password: '{new_password}'")
    
    cursor.close()
    conn.close()
except Exception as e:
    print("Error updating database passwords:", e)
