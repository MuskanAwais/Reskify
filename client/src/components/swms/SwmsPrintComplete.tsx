import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DocumentPreview from "./document-preview";
import EmergencyInfoPage from "./emergency-info-page";
import HighRiskActivitiesPage from "./high-risk-activities-page";
import RiskMatrixPage from "./risk-matrix-page";
import WorkActivitiesPage from "./work-activities-page";
import PpePage from "./ppe-page";
import type { SwmsFormData, DocumentPage } from "@/types/swms";
import riskifyLogo from '@assets/slogan-6_1750823980552.png';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { PDFDocument } from 'pdf-lib';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, pdf as reactPdf, Image } from '@react-pdf/renderer';
import { RiskBadgeNew } from "./RiskBadgeNew";

type DocumentPage = 'project-info' | 'emergency-info' | 'high-risk-activities' | 'risk-matrix' | 'work-activities' | 'ppe' | 'plant-equipment' | 'msds' | 'sign-in';

const initialFormData: SwmsFormData = {
  companyName: "Riskify Construction",
  projectName: "Office Building Construction",
  projectNumber: "PRJ-2025-001",
  projectAddress: "123 Construction Ave, Sydney NSW",
  jobName: "Foundation & Concrete Works",
  jobNumber: "JOB-001",
  startDate: "1st July 2025",
  duration: "6 weeks",
  dateCreated: "24th June 2025",
  principalContractor: "BuildCorp Construction Ltd",
  projectManager: "John Smith",
  siteSupervisor: "Jane Doe",
  authorisingPerson: "Sarah Wilson (WHS Manager)",
  scopeOfWorks: `Foundation excavation and concrete pouring works including:
• Site preparation and excavation to specified depths
• Installation of formwork and reinforcement steel
• Concrete pouring and finishing
• Quality control and testing procedures
• Site safety measures and emergency procedures`,
  emergencyContacts: [
    { name: "Emergency Contact 01 Name", phone: "0499 999 999" },
    { name: "Emergency Contact 02 Name", phone: "0499 999 999" },
    { name: "Emergency Contact 03 Name", phone: "0499 999 999" }
  ],
  emergencyProcedures: "Sample procedure information here",
  emergencyMonitoring: "Emergency procedures will be reviewed monthly and updated as needed. Site supervisor will conduct weekly checks of emergency equipment and contact details. All personnel will be trained on emergency procedures during induction and refresher training every 6 months.",
  highRiskActivities: [],
  workActivities: []
};

export default function SwmsPrintComplete() {
  const [formData, setFormData] = useState<SwmsFormData>(initialFormData);
  const [currentPage, setCurrentPage] = useState<DocumentPage>('project-info');
  const [currentWorkActivitiesPageIndex, setCurrentWorkActivitiesPageIndex] = useState(0);
  const [currentSignInPageIndex, setCurrentSignInPageIndex] = useState(0);

  const updateFormData = (updates: Partial<SwmsFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleInputChange = (field: keyof SwmsFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Risk badge styles and levels
  const riskLevels = {
    extreme: { color: '#dc2626', text: '#ffffff' },
    high: { color: '#f97316', text: '#ffffff' },
    medium: { color: '#eab308', text: '#ffffff' },
    low: { color: '#22c55e', text: '#ffffff' }
  };

  const getRiskBadgeHTML = (level: string, score: number) => {
    const risk = riskLevels[level as keyof typeof riskLevels] || riskLevels.medium;
    
    return `<div style="display: table-cell; vertical-align: middle; text-align: center; background-color: ${risk.color}; color: #ffffff; border-radius: 4px; font-size: 10px; font-weight: 600; width: 70px; height: 24px; box-sizing: border-box; white-space: nowrap; font-family: Inter, Arial, sans-serif;">${level.charAt(0).toUpperCase() + level.slice(1)} (${score})</div>`;
  };

  const getRiskBadgeTextOnly = (level: string) => {
    const risk = riskLevels[level as keyof typeof riskLevels] || riskLevels.medium;
    
    return `<div style="display: inline-flex; align-items: flex-start; justify-content: center; background-color: ${risk.color}; color: #ffffff; border-radius: 4px; font-size: 10px; font-weight: 600; width: 70px; height: 24px; box-sizing: border-box; white-space: nowrap; font-family: Inter, Arial, sans-serif; line-height: 1; padding-top: 6px;">${level.charAt(0).toUpperCase() + level.slice(1)}</div>`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-riskify-green">Riskify</div>
              <div className="ml-4 text-gray-600">SWMS Generator</div>
            </div>
            <div className="text-sm text-gray-500">Safe Work Method Statement</div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row min-h-screen">
          {/* Form Panel */}
          <div className="w-full lg:w-1/2 bg-white border-r border-gray-200 no-print">
            <div className="p-6 lg:p-8">
              <div className="mb-8">
                <h1 className="text-2xl font-semibold text-gray-900 mb-2">Document Information</h1>
                <p className="text-gray-600">Fill in the details below to generate your SWMS document</p>
              </div>

              <Tabs value={currentPage} onValueChange={(value) => setCurrentPage(value as DocumentPage)} className="space-y-6">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="project-info">Project Info</TabsTrigger>
                  <TabsTrigger value="emergency-info">Emergency</TabsTrigger>
                  <TabsTrigger value="high-risk-activities">High Risk</TabsTrigger>
                  <TabsTrigger value="risk-matrix">Risk Matrix</TabsTrigger>
                  <TabsTrigger value="work-activities">Activities</TabsTrigger>
                  <TabsTrigger value="ppe">PPE</TabsTrigger>
                  <TabsTrigger value="plant-equipment">Plant</TabsTrigger>
                  <TabsTrigger value="sign-in">Sign In</TabsTrigger>
                  <TabsTrigger value="msds">MSDS</TabsTrigger>
                </TabsList>

                {/* Company Information - shown on all tabs */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Company Information</h2>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="companyName">Company Name</Label>
                      <Input 
                        id="companyName" 
                        value={formData.companyName}
                        onChange={(e) => handleInputChange('companyName', e.target.value)}
                        className="focus:ring-2 focus:ring-riskify-green focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Project Information - shown on all tabs */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Project Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="projectName">Project Name</Label>
                      <Input 
                        id="projectName" 
                        value={formData.projectName}
                        onChange={(e) => handleInputChange('projectName', e.target.value)}
                        className="focus:ring-2 focus:ring-riskify-green focus:border-transparent"
                      />
                    </div>
                    <div>
                      <Label htmlFor="projectNumber">Project Number</Label>
                      <Input 
                        id="projectNumber" 
                        value={formData.projectNumber}
                        onChange={(e) => handleInputChange('projectNumber', e.target.value)}
                        className="focus:ring-2 focus:ring-riskify-green focus:border-transparent"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="projectAddress">Project Address</Label>
                      <Input 
                        id="projectAddress" 
                        value={formData.projectAddress}
                        onChange={(e) => handleInputChange('projectAddress', e.target.value)}
                        className="focus:ring-2 focus:ring-riskify-green focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Job Information - shown on all tabs */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Job Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="jobName">Job Name</Label>
                      <Input 
                        id="jobName" 
                        value={formData.jobName}
                        onChange={(e) => handleInputChange('jobName', e.target.value)}
                        className="focus:ring-2 focus:ring-riskify-green focus:border-transparent"
                      />
                    </div>
                    <div>
                      <Label htmlFor="jobNumber">Job Number</Label>
                      <Input 
                        id="jobNumber" 
                        value={formData.jobNumber}
                        onChange={(e) => handleInputChange('jobNumber', e.target.value)}
                        className="focus:ring-2 focus:ring-riskify-green focus:border-transparent"
                      />
                    </div>
                    <div>
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input 
                        id="startDate" 
                        value={formData.startDate}
                        onChange={(e) => handleInputChange('startDate', e.target.value)}
                        className="focus:ring-2 focus:ring-riskify-green focus:border-transparent"
                      />
                    </div>
                    <div>
                      <Label htmlFor="duration">Duration</Label>
                      <Input 
                        id="duration" 
                        value={formData.duration}
                        onChange={(e) => handleInputChange('duration', e.target.value)}
                        className="focus:ring-2 focus:ring-riskify-green focus:border-transparent"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="dateCreated">Date Created</Label>
                      <Input 
                        id="dateCreated" 
                        value={formData.dateCreated}
                        onChange={(e) => handleInputChange('dateCreated', e.target.value)}
                        className="focus:ring-2 focus:ring-riskify-green focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Personnel Information - shown on all tabs */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Personnel Information</h2>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="principalContractor">Principal Contractor</Label>
                      <Input 
                        id="principalContractor" 
                        value={formData.principalContractor}
                        onChange={(e) => handleInputChange('principalContractor', e.target.value)}
                        className="focus:ring-2 focus:ring-riskify-green focus:border-transparent"
                      />
                    </div>
                    <div>
                      <Label htmlFor="projectManager">Project Manager</Label>
                      <Input 
                        id="projectManager" 
                        value={formData.projectManager}
                        onChange={(e) => handleInputChange('projectManager', e.target.value)}
                        className="focus:ring-2 focus:ring-riskify-green focus:border-transparent"
                      />
                    </div>
                    <div>
                      <Label htmlFor="siteSupervisor">Site Supervisor</Label>
                      <Input 
                        id="siteSupervisor" 
                        value={formData.siteSupervisor}
                        onChange={(e) => handleInputChange('siteSupervisor', e.target.value)}
                        className="focus:ring-2 focus:ring-riskify-green focus:border-transparent"
                      />
                    </div>
                    <div>
                      <Label htmlFor="authorisingPerson">Authorising Person</Label>
                      <Input 
                        id="authorisingPerson" 
                        value={formData.authorisingPerson}
                        onChange={(e) => handleInputChange('authorisingPerson', e.target.value)}
                        className="focus:ring-2 focus:ring-riskify-green focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Tab-specific content */}
                <TabsContent value="project-info">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Scope of Works</h2>
                    <div>
                      <Label htmlFor="scopeOfWorks">Scope of Works</Label>
                      <Textarea 
                        id="scopeOfWorks" 
                        value={formData.scopeOfWorks}
                        onChange={(e) => handleInputChange('scopeOfWorks', e.target.value)}
                        className="focus:ring-2 focus:ring-riskify-green focus:border-transparent min-h-[150px]"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="emergency-info">
                  <EmergencyInfoPage formData={formData} updateFormData={updateFormData} />
                </TabsContent>

                <TabsContent value="high-risk-activities">
                  <HighRiskActivitiesPage formData={formData} updateFormData={updateFormData} />
                </TabsContent>

                <TabsContent value="risk-matrix">
                  <RiskMatrixPage formData={formData} updateFormData={updateFormData} />
                </TabsContent>

                <TabsContent value="work-activities">
                  <WorkActivitiesPage formData={formData} updateFormData={updateFormData} />
                </TabsContent>

                <TabsContent value="ppe">
                  <PpePage formData={formData} updateFormData={updateFormData} />
                </TabsContent>

                <TabsContent value="plant-equipment">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Plant & Equipment</h2>
                    <p className="text-gray-600">Plant and equipment management will be implemented here.</p>
                  </div>
                </TabsContent>

                <TabsContent value="sign-in">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Sign In Register</h2>
                    <p className="text-gray-600">Sign in register functionality will be implemented here.</p>
                  </div>
                </TabsContent>

                <TabsContent value="msds">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">MSDS Documents</h2>
                    <p className="text-gray-600">MSDS document management will be implemented here.</p>
                  </div>
                </TabsContent>
              </Tabs>

              {/* PDF Generation Buttons */}
              <div className="mt-8 space-y-4">
                <div className="flex space-x-2">
                  <Button className="bg-riskify-green hover:bg-riskify-green-dark text-white">
                    Print PDF
                  </Button>
                  <Button variant="outline" className="border-riskify-green text-riskify-green hover:bg-riskify-green hover:text-white">
                    Download PDF
                  </Button>
                  <Button variant="outline" className="border-riskify-green text-riskify-green hover:bg-riskify-green hover:text-white">
                    Vector PDF
                  </Button>
                  <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                    Final PDF
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Document Preview Panel */}
          <div className="w-full lg:w-1/2 bg-white">
            <div className="p-6 lg:p-8 overflow-auto">
              <DocumentPreview 
                formData={formData} 
                currentPage={currentPage}
                currentWorkActivitiesPageIndex={currentWorkActivitiesPageIndex}
                currentSignInPageIndex={currentSignInPageIndex}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}