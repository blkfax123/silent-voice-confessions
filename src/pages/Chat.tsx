import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BottomNavigation } from "@/components/BottomNavigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Users, Crown, Shuffle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Chat = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [activeRooms, setActiveRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [waitingForMatch, setWaitingForMatch] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchActiveRooms();
      fetchOnlineCount();
    }
  }, [user]);

  const fetchOnlineCount = async () => {
    try {
      const { count, error } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      setOnlineCount(count || 0);
    } catch (error) {
      console.error('Error fetching online count:', error);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchActiveRooms = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_rooms')
        .select('*')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setActiveRooms(data || []);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const startRandomChat = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    setLoading(true);
    try {
      // Find someone to chat with (excluding current user)
      const { data: availableUsers, error } = await supabase
        .from('users')
        .select('id')
        .neq('id', user.id)
        .limit(10);

      if (error) throw error;

      if (!availableUsers || availableUsers.length === 0) {
        setWaitingForMatch(true);
        toast({
          title: "Waiting for connection",
          description: "Looking for someone to chat with...",
        });
        // Simulate waiting with polling
        setTimeout(() => {
          setWaitingForMatch(false);
          toast({
            title: "No match found",
            description: "Try again later when more users are online.",
          });
        }, 5000);
        return;
      }

      // Create new chat room
      const randomUser = availableUsers[Math.floor(Math.random() * availableUsers.length)];
      const { data: newRoom, error: roomError } = await supabase
        .from('chat_rooms')
        .insert({
          user1_id: user.id,
          user2_id: randomUser.id,
          room_type: 'random'
        })
        .select()
        .single();

      if (roomError) throw roomError;

      toast({
        title: "Chat started!",
        description: "You've been connected with a stranger.",
      });

      fetchActiveRooms();
    } catch (error) {
      console.error('Error starting chat:', error);
      toast({
        title: "Error",
        description: "Failed to start chat. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const startGenderSpecificChat = async (targetGender: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    setLoading(true);
    try {
      // Check if user has active subscription
      const hasSubscription = await checkSubscription();
      if (!hasSubscription) {
        navigate('/subscription');
        return;
      }

      const { data: availableUsers, error } = await supabase
        .from('users')
        .select('id')
        .eq('gender', targetGender)
        .neq('id', user.id)
        .limit(10);

      if (error) throw error;

      if (!availableUsers || availableUsers.length === 0) {
        toast({
          title: "No users available",
          description: `No ${targetGender} users are currently online.`,
        });
        return;
      }

      const randomUser = availableUsers[Math.floor(Math.random() * availableUsers.length)];
      const { data: newRoom, error: roomError } = await supabase
        .from('chat_rooms')
        .insert({
          user1_id: user.id,
          user2_id: randomUser.id,
          room_type: 'specific_gender',
          target_gender: targetGender
        })
        .select()
        .single();

      if (roomError) throw roomError;

      toast({
        title: "Chat started!",
        description: `Connected with a ${targetGender} user.`,
      });

      fetchActiveRooms();
    } catch (error) {
      console.error('Error starting gender-specific chat:', error);
      toast({
        title: "Error",
        description: "Failed to start chat. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkSubscription = async () => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .gt('expires_at', new Date().toISOString())
        .single();

      return !error && data;
    } catch {
      return false;
    }
  };

  const getUsernameColor = (subscriptionType: string) => {
    switch (subscriptionType) {
      case 'weekly':
        return 'text-green-400';
      case 'monthly':
        return 'text-gradient bg-gradient-to-r from-green-400 to-purple-400';
      case 'yearly':
        return 'text-gradient bg-gradient-to-r from-green-400 via-purple-400 via-yellow-400 to-black';
      default:
        return 'text-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold gradient-text">Anonymous Chat</h1>
          <p className="text-muted-foreground">Connect with strangers around the world</p>
          <Badge variant="secondary" className="bg-green-500/20 text-green-400">
            {onlineCount} users online
          </Badge>
        </div>

        {/* User Info */}
        {userProfile && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`font-medium ${getUsernameColor(userProfile.subscription_type)}`}>
                    {userProfile.username || 'Anonymous'}
                    {userProfile.subscription_type !== 'free' && (
                      <Crown className="inline h-4 w-4 ml-1 text-yellow-400" />
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {userProfile.gender || 'Gender not set'}
                  </p>
                </div>
                <Badge variant={userProfile.subscription_type === 'free' ? 'secondary' : 'default'}>
                  {userProfile.subscription_type}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Start New Chat */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Start New Chat</h2>
          
          {/* Random Chat */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shuffle className="h-5 w-5" />
                <span>Random Chat</span>
                <Badge variant="secondary">Free</Badge>
              </CardTitle>
              <CardDescription>
                Connect with any random user for anonymous conversations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={startRandomChat} 
                disabled={loading || waitingForMatch}
                className="w-full"
              >
                {loading || waitingForMatch ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {waitingForMatch ? "Waiting for someone..." : "Connecting..."}
                  </>
                ) : (
                  "Start Random Chat"
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Gender Specific Chat */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Gender Specific Chat</span>
                <Badge variant="default">Premium</Badge>
              </CardTitle>
              <CardDescription>
                Choose to chat with specific genders (subscription required)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => startGenderSpecificChat('male')}
                  disabled={loading}
                >
                  Chat with Males
                </Button>
                <Button
                  variant="outline"
                  onClick={() => startGenderSpecificChat('female')}
                  disabled={loading}
                >
                  Chat with Females
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Chats */}
        {activeRooms.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Active Chats</h2>
            {activeRooms.map((room) => (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <MessageCircle className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">
                            {room.room_type === 'random' ? 'Random Chat' : `${room.target_gender} Chat`}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Started {new Date(room.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary">Active</Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Chat;