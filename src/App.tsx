
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Contracts from "./pages/Contracts";
import ContractBuilder from "./pages/ContractBuilder";
import ContractEdit from "./pages/ContractEdit";
import ContractView from "./pages/ContractView";
import Templates from "./pages/Templates";
import Pricing from "./pages/Pricing";
import Settings from "./pages/Settings";
import AIAssistant from "./pages/AIAssistant";
import AIPrompt from "./pages/AIPrompt";
import Community from "./pages/Community";
import ContractNew from "./pages/ContractNew";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <AuthProvider>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/contracts" element={<Contracts />} />
                <Route path="/contract/new" element={<ContractNew />} />
                <Route path="/contract/builder" element={<ContractBuilder />} />
                <Route path="/contract/edit/:id" element={<ContractEdit />} />
                <Route path="/contract/view/:id" element={<ContractView />} />
                <Route path="/templates" element={<Templates />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/ai-assistant" element={<AIAssistant />} />
                <Route path="/prompt" element={<AIPrompt />} />
                <Route path="/community" element={<Community />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
