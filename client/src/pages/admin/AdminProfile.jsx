import { useAuth } from "../../contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, User, Calendar, Shield, Settings, Users, Home, MessageSquare, BarChart3 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function AdminProfile() {
  const { user } = useAuth();

  // Fetch admin statistics
  const { data: allProperties = [] } = useQuery({
    queryKey: ['/api/properties/admin/all'],
    enabled: !!user?.id,
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ['/api/users'],
    enabled: !!user?.id,
  });

  const { data: allReviews = [] } = useQuery({
    queryKey: ['/api/reviews'],
    enabled: !!user?.id,
  });

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getVerifiedPropertiesCount = () => {
    return allProperties.filter(property => property.verificationStatus === "verified").length;
  };

  const getPendingPropertiesCount = () => {
    return allProperties.filter(property => property.verificationStatus === "pending").length;
  };

  const getUsersByRole = (role) => {
    return allUsers.filter(u => u.role === role).length;
  };

  const getFraudAgentsCount = () => {
    return allUsers.filter(u => u.role === "agent" && u.isFraud).length;
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-inter font-bold text-3xl md:text-4xl text-neutral-900 mb-2">
            Admin Profile
          </h1>
          <p className="text-lg text-neutral-600">
            System administration and platform oversight
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="w-24 h-24 mb-4">
                    <AvatarImage src={user?.photoURL} alt={user?.displayName} />
                    <AvatarFallback className="text-2xl">
                      {user?.displayName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <h2 className="text-xl font-semibold text-neutral-900 mb-2">
                    {user?.displayName || "Administrator"}
                  </h2>
                  
                  <Badge className="mb-4 bg-red-100 text-red-800">
                    <Shield className="w-3 h-3 mr-1" />
                    System Administrator
                  </Badge>
                  
                  <div className="w-full space-y-3">
                    <div className="flex items-center text-sm text-neutral-600">
                      <Mail className="w-4 h-4 mr-2" />
                      <span className="truncate">{user?.email}</span>
                    </div>
                    
                    {user?.createdAt && (
                      <div className="flex items-center text-sm text-neutral-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>Admin since {formatDate(user.createdAt)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Platform Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600">Total Properties</span>
                  <span className="font-semibold">{allProperties.length}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600">Total Users</span>
                  <span className="font-semibold">{allUsers.length}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600">Total Reviews</span>
                  <span className="font-semibold">{allReviews.length}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600">Pending Verification</span>
                  <span className="font-semibold text-yellow-600">{getPendingPropertiesCount()}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Admin Dashboard */}
          <div className="lg:col-span-2">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mr-4">
                      <Home className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-neutral-900">{allProperties.length}</div>
                      <div className="text-neutral-600">Total Properties</div>
                      <div className="text-sm text-green-600">{getVerifiedPropertiesCount()} verified</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mr-4">
                      <Users className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-neutral-900">{allUsers.length}</div>
                      <div className="text-neutral-600">Total Users</div>
                      <div className="text-sm text-blue-600">{getUsersByRole("agent")} agents</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center mr-4">
                      <MessageSquare className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-neutral-900">{allReviews.length}</div>
                      <div className="text-neutral-600">User Reviews</div>
                      <div className="text-sm text-purple-600">Platform feedback</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center mr-4">
                      <BarChart3 className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-neutral-900">{getPendingPropertiesCount()}</div>
                      <div className="text-neutral-600">Pending Verification</div>
                      <div className="text-sm text-yellow-600">Needs attention</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Administrator Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Full Name
                    </label>
                    <div className="p-3 bg-neutral-50 rounded-lg border">
                      {user?.displayName || "Not specified"}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Email Address
                    </label>
                    <div className="p-3 bg-neutral-50 rounded-lg border">
                      {user?.email}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Access Level
                    </label>
                    <div className="p-3 bg-neutral-50 rounded-lg border">
                      <Badge className="bg-red-100 text-red-800">
                        System Administrator
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Account Status
                    </label>
                    <div className="p-3 bg-neutral-50 rounded-lg border">
                      <Badge className="bg-green-100 text-green-800">
                        Active
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* User Statistics Breakdown */}
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                    User Management Overview
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{getUsersByRole("user")}</div>
                      <div className="text-sm text-blue-700">Property Buyers</div>
                    </div>
                    
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{getUsersByRole("agent")}</div>
                      <div className="text-sm text-green-700">Real Estate Agents</div>
                    </div>
                    
                    <div className="p-4 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">{getFraudAgentsCount()}</div>
                      <div className="text-sm text-red-700">Flagged Agents</div>
                    </div>
                  </div>
                </div>

                {/* Property Management Overview */}
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                    Property Management Overview
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{getVerifiedPropertiesCount()}</div>
                      <div className="text-sm text-green-700">Verified Properties</div>
                    </div>
                    
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">{getPendingPropertiesCount()}</div>
                      <div className="text-sm text-yellow-700">Pending Verification</div>
                    </div>
                    
                    <div className="p-4 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">
                        {allProperties.filter(p => p.verificationStatus === "rejected").length}
                      </div>
                      <div className="text-sm text-red-700">Rejected Properties</div>
                    </div>
                  </div>
                </div>

                {/* Admin Capabilities */}
                <div className="pt-6 border-t border-neutral-200">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                    Admin Capabilities
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <h4 className="font-medium text-purple-900 mb-2">Property Verification</h4>
                      <p className="text-sm text-purple-700">Verify and manage all property listings on the platform</p>
                    </div>
                    
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <h4 className="font-medium text-orange-900 mb-2">User Management</h4>
                      <p className="text-sm text-orange-700">Manage user accounts, roles, and permissions</p>
                    </div>
                    
                    <div className="p-4 bg-indigo-50 rounded-lg">
                      <h4 className="font-medium text-indigo-900 mb-2">Content Moderation</h4>
                      <p className="text-sm text-indigo-700">Monitor and moderate user reviews and content</p>
                    </div>
                    
                    <div className="p-4 bg-pink-50 rounded-lg">
                      <h4 className="font-medium text-pink-900 mb-2">Platform Analytics</h4>
                      <p className="text-sm text-pink-700">Access comprehensive platform statistics and insights</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
