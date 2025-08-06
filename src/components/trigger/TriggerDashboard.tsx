import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import FileUpload from "@/components/ui/file-upload";
import { triggerApiService } from "@/services/triggerApi";
import { 
  Shield, 
  Play, 
  Square, 
  Clock,
  CheckCircle,
  AlertCircle,
  Upload as UploadIcon
} from "lucide-react";

const TriggerDashboard = () => {
  const [isGeneratingToken, setIsGeneratingToken] = useState(false);
  const [tokenStatus, setTokenStatus] = useState(triggerApiService.getTokenStatus());
  const [addRefreshFile, setAddRefreshFile] = useState<File | null>(null);
  const [stopRefreshFile, setStopRefreshFile] = useState<File | null>(null);
  const [isAddingRefresh, setIsAddingRefresh] = useState(false);
  const [isStoppingRefresh, setIsStoppingRefresh] = useState(false);
  const { toast } = useToast();

  const handleGenerateToken = async () => {
    setIsGeneratingToken(true);
    try {
      const tokenData = await triggerApiService.generateToken();
      setTokenStatus(triggerApiService.getTokenStatus());
      
      toast({
        title: "Token Generated Successfully",
        description: `Token will expire in ${Math.round(tokenData.expires_in / 60)} minutes`,
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Token Generation Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingToken(false);
    }
  };

  const handleAddRefresh = async () => {
    if (!addRefreshFile) {
      toast({
        title: "No File Selected",
        description: "Please select a CSV file for add refresh operation",
        variant: "destructive"
      });
      return;
    }

    setIsAddingRefresh(true);
    try {
      const result = await triggerApiService.addRefresh(addRefreshFile);
      
      toast({
        title: "Add Refresh Successful",
        description: `File processed successfully. Status: ${result.status}`,
        variant: "default"
      });
      
      setAddRefreshFile(null);
    } catch (error) {
      toast({
        title: "Add Refresh Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsAddingRefresh(false);
    }
  };

  const handleStopRefresh = async () => {
    if (!stopRefreshFile) {
      toast({
        title: "No File Selected",
        description: "Please select a CSV file for stop refresh operation",
        variant: "destructive"
      });
      return;
    }

    setIsStoppingRefresh(true);
    try {
      const result = await triggerApiService.stopRefresh(stopRefreshFile);
      
      toast({
        title: "Stop Refresh Successful",
        description: `File processed successfully. Status: ${result.status}`,
        variant: "default"
      });
      
      setStopRefreshFile(null);
    } catch (error) {
      toast({
        title: "Stop Refresh Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsStoppingRefresh(false);
    }
  };

  const formatTimeRemaining = (milliseconds: number): string => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  return (
    <div className="space-y-6">
      {/* Token Status Card */}
      <Card className="shadow-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-primary" />
            <span>Authentication Status</span>
          </CardTitle>
          <CardDescription>
            Generate and manage your API authentication token
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {tokenStatus.hasToken ? (
                <>
                  <CheckCircle className="h-5 w-5 text-success" />
                  <div>
                    <p className="font-medium text-foreground">Token Active</p>
                    <p className="text-sm text-muted-foreground">
                      Expires in {formatTimeRemaining(tokenStatus.expiresIn)}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-warning" />
                  <div>
                    <p className="font-medium text-foreground">No Active Token</p>
                    <p className="text-sm text-muted-foreground">
                      Generate a token to access API functions
                    </p>
                  </div>
                </>
              )}
            </div>
            <Badge 
              variant={tokenStatus.hasToken ? "default" : "secondary"}
              className="ml-4"
            >
              {tokenStatus.hasToken ? "ACTIVE" : "INACTIVE"}
            </Badge>
          </div>
          
          <Button
            onClick={handleGenerateToken}
            disabled={isGeneratingToken}
            className="w-full"
            variant="default"
          >
            {isGeneratingToken ? (
              <Clock className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Shield className="h-4 w-4 mr-2" />
            )}
            {isGeneratingToken ? "Generating Token..." : "Generate New Token"}
          </Button>
        </CardContent>
      </Card>

      {/* Add Refresh Card */}
      <Card className="shadow-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Play className="h-5 w-5 text-success" />
            <span>Add Refresh Trigger</span>
          </CardTitle>
          <CardDescription>
            Upload a CSV file to add new refresh triggers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FileUpload
            onFileSelect={setAddRefreshFile}
            selectedFile={addRefreshFile}
            accept=".csv"
          />
          
          {addRefreshFile && (
            <div className="bg-muted/50 p-4 rounded-md">
              <h4 className="font-medium text-foreground mb-2">File Details:</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>• File: {addRefreshFile.name}</p>
                <p>• Size: {(addRefreshFile.size / 1024).toFixed(1)} KB</p>
                <p>• Process Type: ADD_REFRESH_TRIGGER</p>
                <p>• Market Code: 036 (Default)</p>
              </div>
            </div>
          )}
          
          <Button
            onClick={handleAddRefresh}
            disabled={!addRefreshFile || isAddingRefresh || !tokenStatus.hasToken}
            className="w-full"
            variant="default"
          >
            {isAddingRefresh ? (
              <Clock className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <UploadIcon className="h-4 w-4 mr-2" />
            )}
            {isAddingRefresh ? "Processing..." : "Add Refresh Trigger"}
          </Button>
        </CardContent>
      </Card>

      {/* Stop Refresh Card */}
      <Card className="shadow-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Square className="h-5 w-5 text-destructive" />
            <span>Stop Refresh Trigger</span>
          </CardTitle>
          <CardDescription>
            Upload a CSV file to stop existing refresh triggers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FileUpload
            onFileSelect={setStopRefreshFile}
            selectedFile={stopRefreshFile}
            accept=".csv"
          />
          
          {stopRefreshFile && (
            <div className="bg-muted/50 p-4 rounded-md">
              <h4 className="font-medium text-foreground mb-2">File Details:</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>• File: {stopRefreshFile.name}</p>
                <p>• Size: {(stopRefreshFile.size / 1024).toFixed(1)} KB</p>
                <p>• Process Type: STOP_REFRESH</p>
                <p>• Market Code: 036 (Default)</p>
              </div>
            </div>
          )}
          
          <Button
            onClick={handleStopRefresh}
            disabled={!stopRefreshFile || isStoppingRefresh || !tokenStatus.hasToken}
            className="w-full"
            variant="destructive"
          >
            {isStoppingRefresh ? (
              <Clock className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Square className="h-4 w-4 mr-2" />
            )}
            {isStoppingRefresh ? "Processing..." : "Stop Refresh Trigger"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default TriggerDashboard;