import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, Heart, Laugh, Frown, Zap } from "lucide-react";

interface ConfessionCardProps {
  confession: {
    id: string;
    category: string;
    timestamp: string;
    reactions: Record<string, number>;
    hasAudio: boolean;
    content?: string;
    audioUrl?: string;
  };
}

const ConfessionCard = ({ confession }: ConfessionCardProps) => {
  const [userReaction, setUserReaction] = useState<string | null>(null);

  const handleReaction = (reaction: string) => {
    setUserReaction(userReaction === reaction ? null : reaction);
    // TODO: Save reaction to database
  };

  return (
    <div className="bg-card rounded-lg p-4 border border-border/50 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-xs text-muted-foreground">
            Anonymous {confession.hasAudio ? 'Voice' : 'Text'} #{confession.id.slice(-4)}
          </span>
          <span className="text-xs text-muted-foreground">•</span>
          <span className="text-xs text-muted-foreground">{confession.timestamp}</span>
        </div>
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
          {confession.category}
        </span>
      </div>

      <div className="space-y-3">
        {confession.hasAudio ? (
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm"
              className="p-2 rounded-full hover:bg-primary/10"
            >
              <Play className="h-5 w-5 text-primary" />
            </Button>
            <div className="flex-1 h-8 bg-muted rounded-full flex items-center px-3">
              <div className="flex space-x-1">
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className="w-0.5 bg-primary/60 rounded-full"
                    style={{ height: `${Math.random() * 20 + 5}px` }}
                  />
                ))}
              </div>
            </div>
            <span className="text-xs text-muted-foreground">0:43</span>
          </div>
        ) : (
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-sm leading-relaxed">{confession.content}</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 px-2 rounded-full ${userReaction === 'heart' ? 'bg-red-500/20 text-red-500' : ''}`}
            onClick={() => handleReaction('heart')}
          >
            <Heart className="h-4 w-4 mr-1" />
            <span className="text-xs">{confession.reactions.heart || 0}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className={`h-8 px-2 rounded-full ${userReaction === 'laugh' ? 'bg-yellow-500/20 text-yellow-500' : ''}`}
            onClick={() => handleReaction('laugh')}
          >
            <Laugh className="h-4 w-4 mr-1" />
            <span className="text-xs">{confession.reactions.laugh || 0}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className={`h-8 px-2 rounded-full ${userReaction === 'sad' ? 'bg-blue-500/20 text-blue-500' : ''}`}
            onClick={() => handleReaction('sad')}
          >
            <Frown className="h-4 w-4 mr-1" />
            <span className="text-xs">{confession.reactions.sad || 0}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className={`h-8 px-2 rounded-full ${userReaction === 'wow' ? 'bg-purple-500/20 text-purple-500' : ''}`}
            onClick={() => handleReaction('wow')}
          >
            <Zap className="h-4 w-4 mr-1" />
            <span className="text-xs">{confession.reactions.wow || 0}</span>
          </Button>
        </div>

        <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
          Reply
        </Button>
      </div>
    </div>
  );
};

export default ConfessionCard;