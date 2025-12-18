/**
 * Invoice Generator Page - Integrated with Business Profile
 */
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import FlashMessage from '../components/FlashMessage';
import '../styles/AddEditProductMaterial.css';

const InvoiceGenerator = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    // Seller details (auto-populated from business profile)
    seller_name: '',
    seller_address: '',
    seller_city: '',
    seller_state: '',
    seller_pincode: '',
    seller_gstin: '',
    seller_state_name: '',
    seller_state_code: '',
    
    // Buyer details
    buyer_name: '',
    buyer_address: '',
    buyer_city: '',
    buyer_state: '',
    buyer_pincode: '',
    buyer_gstin: '',
    buyer_state_code: '',
    
    // Invoice items
    items: [{
      product_id: '',
      description: '',
      hsn_code: '',
      quantity: '',
      rate: '',
      unit: 'Nos'
    }],
    
    // Tax details
    cgst_rate: '9',
    sgst_rate: '9',
    
    // Additional info
    vehicle_number: '',
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [activeSection, setActiveSection] = useState('buyer');
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => {
    loadBusinessProfile();
    loadProducts();
  }, []);

  const loadBusinessProfile = async () => {
    try {
      const response = await api.get('/profile');
      const business = response.data.business;
      
      setFormData(prev => ({
        ...prev,
        seller_name: business.name || '',
        seller_address: business.address || '',
        seller_city: business.city || '',
        seller_state: business.state || '',
        seller_pincode: business.pincode || '',
        seller_gstin: business.gst_number || '',
        seller_state_name: business.state || '',
      }));
    } catch (error) {
      console.error('Failed to load business profile', error);
    }
  };

  const loadProducts = async () => {
    setLoadingProducts(true);
    try {
      const response = await api.get('/products');
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Failed to load products', error);
      setMessages([{
        type: 'error',
        message: 'Failed to load products from inventory'
      }]);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const handleProductSelect = (index, productId) => {
    const selectedProduct = products.find(p => p.id === productId);
    if (selectedProduct) {
      const newItems = [...formData.items];
      newItems[index] = {
        product_id: selectedProduct.id,
        description: selectedProduct.name,
        hsn_code: selectedProduct.hsn_code || '',
        quantity: '1',
        rate: selectedProduct.price.toString(),
        unit: selectedProduct.unit
      };
      setFormData(prev => ({ ...prev, items: newItems }));
    }
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { description: '', hsn_code: '', quantity: '', rate: '', unit: 'Nos' }]
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, items: newItems }));
    }
  };

  const calculateItemTotal = (item) => {
    const qty = parseFloat(item.quantity) || 0;
    const rate = parseFloat(item.rate) || 0;
    return qty * rate;
  };

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
    const cgstRate = parseFloat(formData.cgst_rate) || 0;
    const sgstRate = parseFloat(formData.sgst_rate) || 0;
    const cgst = (subtotal * cgstRate) / 100;
    const sgst = (subtotal * sgstRate) / 100;
    const total = subtotal + cgst + sgst;
    
    return { subtotal, cgst, sgst, total };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessages([]);

    const missingFields = [];
    if (!formData.buyer_name) missingFields.push('Buyer Name');
    if (!formData.buyer_address) missingFields.push('Buyer Address');
    if (!formData.buyer_city) missingFields.push('Buyer City');
    if (!formData.buyer_state) missingFields.push('Buyer State');
    if (!formData.buyer_pincode) missingFields.push('Buyer Pin Code');
    
    const hasValidItem = formData.items.some(item => 
      item.description && item.quantity && item.rate
    );
    
    if (!hasValidItem) {
      missingFields.push('At least one item with description, quantity, and rate');
    }

    if (missingFields.length > 0) {
      setMessages([{
        type: 'error',
        message: `Please fill in: ${missingFields.join(', ')}`
      }]);
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/generate-invoice', formData, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const timestamp = new Date().getTime();
      link.download = `invoice_${formData.buyer_name.replace(/[^a-z0-9]/gi, '_')}_${timestamp}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setMessages([{
        type: 'success',
        message: 'Invoice generated successfully!'
      }]);
    } catch (err) {
      console.error('Error generating invoice:', err);
      setMessages([{
        type: 'error',
        message: err.response?.data?.error || 'Failed to generate invoice'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const totals = calculateTotals();

  return (
    <div className="add-edit-product-modern">
      <div className="product-form-container">
        <FlashMessage messages={messages} onClose={() => setMessages([])} />
        
        <div className="modern-header" style={{marginBottom: '20px'}}>
          <h1 className="header-title">📄 Invoice Generator</h1>
          <p style={{color: '#666', fontSize: '14px', marginTop: '8px'}}>Create professional GST invoices</p>
        </div>

        {/* Section Navigation */}
        <div style={{display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto'}}>
          {['seller', 'buyer', 'items', 'additional'].map(section => (
            <button
              key={section}
              type="button"
              onClick={() => setActiveSection(section)}
              style={{
                padding: '8px 16px',
                border: `2px solid ${activeSection === section ? 'var(--primary-purple)' : '#ddd'}`,
                background: activeSection === section ? 'var(--primary-purple)' : 'white',
                color: activeSection === section ? 'white' : '#666',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                whiteSpace: 'nowrap'
              }}
            >
              {section.charAt(0).toUpperCase() + section.slice(1)}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {/* Seller Details */}
          {activeSection === 'seller' && (
            <div className="section-card">
              <h3 className="section-title">Seller Details (Your Business)</h3>
              <div className="row-inputs">
                <input
                  type="text"
                  name="seller_name"
                  placeholder="Business Name *"
                  value={formData.seller_name}
                  onChange={handleChange}
                  className="material-input"
                />
                <input
                  type="text"
                  name="seller_gstin"
                  placeholder="GSTIN"
                  value={formData.seller_gstin}
                  onChange={handleChange}
                  className="material-input"
                />
              </div>
              <textarea
                name="seller_address"
                placeholder="Address *"
                value={formData.seller_address}
                onChange={handleChange}
                className="material-input"
                rows="2"
              />
              <div className="row-inputs">
                <input
                  type="text"
                  name="seller_city"
                  placeholder="City *"
                  value={formData.seller_city}
                  onChange={handleChange}
                  className="material-input"
                />
                <input
                  type="text"
                  name="seller_state"
                  placeholder="State *"
                  value={formData.seller_state}
                  onChange={handleChange}
                  className="material-input"
                />
                <input
                  type="text"
                  name="seller_pincode"
                  placeholder="PIN Code *"
                  value={formData.seller_pincode}
                  onChange={handleChange}
                  className="material-input"
                />
                <input
                  type="text"
                  name="seller_state_code"
                  placeholder="State Code"
                  value={formData.seller_state_code}
                  onChange={handleChange}
                  className="material-input"
                />
              </div>
            </div>
          )}

          {/* Buyer Details */}
          {activeSection === 'buyer' && (
            <div className="section-card">
              <h3>Buyer Details (Customer)</h3>
              <div className="row-inputs">
                <input
                  type="text"
                  name="buyer_name"
                  placeholder="Buyer Name *"
                  value={formData.buyer_name}
                  onChange={handleChange}
                  className="material-input"
                  required
                />
                <input
                  type="text"
                  name="buyer_gstin"
                  placeholder="GSTIN (optional)"
                  value={formData.buyer_gstin}
                  onChange={handleChange}
                  className="material-input"
                />
              </div>
              <textarea
                name="buyer_address"
                placeholder="Address *"
                value={formData.buyer_address}
                onChange={handleChange}
                className="material-input"
                rows="2"
                required
              />
              <div className="row-inputs">
                <input
                  type="text"
                  name="buyer_city"
                  placeholder="City *"
                  value={formData.buyer_city}
                  onChange={handleChange}
                  className="material-input"
                  required
                />
                <input
                  type="text"
                  name="buyer_state"
                  placeholder="State *"
                  value={formData.buyer_state}
                  onChange={handleChange}
                  className="material-input"
                  required
                />
                <input
                  type="text"
                  name="buyer_pincode"
                  placeholder="PIN Code *"
                  value={formData.buyer_pincode}
                  onChange={handleChange}
                  className="material-input"
                  required
                />
                <input
                  type="text"
                  name="buyer_state_code"
                  placeholder="State Code"
                  value={formData.buyer_state_code}
                  onChange={handleChange}
                  className="material-input"
                />
              </div>
            </div>
          )}

          {/* Invoice Items */}
          {activeSection === 'items' && (
            <div className="section-card">
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
                <h3>Invoice Items</h3>
                <button type="button" onClick={addItem} className="btn-secondary">
                  <i className="fas fa-plus"></i> Add Item
                </button>
              </div>
              
              {formData.items.map((item, index) => (
                <div key={index} style={{marginBottom: '20px', padding: '16px', border: '1px solid #ddd', borderRadius: '8px'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '12px'}}>
                    <strong>Item {index + 1}</strong>
                    {formData.items.length > 1 && (
                      <button type="button" onClick={() => removeItem(index)} style={{color: 'red', background: 'none', border: 'none', cursor: 'pointer'}}>
                        <i className="fas fa-trash"></i>
                      </button>
                    )}
                  </div>
                  
                  {/* Product Selection Dropdown */}
                  <select
                    value={item.product_id}
                    onChange={(e) => handleProductSelect(index, e.target.value)}
                    className="material-input"
                    style={{marginBottom: '8px'}}
                    disabled={loadingProducts}
                  >
                    <option value="">-- Select from Inventory (Optional) --</option>
                    {products.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name} - ₹{product.price} / {product.unit} {product.stock_quantity > 0 ? `(${product.stock_quantity} in stock)` : '(Out of stock)'}
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    placeholder="Description *"
                    value={item.description}
                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                    className="material-input"
                    style={{marginBottom: '8px'}}
                  />
                  <div className="row-inputs" style={{marginBottom: '8px'}}>
                    <input
                      type="text"
                      placeholder="HSN Code"
                      value={item.hsn_code}
                      onChange={(e) => handleItemChange(index, 'hsn_code', e.target.value)}
                      className="material-input"
                    />
                    <select
                      value={item.unit}
                      onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                      className="material-input"
                    >
                      <option value="Nos">Nos</option>
                      <option value="Kg">Kg</option>
                      <option value="Ltr">Ltr</option>
                      <option value="Mtr">Mtr</option>
                      <option value="Box">Box</option>
                      <option value="Pkt">Pkt</option>
                    </select>
                  </div>
                  <div className="row-inputs">
                    <input
                      type="number"
                      placeholder="Quantity *"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                      className="material-input"
                      step="0.01"
                    />
                    <input
                      type="number"
                      placeholder="Rate *"
                      value={item.rate}
                      onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                      className="material-input"
                      step="0.01"
                    />
                    <div style={{padding: '8px', background: '#f5f5f5', borderRadius: '4px', textAlign: 'right'}}>
                      <strong>₹{calculateItemTotal(item).toFixed(2)}</strong>
                    </div>
                  </div>
                </div>
              ))}

              {/* Totals Summary */}
              <div style={{marginTop: '20px', padding: '16px', background: '#f9f9f9', borderRadius: '8px'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
                  <span>Subtotal:</span>
                  <strong>₹{totals.subtotal.toFixed(2)}</strong>
                </div>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
                  <span>CGST ({formData.cgst_rate}%):</span>
                  <span>₹{totals.cgst.toFixed(2)}</span>
                </div>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
                  <span>SGST ({formData.sgst_rate}%):</span>
                  <span>₹{totals.sgst.toFixed(2)}</span>
                </div>
                <div style={{borderTop: '2px solid #ddd', paddingTop: '8px', marginTop: '8px', display: 'flex', justifyContent: 'space-between'}}>
                  <strong>Total:</strong>
                  <strong style={{fontSize: '18px', color: 'var(--primary-purple)'}}>₹{totals.total.toFixed(2)}</strong>
                </div>
              </div>
            </div>
          )}

          {/* Additional Info */}
          {activeSection === 'additional' && (
            <div className="section-card">
              <h3>Additional Information</h3>
              <div className="row-inputs">
                <input
                  type="text"
                  name="cgst_rate"
                  placeholder="CGST Rate (%)"
                  value={formData.cgst_rate}
                  onChange={handleChange}
                  className="material-input"
                />
                <input
                  type="text"
                  name="sgst_rate"
                  placeholder="SGST Rate (%)"
                  value={formData.sgst_rate}
                  onChange={handleChange}
                  className="material-input"
                />
              </div>
              <input
                type="text"
                name="vehicle_number"
                placeholder="Vehicle Number (optional)"
                value={formData.vehicle_number}
                onChange={handleChange}
                className="material-input"
              />
              <textarea
                name="notes"
                placeholder="Additional Notes (optional)"
                value={formData.notes}
                onChange={handleChange}
                className="material-input"
                rows="3"
              />
            </div>
          )}

          <button 
            type="submit" 
            className="btn-primary" 
            disabled={loading}
            style={{width: '100%', marginTop: '20px'}}
          >
            {loading ? 'Generating Invoice...' : '📄 Generate Invoice PDF'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default InvoiceGenerator;
