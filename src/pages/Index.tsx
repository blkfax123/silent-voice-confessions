import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import RecordButton from "@/components/RecordButton";
import ConfessionCard from "@/components/ConfessionCard";
import { WhisperRoom } from "@/components/WhisperRoom";
import { BottomNavigation } from "@/components/BottomNavigation";
import { GenderSelection } from "@/components/GenderSelection";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Mic, Radio, Settings, User, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const { user, signOut } = useAuth();
  const [confessions, setConfessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGenderSelection, setShowGenderSelection] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [onlineCount, setOnlineCount] = useState(0);

  useEffect(() => {
    fetchConfessions();
    if (user) {
      checkUserProfile();
    }
    
    // Simulate online count
    const updateOnlineCount = () => {
      const baseCount = 45;
      const variation = Math.floor(Math.random() * 20) - 10;
      setOnlineCount(baseCount + variation);
    };
    
    updateOnlineCount();
    const interval = setInterval(updateOnlineCount, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, [user]);

  const checkUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      setUserProfile(data);
      
      // Show gender selection if user hasn't set gender
      if (!data.gender) {
        setShowGenderSelection(true);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchConfessions = async () => {
    try {
      const { data, error } = await supabase
        .from('confessions')
        .select('*')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setConfessions(data || []);
    } catch (error) {
      console.error('Error fetching confessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-950/20 to-background pb-20">
      {/* Gender Selection Modal */}
      {showGenderSelection && (
        <GenderSelection onComplete={() => setShowGenderSelection(false)} />
      )}

      {/* Header with user info */}
      <header className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <User className="h-4 w-4 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Silent Circle</h1>
        </div>
        <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-card/50 backdrop-blur-md border">
          <div className="w-3 h-3 rounded-full bg-primary"></div>
          <span className="text-sm text-foreground font-medium">
            {userProfile?.username || 'Anonymous'}
          </span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4">
        <Tabs defaultValue="feed" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-card/30 backdrop-blur-md border border-white/10">
            <TabsTrigger 
              value="feed" 
              className="flex items-center space-x-2 data-[state=active]:bg-primary/20 data-[state=active]:text-foreground rounded-lg"
            >
              <Heart className="h-4 w-4" />
              <span>Feed</span>
            </TabsTrigger>
            <TabsTrigger 
              value="whisper" 
              className="flex items-center space-x-2 data-[state=active]:bg-primary/20 data-[state=active]:text-foreground rounded-lg"
            >
              <Radio className="h-4 w-4" />
              <span>Whisper Room</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="space-y-4">
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"
                  />
                  <p className="text-muted-foreground">Loading confessions...</p>
                </div>
              ) : confessions.length > 0 ? (
                confessions.map((confession, index) => (
                  <motion.div
                    key={confession.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <ConfessionCard 
                      confession={{
                        id: confession.id,
                        category: confession.category,
                        timestamp: new Date(confession.created_at).toLocaleString(),
                        reactions: confession.reactions || {},
                        hasAudio: confession.confession_type === 'voice',
                        content: confession.content,
                        audioUrl: confession.audio_url
                      }}
                    />
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="text-center py-20 space-y-8"
                >
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Heart className="h-20 w-20 text-primary mx-auto" style={{
                      filter: 'drop-shadow(0 0 20px hsl(var(--primary)))',
                    }} />
                  </motion.div>
                  <div className="space-y-4">
                    <h3 className="text-3xl font-bold text-foreground">No confessions yet..</h3>
                    <p className="text-xl text-muted-foreground">Be the first to open the circle.</p>
                    <p className="text-lg text-muted-foreground/80">
                      Tap the <span className="text-primary font-semibold">+</span> button below to<br />
                      share anonymously.
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="whisper" className="space-y-4">
            <WhisperRoom />
          </TabsContent>
        </Tabs>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default Index;