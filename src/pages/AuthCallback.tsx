import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const handle = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      if (data.session) {
        navigate('/', { replace: true });
      } else {
        const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
          if (!mounted) return;
          if (session) navigate('/', { replace: true });
        });
        return () => sub.subscription.unsubscribe();
      }
    };

    handle();
    return () => { mounted = false; };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Completing sign in…</p>
      </div>
    </div>
  );
}
