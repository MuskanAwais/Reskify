/**
 * COMPREHENSIVE TEST SWMS CREATION SCRIPT
 * Creates a complete SWMS document with data at every step to test SWMSprint integration
 */

async function createComprehensiveTestSWMS() {
  console.log('🚀 Starting comprehensive SWMS test creation...');
  
  try {
    // Step 1: Project & Contractor Details
    console.log('📝 Step 1: Creating project details...');
    const step1Data = {
      jobName: 'Commercial Office Electrical Installation',
      jobNumber: 'ELEC-2025-001', 
      projectAddress: '123 Collins Street, Melbourne VIC 3000',
      projectLocation: 'Level 15, Office Tower A',
      startDate: '2025-01-15',
      duration: '4 weeks',
      projectDescription: 'Complete electrical fit-out for new commercial office space including power distribution, lighting systems, data cabling, and emergency systems installation',
      workDescription: 'Installation of electrical infrastructure for 500 sqm commercial office including 120V/240V power circuits, LED lighting systems, fire alarm integration, and structured data cabling',
      swmsCreatorName: 'John Smith',
      swmsCreatorPosition: 'Licensed Electrician',
      principalContractor: 'ABC Construction Pty Ltd',
      principalContractorAbn: '12 345 678 901',
      projectManager: 'Sarah Wilson',
      siteSupervisor: 'Mike Johnson',
      subcontractor: 'Elite Electrical Services',
      subcontractorAbn: '98 765 432 109',
      companyLogo: '/api/placeholder/200/100',
      tradeType: 'Electrical'
    };

    // Step 2: Work Activities & Risk Assessment
    console.log('⚡ Step 2: Creating electrical work activities...');
    const workActivities = [
      {
        name: 'Cable Installation in Ceiling Void',
        hazards: ['Electrical shock from live circuits', 'Falls from height while accessing ceiling', 'Manual handling of heavy cable drums', 'Asbestos exposure in old buildings'],
        controlMeasures: ['Lockout/tagout procedures before work', 'Use appropriate scaffolding or EWP', 'Team lifting for heavy items', 'Asbestos survey completed before work'],
        initialRisk: 'High',
        residualRisk: 'Low',
        riskRating: 'Medium',
        legislation: ['NSW WHS Regulation 2017 - Section 140 (Electrical Work)', 'AS/NZS 3000:2018 Electrical Installations', 'AS/NZS 1768:2007 Lightning Protection']
      },
      {
        name: 'Power Distribution Board Installation',
        hazards: ['Arc flash from electrical equipment', 'Electrical burns from live parts', 'Eye injuries from arc flash', 'Falls from ladders during installation'],
        controlMeasures: ['De-energize circuits before work', 'Use appropriate PPE including arc flash suits', 'Install temporary barriers', 'Use stable platform instead of ladders'],
        initialRisk: 'Extreme',
        residualRisk: 'Medium', 
        riskRating: 'High',
        legislation: ['NSW WHS Regulation 2017 - Section 145 (Live Electrical Work)', 'AS/NZS 4836:2011 Safe Working on Low Voltage Installations']
      },
      {
        name: 'LED Lighting System Installation',
        hazards: ['Falls from height during ceiling work', 'Electrical shock from wiring', 'Cuts from sharp metal fixtures', 'Repetitive strain from overhead work'],
        controlMeasures: ['Use EWP or proper scaffolding', 'Test circuits before connection', 'Wear cut-resistant gloves', 'Rotate workers to prevent fatigue'],
        initialRisk: 'Medium',
        residualRisk: 'Low',
        riskRating: 'Low', 
        legislation: ['AS/NZS 60598.1:2017 Luminaires Safety Requirements', 'AS/NZS 1680.1:2006 Interior and Workplace Lighting']
      }
    ];

    // Step 3: High-Risk Construction Work
    console.log('⚠️ Step 3: Selecting HRCW categories...');
    const hrcwCategories = [
      { id: 1, name: 'Electrical Work', selected: true, description: 'High voltage electrical installation' },
      { id: 16, name: 'Use of Chemicals', selected: true, description: 'Electrical cleaning solvents' }
    ];

    // Step 4: Personal Protective Equipment
    console.log('🦺 Step 4: Setting up PPE requirements...');
    const ppeRequirements = [
      { name: 'Safety Helmet', required: true, standard: 'AS/NZS 1801:1997', type: 'standard' },
      { name: 'Safety Boots', required: true, standard: 'AS/NZS 2210.3:2009', type: 'standard' },
      { name: 'High-Vis Vest', required: true, standard: 'AS/NZS 4602.1:2011', type: 'standard' },
      { name: 'Safety Glasses', required: true, standard: 'AS/NZS 1337.1:2010', type: 'standard' },
      { name: 'Insulated Gloves', required: true, standard: 'AS/NZS 2225:1994', type: 'task-specific' },
      { name: 'Arc Flash Suit', required: true, standard: 'AS/NZS 4836:2011', type: 'task-specific' },
      { name: 'Voltage Detector', required: true, standard: 'AS/NZS 61243.3:2014', type: 'task-specific' }
    ];

    // Step 5: Plant & Equipment Register
    console.log('🔧 Step 5: Setting up plant & equipment...');
    const plantEquipment = [
      {
        name: 'Elevated Work Platform (EWP)',
        type: 'Access Equipment',
        riskLevel: 'High',
        certificationRequired: 'Required',
        nextInspectionDue: '2025-02-01',
        operator: 'Licensed Operator Required'
      },
      {
        name: 'Cable Pulling System',
        type: 'Installation Equipment', 
        riskLevel: 'Medium',
        certificationRequired: 'Not Required',
        nextInspectionDue: '2025-03-01',
        operator: 'Trained Personnel'
      },
      {
        name: 'Multimeter Testing Equipment',
        type: 'Testing Equipment',
        riskLevel: 'Low', 
        certificationRequired: 'Required',
        nextInspectionDue: '2025-01-20',
        operator: 'Licensed Electrician'
      }
    ];

    // Step 6: Emergency Procedures & Monitoring
    console.log('🚨 Step 6: Setting up emergency procedures...');
    const emergencyProcedures = {
      emergencyContacts: [
        { name: 'Site Supervisor', phone: '0400 123 456', role: 'Primary Contact' },
        { name: 'Electrical Safety Officer', phone: '0400 789 012', role: 'Technical Support' },
        { name: 'Emergency Services', phone: '000', role: 'Emergency Response' }
      ],
      nearestHospital: 'Royal Melbourne Hospital - 300 Grattan Street, Parkville VIC 3050',
      firstAidArrangements: 'Qualified first aid officer on site during all work hours. First aid kit located in site office and mobile first aid kit with electrical work crew.',
      emergencyResponseProcedures: 'In case of electrical incident: 1) Ensure area is safe, 2) Call 000 if required, 3) Notify site supervisor, 4) Isolate electrical supply if safe to do so, 5) Administer first aid if qualified, 6) Document incident',
      evacuationProcedures: 'Assembly point at main building entrance. Follow building evacuation procedures and emergency wardens.',
      spillResponse: 'Contain electrical cleaning solvents using spill kit. Ventilate area and notify environmental officer.'
    };

    // Step 7: Digital Signatures
    console.log('✍️ Step 7: Setting up digital signatures...');
    const signatures = [
      {
        role: 'SWMS Creator',
        name: 'John Smith',
        position: 'Licensed Electrician',
        signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        date: new Date().toISOString(),
        licenseNumber: 'NSW-ELEC-12345'
      },
      {
        role: 'Site Supervisor', 
        name: 'Mike Johnson',
        position: 'Construction Supervisor',
        signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        date: new Date().toISOString(),
        licenseNumber: 'NSW-BUILD-67890'
      }
    ];

    // Create comprehensive SWMS data object
    const comprehensiveSwmsData = {
      // Step 1 - Project Details
      ...step1Data,
      
      // Step 2 - Work Activities
      activities: workActivities.map(a => a.name),
      workActivities: workActivities,
      riskAssessments: workActivities,
      
      // Step 3 - HRCW
      isHighRiskWork: true,
      hrcwCategories: hrcwCategories,
      highRiskActivities: hrcwCategories.filter(h => h.selected).map(h => h.name),
      whsRegulations: ['NSW WHS Regulation 2017 - Section 140', 'NSW WHS Regulation 2017 - Section 145'],
      highRiskJustification: 'Electrical work involves high voltage systems and potential for serious injury',
      
      // Step 4 - PPE
      ppeRequirements: ppeRequirements,
      
      // Step 5 - Plant & Equipment  
      plantEquipment: plantEquipment,
      
      // Step 6 - Emergency
      ...emergencyProcedures,
      
      // Step 7 - Signatures
      signatures: signatures,
      signatureMethod: 'upload',
      signatureImage: signatures[0].signature,
      signatureText: signatures[0].name,
      requiresSignature: true,
      signatureStatus: 'signed',
      signedAt: new Date().toISOString(),
      signedBy: signatures[0].name,
      signatureTitle: signatures[0].position,
      signatureData: signatures[0].signature,
      witnessName: signatures[1].name,
      witnessSignature: signatures[1].signature,
      witnessSignedAt: new Date().toISOString(),
      
      // Additional comprehensive fields
      trainingRequirements: [
        { training: 'Working at Heights', required: true, certification: 'RIIWHS204D' },
        { training: 'Electrical Safety', required: true, certification: 'Licensed Electrician' }
      ],
      competencyRequirements: [
        { competency: 'LV Electrical License', level: 'Licensed', evidence: 'NSW Electrical License' }
      ],
      permitsRequired: ['Hot Works Permit', 'Electrical Isolation Permit'],
      reviewProcess: {
        frequency: 'Weekly',
        reviewer: 'Site Supervisor',
        criteria: 'Safety compliance and work progress'
      },
      monitoringRequirements: 'Daily toolbox talks, weekly safety inspections, continuous voltage monitoring',
      safetyMeasures: {
        isolationProcedures: 'LOTO procedures for all electrical work',
        testingRequirements: 'Test before touch policy',
        communicationProtocols: 'Radio contact every 30 minutes'
      },
      complianceCodes: ['AS/NZS 3000:2018', 'AS/NZS 4836:2011', 'NSW WHS Regulation 2017'],
      documentHash: 'sha256-' + Math.random().toString(36).substring(7),
      aiEnhanced: true,
      creditsCost: 1,
      
      // System fields
      userId: 999,
      status: 'completed',
      currentStep: 9
    };

    console.log('💾 Saving comprehensive SWMS document...');
    
    // Save the comprehensive SWMS
    const response = await fetch('/api/swms/draft', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(comprehensiveSwmsData)
    });

    const result = await response.json();
    
    if (result.success) {
      console.log(`✅ Comprehensive SWMS created successfully with ID: ${result.id}`);
      
      // Test SWMSprint PDF generation
      console.log('🖨️ Testing SWMSprint PDF generation...');
      
      const pdfResponse = await fetch(`/api/swms/${result.id}/pdf-download`, {
        method: 'GET'
      });
      
      if (pdfResponse.ok) {
        console.log('✅ SWMSprint PDF generation successful!');
        console.log('📊 Response headers:', Object.fromEntries(pdfResponse.headers.entries()));
        
        // Test preview as well
        const previewResponse = await fetch(`/api/swms/${result.id}/pdf-preview`, {
          method: 'GET'
        });
        
        if (previewResponse.ok) {
          console.log('✅ SWMSprint PDF preview successful!');
        } else {
          console.log('❌ PDF preview failed:', previewResponse.status);
        }
        
      } else {
        console.log('❌ PDF generation failed:', pdfResponse.status);
        const errorText = await pdfResponse.text();
        console.log('Error details:', errorText);
      }
      
      return result.id;
      
    } else {
      console.log('❌ Failed to create SWMS:', result);
      return null;
    }
    
  } catch (error) {
    console.error('❌ Error creating comprehensive test SWMS:', error);
    return null;
  }
}

// Run the test
createComprehensiveTestSWMS().then(id => {
  if (id) {
    console.log(`🎉 Test completed! SWMS ID: ${id}`);
    console.log('📍 Navigate to My SWMS to see the document');
    console.log('🔍 Check if all 79 fields are properly mapped to SWMSprint');
  } else {
    console.log('❌ Test failed - check console for errors');
  }
});