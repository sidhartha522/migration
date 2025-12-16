/**
 * CataloguePreview Component - Reusable Product Catalogue Display
 * Can be used in both Business and Customer views
 */
import { useState } from 'react';
import SearchBar from './SearchBar';
import '../styles/CataloguePreview.css';

const CataloguePreview = ({ 
  products = [], 
  isEditable = false, 
  onProductClick = null,
  onQuantityChange = null,
  onDeleteClick = null,
  showPrice = true,
  showStock = true,
  viewMode = 'grid' // 'grid' or 'list'
}) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Get unique categories
  const categories = ['all', ...new Set(products.map(p => p.category).filter(Boolean))];
  
  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = !searchTerm || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  
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

  const handleProductClick = (product) => {
    if (onProductClick) {
      onProductClick(product);
    }
  };

  const handleQuantityChange = (product, change) => {
    if (onQuantityChange) {
      onQuantityChange(product, change);
    }
  };

  return (
    <div className="catalogue-preview">
      {/* Search and Filter Bar */}
      <div className="catalogue-controls">
        <SearchBar
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search products..."
          onClear={() => setSearchTerm('')}
        />
        
        <div className="category-chips">
          {categories.map(cat => (
            <button
              key={cat}
              className={`category-chip ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat === 'all' ? 'All Products' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid/List */}
      {filteredProducts.length === 0 ? (
        <div className="empty-catalogue">
          <i className="fas fa-box-open" style={{ fontSize: '48px', color: 'var(--text-tertiary)' }}></i>
          <h3>No Products Found</h3>
          <p>Try adjusting your search or filter</p>
        </div>
      ) : (
        <div className={`products-${viewMode}`}>
          {filteredProducts.map(product => (
            <div
              key={product.id}
              className={`product-card-catalogue ${onProductClick ? 'clickable' : ''}`}
              onClick={() => handleProductClick(product)}
            >
              {/* Delete Button (if editable) */}
              {isEditable && onDeleteClick && (
                <button
                  className="delete-product-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteClick(product);
                  }}
                  title="Delete product"
                >
                  <i className="fas fa-trash"></i>
                </button>
              )}
              
              {/* Top Section: Icon + Details + Image */}
              <div className="product-top-section">
                <div className="product-left-section">
                  {/* Category Icon */}
                  <div className="product-icon-catalogue">
                    <i className={`fas ${getCategoryIcon(product.subcategory || product.category)}`}></i>
                  </div>
                  
                  {/* Product Info */}
                  <div className="product-info-catalogue">
                    <h4 className="product-name-catalogue">{product.name}</h4>
                    {product.description && (
                      <p className="product-description-catalogue">{product.description}</p>
                    )}
                    
                    <div className="product-meta-catalogue">
                      {product.subcategory ? (
                        <span className="product-category-badge">{product.subcategory}</span>
                      ) : product.category && (
                        <span className="product-category-badge">{product.category}</span>
                      )}
                      {product.unit && (
                        <span className="product-unit">per {product.unit}</span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Right Side: Product Image */}
                {product.product_image_url && (
                  <div className="product-image-right">
                    <img 
                      src={product.product_image_url} 
                      alt={product.name}
                    />
                  </div>
                )}
              </div>
              
              {/* Bottom Section: Price, Stock, Controls */}
              <div className="product-details-catalogue">
                {showPrice && (
                  <div className="product-price-catalogue">
                    ₹{parseFloat(product.price || 0).toFixed(2)}
                  </div>
                )}
                
                {showStock && (
                  <div className={`product-stock ${product.is_low_stock ? 'low-stock' : ''}`}>
                    {product.stock_quantity || 0} in stock
                    {product.is_low_stock && (
                      <i className="fas fa-exclamation-triangle" style={{ marginLeft: '4px', fontSize: '12px' }}></i>
                    )}
                  </div>
                )}
                
                {/* Quantity Controls (if editable) */}
                {isEditable && onQuantityChange && (
                  <div className="quantity-controls-catalogue" onClick={(e) => e.stopPropagation()}>
                    <button
                      className="qty-btn"
                      onClick={() => handleQuantityChange(product, -1)}
                      disabled={product.stock_quantity <= 0}
                    >
                      <i className="fas fa-minus"></i>
                    </button>
                    <span className="qty-display">{product.stock_quantity || 0}</span>
                    <button
                      className="qty-btn"
                      onClick={() => handleQuantityChange(product, 1)}
                    >
                      <i className="fas fa-plus"></i>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats Footer */}
      <div className="catalogue-stats">
        <div className="stat-item">
          <span className="stat-label">Total Products</span>
          <span className="stat-value">{filteredProducts.length}</span>
        </div>
        {showPrice && (
          <div className="stat-item">
            <span className="stat-label">Total Value</span>
            <span className="stat-value">
              ₹{filteredProducts.reduce((sum, p) => sum + (p.price * p.stock_quantity), 0).toFixed(2)}
            </span>
          </div>
        )}
        {showStock && (
          <div className="stat-item">
            <span className="stat-label">Low Stock Items</span>
            <span className="stat-value danger">
              {filteredProducts.filter(p => p.is_low_stock).length}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CataloguePreview;
