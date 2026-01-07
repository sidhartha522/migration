import requests
import json

# Backend URL
BASE_URL = "http://127.0.0.1:5003/api"

def create_test_user():
    """Create a test user with known credentials"""
    
    print("\n🔧 Creating test user for login...")
    
    # Test user data
    test_data = {
        "phone_number": "9999999999",
        "password": "test123",
        "business_name": "Test Business",
        "business_type": "Retail",
        "city": "Mumbai",
        "state": "Maharashtra",
        "pincode": "400001"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/register", json=test_data)
        
        if response.status_code == 201:
            result = response.json()
            print("\n✅ Test user created successfully!")
            print("\n" + "="*60)
            print("📱 LOGIN CREDENTIALS:")
            print("="*60)
            print(f"Phone Number: {test_data['phone_number']}")
            print(f"Password: {test_data['password']}")
            print("="*60)
            print(f"\nUser ID: {result.get('userId')}")
            print(f"Business ID: {result.get('businessId')}")
            print(f"Access PIN: {result.get('access_pin')}")
            print("\n💡 Use these credentials to login to your React Native app!")
            
        elif response.status_code == 400:
            error = response.json()
            if "already registered" in error.get('error', '').lower():
                print("\n⚠️  User already exists!")
                print("\n" + "="*60)
                print("📱 USE THESE EXISTING CREDENTIALS:")
                print("="*60)
                print(f"Phone Number: {test_data['phone_number']}")
                print(f"Password: {test_data['password']}")
                print("="*60)
                print("\n💡 Try logging in with these credentials!")
            else:
                print(f"\n❌ Error: {error.get('error')}")
        else:
            print(f"\n❌ Unexpected response: {response.status_code}")
            print(response.text)
            
    except requests.exceptions.ConnectionError:
        print("\n❌ Error: Backend server is not running!")
        print("Start the server with: python app.py")
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")

if __name__ == "__main__":
    create_test_user()
