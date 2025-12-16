/**
 * Two-Level Inventory/Product Categories
 * Level 1: Main Product Category
 * Level 2: Sub-categories/Types
 */

export const inventoryCategories = [
  {
    id: 'food-groceries',
    name: 'Food & Groceries',
    icon: 'fa-shopping-basket',
    color: '#10b981',
    level2: [
      'Rice & Grains',
      'Pulses & Lentils',
      'Flour & Atta',
      'Cooking Oil',
      'Spices & Masala',
      'Salt & Sugar',
      'Dry Fruits & Nuts',
      'Packaged Foods',
      'Snacks & Namkeen',
      'Biscuits & Cookies'
    ]
  },
  {
    id: 'beverages',
    name: 'Beverages',
    icon: 'fa-coffee',
    color: '#f59e0b',
    level2: [
      'Tea & Coffee',
      'Cold Drinks',
      'Juices',
      'Energy Drinks',
      'Water Bottles',
      'Milk & Dairy Drinks'
    ]
  },
  {
    id: 'personal-care',
    name: 'Personal Care',
    icon: 'fa-spray-can',
    color: '#ec4899',
    level2: [
      'Soaps & Bodywash',
      'Shampoo & Conditioner',
      'Toothpaste & Oral Care',
      'Skincare Products',
      'Hair Care',
      'Deodorants & Perfumes',
      'Shaving & Grooming',
      'Sanitary Products'
    ]
  },
  {
    id: 'household',
    name: 'Household Items',
    icon: 'fa-home',
    color: '#3b82f6',
    level2: [
      'Cleaning Supplies',
      'Detergents & Soaps',
      'Dishwashing',
      'Floor & Surface Cleaners',
      'Bathroom Cleaners',
      'Air Fresheners',
      'Garbage Bags',
      'Kitchen Essentials',
      'Utensils',
      'Storage Containers'
    ]
  },
  {
    id: 'electronics',
    name: 'Electronics',
    icon: 'fa-plug',
    color: '#8b5cf6',
    level2: [
      'Mobile Phones',
      'Accessories & Chargers',
      'Headphones & Earphones',
      'Power Banks',
      'Cables & Adapters',
      'Smart Devices',
      'Home Appliances',
      'Bulbs & Lighting',
      'Batteries',
      'Electronic Components'
    ]
  },
  {
    id: 'clothing-textiles',
    name: 'Clothing & Textiles',
    icon: 'fa-tshirt',
    color: '#ef4444',
    level2: [
      'Men\'s Wear',
      'Women\'s Wear',
      'Kids Wear',
      'Sarees & Traditional',
      'Shirts & T-Shirts',
      'Pants & Jeans',
      'Inner Wear',
      'Footwear',
      'Towels & Bedsheets',
      'Fabrics & Cloth'
    ]
  },
  {
    id: 'hardware-tools',
    name: 'Hardware & Tools',
    icon: 'fa-wrench',
    color: '#64748b',
    level2: [
      'Hand Tools',
      'Power Tools',
      'Fasteners (Screws, Nails)',
      'Electrical Fittings',
      'Plumbing Materials',
      'Paints & Brushes',
      'Building Materials',
      'Safety Equipment',
      'Garden Tools',
      'Measuring Tools'
    ]
  },
  {
    id: 'stationery',
    name: 'Stationery',
    icon: 'fa-pen',
    color: '#06b6d4',
    level2: [
      'Notebooks & Copies',
      'Pens & Pencils',
      'Paper Products',
      'Files & Folders',
      'Art Supplies',
      'Office Supplies',
      'School Supplies',
      'Printing & Binding',
      'Markers & Highlighters',
      'Sticky Notes & Labels'
    ]
  },
  {
    id: 'medicine-healthcare',
    name: 'Medicine & Healthcare',
    icon: 'fa-pills',
    color: '#f43f5e',
    level2: [
      'Prescription Medicines',
      'OTC Medicines',
      'Supplements & Vitamins',
      'First Aid',
      'Medical Devices',
      'Ayurvedic Products',
      'Homeopathy',
      'Baby Care Products',
      'Health Monitors',
      'Surgical Items'
    ]
  },
  {
    id: 'other',
    name: 'Other',
    icon: 'fa-box',
    color: '#9ca3af',
    level2: [
      'Toys & Games',
      'Books & Magazines',
      'Gifts & Decorations',
      'Pet Supplies',
      'Sports & Fitness',
      'Automotive',
      'Miscellaneous'
    ]
  }
];

/**
 * Get all Level 1 categories
 */
export const getAllLevel1InventoryCategories = () => {
  return inventoryCategories.map(cat => ({
    id: cat.id,
    name: cat.name,
    icon: cat.icon,
    color: cat.color,
    level2Options: cat.level2
  }));
};

/**
 * Get Level 2 options for a specific Level 1 category
 */
export const getLevel2InventoryOptions = (level1CategoryId) => {
  const category = inventoryCategories.find(cat => cat.id === level1CategoryId);
  return category ? category.level2 : [];
};

/**
 * Get category details by ID
 */
export const getInventoryCategoryById = (categoryId) => {
  return inventoryCategories.find(cat => cat.id === categoryId);
};

/**
 * Get category icon by name (Level 1 or Level 2)
 */
export const getCategoryIcon = (categoryName) => {
  // First try to find in Level 1
  const level1Cat = inventoryCategories.find(cat => cat.name === categoryName);
  if (level1Cat) return level1Cat.icon;
  
  // If not found, return default
  return 'fa-box';
};

/**
 * Get category color by name (Level 1)
 */
export const getCategoryColor = (categoryName) => {
  const level1Cat = inventoryCategories.find(cat => cat.name === categoryName);
  return level1Cat ? level1Cat.color : '#9ca3af';
};

/**
 * Search categories (both Level 1 and Level 2)
 */
export const searchCategories = (query) => {
  const lowerQuery = query.toLowerCase();
  const results = [];
  
  inventoryCategories.forEach(cat => {
    // Check Level 1
    if (cat.name.toLowerCase().includes(lowerQuery)) {
      results.push({
        level: 1,
        category: cat.name,
        subcategory: null,
        icon: cat.icon,
        color: cat.color
      });
    }
    
    // Check Level 2
    cat.level2.forEach(subcat => {
      if (subcat.toLowerCase().includes(lowerQuery)) {
        results.push({
          level: 2,
          category: cat.name,
          subcategory: subcat,
          icon: cat.icon,
          color: cat.color
        });
      }
    });
  });
  
  return results;
};

export default inventoryCategories;
