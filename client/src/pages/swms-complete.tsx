import { useState } from "react";
import type { SwmsFormData } from "@shared/schema";
import { defaultSwmsData } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RiskBadgeNew } from "@/components/swms/RiskBadgeNew";
import DocumentPreview from "@/components/swms/document-preview";

type DocumentPage = 'project-info' | 'emergency-info' | 'high-risk-activities' | 'risk-matrix' | 'work-activities' | 'ppe' | 'plant-equipment' | 'msds' | 'sign-in';

export default function SwmsComplete() {
  const [formData, setFormData] = useState<SwmsFormData>(defaultSwmsData);
  const [currentPage, setCurrentPage] = useState<DocumentPage>('project-info');
  const [currentWorkActivitiesPageIndex, setCurrentWorkActivitiesPageIndex] = useState(0);
  const [currentSignInPageIndex, setCurrentSignInPageIndex] = useState(0);

  const handleInputChange = (field: keyof SwmsFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Navigation tabs configuration
  const navigationTabs = [
    { id: 'project-info', label: 'Project Information' },
    { id: 'emergency-info', label: 'Task & Risk Analysis' },
    { id: 'high-risk-activities', label: 'Risk Matrix' },
    { id: 'risk-matrix', label: 'Work Activities' },
    { id: 'work-activities', label: 'PPE' },
    { id: 'ppe', label: 'Plant & Equipment' },
    { id: 'plant-equipment', label: 'Sign in Register' },
    { id: 'sign-in', label: 'MIOS' },
  ];

  const renderCurrentPageContent = () => {
    switch (currentPage) {
      case 'project-info':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Project Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="companyName">Company Name</Label>
                <Input 
                  id="companyName" 
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="projectName">Project Name</Label>
                <Input 
                  id="projectName" 
                  value={formData.projectName}
                  onChange={(e) => handleInputChange('projectName', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="projectNumber">Project Number</Label>
                <Input 
                  id="projectNumber" 
                  value={formData.projectNumber}
                  onChange={(e) => handleInputChange('projectNumber', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="projectAddress">Project Address</Label>
                <Input 
                  id="projectAddress" 
                  value={formData.projectAddress}
                  onChange={(e) => handleInputChange('projectAddress', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="jobName">Job Name</Label>
                <Input 
                  id="jobName" 
                  value={formData.jobName}
                  onChange={(e) => handleInputChange('jobName', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="jobNumber">Job Number</Label>
                <Input 
                  id="jobNumber" 
                  value={formData.jobNumber}
                  onChange={(e) => handleInputChange('jobNumber', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input 
                  id="startDate" 
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="duration">Duration</Label>
                <Input 
                  id="duration" 
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="principalContractor">Principal Contractor</Label>
                <Input 
                  id="principalContractor" 
                  value={formData.principalContractor}
                  onChange={(e) => handleInputChange('principalContractor', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="projectManager">Project Manager</Label>
                <Input 
                  id="projectManager" 
                  value={formData.projectManager}
                  onChange={(e) => handleInputChange('projectManager', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="siteSupervisor">Site Supervisor</Label>
                <Input 
                  id="siteSupervisor" 
                  value={formData.siteSupervisor}
                  onChange={(e) => handleInputChange('siteSupervisor', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="authorisingPerson">Authorising Person</Label>
                <Input 
                  id="authorisingPerson" 
                  value={formData.authorisingPerson}
                  onChange={(e) => handleInputChange('authorisingPerson', e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="scopeOfWorks">Scope of Works</Label>
              <Textarea 
                id="scopeOfWorks" 
                value={formData.scopeOfWorks}
                onChange={(e) => handleInputChange('scopeOfWorks', e.target.value)}
                className="min-h-[120px]"
              />
            </div>
          </div>
        );

      case 'emergency-info':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Task & Risk Analysis</h2>
            <p className="text-gray-600">Configure task generation and risk analysis parameters</p>
          </div>
        );

      case 'high-risk-activities':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Risk Matrix</h2>
            <div className="grid grid-cols-5 gap-2 text-xs">
              {/* Risk Matrix Table */}
              <div className="bg-gray-100 p-2 font-semibold">Likelihood</div>
              <div className="bg-gray-100 p-2 font-semibold text-center">Insignificant</div>
              <div className="bg-gray-100 p-2 font-semibold text-center">Minor</div>
              <div className="bg-gray-100 p-2 font-semibold text-center">Moderate</div>
              <div className="bg-gray-100 p-2 font-semibold text-center">Major</div>
              
              <div className="bg-gray-100 p-2 font-semibold">Almost Certain</div>
              <div className="bg-yellow-500 p-2 text-center text-white">Medium</div>
              <div className="bg-orange-500 p-2 text-center text-white">High</div>
              <div className="bg-red-500 p-2 text-center text-white">Extreme</div>
              <div className="bg-red-500 p-2 text-center text-white">Extreme</div>
              
              <div className="bg-gray-100 p-2 font-semibold">Likely</div>
              <div className="bg-green-500 p-2 text-center text-white">Low</div>
              <div className="bg-yellow-500 p-2 text-center text-white">Medium</div>
              <div className="bg-orange-500 p-2 text-center text-white">High</div>
              <div className="bg-red-500 p-2 text-center text-white">Extreme</div>
              
              <div className="bg-gray-100 p-2 font-semibold">Possible</div>
              <div className="bg-green-500 p-2 text-center text-white">Low</div>
              <div className="bg-green-500 p-2 text-center text-white">Low</div>
              <div className="bg-yellow-500 p-2 text-center text-white">Medium</div>
              <div className="bg-orange-500 p-2 text-center text-white">High</div>
              
              <div className="bg-gray-100 p-2 font-semibold">Unlikely</div>
              <div className="bg-green-500 p-2 text-center text-white">Low</div>
              <div className="bg-green-500 p-2 text-center text-white">Low</div>
              <div className="bg-green-500 p-2 text-center text-white">Low</div>
              <div className="bg-yellow-500 p-2 text-center text-white">Medium</div>
              
              <div className="bg-gray-100 p-2 font-semibold">Rare</div>
              <div className="bg-green-500 p-2 text-center text-white">Low</div>
              <div className="bg-green-500 p-2 text-center text-white">Low</div>
              <div className="bg-green-500 p-2 text-center text-white">Low</div>
              <div className="bg-green-500 p-2 text-center text-white">Low</div>
            </div>
          </div>
        );

      case 'work-activities':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Work Activities</h2>
            {formData.workActivities.length > 0 ? (
              <div className="space-y-4">
                {formData.workActivities.map((activity, index) => (
                  <div key={activity.id} className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-2">{activity.activity}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Hazards:</p>
                        <ul className="text-sm">
                          {activity.hazards.map((hazard, i) => (
                            <li key={i}>• {hazard}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Control Measures:</p>
                        <ul className="text-sm">
                          {activity.controlMeasures.map((measure, i) => (
                            <li key={i}>• {measure}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Risk Level:</p>
                        {typeof activity.initialRisk === 'object' && (
                          <RiskBadgeNew level={activity.initialRisk.level} score={activity.initialRisk.score} />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No work activities defined yet.</p>
            )}
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">{currentPage.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</h2>
            <p className="text-gray-600">Content for {currentPage} will be implemented here.</p>
          </div>
        );
    }
  };

  const renderCurrentPage = () => {
    return (
      <div className="bg-white min-h-[842px] w-[595px] mx-auto shadow-lg p-8" style={{ 
        backgroundColor: '#ffffff',
        fontFamily: 'Inter, Arial, sans-serif' 
      }}>
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-green-600 mb-2">Riskify</h1>
          <h2 className="text-lg font-semibold text-gray-800">Safe Work Method Statement</h2>
        </div>
        
        <div className="border-t-2 border-green-600 pt-4">
          {renderCurrentPageContent()}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* LEFT SIDEBAR - Form Panel (1/3 width) */}
      <div className="w-1/3 bg-white p-8 overflow-auto no-print">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">SWMS Generator</h1>
        
        {/* 8 TAB NAVIGATION BUTTONS */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 mb-4">
            {navigationTabs.map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setCurrentPage(tab.id as DocumentPage)}
                className={`px-3 py-2 text-sm rounded-md transition-colors ${
                  currentPage === tab.id 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          
          {/* PDF Export Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button size="sm" className="bg-green-600 hover:bg-green-700">
              Print
            </Button>
            <Button size="sm" variant="outline">
              Download
            </Button>
            <Button size="sm" variant="outline">
              Vector
            </Button>
            <Button size="sm" className="bg-orange-500 hover:bg-orange-600">
              Final
            </Button>
          </div>
        </div>

        {/* Form Content for Current Tab */}
        <div className="space-y-6">
          {renderCurrentPageContent()}
        </div>
      </div>

      {/* RIGHT PANEL - Document Preview (2/3 width) */}
      <div className="w-2/3 overflow-auto" style={{ backgroundColor: '#f3f4f6' }}>
        <div className="p-6">
          {renderCurrentPage()}
        </div>
      </div>
    </div>
  );
}