import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { CheckCircle, XCircle, Clock, Search, Filter, Home, MapPin } from "lucide-react";
import apiClient from "../../lib/api";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function ManageProperties() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch all properties for admin
  const { data: properties = [], isLoading, error } = useQuery({
    queryKey: ['/api/properties/admin/all'],
  });

  // Verify property mutation
  const verifyPropertyMutation = useMutation({
    mutationFn: async ({ propertyId, status }) => {
      const response = await apiClient.patch(`/api/properties/${propertyId}/verify`, { status });
      return response.data;
    },
    onSuccess: (data, variables) => {
      const statusText = variables.status === "verified" ? "verified" : "rejected";
      toast({
        title: `Property ${statusText}`,
        description: `Property has been successfully ${statusText}.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/properties/admin/all'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update property status.",
        variant: "destructive",
      });
    }
  });

  const handleVerifyProperty = (propertyId, status) => {
    const action = status === "verified" ? "verify" : "reject";
    if (window.confirm(`Are you sure you want to ${action} this property?`)) {
      verifyPropertyMutation.mutate({ propertyId, status });
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "verified":
        return (
          <Badge className="bg-secondary text-white">
            <CheckCircle className="w-3 h-3 mr-1" />
            Verified
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="outline" className="bg-accent text-white border-accent">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return null;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Filter properties based on search and status
  const filteredProperties = properties.filter(property => {
    const matchesSearch = !searchTerm || 
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.agentName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || property.verificationStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const totalProperties = properties.length;
  const verifiedCount = properties.filter(p => p.verificationStatus === "verified").length;
  const pendingCount = properties.filter(p => p.verificationStatus === "pending").length;
  const rejectedCount = properties.filter(p => p.verificationStatus === "rejected").length;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <p className="text-red-500 mb-4">Failed to load properties</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-inter font-bold text-3xl md:text-4xl text-neutral-900 mb-2">
            Manage Properties
          </h1>
          <p className="text-lg text-neutral-600">
            Verify and manage all property listings on the platform
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mr-4">
                  <Home className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-neutral-900">
                    {isLoading ? <Skeleton className="h-8 w-16" /> : totalProperties}
                  </div>
                  <div className="text-neutral-600">Total Properties</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mr-4">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-neutral-900">
                    {isLoading ? <Skeleton className="h-8 w-16" /> : verifiedCount}
                  </div>
                  <div className="text-neutral-600">Verified</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center mr-4">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-neutral-900">
                    {isLoading ? <Skeleton className="h-8 w-16" /> : pendingCount}
                  </div>
                  <div className="text-neutral-600">Pending</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center mr-4">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-neutral-900">
                    {isLoading ? <Skeleton className="h-8 w-16" /> : rejectedCount}
                  </div>
                  <div className="text-neutral-600">Rejected</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search properties by title, location, or agent..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === "all" ? "default" : "outline"}
                  onClick={() => setStatusFilter("all")}
                  size="sm"
                >
                  All ({totalProperties})
                </Button>
                <Button
                  variant={statusFilter === "pending" ? "default" : "outline"}
                  onClick={() => setStatusFilter("pending")}
                  size="sm"
                  className={statusFilter === "pending" ? "bg-yellow-600 hover:bg-yellow-700" : ""}
                >
                  Pending ({pendingCount})
                </Button>
                <Button
                  variant={statusFilter === "verified" ? "default" : "outline"}
                  onClick={() => setStatusFilter("verified")}
                  size="sm"
                  className={statusFilter === "verified" ? "bg-green-600 hover:bg-green-700" : ""}
                >
                  Verified ({verifiedCount})
                </Button>
                <Button
                  variant={statusFilter === "rejected" ? "default" : "outline"}
                  onClick={() => setStatusFilter("rejected")}
                  size="sm"
                  className={statusFilter === "rejected" ? "bg-red-600 hover:bg-red-700" : ""}
                >
                  Rejected ({rejectedCount})
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Properties Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Property Listings ({filteredProperties.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                ))}
              </div>
            ) : filteredProperties.length === 0 ? (
              <div className="text-center py-12">
                <Home className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  {searchTerm || statusFilter !== "all" ? "No Properties Found" : "No Properties Yet"}
                </h3>
                <p className="text-neutral-600">
                  {searchTerm || statusFilter !== "all" 
                    ? "Try adjusting your search criteria or filters."
                    : "No properties have been submitted for verification yet."
                  }
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Property Title</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Agent Name</TableHead>
                      <TableHead>Agent Email</TableHead>
                      <TableHead>Price Range</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProperties.map((property) => (
                      <TableRow key={property.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-start">
                            <div>
                              <div className="font-semibold">{property.title}</div>
                              {property.images && property.images[0] && (
                                <img 
                                  src={property.images[0]} 
                                  alt={property.title}
                                  className="w-16 h-12 object-cover rounded mt-1"
                                />
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <MapPin className="w-3 h-3 mr-1 text-neutral-400" />
                            {property.location}
                          </div>
                        </TableCell>
                        <TableCell>{property.agentName}</TableCell>
                        <TableCell>{property.agentEmail}</TableCell>
                        <TableCell className="font-semibold text-primary">
                          {property.priceRange || `${formatCurrency(property.minPrice)} - ${formatCurrency(property.maxPrice)}`}
                        </TableCell>
                        <TableCell>{getStatusBadge(property.verificationStatus)}</TableCell>
                        <TableCell>
                          {property.verificationStatus === "pending" ? (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleVerifyProperty(property.id, "verified")}
                                disabled={verifyPropertyMutation.isPending}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Verify
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleVerifyProperty(property.id, "rejected")}
                                disabled={verifyPropertyMutation.isPending}
                                className="text-red-600 border-red-200 hover:bg-red-50"
                              >
                                <XCircle className="w-3 h-3 mr-1" />
                                Reject
                              </Button>
                            </div>
                          ) : (
                            <span className="text-neutral-500 text-sm">
                              {property.verificationStatus === "verified" ? "Already verified" : "Already rejected"}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        {pendingCount > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-medium text-yellow-900 mb-2">Pending Verification</h4>
                <p className="text-yellow-700 mb-3">
                  You have {pendingCount} properties waiting for verification. These properties are not visible to users until verified.
                </p>
                <Button
                  size="sm"
                  onClick={() => setStatusFilter("pending")}
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  View Pending Properties
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
