// Continuation of SwmsComplete component - Work Activities and Additional Pages

  // Work Activities Page Render
  const renderWorkActivitiesPages = () => {
    const itemsPerPage = 2;
    const totalPages = Math.ceil(formData.workActivities.length / itemsPerPage);
    const pages = [];

    for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
      const startIndex = pageIndex * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const pageActivities = formData.workActivities.slice(startIndex, endIndex);

      pages.push(
        <div 
          key={pageIndex}
          className="bg-white shadow-lg rounded-lg overflow-hidden mb-8"
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
                  Work Activities & Risk Assessment
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

            {/* Work Activities Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300" style={{ fontSize: '11px' }}>
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-3 py-2 text-center font-semibold text-gray-900" style={{ width: '3%' }}>
                      #
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-center font-semibold text-gray-900" style={{ width: '14%' }}>
                      Activity
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-center font-semibold text-gray-900" style={{ width: '23%' }}>
                      Hazards
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-center font-semibold text-gray-900" style={{ width: '11%' }}>
                      Initial Risk
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-center font-semibold text-gray-900" style={{ width: '27%' }}>
                      Control Measures
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-center font-semibold text-gray-900" style={{ width: '11%' }}>
                      Residual Risk
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-center font-semibold text-gray-900" style={{ width: '11%' }}>
                      Legislation
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pageActivities.map((activity, index) => (
                    <tr key={activity.id}>
                      <td className="border border-gray-300 px-3 py-2 text-center" style={{ backgroundColor: 'white' }}>
                        {startIndex + index + 1}
                      </td>
                      <td className="border border-gray-300 px-3 py-2" style={{ backgroundColor: 'white', verticalAlign: 'top', paddingTop: '6px' }}>
                        {activity.activity}
                      </td>
                      <td className="border border-gray-300 px-3 py-2" style={{ backgroundColor: 'white', verticalAlign: 'top', paddingTop: '6px' }}>
                        <ul className="list-disc list-inside space-y-1">
                          {activity.hazards.map((hazard, hazardIndex) => (
                            <li key={hazardIndex} className="text-xs">{hazard}</li>
                          ))}
                        </ul>
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-center" style={{ backgroundColor: 'white', verticalAlign: 'top', paddingTop: '6px' }}>
                        {typeof activity.initialRisk === 'object' ? (
                          <RiskBadgeNew 
                            level={activity.initialRisk.level} 
                            score={activity.initialRisk.score} 
                          />
                        ) : (
                          <span className="text-xs">{activity.initialRisk}</span>
                        )}
                      </td>
                      <td className="border border-gray-300 px-3 py-2" style={{ backgroundColor: 'white', verticalAlign: 'top', paddingTop: '6px' }}>
                        <ul className="list-disc list-inside space-y-1">
                          {activity.controlMeasures.map((measure, measureIndex) => (
                            <li key={measureIndex} className="text-xs">{measure}</li>
                          ))}
                        </ul>
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-center" style={{ backgroundColor: 'white', verticalAlign: 'top', paddingTop: '6px' }}>
                        {typeof activity.residualRisk === 'object' ? (
                          <RiskBadgeNew 
                            level={activity.residualRisk.level} 
                            score={activity.residualRisk.score} 
                          />
                        ) : (
                          <span className="text-xs">{activity.residualRisk}</span>
                        )}
                      </td>
                      <td className="border border-gray-300 px-3 py-2" style={{ backgroundColor: 'white', verticalAlign: 'top', paddingTop: '6px' }}>
                        <ul className="list-disc list-inside space-y-1">
                          {activity.legislation.map((law, lawIndex) => (
                            <li key={lawIndex} className="text-xs">{law}</li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Page Footer */}
            <div className="mt-6 text-right text-sm text-gray-500">
              Page {pageIndex + 1} of {totalPages}
            </div>
          </div>
        </div>
      );
    }

    return <div>{pages}</div>;
  };

  // High Risk Activities Page Render
  const renderHighRiskActivitiesPage = () => {
    const selectedActivities = formData.highRiskActivities.filter(activity => activity.selected);
    
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

          {/* High Risk Activities Content */}
          <div className="grid grid-cols-1 gap-8">
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-6" style={{ color: '#1f2937' }}>
                High Risk Activities
              </h2>
              
              {selectedActivities.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-500">No high risk activities selected for this project.</div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-6">
                  {selectedActivities.map((activity) => (
                    <div key={activity.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-lg text-gray-900">{activity.title}</h3>
                        {activity.riskLevel && (
                          <RiskBadgeNew level={activity.riskLevel} score={0} />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">{activity.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Continue with more render functions...
  // This continues in the next file