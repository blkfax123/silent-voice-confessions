import { useState } from "react";
import { BottomNavigation } from "@/components/BottomNavigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Mic, Type, Send, CircleHelp } from "lucide-react";
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
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);

  const categories = [
    'relationships', 'work', 'family', 'friends', 'anxiety', 'depression',
    'success', 'failure', 'dreams', 'fears', 'secrets', 'love', 'betrayal', 'other'
  ];

  const handleTextPost = async () => {
    if (!user) {
      navigate('/auth');
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
          title: title.trim() || null,
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

                  {/* Title (Optional) */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Title (optional)</label>
                    <Input
                      placeholder="Give your confession a title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value.slice(0, 60))}
                      maxLength={60}
                      className="bg-muted/50"
                    />
                    <p className="text-xs text-muted-foreground mt-1">{title.length}/60</p>
                  </div>

                  {/* Text Area */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Your Confession</label>
                    <Textarea
                      placeholder="Share what's on your mind... (your identity remains completely anonymous)"
                      value={content}
                      onChange={(e) => setContent(e.target.value.slice(0, 500))}
                      rows={6}
                      maxLength={500}
                      className="resize-none"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {content.length}/500 characters
                    </p>
                  </div>

                  {/* Submit & Info */}
                  <div className="flex items-center justify-between gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button type="button" variant="ghost" size="icon" aria-label="Anonymity info">
                          <CircleHelp className="h-5 w-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          Complete Anonymity: Your identity is never revealed. All confessions are posted
                          anonymously to create a safe space for authentic sharing.
                        </p>
                      </TooltipContent>
                    </Tooltip>

                    <motion.div whileTap={{ scale: 0.98 }} className="flex-1">
                      <Button
                        onClick={handleTextPost}
                        disabled={loading || !content.trim() || !category}
                        className="w-full"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        {loading ? "Posting..." : "Share Anonymously"}
                      </Button>
                    </motion.div>
                  </div>
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
                  {!user ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">
                        Please sign in to record voice confessions
                      </p>
                      <Button onClick={() => navigate('/auth')} variant="outline">
                        Sign In
                      </Button>
                    </div>
                  ) : (
                    <>
                      {/* Category Selector for Voice */}
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
                      
                      <div className="text-center py-8">
                        <div className="space-y-4">
                          <div className="bg-primary/10 border border-primary/20 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
                            <Mic className="h-8 w-8 text-primary" />
                          </div>
                          <p className="text-muted-foreground">
                            Tap the floating record button to start recording
                          </p>
                          <div className="text-xs text-muted-foreground">
                            Your voice will be compressed and anonymized for privacy
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* Voice Recording Button (only for voice posts and when user is logged in) */}
      {postType === 'voice' && user && (
        <div className="fixed bottom-24 right-4">
          <RecordButton />
        </div>
      )}

      <BottomNavigation />
    </div>
  );
};

export default Post;