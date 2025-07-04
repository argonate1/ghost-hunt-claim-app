import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { WalletConnectProvider } from "@/contexts/WalletConnectContext";
import { LandingPage } from "@/components/landing/LandingPage";
import Dashboard from "./pages/Dashboard";
import Scanner from "./pages/Scanner";
import Claims from "./pages/Claims";
import Settings from "./pages/Settings";
import Admin from "./pages/Admin";
import Map from "./pages/Map";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppContent() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-ghost">
        <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center glow-primary pulse-glow p-3">
          <img src="/lovable-uploads/bd75dab4-c683-46eb-947e-050d35a0f536.png" alt="Ghostcoin Logo" className="w-full h-full object-contain" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <LandingPage />;
  }

  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/scan" element={<Scanner />} />
      <Route path="/claims" element={<Claims />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/map" element={<Map />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <WalletConnectProvider>
            <AppContent />
          </WalletConnectProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
