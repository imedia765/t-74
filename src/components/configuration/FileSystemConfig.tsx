import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";

export const FileSystemConfig = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>File System Configuration</CardTitle>
        <CardDescription>Configure file system settings and permissions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <label className="text-sm font-medium">Auto-save</label>
            <p className="text-sm text-muted-foreground">Automatically save changes</p>
          </div>
          <Switch />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Project Directory</label>
          <Input placeholder="Enter project directory path" />
        </div>
      </CardContent>
    </Card>
  );
};