import { useState } from "react";
import { BottomNavigation } from "@/components/BottomNavigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Mic, Type, Send, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import RecordButton from "@/components/RecordButton";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const Post = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [postType, setPostType] = useState<'text' | 'voice'>('text');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);

  const categories = [
    'relationships', 'work', 'family', 'friends', 'anxiety', 'depression',
    'success', 'failure', 'dreams', 'fears', 'secrets', 'love', 'betrayal', 'other'
  ];

  const handleTextPost = async () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be logged in to post.",
        variant: "destructive",
      });
      return;
    }

    if (!content.trim() || !category) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('confessions')
        .insert({
          user_id: user.id,
          content: content.trim(),
          category,
          confession_type: 'text'
        });

      if (error) throw error;

      toast({
        title: "Confession posted!",
        description: "Your anonymous confession has been shared.",
      });

      setContent('');
      setCategory('');
      navigate('/');
    } catch (error) {
      console.error('Error posting confession:', error);
      toast({
        title: "Error",
        description: "Failed to post confession. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold gradient-text">Share Your Story</h1>
          <p className="text-muted-foreground">Express yourself anonymously and safely</p>
        </div>

        {/* Post Type Selector */}
        <Card>
          <CardHeader>
            <CardTitle>Choose Your Format</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <motion.button
                onClick={() => setPostType('text')}
                className={`p-4 rounded-xl border transition-all duration-200 ${
                  postType === 'text'
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-primary/50"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Type className="h-6 w-6 mx-auto mb-2" />
                <span className="text-sm font-medium">Text</span>
                <Badge variant="secondary" className="mt-1 text-xs">Free</Badge>
              </motion.button>

              <motion.button
                onClick={() => setPostType('voice')}
                className={`p-4 rounded-xl border transition-all duration-200 ${
                  postType === 'voice'
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-primary/50"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Mic className="h-6 w-6 mx-auto mb-2" />
                <span className="text-sm font-medium">Voice</span>
                <Badge variant="secondary" className="mt-1 text-xs">Free</Badge>
              </motion.button>
            </div>
          </CardContent>
        </Card>

        {/* Content Creation */}
        <AnimatePresence mode="wait">
          {postType === 'text' ? (
            <motion.div
              key="text-post"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Type className="h-5 w-5" />
                    <span>Write Your Confession</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Category Selector */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Category</label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Text Area */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Your Confession</label>
                    <Textarea
                      placeholder="Share what's on your mind... (your identity remains completely anonymous)"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      rows={6}
                      className="resize-none"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {content.length}/500 characters
                    </p>
                  </div>

                  {/* Submit Button */}
                  <Button
                    onClick={handleTextPost}
                    disabled={loading || !content.trim() || !category}
                    className="w-full"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {loading ? "Posting..." : "Share Anonymously"}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="voice-post"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Mic className="h-5 w-5" />
                    <span>Record Your Confession</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      Tap the record button below to start recording your voice confession
                    </p>
                    <div className="text-xs text-muted-foreground">
                      Your voice will be compressed and anonymized for privacy
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Anonymous Notice */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Heart className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-medium text-primary">Complete Anonymity</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Your identity is never revealed. All confessions are posted anonymously 
                  to create a safe space for authentic sharing.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Voice Recording Button (only for voice posts) */}
      {postType === 'voice' && user && <RecordButton />}

      <BottomNavigation />
    </div>
  );
};

export default Post;