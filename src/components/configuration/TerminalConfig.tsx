import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const TerminalConfig = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Terminal Configuration</CardTitle>
        <CardDescription>Configure terminal settings and behavior</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <label className="text-sm font-medium">Show Terminal</label>
            <p className="text-sm text-muted-foreground">Display terminal in the interface</p>
          </div>
          <Switch />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Shell Type</label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select shell type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bash">Bash</SelectItem>
              <SelectItem value="powershell">PowerShell</SelectItem>
              <SelectItem value="cmd">Command Prompt</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};