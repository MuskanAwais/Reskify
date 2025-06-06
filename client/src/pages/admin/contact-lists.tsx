import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Contact, Mail, Phone, Building, Plus, Search, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";

export default function ContactLists() {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: contacts, isLoading } = useQuery({
    queryKey: ['/api/admin/contacts'],
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="h-20 bg-gray-200 rounded"></div>)}
          </div>
        </div>
      </div>
    );
  }

  const mockContacts = [
    {
      id: 1,
      name: "John Smith",
      email: "john.smith@abcconstruction.com",
      phone: "+61 412 345 678",
      company: "ABC Construction",
      role: "Site Manager",
      status: "active",
      lastContact: "2024-06-02T14:30:00Z"
    },
    {
      id: 2,
      name: "Sarah Wilson",
      email: "sarah.wilson@xyz.com.au",
      phone: "+61 423 456 789",
      company: "XYZ Electrical",
      role: "Safety Officer",
      status: "active",
      lastContact: "2024-06-01T09:15:00Z"
    },
    {
      id: 3,
      name: "Mike Johnson",
      email: "mike.j@deltaplumbing.com",
      phone: "+61 434 567 890",
      company: "Delta Plumbing",
      role: "Lead Plumber",
      status: "inactive",
      lastContact: "2024-05-28T16:45:00Z"
    },
    {
      id: 4,
      name: "Emma Brown",
      email: "emma.brown@roofexperts.au",
      phone: "+61 445 678 901",
      company: "Roof Experts",
      role: "Project Coordinator",
      status: "active",
      lastContact: "2024-06-03T11:20:00Z"
    },
    {
      id: 5,
      name: "David Lee",
      email: "d.lee@steelworks.com.au",
      phone: "+61 456 789 012",
      company: "Steel Works Pty",
      role: "Structural Engineer",
      status: "active",
      lastContact: "2024-05-30T13:10:00Z"
    }
  ];

  const data = contacts || mockContacts;

  const filteredContacts = data.filter(contact => 
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "inactive":
        return <Badge variant="outline">Inactive</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contact Lists</h1>
          <p className="text-gray-600">Manage client and contractor contacts</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Contact
        </Button>
      </div>

      {/* Search and Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="md:col-span-2">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search contacts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Contacts</p>
                <p className="text-2xl font-bold">{data.length}</p>
              </div>
              <Contact className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {data.filter(c => c.status === 'active').length}
                </p>
              </div>
              <Building className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contacts List */}
      <Card>
        <CardHeader>
          <CardTitle>All Contacts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredContacts.map((contact) => (
              <div key={contact.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Contact className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{contact.name}</h3>
                      {getStatusBadge(contact.status)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {contact.email}
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {contact.phone}
                      </div>
                      <div className="flex items-center gap-1">
                        <Building className="w-3 h-3" />
                        {contact.company}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {contact.role} • Last contact: {new Date(contact.lastContact).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {filteredContacts.length === 0 && (
            <div className="text-center py-8">
              <Contact className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No contacts found matching your search.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}