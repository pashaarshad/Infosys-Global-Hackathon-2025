-- SmartRecycle Database Setup
-- Execute these commands in MySQL to set up the database

-- Create database
CREATE DATABASE IF NOT EXISTS UserData;
USE UserData;

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    user_type ENUM('user', 'student', 'collector') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_user_type (user_type)
);

-- User points and impact tracking
CREATE TABLE IF NOT EXISTS user_points (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    points INT DEFAULT 0,
    waste_recycled DECIMAL(10,2) DEFAULT 0.00,
    trees_saved INT DEFAULT 0,
    water_saved DECIMAL(10,2) DEFAULT 0.00,
    co2_saved DECIMAL(10,2) DEFAULT 0.00,
    total_earnings DECIMAL(10,2) DEFAULT 0.00,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
);

-- Pickup requests from users
CREATE TABLE IF NOT EXISTS pickup_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    waste_type VARCHAR(50) NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    pickup_date DATE NOT NULL,
    time_slot VARCHAR(20) DEFAULT 'morning',
    status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
    points_earned INT DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_pickup_date (pickup_date),
    INDEX idx_user_id (user_id)
);

-- Contact messages from website
CREATE TABLE IF NOT EXISTS contact_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    subject VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    status ENUM('new', 'read', 'replied', 'resolved') DEFAULT 'new',
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_email (email)
);

-- Reward redemptions tracking
CREATE TABLE IF NOT EXISTS reward_redemptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    reward_type VARCHAR(50) NOT NULL,
    reward_name VARCHAR(100) NOT NULL,
    points_used INT NOT NULL,
    reward_value DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'processed', 'delivered', 'cancelled') DEFAULT 'pending',
    tracking_info TEXT,
    redemption_code VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_reward_type (reward_type)
);

-- Certificates for students and eco-contributors
CREATE TABLE IF NOT EXISTS certificates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    certificate_type ENUM('student_eco', 'waste_collector', 'eco_champion', 'annual_award') NOT NULL,
    certificate_name VARCHAR(100) NOT NULL,
    waste_collected DECIMAL(10,2) NOT NULL,
    location VARCHAR(100),
    issue_date DATE NOT NULL,
    certificate_code VARCHAR(50) UNIQUE NOT NULL,
    verification_url TEXT,
    is_verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_certificate_type (certificate_type),
    INDEX idx_certificate_code (certificate_code)
);

-- Plastic-for-food exchange tracking
CREATE TABLE IF NOT EXISTS food_exchanges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    collector_name VARCHAR(100) NOT NULL,
    collector_phone VARCHAR(20),
    plastic_weight DECIMAL(10,2) NOT NULL,
    food_type VARCHAR(50) NOT NULL,
    food_quantity DECIMAL(10,2) NOT NULL,
    exchange_location VARCHAR(200),
    exchange_date DATE NOT NULL,
    status ENUM('pending', 'verified', 'completed') DEFAULT 'pending',
    verification_photo_url TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_exchange_date (exchange_date),
    INDEX idx_status (status)
);

-- Recyclers and drop-off centers
CREATE TABLE IF NOT EXISTS recyclers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    accepted_waste_types JSON,
    operating_hours VARCHAR(100),
    certification_level ENUM('basic', 'verified', 'premium') DEFAULT 'basic',
    rating DECIMAL(3,2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_location (latitude, longitude),
    INDEX idx_is_active (is_active)
);

-- Waste type information
CREATE TABLE IF NOT EXISTS waste_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    category VARCHAR(50) NOT NULL,
    is_recyclable BOOLEAN NOT NULL,
    points_per_kg INT NOT NULL,
    price_per_kg DECIMAL(10,2) NOT NULL,
    description TEXT,
    disposal_tips JSON,
    environmental_impact JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_is_recyclable (is_recyclable)
);

-- Insert default waste types
INSERT INTO waste_types (name, category, is_recyclable, points_per_kg, price_per_kg, description, disposal_tips, environmental_impact) VALUES
('plastic', 'Plastic', TRUE, 5, 5.00, 'Plastic bottles, containers, and packaging materials', 
 '["Clean before recycling", "Remove labels if possible", "Check recycling number", "Drop at recycling center"]',
 '{"trees_saved_per_kg": 0.5, "water_saved_per_kg": 10, "co2_reduced_per_kg": 2}'),

('paper', 'Paper', TRUE, 3, 3.00, 'Newspapers, magazines, office paper, and cardboard',
 '["Keep dry and clean", "Remove plastic wrapping", "Staples are okay", "Separate different types"]',
 '{"trees_saved_per_kg": 0.3, "water_saved_per_kg": 15, "co2_reduced_per_kg": 1.5}'),

('ewaste', 'E-Waste', TRUE, 15, 15.00, 'Electronic devices, batteries, and computer components',
 '["Remove batteries separately", "Delete personal data", "Take to certified centers", "Never throw in regular trash"]',
 '{"trees_saved_per_kg": 2, "water_saved_per_kg": 50, "co2_reduced_per_kg": 10}'),

('metal', 'Metal', TRUE, 20, 20.00, 'Aluminum cans, steel containers, and metal scraps',
 '["Clean thoroughly", "Remove labels if needed", "Separate aluminum from steel", "High recycling value"]',
 '{"trees_saved_per_kg": 1, "water_saved_per_kg": 20, "co2_reduced_per_kg": 5}'),

('glass', 'Glass', TRUE, 2, 2.00, 'Glass bottles, jars, and containers',
 '["Rinse thoroughly", "Remove caps and lids", "Separate by color", "Handle with care"]',
 '{"trees_saved_per_kg": 0.2, "water_saved_per_kg": 5, "co2_reduced_per_kg": 1}'),

('food', 'Organic', FALSE, 0, 0.00, 'Food waste and organic materials - should be composted',
 '["Create compost bin", "Use for organic fertilizer", "Separate from other waste", "Consider vermiculture"]',
 '{"trees_saved_per_kg": 0, "water_saved_per_kg": 0, "co2_reduced_per_kg": 0}');

-- Insert sample recyclers
INSERT INTO recyclers (name, address, phone, email, latitude, longitude, accepted_waste_types, operating_hours, certification_level, rating) VALUES
('GreenCycle Hub', 'MG Road, Bangalore, Karnataka 560001', '+91 98765 43210', 'info@greencyclehub.com', 12.9716, 77.5946, 
 '["plastic", "paper", "metal"]', 'Mon-Sat: 9AM-6PM', 'verified', 4.5),

('EcoWaste Solutions', 'Koramangala, Bangalore, Karnataka 560034', '+91 87654 32109', 'contact@ecowaste.com', 12.9352, 77.6245,
 '["ewaste", "plastic"]', 'Mon-Fri: 10AM-5PM', 'premium', 4.8),

('Clean Earth Center', 'Whitefield, Bangalore, Karnataka 560066', '+91 76543 21098', 'hello@cleanearthcenter.org', 12.9698, 77.7500,
 '["paper", "glass", "metal"]', 'Daily: 8AM-8PM', 'verified', 4.2);

-- Create user for testing (password: 'password123')
INSERT INTO users (name, email, password_hash, phone, user_type) VALUES
('Test User', 'test@smartrecycle.com', 'scrypt:32768:8:1$VQ8zUc7B2GtHgRdF$c8b5a6e6e4d2a1e5f3b9c2d8a7e1f4b6c3d9a8e2f5b1c4d7a0e3f6b9c2d5a8e1f4b7c0d3a6e9b2c5a8e1f4b7c0d3a6e9b2c5a8', '+91 9876543210', 'user');

-- Initialize points for test user
INSERT INTO user_points (user_id) VALUES (1);

-- Grant necessary permissions (run as root)
-- CREATE USER IF NOT EXISTS 'arshad'@'localhost' IDENTIFIED BY 'arshad';
-- GRANT ALL PRIVILEGES ON UserData.* TO 'arshad'@'localhost';
-- FLUSH PRIVILEGES;

-- Verify tables created
SHOW TABLES;

-- Show table structures
DESCRIBE users;
DESCRIBE user_points;
DESCRIBE pickup_requests;
DESCRIBE contact_messages;
DESCRIBE reward_redemptions;
DESCRIBE certificates;
DESCRIBE food_exchanges;
DESCRIBE recyclers;
DESCRIBE waste_types;
