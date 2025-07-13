import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { AdMobConfigForm } from "@/components/dashboard/admob-config";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InfoIcon, CopyIcon, CheckCircle, DownloadIcon } from "lucide-react";
import { AdMobConfig, AdMobEnvironmentConfig } from "@/types";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { API_BASE_URL } from "@/lib/api";

export default function AdmobConfigPage() {
  const [config, setConfig] = useState<AdMobConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function fetchConfig() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/api/admob/config`);
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || "Failed to fetch AdMob config");
        }

        // Transform the backend data to frontend format
        const transformedConfig: AdMobConfig = {
          test: data.data.find((env: any) => env.environment === 'test') || {},
          production: data.data.find((env: any) => env.environment === 'production') || {},
          staging: data.data.find((env: any) => env.environment === 'staging') || {},
        };

        setConfig(transformedConfig);
      } catch (err: any) {
        setError(err.message || "Failed to load config");
        console.error("Error fetching AdMob config:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchConfig();
  }, []);

  const handleSaveConfig = async (environment: string, newConfig: Partial<AdMobEnvironmentConfig>) => {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/admob/config`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          environment,
          ...newConfig
        }),
      });
      
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || data.message || "Failed to save config");
      }
      
      // Update the local state
      setConfig((prev) => prev ? {
        ...prev,
        [environment]: { ...prev[environment], ...newConfig }
      } : null);
      
      toast.success(`${environment.charAt(0).toUpperCase() + environment.slice(1)} configuration saved successfully!`);
      return true;
    } catch (err: any) {
      setError(err.message || "Failed to save config");
      toast.error("Failed to save configuration");
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        setCopied({ ...copied, [field]: true });
        setTimeout(() => {
          setCopied({ ...copied, [field]: false });
        }, 2000);
        toast.success("Copied to clipboard");
      },
      () => {
        toast.error("Failed to copy text");
      }
    );
  };

  const downloadConfig = (environment: string) => {
    if (!config || !config[environment as keyof AdMobConfig]) return;
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(config[environment as keyof AdMobConfig], null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `admob-${environment}-config.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    toast.success(`Downloaded ${environment} configuration`);
  };

  const renderAdUnitTable = () => {
    if (!config) return null;

    const adTypes = [
      { key: 'banner', label: 'Banner', icon: '📱' },
      { key: 'interstitial', label: 'Interstitial', icon: '📺' },
      { key: 'appOpen', label: 'App Open', icon: '🚀' },
      { key: 'native', label: 'Native', icon: '📄' },
      { key: 'rewarded', label: 'Rewarded', icon: '🎁' },
      { key: 'rewardedInterstitial', label: 'Rewarded Interstitial', icon: '🎯' },
      { key: 'splash', label: 'Splash', icon: '⚡' },
    ];

    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>AdMob Ad Unit Configuration</CardTitle>
          <CardDescription>Compare ad unit configurations across environments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border">
              <thead>
                <tr className="bg-muted">
                  <th className="px-4 py-2 text-left">Ad Type</th>
                  <th className="px-4 py-2 text-left">Test Environment</th>
                  <th className="px-4 py-2 text-left">Production Environment</th>
                  <th className="px-4 py-2 text-left">Staging Environment</th>
                </tr>
              </thead>
              <tbody>
                {adTypes.map(adType => {
                  const testConfig = config.test?.[adType.key as keyof AdMobEnvironmentConfig] as any;
                  const prodConfig = config.production?.[adType.key as keyof AdMobEnvironmentConfig] as any;
                  const stagingConfig = config.staging?.[adType.key as keyof AdMobEnvironmentConfig] as any;

                  return (
                    <tr key={adType.key} className="border-t">
                      <td className="px-4 py-2 font-medium">
                        <span className="mr-2">{adType.icon}</span>
                        {adType.label}
                      </td>
                      <td className="px-4 py-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant={testConfig?.enabled ? "default" : "secondary"}>
                              {testConfig?.enabled ? "Enabled" : "Disabled"}
                            </Badge>
                            {testConfig?.adUnitId && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(testConfig.adUnitId, `test-${adType.key}`)}
                              >
                                {copied[`test-${adType.key}`] ? <CheckCircle className="h-3 w-3" /> : <CopyIcon className="h-3 w-3" />}
                              </Button>
                            )}
                          </div>
                          {testConfig?.adUnitId && (
                            <div className="text-xs font-mono text-muted-foreground truncate max-w-[200px]">
                              {testConfig.adUnitId}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant={prodConfig?.enabled ? "default" : "secondary"}>
                              {prodConfig?.enabled ? "Enabled" : "Disabled"}
                            </Badge>
                            {prodConfig?.adUnitId && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(prodConfig.adUnitId, `prod-${adType.key}`)}
                              >
                                {copied[`prod-${adType.key}`] ? <CheckCircle className="h-3 w-3" /> : <CopyIcon className="h-3 w-3" />}
                              </Button>
                            )}
                          </div>
                          {prodConfig?.adUnitId && (
                            <div className="text-xs font-mono text-muted-foreground truncate max-w-[200px]">
                              {prodConfig.adUnitId}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant={stagingConfig?.enabled ? "default" : "secondary"}>
                              {stagingConfig?.enabled ? "Enabled" : "Disabled"}
                            </Badge>
                            {stagingConfig?.adUnitId && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(stagingConfig.adUnitId, `staging-${adType.key}`)}
                              >
                                {copied[`staging-${adType.key}`] ? <CheckCircle className="h-3 w-3" /> : <CopyIcon className="h-3 w-3" />}
                              </Button>
                            )}
                          </div>
                          {stagingConfig?.adUnitId && (
                            <div className="text-xs font-mono text-muted-foreground truncate max-w-[200px]">
                              {stagingConfig.adUnitId}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderEnvironmentCards = () => {
    if (!config) return null;

    const environments = [
      { key: 'test', name: 'Test Environment', description: 'Development and testing configuration' },
      { key: 'production', name: 'Production Environment', description: 'Live app configuration' },
      { key: 'staging', name: 'Staging Environment', description: 'Pre-production testing' },
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {environments.map(env => {
          const envConfig = config[env.key as keyof AdMobConfig] as AdMobEnvironmentConfig;
          const enabledAds = envConfig ? Object.entries(envConfig).filter(([key, value]) => 
            key !== 'environment' && key !== 'id' && key !== 'created_by' && key !== 'notes' && 
            key !== 'metadata' && key !== 'created_at' && key !== 'updated_at' && 
            typeof value === 'object' && value && 'enabled' in value && value.enabled
          ).length : 0;

          return (
            <Card key={env.key} className="relative">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {env.name}
                  <Badge variant={envConfig ? "default" : "secondary"}>
                    {envConfig ? `${enabledAds} ads` : "Not configured"}
                  </Badge>
                </CardTitle>
                <CardDescription>{env.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {envConfig ? (
                  <div className="space-y-2">
                    <div className="text-sm">
                      <strong>Test Mode:</strong> {envConfig.globalConfig?.testMode ? "✅" : "❌"}
                    </div>
                    <div className="text-sm">
                      <strong>Debug Mode:</strong> {envConfig.globalConfig?.debugMode ? "✅" : "❌"}
                    </div>
                    <div className="text-sm">
                      <strong>Max Ads/Session:</strong> {envConfig.globalConfig?.maxAdsPerSession || "N/A"}
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadConfig(env.key)}
                      >
                        <DownloadIcon className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    No configuration found
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AdMob Configuration</h1>
          <p className="text-muted-foreground">
            Configure AdMob integration for your mobile application
          </p>
        </div>

        <Alert>
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>AdMob Integration</AlertTitle>
          <AlertDescription>
            Configure the AdMob ad unit IDs for your mobile app. Use test IDs during development to avoid policy violations.
            When ready for production, update with your actual ad unit IDs.
          </AlertDescription>
        </Alert>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>AdMob Documentation</CardTitle>
            <CardDescription>
              Important information about implementing AdMob in your mobile app
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold">Implementation Guide</h3>
              <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground">
                <li>For Android, add the AdMob SDK to your build.gradle file</li>
                <li>For iOS, add the AdMob SDK using CocoaPods or Swift Package Manager</li>
                <li>Initialize the AdMob SDK in your app using the App ID configured below</li>
                <li>Create ad instances using the ad unit IDs configured below</li>
                <li>Remember to use test ads during development</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Testing</h3>
              <p className="text-sm text-muted-foreground">
                The test environment is pre-configured with Google's test ad unit IDs.
                These IDs are specifically designed for testing and will always return test ads.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Environment Overview Cards */}
        {renderEnvironmentCards()}

        {/* Ad Unit Configuration Table */}
        {renderAdUnitTable()}

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading AdMob config...</div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">{error}</div>
        ) : (
          <AdMobConfigForm 
            initialConfig={config}
            onSave={handleSaveConfig}
            saving={saving}
          />
        )}
      </div>
    </DashboardLayout>
  );
}