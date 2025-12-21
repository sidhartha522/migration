/**
 * Invoice Generator Page - Integrated with Business Profile
 */
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import FlashMessage from '../components/FlashMessage';
import PageHeader from '../components/PageHeader';
import '../styles/InvoiceGenerator.css';

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
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

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
      
      // Clean up old preview URL if exists
      if (pdfPreviewUrl) {
        window.URL.revokeObjectURL(pdfPreviewUrl);
      }
      
      setPdfPreviewUrl(url);
      setShowPreview(true);
      setActiveSection('preview');

      setMessages([{
        type: 'success',
        message: 'Invoice generated successfully! Preview shown below.'
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

  const handleDownloadPdf = () => {
    if (pdfPreviewUrl) {
      const link = document.createElement('a');
      link.href = pdfPreviewUrl;
      const timestamp = new Date().getTime();
      link.download = `invoice_${formData.buyer_name.replace(/[^a-z0-9]/gi, '_')}_${timestamp}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setMessages([{
        type: 'success',
        message: 'Invoice downloaded successfully!'
      }]);
    }
  };

  const totals = calculateTotals();

  return (
    <div className="invoice-generator-container">
      <PageHeader title="Invoice Generator" />
      
      <div className="invoice-content">
        <FlashMessage messages={messages} onClose={() => setMessages([])} />
        
        {/* Section Pills Navigation */}
        <div className="section-pills">
          <button
            type="button"
            className={`section-pill ${activeSection === 'buyer' ? 'active' : ''}`}
            onClick={() => setActiveSection('buyer')}
          >
            <i className="fas fa-user"></i> Buyer
          </button>
          <button
            type="button"
            className={`section-pill ${activeSection === 'seller' ? 'active' : ''}`}
            onClick={() => setActiveSection('seller')}
          >
            <i className="fas fa-store"></i> Seller
          </button>
          <button
            type="button"
            className={`section-pill ${activeSection === 'items' ? 'active' : ''}`}
            onClick={() => setActiveSection('items')}
          >
            <i className="fas fa-box"></i> Items
          </button>
          <button
            type="button"
            className={`section-pill ${activeSection === 'additional' ? 'active' : ''}`}
            onClick={() => setActiveSection('additional')}
          >
            <i className="fas fa-plus-circle"></i> Extra
          </button>
          {showPreview && (
            <button
              type="button"
              className={`section-pill ${activeSection === 'preview' ? 'active' : ''}`}
              onClick={() => setActiveSection('preview')}
            >
              <i className="fas fa-file-pdf"></i> Preview
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="invoice-form">
          {/* Seller Details */}
          {activeSection === 'seller' && (
            <div className="invoice-section-card">
              <h3 className="section-title">
                <i className="fas fa-store"></i>
                Seller Details (Your Business)
              </h3>
              <div className="invoice-input-group">
                <label className="invoice-input-label">Business Name *</label>
                <input
                  type="text"
                  name="seller_name"
                  placeholder="Enter business name"
                  value={formData.seller_name}
                  onChange={handleChange}
                  className="invoice-input"
                  required
                />
              </div>
              <div className="invoice-input-group">
                <label className="invoice-input-label">GSTIN</label>
                <input
                  type="text"
                  name="seller_gstin"
                  placeholder="Enter GSTIN"
                  value={formData.seller_gstin}
                  onChange={handleChange}
                  className="invoice-input"
                />
              </div>
              <div className="invoice-input-group">
                <label className="invoice-input-label">Address *</label>
                <textarea
                  name="seller_address"
                  placeholder="Enter complete address"
                  value={formData.seller_address}
                  onChange={handleChange}
                  className="invoice-input"
                  required
                />
              </div>
              <div className="invoice-row-inputs">
                <div className="invoice-input-group">
                  <label className="invoice-input-label">City *</label>
                  <input
                    type="text"
                    name="seller_city"
                    placeholder="City"
                    value={formData.seller_city}
                    onChange={handleChange}
                    className="invoice-input"
                    required
                  />
                </div>
                <div className="invoice-input-group">
                  <label className="invoice-input-label">State *</label>
                  <input
                    type="text"
                    name="seller_state"
                    placeholder="State"
                    value={formData.seller_state}
                    onChange={handleChange}
                    className="invoice-input"
                    required
                  />
                </div>
              </div>
              <div className="invoice-input-group">
                <label className="invoice-input-label">Pincode</label>
                <input
                  type="text"
                  name="seller_pincode"
                  placeholder="Enter pincode"
                  value={formData.seller_pincode}
                  onChange={handleChange}
                  className="invoice-input"
                />
              </div>
            </div>
          )}

          {/* Buyer Details */}
          {activeSection === 'buyer' && (
            <div className="invoice-section-card">
              <h3 className="section-title">
                <i className="fas fa-user"></i>
                Buyer Details
              </h3>
              <div className="invoice-input-group">
                <label className="invoice-input-label">Buyer Name *</label>
                <input
                  type="text"
                  name="buyer_name"
                  placeholder="Enter buyer name"
                  value={formData.buyer_name}
                  onChange={handleChange}
                  className="invoice-input"
                  required
                />
              </div>
              <div className="invoice-input-group">
                <label className="invoice-input-label">GSTIN (Optional)</label>
                <input
                  type="text"
                  name="buyer_gstin"
                  placeholder="Enter GSTIN if available"
                  value={formData.buyer_gstin}
                  onChange={handleChange}
                  className="invoice-input"
                />
              </div>
              <div className="invoice-input-group">
                <label className="invoice-input-label">Address *</label>
                <textarea
                  name="buyer_address"
                  placeholder="Enter complete address"
                  value={formData.buyer_address}
                  onChange={handleChange}
                  className="invoice-input"
                  required
                />
              </div>
              <div className="invoice-row-inputs">
                <div className="invoice-input-group">
                  <label className="invoice-input-label">City *</label>
                  <input
                    type="text"
                    name="buyer_city"
                    placeholder="City"
                    value={formData.buyer_city}
                    onChange={handleChange}
                    className="invoice-input"
                    required
                  />
                </div>
                <div className="invoice-input-group">
                  <label className="invoice-input-label">State *</label>
                  <input
                    type="text"
                    name="buyer_state"
                    placeholder="State"
                    value={formData.buyer_state}
                    onChange={handleChange}
                    className="invoice-input"
                    required
                  />
                </div>
              </div>
              <div className="invoice-row-inputs">
                <div className="invoice-input-group">
                  <label className="invoice-input-label">Pincode *</label>
                  <input
                    type="text"
                    name="buyer_pincode"
                    placeholder="PIN Code"
                    value={formData.buyer_pincode}
                    onChange={handleChange}
                    className="invoice-input"
                    required
                  />
                </div>
                <div className="invoice-input-group">
                  <label className="invoice-input-label">State Code</label>
                  <input
                    type="text"
                    name="buyer_state_code"
                    placeholder="State Code"
                    value={formData.buyer_state_code}
                    onChange={handleChange}
                    className="invoice-input"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Invoice Items */}
          {activeSection === 'items' && (
            <div className="invoice-section-card">
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                <h3 className="section-title">
                  <i className="fas fa-box"></i>
                  Invoice Items
                </h3>
                <button type="button" onClick={addItem} className="invoice-btn-secondary" style={{width: 'auto', minHeight: 'auto', padding: '10px 20px'}}>
                  <i className="fas fa-plus"></i> Add Item
                </button>
              </div>
              
              {formData.items.map((item, index) => (
                <div key={index} className="selected-product-item">
                  <div className="product-item-header">
                    <span className="product-item-name">Item {index + 1}</span>
                    {formData.items.length > 1 && (
                      <button type="button" onClick={() => removeItem(index)} className="remove-product-btn">
                        <i className="fas fa-trash"></i>
                      </button>
                    )}
                  </div>
                  
                  {/* Product Selection Dropdown */}
                  <div className="invoice-input-group">
                    <select
                      value={item.product_id}
                      onChange={(e) => handleProductSelect(index, e.target.value)}
                      className="invoice-input"
                      disabled={loadingProducts}
                    >
                      <option value="">-- Select from Inventory (Optional) --</option>
                      {products.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name} - ₹{product.price} / {product.unit} {product.stock_quantity > 0 ? `(${product.stock_quantity} in stock)` : '(Out of stock)'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="invoice-input-group">
                    <input
                      type="text"
                      placeholder="Description *"
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      className="invoice-input"
                    />
                  </div>
                  <div className="invoice-row-inputs">
                    <div className="invoice-input-group">
                      <input
                        type="text"
                        placeholder="HSN Code"
                        value={item.hsn_code}
                        onChange={(e) => handleItemChange(index, 'hsn_code', e.target.value)}
                        className="invoice-input"
                      />
                    </div>
                    <div className="invoice-input-group">
                      <select
                        value={item.unit}
                        onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                        className="invoice-input"
                      >
                        <option value="Nos">Nos</option>
                        <option value="Kg">Kg</option>
                        <option value="Ltr">Ltr</option>
                        <option value="Mtr">Mtr</option>
                        <option value="Box">Box</option>
                        <option value="Pkt">Pkt</option>
                      </select>
                    </div>
                  </div>
                  <div className="invoice-row-inputs">
                    <div className="invoice-input-group">
                      <input
                        type="number"
                        placeholder="Quantity *"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        className="invoice-input"
                        step="0.01"
                      />
                    </div>
                    <div className="invoice-input-group">
                      <input
                        type="number"
                        placeholder="Rate *"
                        value={item.rate}
                        onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                        className="invoice-input"
                        step="0.01"
                      />
                    </div>
                  </div>
                  <div className="product-item-total">
                    <span className="total-label">Item Total:</span>
                    <span className="total-amount">₹{calculateItemTotal(item).toFixed(2)}</span>
                  </div>
                </div>
              ))}

              {/* Totals Summary */}
              <div className="totals-summary">
                <div className="totals-row">
                  <span className="totals-label">Subtotal:</span>
                  <span className="totals-value">₹{totals.subtotal.toFixed(2)}</span>
                </div>
                <div className="totals-row">
                  <span className="totals-label">CGST ({formData.cgst_rate}%):</span>
                  <span className="totals-value">₹{totals.cgst.toFixed(2)}</span>
                </div>
                <div className="totals-row">
                  <span className="totals-label">SGST ({formData.sgst_rate}%):</span>
                  <span className="totals-value">₹{totals.sgst.toFixed(2)}</span>
                </div>
                <div className="totals-row">
                  <span className="grand-total-label">Total:</span>
                  <span className="grand-total-value">₹{totals.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Additional Info */}
          {activeSection === 'additional' && (
            <div className="invoice-section-card">
              <h3 className="section-title">
                <i className="fas fa-plus-circle"></i>
                Additional Information
              </h3>
              <div className="invoice-row-inputs">
                <div className="invoice-input-group">
                  <label className="invoice-input-label">CGST Rate (%)</label>
                  <input
                    type="text"
                    name="cgst_rate"
                    placeholder="CGST Rate"
                    value={formData.cgst_rate}
                    onChange={handleChange}
                    className="invoice-input"
                  />
                </div>
                <div className="invoice-input-group">
                  <label className="invoice-input-label">SGST Rate (%)</label>
                  <input
                    type="text"
                    name="sgst_rate"
                    placeholder="SGST Rate"
                    value={formData.sgst_rate}
                    onChange={handleChange}
                    className="invoice-input"
                  />
                </div>
              </div>
              <div className="invoice-input-group">
                <label className="invoice-input-label">Vehicle Number</label>
                <input
                  type="text"
                  name="vehicle_number"
                  placeholder="Vehicle Number (optional)"
                  value={formData.vehicle_number}
                  onChange={handleChange}
                  className="invoice-input"
                />
              </div>
              <div className="invoice-input-group">
                <label className="invoice-input-label">Additional Notes</label>
                <textarea
                  name="notes"
                  placeholder="Additional Notes (optional)"
                  value={formData.notes}
                  onChange={handleChange}
                  className="invoice-input"
                  rows="3"
                />
              </div>
            </div>
          )}

          {/* PDF Preview Section */}
          {activeSection === 'preview' && showPreview && pdfPreviewUrl && (
            <div className="invoice-section-card">
              <h3 className="section-title">
                <i className="fas fa-file-pdf"></i>
                Invoice Preview
              </h3>
              
              {/* PDF Preview Iframe */}
              <div className="pdf-iframe-container">
                <iframe
                  src={pdfPreviewUrl}
                  className="pdf-iframe"
                  title="Invoice Preview"
                />
              </div>

              {/* Download Button */}
              <button
                type="button"
                onClick={handleDownloadPdf}
                className="invoice-btn-primary invoice-btn-download"
              >
                <i className="fas fa-download"></i>
                Download Invoice PDF
              </button>

              {/* Generate New Invoice */}
              <button
                type="button"
                onClick={() => {
                  setShowPreview(false);
                  setPdfPreviewUrl(null);
                  setActiveSection('buyer');
                }}
                className="invoice-btn-secondary"
              >
                <i className="fas fa-plus"></i>
                Generate New Invoice
              </button>
            </div>
          )}

          {!showPreview && (
            <button 
              type="submit" 
              className="invoice-btn-primary" 
              disabled={loading}
              style={{marginTop: '20px'}}
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Generating Invoice...
                </>
              ) : (
                <>
                  <i className="fas fa-file-invoice"></i>
                  Generate Invoice PDF
                </>
              )}
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default InvoiceGenerator;
