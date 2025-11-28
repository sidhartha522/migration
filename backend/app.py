"""
KathaPe Business - Backend API Server
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

# Enable CORS
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000", "http://localhost:5173", "http://localhost:5174"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

# JWT token helper functions
def create_access_token(user_id, user_type, business_id=None):
    """Create JWT access token"""
    payload = {
        'user_id': user_id,
        'user_type': user_type,
        'business_id': business_id,
        'exp': datetime.utcnow() + timedelta(days=7)  # Token expires in 7 days
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
        'service': 'KathaPe Business API',
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
            'phone_number': phone,
            'password': generate_password_hash(password),
            'user_type': 'business',
            'created_at': datetime.utcnow().isoformat()
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
            'pin': business_pin,
            'is_active': True,
            'created_at': datetime.utcnow().isoformat()
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
                'business_pin': business_pin
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
                'business_pin': business.get('pin')
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
            Query.equal('business_id', [business_id])
        ])
        
        # Get all transactions
        transactions = appwrite_db.list_documents('transactions', [
            Query.equal('business_id', [business_id]),
            Query.order_desc('created_at'),
            Query.limit(100)
        ])
        
        # Calculate statistics
        total_customers = len(customers)
        total_credit = sum(float(t.get('amount', 0)) for t in transactions if t.get('type') == 'credit')
        total_payment = sum(float(t.get('amount', 0)) for t in transactions if t.get('type') == 'payment')
        outstanding_balance = total_credit - total_payment
        
        # Get pending payments (customers with positive balance)
        pending_customers = []
        for customer in customers:
            customer_transactions = [t for t in transactions if t.get('customer_id') == customer['$id']]
            customer_credit = sum(float(t.get('amount', 0)) for t in customer_transactions if t.get('type') == 'credit')
            customer_payment = sum(float(t.get('amount', 0)) for t in customer_transactions if t.get('type') == 'payment')
            customer_balance = customer_credit - customer_payment
            
            if customer_balance > 0:
                pending_customers.append({
                    'id': customer['$id'],
                    'name': customer.get('name'),
                    'phone': customer.get('phone'),
                    'balance': customer_balance
                })
        
        # Get recent transactions (last 10)
        recent_transactions = transactions[:10] if transactions else []
        
        return jsonify({
            'business': {
                'id': business['$id'],
                'name': business['name'],
                'phone': business.get('phone'),
                'pin': business.get('pin')
            },
            'summary': {
                'total_customers': total_customers,
                'total_credit': total_credit,
                'total_payment': total_payment,
                'outstanding_balance': outstanding_balance,
                'pending_customers_count': len(pending_customers)
            },
            'recent_transactions': recent_transactions,
            'pending_customers': pending_customers[:5]  # Top 5
        }), 200
        
    except Exception as e:
        logger.error(f"Dashboard error: {str(e)}")
        return jsonify({'error': f'Failed to load dashboard: {str(e)}'}), 500

# ========== Customer Management Endpoints ==========

@app.route('/api/customers', methods=['GET'])
@token_required
@business_required
def get_customers():
    """Get all customers for business"""
    try:
        business_id = request.business_id
        
        customers = appwrite_db.list_documents('customers', [
            Query.equal('business_id', [business_id])
        ])
        
        # Get transactions to calculate balances
        transactions = appwrite_db.list_documents('transactions', [
            Query.equal('business_id', [business_id])
        ])
        
        # Calculate balance for each customer
        for customer in customers:
            customer_transactions = [t for t in transactions if t.get('customer_id') == customer['$id']]
            customer_credit = sum(float(t.get('amount', 0)) for t in customer_transactions if t.get('type') == 'credit')
            customer_payment = sum(float(t.get('amount', 0)) for t in customer_transactions if t.get('type') == 'payment')
            customer['balance'] = customer_credit - customer_payment
            customer['transaction_count'] = len(customer_transactions)
        
        return jsonify({'customers': customers}), 200
        
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
            Query.equal('business_id', [business_id]),
            Query.equal('customer_id', [customer_id]),
            Query.order_desc('created_at')
        ])
        
        # Calculate balance
        total_credit = sum(float(t.get('amount', 0)) for t in transactions if t.get('type') == 'credit')
        total_payment = sum(float(t.get('amount', 0)) for t in transactions if t.get('type') == 'payment')
        balance = total_credit - total_payment
        
        return jsonify({
            'customer': customer,
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
            Query.equal('business_id', [business_id]),
            Query.order_desc('created_at')
        ])
        
        # Get customer names
        customers = appwrite_db.list_documents('customers', [
            Query.equal('business_id', [business_id])
        ])
        customer_map = {c['$id']: c.get('name', 'Unknown') for c in customers}
        
        for transaction in transactions:
            transaction['customer_name'] = customer_map.get(transaction.get('customer_id'), 'Unknown')
        
        return jsonify({'transactions': transactions}), 200
        
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
            Query.equal('business_id', [business_id]),
            Query.order_desc('created_at')
        ])
        
        # Get customer names
        customers = appwrite_db.list_documents('customers', [
            Query.equal('business_id', [business_id])
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
    """Get business profile"""
    try:
        business_id = request.business_id
        
        business = appwrite_db.get_document('businesses', business_id)
        
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
    """Send reminder to specific customer"""
    try:
        business_id = request.business_id
        
        # Verify customer belongs to business
        customer = appwrite_db.get_document('customers', customer_id)
        if customer.get('business_id') != business_id:
            return jsonify({'error': 'Access denied'}), 403
        
        # In production, this would integrate with SMS/WhatsApp API
        # For now, just return success
        logger.info(f"Reminder sent to customer {customer_id}")
        
        return jsonify({'message': f'Reminder sent to {customer.get("name")}'}), 200
        
    except Exception as e:
        logger.error(f"Send reminder error: {str(e)}")
        return jsonify({'error': f'Failed to send reminder: {str(e)}'}), 500

@app.route('/api/customers/remind-all', methods=['POST'])
@token_required
@business_required
def remind_all_customers():
    """Send reminders to all customers with pending balance"""
    try:
        business_id = request.business_id
        
        # Get all customers
        customers = appwrite_db.list_documents('customers', [
            Query.equal('business_id', [business_id])
        ])
        
        # Get transactions to calculate balances
        transactions = appwrite_db.list_documents('transactions', [
            Query.equal('business_id', [business_id])
        ])
        
        reminded_count = 0
        for customer in customers:
            customer_transactions = [t for t in transactions if t.get('customer_id') == customer['$id']]
            customer_credit = sum(float(t.get('amount', 0)) for t in customer_transactions if t.get('type') == 'credit')
            customer_payment = sum(float(t.get('amount', 0)) for t in customer_transactions if t.get('type') == 'payment')
            customer_balance = customer_credit - customer_payment
            
            if customer_balance > 0:
                # In production, send SMS/WhatsApp reminder
                logger.info(f"Reminder sent to customer {customer['$id']}")
                reminded_count += 1
        
        return jsonify({
            'message': f'Reminders sent to {reminded_count} customers',
            'count': reminded_count
        }), 200
        
    except Exception as e:
        logger.error(f"Send bulk reminders error: {str(e)}")
        return jsonify({'error': f'Failed to send reminders: {str(e)}'}), 500

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
