import { useState, useEffect } from "react";
import { BottomNavigation } from "@/components/BottomNavigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  User, Crown, Palette, Bell, Shield, CreditCard, 
  LogOut, Settings, Edit, CheckCircle
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const Profile = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (profileError) throw profileError;
      setUserProfile(profile);

      // Fetch active subscription
      const { data: sub, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user?.id)
        .eq('status', 'active')
        .gt('expires_at', new Date().toISOString())
        .single();

      if (!subError && sub) {
        setSubscription(sub);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUsernameColor = (subscriptionType: string) => {
    switch (subscriptionType) {
      case 'weekly':
        return 'text-green-400';
      case 'monthly':
        return 'bg-gradient-to-r from-green-400 to-purple-400 bg-clip-text text-transparent';
      case 'yearly':
        return 'bg-gradient-to-r from-green-400 via-purple-400 via-yellow-400 to-black bg-clip-text text-transparent';
      default:
        return 'text-foreground';
    }
  };

  const getSubscriptionBadge = (type: string) => {
    const colors = {
      weekly: 'bg-green-500',
      monthly: 'bg-gradient-to-r from-green-500 to-purple-500',
      yearly: 'bg-gradient-to-r from-green-500 via-purple-500 via-yellow-500 to-black'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-500';
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background pb-20 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-6 text-center">
            <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Not Signed In</h2>
            <p className="text-muted-foreground mb-4">
              Please sign in to view your profile
            </p>
            <Link to="/auth">
              <Button className="w-full">Sign In</Button>
            </Link>
          </CardContent>
        </Card>
        <BottomNavigation />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold gradient-text">Profile</h1>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </div>

        {/* User Info Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className={`text-xl font-bold ${getUsernameColor(userProfile?.subscription_type || 'free')}`}>
                  {userProfile?.username || 'Anonymous User'}
                  {userProfile?.subscription_type !== 'free' && (
                    <Crown className="inline h-5 w-5 ml-2 text-yellow-400" />
                  )}
                  {userProfile?.is_verified && (
                    <CheckCircle className="inline h-5 w-5 ml-1 text-blue-400" />
                  )}
                </h2>
                <p className="text-muted-foreground">{userProfile?.email}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge 
                    variant={userProfile?.subscription_type === 'free' ? 'secondary' : 'default'}
                    className={userProfile?.subscription_type !== 'free' ? getSubscriptionBadge(userProfile?.subscription_type) : ''}
                  >
                    {userProfile?.subscription_type || 'Free'}
                  </Badge>
                  {userProfile?.gender && (
                    <Badge variant="outline">
                      {userProfile.gender}
                    </Badge>
                  )}
                </div>
              </div>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Card */}
        {subscription ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Crown className="h-5 w-5 text-yellow-400" />
                <span>Active Subscription</span>
              </CardTitle>
              <CardDescription>
                Your premium features are active
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Plan</span>
                <Badge className={getSubscriptionBadge(subscription.plan_type)}>
                  {subscription.plan_type}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Expires</span>
                <span className="text-sm text-muted-foreground">
                  {new Date(subscription.expires_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Amount</span>
                <span className="font-medium">
                  {subscription.currency === 'INR' ? '₹' : '$'}{subscription.amount}
                </span>
              </div>
              <Button variant="outline" className="w-full">
                <CreditCard className="h-4 w-4 mr-2" />
                Manage Subscription
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Crown className="h-5 w-5 text-yellow-400" />
                <span>Upgrade to Premium</span>
              </CardTitle>
              <CardDescription>
                Unlock exclusive features and remove ads
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span className="text-sm">Chat with specific genders</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span className="text-sm">Premium themes</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span className="text-sm">No advertisements</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span className="text-sm">Colored username</span>
                </div>
              </div>
              <Button className="w-full">
                <Crown className="h-4 w-4 mr-2" />
                View Plans
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Settings */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Settings</h2>
          
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  <span>Push Notifications</span>
                </div>
                <Switch />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                  <span>Privacy Mode</span>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Palette className="h-5 w-5 text-muted-foreground" />
                  <span>Dark Theme</span>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button variant="outline" className="w-full justify-start">
            <Settings className="h-4 w-4 mr-2" />
            Account Settings
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start text-destructive hover:text-destructive"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Profile;