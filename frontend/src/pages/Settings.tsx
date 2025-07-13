import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { User } from "@/types";

export default function Settings() {
  // User profile state
  const [profile, setProfile] = useState<Partial<User>>({
    id: "user-1",
    email: "user@example.com",
    first_name: "John",
    last_name: "Doe",
    profile_image: null,
    created_at: "2025-01-15T12:00:00.000Z"
  });

  // App preferences
  const [preferences, setPreferences] = useState({
    language: "en-US",
    theme: "system",
    searchHistory: true,
    saveResults: true,
    showTips: true,
    emailNotifications: true,
    appNotifications: true
  });

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // API key state (simulated)
  const [apiKey, setApiKey] = useState("api-key-*****");
  const [showApiKey, setShowApiKey] = useState(false);

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Profile updated successfully!");
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords don't match!");
      return;
    }
    
    // In a real app, we would call an API to update the password
    toast.success("Password updated successfully!");
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
  };

  const handlePreferencesChange = (key: keyof typeof preferences, value: boolean | string) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
    
    toast.success(`${key} preference updated!`);
  };

  const handleProfileChange = (key: keyof typeof profile, value: string) => {
    setProfile(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const regenerateApiKey = () => {
    // In a real app, we would call an API to regenerate the key
    setTimeout(() => {
      setApiKey("api-" + Math.random().toString(36).substring(2, 10));
      toast.success("API key regenerated successfully!");
    }, 1000);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="api">API</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <Card>
              <form onSubmit={handleProfileUpdate}>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your personal information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0 items-center">
                    <div>
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={profile.profile_image || ""} alt={`${profile.first_name} ${profile.last_name}`} />
                        <AvatarFallback className="text-2xl">
                          {profile.first_name?.charAt(0)}{profile.last_name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="space-y-1 flex-1">
                      <Label>Profile Photo</Label>
                      <Input type="file" className="mt-1" />
                      <p className="text-sm text-muted-foreground">
                        Recommended: Square image, at least 300x300px
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="first-name">First name</Label>
                      <Input 
                        id="first-name" 
                        value={profile.first_name || ""} 
                        onChange={(e) => handleProfileChange("first_name", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last-name">Last name</Label>
                      <Input 
                        id="last-name" 
                        value={profile.last_name || ""} 
                        onChange={(e) => handleProfileChange("last_name", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email address</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={profile.email || ""} 
                      onChange={(e) => handleProfileChange("email", e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <Label>Account Created</Label>
                    <p className="text-sm text-muted-foreground">
                      {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : ""}
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                  <Button type="submit">Save Changes</Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          
          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>
                  Customize how the application looks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select
                    value={preferences.language}
                    onValueChange={(value) => handlePreferencesChange("language", value)}
                  >
                    <SelectTrigger className="w-full sm:w-[240px]">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Languages</SelectLabel>
                        <SelectItem value="en-US">English (US)</SelectItem>
                        <SelectItem value="en-GB">English (UK)</SelectItem>
                        <SelectItem value="fr-FR">Français</SelectItem>
                        <SelectItem value="es-ES">Español</SelectItem>
                        <SelectItem value="de-DE">Deutsch</SelectItem>
                        <SelectItem value="ja-JP">日本語</SelectItem>
                        <SelectItem value="zh-CN">中文</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <Select
                    value={preferences.theme}
                    onValueChange={(value) => handlePreferencesChange("theme", value)}
                  >
                    <SelectTrigger className="w-full sm:w-[240px]">
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Application Preferences</CardTitle>
                <CardDescription>
                  Configure how the application behaves
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="search-history">Save Search History</Label>
                    <p className="text-sm text-muted-foreground">
                      Keep a record of your keyword searches
                    </p>
                  </div>
                  <Switch
                    id="search-history"
                    checked={preferences.searchHistory}
                    onCheckedChange={(checked) => handlePreferencesChange("searchHistory", checked)}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="save-results">Auto-save Results</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically save search results
                    </p>
                  </div>
                  <Switch
                    id="save-results"
                    checked={preferences.saveResults}
                    onCheckedChange={(checked) => handlePreferencesChange("saveResults", checked)}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="show-tips">Show Tips</Label>
                    <p className="text-sm text-muted-foreground">
                      Display helpful tips and suggestions
                    </p>
                  </div>
                  <Switch
                    id="show-tips"
                    checked={preferences.showTips}
                    onCheckedChange={(checked) => handlePreferencesChange("showTips", checked)}
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>
                  Configure your notification preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive updates and reports by email
                    </p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={preferences.emailNotifications}
                    onCheckedChange={(checked) => handlePreferencesChange("emailNotifications", checked)}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="app-notifications">App Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive in-app notifications and alerts
                    </p>
                  </div>
                  <Switch
                    id="app-notifications"
                    checked={preferences.appNotifications}
                    onCheckedChange={(checked) => handlePreferencesChange("appNotifications", checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="security">
            <Card>
              <form onSubmit={handlePasswordChange}>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>
                    Update your account password
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input
                      id="current-password"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    />
                  </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                  <Button type="submit">Change Password</Button>
                </CardFooter>
              </form>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Login Sessions</CardTitle>
                <CardDescription>
                  Manage your active login sessions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-2 border rounded-md">
                    <div>
                      <p className="font-medium">Current Session</p>
                      <p className="text-xs text-muted-foreground">
                        Los Angeles, CA • Chrome on Windows • July 7, 2025
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Active
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-2 border rounded-md">
                    <div>
                      <p className="font-medium">Mobile App</p>
                      <p className="text-xs text-muted-foreground">
                        Los Angeles, CA • iPhone App • July 5, 2025
                      </p>
                    </div>
                    <Button variant="outline" size="sm">Sign Out</Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-2 border rounded-md">
                    <div>
                      <p className="font-medium">Tablet</p>
                      <p className="text-xs text-muted-foreground">
                        New York, NY • iPad Safari • July 3, 2025
                      </p>
                    </div>
                    <Button variant="outline" size="sm">Sign Out</Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button variant="outline" className="text-red-600 hover:bg-red-50">Sign Out All Devices</Button>
              </CardFooter>
            </Card>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Account Danger Zone</CardTitle>
                <CardDescription>
                  Irreversible account actions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border border-red-200 bg-red-50 p-4">
                  <div className="flex flex-col space-y-2">
                    <h3 className="font-medium text-red-800">Delete Account</h3>
                    <p className="text-sm text-red-700">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                  </div>
                  <div className="mt-4">
                    <Button variant="destructive">Delete Account</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="api">
            <Card>
              <CardHeader>
                <CardTitle>API Integration</CardTitle>
                <CardDescription>
                  Manage your API keys and integration settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="api-key">Your API Key</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="api-key"
                      type={showApiKey ? "text" : "password"}
                      value={apiKey}
                      readOnly
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? "Hide" : "Show"}
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={regenerateApiKey}
                    >
                      Regenerate
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>API Documentation</Label>
                  <div className="rounded-md border p-4">
                    <div className="prose prose-sm max-w-none">
                      <p>
                        Use this API key to authenticate requests to our API endpoints. 
                        To get started, include the API key in your request headers:
                      </p>
                      <pre className="bg-muted p-2 rounded-md overflow-x-auto mt-2">
                        <code>{`Authorization: Bearer [YOUR_API_KEY]`}</code>
                      </pre>
                      <p>Example API endpoints:</p>
                      <ul>
                        <li><code>/api/v1/search</code> - Search for keywords</li>
                        <li><code>/api/v1/keywords</code> - Manage saved keywords</li>
                        <li><code>/api/v1/hashtags</code> - Retrieve hashtag suggestions</li>
                      </ul>
                      <p>
                        For complete documentation, visit our{" "}
                        <a className="text-blue-600 hover:underline">API Documentation</a>.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-4 flex justify-between">
                <Button variant="outline">View Documentation</Button>
                <Button>Save Changes</Button>
              </CardFooter>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Webhook Configuration</CardTitle>
                <CardDescription>
                  Set up webhooks to receive real-time notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="webhook-url">Webhook URL</Label>
                  <Input
                    id="webhook-url"
                    type="url"
                    placeholder="https://your-app.com/webhook"
                  />
                  <p className="text-xs text-muted-foreground">
                    We'll send POST requests to this URL when events occur
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label>Events to Notify</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="event-search" />
                      <label
                        htmlFor="event-search"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Search Completed
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="event-save" />
                      <label
                        htmlFor="event-save"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Keywords Saved
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="event-export" />
                      <label
                        htmlFor="event-export"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Export Generated
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="event-config" />
                      <label
                        htmlFor="event-config"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Config Changed
                      </label>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button type="submit">Save Webhook Configuration</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}