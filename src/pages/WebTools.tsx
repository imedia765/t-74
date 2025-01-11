import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { WebMetricsForm } from "@/components/web-tools/WebMetricsForm";
import { MetricsDisplay } from "@/components/web-tools/MetricsDisplay";
import { ConsoleOutput } from "@/components/web-tools/ConsoleOutput";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const WebTools = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const { toast } = useToast();

  const { data: metrics = [] } = useQuery({
    queryKey: ['web-metrics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('web_metrics')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching metrics:', error);
        toast({
          title: "Error fetching metrics",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }

      return data.map(item => ({
        metric: item.metric_name,
        value: item.metric_value
      }));
    }
  });

  const handleAnalyze = async (url: string) => {
    setIsLoading(true);
    try {
      const mockMetrics = [
        { metric_name: "Page Load Time", metric_value: "2.3s" },
        { metric_name: "Page Size", metric_value: "1.2MB" },
        { metric_name: "Meta Description", metric_value: "Present" },
        { metric_name: "H1 Tag", metric_value: "Present" },
        { metric_name: "HTTPS", metric_value: "Yes" },
        { metric_name: "Image Alt Tags", metric_value: "Present" }
      ];

      // Insert metrics into Supabase
      const { error } = await supabase.from('web_metrics').insert(
        mockMetrics.map(metric => ({
          url,
          ...metric
        }))
      );

      if (error) throw error;

      toast({
        title: "Analysis Complete",
        description: "Website metrics have been analyzed and saved.",
      });

      setLogs([`[${new Date().toLocaleTimeString()}] Analysis complete for ${url}`]);
    } catch (error) {
      console.error('Error analyzing website:', error);
      toast({
        title: "Error analyzing website",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
      setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Error: ${error}`]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 p-6">
          <div className="container mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold">Web Development Tools</h1>
              <SidebarTrigger className="md:hidden" />
            </div>
            <div className="grid gap-6">
              <WebMetricsForm onAnalyze={handleAnalyze} isLoading={isLoading} />
              <MetricsDisplay metrics={metrics} />
              <ConsoleOutput logs={logs} />
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default WebTools;