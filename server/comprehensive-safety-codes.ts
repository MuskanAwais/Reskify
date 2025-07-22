// Comprehensive Australian Construction Safety Codes Database
// Based on training data and Australian construction standards

export interface SafetyCode {
  id: string;
  code: string;
  title: string;
  description: string;
  category: string;
  applicableTrades: string[];
  lastUpdated: string;
  mandatory: boolean;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
}

export const COMPREHENSIVE_SAFETY_CODES: SafetyCode[] = [
  // Work Health and Safety Act and Regulations
  {
    id: 'whs-act-2011',
    code: 'Work Health and Safety Act 2011',
    title: 'Work Health and Safety Act 2011',
    description: 'Primary workplace health and safety legislation covering duties of care, consultation, and compliance requirements',
    category: 'Primary Legislation',
    applicableTrades: ['All'],
    lastUpdated: '2024-01-01',
    mandatory: true,
    riskLevel: 'Critical'
  },
  {
    id: 'whs-reg-2017',
    code: 'Work Health and Safety Regulation 2017',
    title: 'Work Health and Safety Regulation 2017',
    description: 'Detailed regulations implementing the WHS Act, covering specific workplace safety requirements',
    category: 'Primary Legislation',
    applicableTrades: ['All'],
    lastUpdated: '2024-01-01',
    mandatory: true,
    riskLevel: 'Critical'
  },

  // Building Codes and Standards
  {
    id: 'bca-2022',
    code: 'Building Code of Australia',
    title: 'National Construction Code (Building Code of Australia)',
    description: 'Technical provisions for the design and construction of buildings and other structures',
    category: 'Building Standards',
    applicableTrades: ['All'],
    lastUpdated: '2022-05-01',
    mandatory: true,
    riskLevel: 'High'
  },
  {
    id: 'ncc-2022',
    code: 'National Construction Code',
    title: 'National Construction Code 2022',
    description: 'Performance-based code incorporating building and plumbing codes',
    category: 'Building Standards',
    applicableTrades: ['All'],
    lastUpdated: '2022-05-01',
    mandatory: true,
    riskLevel: 'High'
  },

  // Electrical Standards
  {
    id: 'as-nzs-3000',
    code: 'AS/NZS 3000:2018',
    title: 'Electrical installations (known as the Australian/New Zealand Wiring Rules)',
    description: 'Standards for electrical installations in buildings and structures',
    category: 'Electrical Standards',
    applicableTrades: ['Electrical', 'HVAC', 'General'],
    lastUpdated: '2018-09-01',
    mandatory: true,
    riskLevel: 'Critical'
  },
  {
    id: 'as-nzs-3012',
    code: 'AS/NZS 3012:2019',
    title: 'Electrical installations - Construction and demolition sites',
    description: 'Electrical safety requirements for construction and demolition sites',
    category: 'Electrical Standards',
    applicableTrades: ['Electrical', 'All'],
    lastUpdated: '2019-03-01',
    mandatory: true,
    riskLevel: 'Critical'
  },

  // Personal Protective Equipment
  {
    id: 'as-nzs-1801',
    code: 'AS/NZS 1801:1997',
    title: 'Occupational protective helmets',
    description: 'Requirements for protective helmets used in workplaces',
    category: 'PPE Standards',
    applicableTrades: ['All'],
    lastUpdated: '1997-01-01',
    mandatory: true,
    riskLevel: 'High'
  },
  {
    id: 'as-nzs-1715',
    code: 'AS/NZS 1715:2009',
    title: 'Selection, use and maintenance of respiratory protective equipment',
    description: 'Guidelines for respiratory protection in hazardous environments',
    category: 'PPE Standards',
    applicableTrades: ['All'],
    lastUpdated: '2009-01-01',
    mandatory: true,
    riskLevel: 'Critical'
  },
  {
    id: 'as-nzs-2210',
    code: 'AS/NZS 2210.1:2010',
    title: 'Safety, protective and occupational footwear',
    description: 'Requirements for occupational safety footwear',
    category: 'PPE Standards',
    applicableTrades: ['All'],
    lastUpdated: '2010-01-01',
    mandatory: true,
    riskLevel: 'Medium'
  },

  // Fall Protection and Working at Height
  {
    id: 'as-nzs-1891',
    code: 'AS/NZS 1891.1:2007',
    title: 'Industrial fall-arrest systems and devices',
    description: 'Safety harnesses and fall-arrest systems requirements',
    category: 'Fall Protection',
    applicableTrades: ['All'],
    lastUpdated: '2007-01-01',
    mandatory: true,
    riskLevel: 'Critical'
  },
  {
    id: 'as-nzs-4576',
    code: 'AS/NZS 4576:1995',
    title: 'Guidelines for scaffolding',
    description: 'Safety requirements for scaffolding systems',
    category: 'Scaffolding',
    applicableTrades: ['Scaffolding', 'All'],
    lastUpdated: '1995-01-01',
    mandatory: true,
    riskLevel: 'Critical'
  },

  // Structural and Mechanical Standards
  {
    id: 'as-1100',
    code: 'Australian Standards AS 1100',
    title: 'Technical drawing standards',
    description: 'Standards for technical drawings and documentation',
    category: 'Technical Standards',
    applicableTrades: ['Carpentry', 'Structural', 'Engineering'],
    lastUpdated: '2020-01-01',
    mandatory: false,
    riskLevel: 'Low'
  },
  {
    id: 'as-1100-tech',
    code: 'Australian Standards AS 1100 - Technical drawing',
    title: 'Technical drawing - Architectural and building drawings',
    description: 'Specific standards for architectural and building technical drawings',
    category: 'Technical Standards',
    applicableTrades: ['Painting', 'Carpentry', 'All'],
    lastUpdated: '2020-01-01',
    mandatory: false,
    riskLevel: 'Low'
  },

  // Plumbing Standards
  {
    id: 'as-3500',
    code: 'Australian Standards AS 3500',
    title: 'Plumbing and drainage',
    description: 'National plumbing and drainage standards',
    category: 'Plumbing Standards',
    applicableTrades: ['Plumbing', 'HVAC'],
    lastUpdated: '2021-01-01',
    mandatory: true,
    riskLevel: 'High'
  },
  {
    id: 'as-3500-series',
    code: 'AS 3500 Series',
    title: 'Plumbing and drainage standards series',
    description: 'Complete series of plumbing and drainage standards',
    category: 'Plumbing Standards',
    applicableTrades: ['Plumbing'],
    lastUpdated: '2021-01-01',
    mandatory: true,
    riskLevel: 'High'
  },

  // Fire Safety and Emergency
  {
    id: 'as-1851',
    code: 'AS 1851:2012',
    title: 'Routine service of fire protection systems and equipment',
    description: 'Maintenance and testing of fire protection systems',
    category: 'Fire Safety',
    applicableTrades: ['Fire Protection', 'Electrical', 'HVAC'],
    lastUpdated: '2012-01-01',
    mandatory: true,
    riskLevel: 'Critical'
  },
  {
    id: 'as-2419',
    code: 'AS 2419.1:2021',
    title: 'Fire hydrant installations',
    description: 'Design, installation and commissioning of fire hydrant systems',
    category: 'Fire Safety',
    applicableTrades: ['Plumbing', 'Fire Protection'],
    lastUpdated: '2021-01-01',
    mandatory: true,
    riskLevel: 'Critical'
  },

  // Confined Spaces
  {
    id: 'as-2865',
    code: 'AS 2865:2009',
    title: 'Confined spaces',
    description: 'Safe working in confined spaces procedures and requirements',
    category: 'Confined Spaces',
    applicableTrades: ['All'],
    lastUpdated: '2009-01-01',
    mandatory: true,
    riskLevel: 'Critical'
  },

  // Noise and Vibration
  {
    id: 'as-2436',
    code: 'AS 2436:2010',
    title: 'Guide to noise and vibration control on construction, demolition and maintenance sites',
    description: 'Control measures for noise and vibration in construction',
    category: 'Environmental',
    applicableTrades: ['All'],
    lastUpdated: '2010-01-01',
    mandatory: true,
    riskLevel: 'Medium'
  },

  // Asbestos Management
  {
    id: 'how-to-manage-asbestos',
    code: 'How to manage and control asbestos in the workplace',
    title: 'Code of Practice: How to manage and control asbestos in the workplace',
    description: 'Safe Work Australia code for asbestos management',
    category: 'Hazardous Materials',
    applicableTrades: ['All'],
    lastUpdated: '2022-01-01',
    mandatory: true,
    riskLevel: 'Critical'
  },

  // Manual Handling
  {
    id: 'manual-handling',
    code: 'Code of Practice: Managing the risk of musculoskeletal disorders at work',
    title: 'Manual handling and ergonomics code of practice',
    description: 'Prevention of musculoskeletal disorders in the workplace',
    category: 'Manual Handling',
    applicableTrades: ['All'],
    lastUpdated: '2021-01-01',
    mandatory: true,
    riskLevel: 'High'
  },

  // First Aid
  {
    id: 'first-aid-workplace',
    code: 'Code of Practice: First aid in the workplace',
    title: 'First aid requirements and procedures',
    description: 'Workplace first aid requirements and emergency response',
    category: 'Emergency Response',
    applicableTrades: ['All'],
    lastUpdated: '2021-01-01',
    mandatory: true,
    riskLevel: 'High'
  },

  // Aviation Security (Airport specific)
  {
    id: 'aviation-security',
    code: 'Aviation Security Requirements',
    title: 'Aviation Security Identification Card (ASIC) Requirements',
    description: 'Security requirements for airport construction work',
    category: 'Aviation Security',
    applicableTrades: ['All'],
    lastUpdated: '2024-01-01',
    mandatory: true,
    riskLevel: 'Critical'
  },

  // Demolition
  {
    id: 'demolition-cop',
    code: 'Code of Practice: Demolition work',
    title: 'Safe demolition practices and procedures',
    description: 'Safety requirements for demolition activities',
    category: 'Demolition',
    applicableTrades: ['Demolition', 'All'],
    lastUpdated: '2021-01-01',
    mandatory: true,
    riskLevel: 'Critical'
  },

  // Excavation
  {
    id: 'excavation-cop',
    code: 'Code of Practice: Excavation work',
    title: 'Safe excavation practices and trench safety',
    description: 'Safety requirements for excavation and trenching',
    category: 'Excavation',
    applicableTrades: ['Excavation', 'Civil', 'All'],
    lastUpdated: '2021-01-01',
    mandatory: true,
    riskLevel: 'Critical'
  },

  // Concrete and Formwork
  {
    id: 'concrete-formwork',
    code: 'Code of Practice: Concrete and masonry work',
    title: 'Safe concrete pouring and formwork practices',
    description: 'Safety requirements for concrete and masonry construction',
    category: 'Concrete Work',
    applicableTrades: ['Concrete', 'Carpentry', 'All'],
    lastUpdated: '2021-01-01',
    mandatory: true,
    riskLevel: 'High'
  }
];

export function getAllSafetyCodes(): SafetyCode[] {
  return COMPREHENSIVE_SAFETY_CODES;
}

export function getSafetyCodesByTrade(tradeName: string): SafetyCode[] {
  return COMPREHENSIVE_SAFETY_CODES.filter(code => 
    code.applicableTrades.includes(tradeName) || code.applicableTrades.includes('All')
  );
}

export function getMandatorySafetyCodes(): SafetyCode[] {
  return COMPREHENSIVE_SAFETY_CODES.filter(code => code.mandatory);
}

export function getSafetyCodesByCategory(category: string): SafetyCode[] {
  return COMPREHENSIVE_SAFETY_CODES.filter(code => code.category === category);
}

export function searchSafetyCodes(searchTerm: string): SafetyCode[] {
  const term = searchTerm.toLowerCase();
  return COMPREHENSIVE_SAFETY_CODES.filter(code => 
    code.code.toLowerCase().includes(term) ||
    code.title.toLowerCase().includes(term) ||
    code.description.toLowerCase().includes(term) ||
    code.category.toLowerCase().includes(term)
  );
}

export function getCriticalSafetyCodes(): SafetyCode[] {
  return COMPREHENSIVE_SAFETY_CODES.filter(code => code.riskLevel === 'Critical');
}