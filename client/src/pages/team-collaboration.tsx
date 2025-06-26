import { Construction, Calendar, Users, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function TeamCollaboration() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-center min-h-[600px]">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center pb-8">
            <div className="mx-auto w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
              <Construction className="h-10 w-10 text-blue-600" />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
              Team Collaboration
            </CardTitle>
            <p className="text-lg text-gray-600">
              Advanced team management and project collaboration tools
            </p>
          </CardHeader>
          
          <CardContent className="text-center space-y-8">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Clock className="h-5 w-5 text-amber-600" />
                <span className="font-semibold text-amber-800">Coming Soon</span>
              </div>
              <p className="text-amber-700">
                We're building powerful team collaboration features to help you manage projects, 
                assign tasks, and coordinate safety documentation across your entire team.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Team Management</h3>
                <p className="text-sm text-gray-600">
                  Invite team members, assign roles, and manage permissions
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Calendar className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Project Tracking</h3>
                <p className="text-sm text-gray-600">
                  Monitor SWMS progress, deadlines, and team assignments
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Construction className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Real-time Updates</h3>
                <p className="text-sm text-gray-600">
                  Live notifications and collaborative document editing
                </p>
              </div>
            </div>

            <div className="pt-6">
              <p className="text-gray-500 mb-4">
                Want to be notified when team collaboration launches?
              </p>
              <Button disabled variant="outline" className="w-full max-w-xs">
                Notify Me When Available
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}