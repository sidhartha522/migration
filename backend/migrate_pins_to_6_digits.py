"""
Migration Script: Update all business PINs to 6 digits
Run this once to standardize all existing businesses to 6-digit PINs
"""

import random
from appwrite_utils import AppwriteDB

# Initialize database
appwrite_db = AppwriteDB()

def migrate_pins_to_6_digits():
    """Update all businesses with 4-digit PINs to 6-digit PINs"""
    
    print("Starting PIN migration...")
    
    try:
        # Get all businesses
        businesses = appwrite_db.list_documents('businesses')
        
        updated_count = 0
        already_6_digit = 0
        
        # businesses is already a list of documents
        for business in businesses:
            business_id = business['$id']
            current_pin = business.get('access_pin', '')
            business_name = business.get('name', 'Unknown')
            
            if not current_pin:
                print(f"⚠️  Business '{business_name}' ({business_id}) has no PIN, skipping...")
                continue
            
            # Check if PIN is already 6 digits
            if len(current_pin) == 6:
                print(f"✅ Business '{business_name}' already has 6-digit PIN: {current_pin}")
                already_6_digit += 1
                continue
            
            # Generate new 6-digit PIN
            new_pin = ''.join([str(random.randint(0, 9)) for _ in range(6)])
            
            # Update the business
            appwrite_db.update_document('businesses', business_id, {
                'access_pin': new_pin
            })
            
            print(f"✅ Updated '{business_name}': {current_pin} → {new_pin}")
            updated_count += 1
        
        print("\n" + "="*60)
        print(f"Migration Complete!")
        print(f"✅ Updated: {updated_count} businesses")
        print(f"✅ Already 6-digit: {already_6_digit} businesses")
        print(f"📊 Total: {updated_count + already_6_digit} businesses")
        print("="*60)
        
        return True
        
    except Exception as e:
        print(f"❌ Migration failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    print("\n" + "="*60)
    print("PIN MIGRATION SCRIPT")
    print("This will update all business PINs to 6 digits")
    print("="*60 + "\n")
    
    response = input("Do you want to proceed? (yes/no): ")
    
    if response.lower() in ['yes', 'y']:
        migrate_pins_to_6_digits()
    else:
        print("Migration cancelled.")
