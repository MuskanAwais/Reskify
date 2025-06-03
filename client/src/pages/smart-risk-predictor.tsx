import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  MapPin, 
  Calendar,
  Cloud,
  ThermometerSun,
  Wind,
  Eye,
  Zap
} from "lucide-react";

interface RiskPrediction {
  riskLevel: "Low" | "Medium" | "High" | "Extreme";
  riskScore: number;
  weatherImpact: number;
  seasonalFactor: number;
  locationRisk: number;
  recommendations: string[];
  criticalFactors: string[];
  timeline: Array<{
    date: string;
    riskLevel: string;
    weather: string;
    temperature: number;
  }>;
}

export default function SmartRiskPredictor() {
  const [projectLocation, setProjectLocation] = useState("");
  const [projectType, setProjectType] = useState("");
  const [tradeType, setTradeType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [duration, setDuration] = useState("");
  const [prediction, setPrediction] = useState<RiskPrediction | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const generatePrediction = async () => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis with realistic construction risk factors
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockPrediction: RiskPrediction = {
      riskLevel: "High",
      riskScore: 78,
      weatherImpact: 65,
      seasonalFactor: 45,
      locationRisk: 72,
      recommendations: [
        "Schedule high-risk activities during optimal weather windows",
        "Implement enhanced fall protection due to elevated work areas",
        "Increase safety inspections during peak risk periods",
        "Consider weather delays for concrete work in Week 3-4",
        "Deploy additional safety personnel for complex phases"
      ],
      criticalFactors: [
        "Extreme weather patterns predicted for Week 2",
        "High wind conditions affecting crane operations",
        "Seasonal rainfall increasing slip hazards",
        "Urban location with traffic management complexity"
      ],
      timeline: [
        { date: "Week 1", riskLevel: "Medium", weather: "Clear", temperature: 22 },
        { date: "Week 2", riskLevel: "Extreme", weather: "Storms", temperature: 18 },
        { date: "Week 3", riskLevel: "High", weather: "Rain", temperature: 15 },
        { date: "Week 4", riskLevel: "Medium", weather: "Partly Cloudy", temperature: 20 },
        { date: "Week 5", riskLevel: "Low", weather: "Clear", temperature: 24 },
        { date: "Week 6", riskLevel: "Medium", weather: "Windy", temperature: 21 }
      ]
    };
    
    setPrediction(mockPrediction);
    setIsAnalyzing(false);
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "Low": return "bg-green-100 text-green-800";
      case "Medium": return "bg-yellow-100 text-yellow-800";
      case "High": return "bg-orange-100 text-orange-800";
      case "Extreme": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Smart Risk Predictor</h2>
        <p className="text-gray-600">AI-powered risk analysis combining weather, location, and project factors</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-primary" />
              <span>Project Risk Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">Project Location</Label>
                <Input
                  id="location"
                  placeholder="e.g., Sydney CBD"
                  value={projectLocation}
                  onChange={(e) => setProjectLocation(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="project-type">Project Type</Label>
                <Select value={projectType} onValueChange={setProjectType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="commercial">Commercial Building</SelectItem>
                    <SelectItem value="residential">Residential</SelectItem>
                    <SelectItem value="infrastructure">Infrastructure</SelectItem>
                    <SelectItem value="industrial">Industrial</SelectItem>
                    <SelectItem value="renovation">Renovation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="trade">Primary Trade</Label>
                <Select value={tradeType} onValueChange={setTradeType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select trade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="electrical">Electrical</SelectItem>
                    <SelectItem value="plumbing">Plumbing</SelectItem>
                    <SelectItem value="carpentry">Carpentry</SelectItem>
                    <SelectItem value="roofing">Roofing</SelectItem>
                    <SelectItem value="concrete">Concrete</SelectItem>
                    <SelectItem value="steel">Steel Fixing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="duration">Duration (weeks)</Label>
                <Input
                  id="duration"
                  type="number"
                  placeholder="e.g., 8"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <Button 
              onClick={generatePrediction}
              className="w-full"
              disabled={isAnalyzing || !projectLocation || !projectType || !tradeType}
            >
              {isAnalyzing ? (
                <>
                  <Brain className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing Risks...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Generate Risk Prediction
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {prediction && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <span>Risk Analysis Results</span>
                </span>
                <Badge className={getRiskColor(prediction.riskLevel)}>
                  {prediction.riskLevel} Risk
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{prediction.riskScore}</div>
                  <div className="text-sm text-gray-600">Overall Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{prediction.weatherImpact}</div>
                  <div className="text-sm text-gray-600">Weather Impact</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{prediction.locationRisk}</div>
                  <div className="text-sm text-gray-600">Location Risk</div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2 text-orange-500" />
                  Critical Factors
                </h4>
                <ul className="space-y-1">
                  {prediction.criticalFactors.map((factor, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start">
                      <span className="w-2 h-2 bg-red-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      {factor}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2 flex items-center">
                  <Eye className="h-4 w-4 mr-2 text-green-500" />
                  Recommendations
                </h4>
                <ul className="space-y-1">
                  {prediction.recommendations.slice(0, 3).map((rec, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start">
                      <span className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Timeline Visualization */}
      {prediction && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-primary" />
              <span>Risk Timeline & Weather Integration</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {prediction.timeline.map((week, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{week.date}</span>
                    <Badge className={getRiskColor(week.riskLevel)} variant="secondary">
                      {week.riskLevel}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Cloud className="h-4 w-4" />
                    <span>{week.weather}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <ThermometerSun className="h-4 w-4" />
                    <span>{week.temperature}°C</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}