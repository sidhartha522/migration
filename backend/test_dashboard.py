import requests
import json

# Login first
login_response = requests.post('http://localhost:5003/api/auth/login', json={
    'phone': '9705562341',
    'password': 'sid123'
})

print("Login Response:")
print(json.dumps(login_response.json(), indent=2))

if login_response.status_code == 200:
    token = login_response.json().get('token')
    
    # Get dashboard
    dashboard_response = requests.get(
        'http://localhost:5003/api/dashboard',
        headers={'Authorization': f'Bearer {token}'}
    )
    
    print("\nDashboard Response:")
    print(json.dumps(dashboard_response.json(), indent=2))
    
    # Get customers
    customers_response = requests.get(
        'http://localhost:5003/api/customers',
        headers={'Authorization': f'Bearer {token}'}
    )
    
    print("\nCustomers Response:")
    print(json.dumps(customers_response.json(), indent=2))
