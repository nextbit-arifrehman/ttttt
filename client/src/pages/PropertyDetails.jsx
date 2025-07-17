import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import ReviewCard from "../components/ReviewCard";
import { MapPin, Heart, Star, Plus, Check, Clock, ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import apiClient from "../lib/api";
import { useToast } from "@/hooks/use-toast";

const reviewSchema = z.object({
  rating: z.string().min(1, "Please select a rating"),
  description: z.string().min(10, "Review must be at least 10 characters long"),
});

export default function PropertyDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch property details
  const { data: property, isLoading: propertyLoading, error: propertyError } = useQuery({
    queryKey: ['/api/properties', id],
    enabled: !!id,
  });

  // Fetch property reviews
  const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ['/api/reviews/property', id],
    enabled: !!id,
  });

  // Add to wishlist mutation
  const addToWishlistMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post("/api/wishlist", {
        userId: user.id,
        propertyId: property.id,
        propertyTitle: property.title,
        propertyLocation: property.location,
        propertyImage: property.images?.[0] || "",
        agentName: property.agentName,
        agentImage: property.agentImage,
        priceRange: property.priceRange || `${property.minPrice?.toLocaleString()} - ${property.maxPrice?.toLocaleString()}`,
        verificationStatus: property.verificationStatus
      });
      
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "Added to Wishlist",
        description: "Property has been added to your wishlist successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add property to wishlist.",
        variant: "destructive",
      });
    }
  });

  // Add review mutation
  const addReviewMutation = useMutation({
    mutationFn: async (reviewData) => {
      const response = await apiClient.post("/api/reviews", {
        propertyId: property.id,
        propertyTitle: property.title,
        userId: user.id,
        userName: user.displayName || user.email,
        userImage: user.photoURL || "",
        agentName: property.agentName,
        rating: parseInt(reviewData.rating),
        description: reviewData.description
      });
      
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "Review Added",
        description: "Your review has been submitted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/reviews/property', id] });
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit review.",
        variant: "destructive",
      });
    }
  });

  const form = useForm({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: "",
      description: "",
    },
  });

  const handleAddToWishlist = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to add properties to your wishlist.",
        variant: "destructive",
      });
      return;
    }

    if (user.role !== "user") {
      toast({
        title: "Access Denied",
        description: "Only users can add properties to wishlist.",
        variant: "destructive",
      });
      return;
    }

    addToWishlistMutation.mutate();
  };

  const onSubmitReview = (data) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to submit a review.",
        variant: "destructive",
      });
      return;
    }

    if (user.role !== "user") {
      toast({
        title: "Access Denied",
        description: "Only users can submit reviews.",
        variant: "destructive",
      });
      return;
    }

    addReviewMutation.mutate(data);
  };

  const getVerificationBadge = () => {
    if (!property) return null;
    
    switch (property.verificationStatus) {
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
      case "rejected":
        return (
          <Badge variant="destructive">
            Rejected
          </Badge>
        );
      default:
        return null;
    }
  };

  if (propertyError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <p className="text-red-500 mb-4">Property not found</p>
            <Link to="/properties">
              <Button>Back to Properties</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (propertyLoading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-8 w-48 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="h-96 w-full rounded-lg" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link to="/properties">
            <Button variant="ghost" className="text-neutral-600 hover:text-neutral-900">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Properties
            </Button>
          </Link>
        </div>

        {/* Property Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Property Images */}
          <div className="space-y-4">
            <div className="relative rounded-lg overflow-hidden">
              <img
                src={property.images?.[0] || "https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"}
                alt={property.title}
                className="w-full h-96 object-cover"
              />
              <div className="absolute top-4 left-4">
                {getVerificationBadge()}
              </div>
            </div>
            
            {property.images && property.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {property.images.slice(1, 5).map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`${property.title} ${index + 2}`}
                    className="w-full h-20 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Property Information */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl font-bold text-primary">
                  {property.priceRange || `$${property.minPrice?.toLocaleString()} - $${property.maxPrice?.toLocaleString()}`}
                </span>
                {user?.role === "user" && (
                  <Button
                    onClick={handleAddToWishlist}
                    disabled={addToWishlistMutation.isPending}
                    className="bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 border border-red-200"
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Add to Wishlist
                  </Button>
                )}
              </div>
              
              <h1 className="text-2xl font-bold text-neutral-900 mb-2">{property.title}</h1>
              
              <div className="flex items-center text-neutral-600">
                <MapPin className="w-4 h-4 mr-2" />
                <span>{property.location}</span>
              </div>
            </div>

            {/* Agent Information */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4">Listed by</h3>
                <div className="flex items-center space-x-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={property.agentImage} alt={property.agentName} />
                    <AvatarFallback className="text-lg">
                      {property.agentName?.charAt(0)?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold text-neutral-900">{property.agentName}</h4>
                    <p className="text-neutral-600">{property.agentEmail}</p>
                    <p className="text-sm text-primary">Real Estate Agent</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4">Description</h3>
                <p className="text-neutral-700 leading-relaxed">
                  {property.description || "No description available for this property."}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Reviews Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">Property Reviews</CardTitle>
              {user?.role === "user" && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="bg-primary hover:bg-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Review
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add Your Review</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmitReview)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="rating"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Rating</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a rating" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="5">⭐⭐⭐⭐⭐ (5 stars)</SelectItem>
                                  <SelectItem value="4">⭐⭐⭐⭐ (4 stars)</SelectItem>
                                  <SelectItem value="3">⭐⭐⭐ (3 stars)</SelectItem>
                                  <SelectItem value="2">⭐⭐ (2 stars)</SelectItem>
                                  <SelectItem value="1">⭐ (1 star)</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Review</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Share your experience with this property..."
                                  className="min-h-[100px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button
                          type="submit"
                          className="w-full bg-primary hover:bg-blue-700"
                          disabled={addReviewMutation.isPending}
                        >
                          {addReviewMutation.isPending ? "Submitting..." : "Submit Review"}
                        </Button>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {reviewsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <Skeleton className="h-4 w-24 mb-4" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-3/4 mb-4" />
                      <div className="flex items-center">
                        <Skeleton className="h-10 w-10 rounded-full mr-3" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-12">
                <Star className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">No Reviews Yet</h3>
                <p className="text-neutral-600">Be the first to review this property!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
