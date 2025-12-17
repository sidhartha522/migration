/**
 * AddEditProduct Page - Modern Flat Design with Two-Level Categories
 */
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productsAPI } from '../services/api';
import FlashMessage from '../components/FlashMessage';
import { getAllLevel1InventoryCategories, getLevel2InventoryOptions } from '../data/inventoryCategories';
import '../styles/AddEditProductMaterial.css';

const AddEditProduct = () => {
  const navigate = useNavigate();
  const { productId } = useParams();
  const isEditMode = !!productId;

  // Generate random HSN code (8 digits)
  const generateRandomHSN = () => {
    return Math.floor(10000000 + Math.random() * 90000000).toString();
  };

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    subcategory: '',
    stock_quantity: '',
    unit: '',
    price: '',
    hsn_code: generateRandomHSN(),
    is_public: false,
    low_stock_threshold: '10',
    product_image: null
  });
  
  const [imagePreview, setImagePreview] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [customSubcategory, setCustomSubcategory] = useState('');
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [showCustomSubcategory, setShowCustomSubcategory] = useState(false);

  const categories = getAllLevel1InventoryCategories();
  const [subcategories, setSubcategories] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loadingData, setLoadingData] = useState(isEditMode);

  useEffect(() => {
    loadDropdownData();
    if (isEditMode) {
      loadProductData();
    }
  }, []);

  // Update subcategories when category changes
  const handleCategoryChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value, subcategory: '' }));
    setCustomSubcategory('');
    
    if (value === 'other') {
      setShowCustomCategory(true);
      setShowCustomSubcategory(true);
      setSubcategories([]);
    } else if (value) {
      setShowCustomCategory(false);
      setShowCustomSubcategory(false);
      const selectedCat = categories.find(cat => cat.id === value);
      console.log('Selected category:', selectedCat);
      const subcats = selectedCat?.level2Options || selectedCat?.level2 || [];
      console.log('Subcategories:', subcats);
      setSubcategories([...subcats, 'Other']);
    } else {
      setShowCustomCategory(false);
      setShowCustomSubcategory(false);
      setSubcategories([]);
    }
  };

  const handleSubcategoryChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (value === 'Other') {
      setShowCustomSubcategory(true);
    } else {
      setShowCustomSubcategory(false);
    }
  };

  const loadDropdownData = async () => {
    try {
      const unitsRes = await productsAPI.getUnits();
      setUnits(unitsRes.data.units);
    } catch (error) {
      console.error('Failed to load units data', error);
      // Fallback units
      setUnits(['Piece', 'Kg', 'Litre', 'Meter', 'Box', 'Packet']);
    }
  };

  const loadProductData = async () => {
    try {
      setLoadingData(true);
      const response = await productsAPI.getProduct(productId);
      const product = response.data.product;
      
      setFormData({
        name: product.name,
        description: product.description || '',
        subcategory: product.subcategory || '',
        stock_quantity: product.stock_quantity.toString(),
        unit: product.unit,
        price: product.price.toString(),
        hsn_code: product.hsn_code || generateRandomHSN(),
        is_public: product.is_public,
        low_stock_threshold: product.low_stock_threshold?.toString() || '10',
        product_image: null
      });
      
      if (product.product_image_url) {
        setImagePreview(product.product_image_url);
      }
    } catch (error) {
      setMessages([{
        type: 'error',
        message: error.response?.data?.error || 'Failed to load product'
      }]);
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, product_image: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.category || !formData.subcategory || !formData.unit) {
      setMessages([{
        type: 'error',
        message: 'Please fill all required fields'
      }]);
      return;
    }

    // Validate custom category/subcategory if "Other" is selected
    if (showCustomCategory && !customCategory.trim()) {
      setMessages([{
        type: 'error',
        message: 'Please enter a custom category name'
      }]);
      return;
    }

    if (showCustomSubcategory && !customSubcategory.trim()) {
      setMessages([{
        type: 'error',
        message: 'Please enter a custom subcategory name'
      }]);
      return;
    }

    const stock = parseInt(formData.stock_quantity);
    const price = parseFloat(formData.price);

    if (isNaN(stock) || stock < 0) {
      setMessages([{
        type: 'error',
        message: 'Stock quantity must be a valid non-negative number'
      }]);
      return;
    }

    if (isNaN(price) || price < 0) {
      setMessages([{
        type: 'error',
        message: 'Price must be a valid non-negative number'
      }]);
      return;
    }

    try {
      setLoading(true);
      setMessages([]);
      
      const productData = {
        ...formData,
        category: showCustomCategory ? customCategory : formData.category,
        subcategory: showCustomSubcategory ? customSubcategory : formData.subcategory,
        stock_quantity: stock,
        price: price,
        low_stock_threshold: parseInt(formData.low_stock_threshold) || 10
      };

      console.log('Submitting product data:', productData);

      if (isEditMode) {
        const response = await productsAPI.updateProduct(productId, productData);
        console.log('Update response:', response);
        setMessages([{
          type: 'success',
          message: 'Product updated successfully'
        }]);
      } else {
        const response = await productsAPI.addProduct(productData);
        console.log('Add response:', response);
        setMessages([{
          type: 'success',
          message: 'Product added successfully'
        }]);
      }

      setTimeout(() => {
        navigate('/products');
      }, 1500);

    } catch (error) {
      console.error('Error submitting product:', error);
      console.error('Error response:', error.response);
      setMessages([{
        type: 'error',
        message: error.response?.data?.error || error.message || `Failed to ${isEditMode ? 'update' : 'add'} product`
      }]);
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="add-edit-product-modern">
        <div className="product-form-container">
          {/* Skeleton Header */}
          <div className="modern-header">
            <div className="skeleton" style={{height: '44px', width: '44px', borderRadius: '50%', marginRight: '16px'}}></div>
            <div className="skeleton" style={{height: '28px', width: '180px', borderRadius: '12px'}}></div>
          </div>
          
          {/* Skeleton Image Upload Card */}
          <div className="section-card">
            <div className="skeleton" style={{height: '180px', width: '180px', borderRadius: '16px', margin: '0 auto 16px'}}></div>
            <div className="skeleton" style={{height: '20px', width: '140px', margin: '0 auto', borderRadius: '8px'}}></div>
          </div>
          
          {/* Skeleton Form Sections */}
          <div className="section-card">
            <div className="skeleton" style={{height: '24px', width: '150px', marginBottom: '24px', borderRadius: '10px'}}></div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="form-group" style={{marginBottom: '20px'}}>
                <div className="skeleton" style={{height: '14px', width: '100px', marginBottom: '10px', borderRadius: '6px'}}></div>
                <div className="skeleton" style={{height: i === 2 ? '100px' : '56px', width: '100%', borderRadius: '16px'}}></div>
              </div>
            ))}
          </div>
          
          {/* Skeleton FAB */}
          <div className="skeleton" style={{position: 'fixed', bottom: '32px', right: '32px', width: '64px', height: '64px', borderRadius: '50%'}}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="add-edit-product-modern">
      <FlashMessage messages={messages} onClose={() => setMessages([])} />

      <div className="product-form-container">
        {/* Header */}
        <div className="modern-header">
          <button onClick={() => navigate('/products')} className="back-button">
            <i className="fas fa-arrow-left"></i>
          </button>
          <h1 className="header-title">{isEditMode ? 'Edit Product' : 'Add Product'}</h1>
          <div style={{width: '40px'}}></div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Image Upload Card - Premium Style */}
          <div className="image-upload-card">
            <input
              type="file"
              id="product_image"
              name="product_image"
              accept="image/*"
              onChange={handleImageChange}
              style={{display: 'none'}}
            />
            <label htmlFor="product_image" className="image-upload-area">
              {imagePreview ? (
                <div className="image-preview-container">
                  <img src={imagePreview} alt="Product" className="product-image-preview" />
                  <div className="image-overlay">
                    <i className="fas fa-camera"></i>
                    <span>Change Photo</span>
                  </div>
                </div>
              ) : (
                <div className="image-placeholder">
                  <div className="camera-icon-circle">
                    <i className="fas fa-camera"></i>
                  </div>
                  <p className="upload-text">Add Product Photo</p>
                  <p className="upload-subtext">Tap to upload</p>
                </div>
              )}
            </label>
          </div>

          {/* Product Details Section */}
          <div className="section-card">
            <h3 className="section-title">
              <i className="fas fa-info-circle section-icon"></i>
              Product Details
            </h3>
            
            <div className="material-input-group">
              <input
                type="text"
                id="name"
                name="name"
                className="material-input"
                value={formData.name}
                onChange={handleChange}
                placeholder=" "
                required
              />
              <label htmlFor="name" className="material-label">Product Name *</label>
            </div>

            <div className="material-input-group">
              <textarea
                id="description"
                name="description"
                className="material-input material-textarea"
                value={formData.description}
                onChange={handleChange}
                placeholder=" "
                rows="3"
              />
              <label htmlFor="description" className="material-label">Description (optional)</label>
            </div>

            <div className="material-input-group">
              <select
                id="category"
                name="category"
                className="material-input material-select"
                value={formData.category}
                onChange={handleCategoryChange}
                required
              >
                <option value="" disabled hidden></option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
                <option value="other">Other (Add Custom)</option>
              </select>
              <label htmlFor="category" className="material-label">Main Category *</label>
            </div>

            {showCustomCategory && (
              <>
                <div className="material-input-group">
                  <input
                    type="text"
                    id="customCategory"
                    className="material-input"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder=" "
                    required
                  />
                  <label htmlFor="customCategory" className="material-label">Enter Custom Category Name *</label>
                </div>
                
                <div className="material-input-group">
                  <input
                    type="text"
                    id="customSubcategory"
                    className="material-input"
                    value={customSubcategory}
                    onChange={(e) => setCustomSubcategory(e.target.value)}
                    placeholder=" "
                    required
                  />
                  <label htmlFor="customSubcategory" className="material-label">Enter Custom Subcategory Name *</label>
                </div>
              </>
            )}

            {formData.category && !showCustomCategory && (
              <>
                <div className="material-input-group">
                  <select
                    id="subcategory"
                    name="subcategory"
                    className="material-input material-select"
                    value={formData.subcategory}
                    onChange={handleSubcategoryChange}
                    required
                  >
                    <option value="" disabled hidden></option>
                    {subcategories.map((subcat) => (
                      <option key={subcat} value={subcat}>
                        {subcat}
                      </option>
                    ))}
                  </select>
                  <label htmlFor="subcategory" className="material-label">Subcategory *</label>
                </div>

                {showCustomSubcategory && (
                  <div className="material-input-group">
                    <input
                      type="text"
                      id="customSubcategoryOnly"
                      className="material-input"
                      value={customSubcategory}
                      onChange={(e) => setCustomSubcategory(e.target.value)}
                      placeholder=" "
                      required
                    />
                    <label htmlFor="customSubcategoryOnly" className="material-label">Enter Custom Subcategory Name *</label>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Pricing & Stock Section */}
          <div className="section-card">
            <h3 className="section-title">
              <i className="fas fa-tag section-icon"></i>
              Pricing & Stock
            </h3>
            
            <div className="row-inputs">
              <div className="material-input-group">
                <input
                  type="number"
                  id="price"
                  name="price"
                  className="material-input"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder=" "
                  min="0"
                  step="0.01"
                  required
                />
                <label htmlFor="price" className="material-label">Price (₹) *</label>
              </div>

              <div className="material-input-group">
                <select
                  id="unit"
                  name="unit"
                  className="material-input material-select"
                  value={formData.unit}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled hidden></option>
                  {units.map((unit) => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
                <label htmlFor="unit" className="material-label">Unit *</label>
              </div>
            </div>

            <div className="row-inputs">
              <div className="material-input-group">
                <input
                  type="number"
                  id="stock_quantity"
                  name="stock_quantity"
                  className="material-input"
                  value={formData.stock_quantity}
                  onChange={handleChange}
                  placeholder=" "
                  min="0"
                  step="1"
                  required
                />
                <label htmlFor="stock_quantity" className="material-label">Stock Quantity *</label>
              </div>

              <div className="material-input-group">
                <input
                  type="number"
                  id="low_stock_threshold"
                  name="low_stock_threshold"
                  className="material-input"
                  value={formData.low_stock_threshold}
                  onChange={handleChange}
                  placeholder=" "
                  min="0"
                  step="1"
                />
                <label htmlFor="low_stock_threshold" className="material-label">Alert Threshold</label>
              </div>
            </div>

            <div className="material-input-group">
              <input
                type="text"
                id="hsn_code"
                name="hsn_code"
                className="material-input"
                value={formData.hsn_code}
                onChange={handleChange}
                placeholder=" "
                maxLength="8"
              />
              <label htmlFor="hsn_code" className="material-label">HSN Code</label>
              <div style={{fontSize: '12px', color: '#666', marginTop: '4px'}}>
                <i className="fas fa-info-circle" style={{marginRight: '4px'}}></i>
                Harmonized System of Nomenclature code for tax purposes
              </div>
            </div>
          </div>

          {/* Settings Section */}
          <div className="section-card">
            <h3 className="section-title">
              <i className="fas fa-cog section-icon"></i>
              Settings
            </h3>
            
            <div className="toggle-item" onClick={() => setFormData(prev => ({...prev, is_public: !prev.is_public}))}>
              <div className="toggle-content">
                <div className="toggle-icon">
                  <i className="fas fa-globe"></i>
                </div>
                <div>
                  <div className="toggle-title">Make Public</div>
                  <div className="toggle-subtitle">Show in customer catalogue</div>
                </div>
              </div>
              <div className={`modern-toggle ${formData.is_public ? 'active' : ''}`}>
                <div className="toggle-circle"></div>
              </div>
            </div>
          </div>

          {/* Submit Button - Material FAB Style */}
          <div className="submit-actions">
            <button
              type="submit"
              className="fab-submit"
              disabled={loading}
            >
              {loading ? (
                <i className="fas fa-spinner fa-spin"></i>
              ) : (
                <>
                  <i className="fas fa-check"></i>
                  <span>{isEditMode ? 'Update Product' : 'Add Product'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditProduct;
