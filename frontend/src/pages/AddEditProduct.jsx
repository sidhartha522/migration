/**
 * AddEditProduct Page - Modern Flat Design
 */
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productsAPI } from '../services/api';
import FlashMessage from '../components/FlashMessage';
import '../styles/AddEditProductModern.css';

const AddEditProduct = () => {
  const navigate = useNavigate();
  const { productId } = useParams();
  const isEditMode = !!productId;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    stock_quantity: '',
    unit: '',
    price: '',
    is_public: false,
    low_stock_threshold: '10'
  });

  const [categories, setCategories] = useState([]);
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

  const loadDropdownData = async () => {
    try {
      const [categoriesRes, unitsRes] = await Promise.all([
        productsAPI.getCategories(),
        productsAPI.getUnits()
      ]);
      setCategories(categoriesRes.data.categories);
      setUnits(unitsRes.data.units);
    } catch (error) {
      console.error('Failed to load dropdown data', error);
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
        category: product.category,
        stock_quantity: product.stock_quantity.toString(),
        unit: product.unit,
        price: product.price.toString(),
        is_public: product.is_public,
        low_stock_threshold: product.low_stock_threshold?.toString() || '10'
      });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.category || !formData.unit) {
      setMessages([{
        type: 'error',
        message: 'Please fill all required fields'
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
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="add-edit-product-modern">
      <FlashMessage messages={messages} onClose={() => setMessages([])} />

      <div className="product-form-container">
        <div className="product-form-card">
          <h1 className="form-title">
            {isEditMode ? 'Edit Product' : 'Add New Product'}
          </h1>

          <form onSubmit={handleSubmit}>
            {/* Product Name */}
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Product Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="input"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Rice, Cooking Oil"
                required
              />
            </div>

            {/* Description */}
            <div className="form-group">
              <label htmlFor="description" className="form-label">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Optional product description"
                rows="3"
              />
            </div>

            {/* Category */}
            <div className="form-group">
              <label htmlFor="category" className="form-label">
                Category <span className="required">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Stock Quantity */}
            <div className="form-group">
              <label htmlFor="stock_quantity" className="form-label">
                Stock Quantity <span className="required">*</span>
              </label>
              <input
                type="number"
                id="stock_quantity"
                name="stock_quantity"
                className="input"
                value={formData.stock_quantity}
                onChange={handleChange}
                placeholder="100"
                min="0"
                step="1"
                required
              />
            </div>

            {/* Unit */}
            <div className="form-group">
              <label htmlFor="unit" className="form-label">
                Unit <span className="required">*</span>
              </label>
              <select
                id="unit"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                required
              >
                <option value="">Select Unit</option>
                {units.map((unit) => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>

            {/* Price */}
            <div className="form-group">
              <label htmlFor="price" className="form-label">
                Price per Unit (₹) <span className="required">*</span>
              </label>
              <input
                type="number"
                id="price"
                name="price"
                className="input"
                value={formData.price}
                onChange={handleChange}
                placeholder="50.00"
                min="0"
                step="0.01"
                required
              />
            </div>

            {/* Low Stock Threshold */}
            <div className="form-group">
              <label htmlFor="low_stock_threshold" className="form-label">
                Low Stock Alert Threshold
              </label>
              <input
                type="number"
                id="low_stock_threshold"
                name="low_stock_threshold"
                className="input"
                value={formData.low_stock_threshold}
                onChange={handleChange}
                placeholder="10"
                min="0"
                step="1"
              />
              <small style={{fontSize: '12px', color: 'var(--text-tertiary)', marginTop: 'var(--space-1)', display: 'block'}}>
                Get alerted when stock falls below this number
              </small>
            </div>

            {/* Make Public Toggle */}
            <div className="form-group">
              <div className="checkbox-wrapper">
                <input
                  type="checkbox"
                  id="is_public"
                  name="is_public"
                  checked={formData.is_public}
                  onChange={handleChange}
                />
                <label htmlFor="is_public">
                  Make Public (Show in Customer Catalogue)
                </label>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="form-actions">
              <button
                type="button"
                onClick={() => navigate('/products')}
                className="btn btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    {isEditMode ? 'Updating...' : 'Adding...'}
                  </>
                ) : (
                  <>
                    <i className="fas fa-check"></i>
                    {isEditMode ? 'Update Product' : 'Add Product'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddEditProduct;
