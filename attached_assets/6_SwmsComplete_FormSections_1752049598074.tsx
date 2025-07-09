// Continuation of SwmsComplete component - Form Sections and Main Return

  // Main component return with form sections
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Form Panel */}
      <div className="w-1/3 bg-white p-8 overflow-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">SWMS Generator</h1>
        
        {/* Page Navigation */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCurrentPage('project-info')}
              className={`px-3 py-2 text-xs font-medium rounded ${
                currentPage === 'project-info' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Project Info
            </button>
            <button
              onClick={() => setCurrentPage('emergency-info')}
              className={`px-3 py-2 text-xs font-medium rounded ${
                currentPage === 'emergency-info' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Emergency Info
            </button>
            <button
              onClick={() => setCurrentPage('high-risk-activities')}
              className={`px-3 py-2 text-xs font-medium rounded ${
                currentPage === 'high-risk-activities' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              High Risk
            </button>
            <button
              onClick={() => setCurrentPage('risk-matrix')}
              className={`px-3 py-2 text-xs font-medium rounded ${
                currentPage === 'risk-matrix' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Risk Matrix
            </button>
            <button
              onClick={() => setCurrentPage('work-activities')}
              className={`px-3 py-2 text-xs font-medium rounded ${
                currentPage === 'work-activities' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Work Activities
            </button>
            <button
              onClick={() => setCurrentPage('ppe')}
              className={`px-3 py-2 text-xs font-medium rounded ${
                currentPage === 'ppe' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              PPE
            </button>
            <button
              onClick={() => setCurrentPage('plant-equipment')}
              className={`px-3 py-2 text-xs font-medium rounded ${
                currentPage === 'plant-equipment' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Plant & Equipment
            </button>
            <button
              onClick={() => setCurrentPage('sign-in')}
              className={`px-3 py-2 text-xs font-medium rounded ${
                currentPage === 'sign-in' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Sign In Register
            </button>
            <button
              onClick={() => setCurrentPage('msds')}
              className={`px-3 py-2 text-xs font-medium rounded ${
                currentPage === 'msds' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              MSDS
            </button>
          </div>
        </div>

        {/* PDF Export Buttons */}
        <div className="mb-6 space-y-2">
          <button
            onClick={handlePrintPDF}
            disabled={isGeneratingPDF}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            {isGeneratingPDF ? 'Generating PDF...' : 'Download PDF (PNG Method)'}
          </button>
          
          <button
            onClick={exportVectorPdf}
            className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 text-sm font-medium"
          >
            Download PDF (Vector Method)
          </button>
        </div>

        {/* Form Content based on current page */}
        {currentPage === 'project-info' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold mb-4">Project Information</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                <input
                  type="text"
                  value={formData.projectName}
                  onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Number</label>
                <input
                  type="text"
                  value={formData.projectNumber}
                  onChange={(e) => setFormData({ ...formData, projectNumber: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Name</label>
                <input
                  type="text"
                  value={formData.jobName}
                  onChange={(e) => setFormData({ ...formData, jobName: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Address</label>
              <input
                type="text"
                value={formData.projectAddress}
                onChange={(e) => setFormData({ ...formData, projectAddress: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Scope of Works</label>
              <textarea
                value={formData.scopeOfWorks}
                onChange={(e) => setFormData({ ...formData, scopeOfWorks: e.target.value })}
                rows={4}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Logo</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      setFormData({ ...formData, companyLogo: event.target?.result as string });
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              />
              {formData.companyLogo && (
                <div className="mt-2">
                  <img src={formData.companyLogo} alt="Company Logo Preview" className="h-16 w-auto border rounded" />
                </div>
              )}
            </div>
          </div>
        )}

        {currentPage === 'emergency-info' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold mb-4">Emergency Information</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contacts</label>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {formData.emergencyContacts.map((contact, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Name"
                      value={contact.name}
                      onChange={(e) => {
                        const newContacts = [...formData.emergencyContacts];
                        newContacts[index].name = e.target.value;
                        setFormData({ ...formData, emergencyContacts: newContacts });
                      }}
                      className="flex-1 p-2 border border-gray-300 rounded-md text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Phone"
                      value={contact.phone}
                      onChange={(e) => {
                        const newContacts = [...formData.emergencyContacts];
                        newContacts[index].phone = e.target.value;
                        setFormData({ ...formData, emergencyContacts: newContacts });
                      }}
                      className="flex-1 p-2 border border-gray-300 rounded-md text-sm"
                    />
                    <button
                      onClick={() => {
                        const newContacts = formData.emergencyContacts.filter((_, i) => i !== index);
                        setFormData({ ...formData, emergencyContacts: newContacts });
                      }}
                      className="text-red-600 text-sm hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => {
                    setFormData({
                      ...formData,
                      emergencyContacts: [...formData.emergencyContacts, { name: '', phone: '' }]
                    });
                  }}
                  className="w-full p-2 border-2 border-dashed border-gray-300 rounded-md text-gray-600 hover:border-green-300 hover:text-green-600"
                >
                  + Add Emergency Contact
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Procedures</label>
              <textarea
                value={formData.emergencyProcedures}
                onChange={(e) => setFormData({ ...formData, emergencyProcedures: e.target.value })}
                rows={4}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monitoring & Review</label>
              <textarea
                value={formData.emergencyMonitoring}
                onChange={(e) => setFormData({ ...formData, emergencyMonitoring: e.target.value })}
                rows={3}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </div>
        )}

        {currentPage === 'high-risk-activities' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold mb-4">High Risk Activities</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {formData.highRiskActivities.map((activity, index) => (
                <div key={activity.id} className="border rounded p-3 bg-gray-50">
                  <div className="flex items-center space-x-3 mb-2">
                    <input
                      type="checkbox"
                      checked={activity.selected}
                      onChange={(e) => {
                        const newActivities = [...formData.highRiskActivities];
                        newActivities[index].selected = e.target.checked;
                        setFormData({ ...formData, highRiskActivities: newActivities });
                      }}
                      className="text-green-600"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{activity.title}</div>
                      <div className="text-xs text-gray-600">{activity.description}</div>
                    </div>
                    {activity.riskLevel && (
                      <RiskBadgeNew level={activity.riskLevel} score={0} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentPage === 'work-activities' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold mb-4">Work Activities</h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {formData.workActivities.map((activity, index) => (
                <div key={activity.id} className="border rounded p-4 bg-gray-50">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Activity</label>
                      <input
                        type="text"
                        value={activity.activity}
                        onChange={(e) => {
                          const newActivities = [...formData.workActivities];
                          newActivities[index].activity = e.target.value;
                          setFormData({ ...formData, workActivities: newActivities });
                        }}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Hazards</label>
                      <div className="space-y-1">
                        {activity.hazards.map((hazard, hazardIndex) => (
                          <div key={hazardIndex} className="flex gap-2">
                            <input
                              type="text"
                              value={hazard}
                              onChange={(e) => {
                                const newActivities = [...formData.workActivities];
                                newActivities[index].hazards[hazardIndex] = e.target.value;
                                setFormData({ ...formData, workActivities: newActivities });
                              }}
                              className="flex-1 p-1 border border-gray-300 rounded text-xs"
                            />
                            <button
                              onClick={() => {
                                const newActivities = [...formData.workActivities];
                                newActivities[index].hazards = newActivities[index].hazards.filter((_, hi) => hi !== hazardIndex);
                                setFormData({ ...formData, workActivities: newActivities });
                              }}
                              className="text-red-600 text-xs hover:text-red-800"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => {
                            const newActivities = [...formData.workActivities];
                            newActivities[index].hazards.push('');
                            setFormData({ ...formData, workActivities: newActivities });
                          }}
                          className="text-xs text-green-600 hover:text-green-800"
                        >
                          + Add Hazard
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Control Measures</label>
                      <div className="space-y-1">
                        {activity.controlMeasures.map((measure, measureIndex) => (
                          <div key={measureIndex} className="flex gap-2">
                            <input
                              type="text"
                              value={measure}
                              onChange={(e) => {
                                const newActivities = [...formData.workActivities];
                                newActivities[index].controlMeasures[measureIndex] = e.target.value;
                                setFormData({ ...formData, workActivities: newActivities });
                              }}
                              className="flex-1 p-1 border border-gray-300 rounded text-xs"
                            />
                            <button
                              onClick={() => {
                                const newActivities = [...formData.workActivities];
                                newActivities[index].controlMeasures = newActivities[index].controlMeasures.filter((_, mi) => mi !== measureIndex);
                                setFormData({ ...formData, workActivities: newActivities });
                              }}
                              className="text-red-600 text-xs hover:text-red-800"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => {
                            const newActivities = [...formData.workActivities];
                            newActivities[index].controlMeasures.push('');
                            setFormData({ ...formData, workActivities: newActivities });
                          }}
                          className="text-xs text-green-600 hover:text-green-800"
                        >
                          + Add Control Measure
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => {
                      const newActivities = formData.workActivities.filter((_, i) => i !== index);
                      setFormData({ ...formData, workActivities: newActivities });
                    }}
                    className="text-red-600 text-sm hover:text-red-800 mt-3"
                  >
                    Remove Activity
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  const newActivity = {
                    id: Date.now().toString(),
                    activity: '',
                    hazards: [''],
                    initialRisk: { level: 'low' as const, score: 1 },
                    controlMeasures: [''],
                    residualRisk: { level: 'low' as const, score: 1 },
                    legislation: ['WHS Act 2011']
                  };
                  setFormData({ ...formData, workActivities: [...formData.workActivities, newActivity] });
                }}
                className="w-full p-2 border-2 border-dashed border-gray-300 rounded-md text-gray-600 hover:border-green-300 hover:text-green-600"
              >
                + Add New Work Activity
              </button>
            </div>
          </div>
        )}

        {currentPage === 'ppe' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold mb-4">Personal Protective Equipment</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {formData.ppeItems.map((item, index) => (
                <div key={item.id} className="border rounded p-3 bg-gray-50">
                  <div className="flex items-center space-x-3 mb-2">
                    <input
                      type="checkbox"
                      checked={item.selected}
                      onChange={(e) => {
                        const newItems = [...formData.ppeItems];
                        newItems[index].selected = e.target.checked;
                        setFormData({ ...formData, ppeItems: newItems });
                      }}
                      className="text-green-600"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{item.name}</div>
                      <div className="text-xs text-gray-600">{item.description}</div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.required 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {item.required ? 'Required' : 'Recommended'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentPage === 'plant-equipment' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold mb-4">Plant & Equipment</h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {formData.plantEquipment.map((equipment, index) => (
                <div key={equipment.id} className="border rounded p-4 bg-gray-50">
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Equipment</label>
                      <input
                        type="text"
                        value={equipment.equipment}
                        onChange={(e) => {
                          const newEquipment = [...formData.plantEquipment];
                          newEquipment[index].equipment = e.target.value;
                          setFormData({ ...formData, plantEquipment: newEquipment });
                        }}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                      <input
                        type="text"
                        value={equipment.model}
                        onChange={(e) => {
                          const newEquipment = [...formData.plantEquipment];
                          newEquipment[index].model = e.target.value;
                          setFormData({ ...formData, plantEquipment: newEquipment });
                        }}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number</label>
                      <input
                        type="text"
                        value={equipment.serialNumber}
                        onChange={(e) => {
                          const newEquipment = [...formData.plantEquipment];
                          newEquipment[index].serialNumber = e.target.value;
                          setFormData({ ...formData, plantEquipment: newEquipment });
                        }}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Risk Level</label>
                      <select
                        value={equipment.riskLevel}
                        onChange={(e) => {
                          const newEquipment = [...formData.plantEquipment];
                          newEquipment[index].riskLevel = e.target.value as 'extreme' | 'high' | 'medium' | 'low';
                          setFormData({ ...formData, plantEquipment: newEquipment });
                        }}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="extreme">Extreme</option>
                      </select>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const newEquipment = formData.plantEquipment.filter((_, i) => i !== index);
                      setFormData({ 
                        ...formData, 
                        plantEquipment: newEquipment
                      });
                    }}
                    className="text-red-600 text-sm hover:text-red-800"
                  >
                    Remove Equipment
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  const newEquipment = {
                    id: Date.now().toString(),
                    equipment: '',
                    model: '',
                    serialNumber: '',
                    riskLevel: 'low' as const,
                    nextInspection: '',
                    certificationRequired: false,
                    hazards: [],
                    initialRisk: { level: 'low' as const, score: 1 },
                    controlMeasures: [],
                    residualRisk: { level: 'low' as const, score: 1 },
                    legislation: []
                  };
                  const currentEquipment = formData.plantEquipment || [];
                  setFormData({ 
                    ...formData, 
                    plantEquipment: [...currentEquipment, newEquipment]
                  });
                }}
                className="w-full p-2 border-2 border-dashed border-gray-300 rounded-md text-gray-600 hover:border-green-300 hover:text-green-600"
              >
                + Add New Equipment
              </button>
            </div>
          </div>
        )}

        {currentPage === 'sign-in' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold mb-4">Site Personnel Sign In Register</h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {formData.signInEntries.map((entry, index) => (
                <div key={entry.id} className="border rounded p-4 bg-gray-50">
                  <div className="grid grid-cols-4 gap-4 mb-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input
                        type="text"
                        value={entry.name}
                        onChange={(e) => {
                          const newEntries = [...formData.signInEntries];
                          newEntries[index].name = e.target.value;
                          setFormData({ ...formData, signInEntries: newEntries });
                        }}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Number</label>
                      <input
                        type="text"
                        value={entry.number}
                        onChange={(e) => {
                          const newEntries = [...formData.signInEntries];
                          newEntries[index].number = e.target.value;
                          setFormData({ ...formData, signInEntries: newEntries });
                        }}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Signature</label>
                      <input
                        type="text"
                        value={entry.signature}
                        onChange={(e) => {
                          const newEntries = [...formData.signInEntries];
                          newEntries[index].signature = e.target.value;
                          setFormData({ ...formData, signInEntries: newEntries });
                        }}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                      <input
                        type="text"
                        value={entry.date}
                        onChange={(e) => {
                          const newEntries = [...formData.signInEntries];
                          newEntries[index].date = e.target.value;
                          setFormData({ ...formData, signInEntries: newEntries });
                        }}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const newEntries = formData.signInEntries.filter((_, i) => i !== index);
                      setFormData({ ...formData, signInEntries: newEntries });
                    }}
                    className="text-red-600 text-sm hover:text-red-800"
                  >
                    Remove Entry
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  const newEntry = {
                    id: Date.now().toString(),
                    name: '',
                    company: '',
                    position: '',
                    date: new Date().toLocaleDateString('en-AU'),
                    timeIn: '',
                    timeOut: '',
                    signature: '',
                    inductionComplete: false
                  };
                  setFormData({ ...formData, signInEntries: [...formData.signInEntries, newEntry] });
                }}
                className="w-full p-2 border-2 border-dashed border-gray-300 rounded-md text-gray-600 hover:border-green-300 hover:text-green-600"
              >
                + Add New Sign In Entry
              </button>
            </div>
          </div>
        )}

        {currentPage === 'msds' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold mb-4">MSDS Documents Library</h2>
            
            <div className="space-y-4">
              {formData.msdsDocuments.map((doc, index) => (
                <div key={doc.id} className="border border-gray-300 rounded-md p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{doc.customTitle || doc.fileName}</h3>
                    <div className="flex items-center space-x-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={doc.selected}
                          onChange={(e) => {
                            const newDocs = [...formData.msdsDocuments];
                            newDocs[index].selected = e.target.checked;
                            setFormData({ ...formData, msdsDocuments: newDocs });
                          }}
                          className="mr-2"
                        />
                        Include in SWMS
                      </label>
                      <button
                        onClick={() => {
                          const newDocs = formData.msdsDocuments.filter((_, i) => i !== index);
                          setFormData({ ...formData, msdsDocuments: newDocs });
                        }}
                        className="text-red-600 text-sm hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Document Title</label>
                      <input
                        type="text"
                        value={doc.customTitle}
                        onChange={(e) => {
                          const newDocs = [...formData.msdsDocuments];
                          newDocs[index].customTitle = e.target.value;
                          setFormData({ ...formData, msdsDocuments: newDocs });
                        }}
                        placeholder="Enter custom document title"
                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Original File Name</label>
                      <input
                        type="text"
                        value={doc.fileName}
                        readOnly
                        className="w-full p-2 border border-gray-300 rounded-md text-sm bg-gray-100"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-2 text-sm text-gray-500">
                    Uploaded: {new Date(doc.uploadDate).toLocaleDateString()}
                  </div>
                </div>
              ))}
              
              <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                <input
                  type="file"
                  accept=".pdf"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    files.forEach(file => {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const base64Data = event.target?.result as string;
                        const newDoc = {
                          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                          fileName: file.name,
                          customTitle: file.name.replace('.pdf', ''),
                          fileData: base64Data,
                          uploadDate: new Date().toISOString(),
                          selected: false
                        };
                        setFormData({ 
                          ...formData, 
                          msdsDocuments: [...formData.msdsDocuments, newDoc] 
                        });
                      };
                      reader.readAsDataURL(file);
                    });
                    // Clear the input
                    e.target.value = '';
                  }}
                  className="hidden"
                  id="msds-upload"
                />
                <label 
                  htmlFor="msds-upload" 
                  className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                >
                  Upload MSDS Documents (PDF)
                </label>
                <p className="mt-2 text-sm text-gray-500">
                  Upload one or more PDF files to add to your MSDS library
                </p>
              </div>
              
              {formData.msdsDocuments.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Selected for SWMS:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    {formData.msdsDocuments
                      .filter(doc => doc.selected)
                      .map(doc => (
                        <li key={doc.id}>• {doc.customTitle || doc.fileName}</li>
                      ))}
                  </ul>
                  {formData.msdsDocuments.filter(doc => doc.selected).length === 0 && (
                    <p className="text-sm text-blue-600">No documents selected for inclusion in SWMS</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {currentPage === 'risk-matrix' && (
          <div className="text-gray-600">
            <h2 className="text-lg font-semibold mb-4">Risk Matrix</h2>
            <p>Form controls for editing risk matrix data will be implemented based on user feedback.</p>
          </div>
        )}
      </div>

      {/* Preview Panel */}
      <div className="w-2/3 overflow-auto" style={{ backgroundColor: '#f3f4f6' }}>
        <div className="p-6">
          {renderCurrentPage()}
        </div>
      </div>
    </div>
  );
}

// Export the component
export default SwmsComplete;