// Continuation of SwmsComplete component - Additional Pages (PPE, Plant Equipment, Risk Matrix, Sign In, MSDS)

  // PPE Page Render
  const renderPPEPage = () => {
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

          {/* PPE Content */}
          <div className="grid grid-cols-1 gap-8">
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-6" style={{ color: '#1f2937' }}>
                Personal Protective Equipment (PPE)
              </h2>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-900" style={{ width: '25%' }}>
                        PPE Item
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-900" style={{ width: '40%' }}>
                        Description
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-900" style={{ width: '15%' }}>
                        Required
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-900" style={{ width: '20%' }}>
                        Selected for Project
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.ppeItems.map((item, index) => (
                      <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900" style={{ backgroundColor: 'white' }}>
                          {item.name}
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-gray-700" style={{ backgroundColor: 'white' }}>
                          {item.description}
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-center" style={{ backgroundColor: 'white' }}>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.required 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {item.required ? 'Yes' : 'Recommended'}
                          </span>
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-center" style={{ backgroundColor: 'white' }}>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.selected 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {item.selected ? 'Yes' : 'No'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Plant Equipment Page Render
  const renderPlantEquipmentPage = () => {
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

          {/* Plant Equipment Content */}
          <div className="grid grid-cols-1 gap-8">
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-6" style={{ color: '#1f2937' }}>
                Plant & Equipment Register
              </h2>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300" style={{ fontSize: '11px' }}>
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-3 py-2 text-center font-semibold text-gray-900" style={{ width: '3%' }}>
                        #
                      </th>
                      <th className="border border-gray-300 px-3 py-2 text-center font-semibold text-gray-900" style={{ width: '20%' }}>
                        Equipment
                      </th>
                      <th className="border border-gray-300 px-3 py-2 text-center font-semibold text-gray-900" style={{ width: '15%' }}>
                        Model
                      </th>
                      <th className="border border-gray-300 px-3 py-2 text-center font-semibold text-gray-900" style={{ width: '12%' }}>
                        Serial Number
                      </th>
                      <th className="border border-gray-300 px-3 py-2 text-center font-semibold text-gray-900" style={{ width: '20%' }}>
                        Hazards
                      </th>
                      <th className="border border-gray-300 px-3 py-2 text-center font-semibold text-gray-900" style={{ width: '10%' }}>
                        Risk Level
                      </th>
                      <th className="border border-gray-300 px-3 py-2 text-center font-semibold text-gray-900" style={{ width: '20%' }}>
                        Control Measures
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.plantEquipment.map((equipment, index) => (
                      <tr key={equipment.id}>
                        <td className="border border-gray-300 px-3 py-2 text-center" style={{ backgroundColor: 'white' }}>
                          {index + 1}
                        </td>
                        <td className="border border-gray-300 px-3 py-2" style={{ backgroundColor: 'white', verticalAlign: 'top', paddingTop: '6px' }}>
                          <div className="font-medium">{equipment.equipment}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            Next Inspection: {equipment.nextInspection}
                          </div>
                        </td>
                        <td className="border border-gray-300 px-3 py-2" style={{ backgroundColor: 'white', verticalAlign: 'top', paddingTop: '6px' }}>
                          {equipment.model}
                        </td>
                        <td className="border border-gray-300 px-3 py-2" style={{ backgroundColor: 'white', verticalAlign: 'top', paddingTop: '6px' }}>
                          {equipment.serialNumber}
                        </td>
                        <td className="border border-gray-300 px-3 py-2" style={{ backgroundColor: 'white', verticalAlign: 'top', paddingTop: '6px' }}>
                          <ul className="list-disc list-inside space-y-1">
                            {equipment.hazards?.map((hazard, hazardIndex) => (
                              <li key={hazardIndex} className="text-xs">{hazard}</li>
                            ))}
                          </ul>
                        </td>
                        <td className="border border-gray-300 px-3 py-2 text-center" style={{ backgroundColor: 'white', verticalAlign: 'top', paddingTop: '6px' }}>
                          <RiskBadgeNew level={equipment.riskLevel} score={0} />
                        </td>
                        <td className="border border-gray-300 px-3 py-2" style={{ backgroundColor: 'white', verticalAlign: 'top', paddingTop: '6px' }}>
                          <ul className="list-disc list-inside space-y-1">
                            {equipment.controlMeasures?.map((measure, measureIndex) => (
                              <li key={measureIndex} className="text-xs">{measure}</li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Risk Matrix Page Render
  const renderRiskMatrixPage = () => {
    const riskMatrix = [
      { likelihood: 'Almost Certain (5)', frequency: 'Daily / Weekly', probability: '>90%', value: 5 },
      { likelihood: 'Likely (4)', frequency: 'Monthly', probability: '61-90%', value: 4 },
      { likelihood: 'Possible (3)', frequency: 'Yearly', probability: '31-60%', value: 3 },
      { likelihood: 'Unlikely (2)', frequency: '5-10 Years', probability: '11-30%', value: 2 },
      { likelihood: 'Rare (1)', frequency: '>10 Years', probability: '<10%', value: 1 }
    ];

    const consequenceMatrix = [
      { consequence: 'Catastrophic (5)', people: 'Fatality', environment: 'Major Environmental Impact', value: 5 },
      { consequence: 'Major (4)', people: 'Permanent Disability', environment: 'Significant Environmental Impact', value: 4 },
      { consequence: 'Moderate (3)', people: 'Lost Time Injury', environment: 'Moderate Environmental Impact', value: 3 },
      { consequence: 'Minor (2)', people: 'Medical Treatment', environment: 'Minor Environmental Impact', value: 2 },
      { consequence: 'Negligible (1)', people: 'First Aid', environment: 'Negligible Environmental Impact', value: 1 }
    ];

    const getRiskColor = (score: number) => {
      if (score >= 15) return '#dc2626'; // Red - Extreme
      if (score >= 10) return '#ea580c'; // Orange - High
      if (score >= 5) return '#eab308';  // Yellow - Medium
      return '#22c55e'; // Green - Low
    };

    const getRiskLevel = (score: number) => {
      if (score >= 15) return 'Extreme';
      if (score >= 10) return 'High';
      if (score >= 5) return 'Medium';
      return 'Low';
    };

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

          {/* Risk Matrix Content */}
          <div className="grid grid-cols-1 gap-8">
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-6" style={{ color: '#1f2937' }}>
                Risk Assessment Matrix
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Likelihood Assessment */}
                <div>
                  <h3 className="text-lg font-semibold mb-4" style={{ color: '#1f2937' }}>
                    Likelihood Assessment
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border-2 border-gray-800">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-gray-300 px-3 py-2 text-center font-semibold text-gray-900">Likelihood</th>
                          <th className="border border-gray-300 px-3 py-2 text-center font-semibold text-gray-900">Frequency</th>
                          <th className="border border-gray-300 px-3 py-2 text-center font-semibold text-gray-900">Probability</th>
                          <th className="border border-gray-300 px-3 py-2 text-center font-semibold text-gray-900">Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {riskMatrix.map((row, index) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="border border-gray-300 px-3 py-2 font-semibold text-center" style={{ backgroundColor: 'white' }}>{row.value}</td>
                            <td className="border border-gray-300 px-3 py-2" style={{ backgroundColor: 'white' }}>{row.likelihood}</td>
                            <td className="border border-gray-300 px-3 py-2" style={{ backgroundColor: 'white' }}>{row.frequency}</td>
                            <td className="border border-gray-300 px-3 py-2" style={{ backgroundColor: 'white' }}>{row.probability}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Consequence Assessment */}
                <div>
                  <h3 className="text-lg font-semibold mb-4" style={{ color: '#1f2937' }}>
                    Consequence Assessment
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border-2 border-gray-800">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-gray-300 px-3 py-2 text-center font-semibold text-gray-900">Consequence</th>
                          <th className="border border-gray-300 px-3 py-2 text-center font-semibold text-gray-900">People</th>
                          <th className="border border-gray-300 px-3 py-2 text-center font-semibold text-gray-900">Environment</th>
                          <th className="border border-gray-300 px-3 py-2 text-center font-semibold text-gray-900">Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {consequenceMatrix.map((row, index) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="border border-gray-300 px-3 py-2 font-semibold text-center" style={{ backgroundColor: 'white' }}>{row.value}</td>
                            <td className="border border-gray-300 px-3 py-2" style={{ backgroundColor: 'white' }}>{row.consequence}</td>
                            <td className="border border-gray-300 px-3 py-2" style={{ backgroundColor: 'white' }}>{row.people}</td>
                            <td className="border border-gray-300 px-3 py-2" style={{ backgroundColor: 'white' }}>{row.environment}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Risk Matrix Grid */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4" style={{ color: '#1f2937' }}>
                  Risk Matrix - Likelihood vs Consequence
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border-2 border-gray-800 risk-matrix-table">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-3 py-2 text-center font-semibold text-gray-900" style={{ width: '20%' }}>
                          Likelihood
                        </th>
                        <th className="border border-gray-300 px-3 py-2 text-center font-semibold text-gray-900" style={{ width: '16%' }}>
                          Negligible (1)
                        </th>
                        <th className="border border-gray-300 px-3 py-2 text-center font-semibold text-gray-900" style={{ width: '16%' }}>
                          Minor (2)
                        </th>
                        <th className="border border-gray-300 px-3 py-2 text-center font-semibold text-gray-900" style={{ width: '16%' }}>
                          Moderate (3)
                        </th>
                        <th className="border border-gray-300 px-3 py-2 text-center font-semibold text-gray-900" style={{ width: '16%' }}>
                          Major (4)
                        </th>
                        <th className="border border-gray-300 px-3 py-2 text-center font-semibold text-gray-900" style={{ width: '16%' }}>
                          Catastrophic (5)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {['Almost Certain (5)', 'Likely (4)', 'Possible (3)', 'Unlikely (2)', 'Rare (1)'].map((likelihood, rowIndex) => (
                        <tr key={rowIndex}>
                          <td className="border border-gray-300 px-3 py-2 font-semibold text-center bg-gray-100">
                            {likelihood}
                          </td>
                          {[1, 2, 3, 4, 5].map((consequence, colIndex) => {
                            const score = (5 - rowIndex) * consequence;
                            const level = getRiskLevel(score);
                            const color = getRiskColor(score);
                            return (
                              <td 
                                key={colIndex} 
                                className="border border-gray-300 px-3 py-2 text-center"
                                style={{ 
                                  backgroundColor: color,
                                  color: score >= 5 ? '#ffffff' : '#000000'
                                }}
                              >
                                <div style={{ 
                                  fontSize: '12px',
                                  fontWeight: '600',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  height: '100%',
                                  textAlign: 'center'
                                }}>
                                  {level} ({score})
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Continue with Sign In and MSDS pages...
  // This continues in the next file