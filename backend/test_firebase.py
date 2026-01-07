#!/usr/bin/env python3
"""
Firebase Backend Test Script
Tests basic Firebase operations before deploying to production
"""

import sys
import os

# Add backend directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from firebase_utils import FirebaseDB
from firebase_query import Query
import uuid
from datetime import datetime

def print_header(text):
    print("\n" + "="*60)
    print(f"  {text}")
    print("="*60)

def test_firebase_connection():
    """Test 1: Firebase Connection"""
    print_header("TEST 1: Firebase Connection")
    try:
        db = FirebaseDB()
        db._ensure_initialized()
        print("✅ Firebase initialized successfully!")
        return True
    except Exception as e:
        print(f"❌ Firebase initialization failed: {str(e)}")
        return False

def test_create_document():
    """Test 2: Create Document"""
    print_header("TEST 2: Create Document")
    try:
        db = FirebaseDB()
        test_id = f"test_{uuid.uuid4().hex[:8]}"
        test_data = {
            "name": "Test User",
            "phone_number": "1234567890",
            "test": True,
            "created_at": datetime.now().isoformat()
        }
        
        result = db.create_document('users', test_id, test_data)
        if result and result.get('$id') == test_id:
            print(f"✅ Document created successfully!")
            print(f"   Document ID: {test_id}")
            return test_id
        else:
            print(f"❌ Document creation failed")
            return None
    except Exception as e:
        print(f"❌ Error creating document: {str(e)}")
        return None

def test_read_document(doc_id):
    """Test 3: Read Document"""
    print_header("TEST 3: Read Document")
    try:
        db = FirebaseDB()
        result = db.get_document('users', doc_id)
        if result and result.get('$id') == doc_id:
            print(f"✅ Document read successfully!")
            print(f"   Name: {result.get('name')}")
            print(f"   Phone: {result.get('phone_number')}")
            return True
        else:
            print(f"❌ Document read failed")
            return False
    except Exception as e:
        print(f"❌ Error reading document: {str(e)}")
        return False

def test_list_documents():
    """Test 4: List Documents"""
    print_header("TEST 4: List Documents")
    try:
        db = FirebaseDB()
        results = db.list_documents('users', queries=[
            Query.equal('test', True)
        ], limit=10)
        
        if results:
            print(f"✅ Found {len(results)} test documents")
            return True
        else:
            print(f"⚠️  No test documents found (this is okay)")
            return True
    except Exception as e:
        print(f"❌ Error listing documents: {str(e)}")
        return False

def test_update_document(doc_id):
    """Test 5: Update Document"""
    print_header("TEST 5: Update Document")
    try:
        db = FirebaseDB()
        update_data = {
            "name": "Updated Test User",
            "updated": True
        }
        
        result = db.update_document('users', doc_id, update_data)
        if result:
            print(f"✅ Document updated successfully!")
            return True
        else:
            print(f"❌ Document update failed")
            return False
    except Exception as e:
        print(f"❌ Error updating document: {str(e)}")
        return False

def test_delete_document(doc_id):
    """Test 6: Delete Document"""
    print_header("TEST 6: Delete Document (Cleanup)")
    try:
        db = FirebaseDB()
        result = db.delete_document('users', doc_id)
        if result:
            print(f"✅ Test document deleted successfully!")
            return True
        else:
            print(f"❌ Document deletion failed")
            return False
    except Exception as e:
        print(f"❌ Error deleting document: {str(e)}")
        return False

def test_query_operations():
    """Test 7: Query Operations"""
    print_header("TEST 7: Query Operations")
    try:
        db = FirebaseDB()
        
        # Create test documents
        test_ids = []
        for i in range(3):
            test_id = f"query_test_{uuid.uuid4().hex[:8]}"
            db.create_document('users', test_id, {
                "name": f"Query Test User {i}",
                "phone_number": f"999000000{i}",
                "test_query": True,
                "index": i
            })
            test_ids.append(test_id)
        
        # Query documents
        results = db.list_documents('users', queries=[
            Query.equal('test_query', True)
        ])
        
        # Cleanup
        for test_id in test_ids:
            db.delete_document('users', test_id)
        
        if len(results) >= 3:
            print(f"✅ Query operations working! Found {len(results)} documents")
            return True
        else:
            print(f"⚠️  Query returned {len(results)} documents (expected at least 3)")
            return False
            
    except Exception as e:
        print(f"❌ Error in query operations: {str(e)}")
        return False

def main():
    """Run all tests"""
    print("\n" + "🔥"*30)
    print("   FIREBASE BACKEND TEST SUITE")
    print("🔥"*30)
    
    # Check environment variables
    print("\n📋 Checking Environment Configuration...")
    
    service_account_path = os.getenv('FIREBASE_SERVICE_ACCOUNT_PATH')
    service_account_json = os.getenv('FIREBASE_SERVICE_ACCOUNT_JSON')
    google_creds = os.getenv('GOOGLE_APPLICATION_CREDENTIALS')
    
    if service_account_path:
        print(f"✅ FIREBASE_SERVICE_ACCOUNT_PATH is set")
        if os.path.exists(service_account_path):
            print(f"✅ Service account file exists")
        else:
            print(f"❌ Service account file not found at: {service_account_path}")
            print(f"   Please check the path in your .env file")
            return
    elif service_account_json:
        print(f"✅ FIREBASE_SERVICE_ACCOUNT_JSON is set")
    elif google_creds:
        print(f"✅ GOOGLE_APPLICATION_CREDENTIALS is set")
    else:
        print(f"❌ No Firebase credentials found!")
        print(f"   Please set one of:")
        print(f"   - FIREBASE_SERVICE_ACCOUNT_PATH")
        print(f"   - FIREBASE_SERVICE_ACCOUNT_JSON")
        print(f"   - GOOGLE_APPLICATION_CREDENTIALS")
        return
    
    # Run tests
    tests_passed = 0
    tests_failed = 0
    
    # Test 1: Connection
    if test_firebase_connection():
        tests_passed += 1
    else:
        tests_failed += 1
        print("\n❌ Firebase connection failed. Cannot continue with other tests.")
        print_summary(tests_passed, tests_failed)
        return
    
    # Test 2-6: CRUD operations
    doc_id = test_create_document()
    if doc_id:
        tests_passed += 1
        
        if test_read_document(doc_id):
            tests_passed += 1
        else:
            tests_failed += 1
        
        if test_list_documents():
            tests_passed += 1
        else:
            tests_failed += 1
        
        if test_update_document(doc_id):
            tests_passed += 1
        else:
            tests_failed += 1
        
        if test_delete_document(doc_id):
            tests_passed += 1
        else:
            tests_failed += 1
    else:
        tests_failed += 5
        print("\n❌ Cannot proceed with remaining tests")
    
    # Test 7: Query operations
    if test_query_operations():
        tests_passed += 1
    else:
        tests_failed += 1
    
    # Summary
    print_summary(tests_passed, tests_failed)

def print_summary(passed, failed):
    """Print test summary"""
    print_header("TEST SUMMARY")
    total = passed + failed
    print(f"   Total Tests: {total}")
    print(f"   ✅ Passed: {passed}")
    print(f"   ❌ Failed: {failed}")
    
    if failed == 0:
        print("\n   🎉 ALL TESTS PASSED!")
        print("   Your Firebase backend is ready for production!")
        print("\n   Next steps:")
        print("   1. Start the backend: python app.py")
        print("   2. Test with your React Native app")
        print("   3. Deploy to production when ready")
    else:
        print("\n   ⚠️  SOME TESTS FAILED")
        print("   Please fix the issues before deploying to production")
    
    print("="*60 + "\n")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Tests interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Fatal error: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
