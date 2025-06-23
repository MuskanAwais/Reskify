import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function PDFTest() {
  const [jsonData, setJsonData] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const sampleJSON = {
    projectName: "Commercial Office Fitout - Melbourne CBD",
    jobName: "Level 15 Office Renovation Project",
    jobNumber: "COF-2025-001",
    projectAddress: "123 Collins Street, Melbourne VIC 3000",
    companyName: "Melbourne Office Solutions",
    projectManager: "Sarah Chen",
    siteSupervisor: "Michael Rodriguez",
    principalContractor: "Elite Construction Group Pty Ltd",
    startDate: "15th January 2025",
    duration: "12 Weeks",
    emergencyContacts: [
      { name: "Site Emergency Coordinator", phone: "0412 345 678" },
      { name: "Building Management", phone: "0398 765 432" }
    ],
    assemblyPoint: "Building Lobby - Collins Street Entrance",
    nearestHospital: "Royal Melbourne Hospital",
    workActivities: [
      {
        task: "Site establishment and safety briefing for all personnel",
        hazards: [
          "Inadequate site setup leading to safety incidents",
          "Personnel unfamiliar with site-specific hazards"
        ],
        initialRiskLevel: "High",
        initialRiskScore: 12,
        controlMeasures: [
          "Conduct comprehensive site induction for all workers",
          "Establish designated storage and welfare areas"
        ],
        residualRiskLevel: "Medium",
        residualRiskScore: 6,
        legislation: ["WHS Act 2011 Section 19", "WHS Regulation 2017 Part 3.1"]
      }
    ],
    ppeRequirements: [
      "hard-hat", "hi-vis-vest", "steel-cap-boots", "safety-glasses", 
      "gloves", "hearing-protection"
    ],
    plantEquipment: [
      {
        name: "Telescopic Handler - Genie GTH-2506",
        model: "GTH-2506",
        serial: "GTH25-2024-001",
        riskLevel: "High",
        nextInspection: "20th February 2025",
        certificationRequired: "Yes"
      }
    ]
  };

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    try {
      let data;
      if (jsonData.trim()) {
        data = JSON.parse(jsonData);
      } else {
        data = sampleJSON;
      }

      const response = await fetch('/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `SWMS-${data.projectName || 'Document'}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        throw new Error('Failed to generate PDF');
      }
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Failed to generate PDF. Please check your JSON data.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTestPDF = async () => {
    window.open('/test-pdf', '_blank');
  };

  const loadSampleData = () => {
    setJsonData(JSON.stringify(sampleJSON, null, 2));
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">PDF Generation Test</h1>
        <p className="text-gray-600">Test the Figma-style HTML template with Puppeteer PDF generation</p>
      </div>

      <Tabs defaultValue="test" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="test">Quick Test</TabsTrigger>
          <TabsTrigger value="custom">Custom JSON</TabsTrigger>
        </TabsList>
        
        <TabsContent value="test" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quick PDF Test</CardTitle>
              <CardDescription>
                Generate a PDF using sample data to test the Figma layout
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleTestPDF} className="w-full">
                Generate Test PDF (Sample Data)
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Custom JSON Data</CardTitle>
              <CardDescription>
                Paste your SWMS JSON data here or use the sample data below
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2 mb-4">
                <Button onClick={loadSampleData} variant="outline">
                  Load Sample Data
                </Button>
                <Button 
                  onClick={handleGeneratePDF} 
                  disabled={isGenerating}
                  className="flex-1"
                >
                  {isGenerating ? 'Generating PDF...' : 'Generate PDF from JSON'}
                </Button>
              </div>
              
              <Textarea
                value={jsonData}
                onChange={(e) => setJsonData(e.target.value)}
                placeholder="Paste your SWMS JSON data here..."
                className="min-h-[400px] font-mono text-sm"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>JSON Data Structure</CardTitle>
          <CardDescription>
            Your JSON should include these fields for the template
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Project Information:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• projectName, jobName, jobNumber</li>
                <li>• projectAddress, companyName</li>
                <li>• projectManager, siteSupervisor</li>
                <li>• principalContractor, startDate, duration</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Emergency & Safety:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• emergencyContacts (array)</li>
                <li>• assemblyPoint, nearestHospital</li>
                <li>• workActivities (array)</li>
                <li>• ppeRequirements, plantEquipment</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}