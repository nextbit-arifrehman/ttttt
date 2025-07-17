import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Target, Search, Star, MapPin, DollarSign, Check, Clock } from "lucide-react";
import apiClient from "../../lib/api";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function AdvertiseProperty() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch all verified properties
  const { data: verifiedProperties = [], isLoading: verifiedLoading, error: verifiedError } = useQuery({
    queryKey: ['/api/properties'],
  });

  // Fetch advertised properties
  const { data: advertisedProperties = [], isLoading: advertisedLoading } = useQuery({
    queryKey: ['/api/properties/advertisements'],
  });

  // Advertise property mutation
  const advertisePropertyMutation = useMutation({
    mutationFn: async (propertyId) => {
      const response = await apiClient.patch(`/api/properties/${propertyId}/advertise`);
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "Property Advertised",
        description: "Property has been successfully added to featured listings.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
      queryClient.invalidateQueries({ queryKey: ['/api/properties/advertisements'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to advertise property.",
        variant: "destructive",
      });
    }
  });

  const handleAdvertiseProperty = (propertyId) => {
    if (window.confirm("Are you sure you want to feature this property? It will appear in the homepage featured section.")) {
      advertisePropertyMutation.mutate(propertyId);
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Filter properties that are not already advertised
  const availableProperties = verifiedProperties.filter(property => 
    !property.isAdvertised && 
    (!searchTerm || 
     property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
     property.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
     property.agentName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getVerificationBadge = (status) => {
    switch (status) {
      case "verified":
        return (
          <Badge className="bg-secondary text-white">
            <Check className="w-3 h-3 mr-1" />
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
      default:
        return null;
    }
  };

  if (verifiedError) {
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
            Advertise Property
          </h1>
          <p className="text-lg text-neutral-600">
            Promote verified properties as featured listings on the homepage
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mr-4">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-neutral-900">
                    {verifiedLoading ? <Skeleton className="h-8 w-16" /> : verifiedProperties.length}
                  </div>
                  <div className="text-neutral-600">Verified Properties</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mr-4">
                  <Star className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-neutral-900">
                    {advertisedLoading ? <Skeleton className="h-8 w-16" /> : advertisedProperties.length}
                  </div>
                  <div className="text-neutral-600">Currently Featured</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center mr-4">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-neutral-900">
                    {verifiedLoading ? <Skeleton className="h-8 w-16" /> : availableProperties.length}
                  </div>
                  <div className="text-neutral-600">Available to Feature</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Currently Featured Properties */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="w-5 h-5 mr-2" />
              Currently Featured Properties ({advertisedProperties.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {advertisedLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="h-32 w-full" />
                    <div className="p-4">
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : advertisedProperties.length === 0 ? (
              <div className="text-center py-8">
                <Star className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">No Featured Properties</h3>
                <p className="text-neutral-600">No properties are currently being featured on the homepage.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {advertisedProperties.map((property) => (
                  <Card key={property.id} className="overflow-hidden">
                    <div className="relative">
                      <img 
                        src={property.images?.[0] || "https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200"} 
                        alt={property.title}
                        className="w-full h-32 object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-yellow-500 text-white">
                          <Star className="w-3 h-3 mr-1" />
                          Featured
                        </Badge>
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold text-neutral-900 mb-1 line-clamp-1">{property.title}</h4>
                      <p className="text-sm text-neutral-600 mb-2 flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {property.location}
                      </p>
                      <p className="text-sm font-semibold text-primary">
                        {property.priceRange || `${formatCurrency(property.minPrice)} - ${formatCurrency(property.maxPrice)}`}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Available Properties to Advertise */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Available Properties ({availableProperties.length})
              </div>
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search properties..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {verifiedLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-16 w-20 rounded" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                    <Skeleton className="h-8 w-20" />
                  </div>
                ))}
              </div>
            ) : availableProperties.length === 0 ? (
              <div className="text-center py-12">
                <Target className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  {searchTerm ? "No Properties Found" : "No Available Properties"}
                </h3>
                <p className="text-neutral-600">
                  {searchTerm 
                    ? "Try adjusting your search criteria."
                    : "All verified properties are already featured or no verified properties exist."
                  }
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Property</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Agent</TableHead>
                      <TableHead>Price Range</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {availableProperties.map((property) => (
                      <TableRow key={property.id}>
                        <TableCell>
                          <div className="flex items-center">
                            <img 
                              src={property.images?.[0] || "https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=60"} 
                              alt={property.title}
                              className="w-16 h-12 object-cover rounded mr-3"
                            />
                            <div>
                              <div className="font-medium">{property.title}</div>
                              <div className="text-sm text-neutral-500">Added {formatDate(property.createdAt)}</div>
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
                        <TableCell className="font-semibold text-primary">
                          {property.priceRange || `${formatCurrency(property.minPrice)} - ${formatCurrency(property.maxPrice)}`}
                        </TableCell>
                        <TableCell>{getVerificationBadge(property.verificationStatus)}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            onClick={() => handleAdvertiseProperty(property.id)}
                            disabled={advertisePropertyMutation.isPending}
                            className="bg-yellow-600 hover:bg-yellow-700"
                          >
                            <Star className="w-3 h-3 mr-1" />
                            Feature
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Help Information */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>About Featured Properties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">What are Featured Properties?</h4>
                <p className="text-sm text-blue-700">Featured properties appear prominently on the homepage, giving them increased visibility to potential buyers.</p>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">Eligibility Criteria</h4>
                <p className="text-sm text-green-700">Only verified properties can be featured. Properties must have complete information and quality images.</p>
              </div>
              
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-medium text-purple-900 mb-2">Marketing Impact</h4>
                <p className="text-sm text-purple-700">Featured properties typically receive 3-5x more views than regular listings, leading to faster sales.</p>
              </div>
              
              <div className="p-4 bg-orange-50 rounded-lg">
                <h4 className="font-medium text-orange-900 mb-2">Best Practices</h4>
                <p className="text-sm text-orange-700">Feature a diverse mix of properties across different price ranges and locations for maximum appeal.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
