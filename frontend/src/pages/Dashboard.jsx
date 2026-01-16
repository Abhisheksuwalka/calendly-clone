import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  Users,
  ArrowUpRight,
  Copy,
  Plus,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { useContextProvider } from "@/context/contextProvider";
import { toast } from "sonner";

export default function Dashboard() {
  const { api } = useContextProvider();
  const [stats, setStats] = useState([
    { label: "Total Meetings", value: "0", change: "+0%", icon: Calendar },
    { label: "Hours Saved", value: "0", change: "+0%", icon: Clock },
    { label: "Event Types", value: "0", change: "+0%", icon: Users },
  ]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch user info
      try {
        const userData = await api.getMe();
        setUser(userData);
      } catch (e) {
        // User endpoint might not be available
      }

      // Fetch upcoming meetings
      const meetingsData = await api.getMeetings({ status: "upcoming", limit: 4 });
      // Backend returns { bookings: [...] }
      const meetings = meetingsData.bookings || meetingsData.meetings || [];
      setUpcomingEvents(
        meetings.map((m) => ({
          id: m.id,
          title: m.event_type?.name || "Meeting",
          time: new Date(m.start_time).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }),
          date: isToday(m.start_time)
            ? "Today"
            : isTomorrow(m.start_time)
              ? "Tomorrow"
              : new Date(m.start_time).toLocaleDateString(),
          attendee: m.invitee?.name || "Unknown",
          type: `${m.event_type?.duration_minutes || 30} min`,
          color: getColorClass(m.event_type?.color),
        }))
      );

      // Fetch event types count
      const eventTypesData = await api.getEventTypes();
      const eventTypesCount = eventTypesData.event_types?.length || 0;

      // Update stats
      setStats([
        { label: "Total Meetings", value: String(meetingsData.pagination?.total || meetings.length), change: "+12%", icon: Calendar },
        { label: "Hours Saved", value: String(Math.round((meetingsData.pagination?.total || meetings.length) * 0.5)), change: "+8%", icon: Clock },
        { label: "Event Types", value: String(eventTypesCount), change: "+0%", icon: Users },
      ]);
    } catch (err) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const isToday = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isTomorrow = (dateStr) => {
    const date = new Date(dateStr);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return date.toDateString() === tomorrow.toDateString();
  };

  const colorMap = {
    "#8B5CF6": "bg-purple-500",
    "#3B82F6": "bg-blue-500",
    "#EC4899": "bg-pink-500",
    "#F97316": "bg-orange-500",
    "#10B981": "bg-green-500",
    "#14B8A6": "bg-teal-500",
  };

  const getColorClass = (color) => colorMap[color] || "bg-primary";

  const copyBookingLink = () => {
    const link = `${window.location.origin}/book/abhishek`;
    navigator.clipboard.writeText(link);
    toast.success("Booking link copied!");
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}! 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              Here's what's happening with your scheduling.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2" onClick={copyBookingLink}>
              <Copy className="w-4 h-4" />
              Copy link
            </Button>
            <Link to="/event-types">
              <Button variant="hero" className="gap-2">
                <Plus className="w-4 h-4" />
                New Event Type
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-6">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-card rounded-xl p-6 shadow-card border border-border hover:shadow-card-hover transition-shadow duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-accent-foreground" />
                </div>
                <span className="flex items-center gap-1 text-sm font-medium text-success">
                  <TrendingUp className="w-4 h-4" />
                  {stat.change}
                </span>
              </div>
              <p className="text-3xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Main content grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Upcoming Events */}
          <div className="lg:col-span-2 bg-card rounded-xl shadow-card border border-border">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">
                  Upcoming Events
                </h2>
                <Link
                  to="/scheduled-events"
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  View all
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
            {upcomingEvents.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-medium text-foreground mb-1">No upcoming events</h3>
                <p className="text-sm text-muted-foreground">
                  When someone books a meeting with you, it will appear here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-6 hover:bg-secondary/30 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-1 h-14 rounded-full ${event.color}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-foreground">{event.title}</p>
                            <p className="text-sm text-muted-foreground mt-1">{event.attendee}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-foreground">{event.time}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {event.date} · {event.type}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-card rounded-xl shadow-card border border-border">
            <div className="p-6 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
            </div>
            <div className="p-6 space-y-4">
              <Link to="/event-types" className="block">
                <div className="p-4 rounded-lg border border-border hover:border-primary hover:shadow-card-hover transition-all duration-200 cursor-pointer group">
                  <Plus className="w-5 h-5 text-primary mb-3 group-hover:scale-110 transition-transform" />
                  <p className="font-medium text-foreground">Create Event Type</p>
                  <p className="text-sm text-muted-foreground mt-1">Set up a new meeting type</p>
                </div>
              </Link>
              <Link to="/availability" className="block">
                <div className="p-4 rounded-lg border border-border hover:border-primary hover:shadow-card-hover transition-all duration-200 cursor-pointer group">
                  <Clock className="w-5 h-5 text-primary mb-3 group-hover:scale-110 transition-transform" />
                  <p className="font-medium text-foreground">Set Availability</p>
                  <p className="text-sm text-muted-foreground mt-1">Update your working hours</p>
                </div>
              </Link>
              <Link to={`/book/abhishek`} className="block">
                <div className="p-4 rounded-lg border border-border hover:border-primary hover:shadow-card-hover transition-all duration-200 cursor-pointer group">
                  <Calendar className="w-5 h-5 text-primary mb-3 group-hover:scale-110 transition-transform" />
                  <p className="font-medium text-foreground">Preview Page</p>
                  <p className="text-sm text-muted-foreground mt-1">See your booking page</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
