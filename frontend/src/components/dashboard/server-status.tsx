import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { API_BASE_URL } from "@/lib/api";
import { CheckCircle, XCircle, RefreshCw, AlertTriangle } from "lucide-react";

interface ServerStatus {
  status: 'checking' | 'online' | 'offline' | 'error';
  responseTime?: number;
  error?: string;
  timestamp?: string;
}

export function ServerStatus() {
  const [serverStatus, setServerStatus] = useState<ServerStatus>({ status: 'checking' });
  const [isChecking, setIsChecking] = useState(false);

  const checkServerHealth = async () => {
    setIsChecking(true);
    setServerStatus({ status: 'checking' });

    try {
      const startTime = Date.now();
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      const responseTime = Date.now() - startTime;

      if (response.ok) {
        const data = await response.json();
        setServerStatus({
          status: 'online',
          responseTime,
          timestamp: new Date().toISOString()
        });
      } else {
        setServerStatus({
          status: 'error',
          error: `HTTP ${response.status}: ${response.statusText}`,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error: any) {
      console.error('Server health check failed:', error);
      setServerStatus({
        status: 'offline',
        error: error.message || 'Connection failed',
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkServerHealth();
  }, []);

  const getStatusIcon = () => {
    switch (serverStatus.status) {
      case 'online':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'offline':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
    }
  };

  const getStatusBadge = () => {
    switch (serverStatus.status) {
      case 'online':
        return <Badge variant="default" className="bg-green-500">Online</Badge>;
      case 'offline':
        return <Badge variant="destructive">Offline</Badge>;
      case 'error':
        return <Badge variant="secondary">Error</Badge>;
      default:
        return <Badge variant="outline">Checking...</Badge>;
    }
  };

  const getStatusColor = () => {
    switch (serverStatus.status) {
      case 'online':
        return 'text-green-600';
      case 'offline':
        return 'text-red-600';
      case 'error':
        return 'text-yellow-600';
      default:
        return 'text-blue-600';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-sm font-medium">Server Status</CardTitle>
          <CardDescription>
            Backend API connectivity
          </CardDescription>
        </div>
        {getStatusIcon()}
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium">API Server</p>
            <p className="text-xs text-muted-foreground">{API_BASE_URL}</p>
          </div>
          {getStatusBadge()}
        </div>

        {serverStatus.status === 'online' && serverStatus.responseTime && (
          <div className="mt-2 text-xs text-muted-foreground">
            Response time: {serverStatus.responseTime}ms
          </div>
        )}

        {serverStatus.error && (
          <Alert className="mt-2">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              {serverStatus.error}
            </AlertDescription>
          </Alert>
        )}

        {serverStatus.timestamp && (
          <div className="mt-2 text-xs text-muted-foreground">
            Last checked: {new Date(serverStatus.timestamp).toLocaleTimeString()}
          </div>
        )}

        <Button
          variant="outline"
          size="sm"
          className="mt-2 w-full"
          onClick={checkServerHealth}
          disabled={isChecking}
        >
          {isChecking ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Checking...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Check Status
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
} 