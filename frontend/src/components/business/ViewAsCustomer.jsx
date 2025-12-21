/**
 * ViewAsCustomer - Preview how business profile appears to customers
 */
import { useState, useEffect } from 'react';
import './ViewAsCustomer.css';

const ViewAsCustomer = () => {
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPreview();
  }, []);

  const fetchPreview = async () => {
    try {
      // TODO: Implement API call to get business preview data
      setBusiness({
        name: 'Sample Business',
        category: 'Retail Store',
        logo: null,
        description: 'We provide quality products and services',
        address: '123 Main Street, City',
        phone: '+91 9876543210',
        offers: [
          {
            id: 1,
            title: 'Welcome Offer',
            discount: 10,
            description: 'Get 10% off on your first purchase'
          }
        ],
        vouchers: [
          {
            id: 1,
            code: 'WELCOME10',
            discount: 10
          }
        ]
      });
    } catch (error) {
      console.error('Error fetching preview:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <i className="fas fa-spinner fa-spin"></i>
        <p>Loading preview...</p>
      </div>
    );
  }

  return (
    <div className="view-as-customer">
      <div className="preview-notice">
        <i className="fas fa-info-circle"></i>
        <p>This is how your business profile appears to customers</p>
      </div>

      <div className="customer-view">
        {/* Business Header */}
        <div className="business-banner">
          {business?.logo ? (
            <img src={business.logo} alt={business.name} className="banner-logo" />
          ) : (
            <div className="banner-placeholder">
              <i className="fas fa-store"></i>
            </div>
          )}
        </div>

        <div className="business-profile">
          <h2>{business?.name}</h2>
          <p className="category">
            <i className="fas fa-tag"></i>
            {business?.category}
          </p>
          <p className="description">{business?.description}</p>

          <div className="contact-info">
            <div className="contact-item">
              <i className="fas fa-map-marker-alt"></i>
              <span>{business?.address}</span>
            </div>
            <div className="contact-item">
              <i className="fas fa-phone"></i>
              <span>{business?.phone}</span>
            </div>
          </div>
        </div>

        {/* Active Offers */}
        {business?.offers && business.offers.length > 0 && (
          <div className="section">
            <h3>
              <i className="fas fa-tags"></i>
              Active Offers
            </h3>
            <div className="offers-preview">
              {business.offers.map(offer => (
                <div key={offer.id} className="offer-preview-card">
                  <div className="offer-discount">{offer.discount}% OFF</div>
                  <h4>{offer.title}</h4>
                  <p>{offer.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Available Vouchers */}
        {business?.vouchers && business.vouchers.length > 0 && (
          <div className="section">
            <h3>
              <i className="fas fa-ticket-alt"></i>
              Available Vouchers
            </h3>
            <div className="vouchers-preview">
              {business.vouchers.map(voucher => (
                <div key={voucher.id} className="voucher-preview-card">
                  <div className="voucher-code-display">
                    <span className="code">{voucher.code}</span>
                    <span className="discount">{voucher.discount}% OFF</span>
                  </div>
                  <button className="btn-copy">
                    <i className="fas fa-copy"></i>
                    Copy Code
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="cta-section">
          <button className="btn-primary">
            <i className="fas fa-shopping-bag"></i>
            View Products
          </button>
          <button className="btn-secondary">
            <i className="fas fa-phone"></i>
            Contact Business
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewAsCustomer;
