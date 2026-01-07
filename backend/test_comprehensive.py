#!/usr/bin/env python3
"""
Comprehensive API Test Script
Tests ALL backend endpoints including products, transactions, vouchers, offers, etc.
"""

import requests
import json
import random
import time

BASE_URL = "http://localhost:5003/api"

def print_step(step_num, description):
    print(f"\n{'='*60}")
    print(f"Step {step_num}: {description}")
    print('='*60)

def test_health():
    """Test 1: Health endpoint"""
    print_step(1, "Testing Health Endpoint")
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            print("✅ Health check passed")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def test_register():
    """Test 2: User registration"""
    print_step(2, "Testing User Registration")
    try:
        phone = f"9{random.randint(100000000, 999999999)}"
        data = {
            "business_name": "Comprehensive Test Business",
            "phone_number": phone,
            "password": "test123456"
        }
        
        response = requests.post(f"{BASE_URL}/auth/register", json=data)
        
        if response.status_code == 201:
            result = response.json()
            print("✅ Registration successful")
            print(f"   Business: {result['user']['business_name']}")
            print(f"   Phone: {result['user']['phone_number']}")
            print(f"   Business PIN: {result['user']['business_pin']}")
            return result['token'], result['user']
        else:
            print(f"❌ Registration failed: {response.status_code}")
            return None, None
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return None, None

def test_add_customer(token):
    """Test 3: Add customer"""
    print_step(3, "Testing Add Customer")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        data = {
            "name": "Test Customer One",
            "phone_number": f"8{random.randint(100000000, 999999999)}"
        }
        
        response = requests.post(f"{BASE_URL}/customer", json=data, headers=headers)
        
        if response.status_code == 201:
            result = response.json()
            print("✅ Customer created")
            print(f"   Customer ID: {result['customer']['$id']}")
            print(f"   Name: {result['customer']['name']}")
            return result['customer']['$id']
        else:
            print(f"❌ Add customer failed: {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return None

def test_add_product(token):
    """Test 4: Add product"""
    print_step(4, "Testing Add Product")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        data = {
            "name": "Test Product",
            "category": "Electronics",
            "price": 999.99,
            "stock_quantity": 50,
            "description": "Test product description"
        }
        
        response = requests.post(f"{BASE_URL}/product", json=data, headers=headers)
        
        if response.status_code == 201:
            result = response.json()
            print("✅ Product created")
            print(f"   Product ID: {result['product']['$id']}")
            print(f"   Name: {result['product']['name']}")
            print(f"   Price: ₹{result['product']['price']}")
            return result['product']['$id']
        else:
            print(f"❌ Add product failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return None

def test_get_products(token):
    """Test 5: Get products"""
    print_step(5, "Testing Get Products")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/products", headers=headers)
        
        if response.status_code == 200:
            products = response.json()
            print(f"✅ Retrieved {len(products)} products")
            return True
        else:
            print(f"❌ Get products failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def test_create_transaction(token, customer_id):
    """Test 6: Create credit transaction"""
    print_step(6, "Testing Create Transaction (Credit)")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        data = {
            "customer_id": customer_id,
            "type": "credit",
            "amount": 500.00,
            "notes": "Test credit transaction"
        }
        
        response = requests.post(f"{BASE_URL}/transaction", json=data, headers=headers)
        
        if response.status_code == 201:
            result = response.json()
            print("✅ Transaction created")
            print(f"   Transaction ID: {result['transaction']['$id']}")
            print(f"   Type: {result['transaction']['transaction_type']}")
            print(f"   Amount: ₹{result['transaction']['amount']}")
            return result['transaction']['$id']
        else:
            print(f"❌ Create transaction failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return None

def test_payment_transaction(token, customer_id):
    """Test 7: Create payment transaction"""
    print_step(7, "Testing Create Transaction (Payment)")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        data = {
            "customer_id": customer_id,
            "type": "payment",
            "amount": 200.00,
            "notes": "Test payment transaction"
        }
        
        response = requests.post(f"{BASE_URL}/transaction", json=data, headers=headers)
        
        if response.status_code == 201:
            result = response.json()
            print("✅ Payment transaction created")
            print(f"   Amount: ₹{result['transaction']['amount']}")
            print(f"   New Balance: ₹{result.get('new_balance', 0)}")
            return True
        else:
            print(f"❌ Create payment failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def test_get_transactions(token):
    """Test 8: Get transactions"""
    print_step(8, "Testing Get Transactions")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/transactions", headers=headers)
        
        if response.status_code == 200:
            transactions = response.json()
            print(f"✅ Retrieved {len(transactions)} transactions")
            return True
        else:
            print(f"❌ Get transactions failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def test_create_voucher(token):
    """Test 9: Create voucher"""
    print_step(9, "Testing Create Voucher")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        data = {
            "code": f"TEST{random.randint(1000, 9999)}",
            "discount_type": "percentage",
            "discount_value": 10,
            "min_purchase": 100,
            "max_discount": 50,
            "valid_from": "2026-01-01T00:00:00",
            "valid_to": "2026-12-31T23:59:59",
            "usage_limit": 100,
            "is_active": True
        }
        
        response = requests.post(f"{BASE_URL}/voucher", json=data, headers=headers)
        
        if response.status_code == 201:
            result = response.json()
            print("✅ Voucher created")
            print(f"   Code: {result['voucher']['code']}")
            print(f"   Discount: {result['voucher']['discount_value']}%")
            return result['voucher']['$id']
        else:
            print(f"❌ Create voucher failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return None

def test_get_vouchers(token):
    """Test 10: Get vouchers"""
    print_step(10, "Testing Get Vouchers")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/vouchers", headers=headers)
        
        if response.status_code == 200:
            vouchers = response.json()
            print(f"✅ Retrieved {len(vouchers)} vouchers")
            return True
        else:
            print(f"❌ Get vouchers failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def test_create_offer(token):
    """Test 11: Create offer"""
    print_step(11, "Testing Create Offer")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        data = {
            "title": "Test Special Offer",
            "description": "Buy 2 Get 1 Free",
            "discount_type": "percentage",
            "discount_value": 15,
            "valid_from": "2026-01-01T00:00:00",
            "valid_to": "2026-12-31T23:59:59",
            "terms_conditions": "Terms apply",
            "is_active": True
        }
        
        response = requests.post(f"{BASE_URL}/offer", json=data, headers=headers)
        
        if response.status_code == 201:
            result = response.json()
            print("✅ Offer created")
            print(f"   Title: {result['offer']['title']}")
            print(f"   Discount: {result['offer']['discount_value']}%")
            return result['offer']['$id']
        else:
            print(f"❌ Create offer failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return None

def test_get_offers(token):
    """Test 12: Get offers"""
    print_step(12, "Testing Get Offers")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/offers", headers=headers)
        
        if response.status_code == 200:
            offers = response.json()
            print(f"✅ Retrieved {len(offers)} offers")
            return True
        else:
            print(f"❌ Get offers failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def test_dashboard(token):
    """Test 13: Dashboard with data"""
    print_step(13, "Testing Dashboard (with data)")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/dashboard", headers=headers)
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Dashboard retrieved")
            print(f"   Total Customers: {result.get('total_customers', 0)}")
            print(f"   Total Credit: ₹{result.get('total_credit', 0)}")
            print(f"   Total Payment: ₹{result.get('total_payment', 0)}")
            print(f"   Outstanding Balance: ₹{result.get('outstanding_balance', 0)}")
            return True
        else:
            print(f"❌ Dashboard failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def test_business_summary(token):
    """Test 14: Business summary"""
    print_step(14, "Testing Business Summary")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/business/summary", headers=headers)
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Business summary retrieved")
            print(f"   Customers: {result.get('customers', 0)}")
            print(f"   Transactions: {result.get('transactions', 0)}")
            return True
        else:
            print(f"❌ Business summary failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def main():
    print("\n" + "🔥"*30)
    print("   COMPREHENSIVE FIREBASE API TEST")
    print("   Testing ALL Backend Features")
    print("🔥"*30)
    print("\nMake sure backend is running: python app.py")
    print("\nStarting comprehensive tests...\n")
    
    time.sleep(2)
    
    tests_passed = 0
    tests_total = 14
    
    # Test 1: Health
    if test_health():
        tests_passed += 1
    else:
        print("\n❌ Backend not running!")
        return
    
    # Test 2: Register
    token, user = test_register()
    if token:
        tests_passed += 1
    else:
        print("\n❌ Cannot continue without authentication")
        return
    
    # Test 3: Add Customer
    customer_id = test_add_customer(token)
    if customer_id:
        tests_passed += 1
    
    # Test 4-5: Products
    product_id = test_add_product(token)
    if product_id:
        tests_passed += 1
    
    if test_get_products(token):
        tests_passed += 1
    
    # Test 6-8: Transactions
    if customer_id:
        transaction_id = test_create_transaction(token, customer_id)
        if transaction_id:
            tests_passed += 1
        
        if test_payment_transaction(token, customer_id):
            tests_passed += 1
    
    if test_get_transactions(token):
        tests_passed += 1
    
    # Test 9-10: Vouchers
    voucher_id = test_create_voucher(token)
    if voucher_id:
        tests_passed += 1
    
    if test_get_vouchers(token):
        tests_passed += 1
    
    # Test 11-12: Offers
    offer_id = test_create_offer(token)
    if offer_id:
        tests_passed += 1
    
    if test_get_offers(token):
        tests_passed += 1
    
    # Test 13-14: Dashboard & Summary
    if test_dashboard(token):
        tests_passed += 1
    
    if test_business_summary(token):
        tests_passed += 1
    
    # Summary
    print("\n" + "="*60)
    print("   COMPREHENSIVE TEST SUMMARY")
    print("="*60)
    print(f"   Total Tests: {tests_total}")
    print(f"   ✅ Passed: {tests_passed}")
    print(f"   ❌ Failed: {tests_total - tests_passed}")
    
    if tests_passed == tests_total:
        print("\n   🎉 ALL COMPREHENSIVE TESTS PASSED!")
        print("   Your Firebase backend is FULLY FUNCTIONAL!")
        print("\n   ✅ Customers - Working")
        print("   ✅ Products - Working")
        print("   ✅ Transactions - Working")
        print("   ✅ Vouchers - Working")
        print("   ✅ Offers - Working")
        print("   ✅ Dashboard - Working")
        print("\n   🚀 Ready for React Native integration!")
        print("   🚀 Ready for production deployment!")
    else:
        print("\n   ⚠️  SOME TESTS FAILED")
        print("   Review errors above")
    
    print("="*60 + "\n")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Tests interrupted")
    except Exception as e:
        print(f"\n\n❌ Fatal error: {str(e)}")
        import traceback
        traceback.print_exc()
