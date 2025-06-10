import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle, XCircle, Calculator } from "lucide-react";

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
  responsible: string;
}

interface RiskValidationProps {
  riskAssessments: RiskAssessment[];
  onValidationComplete: (validatedRisks: RiskAssessment[], corrections: any[]) => void;
}

const RISK_MATRIX: Record<number, Record<number, number>> = {
  1: { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5 },
  2: { 1: 2, 2: 4, 3: 6, 4: 8, 5: 10 },
  3: { 1: 3, 2: 6, 3: 9, 4: 12, 5: 15 },
  4: { 1: 4, 2: 8, 3: 12, 4: 16, 5: 20 },
  5: { 1: 5, 2: 10, 3: 15, 4: 20, 5: 25 }
};

const getRiskLevel = (score: number): string => {
  if (score >= 20) return "Extreme";
  if (score >= 15) return "High";
  if (score >= 10) return "Medium";
  if (score >= 5) return "Low";
  return "Very Low";
};

const getRiskColor = (level: string): string => {
  switch (level) {
    case "Extreme": return "bg-red-600 text-white";
    case "High": return "bg-red-500 text-white";
    case "Medium": return "bg-yellow-500 text-white";
    case "Low": return "bg-green-500 text-white";
    case "Very Low": return "bg-blue-500 text-white";
    default: return "bg-gray-500 text-white";
  }
};

const validateRiskScore = (likelihood: number, consequence: number, reportedScore: number) => {
  const likelihoodRow = RISK_MATRIX[likelihood];
  const calculatedScore = likelihoodRow ? likelihoodRow[consequence] : 1;
  return {
    isValid: calculatedScore === reportedScore,
    calculatedScore: calculatedScore || 1,
    reportedScore,
    difference: Math.abs((calculatedScore || 1) - reportedScore)
  };
};

export default function RiskValidationSystem({ riskAssessments = [], onValidationComplete }: RiskValidationProps) {
  const [validatedRisks, setValidatedRisks] = useState<RiskAssessment[]>([]);
  const [corrections, setCorrections] = useState<any[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [validationComplete, setValidationComplete] = useState(false);

  const performValidation = () => {
    setIsValidating(true);
    const correctionsList: any[] = [];
    
    const validated = riskAssessments.map((risk) => {
      let correctedRisk = { ...risk };
      
      // Validate initial risk score
      const initialValidation = validateRiskScore(
        risk.likelihood || 1, 
        risk.consequence || 1, 
        risk.initialRiskScore
      );
      
      if (!initialValidation.isValid) {
        correctionsList.push({
          riskId: risk.id,
          activity: risk.activity,
          type: "Initial Risk Score Correction",
          original: risk.initialRiskScore,
          corrected: initialValidation.calculatedScore,
          reason: `Calculated from Likelihood (${risk.likelihood}) × Consequence (${risk.consequence})`
        });
        
        correctedRisk.initialRiskScore = initialValidation.calculatedScore;
        correctedRisk.riskLevel = getRiskLevel(initialValidation.calculatedScore);
      }
      
      // Validate residual risk score
      const residualValidation = validateRiskScore(
        risk.residualLikelihood || risk.likelihood || 1,
        risk.residualConsequence || risk.consequence || 1,
        risk.residualRiskScore
      );
      
      if (!residualValidation.isValid) {
        correctionsList.push({
          riskId: risk.id,
          activity: risk.activity,
          type: "Residual Risk Score Correction",
          original: risk.residualRiskScore,
          corrected: residualValidation.calculatedScore,
          reason: `Calculated from Residual Likelihood (${risk.residualLikelihood || risk.likelihood}) × Residual Consequence (${risk.residualConsequence || risk.consequence})`
        });
        
        correctedRisk.residualRiskScore = residualValidation.calculatedScore;
      }
      
      // Validate risk reduction
      if (correctedRisk.residualRiskScore >= correctedRisk.initialRiskScore) {
        correctionsList.push({
          riskId: risk.id,
          activity: risk.activity,
          type: "Risk Reduction Warning",
          original: risk.residualRiskScore,
          corrected: Math.max(1, correctedRisk.initialRiskScore - 2),
          reason: "Residual risk should be lower than initial risk after control measures"
        });
        
        correctedRisk.residualRiskScore = Math.max(1, correctedRisk.initialRiskScore - 2);
      }
      
      // Validate high-risk activities have adequate control measures
      if (correctedRisk.initialRiskScore >= 15 && correctedRisk.controlMeasures.length < 3) {
        correctionsList.push({
          riskId: risk.id,
          activity: risk.activity,
          type: "Control Measures Warning",
          original: risk.controlMeasures.length,
          corrected: "3+",
          reason: "High-risk activities require minimum 3 control measures"
        });
      }
      
      return correctedRisk;
    });
    
    setValidatedRisks(validated);
    setCorrections(correctionsList);
    setValidationComplete(true);
    setIsValidating(false);
    
    onValidationComplete(validated, correctionsList);
  };

  useEffect(() => {
    if (riskAssessments.length > 0) {
      performValidation();
    }
  }, [riskAssessments]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Risk Score Validation & Correction
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {!validationComplete ? (
              <div className="text-center py-4">
                <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Validating risk calculations...</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-600">
                      {validatedRisks.filter(r => {
                        const initialValid = validateRiskScore(r.likelihood || 1, r.consequence || 1, r.initialRiskScore);
                        const residualValid = validateRiskScore(r.residualLikelihood || r.likelihood || 1, r.residualConsequence || r.consequence || 1, r.residualRiskScore);
                        return initialValid.isValid && residualValid.isValid;
                      }).length}
                    </div>
                    <div className="text-sm text-green-600">Valid Calculations</div>
                  </div>
                  
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <AlertTriangle className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-yellow-600">{corrections.length}</div>
                    <div className="text-sm text-yellow-600">Corrections Applied</div>
                  </div>
                  
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <XCircle className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-600">
                      {validatedRisks.filter(r => r.initialRiskScore >= 15).length}
                    </div>
                    <div className="text-sm text-blue-600">High Risk Activities</div>
                  </div>
                </div>

                {corrections.length > 0 && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>{corrections.length} corrections applied</strong> to ensure accurate risk calculations and Australian compliance standards.
                    </AlertDescription>
                  </Alert>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {corrections.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Risk Calculation Corrections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {corrections.map((correction, index) => (
                <div key={index} className="p-3 border rounded-lg bg-yellow-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-sm">{correction.activity}</h4>
                      <p className="text-xs text-gray-600 mt-1">{correction.type}</p>
                      <p className="text-xs text-gray-500 mt-1">{correction.reason}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">Original: {correction.original}</div>
                      <div className="text-xs text-green-600">Corrected: {correction.corrected}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {validatedRisks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Validated Risk Matrix</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-2 text-left">Activity</th>
                    <th className="border border-gray-300 p-2 text-center">Initial Risk</th>
                    <th className="border border-gray-300 p-2 text-center">Residual Risk</th>
                    <th className="border border-gray-300 p-2 text-center">Risk Level</th>
                    <th className="border border-gray-300 p-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {validatedRisks.map((risk) => {
                    const initialValid = validateRiskScore(risk.likelihood || 1, risk.consequence || 1, risk.initialRiskScore);
                    const residualValid = validateRiskScore(risk.residualLikelihood || risk.likelihood || 1, risk.residualConsequence || risk.consequence || 1, risk.residualRiskScore);
                    const isValid = initialValid.isValid && residualValid.isValid;
                    
                    return (
                      <tr key={risk.id} className="hover:bg-gray-50">
                        <td className="border border-gray-300 p-2 font-medium">{risk.activity}</td>
                        <td className="border border-gray-300 p-2 text-center">
                          <Badge variant={initialValid.isValid ? "default" : "destructive"}>
                            {risk.initialRiskScore}
                          </Badge>
                        </td>
                        <td className="border border-gray-300 p-2 text-center">
                          <Badge variant={residualValid.isValid ? "default" : "destructive"}>
                            {risk.residualRiskScore}
                          </Badge>
                        </td>
                        <td className="border border-gray-300 p-2 text-center">
                          <Badge className={getRiskColor(getRiskLevel(risk.residualRiskScore))}>
                            {getRiskLevel(risk.residualRiskScore)}
                          </Badge>
                        </td>
                        <td className="border border-gray-300 p-2 text-center">
                          {isValid ? (
                            <CheckCircle className="h-4 w-4 text-green-600 mx-auto" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-yellow-600 mx-auto" />
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}