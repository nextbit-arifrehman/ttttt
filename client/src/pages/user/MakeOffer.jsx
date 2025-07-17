import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, DollarSign, MapPin, Calendar, User, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import apiClient from "../../lib/api";
import { useToast } from "@/hooks/use-toast";

const offerSchema = z.object({
  offeredAmount: z.string().min(1, "Offer amount is required"),
  buyingDate: z.string().min(1, "Buying date is required"),
});

export default function MakeOffer() {
  const { propertyId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch property details
  const { data: property, isLoading: propertyLoading, error } = useQuery({
    queryKey: ['/api/properties', propertyId],
    enabled: !!propertyId,
  });

  // Make offer mutation
  const makeOfferMutation = useMutation({
    mutationFn: async (offerData) => {
      const response = await apiClient.post("/api/offers", {
        propertyId: property.id,
        propertyTitle: property.title,
        propertyLocation: property.location,
        propertyImage: property.images?.[0] || "",
        buyerId: user.id,
        buyerName: user.displayName || user.email,
        buyerEmail: user.email,
        agentId: property.agentId,
        agentName: property.agentName,
        offeredAmount: parseFloat(offerData.offeredAmount),
        buyingDate: offerData.buyingDate
      });
      
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "Offer Submitted",
        description: "Your offer has been submitted successfully. The agent will review it shortly.",
      });
      navigate("/dashboard/user/property-bought");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit offer.",
        variant: "destructive",
      });
    }
  });

  const form = useForm({
    resolver: zodResolver(offerSchema),
    defaultValues: {
      offeredAmount: "",
      buyingDate: "",
    },
  });

  const onSubmit = (data) => {
    // Validate offer amount is within property price range
    const amount = parseFloat(data.offeredAmount);
    if (property && (amount < property.minPrice || amount > property.maxPrice)) {
      toast({
        title: "Invalid Offer Amount",
        description: `Offer amount must be between $${property.minPrice?.toLocaleString()} and $${property.maxPrice?.toLocaleString()}`,
        variant: "destructive",
      });
      return;
    }

    makeOfferMutation.mutate(data);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Get tomorrow's date as minimum date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <p className="text-red-500 mb-4">Property not found</p>
            <Button onClick={() => navigate("/properties")}>Back to Properties</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (propertyLoading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-8 w-48 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="h-96 w-full rounded-lg" />
            <Skeleton className="h-96 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard/user/wishlist")}
            className="text-neutral-600 hover:text-neutral-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Wishlist
          </Button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="font-inter font-bold text-3xl md:text-4xl text-neutral-900 mb-2">
            Make an Offer
          </h1>
          <p className="text-lg text-neutral-600">
            Submit your offer for this property
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Property Information */}
          <Card>
            <CardHeader>
              <CardTitle>Property Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {property.images && property.images[0] && (
                <img
                  src={property.images[0]}
                  alt={property.title}
                  className="w-full h-48 object-cover rounded-lg"
                />
              )}
              
              <div>
                <h3 className="font-semibold text-lg text-neutral-900">{property.title}</h3>
                <div className="flex items-center text-neutral-600 mt-1">
                  <MapPin className="w-4 h-4 mr-1" />
                  {property.location}
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Price Range</h4>
                <div className="text-2xl font-bold text-primary">
                  {formatCurrency(property.minPrice)} - {formatCurrency(property.maxPrice)}
                </div>
                <p className="text-sm text-blue-700 mt-1">
                  Your offer must be within this range
                </p>
              </div>

              <div className="p-4 bg-neutral-50 rounded-lg">
                <h4 className="font-medium text-neutral-900 mb-2">Listed by</h4>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-medium">{property.agentName}</div>
                    <div className="text-sm text-neutral-600">{property.agentEmail}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Offer Form */}
          <Card>
            <CardHeader>
              <CardTitle>Your Offer</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Readonly Fields */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Property Title
                      </label>
                      <Input value={property.title} readOnly className="bg-neutral-50" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Property Location
                      </label>
                      <Input value={property.location} readOnly className="bg-neutral-50" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Agent Name
                      </label>
                      <Input value={property.agentName} readOnly className="bg-neutral-50" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Buyer Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
                        <Input value={user?.email} readOnly className="bg-neutral-50 pl-10" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Buyer Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
                        <Input 
                          value={user?.displayName || user?.email} 
                          readOnly 
                          className="bg-neutral-50 pl-10" 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Editable Fields */}
                  <FormField
                    control={form.control}
                    name="offeredAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Offer Amount ($)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
                            <Input
                              type="number"
                              placeholder="Enter your offer amount"
                              className="pl-10"
                              min={property.minPrice}
                              max={property.maxPrice}
                              step="1000"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <div className="text-sm text-neutral-600">
                          Range: {formatCurrency(property.minPrice)} - {formatCurrency(property.maxPrice)}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="buyingDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Buying Date</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
                            <Input
                              type="date"
                              className="pl-10"
                              min={minDate}
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-blue-700"
                    disabled={makeOfferMutation.isPending}
                  >
                    {makeOfferMutation.isPending ? "Submitting Offer..." : "Submit Offer"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
