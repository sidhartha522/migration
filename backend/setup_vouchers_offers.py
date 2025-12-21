"""
Script to create vouchers and offers collections in Appwrite
Run this script after setting up environment variables
"""
import os
from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.exception import AppwriteException
from dotenv import load_dotenv

load_dotenv()

# Initialize Appwrite client
client = Client()
client.set_endpoint(os.environ.get('APPWRITE_ENDPOINT', 'https://cloud.appwrite.io/v1'))
client.set_project(os.environ.get('APPWRITE_PROJECT_ID'))
client.set_key(os.environ.get('APPWRITE_API_KEY'))

databases = Databases(client)
database_id = os.environ.get('APPWRITE_DATABASE_ID', 'kathape_business')

def create_vouchers_collection():
    """Create vouchers collection with attributes"""
    try:
        # Create collection
        collection = databases.create_collection(
            database_id=database_id,
            collection_id='vouchers',
            name='Vouchers'
        )
        print("✓ Created vouchers collection")
        
        # Add attributes
        databases.create_string_attribute(
            database_id=database_id,
            collection_id='vouchers',
            key='business_id',
            size=255,
            required=True
        )
        print("✓ Added business_id attribute")
        
        databases.create_string_attribute(
            database_id=database_id,
            collection_id='vouchers',
            key='code',
            size=50,
            required=True
        )
        print("✓ Added code attribute")
        
        databases.create_float_attribute(
            database_id=database_id,
            collection_id='vouchers',
            key='discount',
            required=True
        )
        print("✓ Added discount attribute")
        
        databases.create_float_attribute(
            database_id=database_id,
            collection_id='vouchers',
            key='min_amount',
            required=False,
            default=0
        )
        print("✓ Added min_amount attribute")
        
        databases.create_float_attribute(
            database_id=database_id,
            collection_id='vouchers',
            key='max_discount',
            required=False,
            default=0
        )
        print("✓ Added max_discount attribute")
        
        databases.create_string_attribute(
            database_id=database_id,
            collection_id='vouchers',
            key='valid_until',
            size=50,
            required=True
        )
        print("✓ Added valid_until attribute")
        
        databases.create_string_attribute(
            database_id=database_id,
            collection_id='vouchers',
            key='description',
            size=500,
            required=False,
            default=''
        )
        print("✓ Added description attribute")
        
        databases.create_boolean_attribute(
            database_id=database_id,
            collection_id='vouchers',
            key='is_active',
            required=True,
            default=True
        )
        print("✓ Added is_active attribute")
        
        databases.create_string_attribute(
            database_id=database_id,
            collection_id='vouchers',
            key='created_at',
            size=50,
            required=True
        )
        print("✓ Added created_at attribute")
        
        # Create indexes
        databases.create_index(
            database_id=database_id,
            collection_id='vouchers',
            key='business_id_index',
            type='key',
            attributes=['business_id']
        )
        print("✓ Created business_id index")
        
        databases.create_index(
            database_id=database_id,
            collection_id='vouchers',
            key='code_index',
            type='key',
            attributes=['code']
        )
        print("✓ Created code index")
        
        print("\n✅ Vouchers collection created successfully!")
        
    except AppwriteException as e:
        print(f"❌ Error creating vouchers collection: {e}")

def create_offers_collection():
    """Create offers collection with attributes"""
    try:
        # Create collection
        collection = databases.create_collection(
            database_id=database_id,
            collection_id='offers',
            name='Offers'
        )
        print("\n✓ Created offers collection")
        
        # Add attributes
        databases.create_string_attribute(
            database_id=database_id,
            collection_id='offers',
            key='business_id',
            size=255,
            required=True
        )
        print("✓ Added business_id attribute")
        
        databases.create_string_attribute(
            database_id=database_id,
            collection_id='offers',
            key='title',
            size=200,
            required=True
        )
        print("✓ Added title attribute")
        
        databases.create_string_attribute(
            database_id=database_id,
            collection_id='offers',
            key='description',
            size=1000,
            required=True
        )
        print("✓ Added description attribute")
        
        databases.create_float_attribute(
            database_id=database_id,
            collection_id='offers',
            key='discount',
            required=True
        )
        print("✓ Added discount attribute")
        
        databases.create_string_attribute(
            database_id=database_id,
            collection_id='offers',
            key='valid_from',
            size=50,
            required=True
        )
        print("✓ Added valid_from attribute")
        
        databases.create_string_attribute(
            database_id=database_id,
            collection_id='offers',
            key='valid_until',
            size=50,
            required=True
        )
        print("✓ Added valid_until attribute")
        
        databases.create_string_attribute(
            database_id=database_id,
            collection_id='offers',
            key='image_url',
            size=500,
            required=False,
            default=''
        )
        print("✓ Added image_url attribute")
        
        databases.create_boolean_attribute(
            database_id=database_id,
            collection_id='offers',
            key='is_active',
            required=True,
            default=True
        )
        print("✓ Added is_active attribute")
        
        databases.create_string_attribute(
            database_id=database_id,
            collection_id='offers',
            key='created_at',
            size=50,
            required=True
        )
        print("✓ Added created_at attribute")
        
        # Create index
        databases.create_index(
            database_id=database_id,
            collection_id='offers',
            key='business_id_index',
            type='key',
            attributes=['business_id']
        )
        print("✓ Created business_id index")
        
        print("\n✅ Offers collection created successfully!")
        
    except AppwriteException as e:
        print(f"❌ Error creating offers collection: {e}")

if __name__ == "__main__":
    print("🚀 Setting up Vouchers and Offers collections in Appwrite...\n")
    
    create_vouchers_collection()
    create_offers_collection()
    
    print("\n✨ Setup complete! You can now create vouchers and offers.")
    print("\nNext steps:")
    print("1. Restart the backend server")
    print("2. Test creating vouchers and offers from the frontend")
