import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Play, Heart, Laugh, Frown, Zap } from "lucide-react";
import { ConfessionReactions } from './ConfessionReactions';
import { CommentsSection } from './CommentsSection';

interface ConfessionCardProps {
  confession: {
    id: string;
    category: string;
    created_at: string;
    content?: string;
    audio_url?: string;
  };
  currentUserId?: string;
}

const ConfessionCard = ({ confession, currentUserId }: ConfessionCardProps) => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="bg-card rounded-lg p-4 border border-border/50 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-xs text-muted-foreground">
            Anonymous {confession.audio_url ? 'Voice' : 'Text'} #{confession.id.slice(-4)}
          </span>
          <span className="text-xs text-muted-foreground">•</span>
          <span className="text-xs text-muted-foreground">
            {new Date(confession.created_at).toLocaleDateString()}
          </span>
        </div>
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
          {confession.category}
        </span>
      </div>

      <div className="space-y-3">
        {confession.audio_url ? (
          <div className="flex items-center space-x-2">
            <audio 
              controls 
              className="w-full h-10"
              src={confession.audio_url}
            />
          </div>
        ) : (
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-sm leading-relaxed">
              {confession.content && confession.content.length > 220
                ? `${confession.content.slice(0, 220)}…`
                : confession.content}
            </p>
            {confession.content && confession.content.length > 220 && (
              <div className="mt-3">
                <Link to={`/confession/${confession.id}`}>
                  <Button variant="secondary" size="sm">Read post</Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      <ConfessionReactions 
        confessionId={confession.id} 
        currentUserId={currentUserId}
      />
      
      <CommentsSection 
        confessionId={confession.id} 
        currentUserId={currentUserId}
      />
    </div>
  );
};

export default ConfessionCard;