import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { SearchResponse, KeywordSearch } from "@/types";
import { SearchResults } from "@/components/dashboard/search-results";
import { toast } from "sonner";
import { EyeIcon, BookmarkIcon, TrashIcon, MoreHorizontal, SearchIcon } from "lucide-react";

export default function SearchHistory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [selectedKeyword, setSelectedKeyword] = useState<KeywordSearch | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Mock search history
  const searchHistory: KeywordSearch[] = [
    {
      id: "1",
      user_id: "user-1",
      query: "digital marketing",
      platform: "google",
      search_type: "all",
      search_params: {
        language: "en",
        country: "us",
        location: ""
      },
      created_at: "2025-07-06T15:30:00.000Z",
      results_count: {
        keywords: 25,
        hashtags: 12,
        questions: 8,
        prepositions: 5
      }
    },
    {
      id: "2",
      user_id: "user-1",
      query: "vlog ideas",
      platform: "youtube",
      search_type: "hashtags",
      search_params: {
        language: "en",
        country: "us",
        location: ""
      },
      created_at: "2025-07-05T10:15:00.000Z",
      results_count: {
        keywords: 0,
        hashtags: 18,
        questions: 0,
        prepositions: 0
      }
    },
    {
      id: "3",
      user_id: "user-1",
      query: "productivity apps",
      platform: "playstore",
      search_type: "keywords",
      search_params: {
        language: "en",
        country: "us",
        location: ""
      },
      created_at: "2025-07-03T08:45:00.000Z",
      results_count: {
        keywords: 30,
        hashtags: 0,
        questions: 0,
        prepositions: 0
      }
    },
    {
      id: "4",
      user_id: "user-1",
      query: "seo optimization",
      platform: "google",
      search_type: "all",
      search_params: {
        language: "en",
        country: "us",
        location: "New York"
      },
      created_at: "2025-07-01T14:20:00.000Z",
      results_count: {
        keywords: 22,
        hashtags: 10,
        questions: 15,
        prepositions: 8
      }
    },
    {
      id: "5",
      user_id: "user-1",
      query: "photo editing",
      platform: "appstore",
      search_type: "keywords",
      search_params: {
        language: "en",
        country: "us",
        location: ""
      },
      created_at: "2025-06-28T11:05:00.000Z",
      results_count: {
        keywords: 28,
        hashtags: 0,
        questions: 0,
        prepositions: 0
      }
    }
  ];

  // Simulated search results for the selected keyword
  const mockSearchResult = (keyword: KeywordSearch): SearchResponse => {
    let data = {
      keywords: [],
      hashtags: [],
      questions: [],
      prepositions: []
    };

    if (keyword.query === "digital marketing") {
      data = {
        keywords: ["digital marketing", "online marketing", "social media marketing", "SEO", "PPC", "content marketing"],
        hashtags: ["#digitalmarketing", "#onlinemarketing", "#socialmediamarketing", "#SEO", "#contentmarketing"],
        questions: ["What is digital marketing?", "How to start digital marketing?", "Is digital marketing worth it?"],
        prepositions: ["marketing with digital tools", "marketing for digital platforms"]
      };
    } else if (keyword.query === "vlog ideas") {
      data = {
        keywords: [],
        hashtags: ["#vlogideas", "#vlogger", "#vlogging", "#youtuber", "#contentvlog", "#dailyvlog", "#vlogchannel"],
        questions: [],
        prepositions: []
      };
    } else {
      // Generate random data for other queries
      const keywords = keyword.results_count.keywords > 0 ? 
        Array(Math.min(5, keyword.results_count.keywords)).fill(0).map((_, i) => `${keyword.query} keyword ${i+1}`) : [];
      
      const hashtags = keyword.results_count.hashtags > 0 ? 
        Array(Math.min(5, keyword.results_count.hashtags)).fill(0).map((_, i) => `#${keyword.query.replace(/\s+/g, '')}${i+1}`) : [];
      
      const questions = keyword.results_count.questions > 0 ? 
        Array(Math.min(3, keyword.results_count.questions)).fill(0).map((_, i) => `Question about ${keyword.query} ${i+1}?`) : [];
      
      const prepositions = keyword.results_count.prepositions > 0 ? 
        Array(Math.min(3, keyword.results_count.prepositions)).fill(0).map((_, i) => `${keyword.query} for use case ${i+1}`) : [];
      
      data = { keywords, hashtags, questions, prepositions };
    }

    return {
      data,
      metadata: {
        query: keyword.query,
        platform: keyword.platform,
        search_type: keyword.search_type,
        timestamp: keyword.created_at
      }
    };
  };

  const handleDelete = (id: string) => {
    toast.success("Search history item deleted");
    // In a real app, we'd make an API call to delete the search history
  };

  const handleSave = (keyword: KeywordSearch) => {
    toast.success("Search saved to favorites");
    // In a real app, we'd make an API call to save the search
  };

  const handleView = (keyword: KeywordSearch) => {
    setSelectedKeyword(keyword);
    setDialogOpen(true);
  };

  // Filter searches based on search term and platform
  const filteredSearches = searchHistory.filter(search => {
    const matchesSearch = search.query.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlatform = selectedPlatform === "all" || search.platform === selectedPlatform;
    
    return matchesSearch && matchesPlatform;
  });

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Search History</h1>
          <p className="text-muted-foreground">
            View your previous keyword searches and results
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>
          </CardContent>
        </Card>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Query</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Results</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSearches.map((search) => (
                <TableRow key={search.id}>
                  <TableCell>
                    <div className="font-medium">{search.query}</div>
                    {search.search_params.location && (
                      <div className="text-xs text-muted-foreground">
                        Location: {search.search_params.location}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{search.platform}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{search.search_type}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {search.results_count.keywords > 0 && (
                        <Badge variant="outline" className="bg-blue-50">
                          {search.results_count.keywords} keywords
                        </Badge>
                      )}
                      {search.results_count.hashtags > 0 && (
                        <Badge variant="outline" className="bg-green-50">
                          {search.results_count.hashtags} hashtags
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{new Date(search.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleView(search)}
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleSave(search)}
                      >
                        <BookmarkIcon className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleDelete(search.id)}>
                            <TrashIcon className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Search Results for "{selectedKeyword?.query}"</DialogTitle>
            </DialogHeader>
            {selectedKeyword && (
              <SearchResults 
                results={mockSearchResult(selectedKeyword)} 
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}