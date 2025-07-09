# Complete SWMS App Code Export Guide

## 📋 Overview
This guide helps you transfer the complete SWMS Document Generator app code to another project. The app is a full-stack React/Express application with TypeScript, Tailwind CSS, and PostgreSQL.

## 🗂️ Required Files and Directories

### 1. Root Configuration Files
```
package.json              # All dependencies and scripts
tsconfig.json            # TypeScript configuration
vite.config.ts          # Vite build configuration
tailwind.config.ts      # Tailwind CSS configuration
postcss.config.js       # PostCSS configuration
drizzle.config.ts       # Database configuration
components.json         # Shadcn/ui configuration
replit.md              # Project documentation
```

### 2. Client-Side Code (Frontend)
```
client/
├── index.html                    # HTML template
├── src/
│   ├── App.tsx                   # Main app component
│   ├── main.tsx                  # React entry point
│   ├── index.css                 # Global styles
│   ├── components/
│   │   ├── swms-generator.tsx    # Main generator component
│   │   ├── document-preview.tsx  # Document preview component
│   │   ├── swms-form.tsx         # Form components
│   │   ├── swms-preview.tsx      # Preview components
│   │   ├── RiskBadgeNew.tsx      # Risk badge component
│   │   ├── emergency-info-page.tsx
│   │   ├── high-risk-activities-page.tsx
│   │   ├── risk-matrix-page.tsx
│   │   └── ui/                   # Shadcn/ui components (48 files)
│   ├── pages/
│   │   ├── home.tsx              # Home page
│   │   ├── swms-complete.tsx     # Complete SWMS page
│   │   ├── swms-simple.tsx       # Simple SWMS page
│   │   ├── swms-generator.tsx    # Generator page
│   │   └── not-found.tsx         # 404 page
│   ├── lib/
│   │   ├── queryClient.ts        # React Query setup
│   │   └── utils.ts              # Utility functions
│   ├── hooks/
│   │   ├── use-toast.ts          # Toast hook
│   │   └── use-mobile.tsx        # Mobile detection
│   ├── types/
│   └── assets/
```

### 3. Server-Side Code (Backend)
```
server/
├── index.ts            # Express server entry point
├── routes.ts           # API routes
├── db.ts               # Database connection
├── storage.ts          # Storage interface
└── vite.ts             # Vite middleware
```

### 4. Shared Code
```
shared/
└── schema.ts           # Database schema and types
```

## 🔧 Step-by-Step Transfer Process

### Step 1: Create New Project Structure
```bash
mkdir your-new-project
cd your-new-project
mkdir -p client/src/{components,pages,lib,hooks,types,assets}
mkdir -p client/src/components/ui
mkdir -p server
mkdir -p shared
```

### Step 2: Copy Configuration Files
Copy these files from the root directory:
- `package.json`
- `tsconfig.json`
- `vite.config.ts`
- `tailwind.config.ts`
- `postcss.config.js`
- `drizzle.config.ts`
- `components.json`

### Step 3: Install Dependencies
```bash
npm install
```

### Step 4: Copy Client Code
Copy all files from:
- `client/index.html`
- `client/src/` (entire directory)

### Step 5: Copy Server Code
Copy all files from:
- `server/` (entire directory)

### Step 6: Copy Shared Code
Copy all files from:
- `shared/` (entire directory)

### Step 7: Copy Assets (if needed)
Copy any assets from:
- `client/src/assets/` (if you have custom assets)

## 📦 Key Dependencies to Install

### Core Dependencies
```json
{
  "dependencies": {
    "@hookform/resolvers": "^3.10.0",
    "@tanstack/react-query": "^5.60.5",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-hook-form": "^7.55.0",
    "wouter": "^3.3.5",
    "zod": "^3.24.2",
    "express": "^4.21.2",
    "drizzle-orm": "^0.39.1",
    "drizzle-zod": "^0.7.0",
    "@neondatabase/serverless": "^0.10.4"
  }
}
```

### UI Dependencies
```json
{
  "dependencies": {
    "@radix-ui/react-*": "Latest versions",
    "tailwindcss": "^3.4.17",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "lucide-react": "^0.453.0"
  }
}
```

### PDF Generation Dependencies
```json
{
  "dependencies": {
    "html2canvas": "^1.4.1",
    "html2pdf.js": "^0.10.3",
    "jspdf": "^3.0.1",
    "pdf-lib": "^1.17.1",
    "puppeteer": "^24.11.2"
  }
}
```

## 🎯 Environment Setup

### Environment Variables
```bash
# Required for database connection
DATABASE_URL=your_postgresql_connection_string

# Optional for development
NODE_ENV=development
```

### Development Scripts
```json
{
  "scripts": {
    "dev": "NODE_ENV=development tsx server/index.ts",
    "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "start": "NODE_ENV=production node dist/index.js",
    "db:push": "drizzle-kit push"
  }
}
```

## 🚀 Running the App

### Development Mode
```bash
npm run dev
```
This starts both the Express server and Vite dev server.

### Production Build
```bash
npm run build
npm run start
```

### Database Setup
```bash
npm run db:push
```

## 🔍 Key Features Included

### ✅ Core Functionality
- Complete SWMS document generation
- Real-time form validation with Zod
- Live document preview
- PDF generation (3 methods: Print, PNG-to-PDF, Puppeteer)
- MSDS attachment handling
- Risk assessment matrix
- Work activities management
- PPE and plant equipment tracking

### ✅ Technical Features
- TypeScript for type safety
- React 18 with hooks
- Express.js backend
- PostgreSQL database with Drizzle ORM
- Tailwind CSS styling
- Shadcn/ui components
- React Query for state management
- Responsive design

### ✅ Advanced Features
- Multi-page document generation
- Watermark system
- Company logo upload
- Risk badge system
- Table pagination
- PDF attachment merging
- Error handling and validation

## 🎨 Customization Notes

### Brand Colors
The app uses Riskify's green theme (#2c5530). To customize:
- Update colors in `client/src/index.css`
- Modify the color scheme in `tailwind.config.ts`

### Logo and Branding
- Update logo imports in components
- Modify company information in default form data

### Form Fields
- Schema is defined in `shared/schema.ts`
- Add/remove fields by updating the schema and corresponding form components

## 📚 Documentation Files to Keep
- `replit.md` - Complete project documentation
- `API_INTEGRATION_GUIDE.md` - Integration instructions
- `INTEGRATION_SUMMARY.md` - API endpoints summary

## ⚠️ Important Notes

1. **Database**: You'll need a PostgreSQL database. The app uses Drizzle ORM for database operations.

2. **File Paths**: All imports use absolute paths with `@/` prefix. Make sure your `tsconfig.json` and `vite.config.ts` have the correct path mappings.

3. **PDF Generation**: The app has multiple PDF generation methods. The PNG-to-PDF method is the most reliable.

4. **Environment**: The app is optimized for Replit but can run in any Node.js environment.

5. **Assets**: If you have custom assets, make sure to copy them and update the import paths.

## 🔧 Troubleshooting

### Common Issues:
1. **Import errors**: Check that all path aliases are configured correctly
2. **Database connection**: Ensure DATABASE_URL is set correctly
3. **PDF generation**: Make sure all PDF dependencies are installed
4. **Build errors**: Check TypeScript configuration and dependencies

### File Size:
The complete app is approximately:
- 150+ source files
- 80+ npm dependencies
- Full-featured SWMS document generator

This is a comprehensive, production-ready application with advanced PDF generation capabilities and a professional UI.