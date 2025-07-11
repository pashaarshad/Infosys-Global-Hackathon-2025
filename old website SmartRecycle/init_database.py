#!/usr/bin/env python3

import mysql.connector
from mysql.connector import Error

# MySQL Database Configuration
DB_CONFIG = {
    'host': 'localhost',
    'user': 'arshad',
    'password': 'arshad',
    'database': 'SmartRecycle',
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

def init_db():
    """Initialize database tables"""
    connection = get_db_connection()
    if not connection:
        print("Failed to connect to MySQL database!")
        return
    
    try:
        cursor = connection.cursor()
        
        print("Creating users table...")
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
                profile_picture VARCHAR(500) NULL,
                location VARCHAR(255) NULL,
                phone VARCHAR(20) NULL
            )
        ''')
        
        print("Creating pickup_requests table...")
        # Enhanced Pickup requests table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS pickup_requests (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NULL,
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
        
        print("Creating contact_messages table...")
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
        
        print("Creating user_achievements table...")
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
        print("✅ All database tables created successfully!")
        
        # Show existing tables
        cursor.execute("SHOW TABLES")
        tables = cursor.fetchall()
        print("\n📋 Available tables:")
        for table in tables:
            print(f"  - {table[0]}")
        
    except Error as e:
        print(f"❌ Error creating tables: {e}")
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()
            print("🔒 Database connection closed.")

if __name__ == "__main__":
    print("🚀 Initializing SmartRecycle MySQL Database...")
    init_db()
