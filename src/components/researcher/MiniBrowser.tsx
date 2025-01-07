import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, RefreshCw, ArrowLeft, ArrowRight } from 'lucide-react';

interface MiniBrowserProps {
  className?: string;
}

export const MiniBrowser: React.FC<MiniBrowserProps> = ({ className }) => {
  const [url, setUrl] = useState('https://www.google.com');
  const [isLoading, setIsLoading] = useState(false);

  const handleNavigate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Add http:// if not present
    let finalUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      finalUrl = `https://${url}`;
      setUrl(finalUrl);
    }
    setTimeout(() => setIsLoading(false), 500); // Simulate loading
  };

  return (
    <Card className={`p-4 ${className}`}>
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setIsLoading(true)}
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
              Go
            </Button>
          </form>
        </div>
        <div className="w-full h-[500px] border rounded-md">
          <iframe
            src={url}
            className="w-full h-full"
            title="Mini Browser"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          />
        </div>
      </div>
    </Card>
  );
};