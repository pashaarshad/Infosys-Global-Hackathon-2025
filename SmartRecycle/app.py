# 🚀 SmartRecycle: Circular Economy Waste Management Platform
# Build a comprehensive web platform for waste sorting guidance and management
# Backend: Python Flask with routes for all navigation pages
# Frontend: HTML, CSS, JavaScript with responsive design
# Features: Waste identification, pickup requests, impact tracking, rewards system

from flask import Flask, render_template, request, jsonify, session, redirect, url_for
import mysql.connector
from mysql.connector import Error
from datetime import datetime
import os
import hashlib

app = Flask(__name__)
app.secret_key = 'smartrecycle_secret_key_2025'

# MySQL Database Configuration
DB_CONFIG = {
    'host': 'localhost',
    'database': 'UserData',
    'user': 'root',  # MySQL username
    'password': 'root',  # MySQL password
    'charset': 'utf8mb4',
    'collation': 'utf8mb4_unicode_ci'
}

def get_db_connection():
    """Get database connection"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        return connection
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        return None

def hash_password(password):
    """Hash password using SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(stored_hash, password):
    """Verify password against stored hash"""
    return stored_hash == hashlib.sha256(password.encode()).hexdigest()

def get_user_by_email(email):
    """Get user by email from database"""
    connection = get_db_connection()
    if not connection:
        return None
    
    try:
        cursor = connection.cursor()
        cursor.execute('SELECT * FROM users WHERE email = %s', (email,))
        user = cursor.fetchone()
        return user
    except Error as e:
        print(f"Error fetching user: {e}")
        return None
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

# Enhanced user authentication with better session handling
@app.route('/auth/register', methods=['POST'])
def auth_register():
    data = request.json
    
    # Validate required fields
    if not all(k in data for k in ('name', 'email', 'password')):
        return jsonify({'success': False, 'message': 'Missing required fields'})
    
    name = data['name'].strip()
    email = data['email'].strip().lower()
    password = data['password']
    
    # Enhanced validation
    if len(name) < 2:
        return jsonify({'success': False, 'message': 'Name must be at least 2 characters'})
    
    if len(password) < 6:
        return jsonify({'success': False, 'message': 'Password must be at least 6 characters'})
    
    # Email validation
    import re
    email_pattern = r'^[^\s@]+@[^\s@]+\.[^\s@]+$'
    if not re.match(email_pattern, email):
        return jsonify({'success': False, 'message': 'Please enter a valid email address'})
    
    # Check if user already exists
    if get_user_by_email(email):
        return jsonify({'success': False, 'message': 'Email already registered'})
    
    # Hash password and create user
    password_hash = hash_password(password)
    
    connection = get_db_connection()
    if not connection:
        return jsonify({'success': False, 'message': 'Database connection error'})
    
    try:
        cursor = connection.cursor()
        cursor.execute('''
            INSERT INTO users (name, email, password, points)
            VALUES (%s, %s, %s, %s)
        ''', (name, email, password_hash, 50))  # Give new users 50 welcome points
        
        user_id = cursor.lastrowid
        connection.commit()
        
        # Log user in with enhanced session data
        session['user_id'] = user_id
        session['user_name'] = name
        session['user_email'] = email
        session['logged_in'] = True
        
        return jsonify({
            'success': True, 
            'message': f'Welcome to SmartRecycle, {name}! You\'ve received 50 welcome points!',
            'redirect': '/track-impact'
        })
        
    except mysql.connector.IntegrityError:
        return jsonify({'success': False, 'message': 'Email already registered'})
    except Error as e:
        print(f"Error registering user: {e}")
        return jsonify({'success': False, 'message': 'Registration failed. Please try again.'})
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/auth/login', methods=['POST'])
def auth_login():
    data = request.json
    
    if not all(k in data for k in ('email', 'password')):
        return jsonify({'success': False, 'message': 'Email and password required'})
    
    email = data['email'].strip().lower()
    password = data['password']
    
    user = get_user_by_email(email)
    
    if not user:
        return jsonify({'success': False, 'message': 'Invalid email or password'})
    
    # Verify password
    if not verify_password(user[3], password):  # user[3] is password hash
        return jsonify({'success': False, 'message': 'Invalid email or password'})
    
    # Enhanced login with session data
    session['user_id'] = user[0]
    session['user_name'] = user[1]
    session['user_email'] = user[2]
    session['logged_in'] = True
    
    # Update last login time
    connection = get_db_connection()
    if connection:
        try:
            cursor = connection.cursor()
            cursor.execute('''
                UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = %s
            ''', (user[0],))
            connection.commit()
        except Error as e:
            print(f"Error updating last login: {e}")
        finally:
            if connection.is_connected():
                cursor.close()
                connection.close()
    
    return jsonify({
        'success': True,
        'message': f'Welcome back, {user[1]}!',
        'redirect': '/track-impact'
    })

# Database setup
def init_db():
    connection = get_db_connection()
    if not connection:
        print("Failed to connect to MySQL database!")
        return
    
    try:
        cursor = connection.cursor()
        
        # Enhanced Users table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                points INT DEFAULT 0,
                total_waste_submitted DECIMAL(10,2) DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_login TIMESTAMP NULL,
                profile_picture VARCHAR(255) NULL,
                location VARCHAR(255) NULL,
                phone VARCHAR(20) NULL
            )
        ''')
        
        # Enhanced Pickup requests table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS pickup_requests (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                name VARCHAR(255) NOT NULL,
                address TEXT NOT NULL,
                contact VARCHAR(255) NOT NULL,
                waste_type VARCHAR(255) NOT NULL,
                quantity VARCHAR(255) NOT NULL,
                pickup_time VARCHAR(255) NOT NULL,
                notes TEXT NULL,
                status VARCHAR(50) DEFAULT 'pending',
                points_earned INT DEFAULT 10,
                estimated_weight DECIMAL(8,2) NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
            )
        ''')
        
        # Enhanced Contact messages table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS contact_messages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                phone VARCHAR(20) NULL,
                subject VARCHAR(255) NULL,
                message TEXT NOT NULL,
                status VARCHAR(50) DEFAULT 'new',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                responded_at TIMESTAMP NULL
            )
        ''')
        
        # User achievements table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS user_achievements (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                achievement_type VARCHAR(100) NOT NULL,
                achievement_name VARCHAR(255) NOT NULL,
                description TEXT,
                points_awarded INT DEFAULT 0,
                earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
            )
        ''')
        
        connection.commit()
        print("Database tables created successfully!")
        
    except Error as e:
        print(f"Error creating tables: {e}")
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

# Waste categorization data
WASTE_CATEGORIES = {
    'plastic bottle': {
        'recyclable': True,
        'category': 'Plastic',
        'emoji': '♻️',
        'color': '#4CAF50',
        'tip': 'Remove cap and rinse before recycling'
    },
    'battery': {
        'recyclable': True,
        'category': 'E-waste',
        'emoji': '🔋',
        'color': '#FF9800',
        'tip': 'Take to certified e-waste collection center'
    },
    'newspaper': {
        'recyclable': True,
        'category': 'Paper',
        'emoji': '📰',
        'color': '#2196F3',
        'tip': 'Keep dry and bundle together'
    },
    'banana peel': {
        'recyclable': True,
        'category': 'Organic',
        'emoji': '🍌',
        'color': '#8BC34A',
        'tip': 'Perfect for composting'
    },
    'glass bottle': {
        'recyclable': True,
        'category': 'Glass',
        'emoji': '🍾',
        'color': '#00BCD4',
        'tip': 'Remove labels and rinse clean'
    },
    'cardboard': {
        'recyclable': True,
        'category': 'Paper',
        'emoji': '📦',
        'color': '#795548',
        'tip': 'Flatten and keep dry'
    },
    'aluminum can': {
        'recyclable': True,
        'category': 'Metal',
        'emoji': '🥫',
        'color': '#9E9E9E',
        'tip': 'Rinse and crush to save space'
    },
    'food waste': {
        'recyclable': True,
        'category': 'Organic',
        'emoji': '🍽️',
        'color': '#4CAF50',
        'tip': 'Great for composting'
    },
    'mobile phone': {
        'recyclable': True,
        'category': 'E-waste',
        'emoji': '📱',
        'color': '#FF5722',
        'tip': 'Remove personal data before disposal'
    },
    'styrofoam': {
        'recyclable': False,
        'category': 'Non-recyclable',
        'emoji': '❌',
        'color': '#F44336',
        'tip': 'Avoid use when possible, goes to landfill'
    }
}

@app.route('/')
def home():
    return render_template('home.html')

@app.route('/waste-guide')
def waste_guide():
    return render_template('waste_guide.html')

@app.route('/check-waste', methods=['POST'])
def check_waste():
    item = request.json.get('item', '').lower().strip()
    
    if item in WASTE_CATEGORIES:
        result = WASTE_CATEGORIES[item]
        result['item'] = item.title()
        return jsonify(result)
    else:
        return jsonify({
            'item': item.title(),
            'recyclable': None,
            'category': 'Unknown',
            'emoji': '❓',
            'color': '#9E9E9E',
            'tip': 'Contact local waste management for guidance'
        })

@app.route('/request-pickup')
def request_pickup():
    return render_template('request_pickup.html')

@app.route('/submit-pickup', methods=['POST'])
def submit_pickup():
    data = request.json
    
    connection = get_db_connection()
    if not connection:
        return jsonify({'success': False, 'message': 'Database connection error'})
    
    try:
        cursor = connection.cursor()
        user_id = session.get('user_id')
        
        # Calculate points based on waste type and quantity
        points_map = {
            'plastic': 10,
            'paper': 8,
            'glass': 12,
            'metal': 15,
            'ewaste': 20,
            'organic': 5,
            'mixed': 10,
            'other': 8
        }
        
        waste_type = data.get('waste_type', 'other')
        base_points = points_map.get(waste_type, 10)
        
        # Bonus points for larger quantities
        quantity = data.get('quantity', 'small')
        quantity_multiplier = {
            'small': 1,
            'medium': 1.5,
            'large': 2,
            'bulk': 3
        }
        
        total_points = int(base_points * quantity_multiplier.get(quantity, 1))
        
        cursor.execute('''
            INSERT INTO pickup_requests (user_id, name, address, contact, waste_type, quantity, pickup_time, notes, points_earned)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        ''', (user_id, data['name'], data['address'], data['contact'], 
              data['waste_type'], data['quantity'], data['pickup_time'], 
              data.get('notes', ''), total_points))
        
        # Award points to user if logged in
        if user_id:
            cursor.execute('''
                UPDATE users SET points = points + %s WHERE id = %s
            ''', (total_points, user_id))
        
        connection.commit()
        
        return jsonify({
            'success': True, 
            'message': 'Pickup request submitted successfully!',
            'points_earned': total_points
        })
        
    except Error as e:
        print(f"Error submitting pickup: {e}")
        return jsonify({'success': False, 'message': 'Error submitting request'})
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/track-impact')
def track_impact():
    return render_template('track_impact.html')

@app.route('/rewards')
def rewards():
    return render_template('rewards.html')

@app.route('/nearby-recyclers')
def nearby_recyclers():
    return render_template('nearby_recyclers.html')

@app.route('/login')
def login():
    return render_template('login.html')

@app.route('/register')
def register():
    return render_template('register.html')

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/contact')
def contact():
    return render_template('contact.html')

# Enhanced contact form with better data capture
@app.route('/submit-contact', methods=['POST'])
def submit_contact():
    data = request.json
    
    if not all(k in data for k in ('name', 'email', 'message')):
        return jsonify({'success': False, 'message': 'Name, email, and message are required'})
    
    name = data['name'].strip()
    email = data['email'].strip()
    message = data['message'].strip()
    phone = data.get('phone', '').strip()
    subject = data.get('subject', '').strip()
    
    if not name or not email or not message:
        return jsonify({'success': False, 'message': 'Please fill in all required fields'})
    
    # Email validation
    import re
    email_pattern = r'^[^\s@]+@[^\s@]+\.[^\s@]+$'
    if not re.match(email_pattern, email):
        return jsonify({'success': False, 'message': 'Please enter a valid email address'})
    
    connection = get_db_connection()
    if not connection:
        return jsonify({'success': False, 'message': 'Database connection error'})
    
    try:
        cursor = connection.cursor()
        cursor.execute('''
            INSERT INTO contact_messages (name, email, phone, subject, message)
            VALUES (%s, %s, %s, %s, %s)
        ''', (name, email, phone, subject, message))
        
        connection.commit()
        return jsonify({'success': True, 'message': 'Thank you for your message! We will get back to you within 24 hours.'})
        
    except Error as e:
        print(f"Error submitting contact: {e}")
        return jsonify({'success': False, 'message': 'Failed to send message. Please try again.'})
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/get-user-stats')
def get_user_stats():
    """Get user statistics for dashboard"""
    if 'user_id' not in session:
        return jsonify({'authenticated': False})
    
    user_id = session['user_id']
    
    connection = get_db_connection()
    if not connection:
        return jsonify({'authenticated': False})
    
    try:
        cursor = connection.cursor()
        
        # Get user info
        cursor.execute('SELECT name, points, total_waste_submitted FROM users WHERE id = %s', (user_id,))
        user = cursor.fetchone()
        
        # Get pickup requests count
        cursor.execute('SELECT COUNT(*) FROM pickup_requests WHERE user_id = %s', (user_id,))
        pickup_count = cursor.fetchone()[0]
        
        # Get recent pickups
        cursor.execute('''
            SELECT waste_type, quantity, created_at, status 
            FROM pickup_requests 
            WHERE user_id = %s 
            ORDER BY created_at DESC 
            LIMIT 5
        ''', (user_id,))
        recent_pickups = cursor.fetchall()
        
        if user:
            # Calculate environmental impact
            waste_kg = float(user[2]) if user[2] else 0
            trees_saved = round(waste_kg * 0.1, 1)
            water_saved = round(waste_kg * 2.5, 1)
            co2_reduced = round(waste_kg * 1.5, 1)
            
            return jsonify({
                'authenticated': True,
                'user': {
                    'name': user[0],
                    'points': user[1],
                    'total_waste': waste_kg
                },
                'stats': {
                    'trees_saved': trees_saved,
                    'water_saved': water_saved,
                    'co2_reduced': co2_reduced,
                    'pickup_count': pickup_count
                },
                'recent_pickups': [
                    {
                        'type': pickup[0],
                        'quantity': pickup[1],
                        'date': pickup[2].strftime('%Y-%m-%d') if pickup[2] else '',
                        'status': pickup[3]
                    } for pickup in recent_pickups
                ]
            })
        
        return jsonify({'authenticated': False})
        
    except Error as e:
        print(f"Error getting user stats: {e}")
        return jsonify({'authenticated': False})
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

# Authentication Routes
@app.route('/auth/register', methods=['POST'])
def auth_register():
    data = request.json
    
    # Validate required fields
    if not all(k in data for k in ('name', 'email', 'password')):
        return jsonify({'success': False, 'message': 'Missing required fields'})
    
    name = data['name'].strip()
    email = data['email'].strip().lower()
    password = data['password']
    
    # Basic validation
    if len(name) < 2:
        return jsonify({'success': False, 'message': 'Name must be at least 2 characters'})
    
    if len(password) < 6:
        return jsonify({'success': False, 'message': 'Password must be at least 6 characters'})
    
    # Email validation
    import re
    email_pattern = r'^[^\s@]+@[^\s@]+\.[^\s@]+$'
    if not re.match(email_pattern, email):
        return jsonify({'success': False, 'message': 'Please enter a valid email address'})
    
    # Check if user already exists
    if get_user_by_email(email):
        return jsonify({'success': False, 'message': 'Email already registered'})
    
    # Hash password and create user
    password_hash = hash_password(password)
    
    connection = get_db_connection()
    if not connection:
        return jsonify({'success': False, 'message': 'Database connection error'})
    
    try:
        cursor = connection.cursor()
        cursor.execute('''
            INSERT INTO users (name, email, password)
            VALUES (%s, %s, %s)
        ''', (name, email, password_hash))
        
        user_id = cursor.lastrowid
        connection.commit()
        
        # Log user in
        session['user_id'] = user_id
        session['user_name'] = name
        session['user_email'] = email
        session['logged_in'] = True
        
        return jsonify({
            'success': True, 
            'message': 'Account created successfully!',
            'redirect': '/track-impact'
        })
        
    except mysql.connector.IntegrityError:
        return jsonify({'success': False, 'message': 'Email already registered'})
    except Error as e:
        print(f"Error registering user: {e}")
        return jsonify({'success': False, 'message': 'Registration failed'})
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/auth/login', methods=['POST'])
def auth_login():
    data = request.json
    
    if not all(k in data for k in ('email', 'password')):
        return jsonify({'success': False, 'message': 'Email and password required'})
    
    email = data['email'].strip().lower()
    password = data['password']
    
    user = get_user_by_email(email)
    
    if not user:
        return jsonify({'success': False, 'message': 'Invalid email or password'})
    
    # Verify password
    if not verify_password(user[3], password):  # user[3] is password hash
        return jsonify({'success': False, 'message': 'Invalid email or password'})
    
    # Log user in
    session['user_id'] = user[0]
    session['user_name'] = user[1]
    session['user_email'] = user[2]
    session['logged_in'] = True
    
    return jsonify({
        'success': True,
        'message': 'Login successful!',
        'redirect': '/track-impact'
    })

@app.route('/auth/logout')
def auth_logout():
    session.clear()
    return redirect(url_for('home'))

def login_required(f):
    """Decorator to require login for protected routes"""
    from functools import wraps
    
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

if __name__ == '__main__':
    # Initialize database on first run
    print("Initializing SmartRecycle with MySQL database...")
    init_db()
    
    # Run the Flask application
    print("Starting SmartRecycle server...")
    app.run(debug=True, host='0.0.0.0', port=5000)
