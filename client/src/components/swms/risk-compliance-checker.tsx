import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  X, 
  FileText,
  Scale,
  Clock
} from "lucide-react";

interface RiskAssessment {
  id: string;
  activity: string;
  hazards: string[];
  controlMeasures: string[];
  initialRiskScore: number;
  residualRiskScore: number;
  riskLevel: string;
  ppe: string[];
  legislation: string[];
  responsible: string;
  inspectionFrequency: string;
}

interface ComplianceIssue {
  type: 'error' | 'warning' | 'info';
  message: string;
  field: string;
  riskIndex?: number;
}

interface RiskComplianceCheckerProps {
  riskAssessments: RiskAssessment[];
  tradeType: string;
  onComplianceUpdate: (isCompliant: boolean, issues: ComplianceIssue[]) => void;
}

const AUSTRALIAN_STANDARDS = {
  electrical: [
    "AS/NZS 3000:2018 - Electrical installations",
    "AS/NZS 3012:2019 - Electrical installations - Construction and demolition sites",
    "AS/NZS 4836:2011 - Safe working on low-voltage electrical installations",
    "Work Health and Safety Act 2011",
    "Work Health and Safety Regulation 2017"
  ],
  general: [
    "Work Health and Safety Act 2011",
    "Work Health and Safety Regulation 2017",
    "AS/NZS 4804:2001 - Occupational health and safety management systems",
    "AS/NZS ISO 45001:2018 - Occupational health and safety management systems"
  ]
};

const RISK_MATRIX = {
  1: { level: 'Very Low', color: 'bg-green-100 text-green-800', action: 'Monitor' },
  2: { level: 'Low', color: 'bg-green-200 text-green-800', action: 'Monitor' },
  3: { level: 'Low-Medium', color: 'bg-yellow-100 text-yellow-800', action: 'Manage by procedure' },
  4: { level: 'Medium', color: 'bg-yellow-200 text-yellow-800', action: 'Manage by specific measures' },
  5: { level: 'Medium-High', color: 'bg-orange-100 text-orange-800', action: 'Manage by detailed procedures' },
  6: { level: 'High', color: 'bg-red-100 text-red-800', action: 'Immediate action required' },
  7: { level: 'Very High', color: 'bg-red-200 text-red-800', action: 'Stop work - immediate action' },
  8: { level: 'Extreme', color: 'bg-red-300 text-red-900', action: 'Stop work - senior management' }
};

export default function RiskComplianceChecker({ 
  riskAssessments, 
  tradeType, 
  onComplianceUpdate 
}: RiskComplianceCheckerProps) {
  const [issues, setIssues] = useState<ComplianceIssue[]>([]);
  const [complianceScore, setComplianceScore] = useState(0);
  const [isCompliant, setIsCompliant] = useState(false);

  useEffect(() => {
    validateCompliance();
  }, [riskAssessments, tradeType]);

  const validateCompliance = () => {
    const newIssues: ComplianceIssue[] = [];
    let totalChecks = 0;
    let passedChecks = 0;

    // Check each risk assessment
    riskAssessments.forEach((risk, index) => {
      // Check if task description is adequate
      totalChecks++;
      if (!risk.activity || risk.activity.length < 10) {
        newIssues.push({
          type: 'error',
          message: 'Task description must be at least 10 characters long',
          field: 'activity',
          riskIndex: index
        });
      } else {
        passedChecks++;
      }

      // Check hazards identification
      totalChecks++;
      if (!risk.hazards || risk.hazards.length === 0 || risk.hazards.every(h => !h.trim())) {
        newIssues.push({
          type: 'error',
          message: 'At least one hazard must be identified',
          field: 'hazards',
          riskIndex: index
        });
      } else {
        passedChecks++;
      }

      // Check control measures
      totalChecks++;
      if (!risk.controlMeasures || risk.controlMeasures.length === 0 || risk.controlMeasures.every(c => !c.trim())) {
        newIssues.push({
          type: 'error',
          message: 'At least one control measure must be specified',
          field: 'controlMeasures',
          riskIndex: index
        });
      } else {
        passedChecks++;
      }

      // Check risk score validation
      totalChecks++;
      if (risk.initialRiskScore <= risk.residualRiskScore) {
        newIssues.push({
          type: 'warning',
          message: 'Residual risk score should be lower than initial risk score',
          field: 'riskScore',
          riskIndex: index
        });
      } else {
        passedChecks++;
      }

      // Check high risk requirements
      if (risk.initialRiskScore >= 6) {
        totalChecks++;
        if (!risk.ppe || risk.ppe.length === 0 || risk.ppe.every(p => !p.trim())) {
          newIssues.push({
            type: 'error',
            message: 'High risk activities require specific PPE requirements',
            field: 'ppe',
            riskIndex: index
          });
        } else {
          passedChecks++;
        }
      }

      // Check responsible person
      totalChecks++;
      if (!risk.responsible || risk.responsible.trim().length === 0) {
        newIssues.push({
          type: 'error',
          message: 'Responsible person must be specified',
          field: 'responsible',
          riskIndex: index
        });
      } else {
        passedChecks++;
      }

      // Check legislation compliance
      totalChecks++;
      const requiredStandards = AUSTRALIAN_STANDARDS[tradeType as keyof typeof AUSTRALIAN_STANDARDS] || AUSTRALIAN_STANDARDS.general;
      const hasRequiredLegislation = requiredStandards.some(standard => 
        risk.legislation?.some(leg => leg.includes(standard.split(':')[0]))
      );
      
      if (!hasRequiredLegislation) {
        newIssues.push({
          type: 'warning',
          message: `Missing reference to required Australian standards for ${tradeType} work`,
          field: 'legislation',
          riskIndex: index
        });
      } else {
        passedChecks++;
      }
    });

    // Overall compliance checks
    totalChecks++;
    if (riskAssessments.length === 0) {
      newIssues.push({
        type: 'error',
        message: 'At least one risk assessment is required',
        field: 'general'
      });
    } else {
      passedChecks++;
    }

    const score = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 0;
    const compliant = newIssues.filter(i => i.type === 'error').length === 0;

    setIssues(newIssues);
    setComplianceScore(score);
    setIsCompliant(compliant);
    onComplianceUpdate(compliant, newIssues);
  };

  const getRiskScoreDetails = (score: number) => {
    return RISK_MATRIX[score as keyof typeof RISK_MATRIX] || RISK_MATRIX[4];
  };

  const errorCount = issues.filter(i => i.type === 'error').length;
  const warningCount = issues.filter(i => i.type === 'warning').length;

  return (
    <div className="space-y-6">
      {/* Compliance Score Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Compliance Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Compliance Score</span>
              <Badge variant={isCompliant ? "default" : "destructive"}>
                {complianceScore}%
              </Badge>
            </div>
            <Progress value={complianceScore} className="w-full" />
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <X className="h-4 w-4 text-red-500" />
                <span>{errorCount} Critical Issues</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <span>{warningCount} Warnings</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Matrix Validation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Risk Matrix Validation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {riskAssessments.map((risk, index) => {
              const initialDetails = getRiskScoreDetails(risk.initialRiskScore);
              const residualDetails = getRiskScoreDetails(risk.residualRiskScore);
              
              return (
                <div key={index} className="border rounded-lg p-3">
                  <h4 className="font-medium text-sm mb-2">{risk.activity}</h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-gray-600">Initial Risk:</span>
                      <div className={`mt-1 px-2 py-1 rounded text-center ${initialDetails.color}`}>
                        Score {risk.initialRiskScore} - {initialDetails.level}
                      </div>
                      <div className="mt-1 text-gray-600">{initialDetails.action}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Residual Risk:</span>
                      <div className={`mt-1 px-2 py-1 rounded text-center ${residualDetails.color}`}>
                        Score {risk.residualRiskScore} - {residualDetails.level}
                      </div>
                      <div className="mt-1 text-gray-600">{residualDetails.action}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Compliance Issues */}
      {issues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Compliance Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {issues.map((issue, index) => (
                <Alert key={index} variant={issue.type === 'error' ? 'destructive' : 'default'}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="flex items-start justify-between">
                      <div>
                        <strong>
                          {issue.riskIndex !== undefined ? `Risk ${issue.riskIndex + 1}: ` : ''}
                          {issue.message}
                        </strong>
                        <div className="text-xs text-gray-600 mt-1">
                          Field: {issue.field}
                        </div>
                      </div>
                      <Badge variant={issue.type === 'error' ? 'destructive' : 'secondary'}>
                        {issue.type}
                      </Badge>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Australian Standards Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Required Australian Standards - {tradeType}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {(AUSTRALIAN_STANDARDS[tradeType as keyof typeof AUSTRALIAN_STANDARDS] || AUSTRALIAN_STANDARDS.general)
              .map((standard, index) => (
                <div key={index} className="text-sm p-2 bg-gray-50 rounded">
                  {standard}
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Compliance Status */}
      <Alert variant={isCompliant ? 'default' : 'destructive'}>
        {isCompliant ? <CheckCircle className="h-4 w-4" /> : <X className="h-4 w-4" />}
        <AlertDescription>
          {isCompliant 
            ? "All critical compliance requirements have been met. This SWMS is ready for approval and signatures."
            : `${errorCount} critical issue${errorCount !== 1 ? 's' : ''} must be resolved before this SWMS can be approved.`
          }
        </AlertDescription>
      </Alert>
    </div>
  );
}