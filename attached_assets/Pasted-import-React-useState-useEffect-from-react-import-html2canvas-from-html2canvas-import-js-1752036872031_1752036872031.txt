import React, { useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// RiskBadgeNew Component (inline for simplicity)
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
    { id: '6', name: 'Hearing Protection', description: 'Earplugs or earmuffs AS/NZS 1270', selected: true, required: false }
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
      hazards: ['Crush injuries', 'Tip over', 'Underground services'],
      controlMeasures: ['Certified operators only', 'Daily inspections', 'Exclusion zones']
    },
    {
      id: '2',
      equipment: 'Tower Crane',
      model: 'Liebherr 380 EC-B',
      serialNumber: 'TC001',
      riskLevel: 'extreme',
      nextInspection: '2025-01-20',
      hazards: ['Falling objects', 'Structural failure', 'Electrical hazards'],
      controlMeasures: ['Licensed operators', 'Regular inspections', 'Load charts', 'Exclusion zones']
    }
  ],

  // Sign In and MSDS
  signInEntries: [],
  msdsDocuments: []
};

export default function SwmsComplete() {
  const [formData, setFormData] = useState(defaultFormData);
  const [currentPage, setCurrentPage] = useState('project-info');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // PDF Export Function
  const handlePrintPDF = async () => {
    try {
      setIsGeneratingPDF(true);
      console.log('Starting PDF generation...');

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
        'work-activities',
        'ppe',
        'plant-equipment'
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
            scale: 1.5,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff'
          });

          const imgData = canvas.toDataURL('image/png', 0.85);
          
          if (!isFirstPage) {
            pdf.addPage();
          }
          
          const imgWidth = 297;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
          isFirstPage = false;
          
        } catch (pageError) {
          console.error(`Error capturing page ${page}:`, pageError);
        }
      }

      const projectName = formData.projectName?.replace(/[^a-zA-Z0-9]/g, '_') || 'SWMS_Document';
      pdf.save(`${projectName}.pdf`);
      
      console.log('PDF generated successfully!');
      setCurrentPage('project-info');
      
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('PDF generation failed. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Project Info Page
  const renderProjectInfoPage = () => (
    <div 
      className="bg-white shadow-lg rounded-lg overflow-hidden page-content"
      style={{ 
        width: '297mm', 
        minHeight: '210mm',
        margin: '0 auto',
        padding: '32px'
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-10">
        <div className="flex items-center space-x-4">
          <RiskifyLogo />
          <div style={{ 
            fontSize: '24px', 
            fontWeight: 'bold',
            color: '#1f2937',
            fontFamily: 'Inter, system-ui, sans-serif'
          }}>
            Safe Work Method Statement
          </div>
        </div>
        
        <div className="flex items-center space-x-8">
          <div className="text-right" style={{ 
            fontSize: '13px', 
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
                style={{ height: '86px', width: 'auto' }}
              />
            ) : (
              <div 
                className="border-2 border-dashed flex items-center justify-center text-center"
                style={{ 
                  height: '86px', 
                  width: '120px',
                  borderColor: '#d1d5db',
                  fontSize: '11px',
                  color: '#9ca3af'
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
        </div>

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
  );

  // Emergency Info Page
  const renderEmergencyInfoPage = () => (
    <div 
      className="bg-white shadow-lg rounded-lg overflow-hidden page-content"
      style={{ 
        width: '297mm', 
        minHeight: '210mm',
        margin: '0 auto',
        padding: '32px'
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-10">
        <RiskifyLogo />
        <div className="text-center flex-1 mx-8">
          <div style={{ 
            fontSize: '24px', 
            fontWeight: 'bold',
            color: '#1f2937',
            fontFamily: 'Inter, system-ui, sans-serif',
            marginBottom: '16px'
          }}>
            Safe Work Method Statement
          </div>
          <div style={{ 
            fontSize: '13px', 
            color: '#6b7280',
            fontFamily: 'Inter, system-ui, sans-serif'
          }}>
            <div className="font-medium" style={{ color: '#374151' }}>{formData.companyName}</div>
            <div>{formData.projectName}</div>
          </div>
        </div>
        <div style={{ width: '120px', height: '86px' }}></div>
      </div>

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
                <tr key={index}>
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
    </div>
  );

  // High Risk Activities Page
  const renderHighRiskActivitiesPage = () => {
    const selectedActivities = formData.highRiskActivities.filter(activity => activity.selected);
    
    return (
      <div 
        className="bg-white shadow-lg rounded-lg overflow-hidden page-content"
        style={{ 
          width: '297mm', 
          minHeight: '210mm',
          margin: '0 auto',
          padding: '32px'
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-10">
          <RiskifyLogo />
          <div className="text-center flex-1 mx-8">
            <div style={{ 
              fontSize: '24px', 
              fontWeight: 'bold',
              color: '#1f2937',
              fontFamily: 'Inter, system-ui, sans-serif',
              marginBottom: '16px'
            }}>
              High Risk Activities
            </div>
          </div>
          <div style={{ width: '120px', height: '86px' }}></div>
        </div>

        {/* High Risk Activities Content */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-6" style={{ color: '#1f2937' }}>
            Selected High Risk Activities
          </h2>
          
          <div className="grid grid-cols-2 gap-6">
            {selectedActivities.map((activity) => (
              <div key={activity.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-lg text-gray-900">{activity.title}</h3>
                  <RiskBadgeNew level={activity.riskLevel} score={0} />
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{activity.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Work Activities Page
  const renderWorkActivitiesPage = () => (
    <div 
      className="bg-white shadow-lg rounded-lg overflow-hidden page-content"
      style={{ 
        width: '297mm', 
        minHeight: '210mm',
        margin: '0 auto',
        padding: '32px'
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-10">
        <RiskifyLogo />
        <div className="text-center flex-1 mx-8">
          <div style={{ 
            fontSize: '24px', 
            fontWeight: 'bold',
            color: '#1f2937',
            fontFamily: 'Inter, system-ui, sans-serif',
            marginBottom: '16px'
          }}>
            Work Activities & Risk Assessment
          </div>
        </div>
        <div style={{ width: '120px', height: '86px' }}></div>
      </div>

      {/* Work Activities Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300" style={{ fontSize: '11px' }}>
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-300 px-3 py-2 text-center font-semibold text-gray-900">
                Activity
              </th>
              <th className="border border-gray-300 px-3 py-2 text-center font-semibold text-gray-900">
                Hazards
              </th>
              <th className="border border-gray-300 px-3 py-2 text-center font-semibold text-gray-900">
                Initial Risk
              </th>
              <th className="border border-gray-300 px-3 py-2 text-center font-semibold text-gray-900">
                Control Measures
              </th>
              <th className="border border-gray-300 px-3 py-2 text-center font-semibold text-gray-900">
                Residual Risk
              </th>
            </tr>
          </thead>
          <tbody>
            {formData.workActivities.map((activity) => (
              <tr key={activity.id}>
                <td className="border border-gray-300 px-3 py-2" style={{ backgroundColor: 'white' }}>
                  {activity.activity}
                </td>
                <td className="border border-gray-300 px-3 py-2" style={{ backgroundColor: 'white' }}>
                  <ul className="list-disc list-inside space-y-1">
                    {activity.hazards.map((hazard, index) => (
                      <li key={index} className="text-xs">{hazard}</li>
                    ))}
                  </ul>
                </td>
                <td className="border border-gray-300 px-3 py-2 text-center" style={{ backgroundColor: 'white' }}>
                  <RiskBadgeNew 
                    level={activity.initialRisk.level} 
                    score={activity.initialRisk.score} 
                  />
                </td>
                <td className="border border-gray-300 px-3 py-2" style={{ backgroundColor: 'white' }}>
                  <ul className="list-disc list-inside space-y-1">
                    {activity.controlMeasures.map((measure, index) => (
                      <li key={index} className="text-xs">{measure}</li>
                    ))}
                  </ul>
                </td>
                <td className="border border-gray-300 px-3 py-2 text-center" style={{ backgroundColor: 'white' }}>
                  <RiskBadgeNew 
                    level={activity.residualRisk.level} 
                    score={activity.residualRisk.score} 
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // PPE Page
  const renderPPEPage = () => (
    <div 
      className="bg-white shadow-lg rounded-lg overflow-hidden page-content"
      style={{ 
        width: '297mm', 
        minHeight: '210mm',
        margin: '0 auto',
        padding: '32px'
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-10">
        <RiskifyLogo />
        <div className="text-center flex-1 mx-8">
          <div style={{ 
            fontSize: '24px', 
            fontWeight: 'bold',
            color: '#1f2937',
            fontFamily: 'Inter, system-ui, sans-serif',
            marginBottom: '16px'
          }}>
            Personal Protective Equipment
          </div>
        </div>
        <div style={{ width: '120px', height: '86px' }}></div>
      </div>

      {/* PPE Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-6" style={{ color: '#1f2937' }}>
          Required PPE for Project
        </h2>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-900">
                  PPE Item
                </th>
                <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-900">
                  Description
                </th>
                <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-900">
                  Status
                </th>
                <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-900">
                  Selected
                </th>
              </tr>
            </thead>
            <tbody>
              {formData.ppeItems.map((item, index) => (
                <tr key={item.id}>
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
                      {item.required ? 'Required' : 'Recommended'}
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
  );

  // Plant Equipment Page
  const renderPlantEquipmentPage = () => (
    <div 
      className="bg-white shadow-lg rounded-lg overflow-hidden page-content"
      style={{ 
        width: '297mm', 
        minHeight: '210mm',
        margin: '0 auto',
        padding: '32px'
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-10">
        <RiskifyLogo />
        <div className="text-center flex-1 mx-8">
          <div style={{ 
            fontSize: '24px', 
            fontWeight: 'bold',
            color: '#1f2937',
            fontFamily: 'Inter, system-ui, sans-serif',
            marginBottom: '16px'
          }}>
            Plant & Equipment Register
          </div>
        </div>
        <div style={{ width: '120px', height: '86px' }}></div>
      </div>

      {/* Plant Equipment Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-6" style={{ color: '#1f2937' }}>
          Equipment Register
        </h2>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300" style={{ fontSize: '11px' }}>
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 px-3 py-2 text-center font-semibold text-gray-900">
                  Equipment
                </th>
                <th className="border border-gray-300 px-3 py-2 text-center font-semibold text-gray-900">
                  Model
                </th>
                <th className="border border-gray-300 px-3 py-2 text-center font-semibold text-gray-900">
                  Serial Number
                </th>
                <th className="border border-gray-300 px-3 py-2 text-center font-semibold text-gray-900">
                  Risk Level
                </th>
                <th className="border border-gray-300 px-3 py-2 text-center font-semibold text-gray-900">
                  Next Inspection
                </th>
              </tr>
            </thead>
            <tbody>
              {formData.plantEquipment.map((equipment, index) => (
                <tr key={equipment.id}>
                  <td className="border border-gray-300 px-3 py-2" style={{ backgroundColor: 'white' }}>
                    {equipment.equipment}
                  </td>
                  <td className="border border-gray-300 px-3 py-2" style={{ backgroundColor: 'white' }}>
                    {equipment.model}
                  </td>
                  <td className="border border-gray-300 px-3 py-2" style={{ backgroundColor: 'white' }}>
                    {equipment.serialNumber}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-center" style={{ backgroundColor: 'white' }}>
                    <RiskBadgeNew level={equipment.riskLevel} score={0} />
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-center" style={{ backgroundColor: 'white' }}>
                    {equipment.nextInspection}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Render current page
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'project-info':
        return renderProjectInfoPage();
      case 'emergency-info':
        return renderEmergencyInfoPage();
      case 'high-risk-activities':
        return renderHighRiskActivitiesPage();
      case 'work-activities':
        return renderWorkActivitiesPage();
      case 'ppe':
        return renderPPEPage();
      case 'plant-equipment':
        return renderPlantEquipmentPage();
      default:
        return renderProjectInfoPage();
    }
  };

  // Main component return
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Form Panel */}
      <div className="w-1/3 bg-white p-8 overflow-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">SWMS Generator</h1>
        
        {/* Page Navigation */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'project-info', label: 'Project Info' },
              { key: 'emergency-info', label: 'Emergency Info' },
              { key: 'high-risk-activities', label: 'High Risk' },
              { key: 'work-activities', label: 'Work Activities' },
              { key: 'ppe', label: 'PPE' },
              { key: 'plant-equipment', label: 'Plant & Equipment' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setCurrentPage(key)}
                className={`px-3 py-2 text-xs font-medium rounded ${
                  currentPage === key 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* PDF Export Button */}
        <div className="mb-6">
          <button
            onClick={handlePrintPDF}
            disabled={isGeneratingPDF}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            {isGeneratingPDF ? 'Generating PDF...' : 'Download PDF'}
          </button>
        </div>

        {/* Form Content */}
        <div className="space-y-4">
          {currentPage === 'project-info' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Project Information</h2>
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Scope of Works</label>
                <textarea
                  value={formData.scopeOfWorks}
                  onChange={(e) => setFormData({ ...formData, scopeOfWorks: e.target.value })}
                  rows={4}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>
          )}

          {currentPage === 'emergency-info' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Emergency Information</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contacts</label>
                <div className="space-y-2">
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
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentPage === 'high-risk-activities' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">High Risk Activities</h2>
              <div className="space-y-3">
                {formData.highRiskActivities.map((activity, index) => (
                  <div key={activity.id} className="border rounded p-3 bg-gray-50">
                    <div className="flex items-center space-x-3">
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
                      <RiskBadgeNew level={activity.riskLevel} score={0} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
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