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
          table: 'messages',
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
        .select(`
          *,
          messages!inner(id, content, created_at)
        `)
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
        .from('messages')
        .select(`
          *,
          reactions(*)
        `)
        .eq('room_id', currentRoom.id)
        .order('created_at', { ascending: true });

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
      // First check for existing waiting room
      const { data: waitingRoom, error: waitingError } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('room_type', 'random')
        .eq('is_active', false)
        .is('user2_id', null)
        .neq('user1_id', user.id)
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

      if (!waitingError && waitingRoom) {
        // Join existing waiting room
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
              
              toast({
                title: "No match found",
                description: "Try again later when more users are online.",
              });
            }
            setWaitingForMatch(false);
          }
        }, 1000);
      }

      fetchActiveRooms();
    } catch (error) {
      console.error('Error starting chat:', error);
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
        .gt('last_seen', new Date(Date.now() - 10 * 60 * 1000).toISOString())
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
        .from('messages')
        .insert({
          room_id: currentRoom.id,
          user_id: user.id,
          content: messageText || null,
          image_url: imageUrl,
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
          .from('messages')
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

  const addReaction = async (messageId: string, reactionType: string) => {
    try {
      const { error } = await supabase
        .from('reactions')
        .insert({
          message_id: messageId,
          user_id: user.id,
          reaction_type: reactionType
        });

      if (error) throw error;
      fetchMessages();
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const exportToPDF = async () => {
    if (!messages.length) return;
    
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      
      doc.setFontSize(16);
      doc.text('Chat Export', 20, 20);
      doc.setFontSize(12);
      doc.text(`Exported on: ${new Date().toLocaleString()}`, 20, 30);
      
      let yPosition = 50;
      
      messages.forEach((message, index) => {
        const isOwn = message.user_id === user.id;
        const sender = isOwn ? 'You' : 'Partner';
        const content = message.content || '[Image]';
        const timestamp = new Date(message.created_at).toLocaleTimeString();
        
        const text = `${sender} (${timestamp}): ${content}`;
        const lines = doc.splitTextToSize(text, 170);
        
        lines.forEach((line: string) => {
          if (yPosition > 280) {
            doc.addPage();
            yPosition = 20;
          }
          doc.text(line, 20, yPosition);
          yPosition += 7;
        });
        
        yPosition += 3;
      });
      
      doc.save(`chat-export-${Date.now()}.pdf`);
      
      toast({
        title: "Export successful",
        description: "Chat has been exported to PDF.",
      });
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      toast({
        title: "Export failed",
        description: "Failed to export chat. Please try again.",
        variant: "destructive",
      });
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
            <Button variant="ghost" size="sm" onClick={exportToPDF}>
              <Download className="h-4 w-4" />
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
              const isOwn = message.user_id === user.id;
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
                          : 'bg-muted'
                      }`}
                    >
                      {message.message_type === 'image' && message.image_url ? (
                        <img
                          src={message.image_url}
                          alt="Shared image"
                          className="max-w-full h-auto rounded"
                        />
                      ) : (
                        <p>{message.content}</p>
                      )}
                      
                      {/* Reactions */}
                      {message.reactions && message.reactions.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {message.reactions.map((reaction: any) => (
                            <Badge key={reaction.id} variant="secondary" className="text-xs">
                              {reaction.reaction_type}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center mt-1 space-x-2">
                      <p className="text-xs text-muted-foreground">
                        {new Date(message.created_at).toLocaleTimeString()}
                      </p>
                      
                      {/* Reaction buttons */}
                      <div className="flex space-x-1">
                        {reactions.map((reaction) => (
                          <Button
                            key={reaction.type}
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => addReaction(message.id, reaction.type)}
                          >
                            <reaction.icon className={`h-3 w-3 ${reaction.color}`} />
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </ScrollArea>

        {/* Image Preview */}
        {imagePreview && (
          <div className="p-4 border-t bg-muted/30">
            <div className="flex items-center space-x-2">
              <img src={imagePreview} alt="Preview" className="h-12 w-12 rounded object-cover" />
              <p className="text-sm text-muted-foreground">Image ready to send</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedImage(null);
                  setImagePreview(null);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div className="absolute bottom-32 left-4 right-4 bg-background border rounded-lg p-4 shadow-lg">
            <div className="grid grid-cols-7 gap-2">
              {emojis.map((emoji, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setMessageText(prev => prev + emoji);
                    setShowEmojiPicker(false);
                  }}
                >
                  {emoji}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Message Input */}
        <div className="sticky bottom-0 bg-background border-t p-4">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImageIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <Smile className="h-4 w-4" />
            </Button>
            
            <Textarea
              value={messageText}
              onChange={(e) => handleTyping(e.target.value)}
              placeholder="Type your message..."
              className="min-h-[40px] resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />
            
            <Button onClick={sendMessage} disabled={!messageText.trim() && !selectedImage}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''} bg-background pb-20`}>
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold gradient-text">Anonymous Chat</h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-muted-foreground">Connect with strangers around the world</p>
          <Badge variant="secondary" className="bg-green-500/20 text-green-400">
            {onlineCount} users online
          </Badge>
        </div>

        {/* User Info */}
        {userProfile && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`font-medium ${getUsernameColor(userProfile.subscription_type)}`}>
                    {userProfile.username || 'Anonymous'}
                    {userProfile.subscription_type !== 'free' && (
                      <Crown className="inline h-4 w-4 ml-1 text-yellow-400" />
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {userProfile.gender || 'Gender not set'}
                  </p>
                </div>
                <Badge variant={userProfile.subscription_type === 'free' ? 'secondary' : 'default'}>
                  {userProfile.subscription_type}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Start New Chat */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Start New Chat</h2>
          
          {/* Random Chat */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shuffle className="h-5 w-5" />
                <span>Random Chat</span>
                <Badge variant="secondary">Free</Badge>
              </CardTitle>
              <CardDescription>
                Connect with any random user for anonymous conversations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={startRandomChat} 
                disabled={loading || waitingForMatch}
                className="w-full"
              >
                {loading || waitingForMatch ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {waitingForMatch ? "Waiting for someone..." : "Connecting..."}
                  </>
                ) : (
                  "Start Random Chat"
                )}
              </Button>
            </CardContent>
          </Card>

          {
