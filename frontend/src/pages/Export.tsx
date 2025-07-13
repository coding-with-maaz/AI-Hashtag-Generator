import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  DownloadIcon,
  FileTextIcon,
  TableIcon,
  DatabaseIcon,
  FileJson2Icon,
  CircleDashed,
  CalendarIcon,
  CheckIcon
} from "lucide-react";

export default function Export() {
  const [exportType, setExportType] = useState<"keywords" | "history" | "both">("keywords");
  const [fileFormat, setFileFormat] = useState<"csv" | "json" | "excel">("csv");
  const [dateRange, setDateRange] = useState<"all" | "last7" | "last30" | "last90">("last30");
  
  // Export options
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [includePlatformData, setIncludePlatformData] = useState(true);
  const [exportInProgress, setExportInProgress] = useState(false);

  // Selected data types
  const [selectedTypes, setSelectedTypes] = useState({
    keywords: true,
    hashtags: true,
    questions: true,
    prepositions: true
  });

  const handleSelectedTypeChange = (type: keyof typeof selectedTypes) => {
    setSelectedTypes(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const handleExport = async () => {
    setExportInProgress(true);

    try {
      // In a real app, we would call an API to generate the export
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Determine what file extension to use based on format
      const extension = fileFormat === 'excel' ? 'xlsx' : fileFormat;
      
      toast.success(`Export complete! Download starting for hashtag_data.${extension}`);
      
      // In a real app, this would be a download link from the server
      // For demo purposes, we'll create a small sample file
      if (fileFormat === 'json') {
        const sampleData = {
          keywords: selectedTypes.keywords ? ["social media", "digital marketing"] : [],
          hashtags: selectedTypes.hashtags ? ["#socialmedia", "#marketing"] : [],
          questions: selectedTypes.questions ? ["What is social media marketing?"] : [],
          prepositions: selectedTypes.prepositions ? ["marketing for social media"] : [],
          metadata: includeMetadata ? {
            exportDate: new Date().toISOString(),
            platform: includePlatformData ? "all" : undefined,
            dateRange
          } : undefined
        };
        
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(sampleData, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `hashtag_data.${extension}`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
      } else {
        // For CSV/Excel, we would normally generate proper files
        // Here we just show a success message
        toast("For a real app, this would download a CSV/Excel file");
      }
    } catch (error) {
      toast.error("Export failed. Please try again.");
      console.error("Export error:", error);
    } finally {
      setExportInProgress(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Export Data</h1>
          <p className="text-muted-foreground">
            Export your saved keywords and search history
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Export Settings</CardTitle>
            <CardDescription>
              Configure how you want to export your data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>What would you like to export?</Label>
              <RadioGroup 
                defaultValue="keywords"
                value={exportType}
                onValueChange={(value) => setExportType(value as "keywords" | "history" | "both")}
                className="grid grid-cols-3 gap-4"
              >
                <div>
                  <RadioGroupItem 
                    value="keywords" 
                    id="export-keywords"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="export-keywords"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 hover:border-primary peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    <FileTextIcon className="mb-2 h-6 w-6" />
                    Saved Keywords
                  </Label>
                </div>
                
                <div>
                  <RadioGroupItem 
                    value="history" 
                    id="export-history"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="export-history"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 hover:border-primary peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    <DatabaseIcon className="mb-2 h-6 w-6" />
                    Search History
                  </Label>
                </div>
                
                <div>
                  <RadioGroupItem 
                    value="both" 
                    id="export-both"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="export-both"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 hover:border-primary peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    <TableIcon className="mb-2 h-6 w-6" />
                    Both
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>File Format</Label>
              <RadioGroup 
                defaultValue="csv"
                value={fileFormat}
                onValueChange={(value) => setFileFormat(value as "csv" | "json" | "excel")}
                className="grid grid-cols-3 gap-4"
              >
                <div>
                  <RadioGroupItem 
                    value="csv" 
                    id="format-csv"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="format-csv"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 hover:border-primary peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    <FileTextIcon className="mb-2 h-6 w-6" />
                    CSV
                  </Label>
                </div>
                
                <div>
                  <RadioGroupItem 
                    value="json" 
                    id="format-json"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="format-json"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 hover:border-primary peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    <FileJson2Icon className="mb-2 h-6 w-6" />
                    JSON
                  </Label>
                </div>
                
                <div>
                  <RadioGroupItem 
                    value="excel" 
                    id="format-excel"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="format-excel"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 hover:border-primary peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    <TableIcon className="mb-2 h-6 w-6" />
                    Excel
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>Date Range</Label>
              <RadioGroup 
                defaultValue="last30"
                value={dateRange}
                onValueChange={(value) => setDateRange(value as "all" | "last7" | "last30" | "last90")}
                className="grid grid-cols-4 gap-4"
              >
                <div>
                  <RadioGroupItem 
                    value="all" 
                    id="date-all"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="date-all"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 hover:border-primary peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    All Time
                  </Label>
                </div>
                
                <div>
                  <RadioGroupItem 
                    value="last7" 
                    id="date-last7"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="date-last7"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 hover:border-primary peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    Last 7 Days
                  </Label>
                </div>
                
                <div>
                  <RadioGroupItem 
                    value="last30" 
                    id="date-last30"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="date-last30"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 hover:border-primary peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    Last 30 Days
                  </Label>
                </div>
                
                <div>
                  <RadioGroupItem 
                    value="last90" 
                    id="date-last90"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="date-last90"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 hover:border-primary peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    Last 90 Days
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-4">
              <Label>Additional Options</Label>
              
              <div className="space-y-2 border rounded-md p-4">
                <Label className="text-base">Include Data Types</Label>
                
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="keywords" 
                      checked={selectedTypes.keywords}
                      onCheckedChange={() => handleSelectedTypeChange("keywords")}
                    />
                    <label
                      htmlFor="keywords"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Keywords
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="hashtags"
                      checked={selectedTypes.hashtags}
                      onCheckedChange={() => handleSelectedTypeChange("hashtags")}
                    />
                    <label
                      htmlFor="hashtags"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Hashtags
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="questions"
                      checked={selectedTypes.questions}
                      onCheckedChange={() => handleSelectedTypeChange("questions")}
                    />
                    <label
                      htmlFor="questions"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Questions
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="prepositions"
                      checked={selectedTypes.prepositions}
                      onCheckedChange={() => handleSelectedTypeChange("prepositions")}
                    />
                    <label
                      htmlFor="prepositions"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Prepositions
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="include-metadata">Include Metadata</Label>
                  <Switch
                    id="include-metadata"
                    checked={includeMetadata}
                    onCheckedChange={setIncludeMetadata}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="include-platform">Include Platform Data</Label>
                  <Switch
                    id="include-platform"
                    checked={includePlatformData}
                    onCheckedChange={setIncludePlatformData}
                  />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleExport} 
              className="ml-auto"
              disabled={exportInProgress}
            >
              {exportInProgress ? (
                <>
                  <CircleDashed className="mr-2 h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <DownloadIcon className="mr-2 h-4 w-4" />
                  Export Data
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Export History</CardTitle>
            <CardDescription>
              Previous data exports
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-2 border rounded-md">
                <div className="flex items-center space-x-4">
                  <FileTextIcon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">hashtag_data_export.csv</p>
                    <p className="text-xs text-muted-foreground">
                      <span className="inline-flex items-center"><CalendarIcon className="h-3 w-3 mr-1" />July 5, 2025</span>
                      <span className="ml-2">2.4 MB</span>
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <DownloadIcon className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-2 border rounded-md">
                <div className="flex items-center space-x-4">
                  <FileJson2Icon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">saved_keywords_june.json</p>
                    <p className="text-xs text-muted-foreground">
                      <span className="inline-flex items-center"><CalendarIcon className="h-3 w-3 mr-1" />June 28, 2025</span>
                      <span className="ml-2">1.8 MB</span>
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <DownloadIcon className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-2 border rounded-md">
                <div className="flex items-center space-x-4">
                  <TableIcon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">search_history_q2.xlsx</p>
                    <p className="text-xs text-muted-foreground">
                      <span className="inline-flex items-center"><CalendarIcon className="h-3 w-3 mr-1" />June 15, 2025</span>
                      <span className="ml-2">3.6 MB</span>
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <DownloadIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}