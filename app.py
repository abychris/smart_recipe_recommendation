"""
Smart Recipe Recommendation Website
Flask application with search logic and frontend rendering.
"""

from flask import Flask, jsonify, request, render_template, redirect, url_for, flash
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from werkzeug.security import generate_password_hash, check_password_hash
import mysql.connector
from config import DB_CONFIG, SECRET_KEY, DEBUG

app = Flask(__name__)
app.secret_key = SECRET_KEY

# Setup Flask-Login
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'
login_manager.login_message_category = 'error'

class User(UserMixin):
    def __init__(self, id, username, email, is_admin=False):
        self.id = id
        self.username = username
        self.email = email
        self.is_admin = bool(is_admin)

def get_db_connection():
    """Create and return a new MySQL database connection."""
    return mysql.connector.connect(**DB_CONFIG)

@login_manager.user_loader
def load_user(user_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute('SELECT * FROM users WHERE id = %s', (user_id,))
        user = cursor.fetchone()
        cursor.close()
        conn.close()
        if user:
            return User(id=user['id'], username=user['username'], email=user['email'], is_admin=user.get('is_admin', False))
    except:
        pass
    return None


# ============================================
# Page Routes
# ============================================

@app.route('/')
def home():
    """Render the main search page."""
    return render_template('index.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('home'))
    
    if request.method == 'POST':
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')
        
        if not username or not email or not password:
            flash('Please fill out all fields.', 'error')
            return redirect(url_for('register'))
            
        hashed_pw = generate_password_hash(password)
        
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute('INSERT INTO users (username, email, password_hash) VALUES (%s, %s, %s)', (username, email, hashed_pw))
            conn.commit()
            cursor.close()
            conn.close()
            flash('Account created successfully! Please log in.', 'success')
            return redirect(url_for('login'))
        except mysql.connector.IntegrityError:
            flash('Username or Email already exists.', 'error')
            return redirect(url_for('register'))
        except Exception as e:
            flash(f'An error occurred: {str(e)}', 'error')
            return redirect(url_for('register'))

    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('home'))
        
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute('SELECT * FROM users WHERE email = %s', (email,))
        user_record = cursor.fetchone()
        cursor.close()
        conn.close()
        
        if user_record and check_password_hash(user_record['password_hash'], password):
            user_obj = User(id=user_record['id'], username=user_record['username'], email=user_record['email'], is_admin=user_record.get('is_admin', False))
            login_user(user_obj)
            return redirect(url_for('home'))
        else:
            flash('Invalid email or password.', 'error')
            
    return render_template('login.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('home'))


# ============================================
# API Routes
# ============================================

@app.route('/api/recipes')
def get_all_recipes():
    """Fetch all recipes from the database."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute('SELECT id, name, description, prep_time_minutes, servings FROM recipes')
        recipes = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify({'status': 'success', 'count': len(recipes), 'recipes': recipes})
    except mysql.connector.Error as err:
        return jsonify({'status': 'error', 'message': str(err)}), 500


@app.route('/api/recipes/<int:recipe_id>')
def get_recipe(recipe_id):
    """Fetch a single recipe with all its ingredients."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            'SELECT id, name, description, instructions, prep_time_minutes, servings FROM recipes WHERE id = %s',
            (recipe_id,)
        )
        recipe = cursor.fetchone()
        if not recipe:
            cursor.close()
            conn.close()
            return jsonify({'status': 'error', 'message': 'Recipe not found'}), 404

        cursor.execute('''
            SELECT i.name, ri.quantity
            FROM recipe_ingredients ri
            JOIN ingredients i ON ri.ingredient_id = i.id
            WHERE ri.recipe_id = %s
        ''', (recipe_id,))
        recipe['ingredients'] = cursor.fetchall()

        cursor.close()
        conn.close()
        return jsonify({'status': 'success', 'recipe': recipe})
    except mysql.connector.Error as err:
        return jsonify({'status': 'error', 'message': str(err)}), 500


@app.route('/api/ingredients')
def get_all_ingredients():
    """Return the most popular ingredients for suggestion pills."""
    try:
        limit = request.args.get('limit', 10, type=int)
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute('''
            SELECT i.id, i.name, COUNT(ri.recipe_id) AS recipe_count
            FROM ingredients i
            JOIN recipe_ingredients ri ON i.id = ri.ingredient_id
            GROUP BY i.id
            ORDER BY recipe_count DESC
            LIMIT %s
        ''', (limit,))
        ingredients = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify({'status': 'success', 'ingredients': ingredients})
    except mysql.connector.Error as err:
        return jsonify({'status': 'error', 'message': str(err)}), 500


@app.route('/api/search', methods=['POST'])
def search_recipes():
    """
    Smart search: find recipes matching the given ingredients.
    - Requires at least 2 matching ingredients (or 50%+ for small recipes)
    - Ranks by match percentage (best matches first)
    - Returns top 12 results maximum
    """
    data = request.get_json()
    ingredients_list = data.get('ingredients', [])

    # Clean inputs
    ingredients_list = [i.strip().lower() for i in ingredients_list if i.strip()]
    if not ingredients_list:
        return jsonify({'status': 'error', 'message': 'Please provide at least one ingredient'}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        placeholders = ', '.join(['%s'] * len(ingredients_list))

        # Find recipes ranked by match percentage, with a minimum threshold
        query = f'''
            SELECT r.id, r.name, r.description, r.instructions,
                   r.prep_time_minutes, r.servings, r.image_url,
                   COUNT(DISTINCT i.id) AS matched_count,
                   total.total_ingredients,
                   ROUND(COUNT(DISTINCT i.id) * 100.0 / total.total_ingredients) AS match_percentage
            FROM recipes r
            JOIN recipe_ingredients ri ON r.id = ri.recipe_id
            JOIN ingredients i ON ri.ingredient_id = i.id
            JOIN (
                SELECT recipe_id, COUNT(*) AS total_ingredients
                FROM recipe_ingredients
                GROUP BY recipe_id
            ) total ON total.recipe_id = r.id
            WHERE LOWER(i.name) IN ({placeholders})
            GROUP BY r.id
            HAVING matched_count >= LEAST(2, total.total_ingredients)
            ORDER BY match_percentage DESC, matched_count DESC
            LIMIT 12
        '''
        cursor.execute(query, ingredients_list)
        recipes = cursor.fetchall()

        # Enrich each recipe with ingredient details
        for recipe in recipes:
            cursor.execute('''
                SELECT i.name, ri.quantity
                FROM recipe_ingredients ri
                JOIN ingredients i ON ri.ingredient_id = i.id
                WHERE ri.recipe_id = %s
            ''', (recipe['id'],))
            all_ings = cursor.fetchall()

            recipe['matched_ingredients'] = [
                ing for ing in all_ings if ing['name'].lower() in ingredients_list
            ]
            recipe['missing_ingredients'] = [
                ing for ing in all_ings if ing['name'].lower() not in ingredients_list
            ]
            
            # Check if saved
            recipe['is_saved'] = False
            if current_user.is_authenticated:
                cursor.execute('SELECT 1 FROM saved_recipes WHERE user_id = %s AND recipe_id = %s', (current_user.id, recipe['id']))
                if cursor.fetchone():
                    recipe['is_saved'] = True

        cursor.close()
        conn.close()

        return jsonify({
            'status': 'success',
            'count': len(recipes),
            'search_terms': ingredients_list,
            'recipes': recipes
        })

    except mysql.connector.Error as err:
        return jsonify({'status': 'error', 'message': str(err)}), 500


@app.route('/api/recipes/<int:recipe_id>/toggle-save', methods=['POST'])
@login_required
def toggle_save_recipe(recipe_id):
    """Toggle a recipe saved status for the logged-in user."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if already saved
        cursor.execute('SELECT 1 FROM saved_recipes WHERE user_id = %s AND recipe_id = %s', (current_user.id, recipe_id))
        is_saved = cursor.fetchone()
        
        if is_saved:
            cursor.execute('DELETE FROM saved_recipes WHERE user_id = %s AND recipe_id = %s', (current_user.id, recipe_id))
            status = 'removed'
        else:
            cursor.execute('INSERT INTO saved_recipes (user_id, recipe_id) VALUES (%s, %s)', (current_user.id, recipe_id))
            status = 'saved'
            
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'status': 'success', 'action': status})
    except mysql.connector.Error as err:
        return jsonify({'status': 'error', 'message': str(err)}), 500

@app.route('/saved')
@login_required
def saved_recipes_page():
    """Render the user's saved recipes page."""
    return render_template('saved.html')

@app.route('/api/saved-recipes')
@login_required
def get_saved_recipes():
    """Fetch all recipes saved by the current user."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        query = '''
            SELECT r.id, r.name, r.description, r.instructions,
                   r.prep_time_minutes, r.servings, r.image_url,
                   100 AS match_percentage
            FROM recipes r
            JOIN saved_recipes sr ON r.id = sr.recipe_id
            WHERE sr.user_id = %s
            ORDER BY sr.saved_at DESC
        '''
        cursor.execute(query, (current_user.id,))
        recipes = cursor.fetchall()
        
        # Enrich with ingredients so the cards render properly
        for recipe in recipes:
            cursor.execute('''
                SELECT i.name, ri.quantity
                FROM recipe_ingredients ri
                JOIN ingredients i ON ri.ingredient_id = i.id
                WHERE ri.recipe_id = %s
            ''', (recipe['id'],))
            all_ings = cursor.fetchall()
            recipe['matched_ingredients'] = all_ings # Show all as matched
            recipe['missing_ingredients'] = []
            recipe['total_ingredients'] = len(all_ings)
            recipe['matched_count'] = len(all_ings)
            recipe['is_saved'] = True

        cursor.close()
        conn.close()
        return jsonify({'status': 'success', 'count': len(recipes), 'recipes': recipes})
    except mysql.connector.Error as err:
        return jsonify({'status': 'error', 'message': str(err)}), 500

# ============================================
# Pantry Routes
# ============================================

@app.route('/pantry')
@login_required
def pantry_page():
    """Render the user's pantry page."""
    return render_template('pantry.html')

@app.route('/api/pantry', methods=['GET'])
@login_required
def get_pantry():
    """Get all ingredients in user's pantry."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute('''
            SELECT i.id, i.name 
            FROM ingredients i
            JOIN user_pantry up ON i.id = up.ingredient_id
            WHERE up.user_id = %s
            ORDER BY i.name
        ''', (current_user.id,))
        pantry = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify({'status': 'success', 'pantry': pantry})
    except mysql.connector.Error as err:
        return jsonify({'status': 'error', 'message': str(err)}), 500

@app.route('/api/pantry', methods=['POST'])
@login_required
def add_to_pantry():
    """Add an ingredient to user's pantry by name."""
    data = request.get_json()
    ing_name = data.get('ingredient', '').strip().lower()
    if not ing_name:
        return jsonify({'status': 'error', 'message': 'Ingredient name required'}), 400
        
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Get ingredient ID
        cursor.execute('SELECT id FROM ingredients WHERE name = %s', (ing_name,))
        ing = cursor.fetchone()
        
        if not ing:
            cursor.close()
            conn.close()
            return jsonify({'status': 'error', 'message': 'Ingredient not found in database'}), 404
            
        # Add to pantry if not exists
        cursor.execute('INSERT IGNORE INTO user_pantry (user_id, ingredient_id) VALUES (%s, %s)', (current_user.id, ing['id']))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'status': 'success', 'message': 'Added to pantry'})
    except mysql.connector.Error as err:
        return jsonify({'status': 'error', 'message': str(err)}), 500

@app.route('/api/pantry/<ingredient_name>', methods=['DELETE'])
@login_required
def remove_from_pantry(ingredient_name):
    """Remove an ingredient from user's pantry."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute('SELECT id FROM ingredients WHERE name = %s', (ingredient_name.strip().lower(),))
        ing = cursor.fetchone()
        
        if ing:
            cursor.execute('DELETE FROM user_pantry WHERE user_id = %s AND ingredient_id = %s', (current_user.id, ing['id']))
            conn.commit()
            
        cursor.close()
        conn.close()
        return jsonify({'status': 'success', 'message': 'Removed from pantry'})
    except mysql.connector.Error as err:
        return jsonify({'status': 'error', 'message': str(err)}), 500

# ============================================
# Admin Routes
# ============================================
from functools import wraps
from flask import abort

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated or not current_user.is_admin:
            abort(403)
        return f(*args, **kwargs)
    return decorated_function

@app.route('/admin')
@admin_required
def admin_dashboard():
    """Admin dashboard to manage recipes and users."""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    # Get all recipes with save counts and ingredient counts
    cursor.execute('''
        SELECT r.id, r.name, r.description, r.prep_time_minutes, r.servings, r.image_url,
               COUNT(DISTINCT sr.user_id) as saves,
               COUNT(DISTINCT ri.ingredient_id) as ingredient_count
        FROM recipes r
        LEFT JOIN saved_recipes sr ON r.id = sr.recipe_id
        LEFT JOIN recipe_ingredients ri ON r.id = ri.recipe_id
        GROUP BY r.id
        ORDER BY r.id DESC
    ''')
    recipes = cursor.fetchall()
    
    # Get all users with their activity stats
    cursor.execute('''
        SELECT u.id, u.username, u.email, u.is_admin, u.created_at,
               COUNT(DISTINCT sr.recipe_id) as saved_count,
               COUNT(DISTINCT up.ingredient_id) as pantry_count
        FROM users u
        LEFT JOIN saved_recipes sr ON u.id = sr.user_id
        LEFT JOIN user_pantry up ON u.id = up.user_id
        GROUP BY u.id
        ORDER BY u.created_at DESC
    ''')
    users = cursor.fetchall()
    
    total_users = len(users)
    
    cursor.close()
    conn.close()
    return render_template('admin.html', recipes=recipes, users=users, total_users=total_users)

@app.route('/admin/recipe/<int:recipe_id>')
@admin_required
def admin_view_recipe(recipe_id):
    """Fetch full recipe detail for admin modal view."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute('SELECT * FROM recipes WHERE id = %s', (recipe_id,))
        recipe = cursor.fetchone()
        if not recipe:
            return jsonify({'status': 'error', 'message': 'Not found'}), 404
        
        cursor.execute('''
            SELECT i.name, ri.quantity
            FROM recipe_ingredients ri
            JOIN ingredients i ON ri.ingredient_id = i.id
            WHERE ri.recipe_id = %s
        ''', (recipe_id,))
        recipe['ingredients'] = cursor.fetchall()
        
        # Count saves
        cursor.execute('SELECT COUNT(*) as c FROM saved_recipes WHERE recipe_id = %s', (recipe_id,))
        recipe['save_count'] = cursor.fetchone()['c']
        
        cursor.close()
        conn.close()
        return jsonify({'status': 'success', 'recipe': recipe})
    except mysql.connector.Error as err:
        return jsonify({'status': 'error', 'message': str(err)}), 500

@app.route('/admin/recipe/<int:recipe_id>/delete', methods=['POST'])
@admin_required
def delete_recipe(recipe_id):
    """Delete a recipe (Admin only)"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('DELETE FROM recipes WHERE id = %s', (recipe_id,))
        conn.commit()
        cursor.close()
        conn.close()
        flash('Recipe deleted successfully.', 'success')
    except Exception as e:
        flash(f'Error deleting recipe: {str(e)}', 'error')
    
    return redirect(url_for('admin_dashboard'))

# ============================================
# Submit Recipe Route
# ============================================

@app.route('/submit', methods=['GET', 'POST'])
@login_required
def submit_recipe():
    """Form to submit a new recipe."""
    if request.method == 'POST':
        name = request.form.get('name')
        description = request.form.get('description')
        instructions = request.form.get('instructions')
        prep_time = request.form.get('prep_time', 0, type=int)
        servings = request.form.get('servings', 1, type=int)
        image_url = request.form.get('image_url') or None
        
        # Ingredients come from dynamic form arrays
        ing_names = request.form.getlist('ingredient_name[]')
        ing_quantities = request.form.getlist('ingredient_quantity[]')
        
        if not name or not instructions or not ing_names:
            flash('Name, instructions, and at least one ingredient are required.', 'error')
            return redirect(url_for('submit_recipe'))
            
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            
            # Insert Recipe
            cursor.execute('''
                INSERT INTO recipes (name, description, instructions, prep_time_minutes, servings, image_url)
                VALUES (%s, %s, %s, %s, %s, %s)
            ''', (name, description, instructions, prep_time, servings, image_url))
            recipe_id = cursor.lastrowid
            
            # Process Ingredients
            for idx, ing_name in enumerate(ing_names):
                clean_name = ing_name.strip().lower()
                if not clean_name:
                    continue
                    
                quantity = ing_quantities[idx].strip() if idx < len(ing_quantities) else ''
                
                # Check if ingredient exists, else create
                cursor.execute('SELECT id FROM ingredients WHERE name = %s', (clean_name,))
                ing_record = cursor.fetchone()
                
                if ing_record:
                    ing_id = ing_record[0]
                else:
                    cursor.execute('INSERT INTO ingredients (name) VALUES (%s)', (clean_name,))
                    ing_id = cursor.lastrowid
                    
                # Link Recipe and Ingredient
                cursor.execute('''
                    INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
                    VALUES (%s, %s, %s)
                ''', (recipe_id, ing_id, quantity))
                
            conn.commit()
            cursor.close()
            conn.close()
            
            flash('Recipe submitted successfully! It is now searchable.', 'success')
            return redirect(url_for('submit_recipe'))
            
        except Exception as e:
            flash(f'An error occurred: {str(e)}', 'error')
            return redirect(url_for('submit_recipe'))
            
    return render_template('submit.html')

# ============================================
# Wellness / Health Section
# ============================================

@app.route('/wellness')
def wellness_page():
    """Render the Health & Wellness section with gym plans, diet plans, and health condition guidance."""
    return render_template('wellness.html')


# ============================================
# Run the app
# ============================================
if __name__ == '__main__':
    print('=' * 50)
    print(' Smart Recipe Recommendation Website')
    print(' Server starting on http://127.0.0.1:5000')
    print('=' * 50)
    app.run(debug=DEBUG, port=5000)
