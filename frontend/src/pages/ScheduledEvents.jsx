import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useContextProvider } from "@/context/contextProvider";
import {
    Calendar,
    CalendarDays,
    ChevronDown,
    ChevronRight,
    Download,
    Edit,
    FileText,
    Filter,
    Info,
    Loader2,
    Repeat,
    Video,
    X
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function ScheduledEvents() {
  const { api, timeZone, user } = useContextProvider();
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [expandedMeeting, setExpandedMeeting] = useState(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancellingMeeting, setCancellingMeeting] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [showBuffers, setShowBuffers] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchMeetings();
  }, [activeTab]);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const data = await api.getMeetings({ status: activeTab });
      setMeetings(data.meetings || data.bookings || []);
    } catch (err) {
      toast.error("Failed to load meetings");
      setMeetings([]);
    } finally {
      setLoading(false);
    }
  };

  const openCancelModal = (meeting) => {
    setCancellingMeeting(meeting);
    setCancelReason("");
    setCancelModalOpen(true);
  };

  const cancelMeeting = async () => {
    if (!cancellingMeeting) return;
    try {
      setCancelling(true);
      await api.cancelMeeting(cancellingMeeting.id, cancelReason);
      toast.success("Meeting cancelled");
      setCancelModalOpen(false);
      setCancellingMeeting(null);
      setCancelReason("");
      fetchMeetings();
    } catch (err) {
      toast.error(err.message || "Failed to cancel meeting");
    } finally {
      setCancelling(false);
    }
  };

  const formatDateHeader = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    
    const formatted = date.toLocaleDateString("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    
    return { text: formatted, isToday };
  };

  const formatTimeRange = (startTime, endTime) => {
    const formatTime = (isoString) => {
      if (!isoString) return "";
      const date = new Date(isoString);
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).toLowerCase().replace(' ', '');
    };
    return `${formatTime(startTime)} – ${formatTime(endTime)}`;
  };

  const groupMeetingsByDate = (meetings) => {
    const groups = {};
    meetings.forEach((meeting) => {
      const date = meeting.start_time?.split("T")[0] || meeting.scheduled_date;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(meeting);
    });
    return Object.entries(groups).sort(([a], [b]) => new Date(a) - new Date(b));
  };

  const groupedMeetings = groupMeetingsByDate(meetings);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-100px)]">
          <Loader2 className="w-8 h-8 animate-spin text-[#0069FF]" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="bg-[#F8F9FA] min-h-screen">
        {/* Header */}
        <div className="max-w-5xl mx-auto px-6 pt-6">
          <div className="flex items-center gap-2 mb-5">
            <h1 className="text-[24px] font-semibold text-[#1a1a1a]">Meetings</h1>
            <button className="p-1 hover:bg-gray-100 rounded-full">
              <Info className="w-4 h-4 text-[#6B7280]" />
            </button>
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-5">
              {/* My Calendly Dropdown */}
              <button className="flex items-center gap-1.5 text-[14px] font-medium text-[#1a1a1a]">
                My Calendly
                <ChevronDown className="w-4 h-4 text-[#6B7280]" />
              </button>
              
              {/* Show Buffers Toggle */}
              <div className="flex items-center gap-2">
                <span className="text-[14px] text-[#6B7280]">Show buffers</span>
                <button className="p-0.5 hover:bg-gray-100 rounded-full">
                  <Info className="w-3.5 h-3.5 text-[#9CA3AF]" />
                </button>
                <Switch
                  checked={showBuffers}
                  onCheckedChange={setShowBuffers}
                  className="data-[state=checked]:bg-[#0069FF] h-5 w-9"
                />
              </div>
            </div>
            
            {/* Event Count */}
            <span className="text-[13px] text-[#6B7280]">
              Displaying {meetings.length} of {meetings.length} Events
            </span>
          </div>

          {/* Main Content Card */}
          <div className="bg-white rounded-lg border border-[#E5E7EB] overflow-hidden shadow-sm">
            {/* Tabs Row */}
            <div className="flex items-center justify-between px-4 border-b border-[#E5E7EB]">
              <div className="flex">
                {[
                  { id: "upcoming", label: "Upcoming" },
                  { id: "past", label: "Past" },
                  { id: "date_range", label: "Date Range", hasChevron: true },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-3 px-4 text-[14px] font-medium border-b-2 -mb-[1px] transition-colors flex items-center gap-1 ${
                      activeTab === tab.id
                        ? "text-[#0069FF] border-[#0069FF]"
                        : "text-[#6B7280] border-transparent hover:text-[#1a1a1a]"
                    }`}
                  >
                    {tab.label}
                    {tab.hasChevron && <ChevronDown className="w-4 h-4" />}
                  </button>
                ))}
              </div>

              {/* Export & Filter */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="h-8 px-3 border-[#E5E7EB] text-[#1a1a1a] text-[13px] rounded-md gap-1.5 font-medium"
                >
                  <Download className="w-4 h-4" />
                  Export
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className={`h-8 px-3 border-[#E5E7EB] text-[#1a1a1a] text-[13px] rounded-md gap-1.5 font-medium ${
                    showFilters ? "bg-[#F3F4F6]" : ""
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  Filter
                  <ChevronDown className={`w-3 h-3 transition-transform ${showFilters ? "rotate-180" : ""}`} />
                </Button>
              </div>
            </div>

            {/* Filter Bar (Expandable) */}
            {showFilters && (
              <div className="px-4 py-3 bg-[#FAFAFA] border-b border-[#E5E7EB] flex items-center gap-4 flex-wrap">
                {[
                  { label: "Teams", value: "All Teams" },
                  { label: "Host", value: "Host" },
                  { label: "Event Types", value: "All Event Types" },
                  { label: "Status", value: "Active Events" },
                  { label: "Tracking ID", value: "All IDs" },
                  { label: "Invitee Emails", value: "All Invitee Emails" },
                ].map((filter) => (
                  <div key={filter.label} className="flex flex-col gap-0.5">
                    <span className="text-[11px] text-[#6B7280] font-medium">{filter.label}</span>
                    <button className="flex items-center gap-1 text-[13px] text-[#0069FF] font-medium">
                      {filter.value}
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <button className="ml-auto text-[13px] text-[#6B7280] hover:text-[#0069FF]">
                  Clear all filters
                </button>
              </div>
            )}

            {/* Meetings List */}
            {groupedMeetings.length > 0 ? (
              <div>
                {groupedMeetings.map(([date, dateMeetings], groupIndex) => {
                  const { text: dateText, isToday } = formatDateHeader(date);
                  
                  return (
                    <div key={date}>
                      {/* Date Header */}
                      <div className="px-4 py-3 bg-white border-b border-[#E5E7EB]">
                        <span className="text-[13px] font-semibold text-[#1a1a1a]">
                          {dateText}
                        </span>
                        {isToday && (
                          <span className="ml-2 text-[11px] font-bold text-[#6B7280] bg-[#F3F4F6] px-2 py-0.5 rounded">
                            TODAY
                          </span>
                        )}
                      </div>

                      {/* Meetings for this date */}
                      {dateMeetings.map((meeting, meetingIndex) => {
                        const isExpanded = expandedMeeting === meeting.id;
                        
                        return (
                          <div
                            key={meeting.id}
                            className={`${
                              meetingIndex < dateMeetings.length - 1 || groupIndex < groupedMeetings.length - 1
                                ? "border-b border-[#E5E7EB]"
                                : ""
                            }`}
                          >
                            {/* Meeting Row */}
                            <div className="flex items-center px-4 py-4 hover:bg-[#FAFAFA] transition-colors cursor-pointer"
                                 onClick={() => setExpandedMeeting(isExpanded ? null : meeting.id)}>
                              {/* Color Dot */}
                              <div
                                className="w-3 h-3 rounded-full flex-shrink-0 mr-4"
                                style={{ backgroundColor: meeting.event_type?.color || "#8B5CF6" }}
                              />

                              {/* Time */}
                              <div className="w-[130px] flex-shrink-0">
                                <span className="text-[14px] text-[#1a1a1a]">
                                  {formatTimeRange(meeting.start_time, meeting.end_time)}
                                </span>
                              </div>

                              {/* Title & Event Type */}
                              <div className="flex-1 min-w-0">
                                <span className="text-[14px] font-medium text-[#1a1a1a]">
                                  {meeting.invitee?.name || "Guest"}
                                </span>
                                <span className="text-[14px] text-[#6B7280] ml-3">
                                  Event type <span className="text-[#0069FF]">{meeting.event_type?.name || "Meeting"}</span>
                                </span>
                              </div>

                              {/* Host Info */}
                              <div className="flex-shrink-0 text-[13px] text-[#6B7280] mr-4">
                                1 host | 0 non-hosts
                              </div>

                              {/* Details Button */}
                              <button
                                className="flex items-center gap-1 text-[13px] text-[#6B7280] hover:text-[#0069FF] transition-colors"
                              >
                                <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                                Details
                              </button>
                            </div>

                            {/* Expanded Details - Calendly Style */}
                            {isExpanded && (
                              <div className="border-t border-[#E5E7EB] bg-[#FAFAFA]">
                                <div className="grid grid-cols-[280px_1fr] divide-x divide-[#E5E7EB]">
                                  {/* Left Column - Actions */}
                                  <div className="p-5">
                                    {activeTab === "upcoming" ? (
                                      <>
                                        <Button
                                          variant="outline"
                                          className="w-full mb-4 h-9 border-[#E5E7EB] text-[#1a1a1a] text-[13px] rounded-full font-medium"
                                        >
                                          Mark as no-show
                                        </Button>
                                        
                                        <div className="space-y-3">
                                          <button 
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              const username = user?.username || 'abhishek';
                                              const slug = meeting.event_type?.slug || 'meeting';
                                              window.open(`/book/${username}/${slug}?reschedule=${meeting.id}`, '_blank');
                                              toast.info('Opening booking page for rescheduling...');
                                            }}
                                            className="flex items-center gap-2 text-[13px] text-[#0069FF] hover:underline"
                                          >
                                            <CalendarDays className="w-4 h-4" />
                                            Reschedule
                                          </button>
                                          <button 
                                            onClick={(e) => { e.stopPropagation(); openCancelModal(meeting); }}
                                            className="flex items-center gap-2 text-[13px] text-[#0069FF] hover:underline"
                                          >
                                            <X className="w-4 h-4" />
                                            Cancel
                                          </button>
                                          <button 
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              navigate(`/event-types?edit=${meeting.event_type?.id}`);
                                            }}
                                            className="flex items-center gap-2 text-[13px] text-[#0069FF] hover:underline"
                                          >
                                            <Edit className="w-4 h-4" />
                                            Edit Event Type
                                          </button>
                                          <button className="flex items-center gap-2 text-[13px] text-[#0069FF] hover:underline">
                                            <Filter className="w-4 h-4" />
                                            Filter by Event Type
                                          </button>
                                          <button className="flex items-center gap-2 text-[13px] text-[#0069FF] hover:underline">
                                            <Repeat className="w-4 h-4" />
                                            Schedule Invitee Again
                                          </button>
                                        </div>
                                      </>
                                    ) : (
                                      <div className="space-y-3">
                                        <button 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/event-types?edit=${meeting.event_type?.id}`);
                                          }}
                                          className="flex items-center gap-2 text-[13px] text-[#0069FF] hover:underline"
                                        >
                                          <Edit className="w-4 h-4" />
                                          Edit Event Type
                                        </button>
                                        <button className="flex items-center gap-2 text-[13px] text-[#0069FF] hover:underline">
                                          <Filter className="w-4 h-4" />
                                          Filter by Event Type
                                        </button>
                                        <button className="flex items-center gap-2 text-[13px] text-[#0069FF] hover:underline">
                                          <Repeat className="w-4 h-4" />
                                          Schedule Invitee Again
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* Right Column - Details */}
                                  <div className="p-5 space-y-5">
                                    {/* Invitee */}
                                    <div>
                                      <h4 className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider mb-2">Invitee</h4>
                                      <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-[#8B5CF6] flex items-center justify-center text-white font-medium">
                                          {(meeting.invitee?.name || "G").charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                          <p className="text-[14px] font-medium text-[#1a1a1a]">{meeting.invitee?.name || "Guest"}</p>
                                          <p className="text-[13px] text-[#6B7280]">{meeting.invitee?.email || "-"}</p>
                                        </div>
                                        <button className="ml-auto text-[13px] text-[#0069FF] hover:underline">
                                          View contact
                                        </button>
                                      </div>
                                    </div>

                                    {/* Location */}
                                    <div>
                                      <h4 className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider mb-2">Location</h4>
                                      <div className="flex items-center gap-2 text-[14px] text-[#1a1a1a]">
                                        <Video className="w-4 h-4 text-[#6B7280]" />
                                        {meeting.event_type?.location_type === "google_meet" ? "Google Meet" : 
                                         meeting.event_type?.location_type === "zoom" ? "Zoom" : 
                                         meeting.location || "No location given"}
                                      </div>
                                    </div>

                                    {/* Invitee Timezone */}
                                    <div>
                                      <h4 className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider mb-2">Invitee Time Zone</h4>
                                      <p className="text-[14px] text-[#1a1a1a]">{meeting.timezone || timeZone}</p>
                                    </div>

                                    {/* Questions */}
                                    {meeting.responses && Object.keys(meeting.responses).length > 0 && (
                                      <div>
                                        <h4 className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider mb-2">Questions</h4>
                                        {Object.entries(meeting.responses).map(([question, answer]) => (
                                          <div key={question} className="mb-2">
                                            <p className="text-[13px] text-[#6B7280]">{question}</p>
                                            <p className="text-[14px] text-[#1a1a1a]">{answer}</p>
                                          </div>
                                        ))}
                                      </div>
                                    )}

                                    {/* Meeting Host */}
                                    <div>
                                      <h4 className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider mb-2">Meeting Host</h4>
                                      <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-[#0069FF] flex items-center justify-center text-white text-xs font-medium">
                                          A
                                        </div>
                                        <span className="text-[14px] text-[#1a1a1a]">Abhishek Suwalka</span>
                                        <span className="text-[13px] text-[#6B7280]">· Host will attend this meeting</span>
                                      </div>
                                    </div>

                                    {/* Meeting Notes */}
                                    <div>
                                      <button className="flex items-center gap-2 text-[13px] text-[#0069FF] hover:underline">
                                        <FileText className="w-4 h-4" />
                                        Add meeting notes
                                      </button>
                                    </div>

                                    {/* Created Date */}
                                    <div className="pt-4 border-t border-[#E5E7EB]">
                                      <p className="text-[12px] text-[#9CA3AF]">
                                        Created {meeting.created_at ? new Date(meeting.created_at).toLocaleDateString("en-US", {
                                          month: "long",
                                          day: "numeric",
                                          year: "numeric"
                                        }) : "-"}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}

                {/* End of list footer */}
                <div className="px-4 py-4 text-center border-t border-[#E5E7EB]">
                  <span className="text-[13px] text-[#6B7280]">
                    You've reached the end of the list
                  </span>
                </div>
              </div>
            ) : (
              /* Empty State - Calendly Style */
              <div className="text-center py-20">
                <div className="relative w-20 h-20 mx-auto mb-5">
                  <div className="w-16 h-16 rounded-lg bg-[#F3F4F6] mx-auto flex items-center justify-center">
                    <Calendar className="w-8 h-8 text-[#9CA3AF]" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#E5E7EB] flex items-center justify-center">
                    <span className="text-[11px] font-bold text-[#6B7280]">0</span>
                  </div>
                </div>
                <h3 className="text-[18px] font-semibold text-[#1a1a1a] mb-2">
                  No {activeTab === "upcoming" ? "Upcoming" : "Past"} Events
                </h3>
                <p className="text-[14px] text-[#6B7280] max-w-sm mx-auto">
                  {activeTab === "upcoming"
                    ? "When you get booked, your upcoming meetings will appear here."
                    : "Your completed and cancelled meetings will appear here."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      <Dialog open={cancelModalOpen} onOpenChange={setCancelModalOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="text-[18px] font-semibold text-[#1a1a1a]">
              Cancel event
            </DialogTitle>
          </DialogHeader>

          <div className="bg-[#FEF3C7] border-l-4 border-[#F59E0B] p-4 rounded-r-lg mb-4">
            <p className="text-[13px] text-[#92400E]">
              Cancelling will notify the invitee that this event has been cancelled.
            </p>
          </div>

          {cancellingMeeting && (
            <div className="bg-[#F3F4F6] rounded-lg p-4 mb-4">
              <p className="text-[14px] font-medium text-[#1a1a1a]">
                {cancellingMeeting.event_type?.name || "Meeting"}
              </p>
              <p className="text-[13px] text-[#6B7280]">
                with {cancellingMeeting.invitee?.name || "Guest"}
              </p>
            </div>
          )}

          <div>
            <label className="block text-[14px] font-medium text-[#1a1a1a] mb-2">
              Reason for cancellation (optional)
            </label>
            <Textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Add a message for the invitee"
              rows={3}
              className="border-[#E5E7EB] focus:border-[#0069FF] focus:ring-[#0069FF]"
            />
          </div>

          <div className="flex gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setCancelModalOpen(false)}
              className="flex-1 rounded-full h-10 border-[#E5E7EB] text-[#1a1a1a] font-medium"
            >
              Never mind
            </Button>
            <Button
              onClick={cancelMeeting}
              disabled={cancelling}
              className="flex-1 rounded-full h-10 bg-[#0069FF] hover:bg-[#0055CC] font-medium"
            >
              {cancelling && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Cancel event
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
