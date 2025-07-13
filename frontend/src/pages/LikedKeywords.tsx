import { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { LikedKeywordsTable } from "@/components/dashboard/liked-keywords-table";
import { SearchResults } from "@/components/dashboard/search-results";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SavedKeyword, SearchResponse, TrendingKeyword } from "@/types";
import { toast } from "sonner";
import { SearchIcon } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";

export default function LikedKeywords() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedSort, setSelectedSort] = useState("likes");
  const [selectedFilter, setSelectedFilter] = useState("trending");
  const [selectedKeyword, setSelectedKeyword] = useState<SavedKeyword | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [trendingKeywords, setTrendingKeywords] = useState<TrendingKeyword[]>([]);
  const [exporting, setExporting] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Fetch trending keywords from backend with filters
  const fetchTrending = useCallback(async (params?: { search?: string; platform?: string; type?: string; sort?: string; filter?: string }) => {
    setLoading(true);
    try {
      let endpoint = `${API_BASE_URL}/api/trending`;
      
      // Choose endpoint based on filter
      if (params?.filter === "most-views") {
        endpoint = `${API_BASE_URL}/api/most-views`;
      } else if (params?.filter === "most-likes") {
        endpoint = `${API_BASE_URL}/api/most-likes`;
      }
      
      const url = new URL(endpoint, API_BASE_URL);
      if (params?.search) url.searchParams.append("query", params.search);
      if (params?.platform && params.platform !== "all") url.searchParams.append("platform", params.platform);
      if (params?.type && params.type !== "all") url.searchParams.append("search_type", params.type);
      if (params?.sort && params.filter === "trending") url.searchParams.append("sort", params.sort);
      
      const res = await fetch(url.toString());
      const data = await res.json();
      if (data.success) {
        setTrendingKeywords(data.data);
      }
    } catch (err) {
      console.error("Error fetching trending keywords:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh trending data
  const refreshTrending = useCallback(() => {
    fetchTrending({ 
      search: searchTerm, 
      platform: selectedPlatform, 
      type: selectedType, 
      sort: selectedSort,
      filter: selectedFilter 
    });
  }, [fetchTrending, searchTerm, selectedPlatform, selectedType, selectedSort, selectedFilter]);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchTrending({ 
        search: searchTerm, 
        platform: selectedPlatform, 
        type: selectedType, 
        sort: selectedSort,
        filter: selectedFilter 
      });
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm, selectedPlatform, selectedType, selectedSort, selectedFilter, fetchTrending]);

  // Initial fetch
  useEffect(() => {
    fetchTrending();
  }, [fetchTrending]);

  // Listen for trending data refresh events from Search page
  useEffect(() => {
    const handleTrendingRefresh = () => {
      refreshTrending();
    };

    window.addEventListener('trendingDataRefresh', handleTrendingRefresh);
    return () => {
      window.removeEventListener('trendingDataRefresh', handleTrendingRefresh);
    };
  }, [refreshTrending]);

  // Export all trending keywords as CSV
  const handleExportAll = () => {
    setExporting(true);
    try {
      const csvRows = [
        ["Query", "Platform", "Type", "Total Likes", "Total Views", "Last Updated"],
        ...trendingKeywords.map(k => [
          k.query,
          k.platform,
          k.search_type,
          k.likes,
          k.views || 0,
          new Date(k.created_at).toLocaleDateString()
        ])
      ];
      const csvContent = csvRows.map(row => row.map(String).map(cell => `"${cell.replace(/"/g, '""')}"`).join(",")).join("\n");
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${selectedFilter}_keywords_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(`Exported ${trendingKeywords.length} ${selectedFilter} keywords as CSV!`);
    } catch (err) {
      toast.error("Failed to export CSV");
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = (id: string) => {
    toast.success(`Keyword ${id} deleted successfully`);
    // In a real application, we would call an API to delete the keyword
  };

  const getFilterTitle = () => {
    switch (selectedFilter) {
      case "most-views": return "Most Viewed Keywords";
      case "most-likes": return "Most Liked Keywords";
      default: return "Trending Keywords";
    }
  };

  const getFilterDescription = () => {
    switch (selectedFilter) {
      case "most-views": return "See the most viewed keywords across all platforms (aggregated across all languages and countries)";
      case "most-likes": return "See the most liked keywords across all platforms (aggregated across all languages and countries)";
      default: return "See the most liked, viewed, and recent keywords across all platforms (aggregated across all languages and countries)";
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{getFilterTitle()}</h1>
          <p className="text-muted-foreground">
            {getFilterDescription()}
          </p>
        </div>

        {/* Filters above trending table */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <div className="relative">
                  <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search keywords..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <div>
                <Select
                  value={selectedFilter}
                  onValueChange={setSelectedFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trending">Trending</SelectItem>
                    <SelectItem value="most-views">Most Views</SelectItem>
                    <SelectItem value="most-likes">Most Likes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select
                  value={selectedPlatform}
                  onValueChange={setSelectedPlatform}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Platforms</SelectItem>
                    <SelectItem value="google">Google</SelectItem>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="bing">Bing</SelectItem>
                    <SelectItem value="playstore">Play Store</SelectItem>
                    <SelectItem value="appstore">App Store</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select
                  value={selectedType}
                  onValueChange={setSelectedType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="keywords">Keywords</SelectItem>
                    <SelectItem value="hashtags">Hashtags</SelectItem>
                    <SelectItem value="questions">Questions</SelectItem>
                    <SelectItem value="prepositions">Prepositions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {selectedFilter === "trending" && (
                <div>
                  <Select
                    value={selectedSort}
                    onValueChange={setSelectedSort}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="likes">Most Liked</SelectItem>
                      <SelectItem value="views">Most Viewed</SelectItem>
                      <SelectItem value="recent">Most Recent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">{getFilterTitle()}</h2>
          <Button onClick={handleExportAll} disabled={exporting}>
            Export All as CSV
          </Button>
        </div>

        <LikedKeywordsTable keywords={trendingKeywords} onRefresh={refreshTrending} />
      </div>
    </DashboardLayout>
  );
}