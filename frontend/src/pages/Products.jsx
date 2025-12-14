/**
 * Products Page - Flat Modern Design
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productsAPI } from '../services/api';
import FlashMessage from '../components/FlashMessage';
import '../styles/ProductsModern.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  useEffect(() => {
    loadProducts();
    loadCategories();
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

  const loadCategories = async () => {
    try {
      const response = await productsAPI.getCategories();
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Failed to load categories', error);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    // Debounce search
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
      loadProducts({ search: term, category: selectedCategory });
    }, 500);
  };

  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setSelectedCategory(category);
    loadProducts({ search: searchTerm, category });
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
      loadProducts({ search: searchTerm, category: selectedCategory });
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
      loadProducts({ search: searchTerm, category: selectedCategory });
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

  const getCategoryIcon = (category) => {
    const icons = {
      'Food & Groceries': 'fa-shopping-basket',
      'Beverages': 'fa-coffee',
      'Personal Care': 'fa-spray-can',
      'Household Items': 'fa-home',
      'Electronics': 'fa-plug',
      'Clothing & Textiles': 'fa-tshirt',
      'Hardware & Tools': 'fa-wrench',
      'Stationery': 'fa-pen',
      'Medicine & Healthcare': 'fa-pills',
      'Other': 'fa-box'
    };
    return icons[category] || 'fa-box';
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

      {/* Search and Filter Section */}
      <div className="search-section-card">
        <div className="search-box">
          <i className="fas fa-search search-icon"></i>
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={handleSearch}
            className="input"
          />
        </div>
        
        {/* Category Filter Chips */}
        <div className="filter-chips">
          <button 
            className={`filter-chip ${!selectedCategory ? 'active' : ''}`}
            onClick={() => { setSelectedCategory(''); loadProducts({ search: searchTerm }); }}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`filter-chip ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => { setSelectedCategory(cat); loadProducts({ search: searchTerm, category: cat }); }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Add Product FAB */}
      <Link to="/add-product" className="fab-add">
        <i className="fas fa-plus"></i>
      </Link>

      {/* Products List */}
      {products.length === 0 ? (
        <div className="empty-state-products">
          <div className="icon-wrapper" style={{ backgroundColor: 'var(--purple-light)', fontSize: '48px', width: '80px', height: '80px' }}>
            <i className="fas fa-box-open" style={{ color: 'var(--primary-purple)' }}></i>
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
            <div key={product.id} className="product-item-card">
              <div className="product-icon-circle">
                <i className={`fas ${getCategoryIcon(product.category)}`}></i>
              </div>
              
              <div className="product-details">
                <div className="product-header-row">
                  <div className="product-name-text">
                    {product.name}
                    {product.is_public && (
                      <i className="fas fa-globe" style={{ marginLeft: '8px', fontSize: '12px', color: 'var(--text-tertiary)' }}></i>
                    )}
                  </div>
                  <div className="product-price-badge">₹{product.price}</div>
                </div>
                
                <div className="product-category-text">{product.category}</div>
                
                {product.description && (
                  <div className="product-description-text">
                    {product.description}
                  </div>
                )}
                
                <div className="product-stock-controls">
                  <div className="stock-badge" style={{ 
                    background: product.is_low_stock ? '#fee2e2' : '#d1fae5',
                    color: product.is_low_stock ? '#ef4444' : '#10b981'
                  }}>
                    {product.is_low_stock && <i className="fas fa-exclamation-triangle" style={{ marginRight: '4px' }}></i>}
                    {product.stock_quantity} {product.unit}
                  </div>
                  
                  <div className="quantity-controls">
                    <button className="qty-btn minus" onClick={() => handleQuantityChange(product, -1)}>
                      <i className="fas fa-minus"></i>
                    </button>
                    <button className="qty-btn plus" onClick={() => handleQuantityChange(product, 1)}>
                      <i className="fas fa-plus"></i>
                    </button>
                  </div>
                </div>
              </div>

              <div className="product-actions-vertical">
                <Link to={`/edit-product/${product.id}`} className="btn-action-icon">
                  <i className="fas fa-edit"></i>
                </Link>
                <button onClick={() => handleDeleteClick(product)} className="btn-action-icon delete">
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

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
