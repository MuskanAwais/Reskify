import React, { useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { pdf, Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { RiskBadgeNew } from './RiskBadgeNew';

type DocumentPage = 'project-info' | 'emergency-info' | 'high-risk-activities' | 'risk-matrix' | 'work-activities' | 'ppe' | 'plant-equipment' | 'sign-in';

// Riskify Logo as colored PNG-style SVG
const RiskifyLogo = () => (
  <svg width="86" height="86" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="10" fill="#2c5530"/>
    <circle cx="50" cy="40" r="20" fill="#4CAF50"/>
    <text x="50" y="35" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">RISKIFY</text>
    <text x="50" y="55" textAnchor="middle" fill="white" fontSize="6">CONSTRUCTION</text>
    <text x="50" y="65" textAnchor="middle" fill="white" fontSize="6">SAFETY</text>
    <rect x="30" y="75" width="40" height="3" fill="#FF9800"/>
    <rect x="35" y="80" width="30" height="3" fill="#2196F3"/>
  </svg>
);

// Page Watermark Component
const PageWatermark = ({ formData }: { formData: any }) => (
  <div className="absolute inset-0 pointer-events-none z-0 opacity-10">
    <div className="absolute inset-0 flex flex-col justify-center items-center text-gray-400 text-lg font-bold transform rotate-[-30deg] select-none">
      <div className="text-center space-y-2">
        <div>{formData.projectName || 'Project Name'}</div>
        <div>{formData.projectNumber || 'Project Number'}</div>
        <div>{formData.projectAddress || 'Project Address'}</div>
      </div>
    </div>
    {/* Repeated watermark pattern */}
    <div className="absolute inset-0 grid grid-cols-3 gap-8 p-8">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="flex flex-col justify-center items-center text-gray-300 text-sm font-medium transform rotate-[-30deg] select-none">
          <div className="text-center space-y-1">
            <div>{formData.projectName || 'Project Name'}</div>
            <div>{formData.projectNumber || 'Project Number'}</div>
            <div>{formData.projectAddress || 'Project Address'}</div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Default form data
const defaultFormData = {
  companyName: 'Test Company Name',
  projectName: 'Test Project Name',
  projectNumber: '123 456',
  projectAddress: '123 Sample Job Address',
  jobName: 'Test Project Name',
  jobNumber: '123 456',
  startDate: '12th July 2025',
  duration: '8 Weeks',
  dateCreated: '23rd June 2025',
  principalContractor: 'Test Principal Contractor',
  projectManager: 'Test Project Manager Name',
  siteSupervisor: 'Test Project Supervisor',
  authorisingPerson: 'Test authorising person name',
  authorisingPosition: 'Test authorising person position',
  authorisingSignature: null,
  scopeOfWorks: 'Sample scope of works description',
  reviewAndMonitoring: 'This SWMS will be reviewed and updated whenever changes occur to scope, method, or risk levels. The site supervisor is responsible for initiating this review. All workers will be consulted on this SWMS during the pre-start meeting. Updates will be communicated verbally and via toolbox talks.',
  companyLogo: null,
  
  // Emergency Information
  emergencyContacts: [
    'Emergency Contact 01 Name - 0499 999 999',
    'Emergency Contact 02 Name - 0499 999 999',
    'Emergency Contact 03 Name - 0499 999 999'
  ],
  emergencyProcedures: 'Sample procedure information here',
  emergencyMonitoring: 'Emergency procedures will be reviewed monthly and updated as needed. Site supervisor will conduct weekly checks of emergency equipment and contact details. All personnel will be trained on emergency procedures during induction and refresher training every 6 months.',
  
  // High Risk Activities
  highRiskActivities: [
    { name: 'Work on a telecommunication tower', selected: false },
    { name: 'Risk of a person falling more than 2 metres (e.g. work on ladders, scaffolding, roofs, etc.)', selected: true },
    { name: 'Work involving demolition of an element that is load-bearing or otherwise related to the physical integrity of the structure', selected: true },
    { name: 'Work involving the disturbance of asbestos', selected: true },
    { name: 'Work involving structural alterations or repairs that require temporary support to prevent collapse', selected: false },
    { name: 'Work carried out in or near a confined space', selected: false },
    { name: 'Work carried out in or near a shaft or trench deeper than 1.5 metres or a tunnel', selected: false },
    { name: 'Work involving the use of explosives', selected: false },
    { name: 'Work on or near pressurised gas distribution mains or piping', selected: false },
    { name: 'Work on or near chemical, fuel or refrigerant lines', selected: false },
    { name: 'Work on or near energised electrical installations or services (includes live electrical work)', selected: false },
    { name: 'Work in an area that may have a contaminated or flammable atmosphere', selected: false },
    { name: 'Work involving tilt-up or precast concrete elements', selected: false },
    { name: 'Work carried out, in or adjacent to a road, railway, or other traffic corridor that is in use', selected: false },
    { name: 'Work in an area at a workplace in which there is any movement of powered mobile plant (e.g. forklifts, excavators, cranes)', selected: false },
    { name: 'Work in areas where there are artificial extremes of temperature (e.g. cold rooms, furnace areas)', selected: false },
    { name: 'Work carries out in or near water or other liquid that involves a risk of drowning', selected: false },
    { name: 'Work carried out on or near live electrical conductors', selected: false }
  ],
  
  // Work Activities
  workActivities: [
    {
      id: 1,
      activity: 'Activity description in detail sample 01',
      hazards: [
        'Hazard description 01',
        'Hazard description 02 this is an extended description',
        'Hazard description 03',
        'Hazard description 04',
        'Hazard description 05',
        'Hazard description 06 this is an extended description',
        'Hazard description 07',
        'Hazard description 08'
      ],
      initialRisk: 'Extreme (16)',
      controlMeasures: [
        'Hazard description 01',
        'Hazard description 02 this is an extended description',
        'Hazard description 03',
        'Hazard description 04',
        'Hazard description 05',
        'Hazard description 06 this is an extended description',
        'Hazard description 07',
        'Hazard description 08'
      ],
      residualRisk: 'Medium (6)',
      legislation: [
        'Legislation description 01',
        'Legislation description 02 this is an extended description'
      ]
    },
    {
      id: 2,
      activity: 'Activity description in detail sample 02',
      hazards: [
        'Hazard description 01',
        'Hazard description 02 this is an extended description',
        'Hazard description 03',
        'Hazard description 04',
        'Hazard description 05',
        'Hazard description 06 this is an extended description',
        'Hazard description 07',
        'Hazard description 08'
      ],
      initialRisk: 'High (12)',
      controlMeasures: [
        'Hazard description 01',
        'Hazard description 02 this is an extended description',
        'Hazard description 03',
        'Hazard description 04',
        'Hazard description 05',
        'Hazard description 06 this is an extended description',
        'Hazard description 07',
        'Hazard description 08'
      ],
      residualRisk: 'Low (4)',
      legislation: [
        'Legislation description 01',
        'Legislation description 02 this is an extended description'
      ]
    }
  ],
  
  // PPE Items
  ppeItems: [
    { name: 'Hard Hat', description: 'Head protection from falling objects', selected: false },
    { name: 'Hi-Vis Vest/Shirt', description: 'Visibility on site', selected: true },
    { name: 'Steel Cap Boots', description: 'Foot protection from impact or puncture', selected: false },
    { name: 'Safety Glasses', description: 'Eye protection', selected: true },
    { name: 'Gloves', description: 'General hand protection', selected: false },
    { name: 'Hearing Protection', description: 'Earplugs or earmuffs', selected: false },
    { name: 'Long Pants', description: 'Protection from abrasions and minor cuts', selected: false },
    { name: 'Long Sleeve Shirt', description: 'Arm protection from scratches and UV', selected: true },
    { name: 'Safety Harness', description: 'Fall protection for work at heights', selected: false },
    { name: 'Sun Protection (Hat, Sunscreen)', description: 'UV exposure control', selected: false },
    { name: 'Fall Arrest Harness', description: 'Working at heights', selected: false },
    { name: 'Confined Space Breathing Apparatus', description: 'Confined spaces or poor air quality', selected: true },
    { name: 'Welding Helmet & Gloves', description: 'Welding tasks', selected: false },
    { name: 'Cut-Resistant Gloves', description: 'Blade or glass handling', selected: false },
    { name: 'Face Shield', description: 'High-impact or chemical splash risk', selected: false },
    { name: 'Respirator (Half/Full Face)', description: 'Hazardous fumes, chemicals, or dust', selected: true },
    { name: 'Chemical-Resistant Apron', description: 'Handling corrosive substances', selected: false },
    { name: 'Anti-Static Clothing', description: 'Electrical or explosive environments', selected: false },
    { name: 'Insulated Gloves', description: 'Live electrical work', selected: false },
    { name: 'Emergency Eyewash', description: 'First aid for chemical exposure', selected: false }
  ],
  
  // Plant Equipment
  plantEquipment: [
    {
      equipment: 'Excavator',
      model: 'CAT 320D',
      serialNumber: '12345',
      riskLevel: 'High',
      nextInspection: '2024-12-01',
      certification: 'Yes'
    },
    {
      equipment: 'Forklift',
      model: 'Toyota 8FBU25',
      serialNumber: '67890',
      riskLevel: 'Medium',
      nextInspection: '2024-11-15',
      certification: 'Yes'
    },
    {
      equipment: 'Scaffolding',
      model: 'Layher Allround',
      serialNumber: 'ABC123',
      riskLevel: 'High',
      nextInspection: '2024-10-30',
      certification: 'Yes'
    }
  ],
  
  // Sign In Register
  signInEntries: []
};

// Header component with updated layout as requested
const SWMSHeader = ({ formData, onUpdate }: { formData: any, onUpdate: (field: string, value: any) => void }) => (
  <div className="flex justify-between items-start mb-8 border-b border-gray-200 pb-4">
    {/* Left side - Riskify logo */}
    <div className="flex items-center space-x-4">
      <RiskifyLogo />
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Safe Work Method Statement</h1>
        <p className="text-sm text-gray-600">AI SWMS Generator</p>
      </div>
    </div>
    
    {/* Right side - Project details and company logo */}
    <div className="flex items-start space-x-4">
      {/* Project details */}
      <div className="text-right">
        <div className="text-sm text-gray-800 font-medium">{formData.companyName}</div>
        <div className="text-sm text-gray-600">{formData.projectName}</div>
        <div className="text-sm text-gray-600">{formData.projectNumber}</div>
        <div className="text-sm text-gray-600">{formData.projectAddress}</div>
      </div>
      
      {/* Company logo upload */}
      <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center bg-gray-50">
        {formData.companyLogo ? (
          <img 
            src={formData.companyLogo} 
            alt="Company Logo" 
            className="w-full h-full object-contain rounded-lg"
          />
        ) : (
          <div className="text-center">
            <svg className="w-8 h-8 text-gray-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-xs text-gray-500">Company Logo</p>
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = (e) => {
                onUpdate('companyLogo', e.target?.result);
              };
              reader.readAsDataURL(file);
            }
          }}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
    </div>
  </div>
);

// Project Information Page
const ProjectInfoPage = ({ formData, onUpdate }: { formData: any, onUpdate: (field: string, value: any) => void }) => (
  <div className="relative space-y-6">
    <PageWatermark formData={formData} />
    <div className="relative z-10">
      <SWMSHeader formData={formData} onUpdate={onUpdate} />
      
      <h2 className="text-xl font-bold text-gray-900 mb-6">Project Information</h2>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-gray-50 p-4 rounded-lg border">
        <div className="space-y-3">
          <div>
            <span className="font-medium text-gray-700">Company Name: </span>
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) => onUpdate('companyName', e.target.value)}
              className="bg-transparent border-none outline-none text-gray-900"
            />
          </div>
          <div>
            <span className="font-medium text-gray-700">Job Name: </span>
            <input
              type="text"
              value={formData.jobName}
              onChange={(e) => onUpdate('jobName', e.target.value)}
              className="bg-transparent border-none outline-none text-gray-900"
            />
          </div>
          <div>
            <span className="font-medium text-gray-700">Job Number: </span>
            <input
              type="text"
              value={formData.jobNumber}
              onChange={(e) => onUpdate('jobNumber', e.target.value)}
              className="bg-transparent border-none outline-none text-gray-900"
            />
          </div>
          <div>
            <span className="font-medium text-gray-700">Project Address: </span>
            <input
              type="text"
              value={formData.projectAddress}
              onChange={(e) => onUpdate('projectAddress', e.target.value)}
              className="bg-transparent border-none outline-none text-gray-900"
            />
          </div>
          <div>
            <span className="font-medium text-gray-700">Start Date: </span>
            <input
              type="text"
              value={formData.startDate}
              onChange={(e) => onUpdate('startDate', e.target.value)}
              className="bg-transparent border-none outline-none text-gray-900"
            />
          </div>
          <div>
            <span className="font-medium text-gray-700">Duration: </span>
            <input
              type="text"
              value={formData.duration}
              onChange={(e) => onUpdate('duration', e.target.value)}
              className="bg-transparent border-none outline-none text-gray-900"
            />
          </div>
          <div>
            <span className="font-medium text-gray-700">Date Created: </span>
            <input
              type="text"
              value={formData.dateCreated}
              onChange={(e) => onUpdate('dateCreated', e.target.value)}
              className="bg-transparent border-none outline-none text-gray-900"
            />
          </div>
          <div>
            <span className="font-medium text-gray-700">Principal Contractor: </span>
            <input
              type="text"
              value={formData.principalContractor}
              onChange={(e) => onUpdate('principalContractor', e.target.value)}
              className="bg-transparent border-none outline-none text-gray-900"
            />
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-lg border">
        <div className="space-y-3">
          <div>
            <span className="font-medium text-gray-700">Project Manager: </span>
            <input
              type="text"
              value={formData.projectManager}
              onChange={(e) => onUpdate('projectManager', e.target.value)}
              className="bg-transparent border-none outline-none text-gray-900 italic"
            />
          </div>
          <div>
            <span className="font-medium text-gray-700">Site Supervisor: </span>
            <input
              type="text"
              value={formData.siteSupervisor}
              onChange={(e) => onUpdate('siteSupervisor', e.target.value)}
              className="bg-transparent border-none outline-none text-gray-900 italic"
            />
          </div>
          <div className="mt-4">
            <div className="font-medium text-gray-700 underline">Person Authorising SWMS</div>
            <div className="mt-2 space-y-2">
              <div>
                <span className="font-medium text-gray-700">Name: </span>
                <input
                  type="text"
                  value={formData.authorisingPerson}
                  onChange={(e) => onUpdate('authorisingPerson', e.target.value)}
                  className="bg-transparent border-none outline-none text-gray-900 italic"
                />
              </div>
              <div>
                <span className="font-medium text-gray-700">Position: </span>
                <input
                  type="text"
                  value={formData.authorisingPosition}
                  onChange={(e) => onUpdate('authorisingPosition', e.target.value)}
                  className="bg-transparent border-none outline-none text-gray-900 italic"
                />
              </div>
              <div>
                <span className="font-medium text-gray-700">Signature:</span>
                <div className="mt-2 border-b-2 border-gray-400 h-8 flex items-center">
                  <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">📝</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-lg border">
        <h3 className="font-medium text-gray-700 mb-2">Scope of Works</h3>
        <textarea
          value={formData.scopeOfWorks}
          onChange={(e) => onUpdate('scopeOfWorks', e.target.value)}
          className="w-full bg-transparent border-none outline-none text-gray-900 resize-none"
          rows={2}
        />
      </div>
      
      <div className="bg-gray-50 p-4 rounded-lg border">
        <h3 className="font-medium text-gray-700 mb-2">Review and Monitoring</h3>
        <textarea
          value={formData.reviewAndMonitoring}
          onChange={(e) => onUpdate('reviewAndMonitoring', e.target.value)}
          className="w-full bg-transparent border-none outline-none text-gray-900 resize-none"
          rows={3}
        />
      </div>
    </div>
    </div>
  </div>
);

// Emergency Information Page
const EmergencyInfoPage = ({ formData, onUpdate }: { formData: any, onUpdate: (field: string, value: any) => void }) => (
  <div className="relative space-y-6">
    <PageWatermark formData={formData} />
    <div className="relative z-10">
      <SWMSHeader formData={formData} onUpdate={onUpdate} />
      
      <h2 className="text-xl font-bold text-gray-900 mb-6">Emergency Information</h2>
    
    <div className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg border">
        <h3 className="font-medium text-gray-700 mb-3">Emergency Contacts</h3>
        <div className="space-y-2">
          {formData.emergencyContacts.map((contact: string, index: number) => (
            <div key={index} className="text-gray-900">
              <input
                type="text"
                value={contact}
                onChange={(e) => {
                  const newContacts = [...formData.emergencyContacts];
                  newContacts[index] = e.target.value;
                  onUpdate('emergencyContacts', newContacts);
                }}
                className="w-full bg-transparent border-none outline-none"
              />
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-lg border">
        <h3 className="font-medium text-gray-700 mb-3">Emergency Response Procedures</h3>
        <textarea
          value={formData.emergencyProcedures}
          onChange={(e) => onUpdate('emergencyProcedures', e.target.value)}
          className="w-full bg-transparent border-none outline-none text-gray-900 resize-none"
          rows={2}
        />
      </div>
      
      <div className="bg-gray-50 p-4 rounded-lg border">
        <h3 className="font-medium text-gray-700 mb-3">Monitoring & Review Requirements</h3>
        <div className="text-gray-900">
          <textarea
            value={formData.emergencyMonitoring}
            onChange={(e) => onUpdate('emergencyMonitoring', e.target.value)}
            className="w-full bg-transparent border-none outline-none resize-none"
            rows={3}
          />
        </div>
      </div>
    </div>
    </div>
  </div>
);

// High Risk Activities Page
const HighRiskActivitiesPage = ({ formData, onUpdate }: { formData: any, onUpdate: (field: string, value: any) => void }) => (
  <div className="relative space-y-6">
    <PageWatermark formData={formData} />
    <div className="relative z-10">
      <SWMSHeader formData={formData} onUpdate={onUpdate} />
      
      <h2 className="text-xl font-bold text-gray-900 mb-6">High Risk Activities</h2>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {formData.highRiskActivities.map((activity: any, index: number) => (
        <div 
          key={index} 
          className={`border rounded-lg p-4 cursor-pointer transition-all ${
            activity.selected ? 'bg-orange-50 border-orange-200' : 'bg-white border-gray-200'
          }`}
          onClick={() => {
            const newActivities = [...formData.highRiskActivities];
            newActivities[index].selected = !newActivities[index].selected;
            onUpdate('highRiskActivities', newActivities);
          }}
        >
          <div className="text-sm text-gray-800 leading-relaxed">
            {activity.name}
          </div>
        </div>
      ))}
    </div>
    </div>
  </div>
);

// Risk Matrix Page
const RiskMatrixPage = ({ formData, onUpdate }: { formData: any, onUpdate: (field: string, value: any) => void }) => (
  <div className="relative space-y-6">
    <PageWatermark formData={formData} />
    <div className="relative z-10">
      <SWMSHeader formData={formData} onUpdate={onUpdate} />
      
      <h2 className="text-xl font-bold text-gray-900 mb-6">Construction Control Risk Matrix</h2>
    
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left side - Risk definitions */}
      <div className="space-y-4">
        <div className="bg-gray-50 border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-200">
                <th className="text-left p-3 font-medium text-gray-700">Likelihood</th>
                <th className="text-left p-3 font-medium text-gray-700">Frequency</th>
                <th className="text-left p-3 font-medium text-gray-700">Probability</th>
                <th className="text-left p-3 font-medium text-gray-700">Value</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-3 text-gray-800">Almost Certain</td>
                <td className="p-3 text-gray-800">Weekly</td>
                <td className="p-3 text-gray-800">Very high</td>
                <td className="p-3 text-gray-800">5</td>
              </tr>
              <tr className="border-b">
                <td className="p-3 text-gray-800">Likely</td>
                <td className="p-3 text-gray-800">Monthly</td>
                <td className="p-3 text-gray-800">Good</td>
                <td className="p-3 text-gray-800">4</td>
              </tr>
              <tr className="border-b">
                <td className="p-3 text-gray-800">Possible</td>
                <td className="p-3 text-gray-800">Yearly</td>
                <td className="p-3 text-gray-800">Even</td>
                <td className="p-3 text-gray-800">3</td>
              </tr>
              <tr className="border-b">
                <td className="p-3 text-gray-800">Unlikely</td>
                <td className="p-3 text-gray-800">10 years</td>
                <td className="p-3 text-gray-800">Low</td>
                <td className="p-3 text-gray-800">2</td>
              </tr>
              <tr>
                <td className="p-3 text-gray-800">Rare</td>
                <td className="p-3 text-gray-800">Lifetime</td>
                <td className="p-3 text-gray-800">No chance</td>
                <td className="p-3 text-gray-800">1</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className="bg-gray-50 border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-200">
                <th className="text-left p-3 font-medium text-gray-700">Consequence</th>
                <th className="text-left p-3 font-medium text-gray-700">Description</th>
                <th className="text-left p-3 font-medium text-gray-700">Value</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-3 text-gray-800">Catastrophic</td>
                <td className="p-3 text-gray-800">Fatality, disability, $50,000+</td>
                <td className="p-3 text-gray-800">5</td>
              </tr>
              <tr className="border-b">
                <td className="p-3 text-gray-800">Major</td>
                <td className="p-3 text-gray-800">Amputation, $15,000-$50,000</td>
                <td className="p-3 text-gray-800">4</td>
              </tr>
              <tr className="border-b">
                <td className="p-3 text-gray-800">Moderate</td>
                <td className="p-3 text-gray-800">LTI/MTI, $1,000-$15,000</td>
                <td className="p-3 text-gray-800">3</td>
              </tr>
              <tr className="border-b">
                <td className="p-3 text-gray-800">Minor</td>
                <td className="p-3 text-gray-800">First Aid, $100-$1,000</td>
                <td className="p-3 text-gray-800">2</td>
              </tr>
              <tr>
                <td className="p-3 text-gray-800">Insignificant</td>
                <td className="p-3 text-gray-800">No treatment, $0-$100</td>
                <td className="p-3 text-gray-800">1</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Right side - Risk matrix and action table */}
      <div className="space-y-4">
        <div className="bg-gray-50 border rounded-lg p-4">
          <div className="text-sm text-gray-700 mb-2">Likelihood → Consequence ↓</div>
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-center p-2 font-medium text-gray-700">5</th>
                <th className="text-center p-2 font-medium text-gray-700">4</th>
                <th className="text-center p-2 font-medium text-gray-700">3</th>
                <th className="text-center p-2 font-medium text-gray-700">2</th>
                <th className="text-center p-2 font-medium text-gray-700">1</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="text-center p-2 bg-red-400 text-white font-bold">25</td>
                <td className="text-center p-2 bg-red-400 text-white font-bold">20</td>
                <td className="text-center p-2 bg-orange-400 text-white font-bold">15</td>
                <td className="text-center p-2 bg-orange-400 text-white font-bold">10</td>
                <td className="text-center p-2 bg-yellow-400 text-white font-bold">5</td>
              </tr>
              <tr>
                <td className="text-center p-2 bg-red-400 text-white font-bold">20</td>
                <td className="text-center p-2 bg-orange-400 text-white font-bold">16</td>
                <td className="text-center p-2 bg-orange-400 text-white font-bold">12</td>
                <td className="text-center p-2 bg-yellow-400 text-white font-bold">8</td>
                <td className="text-center p-2 bg-yellow-400 text-white font-bold">4</td>
              </tr>
              <tr>
                <td className="text-center p-2 bg-orange-400 text-white font-bold">15</td>
                <td className="text-center p-2 bg-orange-400 text-white font-bold">12</td>
                <td className="text-center p-2 bg-yellow-400 text-white font-bold">9</td>
                <td className="text-center p-2 bg-yellow-400 text-white font-bold">6</td>
                <td className="text-center p-2 bg-green-400 text-white font-bold">3</td>
              </tr>
              <tr>
                <td className="text-center p-2 bg-orange-400 text-white font-bold">10</td>
                <td className="text-center p-2 bg-yellow-400 text-white font-bold">8</td>
                <td className="text-center p-2 bg-yellow-400 text-white font-bold">6</td>
                <td className="text-center p-2 bg-green-400 text-white font-bold">4</td>
                <td className="text-center p-2 bg-green-400 text-white font-bold">2</td>
              </tr>
              <tr>
                <td className="text-center p-2 bg-yellow-400 text-white font-bold">5</td>
                <td className="text-center p-2 bg-yellow-400 text-white font-bold">4</td>
                <td className="text-center p-2 bg-green-400 text-white font-bold">3</td>
                <td className="text-center p-2 bg-green-400 text-white font-bold">2</td>
                <td className="text-center p-2 bg-green-400 text-white font-bold">1</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className="bg-gray-50 border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-200">
                <th className="text-left p-3 font-medium text-gray-700">Range</th>
                <th className="text-left p-3 font-medium text-gray-700">Risk</th>
                <th className="text-left p-3 font-medium text-gray-700">Action Required</th>
                <th className="text-left p-3 font-medium text-gray-700">Timeline</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b bg-red-100">
                <td className="p-3 text-gray-800">20-25</td>
                <td className="p-3 text-gray-800 font-bold">EXTREME</td>
                <td className="p-3 text-gray-800">Stop immediately</td>
                <td className="p-3 text-gray-800">Now</td>
              </tr>
              <tr className="border-b bg-orange-100">
                <td className="p-3 text-gray-800">10-16</td>
                <td className="p-3 text-gray-800 font-bold">HIGH</td>
                <td className="p-3 text-gray-800">Senior management</td>
                <td className="p-3 text-gray-800">24hrs</td>
              </tr>
              <tr className="border-b bg-yellow-100">
                <td className="p-3 text-gray-800">5-9</td>
                <td className="p-3 text-gray-800 font-bold">MEDIUM</td>
                <td className="p-3 text-gray-800">Management action</td>
                <td className="p-3 text-gray-800">48hrs</td>
              </tr>
              <tr className="bg-green-100">
                <td className="p-3 text-gray-800">1-4</td>
                <td className="p-3 text-gray-800 font-bold">LOW</td>
                <td className="p-3 text-gray-800">Routine procedures</td>
                <td className="p-3 text-gray-800">5 days</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </div>
  </div>
);

// Work Activities Page
const WorkActivitiesPage = ({ formData, onUpdate }: { formData: any, onUpdate: (field: string, value: any) => void }) => (
  <div className="relative space-y-6">
    <PageWatermark formData={formData} />
    <div className="relative z-10">
      <SWMSHeader formData={formData} onUpdate={onUpdate} />
      
      <h2 className="text-xl font-bold text-gray-900 mb-6">Work Activities & Risk Assessment</h2>
    
    <div className="bg-gray-50 border rounded-lg overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-200">
            <th className="text-left p-3 font-medium text-gray-700 w-8">#</th>
            <th className="text-left p-3 font-medium text-gray-700 w-1/6">Activity</th>
            <th className="text-left p-3 font-medium text-gray-700 w-1/4">Hazards</th>
            <th className="text-left p-3 font-medium text-gray-700 w-20">Initial Risk</th>
            <th className="text-left p-3 font-medium text-gray-700 w-1/4">Control Measures</th>
            <th className="text-left p-3 font-medium text-gray-700 w-20">Residual Risk</th>
            <th className="text-left p-3 font-medium text-gray-700 w-1/6">Legislation</th>
          </tr>
        </thead>
        <tbody>
          {formData.workActivities.map((activity: any, index: number) => (
            <tr key={activity.id} className="border-b">
              <td className="p-3 text-gray-800 align-top">{activity.id}</td>
              <td className="p-3 text-gray-800 align-top">
                <textarea
                  value={activity.activity}
                  onChange={(e) => {
                    const newActivities = [...formData.workActivities];
                    newActivities[index].activity = e.target.value;
                    onUpdate('workActivities', newActivities);
                  }}
                  className="w-full bg-transparent border-none outline-none resize-none"
                  rows={3}
                />
              </td>
              <td className="p-3 text-gray-800 align-top">
                <ul className="text-sm space-y-1">
                  {activity.hazards.map((hazard: string, hIndex: number) => (
                    <li key={hIndex} className="flex items-start">
                      <span className="mr-2">•</span>
                      <textarea
                        value={hazard}
                        onChange={(e) => {
                          const newActivities = [...formData.workActivities];
                          newActivities[index].hazards[hIndex] = e.target.value;
                          onUpdate('workActivities', newActivities);
                        }}
                        className="w-full bg-transparent border-none outline-none resize-none text-sm"
                        rows={1}
                      />
                    </li>
                  ))}
                </ul>
              </td>
              <td className="p-3 text-gray-800 align-top">
                <RiskBadgeNew level={activity.initialRisk.toLowerCase().includes('extreme') ? 'extreme' : 
                                    activity.initialRisk.toLowerCase().includes('high') ? 'high' : 
                                    activity.initialRisk.toLowerCase().includes('medium') ? 'medium' : 'low'} />
              </td>
              <td className="p-3 text-gray-800 align-top">
                <ul className="text-sm space-y-1">
                  {activity.controlMeasures.map((measure: string, mIndex: number) => (
                    <li key={mIndex} className="flex items-start">
                      <span className="mr-2">•</span>
                      <textarea
                        value={measure}
                        onChange={(e) => {
                          const newActivities = [...formData.workActivities];
                          newActivities[index].controlMeasures[mIndex] = e.target.value;
                          onUpdate('workActivities', newActivities);
                        }}
                        className="w-full bg-transparent border-none outline-none resize-none text-sm"
                        rows={1}
                      />
                    </li>
                  ))}
                </ul>
              </td>
              <td className="p-3 text-gray-800 align-top">
                <RiskBadgeNew level={activity.residualRisk.toLowerCase().includes('extreme') ? 'extreme' : 
                                    activity.residualRisk.toLowerCase().includes('high') ? 'high' : 
                                    activity.residualRisk.toLowerCase().includes('medium') ? 'medium' : 'low'} />
              </td>
              <td className="p-3 text-gray-800 align-top">
                <ul className="text-sm space-y-1">
                  {activity.legislation.map((law: string, lIndex: number) => (
                    <li key={lIndex} className="flex items-start">
                      <span className="mr-2">•</span>
                      <textarea
                        value={law}
                        onChange={(e) => {
                          const newActivities = [...formData.workActivities];
                          newActivities[index].legislation[lIndex] = e.target.value;
                          onUpdate('workActivities', newActivities);
                        }}
                        className="w-full bg-transparent border-none outline-none resize-none text-sm"
                        rows={1}
                      />
                    </li>
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
);

// PPE Page
const PPEPage = ({ formData, onUpdate }: { formData: any, onUpdate: (field: string, value: any) => void }) => (
  <div className="relative space-y-6">
    <PageWatermark formData={formData} />
    <div className="relative z-10">
      <SWMSHeader formData={formData} onUpdate={onUpdate} />
      
      <h2 className="text-xl font-bold text-gray-900 mb-6">Personal Protective Equipment (PPE)</h2>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {formData.ppeItems.map((item: any, index: number) => (
        <div 
          key={index} 
          className={`border rounded-lg p-4 cursor-pointer transition-all ${
            item.selected ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
          }`}
          onClick={() => {
            const newItems = [...formData.ppeItems];
            newItems[index].selected = !newItems[index].selected;
            onUpdate('ppeItems', newItems);
          }}
        >
          <div className="text-sm font-medium text-gray-800 mb-2">
            {item.name}
          </div>
          <div className="text-xs text-gray-600">
            {item.description}
          </div>
        </div>
      ))}
    </div>
    </div>
  </div>
);

// Plant Equipment Page
const PlantEquipmentPage = ({ formData, onUpdate }: { formData: any, onUpdate: (field: string, value: any) => void }) => (
  <div className="relative space-y-6">
    <PageWatermark formData={formData} />
    <div className="relative z-10">
      <SWMSHeader formData={formData} onUpdate={onUpdate} />
      
      <h2 className="text-xl font-bold text-gray-900 mb-6">Plant & Equipment</h2>
    
    <div className="bg-gray-50 border rounded-lg overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-200">
            <th className="text-left p-3 font-medium text-gray-700">Equipment</th>
            <th className="text-left p-3 font-medium text-gray-700">Model</th>
            <th className="text-left p-3 font-medium text-gray-700">Serial Number</th>
            <th className="text-left p-3 font-medium text-gray-700">Risk Level</th>
            <th className="text-left p-3 font-medium text-gray-700">Next Inspection</th>
            <th className="text-left p-3 font-medium text-gray-700">Certification</th>
          </tr>
        </thead>
        <tbody>
          {formData.plantEquipment.map((equipment: any, index: number) => (
            <tr key={index} className="border-b">
              <td className="p-3 text-gray-800">
                <input
                  type="text"
                  value={equipment.equipment}
                  onChange={(e) => {
                    const newEquipment = [...formData.plantEquipment];
                    newEquipment[index].equipment = e.target.value;
                    onUpdate('plantEquipment', newEquipment);
                  }}
                  className="w-full bg-transparent border-none outline-none"
                />
              </td>
              <td className="p-3 text-gray-800">
                <input
                  type="text"
                  value={equipment.model}
                  onChange={(e) => {
                    const newEquipment = [...formData.plantEquipment];
                    newEquipment[index].model = e.target.value;
                    onUpdate('plantEquipment', newEquipment);
                  }}
                  className="w-full bg-transparent border-none outline-none"
                />
              </td>
              <td className="p-3 text-gray-800">
                <input
                  type="text"
                  value={equipment.serialNumber}
                  onChange={(e) => {
                    const newEquipment = [...formData.plantEquipment];
                    newEquipment[index].serialNumber = e.target.value;
                    onUpdate('plantEquipment', newEquipment);
                  }}
                  className="w-full bg-transparent border-none outline-none"
                />
              </td>
              <td className="p-3 text-gray-800">
                <select
                  value={equipment.riskLevel}
                  onChange={(e) => {
                    const newEquipment = [...formData.plantEquipment];
                    newEquipment[index].riskLevel = e.target.value;
                    onUpdate('plantEquipment', newEquipment);
                  }}
                  className="w-full bg-transparent border-none outline-none"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Extreme">Extreme</option>
                </select>
              </td>
              <td className="p-3 text-gray-800">
                <input
                  type="text"
                  value={equipment.nextInspection}
                  onChange={(e) => {
                    const newEquipment = [...formData.plantEquipment];
                    newEquipment[index].nextInspection = e.target.value;
                    onUpdate('plantEquipment', newEquipment);
                  }}
                  className="w-full bg-transparent border-none outline-none"
                />
              </td>
              <td className="p-3 text-gray-800">
                <select
                  value={equipment.certification}
                  onChange={(e) => {
                    const newEquipment = [...formData.plantEquipment];
                    newEquipment[index].certification = e.target.value;
                    onUpdate('plantEquipment', newEquipment);
                  }}
                  className="w-full bg-transparent border-none outline-none"
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </div>
  </div>
);

// Sign In Register Page
const SignInRegisterPage = ({ formData, onUpdate }: { formData: any, onUpdate: (field: string, value: any) => void }) => {
  // Get signature data from SWMS builder
  const signatureData = [
    {
      name: formData.swmsCreatorName || formData.authorisingPerson || '',
      number: formData.jobNumber || '',
      signature: formData.signatureText || 'Signed',
      date: formData.startDate || new Date().toLocaleDateString()
    },
    {
      name: formData.principalContractor || '',
      number: formData.phone || '',
      signature: 'Signed',
      date: formData.startDate || new Date().toLocaleDateString()
    },
    {
      name: formData.projectManager || '',
      number: formData.phone || '',
      signature: 'Signed',
      date: formData.startDate || new Date().toLocaleDateString()
    },
    {
      name: formData.siteSupervisor || '',
      number: formData.phone || '',
      signature: 'Signed',
      date: formData.startDate || new Date().toLocaleDateString()
    }
  ];

  return (
    <div className="relative space-y-6">
      <PageWatermark formData={formData} />
      <div className="relative z-10">
        <SWMSHeader formData={formData} onUpdate={onUpdate} />
        
        <h2 className="text-xl font-bold text-gray-900 mb-6">Sign In Register</h2>
      
      <div className="bg-gray-50 border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-200">
              <th className="text-left p-3 font-medium text-gray-700 w-1/4">Name</th>
              <th className="text-left p-3 font-medium text-gray-700 w-1/4">Number</th>
              <th className="text-left p-3 font-medium text-gray-700 w-1/4">Signature</th>
              <th className="text-left p-3 font-medium text-gray-700 w-1/4">Date</th>
            </tr>
          </thead>
          <tbody>
            {/* Pre-populated signature data from SWMS builder */}
            {signatureData.map((sig, index) => (
              <tr key={index} className="border-b">
                <td className="p-3 h-16 border-r border-gray-300">
                  <input
                    type="text"
                    value={sig.name}
                    onChange={(e) => {
                      const newSignatures = [...signatureData];
                      newSignatures[index].name = e.target.value;
                      onUpdate('signatureData', newSignatures);
                    }}
                    className="w-full bg-transparent border-none outline-none text-gray-900"
                    placeholder="Enter name"
                  />
                </td>
                <td className="p-3 h-16 border-r border-gray-300">
                  <input
                    type="text"
                    value={sig.number}
                    onChange={(e) => {
                      const newSignatures = [...signatureData];
                      newSignatures[index].number = e.target.value;
                      onUpdate('signatureData', newSignatures);
                    }}
                    className="w-full bg-transparent border-none outline-none text-gray-900"
                    placeholder="Enter number"
                  />
                </td>
                <td className="p-3 h-16 border-r border-gray-300">
                  <input
                    type="text"
                    value={sig.signature}
                    onChange={(e) => {
                      const newSignatures = [...signatureData];
                      newSignatures[index].signature = e.target.value;
                      onUpdate('signatureData', newSignatures);
                    }}
                    className="w-full bg-transparent border-none outline-none text-gray-900"
                    placeholder="Signature"
                  />
                </td>
                <td className="p-3 h-16">
                  <input
                    type="text"
                    value={sig.date}
                    onChange={(e) => {
                      const newSignatures = [...signatureData];
                      newSignatures[index].date = e.target.value;
                      onUpdate('signatureData', newSignatures);
                    }}
                    className="w-full bg-transparent border-none outline-none text-gray-900"
                    placeholder="Date"
                  />
                </td>
              </tr>
            ))}
            {/* Additional empty rows */}
            {Array.from({ length: 4 }).map((_, index) => (
              <tr key={index + 4} className="border-b">
                <td className="p-3 h-16 border-r border-gray-300">
                  <input
                    type="text"
                    className="w-full bg-transparent border-none outline-none text-gray-900"
                    placeholder="Enter name"
                  />
                </td>
                <td className="p-3 h-16 border-r border-gray-300">
                  <input
                    type="text"
                    className="w-full bg-transparent border-none outline-none text-gray-900"
                    placeholder="Enter number"
                  />
                </td>
                <td className="p-3 h-16 border-r border-gray-300">
                  <input
                    type="text"
                    className="w-full bg-transparent border-none outline-none text-gray-900"
                    placeholder="Signature"
                  />
                </td>
                <td className="p-3 h-16">
                  <input
                    type="text"
                    className="w-full bg-transparent border-none outline-none text-gray-900"
                    placeholder="Date"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>
    </div>
  );
};

export default function SwmsComplete({ initialData }: { initialData?: any } = {}) {
  const [formData, setFormData] = useState(() => {
    // If initialData is provided, merge it with defaults
    if (initialData) {
      return {
        ...defaultFormData,
        ...initialData,
        // Map SWMS builder fields to SwmsComplete fields
        projectName: initialData.jobName || initialData.projectName || defaultFormData.projectName,
        projectNumber: initialData.jobNumber || initialData.projectNumber || defaultFormData.projectNumber,
        projectAddress: initialData.projectAddress || defaultFormData.projectAddress,
        companyName: initialData.companyName || defaultFormData.companyName,
        principalContractor: initialData.principalContractor || defaultFormData.principalContractor,
        projectManager: initialData.projectManager || defaultFormData.projectManager,
        siteSupervisor: initialData.siteSupervisor || defaultFormData.siteSupervisor,
        startDate: initialData.startDate || defaultFormData.startDate,
        workActivities: initialData.workActivities || initialData.selectedTasks || defaultFormData.workActivities,
        emergencyContacts: initialData.emergencyContacts || defaultFormData.emergencyContacts,
        emergencyProcedures: initialData.emergencyProcedures || defaultFormData.emergencyProcedures,
        highRiskActivities: initialData.hrcwCategories ? 
          defaultFormData.highRiskActivities.map(activity => ({
            ...activity,
            selected: initialData.hrcwCategories?.includes(activity.name) || false
          })) : defaultFormData.highRiskActivities,
        ppeRequirements: initialData.ppeRequirements || defaultFormData.ppeRequirements,
        plantEquipment: initialData.plantEquipment || defaultFormData.plantEquipment,
        companyLogo: initialData.companyLogo || defaultFormData.companyLogo,
        // Map signature data from SWMS builder
        swmsCreatorName: initialData.swmsCreatorName || initialData.authorisingPerson || defaultFormData.authorisingPerson,
        signatureText: initialData.signatureText || defaultFormData.signatureText,
        signatureImage: initialData.signatureImage || defaultFormData.signatureImage
      };
    }
    return defaultFormData;
  });
  const [currentPage, setCurrentPage] = useState<DocumentPage>('project-info');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Handle input changes
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Navigation tabs
  const navItems = [
    { id: 'project-info', title: 'Project Information', component: ProjectInfoPage },
    { id: 'emergency-info', title: 'Emergency Info', component: EmergencyInfoPage },
    { id: 'high-risk-activities', title: 'High Risk Activities', component: HighRiskActivitiesPage },
    { id: 'risk-matrix', title: 'Risk Matrix', component: RiskMatrixPage },
    { id: 'work-activities', title: 'Work Activities', component: WorkActivitiesPage },
    { id: 'ppe', title: 'PPE', component: PPEPage },
    { id: 'plant-equipment', title: 'Plant & Equipment', component: PlantEquipmentPage },
    { id: 'sign-in', title: 'Sign In Register', component: SignInRegisterPage }
  ];

  // PDF Generation functions
  const generatePNGPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      for (let i = 0; i < navItems.length; i++) {
        const navItem = navItems[i];
        setCurrentPage(navItem.id as DocumentPage);
        
        // Wait for re-render
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const element = document.getElementById('swms-content');
        if (element) {
          const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            allowTaint: true
          });
          
          const imgData = canvas.toDataURL('image/png');
          const imgWidth = 210;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          if (i > 0) pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        }
      }
      
      pdf.save('swms-document.pdf');
    } catch (error) {
      console.error('PDF generation error:', error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const generateVectorPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      // This would use @react-pdf/renderer for vector PDF generation
      // Implementation depends on specific requirements
      console.log('Vector PDF generation not implemented yet');
    } catch (error) {
      console.error('Vector PDF generation error:', error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const CurrentPageComponent = navItems.find(item => item.id === currentPage)?.component || ProjectInfoPage;

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Left Sidebar */}
      <div className="w-80 bg-white shadow-lg border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">SWMS Generator</h1>
        </div>
        
        <nav className="flex-1 overflow-y-auto">
          <div className="p-2 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id as DocumentPage)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentPage === item.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {item.title}
              </button>
            ))}
          </div>
        </nav>
        
        <div className="p-4 border-t border-gray-200 space-y-2">
          <button
            onClick={generatePNGPDF}
            disabled={isGeneratingPDF}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isGeneratingPDF ? 'Generating...' : 'Print'}
          </button>
          <button
            onClick={generatePNGPDF}
            disabled={isGeneratingPDF}
            className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {isGeneratingPDF ? 'Generating...' : 'Download'}
          </button>
          <button
            onClick={generateVectorPDF}
            disabled={isGeneratingPDF}
            className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50"
          >
            {isGeneratingPDF ? 'Generating...' : 'Vector'}
          </button>
          <button
            onClick={generatePNGPDF}
            disabled={isGeneratingPDF}
            className="w-full bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 disabled:opacity-50"
          >
            {isGeneratingPDF ? 'Generating...' : 'Final'}
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="bg-gray-100 min-h-full relative py-8">
          {/* Background Watermark */}
          <div className="absolute inset-0 pointer-events-none opacity-5 z-0">
            <div className="grid grid-cols-4 gap-20 h-full p-8">
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className="flex items-center justify-center">
                  <div className="transform rotate-45 text-4xl font-bold text-gray-400 text-center">
                    <div>{formData.projectName}</div>
                    <div className="text-2xl">{formData.projectNumber}</div>
                    <div className="text-2xl">{formData.projectAddress}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Content with A4 landscape dimensions */}
          <div 
            id="swms-content" 
            className="relative z-10 p-6"
            style={{
              width: '1400px',
              height: '990px',
              maxWidth: '1400px',
              margin: '0 auto',
              backgroundColor: 'white',
              transform: 'scale(0.7)',
              transformOrigin: 'top center',
              border: '1px solid #e5e7eb',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              aspectRatio: '1.414/1'
            }}
          >
            <CurrentPageComponent formData={formData} onUpdate={handleInputChange} />
          </div>
        </div>
      </div>
    </div>
  );
}