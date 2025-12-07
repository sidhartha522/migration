#!/usr/bin/env python3
"""
Check Appwrite Collection Attributes
"""
import os
from dotenv import load_dotenv
from appwrite.client import Client
from appwrite.services.databases import Databases

# Load environment variables
load_dotenv()

# Initialize Appwrite
client = Client()
client.set_endpoint(os.getenv('APPWRITE_ENDPOINT'))
client.set_project(os.getenv('APPWRITE_PROJECT_ID'))
client.set_key(os.getenv('APPWRITE_API_KEY'))

databases = Databases(client)
database_id = os.getenv('APPWRITE_DATABASE_ID')

collections = ['users', 'businesses', 'customers', 'transactions', 'recurring_transactions']

for coll_id in collections:
    print(f"\n{'='*60}")
    print(f"Collection: {coll_id}")
    print('='*60)
    try:
        collection = databases.get_collection(database_id, coll_id)
        attrs = databases.list_attributes(database_id, coll_id)
        
        if attrs['total'] > 0:
            print(f"Attributes ({attrs['total']}):")
            for attr in attrs['attributes']:
                print(f"  - {attr['key']} ({attr['type']}) {'[required]' if attr['required'] else '[optional]'}")
        else:
            print("  ⚠️  No attributes found!")
            
    except Exception as e:
        print(f"  ❌ Error: {str(e)}")
