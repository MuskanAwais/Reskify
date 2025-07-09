// Continuation of SwmsComplete component - Sign In and MSDS Pages

  // Sign In Page Render
  const renderSignInPages = () => {
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

          {/* Sign In Content */}
          <div className="grid grid-cols-1 gap-8">
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-6" style={{ color: '#1f2937' }}>
                Site Personnel Sign In Register
              </h2>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-900" style={{ width: '20%' }}>
                        Name
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-900" style={{ width: '20%' }}>
                        Company
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-900" style={{ width: '15%' }}>
                        Date
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-900" style={{ width: '15%' }}>
                        Time In
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-900" style={{ width: '15%' }}>
                        Time Out
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-900" style={{ width: '15%' }}>
                        Signature
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Show user-entered sign-in entries first */}
                    {formData.signInEntries.map((entry, index) => (
                      <tr key={entry.id}>
                        <td className="border border-gray-300 px-4 py-3" style={{ backgroundColor: 'white', height: '40px' }}>
                          {entry.name}
                        </td>
                        <td className="border border-gray-300 px-4 py-3" style={{ backgroundColor: 'white', height: '40px' }}>
                          {entry.company}
                        </td>
                        <td className="border border-gray-300 px-4 py-3" style={{ backgroundColor: 'white', height: '40px' }}>
                          {entry.date}
                        </td>
                        <td className="border border-gray-300 px-4 py-3" style={{ backgroundColor: 'white', height: '40px' }}>
                          {entry.timeIn}
                        </td>
                        <td className="border border-gray-300 px-4 py-3" style={{ backgroundColor: 'white', height: '40px' }}>
                          {entry.timeOut}
                        </td>
                        <td className="border border-gray-300 px-4 py-3" style={{ backgroundColor: 'white', height: '40px', fontFamily: 'Dancing Script, cursive', fontSize: '16px', fontWeight: '600' }}>
                          {entry.signature}
                        </td>
                      </tr>
                    ))}
                    
                    {/* Empty rows for additional signatures */}
                    {Array.from({ length: 15 - formData.signInEntries.length }, (_, index) => (
                      <tr key={`empty-${index}`}>
                        <td className="border border-gray-300 px-4 py-3" style={{ backgroundColor: 'white', height: '40px' }}>
                          &nbsp;
                        </td>
                        <td className="border border-gray-300 px-4 py-3" style={{ backgroundColor: 'white', height: '40px' }}>
                          &nbsp;
                        </td>
                        <td className="border border-gray-300 px-4 py-3" style={{ backgroundColor: 'white', height: '40px' }}>
                          &nbsp;
                        </td>
                        <td className="border border-gray-300 px-4 py-3" style={{ backgroundColor: 'white', height: '40px' }}>
                          &nbsp;
                        </td>
                        <td className="border border-gray-300 px-4 py-3" style={{ backgroundColor: 'white', height: '40px' }}>
                          &nbsp;
                        </td>
                        <td className="border border-gray-300 px-4 py-3" style={{ backgroundColor: 'white', height: '40px' }}>
                          &nbsp;
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-6 text-sm text-gray-600">
                <p><strong>Note:</strong> All personnel must sign in upon arrival and sign out upon departure. Site induction must be completed before entry.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // MSDS Page Render
  const renderMSDSPage = () => {
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
                Material Safety Data Sheets
              </div>
            </div>
            
            <div className="flex items-center space-x-8">
              <div className="text-right" style={{ 
                fontSize: '13px', 
                lineHeight: '18px',
                color: '#6b7280',
                fontFamily: 'Inter, system-ui, sans-serif',
                lineHeight: '1.2'
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

          {/* MSDS Documents List */}
          <div className="space-y-6">
            {selectedDocuments.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg mb-4">No MSDS Documents Selected</div>
                <div className="text-gray-400 text-sm">
                  Use the form on the left to upload and select MSDS documents to include in your SWMS.
                </div>
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4" style={{ color: '#1f2937' }}>
                    Attached Documents ({selectedDocuments.length})
                  </h2>

                </div>

                {/* Document List */}
                <div className="space-y-4">
                  {selectedDocuments.map((doc, index) => (
                    <div key={doc.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-2" style={{ color: '#1f2937' }}>
                            {index + 1}. {doc.customTitle || doc.fileName}
                          </h3>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div><strong>Original File:</strong> {doc.fileName}</div>
                            <div><strong>Upload Date:</strong> {new Date(doc.uploadDate).toLocaleDateString()}</div>
                            <div><strong>File Type:</strong> PDF Document</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                            Attached
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer Note */}
                <div className="mt-8 border-t border-gray-200 pt-6">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <div className="text-yellow-600 mr-3">⚠️</div>
                      <div>
                        <h4 className="font-semibold text-yellow-800 mb-1">Important Note</h4>
                        <p className="text-sm text-yellow-700">
                          Please ensure all personnel review the attached MSDS documents before commencing work. 
                          These documents contain critical safety information about hazardous materials that may 
                          be encountered during the project.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Main render function that determines which page to show
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'project-info':
        return renderProjectInfoPage();
      case 'emergency-info':
        return renderEmergencyInfoPage();
      case 'high-risk-activities':
        return renderHighRiskActivitiesPage();
      case 'risk-matrix':
        return renderRiskMatrixPage();
      case 'work-activities':
        return renderWorkActivitiesPages();
      case 'ppe':
        return renderPPEPage();
      case 'plant-equipment':
        return renderPlantEquipmentPage();
      case 'sign-in':
        return renderSignInPages();
      case 'msds':
        return renderMSDSPage();
      default:
        return renderProjectInfoPage();
    }
  };

  // Continue with the main component return and form sections...
  // This continues in the next file