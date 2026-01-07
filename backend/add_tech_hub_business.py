import os
import sys
from datetime import datetime
from firebase_utils import db as firebase_db

def add_tech_hub_business():
    """Add The Tech Hub Cafe business to Firebase"""
    
    print("Adding The Tech Hub Cafe business...")
    
    business_data = {
        "name": "The Tech Hub Cafe",
        "description": "A premium co-working space and artisanal coffee shop designed for startup founders and students.",
        "business_type": "Food & Beverage",
        "address": "123 Innovation Drive, Sector 5",
        "city": "Hyderabad",
        "state": "Telangana",
        "pincode": "500081",
        "access_pin": "8822",
        "is_active": True,
        "phone_number": "+919876543210",
        "email": "contact@techhubcafe.com",
        "gst_number": "36AAAAA0000A1Z5",
        "location": "Madhapur, Hyderabad",
        "category": "Cafe",
        "subcategory": "Co-working space",
        "custom_business_type": "Hybrid Retail",
        "website": "https://techhubcafe.com",
        "facebook": "https://facebook.com/techhubcafe",
        "instagram": "https://instagram.com/techhubcafe",
        "twitter": "https://twitter.com/techhubcafe",
        "linkedin": "https://linkedin.com/company/techhubcafe",
        "operating_hours_from": "08:00 AM",
        "operating_hours_to": "10:00 PM",
        "operating_days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        "keywords": ["coffee", "startup", "wifi", "workspace", "community"],
        "phone": "9876543210",
        "latitude": 17.4483,
        "longitude": 78.3915,
        "location_updated_at": "2026-01-07T09:30:00Z",
        "tagline": "Fueling the next generation of builders.",
        "profile_photo_url": "https://storage.googleapis.com/ekthaa-bucket/profiles/bus_7890abc123.jpg",
        "created_at": "2026-01-07T10:00:00Z",
        "updated_at": "2026-01-07T10:00:00Z"
    }
    
    try:
        # Generate a unique business ID
        business_id = f"bus_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        # Create the business document
        result = firebase_db.create_document(
            collection_name='businesses',
            document_id=business_id,
            data=business_data
        )
        
        print(f"✅ Business created successfully!")
        print(f"Business ID: {result['$id']}")
        print(f"Name: {result['name']}")
        print(f"Location: {result['location']}")
        print(f"Access PIN: {result['access_pin']}")
        print(f"\nBusiness Details:")
        print(f"  - Category: {result['category']}")
        print(f"  - Type: {result['business_type']}")
        print(f"  - Email: {result['email']}")
        print(f"  - Phone: {result['phone_number']}")
        print(f"  - Website: {result['website']}")
        print(f"  - Operating Hours: {result['operating_hours_from']} - {result['operating_hours_to']}")
        print(f"  - Operating Days: {', '.join(result['operating_days'])}")
        print(f"  - Keywords: {', '.join(result['keywords'])}")
        print(f"  - Coordinates: ({result['latitude']}, {result['longitude']})")
        
        return result
        
    except Exception as e:
        print(f"❌ Error creating business: {str(e)}")
        import traceback
        traceback.print_exc()
        return None

if __name__ == "__main__":
    result = add_tech_hub_business()
    if result:
        print("\n🎉 The Tech Hub Cafe has been added to your Firebase database!")
    else:
        print("\n⚠️ Failed to add business. Please check the error above.")
