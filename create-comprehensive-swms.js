const fs = require('fs');

// Create a comprehensive SWMS with diverse activities and unique hazards/controls
const comprehensiveSWMS = {
  id: 999,
  userId: 999,
  title: 'Commercial Office Fitout - Multi-Trade Project',
  projectName: 'Sydney CBD Office Tower - Level 12 Fitout',
  projectAddress: '123 George Street, Sydney NSW 2000',
  headContractor: 'Premium Construction Group Pty Ltd',
  siteManager: 'Michael Chen',
  tradeType: 'Multi-Trade Construction',
  projectDescription: 'Complete fitout of Level 12 including partition walls, electrical systems, plumbing, HVAC, flooring, and final finishes for corporate office space.',
  work_activities: [
    {
      activity: 'Demolition of Existing Partitions',
      hazards: 'Dust inhalation, Flying debris, Structural damage, Asbestos exposure risk',
      initialRisk: 'H (12)',
      legislation: 'WHS Regulation 2017 Part 4.1, AS 2601:2001',
      residualRisk: 'M (6)',
      controlMeasures: 'Asbestos survey completed, Dust suppression systems, Safety barriers, Personal protective equipment including P2 masks'
    },
    {
      activity: 'Electrical Rough-In Installation',
      hazards: 'Electrical shock, Cable handling injuries, Power tool accidents',
      initialRisk: 'H (15)',
      legislation: 'AS/NZS 3000:2018, WHS Regulation 2017 Part 4.4',
      residualRisk: 'L (3)',
      controlMeasures: 'Licensed electricians only, LOTO procedures, Insulated tools, Circuit testing before energizing'
    },
    {
      activity: 'Plumbing Installation - Water & Waste',
      hazards: 'Chemical exposure from solvents, Manual handling of pipes, Hot work burns',
      initialRisk: 'M (8)',
      legislation: 'Plumbing Code of Australia, WHS Regulation 2017',
      residualRisk: 'L (2)',
      controlMeasures: 'Chemical resistant gloves, Team lifting for heavy pipes, Hot work permits, Ventilation systems'
    },
    {
      activity: 'HVAC Ductwork Installation',
      hazards: 'Working at height, Sharp metal edges, Heavy lifting, Confined spaces',
      initialRisk: 'H (12)',
      legislation: 'AS 1668.2, WHS Regulation 2017 Part 4.5',
      residualRisk: 'M (4)',
      controlMeasures: 'Mobile scaffolding, Cut-resistant gloves, Mechanical lifting equipment, Atmospheric testing'
    },
    {
      activity: 'Drywall Installation & Finishing',
      hazards: 'Dust inhalation, Manual handling, Repetitive strain, Chemical exposure',
      initialRisk: 'M (6)',
      legislation: 'AS/NZS 2311:2009, WHS Regulation 2017',
      residualRisk: 'L (2)',
      controlMeasures: 'Dust extraction systems, Mechanical lifts for sheets, Job rotation, Low-VOC compounds'
    },
    {
      activity: 'Flooring Installation - Carpet & Vinyl',
      hazards: 'Adhesive fumes, Knife cuts, Kneeling injuries, Chemical burns',
      initialRisk: 'M (8)',
      legislation: 'AS 1884, WHS Regulation 2017',
      residualRisk: 'L (2)',
      controlMeasures: 'Adequate ventilation, Safety knives with retractable blades, Knee pads, Chemical-resistant gloves'
    },
    {
      activity: 'Fire Safety System Installation',
      hazards: 'Working at height, Electrical hazards, Pressurized systems, System interference',
      initialRisk: 'H (15)',
      legislation: 'AS 1851, BCA Volume 1, WHS Regulation 2017',
      residualRisk: 'M (4)',
      controlMeasures: 'Fall arrest systems, Qualified fire technicians, Pressure testing protocols, System isolation procedures'
    },
    {
      activity: 'Final Electrical Fit-Off',
      hazards: 'Live electrical work, Arc flash risk, Ladder work, Testing equipment hazards',
      initialRisk: 'E (20)',
      legislation: 'AS/NZS 3000:2018, AS/NZS 4836:2011',
      residualRisk: 'L (3)',
      controlMeasures: 'Arc flash suits, De-energize circuits, Platform ladders, Calibrated test equipment'
    }
  ],
  risk_assessments: [
    {
      hazard: 'Asbestos exposure during demolition',
      riskLevel: 'High',
      residualRisk: 'Low',
      controlMeasure: 'Professional asbestos survey, Licensed removal contractors, Air monitoring'
    },
    {
      hazard: 'Electrical shock from live circuits',
      riskLevel: 'Extreme',
      residualRisk: 'Low',
      controlMeasure: 'LOTO procedures, Licensed electricians, Insulated tools, Circuit testing'
    },
    {
      hazard: 'Falls from height during installation',
      riskLevel: 'High',
      residualRisk: 'Medium',
      controlMeasure: 'Mobile scaffolding, Fall arrest harnesses, Ladder inspections'
    },
    {
      hazard: 'Chemical exposure from adhesives',
      riskLevel: 'Medium',
      residualRisk: 'Low',
      controlMeasure: 'Mechanical ventilation, Chemical-resistant PPE, SDS training'
    },
    {
      hazard: 'Manual handling injuries',
      riskLevel: 'Medium',
      residualRisk: 'Low',
      controlMeasure: 'Mechanical lifting aids, Team lifting procedures, Manual handling training'
    }
  ],
  plant_equipment: [
    {
      item: 'Mobile Scaffold',
      description: 'Aluminium Mobile Tower 6m',
      make_model: 'Youngman BoSS X3',
      registration: 'SC001-2024',
      inspection_date: '15/06/2025',
      risk_level: 'Medium',
      controls: 'Daily inspections, Outriggers deployed, 3:1 height ratio'
    },
    {
      item: 'Concrete Saw',
      description: 'Electric Cut-Off Saw 350mm',
      make_model: 'Husqvarna K970',
      registration: 'CS015-2024',
      inspection_date: '10/06/2025',
      risk_level: 'High',
      controls: 'Dust suppression, PPE required, Trained operators only'
    },
    {
      item: 'Forklift',
      description: 'Electric Counterbalance 2.5T',
      make_model: 'Toyota 8FBE25',
      registration: 'FL003-2024',
      inspection_date: '01/06/2025',
      risk_level: 'High',
      controls: 'Licensed operators, Daily pre-start, Load charts displayed'
    },
    {
      item: 'Welding Equipment',
      description: 'MIG Welder 250A',
      make_model: 'ESAB Rebel EMP 235ic',
      registration: 'WE007-2024',
      inspection_date: '12/06/2025',
      risk_level: 'Medium',
      controls: 'Hot work permits, Fire watch, Qualified welders'
    }
  ],
  emergency_procedures: {
    fire: 'Evacuate immediately via nearest exit. Assembly point: George Street entrance. Call 000.',
    medical: 'First aid trained personnel on each floor. Emergency contact: Site Manager 0412 345 678.',
    evacuation: 'Follow evacuation wardens instructions. Use stairs only. Report to assembly point.',
    spill: 'Contain spill if safe to do so. Notify supervisor immediately. Use spill kits located on each floor.'
  },
  ppe_requirements: [
    'Safety helmets (AS/NZS 1801)',
    'Safety boots (AS/NZS 2210.3)',
    'High visibility clothing (AS/NZS 4602.1)',
    'Safety glasses (AS/NZS 1337.1)',
    'Work gloves appropriate to task',
    'Hearing protection in designated areas'
  ],
  qualifications_required: [
    'Construction Induction (White Card)',
    'Trade-specific licenses and certifications',
    'Working at Height training',
    'Manual handling training',
    'First aid certification (minimum 2 per crew)',
    'Equipment-specific operator training'
  ],
  monitoring_requirements: {
    daily: 'Safety inspections, Equipment checks, Weather conditions',
    weekly: 'Safety meetings, Incident reviews, Training needs assessment',
    monthly: 'Document reviews, Emergency drill, Compliance audit'
  },
  approval: {
    prepared_by: 'Sarah Mitchell - Safety Manager',
    reviewed_by: 'David Thompson - Project Manager',
    approved_by: 'Jennifer Wong - Construction Manager',
    date_approved: '18/06/2025',
    next_review: '18/12/2025'
  },
  isDraft: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

console.log('Creating comprehensive SWMS document...');
console.log(JSON.stringify(comprehensiveSWMS, null, 2));