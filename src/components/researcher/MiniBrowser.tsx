import React, { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, RefreshCw, ArrowLeft, ArrowRight, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface MiniBrowserProps {
  className?: string;
}

export const MiniBrowser: React.FC<MiniBrowserProps> = ({ className }) => {
  const { toast } = useToast();
  const [url, setUrl] = useState('https://www.google.com');
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<string[]>(['https://www.google.com']);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const isValidUrl = (urlString: string) => {
    try {
      new URL(urlString);
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleNavigate = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Add https:// if not present and not a search query
    let finalUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      if (url.includes('.') && !url.includes(' ')) {
        finalUrl = `https://${url}`;
      } else {
        // Treat as Google search
        finalUrl = `https://www.google.com/search?q=${encodeURIComponent(url)}`;
      }
    }

    if (!isValidUrl(finalUrl)) {
      setError('Invalid URL format');
      setIsLoading(false);
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL or search term",
        variant: "destructive",
      });
      return;
    }

    setUrl(finalUrl);
    // Update history
    const newHistory = history.slice(0, currentIndex + 1);
    newHistory.push(finalUrl);
    setHistory(newHistory);
    setCurrentIndex(newHistory.length - 1);

    // Simulate loading with a minimum duration
    setTimeout(() => setIsLoading(false), 800);
  }, [url, history, currentIndex, toast]);

  const goBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setUrl(history[currentIndex - 1]);
    }
  };

  const goForward = () => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setUrl(history[currentIndex + 1]);
    }
  };

  const refresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 800);
  };

  return (
    <Card className={`p-4 ${className}`}>
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={goBack}
            disabled={currentIndex === 0}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            onClick={goForward}
            disabled={currentIndex === history.length - 1}
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            onClick={refresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <form onSubmit={handleNavigate} className="flex-1 flex space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Enter URL or search..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Loading...' : 'Go'}
            </Button>
          </form>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-destructive text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        <div className="w-full h-[500px] border rounded-md relative">
          {isLoading && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <RefreshCw className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
          <iframe
            src={url}
            className="w-full h-full"
            title="Mini Browser"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-downloads"
            referrerPolicy="no-referrer"
            loading="lazy"
          />
        </div>
      </div>
    </Card>
  );
};