/**
 * FlashMessage Component - Display success/error/warning messages
 */
import { useEffect } from 'react';

const FlashMessage = ({ messages, onClose }) => {
  useEffect(() => {
    if (messages && messages.length > 0) {
      // Auto-hide after 3 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [messages, onClose]);

  if (!messages || messages.length === 0) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return 'fa-check-circle';
      case 'error':
        return 'fa-times-circle';
      case 'warning':
        return 'fa-exclamation-triangle';
      default:
        return 'fa-info-circle';
    }
  };

  return (
    <div className="flash-messages">
      {messages.map((msg, index) => (
        <div key={index} className={`flash-message ${msg.type}`}>
          <i className={`fas ${getIcon(msg.type)}`}></i>
          {msg.message}
        </div>
      ))}
    </div>
  );
};

export default FlashMessage;
