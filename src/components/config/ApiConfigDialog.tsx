import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { triggerApiService } from "@/services/triggerApi";
import { Settings, Save } from "lucide-react";

const ApiConfigDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState(triggerApiService.getConfig());
  const [demoMode, setDemoMode] = useState(triggerApiService.isDemoMode());
  const { toast } = useToast();

  const handleSave = () => {
    triggerApiService.updateConfig(config);
    triggerApiService.setDemoMode(demoMode);
    setIsOpen(false);
    toast({
      title: "Configuration Saved",
      description: `API configuration updated. Demo mode: ${demoMode ? 'Enabled' : 'Disabled'}`,
      variant: "default"
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          API Config
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>API Configuration</DialogTitle>
          <DialogDescription>
            Configure your TRG API endpoints and credentials. Enable demo mode to test the UI without making real API calls.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="demoMode">Demo Mode</Label>
              <p className="text-sm text-muted-foreground">
                Test the UI without making real API calls
              </p>
            </div>
            <Switch
              id="demoMode"
              checked={demoMode}
              onCheckedChange={setDemoMode}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="triggerUrl">Trigger API URL</Label>
            <Input
              id="triggerUrl"
              value={config.triggerUrl}
              onChange={(e) => setConfig(prev => ({ ...prev, triggerUrl: e.target.value }))}
              placeholder="https://api-trigger.amex.com"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="cbisUrl">CBIS A2A API URL</Label>
            <Input
              id="cbisUrl"
              value={config.cbisA2aApiUrl}
              onChange={(e) => setConfig(prev => ({ ...prev, cbisA2aApiUrl: e.target.value }))}
              placeholder="https://cbis-auth.amex.com/oauth/token"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="appId">Application ID</Label>
            <Input
              id="appId"
              value={config.appId}
              onChange={(e) => setConfig(prev => ({ ...prev, appId: e.target.value }))}
              placeholder="your-app-id"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="appSecret">Application Secret</Label>
            <Input
              id="appSecret"
              type="password"
              value={config.appSecret}
              onChange={(e) => setConfig(prev => ({ ...prev, appSecret: e.target.value }))}
              placeholder="your-app-secret"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Configuration
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ApiConfigDialog;