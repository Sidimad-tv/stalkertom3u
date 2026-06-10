import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';

import { rpcCall, invalidateCache } from '../api';
import { cn } from '../lib/utils';
import { 
  Activity, 
  FileText, 
  Trash2, 
  Globe, 
  Cpu, 
  Hash, 
  CheckCircle2, 
  XCircle,
  Loader2,
  Zap,
  Download
} from 'lucide-react';

interface Subscription {
  id: number;
  name: string;
  portal_url: string;
  mac: string;
  sn: string;
  device_id: string;
  created_at: string;
}

interface SubscriptionCardProps {
  subscription: Subscription;
  onDelete: (id: number) => void;
}

export function SubscriptionCard({ subscription, onDelete }: SubscriptionCardProps) {
  const [testing, setTesting] = useState(false);
  const [converting, setConverting] = useState(false);
  const [status, setStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  const handleTest = async () => {
    setTesting(true);
    setStatus(null);
    try {
      const result = await rpcCall({
        func: 'test_portal_connection',
        args: {
          portal_url: subscription.portal_url,
          mac: subscription.mac,
          sn: subscription.sn,
          device_id: subscription.device_id
        }
      });
      setStatus(result);
      console.log("[ACTION_SUCCESS] test_portal_connection", result);
    } catch (err) {
      setStatus({ success: false, message: "Connection failed" });
      console.error("[ACTION_ERROR] test_portal_connection", err);
    } finally {
      setTesting(false);
    }
  };

  const handleFetchM3U = async () => {
    setConverting(true);
    try {
      const result = await rpcCall({
        func: 'convert_stalker_to_m3u',
        args: {
          portal_url: subscription.portal_url,
          mac: subscription.mac,
          sn: subscription.sn,
          device_id: subscription.device_id
        }
      });
      
      console.log("[ACTION_SUCCESS] convert_stalker_to_m3u", result.channel_count);

      // Trigger direct file download
      const blob = new Blob([result.m3u_content], { type: 'audio/mpegurl' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${subscription.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_playlist.m3u`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("[ACTION_ERROR] convert_stalker_to_m3u", err);
    } finally {
      setConverting(false);
    }
  };



  return (
    <>
      {converting && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/80 backdrop-blur-md transition-all duration-300">
          <div className="relative">
            <div className="absolute -inset-8 bg-primary/20 blur-3xl rounded-full animate-pulse" />
            <div className="relative flex flex-col items-center space-y-6">
              <div className="relative h-24 w-24">
                <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
                <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Zap className="h-10 w-10 text-primary animate-pulse" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold font-heading tracking-tight">Extracting Channels</h3>
                <p className="text-muted-foreground animate-pulse">Syncing with Stalker Portal API...</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <Card className="group relative overflow-hidden border-white/10 bg-card/60 backdrop-blur-sm transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
        <div className="absolute top-0 right-0 p-2">
          {status && (
            <Badge variant={status.success ? "default" : "destructive"} className="flex items-center gap-1">
              {status.success ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
              {status.success ? "Online" : "Offline"}
            </Badge>
          )}
        </div>

        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="font-heading text-lg">{subscription.name}</CardTitle>
              <CardDescription className="truncate text-xs opacity-60 max-w-[200px]">
                {subscription.portal_url}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-0">
          <div className="grid grid-cols-1 gap-2 text-sm">
            <div className="flex items-center justify-between rounded-md bg-white/5 p-2">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Hash className="h-3.5 w-3.5" /> MAC
              </span>
              <span className="font-mono text-xs">{subscription.mac}</span>
            </div>
            <div className="flex items-center justify-between rounded-md bg-white/5 p-2">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Cpu className="h-3.5 w-3.5" /> Device
              </span>
              <span className="truncate max-w-[120px] font-mono text-xs">
                {subscription.device_id || "MAG250"}
              </span>
            </div>
          </div>
          
          {status?.message && !status.success && (
            <p className="text-[10px] text-destructive leading-tight">{status.message}</p>
          )}
        </CardContent>

        <CardFooter className="grid grid-cols-3 gap-2 border-t border-white/5 pt-4">
          <Button 
            variant="outline" 
            size="sm" 
            className="px-2" 
            onClick={handleTest}
            disabled={testing}
          >
            {testing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Activity className="h-3.5 w-3.5" />}
            <span className="ml-1 hidden sm:inline">Test</span>
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            className="px-2"
            onClick={handleFetchM3U}
            disabled={converting}
          >
            {converting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />}
            <span className="ml-1 hidden sm:inline">M3U</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="px-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => onDelete(subscription.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="ml-1 hidden sm:inline">Delete</span>
          </Button>
        </CardFooter>
      </Card>

    </>
  );
}

interface SubscriptionFormProps {
  userId: string;
  onSuccess: (newSub: Subscription) => void;
  onCancel: () => void;
}

export function SubscriptionForm({ userId, onSuccess, onCancel }: SubscriptionFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    portal_url: '',
    mac: '',
    sn: '0000000000000',
    device_id: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    console.log("[ACTION_START] save_subscription", { userId });
    try {
      const result = await rpcCall({
        func: 'save_subscription',
        args: { ...formData, user_id: userId }
      });
      console.log("[ACTION_SUCCESS] save_subscription", result);
      onSuccess(result);
    } catch (err) {
      console.error("[ACTION_ERROR] save_subscription", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Friendly Name</label>
          <input 
            required
            className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-foreground"
            placeholder="My Portal"
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Portal URL</label>
          <input 
            required
            type="url"
            className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-foreground"
            placeholder="http://example.com/c/"
            value={formData.portal_url}
            onChange={e => setFormData({...formData, portal_url: e.target.value})}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">MAC Address</label>
          <input 
            required
            pattern="^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$"
            title="MAC address must be in format 00:1A:79:XX:XX:XX"
            className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-foreground"
            placeholder="00:1A:79:XX:XX:XX"
            value={formData.mac}
            onChange={e => setFormData({...formData, mac: e.target.value})}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Serial Number (optional)</label>
          <input 
            className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-foreground"
            placeholder="0000000000000"
            value={formData.sn}
            onChange={e => setFormData({...formData, sn: e.target.value})}
          />
        </div>
        <div className="md:col-span-2 space-y-2">
          <label className="text-sm font-medium text-foreground">Device ID / Device ID 2 (optional)</label>
          <input 
            className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-foreground"
            placeholder="Your device hash"
            value={formData.device_id}
            onChange={e => setFormData({...formData, device_id: e.target.value})}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
        <Button variant="ghost" type="button" onClick={onCancel} disabled={loading}>Cancel</Button>
        <Button variant="default" type="submit" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Save Configuration
        </Button>
      </div>
    </form>

  );
}
