import { Repository } from "@/types/repository";
import { Button } from "@/components/ui/button";
import { GitCommit, Star, RefreshCw, Edit2, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tag } from "lucide-react";

interface RepositoryListProps {
  repositories: Repository[];
  onToggleMaster: (id: string) => void;
  onRefresh: (id: string) => void;
  onEdit: (repo: Repository) => void;
  onDelete: (id: string) => void;
  isLoading: boolean;
}

export function RepositoryList({
  repositories,
  onToggleMaster,
  onRefresh,
  onEdit,
  onDelete,
  isLoading
}: RepositoryListProps) {
  return (
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
                onClick={() => onToggleMaster(repo.id)}
                className="text-xs"
                disabled={isLoading}
              >
                Set as Master
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRefresh(repo.id)}
              className="text-xs"
              disabled={isLoading}
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Refresh
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(repo)}
              className="text-xs"
              disabled={isLoading}
            >
              <Edit2 className="h-3 w-3 mr-1" />
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(repo.id)}
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
  );
}