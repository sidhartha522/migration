"""
Add profile_photo_url field to businesses collection
Run this script once to add the field to Appwrite database schema
"""
import os
import sys
from dotenv import load_dotenv
from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.exception import AppwriteException

# Load environment variables
load_dotenv()

def add_profile_photo_field():
    """Add profile_photo_url attribute to businesses collection"""
    try:
        # Initialize Appwrite client
        client = Client()
        client.set_endpoint(os.environ.get('APPWRITE_ENDPOINT', 'https://cloud.appwrite.io/v1'))
        client.set_project(os.environ.get('APPWRITE_PROJECT_ID'))
        client.set_key(os.environ.get('APPWRITE_API_KEY'))
        
        databases = Databases(client)
        database_id = os.environ.get('APPWRITE_DATABASE_ID', '1234567890khatape')
        collection_id = 'businesses'
        
        print(f"Adding profile_photo_url field to {collection_id} collection...")
        
        # Add profile_photo_url attribute
        try:
            databases.create_string_attribute(
                database_id=database_id,
                collection_id=collection_id,
                key='profile_photo_url',
                size=500,
                required=False,
                default=None,
                array=False
            )
            print("✅ Successfully added profile_photo_url field!")
            print("   - Type: String")
            print("   - Size: 500 characters")
            print("   - Required: No")
            print("   - Default: None")
            
        except AppwriteException as e:
            if 'Attribute already exists' in str(e) or '409' in str(e):
                print("⚠️  Field already exists, skipping...")
            else:
                raise e
                
        print("\n✅ Database schema update complete!")
        print("You can now upload profile photos and they will be saved to the database.")
        
    except Exception as e:
        print(f"❌ Error adding field: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    print("=" * 60)
    print("Appwrite Database Schema Update")
    print("Adding profile_photo_url to businesses collection")
    print("=" * 60)
    print()
    
    add_profile_photo_field()
    
    print()
    print("=" * 60)
    print("Next steps:")
    print("1. Restart your backend server (Render will auto-deploy)")
    print("2. Upload a profile photo in the mobile app")
    print("3. Photo URL will be saved and displayed correctly")
    print("=" * 60)
