// import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ContextProvider } from "./context/contextProvider";
import Admin from "./pages/Admin";
import Analytics from "./pages/Analytics";
import Availability from "./pages/Availability";
import BookingPage from "./pages/BookingPage";
import Contacts from "./pages/Contacts";
import Dashboard from "./pages/Dashboard";
import EventTypes from "./pages/EventTypes";
import Help from "./pages/Help";
import Index from "./pages/Index";
import Integrations from "./pages/Integrations";
import NotFound from "./pages/NotFound";
import Routing from "./pages/Routing";
import ScheduledEvents from "./pages/ScheduledEvents";
import Settings from "./pages/Settings";
import Workflows from "./pages/Workflows";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ContextProvider>
        {/* <Toaster /> */}
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/event-types" element={<EventTypes />} />
            <Route path="/scheduled-events" element={<ScheduledEvents />} />
            <Route path="/availability" element={<Availability />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/workflows" element={<Workflows />} />
            <Route path="/integrations" element={<Integrations />} />
            <Route path="/routing" element={<Routing />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/help" element={<Help />} />
            <Route path="/book/:username" element={<BookingPage />} />
            <Route path="/book/:username/:slug" element={<BookingPage />} />
            <Route path="/settings" element={<Settings />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ContextProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

