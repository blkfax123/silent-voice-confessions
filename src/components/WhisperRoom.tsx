import { useState } from 'react';
import { Play, Pause, SkipForward, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function WhisperRoom() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentConfession, setCurrentConfession] = useState({
    id: 'whisper_001',
    anonymousId: '#Whisper3021',
    category: 'Dreams',
    duration: 45
  });

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    // TODO: Implement actual audio playback
  };

  const handleSkip = () => {
    // TODO: Load next random confession
    setCurrentConfession({
      id: 'whisper_002',
      anonymousId: '#Whisper4728',
      category: 'Love',
      duration: 52
    });
  };

  return (
    <Card className="p-6 bg-whisper/20 border-whisper/30">
      <div className="text-center space-y-6">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold gradient-text">Whisper Room</h3>
          <p className="text-sm text-muted-foreground">
            Listen to anonymous confessions continuously
          </p>
        </div>

        {/* Now Playing */}
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-3">
            <span className="anonymous-tag">{currentConfession.anonymousId}</span>
            <span className="text-xs text-muted-foreground">{currentConfession.category}</span>
          </div>

          {/* Audio Visualization */}
          <div className="relative">
            <div className="w-32 h-32 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
              <Volume2 className={`w-8 h-8 text-primary ${isPlaying ? 'animate-pulse' : ''}`} />
            </div>
            
            {isPlaying && (
              <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping" />
            )}
          </div>

          {/* Ambient Waveform */}
          <div className="flex justify-center items-center gap-1 h-8 opacity-60">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className={`waveform-bar w-1 bg-primary ${
                  isPlaying ? 'animate-wave-bounce' : ''
                }`}
                style={{
                  height: `${Math.random() * 20 + 8}px`,
                  animationDelay: `${i * 0.15}s`
                }}
              />
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full border-primary/30 hover:bg-primary/10"
            onClick={handleSkip}
          >
            <SkipForward className="w-4 h-4" />
          </Button>

          <Button
            className="w-14 h-14 rounded-full bg-primary hover:bg-primary-glow"
            onClick={handlePlayPause}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6 ml-1" />
            )}
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="rounded-full border-primary/30 hover:bg-primary/10"
            onClick={handleSkip}
          >
            <SkipForward className="w-4 h-4" />
          </Button>
        </div>

        <div className="text-xs text-muted-foreground">
          Endless stream of anonymous confessions
        </div>
      </div>
    </Card>
  );
}