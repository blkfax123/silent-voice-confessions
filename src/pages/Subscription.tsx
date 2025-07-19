import { useState, useEffect } from "react";
import { BottomNavigation } from "@/components/BottomNavigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Crown, Check, Star, Globe, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Subscription = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isIndia, setIsIndia] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const globalPlans = [
    {
      id: 'weekly_global',
      name: 'Weekly',
      price: 2.49,
      currency: 'USD',
      period: 'week',
      color: 'bg-green-500',
      features: ['Chat with specific genders', 'Green username color', 'No ads']
    },
    {
      id: 'monthly_global',
      name: 'Monthly',
      price: 5.99,
      currency: 'USD',
      period: 'month',
      color: 'bg-gradient-to-r from-green-500 to-purple-500',
      features: ['All Weekly features', 'Green + Purple username', 'Premium themes', 'Priority support']
    },
    {
      id: 'yearly_global',
      name: 'Yearly',
      price: 29.99,
      currency: 'USD',
      period: 'year',
      color: 'bg-gradient-to-r from-green-500 via-purple-500 via-yellow-500 to-black',
      features: ['All Monthly features', 'Rainbow username', 'Exclusive themes', 'Beta features'],
      popular: true
    }
  ];

  const indiaPlans = [
    {
      id: 'weekly_india',
      name: 'Weekly',
      price: 199,
      currency: 'INR',
      period: 'week',
      color: 'bg-green-500',
      features: ['Chat with specific genders', 'Green username color', 'No ads']
    },
    {
      id: 'monthly_india',
      name: 'Monthly',
      price: 799,
      currency: 'INR',
      period: 'month',
      color: 'bg-gradient-to-r from-green-500 to-purple-500',
      features: ['All Weekly features', 'Green + Purple username', 'Premium themes', 'Priority support']
    },
    {
      id: 'yearly_india',
      name: 'Yearly',
      price: 2499,
      currency: 'INR',
      period: 'year',
      color: 'bg-gradient-to-r from-green-500 via-purple-500 via-yellow-500 to-black',
      features: ['All Monthly features', 'Rainbow username', 'Exclusive themes', 'Beta features'],
      popular: true
    }
  ];

  const currentPlans = isIndia ? indiaPlans : globalPlans;

  const handleSubscribe = async (plan: any) => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be logged in to subscribe.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setSelectedPlan(plan.id);

    try {
      // Here you would integrate with payment processors
      // For now, we'll simulate a successful payment
      const expiresAt = new Date();
      if (plan.period === 'week') expiresAt.setDate(expiresAt.getDate() + 7);
      else if (plan.period === 'month') expiresAt.setMonth(expiresAt.getMonth() + 1);
      else if (plan.period === 'year') expiresAt.setFullYear(expiresAt.getFullYear() + 1);

      // Insert subscription record
      const { error: subError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
          plan_type: plan.period,
          payment_method: isIndia ? 'razorpay' : 'stripe',
          amount: plan.price,
          currency: plan.currency,
          expires_at: expiresAt.toISOString()
        });

      if (subError) throw subError;

      // Update user profile
      const { error: userError } = await supabase
        .from('users')
        .update({
          subscription_type: plan.period,
          subscription_expires_at: expiresAt.toISOString(),
          country: isIndia ? 'india' : 'global'
        })
        .eq('id', user.id);

      if (userError) throw userError;

      toast({
        title: "Subscription activated!",
        description: `Your ${plan.name} subscription is now active.`,
      });

    } catch (error) {
      console.error('Subscription error:', error);
      toast({
        title: "Payment failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setSelectedPlan("");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Crown className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold gradient-text">Go Premium</h1>
            <p className="text-muted-foreground">Unlock exclusive features and enhance your experience</p>
          </motion.div>
        </div>

        {/* Region Selector */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Globe className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">
                    {isIndia ? 'India Pricing' : 'Global Pricing'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isIndia ? 'Prices in INR' : 'Prices in USD'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <Switch 
                  checked={isIndia} 
                  onCheckedChange={setIsIndia}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Plans */}
        <div className="space-y-4">
          {currentPlans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className={`relative ${plan.popular ? 'border-primary shadow-lg' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary">
                      <Star className="h-3 w-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <span>{plan.name}</span>
                        <div className={`w-4 h-4 rounded ${plan.color}`} />
                      </CardTitle>
                      <CardDescription>
                        Perfect for {plan.period}ly users
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">
                        {plan.currency === 'INR' ? '₹' : '$'}{plan.price}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        per {plan.period}
                      </p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <Check className="h-4 w-4 text-green-400" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={() => handleSubscribe(plan)}
                    disabled={loading}
                    className={`w-full ${plan.popular ? 'bg-primary' : ''}`}
                    variant={plan.popular ? 'default' : 'outline'}
                  >
                    {loading && selectedPlan === plan.id ? (
                      "Processing..."
                    ) : (
                      <>
                        <Crown className="h-4 w-4 mr-2" />
                        Subscribe Now
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>
              Secure payments powered by industry leaders
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center space-x-4 text-sm text-muted-foreground">
              {isIndia ? (
                <>
                  <span>Razorpay</span>
                  <span>•</span>
                  <span>UPI</span>
                  <span>•</span>
                  <span>Cards</span>
                </>
              ) : (
                <>
                  <span>Stripe</span>
                  <span>•</span>
                  <span>PayPal</span>
                  <span>•</span>
                  <span>Cards</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Subscription;