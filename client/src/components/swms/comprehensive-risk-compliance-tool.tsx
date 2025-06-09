import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  X, 
  FileText,
  Scale,
  Clock,
  Calculator,
  Target,
  Book,
  Gavel
} from "lucide-react";

interface RiskAssessment {
  id: string;
  activity: string;
  hazards: string[];
  likelihood: number;
  consequence: number;
  initialRiskScore: number;
  controlMeasures: string[];
  residualLikelihood: number;
  residualConsequence: number;
  residualRiskScore: number;
  riskLevel: string;
  ppe: string[];
  legislation: string[];
  responsible: string;
}

interface ComplianceResult {
  isCompliant: boolean;
  overallScore: number;
  riskScoreAccuracy: number;
  standardsCompliance: number;
  legislationCompliance: number;
  issues: ComplianceIssue[];
  recommendations: string[];
}

interface ComplianceIssue {
  type: 'critical' | 'high' | 'medium' | 'low';
  category: 'risk_calculation' | 'standards' | 'legislation' | 'documentation';
  message: string;
  riskId?: string;
  resolution?: string;
}

interface RiskComplianceToolProps {
  riskAssessments: RiskAssessment[];
  tradeType: string;
  onComplianceUpdate: (result: ComplianceResult) => void;
}

const RISK_MATRIX = {
  1: { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5 },
  2: { 1: 2, 2: 4, 3: 6, 4: 8, 5: 10 },
  3: { 1: 3, 2: 6, 3: 9, 4: 12, 5: 15 },
  4: { 1: 4, 2: 8, 3: 12, 4: 16, 5: 20 },
  5: { 1: 5, 2: 10, 3: 15, 4: 20, 5: 25 }
};

const AUSTRALIAN_STANDARDS_DATABASE = {
  electrical: {
    primary: ["AS/NZS 3000:2018", "AS/NZS 3012:2019", "AS/NZS 4836:2011"],
    whs: ["WHS Act 2011", "WHS Regulation 2017"],
    codes: ["Electrical Safety Code of Practice", "Managing Electrical Risks COP"]
  },
  carpentry: {
    primary: ["AS 1684:2010", "AS/NZS 1170:2002", "AS 4100:2020"],
    whs: ["WHS Act 2011", "Construction Work COP"],
    codes: ["Managing Falls COP", "Noise Management COP"]
  },
  plumbing: {
    primary: ["AS/NZS 3500:2018", "AS/NZS 2032:2006"],
    whs: ["WHS Act 2011", "Confined Spaces COP"],
    codes: ["Hazardous Manual Tasks COP"]
  },
  concreting: {
    primary: ["AS 3600:2018", "AS 1379:2007", "AS/NZS 3850:2015"],
    whs: ["WHS Act 2011", "Silica Dust COP"],
    codes: ["Plant and Equipment COP"]
  },
  roofing: {
    primary: ["AS 1562:2018", "AS/NZS 1891:2007"],
    whs: ["WHS Act 2011", "Falls Prevention COP"],
    codes: ["Working at Heights COP"]
  }
};

const LEGISLATION_REQUIREMENTS = {
  "High Risk Work": ["High Risk Work Licence required", "Safe Work Method Statement mandatory"],
  "Work at Height": ["Fall protection systems required", "Competent worker supervision"],
  "Confined Space": ["Entry permit system", "Atmospheric monitoring required"],
  "Electrical Work": ["Licensed electrician required", "Isolation procedures mandatory"],
  "Hazardous Substances": ["SDS available", "Risk assessment completed"]
};

export default function ComprehensiveRiskComplianceTool({ 
  riskAssessments, 
  tradeType, 
  onComplianceUpdate 
}: RiskComplianceToolProps) {
  const [complianceResult, setComplianceResult] = useState<ComplianceResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedTab, setSelectedTab] = useState("overview");

  const validateRiskScore = (likelihood: number, consequence: number, reportedScore: number) => {
    // Ensure values are within valid range (1-5)
    const validLikelihood = Math.max(1, Math.min(5, likelihood));
    const validConsequence = Math.max(1, Math.min(5, consequence));
    
    const likelihoodRow = RISK_MATRIX[validLikelihood as keyof typeof RISK_MATRIX];
    const expectedScore = likelihoodRow[validConsequence as 1|2|3|4|5];
    
    return {
      isValid: expectedScore === reportedScore,
      expectedScore,
      reportedScore,
      variance: Math.abs(expectedScore - reportedScore)
    };
  };

  const getRiskLevel = (score: number): string => {
    if (score >= 20) return "Extreme";
    if (score >= 15) return "High";
    if (score >= 10) return "Medium";
    if (score >= 5) return "Low";
    return "Very Low";
  };

  const analyzeCompliance = async () => {
    setIsAnalyzing(true);
    
    const issues: ComplianceIssue[] = [];
    const recommendations: string[] = [];
    let riskScoreAccuracy = 100;
    let standardsCompliance = 100;
    let legislationCompliance = 100;

    // 1. Risk Score Validation
    riskAssessments.forEach((risk) => {
      // Validate initial risk score
      const initialValidation = validateRiskScore(
        risk.likelihood || 1, 
        risk.consequence || 1, 
        risk.initialRiskScore
      );
      
      if (!initialValidation.isValid) {
        issues.push({
          type: 'high',
          category: 'risk_calculation',
          message: `Initial risk score incorrect for ${risk.activity}. Expected: ${initialValidation.expectedScore}, Got: ${initialValidation.reportedScore}`,
          riskId: risk.id,
          resolution: `Update risk score to ${initialValidation.expectedScore} based on Likelihood (${risk.likelihood}) × Consequence (${risk.consequence})`
        });
        riskScoreAccuracy -= 10;
      }

      // Validate residual risk score
      const residualValidation = validateRiskScore(
        risk.residualLikelihood || risk.likelihood || 1,
        risk.residualConsequence || risk.consequence || 1,
        risk.residualRiskScore
      );
      
      if (!residualValidation.isValid) {
        issues.push({
          type: 'high',
          category: 'risk_calculation',
          message: `Residual risk score incorrect for ${risk.activity}. Expected: ${residualValidation.expectedScore}, Got: ${residualValidation.reportedScore}`,
          riskId: risk.id,
          resolution: `Update residual risk score to ${residualValidation.expectedScore}`
        });
        riskScoreAccuracy -= 10;
      }

      // Check risk reduction
      if (risk.residualRiskScore >= risk.initialRiskScore) {
        issues.push({
          type: 'critical',
          category: 'risk_calculation',
          message: `Risk not adequately reduced for ${risk.activity}. Residual risk (${risk.residualRiskScore}) should be lower than initial risk (${risk.initialRiskScore})`,
          riskId: risk.id,
          resolution: "Review and strengthen control measures to achieve risk reduction"
        });
        riskScoreAccuracy -= 15;
      }

      // Check high-risk activities have adequate controls
      if (risk.initialRiskScore >= 15 && risk.controlMeasures.length < 3) {
        issues.push({
          type: 'critical',
          category: 'standards',
          message: `Insufficient control measures for high-risk activity: ${risk.activity}. High-risk activities require minimum 3 control measures`,
          riskId: risk.id,
          resolution: "Add additional control measures to meet Australian standards"
        });
        standardsCompliance -= 15;
      }
    });

    // 2. Australian Standards Compliance
    const tradeStandards = AUSTRALIAN_STANDARDS_DATABASE[tradeType as keyof typeof AUSTRALIAN_STANDARDS_DATABASE];
    if (tradeStandards) {
      const allRequiredStandards = [...tradeStandards.primary, ...tradeStandards.whs, ...tradeStandards.codes];
      const mentionedStandards = riskAssessments.flatMap(r => r.legislation || []);
      
      allRequiredStandards.forEach(standard => {
        if (!mentionedStandards.some(mentioned => mentioned.includes(standard.split(':')[0]))) {
          issues.push({
            type: 'medium',
            category: 'standards',
            message: `Missing reference to required standard: ${standard}`,
            resolution: `Include ${standard} in relevant risk assessments`
          });
          standardsCompliance -= 5;
        }
      });
    }

    // 3. Legislation Compliance Check
    riskAssessments.forEach((risk) => {
      const riskLevel = getRiskLevel(risk.initialRiskScore);
      
      if (riskLevel === "High" || riskLevel === "Extreme") {
        if (!risk.legislation.some(leg => leg.includes("WHS"))) {
          issues.push({
            type: 'critical',
            category: 'legislation',
            message: `High/Extreme risk activity "${risk.activity}" missing WHS legislation reference`,
            riskId: risk.id,
            resolution: "Add relevant WHS Act 2011 and WHS Regulation 2017 references"
          });
          legislationCompliance -= 20;
        }
      }

      // Check for specific legislation requirements
      Object.entries(LEGISLATION_REQUIREMENTS).forEach(([category, requirements]) => {
        if (risk.activity.toLowerCase().includes(category.toLowerCase().replace(/\s+/g, ' '))) {
          requirements.forEach(requirement => {
            if (!risk.controlMeasures.some(control => 
              control.toLowerCase().includes(requirement.toLowerCase().substring(0, 10))
            )) {
              issues.push({
                type: 'high',
                category: 'legislation',
                message: `Missing requirement for ${category}: ${requirement}`,
                riskId: risk.id,
                resolution: `Add control measure: ${requirement}`
              });
              legislationCompliance -= 10;
            }
          });
        }
      });
    });

    // 4. Generate Recommendations
    if (riskScoreAccuracy < 90) {
      recommendations.push("Review risk matrix calculations and ensure accuracy");
    }
    if (standardsCompliance < 85) {
      recommendations.push("Include all relevant Australian Standards for complete compliance");
    }
    if (legislationCompliance < 85) {
      recommendations.push("Ensure all WHS legislation requirements are addressed");
    }
    if (issues.filter(i => i.type === 'critical').length > 0) {
      recommendations.push("Address all critical issues before finalizing SWMS");
    }

    // Calculate overall compliance score
    const overallScore = Math.round((riskScoreAccuracy + standardsCompliance + legislationCompliance) / 3);
    const isCompliant = overallScore >= 85 && issues.filter(i => i.type === 'critical').length === 0;

    const result: ComplianceResult = {
      isCompliant,
      overallScore: Math.max(0, overallScore),
      riskScoreAccuracy: Math.max(0, riskScoreAccuracy),
      standardsCompliance: Math.max(0, standardsCompliance),
      legislationCompliance: Math.max(0, legislationCompliance),
      issues,
      recommendations
    };

    setComplianceResult(result);
    onComplianceUpdate(result);
    setIsAnalyzing(false);
  };

  useEffect(() => {
    if (riskAssessments.length > 0) {
      analyzeCompliance();
    }
  }, [riskAssessments, tradeType]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-yellow-600";
    if (score >= 70) return "text-orange-600";
    return "text-red-600";
  };

  const getIssueColor = (type: string) => {
    switch (type) {
      case 'critical': return "border-l-red-600 bg-red-50";
      case 'high': return "border-l-orange-600 bg-orange-50";
      case 'medium': return "border-l-yellow-600 bg-yellow-50";
      case 'low': return "border-l-blue-600 bg-blue-50";
      default: return "border-l-gray-600 bg-gray-50";
    }
  };

  if (isAnalyzing) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Analyzing risk scores and compliance standards...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!complianceResult) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">No risk assessments to analyze</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Risk Score & Compliance Verification Tool
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Scale className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className={`text-2xl font-bold ${getScoreColor(complianceResult.overallScore)}`}>
                {complianceResult.overallScore}%
              </div>
              <div className="text-sm text-blue-600">Overall Compliance</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Calculator className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className={`text-2xl font-bold ${getScoreColor(complianceResult.riskScoreAccuracy)}`}>
                {complianceResult.riskScoreAccuracy}%
              </div>
              <div className="text-sm text-green-600">Risk Score Accuracy</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Book className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className={`text-2xl font-bold ${getScoreColor(complianceResult.standardsCompliance)}`}>
                {complianceResult.standardsCompliance}%
              </div>
              <div className="text-sm text-purple-600">Standards Compliance</div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <Gavel className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <div className={`text-2xl font-bold ${getScoreColor(complianceResult.legislationCompliance)}`}>
                {complianceResult.legislationCompliance}%
              </div>
              <div className="text-sm text-orange-600">Legislation Compliance</div>
            </div>
          </div>

          <Alert className={complianceResult.isCompliant ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"}>
            {complianceResult.isCompliant ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription>
              <strong>
                {complianceResult.isCompliant 
                  ? "COMPLIANT: Your SWMS meets Australian safety standards" 
                  : "NON-COMPLIANT: Issues require resolution before approval"
                }
              </strong>
              <br />
              {complianceResult.issues.filter(i => i.type === 'critical').length > 0 && (
                <span className="text-red-600">
                  {complianceResult.issues.filter(i => i.type === 'critical').length} critical issues must be resolved.
                </span>
              )}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="issues">Issues ({complianceResult.issues.length})</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Risk Score Accuracy</span>
                  <span className={`text-sm font-bold ${getScoreColor(complianceResult.riskScoreAccuracy)}`}>
                    {complianceResult.riskScoreAccuracy}%
                  </span>
                </div>
                <Progress value={complianceResult.riskScoreAccuracy} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Australian Standards Compliance</span>
                  <span className={`text-sm font-bold ${getScoreColor(complianceResult.standardsCompliance)}`}>
                    {complianceResult.standardsCompliance}%
                  </span>
                </div>
                <Progress value={complianceResult.standardsCompliance} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">WHS Legislation Compliance</span>
                  <span className={`text-sm font-bold ${getScoreColor(complianceResult.legislationCompliance)}`}>
                    {complianceResult.legislationCompliance}%
                  </span>
                </div>
                <Progress value={complianceResult.legislationCompliance} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="issues">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Issues</CardTitle>
            </CardHeader>
            <CardContent>
              {complianceResult.issues.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
                  <p className="text-green-600 font-medium">No compliance issues found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {complianceResult.issues.map((issue, index) => (
                    <div key={index} className={`p-4 border-l-4 rounded ${getIssueColor(issue.type)}`}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={issue.type === 'critical' ? 'destructive' : 'secondary'}>
                              {issue.type.toUpperCase()}
                            </Badge>
                            <Badge variant="outline">{issue.category.replace('_', ' ')}</Badge>
                          </div>
                          <p className="text-sm font-medium text-gray-900 mb-1">{issue.message}</p>
                          {issue.resolution && (
                            <p className="text-xs text-gray-600">
                              <strong>Resolution:</strong> {issue.resolution}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations">
          <Card>
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              {complianceResult.recommendations.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
                  <p className="text-green-600 font-medium">No recommendations needed</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {complianceResult.recommendations.map((recommendation, index) => (
                    <div key={index} className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                      <div className="flex items-start gap-3">
                        <Target className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-blue-800">{recommendation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-center">
        <Button onClick={analyzeCompliance} disabled={isAnalyzing}>
          Re-analyze Compliance
        </Button>
      </div>
    </div>
  );
}