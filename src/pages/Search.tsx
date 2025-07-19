import { useState, useEffect } from "react";
import { BottomNavigation } from "@/components/BottomNavigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search as SearchIcon, TrendingUp, Users } from "lucide-react";
import { motion } from "framer-motion";
import ConfessionCard from "@/components/ConfessionCard";
import { supabase } from "@/integrations/supabase/client";

const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [trendingTopics, setTrendingTopics] = useState<string[]>([
    "relationships", "work", "family", "anxiety", "dreams", "secrets"
  ]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('confessions')
        .select('*')
        .or(`content.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%`)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchByTopic = (topic: string) => {
    setSearchQuery(topic);
    handleSearch();
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold gradient-text">Discover</h1>
          <p className="text-muted-foreground">Find confessions and connect with others</p>
        </div>

        {/* Search Bar */}
        <div className="flex space-x-2">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search confessions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10"
            />
          </div>
          <Button onClick={handleSearch} disabled={loading}>
            {loading ? "..." : "Search"}
          </Button>
        </div>

        {/* Trending Topics */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Trending Topics</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {trendingTopics.map((topic) => (
              <motion.div
                key={topic}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Badge
                  variant="secondary"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => searchByTopic(topic)}
                >
                  #{topic}
                </Badge>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Search Results</h2>
              <Badge variant="outline">{searchResults.length}</Badge>
            </div>
            {searchResults.map((confession) => (
              <motion.div
                key={confession.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ConfessionCard
                  confession={{
                    id: confession.id,
                    category: confession.category,
                    timestamp: new Date(confession.created_at).toLocaleString(),
                    reactions: confession.reactions || {},
                    hasAudio: confession.confession_type === 'voice',
                    content: confession.content,
                    audioUrl: confession.audio_url
                  }}
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {searchQuery && searchResults.length === 0 && !loading && (
          <div className="text-center py-12">
            <SearchIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No results found</h3>
            <p className="text-muted-foreground">Try different keywords or browse trending topics</p>
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Search;