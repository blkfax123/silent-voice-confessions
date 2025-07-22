import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart, Laugh, Angry, ThumbsUp, ThumbsDown, Frown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ChatReactionsProps {
  messageId: string;
  reactions?: { [key: string]: number };
}

const REACTION_EMOJIS = [
  { icon: Heart, key: 'heart', label: '❤️' },
  { icon: ThumbsUp, key: 'thumbs_up', label: '👍' },
  { icon: ThumbsDown, key: 'thumbs_down', label: '👎' },
  { icon: Laugh, key: 'laugh', label: '😂' },
  { icon: Frown, key: 'sad', label: '😢' },
  { icon: Angry, key: 'angry', label: '😡' }
];

export const ChatReactions = ({ messageId, reactions = {} }: ChatReactionsProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const handleReaction = async (reactionKey: string) => {
    setIsUpdating(true);
    try {
      // Update reaction count in the database
      const currentCount = reactions[reactionKey] || 0;
      const newReactions = {
        ...reactions,
        [reactionKey]: currentCount + 1
      };

      const { error } = await supabase
        .from('chat_messages')
        .update({ reactions: newReactions })
        .eq('id', messageId);

      if (error) throw error;

      toast({
        title: "Reaction added!",
        description: "Your reaction has been added to the message."
      });
    } catch (error) {
      console.error('Error adding reaction:', error);
      toast({
        title: "Error",
        description: "Failed to add reaction",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {REACTION_EMOJIS.map(({ icon: Icon, key, label }) => (
        <Button
          key={key}
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-xs"
          onClick={() => handleReaction(key)}
          disabled={isUpdating}
        >
          <span className="mr-1">{label}</span>
          {reactions[key] && <span>{reactions[key]}</span>}
        </Button>
      ))}
    </div>
  );
};