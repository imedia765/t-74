import React, { useState } from 'react';
import { Plus, Link, File, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';

interface QuickAccessItem {
  id: string;
  type: 'link' | 'file' | 'image';
  name: string;
  url: string;
  lastUpdated: string;
}

export const QuickAccess = () => {
  const { toast } = useToast();
  const [newItem, setNewItem] = useState('');
  const [items, setItems] = useState<QuickAccessItem[]>([
    {
      id: '1',
      type: 'link',
      name: 'Documentation',
      url: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b',
      lastUpdated: '2 hours ago'
    },
    {
      id: '2',
      type: 'image',
      name: 'Architecture Diagram',
      url: 'https://images.unsplash.com/photo-1518770660439-4636190af475',
      lastUpdated: '1 day ago'
    }
  ]);

  const handleAddItem = (type: 'link' | 'file' | 'image') => {
    if (!newItem.trim()) return;

    const newItemObj: QuickAccessItem = {
      id: Date.now().toString(),
      type,
      name: newItem,
      url: newItem,
      lastUpdated: 'Just now'
    };

    setItems([newItemObj, ...items]);
    setNewItem('');
    
    toast({
      title: "Item Added",
      description: `New ${type} has been added to your quick access.`,
    });
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'link':
        return <Link className="h-4 w-4 text-primary" />;
      case 'file':
        return <File className="h-4 w-4 text-primary" />;
      case 'image':
        return <Image className="h-4 w-4 text-primary" />;
      default:
        return <Link className="h-4 w-4 text-primary" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Add new item..."
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          className="flex-1"
        />
        <Button onClick={() => handleAddItem('link')} size="icon" variant="outline">
          <Link className="h-4 w-4" />
        </Button>
        <Button onClick={() => handleAddItem('file')} size="icon" variant="outline">
          <File className="h-4 w-4" />
        </Button>
        <Button onClick={() => handleAddItem('image')} size="icon" variant="outline">
          <Image className="h-4 w-4" />
        </Button>
      </div>
      <ScrollArea className="h-[200px]">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-2 p-2 hover:bg-accent/10 rounded-lg">
            {getIcon(item.type)}
            <span className="flex-1">{item.name}</span>
            <span className="text-sm text-muted-foreground">{item.lastUpdated}</span>
          </div>
        ))}
      </ScrollArea>
    </div>
  );
};