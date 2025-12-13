"""
Setup script for Products collection in Appwrite
Run this to create the products collection with proper schema
"""

from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.id import ID
import os
from dotenv import load_dotenv

load_dotenv()

# Initialize Appwrite client
client = Client()
client.set_endpoint(os.getenv('APPWRITE_ENDPOINT'))
client.set_project(os.getenv('APPWRITE_PROJECT_ID'))
client.set_key(os.getenv('APPWRITE_API_KEY'))

databases = Databases(client)
database_id = os.getenv('APPWRITE_DATABASE_ID')

def create_products_collection():
    """Create products collection with all attributes"""
    
    try:
        # Create collection
        collection = databases.create_collection(
            database_id=database_id,
            collection_id='products',
            name='Products',
            permissions=[
                'read("any")',  # Anyone can read public products
                'create("users")',  # Authenticated users can create
                'update("users")',  # Authenticated users can update their own
                'delete("users")'   # Authenticated users can delete their own
            ]
        )
        
        print("✓ Created products collection")
        
        # Create attributes
        attributes = [
            {
                'key': 'business_id',
                'type': 'string',
                'size': 255,
                'required': True
            },
            {
                'key': 'name',
                'type': 'string',
                'size': 255,
                'required': True
            },
            {
                'key': 'description',
                'type': 'string',
                'size': 1000,
                'required': False,
                'default': ''
            },
            {
                'key': 'category',
                'type': 'string',
                'size': 100,
                'required': True
            },
            {
                'key': 'stock_quantity',
                'type': 'integer',
                'required': True,
                'min': 0,
                'max': 999999
            },
            {
                'key': 'unit',
                'type': 'string',
                'size': 50,
                'required': True
            },
            {
                'key': 'price',
                'type': 'float',
                'required': True,
                'min': 0,
                'max': 9999999
            },
            {
                'key': 'image_url',
                'type': 'string',
                'size': 500,
                'required': False,
                'default': ''
            },
            {
                'key': 'is_public',
                'type': 'boolean',
                'required': True,
                'default': False
            },
            {
                'key': 'low_stock_threshold',
                'type': 'integer',
                'required': False,
                'default': 10,
                'min': 0,
                'max': 1000
            }
        ]
        
        for attr in attributes:
            attr_type = attr.pop('type')
            
            if attr_type == 'string':
                databases.create_string_attribute(
                    database_id=database_id,
                    collection_id='products',
                    **attr
                )
            elif attr_type == 'integer':
                databases.create_integer_attribute(
                    database_id=database_id,
                    collection_id='products',
                    **attr
                )
            elif attr_type == 'float':
                databases.create_float_attribute(
                    database_id=database_id,
                    collection_id='products',
                    **attr
                )
            elif attr_type == 'boolean':
                databases.create_boolean_attribute(
                    database_id=database_id,
                    collection_id='products',
                    **attr
                )
            
            print(f"✓ Created attribute: {attr['key']}")
        
        # Create indexes
        print("\nCreating indexes...")
        
        databases.create_index(
            database_id=database_id,
            collection_id='products',
            key='business_id_idx',
            type='key',
            attributes=['business_id']
        )
        print("✓ Created business_id index")
        
        databases.create_index(
            database_id=database_id,
            collection_id='products',
            key='category_idx',
            type='key',
            attributes=['category']
        )
        print("✓ Created category index")
        
        databases.create_index(
            database_id=database_id,
            collection_id='products',
            key='is_public_idx',
            type='key',
            attributes=['is_public']
        )
        print("✓ Created is_public index")
        
        print("\n✅ Products collection setup complete!")
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == '__main__':
    print("Setting up Products collection...")
    create_products_collection()
