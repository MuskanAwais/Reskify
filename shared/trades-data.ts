// Comprehensive Australian Construction Trades Database
export const AUSTRALIAN_TRADES = [
  // Core Construction Trades
  "General Construction",
  "Carpentry & Joinery", 
  "Bricklaying & Masonry",
  "Concreting & Cement Work",
  "Steel Fixing & Welding",
  "Roofing & Guttering",
  "Tiling & Waterproofing",
  "Painting & Decorating",
  "Glazing & Window Installation",
  "Flooring & Floor Coverings",
  "Plastering & Rendering",
  "Insulation Installation",
  "Cladding & External Finishes",
  
  // Mechanical & Electrical Trades
  "Electrical Installation",
  "Air Conditioning & Refrigeration",
  "Plumbing & Gasfitting",
  "Fire Protection Systems",
  "Security Systems Installation",
  "Communications & Data Cabling",
  "Solar & Renewable Energy",
  "Mechanical Services",
  "Lift & Escalator Installation",
  "Pool & Spa Construction",
  
  // Specialist Construction
  "Demolition & Asbestos Removal",
  "Excavation & Earthworks",
  "Scaffolding & Access",
  "Crane & Rigging Operations",
  "Piling & Foundations",
  "Road Construction & Civil Works",
  "Bridge & Infrastructure",
  "Tunneling & Underground",
  "Marine Construction",
  "High-Rise Construction",
  
  // Finishing & Specialist Trades
  "Landscape Construction",
  "Fencing & Gates",
  "Signage Installation",
  "Kitchen & Bathroom Installation",
  "Curtain Wall Installation",
  "Stonework & Natural Stone",
  "Shopfitting & Joinery",
  "Heritage & Restoration",
  "Green Roof & Living Walls",
  "Architectural Metalwork",
  
  // Industrial & Specialist
  "Industrial Maintenance",
  "Mining Construction",
  "Petrochemical Construction",
  "Food Processing Facilities",
  "Clean Room Construction",
  "Hospital & Medical Facilities",
  "Educational Facilities",
  "Aged Care Construction",
  "Data Centre Construction",
  "Warehouse & Logistics"
] as const;

export type AustralianTrade = typeof AUSTRALIAN_TRADES[number];

// Trade categories for better organization
export const TRADE_CATEGORIES = {
  "Core Construction": [
    "General Construction",
    "Carpentry & Joinery", 
    "Bricklaying & Masonry",
    "Concreting & Cement Work",
    "Steel Fixing & Welding",
    "Roofing & Guttering",
    "Tiling & Waterproofing",
    "Painting & Decorating",
    "Glazing & Window Installation",
    "Flooring & Floor Coverings",
    "Plastering & Rendering",
    "Insulation Installation",
    "Cladding & External Finishes"
  ],
  "Mechanical & Electrical": [
    "Electrical Installation",
    "Air Conditioning & Refrigeration",
    "Plumbing & Gasfitting",
    "Fire Protection Systems",
    "Security Systems Installation",
    "Communications & Data Cabling",
    "Solar & Renewable Energy",
    "Mechanical Services",
    "Lift & Escalator Installation",
    "Pool & Spa Construction"
  ],
  "Specialist Construction": [
    "Demolition & Asbestos Removal",
    "Excavation & Earthworks",
    "Scaffolding & Access",
    "Crane & Rigging Operations",
    "Piling & Foundations",
    "Road Construction & Civil Works",
    "Bridge & Infrastructure",
    "Tunneling & Underground",
    "Marine Construction",
    "High-Rise Construction"
  ],
  "Finishing & Specialist": [
    "Landscape Construction",
    "Fencing & Gates",
    "Signage Installation",
    "Kitchen & Bathroom Installation",
    "Curtain Wall Installation",
    "Stonework & Natural Stone",
    "Shopfitting & Joinery",
    "Heritage & Restoration",
    "Green Roof & Living Walls",
    "Architectural Metalwork"
  ],
  "Industrial & Specialist": [
    "Industrial Maintenance",
    "Mining Construction",
    "Petrochemical Construction",
    "Food Processing Facilities",
    "Clean Room Construction",
    "Hospital & Medical Facilities",
    "Educational Facilities",
    "Aged Care Construction",
    "Data Centre Construction",
    "Warehouse & Logistics"
  ]
} as const;