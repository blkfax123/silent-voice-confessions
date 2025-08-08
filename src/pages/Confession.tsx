import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ConfessionReactions } from "@/components/ConfessionReactions";
import { CommentsSection } from "@/components/CommentsSection";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Languages } from "lucide-react";

interface Confession {
  id: string;
  category: string;
  created_at: string;
  content?: string | null;
  audio_url?: string | null;
  confession_type?: string | null;
}

const ConfessionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [confession, setConfession] = useState<Confession | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLang, setSelectedLang] = useState<string>('en');
  const [translating, setTranslating] = useState(false);
  const [translatedText, setTranslatedText] = useState<string | null>(null);

  useEffect(() => {
    const fetchConfession = async () => {
      if (!id) return;
      const { data, error } = await supabase
        .from('confessions')
        .select('*')
        .eq('id', id)
        .eq('is_deleted', false)
        .single();
      if (!error) setConfession(data as Confession);
      setLoading(false);
    };
    fetchConfession();
  }, [id]);

  const title = useMemo(() => {
    if (!confession) return "Confession";
    if (confession.content) {
      const trimmed = confession.content.trim();
      const slice = trimmed.slice(0, 80);
      return slice + (trimmed.length > 80 ? "…" : "");
    }
    return "Voice Confession";
  }, [confession]);

  useEffect(() => {
    // Basic SEO
    document.title = `${title} • ${confession?.category ?? 'Confession'}`.slice(0, 60);
    const desc = document.querySelector('meta[name="description"]');
    const description = confession?.content?.slice(0, 150) || 'Read anonymous confessions.';
    if (desc) {
      desc.setAttribute('content', description);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = description;
      document.head.appendChild(meta);
    }
  }, [title, confession]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="p-4 max-w-3xl mx-auto">
          <div className="h-6 w-24 bg-muted rounded animate-pulse" />
        </header>
        <main className="max-w-3xl mx-auto p-4 space-y-4">
          <div className="h-8 w-2/3 bg-muted rounded animate-pulse" />
          <div className="h-4 w-full bg-muted rounded animate-pulse" />
          <div className="h-4 w-5/6 bg-muted rounded animate-pulse" />
          <div className="h-4 w-4/6 bg-muted rounded animate-pulse" />
        </main>
      </div>
    );
  }

  if (!confession) {
    return (
      <div className="min-h-screen bg-background">
        <main className="max-w-3xl mx-auto p-6 text-center space-y-4">
          <h1 className="text-2xl font-semibold">Confession not found</h1>
          <p className="text-muted-foreground">It may have been removed or never existed.</p>
          <Link to="/">
            <Button variant="outline">Go back</Button>
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/60">
      <header className="max-w-3xl mx-auto p-4">
        <nav className="flex items-center justify-between">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">← Back to feed</Link>
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
            {confession.category}
          </span>
        </nav>
      </header>

      <main className="max-w-3xl mx-auto p-4">
        <article className="bg-card border border-border/50 rounded-lg shadow-sm">
          <header className="p-6 border-b border-border/50">
            <h1 className="text-2xl font-semibold leading-snug">{title}</h1>
            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span>Anonymous {confession.audio_url ? 'Voice' : 'Text'} • #{confession.id.slice(-4)}</span>
              <span>•</span>
              <time dateTime={confession.created_at}>{new Date(confession.created_at).toLocaleDateString()}</time>
            </div>
            {!confession.audio_url && (
              <div className="mt-4 flex items-center gap-2">
                <Languages className="w-4 h-4 text-muted-foreground" />
                <Select value={selectedLang} onValueChange={(v) => setSelectedLang(v)}>
                  <SelectTrigger className="w-44"><SelectValue placeholder="Language" /></SelectTrigger>
                  <SelectContent className="z-50 bg-card">
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="hi">Hindi</SelectItem>
                    <SelectItem value="ja">Japanese</SelectItem>
                    <SelectItem value="id">Indonesian</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                    <SelectItem value="sv">Swedish</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="sm" variant="outline" disabled={translating} onClick={async () => {
                  if (!confession.content) return;
                  try {
                    setTranslating(true);
                    const { data, error } = await supabase.functions.invoke('translate', {
                      body: { text: confession.content, target: selectedLang }
                    });
                    if (error) throw error;
                    setTranslatedText((data as any)?.translatedText || (data as any)?.translated_text || '');
                  } catch (e) {
                    console.error('Translation failed', e);
                  } finally {
                    setTranslating(false);
                  }
                }}>{translating ? 'Translating…' : 'Translate'}</Button>
                {translatedText && (
                  <Button size="sm" variant="ghost" onClick={() => setTranslatedText(null)}>Show original</Button>
                )}
              </div>
            )}
          </header>

          <div className="p-6 space-y-4">
            {confession.audio_url ? (
              <audio controls className="w-full h-10" src={confession.audio_url} />
            ) : (
              <div className="prose prose-invert max-w-none">
                <p className="whitespace-pre-wrap text-base leading-7">{translatedText ?? confession.content}</p>
              </div>
            )}
          </div>

          <div className="px-6 pb-4">
            <ConfessionReactions confessionId={confession.id} />
          </div>
        </article>

        <section aria-label="Comments" className="mt-6">
          <CommentsSection confessionId={confession.id} />
        </section>
      </main>
    </div>
  );
};

export default ConfessionDetail;
