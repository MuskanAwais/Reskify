import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Eye, FileText, Users, Shield, Wrench, AlertTriangle, MapPin, Phone, Calendar, CheckCircle } from 'lucide-react';

interface SWMSPrintInterfaceProps {
  formData: any;
}

interface Section {
  id: string;
  title: string;
  icon: React.ReactNode;
  selected: boolean;
  content?: any;
}

export function SWMSPrintInterface({ formData }: SWMSPrintInterfaceProps) {
  const [selectedSections, setSelectedSections] = useState<string[]>([
    'project-info', 'personnel', 'activities', 'ppe', 'equipment', 'emergency'
  ]);
  const [previewData, setPreviewData] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const sections: Section[] = [
    {
      id: 'project-info',
      title: 'Project Information',
      icon: <FileText className="w-5 h-5" />,
      selected: selectedSections.includes('project-info'),
      content: {
        projectName: formData.jobName || formData.title || 'Untitled Project',
        jobNumber: formData.jobNumber || 'N/A',
        address: formData.projectAddress || 'N/A',
        tradeType: formData.tradeType || 'General Construction',
        startDate: formData.startDate || 'N/A',
        description: formData.projectDescription || formData.workDescription || 'N/A'
      }
    },
    {
      id: 'personnel',
      title: 'Personnel Information',
      icon: <Users className="w-5 h-5" />,
      selected: selectedSections.includes('personnel'),
      content: {
        principalContractor: formData.principalContractor || 'N/A',
        projectManager: formData.projectManager || 'N/A',
        siteSupervisor: formData.siteSupervisor || 'N/A',
        swmsCreator: formData.swmsCreatorName || 'N/A'
      }
    },
    {
      id: 'activities',
      title: 'Work Activities',
      icon: <CheckCircle className="w-5 h-5" />,
      selected: selectedSections.includes('activities'),
      content: {
        activities: formData.workActivities || formData.activities || []
      }
    },
    {
      id: 'ppe',
      title: 'PPE Requirements',
      icon: <Shield className="w-5 h-5" />,
      selected: selectedSections.includes('ppe'),
      content: {
        requirements: formData.ppeRequirements || []
      }
    },
    {
      id: 'equipment',
      title: 'Plant & Equipment',
      icon: <Wrench className="w-5 h-5" />,
      selected: selectedSections.includes('equipment'),
      content: {
        equipment: formData.plantEquipment || []
      }
    },
    {
      id: 'emergency',
      title: 'Emergency Procedures',
      icon: <AlertTriangle className="w-5 h-5" />,
      selected: selectedSections.includes('emergency'),
      content: {
        procedures: formData.emergencyProcedures || 'No emergency procedures specified'
      }
    }
  ];

  const toggleSection = (sectionId: string) => {
    setSelectedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const updatePreview = () => {
    const selectedContent = sections
      .filter(section => selectedSections.includes(section.id))
      .reduce((acc, section) => {
        acc[section.id] = section.content;
        return acc;
      }, {} as any);
    
    setPreviewData(selectedContent);
  };

  useEffect(() => {
    updatePreview();
  }, [selectedSections, formData]);

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/swms/pdf-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `${formData.jobName || 'SWMS'}-${Date.now()}.pdf`;
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
    if (!previewData) return <div className="text-gray-500">Select sections to preview</div>;

    return (
      <div className="space-y-6">
        {previewData['project-info'] && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              Project Information
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="font-medium">Project:</span> {previewData['project-info'].projectName}</div>
              <div><span className="font-medium">Job #:</span> {previewData['project-info'].jobNumber}</div>
              <div><span className="font-medium">Address:</span> {previewData['project-info'].address}</div>
              <div><span className="font-medium">Trade:</span> {previewData['project-info'].tradeType}</div>
              <div><span className="font-medium">Start Date:</span> {previewData['project-info'].startDate}</div>
              <div className="col-span-2"><span className="font-medium">Description:</span> {previewData['project-info'].description}</div>
            </div>
          </div>
        )}

        {previewData['personnel'] && (
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 className="font-semibold text-green-900 mb-3 flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Personnel Information
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="font-medium">Principal Contractor:</span> {previewData['personnel'].principalContractor}</div>
              <div><span className="font-medium">Project Manager:</span> {previewData['personnel'].projectManager}</div>
              <div><span className="font-medium">Site Supervisor:</span> {previewData['personnel'].siteSupervisor}</div>
              <div><span className="font-medium">SWMS Creator:</span> {previewData['personnel'].swmsCreator}</div>
            </div>
          </div>
        )}

        {previewData['activities'] && (
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <h3 className="font-semibold text-purple-900 mb-3 flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              Work Activities ({previewData['activities'].activities.length})
            </h3>
            <div className="space-y-2">
              {previewData['activities'].activities.slice(0, 3).map((activity: any, index: number) => (
                <div key={index} className="text-sm bg-white p-2 rounded border">
                  <div className="font-medium">{index + 1}. {activity.name}</div>
                  {activity.riskScore && (
                    <div className="text-xs text-purple-600">Risk Score: {activity.riskScore}/20</div>
                  )}
                </div>
              ))}
              {previewData['activities'].activities.length > 3 && (
                <div className="text-xs text-gray-500">
                  +{previewData['activities'].activities.length - 3} more activities...
                </div>
              )}
            </div>
          </div>
        )}

        {previewData['ppe'] && (
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h3 className="font-semibold text-yellow-900 mb-3 flex items-center">
              <Shield className="w-4 h-4 mr-2" />
              PPE Requirements ({previewData['ppe'].requirements.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {previewData['ppe'].requirements.slice(0, 6).map((ppe: string, index: number) => (
                <span key={index} className="text-xs bg-yellow-200 px-2 py-1 rounded">
                  {ppe}
                </span>
              ))}
              {previewData['ppe'].requirements.length > 6 && (
                <span className="text-xs text-gray-500">
                  +{previewData['ppe'].requirements.length - 6} more...
                </span>
              )}
            </div>
          </div>
        )}

        {previewData['equipment'] && (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Wrench className="w-4 h-4 mr-2" />
              Plant & Equipment ({previewData['equipment'].equipment.length})
            </h3>
            <div className="space-y-2">
              {previewData['equipment'].equipment.slice(0, 3).map((item: any, index: number) => (
                <div key={index} className="text-sm bg-white p-2 rounded border flex justify-between">
                  <span>{item.name || item}</span>
                  {item.riskLevel && (
                    <span className={`text-xs px-2 py-1 rounded ${
                      item.riskLevel === 'High' ? 'bg-red-100 text-red-700' :
                      item.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {item.riskLevel}
                    </span>
                  )}
                </div>
              ))}
              {previewData['equipment'].equipment.length > 3 && (
                <div className="text-xs text-gray-500">
                  +{previewData['equipment'].equipment.length - 3} more items...
                </div>
              )}
            </div>
          </div>
        )}

        {previewData['emergency'] && (
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <h3 className="font-semibold text-red-900 mb-3 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Emergency Procedures
            </h3>
            <div className="text-sm text-red-800 whitespace-pre-line">
              {previewData['emergency'].procedures}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">SWMSprint Document Builder</h1>
              <p className="text-gray-600 mt-1">Select sections and customize your SWMS document</p>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={updatePreview}
                className="flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Update Preview
              </Button>
              <Button 
                onClick={generatePDF}
                disabled={isGenerating}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <Download className="w-4 h-4" />
                {isGenerating ? 'Generating...' : 'Download PDF'}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Section Selection Panel */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">Document Sections</h2>
                <div className="space-y-3">
                  {sections.map((section) => (
                    <div
                      key={section.id}
                      className={`flex items-center p-3 rounded-lg border-2 transition-all cursor-pointer ${
                        section.selected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                      onClick={() => toggleSection(section.id)}
                    >
                      <div className={`mr-3 ${section.selected ? 'text-blue-600' : 'text-gray-400'}`}>
                        {section.icon}
                      </div>
                      <div>
                        <div className={`font-medium ${section.selected ? 'text-blue-900' : 'text-gray-700'}`}>
                          {section.title}
                        </div>
                        <div className="text-xs text-gray-500">
                          {section.selected ? 'Included' : 'Click to include'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    Document Status
                  </div>
                  <div className="text-xs text-gray-600">
                    {selectedSections.length} of {sections.length} sections selected
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${(selectedSections.length / sections.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Document Preview</h2>
                  <div className="text-sm text-gray-500">
                    Live preview • {selectedSections.length} sections
                  </div>
                </div>
                <div className="border rounded-lg p-4 bg-white max-h-96 overflow-y-auto">
                  {renderPreviewContent()}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}