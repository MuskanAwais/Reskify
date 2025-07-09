import type { SwmsFormData } from "@/types/swms";

interface RiskMatrixPageProps {
  formData: SwmsFormData;
  updateFormData: (updates: Partial<SwmsFormData>) => void;
}

export default function RiskMatrixPage({ formData, updateFormData }: RiskMatrixPageProps) {
  return (
    <div className="space-y-6">
      <div className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Risk Matrix</h2>
        <p className="text-sm text-gray-600 mb-6">
          This matrix shows the standard risk assessment criteria used for this project. The preview shows the complete risk matrix with likelihood, severity, and action requirements.
        </p>
        
        <div className="bg-white p-4 rounded border">
          <h3 className="font-medium text-gray-900 mb-3">Risk Assessment Framework</h3>
          <div className="space-y-2 text-sm text-gray-700">
            <p><strong>Likelihood:</strong> From "Very Rare" (once in a lifetime) to "Likely" (monthly in industry)</p>
            <p><strong>Severity:</strong> From "Low" (First Aid) to "Extreme" (Fatality/Major Property Damage)</p>
            <p><strong>Risk Ranking:</strong> Calculated score determines action timeframe</p>
            <p><strong>Action Required:</strong> From 5 working days (Low) to Immediate (Severe)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
