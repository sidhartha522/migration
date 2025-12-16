/**
 * SearchBar Component - Reusable search input with modern app styling
 * Used across Products, Customers, and other pages
 */
import '../styles/SearchBar.css';

const SearchBar = ({ 
  value, 
  onChange, 
  placeholder = "Search...", 
  onClear = null 
}) => {
  const handleClear = () => {
    if (onClear) {
      onClear();
    }
  };

  return (
    <div className="search-bar-component">
      <i className="fas fa-search search-icon"></i>
      <input
        type="text"
        className="search-input"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
      {value && (
        <button 
          className="clear-btn" 
          onClick={handleClear}
          type="button"
        >
          <i className="fas fa-times"></i>
        </button>
      )}
    </div>
  );
};

export default SearchBar;
