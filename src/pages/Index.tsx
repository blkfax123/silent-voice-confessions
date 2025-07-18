import { useState, useEffect } from 'react';
import { Menu, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfessionCard } from '@/components/ConfessionCard';
import { RecordButton } from '@/components/RecordButton';
import { WhisperRoom } from '@/components/WhisperRoom';
import { AuthDialog } from '@/components/AuthDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock confession data - TODO: Replace with Supabase data
const mockConfessions = [
  {
    id: '1',
    anonymousId: '#Voice3021',
    category: 'Love',
    audioUrl: '',
    duration: 45,
    reactions: { heart: 12, laugh: 3, sad: 1, mind_blown: 8 },
    isBoosted: false,
    createdAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    anonymousId: '#Voice1547',
    category: 'Career',
    audioUrl: '',
    duration: 58,
    reactions: { heart: 5, laugh: 2, sad: 9, mind_blown: 3 },
    isBoosted: true,
    createdAt: '2024-01-15T09:15:00Z'
  },
  {
    id: '3',
    anonymousId: '#Voice9873',
    category: 'Dreams',
    audioUrl: '',
    duration: 32,
    reactions: { heart: 18, laugh: 7, sad: 2, mind_blown: 15 },
    isBoosted: false,
    createdAt: '2024-01-15T08:45:00Z'
  }
];

const Index = () => {
  const [user, setUser] = useState<{ username: string; isAdmin: boolean } | null>(null);
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  const handleAuth = (username: string, isAdmin: boolean) => {
    setUser({ username, isAdmin });
    
    // Redirect to admin panel if admin
    if (isAdmin) {
      window.location.href = '/admin';
    }
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-xs font-bold text-primary-foreground">SC</span>
            </div>
            <h1 className="text-xl font-bold gradient-text">Silent Circle</h1>
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {user.username}
                  {user.isAdmin && ' (Admin)'}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAuthDialog(true)}
                className="text-muted-foreground hover:text-foreground"
              >
                <User className="w-4 h-4 mr-2" />
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {!user ? (
          // Welcome Screen
          <div className="text-center py-16">
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-lg font-bold text-primary-foreground">SC</span>
                </div>
              </div>
              
              <h1 className="text-4xl font-bold gradient-text mb-4">
                Welcome to Silent Circle
              </h1>
              
              <p className="text-xl text-muted-foreground mb-8">
                Share your deepest thoughts anonymously through voice confessions. 
                Listen to others' stories. React with empathy. All completely anonymous.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="p-4 rounded-lg bg-card border border-border">
                  <div className="text-2xl mb-2">🎙️</div>
                  <h3 className="font-semibold mb-2">Record Anonymously</h3>
                  <p className="text-sm text-muted-foreground">
                    Share your thoughts in 60-second voice confessions
                  </p>
                </div>
                
                <div className="p-4 rounded-lg bg-card border border-border">
                  <div className="text-2xl mb-2">👂</div>
                  <h3 className="font-semibold mb-2">Listen & React</h3>
                  <p className="text-sm text-muted-foreground">
                    Discover others' stories and respond with emojis
                  </p>
                </div>
                
                <div className="p-4 rounded-lg bg-card border border-border">
                  <div className="text-2xl mb-2">🤫</div>
                  <h3 className="font-semibold mb-2">Stay Anonymous</h3>
                  <p className="text-sm text-muted-foreground">
                    Your identity is protected with anonymous tags
                  </p>
                </div>
              </div>

              <Button
                onClick={() => setShowAuthDialog(true)}
                className="bg-primary hover:bg-primary-glow text-lg px-8 py-3"
              >
                Join Silent Circle
              </Button>
            </div>
          </div>
        ) : (
          // Main App Interface
          <Tabs defaultValue="feed" className="space-y-6">
            <TabsList className="bg-muted w-full justify-start">
              <TabsTrigger value="feed">Confession Feed</TabsTrigger>
              <TabsTrigger value="whisper">Whisper Room</TabsTrigger>
            </TabsList>

            <TabsContent value="feed" className="space-y-6">
              <div className="text-center py-4">
                <h2 className="text-2xl font-semibold gradient-text mb-2">Anonymous Confessions</h2>
                <p className="text-muted-foreground">
                  Listen to others' stories and share your own truth
                </p>
              </div>

              <div className="space-y-6">
                {mockConfessions.map((confession) => (
                  <ConfessionCard key={confession.id} {...confession} />
                ))}
              </div>

              <div className="text-center py-8 text-muted-foreground">
                <p>You've reached the end of recent confessions.</p>
                <p className="text-sm mt-2">New confessions appear in real-time.</p>
              </div>
            </TabsContent>

            <TabsContent value="whisper" className="space-y-6">
              <div className="text-center py-4">
                <h2 className="text-2xl font-semibold gradient-text mb-2">Whisper Room</h2>
                <p className="text-muted-foreground">
                  Continuous stream of anonymous confessions
                </p>
              </div>

              <div className="max-w-md mx-auto">
                <WhisperRoom />
              </div>
            </TabsContent>
          </Tabs>
        )}
      </main>

      {/* Recording Button - Only show when logged in */}
      {user && <RecordButton />}

      {/* Auth Dialog */}
      <AuthDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        onAuth={handleAuth}
      />
    </div>
  );
};

export default Index;
