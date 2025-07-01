# COMPLETE FIELD MAPPING: Riskify → RiskTemplateBuilder

## PROJECT INFORMATION SECTION

| Riskify Field | RiskTemplateBuilder Field | Data Type | Source |
|---------------|-------------------------|-----------|---------|
| `title` / `jobName` | `project_name` | string | Project Details Step |
| `jobNumber` | `job_number` | string | Project Details Step |
| `projectAddress` / `projectLocation` | `project_address` | string | Project Details Step |
| `principalContractor` | `principal_contractor` | string | Project Details Step |
| `projectManager` | `project_manager` | string | Project Details Step |
| `siteSupervisor` | `site_supervisor` | string | Project Details Step |

## CREATOR INFORMATION SECTION

| Riskify Field | RiskTemplateBuilder Field | Data Type | Source |
|---------------|-------------------------|-----------|---------|
| `swmsCreatorName` | `swms_creator_name` | string | Step 1 - Person Creating SWMS |
| `swmsCreatorPosition` | `swms_creator_position` | string | Step 1 - Person Creating SWMS |

## COMPANY BRANDING

| Riskify Field | RiskTemplateBuilder Field | Data Type | Source |
|---------------|-------------------------|-----------|---------|
| `companyLogo` | `company_logo` | string (Base64) | Step 1 - Logo Upload |

## WORK ACTIVITIES SECTION (Array)

Each activity in `workActivities` array maps to `work_activities` array with:

| Riskify Field | RiskTemplateBuilder Field | Data Type | Source |
|---------------|-------------------------|-----------|---------|
| `activity.activity` / `activity.description` | `activity` | string | Step 2 - Work Activities |
| `activity.hazards` (array → joined) | `hazards` | string | Step 2 - Risk Assessment |
| `activity.initialRisk` / `activity.riskLevel` | `initial_risk` | string | Step 2 - Risk Assessment |
| `activity.controlMeasures` (array → joined) | `control_measures` | string | Step 2 - Risk Assessment |
| `activity.residualRisk` / `activity.finalRiskLevel` | `residual_risk` | string | Step 2 - Risk Assessment |
| `activity.legislation` | `legislation` | string | Step 2 - Australian Standards |

## PLANT & EQUIPMENT SECTION (Array)

Each equipment in `plantEquipment` array maps to `plant_equipment` array with:

| Riskify Field | RiskTemplateBuilder Field | Data Type | Source |
|---------------|-------------------------|-----------|---------|
| `equipment.equipment` / `equipment.name` | `equipment` | string | Step 3 - Plant Equipment |
| `equipment.riskLevel` | `risk_level` | string | Step 3 - Equipment Risk |
| `equipment.nextInspection` | `next_inspection` | string | Step 3 - Inspection Schedule |
| `equipment.certificationRequired` | `certification_required` | string | Step 3 - Certification Status |

## PPE REQUIREMENTS SECTION

| Riskify Field | RiskTemplateBuilder Field | Data Type | Source |
|---------------|-------------------------|-----------|---------|
| `ppeRequirements` | `ppe_requirements` | array | Step 4 - PPE Selection |

## HIGH-RISK CONSTRUCTION WORK CATEGORIES

| Riskify Field | RiskTemplateBuilder Field | Data Type | Source |
|---------------|-------------------------|-----------|---------|
| `hrcwCategories` | `hrcw_categories` | array | Step 3 - HRCW Detection |

## EMERGENCY PROCEDURES SECTION

| Riskify Field | RiskTemplateBuilder Field | Data Type | Source |
|---------------|-------------------------|-----------|---------|
| `emergencyProcedures.emergencyContact` | `emergency_contact` | string | Step 5 - Emergency Details |
| `emergencyProcedures.evacuationProcedure` | `evacuation_procedure` | string | Step 5 - Emergency Details |

## RISK ASSESSMENT SUMMARY

| Riskify Field | RiskTemplateBuilder Field | Data Type | Source |
|---------------|-------------------------|-----------|---------|
| `overallRiskLevel` | `overall_risk_level` | string | Calculated from activities |

## DATE INFORMATION

| Riskify Field | RiskTemplateBuilder Field | Data Type | Source |
|---------------|-------------------------|-----------|---------|
| `startDate` | `start_date` | string (YYYY-MM-DD) | Step 1 - Project Dates |
| Current Date | `created_date` | string (YYYY-MM-DD) | Auto-generated |

## SIGNATURE FIELDS (MISSING - NEEDS TO BE ADDED)

| Riskify Field | RiskTemplateBuilder Field | Data Type | Source |
|---------------|-------------------------|-----------|---------|
| `signatureMethod` | `signature_method` | string | Step 7 - Signature Type ('upload' or 'type') |
| `signatureImage` | `signature_image` | string (Base64) | Step 7 - Uploaded Signature Image |
| `signatureText` | `signature_text` | string | Step 7 - Typed Name Signature |
| `signedBy` | `signed_by` | string | Step 7 - Person's Name |
| `signatureTitle` | `signature_title` | string | Step 7 - Job Title/Role |
| `signedAt` | `signed_at` | string (ISO Date) | Step 7 - When Signed |

## ADDITIONAL PROJECT FIELDS (MISSING - NEEDS TO BE ADDED)

| Riskify Field | RiskTemplateBuilder Field | Data Type | Source |
|---------------|-------------------------|-----------|---------|
| `subcontractor` | `subcontractor` | string | Step 1 - Subcontractor Name |
| `principalContractorAbn` | `principal_contractor_abn` | string | Step 1 - Principal Contractor ABN |
| `subcontractorAbn` | `subcontractor_abn` | string | Step 1 - Subcontractor ABN |
| `licenseNumber` | `license_number` | string | Step 1 - License Number |
| `documentVersion` | `document_version` | string | Step 1 - Document Version |

## ADDITIONAL SAFETY FIELDS (MISSING - NEEDS TO BE ADDED)

| Riskify Field | RiskTemplateBuilder Field | Data Type | Source |
|---------------|-------------------------|-----------|---------|
| `nearestHospital` | `nearest_hospital` | string | Step 5 - Emergency Information |
| `firstAidArrangements` | `first_aid_arrangements` | string | Step 5 - First Aid Details |
| `trainingRequirements` | `training_requirements` | array | Step 5 - Required Training |
| `competencyRequirements` | `competency_requirements` | array | Step 5 - Competency Requirements |
| `permitsRequired` | `permits_required` | array | Step 5 - Required Permits |

## ADDITIONAL RISK FIELDS (MISSING - NEEDS TO BE ADDED)

| Riskify Field | RiskTemplateBuilder Field | Data Type | Source |
|---------------|-------------------------|-----------|---------|
| `isHighRiskWork` | `is_high_risk_work` | boolean | Step 3 - HRCW Detection |
| `highRiskActivities` | `high_risk_activities` | array | Step 3 - HRCW Categories |
| `whsRegulations` | `whs_regulations` | array | Step 3 - WHS Regulation References |
| `highRiskJustification` | `high_risk_justification` | string | Step 3 - HRCW Justification |

---

## DATA TRANSFORMATION EXAMPLES

### Work Activities Transformation
```javascript
// Riskify Format:
workActivities: [
  {
    activity: "Site preparation and safety setup",
    hazards: ["Uneven ground", "Weather conditions", "Vehicle movement"],
    initialRisk: "Medium",
    controlMeasures: ["Level work areas", "Monitor weather", "Establish traffic control"],
    residualRisk: "Low",
    legislation: "WHS Act 2011, WHS Regulation 2017"
  }
]

// RiskTemplateBuilder Format:
work_activities: [
  {
    activity: "Site preparation and safety setup",
    hazards: "Uneven ground, Weather conditions, Vehicle movement",
    initial_risk: "Medium", 
    control_measures: "Level work areas, Monitor weather, Establish traffic control",
    residual_risk: "Low",
    legislation: "WHS Act 2011, WHS Regulation 2017"
  }
]
```

### Plant Equipment Transformation
```javascript
// Riskify Format:
plantEquipment: [
  {
    equipment: "Excavator",
    riskLevel: "High",
    nextInspection: "2025-07-15",
    certificationRequired: true
  }
]

// RiskTemplateBuilder Format:
plant_equipment: [
  {
    equipment: "Excavator",
    risk_level: "High",
    next_inspection: "2025-07-15", 
    certification_required: "Required"
  }
]
```

---

## ENDPOINT DETAILS

- **Method**: POST
- **Current Endpoint**: `https://risktemplatebuilder--3000.prod1a.defang.dev/api/generate-pdf`
- **Content-Type**: `application/json`
- **Expected Response**: PDF binary data

---

## COMPLETE JSON PAYLOAD STRUCTURE - ALL FIELDS

```json
{
  "project_name": "string",
  "job_number": "string", 
  "project_address": "string",
  "principal_contractor": "string",
  "project_manager": "string",
  "site_supervisor": "string",
  "subcontractor": "string",
  "principal_contractor_abn": "string",
  "subcontractor_abn": "string",
  "license_number": "string",
  "document_version": "string",
  "swms_creator_name": "string",
  "swms_creator_position": "string",
  "company_logo": "string (Base64)",
  "signature_method": "string (upload|type)",
  "signature_image": "string (Base64)",
  "signature_text": "string",
  "signed_by": "string",
  "signature_title": "string",
  "signed_at": "string (ISO Date)",
  "work_activities": [
    {
      "activity": "string",
      "hazards": "string",
      "initial_risk": "string",
      "control_measures": "string", 
      "residual_risk": "string",
      "legislation": "string"
    }
  ],
  "plant_equipment": [
    {
      "equipment": "string",
      "risk_level": "string",
      "next_inspection": "string",
      "certification_required": "string"
    }
  ],
  "ppe_requirements": ["string"],
  "hrcw_categories": [number],
  "is_high_risk_work": boolean,
  "high_risk_activities": ["string"],
  "whs_regulations": ["string"],
  "high_risk_justification": "string",
  "emergency_contact": "string",
  "evacuation_procedure": "string",
  "nearest_hospital": "string",
  "first_aid_arrangements": "string",
  "training_requirements": ["object"],
  "competency_requirements": ["object"],
  "permits_required": ["string"],
  "overall_risk_level": "string",
  "start_date": "YYYY-MM-DD",
  "created_date": "YYYY-MM-DD"
}
```

This mapping ensures every editable field in your RiskTemplateBuilder app receives the correct data from Riskify's SWMS builder.