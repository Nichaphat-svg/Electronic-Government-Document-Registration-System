import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import IncomingDocuments from "./pages/IncomingDocuments";
import OutgoingDocuments from "./pages/OutgoingDocuments";
import OrderDocuments from "./pages/OrderDocuments";
import MemoDocuments from "./pages/MemoDocuments";
import AnnouncementDocuments from "./pages/AnnouncementDocuments";
import DocumentDistributions from "./pages/DocumentDistributions";
import Reports from "./pages/Reports";
import Search from "./pages/Search";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AuthRedirect({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={
            <AuthRedirect>
              <Auth />
            </AuthRedirect>
          } />
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/incoming" element={
            <ProtectedRoute>
              <IncomingDocuments />
            </ProtectedRoute>
          } />
          <Route path="/outgoing" element={
            <ProtectedRoute>
              <OutgoingDocuments />
            </ProtectedRoute>
          } />
          <Route path="/orders" element={
            <ProtectedRoute>
              <OrderDocuments />
            </ProtectedRoute>
          } />
          <Route path="/memos" element={
            <ProtectedRoute>
              <MemoDocuments />
            </ProtectedRoute>
          } />
          <Route path="/announcements" element={
            <ProtectedRoute>
              <AnnouncementDocuments />
            </ProtectedRoute>
          } />
          <Route path="/distributions" element={
            <ProtectedRoute>
              <DocumentDistributions />
            </ProtectedRoute>
          } />
          <Route path="/reports" element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          } />
          <Route path="/search" element={
            <ProtectedRoute>
              <Search />
            </ProtectedRoute>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
