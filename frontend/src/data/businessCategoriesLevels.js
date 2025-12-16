/**
 * Two-Level Business Categories Structure
 * Level 1: Main Business Category
 * Level 2: Sub-categories/Specializations
 */

export const businessCategories = [
  {
    id: 'manufacturing',
    name: 'Manufacturing & Production',
    level1: [
      {
        id: 'automobile',
        name: 'Automobile',
        level2: [
          'Passenger Vehicles',
          'Commercial Vehicles',
          'Two-wheelers & Three-wheelers',
          'Electric Vehicles (EVs) & Components',
          'Auto Components & Parts',
          'Fabrication Work'
        ]
      },
      {
        id: 'textile',
        name: 'Textile & Apparel',
        level2: [
          'Garment Manufacturing',
          'Spinning & Weaving (Yarn/Fabric)',
          'Home Furnishings (Towels, Bedding)',
          'Technical Textiles',
          'Ready-made Clothing Export'
        ]
      },
      {
        id: 'electronics',
        name: 'Electronics & Electrical',
        level2: [
          'Consumer Electronics (Mobiles, TV)',
          'Industrial Electronics',
          'Electrical Components & Appliances',
          'Semiconductor Manufacturing'
        ]
      },
      {
        id: 'food-processing',
        name: 'Food Processing',
        level2: [
          'Packaged Foods & Ready-to-Eat',
          'Dairy Products (Milk, Cheese, Yogurt)',
          'Beverages (Juices, Soft Drinks)',
          'Confectionery & Bakery Products',
          'Spices & Masala Production'
        ]
      },
      {
        id: 'pharma',
        name: 'Pharmaceuticals & Chemicals',
        level2: [
          'Generic Drug Manufacturing',
          'Active Pharmaceutical Ingredients (APIs)',
          'Vaccines & Biologics',
          'Ayurvedic/Herbal Medicine Production',
          'Industrial Chemicals & Petrochemicals'
        ]
      },
      {
        id: 'heavy-industries',
        name: 'Heavy Industries & Mining',
        level2: [
          'Iron & Steel Production',
          'Cement & Concrete',
          'Oil & Gas Refining',
          'Mining & Mineral Extraction'
        ]
      },
      {
        id: 'packaging',
        name: 'Packaging & Paper',
        level2: [
          'Paper Products & Mills',
          'Plastic Products & Moulding',
          'Corrugated Box & Packaging Materials'
        ]
      }
    ]
  },
  {
    id: 'primary',
    name: 'Primary Sector (Agriculture & Allied)',
    level1: [
      {
        id: 'agriculture',
        name: 'Agriculture & Farming',
        level2: [
          'Crop Farming (Cereals, Pulses)',
          'Horticulture (Fruits, Vegetables, Flowers)',
          'Organic Farming & Produce',
          'Seeds & Fertilizers Trading'
        ]
      },
      {
        id: 'animal-husbandry',
        name: 'Animal Husbandry',
        level2: [
          'Dairy Farming & Production',
          'Poultry & Eggs',
          'Animal Feed Production'
        ]
      },
      {
        id: 'fishing',
        name: 'Fishing & Forestry',
        level2: [
          'Aquaculture (Fish Farming)',
          'Seafood Processing & Export',
          'Timber/Wood Products'
        ]
      }
    ]
  },
  {
    id: 'services',
    name: 'Services & Technology',
    level1: [
      {
        id: 'it-bpm',
        name: 'Information Technology (IT) & BPM',
        level2: [
          'Software Development (Web/Mobile Apps)',
          'IT Consulting & Infrastructure',
          'Cloud Computing Services (AWS/Azure)',
          'BPO/KPO Services',
          'Cybersecurity & Data Analytics'
        ]
      },
      {
        id: 'digital-marketing',
        name: 'Digital Marketing & Advertising',
        level2: [
          'Search Engine Optimization (SEO)',
          'Social Media Marketing (SMM)',
          'Paid Advertising (PPC/Google/Meta Ads)',
          'Content Creation & Copywriting',
          'Website Design & Development'
        ]
      },
      {
        id: 'fintech',
        name: 'Financial Services (FinTech)',
        level2: [
          'Banking & Credit Co-operatives',
          'Insurance (Life/General)',
          'Wealth Management & Investment Advisory',
          'Stock Brokerage & Trading',
          'Lending & NBFCs'
        ]
      },
      {
        id: 'edtech',
        name: 'Education & Training (EdTech)',
        level2: [
          'K-12 Tutoring & Coaching',
          'Higher Education Institution (College/University)',
          'Vocational Training & Skill Development',
          'E-Learning Platforms & Course Providers'
        ]
      },
      {
        id: 'medtech',
        name: 'Healthcare (MedTech)',
        level2: [
          'Hospitals & Multi-specialty Clinics',
          'Specialty Clinics (Dental, Physio, Eye)',
          'Diagnostic Labs & Testing Services',
          'Pharmacy Retail & Distribution',
          'Telemedicine Services'
        ]
      },
      {
        id: 'professional',
        name: 'Professional Services',
        level2: [
          'Legal Consulting (Law Firm)',
          'Accounting, Tax & Audit Consulting',
          'HR, Payroll & Recruitment Services',
          'Management & Strategy Consulting',
          'Architecture & Interior Design'
        ]
      }
    ]
  },
  {
    id: 'trade-logistics',
    name: 'Trade, Logistics & Retail',
    level1: [
      {
        id: 'retail',
        name: 'Retail Trade',
        level2: [
          'Grocery Store/Supermarket (Kirana)',
          'Apparel & Fashion Boutique',
          'Electronics & Appliance Store',
          'Specialty Retail (Gifts, Toys, Books)',
          'E-commerce Retailer'
        ]
      },
      {
        id: 'wholesale',
        name: 'Wholesale & Distribution',
        level2: [
          'FMCG Distributor',
          'Industrial Goods Distributor',
          'Commodity Trader',
          'Import/Export Services'
        ]
      },
      {
        id: 'logistics',
        name: 'Logistics & Transportation',
        level2: [
          'Freight Forwarding & Customs Clearance',
          'E-commerce Delivery/Courier Service',
          'Cold Chain Logistics',
          'Trucking/Fleet Management',
          'Warehouse & Storage Services'
        ]
      }
    ]
  },
  {
    id: 'real-estate',
    name: 'Real Estate & Construction',
    level1: [
      {
        id: 'real-estate',
        name: 'Real Estate',
        level2: [
          'Property Brokerage & Consulting',
          'Rental Management Services',
          'Residential Development',
          'Commercial & Office Space Leasing'
        ]
      },
      {
        id: 'construction',
        name: 'Construction & Contracting',
        level2: [
          'Civil Construction (Roads, Buildings)',
          'Home Builders & Remodeling',
          'Electrical & Plumbing Contracting',
          'HVAC & Fire Safety Services'
        ]
      }
    ]
  },
  {
    id: 'hospitality',
    name: 'Venue, Rental & Hospitality',
    level1: [
      {
        id: 'venue-rental',
        name: 'Recreational Venue Rental',
        level2: [
          'Private Theatres / Mini-Cinemas',
          'Box Cricket / Sports Turf Rental',
          'Gaming Zones & Arcade Rentals',
          'Party Halls & Banquet Spaces'
        ]
      },
      {
        id: 'equipment-rental',
        name: 'Event & Equipment Rental (Tent House)',
        level2: [
          'Tents, Shamianas & Mandap Rentals',
          'Furniture & Decor Rental',
          'Lighting, Sound & DJ Equipment Rental',
          'Generator & Utility Rental (AC/Cooler)'
        ]
      },
      {
        id: 'tourism',
        name: 'Tourism & Hospitality',
        level2: [
          'Hotel & Resort Management',
          'Travel Agency & Tour Operator',
          'Restaurant & Cafes (F&B)',
          'Event Management & Planning'
        ]
      }
    ]
  },
  {
    id: 'personal-services',
    name: 'Personal & Local Services',
    level1: [
      {
        id: 'maintenance',
        name: 'Maintenance & Repair',
        level2: [
          'Auto Repair & Garage Services',
          'Appliance Repair (AC, Refrigerator)',
          'Plumber & Electrician Services',
          'Home Painting & Pest Control'
        ]
      },
      {
        id: 'wellness',
        name: 'Wellness & Grooming',
        level2: [
          'Beauty Salon & Spa',
          'Barber Shop',
          'Fitness Center / Gym',
          'Yoga & Meditation Studio'
        ]
      },
      {
        id: 'misc-services',
        name: 'Miscellaneous Services',
        level2: [
          'Laundry & Dry Cleaning',
          'Domestic & Security Services',
          'Photography & Videography'
        ]
      }
    ]
  }
];

/**
 * Get all Level 1 categories flattened
 */
export const getAllLevel1Categories = () => {
  return businessCategories.flatMap(sector => 
    sector.level1.map(cat => ({
      sectorId: sector.id,
      sectorName: sector.name,
      categoryId: cat.id,
      categoryName: cat.name,
      level2Options: cat.level2
    }))
  );
};

/**
 * Get Level 2 options for a specific Level 1 category
 */
export const getLevel2Options = (level1CategoryId) => {
  for (const sector of businessCategories) {
    const category = sector.level1.find(cat => cat.id === level1CategoryId);
    if (category) {
      return category.level2;
    }
  }
  return [];
};

/**
 * Find category details by ID
 */
export const getCategoryById = (categoryId) => {
  for (const sector of businessCategories) {
    const category = sector.level1.find(cat => cat.id === categoryId);
    if (category) {
      return {
        sector: sector.name,
        category: category.name,
        level2Options: category.level2
      };
    }
  }
  return null;
};
