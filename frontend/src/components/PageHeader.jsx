/**
 * PageHeader Component - Mobile app style page header with back button
 */
import { useNavigate } from 'react-router-dom';
import '../styles/PageHeader.css';

const PageHeader = ({ title, showBack = true, backTo = '/dashboard', rightAction }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="page-header-mobile">
      <div className="page-header-left">
        {showBack && (
          <button className="btn-back-mobile" onClick={handleBack}>
            <i className="fas fa-arrow-left"></i>
          </button>
        )}
      </div>
      <div className="page-header-title">
        <h1>{title}</h1>
      </div>
      <div className="page-header-right">
        {rightAction}
      </div>
    </div>
  );
};

export default PageHeader;
