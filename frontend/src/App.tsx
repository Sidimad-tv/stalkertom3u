import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { rpcCall, invalidateCache } from './api';
import { cn } from './lib/utils';

function getUserId() {
  const key = 'stalker_converter_user_id';
  let userId = localStorage.getItem(key);
  if (!userId) {
    userId = `user_${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem(key, userId);
  }
  return userId;
}
import { Button } from './components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from './components/ui/dialog';
import { Separator } from './components/ui/separator';
import { Empty, EmptyTitle, EmptyDescription, EmptyMedia } from './components/ui/empty';
import { SubscriptionCard, SubscriptionForm } from './features/Subscriptions';
import { 
  Plus, 
  Tv2, 
  ShieldCheck, 
  ShieldX, 
  LayoutGrid, 
  Box,
  MonitorPlay
} from 'lucide-react';
import { SiKodi, SiPlex, SiVlcmediaplayer } from 'react-icons/si';

interface Subscription {
  id: number;
  name: string;
  portal_url: string;
  mac: string;
  sn: string;
  device_id: string;
  created_at: string;
}

export default function App() {
  const userId = useMemo(() => getUserId(), []);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const loadSubscriptions = useCallback(async () => {
    setLoading(true);
    console.log("[FETCH_START] get_subscriptions", { userId });
    try {
      const data = await rpcCall({ func: 'get_subscriptions', args: { user_id: userId } });
      setSubscriptions(data);
      console.log("[FETCH_RESPONSE] get_subscriptions success", data.length);
    } catch (err) {
      console.error("[FETCH_ERROR] get_subscriptions", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadSubscriptions();
    console.log("RENDER_SUCCESS");
  }, [loadSubscriptions]);

  const handleDelete = async (id: number) => {
    const previous = subscriptions;
    setSubscriptions(prev => prev.filter(s => s.id !== id));
    console.log("[ACTION_START] delete_subscription", id, { userId });
    try {
      await rpcCall({ func: 'delete_subscription', args: { id, user_id: userId } });
      invalidateCache(['get_subscriptions']);
      console.log("[ACTION_SUCCESS] delete_subscription");
    } catch (err) {
      setSubscriptions(previous);
      console.error("[ACTION_ERROR] delete_subscription", err);
    }
  };

  const handleFormSuccess = (newSub: Subscription) => {
    // Check if we updated an existing one or added a new one
    setSubscriptions(prev => {
      const index = prev.findIndex(s => s.id === newSub.id);
      if (index !== -1) {
        const next = [...prev];
        next[index] = newSub;
        return next;
      }
      return [newSub, ...prev];
    });
    setIsFormOpen(false);
    invalidateCache(['get_subscriptions']);
  };

  return (
    <div className="min-h-screen bg-background text-foreground bg-tech-grid-2.jpg">
      {/* Background Mesh Overlay */}
      <div className="fixed inset-0 bg-mesh opacity-30 pointer-events-none" />
      
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary p-1.5">
              <Tv2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-heading font-bold text-xl tracking-tight uppercase">Stalker<span className="text-primary">2M3U</span></span>
          </div>
          
          <nav className="hidden sm:flex items-center gap-6">
            <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
              <span className="flex items-center gap-1.5 hover:text-primary transition-colors cursor-help">
                <SiKodi className="h-4 w-4" /> Kodi
              </span>
              <span className="flex items-center gap-1.5 hover:text-primary transition-colors cursor-help">
                <SiPlex className="h-4 w-4" /> Plex
              </span>
              <span className="flex items-center gap-1.5 hover:text-primary transition-colors cursor-help">
                <SiVlcmediaplayer className="h-4 w-4" /> VLC
              </span>
            </div>
          </nav>

          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button variant="default" className="shadow-lg shadow-primary/20">
                <Plus className="h-4 w-4 mr-2" /> Add Portal
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] border-white/10 bg-card/95 backdrop-blur-xl">
              <DialogHeader>
                <DialogTitle className="font-heading text-2xl">New Subscription</DialogTitle>
                <DialogDescription>
                  Enter the Stalker portal details to convert your MAC-based IPTV subscription.
                </DialogDescription>
              </DialogHeader>
              <SubscriptionForm 
                userId={userId}
                onSuccess={handleFormSuccess} 
                onCancel={() => setIsFormOpen(false)} 
              />
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="relative max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12 space-y-12 pb-20">
        
        {/* Hero Section */}
        <section className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 via-background to-background border border-white/10 p-8 md:p-12">
          <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary border border-primary/20">
                <ShieldCheck className="h-3 w-3" /> Secure Conversion
              </div>
              <h1 className="font-heading text-4xl md:text-5xl font-extrabold tracking-tight">
                Unlock Your <span className="text-primary">IPTV</span> Experience.
              </h1>
              <p className="text-muted-foreground text-lg max-w-lg leading-relaxed">
                Professional-grade utility to convert MAC-based Stalker portals into portable M3U playlists for VLC, Plex, and Kodi.
              </p>
              <div className="flex gap-4">
                <Button size="lg" onClick={() => setIsFormOpen(true)}>Get Started</Button>
                <Button size="lg" variant="outline">Learn More</Button>
              </div>
            </div>
            
            <div className="hidden md:block relative">
              <div className="absolute -inset-4 bg-primary/20 blur-3xl rounded-full" />
              <div className="relative rounded-xl border border-white/10 bg-card/50 p-4 shadow-2xl">
                <div className="aspect-video rounded-lg overflow-hidden bg-muted relative group">
                  <img 
                    src="./assets/hero-home-theater-2.jpg" 
                    alt="Premium IPTV Setup" 
                    className="w-full h-full object-cover opacity-60 transition-opacity group-hover:opacity-80"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1593784991095-a205039475fe?q=80&w=1000";
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <MonitorPlay className="h-16 w-16 text-primary animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LayoutGrid className="h-5 w-5 text-primary" />
              <h2 className="font-heading text-2xl font-bold">Portal Configurations</h2>
            </div>
            <span className="text-xs text-muted-foreground font-mono">
              {subscriptions.length} Saved
            </span>
          </div>

          <Separator className="bg-white/5" />

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-[280px] rounded-xl bg-card/40 animate-pulse border border-white/5" />
              ))}
            </div>
          ) : subscriptions.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {subscriptions.map(sub => (
                <SubscriptionCard 
                  key={sub.id} 
                  subscription={sub} 
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ) : (
            <div className="py-20 flex justify-center">
              <Empty className="max-w-md">
                <EmptyMedia>
                  <Box className="h-12 w-12 text-muted-foreground/30" />
                </EmptyMedia>
                <EmptyTitle>No Portals Found</EmptyTitle>
                <EmptyDescription>
                  You haven't saved any portal configurations yet. Add your first Stalker portal to start converting.
                </EmptyDescription>
                <Button onClick={() => setIsFormOpen(true)} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" /> Add Your First Portal
                </Button>
              </Empty>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-background/50 py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Tv2 className="h-5 w-5 text-primary" />
            <span className="font-heading font-bold text-lg uppercase">Stalker<span className="text-primary">2M3U</span></span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 Professional IPTV Utilities. For educational purposes only.
          </p>
          <div className="flex items-center gap-4 text-muted-foreground">
            <SiKodi className="h-5 w-5 hover:text-primary transition-colors cursor-pointer" />
            <SiPlex className="h-5 w-5 hover:text-primary transition-colors cursor-pointer" />
            <SiVlcmediaplayer className="h-5 w-5 hover:text-primary transition-colors cursor-pointer" />
          </div>
        </div>
      </footer>
    </div>
  );
}
