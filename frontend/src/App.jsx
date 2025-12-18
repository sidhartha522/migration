import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import CustomerDetails from './pages/CustomerDetails';
import AddCustomer from './pages/AddCustomer';
import AddTransaction from './pages/AddTransaction';
import Transactions from './pages/Transactions';
import RecurringTransactions from './pages/RecurringTransactions';
import Profile from './pages/Profile';
import ProfileEdit from './pages/ProfileEdit';
import BulkReminders from './pages/BulkReminders';
import Products from './pages/Products';
import AddEditProduct from './pages/AddEditProduct';
import InvoiceGenerator from './pages/InvoiceGenerator';
import './styles/App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customers"
              element={
                <ProtectedRoute>
                  <Customers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customer/:customerId"
              element={
                <ProtectedRoute>
                  <CustomerDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/add-customer"
              element={
                <ProtectedRoute>
                  <AddCustomer />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customer/:customerId/transaction"
              element={
                <ProtectedRoute>
                  <AddTransaction />
                </ProtectedRoute>
              }
            />
            <Route
              path="/transactions"
              element={
                <ProtectedRoute>
                  <Transactions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recurring-transactions"
              element={
                <ProtectedRoute>
                  <RecurringTransactions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/edit"
              element={
                <ProtectedRoute>
                  <ProfileEdit />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bulk-reminders"
              element={
                <ProtectedRoute>
                  <BulkReminders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/products"
              element={
                <ProtectedRoute>
                  <Products />
                </ProtectedRoute>
              }
            />
            <Route
              path="/add-product"
              element={
                <ProtectedRoute>
                  <AddEditProduct />
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit-product/:productId"
              element={
                <ProtectedRoute>
                  <AddEditProduct />
                </ProtectedRoute>
              }
            />
            <Route
              path="/invoice"
              element={
                <ProtectedRoute>
                  <InvoiceGenerator />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
