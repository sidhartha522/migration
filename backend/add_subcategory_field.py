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
    
    print(f"Checking and adding required fields to products collection...")
    
    # Add subcategory string attribute
    try:
        databases.create_string_attribute(
            database_id=database_id,
            collection_id=collection_id,
            key='subcategory',
            size=255,
            required=True,
            default=None,
            array=False
        )
        print("✅ Added 'subcategory' field")
    except AppwriteException as e:
        if 'already exists' in str(e):
            print("ℹ️  'subcategory' field already exists")
        else:
            print(f"❌ Error adding subcategory: {e}")
            sys.exit(1)
    
    # Add product_image_url string attribute
    try:
        databases.create_string_attribute(
            database_id=database_id,
            collection_id=collection_id,
            key='product_image_url',
            size=500,
            required=False,
            default=None,
            array=False
        )
        print("✅ Added 'product_image_url' field")
    except AppwriteException as e:
        if 'already exists' in str(e):
            print("ℹ️  'product_image_url' field already exists")
        else:
            print(f"❌ Error adding product_image_url: {e}")
            sys.exit(1)
    
    print("\n✅ All required fields are now available in products collection!")
    print("You can now use: category, subcategory, and product_image_url fields.")

if __name__ == "__main__":
    print("🚀 Setting up required fields in Appwrite products collection...")
    add_subcategory_field()
