import { useState } from "react";
import type { SwmsFormData } from "@shared/schema";
import { defaultSwmsData } from "@shared/schema";

export default function SwmsSimple() {
  const [formData, setFormData] = useState<SwmsFormData>(defaultSwmsData);

  const handleInputChange = (field: keyof SwmsFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Form Panel */}
      <div className="w-1/2 bg-white p-8 overflow-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">SWMS Form</h1>
        
        <div className="space-y-6">
          {/* Company Information */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Company Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
          </div>

          {/* Project Information */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Project Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                <input
                  type="text"
                  value={formData.projectName}
                  onChange={(e) => handleInputChange('projectName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Number</label>
                <input
                  type="text"
                  value={formData.projectNumber}
                  onChange={(e) => handleInputChange('projectNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Address</label>
                <input
                  type="text"
                  value={formData.projectAddress}
                  onChange={(e) => handleInputChange('projectAddress', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
          </div>

          {/* Job Information */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Job Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Name</label>
                <input
                  type="text"
                  value={formData.jobName}
                  onChange={(e) => handleInputChange('jobName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Number</label>
                <input
                  type="text"
                  value={formData.jobNumber}
                  onChange={(e) => handleInputChange('jobNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="text"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Created</label>
                <input
                  type="text"
                  value={formData.dateCreated}
                  onChange={(e) => handleInputChange('dateCreated', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
          </div>

          {/* Personnel Information */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Personnel Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Principal Contractor</label>
                <input
                  type="text"
                  value={formData.principalContractor}
                  onChange={(e) => handleInputChange('principalContractor', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Manager</label>
                <input
                  type="text"
                  value={formData.projectManager}
                  onChange={(e) => handleInputChange('projectManager', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Site Supervisor</label>
                <input
                  type="text"
                  value={formData.siteSupervisor}
                  onChange={(e) => handleInputChange('siteSupervisor', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Authorising Person</label>
                <input
                  type="text"
                  value={formData.authorisingPerson}
                  onChange={(e) => handleInputChange('authorisingPerson', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Authorising Position</label>
                <input
                  type="text"
                  value={formData.authorisingPosition}
                  onChange={(e) => handleInputChange('authorisingPosition', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
          </div>

          {/* Scope of Works */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Scope of Works</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Scope of Works</label>
              <textarea
                value={formData.scopeOfWorks}
                onChange={(e) => handleInputChange('scopeOfWorks', e.target.value)}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-vertical"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Preview Panel - Exact Figma Match */}
      <div className="w-1/2 overflow-auto" style={{ backgroundColor: '#f3f4f6' }}>
        <div className="p-6">
          <div className="bg-white shadow-lg mx-auto" style={{ width: '794px', minHeight: '1123px' }}>
            <div style={{ padding: '48px 40px' }}>
              
              {/* Header Section - Exact Figma Layout */}
              <div className="flex items-start justify-between mb-10">
                {/* Riskify Logo */}
                <div className="flex-shrink-0">
                  <div className="font-bold leading-none" style={{ 
                    fontSize: '28px', 
                    color: '#2c5530',
                    fontFamily: 'Inter, system-ui, sans-serif'
                  }}>
                    Riskify
                  </div>
                </div>
                
                {/* Center Company Info */}
                <div className="text-center mx-8 flex-1">
                  <div className="space-y-0" style={{ 
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
                
                {/* Company Logo Placeholder */}
                <div className="flex-shrink-0">
                  <div 
                    className="border-2 border-dashed flex items-center justify-center text-center"
                    style={{ 
                      width: '140px', 
                      height: '88px',
                      borderColor: '#d1d5db',
                      fontSize: '11px',
                      color: '#9ca3af',
                      lineHeight: '14px',
                      fontFamily: 'Inter, system-ui, sans-serif'
                    }}
                  >
                    Insert company logo here
                  </div>
                </div>
              </div>

              {/* Document Title */}
              <div className="text-center mb-10">
                <h1 className="font-bold leading-none" style={{ 
                  fontSize: '32px', 
                  color: '#2c5530',
                  fontFamily: 'Inter, system-ui, sans-serif'
                }}>
                  Safe Work Method Statement
                </h1>
              </div>

              {/* Project Information Section */}
              <div className="mb-8">
                <h2 className="font-semibold mb-6" style={{ 
                  fontSize: '18px',
                  color: '#111827',
                  fontFamily: 'Inter, system-ui, sans-serif'
                }}>
                  Project Information
                </h2>
                
                <div className="grid grid-cols-2 gap-6">
                  {/* Left Card */}
                  <div className="bg-white border rounded-lg p-5" style={{ 
                    borderColor: '#e5e7eb',
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
                  }}>
                    <div className="space-y-3">
                      <div style={{ fontSize: '13px', lineHeight: '18px' }}>
                        <span className="font-semibold" style={{ color: '#111827' }}>Job Name: </span>
                        <span style={{ color: '#111827' }}>{formData.jobName}</span>
                      </div>
                      <div style={{ fontSize: '13px', lineHeight: '18px' }}>
                        <span className="font-semibold" style={{ color: '#111827' }}>Job Number: </span>
                        <span style={{ color: '#111827' }}>{formData.jobNumber}</span>
                      </div>
                      <div style={{ fontSize: '13px', lineHeight: '18px' }}>
                        <span className="font-semibold" style={{ color: '#111827' }}>Project Address: </span>
                        <span style={{ color: '#111827' }}>{formData.projectAddress}</span>
                      </div>
                      <div style={{ fontSize: '13px', lineHeight: '18px' }}>
                        <span className="font-semibold" style={{ color: '#111827' }}>Start Date: </span>
                        <span style={{ color: '#111827' }}>{formData.startDate}</span>
                      </div>
                      <div style={{ fontSize: '13px', lineHeight: '18px' }}>
                        <span className="font-semibold" style={{ color: '#111827' }}>Duration: </span>
                        <span style={{ color: '#111827' }}>{formData.duration}</span>
                      </div>
                      <div style={{ fontSize: '13px', lineHeight: '18px' }}>
                        <span className="font-semibold" style={{ color: '#111827' }}>Date Created: </span>
                        <span style={{ color: '#111827' }}>{formData.dateCreated}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Card */}
                  <div className="bg-white border rounded-lg p-5" style={{ 
                    borderColor: '#e5e7eb',
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
                  }}>
                    <div className="space-y-3">
                      <div style={{ fontSize: '13px', lineHeight: '18px' }}>
                        <span className="font-semibold" style={{ color: '#111827' }}>Company Name: </span>
                        <span style={{ color: '#111827' }}>{formData.companyName}</span>
                      </div>
                      <div style={{ fontSize: '13px', lineHeight: '18px' }}>
                        <span className="font-semibold" style={{ color: '#111827' }}>Principal Contractor's Name: </span>
                        <span className="italic" style={{ color: '#111827' }}>{formData.principalContractor}</span>
                      </div>
                      <div style={{ fontSize: '13px', lineHeight: '18px' }}>
                        <span className="font-semibold" style={{ color: '#111827' }}>Project Manager: </span>
                        <span className="italic" style={{ color: '#111827' }}>{formData.projectManager}</span>
                      </div>
                      <div style={{ fontSize: '13px', lineHeight: '18px' }}>
                        <span className="font-semibold" style={{ color: '#111827' }}>Site Supervisor: </span>
                        <span className="italic" style={{ color: '#111827' }}>{formData.siteSupervisor}</span>
                      </div>
                      <div className="mt-4" style={{ fontSize: '13px', lineHeight: '18px' }}>
                        <div className="font-semibold underline mb-2" style={{ color: '#111827' }}>Person Authorising SWMS</div>
                        <div>Name: <span className="italic" style={{ color: '#111827' }}>{formData.authorisingPerson}</span></div>
                        <div>Position: <span className="italic" style={{ color: '#111827' }}>{formData.authorisingPosition}</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Scope of Works Section */}
              <div className="mt-10">
                <h2 className="font-semibold mb-6" style={{ 
                  fontSize: '18px',
                  color: '#111827',
                  fontFamily: 'Inter, system-ui, sans-serif'
                }}>
                  Scope of Works
                </h2>
                <div className="bg-white border rounded-lg p-5" style={{ 
                  borderColor: '#e5e7eb',
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
                }}>
                  <div className="whitespace-pre-line" style={{ 
                    fontSize: '13px', 
                    lineHeight: '18px',
                    color: '#6b7280'
                  }}>
                    {formData.scopeOfWorks}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}