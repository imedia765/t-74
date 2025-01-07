import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProjectProvider } from "./contexts/ProjectContext";
import Header from "./components/Header";
import Home from "./pages/Home";
import CodeGenerator from "./pages/CodeGenerator";
import AIResearcher from "./pages/AIResearcher";
import Documentation from "./pages/Documentation";
import Analytics from "./pages/Analytics";
import Configuration from "./pages/Configuration";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ProjectProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/code-generator" element={<CodeGenerator />} />
                <Route path="/researcher" element={<AIResearcher />} />
                <Route path="/docs" element={<Documentation />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/configuration" element={<Configuration />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </ProjectProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;