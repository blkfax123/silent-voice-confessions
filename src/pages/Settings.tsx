import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Bell, Lock, Moon, LogOut } from "lucide-react";
import { useTheme } from "next-themes";

export default function Settings() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [pushEnabled, setPushEnabled] = useState(false);
  const [privacyMode, setPrivacyMode] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    document.title = "Settings • Silent Circle";
  }, []);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from('users')
        .select('push_notifications_enabled, privacy_mode, theme_preference')
        .eq('id', user.id)
        .maybeSingle();

      if (!error && data) {
        setPushEnabled(!!data.push_notifications_enabled);
        setPrivacyMode(!!data.privacy_mode);
        const isDark = (data.theme_preference ?? 'dark') === 'dark';
        setDarkMode(isDark);
        setTheme(isDark ? 'dark' : 'light');
      }
      setLoading(false);
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const updateUserSetting = async (patch: Record<string, any>) => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('users').update(patch).eq('id', user.id);
      if (error) throw error;
    } catch (e) {
      console.error(e);
      toast({ title: 'Error', description: 'Failed to save settings.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const togglePush = async (next: boolean) => {
    setPushEnabled(next);
    if (next && 'Notification' in window) {
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') {
        toast({ title: 'Permission denied', description: 'Enable notifications in your browser settings.', variant: 'destructive' });
        setPushEnabled(false);
        return;
      }
      localStorage.setItem('pushNotificationsEnabled', 'true');
    } else {
      localStorage.removeItem('pushNotificationsEnabled');
    }
    updateUserSetting({ push_notifications_enabled: next });
  };

  const togglePrivacy = (next: boolean) => {
    setPrivacyMode(next);
    updateUserSetting({ privacy_mode: next });
  };

  const toggleTheme = (nextDark: boolean) => {
    setDarkMode(nextDark);
    setTheme(nextDark ? 'dark' : 'light');
    updateUserSetting({ theme_preference: nextDark ? 'dark' : 'light' });
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/auth', { replace: true });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="max-w-2xl mx-auto p-4 flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-semibold">Settings</h1>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-4">
        <Card className="bg-card/50">
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">Push Notifications</div>
                  <div className="text-sm text-muted-foreground">Receive updates and replies</div>
                </div>
              </div>
              <Switch checked={pushEnabled} onCheckedChange={togglePush} disabled={loading || saving} />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Lock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">Privacy Mode</div>
                  <div className="text-sm text-muted-foreground">Hide sensitive details in your profile</div>
                </div>
              </div>
              <Switch checked={privacyMode} onCheckedChange={togglePrivacy} disabled={loading || saving} />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Moon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">Dark Theme</div>
                  <div className="text-sm text-muted-foreground">Toggle light/dark mode</div>
                </div>
              </div>
              <Switch checked={darkMode} onCheckedChange={toggleTheme} disabled={saving} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50">
          <CardContent className="p-4">
            <Button variant="destructive" className="w-full" onClick={handleLogout} disabled={saving}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
