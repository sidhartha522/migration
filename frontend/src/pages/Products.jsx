/**
 * Products Page - Flat Modern Design with Catalogue Preview
 */
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { productsAPI } from '../services/api';
import FlashMessage from '../components/FlashMessage';
import CataloguePreview from '../components/CataloguePreview';
import '../styles/ProductsModern.css';

const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [viewMode, setViewMode] = useState('catalogue'); // 'catalogue' or 'list'

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async (params = {}) => {
    try {
      setLoading(true);
      const response = await productsAPI.getProducts(params);
      setProducts(response.data.products);
    } catch (error) {
      setMessages([{
        type: 'error',
        message: error.response?.data?.error || 'Failed to load products'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalStockValue = () => {
    return products.reduce((total, product) => {
      return total + (product.price * product.stock_quantity);
    }, 0);
  };

  const getLowStockItems = () => {
    return products.filter(p => p.is_low_stock);
  };

  const handleProductClick = (product) => {
    // Navigate to edit product page
    navigate(`/edit-product/${product.id}`);
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setShowDeleteConfirm(true);
  };

  const handleQuantityChange = async (product, change) => {
    const newQuantity = product.stock_quantity + change;
    
    // Don't allow negative quantities
    if (newQuantity < 0) {
      setMessages([{
        type: 'error',
        message: 'Stock quantity cannot be negative'
      }]);
      return;
    }

    try {
      // Update product stock via API
      await productsAPI.updateProduct(product.id, {
        ...product,
        stock_quantity: newQuantity
      });
      
      // Reload products to reflect changes
      loadProducts();
    } catch (error) {
      setMessages([{
        type: 'error',
        message: error.response?.data?.error || 'Failed to update stock'
      }]);
    }
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    
    try {
      await productsAPI.deleteProduct(productToDelete.id);
      setMessages([{
        type: 'success',
        message: 'Product deleted successfully'
      }]);
      loadProducts();
    } catch (error) {
      setMessages([{
        type: 'error',
        message: error.response?.data?.error || 'Failed to delete product'
      }]);
    } finally {
      setShowDeleteConfirm(false);
      setProductToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="products-modern">
        {/* Skeleton Search and Filter */}
        <div className="search-section-card">
          <div className="skeleton" style={{height: '48px', borderRadius: '12px', marginBottom: 'var(--space-3)'}}></div>
          <div className="skeleton" style={{height: '40px', borderRadius: '12px'}}></div>
        </div>
        
        {/* Skeleton Product Cards */}
        <div className="products-container-modern">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="product-card-modern" style={{pointerEvents: 'none'}}>
              <div style={{display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-3)'}}>
                <div className="skeleton" style={{width: '56px', height: '56px', borderRadius: 'var(--radius-md)'}}></div>
                <div style={{flex: 1}}>
                  <div className="skeleton" style={{height: '18px', width: '70%', marginBottom: '8px'}}></div>
                  <div className="skeleton" style={{height: '14px', width: '40%'}}></div>
                </div>
              </div>
              <div className="skeleton" style={{height: '14px', width: '100%', marginBottom: '12px'}}></div>
              <div style={{display: 'flex', gap: 'var(--space-3)'}}>
                <div className="skeleton" style={{height: '40px', flex: 1}}></div>
                <div className="skeleton" style={{height: '40px', flex: 1}}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="products-modern">
      <FlashMessage messages={messages} onClose={() => setMessages([])} />

      {/* Header with View Toggle */}
      <div className="products-header">
        <h1 className="page-title">Products</h1>
        <div className="view-toggle">
          <button
            className={`toggle-btn ${viewMode === 'catalogue' ? 'active' : ''}`}
            onClick={() => setViewMode('catalogue')}
            title="Catalogue View"
          >
            <i className="fas fa-th"></i>
          </button>
          <button
            className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
            title="List View"
          >
            <i className="fas fa-list"></i>
          </button>
        </div>
      </div>

      {/* Stock Value Header Card - Shown in both views */}
      <div className="stock-value-header">
        <div className="stock-value-left">
          <div className="label-text">TOTAL STOCK VALUE</div>
          <div className="value-text">₹{calculateTotalStockValue().toLocaleString('en-IN')}</div>
        </div>
        <div className="stock-alert-badge">
          <div className="alert-label">Low stock items</div>
          <div className="alert-count">{getLowStockItems().length}</div>
        </div>
      </div>

      {/* Catalogue Preview Component */}
      {viewMode === 'catalogue' ? (
        <CataloguePreview
          products={products}
          isEditable={true}
          onProductClick={handleProductClick}
          onQuantityChange={handleQuantityChange}
          onDeleteClick={handleDeleteClick}
          showPrice={true}
          showStock={true}
          viewMode="grid"
        />
      ) : (
        /* Original List View */
        <>
          {/* Products List */}
          {products.length === 0 ? (
            <div className="empty-state-products">
              <div className="icon-wrapper">
                <i className="fas fa-box-open"></i>
              </div>
              <h3>No Products Yet</h3>
              <p>Start adding products to your inventory</p>
              <Link to="/add-product" className="btn btn-primary">
                <i className="fas fa-plus"></i> Add First Product
              </Link>
            </div>
          ) : (
            <div className="products-container-modern">
              {products.map((product) => (
                <div key={product.id} className={`product-item-card ${product.is_low_stock ? 'low-stock' : ''}`}>
                  <div className="product-left-info">
                    <div className="product-name-text">{product.name}</div>
                    <div className="product-price-text">₹{product.price}/{product.unit}</div>
                  </div>
                  
                  <div className="product-right-actions">
                    <Link to={`/edit-product/${product.id}`} className="btn-edit-icon">
                      <i className="fas fa-edit"></i>
                    </Link>
                    <div className="product-quantity-controls">
                      <button className="qty-btn-dark minus" onClick={() => handleQuantityChange(product, -1)}>
                        -
                      </button>
                      <div className="quantity-display">
                        <span className="qty-number">{product.stock_quantity}</span>
                        <span className="qty-unit">{product.unit}</span>
                      </div>
                      <button className="qty-btn-dark plus" onClick={() => handleQuantityChange(product, 1)}>
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Add Product FAB */}
      <Link to="/add-product" className="fab-add">
        <i className="fas fa-plus"></i>
      </Link>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="card" style={{ maxWidth: '400px', margin: '20px' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: 'var(--space-4)' }}>Delete Product?</h3>
            <p style={{ marginBottom: 'var(--space-2)' }}>
              Are you sure you want to delete <strong>{productToDelete?.name}</strong>?
            </p>
            <p style={{ fontSize: '14px', color: 'var(--accent-red)', marginBottom: 'var(--space-6)' }}>
              This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowDeleteConfirm(false)} className="btn">
                Cancel
              </button>
              <button onClick={confirmDelete} className="btn" style={{ background: 'var(--accent-red)', color: 'white' }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
