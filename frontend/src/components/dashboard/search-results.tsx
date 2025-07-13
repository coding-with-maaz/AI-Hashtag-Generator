import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CheckIcon, CopyIcon, BookmarkIcon, StarIcon } from "lucide-react";
import { useState } from "react";
import { SearchResponse } from "@/types";
import { toast } from "sonner";
import { API_BASE_URL } from "@/lib/api";

interface SearchResultsProps {
  results?: SearchResponse;
  loading?: boolean;
  onSave?: () => void;
}

export function SearchResults({ results, loading, onSave }: SearchResultsProps) {
  const [copied, setCopied] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState("keywords");
  const [likeCount, setLikeCount] = useState<number>(results?.data?.likes ?? 0);
  const [likeLoading, setLikeLoading] = useState(false);
  const [selected, setSelected] = useState<Record<string, Set<number>>>({
    keywords: new Set(),
    hashtags: new Set(),
    questions: new Set(),
    prepositions: new Set(),
  });
  
  if (loading) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Loading Results...</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  if (!results) return null;

  // Defensive: fallback to empty object if metadata is missing
  const metadata: any = results.metadata ?? {};
  const platform = metadata.platform ?? "unknown";

  const hasKeywords = results.data?.keywords && results.data.keywords.length > 0;
  const hasHashtags = results.data?.hashtags && results.data.hashtags.length > 0;
  const hasQuestions = results.data?.questions && results.data.questions.length > 0;
  const hasPrepositions = results.data?.prepositions && results.data.prepositions.length > 0;

  const totalHashtags = metadata.totalHashtags ?? metadata.total_hashtags ?? results.data?.hashtags?.length ?? 0;
  const totalGeneratedHashtags = metadata.totalGeneratedHashtags ?? metadata.total_generated_hashtags ?? results.data?.generatedHashtags?.length ?? 0;

  const hasScrapedHashtags = results.data?.hashtags && results.data.hashtags.length > 0;
  const hasGeneratedHashtags = results.data?.generatedHashtags && results.data.generatedHashtags.length > 0;
  const hasAnyHashtags = hasScrapedHashtags || hasGeneratedHashtags;

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        setCopied({ ...copied, [type]: true });
        setTimeout(() => {
          setCopied({ ...copied, [type]: false });
        }, 2000);
        toast.success("Copied to clipboard!");
      },
      () => {
        toast.error("Failed to copy text");
      }
    );
  };

  const handleSave = () => {
    if (onSave) onSave();
    toast.success("Search results saved successfully!");
  };

  const handleLike = async () => {
    if (!results) return;
    setLikeLoading(true);
    try {
      // Extract metadata from search results
      const { query, platform } = results.metadata || {};
      
      const url = new URL("/api/like", API_BASE_URL);
      if (query) url.searchParams.append("query", query);
      if (platform) url.searchParams.append("platform", platform);
      // Remove language and country parameters since backend now finds records by query and platform only
      
      console.log("LIKE URL:", url.toString());
      console.log("LIKE METADATA:", { query, platform });
      
      const res = await fetch(url.toString(), { method: "POST" });
      if (!res.ok) throw new Error("Failed to like");
      const data = await res.json();
      setLikeCount(data.likes ?? (likeCount + 1));
      toast.success("Thanks for liking!");
    } catch (err: any) {
      toast.error(err.message || "Failed to like");
    } finally {
      setLikeLoading(false);
    }
  };

  const handleSelect = (type: string, idx: number) => {
    setSelected(prev => {
      const newSet = new Set(prev[type]);
      if (newSet.has(idx)) {
        newSet.delete(idx);
      } else {
        if (newSet.size < 10) {
          newSet.add(idx);
        } else {
          toast.error("You can select up to 10 items only.");
        }
      }
      return { ...prev, [type]: newSet };
    });
  };

  const handleCopySelected = (items: string[] | undefined, type: string) => {
    if (!items) return;
    const indices = Array.from(selected[type]);
    if (indices.length === 0) {
      toast.error("No items selected.");
      return;
    }
    const toCopy = indices.map(i => items[i]).join(", ");
    navigator.clipboard.writeText(toCopy).then(
      () => {
        toast.success("Copied selected items!");
      },
      () => {
        toast.error("Failed to copy selected items");
      }
    );
  };

  const renderItems = (items: string[] | undefined, type: string) => {
    if (!items || items.length === 0) {
      return <p className="text-muted-foreground py-4 text-center">No {type} found</p>;
    }

    return (
      <div className="space-y-2">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {items.map((item, index) => (
            <div 
              key={index}
              className="bg-secondary/20 p-2 rounded-md flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selected[type]?.has(index) || false}
                  onChange={() => handleSelect(type, index)}
                  className="accent-primary"
                  aria-label={`Select ${item}`}
                />
                <span className="text-sm">{item}</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => copyToClipboard(item, `${type}-${index}`)}
              >
                {copied[`${type}-${index}`] ? <CheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
              </Button>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={() => handleCopySelected(items, type)}
          >
            <CopyIcon className="mr-2 h-4 w-4" />
            Copy Selected
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={() => copyToClipboard(items.join(', '), type)}
          >
            {copied[type] ? <CheckIcon className="mr-2 h-4 w-4" /> : <CopyIcon className="mr-2 h-4 w-4" />}
            Copy All
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>
          Search Results
          {platform && platform !== "unknown" && (
            <Badge variant="outline" className="ml-2">
              {platform}
            </Badge>
          )}
          {(metadata.language || metadata.country) && (
            <Badge variant="secondary" className="ml-2">
              {metadata.language || 'en'}/{metadata.country || 'us'}
            </Badge>
          )}
        </CardTitle>
        <div className="flex space-x-2">
          <Button size="sm" variant="outline" onClick={handleSave}>
            <BookmarkIcon className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button size="sm" variant="outline" onClick={handleLike} disabled={likeLoading}>
            <StarIcon className="h-4 w-4 mr-2" />
            {likeLoading ? "Liking..." : `Like${likeCount > 0 ? ` (${likeCount})` : ""}`}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs 
          defaultValue={hasKeywords ? "keywords" : (hasHashtags ? "hashtags" : (hasQuestions ? "questions" : "prepositions"))} 
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="keywords" disabled={!hasKeywords}>
              Keywords {hasKeywords && <span className="ml-1 text-xs opacity-70">({results.data.keywords?.length})</span>}
            </TabsTrigger>
            <TabsTrigger value="hashtags" disabled={!hasAnyHashtags}>
              Hashtags {hasAnyHashtags && (
                <span className="ml-1 text-xs opacity-70">(Scraped: {totalHashtags}, Generated: {totalGeneratedHashtags})</span>
              )}
            </TabsTrigger>
            <TabsTrigger value="questions" disabled={!hasQuestions}>
              Questions {hasQuestions && <span className="ml-1 text-xs opacity-70">({results.data.questions?.length})</span>}
            </TabsTrigger>
            <TabsTrigger value="prepositions" disabled={!hasPrepositions}>
              Prepositions {hasPrepositions && <span className="ml-1 text-xs opacity-70">({results.data.prepositions?.length})</span>}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="keywords" className="mt-4">
            {renderItems(results.data.keywords, 'keywords')}
          </TabsContent>
          
          <TabsContent value="hashtags" className="mt-4">
            <div className="mb-2 text-xs text-muted-foreground">
              <strong>Total Scraped Hashtags:</strong> {totalHashtags} &nbsp;|&nbsp; <strong>Total Generated Hashtags:</strong> {totalGeneratedHashtags}
            </div>
            {hasScrapedHashtags && (
              <div className="mb-2">
                <div className="font-semibold mb-1">Scraped Hashtags</div>
                {renderItems(results.data.hashtags, 'hashtags')}
              </div>
            )}
            {hasGeneratedHashtags && (
              <div>
                <div className="font-semibold mb-1">Generated Hashtags</div>
                {renderItems(results.data.generatedHashtags, 'generatedHashtags')}
              </div>
            )}
            {!hasScrapedHashtags && !hasGeneratedHashtags && (
              <div className="text-center text-muted-foreground">No hashtags found.</div>
            )}
          </TabsContent>
          
          <TabsContent value="questions" className="mt-4">
            {renderItems(results.data.questions, 'questions')}
          </TabsContent>
          
          <TabsContent value="prepositions" className="mt-4">
            {renderItems(results.data.prepositions, 'prepositions')}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground flex justify-between border-t pt-4">
        <div className="flex flex-col gap-1">
          <span>Query: "{metadata.query ?? ''}"</span>
          {(metadata.language || metadata.country) && (
            <span>Locale: {metadata.language || 'en'}/{metadata.country || 'us'}</span>
          )}
        </div>
        <span>{metadata.timestamp ? new Date(metadata.timestamp).toLocaleString() : ''}</span>
      </CardFooter>
    </Card>
  );
}