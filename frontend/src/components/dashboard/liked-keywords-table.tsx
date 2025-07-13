import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  EyeIcon, 
  TrashIcon, 
  StarIcon, 
  DownloadIcon,
  CopyIcon,
  MoreHorizontal,
  Loader2
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import { TrendingKeyword } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { API_BASE_URL } from "@/lib/api";

interface LikedKeywordsTableProps {
  keywords?: TrendingKeyword[];
  onView?: (keyword: TrendingKeyword) => void;
  onRefresh?: () => void;
}

export function LikedKeywordsTable({ keywords: propKeywords, onView, onRefresh }: LikedKeywordsTableProps) {
  const [keywords, setKeywords] = useState<TrendingKeyword[]>([]);
  const [loading, setLoading] = useState(true);
  const [likeLoading, setLikeLoading] = useState<Record<string, boolean>>({});
  const [exportLoading, setExportLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (propKeywords) {
      setKeywords(propKeywords);
      setLoading(false);
      return;
    }
    async function fetchTrending() {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/trending`);
        const data = await res.json();
        if (data.success) {
          setKeywords(data.data);
        }
      } catch (err) {
        console.error("Error fetching trending keywords:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchTrending();
  }, [propKeywords]);

  const handleLike = async (keyword: TrendingKeyword) => {
    setLikeLoading(prev => ({ ...prev, [keyword.id]: true }));
    try {
      const url = new URL(`${API_BASE_URL}/api/like`, window.location.origin);
      url.searchParams.append("query", keyword.query);
      url.searchParams.append("platform", keyword.platform);
      const res = await fetch(url.toString(), { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setKeywords(prev => prev.map(k => k.id === keyword.id ? { ...k, likes: data.likes } : k));
        if (onRefresh) {
          onRefresh();
        }
      }
    } catch (err) {
      console.error("Error liking keyword:", err);
    } finally {
      setLikeLoading(prev => ({ ...prev, [keyword.id]: false }));
    }
  };

  const exportKeywords = async (keyword: TrendingKeyword) => {
    setExportLoading(prev => ({ ...prev, [keyword.id]: true }));
    try {
      const endpoint = `${API_BASE_URL}/${keyword.platform}/all`;
      const url = new URL(endpoint, window.location.origin);
      url.searchParams.append("query", keyword.query);
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error("Failed to fetch keyword data");
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "API error");
      // Prepare CSV rows
      const csvRows = [
        ["Type", "Value"],
      ];
      if (data.data.keywords && data.data.keywords.length)
        data.data.keywords.forEach((k: string) => csvRows.push(["Keyword", k]));
      if (data.data.hashtags && data.data.hashtags.length)
        data.data.hashtags.forEach((h: string) => csvRows.push(["Hashtag", h]));
      if (data.data.questions && data.data.questions.length)
        data.data.questions.forEach((q: string) => csvRows.push(["Question", q]));
      if (data.data.prepositions && data.data.prepositions.length)
        data.data.prepositions.forEach((p: string) => csvRows.push(["Preposition", p]));
      if (data.data.generatedHashtags && data.data.generatedHashtags.length)
        data.data.generatedHashtags.forEach((g: string) => csvRows.push(["Generated Hashtag", g]));
      const csvContent = csvRows.map(row => row.map(String).map(cell => `"${cell.replace(/"/g, '""')}"`).join(",")).join("\n");
      const blob = new Blob([csvContent], { type: "text/csv" });
      const urlBlob = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = urlBlob;
      a.download = `${keyword.query}_${keyword.platform}_keywords.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(urlBlob);
      toast.success(`Exported keywords for '${keyword.query}' (${keyword.platform}) as CSV!`);
    } catch (err: any) {
      toast.error(err.message || "Failed to export keywords CSV");
    } finally {
      setExportLoading(prev => ({ ...prev, [keyword.id]: false }));
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Trending Keywords</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-6">
          <p className="text-muted-foreground text-center mb-4">
            Loading trending keywords...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!keywords.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Trending Keywords</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-6">
          <p className="text-muted-foreground text-center mb-4">
            No trending keywords found.
          </p>
          <p className="text-xs text-muted-foreground text-center">
            Data is aggregated across all languages and countries for each query and platform.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="rounded-md border">
      <div className="p-3 bg-muted/50 border-b">
        <p className="text-xs text-muted-foreground">
          Data is aggregated across all languages and countries for each query and platform.
        </p>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Like</TableHead>
            <TableHead>Query</TableHead>
            <TableHead>Platform</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Total Likes</TableHead>
            <TableHead>Total Views</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {keywords.map((keyword) => (
            <TableRow key={keyword.id}>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleLike(keyword)}
                  disabled={likeLoading[keyword.id]}
                  className="text-yellow-500"
                >
                  <StarIcon className="h-4 w-4" />
                </Button>
              </TableCell>
              <TableCell>
                <div className="font-medium">{keyword.query}</div>
                {keyword.title && (
                  <div className="text-xs text-muted-foreground">{keyword.title}</div>
                )}
              </TableCell>
              <TableCell>
                <Badge variant="outline">{keyword.platform}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant="secondary">{keyword.search_type}</Badge>
              </TableCell>
              <TableCell>{keyword.likes}</TableCell>
              <TableCell>{keyword.views || 0}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => {
                      if (onView) {
                        onView(keyword);
                      } else {
                        toast.info(`Keyword: ${keyword.query}\nPlatform: ${keyword.platform}`);
                      }
                    }}
                  >
                    <EyeIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => exportKeywords(keyword)}
                    title={exportLoading[keyword.id] ? "Exporting..." : "Export Keywords CSV"}
                    disabled={!!exportLoading[keyword.id]}
                    aria-label={exportLoading[keyword.id] ? "Exporting..." : "Export Keywords CSV"}
                  >
                    {exportLoading[keyword.id] ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <DownloadIcon className="h-4 w-4" />
                    )}
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          navigator.clipboard.writeText(keyword.query);
                          toast.success(`Copied '${keyword.query}' to clipboard!`);
                        }}
                      >
                        <CopyIcon className="mr-2 h-4 w-4" /> Copy
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
  );
}