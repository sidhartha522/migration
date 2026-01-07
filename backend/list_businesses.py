from firebase_utils import db as firebase_db

print("Fetching all businesses from Firebase...\n")

businesses = firebase_db.list_documents('businesses')

if businesses:
    print(f"Found {len(businesses)} business(es):\n")
    for i, business in enumerate(businesses, 1):
        print(f"{i}. {business.get('name', 'N/A')}")
        print(f"   Business ID: {business.get('$id', 'N/A')}")
        print(f"   Phone: {business.get('phone_number', 'N/A')}")
        print(f"   Access PIN: {business.get('access_pin', 'N/A')}")
        print(f"   Email: {business.get('email', 'N/A')}")
        print(f"   Location: {business.get('location', 'N/A')}")
        print()
else:
    print("No businesses found in Firebase")

print("\nFetching all users from Firebase...\n")

users = firebase_db.list_documents('users')

if users:
    print(f"Found {len(users)} user(s):\n")
    for i, user in enumerate(users, 1):
        print(f"{i}. User ID: {user.get('$id', 'N/A')}")
        print(f"   Phone: {user.get('phone_number', 'N/A')}")
        print(f"   Business ID: {user.get('business_id', 'N/A')}")
        print()
else:
    print("No users found in Firebase")
