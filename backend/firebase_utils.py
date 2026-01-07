"""
Firebase Database Utilities - Replacement for Appwrite operations
"""
import json
import logging
import os
import uuid
from datetime import datetime
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, firestore, auth
from google.cloud.firestore_v1.base_query import FieldFilter

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

class FirebaseDB:
    def __init__(self):
        self._initialized = False
        self.db = None
        self.collections = None
        # Simple in-memory cache to reduce duplicate API calls
        self._cache = {}
        self._cache_ttl = 60  # Cache for 60 seconds
        
    def _ensure_initialized(self):
        """Initialize Firebase config when first used"""
        if not self._initialized:
            # Check if already initialized
            if not firebase_admin._apps:
                # Initialize Firebase Admin SDK
                # Try to load from service account file or credentials JSON
                cred_path = os.environ.get('FIREBASE_SERVICE_ACCOUNT_PATH')
                
                if cred_path and os.path.exists(cred_path):
                    # Use service account file
                    cred = credentials.Certificate(cred_path)
                else:
                    # Use credentials from environment variable (for deployment)
                    cred_json = os.environ.get('FIREBASE_SERVICE_ACCOUNT_JSON')
                    if cred_json:
                        cred_dict = json.loads(cred_json)
                        cred = credentials.Certificate(cred_dict)
                    else:
                        # Default initialization (uses GOOGLE_APPLICATION_CREDENTIALS env var)
                        cred = credentials.ApplicationDefault()
                
                firebase_admin.initialize_app(cred)
            
            # Get Firestore client
            self.db = firestore.client()
            
            # Collection names mapping
            self.collections = {
                'users': 'users',
                'businesses': 'businesses', 
                'customers': 'customers',
                'customer_credits': 'customer_credits',
                'transactions': 'transactions',
                'recurring_transactions': 'recurring_transactions',
                'products': 'products',
                'vouchers': 'vouchers',
                'offers': 'offers'
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
    
    def _doc_to_dict(self, doc):
        """Convert Firestore document to dictionary with $id field"""
        if not doc.exists:
            return None
        data = doc.to_dict()
        data['$id'] = doc.id
        return data
        
    def create_document(self, collection_name, document_id, data):
        """Create a new document in collection"""
        try:
            self._ensure_initialized()
            collection_ref = self.db.collection(self.collections[collection_name])
            
            # Add timestamp if not present
            if 'created_at' not in data:
                data['created_at'] = datetime.now().isoformat()
            
            # Set document with specific ID
            doc_ref = collection_ref.document(document_id)
            doc_ref.set(data)
            
            # Return document with $id field for compatibility
            result = data.copy()
            result['$id'] = document_id
            return result
            
        except Exception as e:
            logger.error(f"Firebase create error: {e}")
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
            
            doc_ref = self.db.collection(self.collections[collection_name]).document(document_id)
            doc = doc_ref.get()
            
            result = self._doc_to_dict(doc)
            
            # Cache the result
            if result:
                self._set_cache(cache_key, result)
            return result
            
        except Exception as e:
            logger.error(f"Firebase get error: {e}")
            return None

    def list_documents(self, collection_name, queries=None, limit=5000):
        """
        List documents with optional queries
        queries should be a list of Query objects (for Appwrite compatibility)
        """
        try:
            self._ensure_initialized()
            collection_ref = self.db.collection(self.collections[collection_name])
            query = collection_ref
            
            # Parse Appwrite-style queries and convert to Firestore
            if queries:
                for q in queries:
                    query = self._parse_query(query, q)
            
            # Apply limit
            query = query.limit(limit)
            
            # Execute query
            docs = query.stream()
            
            # Convert to list of dicts with $id field
            results = []
            for doc in docs:
                doc_dict = self._doc_to_dict(doc)
                if doc_dict:
                    results.append(doc_dict)
            
            return results
            
        except Exception as e:
            logger.error(f"Firebase list error: {e}")
            return []
    
    def _parse_query(self, query, appwrite_query):
        """
        Parse Appwrite Query object and apply to Firestore query
        This handles common Appwrite query patterns
        """
        # Handle dictionary-based queries (from firebase_query.Query)
        if isinstance(appwrite_query, dict):
            query_type = appwrite_query.get('type')
            
            if query_type == 'equal':
                field = appwrite_query['attribute']
                value = appwrite_query['value']
                query = query.where(filter=FieldFilter(field, '==', value))
            
            elif query_type == 'notEqual':
                field = appwrite_query['attribute']
                value = appwrite_query['value']
                query = query.where(filter=FieldFilter(field, '!=', value))
            
            elif query_type == 'lessThan':
                field = appwrite_query['attribute']
                value = appwrite_query['value']
                query = query.where(filter=FieldFilter(field, '<', value))
            
            elif query_type == 'lessThanEqual':
                field = appwrite_query['attribute']
                value = appwrite_query['value']
                query = query.where(filter=FieldFilter(field, '<=', value))
            
            elif query_type == 'greaterThan':
                field = appwrite_query['attribute']
                value = appwrite_query['value']
                query = query.where(filter=FieldFilter(field, '>', value))
            
            elif query_type == 'greaterThanEqual':
                field = appwrite_query['attribute']
                value = appwrite_query['value']
                query = query.where(filter=FieldFilter(field, '>=', value))
            
            elif query_type == 'orderDesc':
                field = appwrite_query['attribute']
                query = query.order_by(field, direction=firestore.Query.DESCENDING)
            
            elif query_type == 'orderAsc':
                field = appwrite_query['attribute']
                query = query.order_by(field, direction=firestore.Query.ASCENDING)
            
            elif query_type == 'limit':
                # Limit is handled separately in list_documents
                pass
            
            elif query_type == 'startsWith':
                # Firestore range query for string prefix
                field = appwrite_query['attribute']
                value = appwrite_query['value']
                query = query.where(filter=FieldFilter(field, '>=', value))
                query = query.where(filter=FieldFilter(field, '<', value + '\uf8ff'))
            
            elif query_type == 'isNull':
                field = appwrite_query['attribute']
                query = query.where(filter=FieldFilter(field, '==', None))
            
            elif query_type == 'isNotNull':
                field = appwrite_query['attribute']
                query = query.where(filter=FieldFilter(field, '!=', None))
        
        return query

    def update_document(self, collection_name, document_id, data):
        """Update a document"""
        try:
            self._ensure_initialized()
            doc_ref = self.db.collection(self.collections[collection_name]).document(document_id)
            
            # Add updated_at timestamp
            data['updated_at'] = datetime.now().isoformat()
            
            doc_ref.update(data)
            
            # Return updated document with $id field
            result = data.copy()
            result['$id'] = document_id
            return result
            
        except Exception as e:
            logger.error(f"Firebase update error: {e}")
            return None

    def delete_document(self, collection_name, document_id):
        """Delete a document"""
        try:
            self._ensure_initialized()
            doc_ref = self.db.collection(self.collections[collection_name]).document(document_id)
            doc_ref.delete()
            return True
            
        except Exception as e:
            logger.error(f"Firebase delete error: {e}")
            return False
    
    def batch_write(self, operations):
        """
        Perform batch write operations
        operations: list of tuples (operation_type, collection_name, document_id, data)
        operation_type: 'create', 'update', 'delete'
        """
        try:
            self._ensure_initialized()
            batch = self.db.batch()
            
            for op_type, collection_name, document_id, data in operations:
                doc_ref = self.db.collection(self.collections[collection_name]).document(document_id)
                
                if op_type == 'create':
                    batch.set(doc_ref, data)
                elif op_type == 'update':
                    batch.update(doc_ref, data)
                elif op_type == 'delete':
                    batch.delete(doc_ref)
            
            batch.commit()
            return True
            
        except Exception as e:
            logger.error(f"Firebase batch write error: {e}")
            return False
    
    def query_documents(self, collection_name, field, operator, value, limit=100):
        """
        Simple query helper for common filtering operations
        operator: '==', '>', '<', '>=', '<=', '!=', 'in', 'not-in', 'array-contains'
        """
        try:
            self._ensure_initialized()
            query = self.db.collection(self.collections[collection_name])
            query = query.where(filter=FieldFilter(field, operator, value))
            query = query.limit(limit)
            
            docs = query.stream()
            results = []
            for doc in docs:
                doc_dict = self._doc_to_dict(doc)
                if doc_dict:
                    results.append(doc_dict)
            
            return results
            
        except Exception as e:
            logger.error(f"Firebase query error: {e}")
            return []

# Global database instance
db = FirebaseDB()
