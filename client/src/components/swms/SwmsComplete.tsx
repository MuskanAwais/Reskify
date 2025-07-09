import React, { useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { pdf, Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { RiskBadgeNew } from './RiskBadgeNew';

type DocumentPage = 'project-info' | 'emergency-info' | 'high-risk-activities' | 'risk-matrix' | 'work-activities' | 'ppe' | 'plant-equipment' | 'sign-in' | 'msds';

// Riskify Logo as inline SVG
const RiskifyLogo = () => (
  <svg width="86" height="86" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="10" fill="#2c5530"/>
    <text x="50" y="35" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">RISKIFY</text>
    <text x="50" y="55" textAnchor="middle" fill="white" fontSize="8">CONSTRUCTION</text>
    <text x="50" y="70" textAnchor="middle" fill="white" fontSize="8">SAFETY</text>
  </svg>
);

// Default form data
const defaultFormData = {
  // Project Information
  companyName: 'Riskify Construction',
  projectName: 'Test Project Name',
  projectNumber: 'PRJ-2025-001',
  projectAddress: '123 Construction Site, Sydney NSW 2000',
  jobName: 'Commercial Building Construction',
  jobNumber: 'JOB-2025-001',
  startDate: '2025-01-15',
  duration: '6 months',
  dateCreated: new Date().toISOString().split('T')[0],
  principalContractor: 'Riskify Construction Pty Ltd',
  projectManager: 'John Smith',
  siteSupervisor: 'Mike Johnson',
  authorisingPerson: 'Sarah Williams',
  authorisingPosition: 'Project Manager',
  authorisingSignature: 'Sarah Williams',
  scopeOfWorks: 'Construction of a 5-story commercial building including excavation, foundation work, structural steel erection, concrete work, and building envelope installation.',
  companyLogo: null,

  // Emergency Information
  emergencyContacts: [
    { name: 'Emergency Services', phone: '000' },
    { name: 'Site Supervisor', phone: '0412 345 678' },
    { name: 'Project Manager', phone: '0423 456 789' }
  ],
  nearestHospital: 'Sydney Hospital',
  hospitalPhone: '(02) 9382 7111',
  emergencyProcedures: 'In case of emergency, immediately call 000 and notify site supervisor. Evacuate personnel to designated assembly point. Provide first aid if qualified. Do not move seriously injured persons unless in immediate danger.',
  emergencyMonitoring: 'Regular safety meetings will be held weekly. Emergency procedures will be reviewed monthly. All personnel must be inducted and familiar with emergency procedures.',

  // High Risk Activities
  highRiskActivities: [
    { id: '1', title: 'Working at Heights', description: 'Any work performed at height above 2 meters', selected: true, riskLevel: 'high' },
    { id: '2', title: 'Excavation Work', description: 'Excavation deeper than 1.5 meters', selected: true, riskLevel: 'high' },
    { id: '3', title: 'Crane Operations', description: 'Operation of mobile or tower cranes', selected: true, riskLevel: 'medium' },
    { id: '4', title: 'Hot Work', description: 'Welding, cutting, grinding operations', selected: true, riskLevel: 'medium' },
    { id: '5', title: 'Confined Space Entry', description: 'Entry into confined spaces', selected: false, riskLevel: 'extreme' },
    { id: '6', title: 'Electrical Work', description: 'Electrical installation and maintenance', selected: true, riskLevel: 'medium' }
  ],

  // Work Activities
  workActivities: [
    {
      id: '1',
      activity: 'Site Preparation and Excavation',
      hazards: ['Underground services', 'Unstable ground', 'Heavy machinery'],
      initialRisk: { level: 'high', score: 12 },
      controlMeasures: ['Dial before you dig', 'Soil testing', 'Proper excavation techniques', 'Exclusion zones'],
      residualRisk: { level: 'medium', score: 6 },
      legislation: ['WHS Act 2011', 'Construction Code']
    },
    {
      id: '2',
      activity: 'Foundation and Concrete Work',
      hazards: ['Chemical burns from concrete', 'Manual handling', 'Reinforcement hazards'],
      initialRisk: { level: 'medium', score: 8 },
      controlMeasures: ['PPE requirements', 'Mechanical lifting aids', 'Safe work procedures'],
      residualRisk: { level: 'low', score: 4 },
      legislation: ['WHS Act 2011', 'Australian Standards']
    },
    {
      id: '3',
      activity: 'Structural Steel Erection',
      hazards: ['Working at height', 'Falling objects', 'Crane operations'],
      initialRisk: { level: 'high', score: 15 },
      controlMeasures: ['Fall protection systems', 'Exclusion zones', 'Certified crane operators'],
      residualRisk: { level: 'medium', score: 6 },
      legislation: ['WHS Act 2011', 'AS 4100']
    }
  ],

  // PPE Items
  ppeItems: [
    { id: '1', name: 'Safety Helmet', description: 'Hard hat compliant with AS/NZS 1801', selected: true, required: true },
    { id: '2', name: 'Safety Boots', description: 'Steel-capped boots AS/NZS 2210', selected: true, required: true },
    { id: '3', name: 'Hi-Vis Vest', description: 'High visibility vest AS/NZS 4602', selected: true, required: true },
    { id: '4', name: 'Safety Glasses', description: 'Impact-resistant eye protection', selected: true, required: true },
    { id: '5', name: 'Work Gloves', description: 'Cut-resistant gloves AS/NZS 2161', selected: true, required: false },
    { id: '6', name: 'Hearing Protection', description: 'Earplugs or earmuffs AS/NZS 1270', selected: true, required: false },
    { id: '7', name: 'Respiratory Protection', description: 'Dust masks or respirators', selected: false, required: false },
    { id: '8', name: 'Fall Protection Harness', description: 'Full body harness AS/NZS 1891', selected: true, required: false }
  ],

  // Plant Equipment
  plantEquipment: [
    {
      id: '1',
      equipment: 'Excavator',
      model: 'CAT 320D',
      serialNumber: 'EXC001',
      riskLevel: 'high',
      nextInspection: '2025-02-15',
      certificationRequired: true,
      hazards: ['Crush injuries', 'Tip over', 'Underground services'],
      initialRisk: { level: 'high', score: 12 },
      controlMeasures: ['Certified operators only', 'Daily inspections', 'Exclusion zones'],
      residualRisk: { level: 'medium', score: 6 },
      legislation: ['WHS Act 2011', 'AS 2550']
    },
    {
      id: '2',
      equipment: 'Tower Crane',
      model: 'Liebherr 380 EC-B',
      serialNumber: 'TC001',
      riskLevel: 'extreme',
      nextInspection: '2025-01-20',
      certificationRequired: true,
      hazards: ['Falling objects', 'Structural failure', 'Electrical hazards'],
      initialRisk: { level: 'extreme', score: 20 },
      controlMeasures: ['Licensed operators', 'Regular inspections', 'Load charts', 'Exclusion zones'],
      residualRisk: { level: 'medium', score: 8 },
      legislation: ['WHS Act 2011', 'AS 2550.1']
    }
  ],

  // Sign In Entries
  signInEntries: [],

  // MSDS Documents
  msdsDocuments: []
};

export default function SwmsComplete() {
  const [formData, setFormData] = useState(defaultFormData);
  const [currentPage, setCurrentPage] = useState<DocumentPage>('project-info');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Handle input changes
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // React-PDF Styles
  const styles = StyleSheet.create({
    page: {
      flexDirection: 'column',
      backgroundColor: '#ffffff',
      padding: 40,
      fontFamily: 'Helvetica',
      fontSize: 11,
      lineHeight: 1.4,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 40,
    },
    logo: {
      width: 86,
      height: 'auto',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#1f2937',
    },
    companyInfo: {
      fontSize: 13,
      color: '#6b7280',
      marginBottom: 2,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#1f2937',
      marginBottom: 16,
    },
    gridContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 16,
    },
    gridItem: {
      width: '48%',
      marginBottom: 8,
      fontSize: 11,
    },
    table: {
      width: '100%',
      borderStyle: 'solid',
      borderWidth: 1,
      borderColor: '#e5e7eb',
    },
    tableRow: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: '#e5e7eb',
    },
    tableHeader: {
      backgroundColor: '#f9fafb',
      color: '#1f2937',
      fontWeight: 'bold',
      fontSize: 10,
      padding: 8,
      textAlign: 'center',
    },
    tableCell: {
      padding: 8,
      fontSize: 10,
      textAlign: 'left',
    },
  });

  // PDF Export Functions
  const handlePrintPDF = async () => {
    try {
      setIsGeneratingPDF(true);
      console.log('Starting PNG-to-PDF export...');

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      const pages = [
        'project-info',
        'emergency-info', 
        'high-risk-activities',
        'risk-matrix',
        'work-activities',
        'ppe',
        'plant-equipment',
        'sign-in',
        'msds'
      ];

      let isFirstPage = true;

      for (const page of pages) {
        console.log(`Capturing page: ${page}`);
        setCurrentPage(page);
        
        // Wait for page to render
        await new Promise(resolve => setTimeout(resolve, 1000));

        const element = document.querySelector('.page-content');
        if (!element) {
          console.error('Page content element not found');
          continue;
        }

        try {
          const canvas = await html2canvas(element, {
            scale: 1.8,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            logging: false,
            imageTimeout: 0,
            removeContainer: true
          });

          const imgData = canvas.toDataURL('image/png', 0.85);
          
          if (!isFirstPage) {
            pdf.addPage();
          }
          
          const imgWidth = 297;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight, undefined, 'FAST');
          isFirstPage = false;
          
          console.log(`Page ${page} captured successfully`);
        } catch (pageError) {
          console.error(`Error capturing page ${page}:`, pageError);
        }
      }

      const projectName = formData.projectName?.replace(/[^a-zA-Z0-9]/g, '_') || 'Untitled_Project';
      pdf.save(`SWMS_${projectName}.pdf`);
      
      console.log('PDF generated successfully!');
      setCurrentPage('project-info');
      
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('PDF generation failed. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const exportVectorPdf = async () => {
    try {
      console.log('Starting vector PDF generation with React-PDF...');
      
      const SwmsDocument = () => (
        <Document>
          {/* Project Info Page */}
          <Page size="A4" orientation="landscape" style={styles.page}>
            <View style={styles.header}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={[styles.title, { marginLeft: 15 }]}>Safe Work Method Statement</Text>
              </View>
              <View>
                <Text style={styles.companyInfo}>{formData.companyName}</Text>
                <Text style={styles.companyInfo}>{formData.projectName}</Text>
                <Text style={styles.companyInfo}>{formData.projectNumber}</Text>
                <Text style={styles.companyInfo}>{formData.projectAddress}</Text>
              </View>
            </View>
            
            <Text style={styles.sectionTitle}>Project Information</Text>
            <View style={styles.gridContainer}>
              <Text style={styles.gridItem}>Job Name: {formData.jobName}</Text>
              <Text style={styles.gridItem}>Job Number: {formData.jobNumber}</Text>
              <Text style={styles.gridItem}>Start Date: {formData.startDate}</Text>
              <Text style={styles.gridItem}>Duration: {formData.duration}</Text>
              <Text style={styles.gridItem}>Date Created: {formData.dateCreated}</Text>
              <Text style={styles.gridItem}>Principal Contractor: {formData.principalContractor}</Text>
            </View>
          </Page>

          {/* Additional pages would be added here */}
        </Document>
      );

      // Generate the PDF
      const pdfBlob = await pdf(<SwmsDocument />).toBlob();
      
      // Create download link
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      
      const projectName = formData.projectName?.replace(/[^a-zA-Z0-9]/g, '_') || 'Untitled_Project';
      link.download = `SWMS_${projectName}.pdf`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log('Vector PDF generated successfully!');
      
    } catch (error) {
      console.error('Vector PDF export failed:', error);
      alert('Vector PDF export failed. Please try again.');
    }
  };

  // Project Info Page Render
  const renderProjectInfoPage = () => {
    return (
      <div 
        className="bg-white shadow-lg rounded-lg overflow-hidden page-content"
        style={{ 
          width: '297mm', 
          minHeight: '210mm',
          margin: '0 auto',
          position: 'relative'
        }}
      >
        {/* Content */}
        <div className="relative z-10 p-8">
          {/* Header */}
          <div className="page-header">
            <div className="flex items-center space-x-4">
              <RiskifyLogo />
              <div className="page-title">
                Safe Work Method Statement
              </div>
            </div>
            
            <div className="flex items-center space-x-8">
              <div className="company-info text-right">
                <div className="company-name">{formData.companyName}</div>
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
                  <div className="logo-placeholder" style={{ height: '86px', width: '120px' }}>
                    Company Logo
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Project Information Content */}
          <div className="grid grid-cols-1 gap-8">
            {/* Basic Project Info */}
            <div className="info-card">
              <h2>Project Information</h2>
              
              <div className="info-grid">
                <div className="info-grid-item">
                  <label>Job Name</label>
                  <div className="value">{formData.jobName}</div>
                </div>
                <div className="info-grid-item">
                  <label>Job Number</label>
                  <div className="value">{formData.jobNumber}</div>
                </div>
                <div className="info-grid-item">
                  <label>Start Date</label>
                  <div className="value">{formData.startDate}</div>
                </div>
                <div className="info-grid-item">
                  <label>Duration</label>
                  <div className="value">{formData.duration}</div>
                </div>
                <div className="info-grid-item">
                  <label>Date Created</label>
                  <div className="value">{formData.dateCreated}</div>
                </div>
                <div className="info-grid-item">
                  <label>Principal Contractor</label>
                  <div className="value">{formData.principalContractor}</div>
                </div>
                <div className="info-grid-item">
                  <label>Project Manager</label>
                  <div className="value">{formData.projectManager}</div>
                </div>
                <div className="info-grid-item">
                  <label>Site Supervisor</label>
                  <div className="value">{formData.siteSupervisor}</div>
                </div>
              </div>
            </div>

            {/* Scope of Works */}
            <div className="info-card">
              <h3>Scope of Works</h3>
              <div className="text-sm text-gray-700 leading-relaxed">
                {formData.scopeOfWorks}
              </div>
            </div>

            {/* Authorisation */}
            <div className="info-card">
              <h3>Authorisation</h3>
              <div className="info-grid">
                <div className="info-grid-item">
                  <label>Authorising Person</label>
                  <div className="value">{formData.authorisingPerson}</div>
                </div>
                <div className="info-grid-item">
                  <label>Position</label>
                  <div className="value">{formData.authorisingPosition}</div>
                </div>
                <div className="info-grid-item">
                  <label>Signature</label>
                  <div className="signature-field">{formData.authorisingSignature}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Emergency Info Page Render
  const renderEmergencyInfoPage = () => {
    return (
      <div className="bg-white shadow-lg rounded-lg overflow-hidden page-content"
        style={{ 
          width: '297mm', 
          minHeight: '210mm',
          margin: '0 auto',
          position: 'relative'
        }}
      >
        <div className="relative z-10 p-8">
          {/* Header */}
          <div className="page-header">
            <div className="flex items-center space-x-4">
              <RiskifyLogo />
              <div className="page-title">Emergency Information</div>
            </div>
            
            <div className="flex items-center space-x-8">
              <div className="company-info text-right">
                <div className="company-name">{formData.companyName}</div>
                <div>{formData.projectName}</div>
                <div>{formData.projectNumber}</div>
                <div>{formData.projectAddress}</div>
              </div>
            </div>
          </div>

          {/* Emergency Information Content */}
          <div className="grid grid-cols-1 gap-8">
            {/* Emergency Contacts */}
            <div className="info-card">
              <h2>Emergency Contacts</h2>
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left p-3 border-b">Contact</th>
                    <th className="text-left p-3 border-b">Phone Number</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.emergencyContacts.map((contact, index) => (
                    <tr key={index}>
                      <td className="p-3 border-b">{contact.name}</td>
                      <td className="p-3 border-b">{contact.phone}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Hospital Information */}
            <div className="info-card">
              <h3>Nearest Hospital</h3>
              <div className="info-grid">
                <div className="info-grid-item">
                  <label>Hospital Name</label>
                  <div className="value">{formData.nearestHospital}</div>
                </div>
                <div className="info-grid-item">
                  <label>Phone Number</label>
                  <div className="value">{formData.hospitalPhone}</div>
                </div>
              </div>
            </div>

            {/* Emergency Procedures */}
            <div className="info-card">
              <h3>Emergency Procedures</h3>
              <div className="text-sm text-gray-700 leading-relaxed mb-4">
                {formData.emergencyProcedures}
              </div>
              
              <h4 className="font-semibold mb-2">Monitoring and Review</h4>
              <div className="text-sm text-gray-700 leading-relaxed">
                {formData.emergencyMonitoring}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Risk Matrix Page Render
  const renderRiskMatrixPage = () => {
    const likelihoodLevels = ['Almost Certain', 'Likely', 'Possible', 'Unlikely', 'Rare'];
    const consequenceLevels = ['Insignificant', 'Minor', 'Moderate', 'Major', 'Catastrophic'];
    
    const getRiskLevel = (likelihood: number, consequence: number) => {
      const riskScore = likelihood + consequence;
      if (riskScore >= 8) return { level: 'extreme', color: '#dc2626' };
      if (riskScore >= 6) return { level: 'high', color: '#ea580c' };
      if (riskScore >= 4) return { level: 'medium', color: '#eab308' };
      return { level: 'low', color: '#22c55e' };
    };

    return (
      <div className="bg-white shadow-lg rounded-lg overflow-hidden page-content"
        style={{ 
          width: '297mm', 
          minHeight: '210mm',
          margin: '0 auto',
          position: 'relative'
        }}
      >
        <div className="relative z-10 p-8">
          {/* Header */}
          <div className="page-header">
            <div className="flex items-center space-x-4">
              <RiskifyLogo />
              <div className="page-title">Risk Assessment Matrix</div>
            </div>
            
            <div className="flex items-center space-x-8">
              <div className="company-info text-right">
                <div className="company-name">{formData.companyName}</div>
                <div>{formData.projectName}</div>
                <div>{formData.projectNumber}</div>
                <div>{formData.projectAddress}</div>
              </div>
            </div>
          </div>

          {/* Risk Matrix Content */}
          <div className="info-card">
            <h2>Risk Assessment Matrix</h2>
            
            <div className="risk-matrix-table">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr>
                    <th className="border border-gray-300 p-3 bg-gray-100">
                      Likelihood →<br />
                      Consequence ↓
                    </th>
                    {likelihoodLevels.map((level, index) => (
                      <th key={index} className="border border-gray-300 p-3 bg-gray-100 text-center">
                        {level}<br />
                        ({5 - index})
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {consequenceLevels.map((consequence, cIndex) => (
                    <tr key={cIndex}>
                      <td className="border border-gray-300 p-3 bg-gray-100 font-semibold text-center">
                        {consequence}<br />
                        ({5 - cIndex})
                      </td>
                      {likelihoodLevels.map((likelihood, lIndex) => {
                        const risk = getRiskLevel(5 - lIndex, 5 - cIndex);
                        return (
                          <td 
                            key={lIndex} 
                            className="border border-gray-300 p-3 text-center"
                            style={{ backgroundColor: risk.color }}
                          >
                            <div className="text-white font-bold">
                              {risk.level.toUpperCase()}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Risk Level Legend */}
            <div className="mt-8 grid grid-cols-4 gap-4">
              {[
                { level: 'extreme', color: '#dc2626', description: 'Immediate action required' },
                { level: 'high', color: '#ea580c', description: 'Senior management attention needed' },
                { level: 'medium', color: '#eab308', description: 'Management responsibility must be specified' },
                { level: 'low', color: '#22c55e', description: 'Manage by routine procedures' }
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div 
                    className="w-full h-12 rounded mb-2 flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: item.color }}
                  >
                    {item.level.toUpperCase()}
                  </div>
                  <div className="text-xs text-gray-600">{item.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Work Activities Page Render
  const renderWorkActivitiesPage = () => {
    return (
      <div className="bg-white shadow-lg rounded-lg overflow-hidden page-content"
        style={{ 
          width: '297mm', 
          minHeight: '210mm',
          margin: '0 auto',
          position: 'relative'
        }}
      >
        <div className="relative z-10 p-8">
          {/* Header */}
          <div className="page-header">
            <div className="flex items-center space-x-4">
              <RiskifyLogo />
              <div className="page-title">Work Activities</div>
            </div>
            
            <div className="flex items-center space-x-8">
              <div className="company-info text-right">
                <div className="company-name">{formData.companyName}</div>
                <div>{formData.projectName}</div>
                <div>{formData.projectNumber}</div>
                <div>{formData.projectAddress}</div>
              </div>
            </div>
          </div>

          {/* Work Activities Content */}
          <div className="info-card">
            <h2>Work Activities Risk Assessment</h2>
            
            <div className="work-activities-table">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left p-3 border-b">Activity</th>
                    <th className="text-left p-3 border-b">Hazards</th>
                    <th className="text-center p-3 border-b">Initial Risk</th>
                    <th className="text-left p-3 border-b">Control Measures</th>
                    <th className="text-center p-3 border-b">Residual Risk</th>
                    <th className="text-left p-3 border-b">Legislation</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.workActivities.map((activity, index) => (
                    <tr key={index}>
                      <td className="p-3 border-b font-medium">{activity.activity}</td>
                      <td className="p-3 border-b">
                        <ul className="list-disc list-inside text-sm">
                          {activity.hazards.map((hazard, hIndex) => (
                            <li key={hIndex}>{hazard}</li>
                          ))}
                        </ul>
                      </td>
                      <td className="p-3 border-b text-center">
                        <RiskBadgeNew level={activity.initialRisk.level} score={activity.initialRisk.score} />
                      </td>
                      <td className="p-3 border-b">
                        <ul className="list-disc list-inside text-sm">
                          {activity.controlMeasures.map((measure, mIndex) => (
                            <li key={mIndex}>{measure}</li>
                          ))}
                        </ul>
                      </td>
                      <td className="p-3 border-b text-center">
                        <RiskBadgeNew level={activity.residualRisk.level} score={activity.residualRisk.score} />
                      </td>
                      <td className="p-3 border-b">
                        <ul className="list-disc list-inside text-sm">
                          {activity.legislation.map((leg, lIndex) => (
                            <li key={lIndex}>{leg}</li>
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
    );
  };

  // PPE Page Render
  const renderPpePage = () => {
    return (
      <div className="bg-white shadow-lg rounded-lg overflow-hidden page-content"
        style={{ 
          width: '297mm', 
          minHeight: '210mm',
          margin: '0 auto',
          position: 'relative'
        }}
      >
        <div className="relative z-10 p-8">
          {/* Header */}
          <div className="page-header">
            <div className="flex items-center space-x-4">
              <RiskifyLogo />
              <div className="page-title">Personal Protective Equipment</div>
            </div>
            
            <div className="flex items-center space-x-8">
              <div className="company-info text-right">
                <div className="company-name">{formData.companyName}</div>
                <div>{formData.projectName}</div>
                <div>{formData.projectNumber}</div>
                <div>{formData.projectAddress}</div>
              </div>
            </div>
          </div>

          {/* PPE Content */}
          <div className="info-card">
            <h2>Personal Protective Equipment Requirements</h2>
            
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left p-3 border-b">PPE Item</th>
                  <th className="text-left p-3 border-b">Description/Standard</th>
                  <th className="text-center p-3 border-b">Required</th>
                  <th className="text-center p-3 border-b">Selected</th>
                </tr>
              </thead>
              <tbody>
                {formData.ppeItems.map((item, index) => (
                  <tr key={index}>
                    <td className="p-3 border-b font-medium">{item.name}</td>
                    <td className="p-3 border-b text-sm">{item.description}</td>
                    <td className="p-3 border-b text-center">
                      <span className={`px-2 py-1 rounded text-xs ${
                        item.required ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {item.required ? 'Required' : 'Optional'}
                      </span>
                    </td>
                    <td className="p-3 border-b text-center">
                      <span className={`px-2 py-1 rounded text-xs ${
                        item.selected ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {item.selected ? 'Yes' : 'No'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">PPE Requirements</h3>
              <div className="text-sm text-blue-800">
                <p className="mb-2">• All personnel must wear the required PPE items at all times while on site</p>
                <p className="mb-2">• PPE must be inspected before each use and replaced if damaged</p>
                <p className="mb-2">• Additional task-specific PPE may be required for certain activities</p>
                <p>• All PPE must comply with Australian/New Zealand Standards where applicable</p>
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
      <div className="bg-white shadow-lg rounded-lg overflow-hidden page-content"
        style={{ 
          width: '297mm', 
          minHeight: '210mm',
          margin: '0 auto',
          position: 'relative'
        }}
      >
        <div className="relative z-10 p-8">
          {/* Header */}
          <div className="page-header">
            <div className="flex items-center space-x-4">
              <RiskifyLogo />
              <div className="page-title">Plant & Equipment Register</div>
            </div>
            
            <div className="flex items-center space-x-8">
              <div className="company-info text-right">
                <div className="company-name">{formData.companyName}</div>
                <div>{formData.projectName}</div>
                <div>{formData.projectNumber}</div>
                <div>{formData.projectAddress}</div>
              </div>
            </div>
          </div>

          {/* Plant Equipment Content */}
          <div className="info-card">
            <h2>Plant & Equipment Risk Assessment</h2>
            
            <div className="plant-equipment-table">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left p-3 border-b">Equipment</th>
                    <th className="text-left p-3 border-b">Model/Serial</th>
                    <th className="text-center p-3 border-b">Risk Level</th>
                    <th className="text-center p-3 border-b">Next Inspection</th>
                    <th className="text-center p-3 border-b">Certification</th>
                    <th className="text-left p-3 border-b">Hazards</th>
                    <th className="text-left p-3 border-b">Control Measures</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.plantEquipment.map((equipment, index) => (
                    <tr key={index}>
                      <td className="p-3 border-b font-medium">{equipment.equipment}</td>
                      <td className="p-3 border-b text-sm">
                        <div>{equipment.model}</div>
                        <div className="text-gray-600">{equipment.serialNumber}</div>
                      </td>
                      <td className="p-3 border-b text-center">
                        <RiskBadgeNew level={equipment.riskLevel} score={equipment.initialRisk.score} />
                      </td>
                      <td className="p-3 border-b text-center text-sm">{equipment.nextInspection}</td>
                      <td className="p-3 border-b text-center">
                        <span className={`px-2 py-1 rounded text-xs ${
                          equipment.certificationRequired ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {equipment.certificationRequired ? 'Required' : 'Not Required'}
                        </span>
                      </td>
                      <td className="p-3 border-b">
                        <ul className="list-disc list-inside text-sm">
                          {equipment.hazards.map((hazard, hIndex) => (
                            <li key={hIndex}>{hazard}</li>
                          ))}
                        </ul>
                      </td>
                      <td className="p-3 border-b">
                        <ul className="list-disc list-inside text-sm">
                          {equipment.controlMeasures.map((measure, mIndex) => (
                            <li key={mIndex}>{measure}</li>
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
    );
  };

  // Sign In Page Render
  const renderSignInPage = () => {
    return (
      <div className="bg-white shadow-lg rounded-lg overflow-hidden page-content"
        style={{ 
          width: '297mm', 
          minHeight: '210mm',
          margin: '0 auto',
          position: 'relative'
        }}
      >
        <div className="relative z-10 p-8">
          {/* Header */}
          <div className="page-header">
            <div className="flex items-center space-x-4">
              <RiskifyLogo />
              <div className="page-title">Sign In Register</div>
            </div>
            
            <div className="flex items-center space-x-8">
              <div className="company-info text-right">
                <div className="company-name">{formData.companyName}</div>
                <div>{formData.projectName}</div>
                <div>{formData.projectNumber}</div>
                <div>{formData.projectAddress}</div>
              </div>
            </div>
          </div>

          {/* Sign In Content */}
          <div className="info-card">
            <h2>Personnel Sign In Register</h2>
            
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left p-3 border-b">Name</th>
                  <th className="text-left p-3 border-b">Company</th>
                  <th className="text-center p-3 border-b">Time In</th>
                  <th className="text-center p-3 border-b">Time Out</th>
                  <th className="text-center p-3 border-b">Signature</th>
                  <th className="text-left p-3 border-b">PPE Check</th>
                </tr>
              </thead>
              <tbody>
                {/* Create empty rows for sign in */}
                {Array.from({ length: 15 }).map((_, index) => (
                  <tr key={index}>
                    <td className="p-3 border-b h-12"></td>
                    <td className="p-3 border-b h-12"></td>
                    <td className="p-3 border-b h-12 text-center"></td>
                    <td className="p-3 border-b h-12 text-center"></td>
                    <td className="p-3 border-b h-12 text-center"></td>
                    <td className="p-3 border-b h-12"></td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
              <h3 className="font-semibold text-yellow-900 mb-2">Sign In Requirements</h3>
              <div className="text-sm text-yellow-800">
                <p className="mb-2">• All personnel must sign in and out daily</p>
                <p className="mb-2">• PPE must be checked and verified before entry</p>
                <p className="mb-2">• Visitors must be inducted before site access</p>
                <p>• Emergency evacuation procedures must be communicated to all personnel</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // MSDS Page Render
  const renderMsdsPage = () => {
    return (
      <div className="bg-white shadow-lg rounded-lg overflow-hidden page-content"
        style={{ 
          width: '297mm', 
          minHeight: '210mm',
          margin: '0 auto',
          position: 'relative'
        }}
      >
        <div className="relative z-10 p-8">
          {/* Header */}
          <div className="page-header">
            <div className="flex items-center space-x-4">
              <RiskifyLogo />
              <div className="page-title">Material Safety Data Sheets</div>
            </div>
            
            <div className="flex items-center space-x-8">
              <div className="company-info text-right">
                <div className="company-name">{formData.companyName}</div>
                <div>{formData.projectName}</div>
                <div>{formData.projectNumber}</div>
                <div>{formData.projectAddress}</div>
              </div>
            </div>
          </div>

          {/* MSDS Content */}
          <div className="info-card">
            <h2>Material Safety Data Sheets Register</h2>
            
            {formData.msdsDocuments.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left p-3 border-b">Document Name</th>
                    <th className="text-left p-3 border-b">Product</th>
                    <th className="text-center p-3 border-b">Date Added</th>
                    <th className="text-center p-3 border-b">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.msdsDocuments.map((doc, index) => (
                    <tr key={index}>
                      <td className="p-3 border-b font-medium">{doc.customTitle || doc.fileName}</td>
                      <td className="p-3 border-b">{doc.product || 'Not specified'}</td>
                      <td className="p-3 border-b text-center text-sm">{doc.dateAdded}</td>
                      <td className="p-3 border-b text-center">
                        <span className={`px-2 py-1 rounded text-xs ${
                          doc.selected ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {doc.selected ? 'Included' : 'Available'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg mb-2">No MSDS documents uploaded</p>
                <p className="text-sm">Upload relevant Material Safety Data Sheets for chemicals and hazardous materials used on site</p>
              </div>
            )}

            <div className="mt-6 p-4 bg-red-50 rounded-lg">
              <h3 className="font-semibold text-red-900 mb-2">MSDS Requirements</h3>
              <div className="text-sm text-red-800">
                <p className="mb-2">• MSDS must be available for all hazardous chemicals on site</p>
                <p className="mb-2">• Personnel must be trained on chemical hazards before use</p>
                <p className="mb-2">• MSDS must be current and accessible to all workers</p>
                <p>• Emergency procedures for chemical spills must be clearly posted</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render current page
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'project-info':
        return renderProjectInfoPage();
      case 'emergency-info':
        return renderEmergencyInfoPage();
      case 'high-risk-activities':
        return renderHighRiskActivitiesPage();
      case 'risk-matrix':
        return renderRiskMatrixPage();
      case 'work-activities':
        return renderWorkActivitiesPage();
      case 'ppe':
        return renderPpePage();
      case 'plant-equipment':
        return renderPlantEquipmentPage();
      case 'sign-in':
        return renderSignInPage();
      case 'msds':
        return renderMsdsPage();
      default:
        return renderProjectInfoPage();
    }
  };

  // High Risk Activities Page Render
  const renderHighRiskActivitiesPage = () => {
    return (
      <div className="bg-white shadow-lg rounded-lg overflow-hidden page-content"
        style={{ 
          width: '297mm', 
          minHeight: '210mm',
          margin: '0 auto',
          position: 'relative'
        }}
      >
        <div className="relative z-10 p-8">
          {/* Header */}
          <div className="page-header">
            <div className="flex items-center space-x-4">
              <RiskifyLogo />
              <div className="page-title">High Risk Construction Work</div>
            </div>
            
            <div className="flex items-center space-x-8">
              <div className="company-info text-right">
                <div className="company-name">{formData.companyName}</div>
                <div>{formData.projectName}</div>
                <div>{formData.projectNumber}</div>
                <div>{formData.projectAddress}</div>
              </div>
            </div>
          </div>

          {/* High Risk Activities Content */}
          <div className="info-card">
            <h2>High Risk Construction Work Activities</h2>
            
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left p-3 border-b">Activity</th>
                  <th className="text-left p-3 border-b">Description</th>
                  <th className="text-center p-3 border-b">Risk Level</th>
                  <th className="text-center p-3 border-b">Applicable</th>
                </tr>
              </thead>
              <tbody>
                {formData.highRiskActivities.map((activity, index) => (
                  <tr key={index}>
                    <td className="p-3 border-b font-medium">{activity.title}</td>
                    <td className="p-3 border-b text-sm">{activity.description}</td>
                    <td className="p-3 border-b text-center">
                      <RiskBadgeNew level={activity.riskLevel} score={activity.riskLevel === 'extreme' ? 20 : activity.riskLevel === 'high' ? 15 : activity.riskLevel === 'medium' ? 10 : 5} />
                    </td>
                    <td className="p-3 border-b text-center">
                      <span className={`px-2 py-1 rounded text-xs ${
                        activity.selected ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {activity.selected ? 'Yes' : 'No'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-6 p-4 bg-orange-50 rounded-lg">
              <h3 className="font-semibold text-orange-900 mb-2">High Risk Construction Work Requirements</h3>
              <div className="text-sm text-orange-800">
                <p className="mb-2">• All high risk construction work must be identified and assessed</p>
                <p className="mb-2">• Additional safety measures and controls must be implemented</p>
                <p className="mb-2">• Competent persons must supervise high risk activities</p>
                <p>• Regular monitoring and review of high risk work is required</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Main render
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* LEFT SIDEBAR - Form Panel (1/3 width) */}
      <div className="w-1/3 bg-white p-8 overflow-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">SWMS Generator</h1>
        
        {/* 9 TAB NAVIGATION BUTTONS */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {/* 9 Navigation Tabs */}
            <button 
              onClick={() => setCurrentPage('project-info')}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                currentPage === 'project-info' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Project Information
            </button>
            <button 
              onClick={() => setCurrentPage('emergency-info')}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                currentPage === 'emergency-info' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Emergency Info
            </button>
            <button 
              onClick={() => setCurrentPage('high-risk-activities')}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                currentPage === 'high-risk-activities' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              High Risk
            </button>
            <button 
              onClick={() => setCurrentPage('risk-matrix')}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                currentPage === 'risk-matrix' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Risk Matrix
            </button>
            <button 
              onClick={() => setCurrentPage('work-activities')}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                currentPage === 'work-activities' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Work Activities
            </button>
            <button 
              onClick={() => setCurrentPage('ppe')}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                currentPage === 'ppe' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              PPE
            </button>
            <button 
              onClick={() => setCurrentPage('plant-equipment')}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                currentPage === 'plant-equipment' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Plant & Equipment
            </button>
            <button 
              onClick={() => setCurrentPage('sign-in')}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                currentPage === 'sign-in' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Sign In Register
            </button>
            <button 
              onClick={() => setCurrentPage('msds')}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                currentPage === 'msds' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              MSDS
            </button>
          </div>
        </div>

        {/* PDF Export Buttons */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={handlePrintPDF}
              disabled={isGeneratingPDF}
              className="px-4 py-2 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700 disabled:opacity-50"
            >
              {isGeneratingPDF ? 'Generating...' : 'Download PDF'}
            </button>
            <button 
              onClick={exportVectorPdf}
              className="px-4 py-2 bg-purple-600 text-white rounded text-sm font-medium hover:bg-purple-700"
            >
              Vector PDF
            </button>
          </div>
        </div>

        {/* Form Content for Each Tab */}
        <div className="space-y-6">
          {/* Basic form inputs would go here for editing */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Form Controls</h3>
            <p className="text-sm text-gray-600">
              Form controls for editing the current page content would be displayed here. 
              Currently showing preview-only mode.
            </p>
          </div>
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