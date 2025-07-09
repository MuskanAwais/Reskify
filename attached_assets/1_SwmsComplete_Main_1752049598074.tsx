import React, { useState, useEffect } from 'react';
import { RiskBadgeNew } from '../components/RiskBadgeNew';
import riskifyLogo from '../assets/riskify-logo.svg';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { pdf, Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

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
                <Image src={riskifyLogo} style={styles.logo} />
                <Text style={[styles.title, { marginLeft: 15 }]}>Safe Work Method Statement</Text>
              </View>
              <View>
                <Text style={styles.companyInfo}>{formData.companyName}</Text>
                <Text style={styles.companyInfo}>{formData.projectName}</Text>
                <Text style={styles.companyInfo}>{formData.projectNumber}</Text>
                <Text style={styles.companyInfo}>{formData.projectAddress}</Text>
                {formData.companyLogo && <Image src={formData.companyLogo} style={styles.logo} />}
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

  // Continue with the render functions and component body...
  // This file is continued in the next files for readability
}