import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { StatsCard } from "@/components/dashboard/stats-card";
import { BarChart3, Search, Bookmark, TrendingUp, Calendar, ArrowUpRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { API_BASE_URL } from "@/lib/api";

export default function Statistics() {
  const [timeRange, setTimeRange] = useState("week");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trending, setTrending] = useState<any[]>([]);
  const [mostViews, setMostViews] = useState<any[]>([]);
  const [mostLikes, setMostLikes] = useState<any[]>([]);
  const [searchActivity, setSearchActivity] = useState<any[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [activityError, setActivityError] = useState<string | null>(null);
  const [showAllTopSearches, setShowAllTopSearches] = useState(false);
  const [allTopSearches, setAllTopSearches] = useState<any[]>([]);
  const [allTopLoading, setAllTopLoading] = useState(false);
  const [allTopError, setAllTopError] = useState<string | null>(null);
  const [showAllTopKeywords, setShowAllTopKeywords] = useState(false);
  const [allTopKeywords, setAllTopKeywords] = useState<any[]>([]);
  const [allKeywordsLoading, setAllKeywordsLoading] = useState(false);
  const [allKeywordsError, setAllKeywordsError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      fetch(`${API_BASE_URL}/trending?limit=20`).then(r => r.json()),
      fetch(`${API_BASE_URL}/most-views?limit=10000`).then(r => r.json()),
      fetch(`${API_BASE_URL}/most-likes?limit=20`).then(r => r.json()),
    ]).then(([trendingRes, mostViewsRes, mostLikesRes]) => {
      if (!trendingRes.success || !mostViewsRes.success || !mostLikesRes.success) {
        setError("Failed to load statistics");
        setLoading(false);
        return;
      }
      setTrending(trendingRes.data || []);
      setMostViews(mostViewsRes.data || []);
      setMostLikes(mostLikesRes.data || []);
      setLoading(false);
    }).catch((err) => {
      setError(err.message || "Failed to load statistics");
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    setActivityLoading(true);
    setActivityError(null);
    fetch(`${API_BASE_URL}/search-activity?range=month`)
      .then(r => r.json())
      .then(data => {
        setSearchActivity(data.data || []);
        setActivityLoading(false);
      })
      .catch((err) => {
        setActivityError(err.message || 'Failed to load search activity');
        setActivityLoading(false);
      });
  }, []);

  // Top 5 trending queries
  const topSearches = trending.slice(0, 5).map(k => ({ name: k.query, count: k.likes }));
  // Top 5 trending keywords (hashtags or keywords)
  const topKeywords = trending
    .flatMap(k => [
      ...(k.hashtags || []).map((h: string) => ({ name: h, count: k.likes })),
      ...(k.keywords || []).map((kw: string) => ({ name: kw, count: k.likes }))
    ])
    .slice(0, 5);
  // Platform breakdown
  const platformCounts: Record<string, number> = {};
  mostViews.forEach(k => {
    platformCounts[k.platform] = (platformCounts[k.platform] || 0) + 1;
  });
  const searchesByPlatform = Object.entries(platformCounts).map(([name, count]) => ({ name, searches: count }));
  // Total searches
  const totalSearches = mostViews.length;

  const handleViewMoreTopSearches = () => {
    setShowAllTopSearches(true);
    if (allTopSearches.length === 0) {
      setAllTopLoading(true);
      setAllTopError(null);
      fetch(`${API_BASE_URL}/trending?limit=100`)
        .then(r => r.json())
        .then(data => {
          setAllTopSearches(data.data || []);
          setAllTopLoading(false);
        })
        .catch((err) => {
          setAllTopError(err.message || 'Failed to load top searches');
          setAllTopLoading(false);
        });
    }
  };

  const handleViewMoreTopKeywords = () => {
    setShowAllTopKeywords(true);
    if (allTopKeywords.length === 0) {
      setAllKeywordsLoading(true);
      setAllKeywordsError(null);
      fetch(`${API_BASE_URL}/trending?limit=500`)
        .then(r => r.json())
        .then(data => {
          // Flatten hashtags and keywords from all trending entries
          const keywords = (data.data || []).flatMap((k: any) => [
            ...(k.hashtags || []).map((h: string) => ({ name: h, count: k.likes })),
            ...(k.keywords || []).map((kw: string) => ({ name: kw, count: k.likes }))
          ]);
          setAllTopKeywords(keywords);
          setAllKeywordsLoading(false);
        })
        .catch((err) => {
          setAllKeywordsError(err.message || 'Failed to load top keywords');
          setAllKeywordsLoading(false);
        });
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Statistics</h1>
            <p className="text-muted-foreground">
              Analytics and insights for your keyword searches
            </p>
          </div>
          <div className="min-w-[150px]">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger>
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Last 24 Hours</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
                <SelectItem value="year">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 text-muted-foreground">Loading statistics...</div>
        ) : error ? (
          <div className="text-center py-16 text-red-500">{error}</div>
        ) : (
        <>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard 
            title="Total Searches" 
            value={totalSearches.toLocaleString()} 
            icon={<Search className="h-4 w-4" />} 
            description="Across all platforms"
          />
          <StatsCard 
            title="Trending Keywords" 
            value={trending.length.toLocaleString()} 
            icon={<TrendingUp className="h-4 w-4" />}
            description="Top liked keywords"
          />
          <StatsCard 
            title="Popular Platform" 
            value={searchesByPlatform.sort((a, b) => b.searches - a.searches)[0]?.name || "-"} 
            icon={<BarChart3 className="h-4 w-4" />}
            description={searchesByPlatform.length ? `${searchesByPlatform[0].searches} searches` : "-"}
          />
          <StatsCard 
            title="Most Liked Keyword" 
            value={mostLikes[0]?.query || "-"} 
            icon={<Bookmark className="h-4 w-4" />}
            description={mostLikes[0] ? `${mostLikes[0].likes} likes` : "-"}
          />
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="searches">Searches</TabsTrigger>
            <TabsTrigger value="platforms">Platforms</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Searches by Platform</CardTitle>
                  <CardDescription>
                    Distribution of searches across platforms
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-2">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={searchesByPlatform}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="searches" fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Top Searches</CardTitle>
                  <CardDescription>
                    Most popular search queries
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {topSearches.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="w-8 text-muted-foreground">{index + 1}.</span>
                          <span>{item.name}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="mr-2 text-muted-foreground">{item.count}</span>
                          <Search className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    ))}
                    {trending.length > 0 && (
                      <button
                        className="mt-2 text-sm text-blue-600 hover:underline"
                        onClick={handleViewMoreTopSearches}
                        type="button"
                      >
                        View More
                      </button>
                    )}
                  </div>
                  <Dialog open={showAllTopSearches} onOpenChange={setShowAllTopSearches}>
                    <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Top 100 Trending Searches</DialogTitle>
                      </DialogHeader>
                      {allTopLoading ? (
                        <div className="text-center py-8 text-muted-foreground">Loading...</div>
                      ) : allTopError ? (
                        <div className="text-center py-8 text-red-500">{allTopError}</div>
                      ) : allTopSearches.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">No trending searches found.</div>
                      ) : (
                        <div className="space-y-2">
                          {allTopSearches.map((item, index) => (
                            <div key={index} className="flex items-center justify-between border-b py-1">
                              <div className="flex items-center">
                                <span className="w-8 text-muted-foreground">{index + 1}.</span>
                                <span>{item.query}</span>
                              </div>
                              <div className="flex items-center">
                                <span className="mr-2 text-muted-foreground">{item.likes}</span>
                                <Search className="h-4 w-4 text-muted-foreground" />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Top Keywords</CardTitle>
                  <CardDescription>
                    Most liked keywords/hashtags
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {topKeywords.length === 0 ? (
                      <div className="text-muted-foreground">No trending keywords found.</div>
                    ) : topKeywords.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="w-8 text-muted-foreground">{index + 1}.</span>
                          <span>{item.name}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="mr-2 text-muted-foreground">{item.count}</span>
                          <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    ))}
                    {topKeywords.length > 0 && (
                      <button
                        className="mt-2 text-sm text-blue-600 hover:underline"
                        onClick={handleViewMoreTopKeywords}
                        type="button"
                      >
                        View More
                      </button>
                    )}
                  </div>
                  <Dialog open={showAllTopKeywords} onOpenChange={setShowAllTopKeywords}>
                    <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Top 500 Keywords/Hashtags</DialogTitle>
                      </DialogHeader>
                      {allKeywordsLoading ? (
                        <div className="text-center py-8 text-muted-foreground">Loading...</div>
                      ) : allKeywordsError ? (
                        <div className="text-center py-8 text-red-500">{allKeywordsError}</div>
                      ) : allTopKeywords.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">No keywords found.</div>
                      ) : (
                        <div className="space-y-2">
                          {allTopKeywords.map((item, index) => (
                            <div key={index} className="flex items-center justify-between border-b py-1">
                              <div className="flex items-center">
                                <span className="w-8 text-muted-foreground">{index + 1}.</span>
                                <span>{item.name}</span>
                              </div>
                              <div className="flex items-center">
                                <span className="mr-2 text-muted-foreground">{item.count}</span>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="searches" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Search Activity</CardTitle>
                <CardDescription>
                  Searches per day (last 30 days)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {activityLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading activity...</div>
                ) : activityError ? (
                  <div className="text-center py-8 text-red-500">{activityError}</div>
                ) : searchActivity.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No search activity found.</div>
                ) : (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={searchActivity}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="platforms" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Platform Performance</CardTitle>
                <CardDescription>
                  Analytics by platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading platform analytics...</div>
                ) : searchesByPlatform.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No platform analytics found.</div>
                ) : (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={searchesByPlatform}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="searches" fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="content" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Content Analytics</CardTitle>
                <CardDescription>
                  Keyword and hashtag performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading content analytics...</div>
                ) : topKeywords.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No content analytics found.</div>
                ) : (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={topKeywords.slice(0, 10)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#6366f1" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        </>
        )}
      </div>
    </DashboardLayout>
  );
}