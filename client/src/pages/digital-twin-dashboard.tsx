import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Building, 
  Users, 
  AlertTriangle, 
  CheckCircle,
  Activity,
  Camera,
  Wifi,
  MapPin,
  Clock,
  Thermometer,
  Gauge,
  Video,
  Shield,
  Zap
} from "lucide-react";

interface LiveSensorData {
  id: string;
  location: string;
  type: "safety" | "environmental" | "equipment";
  status: "active" | "warning" | "alert";
  value: number;
  unit: string;
  lastUpdate: string;
}

interface WorkerLocation {
  id: string;
  name: string;
  role: string;
  zone: string;
  status: "safe" | "caution" | "emergency";
  lastSeen: string;
  certifications: string[];
}

export default function DigitalTwinDashboard() {
  const [liveData, setLiveData] = useState<LiveSensorData[]>([
    {
      id: "sensor-001",
      location: "Level 3 - East Wing",
      type: "safety",
      status: "active",
      value: 98,
      unit: "% Compliance",
      lastUpdate: "2 mins ago"
    },
    {
      id: "sensor-002", 
      location: "Crane Operation Zone",
      type: "environmental",
      status: "warning",
      value: 35,
      unit: "km/h Wind",
      lastUpdate: "1 min ago"
    },
    {
      id: "sensor-003",
      location: "Concrete Pour Area",
      type: "equipment",
      status: "alert",
      value: 75,
      unit: "°C Temperature",
      lastUpdate: "30 secs ago"
    },
    {
      id: "sensor-004",
      location: "Site Entrance",
      type: "safety",
      status: "active",
      value: 24,
      unit: "Workers Present",
      lastUpdate: "Live"
    }
  ]);

  const [workers, setWorkers] = useState<WorkerLocation[]>([
    {
      id: "worker-001",
      name: "John Mitchell",
      role: "Site Supervisor",
      zone: "Level 3",
      status: "safe",
      lastSeen: "2 mins ago",
      certifications: ["White Card", "EWP License", "First Aid"]
    },
    {
      id: "worker-002",
      name: "Sarah Chen",
      role: "Electrician",
      zone: "Electrical Room",
      status: "caution",
      lastSeen: "5 mins ago",
      certifications: ["A-Class License", "White Card", "Confined Space"]
    },
    {
      id: "worker-003",
      name: "Mike Rodriguez",
      role: "Crane Operator",
      zone: "Crane Platform",
      status: "emergency",
      lastSeen: "12 mins ago",
      certifications: ["HC License", "Rigger License", "White Card"]
    }
  ]);

  const [currentIncident, setCurrentIncident] = useState({
    type: "Equipment Malfunction",
    location: "Level 2 - Crane Assembly",
    priority: "High",
    timeElapsed: "00:08:32",
    responders: 3,
    status: "Active Response"
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "safe":
      case "active": return "bg-green-100 text-green-800 border-green-200";
      case "caution":
      case "warning": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "emergency":
      case "alert": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getSensorIcon = (type: string) => {
    switch (type) {
      case "safety": return <Shield className="h-4 w-4" />;
      case "environmental": return <Thermometer className="h-4 w-4" />;
      case "equipment": return <Gauge className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Digital Twin Safety Dashboard</h2>
        <p className="text-gray-600">Real-time site monitoring with IoT sensors and worker tracking</p>
      </div>

      {/* Emergency Alert Banner */}
      {currentIncident && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <div>
                  <div className="font-semibold text-red-800">Active Incident: {currentIncident.type}</div>
                  <div className="text-sm text-red-600">
                    Location: {currentIncident.location} • Duration: {currentIncident.timeElapsed}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Badge className="bg-red-600 text-white">
                  {currentIncident.priority} Priority
                </Badge>
                <Button size="sm" className="bg-red-600 hover:bg-red-700">
                  View Incident Details
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Live Site Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Workers On-Site</p>
                <p className="text-2xl font-bold">24</p>
                <p className="text-xs text-green-600">+3 from yesterday</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Sensors</p>
                <p className="text-2xl font-bold">142</p>
                <p className="text-xs text-green-600">98% operational</p>
              </div>
              <Wifi className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Safety Score</p>
                <p className="text-2xl font-bold">94%</p>
                <p className="text-xs text-yellow-600">-2% from target</p>
              </div>
              <Shield className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Incidents Today</p>
                <p className="text-2xl font-bold">1</p>
                <p className="text-xs text-red-600">Under investigation</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Sensor Data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-primary" />
              <span>Live Sensor Monitoring</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {liveData.map((sensor) => (
              <div key={sensor.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${getStatusColor(sensor.status)}`}>
                    {getSensorIcon(sensor.type)}
                  </div>
                  <div>
                    <div className="font-medium">{sensor.location}</div>
                    <div className="text-sm text-gray-600 capitalize">{sensor.type} Sensor</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{sensor.value} {sensor.unit}</div>
                  <div className="text-xs text-gray-500">{sensor.lastUpdate}</div>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full">
              <Camera className="mr-2 h-4 w-4" />
              View Live Camera Feeds
            </Button>
          </CardContent>
        </Card>

        {/* Worker Tracking */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-primary" />
              <span>Worker Location Tracking</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {workers.map((worker) => (
              <div key={worker.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    worker.status === 'safe' ? 'bg-green-500' : 
                    worker.status === 'caution' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  <div>
                    <div className="font-medium">{worker.name}</div>
                    <div className="text-sm text-gray-600">{worker.role} • {worker.zone}</div>
                    <div className="text-xs text-gray-500">Certifications: {worker.certifications.length}</div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={getStatusColor(worker.status)} variant="outline">
                    {worker.status}
                  </Badge>
                  <div className="text-xs text-gray-500 mt-1">{worker.lastSeen}</div>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full">
              <Video className="mr-2 h-4 w-4" />
              Emergency Assembly Point
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* 3D Site Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building className="h-5 w-5 text-primary" />
            <span>3D Site Visualization</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-8 text-center">
            <Building className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Interactive 3D Site Model</h3>
            <p className="text-gray-600 mb-4">
              Explore your construction site in real-time 3D with live worker positions, equipment status, and safety zones
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg p-3">
                <Zap className="h-6 w-6 text-yellow-600 mx-auto mb-1" />
                <div className="text-sm font-medium">Live Updates</div>
              </div>
              <div className="bg-white rounded-lg p-3">
                <Shield className="h-6 w-6 text-green-600 mx-auto mb-1" />
                <div className="text-sm font-medium">Safety Zones</div>
              </div>
              <div className="bg-white rounded-lg p-3">
                <Users className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                <div className="text-sm font-medium">Worker Tracking</div>
              </div>
              <div className="bg-white rounded-lg p-3">
                <Gauge className="h-6 w-6 text-purple-600 mx-auto mb-1" />
                <div className="text-sm font-medium">Equipment Status</div>
              </div>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">
              Launch 3D Viewer
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}