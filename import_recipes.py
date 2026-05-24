"""
Recipe Importer — Fetches recipes from TheMealDB (free API)
and inserts them into the smart_recipe_db MySQL database.

Usage:
    python import_recipes.py

This will:
1. Clear existing data (recipes, ingredients, recipe_ingredients)
2. Fetch all categories from TheMealDB
3. For each category, fetch all meals
4. For each meal, fetch full details (ingredients, instructions)
5. Insert everything into MySQL

API: https://www.themealdb.com/api.php (free, no key needed)
"""

import os
import io

# Force UTF-8 output on Windows to handle international recipe names
if os.name == 'nt':
    import sys
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

import requests
import mysql.connector
import time
import sys

# ============================================
# Database Config (same as config.py)
# ============================================
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '',
    'database': 'smart_recipe_db',
    'charset': 'utf8mb4'
}

BASE_URL = 'https://www.themealdb.com/api/json/v1/1'


def get_db():
    return mysql.connector.connect(**DB_CONFIG)


def fetch_json(url):
    """Fetch JSON from a URL with retry logic."""
    for attempt in range(3):
        try:
            resp = requests.get(url, timeout=15)
            resp.raise_for_status()
            return resp.json()
        except Exception as e:
            if attempt < 2:
                print(f'  Retry {attempt + 1}... ({e})')
                time.sleep(2)
            else:
                print(f'  FAILED: {e}')
                return None


def clear_database(cursor):
    """Remove all existing data so we start fresh."""
    print('Clearing existing data...')
    cursor.execute('SET FOREIGN_KEY_CHECKS = 0')
    cursor.execute('TRUNCATE TABLE recipe_ingredients')
    cursor.execute('TRUNCATE TABLE recipes')
    cursor.execute('TRUNCATE TABLE ingredients')
    cursor.execute('SET FOREIGN_KEY_CHECKS = 1')
    print('  Done.\n')


def get_all_meal_ids():
    """Fetch all meal IDs by iterating through every category."""
    print('Fetching categories...')
    data = fetch_json(f'{BASE_URL}/categories.php')
    if not data or 'categories' not in data:
        print('  ERROR: Could not fetch categories.')
        return []

    categories = [c['strCategory'] for c in data['categories']]
    print(f'  Found {len(categories)} categories: {", ".join(categories)}\n')

    meal_ids = []
    for cat in categories:
        print(f'  Fetching meals in "{cat}"...')
        cat_data = fetch_json(f'{BASE_URL}/filter.php?c={cat}')
        if cat_data and cat_data.get('meals'):
            ids = [m['idMeal'] for m in cat_data['meals']]
            meal_ids.extend(ids)
            print(f'    -> {len(ids)} meals')
        time.sleep(0.3)  # Be polite to the API

    # Remove duplicates
    meal_ids = list(set(meal_ids))
    print(f'\nTotal unique meals to import: {len(meal_ids)}\n')
    return meal_ids


def extract_ingredients(meal):
    """Extract ingredient-quantity pairs from a meal object."""
    ingredients = []
    for i in range(1, 21):
        name = (meal.get(f'strIngredient{i}') or '').strip()
        qty = (meal.get(f'strMeasure{i}') or '').strip()
        if name:  # Skip empty ingredient slots
            ingredients.append((name.lower(), qty))
    return ingredients


def import_recipes():
    """Main import function."""
    print('=' * 55)
    print('  SmartRecipe — Recipe Importer (TheMealDB)')
    print('=' * 55 + '\n')

    # Step 1: Get all meal IDs
    meal_ids = get_all_meal_ids()
    if not meal_ids:
        print('No meals found. Exiting.')
        return

    # Step 2: Connect to DB and clear old data
    conn = get_db()
    cursor = conn.cursor()
    clear_database(cursor)
    conn.commit()

    # Track ingredients we've already inserted (name → id)
    ingredient_cache = {}
    recipes_imported = 0
    recipes_failed = 0

    # Step 3: Fetch each meal's details and insert
    print('Importing recipes...\n')
    total = len(meal_ids)

    for idx, meal_id in enumerate(meal_ids, 1):
        data = fetch_json(f'{BASE_URL}/lookup.php?i={meal_id}')

        if not data or not data.get('meals'):
            recipes_failed += 1
            continue

        meal = data['meals'][0]
        name = meal.get('strMeal', 'Unknown')
        description = meal.get('strCategory', '')
        area = meal.get('strArea', '')
        instructions = meal.get('strInstructions', '')
        image_url = meal.get('strMealThumb', None)

        # Build a nice description
        desc_parts = []
        if area:
            desc_parts.append(f'{area} cuisine')
        if description:
            desc_parts.append(f'{description.lower()} dish')
        full_description = 'A ' + ', '.join(desc_parts) + '.' if desc_parts else ''

        # Insert recipe
        try:
            cursor.execute('''
                INSERT INTO recipes (name, description, instructions, prep_time_minutes, servings, image_url)
                VALUES (%s, %s, %s, %s, %s, %s)
            ''', (
                name,
                full_description,
                instructions,
                30,  # Default prep time (API doesn't provide this)
                4,   # Default servings
                image_url
            ))
            recipe_id = cursor.lastrowid

            # Extract and insert ingredients
            ingredients = extract_ingredients(meal)
            for ing_name, qty in ingredients:
                # Get or create ingredient
                if ing_name not in ingredient_cache:
                    cursor.execute(
                        'INSERT IGNORE INTO ingredients (name) VALUES (%s)', (ing_name,)
                    )
                    if cursor.lastrowid:
                        ingredient_cache[ing_name] = cursor.lastrowid
                    else:
                        cursor.execute('SELECT id FROM ingredients WHERE name = %s', (ing_name,))
                        row = cursor.fetchone()
                        ingredient_cache[ing_name] = row[0]

                # Link recipe to ingredient
                cursor.execute('''
                    INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
                    VALUES (%s, %s, %s)
                ''', (recipe_id, ingredient_cache[ing_name], qty))

            conn.commit()
            recipes_imported += 1

            # Progress indicator
            bar_len = 30
            filled = int(bar_len * idx / total)
            bar = '#' * filled + '-' * (bar_len - filled)
            pct = int(100 * idx / total)
            sys.stdout.write(f'\r  [{bar}] {pct}% - {idx}/{total} ({name[:35]})  ')
            sys.stdout.flush()

        except mysql.connector.Error as err:
            print(f'\n  ERROR inserting "{name}": {err}')
            recipes_failed += 1
            conn.rollback()

        # Small delay to be respectful to the free API
        time.sleep(0.25)

    # Step 4: Summary
    cursor.execute('SELECT COUNT(*) FROM ingredients')
    total_ingredients = cursor.fetchone()[0]

    cursor.close()
    conn.close()

    print('\n\n' + '=' * 55)
    print('  IMPORT COMPLETE!')
    print('=' * 55)
    print(f'  [OK] Recipes imported:    {recipes_imported}')
    print(f'  [!!] Recipes failed:      {recipes_failed}')
    print(f'  [##] Unique ingredients:  {total_ingredients}')
    print(f'  [DB] Total meals in DB:   {recipes_imported}')
    print('=' * 55)
    print('\nYou can now run: python app.py')
    print('And search at: http://127.0.0.1:5000\n')


if __name__ == '__main__':
    import_recipes()
