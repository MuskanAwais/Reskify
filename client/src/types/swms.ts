export type DocumentPage = 'project-info' | 'emergency-info' | 'high-risk-activities' | 'risk-matrix' | 'work-activities' | 'ppe' | 'plant-equipment' | 'msds' | 'sign-in';

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
  emergencyContacts: Array<{
    name: string;
    phone: string;
  }>;
  emergencyProcedures: string;
  emergencyMonitoring: string;
  highRiskActivities: any[];
  workActivities: any[];
}