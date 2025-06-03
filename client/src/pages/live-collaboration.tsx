import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Users, 
  MessageCircle, 
  Edit3, 
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  Video,
  Mic,
  Share2,
  Bell,
  FileText,
  Zap,
  Globe
} from "lucide-react";

interface CollaborationSession {
  id: string;
  documentName: string;
  participants: Array<{
    id: string;
    name: string;
    role: string;
    status: "online" | "editing" | "reviewing";
    avatar: string;
    cursor?: { x: number; y: number; section: string };
  }>;
  lastActivity: string;
  changes: number;
}

interface LiveComment {
  id: string;
  user: string;
  role: string;
  message: string;
  timestamp: string;
  section: string;
  resolved: boolean;
  priority: "low" | "medium" | "high";
}

export default function LiveCollaboration() {
  const [activeSessions, setActiveSessions] = useState<CollaborationSession[]>([
    {
      id: "session-001",
      documentName: "Electrical Installation SWMS - Level 3",
      participants: [
        { 
          id: "user-1", 
          name: "John Mitchell", 
          role: "Site Supervisor", 
          status: "editing", 
          avatar: "JM",
          cursor: { x: 120, y: 340, section: "Risk Assessment" }
        },
        { 
          id: "user-2", 
          name: "Sarah Chen", 
          role: "Safety Officer", 
          status: "reviewing", 
          avatar: "SC" 
        },
        { 
          id: "user-3", 
          name: "Mike Torres", 
          role: "Electrician", 
          status: "online", 
          avatar: "MT" 
        }
      ],
      lastActivity: "2 mins ago",
      changes: 7
    },
    {
      id: "session-002", 
      documentName: "Concrete Pour SWMS - Foundation",
      participants: [
        { 
          id: "user-4", 
          name: "Lisa Wang", 
          role: "Project Manager", 
          status: "editing", 
          avatar: "LW" 
        },
        { 
          id: "user-5", 
          name: "David Smith", 
          role: "Concrete Specialist", 
          status: "online", 
          avatar: "DS" 
        }
      ],
      lastActivity: "5 mins ago",
      changes: 3
    }
  ]);

  const [liveComments, setLiveComments] = useState<LiveComment[]>([
    {
      id: "comment-001",
      user: "Sarah Chen",
      role: "Safety Officer", 
      message: "The fall protection measures need to include edge protection for the balcony work. Current specification is insufficient.",
      timestamp: "3 mins ago",
      section: "Control Measures - Working at Height",
      resolved: false,
      priority: "high"
    },
    {
      id: "comment-002",
      user: "John Mitchell", 
      role: "Site Supervisor",
      message: "Agreed. I've updated the control measures to include 1.2m edge protection barriers. Please review.",
      timestamp: "1 min ago",
      section: "Control Measures - Working at Height", 
      resolved: false,
      priority: "high"
    },
    {
      id: "comment-003",
      user: "Mike Torres",
      role: "Electrician",
      message: "The electrical isolation procedure looks good. Added specific lockout points for this building.",
      timestamp: "8 mins ago", 
      section: "Electrical Safety Procedures",
      resolved: true,
      priority: "medium"
    }
  ]);

  const [newComment, setNewComment] = useState("");
  const [selectedSection, setSelectedSection] = useState("Risk Assessment");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "editing": return "bg-blue-100 text-blue-800";
      case "reviewing": return "bg-yellow-100 text-yellow-800"; 
      case "online": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "border-l-red-500 bg-red-50";
      case "medium": return "border-l-yellow-500 bg-yellow-50";
      case "low": return "border-l-green-500 bg-green-50";
      default: return "border-l-gray-500 bg-gray-50";
    }
  };

  const addComment = () => {
    if (!newComment.trim()) return;
    
    const comment: LiveComment = {
      id: `comment-${Date.now()}`,
      user: "Current User",
      role: "Site Manager",
      message: newComment,
      timestamp: "Just now",
      section: selectedSection,
      resolved: false,
      priority: "medium"
    };
    
    setLiveComments([comment, ...liveComments]);
    setNewComment("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Live Collaboration Hub</h2>
        <p className="text-gray-600">Real-time collaborative SWMS editing with instant feedback and review</p>
      </div>

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-primary" />
              <span>Active Collaboration Sessions</span>
            </span>
            <Button size="sm">
              <Video className="mr-2 h-4 w-4" />
              Start Video Call
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeSessions.map((session) => (
            <div key={session.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{session.documentName}</h3>
                  <p className="text-sm text-gray-600">
                    {session.changes} changes • Last activity {session.lastActivity}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    {session.participants.length} active
                  </Badge>
                  <Button size="sm" variant="outline">
                    <Eye className="mr-2 h-4 w-4" />
                    Join Session
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-700">Participants:</span>
                <div className="flex items-center space-x-2">
                  {session.participants.map((participant) => (
                    <div key={participant.id} className="flex items-center space-x-2">
                      <div className="relative">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">{participant.avatar}</AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                          participant.status === 'editing' ? 'bg-blue-500' : 
                          participant.status === 'reviewing' ? 'bg-yellow-500' : 'bg-green-500'
                        }`}></div>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{participant.name}</p>
                        <Badge className={getStatusColor(participant.status)} variant="secondary">
                          {participant.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live Cursors Simulation */}
              {session.participants.some(p => p.cursor) && (
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <Edit3 className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-800">Live Activity:</span>
                    {session.participants
                      .filter(p => p.cursor)
                      .map(p => (
                        <span key={p.id} className="text-blue-700">
                          {p.name} is editing {p.cursor?.section}
                        </span>
                      ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Comments & Feedback */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              <span>Live Comments & Review</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add Comment */}
            <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium">Section:</label>
                <select 
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="text-sm border rounded px-2 py-1"
                >
                  <option>Risk Assessment</option>
                  <option>Control Measures</option>
                  <option>Emergency Procedures</option>
                  <option>PPE Requirements</option>
                </select>
              </div>
              <Textarea
                placeholder="Add your feedback or suggestion..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-20"
              />
              <Button onClick={addComment} size="sm" className="w-full">
                <MessageCircle className="mr-2 h-4 w-4" />
                Add Comment
              </Button>
            </div>

            {/* Comments List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {liveComments.map((comment) => (
                <div key={comment.id} className={`border-l-4 pl-4 py-2 ${getPriorityColor(comment.priority)}`}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm">{comment.user}</span>
                      <Badge variant="outline" className="text-xs">{comment.role}</Badge>
                      {comment.resolved && (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                    <span className="text-xs text-gray-500">{comment.timestamp}</span>
                  </div>
                  <p className="text-sm text-gray-700 mb-1">{comment.message}</p>
                  <p className="text-xs text-gray-500">Section: {comment.section}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Real-time Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-primary" />
              <span>Live Notifications</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium">Sarah Chen reviewed Risk Assessment</p>
                  <p className="text-xs text-gray-600">2 minutes ago</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium">John Mitchell approved Control Measures</p>
                  <p className="text-xs text-gray-600">5 minutes ago</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium">Mike Torres requested clarification on PPE section</p>
                  <p className="text-xs text-gray-600">8 minutes ago</p>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3 flex items-center">
                <Share2 className="h-4 w-4 mr-2 text-gray-600" />
                Quick Actions
              </h4>
              <div className="grid grid-cols-1 gap-2">
                <Button variant="outline" size="sm" className="justify-start">
                  <Mic className="mr-2 h-4 w-4" />
                  Start Voice Note
                </Button>
                <Button variant="outline" size="sm" className="justify-start">
                  <FileText className="mr-2 h-4 w-4" />
                  Request Review
                </Button>
                <Button variant="outline" size="sm" className="justify-start">
                  <Globe className="mr-2 h-4 w-4" />
                  Share External Link
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Collaboration Features Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-primary" />
            <span>Advanced Collaboration Features</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
              <Edit3 className="h-8 w-8 text-blue-600 mb-2" />
              <h3 className="font-semibold mb-1">Real-time Editing</h3>
              <p className="text-sm text-gray-600">See live cursors and changes as team members edit</p>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
              <Video className="h-8 w-8 text-green-600 mb-2" />
              <h3 className="font-semibold mb-1">Video Collaboration</h3>
              <p className="text-sm text-gray-600">Integrated video calls while reviewing documents</p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
              <MessageCircle className="h-8 w-8 text-purple-600 mb-2" />
              <h3 className="font-semibold mb-1">Smart Comments</h3>
              <p className="text-sm text-gray-600">Section-specific feedback with priority levels</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}