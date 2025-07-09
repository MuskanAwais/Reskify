import React, { useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { pdf, Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// RiskBadgeNew Component (inline)
interface RiskBadgeProps {
  level: string;
  score: number;
}

const RiskBadgeNew: React.FC<RiskBadgeProps> = ({ level, score }) => {
  const getBackgroundColor = (riskLevel: string) => {
    switch (riskLevel?.toLowerCase()) {
      case 'extreme': return '#ef4444';
      case 'high': return '#f97316';
      case 'medium': return '#eab308';
      case 'low': return '#22c55e';
      default: return '#22c55e';
    }
  };

  const capitalizedLevel = level ? level.charAt(0).toUpperCase() + level.slice(1) : 'Low';

  return (
    <span 
      className="risk-badge-override"
      style={{
        backgroundColor: getBackgroundColor(level),
        color: '#ffffff',
        height: '24px',
        width: '70px',
        fontSize: '10px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        borderRadius: '4px',
        fontWeight: '600',
        fontFamily: 'Inter, Arial, sans-serif',
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        lineHeight: 1
      }}
    >
      {capitalizedLevel} ({score})
    </span>
  );
};

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
  const [currentPage, setCurrentPage] = useState('project-info');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Get selected MSDS documents
  const selectedDocuments = formData.msdsDocuments.filter(doc => doc.selected);

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
            <div className="flex items-center space-x-4">
              <RiskifyLogo />
              <div style={{ 
                fontSize: '24px', 
                fontWeight: 'bold',
                color: '#1f2937',
                fontFamily: 'Inter, system-ui, sans-serif',
                lineHeight: '1.2'
              }}>
                Safe Work Method Statement
              </div>
            </div>
            
            <div className="flex items-center space-x-8">
              <div className="text-right" style={{ 
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
          </div>

          {/* Project Information Content */}
          <div className="grid grid-cols-1 gap-8">
            {/* Basic Project Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-6" style={{ color: '#1f2937' }}>
                Project Information
              </h2>
              
              <div className="grid grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Name</label>
                  <div className="text-sm text-gray-900">{formData.jobName}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Number</label>
                  <div className="text-sm text-gray-900">{formData.jobNumber}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <div className="text-sm text-gray-900">{formData.startDate}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                  <div className="text-sm text-gray-900">{formData.duration}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-6 mt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Created</label>
                  <div className="text-sm text-gray-900">{formData.dateCreated}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Principal Contractor</label>
                  <div className="text-sm text-gray-900">{formData.principalContractor}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Manager</label>
                  <div className="text-sm text-gray-900">{formData.projectManager}</div>
                </div>
              </div>
            </div>

            {/* Authorization */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4" style={{ color: '#1f2937' }}>
                Authorization
              </h3>
              
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Authorising Person</label>
                  <div className="text-sm text-gray-900">{formData.authorisingPerson}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                  <div className="text-sm text-gray-900">{formData.authorisingPosition}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Signature</label>
                  <div 
                    className="text-lg font-semibold border-b-2 border-gray-300 pb-2"
                    style={{ 
                      fontFamily: 'Dancing Script, cursive',
                      color: '#1f2937',
                      minHeight: '30px'
                    }}
                  >
                    {formData.authorisingSignature}
                  </div>
                </div>
              </div>
            </div>

            {/* Scope of Works */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4" style={{ color: '#1f2937' }}>
                Scope of Works
              </h3>
              <div className="text-sm text-gray-700 leading-relaxed">
                {formData.scopeOfWorks}
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
              <RiskifyLogo />
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

          {/* Emergency Information Content */}
          <div className="grid grid-cols-1 gap-8">
            {/* Emergency Contacts */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-6" style={{ color: '#1f2937' }}>
                Emergency Contact Information
              </h2>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                        Contact Name
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                        Phone Number
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.emergencyContacts.map((contact, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-3 text-gray-900" style={{ backgroundColor: 'white' }}>
                          {contact.name}
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-gray-900" style={{ backgroundColor: 'white' }}>
                          {contact.phone}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Emergency Procedures */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4" style={{ color: '#1f2937' }}>
                Emergency Response Procedures
              </h3>
              <div className="text-sm text-gray-700 leading-relaxed">
                {formData.emergencyProcedures}
              </div>
            </div>

            {/* Monitoring */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4" style={{ color: '#1f2937' }}>
                Review and Monitoring
              </h3>
              <div className="text-sm text-gray-700 leading-relaxed">
                {formData.emergencyMonitoring}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Work Activities Page Render
  const renderWorkActivitiesPages = () => {
    const itemsPerPage = 2;
    const totalPages = Math.ceil(formData.workActivities.length / itemsPerPage);
    const pages = [];

    for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
      const startIndex = pageIndex * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const pageActivities = formData.workActivities.slice(startIndex, endIndex);

      pages.push(
        <div 
          key={pageIndex}
          className="bg-white shadow-lg rounded-lg overflow-hidden mb-8"
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
              <div className="flex items-center space-x-4">
                <RiskifyLogo />
                <div style={{ 
                  fontSize: '24px', 
                  fontWeight: 'bold',
                  color: '#1f2937',
                  fontFamily: 'Inter, system-ui, sans-serif',
                  lineHeight: '1.2'
                }}>
                  Work Activities & Risk Assessment
                </div>
              </div>
              
              <div className="flex items-center space-x-8">
                <div className="text-right" style={{ 
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
            </div>

            {/* Work Activities Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300" style={{ fontSize: '11px' }}>
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-3 py-2 text-center font-semibold text-gray-900" style={{ width: '3%' }}>
                      #
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-center font-semibold text-gray-900" style={{ width: '14%' }}>
                      Activity
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-center font-semibold text-gray-900" style={{ width: '23%' }}>
                      Hazards
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-center font-semibold text-gray-900" style={{ width: '11%' }}>
                      Initial Risk
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-center font-semibold text-gray-900" style={{ width: '27%' }}>
                      Control Measures
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-center font-semibold text-gray-900" style={{ width: '11%' }}>
                      Residual Risk
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-center font-semibold text-gray-900" style={{ width: '11%' }}>
                      Legislation
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pageActivities.map((activity, index) => (
                    <tr key={activity.id}>
                      <td className="border border-gray-300 px-3 py-2 text-center" style={{ backgroundColor: 'white' }}>
                        {startIndex + index + 1}
                      </td>
                      <td className="border border-gray-300 px-3 py-2" style={{ backgroundColor: 'white', verticalAlign: 'top', paddingTop: '6px' }}>
                        {activity.activity}
                      </td>
                      <td className="border border-gray-300 px-3 py-2" style={{ backgroundColor: 'white', verticalAlign: 'top', paddingTop: '6px' }}>
                        <ul className="list-disc list-inside space-y-1">
                          {activity.hazards.map((hazard, hazardIndex) => (
                            <li key={hazardIndex} className="text-xs">{hazard}</li>
                          ))}
                        </ul>
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-center" style={{ backgroundColor: 'white', verticalAlign: 'top', paddingTop: '6px' }}>
                        {typeof activity.initialRisk === 'object' ? (
                          <RiskBadgeNew 
                            level={activity.initialRisk.level} 
                            score={activity.initialRisk.score} 
                          />
                        ) : (
                          <span className="text-xs">{activity.initialRisk}</span>
                        )}
                      </td>
                      <td className="border border-gray-300 px-3 py-2" style={{ backgroundColor: 'white', verticalAlign: 'top', paddingTop: '6px' }}>
                        <ul className="list-disc list-inside space-y-1">
                          {activity.controlMeasures.map((measure, measureIndex) => (
                            <li key={measureIndex} className="text-xs">{measure}</li>
                          ))}
                        </ul>
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-center" style={{ backgroundColor: 'white', verticalAlign: 'top', paddingTop: '6px' }}>
                        {typeof activity.residualRisk === 'object' ? (
                          <RiskBadgeNew 
                            level={activity.residualRisk.level} 
                            score={activity.residualRisk.score} 
                          />
                        ) : (
                          <span className="text-xs">{activity.residualRisk}</span>
                        )}
                      </td>
                      <td className="border border-gray-300 px-3 py-2" style={{ backgroundColor: 'white', verticalAlign: 'top', paddingTop: '6px' }}>
                        <ul className="list-disc list-inside space-y-1">
                          {activity.legislation.map((law, lawIndex) => (
                            <li key={lawIndex} className="text-xs">{law}</li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Page Footer */}
            <div className="mt-6 text-right text-sm text-gray-500">
              Page {pageIndex + 1} of {totalPages}
            </div>
          </div>
        </div>
      );
    }

    return <div>{pages}</div>;
  };

  // High Risk Activities Page Render
  const renderHighRiskActivitiesPage = () => {
    const selectedActivities = formData.highRiskActivities.filter(activity => activity.selected);
    
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
              <RiskifyLogo />
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

          {/* High Risk Activities Content */}
          <div className="grid grid-cols-1 gap-8">
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-6" style={{ color: '#1f2937' }}>
                High Risk Activities
              </h2>
              
              {selectedActivities.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-500">No high risk activities selected for this project.</div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-6">
                  {selectedActivities.map((activity) => (
                    <div key={activity.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-lg text-gray-900">{activity.title}</h3>
                        {activity.riskLevel && (
                          <RiskBadgeNew level={activity.riskLevel} score={0} />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">{activity.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

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
              <RiskifyLogo />
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
              <RiskifyLogo />
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
              <RiskifyLogo />
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

  // Sign In Page Render
  const renderSignInPages = () => {
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
              <RiskifyLogo />
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

          {/* Sign In Content */}
          <div className="grid grid-cols-1 gap-8">
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-6" style={{ color: '#1f2937' }}>
                Site Personnel Sign In Register
              </h2>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-900" style={{ width: '20%' }}>
                        Name
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-900" style={{ width: '20%' }}>
                        Company
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-900" style={{ width: '15%' }}>
                        Date
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-900" style={{ width: '15%' }}>
                        Time In
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-900" style={{ width: '15%' }}>
                        Time Out
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-900" style={{ width: '15%' }}>
                        Signature
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Show user-entered sign-in entries first */}
                    {formData.signInEntries.map((entry, index) => (
                      <tr key={entry.id}>
                        <td className="border border-gray-300 px-4 py-3" style={{ backgroundColor: 'white', height: '40px' }}>
                          {entry.name}
                        </td>
                        <td className="border border-gray-300 px-4 py-3" style={{ backgroundColor: 'white', height: '40px' }}>
                          {entry.company}
                        </td>
                        <td className="border border-gray-300 px-4 py-3" style={{ backgroundColor: 'white', height: '40px' }}>
                          {entry.date}
                        </td>
                        <td className="border border-gray-300 px-4 py-3" style={{ backgroundColor: 'white', height: '40px' }}>
                          {entry.timeIn}
                        </td>
                        <td className="border border-gray-300 px-4 py-3" style={{ backgroundColor: 'white', height: '40px' }}>
                          {entry.timeOut}
                        </td>
                        <td className="border border-gray-300 px-4 py-3" style={{ backgroundColor: 'white', height: '40px', fontFamily: 'Dancing Script, cursive', fontSize: '16px', fontWeight: '600' }}>
                          {entry.signature}
                        </td>
                      </tr>
                    ))}
                    
                    {/* Empty rows for additional signatures */}
                    {Array.from({ length: 15 - formData.signInEntries.length }, (_, index) => (
                      <tr key={`empty-${index}`}>
                        <td className="border border-gray-300 px-4 py-3" style={{ backgroundColor: 'white', height: '40px' }}>
                          &nbsp;
                        </td>
                        <td className="border border-gray-300 px-4 py-3" style={{ backgroundColor: 'white', height: '40px' }}>
                          &nbsp;
                        </td>
                        <td className="border border-gray-300 px-4 py-3" style={{ backgroundColor: 'white', height: '40px' }}>
                          &nbsp;
                        </td>
                        <td className="border border-gray-300 px-4 py-3" style={{ backgroundColor: 'white', height: '40px' }}>
                          &nbsp;
                        </td>
                        <td className="border border-gray-300 px-4 py-3" style={{ backgroundColor: 'white', height: '40px' }}>
                          &nbsp;
                        </td>
                        <td className="border border-gray-300 px-4 py-3" style={{ backgroundColor: 'white', height: '40px' }}>
                          &nbsp;
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-6 text-sm text-gray-600">
                <p><strong>Note:</strong> All personnel must sign in upon arrival and sign out upon departure. Site induction must be completed before entry.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // MSDS Page Render
  const renderMSDSPage = () => {
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
            <div className="flex items-center space-x-4">
              <RiskifyLogo />
              <div style={{ 
                fontSize: '24px', 
                fontWeight: 'bold',
                color: '#1f2937',
                fontFamily: 'Inter, system-ui, sans-serif',
                lineHeight: '1.2'
              }}>
                Material Safety Data Sheets
              </div>
            </div>
            
            <div className="flex items-center space-x-8">
              <div className="text-right" style={{ 
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
          </div>

          {/* MSDS Documents List */}
          <div className="space-y-6">
            {selectedDocuments.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg mb-4">No MSDS Documents Selected</div>
                <div className="text-gray-400 text-sm">
                  Use the form on the left to upload and select MSDS documents to include in your SWMS.
                </div>
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4" style={{ color: '#1f2937' }}>
                    Attached Documents ({selectedDocuments.length})
                  </h2>

                </div>

                {/* Document List */}
                <div className="space-y-4">
                  {selectedDocuments.map((doc, index) => (
                    <div key={doc.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-2" style={{ color: '#1f2937' }}>
                            {index + 1}. {doc.customTitle || doc.fileName}
                          </h3>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div><strong>Original File:</strong> {doc.fileName}</div>
                            <div><strong>Upload Date:</strong> {new Date(doc.uploadDate).toLocaleDateString()}</div>
                            <div><strong>File Type:</strong> PDF Document</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                            Attached
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer Note */}
                <div className="mt-8 border-t border-gray-200 pt-6">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <div className="text-yellow-600 mr-3">⚠️</div>
                      <div>
                        <h4 className="font-semibold text-yellow-800 mb-1">Important Note</h4>
                        <p className="text-sm text-yellow-700">
                          Please ensure all personnel review the attached MSDS documents before commencing work. 
                          These documents contain critical safety information about hazardous materials that may 
                          be encountered during the project.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Main render function that determines which page to show
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
        return renderWorkActivitiesPages();
      case 'ppe':
        return renderPPEPage();
      case 'plant-equipment':
        return renderPlantEquipmentPage();
      case 'sign-in':
        return renderSignInPages();
      case 'msds':
        return renderMSDSPage();
      default:
        return renderProjectInfoPage();
    }
  };

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
                      <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                      <input
                        type="text"
                        value={entry.company}
                        onChange={(e) => {
                          const newEntries = [...formData.signInEntries];
                          newEntries[index].company = e.target.value;
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