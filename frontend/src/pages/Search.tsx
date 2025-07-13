import { useState, useCallback, useEffect, useRef } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { SearchForm } from "@/components/dashboard/search-form";
import { SearchResults } from "@/components/dashboard/search-results";
import { ServerStatus } from "@/components/dashboard/server-status";
import { SearchResponse } from "@/types";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { API_BASE_URL } from "@/lib/api";

// Map platform to API endpoint
const PLATFORM_ENDPOINTS: Record<string, string> = {
  google: "/api/google/all",
  youtube: "/api/youtube/all",
  bing: "/api/bing/all",
  playstore: "/api/playstore/all",
  appstore: "/api/appstore/all",
};

export default function Search() {
  const [searchResults, setSearchResults] = useState<SearchResponse | undefined>(undefined);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [searchingText, setSearchingText] = useState("Searching...");
  const searchingIndex = useRef(0);
  const searchingChars = Array.from({length: 26}, (_, i) => String.fromCharCode(65 + i));

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (searchLoading) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress((old) => {
          if (old < 90) return old + 10;
          return 90;
        });
      }, 200);
    } else {
      setProgress(100);
      setTimeout(() => setProgress(0), 400);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [searchLoading]);

  useEffect(() => {
    let textInterval: NodeJS.Timeout | undefined;
    if (searchLoading) {
      searchingIndex.current = 0;
      setSearchingText(`Searching ${searchingChars[0]}...`);
      textInterval = setInterval(() => {
        searchingIndex.current = (searchingIndex.current + 1) % searchingChars.length;
        setSearchingText(`Searching ${searchingChars[searchingIndex.current]}...`);
      }, 100);
    } else {
      setSearchingText("Searching...");
    }
    return () => {
      if (textInterval) clearInterval(textInterval);
    };
  }, [searchLoading]);

  // Callback to refresh trending data (can be used by parent components)
  const refreshTrendingData = useCallback(() => {
    // This will be called after successful searches to refresh trending data
    // The trending pages can listen for this event
    window.dispatchEvent(new CustomEvent('trendingDataRefresh'));
  }, []);

  // Handler for search submission from SearchForm
  const handleSearch = async (params: {
    platform: string;
    query: string;
    language?: string;
    country?: string;
  }) => {
    setSearchLoading(true);
    setError(null);
    setSearchResults(undefined);
    try {
      const endpoint = PLATFORM_ENDPOINTS[params.platform];
      if (!endpoint) {
        setError("Unsupported platform");
        setSearchLoading(false);
        return;
      }
      
      // Build query string
      const url = new URL(endpoint, API_BASE_URL);
      url.searchParams.append("query", params.query);
      
      // Add language and country parameters for search
      if (params.platform === "bing") {
        // Bing expects 'mkt' as 'en-US', 'fr-FR', etc.
        const mkt = `${params.language || "en"}-${(params.country || "us").toUpperCase()}`;
        url.searchParams.append("mkt", mkt);
      } else {
        if (params.language) url.searchParams.append("language", params.language);
        if (params.country) url.searchParams.append("country", params.country);
      }

      console.log(`🔍 Making API request to: ${url.toString()}`);
      
      const res = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        // Add timeout for better error handling
        signal: AbortSignal.timeout(30000) // 30 second timeout
      });
      
      console.log(`📡 Response status: ${res.status} ${res.statusText}`);
      
      const contentType = res.headers.get("content-type");
      console.log(`📄 Content-Type: ${contentType}`);
      
      if (!res.ok) {
        let errMsg = `HTTP ${res.status}: ${res.statusText}`;
        
        try {
          if (contentType && contentType.includes("application/json")) {
            const err = await res.json();
            errMsg = err.message || err.error || errMsg;
            console.error('❌ API Error Response:', err);
          } else {
            const text = await res.text();
            errMsg = text || errMsg;
            console.error('❌ API Error Text:', text);
          }
        } catch (parseError) {
          console.error('❌ Failed to parse error response:', parseError);
        }
        
        // Provide specific error messages for common issues
        if (res.status === 500) {
          errMsg = `Server error (500): The backend server is experiencing issues. Please try again later or contact support.`;
        } else if (res.status === 404) {
          errMsg = `Endpoint not found (404): The API endpoint is not available.`;
        } else if (res.status === 503) {
          errMsg = `Service unavailable (503): The server is temporarily unavailable.`;
        }
        
        throw new Error(errMsg);
      }
      
      let data;
      try {
        if (contentType && contentType.includes("application/json")) {
          data = await res.json();
          console.log(`✅ API Response for ${params.platform}:`, data);
        } else {
          throw new Error("Response is not JSON");
        }
      } catch (parseError) {
        console.error('❌ Failed to parse response:', parseError);
        throw new Error("Invalid response format from server");
      }
      
      if (!data.success) {
        throw new Error(data.message || data.error || "API returned error");
      }
      
      // Transform the response to match SearchResponse format
      const transformedResponse: SearchResponse = {
        data: data.data,
        metadata: {
          query: data.data.query || params.query,
          platform: params.platform,
          search_type: 'all',
          timestamp: data.data.timestamp || new Date().toISOString(),
          language: params.language || 'en',
          country: params.country || 'us'
        }
      };
      
      setSearchResults(transformedResponse);
      
      // Track view for this keyword search
      try {
        const viewUrl = new URL("/api/view", API_BASE_URL);
        viewUrl.searchParams.append("query", params.query);
        viewUrl.searchParams.append("platform", params.platform);
        // Remove language and country parameters since backend now finds records by query and platform only
        await fetch(viewUrl.toString(), { method: "POST" });
        console.log(`✅ View tracked for ${params.platform}: ${params.query}`);
        
        // Refresh trending data after successful search and view tracking
        refreshTrendingData();
      } catch (viewError) {
        console.error("Failed to track view:", viewError);
        // Don't fail the search if view tracking fails
      }
    } catch (err: any) {
      console.error('❌ Search error:', err);
      
      // Provide user-friendly error messages
      let userMessage = err.message || "Unknown error";
      
      if (err.name === 'AbortError') {
        userMessage = "Request timed out. Please try again.";
      } else if (err.message.includes('Failed to fetch')) {
        userMessage = "Cannot connect to server. Please check your internet connection.";
      } else if (err.message.includes('500')) {
        userMessage = "Server error. Please try again later.";
      }
      
      setError(userMessage);
      toast.error(userMessage);
    } finally {
      setSearchLoading(false);
    }
  };

  // Simulate saving search results
  const handleSaveResults = () => {
    toast.success("Search results saved successfully!");
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Keyword Search</h1>
          <p className="text-muted-foreground">
            Search for keywords, hashtags, questions, and prepositions
          </p>
        </div>

        {/* Server Status for debugging */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ServerStatus />
        </div>

        {/* Pass handleSearch to SearchForm */}
        <SearchForm onSearch={handleSearch} loading={searchLoading} />

        {searchLoading && (
          <div className="w-full mt-2">
            <div className="text-center text-xs text-muted-foreground mb-1 font-mono tracking-widest animate-pulse">{searchingText}</div>
            <Progress value={progress} />
          </div>
        )}

        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}

        <SearchResults 
          results={searchResults} 
          loading={searchLoading} 
          onSave={handleSaveResults}
        />
      </div>
    </DashboardLayout>
  );
}