import React, { useState } from 'react';

interface SwmsCompleteProps {
  // Add any props you need
}

interface FormData {
  projectName: string;
  companyName: string;
  projectNumber: string;
  projectAddress: string;
  startDate: string;
  duration: string;
  principalContractor: string;
  projectManager: string;
  siteSupervisor: string;
  authorisingPerson: string;
  authorisingPosition: string;
  scopeOfWorks: string;
  workActivities: Array<{
    id: string;
    activity: string;
    hazards: string[];
    controlMeasures: string[];
    initialRisk: string;
    residualRisk: string;
    initialRiskScore: number;
    residualRiskScore: number;
    legislation: string;
  }>;
  highRiskActivities: Array<{
    id: string;
    title: string;
    description: string;
    selected: boolean;
    riskLevel: string;
  }>;
  ppeItems: Array<{
    id: string;
    item: string;
    required: boolean;
    description: string;
  }>;
}

const SwmsComplete: React.FC<SwmsCompleteProps> = () => {
  const [activeTab, setActiveTab] = useState('project-info');
  const [formData, setFormData] = useState<FormData>({
    projectName: 'Test Project Name',
    companyName: 'Test Company Name',
    projectNumber: '123 456',
    projectAddress: '123 Sample Job Address',
    startDate: '2025-07-12',
    duration: '8 Weeks',
    principalContractor: 'Test Principal Contractor',
    projectManager: 'Test Project Manager Name',
    siteSupervisor: 'Test Project Supervisor',
    authorisingPerson: 'Test authorising person name',
    authorisingPosition: 'Test authorising person position',
    scopeOfWorks: 'Sample scope of works description',
    workActivities: [],
    highRiskActivities: [],
    ppeItems: []
  });

  const tabs = [
    { id: 'project-info', label: 'Project Information', icon: '📋' },
    { id: 'work-activities', label: 'Work Activities & Risk Assessment', icon: '⚠️' },
    { id: 'risk-matrix', label: 'Risk Matrix', icon: '📊' },
    { id: 'high-risk', label: 'High Risk Activities', icon: '🔴' },
    { id: 'ppe', label: 'PPE', icon: '🦺' },
    { id: 'plant-equipment', label: 'Plant & Equipment', icon: '🏗️' },
    { id: 'sign-in', label: 'Sign In Register', icon: '✍️' },
    { id: 'msds', label: 'MSDS', icon: '📄' }
  ];

  const handleDirectChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Risk Badge Component
  const RiskBadgeNew: React.FC<{ level: string; score: number }> = ({ level, score }) => {
    const colors = {
      low: '#22c55e',
      medium: '#2563eb',
      high: '#ea580c',
      extreme: '#dc2626'
    };
    
    return (
      <div style={{
        backgroundColor: colors[level as keyof typeof colors] || '#6b7280',
        color: '#ffffff',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: '600',
        textTransform: 'capitalize'
      }}>
        {level} - {score}
      </div>
    );
  };

  return (
    <div className="swms-complete-container" style={{
      height: '100vh',
      backgroundColor: '#f8fafc',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      display: 'flex'
    }}>
      {/* Left Sidebar - Form Controls (1/3) */}
      <div className="swms-sidebar" style={{
        width: '33.333%',
        backgroundColor: '#ffffff',
        borderRight: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div className="swms-header" style={{
          padding: '24px',
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: '#ffffff'
        }}>
          <h1 style={{ 
            margin: 0, 
            fontSize: '24px', 
            fontWeight: '700', 
            color: '#1e293b',
            marginBottom: '8px'
          }}>
            SWMS Generator
          </h1>
          <p style={{ 
            margin: 0, 
            fontSize: '14px', 
            color: '#6b7280'
          }}>
            Complete document builder with live preview
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="swms-nav-tabs" style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          padding: '16px',
          backgroundColor: '#f8fafc',
          borderBottom: '1px solid #e5e7eb'
        }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                backgroundColor: activeTab === tab.id ? '#3b82f6' : '#ffffff',
                color: activeTab === tab.id ? '#ffffff' : '#374151',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'left'
              }}
            >
              <span style={{ fontSize: '16px' }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* PDF Generation Controls */}
        <div className="swms-pdf-controls" style={{
          padding: '16px',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button style={{
              padding: '12px 16px',
              backgroundColor: '#10b981',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}>
              Print
            </button>
            <button style={{
              padding: '12px 16px',
              backgroundColor: '#3b82f6',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}>
              Download
            </button>
            <button style={{
              padding: '12px 16px',
              backgroundColor: '#8b5cf6',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}>
              Vector
            </button>
            <button style={{
              padding: '12px 16px',
              backgroundColor: '#f59e0b',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}>
              Final
            </button>
          </div>
        </div>

        {/* Form Content Area */}
        <div className="swms-form-content" style={{
          flex: 1,
          padding: '16px',
          overflow: 'auto'
        }}>
          <div className="project-info-form">
            <h2 style={{ marginBottom: '20px', color: '#1e293b', fontSize: '16px', fontWeight: '600' }}>Project Information</h2>
            
            {/* Company Logo */}
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '500', color: '#374151' }}>
                Company Logo
              </label>
              <div style={{
                width: '100%',
                height: '80px',
                border: '2px dashed #d1d5db',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                color: '#9ca3af',
                cursor: 'pointer'
              }}>
                Choose File - no file selected
              </div>
            </div>

            {/* Company Name */}
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '500', color: '#374151' }}>
                Company Name
              </label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => handleDirectChange('companyName', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}
              />
            </div>

            {/* Project Name */}
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '500', color: '#374151' }}>
                Project Name
              </label>
              <input
                type="text"
                value={formData.projectName}
                onChange={(e) => handleDirectChange('projectName', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}
              />
            </div>

            {/* Project Number */}
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '500', color: '#374151' }}>
                Project Number
              </label>
              <input
                type="text"
                value={formData.projectNumber}
                onChange={(e) => handleDirectChange('projectNumber', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}
              />
            </div>

            {/* Project Address */}
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '500', color: '#374151' }}>
                Project Address
              </label>
              <input
                type="text"
                value={formData.projectAddress}
                onChange={(e) => handleDirectChange('projectAddress', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}
              />
            </div>

            {/* Job Name */}
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '500', color: '#374151' }}>
                Job Name
              </label>
              <input
                type="text"
                value={formData.projectName}
                onChange={(e) => handleDirectChange('projectName', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}
              />
            </div>

            {/* Job Number */}
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '500', color: '#374151' }}>
                Job Number
              </label>
              <input
                type="text"
                value={formData.projectNumber}
                onChange={(e) => handleDirectChange('projectNumber', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}
              />
            </div>

            {/* Start Date */}
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '500', color: '#374151' }}>
                Start Date
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => handleDirectChange('startDate', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}
              />
            </div>

            {/* Duration */}
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '500', color: '#374151' }}>
                Duration
              </label>
              <input
                type="text"
                value={formData.duration}
                onChange={(e) => handleDirectChange('duration', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}
              />
            </div>

            {/* Date Created */}
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '500', color: '#374151' }}>
                Date Created
              </label>
              <input
                type="date"
                value="2025-06-23"
                readOnly
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '12px',
                  backgroundColor: '#f9fafb'
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - A4 Landscape Preview (2/3) */}
      <div className="swms-preview-panel" style={{
        width: '66.666%',
        backgroundColor: '#e5e7eb',
        padding: '20px',
        overflow: 'auto',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start'
      }}>
        {/* A4 Landscape Document Preview */}
        <div className="swms-document-preview" style={{
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          width: '1123px', // A4 landscape width in pixels (297mm)
          height: '794px', // A4 landscape height in pixels (210mm)
          padding: '40px',
          transform: 'scale(0.8)', // Scale down to fit in preview area
          transformOrigin: 'top center',
          marginTop: '20px'
        }}>
          {/* Document Content */}
          <div className="swms-document-content" style={{
            width: '100%',
            height: '100%',
            color: '#1e293b',
            fontSize: '12px',
            lineHeight: '1.5',
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
            overflow: 'hidden'
          }}>
            {/* Header matching screenshot exactly */}
            <div className="figma-header" style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              marginBottom: '30px',
              paddingBottom: '15px',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{
                  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#0f766e',
                  marginRight: '20px'
                }}>
                  Riskify
                </div>
                <div style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1e293b'
                }}>
                  Safe Work Method Statement
                </div>
              </div>
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'flex-end',
                fontSize: '12px',
                color: '#374151',
                lineHeight: '1.4'
              }}>
                <div style={{ fontWeight: '600', marginBottom: '2px' }}>{formData.companyName}</div>
                <div>Job Number: {formData.projectNumber}</div>
                <div>123 Sample Job Address</div>
              </div>
            </div>

            {/* Project Information Section */}
            <div className="project-info-section">
              <h2 style={{ 
                fontSize: '16px', 
                fontWeight: '600', 
                color: '#1e293b',
                marginBottom: '20px',
                borderBottom: '1px solid #e5e7eb',
                paddingBottom: '8px'
              }}>
                Project Information
              </h2>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '30px',
                marginBottom: '30px'
              }}>
                {/* Left Column */}
                <div>
                  <div style={{ marginBottom: '15px' }}>
                    <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '12px', marginBottom: '4px' }}>Company Name:</div>
                    <div style={{ color: '#1e293b', fontSize: '12px' }}>{formData.companyName}</div>
                  </div>
                  
                  <div style={{ marginBottom: '15px' }}>
                    <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '12px', marginBottom: '4px' }}>Job Name:</div>
                    <div style={{ color: '#1e293b', fontSize: '12px' }}>{formData.projectName}</div>
                  </div>
                  
                  <div style={{ marginBottom: '15px' }}>
                    <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '12px', marginBottom: '4px' }}>Job Number:</div>
                    <div style={{ color: '#1e293b', fontSize: '12px' }}>{formData.projectNumber}</div>
                  </div>
                  
                  <div style={{ marginBottom: '15px' }}>
                    <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '12px', marginBottom: '4px' }}>Project Address:</div>
                    <div style={{ color: '#1e293b', fontSize: '12px' }}>{formData.projectAddress}</div>
                  </div>
                  
                  <div style={{ marginBottom: '15px' }}>
                    <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '12px', marginBottom: '4px' }}>Start Date:</div>
                    <div style={{ color: '#1e293b', fontSize: '12px' }}>12th July 2025</div>
                  </div>
                  
                  <div style={{ marginBottom: '15px' }}>
                    <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '12px', marginBottom: '4px' }}>Duration:</div>
                    <div style={{ color: '#1e293b', fontSize: '12px' }}>{formData.duration}</div>
                  </div>
                  
                  <div style={{ marginBottom: '15px' }}>
                    <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '12px', marginBottom: '4px' }}>Date Created:</div>
                    <div style={{ color: '#1e293b', fontSize: '12px' }}>23rd June 2025</div>
                  </div>
                  
                  <div style={{ marginBottom: '15px' }}>
                    <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '12px', marginBottom: '4px' }}>Principal Contractor:</div>
                    <div style={{ color: '#1e293b', fontSize: '12px' }}>{formData.principalContractor}</div>
                  </div>
                </div>

                {/* Right Column */}
                <div>
                  <div style={{ marginBottom: '15px' }}>
                    <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '12px', marginBottom: '4px' }}>Project Manager:</div>
                    <div style={{ color: '#1e293b', fontSize: '12px' }}>{formData.projectManager}</div>
                  </div>
                  
                  <div style={{ marginBottom: '15px' }}>
                    <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '12px', marginBottom: '4px' }}>Site Supervisor:</div>
                    <div style={{ color: '#1e293b', fontSize: '12px' }}>{formData.siteSupervisor}</div>
                  </div>
                  
                  <div style={{ marginBottom: '15px' }}>
                    <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '12px', marginBottom: '4px', textDecoration: 'underline' }}>
                      Person Authorising SWMS
                    </div>
                    <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '12px', marginBottom: '4px' }}>Name:</div>
                    <div style={{ color: '#1e293b', fontSize: '12px', marginBottom: '8px' }}>{formData.authorisingPerson}</div>
                    
                    <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '12px', marginBottom: '4px' }}>Position:</div>
                    <div style={{ color: '#1e293b', fontSize: '12px', marginBottom: '15px' }}>{formData.authorisingPosition}</div>
                  </div>
                  
                  <div style={{ marginBottom: '15px' }}>
                    <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '12px', marginBottom: '4px' }}>Signature:</div>
                    <div style={{ 
                      width: '150px',
                      height: '40px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px',
                      color: '#9ca3af',
                      backgroundColor: '#f9fafb'
                    }}>
                      ✍️
                    </div>
                  </div>
                </div>
              </div>

              {/* Scope of Works */}
              <div style={{
                borderTop: '1px solid #e5e7eb',
                paddingTop: '20px'
              }}>
                <h3 style={{ 
                  fontWeight: '600', 
                  color: '#1e293b', 
                  fontSize: '14px', 
                  marginBottom: '10px' 
                }}>
                  Scope of Works
                </h3>
                <p style={{ 
                  margin: 0, 
                  color: '#1e293b', 
                  lineHeight: '1.5', 
                  fontSize: '12px' 
                }}>
                  {formData.scopeOfWorks}
                </p>
              </div>

              {/* Review and Monitoring */}
              <div style={{
                borderTop: '1px solid #e5e7eb',
                paddingTop: '20px',
                marginTop: '20px'
              }}>
                <h3 style={{ 
                  fontWeight: '600', 
                  color: '#1e293b', 
                  fontSize: '14px', 
                  marginBottom: '10px' 
                }}>
                  Review and Monitoring
                </h3>
                <p style={{ 
                  margin: 0, 
                  color: '#1e293b', 
                  lineHeight: '1.5', 
                  fontSize: '12px' 
                }}>
                  This SWMS will be reviewed and updated whenever changes occur to scope, method, or risk levels. The site supervisor is responsible for initiating this review. All workers will be consulted on this SWMS during the pre-start meeting. Updates will be communicated verbally and via toolbox talks.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SwmsComplete;