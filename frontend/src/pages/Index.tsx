import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SearchForm } from "@/components/dashboard/search-form";
import { SearchResults } from "@/components/dashboard/search-results";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { SearchResponse } from "@/types";
import { BarChart3, Search, Bookmark, Clock, Copy as CopyIcon } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";

export default function Index() {
  const [searchResults, setSearchResults] = useState<SearchResponse | undefined>(undefined);
  const [searchLoading, setSearchLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalSearches, setTotalSearches] = useState(0);
  const [popularSearch, setPopularSearch] = useState<string | null>(null);
  const [lastSearch, setLastSearch] = useState<any>(null);
  const [recentSearches, setRecentSearches] = useState<any[]>([]);

  // Helper to get the correct endpoint for a platform
  function getSearchEndpoint(platform: string) {
    switch (platform) {
      case "google": return `${API_BASE_URL}/google/all`;
      case "youtube": return `${API_BASE_URL}/youtube/all`;
      case "bing": return `${API_BASE_URL}/bing/all`;
      case "playstore": return `${API_BASE_URL}/playstore/all`;
      case "appstore": return `${API_BASE_URL}/appstore/all`;
      default: return `${API_BASE_URL}/google/all`;
    }
  }

  // Unified search handler
  async function handleSearch({ platform, query, language, country }: { platform: string, query: string, language?: string, country?: string }) {
    setSearchLoading(true);
    setError(null);
    try {
      const endpoint = getSearchEndpoint(platform);
      const params = new URLSearchParams({ query });
      if (language) params.append("language", language);
      if (country) params.append("country", country);
      const res = await fetch(`${endpoint}?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch search results");
      const data = await res.json();
      setSearchResults(data);
    } catch (err: any) {
      setError(err.message || "Failed to search");
    } finally {
      setSearchLoading(false);
    }
  }

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      fetch(`${API_BASE_URL}/most-views?limit=10000`).then(r => r.json()),
      fetch(`${API_BASE_URL}/trending?limit=1`).then(r => r.json()),
      fetch(`${API_BASE_URL}/most-views?limit=5&sort=recent`).then(r => r.json()),
    ]).then(([viewsRes, trendingRes, recentRes]) => {
      if (!viewsRes.success || !trendingRes.success || !recentRes.success) {
        setError("Failed to load dashboard stats");
        setLoading(false);
        return;
      }
      setTotalSearches(viewsRes.data.length);
      setPopularSearch(trendingRes.data[0]?.query || null);
      // Find the most recent search by created_at
      const all = [...viewsRes.data, ...recentRes.data];
      const mostRecent = all.reduce((a, b) => (new Date(a.created_at) > new Date(b.created_at) ? a : b), all[0]);
      setLastSearch(mostRecent || null);
      setRecentSearches(recentRes.data || []);
      setLoading(false);
    }).catch((err) => {
      setError(err.message || "Failed to load dashboard stats");
      setLoading(false);
    });
  }, []);

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            AI Hashtag Generator - Your all-in-one keyword research tool
          </p>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard 
            title="Total Searches" 
            value={loading ? "..." : totalSearches.toLocaleString()} 
            icon={<Search className="h-4 w-4" />} 
          />
          <StatsCard 
            title="Popular Search" 
            value={loading ? "..." : (popularSearch || "-")} 
            icon={<BarChart3 className="h-4 w-4" />}
          />
          <StatsCard 
            title="Last Search" 
            value={loading ? "..." : (lastSearch ? `${lastSearch.query} • ${lastSearch.platform}` : "-")} 
            icon={<Clock className="h-4 w-4" />}
          />
        </div>

        <Tabs defaultValue="search">
          <TabsList>
            <TabsTrigger value="search">Keyword Search</TabsTrigger>
            <TabsTrigger value="recent">Recent Searches</TabsTrigger>
          </TabsList>
          <TabsContent value="search" className="space-y-4">
            <SearchForm onSearch={handleSearch} loading={searchLoading} />
            <SearchResults results={searchResults} loading={searchLoading} />
          </TabsContent>
          <TabsContent value="recent" className="p-1">
            <Card>
              <CardHeader>
                <CardTitle>Recent Searches</CardTitle>
                <CardDescription>Your last 5 keyword searches</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading recent searches...</div>
                ) : recentSearches.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No recent searches found.</div>
                ) : (
                  <div className="space-y-2">
                    {recentSearches.map((item, idx) => (
                      <div
                        key={item.id || idx}
                        className="rounded-md border p-3 flex justify-between items-center"
                      >
                        <div>
                          <h4 className="font-medium">{item.query}</h4>
                          <p className="text-sm text-muted-foreground">{item.platform}</p>
                        </div>
                        <button
                          className="ml-2 p-2 rounded hover:bg-muted"
                          onClick={() => {
                            navigator.clipboard.writeText(item.query);
                          }}
                          title="Copy keyword"
                        >
                          <CopyIcon className="h-5 w-5 text-muted-foreground" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}