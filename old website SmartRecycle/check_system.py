#!/usr/bin/env python3

import subprocess
import sys
import os

def run_command(command):
    """Run a command and return the result"""
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True)
        return result.returncode == 0, result.stdout.strip(), result.stderr.strip()
    except Exception as e:
        return False, "", str(e)

def check_mysql():
    """Check if MySQL is installed and running"""
    print("🔍 Checking MySQL installation...")
    
    # Check MySQL version
    success, output, error = run_command("mysql --version")
    if success:
        print(f"✅ MySQL Client installed: {output}")
    else:
        print("❌ MySQL Client not found")
        return False
    
    # Check MySQL service
    success, output, error = run_command("sudo systemctl is-active mysql")
    if success and "active" in output:
        print("✅ MySQL service is running")
    else:
        print("⚠️  MySQL service may not be running")
        # Try alternative service name
        success, output, error = run_command("sudo systemctl is-active mysqld")
        if success and "active" in output:
            print("✅ MySQL service (mysqld) is running")
        else:
            print("❌ MySQL service not running")
    
    return True

def check_python_mysql():
    """Check if Python MySQL packages are available"""
    print("\n🐍 Checking Python MySQL packages...")
    
    try:
        import mysql.connector
        print("✅ mysql-connector-python is installed")
        return True
    except ImportError:
        print("❌ mysql-connector-python not installed")
    
    try:
        import pymysql
        print("✅ PyMySQL is installed")
        return True
    except ImportError:
        print("❌ PyMySQL not installed")
    
    return False

def check_sqlite():
    """Check SQLite availability"""
    print("\n📁 Checking SQLite...")
    try:
        import sqlite3
        print("✅ SQLite is available (built into Python)")
        return True
    except ImportError:
        print("❌ SQLite not available")
        return False

def main():
    print("🚀 SmartRecycle System Check")
    print("=" * 40)
    
    mysql_available = check_mysql()
    python_mysql_available = check_python_mysql()
    sqlite_available = check_sqlite()
    
    print("\n📋 Summary:")
    print("=" * 40)
    
    if sqlite_available:
        print("✅ SQLite is ready - You can run the project immediately!")
        print("   Command: python app.py")
    
    if mysql_available and python_mysql_available:
        print("✅ MySQL is ready - You can use MySQL if desired")
    elif mysql_available and not python_mysql_available:
        print("⚠️  MySQL server available but Python connector missing")
        print("   Install with: pip install mysql-connector-python")
    else:
        print("❌ MySQL not available")
        print("   Install with: sudo apt install mysql-server (Ubuntu/Debian)")
    
    print("\n🎯 Recommendation:")
    if sqlite_available:
        print("   Use SQLite for development (current setup)")
        print("   It's simpler and requires no additional setup!")
    
    print("\n🏃 Ready to run SmartRecycle:")
    print("   cd SmartRecycle")
    print("   python app.py")

if __name__ == "__main__":
    main()
