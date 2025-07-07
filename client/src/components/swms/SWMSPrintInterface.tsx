import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Download, FileText } from 'lucide-react';

interface SWMSPrintInterfaceProps {
  formData: any;
}

export function SWMSPrintInterface({ formData }: SWMSPrintInterfaceProps) {
  const [formFields, setFormFields] = useState({
    companyName: formData.principalContractor || 'Test Company Name',
    projectName: formData.jobName || 'Test Project Name',
    projectNumber: formData.jobNumber || '123 456',
    projectAddress: formData.projectAddress || '123 Sample Job Address',
    jobName: formData.jobName || 'Test Project Name',
    jobNumber: formData.jobNumber || '123 456',
    startDate: formData.startDate || '12th July 2025',
    duration: '8 Weeks',
    dateCreated: '23rd June 2025',
    principalContractor: formData.principalContractor || 'Test Principal Contractor',
    projectManager: formData.projectManager || 'Test Project Manager Name',
    siteSupervisor: formData.siteSupervisor || 'Test Project Supervisor',
    authorisingPersonName: formData.swmsCreatorName || 'Test authorising person name',
    authorisingPersonPosition: formData.swmsCreatorPosition || 'Test authorising person position',
    typeSignature: 'John Smith'
  });

  const [selectedTab, setSelectedTab] = useState('Project Information');
  const [isGenerating, setIsGenerating] = useState(false);

  const tabs = [
    'Project Information',
    'Task & Risk Analysis', 
    'Risk Matrix',
    'Work Activities',
    'PPE',
    'Plant & Equipment',
    'Sign in Register',
    'MIOS'
  ];

  const updateField = (field: string, value: string) => {
    setFormFields(prev => ({
      ...prev,
      [field]: value
    }));
  };

  useEffect(() => {
    // Update form fields when formData changes
    setFormFields(prev => ({
      ...prev,
      companyName: formData.principalContractor || prev.companyName,
      projectName: formData.jobName || prev.projectName,
      projectNumber: formData.jobNumber || prev.projectNumber,
      projectAddress: formData.projectAddress || prev.projectAddress,
      jobName: formData.jobName || prev.jobName,
      jobNumber: formData.jobNumber || prev.jobNumber,
      startDate: formData.startDate || prev.startDate,
      principalContractor: formData.principalContractor || prev.principalContractor,
      projectManager: formData.projectManager || prev.projectManager,
      siteSupervisor: formData.siteSupervisor || prev.siteSupervisor,
      authorisingPersonName: formData.swmsCreatorName || prev.authorisingPersonName,
      authorisingPersonPosition: formData.swmsCreatorPosition || prev.authorisingPersonPosition
    }));
  }, [formData]);

  const generatePDF = async (type: 'Print' | 'Download' | 'Vector' | 'Final') => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/swms/pdf-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, ...formFields })
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `${formFields.projectName || 'SWMS'}-${type}-${Date.now()}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('PDF generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const renderPreviewContent = () => {
    return (
      <div className="bg-gray-200 p-8 h-full overflow-y-auto" style={{ fontSize: '11px', fontFamily: 'Arial, sans-serif' }}>
        {/* Header - Exact SWMSprint Layout */}
        <div className="flex justify-between items-start mb-8">
          <div className="flex items-start gap-6">
            <div>
              <div className="text-green-600 font-bold text-2xl" style={{ fontFamily: 'Arial, sans-serif' }}>Riskify</div>
              <div className="text-xs text-gray-600 italic">AI SWMS Generator</div>
            </div>
            <div>
              <div className="font-bold text-xl text-black">Safe Work Method Statement</div>
            </div>
          </div>
          <div className="text-right text-xs border border-dashed border-gray-500 p-3 bg-gray-50">
            <div className="font-bold">Test Company Name</div>
            <div className="font-bold">Test Project Name</div>
            <div>SWMS</div>
            <div>123 456</div>
            <div>123 Sample Job Address</div>
            <div className="mt-3 border border-gray-400 p-2 text-center text-gray-500">Company Logo</div>
          </div>
        </div>

        {/* Project Information Section - Exact Match */}
        <div className="bg-white border border-gray-400 mb-6">
          <h3 className="font-bold text-black text-base bg-gray-100 p-3 border-b border-gray-400 m-0">Project Information</h3>
          
          <div className="p-4">
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="font-bold">Company Name:</span> Test Company Name
                </div>
                <div className="text-sm">
                  <span className="font-bold">Job Name:</span> Test Project Name
                </div>
                <div className="text-sm">
                  <span className="font-bold">Job Number:</span> 123 456
                </div>
                <div className="text-sm">
                  <span className="font-bold">Project Address:</span> 123 Sample Job Address
                </div>
                <div className="text-sm">
                  <span className="font-bold">Start Date:</span> 12th July 2025
                </div>
                <div className="text-sm">
                  <span className="font-bold">Duration:</span> 8 Weeks
                </div>
                <div className="text-sm">
                  <span className="font-bold">Date Created:</span> 23rd June 2025
                </div>
                <div className="text-sm">
                  <span className="font-bold">Principal Contractor:</span> Test Principal Contractor
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="font-bold">Project Manager:</span> <span className="italic">Test Project Manager Name</span>
                </div>
                <div className="text-sm">
                  <span className="font-bold">Site Supervisor:</span> <span className="italic">Test Project Supervisor</span>
                </div>
                <div className="mt-4">
                  <div className="font-bold text-sm underline">Person Authorising SWMS</div>
                  <div className="mt-2 text-sm">
                    <div>Name: <span className="italic">Test authorising person name</span></div>
                    <div>Position: <span className="italic">Test authorising person position</span></div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="font-bold text-sm">Signature:</div>
                  <div className="mt-2 border border-gray-400 h-12 bg-white relative">
                    <div className="absolute bottom-1 left-2">
                      <div className="w-6 h-6 bg-blue-100 border border-blue-300 flex items-center justify-center">
                        <span className="text-blue-600 text-xs font-bold">JS</span>
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-400"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scope of Works Section - Exact Match */}
        <div className="bg-white border border-gray-400 mb-6">
          <h3 className="font-bold text-black text-base bg-gray-100 p-3 border-b border-gray-400 m-0">Scope of Works</h3>
          <div className="p-4">
            <div className="text-sm text-gray-700">
              Sample scope of works description
            </div>
          </div>
        </div>

        {/* Review and Monitoring Section - Exact Match */}
        <div className="bg-white border border-gray-400">
          <h3 className="font-bold text-black text-base bg-gray-100 p-3 border-b border-gray-400 m-0">Review and Monitoring</h3>
          <div className="p-4">
            <div className="text-sm text-gray-700 leading-relaxed">
              This SWMS will be reviewed and updated whenever changes occur to scope, method, or risk levels. The site supervisor is responsible for initiating this review. All workers will be consulted on this SWMS during the pre-start meeting. Updates will be communicated verbally and via toolbox talks.
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-200">
      {/* Left Sidebar - Form Controls */}
      <div className="w-96 bg-gray-100 border-r border-gray-300">
        {/* Header */}
        <div className="bg-white p-4 border-b">
          <h2 className="text-lg font-bold text-gray-800">SWMS Generator</h2>
        </div>

        {/* Tab Navigation */}
        <div className="bg-gray-200 border-b">
          <div className="flex flex-wrap text-xs">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`px-3 py-2 border-r border-gray-300 ${
                  selectedTab === tab 
                    ? 'bg-white text-blue-600 font-medium' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* PDF Generation Buttons */}
        <div className="p-4 bg-white border-b">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <Button 
              onClick={() => generatePDF('Print')}
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={isGenerating}
            >
              Print PDF
            </Button>
            <Button 
              onClick={() => generatePDF('Download')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isGenerating}
            >
              Download PDF
            </Button>
            <Button 
              onClick={() => generatePDF('Vector')}
              className="bg-purple-600 hover:bg-purple-700 text-white"
              disabled={isGenerating}
            >
              Vector PDF
            </Button>
            <Button 
              onClick={() => generatePDF('Final')}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={isGenerating}
            >
              Final PDF
            </Button>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-4 overflow-y-auto flex-1">
          {selectedTab === 'Project Information' && (
            <div className="space-y-4">
              <h3 className="font-bold text-sm">Project Information</h3>
              
              <div>
                <Label className="text-xs">Company Logo</Label>
                <div className="mt-1 text-xs text-gray-500">Choose File - no file selected</div>
              </div>

              <div>
                <Label className="text-xs">Company Name</Label>
                <Input 
                  value={formFields.companyName}
                  onChange={(e) => updateField('companyName', e.target.value)}
                  className="text-xs h-8"
                />
              </div>

              <div>
                <Label className="text-xs">Project Name</Label>
                <Input 
                  value={formFields.projectName}
                  onChange={(e) => updateField('projectName', e.target.value)}
                  className="text-xs h-8"
                />
              </div>

              <div>
                <Label className="text-xs">Project Number</Label>
                <Input 
                  value={formFields.projectNumber}
                  onChange={(e) => updateField('projectNumber', e.target.value)}
                  className="text-xs h-8"
                />
              </div>

              <div>
                <Label className="text-xs">Project Address</Label>
                <Textarea 
                  value={formFields.projectAddress}
                  onChange={(e) => updateField('projectAddress', e.target.value)}
                  className="text-xs"
                  rows={3}
                />
              </div>

              <div>
                <Label className="text-xs">Job Name</Label>
                <Input 
                  value={formFields.jobName}
                  onChange={(e) => updateField('jobName', e.target.value)}
                  className="text-xs h-8"
                />
              </div>

              <div>
                <Label className="text-xs">Job Number</Label>
                <Input 
                  value={formFields.jobNumber}
                  onChange={(e) => updateField('jobNumber', e.target.value)}
                  className="text-xs h-8"
                />
              </div>

              <div>
                <Label className="text-xs">Start Date</Label>
                <Input 
                  value={formFields.startDate}
                  onChange={(e) => updateField('startDate', e.target.value)}
                  className="text-xs h-8"
                />
              </div>

              <div>
                <Label className="text-xs">Duration</Label>
                <Input 
                  value={formFields.duration}
                  onChange={(e) => updateField('duration', e.target.value)}
                  className="text-xs h-8"
                />
              </div>

              <div>
                <Label className="text-xs">Date Created</Label>
                <Input 
                  value={formFields.dateCreated}
                  onChange={(e) => updateField('dateCreated', e.target.value)}
                  className="text-xs h-8"
                />
              </div>

              <div>
                <Label className="text-xs">Principal Contractor</Label>
                <Input 
                  value={formFields.principalContractor}
                  onChange={(e) => updateField('principalContractor', e.target.value)}
                  className="text-xs h-8"
                />
              </div>

              <div>
                <Label className="text-xs">Project Manager</Label>
                <Input 
                  value={formFields.projectManager}
                  onChange={(e) => updateField('projectManager', e.target.value)}
                  className="text-xs h-8"
                />
              </div>

              <div>
                <Label className="text-xs">Site Supervisor</Label>
                <Input 
                  value={formFields.siteSupervisor}
                  onChange={(e) => updateField('siteSupervisor', e.target.value)}
                  className="text-xs h-8"
                />
              </div>

              <div>
                <Label className="text-xs">Authorising Person Name</Label>
                <Input 
                  value={formFields.authorisingPersonName}
                  onChange={(e) => updateField('authorisingPersonName', e.target.value)}
                  className="text-xs h-8"
                />
              </div>

              <div>
                <Label className="text-xs">Authorising Person Position</Label>
                <Input 
                  value={formFields.authorisingPersonPosition}
                  onChange={(e) => updateField('authorisingPersonPosition', e.target.value)}
                  className="text-xs h-8"
                />
              </div>

              <div>
                <Label className="text-xs">Authorising Person Signature</Label>
                <div className="mt-1 text-xs text-gray-500">Upload Signature Image</div>
                <div className="mt-1 text-xs text-gray-500">Choose File - no file selected</div>
                <div className="mt-2 text-xs text-gray-500">OR</div>
              </div>

              <div>
                <Label className="text-xs">Type Signature</Label>
                <Input 
                  value={formFields.typeSignature}
                  onChange={(e) => updateField('typeSignature', e.target.value)}
                  className="text-xs h-8"
                />
              </div>
            </div>
          )}

          {selectedTab === 'Work Activities' && (
            <div className="text-center text-gray-500 text-sm py-8">
              Work Activities content will be displayed here
            </div>
          )}

          {selectedTab === 'Task & Risk Analysis' && (
            <div className="text-center text-gray-500 text-sm py-8">
              Task & Risk Analysis content will be displayed here
            </div>
          )}

          {selectedTab === 'Risk Matrix' && (
            <div className="text-center text-gray-500 text-sm py-8">
              Risk Matrix content will be displayed here
            </div>
          )}

          {selectedTab === 'PPE' && (
            <div className="text-center text-gray-500 text-sm py-8">
              PPE content will be displayed here
            </div>
          )}

          {selectedTab === 'Plant & Equipment' && (
            <div className="text-center text-gray-500 text-sm py-8">
              Plant & Equipment content will be displayed here
            </div>
          )}

          {selectedTab === 'Sign in Register' && (
            <div className="text-center text-gray-500 text-sm py-8">
              Sign in Register content will be displayed here
            </div>
          )}

          {selectedTab === 'MIOS' && (
            <div className="text-center text-gray-500 text-sm py-8">
              MIOS content will be displayed here
            </div>
          )}
        </div>
      </div>

      {/* Right Side - Document Preview */}
      <div className="flex-1 bg-white">
        <div className="h-full border border-gray-300">
          {renderPreviewContent()}
        </div>
      </div>
    </div>
  );
}