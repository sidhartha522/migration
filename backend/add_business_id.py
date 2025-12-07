#!/usr/bin/env python3
"""
Add missing business_id attribute to customers collection
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

print("🔧 Adding business_id attribute to customers collection...")

try:
    # Check if attribute exists
    attrs = databases.list_attributes(database_id, 'customers')
    has_business_id = any(attr['key'] == 'business_id' for attr in attrs['attributes'])
    
    if has_business_id:
        print("✅ business_id attribute already exists in customers collection")
    else:
        print("Adding business_id attribute...")
        databases.create_string_attribute(
            database_id=database_id,
            collection_id='customers',
            key='business_id',
            size=36,
            required=True
        )
        print("✅ business_id attribute added successfully!")
        print("⚠️  Note: This is async, may take a few seconds to be available")
        
except Exception as e:
    print(f"❌ Error: {str(e)}")
