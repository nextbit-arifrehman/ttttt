import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, MapPin, Trash2, ShoppingBag, Check, Clock, ArrowRight } from "lucide-react";
import apiClient from "../../lib/api";
import { useToast } from "@/hooks/use-toast";

export default function Wishlist() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user's wishlist
  const { data: wishlist = [], isLoading, error } = useQuery({
    queryKey: ['/api/wishlist', user?.id],
    enabled: !!user?.id,
  });

  // Remove from wishlist mutation
  const removeFromWishlistMutation = useMutation({
    mutationFn: async (propertyId) => {
      const response = await apiClient.delete(`/api/wishlist/${user.id}/${propertyId}`);
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "Removed from Wishlist",
        description: "Property has been removed from your wishlist.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/wishlist', user?.id] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove property from wishlist.",
        variant: "destructive",
      });
    }
  });

  const handleRemoveFromWishlist = (propertyId) => {
    removeFromWishlistMutation.mutate(propertyId);
  };

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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <p className="text-red-500 mb-4">Failed to load wishlist</p>
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
            My Wishlist
          </h1>
          <p className="text-lg text-neutral-600">
            Properties you've saved for later viewing
          </p>
        </div>

        {/* Wishlist Items */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : wishlist.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <Heart className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">Your Wishlist is Empty</h3>
              <p className="text-neutral-600 mb-6">
                Start exploring properties and save your favorites to build your wishlist.
              </p>
              <Link to="/properties">
                <Button className="bg-primary hover:bg-blue-700">
                  Browse Properties
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.map((item) => (
              <Card key={item.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300">
                <div className="relative">
                  <img 
                    src={item.propertyImage || "https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"} 
                    alt={item.propertyTitle}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  <div className="absolute top-4 left-4">
                    {getVerificationBadge(item.verificationStatus)}
                  </div>
                  
                  <div className="absolute top-4 right-4">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="w-8 h-8 bg-white/90 hover:bg-white hover:text-red-500 transition-colors"
                      onClick={() => handleRemoveFromWishlist(item.propertyId)}
                      disabled={removeFromWishlistMutation.isPending}
                    >
                      <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                    </Button>
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xl font-bold text-primary">
                        {item.priceRange}
                      </span>
                    </div>
                    
                    <h3 className="font-semibold text-lg text-neutral-900 mb-2 line-clamp-1">
                      {item.propertyTitle}
                    </h3>
                    
                    <p className="text-neutral-600 mb-4 flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-neutral-400" />
                      <span className="truncate">{item.propertyLocation}</span>
                    </p>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
                      <div className="flex items-center space-x-2">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={item.agentImage} alt={item.agentName} />
                          <AvatarFallback>
                            {item.agentName?.charAt(0)?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-neutral-600 truncate">
                          {item.agentName}
                        </span>
                      </div>
                      
                      <div className="flex gap-2">
                        <div className="flex gap-2">
                        <Link to={`/make-offer/${item.propertyId}`}>
                          <Button size="sm" className="bg-secondary hover:bg-green-700">
                            <ShoppingBag className="w-3 h-3 mr-1" />
                            Offer
                          </Button>
                        </Link>
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveFromWishlist(item.propertyId)}
                          disabled={removeFromWishlistMutation.isPending}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    </div>
                    
                    <div className="mt-4">
                      <Link to={`/property/${item.propertyId}`}>
                        <Button variant="ghost" size="sm" className="w-full text-primary hover:text-blue-700">
                          View Details
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Summary */}
        {wishlist.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Wishlist Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{wishlist.length}</div>
                  <div className="text-sm text-blue-700">Total Properties</div>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {wishlist.filter(item => item.verificationStatus === "verified").length}
                  </div>
                  <div className="text-sm text-green-700">Verified Properties</div>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {new Set(wishlist.map(item => item.agentName)).size}
                  </div>
                  <div className="text-sm text-purple-700">Different Agents</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
