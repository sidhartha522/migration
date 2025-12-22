from appwrite.client import Client
from appwrite.services.databases import Databases
from dotenv import load_dotenv
import os

load_dotenv()

client = Client()
client.set_endpoint(os.environ.get('APPWRITE_ENDPOINT'))
client.set_project(os.environ.get('APPWRITE_PROJECT_ID'))
client.set_key(os.environ.get('APPWRITE_API_KEY'))

databases = Databases(client)
database_id = os.environ.get('APPWRITE_DATABASE_ID', 'kathape_business')

# Get collection metadata
collection = databases.get_collection(database_id, 'businesses')

print("Businesses Collection Attributes:")
print("=" * 50)
for attr in collection['attributes']:
    required = "Required" if attr['required'] else "Optional"
    print(f"- {attr['key']} ({attr['type']}) - {required}")