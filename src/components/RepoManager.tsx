import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { GitBranch, GitCommit, Star, History, Tag, AlertTriangle, Trash2, Edit2, RefreshCw, Terminal, CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Repository {
  id: string;
  url: string;
  name?: string;
  nickname?: string;
  is_master?: boolean;
  last_sync?: string;
  status?: string;
  last_commit?: string;
  last_commit_date?: string;
}

interface ConsoleLog {
  message: string;
  type: 'error' | 'success' | 'info';
  timestamp: string;
}

export function RepoManager() {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [repoUrl, setRepoUrl] = useState("");
  const [repoLabel, setRepoLabel] = useState("");
  const [pushType, setPushType] = useState("regular");
  const [selectedSourceRepo, setSelectedSourceRepo] = useState("");
  const [selectedTargetRepos, setSelectedTargetRepos] = useState<string[]>([]);
  const [lastAction, setLastAction] = useState<string>("");
  const [showMasterWarning, setShowMasterWarning] = useState(false);
  const [confirmationStep, setConfirmationStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [repoToDelete, setRepoToDelete] = useState<string | null>(null);
  const [editingRepo, setEditingRepo] = useState<Repository | null>(null);
  const { toast } = useToast();

  const [consoleLogs, setConsoleLogs] = useState<ConsoleLog[]>([]);
  const [showConsole, setShowConsole] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<{
    checking: boolean;
    success?: boolean;
    message?: string;
  }>({ checking: false });

  const addConsoleLog = (message: string, type: 'error' | 'success' | 'info' = 'info') => {
    setConsoleLogs(prev => [...prev, {
      message,
      type,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  // Fetch repositories from Supabase
  useEffect(() => {
    fetchRepositories();
  }, []);

  const fetchRepositories = async () => {
    try {
      const { data, error } = await supabase
        .from('repositories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRepositories(data || []);
    } catch (error) {
      console.error('Error fetching repositories:', error);
      toast({
        title: "Error",
        description: "Failed to fetch repositories",
        variant: "destructive",
      });
    }
  };

  const verifyPushSuccess = async (sourceRepoId: string, targetRepoIds: string[]) => {
    try {
      setVerificationStatus({ checking: true });
      addConsoleLog('Verifying push success...', 'info');

      const sourceDetails = repositories.find(r => r.id === sourceRepoId);
      if (!sourceDetails?.last_commit) {
        throw new Error('Source commit information not available');
      }

      // Refresh target repos to get latest commit info
      for (const targetId of targetRepoIds) {
        await refreshLastCommit(targetId);
      }

      // Re-fetch repositories to get updated data
      await fetchRepositories();

      // Verify commits match
      const targetRepos = repositories.filter(r => targetRepoIds.includes(r.id));
      const successfulTargets = targetRepos.filter(
        target => target.last_commit === sourceDetails.last_commit
      );

      const allSuccess = successfulTargets.length === targetRepoIds.length;
      const timestamp = new Date().toLocaleTimeString();

      setVerificationStatus({
        checking: false,
        success: allSuccess,
        message: allSuccess 
          ? `Push verified successful at ${timestamp}` 
          : `Push verification failed at ${timestamp}. Some repositories may not be in sync.`
      });

      addConsoleLog(
        allSuccess ? 'Push verification successful' : 'Push verification failed',
        allSuccess ? 'success' : 'error'
      );

    } catch (error) {
      console.error('Verification error:', error);
      setVerificationStatus({
        checking: false,
        success: false,
        message: `Verification failed: ${error.message}`
      });
      addConsoleLog(`Push verification error: ${error.message}`, 'error');
    }
  };

  const handleAddRepo = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!repoUrl) {
      toast({
        title: "Error",
        description: "Please enter a repository URL",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('repositories')
        .insert({
          url: repoUrl,
          name: repoUrl.split('/').pop()?.replace('.git', '') || '',
          nickname: repoLabel,
          is_master: repositories.length === 0,
          status: 'synced'
        })
        .select()
        .single();

      if (error) throw error;

      // Fetch last commit information
      await supabase.functions.invoke('git-operations', {
        body: {
          type: 'getLastCommit',
          sourceRepoId: data.id
        }
      });

      await fetchRepositories(); // Refresh the list to get updated commit info
      
      setRepoUrl("");
      setRepoLabel("");
      
      toast({
        title: "Success",
        description: `Repository added: ${repoLabel || repoUrl}`,
      });
    } catch (error) {
      console.error('Error adding repository:', error);
      toast({
        title: "Error",
        description: "Failed to add repository",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRepo = async (id: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('repositories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setRepositories(prev => prev.filter(repo => repo.id !== id));
      
      toast({
        title: "Success",
        description: "Repository deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting repository:', error);
      toast({
        title: "Error",
        description: "Failed to delete repository",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
      setRepoToDelete(null);
    }
  };

  const handleUpdateLabel = async (id: string, newLabel: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('repositories')
        .update({ nickname: newLabel })
        .eq('id', id);

      if (error) throw error;

      setRepositories(prev => prev.map(repo => 
        repo.id === id ? { ...repo, nickname: newLabel } : repo
      ));
      
      toast({
        title: "Success",
        description: "Repository label updated successfully",
      });
    } catch (error) {
      console.error('Error updating repository label:', error);
      toast({
        title: "Error",
        description: "Failed to update repository label",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setEditingRepo(null);
    }
  };

  const refreshLastCommit = async (id: string) => {
    try {
      setIsLoading(true);
      await supabase.functions.invoke('git-operations', {
        body: {
          type: 'getLastCommit',
          sourceRepoId: id
        }
      });

      await fetchRepositories(); // Refresh the list to get updated commit info
      
      toast({
        title: "Success",
        description: "Repository information updated",
      });
    } catch (error) {
      console.error('Error refreshing repository:', error);
      toast({
        title: "Error",
        description: "Failed to refresh repository information",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePushRepo = async () => {
    if (!selectedSourceRepo || selectedTargetRepos.length === 0) {
      toast({
        title: "Error",
        description: "Please select source and at least one target repository",
        variant: "destructive",
      });
      return;
    }

    const hasMasterTarget = selectedTargetRepos.some(id => 
      repositories.find(r => r.id === id)?.is_master
    );
    
    if (hasMasterTarget && confirmationStep === 0) {
      setShowMasterWarning(true);
      return;
    }

    try {
      setIsLoading(true);
      addConsoleLog(`Starting ${pushType} push operation to multiple targets...`, 'info');
      
      for (const targetId of selectedTargetRepos) {
        const { error } = await supabase.functions.invoke('git-operations', {
          body: {
            type: 'push',
            sourceRepoId: selectedSourceRepo,
            targetRepoId: targetId,
            pushType
          }
        });

        if (error) throw error;
      }

      const sourceRepo = repositories.find(r => r.id === selectedSourceRepo);
      const targetRepos = repositories.filter(r => selectedTargetRepos.includes(r.id));
      const actionMessage = `Pushed from ${sourceRepo?.nickname || sourceRepo?.url} to ${targetRepos.length} repositories at ${new Date().toLocaleTimeString()}`;
      
      setLastAction(actionMessage);
      addConsoleLog(actionMessage, 'success');
      
      // Start verification process
      await verifyPushSuccess(selectedSourceRepo, selectedTargetRepos);
      
      await fetchRepositories();
      
      toast({
        title: "Success",
        description: `Push completed with ${pushType} strategy`,
      });
    } catch (error) {
      console.error('Error during push operation:', error);
      addConsoleLog(`Push operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      toast({
        title: "Error",
        description: "Failed to complete push operation",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setConfirmationStep(0);
      setShowMasterWarning(false);
    }
  };

  const handleMasterWarningConfirm = () => {
    setConfirmationStep(prev => prev + 1);
    if (confirmationStep >= 2) {
      handlePushRepo();
    }
  };

  const toggleMaster = async (id: string) => {
    try {
      setIsLoading(true);
      
      // Update all repositories to not be master
      await supabase
        .from('repositories')
        .update({ is_master: false })
        .neq('id', id);

      // Set the selected repository as master
      const { error } = await supabase
        .from('repositories')
        .update({ is_master: true })
        .eq('id', id);

      if (error) throw error;

      await fetchRepositories(); // Refresh the list
      
      toast({
        title: "Success",
        description: "Master repository updated",
      });
    } catch (error) {
      console.error('Error toggling master repository:', error);
      toast({
        title: "Error",
        description: "Failed to update master repository",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6 space-y-6 bg-secondary/50 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-6">
        <GitBranch className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-semibold">Repository Manager</h2>
      </div>
      
      <form onSubmit={handleAddRepo} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="repoUrl" className="text-sm font-medium">
            Repository URL
          </label>
          <Input
            id="repoUrl"
            placeholder="https://github.com/username/repo.git"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            className="bg-background/50"
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="repoLabel" className="text-sm font-medium">
            Repository Label (Optional)
          </label>
          <Input
            id="repoLabel"
            placeholder="e.g., Production, Staging, Feature-X"
            value={repoLabel}
            onChange={(e) => setRepoLabel(e.target.value)}
            className="bg-background/50"
            disabled={isLoading}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Adding..." : "Add Repository"}
        </Button>
      </form>

      <div className="space-y-4 pt-4 border-t border-border/50">
        <h3 className="text-lg font-medium">Push Repository</h3>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Source Repository (Select One)</label>
            <Select 
              value={selectedSourceRepo} 
              onValueChange={(value) => {
                setSelectedSourceRepo(value);
                // Clear selected targets when source changes
                setSelectedTargetRepos([]);
              }}
              disabled={isLoading}
            >
              <SelectTrigger className="bg-background/50">
                <SelectValue placeholder="Select source repository" />
              </SelectTrigger>
              <SelectContent>
                {repositories.map(repo => (
                  <SelectItem key={repo.id} value={repo.id}>
                    {repo.nickname || repo.url}
                    {repo.is_master && <Star className="inline h-4 w-4 ml-2 text-red-500" />}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Target Repositories (Select Multiple)</label>
            <ScrollArea className="h-40 w-full rounded-md border">
              <div className="p-4 space-y-2">
                {repositories
                  .filter(repo => repo.id !== selectedSourceRepo)
                  .map(repo => (
                    <div key={repo.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`target-${repo.id}`}
                        checked={selectedTargetRepos.includes(repo.id)}
                        onCheckedChange={(checked) => {
                          setSelectedTargetRepos(prev =>
                            checked
                              ? [...prev, repo.id]
                              : prev.filter(id => id !== repo.id)
                          );
                        }}
                        disabled={isLoading}
                      />
                      <label
                        htmlFor={`target-${repo.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {repo.nickname || repo.url}
                        {repo.is_master && (
                          <Star className="inline h-4 w-4 ml-2 text-red-500" />
                        )}
                      </label>
                    </div>
                  ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Push Type</label>
          <Select 
            value={pushType} 
            onValueChange={setPushType}
            disabled={isLoading}
          >
            <SelectTrigger className="bg-background/50">
              <SelectValue placeholder="Select push type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="regular">Regular Push</SelectItem>
              <SelectItem value="force">Force Push</SelectItem>
              <SelectItem value="force-with-lease">Force with Lease</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button 
          onClick={handlePushRepo} 
          className="w-full"
          disabled={isLoading || !selectedSourceRepo || selectedTargetRepos.length === 0}
        >
          {isLoading ? "Pushing..." : `Push to ${selectedTargetRepos.length} Repositories`}
        </Button>

        {verificationStatus.message && (
          <div className={`p-4 rounded-md ${
            verificationStatus.checking ? 'bg-blue-500/10 border border-blue-500/20' :
            verificationStatus.success ? 'bg-green-500/10 border border-green-500/20' :
            'bg-red-500/10 border border-red-500/20'
          }`}>
            <p className="text-sm">
              {verificationStatus.checking ? (
                <RefreshCw className="inline-block h-4 w-4 mr-2 animate-spin" />
              ) : verificationStatus.success ? (
                <CheckCircle className="inline-block h-4 w-4 mr-2 text-green-500" />
              ) : (
                <XCircle className="inline-block h-4 w-4 mr-2 text-red-500" />
              )}
              {verificationStatus.message}
            </p>
          </div>
        )}
      </div>

      {repositories.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-border/50">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <History className="h-5 w-5" />
            Repository History
          </h3>
          <div className="space-y-2">
            {repositories.map(repo => (
              <div 
                key={repo.id} 
                className={`flex items-center justify-between p-3 rounded-md transition-colors ${
                  repo.is_master ? 'bg-red-500/10 border border-red-500/20' : 'bg-background/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <GitCommit className={`h-4 w-4 ${repo.is_master ? 'text-red-500' : 'text-muted-foreground'}`} />
                  <span className="text-sm">{repo.url}</span>
                  {repo.nickname && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      {repo.nickname}
                    </Badge>
                  )}
                  {repo.is_master ? (
                    <Star className="h-4 w-4 text-red-500" />
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleMaster(repo.id)}
                      className="text-xs"
                      disabled={isLoading}
                    >
                      Set as Master
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => refreshLastCommit(repo.id)}
                    className="text-xs"
                    disabled={isLoading}
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Refresh
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingRepo(repo)}
                    className="text-xs"
                    disabled={isLoading}
                  >
                    <Edit2 className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setRepoToDelete(repo.id);
                      setShowDeleteConfirm(true);
                    }}
                    className="text-xs text-destructive"
                    disabled={isLoading}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>Last synced: {repo.last_sync ? new Date(repo.last_sync).toLocaleString() : 'Never'}</div>
                  {repo.last_commit && (
                    <div>Last commit: {repo.last_commit.substring(0, 7)} ({repo.last_commit_date ? new Date(repo.last_commit_date).toLocaleString() : 'Unknown'})</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {lastAction && (
        <div className="pt-4 border-t border-border/50">
          <h3 className="text-lg font-medium mb-2">Last Action</h3>
          <div className="bg-background/50 p-3 rounded-md">
            <p className="text-sm text-muted-foreground">{lastAction}</p>
          </div>
        </div>
      )}

      <div className="pt-4 border-t border-border/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            Console Output
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowConsole(!showConsole)}
          >
            {showConsole ? 'Hide Console' : 'Show Console'}
          </Button>
        </div>
        
        {showConsole && (
          <ScrollArea className="h-[300px] w-full rounded-md border bg-black/90 p-4 font-mono text-sm">
            {consoleLogs.map((log, index) => (
              <div
                key={index}
                className={`mb-2 ${
                  log.type === 'error' ? 'text-red-400' :
                  log.type === 'success' ? 'text-green-400' :
                  'text-blue-400'
                }`}
              >
                <span className="text-gray-500">[{log.timestamp}]</span>{' '}
                {log.message}
              </div>
            ))}
            {consoleLogs.length === 0 && (
              <div className="text-gray-500">No console output available</div>
            )}
          </ScrollArea>
        )}
      </div>

      <AlertDialog open={showMasterWarning} onOpenChange={setShowMasterWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Warning: Pushing to Master Repository
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmationStep === 0 && "This is a master repository. Are you sure you want to proceed with the push operation?"}
              {confirmationStep === 1 && "Please confirm again. This action will modify the master repository."}
              {confirmationStep === 2 && "Final confirmation required. This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setConfirmationStep(0);
              setShowMasterWarning(false);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleMasterWarningConfirm}
              className="bg-red-500 hover:bg-red-600"
            >
              {confirmationStep === 2 ? "Confirm Push" : "Continue"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Repository</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this repository? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowDeleteConfirm(false);
              setRepoToDelete(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => repoToDelete && handleDeleteRepo(repoToDelete)}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!editingRepo} onOpenChange={(open) => !open && setEditingRepo(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Repository Label</AlertDialogTitle>
            <AlertDialogDescription>
              <Input
                value={editingRepo?.nickname || ''}
                onChange={(e) => setEditingRepo(prev => prev ? {...prev, nickname: e.target.value} : null)}
                placeholder="Enter new label"
                className="mt-2"
              />
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setEditingRepo(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => editingRepo && handleUpdateLabel(editingRepo.id, editingRepo.nickname || '')}
            >
              Save
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
