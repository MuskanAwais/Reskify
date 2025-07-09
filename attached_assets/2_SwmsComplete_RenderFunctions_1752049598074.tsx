// Continuation of SwmsComplete component - Render Functions

  // Project Info Page Render
  const renderProjectInfoPage = () => {
    return (
      <div 
        className="bg-white shadow-lg rounded-lg overflow-hidden"
        style={{ 
          width: '297mm', 
          minHeight: '210mm',
          margin: '0 auto',
          position: 'relative'
        }}
      >
        {/* Watermark */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{ 
            zIndex: 1,
            opacity: 0.05
          }}
        >
          <div className="grid grid-cols-3 grid-rows-2 h-full w-full gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="flex items-center justify-center">
                <div 
                  className="text-gray-200 font-bold select-none opacity-30"
                  style={{ 
                    fontSize: '20px',
                    transform: 'rotate(-45deg)',
                    whiteSpace: 'nowrap',
                    lineHeight: '24px',
                    textAlign: 'center'
                  }}
                >
                  <div>{formData.companyName}</div>
                  <div>RISKIFY</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 p-8 page-content">
          {/* Header */}
          <div className="flex items-start justify-between mb-10">
            <div className="flex items-center space-x-4">
              <img 
                src={riskifyLogo} 
                alt="Riskify Logo" 
                style={{ height: '86px', width: 'auto' }}
              />
              <div style={{ 
                fontSize: '24px', 
                fontWeight: 'bold',
                color: '#1f2937',
                fontFamily: 'Inter, system-ui, sans-serif',
                lineHeight: '1.2'
              }}>
                Safe Work Method Statement
              </div>
            </div>
            
            <div className="flex items-center space-x-8">
              <div className="text-right" style={{ 
                fontSize: '13px', 
                lineHeight: '18px',
                color: '#6b7280',
                fontFamily: 'Inter, system-ui, sans-serif'
              }}>
                <div className="font-medium" style={{ color: '#374151' }}>{formData.companyName}</div>
                <div>{formData.projectName}</div>
                <div>{formData.projectNumber}</div>
                <div>{formData.projectAddress}</div>
              </div>
              
              <div className="flex-shrink-0">
                {formData.companyLogo ? (
                  <img 
                    src={formData.companyLogo} 
                    alt="Company Logo" 
                    style={{ 
                      height: '86px', 
                      width: 'auto',
                      objectFit: 'contain'
                    }}
                  />
                ) : (
                  <div 
                    className="border-2 border-dashed flex items-center justify-center text-center"
                    style={{ 
                      height: '86px', 
                      width: '120px',
                      borderColor: '#d1d5db',
                      fontSize: '11px',
                      color: '#9ca3af',
                      lineHeight: '14px'
                    }}
                  >
                    Company Logo
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Project Information Content */}
          <div className="grid grid-cols-1 gap-8">
            {/* Basic Project Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-6" style={{ color: '#1f2937' }}>
                Project Information
              </h2>
              
              <div className="grid grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Name</label>
                  <div className="text-sm text-gray-900">{formData.jobName}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Number</label>
                  <div className="text-sm text-gray-900">{formData.jobNumber}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <div className="text-sm text-gray-900">{formData.startDate}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                  <div className="text-sm text-gray-900">{formData.duration}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-6 mt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Created</label>
                  <div className="text-sm text-gray-900">{formData.dateCreated}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Principal Contractor</label>
                  <div className="text-sm text-gray-900">{formData.principalContractor}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Manager</label>
                  <div className="text-sm text-gray-900">{formData.projectManager}</div>
                </div>
              </div>
            </div>

            {/* Authorization */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4" style={{ color: '#1f2937' }}>
                Authorization
              </h3>
              
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Authorising Person</label>
                  <div className="text-sm text-gray-900">{formData.authorisingPerson}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                  <div className="text-sm text-gray-900">{formData.authorisingPosition}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Signature</label>
                  <div 
                    className="text-lg font-semibold border-b-2 border-gray-300 pb-2"
                    style={{ 
                      fontFamily: 'Dancing Script, cursive',
                      color: '#1f2937',
                      minHeight: '30px'
                    }}
                  >
                    {formData.authorisingSignature}
                  </div>
                </div>
              </div>
            </div>

            {/* Scope of Works */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4" style={{ color: '#1f2937' }}>
                Scope of Works
              </h3>
              <div className="text-sm text-gray-700 leading-relaxed">
                {formData.scopeOfWorks}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Emergency Info Page Render
  const renderEmergencyInfoPage = () => {
    return (
      <div 
        className="bg-white shadow-lg rounded-lg overflow-hidden"
        style={{ 
          width: '297mm', 
          minHeight: '210mm',
          margin: '0 auto',
          position: 'relative'
        }}
      >
        {/* Watermark */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{ 
            zIndex: 1,
            opacity: 0.05
          }}
        >
          <div className="grid grid-cols-3 grid-rows-2 h-full w-full gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="flex items-center justify-center">
                <div 
                  className="text-gray-200 font-bold select-none opacity-30"
                  style={{ 
                    fontSize: '20px',
                    transform: 'rotate(-45deg)',
                    whiteSpace: 'nowrap',
                    lineHeight: '24px',
                    textAlign: 'center'
                  }}
                >
                  <div>{formData.companyName}</div>
                  <div>RISKIFY</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 p-8 page-content">
          {/* Header */}
          <div className="flex items-start justify-between mb-10">
            <div className="flex-shrink-0">
              <img 
                src={riskifyLogo} 
                alt="Riskify Logo" 
                style={{ height: '86px', width: 'auto' }}
              />
            </div>
            
            <div className="text-center flex-1 mx-8">
              <div style={{ 
                fontSize: '24px', 
                fontWeight: 'bold',
                color: '#1f2937',
                fontFamily: 'Inter, system-ui, sans-serif',
                lineHeight: '1.2',
                marginBottom: '16px'
              }}>
                Safe Work Method Statement
              </div>
              <div style={{ 
                fontSize: '13px', 
                lineHeight: '18px',
                color: '#6b7280',
                fontFamily: 'Inter, system-ui, sans-serif'
              }}>
                <div className="font-medium" style={{ color: '#374151' }}>{formData.companyName}</div>
                <div>{formData.projectName}</div>
                <div>{formData.projectNumber}</div>
                <div>{formData.projectAddress}</div>
              </div>
            </div>
            
            <div className="flex-shrink-0">
              {formData.companyLogo ? (
                <img 
                  src={formData.companyLogo} 
                  alt="Company Logo" 
                  style={{ 
                    height: '86px', 
                    width: 'auto',
                    objectFit: 'contain'
                  }}
                />
              ) : (
                <div 
                  className="border-2 border-dashed flex items-center justify-center text-center"
                  style={{ 
                    height: '86px', 
                    width: '120px',
                    borderColor: '#d1d5db',
                    fontSize: '11px',
                    color: '#9ca3af',
                    lineHeight: '14px'
                  }}
                >
                  Company Logo
                </div>
              )}
            </div>
          </div>

          {/* Emergency Information Content */}
          <div className="grid grid-cols-1 gap-8">
            {/* Emergency Contacts */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-6" style={{ color: '#1f2937' }}>
                Emergency Contact Information
              </h2>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                        Contact Name
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                        Phone Number
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.emergencyContacts.map((contact, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-3 text-gray-900">
                          {contact.name}
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-gray-900">
                          {contact.phone}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Emergency Procedures */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4" style={{ color: '#1f2937' }}>
                Emergency Response Procedures
              </h3>
              <div className="text-sm text-gray-700 leading-relaxed">
                {formData.emergencyProcedures}
              </div>
            </div>

            {/* Monitoring */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4" style={{ color: '#1f2937' }}>
                Review and Monitoring
              </h3>
              <div className="text-sm text-gray-700 leading-relaxed">
                {formData.emergencyMonitoring}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Continue with more render functions...
  // This file continues in the next files