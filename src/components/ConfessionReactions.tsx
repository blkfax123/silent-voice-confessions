import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Heart, Smile, Frown, ThumbsUp, Flame, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface ConfessionReactionsProps {
  confessionId: string;
  currentUserId?: string;
}

const REACTION_EMOJIS = [
  { icon: Heart, key: 'heart', emoji: '❤️', color: 'text-red-500', bgColor: 'bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40' },
  { icon: ThumbsUp, key: 'thumbs_up', emoji: '👍', color: 'text-blue-500', bgColor: 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/20 dark:hover:bg-blue-950/40' },
  { icon: Smile, key: 'laugh', emoji: '😂', color: 'text-yellow-500', bgColor: 'bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-950/20 dark:hover:bg-yellow-950/40' },
  { icon: Frown, key: 'sad', emoji: '😢', color: 'text-cyan-500', bgColor: 'bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-950/20 dark:hover:bg-cyan-950/40' },
  { icon: Flame, key: 'fire', emoji: '🔥', color: 'text-orange-500', bgColor: 'bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/20 dark:hover:bg-orange-950/40' },
  { icon: Zap, key: 'shock', emoji: '😱', color: 'text-purple-500', bgColor: 'bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/20 dark:hover:bg-purple-950/40' }
];

export const ConfessionReactions = ({ confessionId, currentUserId }: ConfessionReactionsProps) => {
  const [reactions, setReactions] = useState<{ [key: string]: number }>({});
  const [userReactions, setUserReactions] = useState<string[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchReactions();
    if (currentUserId) {
      fetchUserReactions();
    }
  }, [confessionId, currentUserId]);

  const fetchReactions = async () => {
    try {
      const { data, error } = await supabase
        .from('user_reactions')
        .select('reaction_type')
        .eq('confession_id', confessionId);

      if (error) throw error;

      const reactionCounts: { [key: string]: number } = {};
      data.forEach((reaction) => {
        reactionCounts[reaction.reaction_type] = (reactionCounts[reaction.reaction_type] || 0) + 1;
      });

      setReactions(reactionCounts);
    } catch (error) {
      console.error('Error fetching reactions:', error);
    }
  };

  const fetchUserReactions = async () => {
    try {
      const { data, error } = await supabase
        .from('user_reactions')
        .select('reaction_type')
        .eq('confession_id', confessionId)
        .eq('user_id', currentUserId);

      if (error) throw error;

      setUserReactions(data.map(r => r.reaction_type));
    } catch (error) {
      console.error('Error fetching user reactions:', error);
    }
  };

  const handleReaction = async (reactionKey: string) => {
    if (!currentUserId) {
      toast({
        title: "Login required",
        description: "Please login to react to confessions",
        variant: "destructive"
      });
      return;
    }

    setIsUpdating(true);
    try {
      const hasReacted = userReactions.includes(reactionKey);

      if (hasReacted) {
        // Remove reaction
        const { error } = await supabase
          .from('user_reactions')
          .delete()
          .eq('confession_id', confessionId)
          .eq('user_id', currentUserId)
          .eq('reaction_type', reactionKey);

        if (error) throw error;

        setUserReactions(prev => prev.filter(r => r !== reactionKey));
        setReactions(prev => ({
          ...prev,
          [reactionKey]: Math.max((prev[reactionKey] || 0) - 1, 0)
        }));
      } else {
        // Add reaction
        const { error } = await supabase
          .from('user_reactions')
          .insert({
            confession_id: confessionId,
            user_id: currentUserId,
            reaction_type: reactionKey
          });

        if (error) throw error;

        setUserReactions(prev => [...prev, reactionKey]);
        setReactions(prev => ({
          ...prev,
          [reactionKey]: (prev[reactionKey] || 0) + 1
        }));
      }
    } catch (error) {
      console.error('Error updating reaction:', error);
      toast({
        title: "Error",
        description: "Failed to update reaction",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 pt-4 border-t border-border/50">
      <div className="flex items-center text-xs text-muted-foreground mb-2 w-full">
        <span>Reactions</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {REACTION_EMOJIS.map(({ icon: Icon, key, emoji, color, bgColor }) => {
          const count = reactions[key] || 0;
          const hasReacted = userReactions.includes(key);
          
          return (
            <motion.div
              key={key}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                variant="ghost"
                size="sm"
                className={`
                  relative h-9 px-3 rounded-full border transition-all duration-200 group
                  ${hasReacted 
                    ? `${bgColor} border-current ${color} shadow-sm` 
                    : 'bg-muted/30 hover:bg-muted/50 border-border/50 text-muted-foreground hover:text-foreground'
                  }
                `}
                onClick={() => handleReaction(key)}
                disabled={isUpdating}
              >
                <motion.div
                  className="flex items-center gap-1.5"
                  animate={hasReacted ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  <span className="text-sm leading-none">{emoji}</span>
                  <AnimatePresence mode="wait">
                    {count > 0 && (
                      <motion.span
                        key={count}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="text-xs font-medium leading-none min-w-[12px] text-center"
                      >
                        {count}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
                
                {/* Ripple effect on click */}
                {hasReacted && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-current opacity-30"
                    initial={{ scale: 1, opacity: 0.3 }}
                    animate={{ scale: 1.2, opacity: 0 }}
                    transition={{ duration: 0.4 }}
                  />
                )}
              </Button>
            </motion.div>
          );
        })}
      </div>
      
      {/* Show total reactions count if any exist */}
      {Object.values(reactions).some(count => count > 0) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full mt-2 text-xs text-muted-foreground"
        >
          {Object.values(reactions).reduce((total, count) => total + count, 0)} reaction{Object.values(reactions).reduce((total, count) => total + count, 0) !== 1 ? 's' : ''}
        </motion.div>
      )}
    </div>
  );
};