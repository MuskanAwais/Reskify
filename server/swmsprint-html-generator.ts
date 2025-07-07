// SWMSprint HTML Generator - generates HTML content for PDF conversion
import type { SWMSDocument } from "@shared/schema";

export function generateSWMSHTML(swmsDoc: SWMSDocument): string {
  const activities = swmsDoc.workActivities || [];
  const ppeRequirements = swmsDoc.ppeRequirements || [];
  const plantEquipment = swmsDoc.plantEquipment || [];
  const emergencyProcedures = swmsDoc.emergencyProcedures || '';

  return `
    <div style="width: 100%; max-width: 1120px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
      <!-- Header Section -->
      <div style="background: #2c5530; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h1 style="margin: 0; font-size: 24px; font-weight: bold;">RISKIFY</h1>
            <p style="margin: 5px 0 0 0; font-size: 14px;">Safe Work Method Statement</p>
          </div>
          <div style="text-align: right;">
            <p style="margin: 0; font-size: 14px;">Document ID: ${swmsDoc.id}</p>
            <p style="margin: 5px 0 0 0; font-size: 14px;">Generated: ${new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <!-- Project Information -->
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="margin: 0 0 15px 0; color: #2c5530; font-size: 20px;">Project Information</h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
          <div>
            <p style="margin: 0; font-weight: bold; color: #666;">Project Name:</p>
            <p style="margin: 5px 0 15px 0;">${swmsDoc.projectName || 'N/A'}</p>
          </div>
          <div>
            <p style="margin: 0; font-weight: bold; color: #666;">Job Number:</p>
            <p style="margin: 5px 0 15px 0;">${swmsDoc.jobNumber || 'N/A'}</p>
          </div>
          <div>
            <p style="margin: 0; font-weight: bold; color: #666;">Project Address:</p>
            <p style="margin: 5px 0 15px 0;">${swmsDoc.projectAddress || 'N/A'}</p>
          </div>
          <div>
            <p style="margin: 0; font-weight: bold; color: #666;">Trade Type:</p>
            <p style="margin: 5px 0 15px 0;">${swmsDoc.tradeType || 'N/A'}</p>
          </div>
        </div>
      </div>

      <!-- Personnel Information -->
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="margin: 0 0 15px 0; color: #2c5530; font-size: 20px;">Personnel Information</h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
          <div>
            <p style="margin: 0; font-weight: bold; color: #666;">Principal Contractor:</p>
            <p style="margin: 5px 0 15px 0;">${swmsDoc.principalContractor || 'N/A'}</p>
          </div>
          <div>
            <p style="margin: 0; font-weight: bold; color: #666;">Project Manager:</p>
            <p style="margin: 5px 0 15px 0;">${swmsDoc.projectManager || 'N/A'}</p>
          </div>
          <div>
            <p style="margin: 0; font-weight: bold; color: #666;">Site Supervisor:</p>
            <p style="margin: 5px 0 15px 0;">${swmsDoc.siteSupervisor || 'N/A'}</p>
          </div>
          <div>
            <p style="margin: 0; font-weight: bold; color: #666;">SWMS Creator:</p>
            <p style="margin: 5px 0 15px 0;">${swmsDoc.swmsCreatorName || 'N/A'}</p>
          </div>
        </div>
      </div>

      <!-- Work Activities -->
      ${activities.length > 0 ? `
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="margin: 0 0 15px 0; color: #2c5530; font-size: 20px;">Work Activities & Risk Assessment</h2>
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          <thead>
            <tr style="background: #2c5530; color: white;">
              <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Activity</th>
              <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Hazards</th>
              <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Initial Risk</th>
              <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Control Measures</th>
              <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Residual Risk</th>
            </tr>
          </thead>
          <tbody>
            ${activities.map((activity, index) => `
              <tr style="background: ${index % 2 === 0 ? '#ffffff' : '#f8f9fa'};">
                <td style="padding: 12px; border: 1px solid #ddd; vertical-align: top;">
                  <strong>${activity.name || 'N/A'}</strong>
                </td>
                <td style="padding: 12px; border: 1px solid #ddd; vertical-align: top;">
                  ${activity.hazards || 'N/A'}
                </td>
                <td style="padding: 12px; border: 1px solid #ddd; vertical-align: top;">
                  <span style="background: ${getRiskColor(activity.initialRisk)}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                    ${activity.initialRisk || 'N/A'}
                  </span>
                </td>
                <td style="padding: 12px; border: 1px solid #ddd; vertical-align: top;">
                  ${activity.controlMeasures || 'N/A'}
                </td>
                <td style="padding: 12px; border: 1px solid #ddd; vertical-align: top;">
                  <span style="background: ${getRiskColor(activity.residualRisk)}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                    ${activity.residualRisk || 'N/A'}
                  </span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      ` : ''}

      <!-- PPE Requirements -->
      ${ppeRequirements.length > 0 ? `
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="margin: 0 0 15px 0; color: #2c5530; font-size: 20px;">Personal Protective Equipment (PPE)</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 10px;">
          ${ppeRequirements.map(ppe => `
            <div style="background: white; padding: 15px; border-radius: 6px; border: 1px solid #ddd;">
              <h3 style="margin: 0 0 10px 0; color: #2c5530; font-size: 16px;">${ppe.name || 'N/A'}</h3>
              <p style="margin: 0; font-size: 14px; color: #666;">${ppe.description || 'Standard PPE requirement'}</p>
              <p style="margin: 10px 0 0 0; font-size: 12px; color: #999;">
                Standard: ${ppe.standard || 'AS/NZS Standard'}
              </p>
            </div>
          `).join('')}
        </div>
      </div>
      ` : ''}

      <!-- Plant & Equipment -->
      ${plantEquipment.length > 0 ? `
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="margin: 0 0 15px 0; color: #2c5530; font-size: 20px;">Plant & Equipment Register</h2>
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          <thead>
            <tr style="background: #2c5530; color: white;">
              <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Equipment/Tool</th>
              <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Risk Level</th>
              <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Certification Required</th>
              <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Next Inspection</th>
            </tr>
          </thead>
          <tbody>
            ${plantEquipment.map((equipment, index) => `
              <tr style="background: ${index % 2 === 0 ? '#ffffff' : '#f8f9fa'};">
                <td style="padding: 12px; border: 1px solid #ddd;">${equipment.name || 'N/A'}</td>
                <td style="padding: 12px; border: 1px solid #ddd;">
                  <span style="background: ${getRiskColor(equipment.riskLevel)}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                    ${equipment.riskLevel || 'N/A'}
                  </span>
                </td>
                <td style="padding: 12px; border: 1px solid #ddd;">${equipment.certificationRequired || 'N/A'}</td>
                <td style="padding: 12px; border: 1px solid #ddd;">${equipment.nextInspectionDue || 'N/A'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      ` : ''}

      <!-- Emergency Procedures -->
      ${emergencyProcedures ? `
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="margin: 0 0 15px 0; color: #2c5530; font-size: 20px;">Emergency Procedures</h2>
        <div style="background: white; padding: 15px; border-radius: 6px; border: 1px solid #ddd;">
          <p style="margin: 0; line-height: 1.6; white-space: pre-wrap;">${emergencyProcedures}</p>
        </div>
      </div>
      ` : ''}

      <!-- Footer -->
      <div style="text-align: center; margin-top: 40px; padding: 20px; border-top: 2px solid #2c5530;">
        <p style="margin: 0; color: #666; font-size: 14px;">
          This SWMS document was generated using Riskify - Professional SWMS Builder
        </p>
        <p style="margin: 5px 0 0 0; color: #999; font-size: 12px;">
          Document generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
        </p>
      </div>
    </div>
  `;
}

function getRiskColor(risk: string | undefined): string {
  if (!risk) return '#6b7280';
  
  const riskLower = risk.toLowerCase();
  if (riskLower.includes('high')) return '#dc2626';
  if (riskLower.includes('medium')) return '#d97706';
  if (riskLower.includes('low')) return '#059669';
  return '#6b7280';
}