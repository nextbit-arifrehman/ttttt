import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingBag, MapPin, DollarSign, Calendar, CreditCard, Clock, CheckCircle, XCircle } from "lucide-react";

export default function PropertyBought() {
  const { user } = useAuth();

  // Fetch user's offers/bought properties
  const { data: offers = [], isLoading, error } = useQuery({
    queryKey: ['/api/offers/user', user?.id],
    enabled: !!user?.id,
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "accepted":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Accepted
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      case "bought":
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Bought
          </Badge>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <p className="text-red-500 mb-4">Failed to load property offers</p>
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
            Property Bought
          </h1>
          <p className="text-lg text-neutral-600">
            Track your property offers and purchases
          </p>
        </div>

        {/* Offers List */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-24 w-32 rounded" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-1/4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : offers.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <ShoppingBag className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">No Property Offers Yet</h3>
              <p className="text-neutral-600 mb-6">
                You haven't made any offers on properties yet. Start exploring and make your first offer!
              </p>
              <Link to="/properties">
                <Button className="bg-primary hover:bg-blue-700">
                  Browse Properties
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {offers.map((offer) => (
              <Card key={offer.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Property Image */}
                    <div className="md:w-48 flex-shrink-0">
                      <img
                        src={offer.propertyImage || "https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"}
                        alt={offer.propertyTitle}
                        className="w-full h-32 md:h-24 object-cover rounded-lg"
                      />
                    </div>

                    {/* Property Details */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg text-neutral-900 mb-1">
                            {offer.propertyTitle}
                          </h3>
                          <div className="flex items-center text-neutral-600 text-sm mb-2">
                            <MapPin className="w-4 h-4 mr-1" />
                            {offer.propertyLocation}
                          </div>
                          <div className="text-sm text-neutral-600">
                            Agent: {offer.agentName}
                          </div>
                        </div>
                        {getStatusBadge(offer.status)}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 mr-2 text-green-600" />
                          <div>
                            <div className="text-sm text-neutral-600">Offered Amount</div>
                            <div className="font-semibold text-green-600">
                              {formatCurrency(offer.offeredAmount)}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                          <div>
                            <div className="text-sm text-neutral-600">Offer Date</div>
                            <div className="font-semibold">
                              {formatDate(offer.createdAt)}
                            </div>
                          </div>
                        </div>

                        {offer.status === "bought" && offer.transactionId && (
                          <div className="flex items-center">
                            <CreditCard className="w-4 h-4 mr-2 text-purple-600" />
                            <div>
                              <div className="text-sm text-neutral-600">Transaction ID</div>
                              <div className="font-semibold text-xs">
                                {offer.transactionId}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-4 flex gap-2">
                        {offer.status === "accepted" && (
                          <Link to={`/payment/${offer.id}`}>
                            <Button className="bg-primary hover:bg-blue-700">
                              <CreditCard className="w-4 h-4 mr-2" />
                              Pay Now
                            </Button>
                          </Link>
                        )}
                        
                        <Link to={`/property/${offer.propertyId}`}>
                          <Button variant="outline">
                            View Property
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Summary Statistics */}
        {offers.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Offer Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{offers.length}</div>
                  <div className="text-sm text-blue-700">Total Offers</div>
                </div>
                
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {offers.filter(offer => offer.status === "pending").length}
                  </div>
                  <div className="text-sm text-yellow-700">Pending</div>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {offers.filter(offer => offer.status === "accepted").length}
                  </div>
                  <div className="text-sm text-green-700">Accepted</div>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {offers.filter(offer => offer.status === "bought").length}
                  </div>
                  <div className="text-sm text-purple-700">Purchased</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
