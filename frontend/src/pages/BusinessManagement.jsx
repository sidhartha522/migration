/**
 * Business Management - Main screen with tabs for managing business, vouchers, and offers
 */
import { useState } from 'react';
import PageHeader from '../components/PageHeader';
import BusinessDetails from '../components/business/BusinessDetails';
import VoucherList from '../components/business/VoucherList';
import OfferList from '../components/business/OfferList';
import ViewAsCustomer from '../components/business/ViewAsCustomer';
import '../styles/BusinessManagement.css';

const BusinessManagement = () => {
  const [activeTab, setActiveTab] = useState('details');

  const tabs = [
    { id: 'details', label: 'Business Details', icon: 'fa-store' },
    { id: 'vouchers', label: 'Vouchers', icon: 'fa-ticket-alt' },
    { id: 'offers', label: 'Offers', icon: 'fa-tags' },
    { id: 'view', label: 'View as Customer', icon: 'fa-eye' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'details':
        return <BusinessDetails />;
      case 'vouchers':
        return <VoucherList />;
      case 'offers':
        return <OfferList />;
      case 'view':
        return <ViewAsCustomer />;
      default:
        return <BusinessDetails />;
    }
  };

  return (
    <div className="business-management">
      <PageHeader 
        title="Business Management" 
        subtitle="Manage your business, vouchers, and offers"
      />

      <div className="tabs-container">
        <div className="tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <i className={`fas ${tab.icon}`}></i>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="tab-content">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default BusinessManagement;
