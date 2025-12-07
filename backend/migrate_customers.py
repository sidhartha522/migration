#!/usr/bin/env python3
"""
Migrate existing customers to add business_id
"""
import os
from dotenv import load_dotenv
from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.query import Query

# Load environment variables
load_dotenv()

# Initialize Appwrite
client = Client()
client.set_endpoint(os.getenv('APPWRITE_ENDPOINT'))
client.set_project(os.getenv('APPWRITE_PROJECT_ID'))
client.set_key(os.getenv('APPWRITE_API_KEY'))

databases = Databases(client)
database_id = os.getenv('APPWRITE_DATABASE_ID')

print("🔧 Migrating customers to add business_id...\n")

# Get all businesses
businesses = databases.list_documents(database_id, 'businesses')
print(f"Found {businesses['total']} businesses\n")

# Get all customers
customers = databases.list_documents(database_id, 'customers', queries=[Query.limit(500)])
print(f"Found {customers['total']} customers\n")

# Get all transactions to find customer-business relationships
transactions = databases.list_documents(database_id, 'transactions', queries=[Query.limit(500)])
print(f"Found {transactions['total']} transactions\n")

# Map customer_id to business_id from transactions
customer_business_map = {}
for txn in transactions['documents']:
    customer_id = txn.get('customer_id')
    business_id = txn.get('business_id')
    if customer_id and business_id:
        if customer_id not in customer_business_map:
            customer_business_map[customer_id] = business_id

print(f"Found {len(customer_business_map)} customer-business mappings\n")

# Update customers
updated = 0
for customer in customers['documents']:
    customer_id = customer['$id']
    existing_business_id = customer.get('business_id')
    
    if not existing_business_id and customer_id in customer_business_map:
        business_id = customer_business_map[customer_id]
        try:
            databases.update_document(
                database_id=database_id,
                collection_id='customers',
                document_id=customer_id,
                data={'business_id': business_id}
            )
            print(f"✅ Updated customer {customer.get('name')} ({customer_id[:8]}...) with business_id {business_id[:8]}...")
            updated += 1
        except Exception as e:
            print(f"❌ Error updating customer {customer_id}: {str(e)}")
    elif existing_business_id:
        print(f"⏭️  Customer {customer.get('name')} already has business_id")
    else:
        print(f"⚠️  No business_id found for customer {customer.get('name')} ({customer_id[:8]}...)")

print(f"\n✅ Migration complete! Updated {updated} customers")
