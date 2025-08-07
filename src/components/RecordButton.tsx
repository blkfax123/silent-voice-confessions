import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mic, Square, Play, Type, FileAudio } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const RecordButton = () => {
  const { user } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [textConfession, setTextConfession] = useState("");
  const [confessionType, setConfessionType] = useState<"text" | "voice">("voice");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = ["Love", "Guilt", "Career", "Dreams", "Random"];

  const startRecording = async () => {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start recording timer
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
      
      // TODO: Implement actual recording with MediaRecorder API
      // For now, we'll simulate the recording
      
      // Stop all tracks to release microphone
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: "Microphone access denied",
        description: "Please allow microphone access to record audio confessions.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    // Simulate audio blob creation
    const fakeAudioData = new Uint8Array(1024);
    setAudioBlob(new Blob([fakeAudioData], { type: 'audio/webm' }));
  };

  const compressAudio = async (audioBlob: Blob): Promise<Blob> => {
    // Create audio context for compression
    try {
      const audioContext = new AudioContext();
      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      // Reduce sample rate and bit depth for extreme compression
      const sampleRate = 8000; // Very low sample rate
      const channels = 1; // Mono
      const length = Math.floor(audioBuffer.duration * sampleRate);
      
      const offlineContext = new OfflineAudioContext(channels, length, sampleRate);
      const source = offlineContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(offlineContext.destination);
      source.start();
      
      const compressedBuffer = await offlineContext.startRendering();
      
      // Convert to very low quality to achieve target size
      const float32Array = compressedBuffer.getChannelData(0);
      const int16Array = new Int16Array(float32Array.length);
      
      // Convert float32 to int16 with compression
      for (let i = 0; i < float32Array.length; i++) {
        int16Array[i] = Math.max(-32768, Math.min(32767, float32Array[i] * 32767));
      }
      
      return new Blob([int16Array], { type: 'audio/wav' });
    } catch (error) {
      // If compression fails, return original blob
      return audioBlob;
    }
  };

  const submitConfession = async () => {
    if (!user) {
      toast({
        title: "Please sign in to share a confession",
        variant: "destructive"
      });
      return;
    }

    if (!selectedCategory) {
      toast({
        title: "Please select a category",
        variant: "destructive"
      });
      return;
    }

    if (confessionType === "voice" && !audioBlob) {
      toast({
        title: "No recording found",
        variant: "destructive"
      });
      return;
    }

    if (confessionType === "text" && !textConfession.trim()) {
      toast({
        title: "Please write your confession",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let audioUrl = null;
      
      if (confessionType === "voice" && audioBlob) {
        // Compress audio before upload
        const compressedAudio = await compressAudio(audioBlob);
        
        const fileName = `${user.id}/${Date.now()}-confession.wav`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('confessions-audio')
          .upload(fileName, compressedAudio);

        if (uploadError) throw uploadError;
        audioUrl = uploadData.path;
      }

      // Save confession to database
      const { error: insertError } = await supabase
        .from('confessions')
        .insert({
          user_id: user.id,
          content: confessionType === "text" ? textConfession : null,
          audio_url: audioUrl,
          category: selectedCategory,
          confession_type: confessionType
        });

      if (insertError) throw insertError;

      toast({
        title: "Confession shared anonymously",
        description: `Category: ${selectedCategory}`
      });

      // Reset state
      setShowDialog(false);
      setSelectedCategory("");
      setAudioBlob(null);
      setTextConfession("");
      setRecordingTime(0);
    } catch (error: any) {
      toast({
        title: "Failed to share confession",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <Button
        onClick={() => {
          if (!user) {
            toast({
              title: "Please sign in to share a confession",
              variant: "destructive"
            });
            return;
          }
          setShowDialog(true);
        }}
        size="lg"
        className="rounded-full h-16 w-16 bg-primary hover:bg-primary/90 shadow-lg fixed bottom-6 right-6 z-50"
      >
        <Mic className="h-8 w-8" />
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Your Confession</DialogTitle>
          </DialogHeader>
          
          {isRecording ? (
            <div className="space-y-6 text-center">
              <div className="text-2xl font-mono text-primary">
                {formatTime(recordingTime)}
              </div>
              
              {/* Animated waveform */}
              <div className="flex items-center justify-center space-x-1 h-16">
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-primary rounded-full animate-pulse"
                    style={{
                      height: `${Math.random() * 60 + 10}px`,
                      animationDelay: `${i * 0.1}s`
                    }}
                  />
                ))}
              </div>
              
              <Button 
                onClick={stopRecording}
                size="lg"
                className="bg-destructive hover:bg-destructive/90"
              >
                <Square className="mr-2 h-5 w-5" />
                Stop Recording
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <Tabs value={confessionType} onValueChange={(value) => setConfessionType(value as "text" | "voice")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="text" className="flex items-center gap-2">
                    <Type className="h-4 w-4" />
                    Text
                  </TabsTrigger>
                  <TabsTrigger value="voice" className="flex items-center gap-2">
                    <FileAudio className="h-4 w-4" />
                    Voice
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="text" className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Your Confession</label>
                    <Textarea 
                      placeholder="Share your thoughts anonymously..."
                      value={textConfession}
                      onChange={(e) => setTextConfession(e.target.value)}
                      className="min-h-32"
                      maxLength={500}
                    />
                    <div className="text-xs text-muted-foreground text-right">
                      {textConfession.length}/500 characters
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="voice" className="space-y-4">
                  {!audioBlob ? (
                    <div className="text-center py-8">
                      <Button 
                        onClick={startRecording}
                        disabled={isRecording}
                        size="lg"
                        className="rounded-full h-16 w-16"
                      >
                        <Mic className="h-8 w-8" />
                      </Button>
                      <p className="text-sm text-muted-foreground mt-4">
                        Tap to start recording (max 60 seconds)
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Your Recording</label>
                      <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
                        <Play className="h-4 w-4" />
                        <span className="text-sm">Recording ({formatTime(recordingTime)})</span>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              <div className="space-y-4">
                <label className="text-sm font-medium">Category</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={submitConfession}
                  className="flex-1"
                  disabled={
                    !selectedCategory || 
                    (confessionType === "voice" && !audioBlob) ||
                    (confessionType === "text" && !textConfession.trim()) ||
                    isSubmitting
                  }
                >
                  {isSubmitting ? "Sharing..." : "Share Anonymously"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RecordButton;