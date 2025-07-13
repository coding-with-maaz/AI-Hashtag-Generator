import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, FormEvent } from "react";
import { CountryLanguageSelector } from "@/components/ui/CountryLanguageSelector";

interface SearchFormProps {
  onSearch: (params: {
    platform: string;
    query: string;
    language?: string;
    country?: string;
  }) => void;
  loading?: boolean;
}

export function SearchForm({ onSearch, loading }: SearchFormProps) {
  const [platform, setPlatform] = useState("google");
  const [query, setQuery] = useState("");
  const [language, setLanguage] = useState("en");
  const [country, setCountry] = useState("us");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSearch({
      platform,
      query,
      language,
      country,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Keyword Search</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="google" onValueChange={(value) => setPlatform(value)}>
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="google">Google</TabsTrigger>
              <TabsTrigger value="youtube">YouTube</TabsTrigger>
              <TabsTrigger value="bing">Bing</TabsTrigger>
              <TabsTrigger value="playstore">Play Store</TabsTrigger>
              <TabsTrigger value="appstore">App Store</TabsTrigger>
            </TabsList>

            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="query">Search Query</Label>
                  <Input 
                    id="query" 
                    placeholder="Enter keyword to search..." 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    required
                  />
                </div>
              </div>

              {(platform === "google" || platform === "youtube" || platform === "bing" || platform === "playstore" || platform === "appstore") && (
                <CountryLanguageSelector
                  language={language}
                  country={country}
                  onLanguageChange={setLanguage}
                  onCountryChange={setCountry}
                  disabled={loading}
                />
              )}

            </div>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}