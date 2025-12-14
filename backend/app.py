"""
Ekthaa Business - Backend API Server
RESTful API for React frontend
Handles all business operations including customers, transactions, recurring transactions
"""
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from appwrite_utils import AppwriteDB
from appwrite.query import Query
import os
import uuid
import logging
from functools import wraps
from werkzeug.utils import secure_filename
import jwt
from datetime import datetime, timedelta
import qrcode
from io import BytesIO
import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Appwrite
appwrite_db = AppwriteDB()

# Initialize Cloudinary
cloudinary.config(
    cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
    api_key=os.getenv('CLOUDINARY_API_KEY'),
    api_secret=os.getenv('CLOUDINARY_API_SECRET'),
    secure=True
)

# File upload configuration
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
MAX_FILE_SIZE = 16 * 1024 * 1024  # 16MB

def allowed_file(filename):
    """Check if the uploaded file has an allowed extension"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Create Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'jwt-secret-key-change-in-production')
app.config['MAX_CONTENT_LENGTH'] = MAX_FILE_SIZE

# Enable CORS - Allow localhost and mobile device access
CORS(app, resources={
    r"/api/*": {
        "origins": "*",  # Allow all origins for mobile access
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": False  # Must be False when using wildcard origins
    }
})

# JWT token helper functions
def create_access_token(user_id, user_type, business_id=None):
    """Create JWT access token"""
    payload = {
        'user_id': user_id,
        'user_type': user_type,
        'business_id': business_id,
        'exp': datetime.now() + timedelta(days=7)  # Token expires in 7 days
    }
    return jwt.encode(payload, app.config['JWT_SECRET_KEY'], algorithm='HS256')

def decode_token(token):
    """Decode JWT token"""
    try:
        payload = jwt.decode(token, app.config['JWT_SECRET_KEY'], algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

# Authentication decorator
def token_required(f):
    """Decorator to require valid JWT token"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Get token from Authorization header
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(' ')[1]  # Bearer <token>
            except IndexError:
                return jsonify({'error': 'Invalid token format'}), 401
        
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        
        # Decode token
        payload = decode_token(token)
        if not payload:
            return jsonify({'error': 'Token is invalid or expired'}), 401
        
        # Add user info to request
        request.user_id = payload['user_id']
        request.user_type = payload['user_type']
        request.business_id = payload.get('business_id')
        
        return f(*args, **kwargs)
    
    return decorated

def business_required(f):
    """Decorator to require business user type"""
    @wraps(f)
    def decorated(*args, **kwargs):
        if request.user_type != 'business':
            return jsonify({'error': 'Access denied. Business account required.'}), 403
        return f(*args, **kwargs)
    
    return decorated

# Health check
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'Ekthaa Business API',
        'timestamp': datetime.utcnow().isoformat()
    }), 200

# ========== Authentication Endpoints ==========

@app.route('/api/auth/register', methods=['POST'])
def register():
    """Register new business user"""
    try:
        data = request.get_json()
        business_name = data.get('business_name', '').strip()
        phone = data.get('phone', '').strip()
        password = data.get('password')
        
        if not business_name or not phone or not password:
            return jsonify({'error': 'Business name, phone number and password are required'}), 400
        
        # Validate phone number
        if not phone.isdigit() or len(phone) != 10:
            return jsonify({'error': 'Phone number must be exactly 10 digits'}), 400
        
        # Check if user already exists
        existing_users = appwrite_db.list_documents('users', [
            Query.equal('phone_number', phone)
        ])
        
        if existing_users:
            return jsonify({'error': 'Phone number already registered'}), 400
        
        # Create user
        user_id = str(uuid.uuid4())
        from werkzeug.security import generate_password_hash
        
        user_data = {
            'name': business_name,
            'phone_number': phone,
            'password': generate_password_hash(password),
            'user_type': 'business',
            'created_at': datetime.now().isoformat()
        }
        
        user = appwrite_db.create_document('users', user_id, user_data)
        
        # Generate business PIN (6-digit unique PIN)
        import random
        business_pin = ''.join([str(random.randint(0, 9)) for _ in range(6)])
        
        # Create business profile
        business_id = str(uuid.uuid4())
        business_data = {
            'user_id': user_id,
            'name': business_name,
            'phone_number': phone,
            'access_pin': business_pin,
            'is_active': True,
            'created_at': datetime.now().isoformat()
        }
        
        business = appwrite_db.create_document('businesses', business_id, business_data)
        
        # Create access token
        token = create_access_token(user_id, 'business', business_id)
        
        return jsonify({
            'message': 'Registration successful',
            'token': token,
            'user': {
                'id': user_id,
                'phone': phone,
                'user_type': 'business',
                'business_id': business_id,
                'business_name': business_name,
                'business_pin': business.get('access_pin')
            }
        }), 201
        
    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        return jsonify({'error': f'Registration failed: {str(e)}'}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    """Login business user"""
    try:
        data = request.get_json()
        phone = data.get('phone')
        password = data.get('password')
        
        if not phone or not password:
            return jsonify({'error': 'Phone number and password are required'}), 400
        
        # Find user
        users = appwrite_db.list_documents('users', [
            Query.equal('phone_number', phone),
            Query.equal('user_type', 'business')
        ])
        
        if not users:
            return jsonify({'error': 'Invalid phone number or password'}), 401
        
        user = users[0]
        
        # Verify password - handle both plain text (legacy) and hashed passwords
        stored_password = user.get('password', '')
        password_valid = False
        
        # Check if password is hashed (bcrypt starts with $2b$, werkzeug starts with pbkdf2 or scrypt)
        if stored_password.startswith('$') or stored_password.startswith('pbkdf2:') or stored_password.startswith('scrypt:'):
            # Try hashed password verification
            from werkzeug.security import check_password_hash
            try:
                password_valid = check_password_hash(stored_password, password)
            except Exception as e:
                # If werkzeug fails, try bcrypt directly
                import bcrypt
                try:
                    password_valid = bcrypt.checkpw(password.encode('utf-8'), stored_password.encode('utf-8'))
                except:
                    password_valid = False
        else:
            # Plain text password (legacy)
            password_valid = (stored_password == password)
        
        if not password_valid:
            return jsonify({'error': 'Invalid phone number or password'}), 401
        
        # Get business details
        businesses = appwrite_db.list_documents('businesses', [
            Query.equal('user_id', user['$id'])
        ])
        
        if not businesses:
            return jsonify({'error': 'Business profile not found'}), 404
        
        business = businesses[0]
        
        # Create access token
        token = create_access_token(user['$id'], 'business', business['$id'])
        
        return jsonify({
            'message': 'Login successful',
            'token': token,
            'user': {
                'id': user['$id'],
                'phone': phone,
                'user_type': 'business',
                'business_id': business['$id'],
                'business_name': business['name'],
                'business_pin': business.get('access_pin')
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        return jsonify({'error': f'Login failed: {str(e)}'}), 500

@app.route('/api/auth/logout', methods=['POST'])
@token_required
def logout():
    """Logout user"""
    return jsonify({'message': 'Logout successful'}), 200

# ========== Dashboard Endpoints ==========

@app.route('/api/dashboard', methods=['GET'])
@token_required
@business_required
def dashboard():
    """Get business dashboard data"""
    try:
        business_id = request.business_id
        
        # Get business details
        business = appwrite_db.get_document('businesses', business_id)
        
        # Get all customers
        customers = appwrite_db.list_documents('customers', [
            Query.equal('business_id', business_id)
        ])
        
        # Get all transactions
        transactions = appwrite_db.list_documents('transactions', [
            Query.equal('business_id', business_id),
            Query.order_desc('created_at'),
            Query.limit(100)
        ])
        
        # Calculate statistics
        total_customers = len(customers)
        total_credit = sum(float(t.get('amount', 0)) for t in transactions if t.get('transaction_type') == 'credit')
        total_payment = sum(float(t.get('amount', 0)) for t in transactions if t.get('transaction_type') == 'payment')
        outstanding_balance = total_credit - total_payment
        
        # Get pending payments (customers with positive balance)
        pending_customers = []
        for customer in customers:
            customer_transactions = [t for t in transactions if t.get('customer_id') == customer['$id']]
            customer_credit = sum(float(t.get('amount', 0)) for t in customer_transactions if t.get('transaction_type') == 'credit')
            customer_payment = sum(float(t.get('amount', 0)) for t in customer_transactions if t.get('transaction_type') == 'payment')
            customer_balance = customer_credit - customer_payment
            
            if customer_balance > 0:
                pending_customers.append({
                    'id': customer['$id'],
                    'name': customer.get('name'),
                    'phone': customer.get('phone_number'),
                    'balance': customer_balance
                })
        
        # Get recent transactions (last 10)
        recent_transactions = transactions[:10] if transactions else []
        
        # Get recent customers (last 4 by creation date) with their balances
        recent_customers_list = []
        for customer in customers[:4]:  # Get first 4 customers (already sorted by default)
            customer_transactions = [t for t in transactions if t.get('customer_id') == customer['$id']]
            customer_credit = sum(float(t.get('amount', 0)) for t in customer_transactions if t.get('transaction_type') == 'credit')
            customer_payment = sum(float(t.get('amount', 0)) for t in customer_transactions if t.get('transaction_type') == 'payment')
            customer_balance = customer_credit - customer_payment
            
            recent_customers_list.append({
                'id': customer['$id'],
                'name': customer.get('name'),
                'phone_number': customer.get('phone_number'),
                'balance': customer_balance
            })
        
        return jsonify({
            'business': {
                'id': business['$id'],
                'name': business['name'],
                'phone': business.get('phone_number'),
                'access_pin': business.get('access_pin')
            },
            'summary': {
                'total_customers': total_customers,
                'total_credit': total_credit,
                'total_payment': total_payment,
                'outstanding_balance': outstanding_balance,
                'pending_customers_count': len(pending_customers),
                'recent_customers': recent_customers_list
            },
            'recent_transactions': recent_transactions,
            'pending_customers': pending_customers[:5]  # Top 5
        }), 200
        
    except Exception as e:
        logger.error(f"Dashboard error: {str(e)}")
        return jsonify({'error': f'Failed to load dashboard: {str(e)}'}), 500

@app.route('/api/business/access-pin', methods=['GET'])
@token_required
@business_required
def get_access_pin():
    """Get business access PIN"""
    try:
        business_id = request.business_id
        business = appwrite_db.get_document('businesses', business_id)
        
        return jsonify({
            'access_pin': business.get('access_pin')
        }), 200
        
    except Exception as e:
        logger.error(f"Get access pin error: {str(e)}")
        return jsonify({'error': f'Failed to load access pin: {str(e)}'}), 500

# ========== Customer Management Endpoints ==========

@app.route('/api/customers', methods=['GET'])
@token_required
@business_required
def get_customers():
    """Get all customers for business"""
    try:
        business_id = request.business_id
        
        customers = appwrite_db.list_documents('customers', [
            Query.equal('business_id', business_id)
        ])
        
        # Get transactions to calculate balances
        transactions = appwrite_db.list_documents('transactions', [
            Query.equal('business_id', business_id)
        ])
        
        # Calculate balance for each customer
        customer_list = []
        for customer in customers:
            customer_transactions = [t for t in transactions if t.get('customer_id') == customer['$id']]
            customer_credit = sum(float(t.get('amount', 0)) for t in customer_transactions if t.get('transaction_type') == 'credit')
            customer_payment = sum(float(t.get('amount', 0)) for t in customer_transactions if t.get('transaction_type') == 'payment')
            
            customer_list.append({
                'id': customer['$id'],
                'name': customer.get('name'),
                'phone': customer.get('phone_number'),
                'balance': customer_credit - customer_payment,
                'transaction_count': len(customer_transactions)
            })
        
        return jsonify({'customers': customer_list}), 200
        
    except Exception as e:
        logger.error(f"Get customers error: {str(e)}")
        return jsonify({'error': f'Failed to get customers: {str(e)}'}), 500

@app.route('/api/customer/<customer_id>', methods=['GET'])
@token_required
@business_required
def get_customer_details(customer_id):
    """Get customer details with transactions"""
    try:
        business_id = request.business_id
        
        # Get customer
        customer = appwrite_db.get_document('customers', customer_id)
        
        if customer.get('business_id') != business_id:
            return jsonify({'error': 'Access denied'}), 403
        
        # Get customer transactions
        transactions = appwrite_db.list_documents('transactions', [
            Query.equal('business_id', business_id),
            Query.equal('customer_id', customer_id),
            Query.order_desc('created_at')
        ])
        
        # Calculate balance
        total_credit = sum(float(t.get('amount', 0)) for t in transactions if t.get('transaction_type') == 'credit')
        total_payment = sum(float(t.get('amount', 0)) for t in transactions if t.get('transaction_type') == 'payment')
        balance = total_credit - total_payment
        
        return jsonify({
            'customer': {
                'id': customer['$id'],
                'name': customer.get('name'),
                'phone': customer.get('phone_number'),
                'balance': balance
            },
            'transactions': transactions,
            'summary': {
                'total_credit': total_credit,
                'total_payment': total_payment,
                'balance': balance,
                'transaction_count': len(transactions)
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Get customer details error: {str(e)}")
        return jsonify({'error': f'Failed to get customer details: {str(e)}'}), 500

@app.route('/api/customer/<customer_id>/transactions', methods=['GET'])
@token_required
@business_required
def get_customer_transactions(customer_id):
    """Get transactions for a specific customer"""
    try:
        business_id = request.business_id
        
        # Verify customer belongs to business
        customer = appwrite_db.get_document('customers', customer_id)
        if customer.get('business_id') != business_id:
            return jsonify({'error': 'Access denied'}), 403
        
        # Get transactions
        transactions = appwrite_db.list_documents('transactions', [
            Query.equal('business_id', business_id),
            Query.equal('customer_id', customer_id),
            Query.order_desc('created_at')
        ])
        
        # Format transactions with proper id field
        transaction_list = []
        for txn in transactions:
            transaction_list.append({
                'id': txn['$id'],
                'amount': txn.get('amount'),
                'transaction_type': txn.get('transaction_type'),
                'notes': txn.get('notes'),
                'created_at': txn.get('created_at'),
                'receipt_image_url': txn.get('receipt_image_url')
            })
        
        return jsonify({'transactions': transaction_list}), 200
        
    except Exception as e:
        logger.error(f"Get customer transactions error: {str(e)}")
        return jsonify({'error': f'Failed to get transactions: {str(e)}'}), 500

@app.route('/api/customer', methods=['POST'])
@token_required
@business_required
def add_customer():
    """Add new customer"""
    try:
        business_id = request.business_id
        data = request.get_json()
        
        name = data.get('name', '').strip()
        phone = data.get('phone', '').strip()
        
        if not name or not phone:
            return jsonify({'error': 'Name and phone number are required'}), 400
        
        # Validate phone
        if not phone.isdigit() or len(phone) != 10:
            return jsonify({'error': 'Phone number must be exactly 10 digits'}), 400
        
        # Check if customer already exists
        existing = appwrite_db.list_documents('customers', [
            Query.equal('business_id', business_id),
            Query.equal('phone_number', phone)
        ])
        
        if existing_customers:
            return jsonify({'error': 'Customer with this phone number already exists'}), 400
        
        # Create customer
        customer_id = str(uuid.uuid4())
        customer_data = {
            'business_id': business_id,
            'name': name,
            'phone_number': phone,
            'created_at': datetime.utcnow().isoformat()
        }
        
        customer = appwrite_db.create_document('customers', customer_id, customer_data)
        
        return jsonify({
            'message': 'Customer added successfully',
            'customer': customer
        }), 201
        
    except Exception as e:
        logger.error(f"Add customer error: {str(e)}")
        return jsonify({'error': f'Failed to add customer: {str(e)}'}), 500

# ========== Transaction Endpoints ==========

@app.route('/api/transaction', methods=['POST'])
@token_required
@business_required
def create_transaction():
    """Create new transaction (credit or payment)"""
    try:
        business_id = request.business_id
        
        # Handle multipart form data for file upload
        customer_id = request.form.get('customer_id')
        transaction_type = request.form.get('type')
        amount = request.form.get('amount')
        notes = request.form.get('notes', '')
        
        if not customer_id or not transaction_type or not amount:
            return jsonify({'error': 'Customer ID, type, and amount are required'}), 400
        
        if transaction_type not in ['credit', 'payment']:
            return jsonify({'error': 'Type must be credit or payment'}), 400
        
        try:
            amount = float(amount)
            if amount <= 0:
                return jsonify({'error': 'Amount must be greater than 0'}), 400
        except ValueError:
            return jsonify({'error': 'Invalid amount'}), 400
        
        # Verify customer belongs to business
        customer = appwrite_db.get_document('customers', customer_id)
        if customer.get('business_id') != business_id:
            return jsonify({'error': 'Access denied'}), 403
        
        # Handle bill image upload
        bill_image_url = None
        if 'bill_image' in request.files:
            file = request.files['bill_image']
            if file and file.filename and allowed_file(file.filename):
                try:
                    # Upload to Cloudinary
                    upload_result = cloudinary.uploader.upload(
                        file,
                        folder='bill_receipts',
                        resource_type='image'
                    )
                    bill_image_url = upload_result.get('secure_url')
                except Exception as upload_error:
                    logger.error(f"Image upload error: {str(upload_error)}")
        
        # Create transaction
        transaction_id = str(uuid.uuid4())
        transaction_data = {
            'business_id': business_id,
            'customer_id': customer_id,
            'type': transaction_type,
            'amount': amount,
            'notes': notes,
            'receipt_image_url': bill_image_url or '',
            'created_at': datetime.utcnow().isoformat()
        }
        
        transaction = appwrite_db.create_document('transactions', transaction_id, transaction_data)
        
        return jsonify({
            'message': f'{transaction_type.capitalize()} recorded successfully',
            'transaction': transaction
        }), 201
        
    except Exception as e:
        logger.error(f"Create transaction error: {str(e)}")
        return jsonify({'error': f'Failed to create transaction: {str(e)}'}), 500

@app.route('/api/transactions', methods=['GET'])
@token_required
@business_required
def get_all_transactions():
    """Get all transactions for business"""
    try:
        business_id = request.business_id
        
        transactions = appwrite_db.list_documents('transactions', [
            Query.equal('business_id', business_id),
            Query.order_desc('created_at')
        ])
        
        # Get customer names
        customers = appwrite_db.list_documents('customers', [
            Query.equal('business_id', business_id)
        ])
        customer_map = {c['$id']: c.get('name', 'Unknown') for c in customers}
        
        # Format transactions
        transaction_list = []
        for txn in transactions:
            transaction_list.append({
                'id': txn['$id'],
                'customer_id': txn.get('customer_id'),
                'customer_name': customer_map.get(txn.get('customer_id'), 'Unknown'),
                'amount': txn.get('amount'),
                'transaction_type': txn.get('transaction_type'),
                'notes': txn.get('notes'),
                'created_at': txn.get('created_at'),
                'receipt_image_url': txn.get('receipt_image_url')
            })
        
        return jsonify({'transactions': transaction_list}), 200
        
    except Exception as e:
        logger.error(f"Get transactions error: {str(e)}")
        return jsonify({'error': f'Failed to get transactions: {str(e)}'}), 500

@app.route('/api/transaction/<transaction_id>/bill', methods=['GET'])
@token_required
@business_required
def get_bill_image(transaction_id):
    """Get bill image URL for transaction"""
    try:
        business_id = request.business_id
        
        transaction = appwrite_db.get_document('transactions', transaction_id)
        
        if transaction.get('business_id') != business_id:
            return jsonify({'error': 'Access denied'}), 403
        
        bill_url = transaction.get('receipt_image_url')
        if not bill_url:
            return jsonify({'error': 'No bill image found'}), 404
        
        return jsonify({'bill_url': bill_url}), 200
        
    except Exception as e:
        logger.error(f"Get bill image error: {str(e)}")
        return jsonify({'error': f'Failed to get bill image: {str(e)}'}), 500

# ========== Recurring Transactions Endpoints ==========

@app.route('/api/recurring-transactions', methods=['GET'])
@token_required
@business_required
def get_recurring_transactions():
    """Get all recurring transactions for business"""
    try:
        business_id = request.business_id
        
        recurring_transactions = appwrite_db.list_documents('recurring_transactions', [
            Query.equal('business_id', business_id),
            Query.order_desc('created_at')
        ])
        
        # Get customer names
        customers = appwrite_db.list_documents('customers', [
            Query.equal('business_id', business_id)
        ])
        customer_map = {c['$id']: c.get('name', 'Unknown') for c in customers}
        
        for rt in recurring_transactions:
            rt['customer_name'] = customer_map.get(rt.get('customer_id'), 'Unknown')
        
        return jsonify({'recurring_transactions': recurring_transactions}), 200
        
    except Exception as e:
        logger.error(f"Get recurring transactions error: {str(e)}")
        return jsonify({'error': f'Failed to get recurring transactions: {str(e)}'}), 500

@app.route('/api/recurring-transaction', methods=['POST'])
@token_required
@business_required
def create_recurring_transaction():
    """Create new recurring transaction"""
    try:
        business_id = request.business_id
        data = request.get_json()
        
        customer_id = data.get('customer_id')
        amount = data.get('amount')
        frequency = data.get('frequency')  # monthly, weekly, daily
        notes = data.get('notes', '')
        
        if not customer_id or not amount or not frequency:
            return jsonify({'error': 'Customer ID, amount, and frequency are required'}), 400
        
        if frequency not in ['daily', 'weekly', 'monthly']:
            return jsonify({'error': 'Frequency must be daily, weekly, or monthly'}), 400
        
        try:
            amount = float(amount)
            if amount <= 0:
                return jsonify({'error': 'Amount must be greater than 0'}), 400
        except ValueError:
            return jsonify({'error': 'Invalid amount'}), 400
        
        # Verify customer belongs to business
        customer = appwrite_db.get_document('customers', customer_id)
        if customer.get('business_id') != business_id:
            return jsonify({'error': 'Access denied'}), 403
        
        # Create recurring transaction
        recurring_id = str(uuid.uuid4())
        recurring_data = {
            'business_id': business_id,
            'customer_id': customer_id,
            'amount': amount,
            'frequency': frequency,
            'notes': notes,
            'is_active': True,
            'next_execution_date': datetime.utcnow().isoformat(),
            'created_at': datetime.utcnow().isoformat()
        }
        
        recurring_transaction = appwrite_db.create_document('recurring_transactions', recurring_id, recurring_data)
        
        return jsonify({
            'message': 'Recurring transaction created successfully',
            'recurring_transaction': recurring_transaction
        }), 201
        
    except Exception as e:
        logger.error(f"Create recurring transaction error: {str(e)}")
        return jsonify({'error': f'Failed to create recurring transaction: {str(e)}'}), 500

@app.route('/api/recurring-transaction/<recurring_id>/toggle', methods=['PUT'])
@token_required
@business_required
def toggle_recurring_transaction(recurring_id):
    """Toggle recurring transaction active status"""
    try:
        business_id = request.business_id
        
        recurring_transaction = appwrite_db.get_document('recurring_transactions', recurring_id)
        
        if recurring_transaction.get('business_id') != business_id:
            return jsonify({'error': 'Access denied'}), 403
        
        # Toggle is_active
        new_status = not recurring_transaction.get('is_active', False)
        appwrite_db.update_document('recurring_transactions', recurring_id, {
            'is_active': new_status
        })
        
        return jsonify({
            'message': f'Recurring transaction {"activated" if new_status else "deactivated"} successfully',
            'is_active': new_status
        }), 200
        
    except Exception as e:
        logger.error(f"Toggle recurring transaction error: {str(e)}")
        return jsonify({'error': f'Failed to toggle recurring transaction: {str(e)}'}), 500

@app.route('/api/recurring-transaction/<recurring_id>', methods=['DELETE'])
@token_required
@business_required
def delete_recurring_transaction(recurring_id):
    """Delete recurring transaction"""
    try:
        business_id = request.business_id
        
        recurring_transaction = appwrite_db.get_document('recurring_transactions', recurring_id)
        
        if recurring_transaction.get('business_id') != business_id:
            return jsonify({'error': 'Access denied'}), 403
        
        appwrite_db.delete_document('recurring_transactions', recurring_id)
        
        return jsonify({'message': 'Recurring transaction deleted successfully'}), 200
        
    except Exception as e:
        logger.error(f"Delete recurring transaction error: {str(e)}")
        return jsonify({'error': f'Failed to delete recurring transaction: {str(e)}'}), 500

# ========== Business Profile Endpoints ==========

@app.route('/api/profile', methods=['GET'])
@token_required
@business_required
def get_profile():
    """Get business profile with stats"""
    try:
        business_id = request.business_id
        
        business = appwrite_db.get_document('businesses', business_id)
        
        # Get customer count
        customers = appwrite_db.list_documents(
            'customers',
            [Query.equal('business_id', business_id)]
        )
        total_customers = len(customers)
        
        # Get transaction count
        transactions = appwrite_db.list_documents(
            'transactions',
            [Query.equal('business_id', business_id)]
        )
        total_transactions = len(transactions)
        
        # Add stats to business data
        business['total_customers'] = total_customers
        business['total_transactions'] = total_transactions
        
        return jsonify({'business': business}), 200
        
    except Exception as e:
        logger.error(f"Get profile error: {str(e)}")
        return jsonify({'error': f'Failed to get profile: {str(e)}'}), 500

@app.route('/api/profile', methods=['PUT'])
@token_required
@business_required
def update_profile():
    """Update business profile"""
    try:
        business_id = request.business_id
        data = request.get_json()
        
        update_data = {}
        if 'name' in data:
            update_data['name'] = data['name'].strip()
        if 'phone' in data:
            phone = data['phone'].strip()
            if phone and (not phone.isdigit() or len(phone) != 10):
                return jsonify({'error': 'Phone number must be exactly 10 digits'}), 400
            update_data['phone'] = phone
        
        if not update_data:
            return jsonify({'error': 'No data to update'}), 400
        
        business = appwrite_db.update_document('businesses', business_id, update_data)
        
        return jsonify({
            'message': 'Profile updated successfully',
            'business': business
        }), 200
        
    except Exception as e:
        logger.error(f"Update profile error: {str(e)}")
        return jsonify({'error': f'Failed to update profile: {str(e)}'}), 500

@app.route('/api/profile/regenerate-pin', methods=['POST'])
@token_required
@business_required
def regenerate_pin():
    """Regenerate business PIN"""
    try:
        business_id = request.business_id
        
        import random
        new_pin = ''.join([str(random.randint(0, 9)) for _ in range(6)])
        
        business = appwrite_db.update_document('businesses', business_id, {
            'pin': new_pin
        })
        
        return jsonify({
            'message': 'PIN regenerated successfully',
            'pin': new_pin
        }), 200
        
    except Exception as e:
        logger.error(f"Regenerate PIN error: {str(e)}")
        return jsonify({'error': f'Failed to regenerate PIN: {str(e)}'}), 500

@app.route('/api/profile/qr', methods=['GET'])
@token_required
@business_required
def generate_qr():
    """Generate QR code for business PIN"""
    try:
        business_id = request.business_id
        
        business = appwrite_db.get_document('businesses', business_id)
        pin = business.get('pin')
        
        if not pin:
            return jsonify({'error': 'Business PIN not found'}), 404
        
        # Generate QR code
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(pin)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Convert to bytes
        img_io = BytesIO()
        img.save(img_io, 'PNG')
        img_io.seek(0)
        
        return send_file(img_io, mimetype='image/png')
        
    except Exception as e:
        logger.error(f"Generate QR error: {str(e)}")
        return jsonify({'error': f'Failed to generate QR: {str(e)}'}), 500

# ========== Reminder Endpoints ==========

@app.route('/api/customer/<customer_id>/remind', methods=['POST'])
@token_required
@business_required
def remind_customer(customer_id):
    """Generate WhatsApp reminder URL for specific customer"""
    try:
        business_id = request.business_id
        
        # Verify customer belongs to business
        customer = appwrite_db.get_document('customers', customer_id)
        if customer.get('business_id') != business_id:
            return jsonify({'error': 'Access denied'}), 403
        
        # Get business details
        business = appwrite_db.get_document('businesses', business_id)
        
        # Get credit relationship for balance
        credit_docs = appwrite_db.list_documents('customer_credits', [
            Query.equal('business_id', business_id),
            Query.equal('customer_id', customer_id)
        ])
        credit = credit_docs[0] if credit_docs else {}
        balance = credit.get('current_balance', 0)
        
        # Clean and format phone number
        import re
        import urllib.parse
        phone_number = customer.get('phone_number', '')
        clean_phone = re.sub(r'\D', '', phone_number)
        if clean_phone and not clean_phone.startswith('91'):
            if clean_phone.startswith('0'):
                clean_phone = '91' + clean_phone[1:]
            elif len(clean_phone) == 10:
                clean_phone = '91' + clean_phone
        
        # Generate reminder message
        customer_name = customer.get('name', 'Customer')
        business_name = business.get('name', 'Business')
        if balance > 0:
            message = f"Hello {customer_name},\n\nJust a reminder about your outstanding balance of ₹{balance:,.2f} with {business_name}.\n\nThank you!"
        else:
            message = f"Hello {customer_name},\n\nThank you for keeping your account up to date with {business_name}!"
        
        # Create WhatsApp URL
        encoded_message = urllib.parse.quote(message)
        whatsapp_url = f"https://wa.me/{clean_phone}?text={encoded_message}"
        
        logger.info(f"WhatsApp reminder URL generated for customer {customer_id}")
        
        return jsonify({
            'message': f'Reminder URL generated for {customer_name}',
            'whatsapp_url': whatsapp_url,
            'customer_name': customer_name,
            'balance': balance
        }), 200
        
    except Exception as e:
        logger.error(f"Send reminder error: {str(e)}")
        return jsonify({'error': f'Failed to generate reminder: {str(e)}'}), 500

@app.route('/api/customers/remind-all', methods=['GET'])
@token_required
@business_required
def remind_all_customers():
    """Get list of all customers with WhatsApp reminder URLs"""
    try:
        business_id = request.business_id
        import re
        import urllib.parse
        
        # Get business details
        business = appwrite_db.get_document('businesses', business_id)
        business_name = business.get('name', 'Business')
        
        # Get all customer credits with positive balance
        customer_credits = appwrite_db.list_documents('customer_credits', [
            Query.equal('business_id', business_id)
        ])
        
        customers_to_remind = []
        for credit in customer_credits:
            balance = credit.get('current_balance', 0)
            if balance > 0:
                customer_id = credit.get('customer_id')
                customer = appwrite_db.get_document('customers', customer_id)
                
                if customer:
                    # Clean and format phone number
                    phone_number = customer.get('phone_number', '')
                    clean_phone = re.sub(r'\D', '', phone_number)
                    if clean_phone and not clean_phone.startswith('91'):
                        if clean_phone.startswith('0'):
                            clean_phone = '91' + clean_phone[1:]
                        elif len(clean_phone) == 10:
                            clean_phone = '91' + clean_phone
                    
                    # Generate reminder message
                    customer_name = customer.get('name', 'Customer')
                    message = f"Hello {customer_name},\n\nJust a reminder about your outstanding balance of ₹{balance:,.2f} with {business_name}.\n\nThank you!"
                    
                    # Create WhatsApp URL
                    encoded_message = urllib.parse.quote(message)
                    whatsapp_url = f"https://wa.me/{clean_phone}?text={encoded_message}"
                    
                    customers_to_remind.append({
                        'id': customer_id,
                        'name': customer_name,
                        'phone_number': customer.get('phone_number', ''),
                        'balance': balance,
                        'whatsapp_url': whatsapp_url
                    })
        
        return jsonify({
            'customers': customers_to_remind,
            'count': len(customers_to_remind),
            'business_name': business_name
        }), 200
        
    except Exception as e:
        logger.error(f"Get bulk reminders error: {str(e)}")
        return jsonify({'error': f'Failed to get reminders: {str(e)}'}), 500

# ============================================================================
# PRODUCTS / INVENTORY MANAGEMENT
# ============================================================================

@app.route('/api/products', methods=['GET'])
@token_required
def get_products():
    """Get all products for the business"""
    try:
        business_id = request.business_id
        
        # Get query parameters
        category = request.args.get('category')
        search = request.args.get('search')
        is_public = request.args.get('is_public')
        
        # Build queries
        queries = [Query.equal('business_id', business_id)]
        
        if category:
            queries.append(Query.equal('category', category))
        
        if is_public is not None:
            queries.append(Query.equal('is_public', is_public == 'true'))
        
        if search:
            queries.append(Query.search('name', search))
        
        # Get products
        products = appwrite_db.list_documents(
            'products',
            queries
        )
        
        # Format products
        products_list = []
        for doc in products:
            product = {
                'id': doc['$id'],
                'name': doc['name'],
                'description': doc.get('description', ''),
                'category': doc['category'],
                'stock_quantity': doc['stock_quantity'],
                'unit': doc['unit'],
                'price': doc['price'],
                'image_url': doc.get('image_url', ''),
                'is_public': doc['is_public'],
                'low_stock_threshold': doc.get('low_stock_threshold', 10),
                'is_low_stock': doc['stock_quantity'] <= doc.get('low_stock_threshold', 10),
                'created_at': doc['$createdAt'],
                'updated_at': doc['$updatedAt']
            }
            products_list.append(product)
        
        return jsonify({
            'products': products_list,
            'count': len(products_list)
        }), 200
        
    except Exception as e:
        logger.error(f"Get products error: {str(e)}")
        return jsonify({'error': f'Failed to get products: {str(e)}'}), 500

@app.route('/api/product', methods=['POST'])
@token_required
def add_product():
    """Add new product to inventory"""
    try:
        business_id = request.business_id
        data = request.json
        
        # Validate required fields
        required_fields = ['name', 'category', 'stock_quantity', 'unit', 'price']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Validate data types
        try:
            stock_quantity = int(data['stock_quantity'])
            price = float(data['price'])
            
            if stock_quantity < 0:
                return jsonify({'error': 'Stock quantity must be non-negative'}), 400
            if price < 0:
                return jsonify({'error': 'Price must be non-negative'}), 400
                
        except ValueError:
            return jsonify({'error': 'Invalid number format for stock or price'}), 400
        
        # Create product document
        product_data = {
            'business_id': business_id,
            'name': data['name'].strip(),
            'description': data.get('description', '').strip(),
            'category': data['category'].strip(),
            'stock_quantity': stock_quantity,
            'unit': data['unit'].strip(),
            'price': price,
            'image_url': data.get('image_url', ''),
            'is_public': data.get('is_public', False),
            'low_stock_threshold': data.get('low_stock_threshold', 10)
        }
        
        # Save to database
        product_id = str(uuid.uuid4())
        result = appwrite_db.create_document('products', product_id, product_data)
        
        product = {
            'id': result['$id'],
            'name': result['name'],
            'description': result.get('description', ''),
            'category': result['category'],
            'stock_quantity': result['stock_quantity'],
            'unit': result['unit'],
            'price': result['price'],
            'image_url': result.get('image_url', ''),
            'is_public': result['is_public'],
            'low_stock_threshold': result.get('low_stock_threshold', 10),
            'created_at': result['$createdAt']
        }
        
        return jsonify({
            'message': 'Product added successfully',
            'product': product
        }), 201
        
    except Exception as e:
        logger.error(f"Add product error: {str(e)}")
        return jsonify({'error': f'Failed to add product: {str(e)}'}), 500

@app.route('/api/product/<product_id>', methods=['GET'])
@token_required
def get_product(product_id):
    """Get single product details"""
    try:
        business_id = request.business_id
        
        # Get product
        doc = appwrite_db.get_document('products', product_id)
        
        # Verify ownership
        if doc['business_id'] != business_id:
            return jsonify({'error': 'Unauthorized access to product'}), 403
        
        product = {
            'id': doc['$id'],
            'name': doc['name'],
            'description': doc.get('description', ''),
            'category': doc['category'],
            'stock_quantity': doc['stock_quantity'],
            'unit': doc['unit'],
            'price': doc['price'],
            'image_url': doc.get('image_url', ''),
            'is_public': doc['is_public'],
            'low_stock_threshold': doc.get('low_stock_threshold', 10),
            'is_low_stock': doc['stock_quantity'] <= doc.get('low_stock_threshold', 10),
            'created_at': doc['$createdAt'],
            'updated_at': doc['$updatedAt']
        }
        
        return jsonify({'product': product}), 200
        
    except Exception as e:
        logger.error(f"Get product error: {str(e)}")
        return jsonify({'error': f'Failed to get product: {str(e)}'}), 500

@app.route('/api/product/<product_id>', methods=['PUT'])
@token_required
def update_product(product_id):
    """Update product details"""
    try:
        business_id = request.business_id
        data = request.json
        
        # Get existing product to verify ownership
        doc = appwrite_db.get_document('products', product_id)
        
        if doc['business_id'] != business_id:
            return jsonify({'error': 'Unauthorized access to product'}), 403
        
        # Validate numeric fields if provided
        if 'stock_quantity' in data:
            try:
                stock_quantity = int(data['stock_quantity'])
                if stock_quantity < 0:
                    return jsonify({'error': 'Stock quantity must be non-negative'}), 400
                data['stock_quantity'] = stock_quantity
            except ValueError:
                return jsonify({'error': 'Invalid stock quantity format'}), 400
        
        if 'price' in data:
            try:
                price = float(data['price'])
                if price < 0:
                    return jsonify({'error': 'Price must be non-negative'}), 400
                data['price'] = price
            except ValueError:
                return jsonify({'error': 'Invalid price format'}), 400
        
        # Update allowed fields only
        allowed_fields = ['name', 'description', 'category', 'stock_quantity', 
                         'unit', 'price', 'image_url', 'is_public', 'low_stock_threshold']
        
        update_data = {k: v for k, v in data.items() if k in allowed_fields}
        
        if not update_data:
            return jsonify({'error': 'No valid fields to update'}), 400
        
        # Update product
        result = appwrite_db.update_document('products', product_id, update_data)
        
        product = {
            'id': result['$id'],
            'name': result['name'],
            'description': result.get('description', ''),
            'category': result['category'],
            'stock_quantity': result['stock_quantity'],
            'unit': result['unit'],
            'price': result['price'],
            'image_url': result.get('image_url', ''),
            'is_public': result['is_public'],
            'low_stock_threshold': result.get('low_stock_threshold', 10),
            'updated_at': result['$updatedAt']
        }
        
        return jsonify({
            'message': 'Product updated successfully',
            'product': product
        }), 200
        
    except Exception as e:
        logger.error(f"Update product error: {str(e)}")
        return jsonify({'error': f'Failed to update product: {str(e)}'}), 500

@app.route('/api/product/<product_id>', methods=['DELETE'])
@token_required
def delete_product(product_id):
    """Delete product from inventory"""
    try:
        business_id = request.business_id
        
        # Get product to verify ownership
        doc = appwrite_db.get_document('products', product_id)
        
        if doc['business_id'] != business_id:
            return jsonify({'error': 'Unauthorized access to product'}), 403
        
        # Delete product
        appwrite_db.delete_document('products', product_id)
        
        return jsonify({'message': 'Product deleted successfully'}), 200
        
    except Exception as e:
        logger.error(f"Delete product error: {str(e)}")
        return jsonify({'error': f'Failed to delete product: {str(e)}'}), 500

@app.route('/api/products/categories', methods=['GET'])
def get_categories():
    """Get list of product categories"""
    # Predefined categories
    categories = [
        'Food & Groceries',
        'Beverages',
        'Personal Care',
        'Household Items',
        'Electronics',
        'Clothing & Textiles',
        'Hardware & Tools',
        'Stationery',
        'Medicine & Healthcare',
        'Other'
    ]
    
    return jsonify({'categories': categories}), 200

@app.route('/api/products/units', methods=['GET'])
def get_units():
    """Get list of measurement units"""
    units = [
        'piece',
        'kg',
        'gram',
        'liter',
        'ml',
        'meter',
        'packet',
        'box',
        'dozen',
        'bag'
    ]
    
    return jsonify({'units': units}), 200

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def server_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5003))
    app.run(host='0.0.0.0', port=port, debug=os.getenv('FLASK_ENV') == 'development')
