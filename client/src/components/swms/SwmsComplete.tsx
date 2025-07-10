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

        {/* Preview Section */}
        {showPreview && (
          <div className="preview-section" style={{
            width: '50%',
            backgroundColor: '#f1f5f9',
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
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                maxWidth: '210mm',
                margin: '0 auto',
                fontSize: '12px',
                lineHeight: '1.4'
              }}>
                {/* Document Header */}
                <div className="document-header" style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '30px',
                  paddingBottom: '20px',
                  borderBottom: '2px solid #3b82f6'
                }}>
                  <div>
                    <RiskifyLogo />
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>
                      Safe Work Method Statement
                    </h1>
                    <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#6b7280' }}>
                      Document ID: {formData.projectNumber}
                    </p>
                  </div>
                </div>

                {/* Project Information Preview */}
                {activeTab === 'project-info' && (
                  <div className="project-info-preview">
                    <h2 style={{ marginBottom: '20px', color: '#1e293b', fontSize: '18px' }}>Project Information</h2>
                    
                    <div className="info-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      <div>
                        <div className="info-item" style={{ marginBottom: '12px' }}>
                          <strong style={{ color: '#374151' }}>Company Name:</strong>
                          <br />
                          {formData.companyName}
                        </div>
                        <div className="info-item" style={{ marginBottom: '12px' }}>
                          <strong style={{ color: '#374151' }}>Project Name:</strong>
                          <br />
                          {formData.projectName}
                        </div>
                        <div className="info-item" style={{ marginBottom: '12px' }}>
                          <strong style={{ color: '#374151' }}>Project Number:</strong>
                          <br />
                          {formData.projectNumber}
                        </div>
                        <div className="info-item" style={{ marginBottom: '12px' }}>
                          <strong style={{ color: '#374151' }}>Start Date:</strong>
                          <br />
                          {formData.startDate}
                        </div>
                      </div>
                      <div>
                        <div className="info-item" style={{ marginBottom: '12px' }}>
                          <strong style={{ color: '#374151' }}>Principal Contractor:</strong>
                          <br />
                          {formData.principalContractor}
                        </div>
                        <div className="info-item" style={{ marginBottom: '12px' }}>
                          <strong style={{ color: '#374151' }}>Project Manager:</strong>
                          <br />
                          {formData.projectManager}
                        </div>
                        <div className="info-item" style={{ marginBottom: '12px' }}>
                          <strong style={{ color: '#374151' }}>Site Supervisor:</strong>
                          <br />
                          {formData.siteSupervisor}
                        </div>
                        <div className="info-item" style={{ marginBottom: '12px' }}>
                          <strong style={{ color: '#374151' }}>Duration:</strong>
                          <br />
                          {formData.duration}
                        </div>
                      </div>
                    </div>

                    <div className="info-item" style={{ marginTop: '20px' }}>
                      <strong style={{ color: '#374151' }}>Project Address:</strong>
                      <br />
                      {formData.projectAddress}
                    </div>

                    <div className="info-item" style={{ marginTop: '20px' }}>
                      <strong style={{ color: '#374151' }}>Scope of Works:</strong>
                      <br />
                      {formData.scopeOfWorks}
                    </div>
                  </div>
                )}

                {/* Work Activities Preview */}
                {activeTab === 'work-activities' && (
                  <div className="work-activities-preview">
                    <h2 style={{ marginBottom: '20px', color: '#1e293b', fontSize: '18px' }}>Work Activities</h2>
                    
                    <div className="activities-table" style={{ 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      overflow: 'hidden'
                    }}>
                      <div className="table-header" style={{
                        backgroundColor: '#f8fafc',
                        padding: '12px',
                        display: 'grid',
                        gridTemplateColumns: '2fr 1fr 1fr 1fr',
                        gap: '12px',
                        borderBottom: '1px solid #e2e8f0',
                        fontWeight: '600',
                        fontSize: '11px'
                      }}>
                        <div>Activity</div>
                        <div>Hazards</div>
                        <div>Initial Risk</div>
                        <div>Residual Risk</div>
                      </div>
                      
                      {formData.workActivities.map((activity, index) => (
                        <div key={activity.id} className="table-row" style={{
                          padding: '12px',
                          display: 'grid',
                          gridTemplateColumns: '2fr 1fr 1fr 1fr',
                          gap: '12px',
                          borderBottom: index < formData.workActivities.length - 1 ? '1px solid #e2e8f0' : 'none',
                          alignItems: 'start'
                        }}>
                          <div style={{ fontSize: '11px' }}>
                            <strong>{activity.activity}</strong>
                          </div>
                          <div style={{ fontSize: '10px' }}>
                            {activity.hazards.join(', ')}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <RiskBadgeNew level={activity.initialRisk} score={activity.initialRiskScore} />
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <RiskBadgeNew level={activity.residualRisk} score={activity.residualRiskScore} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* High Risk Activities Preview */}
                {activeTab === 'high-risk' && (
                  <div className="high-risk-preview">
                    <h2 style={{ marginBottom: '20px', color: '#1e293b', fontSize: '18px' }}>High Risk Construction Work</h2>
                    
                    <div className="selected-activities">
                      {formData.highRiskActivities.filter(activity => activity.selected).map((activity, index) => (
                        <div key={activity.id} className="selected-activity" style={{
                          backgroundColor: '#fef3c7',
                          border: '1px solid #f59e0b',
                          borderRadius: '6px',
                          padding: '12px',
                          marginBottom: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}>
                          <div>
                            <strong style={{ fontSize: '12px' }}>{activity.title}</strong>
                            <p style={{ margin: '4px 0 0 0', fontSize: '10px', color: '#6b7280' }}>
                              {activity.description}
                            </p>
                          </div>
                          <RiskBadgeNew level={activity.riskLevel} score={activity.riskLevel === 'high' ? 12 : activity.riskLevel === 'medium' ? 8 : 16} />
                        </div>
                      ))}
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