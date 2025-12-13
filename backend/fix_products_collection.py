"""
Fix Products collection - delete existing and recreate with correct schema
"""

from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.exception import AppwriteException
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

print("Fixing Products collection...")

try:
    # Try to delete existing collection
    print("Attempting to delete existing products collection...")
    databases.delete_collection(
        database_id=database_id,
        collection_id='products'
    )
    print("✓ Deleted existing products collection")
except AppwriteException as e:
    print(f"Note: {e.message}")

try:
    # Create collection with correct schema
    print("\nCreating products collection with correct schema...")
    collection = databases.create_collection(
        database_id=database_id,
        collection_id='products',
        name='Products'
    )
    print("✓ Created products collection")
    
    # Wait a bit for collection to be ready
    import time
    time.sleep(2)
    
    # Create string attributes
    print("\nCreating attributes...")
    
    databases.create_string_attribute(
        database_id=database_id,
        collection_id='products',
        key='business_id',
        size=255,
        required=True
    )
    print("✓ business_id")
    time.sleep(1)
    
    databases.create_string_attribute(
        database_id=database_id,
        collection_id='products',
        key='name',
        size=255,
        required=True
    )
    print("✓ name")
    time.sleep(1)
    
    databases.create_string_attribute(
        database_id=database_id,
        collection_id='products',
        key='description',
        size=2000,
        required=False,
        default=''
    )
    print("✓ description")
    time.sleep(1)
    
    databases.create_string_attribute(
        database_id=database_id,
        collection_id='products',
        key='category',
        size=100,
        required=True
    )
    print("✓ category")
    time.sleep(1)
    
    databases.create_string_attribute(
        database_id=database_id,
        collection_id='products',
        key='unit',
        size=50,
        required=True
    )
    print("✓ unit")
    time.sleep(1)
    
    databases.create_string_attribute(
        database_id=database_id,
        collection_id='products',
        key='image_url',
        size=500,
        required=False,
        default=''
    )
    print("✓ image_url")
    time.sleep(1)
    
    # Create integer attributes
    databases.create_integer_attribute(
        database_id=database_id,
        collection_id='products',
        key='stock_quantity',
        required=True,
        min=0,
        max=999999
    )
    print("✓ stock_quantity")
    time.sleep(1)
    
    databases.create_integer_attribute(
        database_id=database_id,
        collection_id='products',
        key='low_stock_threshold',
        required=False,
        default=10,
        min=0,
        max=1000
    )
    print("✓ low_stock_threshold")
    time.sleep(1)
    
    # Create float attribute
    databases.create_float_attribute(
        database_id=database_id,
        collection_id='products',
        key='price',
        required=True,
        min=0,
        max=9999999
    )
    print("✓ price")
    time.sleep(1)
    
    # Create boolean attribute
    databases.create_boolean_attribute(
        database_id=database_id,
        collection_id='products',
        key='is_public',
        required=False,
        default=False
    )
    print("✓ is_public")
    time.sleep(2)
    
    # Create indexes
    print("\nCreating indexes...")
    
    databases.create_index(
        database_id=database_id,
        collection_id='products',
        key='business_id_idx',
        type='key',
        attributes=['business_id']
    )
    print("✓ business_id_idx")
    time.sleep(1)
    
    databases.create_index(
        database_id=database_id,
        collection_id='products',
        key='category_idx',
        type='key',
        attributes=['category']
    )
    print("✓ category_idx")
    time.sleep(1)
    
    databases.create_index(
        database_id=database_id,
        collection_id='products',
        key='is_public_idx',
        type='key',
        attributes=['is_public']
    )
    print("✓ is_public_idx")
    
    print("\n✅ Products collection setup complete!")
    print("\nAttributes created:")
    print("  - business_id (string, required)")
    print("  - name (string, required)")
    print("  - description (string, optional)")
    print("  - category (string, required)")
    print("  - unit (string, required)")
    print("  - image_url (string, optional)")
    print("  - stock_quantity (integer, required)")
    print("  - low_stock_threshold (integer, optional, default=10)")
    print("  - price (float, required)")
    print("  - is_public (boolean, optional, default=false)")
    
except AppwriteException as e:
    print(f"\n❌ Error: {e.message}")
    print("If collection already exists with wrong schema, delete it manually from Appwrite console first.")
