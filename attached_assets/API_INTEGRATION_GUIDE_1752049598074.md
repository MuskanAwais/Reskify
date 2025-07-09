# SWMS PDF Generator API Integration Guide

## Overview
This guide provides everything needed to integrate with the SWMS PDF generator from your external application.

## Base URL
```
https://79937ff1-cac5-4736-b2b2-1df5354fb4b3-00-1bbtav2ooagxg.spock.replit.dev
```

## Authentication
Currently no authentication required for PDF generation endpoints.

## Available Endpoints

### 1. Health Check
**GET** `/api/health`
- **Purpose**: Verify the service is running
- **Response**: `{"status":"ok","timestamp":"2025-07-07T00:22:19.679Z"}`

### 2. PDF Generation (Primary Method)
**POST** `/api/swms/export-pdf`
- **Purpose**: Generate PDF from HTML content using Puppeteer
- **Content-Type**: `application/json`

**Request Body:**
```json
{
  "html": "<html>...</html>",
  "filename": "SWMS_ProjectName.pdf"
}
```

**Response:**
- **Success**: Returns PDF file as binary stream
- **Headers**: 
  - `Content-Type: application/pdf`
  - `Content-Disposition: attachment; filename="SWMS_ProjectName.pdf"`
- **Error**: `{"error":"Failed to generate PDF","details":"error message"}`

### 3. Form Data Processing
**POST** `/api/swms/generate-pdf`
- **Purpose**: Process form data and initiate PDF generation
- **Content-Type**: `application/json`

**Request Body:**
```json
{
  "formData": {
    // Complete SWMS form data object (see data format below)
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "PDF generation initiated",
  "downloadUrl": "/api/swms/download-pdf",
  "timestamp": "2025-07-07T00:22:19.679Z"
}
```

### 4. Save SWMS Document
**POST** `/api/swms/save`
- **Purpose**: Save SWMS document data
- **Content-Type**: `application/json`

**Request Body:**
```json
{
  "formData": {
    // Complete SWMS form data object
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "SWMS document saved successfully",
  "id": "swms_1751847739000",
  "timestamp": "2025-07-07T00:22:19.679Z"
}
```

## Complete Data Format

### SWMS Form Data Structure
```typescript
interface SwmsFormData {
  // Basic Project Information
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
  authorisingPosition: string;
  scopeOfWorks: string;
  reviewAndMonitoring: string;
  companyLogo?: string; // Base64 encoded image
  
  // Emergency Information
  emergencyContacts: Array<{
    name: string;
    phone: string;
  }>;
  emergencyProcedures: string;
  emergencyMonitoring: string;
  
  // High Risk Activities
  highRiskActivities: Array<{
    id: string;
    title: string;
    description: string;
    selected: boolean;
    riskLevel?: 'extreme' | 'high' | 'medium' | 'low';
  }>;
  
  // Work Activities
  workActivities: Array<{
    id: string;
    activity: string;
    hazards: string[];
    initialRisk: {
      level: 'extreme' | 'high' | 'medium' | 'low';
      score: number;
    };
    controlMeasures: string[];
    residualRisk: {
      level: 'extreme' | 'high' | 'medium' | 'low';
      score: number;
    };
    legislation: string[];
  }>;
  
  // PPE Items
  ppeItems: Array<{
    id: string;
    name: string;
    description: string;
    selected: boolean;
    category?: string;
    required?: boolean;
  }>;
  
  // Plant & Equipment
  plantEquipment: Array<{
    id: string;
    equipment: string;
    model: string;
    serialNumber: string;
    riskLevel: 'high' | 'medium' | 'low';
    nextInspection: string;
    certificationRequired: boolean;
    hazards: string[];
    initialRisk: {
      level: 'extreme' | 'high' | 'medium' | 'low';
      score: number;
    };
    controlMeasures: string[];
    residualRisk: {
      level: 'extreme' | 'high' | 'medium' | 'low';
      score: number;
    };
    legislation: string[];
    operator?: string;
  }>;
  
  // Sign In Entries
  signInEntries: Array<{
    id: string;
    name: string;
    company: string;
    position: string;
    date: string;
    timeIn: string;
    timeOut: string;
    signature: string;
    inductionComplete: boolean;
    number?: number;
  }>;
  
  // MSDS Documents
  msdsDocuments: Array<{
    id: string;
    fileName: string;
    customTitle: string;
    fileData: string; // Base64 encoded PDF data
    uploadDate: string;
    selected: boolean;
  }>;
  
  // Authorization
  authorisingSignature?: string; // Base64 encoded signature
  authorisingSignatureName?: string;
}
```

## Sample Request Data

### Complete Example
```json
{
  "formData": {
    "companyName": "ABC Construction Ltd",
    "projectName": "Office Tower Construction",
    "projectNumber": "OTC-2025-001",
    "projectAddress": "123 Business Street, Sydney NSW 2000",
    "jobName": "Office Tower Construction",
    "jobNumber": "OTC-2025-001",
    "startDate": "15th January 2025",
    "duration": "12 Months",
    "dateCreated": "7th July 2025",
    "principalContractor": "ABC Construction Ltd",
    "projectManager": "John Smith",
    "siteSupervisor": "Sarah Johnson",
    "authorisingPerson": "Michael Brown",
    "authorisingPosition": "Safety Manager",
    "scopeOfWorks": "Construction of 20-story office building including foundations, structural steel, concrete work, and fit-out",
    "reviewAndMonitoring": "This SWMS will be reviewed weekly by the site supervisor and updated when scope changes occur. All workers will be briefed during daily toolbox talks.",
    "emergencyContacts": [
      { "name": "Emergency Services", "phone": "000" },
      { "name": "Site Manager", "phone": "0412 345 678" },
      { "name": "Safety Officer", "phone": "0413 456 789" }
    ],
    "emergencyProcedures": "In case of emergency, evacuate to assembly point at main gate. Call 000 for emergency services. Report to site supervisor immediately.",
    "emergencyMonitoring": "Emergency procedures reviewed monthly. Emergency equipment checked weekly. All personnel trained in emergency response.",
    "highRiskActivities": [
      {
        "id": "1",
        "title": "Work at heights above 2 metres",
        "description": "Working on scaffolding and elevated platforms",
        "selected": true,
        "riskLevel": "high"
      },
      {
        "id": "2",
        "title": "Crane operations",
        "description": "Mobile crane operations for material lifting",
        "selected": true,
        "riskLevel": "high"
      }
    ],
    "workActivities": [
      {
        "id": "1",
        "activity": "Excavation for building foundations",
        "hazards": [
          "Cave-in of excavation walls",
          "Contact with underground utilities",
          "Heavy machinery operation hazards"
        ],
        "initialRisk": {
          "level": "high",
          "score": 12
        },
        "controlMeasures": [
          "Proper shoring and benching of excavation",
          "Dial before you dig utility location",
          "Exclusion zones around machinery"
        ],
        "residualRisk": {
          "level": "medium",
          "score": 6
        },
        "legislation": [
          "Work Health and Safety Regulation 2017",
          "Australian Standard AS 2187.1"
        ]
      }
    ],
    "ppeItems": [
      {
        "id": "1",
        "name": "Hard Hat",
        "description": "Class B safety helmet",
        "selected": true,
        "category": "Head Protection",
        "required": true
      },
      {
        "id": "2",
        "name": "Safety Boots",
        "description": "Steel toe cap boots",
        "selected": true,
        "category": "Foot Protection",
        "required": true
      }
    ],
    "plantEquipment": [
      {
        "id": "1",
        "equipment": "Mobile Crane",
        "model": "Liebherr LTM 1060-3.1",
        "serialNumber": "LC001234",
        "riskLevel": "high",
        "nextInspection": "15th August 2025",
        "certificationRequired": true,
        "hazards": [
          "Load swing hazards",
          "Overhead power line contact"
        ],
        "initialRisk": {
          "level": "high",
          "score": 15
        },
        "controlMeasures": [
          "Exclusion zones established",
          "Spotter assigned for operations"
        ],
        "residualRisk": {
          "level": "medium",
          "score": 8
        },
        "legislation": [
          "Work Health and Safety Regulation 2017"
        ],
        "operator": "John Crane"
      }
    ],
    "signInEntries": [
      {
        "id": "1",
        "name": "",
        "company": "",
        "position": "",
        "date": "",
        "timeIn": "",
        "timeOut": "",
        "signature": "",
        "inductionComplete": false
      }
    ],
    "msdsDocuments": [
      {
        "id": "1",
        "fileName": "concrete_sealer.pdf",
        "customTitle": "Concrete Sealer Safety Data Sheet",
        "fileData": "JVBERi0xLjQKJcOkw7zDtsO/CjIgMCBvYmoKPDwKL0xlbmd0aCA...", // Base64 PDF data
        "uploadDate": "2025-07-07",
        "selected": true
      }
    ]
  }
}
```

## Integration Steps

### 1. Basic Integration (Form Data → PDF)
```javascript
// Send form data to generate PDF
const response = await fetch('https://79937ff1-cac5-4736-b2b2-1df5354fb4b3-00-1bbtav2ooagxg.spock.replit.dev/api/swms/generate-pdf', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    formData: swmsData
  })
});

const result = await response.json();
console.log(result); // Success response
```

### 2. Advanced Integration (HTML → PDF)
```javascript
// Generate PDF from HTML content
const htmlContent = `
  <div style="font-family: Arial;">
    <h1>SWMS Document</h1>
    <p>Project: ${projectName}</p>
    <!-- Your HTML content -->
  </div>
`;

const response = await fetch('https://79937ff1-cac5-4736-b2b2-1df5354fb4b3-00-1bbtav2ooagxg.spock.replit.dev/api/swms/export-pdf', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    html: htmlContent,
    filename: `SWMS_${projectName}.pdf`
  })
});

// Handle binary PDF response
const pdfBlob = await response.blob();
const url = URL.createObjectURL(pdfBlob);
const link = document.createElement('a');
link.href = url;
link.download = `SWMS_${projectName}.pdf`;
link.click();
```

## Error Handling

### Common Error Responses
```json
{
  "error": "Form data is required"
}
```

```json
{
  "error": "Failed to generate PDF",
  "details": "Puppeteer browser launch failed"
}
```

### HTTP Status Codes
- **200**: Success
- **400**: Bad Request (missing required data)
- **500**: Internal Server Error (PDF generation failed)

## Required Fields

### Minimum Required Fields
```json
{
  "companyName": "Required",
  "projectName": "Required",
  "projectNumber": "Required",
  "projectAddress": "Required",
  "jobName": "Required",
  "jobNumber": "Required",
  "startDate": "Required",
  "duration": "Required",
  "dateCreated": "Required",
  "principalContractor": "Required",
  "projectManager": "Required",
  "siteSupervisor": "Required",
  "authorisingPerson": "Required",
  "authorisingPosition": "Required",
  "scopeOfWorks": "Required",
  "reviewAndMonitoring": "Required"
}
```

## Performance Notes

- PDF generation typically takes 5-15 seconds depending on document complexity
- Maximum recommended document size: 50 pages
- HTML content should be well-formed for best results
- Base64 encoded images should be optimized for web use

## Testing

### Test the API
```bash
# Health check
curl -X GET "https://79937ff1-cac5-4736-b2b2-1df5354fb4b3-00-1bbtav2ooagxg.spock.replit.dev/api/health"

# Test PDF generation
curl -X POST "https://79937ff1-cac5-4736-b2b2-1df5354fb4b3-00-1bbtav2ooagxg.spock.replit.dev/api/swms/generate-pdf" \
  -H "Content-Type: application/json" \
  -d '{"formData":{"companyName":"Test Company","projectName":"Test Project","projectNumber":"123","projectAddress":"Test Address","jobName":"Test Job","jobNumber":"456","startDate":"Today","duration":"1 week","dateCreated":"Today","principalContractor":"Test Contractor","projectManager":"Test Manager","siteSupervisor":"Test Supervisor","authorisingPerson":"Test Person","authorisingPosition":"Test Position","scopeOfWorks":"Test scope","reviewAndMonitoring":"Test monitoring","emergencyContacts":[],"emergencyProcedures":"","emergencyMonitoring":"","highRiskActivities":[],"workActivities":[],"ppeItems":[],"plantEquipment":[],"signInEntries":[],"msdsDocuments":[]}}'
```

## Support

For technical issues or questions about the API:
1. Check the health endpoint first
2. Verify your data format matches the schema
3. Check HTTP status codes and error messages
4. Ensure all required fields are provided