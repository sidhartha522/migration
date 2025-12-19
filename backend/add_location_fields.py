#!/usr/bin/env python3
"""
Migration script to add location fields (latitude/longitude) to the Businesses collection
Run this script to add the new attributes to existing Appwrite collection
"""

import os
import sys
import time
from dotenv import load_dotenv
from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.exception import AppwriteException

# Load environment variables
load_dotenv()

def add_location_fields():
    """Add latitude and longitude fields to Businesses collection"""
    
    # Initialize Appwrite client
    client = Client()
    client.set_endpoint(os.environ.get('APPWRITE_ENDPOINT', 'https://cloud.appwrite.io/v1'))
    client.set_project(os.environ.get('APPWRITE_PROJECT_ID'))
    client.set_key(os.environ.get('APPWRITE_API_KEY'))
    
    databases = Databases(client)
    database_id = os.environ.get('APPWRITE_DATABASE_ID', 'kathape_business')
    collection_id = 'businesses'
    
    print("🚀 Adding location fields to Businesses collection...")
    
    # Add latitude attribute
    try:
        print("  Creating 'latitude' attribute...")
        databases.create_float_attribute(
            database_id=database_id,
            collection_id=collection_id,
            key='latitude',
            required=False,
            min=-90.0,
            max=90.0,
            default=None,
            array=False
        )
        print("  ✅ 'latitude' attribute created successfully!")
    except AppwriteException as e:
        if 'Attribute already exists' in str(e) or e.code == 409:
            print("  ⚠️ 'latitude' attribute already exists, skipping...")
        else:
            print(f"  ❌ Error creating 'latitude' attribute: {e}")
            return False
    
    # Wait for attribute to be ready
    time.sleep(2)
    
    # Add longitude attribute
    try:
        print("  Creating 'longitude' attribute...")
        databases.create_float_attribute(
            database_id=database_id,
            collection_id=collection_id,
            key='longitude',
            required=False,
            min=-180.0,
            max=180.0,
            default=None,
            array=False
        )
        print("  ✅ 'longitude' attribute created successfully!")
    except AppwriteException as e:
        if 'Attribute already exists' in str(e) or e.code == 409:
            print("  ⚠️ 'longitude' attribute already exists, skipping...")
        else:
            print(f"  ❌ Error creating 'longitude' attribute: {e}")
            return False
    
    print("\n✅ Location fields added successfully to Businesses collection!")
    print("   Businesses can now store latitude and longitude coordinates.")
    return True

if __name__ == "__main__":
    success = add_location_fields()
    sys.exit(0 if success else 1)
