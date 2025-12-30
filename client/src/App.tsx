import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import CalendarPage from "@/pages/calendar";
import ChatPage from "@/pages/chat";
import ProfilePage from "@/pages/profile";
import LoginPage from "@/pages/login";
import CommunityPage from "@/pages/community";
import ThreadPage from "@/pages/thread";
import DoctorReportPage from "@/pages/doctor-report";
import { useEffect } from "react";

function ProtectedRoute({ component: Component, ...rest }: any) {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      setLocation("/login");
    }
  }, [user, loading, setLocation]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-muted-foreground">Loading...</div>
    </div>;
  }

  if (!user) {
    return null;
  }

  return <Component {...rest} />;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/" component={(props) => <ProtectedRoute component={Home} {...props} />} />
      <Route path="/calendar" component={(props) => <ProtectedRoute component={CalendarPage} {...props} />} />
      <Route path="/community" component={(props) => <ProtectedRoute component={CommunityPage} {...props} />} />
      <Route path="/community/thread/:id" component={(props) => <ProtectedRoute component={ThreadPage} {...props} />} />
      <Route path="/chat" component={(props) => <ProtectedRoute component={ChatPage} {...props} />} />
      <Route path="/profile" component={(props) => <ProtectedRoute component={ProfilePage} {...props} />} />
      <Route path="/doctor-report" component={(props) => <ProtectedRoute component={DoctorReportPage} {...props} />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
