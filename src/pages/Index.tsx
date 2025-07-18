import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import RecordButton from "@/components/RecordButton";
import ConfessionCard from "@/components/ConfessionCard";
import { WhisperRoom } from "@/components/WhisperRoom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Mic, Radio, Settings, User, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const { user, signOut } = useAuth();
  const [confessions, setConfessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConfessions();
  }, []);

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
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between p-4 border-b border-border/50">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Silent Circle
          </h1>
          <p className="text-sm text-muted-foreground">Anonymous confessions</p>
        </div>
        
        <div className="flex items-center space-x-2">
          {user ? (
            <>
              <span className="text-sm text-muted-foreground">
                Welcome back
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4 mr-1" />
                Sign Out
              </Button>
            </>
          ) : (
            <Link to="/auth">
              <Button
                variant="outline"
                size="sm"
              >
                <User className="h-4 w-4 mr-1" />
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4">
        <Tabs defaultValue="feed" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="feed" className="flex items-center space-x-2">
              <Heart className="h-4 w-4" />
              <span>Feed</span>
            </TabsTrigger>
            <TabsTrigger value="whisper" className="flex items-center space-x-2">
              <Radio className="h-4 w-4" />
              <span>Whisper Room</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="space-y-4 px-4 pb-20">
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading confessions...</p>
                </div>
              ) : confessions.length > 0 ? (
                confessions.map((confession) => (
                  <ConfessionCard 
                    key={confession.id}
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
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No confessions yet. Be the first to share!</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="whisper" className="space-y-4 px-4 pb-20">
            <WhisperRoom />
          </TabsContent>
        </Tabs>
      </main>

      {user && <RecordButton />}
    </div>
  );
};

export default Index;