// import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ContextProvider } from "./context/contextProvider";
import Availability from "./pages/Availability";
import BookingPage from "./pages/BookingPage";
import Dashboard from "./pages/Dashboard";
import EventTypes from "./pages/EventTypes";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ScheduledEvents from "./pages/ScheduledEvents";
import Settings from "./pages/Settings";

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
