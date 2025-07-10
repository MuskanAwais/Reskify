import React, { useState } from "react";
import type { SwmsFormData } from "@shared/schema";
import { defaultSwmsData } from "@shared/schema";
import riskifyLogo from '@assets/slogan-6_1750823980552_1752049795839.png';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { PDFDocument } from 'pdf-lib';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, pdf as reactPdf, Image } from '@react-pdf/renderer';
import RiskBadgeNew from "./RiskBadgeNew";

type DocumentPage = 'project-info' | 'emergency-info' | 'high-risk-activities' | 'risk-matrix' | 'work-activities' | 'ppe' | 'plant-equipment' | 'msds' | 'sign-in';

interface SwmsCompleteProps {
  initialData?: SwmsFormData;
}

export default function SwmsComplete({ initialData }: SwmsCompleteProps) {
  const [formData, setFormData] = useState<SwmsFormData>(initialData || defaultSwmsData);
  const [currentPage, setCurrentPage] = useState<DocumentPage>('project-info');
  const [currentWorkActivitiesPageIndex, setCurrentWorkActivitiesPageIndex] = useState(0);
  const [currentSignInPageIndex, setCurrentSignInPageIndex] = useState(0);

  const handleInputChange = (field: keyof SwmsFormData, value: string) => {
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

  const handlePrintPDF = async () => {
    try {
      console.log('Starting browser print PDF generation...');
      
      // Store current page to restore later
      const originalPage = currentPage;
      
      // Create PDF with A4 landscape dimensions and maximum quality
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
        compress: false, // Disable compression for maximum quality
        precision: 16 // High precision for better quality
      });
      
      const pageNames = ['project-info', 'emergency-info', 'high-risk-activities', 'risk-matrix', 'work-activities', 'ppe', 'plant-equipment', 'sign-in', 'msds'] as const;
      
      for (let i = 0; i < pageNames.length; i++) {
        const pageName = pageNames[i];
        console.log(`Capturing page ${i + 1}: ${pageName}`);
        
        // Switch to the page
        setCurrentPage(pageName);
        
        // Wait for React to render
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Ensure all fonts are loaded before capture
        try {
          await document.fonts.ready;
        } catch (e) {
          // Fallback if fonts.ready fails
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        // Wait for the page content to render
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Find the actual document preview container - it's in the right panel
        let previewElement = document.querySelector('.w-2\\/3 .p-6 > div') as HTMLElement;
        
        if (!previewElement) {
          // Try alternative selectors for the document container
          previewElement = document.querySelector('.w-2\\/3 > div > div') as HTMLElement ||
                          document.querySelector('.overflow-auto > div > div') as HTMLElement ||
                          document.querySelector('[style*="A4"]') as HTMLElement;
        }
        
        // Debug: log what we found
        console.log(`Capturing page ${i + 1}: ${pageName}`);
        console.log('Preview element found:', previewElement?.tagName || 'none');
        console.log('Element classes:', previewElement?.className || 'none');
        console.log('Element dimensions:', previewElement?.offsetWidth || 0, 'x', previewElement?.offsetHeight || 0);
        console.log('Element has content:', previewElement?.innerHTML?.length > 100 || false);
        
        if (!previewElement || previewElement.offsetWidth === 0 || previewElement.offsetHeight === 0) {
          console.error(`Could not find valid preview element for page: ${pageName}`);
          continue;
        }
        
        // Capture the page
        const canvas = await html2canvas(previewElement, {
          scale: 2,
          useCORS: true,
          allowTaint: false,
          backgroundColor: '#ffffff',
          logging: false,
          width: previewElement.offsetWidth,
          height: previewElement.offsetHeight
        });
        
        // Add page to PDF
        if (i > 0) {
          pdf.addPage();
        }
        
        // Calculate dimensions to fit A4 landscape
        const imgWidth = 297; // A4 width in mm
        const imgHeight = 210; // A4 height in mm
        
        const imgData = canvas.toDataURL('image/png', 1.0);
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        
        console.log(`Page ${i + 1} captured successfully`);
      }
      
      // Restore original page
      setCurrentPage(originalPage);
      
      // Save PDF
      const pdfBlob = pdf.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `swms-${formData.projectName || 'document'}.pdf`;
      a.click();
      
      URL.revokeObjectURL(url);
      
      console.log('PDF generated successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const generatePdf = async () => {
    try {
      const doc = <PDFDocumentComponent formData={formData} />;
      const pdfBlob = await reactPdf(doc).toBlob();
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `swms-${formData.projectName || 'document'}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const handleFinalPDF = async () => {
    try {
      console.log('Starting final PDF generation...');
      
      const doc = <PDFDocumentComponent formData={formData} />;
      const pdfBlob = await reactPdf(doc).toBlob();
      
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `swms-${formData.projectName || 'document'}.pdf`;
      a.click();
      
      URL.revokeObjectURL(url);
      
      console.log('Final PDF generated successfully');
    } catch (error) {
      console.error('Error generating final PDF:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Panel - Controls */}
      <div className="w-1/3 bg-white p-6 shadow-lg">
        <div className="space-y-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <img src={riskifyLogo} alt="Riskify" className="h-8" />
              <h1 className="text-2xl font-bold text-gray-900">SWMS Generator</h1>
            </div>
            <p className="text-gray-600">Edit your SWMS document and preview in real-time</p>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex flex-wrap gap-2">
              <button
                onClick={() => setCurrentPage('project-info')}
                className={`px-3 py-2 text-sm font-medium rounded-t-lg ${
                  currentPage === 'project-info' 
                    ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-600' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                Project Information
              </button>
              <button
                onClick={() => setCurrentPage('emergency-info')}
                className={`px-3 py-2 text-sm font-medium rounded-t-lg ${
                  currentPage === 'emergency-info' 
                    ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-600' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                Emergency Info
              </button>
              <button
                onClick={() => setCurrentPage('high-risk-activities')}
                className={`px-3 py-2 text-sm font-medium rounded-t-lg ${
                  currentPage === 'high-risk-activities' 
                    ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-600' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                High Risk Activities
              </button>
              <button
                onClick={() => setCurrentPage('risk-matrix')}
                className={`px-3 py-2 text-sm font-medium rounded-t-lg ${
                  currentPage === 'risk-matrix' 
                    ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-600' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                Risk Matrix
              </button>
              <button
                onClick={() => setCurrentPage('work-activities')}
                className={`px-3 py-2 text-sm font-medium rounded-t-lg ${
                  currentPage === 'work-activities' 
                    ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-600' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                Work Activities
              </button>
              <button
                onClick={() => setCurrentPage('ppe')}
                className={`px-3 py-2 text-sm font-medium rounded-t-lg ${
                  currentPage === 'ppe' 
                    ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-600' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                PPE
              </button>
              <button
                onClick={() => setCurrentPage('plant-equipment')}
                className={`px-3 py-2 text-sm font-medium rounded-t-lg ${
                  currentPage === 'plant-equipment' 
                    ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-600' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                Plant & Equipment
              </button>
              <button
                onClick={() => setCurrentPage('sign-in')}
                className={`px-3 py-2 text-sm font-medium rounded-t-lg ${
                  currentPage === 'sign-in' 
                    ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-600' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                Sign In Register
              </button>
              <button
                onClick={() => setCurrentPage('msds')}
                className={`px-3 py-2 text-sm font-medium rounded-t-lg ${
                  currentPage === 'msds' 
                    ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-600' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                MSDS
              </button>
            </nav>
          </div>

          {/* PDF Generation Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handlePrintPDF}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Print PDF
            </button>
            <button
              onClick={generatePdf}
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Download PDF
            </button>
            <button
              onClick={handleFinalPDF}
              className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Final PDF
            </button>
          </div>

          {/* Form Content */}
          <div className="space-y-4">
            {currentPage === 'project-info' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Project Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Project Name
                    </label>
                    <input
                      type="text"
                      value={formData.projectName}
                      onChange={(e) => handleInputChange('projectName', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Project Number
                    </label>
                    <input
                      type="text"
                      value={formData.projectNumber}
                      onChange={(e) => handleInputChange('projectNumber', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Project Address
                    </label>
                    <input
                      type="text"
                      value={formData.projectAddress}
                      onChange={(e) => handleInputChange('projectAddress', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Project Manager
                    </label>
                    <input
                      type="text"
                      value={formData.projectManager}
                      onChange={(e) => handleInputChange('projectManager', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Site Supervisor
                    </label>
                    <input
                      type="text"
                      value={formData.siteSupervisor}
                      onChange={(e) => handleInputChange('siteSupervisor', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentPage === 'emergency-info' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Emergency Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Emergency Contact
                    </label>
                    <input
                      type="text"
                      value={formData.emergencyContact}
                      onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Emergency Phone
                    </label>
                    <input
                      type="text"
                      value={formData.emergencyPhone}
                      onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentPage === 'high-risk-activities' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">High Risk Activities</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'Work at Heights',
                    'Confined Spaces',
                    'Hot Work',
                    'Electrical Work',
                    'Excavation',
                    'Crane Operations',
                    'Demolition',
                    'Hazardous Chemicals'
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`activity-${index}`}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor={`activity-${index}`} className="text-sm text-gray-700">
                        {activity}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentPage === 'risk-matrix' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Risk Matrix</h3>
                <div className="text-center">
                  <p className="text-gray-600">Risk assessment matrix configuration</p>
                </div>
              </div>
            )}

            {currentPage === 'work-activities' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Work Activities</h3>
                <div className="space-y-3">
                  {formData.workActivities.map((activity, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{activity.activity}</h4>
                        <RiskBadgeNew risk={activity.residualRisk} />
                      </div>
                      <p className="text-sm text-gray-600">{activity.hazards[0]?.hazard}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentPage === 'ppe' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Personal Protective Equipment</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'Safety Helmet',
                    'Safety Glasses',
                    'High-Vis Vest',
                    'Safety Boots',
                    'Gloves',
                    'Hearing Protection',
                    'Respirator',
                    'Fall Arrest Harness'
                  ].map((ppe, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`ppe-${index}`}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor={`ppe-${index}`} className="text-sm text-gray-700">
                        {ppe}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentPage === 'plant-equipment' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Plant & Equipment</h3>
                <div className="space-y-3">
                  {formData.plantEquipment.map((equipment, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{equipment.item}</h4>
                        <RiskBadgeNew risk={equipment.riskLevel} />
                      </div>
                      <p className="text-sm text-gray-600">{equipment.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentPage === 'sign-in' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Sign In Register</h3>
                <div className="text-center">
                  <p className="text-gray-600">Personnel sign-in management</p>
                </div>
              </div>
            )}

            {currentPage === 'msds' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Material Safety Data Sheets</h3>
                <div className="space-y-3">
                  {formData.msdsRegister.map((msds, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-3">
                      <h4 className="font-medium text-gray-900">{msds.product}</h4>
                      <p className="text-sm text-gray-600">{msds.supplier}</p>
                      <p className="text-sm text-gray-500">{msds.hazardClass}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Panel - Preview */}
      <div className="w-2/3 bg-gray-100 p-6 overflow-auto">
        <div className="bg-white rounded-lg shadow-lg p-6" style={{ width: '1123px', height: '794px' }}>
          <DocumentPreview formData={formData} currentPage={currentPage} />
        </div>
      </div>
    </div>
  );
}

// PDF Document Component
const PDFDocumentComponent: React.FC<{ formData: SwmsFormData }> = ({ formData }) => (
  <Document>
    <Page size="A4" orientation="landscape" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Safe Work Method Statement</Text>
        <Text style={styles.subtitle}>Project: {formData.projectName}</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Project Information</Text>
        <Text>Project Number: {formData.projectNumber}</Text>
        <Text>Project Address: {formData.projectAddress}</Text>
        <Text>Project Manager: {formData.projectManager}</Text>
        <Text>Site Supervisor: {formData.siteSupervisor}</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Work Activities</Text>
        {formData.workActivities.map((activity, index) => (
          <View key={index} style={styles.activityItem}>
            <Text style={styles.activityTitle}>{activity.activity}</Text>
            <Text>Risk Level: {activity.residualRisk}</Text>
            {activity.hazards.map((hazard, hIndex) => (
              <Text key={hIndex} style={styles.hazardText}>
                • {hazard.hazard}
              </Text>
            ))}
          </View>
        ))}
      </View>
    </Page>
  </Document>
);

// Document Preview Component
const DocumentPreview: React.FC<{ formData: SwmsFormData; currentPage: DocumentPage }> = ({ formData, currentPage }) => {
  const renderPage = () => {
    switch (currentPage) {
      case 'project-info':
        return (
          <div className="bg-white p-6 min-h-full" style={{ fontFamily: 'Inter, sans-serif' }}>
            {/* Header */}
            <div className="text-center mb-6">
              <img src={riskifyLogo} alt="Riskify" className="mx-auto mb-4 h-12" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">SAFE WORK METHOD STATEMENT</h1>
              <div className="text-gray-600 text-base">Project Information</div>
            </div>
            
            {/* Project Details Table */}
            <div className="mb-6">
              <table className="w-full border-collapse border border-gray-400">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-400 p-2 text-left font-semibold text-sm">Project Details</th>
                    <th className="border border-gray-400 p-2 text-left font-semibold text-sm">Information</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-400 p-2 font-medium text-sm">Project Name</td>
                    <td className="border border-gray-400 p-2 text-sm">{formData.projectName || 'Not specified'}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 p-2 font-medium text-sm">Project Number</td>
                    <td className="border border-gray-400 p-2 text-sm">{formData.projectNumber || 'Not specified'}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 p-2 font-medium text-sm">Project Address</td>
                    <td className="border border-gray-400 p-2 text-sm">{formData.projectAddress || 'Not specified'}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 p-2 font-medium text-sm">Start Date</td>
                    <td className="border border-gray-400 p-2 text-sm">{formData.startDate || 'Not specified'}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 p-2 font-medium text-sm">Duration</td>
                    <td className="border border-gray-400 p-2 text-sm">{formData.duration || 'Not specified'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            {/* Personnel Table */}
            <div>
              <table className="w-full border-collapse border border-gray-400">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-400 p-2 text-left font-semibold text-sm">Personnel</th>
                    <th className="border border-gray-400 p-2 text-left font-semibold text-sm">Name</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-400 p-2 font-medium text-sm">Principal Contractor</td>
                    <td className="border border-gray-400 p-2 text-sm">{formData.principalContractor || 'Not specified'}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 p-2 font-medium text-sm">Project Manager</td>
                    <td className="border border-gray-400 p-2 text-sm">{formData.projectManager || 'Not specified'}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 p-2 font-medium text-sm">Site Supervisor</td>
                    <td className="border border-gray-400 p-2 text-sm">{formData.siteSupervisor || 'Not specified'}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 p-2 font-medium text-sm">Emergency Contact</td>
                    <td className="border border-gray-400 p-2 text-sm">{formData.emergencyContact || 'Not specified'}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 p-2 font-medium text-sm">Emergency Phone</td>
                    <td className="border border-gray-400 p-2 text-sm">{formData.emergencyPhone || 'Not specified'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );
        
      case 'work-activities':
        return (
          <div className="bg-white p-6 min-h-full" style={{ fontFamily: 'Inter, sans-serif' }}>
            {/* Header */}
            <div className="text-center mb-6">
              <img src={riskifyLogo} alt="Riskify" className="mx-auto mb-4 h-12" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">WORK ACTIVITIES</h1>
              <div className="text-gray-600 text-base">Risk Assessment & Control Measures</div>
            </div>
            
            {/* Activities Table */}
            <table className="w-full border-collapse border border-gray-400">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-400 p-2 text-left font-semibold text-sm w-1/4">Activity</th>
                  <th className="border border-gray-400 p-2 text-left font-semibold text-sm w-1/4">Hazards</th>
                  <th className="border border-gray-400 p-2 text-left font-semibold text-sm w-1/4">Control Measures</th>
                  <th className="border border-gray-400 p-2 text-left font-semibold text-sm w-1/6">Risk Level</th>
                </tr>
              </thead>
              <tbody>
                {formData.workActivities.map((activity, index) => (
                  <tr key={index} className="align-top">
                    <td className="border border-gray-400 p-2 font-medium text-sm">{activity.activity}</td>
                    <td className="border border-gray-400 p-2 text-sm">
                      <ul className="list-disc pl-3 space-y-1">
                        {activity.hazards?.map((hazard, hIndex) => (
                          <li key={hIndex} className="text-xs">{hazard.hazard}</li>
                        ))}
                      </ul>
                    </td>
                    <td className="border border-gray-400 p-2 text-sm">
                      <ul className="list-disc pl-3 space-y-1">
                        {activity.controlMeasures?.map((measure, mIndex) => (
                          <li key={mIndex} className="text-xs">
                            {typeof measure === 'string' ? measure : measure.measure}
                          </li>
                        )) || []}
                      </ul>
                    </td>
                    <td className="border border-gray-400 p-2 text-center">
                      <RiskBadgeNew risk={activity.residualRisk} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        
      case 'ppe':
        return (
          <div className="bg-white p-6 min-h-full" style={{ fontFamily: 'Inter, sans-serif' }}>
            {/* Header */}
            <div className="text-center mb-6">
              <img src={riskifyLogo} alt="Riskify" className="mx-auto mb-4 h-12" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">PERSONAL PROTECTIVE EQUIPMENT</h1>
              <div className="text-gray-600 text-base">Required Safety Equipment</div>
            </div>
            
            {/* PPE Table */}
            <table className="w-full border-collapse border border-gray-400">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-400 p-2 text-left font-semibold text-sm">PPE Item</th>
                  <th className="border border-gray-400 p-2 text-left font-semibold text-sm">Description</th>
                  <th className="border border-gray-400 p-2 text-left font-semibold text-sm">Standard</th>
                  <th className="border border-gray-400 p-2 text-left font-semibold text-sm">Required</th>
                </tr>
              </thead>
              <tbody>
                {formData.ppeRequirements.map((ppe, index) => (
                  <tr key={index} className="align-top">
                    <td className="border border-gray-400 p-2 font-medium text-sm">{ppe.item}</td>
                    <td className="border border-gray-400 p-2 text-sm">{ppe.description}</td>
                    <td className="border border-gray-400 p-2 text-xs">{ppe.standard}</td>
                    <td className="border border-gray-400 p-2 text-center">
                      <span className={`px-2 py-1 text-xs rounded ${
                        ppe.selected ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {ppe.selected ? 'Required' : 'Optional'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        
      case 'plant-equipment':
        return (
          <div className="bg-white p-6 min-h-full" style={{ fontFamily: 'Inter, sans-serif' }}>
            {/* Header */}
            <div className="text-center mb-6">
              <img src={riskifyLogo} alt="Riskify" className="mx-auto mb-4 h-12" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">PLANT & EQUIPMENT</h1>
              <div className="text-gray-600 text-base">Equipment Register & Inspection</div>
            </div>
            
            {/* Equipment Table */}
            <table className="w-full border-collapse border border-gray-400">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-400 p-2 text-left font-semibold text-sm">Equipment</th>
                  <th className="border border-gray-400 p-2 text-left font-semibold text-sm">Description</th>
                  <th className="border border-gray-400 p-2 text-left font-semibold text-sm">Inspection</th>
                  <th className="border border-gray-400 p-2 text-left font-semibold text-sm">Risk Level</th>
                </tr>
              </thead>
              <tbody>
                {formData.plantEquipment.map((equipment, index) => (
                  <tr key={index} className="align-top">
                    <td className="border border-gray-400 p-2 font-medium text-sm">{equipment.item}</td>
                    <td className="border border-gray-400 p-2 text-sm">{equipment.description}</td>
                    <td className="border border-gray-400 p-2 text-xs">{equipment.inspection}</td>
                    <td className="border border-gray-400 p-2 text-center">
                      <RiskBadgeNew risk={equipment.riskLevel} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        
      case 'sign-in':
        return (
          <div className="bg-white p-6 min-h-full" style={{ fontFamily: 'Inter, sans-serif' }}>
            {/* Header */}
            <div className="text-center mb-6">
              <img src={riskifyLogo} alt="Riskify" className="mx-auto mb-4 h-12" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">SIGN IN REGISTER</h1>
              <div className="text-gray-600 text-base">Personnel Attendance & Acknowledgment</div>
            </div>
            
            {/* Sign In Table */}
            <table className="w-full border-collapse border border-gray-400">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-400 p-2 text-left font-semibold text-sm">Name</th>
                  <th className="border border-gray-400 p-2 text-left font-semibold text-sm">Company</th>
                  <th className="border border-gray-400 p-2 text-left font-semibold text-sm">Position</th>
                  <th className="border border-gray-400 p-2 text-left font-semibold text-sm">Date</th>
                  <th className="border border-gray-400 p-2 text-left font-semibold text-sm">Signature</th>
                </tr>
              </thead>
              <tbody>
                {formData.signInRegister?.map((person, index) => (
                  <tr key={index}>
                    <td className="border border-gray-400 p-2 text-sm">{person.name}</td>
                    <td className="border border-gray-400 p-2 text-sm">{person.company}</td>
                    <td className="border border-gray-400 p-2 text-sm">{person.position}</td>
                    <td className="border border-gray-400 p-2 text-sm">{person.timeIn}</td>
                    <td className="border border-gray-400 p-2 text-sm">{person.signature}</td>
                  </tr>
                )) || 
                // Empty rows for manual sign-in
                Array.from({ length: 15 }).map((_, index) => (
                  <tr key={index}>
                    <td className="border border-gray-400 p-2 h-8 text-sm">&nbsp;</td>
                    <td className="border border-gray-400 p-2 text-sm">&nbsp;</td>
                    <td className="border border-gray-400 p-2 text-sm">&nbsp;</td>
                    <td className="border border-gray-400 p-2 text-sm">&nbsp;</td>
                    <td className="border border-gray-400 p-2 text-sm">&nbsp;</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        
      case 'msds':
        return (
          <div className="bg-white p-6 min-h-full" style={{ fontFamily: 'Inter, sans-serif' }}>
            {/* Header */}
            <div className="text-center mb-6">
              <img src={riskifyLogo} alt="Riskify" className="mx-auto mb-4 h-12" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">MATERIAL SAFETY DATA SHEETS</h1>
              <div className="text-gray-600 text-base">Chemical & Hazardous Materials</div>
            </div>
            
            {/* MSDS Table */}
            <table className="w-full border-collapse border border-gray-400">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-400 p-2 text-left font-semibold text-sm">Product</th>
                  <th className="border border-gray-400 p-2 text-left font-semibold text-sm">Supplier</th>
                  <th className="border border-gray-400 p-2 text-left font-semibold text-sm">Hazard Class</th>
                  <th className="border border-gray-400 p-2 text-left font-semibold text-sm">Storage</th>
                  <th className="border border-gray-400 p-2 text-left font-semibold text-sm">MSDS Location</th>
                </tr>
              </thead>
              <tbody>
                {formData.msdsRegister?.map((msds, index) => (
                  <tr key={index} className="align-top">
                    <td className="border border-gray-400 p-2 font-medium text-sm">{msds.product}</td>
                    <td className="border border-gray-400 p-2 text-sm">{msds.supplier}</td>
                    <td className="border border-gray-400 p-2 text-center">
                      <span className="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-800">
                        {msds.hazardClass}
                      </span>
                    </td>
                    <td className="border border-gray-400 p-2 text-sm">{msds.storageRequirements}</td>
                    <td className="border border-gray-400 p-2 text-sm">{msds.msdsLocation}</td>
                  </tr>
                )) || 
                // Empty rows for manual entry
                Array.from({ length: 10 }).map((_, index) => (
                  <tr key={index}>
                    <td className="border border-gray-400 p-2 h-8 text-sm">&nbsp;</td>
                    <td className="border border-gray-400 p-2 text-sm">&nbsp;</td>
                    <td className="border border-gray-400 p-2 text-sm">&nbsp;</td>
                    <td className="border border-gray-400 p-2 text-sm">&nbsp;</td>
                    <td className="border border-gray-400 p-2 text-sm">&nbsp;</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        
      default:
        return (
          <div className="bg-white p-6 min-h-full text-center py-12" style={{ fontFamily: 'Inter, sans-serif' }}>
            <img src={riskifyLogo} alt="Riskify" className="mx-auto mb-4 h-12" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">SAFE WORK METHOD STATEMENT</h1>
            <p className="text-gray-600">Select a tab to view document content</p>
          </div>
        );
    }
  };
  
  return (
    <div className="h-full overflow-auto">
      {renderPage()}
    </div>
  );
};

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 20,
  },
  header: {
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#000000',
    borderBottomStyle: 'solid',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666666',
  },
  content: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000000',
  },
  activityItem: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 5,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  hazardText: {
    fontSize: 12,
    marginLeft: 10,
    marginBottom: 3,
  },
});