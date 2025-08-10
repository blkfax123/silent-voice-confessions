import { useState, useEffect } from "react";
import { BottomNavigation } from "@/components/BottomNavigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  User, Crown, Palette, Bell, Shield, CreditCard, 
  LogOut, Settings, Edit, CheckCircle, Moon, Volume, Lock
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'MXN', symbol: '$', name: 'Mexican Peso' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' }
];

const COUNTRIES = [
  { code: 'global', name: 'Global' },
  { code: 'us', name: 'United States' },
  { code: 'gb', name: 'United Kingdom' },
  { code: 'ca', name: 'Canada' },
  { code: 'au', name: 'Australia' },
  { code: 'de', name: 'Germany' },
  { code: 'fr', name: 'France' },
  { code: 'jp', name: 'Japan' },
  { code: 'kr', name: 'South Korea' },
  { code: 'in', name: 'India' },
  { code: 'br', name: 'Brazil' },
  { code: 'mx', name: 'Mexico' },
  { code: 'cn', name: 'China' },
  { code: 'it', name: 'Italy' },
  { code: 'es', name: 'Spain' },
  { code: 'nl', name: 'Netherlands' },
  { code: 'se', name: 'Sweden' },
  { code: 'no', name: 'Norway' },
  { code: 'dk', name: 'Denmark' },
  { code: 'fi', name: 'Finland' },
  { code: 'pl', name: 'Poland' },
  { code: 'ru', name: 'Russia' },
  { code: 'za', name: 'South Africa' },
  { code: 'eg', name: 'Egypt' },
  { code: 'ng', name: 'Nigeria' },
  { code: 'ke', name: 'Kenya' },
  { code: 'ma', name: 'Morocco' },
  { code: 'th', name: 'Thailand' },
  { code: 'id', name: 'Indonesia' },
  { code: 'my', name: 'Malaysia' },
  { code: 'sg', name: 'Singapore' },
  { code: 'ph', name: 'Philippines' },
  { code: 'vn', name: 'Vietnam' },
  { code: 'nz', name: 'New Zealand' },
  { code: 'ar', name: 'Argentina' },
  { code: 'cl', name: 'Chile' },
  { code: 'co', name: 'Colombia' },
  { code: 'pe', name: 'Peru' },
  { code: 'tr', name: 'Turkey' },
  { code: 'sa', name: 'Saudi Arabia' },
  { code: 'ae', name: 'United Arab Emirates' },
  { code: 'il', name: 'Israel' }
];

const Profile = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [confessions, setConfessions] = useState<any[]>([]);
  const [likesCount, setLikesCount] = useState(0);
  const [savedCount, setSavedCount] = useState(0);
  const [viewsCount, setViewsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    gender: "",
    theme_preference: "",
    country: "",
    language_preference: "english",
  });

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
      setFormData({
        username: profile.username || "",
        gender: profile.gender || "",
        theme_preference: profile.theme_preference || "dark",
        country: profile.country || "global",
        language_preference: profile.language_preference || "english",
      });

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

      // Fetch user's posts
      const { data: myConfs } = await supabase
        .from('confessions')
        .select('id, title, content, audio_url, category')
        .eq('user_id', user?.id)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });
      setConfessions(myConfs || []);

      // Basic stats (placeholder views and computed likes)
      setViewsCount((myConfs?.length || 0) * 10);
      if (myConfs && myConfs.length > 0) {
        const ids = myConfs.map((c: any) => c.id);
        const { count } = await supabase
          .from('user_reactions')
          .select('*', { count: 'exact', head: true })
          .in('confession_id', ids);
        setLikesCount(count || 0);
      } else {
        setLikesCount(0);
      }
      setSavedCount(0);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('users')
        .update(formData)
        .eq('id', user?.id);

      if (error) throw error;
      
      await fetchUserData();
      setEditing(false);
      toast({
        title: "Success",
        description: "Profile updated successfully"
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
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
    <div className="min-h-screen bg-background pb-28">
      <div className="p-4 space-y-4">
        {/* User Info Header */}
        <Card className="border-none bg-card/50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 rounded-full bg-purple-500/20 flex items-center justify-center">
                <User className="h-8 w-8 text-purple-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 min-w-0">
                  <h2 className={`text-xl font-bold truncate ${getUsernameColor(userProfile?.subscription_type || 'free')}`}>
                    {userProfile?.username || 'blkfax1'}
                  </h2>
                  {userProfile?.subscription_type !== 'free' && (
                    <Crown className="h-5 w-5 text-yellow-400" />
                  )}
                </div>
                <p className="text-muted-foreground text-sm">{user.email}</p>
                <div className="flex items-center gap-2 mt-3">
                  <Link to="/profile/edit">
                    <Button size="sm" variant="outline" className="rounded-full px-4">Edit profile</Button>
                  </Link>
                  <Badge variant="secondary" className="rounded-full px-3">
                    {subscription ? 'Active Subscription' : 'Free'}
                  </Badge>
                </div>
                <div className="flex gap-8 mt-4 text-muted-foreground">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-foreground">{viewsCount}</div>
                    <div className="text-xs">views</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-foreground">{likesCount}</div>
                    <div className="text-xs">likes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-foreground">{savedCount}</div>
                    <div className="text-xs">saved</div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 ml-auto">
                <Link to="/settings">
                  <Button variant="outline" size="sm" aria-label="Settings">
                    <Settings className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/profile/edit">
                  <Button variant="outline" size="sm" aria-label="Edit profile">
                    <Edit className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>


        {/* Your Posts */}
        <Card className="border-none bg-card/50">
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold mb-3">Your Posts</h2>
            {confessions.length === 0 ? (
              <p className="text-sm text-muted-foreground">You haven't posted anything yet.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {confessions.map((c) => (
                  <Link key={c.id} to={`/confession/${c.id}`} className="block">
                    <div className="rounded-2xl border bg-card p-3 h-48 flex flex-col justify-between hover-scale">
                      {c.category && (
                        <span className="text-[11px] px-2 py-1 rounded-full bg-primary/15 text-primary w-fit">{c.category}</span>
                      )}
                      <span className="text-base leading-tight line-clamp-5">
                        {c.title || c.content || 'Voice confession'}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Settings */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Settings</h2>
          
          <Card className="border-none bg-card/50">
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
                  <Lock className="h-5 w-5 text-muted-foreground" />
                  <span>Privacy Mode</span>
                </div>
                <Switch defaultChecked className="data-[state=checked]:bg-purple-500" />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Moon className="h-5 w-5 text-muted-foreground" />
                  <span>Dark Theme</span>
                </div>
                <Switch defaultChecked className="data-[state=checked]:bg-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Account Settings Button */}
        <Link to="/settings">
          <Button variant="outline" className="w-full justify-start">
            <Settings className="h-4 w-4 mr-2" />
            Account Settings
          </Button>
        </Link>

        {/* Sign Out Button */}
        <Button 
          variant="outline" 
          className="w-full justify-start text-red-400 hover:text-red-300 border-gray-600 bg-transparent"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>

      </div>

      <BottomNavigation />
    </div>
  );
};

export default Profile;