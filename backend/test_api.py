#!/usr/bin/env python3
"""
Quick API Test Script
Tests the backend API endpoints to verify they work with Firebase
"""

import requests
import json
import random

BASE_URL = "http://localhost:5003/api"

def print_step(step_num, description):
    print(f"\n{'='*60}")
    print(f"Step {step_num}: {description}")
    print('='*60)

def test_health():
    """Test health endpoint"""
    print_step(1, "Testing Health Endpoint")
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            print("✅ Health check passed")
            print(f"   Response: {response.json()}")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        print("   Make sure backend is running: python app.py")
        return False

def test_register():
    """Test user registration"""
    print_step(2, "Testing User Registration")
    try:
        # Generate random phone number
        phone = f"9{random.randint(100000000, 999999999)}"
        
        data = {
            "business_name": "Test Business",
            "phone_number": phone,
            "password": "test123456"
        }
        
        response = requests.post(f"{BASE_URL}/auth/register", json=data)
        
        if response.status_code == 201:
            result = response.json()
            print("✅ Registration successful")
            print(f"   User ID: {result['user']['id']}")
            print(f"   Phone: {result['user']['phone_number']}")
            print(f"   Business PIN: {result['user']['business_pin']}")
            return result['token'], result['user']
        else:
            print(f"❌ Registration failed: {response.status_code}")
            print(f"   Response: {response.json()}")
            return None, None
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return None, None

def test_dashboard(token):
    """Test dashboard endpoint"""
    print_step(3, "Testing Dashboard Endpoint")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/dashboard", headers=headers)
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Dashboard data retrieved")
            print(f"   Total Customers: {result.get('total_customers', 0)}")
            print(f"   Total Transactions: {result.get('total_transactions', 0)}")
            return True
        else:
            print(f"❌ Dashboard failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def test_add_customer(token):
    """Test adding a customer"""
    print_step(4, "Testing Add Customer")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        data = {
            "name": "Test Customer",
            "phone_number": f"8{random.randint(100000000, 999999999)}"
        }
        
        response = requests.post(f"{BASE_URL}/customer", json=data, headers=headers)
        
        if response.status_code == 201:
            result = response.json()
            print("✅ Customer created successfully")
            print(f"   Customer ID: {result['customer']['$id']}")
            print(f"   Name: {result['customer']['name']}")
            return result['customer']['$id']
        else:
            print(f"❌ Add customer failed: {response.status_code}")
            print(f"   Response: {response.json()}")
            return None
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return None

def test_get_customers(token):
    """Test getting customers list"""
    print_step(5, "Testing Get Customers")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/customers", headers=headers)
        
        if response.status_code == 200:
            customers = response.json()
            print(f"✅ Retrieved {len(customers)} customers")
            return True
        else:
            print(f"❌ Get customers failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def main():
    print("\n" + "🔥"*30)
    print("   FIREBASE BACKEND API TEST")
    print("🔥"*30)
    print("\nMake sure the backend is running:")
    print("  cd backend && python app.py")
    print("\nStarting tests in 3 seconds...")
    
    import time
    time.sleep(3)
    
    # Run tests
    tests_passed = 0
    tests_total = 5
    
    # Test 1: Health check
    if test_health():
        tests_passed += 1
    else:
        print("\n❌ Backend is not running. Please start it first:")
        print("   cd backend && python app.py")
        return
    
    # Test 2: Register
    token, user = test_register()
    if token:
        tests_passed += 1
    else:
        print("\n❌ Registration failed. Stopping tests.")
        print_test_summary(tests_passed, tests_total)
        return
    
    # Test 3: Dashboard
    if test_dashboard(token):
        tests_passed += 1
    
    # Test 4: Add Customer
    customer_id = test_add_customer(token)
    if customer_id:
        tests_passed += 1
    
    # Test 5: Get Customers
    if test_get_customers(token):
        tests_passed += 1
    
    # Summary
    print_test_summary(tests_passed, tests_total)

def print_test_summary(passed, total):
    print("\n" + "="*60)
    print("   TEST SUMMARY")
    print("="*60)
    print(f"   Total: {total}")
    print(f"   ✅ Passed: {passed}")
    print(f"   ❌ Failed: {total - passed}")
    
    if passed == total:
        print("\n   🎉 ALL API TESTS PASSED!")
        print("   Your Firebase backend is working correctly!")
        print("\n   ✅ Ready for React Native integration")
        print("   ✅ Ready to deploy to production")
    else:
        print("\n   ⚠️  SOME TESTS FAILED")
        print("   Please check the errors above")
    
    print("="*60 + "\n")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Tests interrupted by user")
    except Exception as e:
        print(f"\n\n❌ Fatal error: {str(e)}")
        import traceback
        traceback.print_exc()
