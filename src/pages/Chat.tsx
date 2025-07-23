import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { BottomNavigation } from "@/components/BottomNavigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  MessageCircle, 
  Users, 
  Crown, 
  Shuffle, 
  Loader2, 
  Send, 
  Image as ImageIcon, 
  Download, 
  Smile, 
  Heart, 
  ThumbsUp, 
  Laugh, 
  Angry, 
  X,
  Upload,
  Moon,
  Sun
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Chat = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Core states
  const [userProfile, setUserProfile] = useState<any>(null);
  const [activeRooms, setActiveRooms] = useState<any[]>([]);
  const [currentRoom, setCurrentRoom] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [waitingForMatch, setWaitingForMatch] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);
  
  // Chat states
  const [messageText, setMessageText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Real-time subscriptions
  const [messagesSubscription, setMessagesSubscription] = useState<any>(null);
  const [typingSubscription, setTypingSubscription] = useState<any>(null);

  const emojis = ['😀', '😂', '😍', '🥰', '😊', '🤔', '😮', '😢', '😡', '👍', '👎', '❤️', '🔥', '⭐'];
  const reactions = [
    { icon: Heart, color: 'text-red-500', type: 'heart' },
    { icon: ThumbsUp, color: 'text-blue-500', type: 'like' },
    { icon: Laugh, color: 'text-yellow-500', type: 'laugh' },
    { icon: Angry, color: 'text-red-600', type: 'angry' }
  ];

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchActiveRooms();
      fetchOnlineCount();
      
      // Setup real-time presence
      const channel = supabase.channel('online-users')
        .on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState();
          setOnlineCount(Object.keys(state).length);
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
          console.log('User joined:', key, newPresences);
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
          console.log('User left:', key, leftPresences);
        });

      channel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ user_id: user.id, online_at: new Date().toISOString() });
        }
      });

      return () => {
        channel.unsubscribe();
      };
    }
  }, [user]);

  useEffect(() => {
    if (currentRoom) {
      fetchMessages();
      setupMessageSubscription();
      setupTypingSubscription();
    }
    return () => {
      cleanupSubscriptions();
    };
  }, [currentRoom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const setupMessageSubscription = () => {
    if (!currentRoom) return;
    
    const subscription = supabase
      .channel(`messages:${currentRoom.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${currentRoom.id}`
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new]);
        }
      )
      .subscribe();

    setMessagesSubscription(subscription);
  };

  const setupTypingSubscription = () => {
    if (!currentRoom) return;
    
    const subscription = supabase
      .channel(`typing:${currentRoom.id}`)
      .on('broadcast', { event: 'typing' }, (payload) => {
        if (payload.payload.user_id !== user.id) {
          setPartnerTyping(payload.payload.is_typing);
        }
      })
      .subscribe();

    setTypingSubscription(subscription);
  };

  const cleanupSubscriptions = () => {
    if (messagesSubscription) {
      supabase.removeChannel(messagesSubscription);
      setMessagesSubscription(null);
    }
    if (typingSubscription) {
      supabase.removeChannel(typingSubscription);
      setTypingSubscription(null);
    }
  };

  const fetchOnlineCount = async () => {
    try {
      const { count, error } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gt('last_seen', new Date(Date.now() - 5 * 60 * 1000).toISOString());
      
      if (error) throw error;
      setOnlineCount(count || 0);
    } catch (error) {
      console.error('Error fetching online count:', error);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchActiveRooms = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_rooms')
        .select('*')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setActiveRooms(data || []);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const fetchMessages = async () => {
    if (!currentRoom) return;
    
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('room_id', currentRoom.id)
        .order('sent_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const startRandomChat = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    setLoading(true);
    setWaitingForMatch(true);
    
    try {
      // First check for existing waiting rooms
      const { data: waitingRooms, error: waitingError } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('room_type', 'random')
        .eq('is_active', false)
        .is('user2_id', null)
        .neq('user1_id', user.id)
        .order('created_at', { ascending: true });

      if (!waitingError && waitingRooms && waitingRooms.length > 0) {
        // Join the first available waiting room
        const waitingRoom = waitingRooms[0];
        const { data: joinedRoom, error: joinError } = await supabase
          .from('chat_rooms')
          .update({
            user2_id: user.id,
            is_active: true
          })
          .eq('id', waitingRoom.id)
          .select()
          .single();

        if (joinError) throw joinError;

        setCurrentRoom(joinedRoom);
        setWaitingForMatch(false);
        toast({
          title: "Chat started!",
          description: "You've been connected with a stranger.",
        });
      } else {
        // Create new waiting room
        const { data: newRoom, error: roomError } = await supabase
          .from('chat_rooms')
          .insert({
            user1_id: user.id,
            room_type: 'random',
            is_active: false
          })
          .select()
          .single();

        if (roomError) throw roomError;

        // Wait for someone to join
        let attempts = 0;
        const maxAttempts = 30; // 30 seconds
        
        const checkForPartner = async () => {
          const { data: updatedRoom, error } = await supabase
            .from('chat_rooms')
            .select('*')
            .eq('id', newRoom.id)
            .single();

          if (!error && updatedRoom.user2_id && updatedRoom.is_active) {
            setCurrentRoom(updatedRoom);
            setWaitingForMatch(false);
            toast({
              title: "Chat started!",
              description: "You've been connected with a stranger.",
            });
            return true;
          }
          return false;
        };

        const waitInterval = setInterval(async () => {
          attempts++;
          const found = await checkForPartner();
          
          if (found || attempts >= maxAttempts) {
            clearInterval(waitInterval);
            if (!found) {
              // Clean up waiting room if no match
              await supabase
                .from('chat_rooms')
                .delete()
                .eq('id', newRoom.id);
              
              setWaitingForMatch(false);
              toast({
                title: "No match found",
                description: "Try again later when more users are online.",
              });
            }
          }
        }, 1000);
      }

      fetchActiveRooms();
    } catch (error) {
      console.error('Error starting chat:', error);
      setWaitingForMatch(false);
      toast({
        title: "Error",
        description: "Failed to start chat. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const startGenderSpecificChat = async (targetGender: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    setLoading(true);
    try {
      const hasSubscription = await checkSubscription();
      if (!hasSubscription) {
        navigate('/subscription');
        return;
      }

      const { data: availableUsers, error } = await supabase
        .from('users')
        .select('id')
        .eq('gender', targetGender)
        .neq('id', user.id)
        .gte('last_seen', new Date(Date.now() - 10 * 60 * 1000).toISOString())
        .limit(10);

      if (error) throw error;

      if (!availableUsers || availableUsers.length === 0) {
        toast({
          title: "No users available",
          description: `No ${targetGender} users are currently online.`,
        });
        return;
      }

      const randomUser = availableUsers[Math.floor(Math.random() * availableUsers.length)];
      const { data: newRoom, error: roomError } = await supabase
        .from('chat_rooms')
        .insert({
          user1_id: user.id,
          user2_id: randomUser.id,
          room_type: 'specific_gender',
          target_gender: targetGender,
          is_active: true
        })
        .select()
        .single();

      if (roomError) throw roomError;

      setCurrentRoom(newRoom);
      toast({
        title: "Chat started!",
        description: `Connected with a ${targetGender} user.`,
      });

      fetchActiveRooms();
    } catch (error) {
      console.error('Error starting gender-specific chat:', error);
      toast({
        title: "Error",
        description: "Failed to start chat. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkSubscription = async () => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .gt('expires_at', new Date().toISOString())
        .single();

      return !error && data;
    } catch {
      return false;
    }
  };

  const sendMessage = async () => {
    if (!messageText.trim() && !selectedImage) return;
    if (!currentRoom) return;

    try {
      let imageUrl = null;
      
      if (selectedImage) {
        const fileExt = selectedImage.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('chat-images')
          .upload(fileName, selectedImage);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('chat-images')
          .getPublicUrl(fileName);

        imageUrl = publicUrl;
      }

      const { data: message, error } = await supabase
        .from('chat_messages')
        .insert({
          room_id: currentRoom.id,
          sender_id: user.id,
          message_text: messageText || null,
          audio_url: imageUrl,
          message_type: imageUrl ? 'image' : 'text'
        })
        .select()
        .single();

      if (error) throw error;

      setMessageText("");
      setSelectedImage(null);
      setImagePreview(null);
      
      // Auto-clear messages after 24 hours
      setTimeout(async () => {
        await supabase
          .from('chat_messages')
          .delete()
          .eq('id', message.id);
      }, 24 * 60 * 60 * 1000);

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleTyping = (value: string) => {
    setMessageText(value);
    
    if (!isTyping && value.length > 0) {
      setIsTyping(true);
      broadcastTyping(true);
      
      // Stop typing after 3 seconds of inactivity
      setTimeout(() => {
        setIsTyping(false);
        broadcastTyping(false);
      }, 3000);
    }
  };

  const broadcastTyping = async (typing: boolean) => {
    if (!currentRoom || !typingSubscription) return;
    
    await typingSubscription.send({
      type: 'broadcast',
      event: 'typing',
      payload: {
        user_id: user.id,
        is_typing: typing
      }
    });
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };


  const leaveChat = async () => {
    if (!currentRoom) return;
    
    try {
      await supabase
        .from('chat_rooms')
        .update({ is_active: false })
        .eq('id', currentRoom.id);
      
      setCurrentRoom(null);
      setMessages([]);
      cleanupSubscriptions();
      fetchActiveRooms();
      
      toast({
        title: "Chat ended",
        description: "You have left the chat room.",
      });
    } catch (error) {
      console.error('Error leaving chat:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const getUsernameColor = (subscriptionType: string) => {
    switch (subscriptionType) {
      case 'weekly':
        return 'text-green-400';
      case 'monthly':
        return 'bg-gradient-to-r from-green-400 to-purple-400 bg-clip-text text-transparent';
      case 'yearly':
        return 'bg-gradient-to-r from-green-400 via-purple-400 via-yellow-400 to-pink-400 bg-clip-text text-transparent';
      default:
        return 'text-foreground';
    }
  };

  if (currentRoom) {
    return (
      <div className={`min-h-screen ${darkMode ? 'dark' : ''} bg-background pb-20`}>
        {/* Chat Header */}
        <div className="sticky top-0 bg-background/80 backdrop-blur border-b p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={() => setCurrentRoom(null)}>
              ← Back
            </Button>
            <div>
              <p className="font-medium">
                {currentRoom.room_type === 'random' ? 'Random Chat' : `${currentRoom.target_gender} Chat`}
              </p>
              {partnerTyping && (
                <p className="text-xs text-muted-foreground animate-pulse">
                  Partner is typing...
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={leaveChat}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="h-[calc(100vh-180px)] p-4">
          <AnimatePresence>
            {messages.map((message) => {
              const isOwn = message.sender_id === user.id;
              return (
                 <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`flex mb-4 ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] ${isOwn ? 'order-2' : 'order-1'}`}>
                    <div
                      className={`p-3 rounded-lg ${
                        isOwn
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                        }`}
                    >
                      {message.message_type === 'image' && message.audio_url ? (
                        <img
                          src={message.audio_url}
                          alt="Sent"
                          className="max-w-xs rounded-md"
                        />
                      ) : (
                        <p>{message.message_text}</p>
                      )}

                    </div>
                    <p className="text-xs text-muted-foreground mt-1 px-2">
                      {new Date(message.sent_at).toLocaleTimeString()}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 border-t bg-background flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <Smile className="h-5 w-5" />
          </Button>
          <Input
            value={messageText}
            onChange={(e) => handleTyping(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type your message..."
            className="flex-1"
          />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageSelect}
          />
          <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-5 w-5" />
          </Button>
          <Button onClick={sendMessage} disabled={!messageText.trim() && !selectedImage}>
            <Send className="h-4 w-4 mr-1" /> Send
          </Button>

          {imagePreview && (
            <div className="mt-2 flex items-center space-x-2">
              <img src={imagePreview} alt="Preview" className="w-24 h-24 rounded-md object-cover" />
              <Button variant="ghost" onClick={() => {
                setSelectedImage(null);
                setImagePreview(null);
              }}>
                <X className="h-4 w-4 mr-1" /> Remove
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-950/20 to-background pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-background/80 backdrop-blur border-b p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">Chat</h1>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span>{onlineCount} online</span>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Chat Options */}
        <div className="space-y-4">
          <Card className="p-6 bg-card/50 backdrop-blur-md border-primary/20">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="flex items-center space-x-2">
                <Shuffle className="h-5 w-5 text-primary" />
                <span>Random Chat</span>
              </CardTitle>
              <CardDescription>
                Connect with a random stranger for anonymous conversations
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Button 
                onClick={startRandomChat} 
                disabled={loading || waitingForMatch}
                className="w-full bg-primary hover:bg-primary/90"
              >
                {waitingForMatch ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Waiting for match...
                  </>
                ) : loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Start Random Chat
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Gender Specific Chat - Premium Feature */}
          <Card className="p-6 bg-card/30 backdrop-blur-md border-yellow-500/30">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-yellow-500" />
                <span>Gender Specific Chat</span>
                <Crown className="h-4 w-4 text-yellow-500" />
              </CardTitle>
              <CardDescription>
                Choose to chat with specific gender (Premium Feature)
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 space-y-2">
              <Button 
                onClick={() => startGenderSpecificChat('male')} 
                disabled={loading}
                variant="outline"
                className="w-full"
              >
                Chat with Males
              </Button>
              <Button 
                onClick={() => startGenderSpecificChat('female')} 
                disabled={loading}
                variant="outline"
                className="w-full"
              >
                Chat with Females
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Active Chats */}
        {activeRooms.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Active Chats</h3>
            {activeRooms.map((room) => (
              <Card key={room.id} className="p-4 bg-card/50 backdrop-blur-md border-primary/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {room.room_type === 'random' ? 'Random Chat' : `${room.target_gender} Chat`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Started {new Date(room.created_at).toLocaleString()}
                    </p>
                  </div>
                  <Button 
                    onClick={() => setCurrentRoom(room)}
                    variant="outline"
                    size="sm"
                  >
                    Continue
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Chat;
