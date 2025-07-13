from flask import Flask, request, jsonify, session
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error
import bcrypt
from datetime import datetime, timedelta
import os
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import re

app = Flask(__name__)
CORS(app)

# Configuration
app.config['SECRET_KEY'] = 'smartrecycle_secret_key_2025'
app.config['JWT_SECRET_KEY'] = 'jwt_secret_key_smartrecycle'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)

# Database Configuration
DB_CONFIG = {
    'host': 'localhost',
    'user': 'arshad',
    'password': 'arshad',
    'database': 'UserData'
}

# Database Connection
def get_db_connection():
    """Create and return a database connection"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        return connection
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        return None

# Initialize Database
def init_database():
    """Create necessary tables if they don't exist"""
    connection = get_db_connection()
    if connection:
        cursor = connection.cursor()
        
        # Users table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                phone VARCHAR(20),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        """)
        
        # User Points table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS user_points (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                points INT DEFAULT 0,
                waste_recycled DECIMAL(10,2) DEFAULT 0,
                trees_saved INT DEFAULT 0,
                water_saved DECIMAL(10,2) DEFAULT 0,
                co2_saved DECIMAL(10,2) DEFAULT 0,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        """)
        
        # Pickup Requests table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS pickup_requests (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                name VARCHAR(100) NOT NULL,
                phone VARCHAR(20) NOT NULL,
                address TEXT NOT NULL,
                waste_type VARCHAR(50) NOT NULL,
                quantity DECIMAL(10,2) NOT NULL,
                pickup_date DATE NOT NULL,
                status VARCHAR(20) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
            )
        """)
        
        # Contact Messages table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS contact_messages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) NOT NULL,
                subject VARCHAR(200) NOT NULL,
                message TEXT NOT NULL,
                status VARCHAR(20) DEFAULT 'new',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Rewards Redemptions table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS reward_redemptions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                reward_type VARCHAR(50) NOT NULL,
                points_used INT NOT NULL,
                status VARCHAR(20) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        """)
        
        connection.commit()
        cursor.close()
        connection.close()
        print("Database tables created successfully!")

# Utility Functions
def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_phone(phone):
    """Validate phone number format"""
    pattern = r'^[6-9]\d{9}$'
    return re.match(pattern, phone) is not None

def generate_jwt_token(user_id):
    """Generate JWT token for user"""
    payload = {
        'user_id': user_id,
        'exp': datetime.utcnow() + timedelta(hours=24)
    }
    return jwt.encode(payload, app.config['JWT_SECRET_KEY'], algorithm='HS256')

def verify_jwt_token(token):
    """Verify JWT token"""
    try:
        payload = jwt.decode(token, app.config['JWT_SECRET_KEY'], algorithms=['HS256'])
        return payload['user_id']
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

# Routes

@app.route('/')
def home():
    """Home route"""
    return jsonify({
        'message': 'SmartRecycle API is running!',
        'version': '1.0.0',
        'status': 'active'
    })

@app.route('/api/register', methods=['POST'])
def register():
    """User registration endpoint"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'email', 'password', 'phone']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'message': f'{field.title()} is required'}), 400
        
        # Validate email format
        if not validate_email(data['email']):
            return jsonify({'message': 'Invalid email format'}), 400
        
        # Validate phone format
        if not validate_phone(data['phone']):
            return jsonify({'message': 'Invalid phone number format'}), 400
        
        # Validate password strength
        if len(data['password']) < 6:
            return jsonify({'message': 'Password must be at least 6 characters long'}), 400
        
        connection = get_db_connection()
        if not connection:
            return jsonify({'message': 'Database connection failed'}), 500
        
        cursor = connection.cursor()
        
        # Check if email already exists
        cursor.execute("SELECT id FROM users WHERE email = %s", (data['email'],))
        if cursor.fetchone():
            return jsonify({'message': 'Email already registered'}), 409
        
        # Hash password
        password_hash = generate_password_hash(data['password'])
        
        # Insert new user
        cursor.execute("""
            INSERT INTO users (name, email, password_hash, phone) 
            VALUES (%s, %s, %s, %s)
        """, (data['name'], data['email'], password_hash, data['phone']))
        
        user_id = cursor.lastrowid
        
        # Initialize user points
        cursor.execute("""
            INSERT INTO user_points (user_id) VALUES (%s)
        """, (user_id,))
        
        connection.commit()
        
        # Generate token
        token = generate_jwt_token(user_id)
        
        user_data = {
            'id': user_id,
            'name': data['name'],
            'email': data['email'],
            'phone': data['phone']
        }
        
        cursor.close()
        connection.close()
        
        return jsonify({
            'message': 'Registration successful',
            'user': user_data,
            'token': token
        }), 201
        
    except Exception as e:
        print(f"Registration error: {e}")
        return jsonify({'message': 'Registration failed'}), 500

@app.route('/api/login', methods=['POST'])
def login():
    """User login endpoint"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data.get('email') or not data.get('password'):
            return jsonify({'message': 'Email and password are required'}), 400
        
        connection = get_db_connection()
        if not connection:
            return jsonify({'message': 'Database connection failed'}), 500
        
        cursor = connection.cursor()
        
        # Get user by email
        cursor.execute("""
            SELECT id, name, email, password_hash, phone 
            FROM users WHERE email = %s
        """, (data['email'],))
        
        user = cursor.fetchone()
        
        if not user or not check_password_hash(user[3], data['password']):
            return jsonify({'message': 'Invalid email or password'}), 401
        
        # Generate token
        token = generate_jwt_token(user[0])
        
        user_data = {
            'id': user[0],
            'name': user[1],
            'email': user[2],
            'phone': user[4]
        }
        
        cursor.close()
        connection.close()
        
        return jsonify({
            'message': 'Login successful',
            'user': user_data,
            'token': token
        }), 200
        
    except Exception as e:
        print(f"Login error: {e}")
        return jsonify({'message': 'Login failed'}), 500

@app.route('/api/user-data/<int:user_id>', methods=['GET'])
def get_user_data(user_id):
    """Get user data including points and impact"""
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({'message': 'Database connection failed'}), 500
        
        cursor = connection.cursor()
        
        # Get user points and impact data
        cursor.execute("""
            SELECT points, waste_recycled, trees_saved, water_saved, co2_saved
            FROM user_points WHERE user_id = %s
        """, (user_id,))
        
        user_data = cursor.fetchone()
        
        if not user_data:
            # Initialize user points if not exists
            cursor.execute("""
                INSERT INTO user_points (user_id) VALUES (%s)
            """, (user_id,))
            connection.commit()
            user_data = (0, 0, 0, 0, 0)
        
        cursor.close()
        connection.close()
        
        return jsonify({
            'points': user_data[0],
            'impact': {
                'waste_recycled': float(user_data[1]),
                'trees_saved': user_data[2],
                'water_saved': float(user_data[3]),
                'co2_saved': float(user_data[4])
            }
        }), 200
        
    except Exception as e:
        print(f"Get user data error: {e}")
        return jsonify({'message': 'Failed to get user data'}), 500

@app.route('/api/pickup-request', methods=['POST'])
def create_pickup_request():
    """Create a new pickup request"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'phone', 'address', 'wasteType', 'quantity', 'date']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'message': f'{field.title()} is required'}), 400
        
        connection = get_db_connection()
        if not connection:
            return jsonify({'message': 'Database connection failed'}), 500
        
        cursor = connection.cursor()
        
        # Insert pickup request
        cursor.execute("""
            INSERT INTO pickup_requests 
            (name, phone, address, waste_type, quantity, pickup_date) 
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (
            data['name'],
            data['phone'],
            data['address'],
            data['wasteType'],
            float(data['quantity']),
            data['date']
        ))
        
        request_id = cursor.lastrowid
        connection.commit()
        
        cursor.close()
        connection.close()
        
        return jsonify({
            'message': 'Pickup request created successfully',
            'request_id': request_id
        }), 201
        
    except Exception as e:
        print(f"Pickup request error: {e}")
        return jsonify({'message': 'Failed to create pickup request'}), 500

@app.route('/api/contact', methods=['POST'])
def create_contact_message():
    """Create a new contact message"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'email', 'subject', 'message']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'message': f'{field.title()} is required'}), 400
        
        # Validate email format
        if not validate_email(data['email']):
            return jsonify({'message': 'Invalid email format'}), 400
        
        connection = get_db_connection()
        if not connection:
            return jsonify({'message': 'Database connection failed'}), 500
        
        cursor = connection.cursor()
        
        # Insert contact message
        cursor.execute("""
            INSERT INTO contact_messages (name, email, subject, message) 
            VALUES (%s, %s, %s, %s)
        """, (data['name'], data['email'], data['subject'], data['message']))
        
        message_id = cursor.lastrowid
        connection.commit()
        
        cursor.close()
        connection.close()
        
        return jsonify({
            'message': 'Contact message sent successfully',
            'message_id': message_id
        }), 201
        
    except Exception as e:
        print(f"Contact message error: {e}")
        return jsonify({'message': 'Failed to send contact message'}), 500

@app.route('/api/redeem', methods=['POST'])
def redeem_reward():
    """Redeem a reward with user points"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['userId', 'rewardType', 'points']
        for field in required_fields:
            if field not in data:
                return jsonify({'message': f'{field} is required'}), 400
        
        user_id = data['userId']
        reward_type = data['rewardType']
        points_required = int(data['points'])
        
        connection = get_db_connection()
        if not connection:
            return jsonify({'message': 'Database connection failed'}), 500
        
        cursor = connection.cursor()
        
        # Check user's current points
        cursor.execute("""
            SELECT points FROM user_points WHERE user_id = %s
        """, (user_id,))
        
        result = cursor.fetchone()
        if not result or result[0] < points_required:
            return jsonify({'message': 'Insufficient points'}), 400
        
        # Deduct points
        new_points = result[0] - points_required
        cursor.execute("""
            UPDATE user_points SET points = %s WHERE user_id = %s
        """, (new_points, user_id))
        
        # Record redemption
        cursor.execute("""
            INSERT INTO reward_redemptions (user_id, reward_type, points_used) 
            VALUES (%s, %s, %s)
        """, (user_id, reward_type, points_required))
        
        connection.commit()
        
        cursor.close()
        connection.close()
        
        return jsonify({
            'message': 'Reward redeemed successfully',
            'new_points_balance': new_points
        }), 200
        
    except Exception as e:
        print(f"Reward redemption error: {e}")
        return jsonify({'message': 'Failed to redeem reward'}), 500

@app.route('/api/update-points', methods=['POST'])
def update_user_points():
    """Update user points and impact after waste submission"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['userId', 'points', 'wasteType', 'quantity']
        for field in required_fields:
            if field not in data:
                return jsonify({'message': f'{field} is required'}), 400
        
        user_id = data['userId']
        points_to_add = int(data['points'])
        waste_type = data['wasteType']
        quantity = float(data['quantity'])
        
        connection = get_db_connection()
        if not connection:
            return jsonify({'message': 'Database connection failed'}), 500
        
        cursor = connection.cursor()
        
        # Calculate environmental impact
        impact_multipliers = {
            'plastic': {'trees': 0.5, 'water': 10, 'co2': 2},
            'paper': {'trees': 0.3, 'water': 15, 'co2': 1.5},
            'ewaste': {'trees': 2, 'water': 50, 'co2': 10},
            'metal': {'trees': 1, 'water': 20, 'co2': 5},
            'glass': {'trees': 0.2, 'water': 5, 'co2': 1}
        }
        
        multiplier = impact_multipliers.get(waste_type, {'trees': 0, 'water': 0, 'co2': 0})
        
        trees_saved = int(quantity * multiplier['trees'])
        water_saved = quantity * multiplier['water']
        co2_saved = quantity * multiplier['co2']
        
        # Update user points and impact
        cursor.execute("""
            UPDATE user_points 
            SET points = points + %s,
                waste_recycled = waste_recycled + %s,
                trees_saved = trees_saved + %s,
                water_saved = water_saved + %s,
                co2_saved = co2_saved + %s
            WHERE user_id = %s
        """, (points_to_add, quantity, trees_saved, water_saved, co2_saved, user_id))
        
        connection.commit()
        
        # Get updated data
        cursor.execute("""
            SELECT points, waste_recycled, trees_saved, water_saved, co2_saved
            FROM user_points WHERE user_id = %s
        """, (user_id,))
        
        updated_data = cursor.fetchone()
        
        cursor.close()
        connection.close()
        
        return jsonify({
            'message': 'Points updated successfully',
            'points': updated_data[0],
            'impact': {
                'waste_recycled': float(updated_data[1]),
                'trees_saved': updated_data[2],
                'water_saved': float(updated_data[3]),
                'co2_saved': float(updated_data[4])
            }
        }), 200
        
    except Exception as e:
        print(f"Update points error: {e}")
        return jsonify({'message': 'Failed to update points'}), 500

@app.route('/api/stats', methods=['GET'])
def get_platform_stats():
    """Get platform-wide statistics"""
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({'message': 'Database connection failed'}), 500
        
        cursor = connection.cursor()
        
        # Get total users
        cursor.execute("SELECT COUNT(*) FROM users")
        total_users = cursor.fetchone()[0]
        
        # Get total waste recycled
        cursor.execute("SELECT SUM(waste_recycled) FROM user_points")
        total_waste = cursor.fetchone()[0] or 0
        
        # Get total trees saved
        cursor.execute("SELECT SUM(trees_saved) FROM user_points")
        total_trees = cursor.fetchone()[0] or 0
        
        # Get total points distributed
        cursor.execute("SELECT SUM(points) FROM user_points")
        total_points = cursor.fetchone()[0] or 0
        
        cursor.close()
        connection.close()
        
        return jsonify({
            'total_users': total_users,
            'total_waste_recycled': float(total_waste),
            'total_trees_saved': total_trees,
            'total_points_distributed': total_points
        }), 200
        
    except Exception as e:
        print(f"Get stats error: {e}")
        return jsonify({'message': 'Failed to get statistics'}), 500

# Error Handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'message': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'message': 'Internal server error'}), 500

@app.errorhandler(400)
def bad_request(error):
    return jsonify({'message': 'Bad request'}), 400

# Initialize database on startup
if __name__ == '__main__':
    init_database()
    app.run(debug=True, host='0.0.0.0', port=5000)
