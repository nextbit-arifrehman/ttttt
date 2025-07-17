import { useAuth } from "../../contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, User, Calendar, Shield, Home, DollarSign, Star, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function AgentProfile() {
  const { user } = useAuth();

  // Fetch agent statistics
  const { data: agentProperties = [] } = useQuery({
    queryKey: ['/api/properties/agent', user?.id],
    enabled: !!user?.id,
  });

  const { data: soldProperties = [] } = useQuery({
    queryKey: ['/api/offers/agent', user?.id, 'sold'],
    enabled: !!user?.id,
  });

  const { data: totalAmount = { totalAmount: 0 } } = useQuery({
    queryKey: ['/api/offers/agent', user?.id, 'total-amount'],
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getVerifiedPropertiesCount = () => {
    return agentProperties.filter(property => property.verificationStatus === "verified").length;
  };

  const getPendingPropertiesCount = () => {
    return agentProperties.filter(property => property.verificationStatus === "pending").length;
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-inter font-bold text-3xl md:text-4xl text-neutral-900 mb-2">
            Agent Profile
          </h1>
          <p className="text-lg text-neutral-600">
            Manage your agent profile and view your performance statistics
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
                    {user?.displayName || "Agent"}
                  </h2>
                  
                  <Badge className="mb-4 bg-blue-100 text-blue-800">
                    <Shield className="w-3 h-3 mr-1" />
                    Real Estate Agent
                  </Badge>
                  
                  {user?.isFraud && (
                    <Badge variant="destructive" className="mb-4">
                      Account Flagged
                    </Badge>
                  )}
                  
                  <div className="w-full space-y-3">
                    <div className="flex items-center text-sm text-neutral-600">
                      <Mail className="w-4 h-4 mr-2" />
                      <span className="truncate">{user?.email}</span>
                    </div>
                    
                    {user?.createdAt && (
                      <div className="flex items-center text-sm text-neutral-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>Agent since {formatDate(user.createdAt)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Agent Stats Summary */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600">Total Properties</span>
                  <span className="font-semibold">{agentProperties.length}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600">Verified</span>
                  <span className="font-semibold text-green-600">{getVerifiedPropertiesCount()}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600">Properties Sold</span>
                  <span className="font-semibold text-blue-600">{soldProperties.length}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600">Total Sales</span>
                  <span className="font-semibold text-primary">{formatCurrency(totalAmount.totalAmount)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Dashboard */}
          <div className="lg:col-span-2">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mr-4">
                      <Home className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-neutral-900">{agentProperties.length}</div>
                      <div className="text-neutral-600">Total Properties Listed</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mr-4">
                      <DollarSign className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-neutral-900">{soldProperties.length}</div>
                      <div className="text-neutral-600">Properties Sold</div>
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
                  Agent Information
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
                      Account Type
                    </label>
                    <div className="p-3 bg-neutral-50 rounded-lg border">
                      <Badge className="bg-blue-100 text-blue-800">
                        Real Estate Agent
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Account Status
                    </label>
                    <div className="p-3 bg-neutral-50 rounded-lg border">
                      {user?.isFraud ? (
                        <Badge variant="destructive">Flagged</Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Property Status Breakdown */}
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                    Property Status Breakdown
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
                    
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{formatCurrency(totalAmount.totalAmount)}</div>
                      <div className="text-sm text-blue-700">Total Sales Value</div>
                    </div>
                  </div>
                </div>

                {/* Agent Features */}
                <div className="pt-6 border-t border-neutral-200">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                    Agent Features
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <h4 className="font-medium text-purple-900 mb-2">Property Management</h4>
                      <p className="text-sm text-purple-700">Add, edit, and manage your property listings</p>
                    </div>
                    
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <h4 className="font-medium text-orange-900 mb-2">Offer Management</h4>
                      <p className="text-sm text-orange-700">Review and respond to property offers from buyers</p>
                    </div>
                    
                    <div className="p-4 bg-indigo-50 rounded-lg">
                      <h4 className="font-medium text-indigo-900 mb-2">Sales Tracking</h4>
                      <p className="text-sm text-indigo-700">Monitor your sales performance and revenue</p>
                    </div>
                    
                    <div className="p-4 bg-pink-50 rounded-lg">
                      <h4 className="font-medium text-pink-900 mb-2">Client Communication</h4>
                      <p className="text-sm text-pink-700">Manage interactions with potential buyers</p>
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
