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

  useEffect(() => {
    fetchConfessions();
    if (user) {
      checkUserProfile();
    }
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
    <div className="min-h-screen bg-background pb-20">
      {/* Gender Selection Modal */}
      {showGenderSelection && (
        <GenderSelection onComplete={() => setShowGenderSelection(false)} />
      )}

      <header className="flex flex-col items-center pt-8 pb-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center space-y-4"
        >
          <img 
            src="/src/assets/logo.svg" 
            alt="Silent Circle Logo" 
            className="w-16 h-16 glow-effect"
          />
          <Heart className="h-12 w-12 text-primary-glow glow-effect" />
        </motion.div>
      </header>

      <main className="max-w-4xl mx-auto p-4">
        <Tabs defaultValue="feed" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-card/50 backdrop-blur-md">
            <TabsTrigger value="feed" className="flex items-center space-x-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Heart className="h-4 w-4" />
              <span>Feed</span>
            </TabsTrigger>
            <TabsTrigger value="whisper" className="flex items-center space-x-2">
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
                  className="text-center py-16 space-y-6"
                >
                  <Heart className="h-16 w-16 text-primary-glow mx-auto glow-effect" />
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-foreground">No confessions yet..</h3>
                    <p className="text-lg text-muted-foreground">Be the first to open the circle.</p>
                    <p className="text-base text-muted-foreground">Tap the + button below to share anonymously.</p>
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