import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "../contexts/AuthContext";
import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, CreditCard, MapPin, User, CheckCircle, AlertCircle } from "lucide-react";
import apiClient from "../lib/api";
import { useToast } from "@/hooks/use-toast";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY 
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
  : null;

const CheckoutForm = ({ offer, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + "/dashboard/user/property-bought",
        },
        redirect: "if_required",
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        // Payment succeeded, update the offer status
        onSuccess(paymentIntent.id);
      }
    } catch (error) {
      toast({
        title: "Payment Error",
        description: "An unexpected error occurred during payment processing.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center mb-2">
          <AlertCircle className="w-4 h-4 text-blue-600 mr-2" />
          <h4 className="font-medium text-blue-900">Secure Payment</h4>
        </div>
        <p className="text-sm text-blue-700">
          Your payment information is encrypted and secure. This transaction will complete your property purchase.
        </p>
      </div>
      
      <PaymentElement />
      
      <Button
        type="submit"
        disabled={!stripe || !elements || isProcessing}
        className="w-full bg-primary hover:bg-blue-700"
        size="lg"
      >
        {isProcessing ? (
          <>
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
            Processing Payment...
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4 mr-2" />
            Pay ${offer?.offeredAmount?.toLocaleString()}
          </>
        )}
      </Button>
      
      <p className="text-xs text-neutral-500 text-center">
        By completing this purchase, you agree to our terms of service and confirm the property purchase agreement.
      </p>
    </form>
  );
};

export default function Payment() {
  const { offerId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [clientSecret, setClientSecret] = useState("");

  // Check if Stripe is properly configured
  if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">Payment System Not Configured</h3>
            <p className="text-neutral-600 mb-4">
              Payment processing is not available at this time. Please contact support.
            </p>
            <Button onClick={() => navigate("/dashboard/user/property-bought")}>
              Back to My Offers
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fetch offer details
  const { data: offers = [], isLoading: offerLoading, error: offerError } = useQuery({
    queryKey: ['/api/offers/user', user?.id],
    enabled: !!user?.id,
  });

  const offer = offers.find(o => o.id === offerId);

  // Complete payment mutation
  const completePaymentMutation = useMutation({
    mutationFn: async (transactionId) => {
      const response = await apiClient.patch(`/api/offers/${offerId}/pay`, { transactionId });
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "Payment Successful!",
        description: "Congratulations! You have successfully purchased the property.",
      });
      navigate("/dashboard/user/property-bought");
    },
    onError: (error) => {
      toast({
        title: "Payment Update Failed",
        description: error.message || "Failed to update payment status.",
        variant: "destructive",
      });
    }
  });

  useEffect(() => {
    if (offer && offer.status === "accepted") {
      // Create PaymentIntent as soon as the page loads
      apiClient.post("/api/create-payment-intent", { 
        amount: offer.offeredAmount 
      })
        .then((res) => {
          setClientSecret(res.data.clientSecret);
        })
        .catch((error) => {
          toast({
            title: "Payment Setup Failed",
            description: "Failed to initialize payment. Please try again.",
            variant: "destructive",
          });
        });
    }
  }, [offer, toast]);

  const handlePaymentSuccess = (transactionId) => {
    completePaymentMutation.mutate(transactionId);
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
      month: 'long',
      day: 'numeric'
    });
  };

  if (offerError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-600 mb-2">Payment Error</h3>
            <p className="text-neutral-600 mb-4">Failed to load offer details.</p>
            <Button onClick={() => navigate("/dashboard/user/property-bought")}>
              Back to My Offers
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (offerLoading) {
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

  if (!offer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">Offer Not Found</h3>
            <p className="text-neutral-600 mb-4">The offer you're trying to pay for could not be found.</p>
            <Button onClick={() => navigate("/dashboard/user/property-bought")}>
              Back to My Offers
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (offer.status !== "accepted") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">Payment Not Available</h3>
            <p className="text-neutral-600 mb-4">
              This offer is not ready for payment. Current status: {offer.status}
            </p>
            <Button onClick={() => navigate("/dashboard/user/property-bought")}>
              Back to My Offers
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-neutral-600">Setting up secure payment...</p>
            </div>
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
            onClick={() => navigate("/dashboard/user/property-bought")}
            className="text-neutral-600 hover:text-neutral-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to My Offers
          </Button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="font-inter font-bold text-3xl md:text-4xl text-neutral-900 mb-2">
            Complete Your Purchase
          </h1>
          <p className="text-lg text-neutral-600">
            Finalize your property purchase with secure payment
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Property Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                Purchase Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {offer.propertyImage && (
                <img
                  src={offer.propertyImage}
                  alt={offer.propertyTitle}
                  className="w-full h-48 object-cover rounded-lg"
                />
              )}
              
              <div>
                <h3 className="font-semibold text-lg text-neutral-900 mb-2">
                  {offer.propertyTitle}
                </h3>
                <div className="flex items-center text-neutral-600 mb-4">
                  <MapPin className="w-4 h-4 mr-2" />
                  {offer.propertyLocation}
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Purchase Price</span>
                  <span className="font-semibold">{formatCurrency(offer.offeredAmount)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-neutral-600">Offer Date</span>
                  <span>{formatDate(offer.createdAt)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-neutral-600">Expected Closing</span>
                  <span>{formatDate(offer.buyingDate)}</span>
                </div>
              </div>

              <Separator />

              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center mb-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                  <span className="font-medium text-green-900">Offer Accepted</span>
                </div>
                <p className="text-sm text-green-700">
                  Your offer has been accepted by the agent. Complete the payment to finalize the purchase.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-neutral-900">Agent Information</h4>
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-2 text-neutral-400" />
                  <span className="text-neutral-600">{offer.agentName}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                  <span className="text-blue-900 font-medium">Total Amount</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {formatCurrency(offer.offeredAmount)}
                  </span>
                </div>
              </div>

              {/* Make SURE to wrap the form in <Elements> which provides the stripe context. */}
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm offer={offer} onSuccess={handlePaymentSuccess} />
              </Elements>
            </CardContent>
          </Card>
        </div>

        {/* Security Notice */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-neutral-900 mb-2">Secure & Protected Transaction</h4>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  Your payment is processed securely through Stripe, a leading payment processor trusted by millions of businesses worldwide. 
                  Your financial information is encrypted and never stored on our servers. This transaction is protected by industry-standard security measures.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
