# KathaPe Business - React Migration

Complete migration of KathaPe Business application from Flask monolithic to React + Flask REST API architecture.

## 📁 Project Structure

```
Kathape-React-Business/
├── backend/                 # Flask REST API Server
│   ├── app.py              # Main API application
│   ├── appwrite_utils.py   # Appwrite database utilities
│   ├── requirements.txt    # Python dependencies
│   ├── .env.example        # Environment variables template
│   └── .env                # Your environment variables (create this)
│
└── frontend/               # React Frontend Application
    ├── src/
    │   ├── pages/          # Page components
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Customers.jsx
    │   │   ├── CustomerDetails.jsx
    │   │   ├── AddCustomer.jsx
    │   │   ├── Transactions.jsx
    │   │   ├── AddTransaction.jsx
    │   │   ├── RecurringTransactions.jsx
    │   │   ├── AddRecurringTransaction.jsx
    │   │   ├── Profile.jsx
    │   │   └── BulkReminders.jsx
    │   │
    │   ├── components/     # Reusable components
    │   │   └── Layout.jsx
    │   │
    │   ├── context/        # React Context
    │   │   └── AuthContext.jsx
    │   │
    │   ├── services/       # API services
    │   │   └── api.js
    │   │
    │   ├── styles/         # CSS files
    │   │   ├── Auth.css
    │   │   ├── Layout.css
    │   │   ├── Dashboard.css
    │   │   ├── Customers.css
    │   │   ├── CustomerDetails.css
    │   │   ├── Form.css
    │   │   ├── Transactions.css
    │   │   ├── RecurringTransactions.css
    │   │   ├── BulkReminders.css
    │   │   └── Profile.css
    │   │
    │   ├── App.jsx         # Main app component
    │   ├── App.css         # Global styles
    │   └── main.jsx        # Entry point
    │
    ├── package.json
    ├── vite.config.js
    └── .env                # Frontend environment variables
```

## 🚀 Features

### Business Management
- **Dashboard**: Real-time overview of business metrics
  - Total customers
  - Total credit given
  - Total payments received
  - Outstanding balance
  - Recent transactions
  - Pending customers list

### Customer Management
- **Customers List**: View all customers with balances
- **Customer Details**: Complete transaction history per customer
- **Add Customer**: Register new customers
- **Send Reminders**: Individual or bulk payment reminders

### Transaction Management
- **Credit Transactions**: Record money given to customers
- **Payment Transactions**: Record payments received
- **Bill Images**: Upload and store receipt images (via Cloudinary)
- **Transaction History**: Complete audit trail

### Recurring Transactions
- **Auto Credits**: Set up automatic recurring credit transactions
- **Frequencies**: Daily, Weekly, or Monthly
- **Active/Inactive**: Toggle recurring transactions on/off
- **Manage**: Edit or delete recurring transactions

### Profile Management
- **Business PIN**: 6-digit PIN for customer connection
- **QR Code**: Generate QR code for easy PIN sharing
- **Regenerate PIN**: Create new PIN when needed
- **Update Details**: Edit business name and phone

## 🛠️ Technology Stack

### Backend
- **Flask 2.2.3**: Web framework
- **Flask-CORS**: Cross-origin resource sharing
- **Appwrite 4.1.0**: NoSQL database
- **Cloudinary**: Image storage
- **PyJWT**: JWT authentication
- **QRCode**: QR code generation
- **Werkzeug**: Security utilities

### Frontend
- **React 18**: UI library
- **Vite 7.x**: Build tool
- **React Router v6**: Routing
- **Axios**: HTTP client
- **CSS3**: Styling

### Database (Appwrite Collections)
- `users`: Business user accounts
- `businesses`: Business profiles
- `customers`: Customer information
- `transactions`: All financial transactions
- `recurring_transactions`: Automated recurring credits

## 📋 Prerequisites

- **Python 3.8+**
- **Node.js 16+**
- **Appwrite Account** (cloud.appwrite.io)
- **Cloudinary Account** (cloudinary.com)

## ⚙️ Setup Instructions

### 1. Backend Setup

```bash
cd Kathape-React-Business/backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file from template
cp .env.example .env

# Edit .env with your credentials
nano .env
```

**Required Environment Variables (.env):**
```env
# Flask
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-here
FLASK_ENV=development

# Appwrite
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your_project_id
APPWRITE_API_KEY=your_api_key
APPWRITE_DATABASE_ID=kathape_business

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Server
PORT=5003
```

### 2. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Environment is already configured in .env
# Verify VITE_API_URL=http://localhost:5003/api
```

### 3. Appwrite Setup

Create the following collections in your Appwrite database:

**Collection: users**
- Attributes:
  - `phone` (string, required)
  - `password` (string, required)
  - `user_type` (string, required)
  - `created_at` (string)

**Collection: businesses**
- Attributes:
  - `user_id` (string, required)
  - `name` (string, required)
  - `phone` (string)
  - `pin` (string, required)
  - `is_active` (boolean)
  - `created_at` (string)

**Collection: customers**
- Attributes:
  - `business_id` (string, required)
  - `name` (string, required)
  - `phone` (string, required)
  - `created_at` (string)

**Collection: transactions**
- Attributes:
  - `business_id` (string, required)
  - `customer_id` (string, required)
  - `type` (string, required) # credit or payment
  - `amount` (float, required)
  - `notes` (string)
  - `receipt_image_url` (string)
  - `created_at` (string)

**Collection: recurring_transactions**
- Attributes:
  - `business_id` (string, required)
  - `customer_id` (string, required)
  - `amount` (float, required)
  - `frequency` (string, required) # daily, weekly, monthly
  - `notes` (string)
  - `is_active` (boolean)
  - `next_execution_date` (string)
  - `created_at` (string)

### 4. Run the Application

**Option 1: Manual Start**

Terminal 1 (Backend):
```bash
cd Kathape-React-Business/backend
source venv/bin/activate
python app.py
```

Terminal 2 (Frontend):
```bash
cd Kathape-React-Business/frontend
npm run dev
```

**Option 2: Using root scripts (if you update start.sh)**

```bash
# From repository root
./start.sh
```

## 🌐 Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5003/api
- **Health Check**: http://localhost:5003/api/health

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new business
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout

### Dashboard
- `GET /api/dashboard` - Get dashboard data

### Customers
- `GET /api/customers` - List all customers
- `GET /api/customer/:id` - Get customer details
- `POST /api/customer` - Add new customer
- `POST /api/customer/:id/remind` - Send reminder to customer
- `POST /api/customers/remind-all` - Send bulk reminders

### Transactions
- `GET /api/transactions` - List all transactions
- `POST /api/transaction` - Create transaction (with optional bill image)
- `GET /api/transaction/:id/bill` - Get bill image URL

### Recurring Transactions
- `GET /api/recurring-transactions` - List recurring transactions
- `POST /api/recurring-transaction` - Create recurring transaction
- `PUT /api/recurring-transaction/:id/toggle` - Toggle active status
- `DELETE /api/recurring-transaction/:id` - Delete recurring transaction

### Profile
- `GET /api/profile` - Get business profile
- `PUT /api/profile` - Update business profile
- `POST /api/profile/regenerate-pin` - Regenerate business PIN
- `GET /api/profile/qr` - Get QR code image

## 🔒 Authentication

The application uses JWT (JSON Web Tokens) for authentication:

1. User logs in → receives JWT token
2. Token stored in `localStorage`
3. Token sent in `Authorization: Bearer <token>` header for all API requests
4. Token expires after 7 days

## 📱 Usage Flow

1. **Register**: Business owner creates account
   - Receives unique 6-digit PIN
   - PIN used by customers to connect

2. **Add Customers**: Register customer details
   - Name and phone number

3. **Record Transactions**:
   - **Credit**: Money given to customer
   - **Payment**: Money received from customer
   - Optional: Upload bill/receipt image

4. **Set Up Recurring**: Automate regular credits
   - Choose customer
   - Set amount and frequency
   - System auto-creates transactions

5. **Send Reminders**: Notify customers of pending payments
   - Individual reminders from customer details
   - Bulk reminders to all pending customers

6. **Manage Profile**: Update business info and PIN

## 🎨 Styling

The application uses custom CSS with a modern color scheme:
- Primary: #667eea (Purple)
- Secondary: Various shades of gray
- Success: #10b981 (Green)
- Warning: #fbbf24 (Yellow)
- Danger: #ef4444 (Red)

## 🐛 Troubleshooting

### Backend Issues

**Import errors:**
```bash
pip install -r requirements.txt
```

**Port already in use:**
```bash
lsof -ti:5003 | xargs kill -9
```

**Appwrite connection error:**
- Verify credentials in `.env`
- Check Appwrite project status

### Frontend Issues

**Module not found:**
```bash
npm install
```

**API connection error:**
- Ensure backend is running
- Check `.env` has correct API URL

**CORS errors:**
- Verify backend CORS configuration
- Check frontend URL in backend CORS settings

## 📊 Migration Differences from Customer App

### New Features in Business App:
1. **Recurring Transactions**: Automated credit scheduling
2. **Bulk Reminders**: Send reminders to multiple customers
3. **Business PIN System**: 6-digit PIN for customer connection
4. **QR Code Generation**: Easy PIN sharing
5. **Dashboard Analytics**: More detailed business metrics
6. **Customer Balance Tracking**: Real-time outstanding calculations

### Port Differences:
- Customer Backend: Port 5002
- Business Backend: Port 5003
- Both Frontends: Port 5173 (change as needed)

## 🔄 Development

### Backend Development
```bash
cd backend
source venv/bin/activate
python app.py
```

### Frontend Development
```bash
cd frontend
npm run dev
```

### Build for Production
```bash
cd frontend
npm run build
```

## 📝 Notes

- JWT tokens expire after 7 days
- Maximum file upload size: 16MB
- Supported image formats: PNG, JPG, JPEG, GIF
- Business PIN is 6 digits (auto-generated)
- All monetary values stored as floats
- Timestamps in ISO 8601 format

## 🆘 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review backend logs: `logs/backend.log`
3. Review frontend logs: `logs/frontend.log`
4. Verify environment variables are correct

## ✅ Migration Complete!

This is a complete React + Flask REST API implementation of the KathaPe Business application with all features preserved from the original Flask monolithic version.
