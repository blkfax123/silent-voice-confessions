import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Heart, Laugh, Angry, ThumbsUp, ThumbsDown, Frown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ConfessionReactionsProps {
  confessionId: string;
  currentUserId?: string;
}

const REACTION_EMOJIS = [
  { icon: Heart, key: 'heart', label: '❤️' },
  { icon: ThumbsUp, key: 'thumbs_up', label: '👍' },
  { icon: ThumbsDown, key: 'thumbs_down', label: '👎' },
  { icon: Laugh, key: 'laugh', label: '😂' },
  { icon: Frown, key: 'sad', label: '😢' },
  { icon: Angry, key: 'angry', label: '😡' }
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
    <div className="flex flex-wrap gap-1 mt-3">
      {REACTION_EMOJIS.map(({ icon: Icon, key, label }) => {
        const count = reactions[key] || 0;
        const hasReacted = userReactions.includes(key);
        
        return (
          <Button
            key={key}
            variant={hasReacted ? "default" : "ghost"}
            size="sm"
            className="h-8 px-2 text-xs"
            onClick={() => handleReaction(key)}
            disabled={isUpdating}
          >
            <span className="mr-1">{label}</span>
            {count > 0 && <span>{count}</span>}
          </Button>
        );
      })}
    </div>
  );
};