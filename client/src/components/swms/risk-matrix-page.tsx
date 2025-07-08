import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RiskMatrixPageProps {
  formData: any;
  updateFormData: (updates: any) => void;
}

export default function RiskMatrixPage({ formData, updateFormData }: RiskMatrixPageProps) {
  const riskMatrix = [
    { likelihood: 'Almost Certain', consequence: ['High', 'High', 'Extreme', 'Extreme', 'Extreme'] },
    { likelihood: 'Likely', consequence: ['Medium', 'High', 'High', 'Extreme', 'Extreme'] },
    { likelihood: 'Possible', consequence: ['Low', 'Medium', 'High', 'High', 'Extreme'] },
    { likelihood: 'Unlikely', consequence: ['Low', 'Low', 'Medium', 'High', 'High'] },
    { likelihood: 'Rare', consequence: ['Low', 'Low', 'Low', 'Medium', 'High'] }
  ];

  const consequenceLabels = ['Insignificant', 'Minor', 'Moderate', 'Major', 'Catastrophic'];

  const getRiskColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'extreme': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Risk Assessment Matrix</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr>
                <th className="border border-gray-300 p-2 bg-gray-100">Likelihood</th>
                {consequenceLabels.map((label) => (
                  <th key={label} className="border border-gray-300 p-2 bg-gray-100 text-xs">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {riskMatrix.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  <td className="border border-gray-300 p-2 bg-gray-100 font-medium text-xs">
                    {row.likelihood}
                  </td>
                  {row.consequence.map((risk, colIndex) => (
                    <td key={colIndex} className={`border border-gray-300 p-2 text-center text-xs ${getRiskColor(risk)}`}>
                      {risk}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3">Risk Level Definitions</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span><strong>Extreme:</strong> Immediate action required</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-orange-500 rounded"></div>
                <span><strong>High:</strong> Senior management attention</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span><strong>Medium:</strong> Management responsibility</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span><strong>Low:</strong> Manage by routine procedures</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}