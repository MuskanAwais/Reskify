import { RiskBadgeNew } from "./RiskBadgeNew";

interface DocumentPreviewProps {
  formData: any;
  currentPage: string;
  currentWorkActivitiesPageIndex?: number;
  currentSignInPageIndex?: number;
}

export default function DocumentPreview({ 
  formData, 
  currentPage,
  currentWorkActivitiesPageIndex = 0,
  currentSignInPageIndex = 0 
}: DocumentPreviewProps) {
  
  const renderProjectInfoPage = () => (
    <div className="bg-white min-h-[842px] w-full mx-auto shadow-lg" style={{ fontFamily: 'Inter, Arial, sans-serif' }}>
      {/* Header */}
      <div className="bg-green-600 text-white p-6 text-center">
        <h1 className="text-3xl font-bold mb-2">Riskify</h1>
        <h2 className="text-xl">Safe Work Method Statement</h2>
      </div>
      
      {/* Content */}
      <div className="p-8 space-y-6">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Project Information</h3>
          <div className="w-24 h-1 bg-green-600 mx-auto"></div>
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="border-b border-gray-200 pb-2">
              <span className="text-sm font-semibold text-gray-600">Company Name:</span>
              <p className="text-gray-800">{formData.companyName}</p>
            </div>
            <div className="border-b border-gray-200 pb-2">
              <span className="text-sm font-semibold text-gray-600">Project Name:</span>
              <p className="text-gray-800">{formData.projectName}</p>
            </div>
            <div className="border-b border-gray-200 pb-2">
              <span className="text-sm font-semibold text-gray-600">Project Number:</span>
              <p className="text-gray-800">{formData.projectNumber}</p>
            </div>
            <div className="border-b border-gray-200 pb-2">
              <span className="text-sm font-semibold text-gray-600">Job Name:</span>
              <p className="text-gray-800">{formData.jobName}</p>
            </div>
            <div className="border-b border-gray-200 pb-2">
              <span className="text-sm font-semibold text-gray-600">Start Date:</span>
              <p className="text-gray-800">{formData.startDate}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="border-b border-gray-200 pb-2">
              <span className="text-sm font-semibold text-gray-600">Project Address:</span>
              <p className="text-gray-800">{formData.projectAddress}</p>
            </div>
            <div className="border-b border-gray-200 pb-2">
              <span className="text-sm font-semibold text-gray-600">Job Number:</span>
              <p className="text-gray-800">{formData.jobNumber}</p>
            </div>
            <div className="border-b border-gray-200 pb-2">
              <span className="text-sm font-semibold text-gray-600">Duration:</span>
              <p className="text-gray-800">{formData.duration}</p>
            </div>
            <div className="border-b border-gray-200 pb-2">
              <span className="text-sm font-semibold text-gray-600">Principal Contractor:</span>
              <p className="text-gray-800">{formData.principalContractor}</p>
            </div>
            <div className="border-b border-gray-200 pb-2">
              <span className="text-sm font-semibold text-gray-600">Project Manager:</span>
              <p className="text-gray-800">{formData.projectManager}</p>
            </div>
          </div>
        </div>
        
        <div className="mt-8">
          <div className="border-b border-gray-200 pb-2 mb-4">
            <span className="text-sm font-semibold text-gray-600">Scope of Works:</span>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-800 whitespace-pre-line">{formData.scopeOfWorks}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderRiskMatrixPage = () => (
    <div className="bg-white min-h-[842px] w-full mx-auto shadow-lg" style={{ fontFamily: 'Inter, Arial, sans-serif' }}>
      {/* Header */}
      <div className="bg-green-600 text-white p-6 text-center">
        <h1 className="text-3xl font-bold mb-2">Riskify</h1>
        <h2 className="text-xl">Risk Assessment Matrix</h2>
      </div>
      
      {/* Content */}
      <div className="p-8">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Construction Risk Matrix</h3>
          <div className="w-24 h-1 bg-green-600 mx-auto"></div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr>
                <th className="border border-gray-300 p-3 bg-gray-100 text-sm font-semibold">Likelihood</th>
                <th className="border border-gray-300 p-3 bg-gray-100 text-sm font-semibold">Insignificant</th>
                <th className="border border-gray-300 p-3 bg-gray-100 text-sm font-semibold">Minor</th>
                <th className="border border-gray-300 p-3 bg-gray-100 text-sm font-semibold">Moderate</th>
                <th className="border border-gray-300 p-3 bg-gray-100 text-sm font-semibold">Major</th>
                <th className="border border-gray-300 p-3 bg-gray-100 text-sm font-semibold">Catastrophic</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 p-3 bg-gray-100 font-medium text-sm">Almost Certain</td>
                <td className="border border-gray-300 p-3 text-center">
                  <RiskBadgeNew level="medium" />
                </td>
                <td className="border border-gray-300 p-3 text-center">
                  <RiskBadgeNew level="high" />
                </td>
                <td className="border border-gray-300 p-3 text-center">
                  <RiskBadgeNew level="extreme" />
                </td>
                <td className="border border-gray-300 p-3 text-center">
                  <RiskBadgeNew level="extreme" />
                </td>
                <td className="border border-gray-300 p-3 text-center">
                  <RiskBadgeNew level="extreme" />
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-3 bg-gray-100 font-medium text-sm">Likely</td>
                <td className="border border-gray-300 p-3 text-center">
                  <RiskBadgeNew level="low" />
                </td>
                <td className="border border-gray-300 p-3 text-center">
                  <RiskBadgeNew level="medium" />
                </td>
                <td className="border border-gray-300 p-3 text-center">
                  <RiskBadgeNew level="high" />
                </td>
                <td className="border border-gray-300 p-3 text-center">
                  <RiskBadgeNew level="extreme" />
                </td>
                <td className="border border-gray-300 p-3 text-center">
                  <RiskBadgeNew level="extreme" />
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-3 bg-gray-100 font-medium text-sm">Possible</td>
                <td className="border border-gray-300 p-3 text-center">
                  <RiskBadgeNew level="low" />
                </td>
                <td className="border border-gray-300 p-3 text-center">
                  <RiskBadgeNew level="low" />
                </td>
                <td className="border border-gray-300 p-3 text-center">
                  <RiskBadgeNew level="medium" />
                </td>
                <td className="border border-gray-300 p-3 text-center">
                  <RiskBadgeNew level="high" />
                </td>
                <td className="border border-gray-300 p-3 text-center">
                  <RiskBadgeNew level="extreme" />
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-3 bg-gray-100 font-medium text-sm">Unlikely</td>
                <td className="border border-gray-300 p-3 text-center">
                  <RiskBadgeNew level="low" />
                </td>
                <td className="border border-gray-300 p-3 text-center">
                  <RiskBadgeNew level="low" />
                </td>
                <td className="border border-gray-300 p-3 text-center">
                  <RiskBadgeNew level="low" />
                </td>
                <td className="border border-gray-300 p-3 text-center">
                  <RiskBadgeNew level="medium" />
                </td>
                <td className="border border-gray-300 p-3 text-center">
                  <RiskBadgeNew level="high" />
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-3 bg-gray-100 font-medium text-sm">Rare</td>
                <td className="border border-gray-300 p-3 text-center">
                  <RiskBadgeNew level="low" />
                </td>
                <td className="border border-gray-300 p-3 text-center">
                  <RiskBadgeNew level="low" />
                </td>
                <td className="border border-gray-300 p-3 text-center">
                  <RiskBadgeNew level="low" />
                </td>
                <td className="border border-gray-300 p-3 text-center">
                  <RiskBadgeNew level="low" />
                </td>
                <td className="border border-gray-300 p-3 text-center">
                  <RiskBadgeNew level="medium" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderWorkActivitiesPage = () => (
    <div className="bg-white min-h-[842px] w-full mx-auto shadow-lg" style={{ fontFamily: 'Inter, Arial, sans-serif' }}>
      {/* Header */}
      <div className="bg-green-600 text-white p-6 text-center">
        <h1 className="text-3xl font-bold mb-2">Riskify</h1>
        <h2 className="text-xl">Work Activities & Risk Assessment</h2>
      </div>
      
      {/* Content */}
      <div className="p-8">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Work Activities</h3>
          <div className="w-24 h-1 bg-green-600 mx-auto"></div>
        </div>
        
        {formData.workActivities && formData.workActivities.length > 0 ? (
          <div className="space-y-6">
            {formData.workActivities.map((activity: any, index: number) => (
              <div key={activity.id} className="border border-gray-200 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">
                  {index + 1}. {activity.activity}
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h5 className="font-medium text-gray-700 mb-2">Hazards:</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {activity.hazards.map((hazard: string, i: number) => (
                        <li key={i} className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>{hazard}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-gray-700 mb-2">Control Measures:</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {activity.controlMeasures.map((measure: string, i: number) => (
                        <li key={i} className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>{measure}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-gray-700 mb-2">Risk Assessment:</h5>
                    <div className="space-y-2">
                      <div>
                        <span className="text-xs text-gray-500">Initial Risk:</span>
                        <div className="mt-1">
                          {typeof activity.initialRisk === 'object' && activity.initialRisk.level && (
                            <RiskBadgeNew 
                              level={activity.initialRisk.level} 
                              score={activity.initialRisk.score} 
                            />
                          )}
                        </div>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Residual Risk:</span>
                        <div className="mt-1">
                          {typeof activity.residualRisk === 'object' && activity.residualRisk.level && (
                            <RiskBadgeNew 
                              level={activity.residualRisk.level} 
                              score={activity.residualRisk.score} 
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {activity.legislation && activity.legislation.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h5 className="font-medium text-gray-700 mb-2">Relevant Legislation:</h5>
                    <div className="flex flex-wrap gap-2">
                      {activity.legislation.map((law: string, i: number) => (
                        <span key={i} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          {law}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No work activities defined yet.</p>
            <p className="text-gray-400 text-sm mt-2">Add activities using the form on the left.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderDefaultPage = () => (
    <div className="bg-white min-h-[842px] w-full mx-auto shadow-lg" style={{ fontFamily: 'Inter, Arial, sans-serif' }}>
      {/* Header */}
      <div className="bg-green-600 text-white p-6 text-center">
        <h1 className="text-3xl font-bold mb-2">Riskify</h1>
        <h2 className="text-xl">Safe Work Method Statement</h2>
      </div>
      
      {/* Content */}
      <div className="p-8">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            {currentPage.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </h3>
          <div className="w-24 h-1 bg-green-600 mx-auto"></div>
        </div>
        
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Content for {currentPage} will be displayed here.</p>
          <p className="text-gray-400 text-sm mt-2">Fill in the form on the left to see the preview.</p>
        </div>
      </div>
    </div>
  );

  // Render the appropriate page based on currentPage
  switch (currentPage) {
    case 'project-info':
      return renderProjectInfoPage();
    case 'high-risk-activities':
      return renderRiskMatrixPage();
    case 'work-activities':
      return renderWorkActivitiesPage();
    default:
      return renderDefaultPage();
  }
}