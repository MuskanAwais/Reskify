# CRITICAL MISSING FIELDS IN RISKTEMPLATEBUILDER INTEGRATION

## ❌ SIGNATURE FIELDS - HIGHEST PRIORITY MISSING

These are the **most critical missing fields** - the Person Authorising signature functionality:

| Missing Field | Data Type | Purpose |
|---------------|-----------|---------|
| `signature_method` | string | How signature was provided ('upload' or 'type') |
| `signature_image` | string (Base64) | Uploaded signature image data |
| `signature_text` | string | Typed name signature |
| `signed_by` | string | Name of person who signed |
| `signature_title` | string | Job title/role of signer |
| `signed_at` | string (ISO Date) | When document was signed |

## ❌ ADDITIONAL PROJECT FIELDS MISSING

| Missing Field | Data Type | Purpose |
|---------------|-----------|---------|
| `subcontractor` | string | Subcontractor company name |
| `principal_contractor_abn` | string | Principal contractor ABN |
| `subcontractor_abn` | string | Subcontractor ABN |
| `license_number` | string | License/permit number |
| `document_version` | string | Document version (e.g., "1.0") |

## ❌ SAFETY & EMERGENCY FIELDS MISSING

| Missing Field | Data Type | Purpose |
|---------------|-----------|---------|
| `nearest_hospital` | string | Nearest hospital for emergencies |
| `first_aid_arrangements` | string | First aid arrangements on site |
| `training_requirements` | array | Required training for workers |
| `competency_requirements` | array | Required competencies |
| `permits_required` | array | Required permits/licenses |

## ❌ HIGH-RISK WORK FIELDS MISSING

| Missing Field | Data Type | Purpose |
|---------------|-----------|---------|
| `is_high_risk_work` | boolean | Whether this is high-risk construction work |
| `high_risk_activities` | array | List of high-risk activities identified |
| `whs_regulations` | array | Applicable WHS regulation references |
| `high_risk_justification` | string | Justification for high-risk classification |

---

## ✅ CURRENT WORKING FIELDS

These fields are already correctly mapped and working:

- ✅ Basic project information (name, address, contractors)
- ✅ Creator information (name, position)
- ✅ Company logo (Base64)
- ✅ Work activities (with hazards, risks, controls, legislation)
- ✅ Plant equipment (with risk levels, inspections, certification)
- ✅ PPE requirements
- ✅ HRCW categories (numbers)
- ✅ Emergency contact and evacuation procedure
- ✅ Overall risk level
- ✅ Start and created dates

---

## 🚨 ACTION REQUIRED

**For your RiskTemplateBuilder app to receive ALL data from Riskify:**

1. **Add signature fields** to your PDF template (most important)
2. **Add additional project fields** for complete project information
3. **Add safety/emergency fields** for comprehensive emergency planning
4. **Add high-risk work fields** for regulatory compliance

**All these fields are now being sent** from Riskify - your RiskTemplateBuilder just needs to handle them in the template.

**Current endpoint:** `https://risktemplatebuilder--3000.prod1a.defang.dev/api/generate-pdf`

**System status:** ✅ No fallback - exclusively uses your RiskTemplateBuilder app