# Complete SWMS Generator - Installation Guide

## Overview
This is a complete Safe Work Method Statement (SWMS) generator with a professional split-screen interface, 8 navigation tabs, multiple PDF generation methods, and sophisticated risk assessment functionality.

## File Structure
Your project should have the following structure:

```
src/
├── components/
│   └── RiskBadgeNew.tsx           # Risk badge component (File 7)
├── pages/
│   └── SwmsComplete.tsx           # Main SWMS component (Files 1-6 combined)
├── shared/
│   └── schema.ts                  # Type definitions (File 9)
├── assets/
│   └── riskify-logo.svg          # Riskify logo (required)
└── index.css                     # Complete styles (File 8)
```

## Installation Steps

### 1. Install Required Dependencies

```bash
npm install html2canvas jspdf @react-pdf/renderer react zod
```

### 2. Create the Main Component

Combine all files 1-6 into a single `SwmsComplete.tsx` file:

1. Start with the imports and interface from File 1
2. Add all render functions from Files 2-5  
3. Add the main component return from File 6
4. Ensure all functions are properly connected

### 3. Add the RiskBadgeNew Component

Copy File 7 content to `src/components/RiskBadgeNew.tsx`

### 4. Add Complete CSS Styles

Copy File 8 content to your main CSS file (usually `src/index.css`)

### 5. Add Schema and Types

Copy File 9 content to `src/shared/schema.ts`

### 6. Add Required Assets

Ensure you have the Riskify logo SVG file in your assets folder:
- `src/assets/riskify-logo.svg`

## Key Features

### Split-Screen Interface
- **Left Panel (1/3 width)**: Form controls with 8 navigation tabs
- **Right Panel (2/3 width)**: Live document preview with pixel-perfect styling

### Navigation Tabs
1. Project Info - Basic project details and authorization
2. Emergency Info - Emergency contacts and procedures  
3. High Risk - High risk activities selection
4. Risk Matrix - Risk assessment matrices
5. Work Activities - Detailed work breakdown with risk analysis
6. PPE - Personal protective equipment requirements
7. Plant & Equipment - Equipment register with risk levels
8. Sign In Register - Personnel sign-in tracking
9. MSDS - Material Safety Data Sheets management

### PDF Generation Methods
- **PNG Method**: Captures live preview as images, converts to PDF
- **Vector Method**: Uses React-PDF for clean vector output
- **Print Method**: Browser print functionality
- **Pixel Method**: High-resolution image-based PDF

### Professional Styling
- A4 landscape format (297mm x 210mm)
- Riskify branding with green theme (#2c5530)
- Watermarked backgrounds
- Consistent typography using Inter font
- Risk badges with proper color coding
- Table layouts with proper spacing and borders

### Real-Time Features
- Live preview updates as you type
- Form validation with Zod schemas
- Risk level calculations
- Automatic badge color coding
- Responsive design for all screen sizes

## Usage

### Basic Implementation

```tsx
import SwmsComplete from './pages/SwmsComplete';

function App() {
  return (
    <div className="App">
      <SwmsComplete />
    </div>
  );
}

export default App;
```

### Customization Options

#### Modify Company Branding
Update the default form data in the main component:

```tsx
const defaultFormData = {
  companyName: 'Your Company Name',
  projectName: 'Your Project',
  // ... other fields
};
```

#### Add Custom Risk Levels
Modify the risk level schema in `schema.ts`:

```tsx
export const riskLevelSchema = z.object({
  level: z.enum(['extreme', 'high', 'medium', 'low', 'custom']),
  score: z.number()
});
```

#### Customize PDF Output
Adjust PDF generation settings in the `handlePrintPDF` function:

```tsx
const canvas = await html2canvas(element, {
  scale: 1.8,        // Adjust for quality vs file size
  useCORS: true,
  allowTaint: true,
  backgroundColor: '#ffffff'
});
```

## Advanced Configuration

### Risk Matrix Customization
The risk matrix can be customized by modifying the calculation logic:

```tsx
const getRiskLevel = (score: number) => {
  if (score >= 15) return 'Extreme';
  if (score >= 10) return 'High'; 
  if (score >= 5) return 'Medium';
  return 'Low';
};
```

### Custom PPE Categories
Add new PPE categories in the schema:

```tsx
export const PPE_CATEGORIES = {
  HEAD: 'head',
  EYE: 'eye',
  RESPIRATORY: 'respiratory',
  // Add custom categories
  CUSTOM: 'custom'
} as const;
```

### MSDS Document Integration
The MSDS system supports PDF uploads and base64 encoding for storage:

```tsx
const handleFileUpload = (file: File) => {
  const reader = new FileReader();
  reader.onload = (event) => {
    const base64Data = event.target?.result as string;
    // Store in form data
  };
  reader.readAsDataURL(file);
};
```

## Browser Compatibility

### Supported Browsers
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

### Required Features
- HTML5 Canvas API (for PDF generation)
- FileReader API (for file uploads)
- CSS Grid and Flexbox
- ES6+ JavaScript features

## Performance Optimization

### PDF Generation
- Use scale factor 1.8 for optimal quality/size balance
- Enable compression for large documents
- Implement progressive loading for multiple pages

### Memory Management
- Clear canvas references after PDF generation
- Use lazy loading for large form sections
- Implement virtual scrolling for large lists

## Troubleshooting

### PDF Generation Issues
1. **Blank PDFs**: Reduce scale factor or increase timeout
2. **Poor Quality**: Increase scale factor but expect larger files
3. **Memory Errors**: Process pages individually for large documents

### Styling Issues
1. **Badge Alignment**: Ensure CSS override classes are loaded
2. **Table Layouts**: Check border-collapse and width settings
3. **Font Loading**: Verify Google Fonts are properly imported

### Form Validation
1. **Schema Errors**: Check Zod schema definitions match form structure
2. **Type Mismatches**: Ensure form data types match schema expectations
3. **Validation Timing**: Use debounced validation for performance

## Support and Maintenance

### Regular Updates
- Monitor dependency security updates
- Test PDF generation across browsers
- Validate form schemas with real data
- Update risk assessment matrices as needed

### Performance Monitoring
- Track PDF generation times
- Monitor memory usage during form operations
- Analyze user interaction patterns
- Optimize slow form sections

This complete SWMS generator provides a professional, production-ready solution for construction safety documentation with comprehensive risk management capabilities.