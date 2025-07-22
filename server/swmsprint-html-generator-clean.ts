// Clean SWMSprint HTML Generator - Professional SWMS Template System
export function generateSWMSHTML(swmsData: any): string {
  console.log('🎨 Generating professional SWMSprint-style HTML template');
  
  // Extract data with proper fallbacks
  const projectName = swmsData.jobName || swmsData.projectName || 'SWMS Document';
  const activities = swmsData.workActivities || swmsData.activities || [];
  const ppeRequirements = swmsData.ppeRequirements || [];
  const plantEquipment = swmsData.plantEquipment || [];
  const emergencyProcedures = swmsData.emergencyProcedures || '';
  
  console.log(`📊 Processing SWMS data: ${activities.length} activities, ${ppeRequirements.length} PPE items, ${plantEquipment.length} equipment items`);

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SWMS - ${projectName}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #ffffff;
            padding: 40px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
        }
        
        .header {
            background: linear-gradient(135deg, #2c5530 0%, #3d7c47 100%);
            color: white;
            padding: 40px;
            border-radius: 15px;
            margin-bottom: 40px;
            box-shadow: 0 8px 32px rgba(44, 85, 48, 0.3);
            position: relative;
            overflow: hidden;
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -20%;
            width: 300px;
            height: 300px;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
            border-radius: 50%;
        }
        
        .header-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            position: relative;
            z-index: 2;
        }
        
        .header h1 {
            font-size: 3rem;
            font-weight: 800;
            margin-bottom: 10px;
            text-shadow: 2px 2px 8px rgba(0,0,0,0.3);
            letter-spacing: 2px;
        }
        
        .header .subtitle {
            font-size: 1.3rem;
            opacity: 0.95;
            font-weight: 300;
            letter-spacing: 1px;
        }
        
        .doc-info {
            text-align: right;
            background: rgba(255,255,255,0.15);
            padding: 25px;
            border-radius: 12px;
            border: 1px solid rgba(255,255,255,0.3);
            backdrop-filter: blur(10px);
        }
        
        .doc-info p {
            margin: 6px 0;
            font-size: 1rem;
            font-weight: 500;
        }
        
        .section {
            background: linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%);
            margin: 35px 0;
            border-radius: 20px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
            overflow: hidden;
            border: 1px solid #e9ecef;
        }
        
        .section-header {
            background: linear-gradient(90deg, #f1f3f4 0%, #e8f0fe 100%);
            padding: 25px 35px;
            border-bottom: 3px solid #2c5530;
            position: relative;
        }
        
        .section-header::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 6px;
            background: linear-gradient(180deg, #2c5530 0%, #3d7c47 100%);
        }
        
        .section-header h2 {
            color: #2c5530;
            font-size: 1.6rem;
            font-weight: 700;
            display: flex;
            align-items: center;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .section-header h2::before {
            content: '▶';
            color: #2c5530;
            margin-right: 15px;
            font-size: 1rem;
        }
        
        .section-content {
            padding: 35px;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
            gap: 25px;
            margin: 20px 0;
        }
        
        .info-item {
            background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
            padding: 20px;
            border-radius: 12px;
            border-left: 5px solid #2c5530;
            box-shadow: 0 4px 15px rgba(0,0,0,0.05);
            transition: transform 0.2s ease;
        }
        
        .info-item:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.1);
        }
        
        .info-label {
            font-weight: 700;
            color: #495057;
            font-size: 0.95rem;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 0.8px;
        }
        
        .info-value {
            color: #2c5530;
            font-size: 1.1rem;
            font-weight: 600;
        }
        
        .activity-card {
            background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
            border: 2px solid #dee2e6;
            border-radius: 15px;
            margin: 25px 0;
            overflow: hidden;
            box-shadow: 0 8px 25px rgba(0,0,0,0.08);
        }
        
        .activity-header {
            background: linear-gradient(90deg, #2c5530 0%, #3d7c47 100%);
            color: white;
            padding: 20px 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .activity-title {
            font-size: 1.3rem;
            font-weight: 700;
            text-shadow: 1px 1px 3px rgba(0,0,0,0.3);
        }
        
        .risk-badge {
            background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
            color: white;
            padding: 8px 16px;
            border-radius: 25px;
            font-size: 0.9rem;
            font-weight: 700;
            box-shadow: 0 4px 15px rgba(220, 53, 69, 0.4);
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .activity-content {
            padding: 30px;
        }
        
        .activity-description {
            background: linear-gradient(135deg, #e7f3ff 0%, #d4edff 100%);
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 25px;
            border-left: 5px solid #0066cc;
            font-weight: 500;
        }
        
        .hazards-section {
            margin: 25px 0;
        }
        
        .hazards-section h4 {
            color: #c53030;
            margin-bottom: 20px;
            font-size: 1.2rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .hazard-item {
            background: linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%);
            border: 2px solid #fed7d7;
            border-radius: 12px;
            padding: 25px;
            margin: 20px 0;
            border-left: 6px solid #e53e3e;
            box-shadow: 0 4px 15px rgba(229, 62, 62, 0.1);
        }
        
        .hazard-description {
            font-weight: 700;
            color: #c53030;
            margin-bottom: 15px;
            font-size: 1.1rem;
        }
        
        .controls-list {
            list-style: none;
            padding-left: 0;
        }
        
        .controls-list li {
            background: linear-gradient(135deg, #f0fff4 0%, #c6f6d5 100%);
            padding: 12px 20px;
            margin: 10px 0;
            border-radius: 8px;
            border-left: 4px solid #38a169;
            position: relative;
            padding-left: 45px;
            font-weight: 500;
            box-shadow: 0 2px 8px rgba(56, 161, 105, 0.1);
        }
        
        .controls-list li::before {
            content: '✓';
            position: absolute;
            left: 15px;
            color: #38a169;
            font-weight: bold;
            font-size: 1.2rem;
        }
        
        .ppe-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }
        
        .ppe-item {
            background: linear-gradient(135deg, #fff5b7 0%, #fffacd 100%);
            padding: 20px;
            border-radius: 12px;
            text-align: center;
            border: 3px solid #ffd700;
            font-weight: 700;
            color: #b8860b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
            transition: transform 0.2s ease;
        }
        
        .ppe-item:hover {
            transform: scale(1.05);
        }
        
        .equipment-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 8px 25px rgba(0,0,0,0.1);
        }
        
        .equipment-table th {
            background: linear-gradient(90deg, #2c5530 0%, #3d7c47 100%);
            color: white;
            padding: 20px;
            text-align: left;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .equipment-table td {
            padding: 18px 20px;
            border-bottom: 1px solid #dee2e6;
            font-weight: 500;
        }
        
        .equipment-table tr:nth-child(even) {
            background: #f8f9fa;
        }
        
        .equipment-table tr:hover {
            background: #e9ecef;
        }
        
        .risk-level {
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .risk-low { 
            background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%); 
            color: #155724; 
            border: 2px solid #b8dabc;
        }
        .risk-medium { 
            background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%); 
            color: #856404; 
            border: 2px solid #ffd93d;
        }
        .risk-high { 
            background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%); 
            color: #721c24; 
            border: 2px solid #f1aeb5;
        }
        
        .footer {
            background: linear-gradient(135deg, #2c5530 0%, #3d7c47 100%);
            color: white;
            text-align: center;
            padding: 40px;
            margin-top: 50px;
            border-radius: 15px;
            box-shadow: 0 8px 32px rgba(44, 85, 48, 0.3);
        }
        
        .footer p {
            margin: 8px 0;
            font-weight: 500;
        }
        
        .footer p:first-child {
            font-size: 1.2rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 10rem;
            color: rgba(44, 85, 48, 0.03);
            font-weight: 900;
            z-index: -1;
            user-select: none;
            pointer-events: none;
            letter-spacing: 2rem;
        }
        
        @media print {
            body { padding: 20px; }
            .container { box-shadow: none; }
            .watermark { display: block; }
        }
    </style>
</head>
<body>
    <div class="watermark">RISKIFY</div>
    
    <div class="container">
        <!-- Professional Header Section -->
        <div class="header">
            <div class="header-content">
                <div>
                    <h1>RISKIFY</h1>
                    <div class="subtitle">Safe Work Method Statement</div>
                </div>
                <div class="doc-info">
                    <p><strong>Document ID:</strong> ${swmsData.id || 'SWMS-' + Date.now()}</p>
                    <p><strong>Generated:</strong> ${new Date().toLocaleDateString('en-AU')}</p>
                    <p><strong>Version:</strong> ${swmsData.documentVersion || '1.0'}</p>
                    <p><strong>Status:</strong> Professional Grade</p>
                </div>
            </div>
        </div>

        <!-- Project Information Section -->
        <div class="section">
            <div class="section-header">
                <h2>Project Information</h2>
            </div>
            <div class="section-content">
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">Project Name</div>
                        <div class="info-value">${projectName}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Job Number</div>
                        <div class="info-value">${swmsData.jobNumber || 'N/A'}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Project Address</div>
                        <div class="info-value">${swmsData.projectAddress || 'N/A'}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Trade Type</div>
                        <div class="info-value">${swmsData.tradeType || 'General Construction'}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Start Date</div>
                        <div class="info-value">${swmsData.startDate || 'N/A'}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Project Description</div>
                        <div class="info-value">${swmsData.projectDescription || swmsData.workDescription || 'N/A'}</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Personnel Information Section -->
        <div class="section">
            <div class="section-header">
                <h2>Personnel Information</h2>
            </div>
            <div class="section-content">
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">Principal Contractor</div>
                        <div class="info-value">${swmsData.principalContractor || 'N/A'}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Project Manager</div>
                        <div class="info-value">${swmsData.projectManager || 'N/A'}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Site Supervisor</div>
                        <div class="info-value">${swmsData.siteSupervisor || 'N/A'}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">SWMS Creator</div>
                        <div class="info-value">${swmsData.swmsCreatorName || 'N/A'}</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Work Activities Section -->
        ${activities.length > 0 ? `
        <div class="section">
            <div class="section-header">
                <h2>Work Activities & Risk Assessment</h2>
            </div>
            <div class="section-content">
                ${activities.map((activity, index) => `
                    <div class="activity-card">
                        <div class="activity-header">
                            <div class="activity-title">${index + 1}. ${activity.name || 'Activity'}</div>
                            <div class="risk-badge">Risk: ${activity.riskScore || 'N/A'}/20</div>
                        </div>
                        <div class="activity-content">
                            <div class="activity-description">
                                <strong>Description:</strong> ${activity.description || 'No description provided'}
                            </div>
                            
                            ${activity.hazards && activity.hazards.length > 0 ? `
                                <div class="hazards-section">
                                    <h4>Identified Hazards & Controls</h4>
                                    ${activity.hazards.map(hazard => `
                                        <div class="hazard-item">
                                            <div class="hazard-description">${hazard.description || hazard.name || 'Hazard'}</div>
                                            ${hazard.controlMeasures && hazard.controlMeasures.length > 0 ? `
                                                <div style="margin-top: 15px;">
                                                    <strong style="color: #38a169;">Control Measures:</strong>
                                                    <ul class="controls-list">
                                                        ${hazard.controlMeasures.map(control => `<li>${control}</li>`).join('')}
                                                    </ul>
                                                </div>
                                            ` : ''}
                                        </div>
                                    `).join('')}
                                </div>
                            ` : ''}
                            
                            ${activity.ppe && activity.ppe.length > 0 ? `
                                <div style="margin-top: 25px;">
                                    <h4 style="color: #b8860b; margin-bottom: 15px;">Activity-Specific PPE</h4>
                                    <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                                        ${activity.ppe.map(ppe => `<span style="background: linear-gradient(135deg, #fff5b7 0%, #fffacd 100%); padding: 6px 12px; border-radius: 6px; font-size: 0.9rem; border: 2px solid #ffd700; font-weight: 600;">${ppe}</span>`).join('')}
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        ` : ''}

        <!-- PPE Requirements Section -->
        ${ppeRequirements.length > 0 ? `
        <div class="section">
            <div class="section-header">
                <h2>Personal Protective Equipment (PPE)</h2>
            </div>
            <div class="section-content">
                <div class="ppe-grid">
                    ${ppeRequirements.map(ppe => `
                        <div class="ppe-item">${ppe}</div>
                    `).join('')}
                </div>
            </div>
        </div>
        ` : ''}

        <!-- Plant & Equipment Section -->
        ${plantEquipment.length > 0 ? `
        <div class="section">
            <div class="section-header">
                <h2>Plant & Equipment Register</h2>
            </div>
            <div class="section-content">
                <table class="equipment-table">
                    <thead>
                        <tr>
                            <th>Equipment Name</th>
                            <th>Risk Level</th>
                            <th>Certification Required</th>
                            <th>Next Inspection</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${plantEquipment.map(equipment => `
                            <tr>
                                <td><strong>${equipment.name || equipment}</strong></td>
                                <td>
                                    <span class="risk-level risk-${(equipment.riskLevel || 'medium').toLowerCase()}">
                                        ${equipment.riskLevel || 'Medium'}
                                    </span>
                                </td>
                                <td>${equipment.certificationRequired || 'Not Specified'}</td>
                                <td>${equipment.nextInspectionDue || 'As Required'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
        ` : ''}

        <!-- Emergency Procedures Section -->
        ${emergencyProcedures ? `
        <div class="section">
            <div class="section-header">
                <h2>Emergency Procedures & Contacts</h2>
            </div>
            <div class="section-content">
                <div style="background: linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%); padding: 30px; border-radius: 12px; border-left: 6px solid #e53e3e; box-shadow: 0 4px 15px rgba(229, 62, 62, 0.1);">
                    <p style="white-space: pre-line; font-weight: 500; line-height: 1.8;">${emergencyProcedures}</p>
                </div>
            </div>
        </div>
        ` : ''}

        <!-- Professional Footer -->
        <div class="footer">
            <p>Generated by Riskify SWMS Builder</p>
            <p>Professional-Grade Safety Documentation System</p>
            <p>Document generated on ${new Date().toLocaleDateString('en-AU')} at ${new Date().toLocaleTimeString('en-AU')}</p>
            <p>© 2025 Riskify - Ensuring Workplace Safety Excellence</p>
        </div>
    </div>
</body>
</html>`;
}