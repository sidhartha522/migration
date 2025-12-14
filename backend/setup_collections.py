#!/usr/bin/env python3
"""
Setup Appwrite Collections for Ekthaa Business React
"""
import os
from dotenv import load_dotenv
from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.exception import AppwriteException

# Load environment variables
load_dotenv()

# Initialize Appwrite
client = Client()
client.set_endpoint(os.getenv('APPWRITE_ENDPOINT'))
client.set_project(os.getenv('APPWRITE_PROJECT_ID'))
client.set_key(os.getenv('APPWRITE_API_KEY'))

databases = Databases(client)
database_id = os.getenv('APPWRITE_DATABASE_ID')

print(f"🚀 Setting up Appwrite collections...")
print(f"Database ID: {database_id}")

# Create database if needed
try:
    databases.get(database_id)
    print(f"✅ Database '{database_id}' exists")
except AppwriteException as e:
    if e.code == 404:
        print(f"Creating database '{database_id}'...")
        databases.create(database_id=database_id, name="Ekthaa Business")
        print("✅ Database created!")
    else:
        print(f"❌ Error: {e}")
        exit(1)

# Define collections
collections_config = {
    'users': {
        'name': 'Users',
        'attributes': [
            {'key': 'name', 'type': 'string', 'size': 255, 'required': True},
            {'key': 'phone_number', 'type': 'string', 'size': 20, 'required': True},
            {'key': 'password', 'type': 'string', 'size': 255, 'required': True},
            {'key': 'user_type', 'type': 'enum', 'elements': ['business', 'customer'], 'required': True},
            {'key': 'created_at', 'type': 'datetime', 'required': False},
        ]
    },
    'businesses': {
        'name': 'Businesses',
        'attributes': [
            {'key': 'user_id', 'type': 'string', 'size': 36, 'required': True},
            {'key': 'name', 'type': 'string', 'size': 255, 'required': True},
            {'key': 'phone_number', 'type': 'string', 'size': 20, 'required': False},
            {'key': 'description', 'type': 'string', 'size': 1000, 'required': False},
            {'key': 'access_pin', 'type': 'string', 'size': 10, 'required': True},
            {'key': 'profile_photo_url', 'type': 'string', 'size': 500, 'required': False},
            {'key': 'is_active', 'type': 'boolean', 'required': False, 'default': True},
            {'key': 'created_at', 'type': 'datetime', 'required': False},
        ]
    },
    'customers': {
        'name': 'Customers',
        'attributes': [
            {'key': 'business_id', 'type': 'string', 'size': 36, 'required': True},
            {'key': 'name', 'type': 'string', 'size': 255, 'required': True},
            {'key': 'phone_number', 'type': 'string', 'size': 20, 'required': True},
            {'key': 'created_at', 'type': 'datetime', 'required': False},
        ]
    },
    'transactions': {
        'name': 'Transactions',
        'attributes': [
            {'key': 'business_id', 'type': 'string', 'size': 36, 'required': True},
            {'key': 'customer_id', 'type': 'string', 'size': 36, 'required': True},
            {'key': 'type', 'type': 'enum', 'elements': ['credit', 'payment'], 'required': True},
            {'key': 'amount', 'type': 'double', 'required': True},
            {'key': 'notes', 'type': 'string', 'size': 1000, 'required': False},
            {'key': 'receipt_image_url', 'type': 'string', 'size': 500, 'required': False},
            {'key': 'created_at', 'type': 'datetime', 'required': False},
        ]
    },
    'recurring_transactions': {
        'name': 'Recurring Transactions',
        'attributes': [
            {'key': 'business_id', 'type': 'string', 'size': 36, 'required': True},
            {'key': 'customer_id', 'type': 'string', 'size': 36, 'required': True},
            {'key': 'transaction_type', 'type': 'enum', 'elements': ['credit', 'payment'], 'required': True},
            {'key': 'amount', 'type': 'double', 'required': True},
            {'key': 'frequency', 'type': 'enum', 'elements': ['daily', 'weekly', 'monthly'], 'required': True},
            {'key': 'next_date', 'type': 'datetime', 'required': True},
            {'key': 'is_active', 'type': 'boolean', 'required': False, 'default': True},
            {'key': 'created_at', 'type': 'datetime', 'required': False},
        ]
    }
}

# Create collections
for coll_id, config in collections_config.items():
    try:
        databases.get_collection(database_id, coll_id)
        print(f"✅ Collection '{coll_id}' already exists")
    except AppwriteException as e:
        if e.code == 404:
            print(f"Creating collection '{coll_id}'...")
            try:
                databases.create_collection(
                    database_id=database_id,
                    collection_id=coll_id,
                    name=config['name']
                )
                print(f"  ✅ Created collection '{coll_id}'")
                
                # Create attributes
                for attr in config['attributes']:
                    print(f"  Adding attribute '{attr['key']}'...")
                    try:
                        if attr['type'] == 'string':
                            databases.create_string_attribute(
                                database_id=database_id,
                                collection_id=coll_id,
                                key=attr['key'],
                                size=attr['size'],
                                required=attr['required']
                            )
                        elif attr['type'] == 'boolean':
                            databases.create_boolean_attribute(
                                database_id=database_id,
                                collection_id=coll_id,
                                key=attr['key'],
                                required=attr['required'],
                                default=attr.get('default')
                            )
                        elif attr['type'] == 'datetime':
                            databases.create_datetime_attribute(
                                database_id=database_id,
                                collection_id=coll_id,
                                key=attr['key'],
                                required=attr['required']
                            )
                        elif attr['type'] == 'double':
                            databases.create_float_attribute(
                                database_id=database_id,
                                collection_id=coll_id,
                                key=attr['key'],
                                required=attr['required']
                            )
                        elif attr['type'] == 'enum':
                            databases.create_enum_attribute(
                                database_id=database_id,
                                collection_id=coll_id,
                                key=attr['key'],
                                elements=attr['elements'],
                                required=attr['required']
                            )
                        print(f"    ✅ Added '{attr['key']}'")
                    except Exception as e:
                        print(f"    ⚠️  Warning: {str(e)}")
                        
            except Exception as e:
                print(f"  ❌ Error creating collection: {str(e)}")
        else:
            print(f"❌ Error checking collection '{coll_id}': {str(e)}")

print("\n✅ Setup complete!")
