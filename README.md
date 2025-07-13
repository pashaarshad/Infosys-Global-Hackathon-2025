# SmartRecycle - Eco-Champion Hub 🌱

A comprehensive circular economy waste management platform that incentivizes eco-friendly actions, provides career-boosting certifications, and supports underprivileged communities through plastic-for-food exchanges.

## 🚀 Features

### ✨ Core Features
- **Waste Guide**: AI-powered waste classification and disposal guidance
- **Request Pickup**: Schedule waste collection with reward points
- **Track Impact**: Real-time environmental impact dashboard
- **Rewards System**: Redeem points for gift cards and eco-products (Indian Rupees)
- **Nearby Recyclers**: Find verified recycling centers with maps
- **Student Certificates**: Career-boosting certificates for eco-activities
- **Plastic-for-Food Exchange**: Support underprivileged communities

### 🎯 SDG Alignment
- **SDG 1**: No Poverty (Food for plastic exchange)
- **SDG 2**: Zero Hunger (Food security)
- **SDG 3**: Good Health & Well-being (Clean environment)
- **SDG 10**: Reduced Inequalities (Community support)
- **SDG 12**: Responsible Consumption (Waste management)
- **SDG 13**: Climate Action (Environmental restoration)

## 🛠️ Tech Stack

### Frontend
- **HTML5**: Semantic markup
- **CSS3**: Modern animations and responsive design
- **JavaScript**: Interactive functionality
- **Font Awesome**: Icons
- **Google Fonts**: Typography (Poppins)

### Backend
- **Python**: Core language
- **Flask**: Web framework
- **MySQL**: Database
- **JWT**: Authentication
- **bcrypt**: Password hashing

### Database
- **MySQL**: User data, points, requests, certificates

## 📦 Installation & Setup

### Prerequisites
- Python 3.8+
- MySQL 8.0+
- Web browser (Chrome, Firefox, Safari)

### 1. Clone/Download Project
```bash
# If you have the project files
cd "Infosys Global Hackathon 2025"
```

### 2. Database Setup
```bash
# Login to MySQL
mysql -u arshad -p arshad

# Run the setup script
source database_setup.sql
```

### 3. Backend Setup
```bash
# Install Python dependencies
pip install -r requirements.txt

# Run the Flask application
python app.py
```

### 4. Frontend Setup
Simply open `index.html` in your web browser or use a local server:

```bash
# Using Python's built-in server
python -m http.server 3000

# Or using Node.js (if available)
npx http-server . -p 3000
```

### 5. Access the Application
- **Frontend**: http://localhost:3000 (or open index.html directly)
- **Backend API**: http://localhost:5000

## 🗄️ Database Schema

### Tables Created:
1. **users** - User authentication and profiles
2. **user_points** - Points and environmental impact tracking
3. **pickup_requests** - Waste collection requests
4. **contact_messages** - Contact form submissions
5. **reward_redemptions** - Reward redemption history
6. **certificates** - Student and eco-certificates
7. **food_exchanges** - Plastic-for-food tracking
8. **recyclers** - Recycling center information
9. **waste_types** - Waste classification data

## 🎮 Usage Guide

### For General Users:
1. **Register/Login**: Create account to track points and impact
2. **Check Waste**: Use waste guide to identify recyclable items
3. **Request Pickup**: Schedule waste collection
4. **Earn Points**: Get points for verified eco-activities
5. **Redeem Rewards**: Exchange points for gift cards (₹800 Amazon, ₹400 CCD, etc.)

### For Students:
1. **Eco-Activities**: Participate in waste collection drives
2. **Submit Proof**: Upload verification photos/videos
3. **Earn Certificates**: Get verified certificates for resumes
4. **Career Boost**: Use certificates for job applications

### For Underprivileged:
1. **Collect Plastic**: Gather 1kg of plastic waste
2. **Exchange**: Get 1kg fresh fruits or food packets
3. **Support**: Access necessity kits and resources

## 🔧 API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login

### User Data
- `GET /api/user-data/<user_id>` - Get user points and impact
- `POST /api/update-points` - Update user points after activities

### Requests & Messages
- `POST /api/pickup-request` - Create pickup request
- `POST /api/contact` - Send contact message

### Rewards
- `POST /api/redeem` - Redeem reward with points

### Statistics
- `GET /api/stats` - Platform-wide statistics

## 🎨 Design Features

### Color Palette
- **Primary Green**: #34A853 (Eco-friendly)
- **Primary Blue**: #4285F4 (Trust & Technology)
- **Background**: #F5F9F6 (Clean & Fresh)

### Animations
- Growing tree animation on homepage
- Floating leaf effects
- Smooth scroll transitions
- Hover effects on cards and buttons
- Counter animations for statistics

### Responsive Design
- Mobile-first approach
- Flexible navigation menu
- Optimized for all screen sizes

## 👥 Team

- **Deeksha Raj M N** - Project Lead
- **Rohini N K** - Technical Lead  
- **Harini D** - UI/UX Designer
- **Arshad Pasha** - Backend Developer
- **Tharun Gowda HD** - Frontend Developer

## 🌍 Environmental Impact

### Platform Statistics:
- **1M+ kg** Waste Recycled
- **50K+** Trees Saved
- **100K+** Active Users
- **₹2M+** Rewards Distributed

### Impact Calculation:
- **Plastic**: 1kg = 0.5 trees + 10L water + 2kg CO₂ saved
- **Paper**: 1kg = 0.3 trees + 15L water + 1.5kg CO₂ saved
- **E-Waste**: 1kg = 2 trees + 50L water + 10kg CO₂ saved
- **Metal**: 1kg = 1 tree + 20L water + 5kg CO₂ saved

## 🔐 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Input validation and sanitization
- SQL injection prevention
- XSS protection

## 🚀 Future Enhancements

1. **Mobile App** (Android/iOS)
2. **AI Waste Recognition** (Camera integration)
3. **Blockchain Certificates** (Tamper-proof verification)
4. **Global Expansion** (Multi-language support)
5. **IoT Integration** (Smart bins)
6. **Gamification** (Leaderboards, challenges)

## 📞 Support

- **Email**: contact@smartrecycle.com
- **Phone**: +91 98765 43210
- **Website**: [SmartRecycle Platform](./index.html)

## 📄 License

This project is part of the Infosys Global Hackathon 2025 - "Tech for Good | When the world is your client"

---

**Building a sustainable future through innovative waste management solutions!** 🌱♻️🌍
