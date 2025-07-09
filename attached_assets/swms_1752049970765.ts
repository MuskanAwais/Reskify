export interface SwmsFormData {
  companyName: string;
  projectName: string;
  projectNumber: string;
  projectAddress: string;
  jobName: string;
  jobNumber: string;
  startDate: string;
  duration: string;
  dateCreated: string;
  principalContractor: string;
  projectManager: string;
  siteSupervisor: string;
  authorisingPerson: string;
  scopeOfWorks: string;
  emergencyContacts: EmergencyContact[];
  emergencyProcedures: string;
  emergencyMonitoring: string;
  highRiskActivities: HighRiskActivity[];
  workActivities: WorkActivity[];
}

export interface EmergencyContact {
  name: string;
  phone: string;
}

export interface HighRiskActivity {
  id: string;
  title: string;
  description: string;
  selected: boolean;
  riskLevel?: 'extreme' | 'high' | 'medium' | 'low';
}

export interface WorkActivity {
  id: string;
  activity: string;
  hazards: string[];
  initialRisk: RiskLevel;
  controlMeasures: string[];
  residualRisk: RiskLevel;
  legislation: string[];
}

export interface RiskLevel {
  level: 'extreme' | 'high' | 'medium' | 'low';
  score: number;
}

export interface PpeItem {
  id: string;
  name: string;
  description: string;
  category: string;
  selected: boolean;
  required?: boolean;
}

export type DocumentPage = 'project-info' | 'emergency-info' | 'high-risk-activities' | 'risk-matrix' | 'work-activities' | 'ppe' | 'plant-equipment' | 'msds' | 'sign-in';
