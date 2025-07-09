import type { SwmsFormData, DocumentPage } from "@/types/swms";

interface DocumentPreviewProps {
  formData: SwmsFormData;
  currentPage: DocumentPage;
}

export default function DocumentPreview({ formData, currentPage }: DocumentPreviewProps) {
  const renderEmergencyInfo = () => (
    <div className="bg-white shadow-lg print-page" style={{ width: '210mm', minHeight: '297mm', padding: '20mm' }}>
      {/* Document Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex-shrink-0">
          <div className="text-3xl font-bold text-riskify-green">Riskify</div>
        </div>
        <div className="text-center flex-1 mx-8">
          <div className="text-sm text-gray-600 space-y-1">
            <div>{formData.companyName}</div>
            <div>{formData.projectName}</div>
            <div>{formData.projectNumber}</div>
            <div>{formData.projectAddress}</div>
          </div>
        </div>
        <div className="flex-shrink-0 w-24 h-16 border-2 border-dashed border-gray-300 flex items-center justify-center text-xs text-gray-500 text-center">
          Insert company logo here
        </div>
      </div>

      {/* Page Title */}
      <h1 className="text-2xl font-bold text-riskify-green mb-8">Emergency Information</h1>

      {/* Emergency Contacts */}
      <div className="mb-8 p-6 border border-gray-300 rounded-lg">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contacts</h2>
        <div className="space-y-2">
          {formData.emergencyContacts.map((contact, index) => (
            <div key={index} className="text-sm">
              {contact.name} - {contact.phone}
            </div>
          ))}
        </div>
      </div>

      {/* Emergency Response Procedures */}
      <div className="mb-8 p-6 border border-gray-300 rounded-lg">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Emergency Response Procedures</h2>
        <div className="text-sm whitespace-pre-line">
          {formData.emergencyProcedures}
        </div>
      </div>

      {/* Monitoring & Review Requirements */}
      <div className="mb-8 p-6 border border-gray-300 rounded-lg">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Monitoring & Review Requirements</h2>
        <div className="text-sm whitespace-pre-line">
          {formData.emergencyMonitoring}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-16 pt-8 border-t border-gray-300">
        <div className="text-xs text-gray-500 text-center">
          Emergency Information
        </div>
      </div>
    </div>
  );

  const renderHighRiskActivities = () => (
    <div className="bg-white shadow-lg print-page" style={{ width: '210mm', minHeight: '297mm', padding: '20mm' }}>
      {/* Document Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex-shrink-0">
          <div className="text-3xl font-bold text-riskify-green">Riskify</div>
        </div>
        <div className="text-center flex-1 mx-8">
          <div className="text-sm text-gray-600 space-y-1">
            <div>{formData.companyName}</div>
            <div>{formData.projectName}</div>
            <div>{formData.projectNumber}</div>
            <div>{formData.projectAddress}</div>
          </div>
        </div>
        <div className="flex-shrink-0 w-24 h-16 border-2 border-dashed border-gray-300 flex items-center justify-center text-xs text-gray-500 text-center">
          Insert company logo here
        </div>
      </div>

      {/* Page Title */}
      <h1 className="text-2xl font-bold text-riskify-green mb-8">High Risk Activities</h1>

      {/* Activities Grid */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 16 }, (_, i) => {
          const activities = [
            "Work on a telecommunication tower",
            "Risk of a person falling more than 2 metres (e.g. work on ladders, scaffolding, roofs, etc.)",
            "Work involving demolition of an element that is load-bearing or otherwise related to the physical integrity of the structure",
            "Work involving the disturbance of asbestos",
            "Work involving structural alterations or repairs that require temporary support to prevent collapse",
            "Work carried out in or near a confined space",
            "Work carried our in or near a shaft or trench deeper than 1.5 metres or a tunnel",
            "Work involving the use of explosives",
            "Work on or near pressurised gas distribution mains or piping",
            "Work on or near chemical, fuel or refrigerant lines",
            "Work on or near energised electrical installations or services (includes live electrical work)",
            "Work in an area that may have a contaminated or flammable atmosphere",
            "Work involving tilt-up or precast concrete elements",
            "Work carried on, in or adjacent to a road, railway, or other traffic corridor that is in use",
            "Work in an area at a workplace in which there is any movement of powered mobile plant (e.g. forklifts, excavators, cranes)",
            "Work in areas where there are artificial extremes of temperature (e.g. cold rooms, furnace areas)"
          ];
          
          const activity = activities[i] || `High Risk Activity ${i + 1}`;
          const isHighlighted = [1, 9, 10, 14].includes(i);
          
          return (
            <div key={i} className={`border border-gray-300 rounded-lg p-3 text-xs ${isHighlighted ? 'border-red-400 text-red-600' : ''}`}>
              {activity}
            </div>
          );
        })}
        
        {/* Additional activities */}
        <div className="border border-gray-300 rounded-lg p-3 text-xs">
          Work carries out in or near water or other liquid that involves a risk of drowning
        </div>
        <div className="border border-gray-300 rounded-lg p-3 text-xs">
          Work carried out on or near live electrical conductors
        </div>
      </div>

      {/* Footer */}
      <div className="mt-16 pt-8 border-t border-gray-300">
        <div className="text-xs text-gray-500 text-center">
          High Risk Activities
        </div>
      </div>
    </div>
  );

  const renderRiskMatrix = () => (
    <div className="bg-white shadow-lg print-page" style={{ width: '210mm', minHeight: '297mm', padding: '20mm' }}>
      {/* Document Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex-shrink-0">
          <div className="text-3xl font-bold text-riskify-green">Riskify</div>
        </div>
        <div className="text-center flex-1 mx-8">
          <div className="text-sm text-gray-600 space-y-1">
            <div>{formData.companyName}</div>
            <div>{formData.projectName}</div>
            <div>{formData.projectNumber}</div>
            <div>{formData.projectAddress}</div>
          </div>
        </div>
        <div className="flex-shrink-0 w-24 h-16 border-2 border-dashed border-gray-300 flex items-center justify-center text-xs text-gray-500 text-center">
          Insert company logo here
        </div>
      </div>

      {/* Page Title */}
      <h1 className="text-2xl font-bold text-riskify-green mb-8">Risk Matrix</h1>

      {/* Risk Matrix Tables */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        {/* Left Table - Likelihood & Probability */}
        <div>
          <table className="w-full border-collapse border border-gray-300 text-xs">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2 text-left">Likelihood</th>
                <th className="border border-gray-300 p-2 text-left">Magnitude (Frequency in Industry)</th>
                <th className="border border-gray-300 p-2 text-left">Probability (Chance)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 p-2">Likely</td>
                <td className="border border-gray-300 p-2">Monthly in the industry</td>
                <td className="border border-gray-300 p-2 italic">Good chance</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2">Possible</td>
                <td className="border border-gray-300 p-2">Yearly in the industry</td>
                <td className="border border-gray-300 p-2 italic">Even chance</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2">Unlikely</td>
                <td className="border border-gray-300 p-2">Every 10 years in the industry</td>
                <td className="border border-gray-300 p-2 italic">Low chance</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2">Very Rare</td>
                <td className="border border-gray-300 p-2">Once in a lifetime in the industry</td>
                <td className="border border-gray-300 p-2 italic">Practically no chance</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Right Table - Severity */}
        <div>
          <table className="w-full border-collapse border border-gray-300 text-xs">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2 text-left">Severity</th>
                <th className="border border-gray-300 p-2 text-left">Qualitative Description</th>
                <th className="border border-gray-300 p-2 text-left">Quantitative Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 p-2">Extreme</td>
                <td className="border border-gray-300 p-2">Fatality, significant disability, catastrophic property damage</td>
                <td className="border border-gray-300 p-2">$50,000+</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2">High</td>
                <td className="border border-gray-300 p-2">Minor amputation, minor permanent disability, moderate property damage</td>
                <td className="border border-gray-300 p-2">$15,000 - $50,000</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2">Medium</td>
                <td className="border border-gray-300 p-2">Minor Injury resulting in a Loss Time Injury or Medically Treated Injury</td>
                <td className="border border-gray-300 p-2">$1,000 - $15,000</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2">Low</td>
                <td className="border border-gray-300 p-2">First Aid Treatment with no lost time</td>
                <td className="border border-gray-300 p-2">$0 - $1,000</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Risk Ranking Tables */}
      <div className="grid grid-cols-2 gap-8">
        {/* Left Table - Score Range */}
        <div>
          <table className="w-full border-collapse border border-gray-300 text-xs">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2 text-left">Score Range</th>
                <th className="border border-gray-300 p-2 text-left">Risk Ranking</th>
                <th className="border border-gray-300 p-2 text-left">Action Required</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 p-2">14 - 16</td>
                <td className="border border-gray-300 p-2">Severe (S)</td>
                <td className="border border-gray-300 p-2 italic">Action Immediately</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2">11 - 13</td>
                <td className="border border-gray-300 p-2">High (H)</td>
                <td className="border border-gray-300 p-2 italic">Action within 24 hrs</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2">7 - 10</td>
                <td className="border border-gray-300 p-2">Medium (M)</td>
                <td className="border border-gray-300 p-2 italic">Action within 48 hrs</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2">1 - 6</td>
                <td className="border border-gray-300 p-2">Low (L)</td>
                <td className="border border-gray-300 p-2 italic">Action within 5 working days</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Right Table - Risk Matrix */}
        <div>
          <table className="w-full border-collapse border border-gray-300 text-xs">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2"></th>
                <th className="border border-gray-300 p-2 text-center">Extreme</th>
                <th className="border border-gray-300 p-2 text-center">High</th>
                <th className="border border-gray-300 p-2 text-center">Medium</th>
                <th className="border border-gray-300 p-2 text-center">Low</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 p-2 font-medium">Likely</td>
                <td className="border border-gray-300 p-2 text-center bg-red-600 text-white">16</td>
                <td className="border border-gray-300 p-2 text-center bg-red-600 text-white">15</td>
                <td className="border border-gray-300 p-2 text-center bg-orange-500 text-white">13</td>
                <td className="border border-gray-300 p-2 text-center bg-orange-500 text-white">10</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2 font-medium">Possibly</td>
                <td className="border border-gray-300 p-2 text-center bg-red-600 text-white">14</td>
                <td className="border border-gray-300 p-2 text-center bg-orange-500 text-white">12</td>
                <td className="border border-gray-300 p-2 text-center bg-blue-500 text-white">9</td>
                <td className="border border-gray-300 p-2 text-center bg-green-600 text-white">6</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2 font-medium">Unlikely</td>
                <td className="border border-gray-300 p-2 text-center bg-orange-500 text-white">11</td>
                <td className="border border-gray-300 p-2 text-center bg-blue-500 text-white">8</td>
                <td className="border border-gray-300 p-2 text-center bg-green-600 text-white">5</td>
                <td className="border border-gray-300 p-2 text-center bg-green-600 text-white">3</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2 font-medium">Very Rare</td>
                <td className="border border-gray-300 p-2 text-center bg-blue-500 text-white">7</td>
                <td className="border border-gray-300 p-2 text-center bg-green-600 text-white">4</td>
                <td className="border border-gray-300 p-2 text-center bg-green-600 text-white">2</td>
                <td className="border border-gray-300 p-2 text-center bg-green-600 text-white">1</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-16 pt-8 border-t border-gray-300">
        <div className="text-xs text-gray-500 text-center">
          Risk Matrix
        </div>
      </div>
    </div>
  );

  const renderWorkActivities = () => (
    <div className="bg-white shadow-lg print-page" style={{ width: '210mm', minHeight: '297mm', padding: '20mm' }}>
      {/* Document Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex-shrink-0">
          <div className="text-3xl font-bold text-riskify-green">Riskify</div>
        </div>
        <div className="text-center flex-1 mx-8">
          <div className="text-sm text-gray-600 space-y-1">
            <div>{formData.companyName}</div>
            <div>{formData.projectName}</div>
            <div>{formData.projectNumber}</div>
            <div>{formData.projectAddress}</div>
          </div>
        </div>
        <div className="flex-shrink-0 w-24 h-16 border-2 border-dashed border-gray-300 flex items-center justify-center text-xs text-gray-500 text-center">
          Insert company logo here
        </div>
      </div>

      {/* Page Title */}
      <h1 className="text-2xl font-bold text-riskify-green mb-8">Work Activities & Risk Assessment</h1>

      {/* Risk Assessment Table */}
      <table className="w-full border-collapse border border-gray-300 text-xs mb-8">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 p-2 text-left">Activity</th>
            <th className="border border-gray-300 p-2 text-left">Hazards</th>
            <th className="border border-gray-300 p-2 text-left">Initial Risk</th>
            <th className="border border-gray-300 p-2 text-left">Control Measures</th>
            <th className="border border-gray-300 p-2 text-left">Residual Risk</th>
            <th className="border border-gray-300 p-2 text-left">Legislation</th>
          </tr>
        </thead>
        <tbody>
          {/* Sample Activity 1 */}
          <tr>
            <td className="border border-gray-300 p-2 align-top">Activity description in detail sample 03</td>
            <td className="border border-gray-300 p-2 align-top">
              <ul className="space-y-1">
                <li>• Hazard description 01</li>
                <li>• Hazard description 02 this is an extended description</li>
                <li>• Hazard description 03</li>
                <li>• Hazard description 04</li>
                <li>• Hazard description 05</li>
                <li>• Hazard description 06 this is an extended description</li>
                <li>• Hazard description 07</li>
                <li>• Hazard description 08</li>
              </ul>
            </td>
            <td className="border border-gray-300 p-2 align-top">
              <span className="inline-block px-2 py-1 text-xs font-medium bg-red-600 text-white rounded">Extreme - 16</span>
            </td>
            <td className="border border-gray-300 p-2 align-top">
              <ul className="space-y-1">
                <li>• Hazard description 01</li>
                <li>• Hazard description 02 this is an extended description</li>
                <li>• Hazard description 03</li>
                <li>• Hazard description 04</li>
                <li>• Hazard description 05</li>
                <li>• Hazard description 06 this is an extended description</li>
                <li>• Hazard description 07</li>
                <li>• Hazard description 08</li>
              </ul>
            </td>
            <td className="border border-gray-300 p-2 align-top">
              <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-500 text-white rounded">Medium - 9</span>
            </td>
            <td className="border border-gray-300 p-2 align-top">
              <ul className="space-y-1">
                <li>• Legislation description 01</li>
                <li>• Legislation description 02 this is an extended description</li>
              </ul>
            </td>
          </tr>

          {/* Sample Activity 2 */}
          <tr>
            <td className="border border-gray-300 p-2 align-top">Activity description in detail sample 04</td>
            <td className="border border-gray-300 p-2 align-top">
              <ul className="space-y-1">
                <li>• Hazard description 01</li>
                <li>• Hazard description 02 this is an extended description</li>
                <li>• Hazard description 03</li>
                <li>• Hazard description 04</li>
                <li>• Hazard description 05</li>
                <li>• Hazard description 06 this is an extended description</li>
                <li>• Hazard description 07</li>
                <li>• Hazard description 08</li>
              </ul>
            </td>
            <td className="border border-gray-300 p-2 align-top">
              <span className="inline-block px-2 py-1 text-xs font-medium bg-orange-500 text-white rounded">High - 11</span>
            </td>
            <td className="border border-gray-300 p-2 align-top">
              <ul className="space-y-1">
                <li>• Hazard description 01</li>
                <li>• Hazard description 02 this is an extended description</li>
                <li>• Hazard description 03</li>
                <li>• Hazard description 04</li>
                <li>• Hazard description 05</li>
                <li>• Hazard description 06 this is an extended description</li>
                <li>• Hazard description 07</li>
                <li>• Hazard description 08</li>
              </ul>
            </td>
            <td className="border border-gray-300 p-2 align-top">
              <span className="inline-block px-2 py-1 text-xs font-medium bg-green-600 text-white rounded">Low - 6</span>
            </td>
            <td className="border border-gray-300 p-2 align-top">
              <ul className="space-y-1">
                <li>• Legislation description 01</li>
                <li>• Legislation description 02 this is an extended description</li>
              </ul>
            </td>
          </tr>

          {/* Sample Activity 3 */}
          <tr>
            <td className="border border-gray-300 p-2 align-top">Activity description in detail sample 05</td>
            <td className="border border-gray-300 p-2 align-top">
              <ul className="space-y-1">
                <li>• Hazard description 01</li>
                <li>• Hazard description 02 this is an extended description</li>
                <li>• Hazard description 03</li>
                <li>• Hazard description 04</li>
                <li>• Hazard description 05</li>
                <li>• Hazard description 08</li>
              </ul>
            </td>
            <td className="border border-gray-300 p-2 align-top">
              <span className="inline-block px-2 py-1 text-xs font-medium bg-red-600 text-white rounded">Extreme - 16</span>
            </td>
            <td className="border border-gray-300 p-2 align-top">
              <ul className="space-y-1">
                <li>• Hazard description 01</li>
                <li>• Hazard description 02 this is an extended description</li>
                <li>• Hazard description 03</li>
                <li>• Hazard description 04</li>
                <li>• Hazard description 05</li>
              </ul>
            </td>
            <td className="border border-gray-300 p-2 align-top">
              <span className="inline-block px-2 py-1 text-xs font-medium bg-green-600 text-white rounded">Low - 1</span>
            </td>
            <td className="border border-gray-300 p-2 align-top">
              <ul className="space-y-1">
                <li>• Legislation description 01</li>
                <li>• Legislation description 02 this is an extended description</li>
              </ul>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Footer */}
      <div className="mt-16 pt-8 border-t border-gray-300">
        <div className="text-xs text-gray-500 text-center">
          Work Activities & Risk Assessment Cont.
        </div>
      </div>
    </div>
  );

  const renderPpePage = () => (
    <div className="bg-white shadow-lg print-page" style={{ width: '210mm', minHeight: '297mm', padding: '20mm' }}>
      {/* Document Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex-shrink-0">
          <div className="text-3xl font-bold text-riskify-green">Riskify</div>
        </div>
        <div className="text-center flex-1 mx-8">
          <div className="text-sm text-gray-600 space-y-1">
            <div>{formData.companyName}</div>
            <div>{formData.projectName}</div>
            <div>{formData.projectNumber}</div>
            <div>{formData.projectAddress}</div>
          </div>
        </div>
        <div className="flex-shrink-0 w-24 h-16 border-2 border-dashed border-gray-300 flex items-center justify-center text-xs text-gray-500 text-center">
          Insert company logo here
        </div>
      </div>

      {/* Page Title */}
      <h1 className="text-2xl font-bold text-riskify-green mb-8">Personal Protective Equipment</h1>

      {/* PPE Grid */}
      <div className="grid grid-cols-5 gap-4 mb-8">
        {/* Row 1 */}
        <div className="border border-gray-300 rounded-lg p-3 text-center">
          <div className="text-xs font-medium mb-1">Hard Hat – Head protection from falling objects</div>
        </div>
        <div className="border border-green-500 rounded-lg p-3 text-center bg-green-50">
          <div className="text-xs font-medium mb-1 text-green-700">Hi-Vis Vest/Shirt – Visibility on site</div>
        </div>
        <div className="border border-gray-300 rounded-lg p-3 text-center">
          <div className="text-xs font-medium mb-1">Steel Cap Boots – Foot protection from impact or puncture</div>
        </div>
        <div className="border border-green-500 rounded-lg p-3 text-center bg-green-50">
          <div className="text-xs font-medium mb-1 text-green-700">Safety Glasses – Eye protection</div>
        </div>
        <div className="border border-gray-300 rounded-lg p-3 text-center">
          <div className="text-xs font-medium mb-1">Gloves – General hand protection</div>
        </div>

        {/* Row 2 */}
        <div className="border border-gray-300 rounded-lg p-3 text-center">
          <div className="text-xs font-medium mb-1">Hearing Protection – Earplugs or earmuffs</div>
        </div>
        <div className="border border-green-500 rounded-lg p-3 text-center bg-green-50">
          <div className="text-xs font-medium mb-1 text-green-700">Long Pants – Protection from abrasions and minor cuts</div>
        </div>
        <div className="border border-gray-300 rounded-lg p-3 text-center">
          <div className="text-xs font-medium mb-1">Long Sleeve Shirt – General body protection</div>
        </div>
        <div className="border border-gray-300 rounded-lg p-3 text-center">
          <div className="text-xs font-medium mb-1">Dust Mask – Basic airborne dust protection</div>
        </div>
        <div className="border border-gray-300 rounded-lg p-3 text-center">
          <div className="text-xs font-medium mb-1">Sun Protection (Hat, Sunscreen) – UV exposure control</div>
        </div>

        {/* Row 3 */}
        <div className="border border-gray-300 rounded-lg p-3 text-center">
          <div className="text-xs font-medium mb-1">Fall Arrest Harness – Working at heights</div>
        </div>
        <div className="border border-gray-300 rounded-lg p-3 text-center">
          <div className="text-xs font-medium mb-1">Confined Space Breathing Apparatus – Confined spaces or poor air quality</div>
        </div>
        <div className="border border-gray-300 rounded-lg p-3 text-center">
          <div className="text-xs font-medium mb-1">Welding Helmet & Gloves – Welding tasks</div>
        </div>
        <div className="border border-green-500 rounded-lg p-3 text-center bg-green-50">
          <div className="text-xs font-medium mb-1 text-green-700">Cut-Resistant Gloves – Blade or glass handling</div>
        </div>
        <div className="border border-gray-300 rounded-lg p-3 text-center">
          <div className="text-xs font-medium mb-1">Face Shield – High-impact or chemical splash risk</div>
        </div>

        {/* Row 4 */}
        <div className="border border-gray-300 rounded-lg p-3 text-center">
          <div className="text-xs font-medium mb-1">Respirator (Half/Full Face) – Hazardous fumes, chemicals, or dust</div>
        </div>
        <div className="border border-gray-300 rounded-lg p-3 text-center">
          <div className="text-xs font-medium mb-1">Chemical-Resistant Apron – Handling corrosive substances</div>
        </div>
        <div className="border border-gray-300 rounded-lg p-3 text-center">
          <div className="text-xs font-medium mb-1">Anti-Static Clothing – Electrical or explosive environments</div>
        </div>
        <div className="border border-gray-300 rounded-lg p-3 text-center">
          <div className="text-xs font-medium mb-1">Insulated Gloves – Live electrical work</div>
        </div>
        <div className="border border-gray-300 rounded-lg p-3 text-center">
          <div className="text-xs font-medium mb-1">Fire-Retardant Clothing – Hot works / fire risk areas</div>
        </div>

        {/* Row 5 */}
        <div className="border border-green-500 rounded-lg p-3 text-center bg-green-50">
          <div className="text-xs font-medium mb-1 text-green-700">Knee Pads – Prolonged kneeling (e.g. flooring work)</div>
        </div>
        <div className="border border-gray-300 rounded-lg p-3 text-center">
          <div className="text-xs font-medium mb-1">Non-slip Footwear – Wet/slippery environments</div>
        </div>
        <div className="border border-gray-300 rounded-lg p-3 text-center">
          <div className="text-xs font-medium mb-1">Safety Harness & Lanyard – Elevated work or boom lift</div>
        </div>
        <div className="border border-gray-300 rounded-lg p-3 text-center">
          <div className="text-xs font-medium mb-1">Ear Canal Protectors – High-decibel machinery use</div>
        </div>
        <div className="border border-gray-300 rounded-lg p-3 text-center">
          <div className="text-xs font-medium mb-1">Impact Goggles – Demolition or grinding tasks</div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-16 pt-8 border-t border-gray-300">
        <div className="text-xs text-gray-500 text-center">
          Personal Protective Equipment
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (currentPage) {
      case 'emergency-info':
        return renderEmergencyInfo();
      case 'high-risk-activities':
        return renderHighRiskActivities();
      case 'risk-matrix':
        return renderRiskMatrix();
      case 'work-activities':
        return renderWorkActivities();
      case 'ppe':
        return renderPpePage();
      default:
        return renderEmergencyInfo();
    }
  };

  return (
    <div className="preview-scale-desktop lg:preview-scale-desktop">
      {renderContent()}
    </div>
  );
}
