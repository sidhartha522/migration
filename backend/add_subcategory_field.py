#!/usr/bin/env python3
"""
Add subcategory field to products collection in Appwrite
"""

import os
import sys
from dotenv import load_dotenv
from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.exception import AppwriteException

# Load environment variables
load_dotenv()

def add_subcategory_field():
    """Add subcategory attribute to products collection"""
    
    # Initialize Appwrite client
    client = Client()
    client.set_endpoint(os.getenv('APPWRITE_ENDPOINT'))
    client.set_project(os.getenv('APPWRITE_PROJECT_ID'))
    client.set_key(os.getenv('APPWRITE_API_KEY'))
    
    databases = Databases(client)
    database_id = os.getenv('APPWRITE_DATABASE_ID')
    collection_id = 'products'
    
    try:
        print(f"Adding 'subcategory' field to products collection...")
        
        # Add subcategory string attribute
        databases.create_string_attribute(
            database_id=database_id,
            collection_id=collection_id,
            key='subcategory',
            size=255,
            required=True,
            default=None,
            array=False
        )
        
        print("✅ Successfully added 'subcategory' field to products collection!")
        print("You can now use both 'category' and 'subcategory' fields in products.")
        
    except AppwriteException as e:
        if 'Attribute already exists' in str(e):
            print("ℹ️  'subcategory' field already exists in products collection")
        else:
            print(f"❌ Error adding subcategory field: {e}")
            sys.exit(1)
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    print("🚀 Adding subcategory field to Appwrite products collection...")
    add_subcategory_field()
