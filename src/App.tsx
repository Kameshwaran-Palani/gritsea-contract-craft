
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import ContractBuilder from "./pages/ContractBuilder";
import ContractEdit from "./pages/ContractEdit";
import ContractNew from "./pages/ContractNew";
import ContractsTabbed from "./pages/ContractsTabbed";
import ContractView from "./pages/ContractView";
import ContractSecureView from "./pages/ContractSecureView";
import ESignView from "./pages/ESignView";
import ContractRedirect from "./pages/ContractRedirect";
import Templates from "./pages/Templates";
import Settings from "./pages/Settings";
import Pricing from "./pages/Pricing";
import Community from "./pages/Community";
import AIAssistant from "./pages/AIAssistant";
import AIPrompt from "./pages/AIPrompt";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/contracts" element={<ContractsTabbed />} />
              <Route path="/contract/new" element={<ContractNew />} />
              <Route path="/contract/builder/:id" element={<ContractBuilder />} />
              <Route path="/contract/edit/:id" element={<ContractEdit />} />
              <Route path="/contract/view/:id" element={<ContractView />} />
              <Route path="/contract/secure/:publicLinkId" element={<ContractSecureView />} />
              <Route path="/esign/:contractId/:authMethod" element={<ESignView />} />
              <Route path="/contract/:id" element={<ContractRedirect />} />
              <Route path="/templates" element={<Templates />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/community" element={<Community />} />
              <Route path="/ai-assistant" element={<AIAssistant />} />
              <Route path="/ai-prompt" element={<AIPrompt />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
