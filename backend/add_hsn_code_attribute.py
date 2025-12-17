"""
Script to add HSN code attribute to Products collection in Appwrite
"""
import os
from dotenv import load_dotenv
from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.exception import AppwriteException

# Load environment variables
load_dotenv()

def add_hsn_code_attribute():
    """Add hsn_code attribute to products collection"""
    try:
        # Initialize Appwrite client
        client = Client()
        client.set_endpoint(os.environ.get('APPWRITE_ENDPOINT', 'https://cloud.appwrite.io/v1'))
        client.set_project(os.environ.get('APPWRITE_PROJECT_ID'))
        client.set_key(os.environ.get('APPWRITE_API_KEY'))
        
        databases = Databases(client)
        database_id = os.environ.get('APPWRITE_DATABASE_ID', 'kathape_business')
        
        print("Adding HSN code attribute to Products collection...")
        
        # Add hsn_code attribute (string, not required)
        try:
            databases.create_string_attribute(
                database_id=database_id,
                collection_id='products',
                key='hsn_code',
                size=20,
                required=False,
                default='',
                array=False
            )
            print("✓ Successfully added hsn_code attribute")
        except AppwriteException as e:
            if 'already exists' in str(e).lower() or 'attribute_already_exists' in str(e).lower():
                print("⊘ hsn_code attribute already exists")
            else:
                print(f"✗ Error adding hsn_code: {str(e)}")
        
        print("\n✅ HSN code attribute setup complete!")
        
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False
    
    return True

if __name__ == "__main__":
    add_hsn_code_attribute()
