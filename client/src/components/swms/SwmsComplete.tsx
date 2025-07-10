import React, { useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// RiskBadgeNew Component (inline for simplicity)
interface RiskBadgeProps {
  level: string;
  score: number;
}

const RiskBadgeNew: React.FC<RiskBadgeProps> = ({ level, score }) => {
  const getBackgroundColor = (riskLevel: string) => {
    switch (riskLevel?.toLowerCase()) {
      case 'extreme': return '#ef4444';
      case 'high': return '#f97316';
      case 'medium': return '#eab308';
      case 'low': return '#22c55e';
      default: return '#22c55e';
    }
  };

  const capitalizedLevel = level ? level.charAt(0).toUpperCase() + level.slice(1) : 'Low';

  return (
    <span 
      className="risk-badge-override"
      style={{
        backgroundColor: getBackgroundColor(level),
        color: '#ffffff',
        height: '24px',
        width: '70px',
        fontSize: '10px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        borderRadius: '4px',
        fontWeight: '600',
        fontFamily: 'Inter, Arial, sans-serif',
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        lineHeight: 1
      }}
    >
      {capitalizedLevel} ({score})
    </span>
  );
};

// Riskify Logo as inline SVG
const RiskifyLogo = () => (
  <svg width="86" height="86" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="10" fill="#2c5530"/>
    <text x="50" y="35" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">RISKIFY</text>
    <text x="50" y="55" textAnchor="middle" fill="white" fontSize="8">CONSTRUCTION</text>
    <text x="50" y="70" textAnchor="middle" fill="white" fontSize="8">SAFETY</text>
  </svg>
);

// Default form data
const defaultFormData = {
  // Project Information
  companyName: 'Riskify Construction',
  projectName: 'Test Project Name',
  projectNumber: 'PRJ-2025-001',
  projectAddress: '123 Construction Site, Sydney NSW 2000',
  jobName: 'Commercial Building Construction',
  jobNumber: 'JOB-2025-001',
  startDate: '2025-01-15',
  duration: '6 months',
  dateCreated: new Date().toISOString().split('T')[0],
  principalContractor: 'Riskify Construction Pty Ltd',
  projectManager: 'John Smith',
  siteSupervisor: 'Mike Johnson',
  authorisingPerson: 'Sarah Williams',
  authorisingPosition: 'Project Manager',
  authorisingSignature: 'Sarah Williams',
  scopeOfWorks: 'Construction of a 5-story commercial building including excavation, foundation work, structural steel erection, concrete work, and building envelope installation.',
  companyLogo: null,

  // Emergency Information
  emergencyContacts: [
    { name: 'Emergency Services', phone: '000' },
    { name: 'Site Supervisor', phone: '0412 345 678' },
    { name: 'Project Manager', phone: '0423 456 789' }
  ],
  emergencyProcedures: 'In case of emergency, immediately call 000 and notify site supervisor. Evacuate personnel to designated assembly point. Provide first aid if qualified. Do not move seriously injured persons unless in immediate danger.',
  emergencyMonitoring: 'Regular safety meetings will be held weekly. Emergency procedures will be reviewed monthly. All personnel must be inducted and familiar with emergency procedures.',

  // High Risk Activities
  highRiskActivities: [
    { id: '1', title: 'Working at Heights', description: 'Any work performed at height above 2 meters', selected: true, riskLevel: 'high' },
    { id: '2', title: 'Excavation Work', description: 'Excavation deeper than 1.5 meters', selected: true, riskLevel: 'high' },
    { id: '3', title: 'Crane Operations', description: 'Operation of mobile or tower cranes', selected: true, riskLevel: 'medium' },
    { id: '4', title: 'Hot Work', description: 'Welding, cutting, grinding operations', selected: true, riskLevel: 'medium' },
    { id: '5', title: 'Confined Space Entry', description: 'Entry into confined spaces', selected: false, riskLevel: 'extreme' },
    { id: '6', title: 'Electrical Work', description: 'Electrical installation and maintenance', selected: true, riskLevel: 'medium' }
  ],

  // Work Activities
  workActivities: [
    {
      id: '1',
      activity: 'Site Setup and Preparation',
      hazards: ['Uneven ground', 'Overhead hazards', 'Vehicular traffic'],
      initialRisk: 'medium',
      initialRiskScore: 8,
      controlMeasures: ['Establish clear site boundaries', 'Install temporary lighting', 'Implement traffic management plan'],
      residualRisk: 'low',
      residualRiskScore: 4,
      legislation: 'WHS Regulation 2017 - Part 3.1'
    },
    {
      id: '2',
      activity: 'Excavation Work',
      hazards: ['Cave-in', 'Underground services', 'Water accumulation'],
      initialRisk: 'high',
      initialRiskScore: 12,
      controlMeasures: ['Dial before you dig', 'Battering or shoring', 'Competent person inspection'],
      residualRisk: 'medium',
      residualRiskScore: 6,
      legislation: 'WHS Regulation 2017 - Part 4.4'
    },
    {
      id: '3',
      activity: 'Crane Operations',
      hazards: ['Structural collapse', 'Electrocution', 'Falling objects'],
      initialRisk: 'high',
      initialRiskScore: 15,
      controlMeasures: ['Licensed operator', 'Exclusion zones', 'Pre-start inspections'],
      residualRisk: 'medium',
      residualRiskScore: 8,
      legislation: 'WHS Regulation 2017 - Part 4.3'
    },
    {
      id: '4',
      activity: 'Working at Heights',
      hazards: ['Falls from height', 'Falling objects', 'Structural instability'],
      initialRisk: 'high',
      initialRiskScore: 16,
      controlMeasures: ['Fall prevention devices', 'Safety harnesses', 'Scaffold inspection'],
      residualRisk: 'medium',
      residualRiskScore: 6,
      legislation: 'WHS Regulation 2017 - Part 4.4'
    },
    {
      id: '5',
      activity: 'Concrete Work',
      hazards: ['Chemical burns', 'Manual handling', 'Noise exposure'],
      initialRisk: 'medium',
      initialRiskScore: 9,
      controlMeasures: ['PPE requirement', 'Mechanical aids', 'Hearing protection'],
      residualRisk: 'low',
      residualRiskScore: 4,
      legislation: 'WHS Regulation 2017 - Part 3.2'
    },
    {
      id: '6',
      activity: 'Electrical Installation',
      hazards: ['Electrocution', 'Arc flash', 'Fire hazard'],
      initialRisk: 'high',
      initialRiskScore: 14,
      controlMeasures: ['Licensed electrician', 'Isolation procedures', 'Testing and tagging'],
      residualRisk: 'medium',
      residualRiskScore: 7,
      legislation: 'WHS Regulation 2017 - Part 4.8'
    }
  ],

  // PPE Requirements
  ppeItems: [
    { id: '1', item: 'Hard Hat', description: 'AS/NZS 1801 approved', required: true },
    { id: '2', item: 'Safety Glasses', description: 'AS/NZS 1337 approved', required: true },
    { id: '3', item: 'High-Vis Vest', description: 'AS/NZS 4602.1 Class D', required: true },
    { id: '4', item: 'Steel Cap Boots', description: 'AS/NZS 2210.3 approved', required: true },
    { id: '5', item: 'Work Gloves', description: 'Cut resistant Level 3', required: true },
    { id: '6', item: 'Hearing Protection', description: 'AS/NZS 1270 approved', required: true },
    { id: '7', item: 'Respiratory Protection', description: 'P2 dust mask minimum', required: false },
    { id: '8', item: 'Fall Arrest Harness', description: 'AS/NZS 1891.1 approved', required: false }
  ],

  // Sign In Register
  signInEntries: [
    { id: '1', name: 'John Smith', position: 'Project Manager', company: 'Riskify Construction', induction: '2025-01-10', signature: 'JS', initial: 'JS' },
    { id: '2', name: 'Mike Johnson', position: 'Site Supervisor', company: 'Riskify Construction', induction: '2025-01-10', signature: 'MJ', initial: 'MJ' },
    { id: '3', name: 'Sarah Williams', position: 'Safety Officer', company: 'Riskify Construction', induction: '2025-01-10', signature: 'SW', initial: 'SW' }
  ],

  // MSDS Documents
  msdsDocuments: [
    { id: '1', substance: 'Concrete Sealer', manufacturer: 'BuildChem', sdsNumber: 'BC-001', hazardClass: 'Flammable Liquid', emergencyContact: '1800-POISON' },
    { id: '2', substance: 'Welding Consumables', manufacturer: 'WeldTech', sdsNumber: 'WT-205', hazardClass: 'Compressed Gas', emergencyContact: '1800-POISON' },
    { id: '3', substance: 'Adhesive Primer', manufacturer: 'SealPro', sdsNumber: 'SP-150', hazardClass: 'Corrosive', emergencyContact: '1800-POISON' }
  ]
};

// Main component
const SwmsComplete: React.FC = () => {
  const [formData, setFormData] = useState(defaultFormData);
  const [activeTab, setActiveTab] = useState('project-info');
  const [showPreview, setShowPreview] = useState(true);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Handle form input changes
  const handleInputChange = (section: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const handleDirectChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle array changes
  const handleArrayChange = (section: string, index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: (prev[section as keyof typeof prev] as any[]).map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const addArrayItem = (section: string, newItem: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: [...(prev[section as keyof typeof prev] as any[]), newItem]
    }));
  };

  const removeArrayItem = (section: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      [section]: (prev[section as keyof typeof prev] as any[]).filter((_, i) => i !== index)
    }));
  };

  // PDF Generation
  const generatePDF = async () => {
    setIsGeneratingPDF(true);
    
    try {
      // Get the preview element
      const previewElement = document.getElementById('swms-preview');
      if (!previewElement) {
        throw new Error('Preview element not found');
      }

      // Create canvas from preview
      const canvas = await html2canvas(previewElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      // Create PDF
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 297; // A4 landscape width
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      // Download PDF
      pdf.save(`${formData.projectName}_SWMS_${new Date().toISOString().split('T')[0]}.pdf`);
      
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Navigation tabs
  const tabs = [
    { id: 'project-info', label: 'Project Information', icon: '📋' },
    { id: 'emergency-info', label: 'Emergency Information', icon: '🚨' },
    { id: 'high-risk', label: 'High Risk Activities', icon: '⚠️' },
    { id: 'risk-matrix', label: 'Risk Matrix', icon: '📊' },
    { id: 'work-activities', label: 'Work Activities', icon: '🔧' },
    { id: 'ppe', label: 'PPE', icon: '🦺' },
    { id: 'plant-equipment', label: 'Plant & Equipment', icon: '🏗️' },
    { id: 'sign-in', label: 'Sign in Register', icon: '✍️' },
    { id: 'msds', label: 'MSDS', icon: '📄' }
  ];

  return (
    <div className="swms-container" style={{ 
      fontFamily: 'Inter, Arial, sans-serif', 
      backgroundColor: '#f8fafc',
      minHeight: '100vh',
      display: 'flex'
    }}>
      {/* Left Sidebar */}
      <div className="sidebar" style={{
        width: '300px',
        backgroundColor: '#ffffff',
        borderRight: '1px solid #e2e8f0',
        padding: '20px',
        overflow: 'auto',
        flexShrink: 0
      }}>
        {/* Header */}
        <div className="sidebar-header" style={{ marginBottom: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <RiskifyLogo />
            <div>
              <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>
                SWMS Generator
              </h1>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                Safe Work Method Statement
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="sidebar-nav" style={{ marginBottom: '30px' }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
              style={{
                width: '100%',
                padding: '12px 16px',
                margin: '2px 0',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: activeTab === tab.id ? '#3b82f6' : 'transparent',
                color: activeTab === tab.id ? '#ffffff' : '#475569',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                textAlign: 'left',
                transition: 'all 0.2s'
              }}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>

        {/* PDF Generation Buttons */}
        <div className="pdf-buttons" style={{ 
          borderTop: '1px solid #e2e8f0',
          paddingTop: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <button
            onClick={generatePDF}
            disabled={isGeneratingPDF}
            style={{
              padding: '12px 20px',
              backgroundColor: '#10b981',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: isGeneratingPDF ? 'not-allowed' : 'pointer',
              opacity: isGeneratingPDF ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {isGeneratingPDF ? '⏳ Generating...' : '📄 Generate PDF'}
          </button>
          
          <button
            onClick={() => window.print()}
            style={{
              padding: '12px 20px',
              backgroundColor: '#6366f1',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            🖨️ Print
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="main-content" style={{ 
        flex: 1,
        display: 'flex',
        overflow: 'hidden'
      }}>
        {/* Form Section */}
        <div className="form-section" style={{
          width: showPreview ? '50%' : '100%',
          padding: '20px',
          overflow: 'auto',
          backgroundColor: '#ffffff',
          borderRight: showPreview ? '1px solid #e2e8f0' : 'none'
        }}>
          {/* Project Information Tab */}
          {activeTab === 'project-info' && (
            <div className="project-info-form">
              <h2 style={{ marginBottom: '20px', color: '#1e293b' }}>Project Information</h2>
              
              <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#374151' }}>
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => handleDirectChange('companyName', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#374151' }}>
                    Project Name
                  </label>
                  <input
                    type="text"
                    value={formData.projectName}
                    onChange={(e) => handleDirectChange('projectName', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#374151' }}>
                    Project Number
                  </label>
                  <input
                    type="text"
                    value={formData.projectNumber}
                    onChange={(e) => handleDirectChange('projectNumber', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#374151' }}>
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleDirectChange('startDate', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#374151' }}>
                    Project Address
                  </label>
                  <input
                    type="text"
                    value={formData.projectAddress}
                    onChange={(e) => handleDirectChange('projectAddress', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#374151' }}>
                    Principal Contractor
                  </label>
                  <input
                    type="text"
                    value={formData.principalContractor}
                    onChange={(e) => handleDirectChange('principalContractor', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#374151' }}>
                    Project Manager
                  </label>
                  <input
                    type="text"
                    value={formData.projectManager}
                    onChange={(e) => handleDirectChange('projectManager', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#374151' }}>
                    Site Supervisor
                  </label>
                  <input
                    type="text"
                    value={formData.siteSupervisor}
                    onChange={(e) => handleDirectChange('siteSupervisor', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#374151' }}>
                    Duration
                  </label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => handleDirectChange('duration', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#374151' }}>
                    Scope of Works
                  </label>
                  <textarea
                    value={formData.scopeOfWorks}
                    onChange={(e) => handleDirectChange('scopeOfWorks', e.target.value)}
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      resize: 'vertical'
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Work Activities Tab */}
          {activeTab === 'work-activities' && (
            <div className="work-activities-form">
              <h2 style={{ marginBottom: '20px', color: '#1e293b' }}>Work Activities</h2>
              
              <div className="activities-list">
                {formData.workActivities.map((activity, index) => (
                  <div key={activity.id} className="activity-card" style={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '16px',
                    marginBottom: '16px'
                  }}>
                    <div className="activity-header" style={{ marginBottom: '12px' }}>
                      <input
                        type="text"
                        value={activity.activity}
                        onChange={(e) => handleArrayChange('workActivities', index, 'activity', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px',
                          fontWeight: '600'
                        }}
                        placeholder="Activity name"
                      />
                    </div>

                    <div className="activity-details" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#6b7280' }}>
                          Initial Risk
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <select
                            value={activity.initialRisk}
                            onChange={(e) => handleArrayChange('workActivities', index, 'initialRisk', e.target.value)}
                            style={{
                              padding: '6px 8px',
                              border: '1px solid #d1d5db',
                              borderRadius: '4px',
                              fontSize: '12px'
                            }}
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="extreme">Extreme</option>
                          </select>
                          <RiskBadgeNew level={activity.initialRisk} score={activity.initialRiskScore} />
                        </div>
                      </div>

                      <div>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#6b7280' }}>
                          Residual Risk
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <select
                            value={activity.residualRisk}
                            onChange={(e) => handleArrayChange('workActivities', index, 'residualRisk', e.target.value)}
                            style={{
                              padding: '6px 8px',
                              border: '1px solid #d1d5db',
                              borderRadius: '4px',
                              fontSize: '12px'
                            }}
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="extreme">Extreme</option>
                          </select>
                          <RiskBadgeNew level={activity.residualRisk} score={activity.residualRiskScore} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add other tabs as needed */}
          {activeTab === 'high-risk' && (
            <div className="high-risk-form">
              <h2 style={{ marginBottom: '20px', color: '#1e293b' }}>High Risk Construction Work</h2>
              
              <div className="risk-activities-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                {formData.highRiskActivities.map((activity, index) => (
                  <div key={activity.id} className="risk-activity-card" style={{
                    backgroundColor: activity.selected ? '#fef3c7' : '#f8fafc',
                    border: `2px solid ${activity.selected ? '#f59e0b' : '#e2e8f0'}`,
                    borderRadius: '8px',
                    padding: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onClick={() => handleArrayChange('highRiskActivities', index, 'selected', !activity.selected)}
                  >
                    <div className="risk-activity-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
                        {activity.title}
                      </h3>
                      <RiskBadgeNew level={activity.riskLevel} score={activity.riskLevel === 'high' ? 12 : activity.riskLevel === 'medium' ? 8 : 16} />
                    </div>
                    <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
                      {activity.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add other form sections as needed */}
        </div>

        {/* Preview Section - Figma Design Implementation */}
        {showPreview && (
          <div className="preview-section" style={{
            width: '50%',
            backgroundColor: '#f8fafc',
            overflow: 'auto',
            position: 'relative'
          }}>
            <div className="preview-header" style={{
              padding: '16px 20px',
              backgroundColor: '#ffffff',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>
                Document Preview
              </h3>
              <button
                onClick={() => setShowPreview(false)}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#f3f4f6',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                Hide Preview
              </button>
            </div>

            <div className="preview-content" style={{ padding: '20px' }}>
              <div id="swms-preview" style={{
                backgroundColor: '#ffffff',
                padding: '40px',
                borderRadius: '12px',
                boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                maxWidth: '794px', // A4 landscape width
                minHeight: '1123px', // A4 landscape height
                margin: '0 auto',
                fontSize: '12px',
                lineHeight: '1.5',
                fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
              }}>
                {/* Figma Header - Exact Design Match */}
                <div className="figma-header" style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  marginBottom: '40px',
                  paddingTop: '20px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{
                      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                      fontSize: '32px',
                      fontWeight: '700',
                      color: '#0f766e',
                      marginRight: '20px'
                    }}>
                      Riskify
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'flex-end',
                      fontSize: '14px',
                      color: '#6b7280',
                      marginBottom: '16px',
                      lineHeight: '1.4'
                    }}>
                      <div>User Company Name</div>
                      <div>Project Name</div>
                      <div>Project Number</div>
                      <div>Project Address</div>
                    </div>
                    <div style={{ 
                      width: '160px',
                      height: '80px',
                      border: '2px solid #d1d5db',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      color: '#9ca3af',
                      textAlign: 'center',
                      backgroundColor: '#f9fafb'
                    }}>
                      Insert company logo here
                    </div>
                  </div>
                </div>

                {/* Project Information Page - Exact Figma Match */}
                {activeTab === 'project-info' && (
                  <div className="figma-project-info">
                    <div style={{
                      marginBottom: '40px'
                    }}>
                      <h1 style={{ 
                        margin: 0, 
                        fontSize: '32px', 
                        fontWeight: '700', 
                        color: '#1e293b',
                        marginBottom: '24px'
                      }}>
                        Safe Work Method Statement
                      </h1>
                      <h2 style={{ 
                        margin: 0, 
                        fontSize: '24px', 
                        fontWeight: '600', 
                        color: '#1e293b'
                      }}>
                        Project Information
                      </h2>
                    </div>

                    <div className="figma-info-sections" style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '40px',
                      marginBottom: '40px'
                    }}>
                      {/* Left Column */}
                      <div className="figma-info-card" style={{
                        backgroundColor: '#ffffff',
                        padding: '24px',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                      }}>
                        <div style={{ fontWeight: '600', color: '#1e293b', marginBottom: '4px' }}>Job Name:</div>
                        <div style={{ color: '#1e293b', fontSize: '16px', marginBottom: '20px' }}>{formData.projectName || 'Test Project Name'}</div>
                        
                        <div style={{ fontWeight: '600', color: '#1e293b', marginBottom: '4px' }}>Job Number:</div>
                        <div style={{ color: '#1e293b', fontSize: '16px', marginBottom: '20px' }}>{formData.projectNumber || '123 456'}</div>
                        
                        <div style={{ fontWeight: '600', color: '#1e293b', marginBottom: '4px' }}>Project Address:</div>
                        <div style={{ color: '#1e293b', fontSize: '16px', marginBottom: '20px' }}>{formData.projectAddress || '123 Sample Job Address'}</div>
                        
                        <div style={{ fontWeight: '600', color: '#1e293b', marginBottom: '4px' }}>Start Date:</div>
                        <div style={{ color: '#1e293b', fontSize: '16px', marginBottom: '20px' }}>{new Date(formData.startDate).toLocaleDateString() || '12th July 2025'}</div>
                        
                        <div style={{ fontWeight: '600', color: '#1e293b', marginBottom: '4px' }}>Duration:</div>
                        <div style={{ color: '#1e293b', fontSize: '16px', marginBottom: '20px' }}>{formData.duration || '8 Weeks'}</div>
                        
                        <div style={{ fontWeight: '600', color: '#1e293b', marginBottom: '4px' }}>Date Created:</div>
                        <div style={{ color: '#1e293b', fontSize: '16px' }}>23rd June 2025</div>
                      </div>

                      {/* Right Column */}
                      <div className="figma-info-card" style={{
                        backgroundColor: '#ffffff',
                        padding: '24px',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                      }}>
                        <div style={{ fontWeight: '600', color: '#1e293b', marginBottom: '4px' }}>Company Name:</div>
                        <div style={{ color: '#1e293b', fontSize: '16px', marginBottom: '20px' }}>{formData.companyName || 'Test Company Name'}</div>
                        
                        <div style={{ fontWeight: '600', color: '#1e293b', marginBottom: '4px' }}>Principal Contractor's Name:</div>
                        <div style={{ color: '#1e293b', fontSize: '16px', fontStyle: 'italic', marginBottom: '20px' }}>{formData.principalContractor || 'Test Principal Contractor'}</div>
                        
                        <div style={{ fontWeight: '600', color: '#1e293b', marginBottom: '4px' }}>Project Manager:</div>
                        <div style={{ color: '#1e293b', fontSize: '16px', fontStyle: 'italic', marginBottom: '20px' }}>{formData.projectManager || 'Test Project Manager Name'}</div>
                        
                        <div style={{ fontWeight: '600', color: '#1e293b', marginBottom: '4px' }}>Site Supervisor:</div>
                        <div style={{ color: '#1e293b', fontSize: '16px', fontStyle: 'italic', marginBottom: '20px' }}>{formData.siteSupervisor || 'Test Project Supervisor'}</div>
                        
                        <div style={{ fontWeight: '600', color: '#1e293b', marginBottom: '12px', textDecoration: 'underline' }}>
                          Person Authorising SWMS
                        </div>
                        <div style={{ fontWeight: '600', color: '#1e293b', marginBottom: '4px' }}>Name:</div>
                        <div style={{ color: '#1e293b', fontSize: '16px', fontStyle: 'italic', marginBottom: '12px' }}>{formData.authorisingPerson || 'Test authorising person name'}</div>
                        
                        <div style={{ fontWeight: '600', color: '#1e293b', marginBottom: '4px' }}>Position:</div>
                        <div style={{ color: '#1e293b', fontSize: '16px', fontStyle: 'italic' }}>{formData.authorisingPosition || 'Test authorising person position'}</div>
                      </div>
                    </div>

                    <div className="figma-scope-section" style={{
                      backgroundColor: '#ffffff',
                      padding: '24px',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                      marginBottom: '40px'
                    }}>
                      <h3 style={{ margin: '0 0 16px 0', color: '#1e293b', fontSize: '18px', fontWeight: '600' }}>
                        Scope of Works
                      </h3>
                      <p style={{ margin: 0, color: '#1e293b', lineHeight: '1.6', fontSize: '16px' }}>
                        {formData.scopeOfWorks || 'Sample scope of works description'}
                      </p>
                    </div>

                    <div className="figma-review-section" style={{
                      backgroundColor: '#ffffff',
                      padding: '24px',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                    }}>
                      <h3 style={{ margin: '0 0 16px 0', color: '#1e293b', fontSize: '18px', fontWeight: '600' }}>
                        Review and Monitoring
                      </h3>
                      <p style={{ margin: 0, color: '#1e293b', lineHeight: '1.6', fontSize: '16px' }}>
                        This SWMS will be reviewed and updated whenever changes occur to scope, method, or risk levels. The site supervisor is responsible for initiating this review. All workers will be consulted on this SWMS during the pre-start meeting. Updates will be communicated verbally and via toolbox talks.
                      </p>
                    </div>
                  </div>
                )}

                {/* Work Activities Page - Exact Figma Match */}
                {activeTab === 'work-activities' && (
                  <div className="figma-work-activities">
                    <div style={{
                      marginBottom: '40px'
                    }}>
                      <h1 style={{ 
                        margin: 0, 
                        fontSize: '32px', 
                        fontWeight: '700', 
                        color: '#1e293b',
                        marginBottom: '24px'
                      }}>
                        Work Activities & Risk Assessment
                      </h1>
                    </div>

                    <div className="figma-activities-table" style={{
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      backgroundColor: '#ffffff'
                    }}>
                      {/* Table Header */}
                      <div className="figma-table-header" style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 2fr 1fr 2fr 1fr 2fr',
                        backgroundColor: '#f3f4f6',
                        color: '#374151',
                        fontWeight: '600',
                        fontSize: '14px',
                        borderBottom: '1px solid #e5e7eb'
                      }}>
                        <div style={{ padding: '16px 12px', borderRight: '1px solid #e5e7eb' }}>Activity</div>
                        <div style={{ padding: '16px 12px', borderRight: '1px solid #e5e7eb' }}>Hazards</div>
                        <div style={{ padding: '16px 12px', borderRight: '1px solid #e5e7eb' }}>Initial Risk</div>
                        <div style={{ padding: '16px 12px', borderRight: '1px solid #e5e7eb' }}>Control Measures</div>
                        <div style={{ padding: '16px 12px', borderRight: '1px solid #e5e7eb' }}>Residual Risk</div>
                        <div style={{ padding: '16px 12px' }}>Legislation</div>
                      </div>

                      {/* Sample Activity Rows - Exact Figma Data */}
                      <div className="figma-table-row" style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 2fr 1fr 2fr 1fr 2fr',
                        borderBottom: '1px solid #e5e7eb',
                        minHeight: '120px'
                      }}>
                        <div style={{ 
                          padding: '16px 12px', 
                          borderRight: '1px solid #e5e7eb',
                          fontSize: '14px',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'flex-start'
                        }}>
                          Activity description in detail sample 01
                        </div>
                        <div style={{ 
                          padding: '16px 12px', 
                          borderRight: '1px solid #e5e7eb',
                          fontSize: '12px',
                          display: 'flex',
                          alignItems: 'flex-start'
                        }}>
                          <div>
                            <div style={{ marginBottom: '4px' }}>• Hazard description 01</div>
                            <div style={{ marginBottom: '4px' }}>• Hazard description 02 this is an extended description</div>
                            <div style={{ marginBottom: '4px' }}>• Hazard description 03</div>
                            <div style={{ marginBottom: '4px' }}>• Hazard description 04</div>
                            <div style={{ marginBottom: '4px' }}>• Hazard description 05</div>
                            <div style={{ marginBottom: '4px' }}>• Hazard description 06 this is an extended description</div>
                            <div style={{ marginBottom: '4px' }}>• Hazard description 07</div>
                            <div>• Hazard description 08</div>
                          </div>
                        </div>
                        <div style={{ 
                          padding: '16px 12px', 
                          borderRight: '1px solid #e5e7eb',
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'center'
                        }}>
                          <div style={{
                            backgroundColor: '#dc2626',
                            color: '#ffffff',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}>
                            Extreme - 16
                          </div>
                        </div>
                        <div style={{ 
                          padding: '16px 12px', 
                          borderRight: '1px solid #e5e7eb',
                          fontSize: '12px',
                          display: 'flex',
                          alignItems: 'flex-start'
                        }}>
                          <div>
                            <div style={{ marginBottom: '4px' }}>• Hazard description 01</div>
                            <div style={{ marginBottom: '4px' }}>• Hazard description 02 this is an extended description</div>
                            <div style={{ marginBottom: '4px' }}>• Hazard description 03</div>
                            <div style={{ marginBottom: '4px' }}>• Hazard description 04</div>
                            <div style={{ marginBottom: '4px' }}>• Hazard description 05</div>
                            <div style={{ marginBottom: '4px' }}>• Hazard description 06 this is an extended description</div>
                            <div style={{ marginBottom: '4px' }}>• Hazard description 07</div>
                            <div>• Hazard description 08</div>
                          </div>
                        </div>
                        <div style={{ 
                          padding: '16px 12px', 
                          borderRight: '1px solid #e5e7eb',
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'center'
                        }}>
                          <div style={{
                            backgroundColor: '#2563eb',
                            color: '#ffffff',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}>
                            Medium - 10
                          </div>
                        </div>
                        <div style={{ 
                          padding: '16px 12px',
                          fontSize: '12px',
                          display: 'flex',
                          alignItems: 'flex-start'
                        }}>
                          <div>
                            <div style={{ marginBottom: '4px' }}>• Legislation description 01</div>
                            <div>• Legislation description 02 this is an extended description</div>
                          </div>
                        </div>
                      </div>

                      {/* Activity Row 2 */}
                      <div className="figma-table-row" style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 2fr 1fr 2fr 1fr 2fr',
                        borderBottom: '1px solid #e5e7eb',
                        minHeight: '120px'
                      }}>
                        <div style={{ 
                          padding: '16px 12px', 
                          borderRight: '1px solid #e5e7eb',
                          fontSize: '14px',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'flex-start'
                        }}>
                          Activity description in detail sample 02
                        </div>
                        <div style={{ 
                          padding: '16px 12px', 
                          borderRight: '1px solid #e5e7eb',
                          fontSize: '12px',
                          display: 'flex',
                          alignItems: 'flex-start'
                        }}>
                          <div>
                            <div style={{ marginBottom: '4px' }}>• Hazard description 01</div>
                            <div style={{ marginBottom: '4px' }}>• Hazard description 02 this is an extended description</div>
                            <div style={{ marginBottom: '4px' }}>• Hazard description 03</div>
                            <div style={{ marginBottom: '4px' }}>• Hazard description 04</div>
                            <div style={{ marginBottom: '4px' }}>• Hazard description 05</div>
                            <div style={{ marginBottom: '4px' }}>• Hazard description 06 this is an extended description</div>
                            <div style={{ marginBottom: '4px' }}>• Hazard description 07</div>
                            <div>• Hazard description 08</div>
                          </div>
                        </div>
                        <div style={{ 
                          padding: '16px 12px', 
                          borderRight: '1px solid #e5e7eb',
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'center'
                        }}>
                          <div style={{
                            backgroundColor: '#ea580c',
                            color: '#ffffff',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}>
                            High - 12
                          </div>
                        </div>
                        <div style={{ 
                          padding: '16px 12px', 
                          borderRight: '1px solid #e5e7eb',
                          fontSize: '12px',
                          display: 'flex',
                          alignItems: 'flex-start'
                        }}>
                          <div>
                            <div style={{ marginBottom: '4px' }}>• Hazard description 01</div>
                            <div style={{ marginBottom: '4px' }}>• Hazard description 02 this is an extended description</div>
                            <div style={{ marginBottom: '4px' }}>• Hazard description 03</div>
                            <div style={{ marginBottom: '4px' }}>• Hazard description 04</div>
                            <div style={{ marginBottom: '4px' }}>• Hazard description 05</div>
                            <div style={{ marginBottom: '4px' }}>• Hazard description 06 this is an extended description</div>
                            <div style={{ marginBottom: '4px' }}>• Hazard description 07</div>
                            <div>• Hazard description 08</div>
                          </div>
                        </div>
                        <div style={{ 
                          padding: '16px 12px', 
                          borderRight: '1px solid #e5e7eb',
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'center'
                        }}>
                          <div style={{
                            backgroundColor: '#22c55e',
                            color: '#ffffff',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}>
                            Low - 6
                          </div>
                        </div>
                        <div style={{ 
                          padding: '16px 12px',
                          fontSize: '12px',
                          display: 'flex',
                          alignItems: 'flex-start'
                        }}>
                          <div>
                            <div style={{ marginBottom: '4px' }}>• Legislation description 01</div>
                            <div>• Legislation description 02 this is an extended description</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Risk Matrix Page - Exact Figma Match */}
                {activeTab === 'risk-matrix' && (
                  <div className="figma-risk-matrix">
                    <div style={{
                      marginBottom: '40px'
                    }}>
                      <h1 style={{ 
                        margin: 0, 
                        fontSize: '32px', 
                        fontWeight: '700', 
                        color: '#1e293b',
                        marginBottom: '24px'
                      }}>
                        Construction Control Risk Matrix
                      </h1>
                    </div>

                    {/* Risk Matrix Table */}
                    <div style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      marginBottom: '40px'
                    }}>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr',
                        backgroundColor: '#f3f4f6',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#374151'
                      }}>
                        <div style={{ padding: '16px 12px', borderRight: '1px solid #e5e7eb' }}>Likelihood</div>
                        <div style={{ padding: '16px 12px', borderRight: '1px solid #e5e7eb' }}>Magnitude (Frequency in Industry)</div>
                        <div style={{ padding: '16px 12px', borderRight: '1px solid #e5e7eb' }}>Probability (Chance)</div>
                        <div style={{ padding: '16px 12px', borderRight: '1px solid #e5e7eb' }}>Severity</div>
                        <div style={{ padding: '16px 12px', borderRight: '1px solid #e5e7eb' }}>Qualitative Description</div>
                        <div style={{ padding: '16px 12px' }}>Quantitative Value</div>
                      </div>

                      {/* Risk Matrix Rows */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr',
                        borderBottom: '1px solid #e5e7eb',
                        fontSize: '12px'
                      }}>
                        <div style={{ padding: '16px 12px', borderRight: '1px solid #e5e7eb' }}>Likely</div>
                        <div style={{ padding: '16px 12px', borderRight: '1px solid #e5e7eb' }}>Monthly in the industry</div>
                        <div style={{ padding: '16px 12px', borderRight: '1px solid #e5e7eb', fontStyle: 'italic' }}>Good chance</div>
                        <div style={{ padding: '16px 12px', borderRight: '1px solid #e5e7eb' }}>Extreme</div>
                        <div style={{ padding: '16px 12px', borderRight: '1px solid #e5e7eb' }}>Fatality, significant disability, catastrophic property damage</div>
                        <div style={{ padding: '16px 12px' }}>$50,000+</div>
                      </div>

                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr',
                        borderBottom: '1px solid #e5e7eb',
                        fontSize: '12px'
                      }}>
                        <div style={{ padding: '16px 12px', borderRight: '1px solid #e5e7eb' }}>Possible</div>
                        <div style={{ padding: '16px 12px', borderRight: '1px solid #e5e7eb' }}>Yearly in the industry</div>
                        <div style={{ padding: '16px 12px', borderRight: '1px solid #e5e7eb', fontStyle: 'italic' }}>Even chance</div>
                        <div style={{ padding: '16px 12px', borderRight: '1px solid #e5e7eb' }}>High</div>
                        <div style={{ padding: '16px 12px', borderRight: '1px solid #e5e7eb' }}>Minor amputation, minor permanent disability, moderate property damage</div>
                        <div style={{ padding: '16px 12px' }}>$15,000 – $50,000</div>
                      </div>

                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr',
                        borderBottom: '1px solid #e5e7eb',
                        fontSize: '12px'
                      }}>
                        <div style={{ padding: '16px 12px', borderRight: '1px solid #e5e7eb' }}>Unlikely</div>
                        <div style={{ padding: '16px 12px', borderRight: '1px solid #e5e7eb' }}>Every 10 years in the industry</div>
                        <div style={{ padding: '16px 12px', borderRight: '1px solid #e5e7eb', fontStyle: 'italic' }}>Low chance</div>
                        <div style={{ padding: '16px 12px', borderRight: '1px solid #e5e7eb' }}>Medium</div>
                        <div style={{ padding: '16px 12px', borderRight: '1px solid #e5e7eb' }}>Minor injury resulting in a Loss Time Injury or Medically Treated Injury</div>
                        <div style={{ padding: '16px 12px' }}>$1,000 – $15,000</div>
                      </div>

                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr',
                        fontSize: '12px'
                      }}>
                        <div style={{ padding: '16px 12px', borderRight: '1px solid #e5e7eb' }}>Very Rare</div>
                        <div style={{ padding: '16px 12px', borderRight: '1px solid #e5e7eb' }}>Once in a lifetime in the industry</div>
                        <div style={{ padding: '16px 12px', borderRight: '1px solid #e5e7eb', fontStyle: 'italic' }}>Practically no chance</div>
                        <div style={{ padding: '16px 12px', borderRight: '1px solid #e5e7eb' }}>Low</div>
                        <div style={{ padding: '16px 12px', borderRight: '1px solid #e5e7eb' }}>First Aid Treatment with no lost time</div>
                        <div style={{ padding: '16px 12px' }}>$0 – $1,000</div>
                      </div>
                    </div>

                    {/* Risk Scoring Matrix */}
                    <div style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr',
                        backgroundColor: '#f3f4f6',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#374151'
                      }}>
                        <div style={{ padding: '16px 12px', borderRight: '1px solid #e5e7eb' }}>Score Range</div>
                        <div style={{ padding: '16px 12px', borderRight: '1px solid #e5e7eb' }}>Risk Ranking</div>
                        <div style={{ padding: '16px 12px', borderRight: '1px solid #e5e7eb' }}>Action Required</div>
                        <div style={{ padding: '16px 12px', borderRight: '1px solid #e5e7eb' }}>Extreme</div>
                        <div style={{ padding: '16px 12px', borderRight: '1px solid #e5e7eb' }}>High</div>
                        <div style={{ padding: '16px 12px', borderRight: '1px solid #e5e7eb' }}>Medium</div>
                        <div style={{ padding: '16px 12px' }}>Low</div>
                      </div>

                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr 1fr',
                        borderBottom: '1px solid #e5e7eb',
                        fontSize: '12px'
                      }}>
                        <div style={{ padding: '16px 12px', borderRight: '1px solid #e5e7eb' }}>14 – 16</div>
                        <div style={{ padding: '16px 12px', borderRight: '1px solid #e5e7eb' }}>Severe (S)</div>
                        <div style={{ padding: '16px 12px', borderRight: '1px solid #e5e7eb', fontStyle: 'italic' }}>Action Immediately</div>
                        <div style={{ padding: '16px 12px', borderRight: '1px solid #e5e7eb' }}>Likely</div>
                        <div style={{ padding: '16px 12px', borderRight: '1px solid #e5e7eb', textAlign: 'center' }}>16</div>
                        <div style={{ padding: '16px 12px', borderRight: '1px solid #e5e7eb', textAlign: 'center' }}>15</div>
                        <div style={{ padding: '16px 12px', borderRight: '1px solid #e5e7eb', textAlign: 'center' }}>13</div>
                        <div style={{ padding: '16px 12px', textAlign: 'center' }}>10</div>
                      </div>

                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr 1fr',
                        borderBottom: '1px solid #e5e7eb',
                        fontSize: '12px'
                      }}>
                        <div style={{ padding: '16px 12px', borderRight: '1px solid #e5e7eb' }}>11 – 13</div>
                        <div style={{ padding: '16px 12px', borderRight: '1px solid #e5e7eb' }}>High (H)</div>
                        <div style={{ padding: '16px 12px', borderRight: '1px solid #e5e7eb', fontStyle: 'italic' }}>Action within 24 hrs</div>
                        <div style={{ padding: '16px 12px', borderRight: '1px solid #e5e7eb' }}>Possibly</div>
                        <div style={{ padding: '16px 12px', borderRight: '1px solid #e5e7eb', textAlign: 'center' }}>14</div>
                        <div style={{ padding: '16px 12px', borderRight: '1px solid #e5e7eb', textAlign: 'center' }}>12</div>
                        <div style={{ padding: '16px 12px', borderRight: '1px solid #e5e7eb', textAlign: 'center' }}>9</div>
                        <div style={{ padding: '16px 12px', textAlign: 'center' }}>6</div>
                      </div>

                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr 1fr',
                        borderBottom: '1px solid #e5e7eb',
                        fontSize: '12px'
                      }}>
                        <div style={{ padding: '16px 12px', borderRight: '1px solid #e5e7eb' }}>7 – 10</div>
                        <div style={{ padding: '16px 12px', borderRight: '1px solid #e5e7eb' }}>Medium (M)</div>
                        <div style={{ padding: '16px 12px', borderRight: '1px solid #e5e7eb', fontStyle: 'italic' }}>Action within 48 hrs</div>
                        <div style={{ padding: '16px 12px', borderRight: '1px solid #e5e7eb' }}>Unlikely</div>
                        <div style={{ padding: '16px 12px', borderRight: '1px solid #e5e7eb', textAlign: 'center' }}>11</div>
                        <div style={{ padding: '16px 12px', borderRight: '1px solid #e5e7eb', textAlign: 'center' }}>8</div>
                        <div style={{ padding: '16px 12px', borderRight: '1px solid #e5e7eb', textAlign: 'center' }}>5</div>
                        <div style={{ padding: '16px 12px', textAlign: 'center' }}>3</div>
                      </div>

                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr 1fr',
                        fontSize: '12px'
                      }}>
                        <div style={{ padding: '16px 12px', borderRight: '1px solid #e5e7eb' }}>1 – 6</div>
                        <div style={{ padding: '16px 12px', borderRight: '1px solid #e5e7eb' }}>Low (L)</div>
                        <div style={{ padding: '16px 12px', borderRight: '1px solid #e5e7eb', fontStyle: 'italic' }}>Action within 5 working days</div>
                        <div style={{ padding: '16px 12px', borderRight: '1px solid #e5e7eb' }}>Very Rare</div>
                        <div style={{ padding: '16px 12px', borderRight: '1px solid #e5e7eb', textAlign: 'center' }}>7</div>
                        <div style={{ padding: '16px 12px', borderRight: '1px solid #e5e7eb', textAlign: 'center' }}>4</div>
                        <div style={{ padding: '16px 12px', borderRight: '1px solid #e5e7eb', textAlign: 'center' }}>2</div>
                        <div style={{ padding: '16px 12px', textAlign: 'center' }}>1</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* High Risk Activities - Figma Grid Style */}
                {activeTab === 'high-risk' && (
                  <div className="figma-high-risk">
                    <div style={{
                      textAlign: 'center',
                      marginBottom: '32px',
                      paddingBottom: '20px',
                      borderBottom: '2px solid #e2e8f0'
                    }}>
                      <h1 style={{ 
                        margin: 0, 
                        fontSize: '24px', 
                        fontWeight: '700', 
                        color: '#1e293b'
                      }}>
                        High Risk Activities
                      </h1>
                    </div>

                    <div className="figma-risk-grid" style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '16px'
                    }}>
                      {[
                        'Work on a telecommunication tower',
                        'Risk of a person failing more than 2 metres (e.g. work on ladders, scaffolding, roofs, etc.)',
                        'Work involving demolition of an element that is load-bearing or otherwise related to the physical integrity of the structure',
                        'Work involving the disturbance of asbestos',
                        'Work involving structural alterations or repairs that require temporary support to prevent collapse',
                        'Work carried out in or near a confined space',
                        'Work carried our in or near a shaft or trench deeper than 1.5 metres or a tunnel',
                        'Work involving the use of explosives',
                        'Work on or near pressurised gas distribution mains or piping',
                        'Work on or near chemical, fuel or refrigerant lines',
                        'Work on or near energised electrical installations or services (includes live electrical work)',
                        'Work in an area that may have a contaminated or flammable atmosphere',
                        'Work involving tilt-up or precast concrete elements',
                        'Work carried on, in or adjacent to a road, railway, or other traffic corridor that is in use',
                        'Work in an area at a workplace in which there is any movement of powered mobile plant (e.g. forklifts, excavators, cranes)',
                        'Work in areas where there are artificial extremes of temperature (e.g. cold rooms, furnace areas)',
                        'Work carries out in or near water or other liquid that involves a risk of drowning',
                        'Work carried out on or near live electrical conductors'
                      ].map((risk, index) => (
                        <div key={index} className="figma-risk-card" style={{
                          backgroundColor: formData.highRiskActivities.some(activity => 
                            activity.selected && activity.title.toLowerCase().includes(risk.split(' ')[2]?.toLowerCase() || '')
                          ) ? '#fef3c7' : '#f8fafc',
                          border: formData.highRiskActivities.some(activity => 
                            activity.selected && activity.title.toLowerCase().includes(risk.split(' ')[2]?.toLowerCase() || '')
                          ) ? '2px solid #f59e0b' : '1px solid #e2e8f0',
                          borderRadius: '8px',
                          padding: '12px',
                          fontSize: '10px',
                          lineHeight: '1.4',
                          minHeight: '80px',
                          display: 'flex',
                          alignItems: 'center'
                        }}>
                          {risk}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* PPE Section - Exact Figma Match */}
                {activeTab === 'ppe' && (
                  <div className="figma-ppe">
                    <div style={{
                      marginBottom: '40px'
                    }}>
                      <h1 style={{ 
                        margin: 0, 
                        fontSize: '32px', 
                        fontWeight: '700', 
                        color: '#1e293b',
                        marginBottom: '24px'
                      }}>
                        Personal Protective Equipment
                      </h1>
                    </div>

                    <div className="figma-ppe-grid" style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      gap: '12px',
                      marginBottom: '40px'
                    }}>
                      {[
                        'Hard Hat – Head protection from falling objects',
                        'Hi-Vis Vest/Shirt – Visibility on site',
                        'Steel Cap Boots – Foot protection from impact or puncture',
                        'Safety Glasses – Eye protection',
                        'Gloves – General hand protection',
                        'Hearing Protection – Earplugs or earmuffs',
                        'Long Pants – Protection from abrasions and minor cuts',
                        'Long Sleeve Shirt – General body protection',
                        'Dust Mask – Basic airborne dust protection',
                        'Sun Protection (Hat, Sunscreen) – UV exposure control',
                        'Fall Arrest Harness – Working at heights',
                        'Confined Space Breathing Apparatus – Confined spaces or poor air quality',
                        'Welding Helmet & Gloves – Welding tasks',
                        'Cut-Resistant Gloves – Blade or glass handling',
                        'Face Shield – High-impact or chemical splash risk',
                        'Respirator (Half/Full Face) – Hazardous fumes, chemicals, or dust',
                        'Chemical-Resistant Apron – Handling corrosive substances',
                        'Anti-Static Clothing – Electrical or explosive environments',
                        'Insulated Gloves – Live electrical work',
                        'Fire-Retardant Clothing – Hot works / fire risk areas',
                        'Knee Pads – Prolonged kneeling (e.g. flooring work)',
                        'Non-slip Footwear – Wet/slippery environments',
                        'Safety Harness & Lanyard – Elevated work or boom lift',
                        'Ear Canal Protectors – High-decibel machinery use'
                      ].map((ppe, index) => (
                        <div key={index} className="figma-ppe-card" style={{
                          backgroundColor: '#ffffff',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          padding: '16px',
                          fontSize: '12px',
                          lineHeight: '1.4',
                          minHeight: '80px',
                          display: 'flex',
                          alignItems: 'center',
                          textAlign: 'center',
                          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                          color: '#1e293b'
                        }}>
                          {ppe}
                        </div>
                      ))}
                    </div>

                    <div className="figma-ppe-requirements" style={{
                      backgroundColor: '#ffffff',
                      padding: '24px',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                      marginBottom: '40px'
                    }}>
                      <h3 style={{ margin: '0 0 16px 0', color: '#1e293b', fontSize: '18px', fontWeight: '600' }}>
                        PPE Requirements
                      </h3>
                      <ul style={{ margin: 0, padding: '0 0 0 20px', color: '#1e293b', lineHeight: '1.6' }}>
                        <li style={{ marginBottom: '8px' }}>All PPE must be Australian Standard (AS/NZS) certified</li>
                        <li style={{ marginBottom: '8px' }}>Workers must be trained in correct use, inspection, and maintenance of all equipment</li>
                        <li style={{ marginBottom: '8px' }}>PPE must be inspected before each use and replaced when damaged</li>
                        <li style={{ marginBottom: '8px' }}>Employer must provide appropriate PPE at no cost to the worker</li>
                        <li style={{ marginBottom: '8px' }}>PPE must be replaced at manufacturer's recommended intervals</li>
                        <li>Workers must report any damaged or defective PPE immediately</li>
                      </ul>
                    </div>

                    <div className="figma-ppe-standards" style={{
                      backgroundColor: '#ffffff',
                      padding: '24px',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                    }}>
                      <h3 style={{ margin: '0 0 16px 0', color: '#1e293b', fontSize: '18px', fontWeight: '600' }}>
                        Australian Standards Reference
                      </h3>
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: '1fr 1fr',
                        gap: '16px',
                        fontSize: '14px',
                        color: '#1e293b'
                      }}>
                        <div>
                          <div style={{ fontWeight: '600', marginBottom: '4px' }}>AS/NZS 1801:1997</div>
                          <div style={{ marginBottom: '12px' }}>Occupational protective helmets</div>
                          
                          <div style={{ fontWeight: '600', marginBottom: '4px' }}>AS/NZS 1337:2010</div>
                          <div style={{ marginBottom: '12px' }}>Personal eye-protection</div>
                          
                          <div style={{ fontWeight: '600', marginBottom: '4px' }}>AS/NZS 4602:2011</div>
                          <div style={{ marginBottom: '12px' }}>High visibility safety garments</div>
                        </div>
                        <div>
                          <div style={{ fontWeight: '600', marginBottom: '4px' }}>AS/NZS 2210:2009</div>
                          <div style={{ marginBottom: '12px' }}>Occupational protective footwear</div>
                          
                          <div style={{ fontWeight: '600', marginBottom: '4px' }}>AS/NZS 2161:2004</div>
                          <div style={{ marginBottom: '12px' }}>Occupational protective gloves</div>
                          
                          <div style={{ fontWeight: '600', marginBottom: '4px' }}>AS/NZS 1716:2012</div>
                          <div>Respiratory protective devices</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SwmsComplete;