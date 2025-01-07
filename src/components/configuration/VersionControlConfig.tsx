import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const VersionControlConfig = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Version Control Configuration</CardTitle>
        <CardDescription>Configure version control settings and repositories</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Git Username</label>
          <Input placeholder="Enter Git username" />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Git Email</label>
          <Input placeholder="Enter Git email" />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Default Branch</label>
          <Input placeholder="Enter default branch name" defaultValue="main" />
        </div>
        
        <Button className="w-full">Save Git Configuration</Button>
      </CardContent>
    </Card>
  );
};