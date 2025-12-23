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
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT

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
        phone_number = data.get('phone_number', '').strip()
        password = data.get('password')
        
        if not business_name or not phone_number or not password:
            return jsonify({'error': 'Business name, phone number and password are required'}), 400
        
        # Validate phone number
        if not phone_number.isdigit() or len(phone_number) != 10:
            return jsonify({'error': 'Phone number must be exactly 10 digits'}), 400
        
        # Check if user already exists
        existing_users = appwrite_db.list_documents('users', [
            Query.equal('phone_number', phone_number)
        ])
        
        if existing_users:
            return jsonify({'error': 'Phone number already registered'}), 400
        
        # Create user
        user_id = str(uuid.uuid4())
        from werkzeug.security import generate_password_hash
        
        user_data = {
            'name': business_name,
            'phone_number': phone_number,
            'password': generate_password_hash(password),
            'user_type': 'business',
            'created_at': datetime.now().isoformat()
        }
        
        user = appwrite_db.create_document('users', user_id, user_data)
        
        # Generate business PIN (4-digit unique PIN)
        import random
        business_pin = ''.join([str(random.randint(0, 9)) for _ in range(4)])
        
        # Create business profile
        business_id = str(uuid.uuid4())
        business_data = {
            'user_id': user_id,
            'name': business_name,
            'phone_number': phone_number,
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
                'phone_number': phone_number,
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
        phone_number = data.get('phone_number')
        password = data.get('password')
        
        if not phone_number or not password:
            return jsonify({'error': 'Phone number and password are required'}), 400
        
        # Find user
        users = appwrite_db.list_documents('users', [
            Query.equal('phone_number', phone_number),
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
                'phone_number': phone_number,
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
        
        # Get ALL transactions for accurate calculations (no limit)
        all_transactions = appwrite_db.list_documents('transactions', [
            Query.equal('business_id', business_id)
        ])
        
        # Get recent transactions for display (limited to 100)
        transactions = appwrite_db.list_documents('transactions', [
            Query.equal('business_id', business_id),
            Query.order_desc('created_at'),
            Query.limit(100)
        ])
        
        # Calculate statistics using ALL transactions
        total_customers = len(customers)
        total_credit = sum(float(t.get('amount', 0)) for t in all_transactions if t.get('transaction_type') == 'credit')
        total_payment = sum(float(t.get('amount', 0)) for t in all_transactions if t.get('transaction_type') == 'payment')
        
        # Get customer credits for accurate current balances
        customer_credits = appwrite_db.list_documents('customer_credits', [
            Query.equal('business_id', business_id)
        ])
        
        # Create a map of customer_id -> current_balance and calculate outstanding balance
        customer_balance_map = {}
        outstanding_balance = 0
        for credit in customer_credits:
            customer_id = credit.get('customer_id')
            current_balance = credit.get('current_balance', 0)
            customer_balance_map[customer_id] = current_balance
            outstanding_balance += current_balance
        
        # Get pending payments (customers with positive balance) from customer_credits
        pending_customers = []
        for customer in customers:
            customer_balance = customer_balance_map.get(customer['$id'], 0)
            
            if customer_balance > 0:
                pending_customers.append({
                    'id': customer['$id'],
                    'name': customer.get('name'),
                    'phone_number': customer.get('phone_number'),
                    'balance': customer_balance
                })
        
        # Get recent transactions (last 10)
        recent_transactions = transactions[:10] if transactions else []
        
        # Get recent customers (based on last transaction date) with their balances
        recent_customers_list = []
        
        # Build a dict of customer_id -> last_transaction_date
        customer_last_transaction = {}
        for txn in transactions:
            cid = txn.get('customer_id')
            txn_date = txn.get('$createdAt', '')
            if cid:
                if cid not in customer_last_transaction or txn_date > customer_last_transaction[cid]:
                    customer_last_transaction[cid] = txn_date
        
        # Sort customers by their last transaction date (most recent first)
        sorted_customer_ids = sorted(
            customer_last_transaction.keys(),
            key=lambda cid: customer_last_transaction[cid],
            reverse=True
        )
        
        # Take the top 4 and build the response - fetch balance from customer_credits
        for customer_id in sorted_customer_ids[:4]:
            # Find the customer object
            customer = next((c for c in customers if c['$id'] == customer_id), None)
            if not customer:
                continue
            
            # Get balance from customer_credits collection
            customer_balance = customer_balance_map.get(customer_id, 0)
            
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
                'phone_number': business.get('phone_number'),
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
        
        # Get customer credits for accurate balances
        customer_credits = appwrite_db.list_documents('customer_credits', [
            Query.equal('business_id', business_id)
        ])
        
        # Create a map of customer_id -> current_balance
        customer_balance_map = {}
        for credit in customer_credits:
            customer_id = credit.get('customer_id')
            current_balance = credit.get('current_balance', 0)
            customer_balance_map[customer_id] = current_balance
        
        # Get transactions to find last transaction date and count
        transactions = appwrite_db.list_documents('transactions', [
            Query.equal('business_id', business_id),
            Query.order_desc('created_at')
        ])
        
        # Build a dict of customer_id -> last_transaction_date and transaction_count
        customer_last_transaction = {}
        customer_transaction_count = {}
        for txn in transactions:
            cid = txn.get('customer_id')
            txn_date = txn.get('$createdAt', '')
            if cid:
                if cid not in customer_last_transaction:
                    customer_last_transaction[cid] = txn_date
                customer_transaction_count[cid] = customer_transaction_count.get(cid, 0) + 1
        
        # Build customer list with current balances from customer_credits
        customer_list = []
        for customer in customers:
            customer_id = customer['$id']
            
            customer_list.append({
                'id': customer_id,
                'name': customer.get('name'),
                'phone_number': customer.get('phone_number'),
                'balance': customer_balance_map.get(customer_id, 0),
                'transaction_count': customer_transaction_count.get(customer_id, 0),
                'last_transaction_date': customer_last_transaction.get(customer_id, '')
            })
        
        # Sort by last transaction date (most recent first)
        customer_list.sort(key=lambda c: c.get('last_transaction_date', ''), reverse=True)
        
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
                'phone_number': customer.get('phone_number'),
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
        cloudinary_base = f"https://res.cloudinary.com/{os.getenv('CLOUDINARY_CLOUD_NAME')}/image/upload/"
        
        for txn in transactions:
            receipt_url = txn.get('receipt_image_url', '')
            logger.info(f"Transaction {txn['$id']} receipt_image_url from DB: {receipt_url}")
            
            # Only construct URL if it's a valid Cloudinary public_id (starts with folder name like 'bill_receipts/')
            if receipt_url and not receipt_url.startswith('http'):
                # Check if it looks like a valid Cloudinary public_id
                if receipt_url.startswith('bill_receipts/') or '/' in receipt_url:
                    # This is a Cloudinary public_id, construct full URL
                    receipt_url = cloudinary_base + receipt_url
                    logger.info(f"Constructed full URL: {receipt_url}")
                else:
                    # This is invalid data (base64 or corrupted), ignore it
                    logger.warning(f"Invalid receipt_image_url format, ignoring: {receipt_url[:50]}...")
                    receipt_url = ''
            elif receipt_url and receipt_url.startswith('http'):
                # Already a full URL, use as is
                pass
            else:
                receipt_url = ''
            
            transaction_list.append({
                'id': txn['$id'],
                'amount': txn.get('amount'),
                'transaction_type': txn.get('transaction_type'),
                'notes': txn.get('notes'),
                'created_at': txn.get('created_at'),
                'receipt_image_url': receipt_url,
                'created_by': txn.get('created_by')
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
        phone_number = data.get('phone_number', '').strip()
        
        if not name or not phone_number:
            return jsonify({'error': 'Name and phone number are required'}), 400
        
        # Validate phone
        if not phone_number.isdigit() or len(phone_number) != 10:
            return jsonify({'error': 'Phone number must be exactly 10 digits'}), 400
        
        # Check if customer already exists
        existing = appwrite_db.list_documents('customers', [
            Query.equal('business_id', business_id),
            Query.equal('phone_number', phone_number)
        ])
        
        if existing:
            return jsonify({'error': 'Customer with this phone number already exists'}), 400
        
        # Create customer
        customer_id = str(uuid.uuid4())
        customer_data = {
            'business_id': business_id,
            'name': name,
            'phone_number': phone_number,
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
        
        # Handle both JSON and multipart form data
        if request.is_json:
            data = request.json
            customer_id = data.get('customer_id')
            transaction_type = data.get('type')
            amount = data.get('amount')
            notes = data.get('notes', '')
        else:
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
        if 'bill_photo' in request.files:
            file = request.files['bill_photo']
            if file and file.filename and allowed_file(file.filename):
                try:
                    # Generate unique filename
                    bill_id = f"bill_{transaction_id}_{uuid.uuid4().hex[:8]}"
                    
                    # Upload to Cloudinary
                    upload_result = cloudinary.uploader.upload(
                        file,
                        folder='bill_receipts',
                        public_id=bill_id,
                        resource_type='image'
                    )
                    logger.info(f"Cloudinary upload result: {upload_result}")
                    # Store the public_id (not secure_url) so we can construct URL dynamically
                    bill_image_url = upload_result.get('public_id')
                    logger.info(f"Stored public_id: {bill_image_url}")
                except Exception as upload_error:
                    logger.error(f"Image upload error: {str(upload_error)}")
        elif 'bill_image' in request.files:
            # Fallback for old field name
            file = request.files['bill_image']
            if file and file.filename and allowed_file(file.filename):
                try:
                    bill_id = f"bill_{transaction_id}_{uuid.uuid4().hex[:8]}"
                    upload_result = cloudinary.uploader.upload(
                        file,
                        folder='bill_receipts',
                        public_id=bill_id,
                        resource_type='image'
                    )
                    bill_image_url = upload_result.get('public_id')
                except Exception as upload_error:
                    logger.error(f"Image upload error: {str(upload_error)}")
        
        # Create transaction
        transaction_id = str(uuid.uuid4())
        
        # Get created_by from request, default to 'business' if not provided
        if request.is_json:
            created_by = data.get('created_by', 'business')
        else:
            created_by = request.form.get('created_by', 'business')
        
        transaction_data = {
            'business_id': business_id,
            'customer_id': customer_id,
            'transaction_type': transaction_type,
            'amount': amount,
            'notes': notes,
            'receipt_image_url': bill_image_url or '',
            'created_by': created_by,  # Use from request or default
            'created_at': datetime.utcnow().isoformat()
        }
        
        logger.info(f"Creating transaction with receipt_image_url: {transaction_data.get('receipt_image_url')}")
        transaction = appwrite_db.create_document('transactions', transaction_id, transaction_data)
        logger.info(f"Created transaction document: {transaction}")
        
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
        cloudinary_base = f"https://res.cloudinary.com/{os.getenv('CLOUDINARY_CLOUD_NAME')}/image/upload/"
        
        for txn in transactions:
            receipt_url = txn.get('receipt_image_url', '')
            
            # Only construct URL if it's a valid Cloudinary public_id
            if receipt_url and not receipt_url.startswith('http'):
                if receipt_url.startswith('bill_receipts/') or '/' in receipt_url:
                    receipt_url = cloudinary_base + receipt_url
                else:
                    receipt_url = ''
            elif receipt_url and not receipt_url.startswith('http'):
                receipt_url = ''
                
            transaction_list.append({
                'id': txn['$id'],
                'customer_id': txn.get('customer_id'),
                'customer_name': customer_map.get(txn.get('customer_id'), 'Unknown'),
                'amount': txn.get('amount'),
                'transaction_type': txn.get('transaction_type'),
                'notes': txn.get('notes'),
                'created_at': txn.get('created_at'),
                'receipt_image_url': receipt_url
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
        
        # Basic information
        if 'name' in data:
            update_data['name'] = data['name'].strip()
        if 'phone_number' in data:
            phone_number = data['phone_number'].strip()
            if phone_number and (not phone_number.isdigit() or len(phone_number) != 10):
                return jsonify({'error': 'Phone number must be exactly 10 digits'}), 400
            update_data['phone_number'] = phone_number
        if 'email' in data:
            update_data['email'] = data['email'].strip() if data['email'] else ''
        if 'gst_number' in data:
            update_data['gst_number'] = data['gst_number'].strip().upper() if data['gst_number'] else ''
        if 'description' in data:
            update_data['description'] = data['description'].strip() if data['description'] else ''
            
        # Location information
        if 'location' in data:
            update_data['location'] = data['location'].strip() if data['location'] else ''
        if 'address' in data:
            update_data['address'] = data['address'].strip() if data['address'] else ''
        if 'city' in data:
            update_data['city'] = data['city'].strip() if data['city'] else ''
        if 'state' in data:
            update_data['state'] = data['state'].strip() if data['state'] else ''
        if 'pincode' in data:
            pincode = data['pincode'].strip()
            if pincode and (not pincode.isdigit() or len(pincode) != 6):
                return jsonify({'error': 'PIN code must be exactly 6 digits'}), 400
            update_data['pincode'] = pincode
            
        # Business category and type
        if 'category' in data:
            update_data['category'] = data['category'].strip() if data['category'] else ''
        if 'subcategory' in data:
            update_data['subcategory'] = data['subcategory'].strip() if data['subcategory'] else ''
        if 'business_type' in data:
            update_data['business_type'] = data['business_type'].strip() if data['business_type'] else ''
        if 'custom_business_type' in data:
            update_data['custom_business_type'] = data['custom_business_type'].strip() if data['custom_business_type'] else ''
            
        # Social media links
        if 'website' in data:
            update_data['website'] = data['website'].strip() if data['website'] else ''
        if 'facebook' in data:
            update_data['facebook'] = data['facebook'].strip() if data['facebook'] else ''
        if 'instagram' in data:
            update_data['instagram'] = data['instagram'].strip() if data['instagram'] else ''
        if 'twitter' in data:
            update_data['twitter'] = data['twitter'].strip() if data['twitter'] else ''
        if 'linkedin' in data:
            update_data['linkedin'] = data['linkedin'].strip() if data['linkedin'] else ''
            
        # Operating hours and days
        if 'operating_hours_from' in data:
            update_data['operating_hours_from'] = data['operating_hours_from']
        if 'operating_hours_to' in data:
            update_data['operating_hours_to'] = data['operating_hours_to']
        if 'operating_days' in data:
            update_data['operating_days'] = data['operating_days']
            
        # Keywords
        if 'keywords' in data:
            update_data['keywords'] = data['keywords'] if isinstance(data['keywords'], list) else []
        
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

# ========== Location Endpoints ==========

@app.route('/api/location/update', methods=['POST'])
@token_required
@business_required
def update_location():
    """Update business location (latitude, longitude)"""
    try:
        business_id = request.business_id
        data = request.get_json()
        
        latitude = data.get('latitude')
        longitude = data.get('longitude')
        
        if latitude is None or longitude is None:
            return jsonify({'error': 'Latitude and longitude are required'}), 400
        
        # Validate coordinates
        try:
            lat = float(latitude)
            lng = float(longitude)
            
            if not (-90 <= lat <= 90):
                return jsonify({'error': 'Latitude must be between -90 and 90'}), 400
            if not (-180 <= lng <= 180):
                return jsonify({'error': 'Longitude must be between -180 and 180'}), 400
        except ValueError:
            return jsonify({'error': 'Invalid coordinate format'}), 400
        
        # Update business location
        update_data = {
            'latitude': lat,
            'longitude': lng,
            'location_updated_at': datetime.now().isoformat()
        }
        
        business = appwrite_db.update_document('businesses', business_id, update_data)
        
        return jsonify({
            'message': 'Location updated successfully',
            'location': {
                'latitude': lat,
                'longitude': lng
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Update location error: {str(e)}")
        return jsonify({'error': f'Failed to update location: {str(e)}'}), 500

@app.route('/api/location', methods=['GET'])
@token_required
@business_required
def get_location():
    """Get business location"""
    try:
        business_id = request.business_id
        
        business = appwrite_db.get_document('businesses', business_id)
        
        latitude = business.get('latitude')
        longitude = business.get('longitude')
        
        if latitude is None or longitude is None:
            return jsonify({
                'message': 'Location not set',
                'location': None
            }), 200
        
        return jsonify({
            'location': {
                'latitude': latitude,
                'longitude': longitude,
                'updated_at': business.get('location_updated_at')
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Get location error: {str(e)}")
        return jsonify({'error': f'Failed to get location: {str(e)}'}), 500

@app.route('/api/profile/regenerate-pin', methods=['POST'])
@token_required
@business_required
def regenerate_pin():
    """Regenerate business PIN"""
    try:
        business_id = request.business_id
        
        import random
        new_pin = ''.join([str(random.randint(0, 9)) for _ in range(4)])
        
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

@app.route('/api/business/qr-code', methods=['GET'])
@token_required
@business_required
def get_business_qr_code():
    """Generate QR code for business (alias endpoint for frontend compatibility)"""
    try:
        business_id = request.business_id
        
        business = appwrite_db.get_document('businesses', business_id)
        access_pin = business.get('access_pin')
        
        if not access_pin:
            return jsonify({'error': 'Business access PIN not found'}), 404
        
        # Create QR data with business ID and PIN
        qr_data = f"KATHAPE_BUSINESS:{business_id}:{access_pin}"
        
        # Generate QR code
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_H,
            box_size=10,
            border=4,
        )
        qr.add_data(qr_data)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="#7c3aed", back_color="white")
        
        # Convert to bytes
        img_io = BytesIO()
        img.save(img_io, 'PNG')
        img_io.seek(0)
        
        return send_file(img_io, mimetype='image/png', as_attachment=False)
        
    except Exception as e:
        logger.error(f"Generate business QR code error: {str(e)}")
        return jsonify({'error': f'Failed to generate QR code: {str(e)}'}), 500

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
                'subcategory': doc.get('subcategory', ''),
                'stock_quantity': doc['stock_quantity'],
                'unit': doc['unit'],
                'price': doc['price'],
                'hsn_code': doc.get('hsn_code', ''),
                'product_image_url': doc.get('product_image_url', ''),
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
        
        # Handle form data with file upload
        if request.content_type and 'multipart/form-data' in request.content_type:
            data = request.form.to_dict()
            product_image = request.files.get('product_image')
        else:
            data = request.json
            product_image = None
        
        # Validate required fields
        required_fields = ['name', 'category', 'subcategory', 'stock_quantity', 'unit', 'price']
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
        
        # Upload image to Cloudinary if provided
        product_image_url = ''
        if product_image:
            try:
                upload_result = cloudinary.uploader.upload(
                    product_image,
                    folder=f"kathape/products/{business_id}",
                    resource_type="image"
                )
                product_image_url = upload_result['secure_url']
                logger.info(f"Product image uploaded: {product_image_url}")
            except Exception as e:
                logger.error(f"Cloudinary upload error: {str(e)}")
        
        # Handle is_public field (can be bool or string)
        is_public_value = data.get('is_public', False)
        if isinstance(is_public_value, str):
            is_public = is_public_value.lower() == 'true'
        else:
            is_public = bool(is_public_value)
        
        # Create product document
        product_data = {
            'business_id': business_id,
            'name': data['name'].strip(),
            'description': data.get('description', '').strip(),
            'category': data['category'].strip(),
            'subcategory': data['subcategory'].strip(),
            'stock_quantity': stock_quantity,
            'unit': data['unit'].strip(),
            'price': price,
            'hsn_code': data.get('hsn_code', '').strip(),
            'product_image_url': product_image_url,
            'is_public': is_public,
            'low_stock_threshold': int(data.get('low_stock_threshold', 10))
        }
        
        # Save to database
        product_id = str(uuid.uuid4())
        result = appwrite_db.create_document('products', product_id, product_data)
        
        product = {
            'id': result['$id'],
            'name': result['name'],
            'description': result.get('description', ''),
            'category': result['category'],
            'subcategory': result['subcategory'],
            'stock_quantity': result['stock_quantity'],
            'unit': result['unit'],
            'price': result['price'],
            'hsn_code': result.get('hsn_code', ''),
            'product_image_url': result.get('product_image_url', ''),
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
            'subcategory': doc.get('subcategory', ''),
            'stock_quantity': doc['stock_quantity'],
            'unit': doc['unit'],
            'price': doc['price'],
            'hsn_code': doc.get('hsn_code', ''),
            'product_image_url': doc.get('product_image_url', ''),
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
        allowed_fields = ['name', 'description', 'category', 'subcategory', 'stock_quantity', 
                         'unit', 'price', 'hsn_code', 'product_image_url', 'is_public', 'low_stock_threshold']
        
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
            'subcategory': result.get('subcategory', ''),
            'stock_quantity': result['stock_quantity'],
            'unit': result['unit'],
            'price': result['price'],
            'product_image_url': result.get('product_image_url', ''),
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

# ============================================================================
# VOUCHER MANAGEMENT
# ============================================================================

@app.route('/api/vouchers', methods=['GET'])
@token_required
def get_vouchers():
    """Get all vouchers for business"""
    try:
        business_id = request.business_id
        
        # Query vouchers by business_id
        vouchers = appwrite_db.list_documents(
            'vouchers',
            queries=[Query.equal('business_id', business_id)]
        )
        
        return jsonify({'vouchers': vouchers}), 200
        
    except Exception as e:
        logger.error(f"Error fetching vouchers: {str(e)}")
        return jsonify({'error': 'Failed to fetch vouchers'}), 500

@app.route('/api/vouchers/<voucher_id>', methods=['GET'])
@token_required
def get_voucher(voucher_id):
    """Get a single voucher by ID"""
    try:
        business_id = request.business_id
        
        # Get voucher
        voucher = appwrite_db.get_document('vouchers', voucher_id)
        
        if not voucher or voucher.get('business_id') != business_id:
            return jsonify({'error': 'Voucher not found'}), 404
        
        return jsonify(voucher), 200
        
    except Exception as e:
        logger.error(f"Error fetching voucher: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/voucher', methods=['POST'])
@token_required
def create_voucher():
    """Create new voucher"""
    try:
        data = request.json
        business_id = request.business_id
        
        # Validate required fields
        required_fields = ['amount', 'validFrom', 'validUntil', 'quantity']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Create voucher
        voucher_id = str(uuid.uuid4())
        voucher_data = {
            'business_id': business_id,
            'title': data.get('title', ''),
            'description': data.get('description', ''),
            'amount': float(data['amount']),
            'minPurchase': float(data.get('minPurchase', 0)),
            'validFrom': data['validFrom'],
            'validUntil': data['validUntil'],
            'quantity': int(data['quantity']),
            'status': data.get('status', 'draft')
        }
        
        voucher = appwrite_db.create_document('vouchers', voucher_id, voucher_data)
        
        return jsonify({'voucher': voucher}), 201
        
    except Exception as e:
        logger.error(f"Error creating voucher: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/voucher/<voucher_id>', methods=['PUT'])
@token_required
def update_voucher(voucher_id):
    """Update voucher"""
    try:
        data = request.json
        business_id = request.business_id
        
        # Get existing voucher
        voucher = appwrite_db.get_document('vouchers', voucher_id)
        
        if not voucher or voucher.get('business_id') != business_id:
            return jsonify({'error': 'Voucher not found'}), 404
        
        # Update fields
        update_data = {}
        if 'title' in data:
            update_data['title'] = data['title']
        if 'description' in data:
            update_data['description'] = data['description']
        if 'amount' in data:
            update_data['amount'] = float(data['amount'])
        if 'minPurchase' in data:
            update_data['minPurchase'] = float(data['minPurchase'])
        if 'validFrom' in data:
            update_data['validFrom'] = data['validFrom']
        if 'validUntil' in data:
            update_data['validUntil'] = data['validUntil']
        if 'quantity' in data:
            update_data['quantity'] = int(data['quantity'])
        if 'status' in data:
            update_data['status'] = data['status']
        
        updated_voucher = appwrite_db.update_document('vouchers', voucher_id, update_data)
        
        return jsonify({'voucher': updated_voucher}), 200
        
    except Exception as e:
        logger.error(f"Error updating voucher: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/voucher/<voucher_id>/toggle', methods=['PUT'])
@token_required
def toggle_voucher(voucher_id):
    """Toggle voucher status between active and draft"""
    try:
        business_id = request.business_id
        
        # Get existing voucher
        voucher = appwrite_db.get_document('vouchers', voucher_id)
        
        if not voucher or voucher.get('business_id') != business_id:
            return jsonify({'error': 'Voucher not found'}), 404
        
        # Toggle status
        current_status = voucher.get('status', 'draft')
        new_status = 'draft' if current_status == 'active' else 'active'
        updated_voucher = appwrite_db.update_document(
            'vouchers',
            voucher_id,
            {'status': new_status}
        )
        
        return jsonify({'voucher': updated_voucher}), 200
        
    except Exception as e:
        logger.error(f"Error toggling voucher: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/voucher/<voucher_id>', methods=['DELETE'])
@token_required
def delete_voucher(voucher_id):
    """Delete voucher"""
    try:
        business_id = request.business_id
        
        # Get existing voucher
        voucher = appwrite_db.get_document('vouchers', voucher_id)
        
        if not voucher or voucher.get('business_id') != business_id:
            return jsonify({'error': 'Voucher not found'}), 404
        
        # Delete voucher
        appwrite_db.delete_document('vouchers', voucher_id)
        
        return jsonify({'message': 'Voucher deleted successfully'}), 200
        
    except Exception as e:
        logger.error(f"Error deleting voucher: {str(e)}")
        return jsonify({'error': 'Failed to delete voucher'}), 500

# ============================================================================
# OFFER MANAGEMENT
# ============================================================================

@app.route('/api/offers', methods=['GET'])
@token_required
def get_offers():
    """Get all offers for business"""
    try:
        business_id = request.business_id
        
        # Query offers by business_id
        offers = appwrite_db.list_documents(
            'offers',
            queries=[Query.equal('business_id', business_id)]
        )
        
        return jsonify({'offers': offers}), 200
        
    except Exception as e:
        logger.error(f"Error fetching offers: {str(e)}")
        return jsonify({'error': 'Failed to fetch offers'}), 500

@app.route('/api/offers/<offer_id>', methods=['GET'])
@token_required
def get_offer(offer_id):
    """Get a single offer by ID"""
    try:
        business_id = request.business_id
        
        # Get offer
        offer = appwrite_db.get_document('offers', offer_id)
        
        if not offer or offer.get('business_id') != business_id:
            return jsonify({'error': 'Offer not found'}), 404
        
        return jsonify(offer), 200
        
    except Exception as e:
        logger.error(f"Error fetching offer: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/offer', methods=['POST'])
@token_required
def create_offer():
    """Create new offer"""
    try:
        business_id = request.business_id
        data = request.json
        
        # Validate required fields
        required_fields = ['name', 'offerType', 'startDate', 'endDate']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Create offer
        offer_id = str(uuid.uuid4())
        offer_data = {
            'business_id': business_id,
            'name': data['name'],
            'description': data.get('description', ''),
            'offerType': data['offerType'],
            'discountValue': float(data['discountValue']) if data.get('discountValue') else None,
            'buyQuantity': int(data['buyQuantity']) if data.get('buyQuantity') else None,
            'getQuantity': int(data['getQuantity']) if data.get('getQuantity') else None,
            'specialPrice': float(data['specialPrice']) if data.get('specialPrice') else None,
            'originalPrice': float(data['originalPrice']) if data.get('originalPrice') else None,
            'applicableOn': data.get('applicableOn', 'entire_store'),
            'minPurchase': float(data.get('minPurchase', 0)),
            'maxDiscount': float(data.get('maxDiscount', 0)),
            'startDate': data['startDate'],
            'endDate': data['endDate'],
            'status': data.get('status', 'active')
        }
        
        offer = appwrite_db.create_document('offers', offer_id, offer_data)
        
        return jsonify({'offer': offer}), 201
        
    except Exception as e:
        logger.error(f"Error creating offer: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/offer/<offer_id>', methods=['PUT'])
@token_required
def update_offer(offer_id):
    """Update offer"""
    try:
        business_id = request.business_id
        data = request.json
        
        # Get existing offer
        offer = appwrite_db.get_document('offers', offer_id)
        
        if not offer or offer.get('business_id') != business_id:
            return jsonify({'error': 'Offer not found'}), 404
        
        # Update fields
        update_data = {}
        if 'name' in data:
            update_data['name'] = data['name']
        if 'description' in data:
            update_data['description'] = data['description']
        if 'offerType' in data:
            update_data['offerType'] = data['offerType']
        if 'discountValue' in data:
            update_data['discountValue'] = float(data['discountValue']) if data['discountValue'] else None
        if 'buyQuantity' in data:
            update_data['buyQuantity'] = int(data['buyQuantity']) if data['buyQuantity'] else None
        if 'getQuantity' in data:
            update_data['getQuantity'] = int(data['getQuantity']) if data['getQuantity'] else None
        if 'specialPrice' in data:
            update_data['specialPrice'] = float(data['specialPrice']) if data['specialPrice'] else None
        if 'originalPrice' in data:
            update_data['originalPrice'] = float(data['originalPrice']) if data['originalPrice'] else None
        if 'applicableOn' in data:
            update_data['applicableOn'] = data['applicableOn']
        if 'minPurchase' in data:
            update_data['minPurchase'] = float(data['minPurchase'])
        if 'maxDiscount' in data:
            update_data['maxDiscount'] = float(data['maxDiscount'])
        if 'startDate' in data:
            update_data['startDate'] = data['startDate']
        if 'endDate' in data:
            update_data['endDate'] = data['endDate']
        if 'status' in data:
            update_data['status'] = data['status']
        
        updated_offer = appwrite_db.update_document('offers', offer_id, update_data)
        
        return jsonify({'offer': updated_offer}), 200
        
    except Exception as e:
        logger.error(f"Error updating offer: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/offer/<offer_id>/toggle', methods=['PUT'])
@token_required
def toggle_offer(offer_id):
    """Toggle offer status between active and inactive"""
    try:
        business_id = request.business_id
        
        # Get existing offer
        offer = appwrite_db.get_document('offers', offer_id)
        
        if not offer or offer.get('business_id') != business_id:
            return jsonify({'error': 'Offer not found'}), 404
        
        # Toggle status
        current_status = offer.get('status', 'active')
        new_status = 'inactive' if current_status == 'active' else 'active'
        updated_offer = appwrite_db.update_document(
            'offers',
            offer_id,
            {'status': new_status}
        )
        
        return jsonify({'offer': updated_offer}), 200
        
    except Exception as e:
        logger.error(f"Error toggling offer: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/offer/<offer_id>', methods=['DELETE'])
@token_required
def delete_offer(offer_id):
    """Delete offer"""
    try:
        business_id = request.business_id
        
        # Get existing offer
        offer = appwrite_db.get_document('offers', offer_id)
        
        if not offer or offer.get('business_id') != business_id:
            return jsonify({'error': 'Offer not found'}), 404
        
        # Delete offer
        appwrite_db.delete_document('offers', offer_id)
        
        return jsonify({'message': 'Offer deleted successfully'}), 200
        
    except Exception as e:
        logger.error(f"Error deleting offer: {str(e)}")
        return jsonify({'error': 'Failed to delete offer'}), 500

# ============================================================================
# INVOICE GENERATION
# ============================================================================

def number_to_words(num):
    """Convert number to words (Indian format)"""
    try:
        if not isinstance(num, int):
            num = int(num)
    except Exception:
        return str(num)

    if num < 0:
        return 'Minus ' + number_to_words(abs(num))

    ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine']
    tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']
    teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']

    def convert_below_thousand(n):
        if n == 0:
            return ''
        elif n < 10:
            return ones[n]
        elif n < 20:
            return teens[n - 10]
        elif n < 100:
            return tens[n // 10] + (' ' + ones[n % 10] if n % 10 != 0 else '')
        else:
            return ones[n // 100] + ' Hundred' + (' ' + convert_below_thousand(n % 100) if n % 100 != 0 else '')

    if num == 0:
        return 'Zero'
    elif num < 1000:
        return convert_below_thousand(num)
    elif num < 100000:
        return convert_below_thousand(num // 1000) + ' Thousand' + (' ' + convert_below_thousand(num % 1000) if num % 1000 != 0 else '')
    elif num < 10000000:
        return convert_below_thousand(num // 100000) + ' Lakh' + (' ' + convert_below_thousand(num % 100000) if num % 100000 != 0 else '')
    elif num < 1000000000:
        return convert_below_thousand(num // 10000000) + ' Crore' + (' ' + convert_below_thousand(num % 10000000) if num % 10000000 != 0 else '')
    else:
        return str(num)

def create_invoice_pdf(data):
    """Generate tax invoice PDF"""
    try:
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=30, leftMargin=30, topMargin=30, bottomMargin=30)
        elements = []
        styles = getSampleStyleSheet()
        
        # Title
        title_style = ParagraphStyle('Title', parent=styles['Heading1'], fontSize=18, textColor=colors.HexColor('#000000'),
                                    alignment=TA_CENTER, spaceAfter=20, fontName='Helvetica-Bold')
        elements.append(Paragraph("TAX INVOICE", title_style))
        elements.append(Spacer(1, 10))
        
        # Invoice details
        invoice_date = datetime.now().strftime("%d-%b-%y")
        invoice_number = f"2025-26/{datetime.now().strftime('%m%d%H%M')}"
        
        # Header table
        seller_info = f"""<b>{data.get('seller_name', '')}</b><br/>{data.get('seller_address', '')}<br/>
        {data.get('seller_city', '')}, {data.get('seller_state', '')} - {data.get('seller_pincode', '')}<br/>
        GSTIN/UIN: {data.get('seller_gstin', '')}<br/>
        State Name: {data.get('seller_state_name', '')}, Code: {data.get('seller_state_code', '')}"""
        
        buyer_info = f"""<b>{data.get('buyer_name', '')}</b><br/>{data.get('buyer_address', '')}<br/>
        {data.get('buyer_city', '')}, {data.get('buyer_state', '')} - {data.get('buyer_pincode', '')}<br/>
        {"GSTIN/UIN: " + data.get('buyer_gstin', '') if data.get('buyer_gstin') else ''}<br/>
        {"State Code: " + data.get('buyer_state_code', '') if data.get('buyer_state_code') else ''}"""
        
        invoice_meta = f"""<b>Invoice No.</b> {invoice_number}<br/><b>Dated:</b> {invoice_date}<br/>
        {"<b>Vehicle No:</b> " + data.get('vehicle_number', '') if data.get('vehicle_number') else ''}"""
        
        header_data = [
            [Paragraph(seller_info, styles['Normal']), Paragraph(invoice_meta, styles['Normal'])],
            [Paragraph("<b>Buyer (Bill to)</b>", styles['Normal']), ''],
            [Paragraph(buyer_info, styles['Normal']), '']
        ]
        
        header_table = Table(header_data, colWidths=[4*inch, 3.5*inch])
        header_table.setStyle(TableStyle([
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('PADDING', (0, 0), (-1, -1), 10),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
        ]))
        elements.append(header_table)
        elements.append(Spacer(1, 15))
        
        # Items table
        items = data.get('items', [])
        cgst_rate = float(data.get('cgst_rate', 9))
        sgst_rate = float(data.get('sgst_rate', 9))
        
        subtotal = 0
        items_data = [['Sl', 'Description of Goods', 'HSN/SAC', 'Quantity', 'Rate', 'per', 'Amount']]
        hsn_codes = []
        
        for idx, item in enumerate(items, 1):
            if not item.get('description'):
                continue
            qty = float(item.get('quantity', 0))
            rate = float(item.get('rate', 0))
            amount = qty * rate
            subtotal += amount
            
            hsn = item.get('hsn_code', '')
            if hsn and hsn not in hsn_codes:
                hsn_codes.append(hsn)
            
            items_data.append([
                str(idx), item.get('description', ''), hsn,
                f"{qty} {item.get('unit', 'Nos')}", f"Rs {rate:,.2f}",
                item.get('unit', 'Nos'), f"Rs {amount:,.2f}"
            ])
        
        items_data.append(['', '', '', '', '', 'Total', f"Rs {subtotal:,.2f}"])
        
        items_table = Table(items_data, colWidths=[0.4*inch, 3*inch, 0.8*inch, 0.9*inch, 0.9*inch, 0.5*inch, 1*inch])
        items_table.setStyle(TableStyle([
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#666666')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('PADDING', (0, 0), (-1, -1), 6),
            ('ALIGN', (3, 1), (6, -1), 'RIGHT'),
        ]))
        elements.append(items_table)
        elements.append(Spacer(1, 10))
        
        # Tax calculation
        cgst_amount = (subtotal * cgst_rate) / 100
        sgst_amount = (subtotal * sgst_rate) / 100
        total = subtotal + cgst_amount + sgst_amount
        hsn_display = hsn_codes[0] if hsn_codes else ''
        
        tax_data = [
            ['HSN/SAC', 'Taxable Value', 'CGST', '', 'SGST/UTGST', '', 'Total Tax Amount'],
            ['', '', 'Rate', 'Amount', 'Rate', 'Amount', ''],
            [hsn_display, f"Rs {subtotal:,.2f}", f"{cgst_rate}%", f"Rs {cgst_amount:,.2f}",
             f"{sgst_rate}%", f"Rs {sgst_amount:,.2f}", f"Rs {(cgst_amount + sgst_amount):,.2f}"],
            ['', f"Total Rs {subtotal:,.2f}", '', '', '', '', f"Rs {(cgst_amount + sgst_amount):,.2f}"]
        ]
        
        tax_table = Table(tax_data, colWidths=[0.8*inch, 1.3*inch, 0.6*inch, 1*inch, 0.8*inch, 1*inch, 1*inch])
        tax_table.setStyle(TableStyle([
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('BACKGROUND', (0, 0), (-1, 1), colors.HexColor('#666666')),
            ('TEXTCOLOR', (0, 0), (-1, 1), colors.whitesmoke),
            ('SPAN', (0, 0), (0, 1)), ('SPAN', (1, 0), (1, 1)), ('SPAN', (2, 0), (3, 0)),
            ('SPAN', (4, 0), (5, 0)), ('SPAN', (6, 0), (6, 1)),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('PADDING', (0, 0), (-1, -1), 6),
        ]))
        elements.append(tax_table)
        elements.append(Spacer(1, 10))
        
        # Amount in words
        total_int = int(total)
        amount_words = f"INR {number_to_words(total_int)} Only"
        amount_words_data = [[f"Amount Chargeable (in words): {amount_words}", f"Rs {total:,.2f}"]]
        amount_words_table = Table(amount_words_data, colWidths=[5.5*inch, 2*inch])
        amount_words_table.setStyle(TableStyle([
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('PADDING', (0, 0), (-1, -1), 8),
            ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
        ]))
        elements.append(amount_words_table)
        elements.append(Spacer(1, 15))
        
        # Notes
        if data.get('notes'):
            elements.append(Paragraph(f"<b>Notes:</b> {data.get('notes', '')}", styles['Normal']))
            elements.append(Spacer(1, 10))
        
        # Declaration and signature
        declaration_style = ParagraphStyle('Declaration', parent=styles['Normal'], fontSize=9, spaceAfter=10)
        elements.append(Spacer(1, 10))
        elements.append(Paragraph("<b>Declaration:</b>", declaration_style))
        elements.append(Paragraph("We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.", declaration_style))
        elements.append(Spacer(1, 20))
        
        signature_style = ParagraphStyle('Signature', parent=styles['Normal'], fontSize=9, alignment=TA_RIGHT)
        elements.append(Paragraph(f"<b>For {data.get('seller_name', '')}</b>", signature_style))
        elements.append(Spacer(1, 30))
        elements.append(Paragraph("Authorised Signatory", signature_style))
        
        footer_style = ParagraphStyle('Footer', parent=styles['Normal'], fontSize=8, alignment=TA_CENTER)
        elements.append(Paragraph("This is a Computer Generated Invoice", footer_style))
        
        doc.build(elements)
        buffer.seek(0)
        return buffer
    except Exception as e:
        raise Exception(f"Error creating PDF: {str(e)}")

@app.route('/api/generate-invoice', methods=['POST'])
@token_required
@business_required
def generate_invoice():
    """Generate invoice PDF from provided data"""
    try:
        business_id = request.business_id
        
        if not request.json:
            return jsonify({'error': 'No data provided'}), 400
        
        data = request.json
        
        # Validate required buyer fields
        required_fields = ['buyer_name', 'buyer_address', 'buyer_city', 'buyer_state', 'buyer_pincode']
        missing_fields = [field for field in required_fields if not data.get(field)]
        
        if missing_fields:
            return jsonify({'error': f'Missing required fields: {", ".join(missing_fields)}'}), 400
        
        # Validate items
        items = data.get('items', [])
        if not items or not isinstance(items, list):
            return jsonify({'error': 'Please add at least one item'}), 400
        
        has_valid_item = any(item.get('description') and item.get('quantity') and item.get('rate') for item in items)
        if not has_valid_item:
            return jsonify({'error': 'At least one item must have description, quantity, and rate'}), 400
        
        # Get business details to auto-fill seller info
        business = appwrite_db.get_document('businesses', business_id)
        
        # Merge business details with provided data
        invoice_data = {
            'seller_name': data.get('seller_name') or business.get('name', ''),
            'seller_address': data.get('seller_address') or business.get('address', ''),
            'seller_city': data.get('seller_city') or business.get('city', ''),
            'seller_state': data.get('seller_state') or business.get('state', ''),
            'seller_pincode': data.get('seller_pincode') or business.get('pincode', ''),
            'seller_gstin': data.get('seller_gstin') or business.get('gst_number', ''),
            'seller_state_name': data.get('seller_state_name') or business.get('state', ''),
            'seller_state_code': data.get('seller_state_code', ''),
            **data
        }
        
        pdf_buffer = create_invoice_pdf(invoice_data)
        
        buyer_name_safe = data.get('buyer_name', 'customer').replace(' ', '_')
        filename = f"invoice_{buyer_name_safe}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        
        return send_file(pdf_buffer, mimetype='application/pdf', as_attachment=True, download_name=filename)
        
    except Exception as e:
        logger.error(f"Generate invoice error: {str(e)}")
        return jsonify({'error': str(e)}), 500

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
