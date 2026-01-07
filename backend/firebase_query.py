"""
Firebase Query Builder - Compatible with Appwrite Query API
This module provides a Query class similar to Appwrite's Query for backwards compatibility
"""

class Query:
    """Query builder for Firebase queries (Appwrite-compatible)"""
    
    @staticmethod
    def equal(attribute, value):
        """Query for documents where attribute equals value"""
        return {'type': 'equal', 'attribute': attribute, 'value': value}
    
    @staticmethod
    def notEqual(attribute, value):
        """Query for documents where attribute does not equal value"""
        return {'type': 'notEqual', 'attribute': attribute, 'value': value}
    
    @staticmethod
    def lessThan(attribute, value):
        """Query for documents where attribute is less than value"""
        return {'type': 'lessThan', 'attribute': attribute, 'value': value}
    
    @staticmethod
    def lessThanEqual(attribute, value):
        """Query for documents where attribute is less than or equal to value"""
        return {'type': 'lessThanEqual', 'attribute': attribute, 'value': value}
    
    @staticmethod
    def greaterThan(attribute, value):
        """Query for documents where attribute is greater than value"""
        return {'type': 'greaterThan', 'attribute': attribute, 'value': value}
    
    @staticmethod
    def greaterThanEqual(attribute, value):
        """Query for documents where attribute is greater than or equal to value"""
        return {'type': 'greaterThanEqual', 'attribute': attribute, 'value': value}
    
    @staticmethod
    def search(attribute, value):
        """Search for documents (limited support in Firestore)"""
        return {'type': 'search', 'attribute': attribute, 'value': value}
    
    @staticmethod
    def isNull(attribute):
        """Query for documents where attribute is null"""
        return {'type': 'isNull', 'attribute': attribute}
    
    @staticmethod
    def isNotNull(attribute):
        """Query for documents where attribute is not null"""
        return {'type': 'isNotNull', 'attribute': attribute}
    
    @staticmethod
    def between(attribute, start, end):
        """Query for documents where attribute is between start and end"""
        return {'type': 'between', 'attribute': attribute, 'start': start, 'end': end}
    
    @staticmethod
    def startsWith(attribute, value):
        """Query for documents where attribute starts with value"""
        return {'type': 'startsWith', 'attribute': attribute, 'value': value}
    
    @staticmethod
    def endsWith(attribute, value):
        """Query for documents where attribute ends with value"""
        return {'type': 'endsWith', 'attribute': attribute, 'value': value}
    
    @staticmethod
    def select(attributes):
        """Select specific attributes to return"""
        return {'type': 'select', 'attributes': attributes}
    
    @staticmethod
    def orderDesc(attribute):
        """Order results by attribute in descending order"""
        return {'type': 'orderDesc', 'attribute': attribute}
    
    @staticmethod
    def order_desc(attribute):
        """Order results by attribute in descending order (alias)"""
        return {'type': 'orderDesc', 'attribute': attribute}
    
    @staticmethod
    def orderAsc(attribute):
        """Order results by attribute in ascending order"""
        return {'type': 'orderAsc', 'attribute': attribute}
    
    @staticmethod
    def order_asc(attribute):
        """Order results by attribute in ascending order (alias)"""
        return {'type': 'orderAsc', 'attribute': attribute}
    
    @staticmethod
    def limit(value):
        """Limit the number of results"""
        return {'type': 'limit', 'value': value}
    
    @staticmethod
    def offset(value):
        """Offset the results"""
        return {'type': 'offset', 'value': value}
    
    @staticmethod
    def cursorAfter(documentId):
        """Cursor for pagination"""
        return {'type': 'cursorAfter', 'documentId': documentId}
    
    @staticmethod
    def cursorBefore(documentId):
        """Cursor for pagination"""
        return {'type': 'cursorBefore', 'documentId': documentId}
