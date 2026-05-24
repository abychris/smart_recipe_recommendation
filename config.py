"""
Database and app configuration for Smart Recipe Recommendation Website.
"""

# MySQL Database Configuration
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '',          # Laragon default: no password for root
    'database': 'smart_recipe_db',
    'charset': 'utf8mb4'
}

# Flask Configuration
SECRET_KEY = 'smart-recipe-secret-key-2026'
DEBUG = True
