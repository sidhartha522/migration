"""
Appwrite Database Utilities - Replacement for PostgreSQL operations
"""
import json
import logging
import os
import uuid
from datetime import datetime
from dotenv import load_dotenv
from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.query import Query
from appwrite.exception import AppwriteException

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

class AppwriteDB:
    def __init__(self):
        self._initialized = False
        self.client = None
        self.databases = None
        self.database_id = None
        self.collections = None
        # Simple in-memory cache to reduce duplicate API calls
        self._cache = {}
        self._cache_ttl = 60  # Cache for 60 seconds
        
    def _ensure_initialized(self):
        """Initialize Appwrite config when first used"""
        if not self._initialized:
            # Initialize Appwrite client with optimization
            self.client = Client()
            self.client.set_endpoint(os.environ.get('APPWRITE_ENDPOINT', 'https://cloud.appwrite.io/v1'))
            self.client.set_project(os.environ.get('APPWRITE_PROJECT_ID', 'your_project_id'))
            self.client.set_key(os.environ.get('APPWRITE_API_KEY', 'your_api_key'))
            # Add headers for better performance
            self.client.add_header('Cache-Control', 'no-cache')
            self.client.add_header('Connection', 'keep-alive')

            # Initialize Databases service
            self.databases = Databases(self.client)

            # Database and collection configuration
            self.database_id = os.environ.get('APPWRITE_DATABASE_ID', 'kathape_business')
            self.collections = {
                'users': 'users',
                'businesses': 'businesses', 
                'customers': 'customers',
                'customer_credits': 'customer_credits',
                'transactions': 'transactions',
                'recurring_transactions': 'recurring_transactions'
            }
            self._initialized = True
    
    def _get_cache_key(self, collection_name, document_id=None, query_hash=None):
        """Generate cache key"""
        if document_id:
            return f"{collection_name}:{document_id}"
        elif query_hash:
            return f"{collection_name}:query:{query_hash}"
        return None
    
    def _is_cache_valid(self, cache_key):
        """Check if cache entry is still valid"""
        if cache_key not in self._cache:
            return False
        import time
        return (time.time() - self._cache[cache_key]['timestamp']) < self._cache_ttl
    
    def _get_from_cache(self, cache_key):
        """Get data from cache"""
        if self._is_cache_valid(cache_key):
            return self._cache[cache_key]['data']
        return None
    
    def _set_cache(self, cache_key, data):
        """Set data in cache"""
        import time
        self._cache[cache_key] = {
            'data': data,
            'timestamp': time.time()
        }
        
    def create_document(self, collection_name, document_id, data):
        """Create a new document in collection"""
        try:
            self._ensure_initialized()
            result = self.databases.create_document(
                database_id=self.database_id,
                collection_id=self.collections[collection_name],
                document_id=document_id,
                data=data
            )
            return result
        except AppwriteException as e:
            logger.error(f"Appwrite create error: {e}")
            return None

    def get_document(self, collection_name, document_id):
        """Get a single document by ID with caching"""
        try:
            self._ensure_initialized()
            
            # Check cache first
            cache_key = self._get_cache_key(collection_name, document_id)
            cached_result = self._get_from_cache(cache_key)
            if cached_result is not None:
                return cached_result
            
            result = self.databases.get_document(
                database_id=self.database_id,
                collection_id=self.collections[collection_name],
                document_id=document_id
            )
            
            # Cache the result
            if result:
                self._set_cache(cache_key, result)
            return result
        except AppwriteException as e:
            logger.error(f"Appwrite get error: {e}")
            return None

    def list_documents(self, collection_name, queries=None, limit=100):
        """List documents with optional queries"""
        try:
            self._ensure_initialized()
            if queries is None:
                queries = []
            
            # Check if limit already in queries
            has_limit = any('limit' in str(q).lower() for q in queries)
            if not has_limit:
                queries.append(Query.limit(limit))
                
            result = self.databases.list_documents(
                database_id=self.database_id,
                collection_id=self.collections[collection_name],
                queries=queries
            )
            return result['documents']
        except AppwriteException as e:
            logger.error(f"Appwrite list error: {e}")
            return []

    def update_document(self, collection_name, document_id, data):
        """Update a document"""
        try:
            self._ensure_initialized()
            result = self.databases.update_document(
                database_id=self.database_id,
                collection_id=self.collections[collection_name],
                document_id=document_id,
                data=data
            )
            return result
        except AppwriteException as e:
            logger.error(f"Appwrite update error: {e}")
            return None

    def delete_document(self, collection_name, document_id):
        """Delete a document"""
        try:
            self._ensure_initialized()
            self.databases.delete_document(
                database_id=self.database_id,
                collection_id=self.collections[collection_name],
                document_id=document_id
            )
            return True
        except AppwriteException as e:
            logger.error(f"Appwrite delete error: {e}")
            return False

# Global database instance
db = AppwriteDB()
