import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface RiskAssessmentMatrixProps {
  showTitle?: boolean;
  compact?: boolean;
}

export const RiskAssessmentMatrix = ({ showTitle = true, compact = false }: RiskAssessmentMatrixProps) => {
  const consequenceData = [
    {
      level: "Extreme",
      description: "Fatality, significant disability, catastrophic property damage",
      cost: "$50,000+"
    },
    {
      level: "High", 
      description: "Minor amputation, minor permanent disability, moderate property damage",
      cost: "$15,000 - $50,000"
    },
    {
      level: "Medium",
      description: "Minor injury resulting in Loss Time Injury or Medically Treated Injury",
      cost: "$1,000 - $15,000"
    },
    {
      level: "Low",
      description: "First Aid Treatment with no lost time",
      cost: "$0 - $1,000"
    }
  ];

  const likelihoodData = [
    {
      level: "Likely",
      description: "Monthly in the industry",
      chance: "Good chance"
    },
    {
      level: "Possible",
      description: "Yearly in the industry", 
      chance: "Even chance"
    },
    {
      level: "Unlikely",
      description: "Every 10 years in the industry",
      chance: "Low chance"
    },
    {
      level: "Very Rarely",
      description: "Once in a lifetime in the industry",
      chance: "Practically no chance"
    }
  ];

  const riskMatrix = [
    { consequence: "Extreme", likely: 16, possible: 14, unlikely: 11, veryRarely: 7 },
    { consequence: "High", likely: 15, possible: 12, unlikely: 8, veryRarely: 5 },
    { consequence: "Medium", likely: 13, possible: 9, unlikely: 6, veryRarely: 3 },
    { consequence: "Low", likely: 10, possible: 7, unlikely: 4, veryRarely: 2 }
  ];

  const getRiskColor = (score: number) => {
    if (score >= 14) return "bg-red-600 text-white";
    if (score >= 11) return "bg-red-500 text-white";
    if (score >= 7) return "bg-yellow-500 text-black";
    if (score >= 4) return "bg-green-500 text-white";
    return "bg-green-600 text-white";
  };

  const getRiskLevel = (score: number) => {
    if (score >= 14) return "Severe";
    if (score >= 11) return "High";
    if (score >= 7) return "Medium";
    if (score >= 4) return "Low";
    return "Very Low";
  };

  const getActionRequired = (score: number) => {
    if (score >= 14) return "Action required immediately";
    if (score >= 11) return "Action within 24 hrs";
    if (score >= 7) return "Action within 48 hrs";
    if (score >= 4) return "Monitor";
    return "No action required";
  };

  if (compact) {
    return (
      <div className="space-y-4">
        {showTitle && (
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Risk Assessment Matrix
          </h3>
        )}
        
        {/* Risk Level Legend */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          <Badge className="bg-red-600 text-white justify-center">Severe (14-16)</Badge>
          <Badge className="bg-red-500 text-white justify-center">High (11-13)</Badge>
          <Badge className="bg-yellow-500 text-black justify-center">Medium (7-10)</Badge>
          <Badge className="bg-green-500 text-white justify-center">Low (4-6)</Badge>
          <Badge className="bg-green-600 text-white justify-center">Very Low (2-3)</Badge>
        </div>

        {/* Compact Matrix */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800">
                <th className="border border-gray-300 dark:border-gray-600 p-2 text-left">Consequence</th>
                <th className="border border-gray-300 dark:border-gray-600 p-2 text-center">Likely</th>
                <th className="border border-gray-300 dark:border-gray-600 p-2 text-center">Possible</th>
                <th className="border border-gray-300 dark:border-gray-600 p-2 text-center">Unlikely</th>
                <th className="border border-gray-300 dark:border-gray-600 p-2 text-center">Very Rarely</th>
              </tr>
            </thead>
            <tbody>
              {riskMatrix.map((row) => (
                <tr key={row.consequence}>
                  <td className="border border-gray-300 dark:border-gray-600 p-2 font-medium">
                    {row.consequence}
                  </td>
                  <td className={`border border-gray-300 dark:border-gray-600 p-2 text-center font-bold ${getRiskColor(row.likely)}`}>
                    {row.likely}
                  </td>
                  <td className={`border border-gray-300 dark:border-gray-600 p-2 text-center font-bold ${getRiskColor(row.possible)}`}>
                    {row.possible}
                  </td>
                  <td className={`border border-gray-300 dark:border-gray-600 p-2 text-center font-bold ${getRiskColor(row.unlikely)}`}>
                    {row.unlikely}
                  </td>
                  <td className={`border border-gray-300 dark:border-gray-600 p-2 text-center font-bold ${getRiskColor(row.veryRarely)}`}>
                    {row.veryRarely}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showTitle && (
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          Risk Assessment Matrix
        </h3>
      )}

      {/* Consequence Scale */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">A. Qualitative Scale - Consequence</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800">
                  <th className="border border-gray-300 dark:border-gray-600 p-3 text-left">Level</th>
                  <th className="border border-gray-300 dark:border-gray-600 p-3 text-left">Description</th>
                  <th className="border border-gray-300 dark:border-gray-600 p-3 text-left">Cost Range</th>
                </tr>
              </thead>
              <tbody>
                {consequenceData.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="border border-gray-300 dark:border-gray-600 p-3 font-semibold">
                      {item.level}
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 p-3">
                      {item.description}
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 p-3 font-mono">
                      {item.cost}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Likelihood Scale */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">B. Probability Scale - Likelihood</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800">
                  <th className="border border-gray-300 dark:border-gray-600 p-3 text-left">Level</th>
                  <th className="border border-gray-300 dark:border-gray-600 p-3 text-left">Frequency</th>
                  <th className="border border-gray-300 dark:border-gray-600 p-3 text-left">Probability</th>
                </tr>
              </thead>
              <tbody>
                {likelihoodData.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="border border-gray-300 dark:border-gray-600 p-3 font-semibold">
                      {item.level}
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 p-3">
                      {item.description}
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 p-3">
                      {item.chance}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Risk Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">C. Risk Assessment Matrix</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800">
                  <th className="border border-gray-300 dark:border-gray-600 p-3 text-left">Consequence</th>
                  <th className="border border-gray-300 dark:border-gray-600 p-3 text-center">Likely</th>
                  <th className="border border-gray-300 dark:border-gray-600 p-3 text-center">Possible</th>
                  <th className="border border-gray-300 dark:border-gray-600 p-3 text-center">Unlikely</th>
                  <th className="border border-gray-300 dark:border-gray-600 p-3 text-center">Very Rarely</th>
                </tr>
              </thead>
              <tbody>
                {riskMatrix.map((row) => (
                  <tr key={row.consequence}>
                    <td className="border border-gray-300 dark:border-gray-600 p-3 font-semibold">
                      {row.consequence}
                    </td>
                    <td className={`border border-gray-300 dark:border-gray-600 p-3 text-center text-lg font-bold ${getRiskColor(row.likely)}`}>
                      {row.likely}
                    </td>
                    <td className={`border border-gray-300 dark:border-gray-600 p-3 text-center text-lg font-bold ${getRiskColor(row.possible)}`}>
                      {row.possible}
                    </td>
                    <td className={`border border-gray-300 dark:border-gray-600 p-3 text-center text-lg font-bold ${getRiskColor(row.unlikely)}`}>
                      {row.unlikely}
                    </td>
                    <td className={`border border-gray-300 dark:border-gray-600 p-3 text-center text-lg font-bold ${getRiskColor(row.veryRarely)}`}>
                      {row.veryRarely}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Action Required Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">D. Action Required by Risk Level</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <Badge className="bg-red-600 text-white">14-16</Badge>
              <div>
                <div className="font-semibold text-red-600">Severe</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Action required immediately</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge className="bg-red-500 text-white">11-13</Badge>
              <div>
                <div className="font-semibold text-red-500">High</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Action within 24 hrs</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge className="bg-yellow-500 text-black">7-10</Badge>
              <div>
                <div className="font-semibold text-yellow-600">Medium</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Action within 48 hrs</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge className="bg-green-500 text-white">4-6</Badge>
              <div>
                <div className="font-semibold text-green-600">Low</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Monitor</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge className="bg-green-600 text-white">2-3</Badge>
              <div>
                <div className="font-semibold text-green-700">Very Low</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">No action required</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const getRiskScoreColor = (score: number): string => {
  if (score >= 14) return "bg-red-600 text-white";
  if (score >= 11) return "bg-red-500 text-white";
  if (score >= 7) return "bg-yellow-500 text-black";
  if (score >= 4) return "bg-green-500 text-white";
  return "bg-green-600 text-white";
};

export const getRiskLevel = (score: number): string => {
  if (score >= 14) return "Severe";
  if (score >= 11) return "High";
  if (score >= 7) return "Medium";
  if (score >= 4) return "Low";
  return "Very Low";
};

export const getActionRequired = (score: number): string => {
  if (score >= 14) return "Action required immediately";
  if (score >= 11) return "Action within 24 hrs";
  if (score >= 7) return "Action within 48 hrs";
  if (score >= 4) return "Monitor";
  return "No action required";
};