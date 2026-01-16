import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useContextProvider } from "@/context/contextProvider";
import {
  ChevronDown,
  ChevronUp,
  Clock,
  Copy,
  ExternalLink,
  Eye,
  Globe,
  Link as LinkIcon,
  Loader2,
  MapPin,
  MoreVertical,
  Pencil,
  Phone,
  Plus,
  Search,
  Settings,
  Trash2,
  Users,
  Video,
  X
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

// ============================================
// CALENDLY COOL GREY DESIGN SYSTEM
// The "DNA" that makes Calendly look premium
// ============================================
const colors = {
  // Primary Typography
  navy: "#0a2540",        // Deep Navy - Card Titles, User Names
  slate: "#476788",       // Slate Blue-Grey - Meta text, descriptions
  
  // Action Colors
  blue: "#0069ff",        // Action Blue - Links, Primary Buttons
  blueHover: "#0055cc",   // Blue hover state
  
  // Borders - ICE BLUE (The Critical Difference)
  border: "#d4e0ed",      // Ice Blue - ALL borders
  borderHover: "#0069ff", // Hover border
  
  // Backgrounds
  bgPage: "#fafafa",      // Page background (off-white)
  bgCard: "#ffffff",      // Card background (pure white)
  bgHover: "#f0f6ff",     // Light blue hover
  bgActive: "#e6f2ff",    // Active selection
  
  // Avatar
  avatarBg: "#e7edf6",    // Pale blue avatar bg
  avatarText: "#004eba",  // Dark blue avatar text
  
  // Placeholder & Muted
  placeholder: "#a6bbd1", // Light blue-grey placeholder
  muted: "#999999",       // Muted grey
  
  // Status
  orange: "#D97706",      // Orange status indicator
};

// Shadows
const shadows = {
  sm: "0 1px 2px rgba(0,0,0,0.02)",
  md: "0 4px 12px rgba(0,0,0,0.08)",
  focus: "0 0 0 2px rgba(0, 105, 255, 0.2)",
};

// Color options for event types
const colorOptions = [
  { value: "#8B5CF6", label: "Purple" },
  { value: "#F59E0B", label: "Orange" },
  { value: "#3B82F6", label: "Blue" },
  { value: "#10B981", label: "Green" },
  { value: "#F97316", label: "Coral" },
  { value: "#14B8A6", label: "Teal" },
];

// Duration options
const durationOptions = [
  { value: 15, label: "15 min" },
  { value: 30, label: "30 min" },
  { value: 45, label: "45 min" },
  { value: 60, label: "1 hr" },
];

// Location types
const locationTypes = [
  { value: "zoom", label: "Zoom", icon: Video },
  { value: "phone", label: "Phone call", icon: Phone },
  { value: "in_person", label: "In-person", icon: MapPin },
];

// Day names for display
const dayNames = ["S", "M", "T", "W", "T", "F", "S"];

export default function EventTypes() {
  const { api } = useContextProvider();
  const [searchParams, setSearchParams] = useSearchParams();
  const [eventTypes, setEventTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDropdownOpen, setIsCreateDropdownOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [activeTab, setActiveTab] = useState("event_types");
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  
  // Edit panel state
  const [editingEvent, setEditingEvent] = useState(null);
  const [editFormData, setEditFormData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  
  // Create panel state (right-side panel for new event)
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newEventType, setNewEventType] = useState({
    name: "New Meeting",
    description: "",
    duration_minutes: 30,
    color: "#F59E0B",
    location_type: "zoom",
  });

  useEffect(() => {
    fetchEventTypes();
    fetchUser();
  }, []);

  // Handle ?edit=ID parameter to auto-open edit panel
  useEffect(() => {
    const editId = searchParams.get('edit');
    if (editId && eventTypes.length > 0) {
      const eventToEdit = eventTypes.find(e => String(e.id) === editId);
      if (eventToEdit) {
        openEditPanel(eventToEdit);
        // Clear the URL param after opening
        searchParams.delete('edit');
        setSearchParams(searchParams, { replace: true });
      }
    }
  }, [eventTypes, searchParams]);

  const fetchUser = async () => {
    try {
      const userData = await api.getMe();
      setUser(userData);
    } catch (err) {
      console.error("Failed to fetch user:", err);
    }
  };

  const fetchEventTypes = async () => {
    try {
      setLoading(true);
      const data = await api.getEventTypes();
      setEventTypes(data.event_types || []);
    } catch (err) {
      toast.error("Failed to load event types");
      setEventTypes([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSchedule = async () => {
    try {
      setLoadingSchedule(true);
      const data = await api.getSchedule();
      setSchedule(data);
    } catch (err) {
      console.error("Failed to fetch schedule:", err);
    } finally {
      setLoadingSchedule(false);
    }
  };

  const createEventType = async (e) => {
    e.preventDefault();
    if (!newEventType.name.trim()) {
      toast.error("Please enter a name for the event type");
      return;
    }
    try {
      setCreating(true);
      const result = await api.createEventType({
        name: newEventType.name,
        duration_minutes: newEventType.duration_minutes,
        color: newEventType.color,
        ...(newEventType.description && { description: newEventType.description }),
        ...(newEventType.location_type && { location_type: newEventType.location_type }),
      });
      setEventTypes([...eventTypes, result]);
      toast.success("Event type created!");
      setIsCreateModalOpen(false);
      setNewEventType({
        name: "New Meeting",
        description: "",
        duration_minutes: 30,
        color: "#F59E0B",
        location_type: "google_meet",
      });
    } catch (err) {
      toast.error(err.message || "Failed to create event type");
    } finally {
      setCreating(false);
    }
  };

  const openEditPanel = (eventType) => {
    setEditingEvent(eventType);
    setEditFormData({
      name: eventType.name,
      description: eventType.description || "",
      duration_minutes: eventType.duration_minutes,
      color: eventType.color,
      location_type: eventType.location_type || "zoom",
    });
    setExpandedSection(null);
    fetchSchedule();
  };

  const closeEditPanel = () => {
    setEditingEvent(null);
    setEditFormData(null);
    setExpandedSection(null);
    setSchedule(null);
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const saveEventType = async () => {
    if (!editingEvent || !editFormData) return;
    try {
      setSaving(true);
      const result = await api.updateEventType(editingEvent.id, editFormData);
      setEventTypes(
        eventTypes.map((et) =>
          et.id === editingEvent.id ? { ...et, ...result } : et
        )
      );
      toast.success("Event type updated!");
      closeEditPanel();
    } catch (err) {
      toast.error(err.message || "Failed to update event type");
    } finally {
      setSaving(false);
    }
  };

  const toggleEventType = async (id, e) => {
    e?.stopPropagation?.();
    try {
      const result = await api.toggleEventType(id);
      setEventTypes(
        eventTypes.map((et) =>
          et.id === id ? { ...et, is_active: result.is_active } : et
        )
      );
      toast.success(result.is_active ? "Event type activated" : "Event type deactivated");
    } catch (err) {
      toast.error("Failed to toggle event type");
    }
  };

  const duplicateEventType = async (id) => {
    try {
      const result = await api.duplicateEventType(id);
      setEventTypes([...eventTypes, result]);
      toast.success("Event type duplicated");
    } catch (err) {
      toast.error("Failed to duplicate event type");
    }
  };

  const deleteEventType = async (id) => {
    try {
      await api.deleteEventType(id);
      setEventTypes(eventTypes.filter((et) => et.id !== id));
      toast.success("Event type deleted");
    } catch (err) {
      toast.error(err.message || "Failed to delete event type");
    }
  };

  const copyLink = (eventType, e) => {
    e?.stopPropagation?.();
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/book/${user?.username || "abhishek"}/${eventType.slug}`;
    navigator.clipboard.writeText(link);
    toast.success("Link copied to clipboard");
  };

  const handleCreateEventType = (type) => {
    setIsCreateDropdownOpen(false);
    if (type === "one-on-one") {
      // Close edit panel if open, and open create panel
      setEditingEvent(null);
      setEditFormData(null);
      setIsCreatingNew(true);
      setNewEventType({
        name: "New Meeting",
        description: "",
        duration_minutes: 30,
        color: "#F59E0B",
        location_type: "zoom",
      });
      setExpandedSection(null);
    }
  };

  const closeCreatePanel = () => {
    setIsCreatingNew(false);
    setNewEventType({
      name: "New Meeting",
      description: "",
      duration_minutes: 30,
      color: "#F59E0B",
      location_type: "zoom",
    });
    setExpandedSection(null);
  };

  const createEventTypeFromPanel = async () => {
    if (!newEventType.name.trim()) {
      toast.error("Please enter a name for the event type");
      return;
    }
    try {
      setCreating(true);
      const result = await api.createEventType({
        name: newEventType.name,
        duration_minutes: newEventType.duration_minutes,
        color: newEventType.color,
        ...(newEventType.description && { description: newEventType.description }),
        ...(newEventType.location_type && { location_type: newEventType.location_type }),
      });
      setEventTypes([...eventTypes, result]);
      toast.success("Event type created!");
      closeCreatePanel();
    } catch (err) {
      toast.error(err.message || "Failed to create event type");
    } finally {
      setCreating(false);
    }
  };

  const getAvailabilitySummary = () => {
    if (!schedule || !schedule.weekly_hours) return "Weekdays, 9 am - 5 pm";
    const enabledDays = schedule.weekly_hours.filter(d => d.is_enabled);
    if (enabledDays.length === 0) return "No availability set";
    const hasWeekdaysOnly = enabledDays.every(d => d.day_of_week >= 1 && d.day_of_week <= 5);
    const firstInterval = enabledDays[0]?.intervals?.[0];
    if (!firstInterval) return "Weekdays";
    const formatTime = (time) => {
      const [h] = time.split(":");
      const hour = parseInt(h);
      if (hour === 0) return "12 am";
      if (hour < 12) return `${hour} am`;
      if (hour === 12) return "12 pm";
      return `${hour - 12} pm`;
    };
    return `${hasWeekdaysOnly ? "Weekdays" : "Custom"}, ${formatTime(firstInterval.start_time)} - ${formatTime(firstInterval.end_time)}`;
  };

  const filteredEventTypes = eventTypes.filter((et) =>
    et.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-100px)]">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: colors.blue }} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen flex" style={{ backgroundColor: colors.bgPage }}>
        {/* Main Content */}
        <div className={`flex-1 transition-all duration-300 ${(editingEvent || isCreatingNew) ? 'mr-[400px]' : ''}`}>
          <div className="w-[75%] max-w-5xl mx-auto px-6 pt-2">
            
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <h1 
                  className="text-[24px] font-bold"
                  style={{ color: colors.navy }}
                >
                  Scheduling
                </h1>
                <button 
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[11px]"
                  style={{ 
                    border: `1px solid ${colors.border}`, 
                    color: colors.slate 
                  }}
                >
                  ?
                </button>
              </div>
              
              {/* Create Button - Calendly Blue, Pill Shape */}
              <DropdownMenu open={isCreateDropdownOpen} onOpenChange={setIsCreateDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <Button 
                    className="text-white rounded-[40px] font-semibold h-10 px-5 gap-2"
                    style={{ backgroundColor: colors.blue }}
                  >
                    <Plus className="w-4 h-4" />
                    Create
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72 p-0">
                  <div 
                    className="px-4 py-2 text-[12px] font-semibold uppercase tracking-wide"
                    style={{ color: colors.slate }}
                  >
                    Event type
                  </div>
                  <DropdownMenuItem 
                    className="px-4 py-3 cursor-pointer hover:bg-[#f5f5f5]"
                    onClick={() => handleCreateEventType("one-on-one")}
                  >
                    <div>
                      <div className="text-[14px] font-medium" style={{ color: colors.blue }}>One-on-one</div>
                      <div className="text-[12px]" style={{ color: colors.slate }}>1 host → 1 invitee</div>
                      <div className="text-[11px] mt-0.5" style={{ color: colors.muted }}>Good for coffee chats, 1:1 interviews, etc.</div>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="px-4 py-3 cursor-pointer hover:bg-[#f5f5f5]">
                    <div>
                      <div className="text-[14px] font-medium" style={{ color: colors.navy }}>Group</div>
                      <div className="text-[12px]" style={{ color: colors.slate }}>1 host → Multiple invitees</div>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="px-4 py-3 cursor-pointer hover:bg-[#f5f5f5]">
                    <div>
                      <div className="text-[14px] font-medium" style={{ color: colors.navy }}>Round robin</div>
                      <div className="text-[12px]" style={{ color: colors.slate }}>Rotating hosts → 1 invitee</div>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <div 
                    className="px-4 py-2 text-[12px] font-semibold uppercase tracking-wide"
                    style={{ color: colors.slate }}
                  >
                    More ways to meet
                  </div>
                  <DropdownMenuItem className="px-4 py-3 cursor-pointer hover:bg-[#f5f5f5]">
                    <div>
                      <div className="text-[14px] font-medium" style={{ color: colors.blue }}>One-off meeting</div>
                      <div className="text-[12px]" style={{ color: colors.slate }}>Offer time outside your normal schedule</div>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Tabs - 3px blue underline on active */}
            <div 
              className="flex gap-6 mb-6"
              style={{ borderBottom: `1px solid ${colors.border}` }}
            >
              {[
                { id: "event_types", label: "Event types" },
                { id: "single_use", label: "Single-use links" },
                { id: "polls", label: "Meeting polls" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="pb-3 text-[15px] font-medium -mb-px transition-colors"
                  style={{
                    color: activeTab === tab.id ? colors.navy : colors.slate,
                    borderBottom: activeTab === tab.id ? `3px solid ${colors.blue}` : '3px solid transparent',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Bar - ICE BLUE BORDER */}
            <div className="relative mb-4">
              <Search 
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
                style={{ color: colors.placeholder }}
              />
              <input
                type="text"
                placeholder="Search event types"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full max-w-[400px] h-12 pl-12 pr-4 rounded-full text-[15px] outline-none transition-shadow"
                style={{
                  border: `1px solid ${colors.border}`,
                  color: colors.navy,
                  backgroundColor: colors.bgCard,
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = colors.blue;
                  e.target.style.boxShadow = shadows.focus;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = colors.border;
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* User Row - Separate card matching Calendly */}
            <div 
              className="rounded-lg flex items-center justify-between py-4 px-5 mb-3"
              style={{ 
                backgroundColor: colors.bgCard,
                border: `1px solid ${colors.border}`,
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}
            >
              <div className="flex items-center gap-3">
                {/* Avatar - Pale Blue Background */}
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-[15px] font-bold"
                  style={{ 
                    backgroundColor: colors.avatarBg, 
                    color: colors.avatarText 
                  }}
                >
                  {user?.name?.charAt(0)?.toUpperCase() || "A"}
                </div>
                {/* Name - Bold 700, Deep Navy */}
                <span 
                  className="text-[15px] font-bold"
                  style={{ color: colors.navy }}
                >
                  {user?.name || "Abhishek Suwalka"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {/* View landing page - Action Blue */}
                <Link
                  to={`/book/${user?.username || "abhishek"}`}
                  className="flex items-center gap-1.5 text-[14px] font-medium hover:underline"
                  style={{ color: colors.blue }}
                >
                  <ExternalLink className="w-[14px] h-[14px]" />
                  View landing page
                </Link>
                <button 
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#f5f5f5]"
                  style={{ color: colors.navy }}
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Event Type Cards - Individual cards with gaps */}
            {filteredEventTypes.length === 0 ? (
              <div className="p-12 text-center">
                <p style={{ color: colors.slate }}>No event types found</p>
              </div>
            ) : (
              <div className="space-y-3">
                  {filteredEventTypes.map((eventType) => (
                    <div
                      key={eventType.id}
                      className="flex items-center relative cursor-pointer transition-all rounded-lg overflow-hidden"
                      style={{
                        backgroundColor: editingEvent?.id === eventType.id 
                          ? colors.bgActive 
                          : hoveredCard === eventType.id 
                            ? colors.bgHover 
                            : colors.bgCard,
                        opacity: eventType.is_active ? 1 : 0.5,
                        padding: '20px 24px',
                        border: `1px solid ${colors.border}`,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                      }}
                      onClick={() => openEditPanel(eventType)}
                      onMouseEnter={() => setHoveredCard(eventType.id)}
                      onMouseLeave={() => setHoveredCard(null)}
                    >
                      {/* Left Colored Strip - 5px width, inside border */}
                      <div
                        className="absolute left-0 top-0 bottom-0 w-[5px] rounded-l-[6px]"
                        style={{ backgroundColor: eventType.color }}
                      />

                      {/* Checkbox - ICE BLUE border */}
                      <div className="mr-4">
                        <div 
                          className="w-[18px] h-[18px] rounded border-2 flex items-center justify-center cursor-pointer"
                          style={{ borderColor: colors.border }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>

                      {/* Event Info */}
                      <div className="flex-1 min-w-0 pr-4">
                        {/* Title - Deep Navy, Bold 700, 16px */}
                        <h3 
                          className="text-[16px] font-bold mb-1"
                          style={{ color: colors.navy }}
                        >
                          {eventType.name}
                        </h3>
                        {/* Meta - Slate Blue-Grey, Regular 400, 14px */}
                        <div 
                          className="flex items-center gap-1.5 text-[14px] mb-1"
                          style={{ color: colors.slate }}
                        >
                          {/* Orange status indicator */}
                          <div 
                            className="w-4 h-4 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: colors.orange }}
                          >
                            <span className="text-white text-[10px] font-bold">!</span>
                          </div>
                          <span>{eventType.duration_minutes} min, One-on-One</span>
                        </div>
                        {/* Sub-meta */}
                        <div 
                          className="text-[14px] mt-1"
                          style={{ color: colors.slate }}
                        >
                          Weekdays, 9 am - 5 pm
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3">
                        {/* Copy Link Button - ICE BLUE BORDER, Deep Navy text */}
                        <button
                          onClick={(e) => copyLink(eventType, e)}
                          className="flex items-center gap-2 px-4 py-2 text-[14px] font-semibold rounded-full transition-all"
                          style={{
                            color: colors.navy,
                            border: `1px solid ${colors.border}`,
                            backgroundColor: 'transparent',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = colors.blue;
                            e.currentTarget.style.color = colors.blue;
                            e.currentTarget.style.backgroundColor = colors.bgHover;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = colors.border;
                            e.currentTarget.style.color = colors.navy;
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          <LinkIcon className="w-[14px] h-[14px]" />
                          Copy link
                        </button>

                        {/* Menu Icon - Deep Navy */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button 
                              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#f5f5f5] transition-colors"
                              style={{ color: colors.navy }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="w-5 h-5" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuItem
                              className="gap-2 text-[14px] cursor-pointer"
                              onClick={() => window.open(`/book/${user?.username || "abhishek"}/${eventType.slug}`, "_blank")}
                            >
                              <Eye className="w-4 h-4" />
                              View booking page
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="gap-2 text-[14px] cursor-pointer"
                              onClick={() => openEditPanel(eventType)}
                            >
                              <Pencil className="w-4 h-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 text-[14px] cursor-pointer">
                              <Users className="w-4 h-4" />
                              Edit permissions
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="gap-2 text-[14px] cursor-pointer">
                              <Globe className="w-4 h-4" />
                              Add to website
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 text-[14px] cursor-pointer">
                              <Settings className="w-4 h-4" />
                              Add internal note
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="gap-2 text-[14px] cursor-pointer"
                              onClick={() => duplicateEventType(eventType.id)}
                            >
                              <Copy className="w-4 h-4" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="gap-2 text-[14px] text-red-600 cursor-pointer focus:text-red-600"
                              onClick={() => deleteEventType(eventType.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <div className="flex items-center justify-between px-2 py-1.5">
                              <span className="text-[14px]" style={{ color: colors.navy }}>On/Off</span>
                              <Switch
                                checked={eventType.is_active}
                                onCheckedChange={() => toggleEventType(eventType.id)}
                              />
                            </div>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            {/* Show more link */}
            {filteredEventTypes.length > 5 && (
              <div className="mt-4 text-center">
                <button 
                  className="flex items-center gap-1 text-[14px] mx-auto hover:underline"
                  style={{ color: colors.blue }}
                >
                  <ChevronDown className="w-4 h-4" />
                  Show more event types ({filteredEventTypes.length - 5})
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Edit Panel */}
        {editingEvent && editFormData && (
          <div 
            className="fixed right-0 top-0 h-full w-[400px] shadow-xl z-50 flex flex-col"
            style={{
              backgroundColor: colors.bgCard,
              borderLeft: `1px solid ${colors.border}`,
            }}
          >
            {/* Panel Header */}
            <div 
              className="p-5"
              style={{ borderBottom: `1px solid ${colors.border}` }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div
                    className="w-3 h-3 rounded-full mt-1.5"
                    style={{ backgroundColor: editFormData.color }}
                  />
                  <div>
                    <p 
                      className="text-[11px] uppercase tracking-wide"
                      style={{ color: colors.slate }}
                    >
                      Event type
                    </p>
                    <h2 
                      className="text-[18px] font-bold"
                      style={{ color: colors.navy }}
                    >
                      {editFormData.name}
                    </h2>
                    <p 
                      className="text-[14px]"
                      style={{ color: colors.slate }}
                    >
                      One-on-One
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    className="w-8 h-8 flex items-center justify-center"
                    style={{ color: colors.slate }}
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                  <button
                    onClick={closeEditPanel}
                    className="w-8 h-8 flex items-center justify-center"
                    style={{ color: colors.slate }}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Panel Content - Accordion */}
            <div className="flex-1 overflow-y-auto">
              {/* Duration Section */}
              <div style={{ borderBottom: `1px solid ${colors.border}` }}>
                <button
                  onClick={() => toggleSection('duration')}
                  className="flex items-center justify-between w-full px-5 py-4 hover:bg-[#fafafa] transition-colors"
                >
                  <span 
                    className="text-[15px] font-semibold"
                    style={{ color: colors.navy }}
                  >
                    Duration
                  </span>
                  {expandedSection === 'duration' ? (
                    <ChevronUp className="w-5 h-5" style={{ color: colors.slate }} />
                  ) : (
                    <ChevronDown className="w-5 h-5" style={{ color: colors.slate }} />
                  )}
                </button>
                {expandedSection !== 'duration' && (
                  <div className="px-5 pb-4 -mt-2">
                    <div className="flex items-center gap-2 text-[14px]" style={{ color: colors.slate }}>
                      <Clock className="w-4 h-4" />
                      <span>{editFormData.duration_minutes} min</span>
                    </div>
                  </div>
                )}
                {expandedSection === 'duration' && (
                  <div className="px-5 pb-5">
                    <Select
                      value={String(editFormData.duration_minutes)}
                      onValueChange={(value) => setEditFormData({ ...editFormData, duration_minutes: parseInt(value) })}
                    >
                      <SelectTrigger 
                        className="w-full h-12 rounded-lg text-[15px]"
                        style={{ borderColor: colors.blue }}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {durationOptions.map((d) => (
                          <SelectItem key={d.value} value={String(d.value)} className="text-[15px] py-3">
                            {d.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <button 
                      className="flex items-center gap-1.5 mt-3 text-[14px] font-medium"
                      style={{ color: colors.blue }}
                    >
                      <Plus className="w-4 h-4" />
                      Add duration option
                    </button>
                  </div>
                )}
              </div>

              {/* Location Section */}
              <div style={{ borderBottom: `1px solid ${colors.border}` }}>
                <button
                  onClick={() => toggleSection('location')}
                  className="flex items-center justify-between w-full px-5 py-4 hover:bg-[#fafafa] transition-colors"
                >
                  <span 
                    className="text-[15px] font-semibold"
                    style={{ color: colors.navy }}
                  >
                    Location
                  </span>
                  {expandedSection === 'location' ? (
                    <ChevronUp className="w-5 h-5" style={{ color: colors.slate }} />
                  ) : (
                    <ChevronDown className="w-5 h-5" style={{ color: colors.slate }} />
                  )}
                </button>
                {expandedSection !== 'location' && (
                  <div className="px-5 pb-4 -mt-2">
                    <div 
                      className="p-3 rounded-lg text-[13px] flex items-start gap-2"
                      style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}
                    >
                      <span>💡</span>
                      <span><strong>Tip:</strong> Meetings with locations are more likely to start on time!</span>
                    </div>
                  </div>
                )}
                {expandedSection === 'location' && (
                  <div className="px-5 pb-5">
                    <div className="grid grid-cols-4 gap-2">
                      {locationTypes.map((loc) => {
                        const Icon = loc.icon;
                        return (
                          <button
                            key={loc.value}
                            onClick={() => setEditFormData({ ...editFormData, location_type: loc.value })}
                            className="flex flex-col items-center gap-2 py-4 px-2 rounded-lg border-2 transition-colors"
                            style={{
                              borderColor: editFormData.location_type === loc.value ? colors.blue : colors.border,
                              backgroundColor: editFormData.location_type === loc.value ? colors.bgHover : 'transparent',
                            }}
                          >
                            <Icon className="w-6 h-6" style={{ color: colors.slate }} />
                            <span className="text-[12px]" style={{ color: colors.navy }}>{loc.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Availability Section */}
              <div style={{ borderBottom: `1px solid ${colors.border}` }}>
                <button
                  onClick={() => toggleSection('availability')}
                  className="flex items-center justify-between w-full px-5 py-4 hover:bg-[#fafafa] transition-colors"
                >
                  <span 
                    className="text-[15px] font-semibold"
                    style={{ color: colors.navy }}
                  >
                    Availability
                  </span>
                  {expandedSection === 'availability' ? (
                    <ChevronUp className="w-5 h-5" style={{ color: colors.slate }} />
                  ) : (
                    <ChevronDown className="w-5 h-5" style={{ color: colors.slate }} />
                  )}
                </button>
                {expandedSection !== 'availability' && (
                  <div className="px-5 pb-4 -mt-2">
                    <p className="text-[14px]" style={{ color: colors.slate }}>
                      {getAvailabilitySummary()}
                    </p>
                  </div>
                )}
                {expandedSection === 'availability' && (
                  <div className="px-5 pb-5">
                    {loadingSchedule ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin" style={{ color: colors.blue }} />
                      </div>
                    ) : (
                      <>
                        <div className="mb-4">
                          <p className="text-[14px] font-semibold mb-2" style={{ color: colors.navy }}>Date-range</p>
                          <p className="text-[14px]" style={{ color: colors.slate }}>
                            Invitees can schedule <span style={{ color: colors.blue }}>60 days</span> into the future
                          </p>
                        </div>
                        <div 
                          className="p-4 rounded-lg"
                          style={{ border: `1px solid ${colors.border}` }}
                        >
                          <p className="text-[14px] font-semibold mb-3" style={{ color: colors.navy }}>Weekly hours</p>
                          <div className="space-y-2">
                            {[0,1,2,3,4,5,6].map((i) => (
                              <div key={i} className="flex items-center gap-3">
                                <span 
                                  className="w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-semibold"
                                  style={{
                                    backgroundColor: i === 0 || i === 6 ? colors.border : colors.blue,
                                    color: i === 0 || i === 6 ? colors.muted : 'white',
                                  }}
                                >
                                  {dayNames[i]}
                                </span>
                                <span 
                                  className="text-[14px]"
                                  style={{ color: i === 0 || i === 6 ? colors.muted : colors.navy }}
                                >
                                  {i === 0 || i === 6 ? "Unavailable" : "9:00am - 5:00pm"}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Host Section */}
              <div style={{ borderBottom: `1px solid ${colors.border}` }}>
                <button
                  onClick={() => toggleSection('host')}
                  className="flex items-center justify-between w-full px-5 py-4 hover:bg-[#fafafa] transition-colors"
                >
                  <span 
                    className="text-[15px] font-semibold"
                    style={{ color: colors.navy }}
                  >
                    Host
                  </span>
                  {expandedSection === 'host' ? (
                    <ChevronUp className="w-5 h-5" style={{ color: colors.slate }} />
                  ) : (
                    <ChevronDown className="w-5 h-5" style={{ color: colors.slate }} />
                  )}
                </button>
                {expandedSection !== 'host' && (
                  <div className="px-5 pb-4 -mt-2">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold"
                        style={{ backgroundColor: colors.avatarBg, color: colors.avatarText }}
                      >
                        A
                      </div>
                      <span className="text-[14px]" style={{ color: colors.slate }}>
                        {user?.name || "Abhishek Suwalka"} (you)
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Panel Footer */}
            <div 
              className="p-5 flex items-center justify-between"
              style={{ 
                borderTop: `1px solid ${colors.border}`,
                backgroundColor: colors.bgCard,
              }}
            >
              <button
                onClick={() => window.open(`/book/${user?.username || "abhishek"}/${editingEvent.slug}`, "_blank")}
                className="flex items-center gap-2 text-[14px]"
                style={{ color: colors.slate }}
              >
                <Eye className="w-4 h-4" />
                Preview
              </button>
              <Button
                onClick={saveEventType}
                disabled={saving}
                className="text-white px-6 rounded-full h-10"
                style={{ backgroundColor: colors.blue }}
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Save changes
              </Button>
            </div>
          </div>
        )}

        {/* Create Event Type Panel (Right Side - Like Edit Panel) */}
        {isCreatingNew && (
          <div 
            className="fixed right-0 top-0 h-full w-[400px] shadow-xl z-50 flex flex-col"
            style={{
              backgroundColor: colors.bgCard,
              borderLeft: `1px solid ${colors.border}`,
            }}
          >
            {/* Panel Header */}
            <div 
              className="p-5"
              style={{ borderBottom: `1px solid ${colors.border}` }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p 
                    className="text-[11px] uppercase tracking-wide mb-1"
                    style={{ color: colors.slate }}
                  >
                    Event type
                  </p>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: newEventType.color }}
                    />
                    <input
                      type="text"
                      value={newEventType.name}
                      onChange={(e) => setNewEventType({ ...newEventType, name: e.target.value })}
                      className="text-[18px] font-bold bg-transparent outline-none w-full"
                      style={{ 
                        color: colors.navy,
                        border: `1px solid ${colors.blue}`,
                        borderRadius: '4px',
                        padding: '4px 8px',
                      }}
                      placeholder="New Meeting"
                    />
                  </div>
                  <p 
                    className="text-[14px] mt-1"
                    style={{ color: colors.slate }}
                  >
                    One-on-One
                  </p>
                </div>
                <button
                  onClick={closeCreatePanel}
                  className="w-8 h-8 flex items-center justify-center ml-2"
                  style={{ color: colors.slate }}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Panel Content - Accordion Sections */}
            <div className="flex-1 overflow-y-auto">
              {/* Duration Section */}
              <div style={{ borderBottom: `1px solid ${colors.border}` }}>
                <button
                  onClick={() => toggleSection('duration')}
                  className="flex items-center justify-between w-full px-5 py-4 hover:bg-[#fafafa] transition-colors"
                >
                  <span 
                    className="text-[15px] font-semibold"
                    style={{ color: colors.navy }}
                  >
                    Duration
                  </span>
                  {expandedSection === 'duration' ? (
                    <ChevronUp className="w-5 h-5" style={{ color: colors.slate }} />
                  ) : (
                    <ChevronDown className="w-5 h-5" style={{ color: colors.slate }} />
                  )}
                </button>
                {expandedSection !== 'duration' && (
                  <div className="px-5 pb-4 -mt-2">
                    <div className="flex items-center gap-2 text-[14px]" style={{ color: colors.slate }}>
                      <Clock className="w-4 h-4" />
                      <span>{newEventType.duration_minutes} min</span>
                    </div>
                  </div>
                )}
                {expandedSection === 'duration' && (
                  <div className="px-5 pb-5">
                    <Select
                      value={String(newEventType.duration_minutes)}
                      onValueChange={(value) => setNewEventType({ ...newEventType, duration_minutes: parseInt(value) })}
                    >
                      <SelectTrigger 
                        className="w-full h-12 rounded-lg text-[15px]"
                        style={{ borderColor: colors.blue }}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {durationOptions.map((d) => (
                          <SelectItem key={d.value} value={String(d.value)}>
                            {d.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* Location Section */}
              <div style={{ borderBottom: `1px solid ${colors.border}` }}>
                <button
                  onClick={() => toggleSection('location')}
                  className="flex items-center justify-between w-full px-5 py-4 hover:bg-[#fafafa] transition-colors"
                >
                  <span 
                    className="text-[15px] font-semibold"
                    style={{ color: colors.navy }}
                  >
                    Location
                  </span>
                  {expandedSection === 'location' ? (
                    <ChevronUp className="w-5 h-5" style={{ color: colors.slate }} />
                  ) : (
                    <ChevronDown className="w-5 h-5" style={{ color: colors.slate }} />
                  )}
                </button>
                {expandedSection !== 'location' && (
                  <div className="px-5 pb-4 -mt-2">
                    <div 
                      className="flex items-center gap-4 p-3 rounded-lg"
                      style={{ backgroundColor: '#f0f6ff' }}
                    >
                      <div className="flex items-center gap-6">
                        {[
                          { value: 'zoom', icon: Video, label: 'Zoom' },
                          { value: 'phone', icon: Phone, label: 'Phone call' },
                          { value: 'in_person', icon: MapPin, label: 'In-person' },
                        ].map((loc) => (
                          <button
                            key={loc.value}
                            onClick={() => setNewEventType({ ...newEventType, location_type: loc.value })}
                            className={`flex flex-col items-center gap-1 p-2 rounded transition-colors ${
                              newEventType.location_type === loc.value ? 'bg-white shadow-sm' : ''
                            }`}
                          >
                            <loc.icon className="w-5 h-5" style={{ color: colors.navy }} />
                            <span className="text-[11px]" style={{ color: colors.slate }}>{loc.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <p className="text-[12px] mt-2 px-1" style={{ color: colors.blue }}>
                      <span className="inline-block mr-1">💡</span>
                      Tip: Meetings with locations are more likely to get booked!
                    </p>
                  </div>
                )}
                {expandedSection === 'location' && (
                  <div className="px-5 pb-5">
                    <div className="space-y-2">
                      {[
                        { value: 'zoom', label: 'Zoom', icon: Video },
                        { value: 'google_meet', label: 'Google Meet', icon: Video },
                        { value: 'phone', label: 'Phone call', icon: Phone },
                        { value: 'in_person', label: 'In-person', icon: MapPin },
                      ].map((loc) => (
                        <button
                          key={loc.value}
                          onClick={() => setNewEventType({ ...newEventType, location_type: loc.value })}
                          className={`flex items-center gap-3 w-full p-3 rounded-lg border transition-all ${
                            newEventType.location_type === loc.value 
                              ? 'border-[#0069ff] bg-[#f0f6ff]' 
                              : 'border-[#d4e0ed]'
                          }`}
                        >
                          <loc.icon className="w-5 h-5" style={{ color: colors.navy }} />
                          <span className="text-[14px]" style={{ color: colors.navy }}>{loc.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Availability Section */}
              <div style={{ borderBottom: `1px solid ${colors.border}` }}>
                <button
                  onClick={() => toggleSection('availability')}
                  className="flex items-center justify-between w-full px-5 py-4 hover:bg-[#fafafa] transition-colors"
                >
                  <span 
                    className="text-[15px] font-semibold"
                    style={{ color: colors.navy }}
                  >
                    Availability
                  </span>
                  {expandedSection === 'availability' ? (
                    <ChevronUp className="w-5 h-5" style={{ color: colors.slate }} />
                  ) : (
                    <ChevronDown className="w-5 h-5" style={{ color: colors.slate }} />
                  )}
                </button>
                {expandedSection !== 'availability' && (
                  <div className="px-5 pb-4 -mt-2">
                    <p className="text-[14px]" style={{ color: colors.slate }}>
                      Weekdays, 9 am - 5 pm
                    </p>
                  </div>
                )}
              </div>

              {/* Host Section */}
              <div style={{ borderBottom: `1px solid ${colors.border}` }}>
                <button
                  onClick={() => toggleSection('host')}
                  className="flex items-center justify-between w-full px-5 py-4 hover:bg-[#fafafa] transition-colors"
                >
                  <span 
                    className="text-[15px] font-semibold"
                    style={{ color: colors.navy }}
                  >
                    Host
                  </span>
                  {expandedSection === 'host' ? (
                    <ChevronUp className="w-5 h-5" style={{ color: colors.slate }} />
                  ) : (
                    <ChevronDown className="w-5 h-5" style={{ color: colors.slate }} />
                  )}
                </button>
                {expandedSection !== 'host' && (
                  <div className="px-5 pb-4 -mt-2">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold"
                        style={{ backgroundColor: colors.avatarBg, color: colors.avatarText }}
                      >
                        A
                      </div>
                      <span className="text-[14px]" style={{ color: colors.slate }}>
                        {user?.name || "Abhishek Suwalka"} (you)
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Panel Footer */}
            <div 
              className="p-5 flex items-center justify-between"
              style={{ 
                borderTop: `1px solid ${colors.border}`,
                backgroundColor: colors.bgCard,
              }}
            >
              <button
                onClick={closeCreatePanel}
                className="text-[14px] font-medium"
                style={{ color: colors.slate }}
              >
                More options
              </button>
              <Button
                onClick={createEventTypeFromPanel}
                disabled={creating}
                className="text-white px-6 rounded-full h-10"
                style={{ backgroundColor: colors.blue }}
              >
                {creating && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Create
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
