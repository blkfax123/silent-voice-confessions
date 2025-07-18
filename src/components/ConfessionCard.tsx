import { useState } from 'react';
import { Play, Pause, Heart, Laugh, Frown, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ConfessionCardProps {
  id: string;
  anonymousId: string;
  category: string;
  audioUrl: string;
  duration: number;
  reactions: {
    heart: number;
    laugh: number;
    sad: number;
    mind_blown: number;
  };
  isBoosted?: boolean;
  createdAt: string;
}

export function ConfessionCard({ 
  anonymousId, 
  category, 
  duration, 
  reactions,
  isBoosted = false,
  createdAt 
}: ConfessionCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [userReaction, setUserReaction] = useState<string | null>(null);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    // TODO: Implement actual audio playback when Supabase is connected
  };

  const handleReaction = (reaction: string) => {
    setUserReaction(userReaction === reaction ? null : reaction);
    // TODO: Save reaction to Supabase when connected
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const timeAgo = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffInHours = Math.floor((now.getTime() - past.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  return (
    <div className="confession-card group">
      {isBoosted && (
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-primary-glow" />
          <span className="text-xs text-primary-glow font-medium">Boosted</span>
        </div>
      )}
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="anonymous-tag">{anonymousId}</span>
          <span className="text-xs text-muted-foreground">{category}</span>
        </div>
        <span className="text-xs text-muted-foreground">{timeAgo(createdAt)}</span>
      </div>

      {/* Audio Player */}
      <div className="flex items-center gap-4 mb-4">
        <Button
          variant="ghost"
          size="icon"
          className="w-12 h-12 rounded-full bg-primary/10 hover:bg-primary/20"
          onClick={handlePlayPause}
        >
          {isPlaying ? (
            <Pause className="w-6 h-6 text-primary" />
          ) : (
            <Play className="w-6 h-6 text-primary ml-1" />
          )}
        </Button>

        {/* Waveform Visualization */}
        <div className="flex-1 flex items-center gap-1 h-8">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className={`waveform-bar w-1 ${
                isPlaying && (i % 3 === 0 || i % 5 === 0) 
                  ? 'animate-wave-bounce' 
                  : ''
              }`}
              style={{
                height: `${Math.random() * 20 + 10}px`,
                animationDelay: `${i * 0.1}s`
              }}
            />
          ))}
        </div>

        <span className="text-xs text-muted-foreground font-mono">
          {formatDuration(duration)}
        </span>
      </div>

      {/* Emoji Reactions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            className={`emoji-reaction ${userReaction === 'heart' ? 'bg-red-500/20' : ''}`}
            onClick={() => handleReaction('heart')}
          >
            <Heart className="w-4 h-4" />
            <span className="text-xs ml-1">{reactions.heart}</span>
          </button>
          
          <button
            className={`emoji-reaction ${userReaction === 'laugh' ? 'bg-yellow-500/20' : ''}`}
            onClick={() => handleReaction('laugh')}
          >
            <Laugh className="w-4 h-4" />
            <span className="text-xs ml-1">{reactions.laugh}</span>
          </button>
          
          <button
            className={`emoji-reaction ${userReaction === 'sad' ? 'bg-blue-500/20' : ''}`}
            onClick={() => handleReaction('sad')}
          >
            <Frown className="w-4 h-4" />
            <span className="text-xs ml-1">{reactions.sad}</span>
          </button>
          
          <button
            className={`emoji-reaction ${userReaction === 'mind_blown' ? 'bg-purple-500/20' : ''}`}
            onClick={() => handleReaction('mind_blown')}
          >
            <Zap className="w-4 h-4" />
            <span className="text-xs ml-1">{reactions.mind_blown}</span>
          </button>
        </div>

        <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-primary">
          Reply
        </Button>
      </div>
    </div>
  );
}