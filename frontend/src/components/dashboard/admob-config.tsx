import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { AdMobConfig, AdMobEnvironmentConfig, AdMobAdConfig, AdMobGlobalConfig } from "@/types";
import { useState, FormEvent } from "react";
import { toast } from "sonner";
import { CopyIcon, CheckCircle, DownloadIcon, SaveIcon } from "lucide-react";

interface AdMobConfigProps {
  initialConfig?: AdMobConfig;
  onSave?: (environment: string, config: Partial<AdMobEnvironmentConfig>) => Promise<boolean>;
  saving?: boolean;
}

export function AdMobConfigForm({ initialConfig, onSave, saving }: AdMobConfigProps) {
  const [environment, setEnvironment] = useState<"test" | "production" | "staging">("test");
  const [config, setConfig] = useState<AdMobConfig | undefined>(initialConfig);
  const [copied, setCopied] = useState<Record<string, boolean>>({});

  // If config is not loaded, show loading state
  if (!config) {
    return <div className="text-center py-12 text-muted-foreground">Loading AdMob config...</div>;
  }

  const currentEnvConfig = config[environment] as AdMobEnvironmentConfig;

  const handleAdConfigChange = (adType: keyof AdMobEnvironmentConfig, field: keyof AdMobAdConfig, value: any) => {
    if (!currentEnvConfig || typeof currentEnvConfig[adType] !== 'object') return;
    
    setConfig({
      ...config,
      [environment]: {
        ...currentEnvConfig,
        [adType]: {
          ...(currentEnvConfig[adType] as AdMobAdConfig),
          [field]: value,
        },
      },
    });
  };

  const handleGlobalConfigChange = (field: keyof AdMobGlobalConfig, value: any) => {
    if (!currentEnvConfig?.globalConfig) return;
    
    setConfig({
      ...config,
      [environment]: {
        ...currentEnvConfig,
        globalConfig: {
          ...currentEnvConfig.globalConfig,
          [field]: value,
        },
      },
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!onSave) return;

    try {
      await onSave(environment, config[environment] as AdMobEnvironmentConfig);
    } catch (error) {
      console.error("Error saving AdMob config:", error);
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

  const downloadConfig = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(config[environment], null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `admob-${environment}-config.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    toast.success(`Downloaded ${environment} configuration`);
  };

  const renderAdConfigSection = (adType: string, adConfig: AdMobAdConfig, title: string) => (
    <div className="space-y-4 p-4 border rounded-lg">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{title}</h3>
        <Switch
          checked={adConfig.enabled}
          onCheckedChange={(checked) => handleAdConfigChange(adType as keyof AdMobEnvironmentConfig, 'enabled', checked)}
        />
      </div>
      
      {adConfig.enabled && (
        <div className="space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor={`${environment}-${adType}-adunit`}>Ad Unit ID</Label>
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                onClick={() => copyToClipboard(adConfig.adUnitId || "", `${environment}-${adType}-adunit`)}
              >
                {copied[`${environment}-${adType}-adunit`] ? <CheckCircle className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
              </Button>
            </div>
            <Input
              id={`${environment}-${adType}-adunit`}
              value={adConfig.adUnitId || ""}
              onChange={(e) => handleAdConfigChange(adType as keyof AdMobEnvironmentConfig, 'adUnitId', e.target.value)}
              placeholder="ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX"
            />
          </div>

          {adType === 'banner' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`${environment}-${adType}-position`}>Position</Label>
                <Input
                  id={`${environment}-${adType}-position`}
                  value={adConfig.position || ""}
                  onChange={(e) => handleAdConfigChange(adType as keyof AdMobEnvironmentConfig, 'position', e.target.value)}
                  placeholder="bottom"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${environment}-${adType}-refresh`}>Refresh Interval (s)</Label>
                <Input
                  id={`${environment}-${adType}-refresh`}
                  type="number"
                  value={adConfig.refreshInterval || ""}
                  onChange={(e) => handleAdConfigChange(adType as keyof AdMobEnvironmentConfig, 'refreshInterval', parseInt(e.target.value))}
                  placeholder="60"
                />
              </div>
            </div>
          )}

          {adType === 'interstitial' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`${environment}-${adType}-mininterval`}>Min Interval (s)</Label>
                <Input
                  id={`${environment}-${adType}-mininterval`}
                  type="number"
                  value={adConfig.minInterval || ""}
                  onChange={(e) => handleAdConfigChange(adType as keyof AdMobEnvironmentConfig, 'minInterval', parseInt(e.target.value))}
                  placeholder="300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${environment}-${adType}-showonjob`}>Show on Job View</Label>
                <Switch
                  id={`${environment}-${adType}-showonjob`}
                  checked={adConfig.showOnJobView || false}
                  onCheckedChange={(checked) => handleAdConfigChange(adType as keyof AdMobEnvironmentConfig, 'showOnJobView', checked)}
                />
              </div>
            </div>
          )}

          {adType === 'appOpen' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`${environment}-${adType}-maxshows`}>Max Shows/Day</Label>
                <Input
                  id={`${environment}-${adType}-maxshows`}
                  type="number"
                  value={adConfig.maxShowsPerDay || ""}
                  onChange={(e) => handleAdConfigChange(adType as keyof AdMobEnvironmentConfig, 'maxShowsPerDay', parseInt(e.target.value))}
                  placeholder="3"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${environment}-${adType}-showonresume`}>Show on Resume</Label>
                <Switch
                  id={`${environment}-${adType}-showonresume`}
                  checked={adConfig.showOnResume || false}
                  onCheckedChange={(checked) => handleAdConfigChange(adType as keyof AdMobEnvironmentConfig, 'showOnResume', checked)}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderGlobalConfigSection = () => {
    if (!currentEnvConfig?.globalConfig) return null;

    return (
      <div className="space-y-4 p-4 border rounded-lg">
        <h3 className="font-semibold">Global Configuration</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`${environment}-testmode`}>Test Mode</Label>
            <Switch
              id={`${environment}-testmode`}
              checked={currentEnvConfig.globalConfig.testMode}
              onCheckedChange={(checked) => handleGlobalConfigChange('testMode', checked)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${environment}-debugmode`}>Debug Mode</Label>
            <Switch
              id={`${environment}-debugmode`}
              checked={currentEnvConfig.globalConfig.debugMode}
              onCheckedChange={(checked) => handleGlobalConfigChange('debugMode', checked)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${environment}-maxads`}>Max Ads/Session</Label>
            <Input
              id={`${environment}-maxads`}
              type="number"
              value={currentEnvConfig.globalConfig.maxAdsPerSession || ""}
              onChange={(e) => handleGlobalConfigChange('maxAdsPerSession', parseInt(e.target.value))}
              placeholder="10"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${environment}-cooldown`}>Cooldown Period (s)</Label>
            <Input
              id={`${environment}-cooldown`}
              type="number"
              value={currentEnvConfig.globalConfig.cooldownPeriod || ""}
              onChange={(e) => handleGlobalConfigChange('cooldownPeriod', parseInt(e.target.value))}
              placeholder="60"
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>AdMob Configuration</CardTitle>
          <CardDescription>
            Manage your AdMob ad unit configurations for different environments.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="test" value={environment} onValueChange={(v) => setEnvironment(v as "test" | "production" | "staging")}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="test">Test Environment</TabsTrigger>
              <TabsTrigger value="production">Production Environment</TabsTrigger>
              <TabsTrigger value="staging">Staging Environment</TabsTrigger>
            </TabsList>
            
            <div className="space-y-6 mt-6">
              {currentEnvConfig && (
                <>
                  {/* Banner Ad */}
                  {renderAdConfigSection('banner', currentEnvConfig.banner, 'Banner Ad')}
                  
                  {/* Interstitial Ad */}
                  {renderAdConfigSection('interstitial', currentEnvConfig.interstitial, 'Interstitial Ad')}
                  
                  {/* App Open Ad */}
                  {renderAdConfigSection('appOpen', currentEnvConfig.appOpen, 'App Open Ad')}
                  
                  {/* Native Ad */}
                  {renderAdConfigSection('native', currentEnvConfig.native, 'Native Ad')}
                  
                  {/* Rewarded Ad */}
                  {renderAdConfigSection('rewarded', currentEnvConfig.rewarded, 'Rewarded Ad')}
                  
                  {/* Rewarded Interstitial Ad */}
                  {renderAdConfigSection('rewardedInterstitial', currentEnvConfig.rewardedInterstitial, 'Rewarded Interstitial Ad')}
                  
                  {/* Splash Ad */}
                  {renderAdConfigSection('splash', currentEnvConfig.splash, 'Splash Ad')}
                  
                  {/* Global Configuration */}
                  {renderGlobalConfigSection()}
                  
                  {/* Notes */}
                  <div className="space-y-2">
                    <Label htmlFor={`${environment}-notes`}>Notes</Label>
                    <Textarea
                      id={`${environment}-notes`}
                      value={currentEnvConfig.notes || ""}
                      onChange={(e) => setConfig({
                        ...config,
                        [environment]: {
                          ...currentEnvConfig,
                          notes: e.target.value,
                        },
                      })}
                      placeholder="Add notes about this environment configuration..."
                      rows={3}
                    />
                  </div>
                </>
              )}
            </div>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={downloadConfig}
          >
            <DownloadIcon className="h-4 w-4 mr-2" />
            Export Config
          </Button>
          <Button type="submit" disabled={saving}>
            <SaveIcon className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save Configuration"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}