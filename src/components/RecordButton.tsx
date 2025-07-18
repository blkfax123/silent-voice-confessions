import { useState } from 'react';
import { Mic, Square, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const categories = ['Love', 'Guilt', 'Career', 'Dreams', 'Random'];

export function RecordButton() {
  const [isRecording, setIsRecording] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const startRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    setShowDialog(true);
    
    // TODO: Implement actual audio recording
    // For now, simulate recording timer
    const timer = setInterval(() => {
      setRecordingTime(prev => {
        if (prev >= 60) {
          stopRecording();
          clearInterval(timer);
          return 60;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const stopRecording = () => {
    setIsRecording(false);
    // TODO: Stop actual audio recording and get blob
  };

  const submitConfession = () => {
    if (!selectedCategory || !audioBlob) return;
    
    // TODO: Upload to Supabase when connected
    console.log('Submitting confession:', { category: selectedCategory, duration: recordingTime });
    
    // Reset state
    setShowDialog(false);
    setSelectedCategory('');
    setAudioBlob(null);
    setRecordingTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <Button
        className={`record-button fixed bottom-6 right-6 w-16 h-16 rounded-full z-50 ${
          isRecording ? 'recording' : ''
        }`}
        onClick={isRecording ? stopRecording : startRecording}
        size="icon"
      >
        {isRecording ? (
          <Square className="w-6 h-6" />
        ) : (
          <Mic className="w-6 h-6" />
        )}
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="gradient-text">
              {isRecording ? 'Recording...' : 'Share Your Confession'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {isRecording ? (
              <div className="text-center space-y-4">
                <div className="w-24 h-24 mx-auto bg-record-pulse/20 rounded-full flex items-center justify-center animate-pulse-record">
                  <Mic className="w-8 h-8 text-record-pulse" />
                </div>
                
                <div className="space-y-2">
                  <div className="text-2xl font-mono text-primary">
                    {formatTime(recordingTime)} / 1:00
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Speak your truth anonymously
                  </div>
                </div>

                {/* Recording Waveform */}
                <div className="flex justify-center items-center gap-1 h-12">
                  {[...Array(15)].map((_, i) => (
                    <div
                      key={i}
                      className="waveform-bar w-2 bg-record-pulse animate-wave-bounce"
                      style={{
                        height: `${Math.random() * 30 + 10}px`,
                        animationDelay: `${i * 0.1}s`
                      }}
                    />
                  ))}
                </div>

                <Button 
                  variant="outline" 
                  onClick={stopRecording}
                  className="bg-destructive/10 border-destructive/30 hover:bg-destructive/20"
                >
                  <Square className="w-4 h-4 mr-2" />
                  Stop Recording
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-4">
                    Your confession has been recorded ({formatTime(recordingTime)})
                  </div>
                  
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="bg-muted border-border">
                      <SelectValue placeholder="Choose a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-3 justify-center">
                  <Button
                    variant="outline"
                    onClick={() => setShowDialog(false)}
                    className="border-border"
                  >
                    Cancel
                  </Button>
                  
                  <Button
                    onClick={submitConfession}
                    disabled={!selectedCategory}
                    className="bg-primary hover:bg-primary-glow"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Share Anonymously
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}