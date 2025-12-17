"""
Script to add missing attributes to the Businesses collection in Appwrite
Run this once to add all required fields for the profile page
"""
import os
from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.exception import AppwriteException
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Appwrite client
client = Client()
client.set_endpoint(os.getenv('APPWRITE_ENDPOINT'))
client.set_project(os.getenv('APPWRITE_PROJECT_ID'))
client.set_key(os.getenv('APPWRITE_API_KEY'))

databases = Databases(client)

DATABASE_ID = os.getenv('APPWRITE_DATABASE_ID')
COLLECTION_ID = os.getenv('APPWRITE_COLLECTION_BUSINESSES', 'businesses')

# Define all attributes to add
attributes = [
    # Basic Information
    {'key': 'name', 'type': 'string', 'size': 255, 'required': False},
    {'key': 'phone', 'type': 'string', 'size': 10, 'required': False},
    {'key': 'email', 'type': 'string', 'size': 255, 'required': False},
    {'key': 'gst_number', 'type': 'string', 'size': 20, 'required': False},
    {'key': 'description', 'type': 'string', 'size': 2000, 'required': False},
    
    # Location
    {'key': 'location', 'type': 'string', 'size': 255, 'required': False},
    {'key': 'address', 'type': 'string', 'size': 500, 'required': False},
    {'key': 'city', 'type': 'string', 'size': 100, 'required': False},
    {'key': 'state', 'type': 'string', 'size': 100, 'required': False},
    {'key': 'pincode', 'type': 'string', 'size': 6, 'required': False},
    
    # Business Type
    {'key': 'category', 'type': 'string', 'size': 100, 'required': False},
    {'key': 'subcategory', 'type': 'string', 'size': 100, 'required': False},
    {'key': 'business_type', 'type': 'string', 'size': 100, 'required': False},
    {'key': 'custom_business_type', 'type': 'string', 'size': 100, 'required': False},
    
    # Social Media
    {'key': 'website', 'type': 'string', 'size': 255, 'required': False},
    {'key': 'facebook', 'type': 'string', 'size': 255, 'required': False},
    {'key': 'instagram', 'type': 'string', 'size': 255, 'required': False},
    {'key': 'twitter', 'type': 'string', 'size': 255, 'required': False},
    {'key': 'linkedin', 'type': 'string', 'size': 255, 'required': False},
    
    # Operating Hours
    {'key': 'operating_hours_from', 'type': 'string', 'size': 10, 'required': False},
    {'key': 'operating_hours_to', 'type': 'string', 'size': 10, 'required': False},
    {'key': 'operating_days', 'type': 'string', 'size': 500, 'required': False, 'array': True},
    {'key': 'keywords', 'type': 'string', 'size': 100, 'required': False, 'array': True},
]

def add_attributes():
    """Add all attributes to the Businesses collection"""
    print(f"Adding attributes to Businesses collection (ID: {COLLECTION_ID})...")
    print(f"Database ID: {DATABASE_ID}\n")
    
    success_count = 0
    skip_count = 0
    error_count = 0
    
    for attr in attributes:
        try:
            key = attr['key']
            attr_type = attr['type']
            size = attr['size']
            required = attr['required']
            is_array = attr.get('array', False)
            
            print(f"Creating attribute: {key} ({attr_type}, size: {size}, array: {is_array})...", end=' ')
            
            if is_array:
                databases.create_string_attribute(
                    database_id=DATABASE_ID,
                    collection_id=COLLECTION_ID,
                    key=key,
                    size=size,
                    required=required,
                    array=True
                )
            else:
                databases.create_string_attribute(
                    database_id=DATABASE_ID,
                    collection_id=COLLECTION_ID,
                    key=key,
                    size=size,
                    required=required
                )
            
            print("✓ Created")
            success_count += 1
            
        except AppwriteException as e:
            if 'Attribute already exists' in str(e) or 'already exists' in str(e):
                print("⊘ Already exists")
                skip_count += 1
            else:
                print(f"✗ Error: {e}")
                error_count += 1
        except Exception as e:
            print(f"✗ Error: {e}")
            error_count += 1
    
    print(f"\n{'='*60}")
    print(f"Summary:")
    print(f"  ✓ Successfully created: {success_count}")
    print(f"  ⊘ Already existed: {skip_count}")
    print(f"  ✗ Errors: {error_count}")
    print(f"{'='*60}")
    
    if error_count == 0:
        print("\n✓ All attributes are now available in the Businesses collection!")
        print("You can now update your business profile with all fields.")
    else:
        print("\n⚠ Some attributes could not be created. Please check the errors above.")

if __name__ == '__main__':
    add_attributes()
