import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useContextProvider } from "@/context/contextProvider";
import {
  ArrowLeft,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Globe,
  Loader2,
  MapPin,
  Phone,
  Play,
  Users,
  Video,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

export default function BookingPage() {
  const { username, slug } = useParams();
  const navigate = useNavigate();
  const { api, timeZone, setTimeZone } = useContextProvider();

  const [step, setStep] = useState(slug ? "select-time" : "select-event");
  const [eventTypes, setEventTypes] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [formData, setFormData] = useState({ name: "", email: "", notes: "" });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hostInfo, setHostInfo] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [bookingResult, setBookingResult] = useState(null);

  useEffect(() => {
    if (slug) {
      fetchEventBySlug();
    } else {
      fetchEventTypes();
    }
  }, [username, slug]);

  useEffect(() => {
    if (selectedEvent) {
      fetchAvailableDates(selectedEvent.id);
    }
  }, [currentMonth, selectedEvent]);

  const fetchEventBySlug = async () => {
    try {
      setLoading(true);
      const data = await api.getPublicEventType(username, slug);
      setSelectedEvent(data.event_type);
      setHostInfo(data.host);
      setStep("select-time");
      await fetchAvailableDates(data.event_type.id);
    } catch (err) {
      toast.error("Failed to load event type");
      navigate(`/book/${username}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchEventTypes = async () => {
    try {
      setLoading(true);
      const data = await api.getEventTypes({ is_active: true });
      setEventTypes(data.event_types || []);
      try {
        const userData = await api.getMe();
        setHostInfo({ name: userData.name, username: userData.username });
      } catch (e) {
        setHostInfo({ name: username, username: username });
      }
    } catch (err) {
      toast.error("Failed to load event types");
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableDates = async (eventTypeId) => {
    try {
      const monthStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}`;
      const data = await api.getPublicAvailableDates(eventTypeId, monthStr, timeZone);
      setAvailableDates(data.dates || data.available_dates || []);
    } catch (err) {
      console.error("Failed to load available dates:", err);
    }
  };

  const fetchTimeSlots = async (date) => {
    if (!selectedEvent) return;
    try {
      const data = await api.getPublicSlots(selectedEvent.id, date, timeZone);
      setTimeSlots(data.slots || []);
    } catch (err) {
      toast.error("Failed to load time slots");
    }
  };

  const handleEventSelect = async (event) => {
    setSelectedEvent(event);
    setStep("select-time");
    navigate(`/book/${username}/${event.slug}`);
  };

  const handleDateSelect = async (day) => {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    setSelectedDate(dateStr);
    setSelectedTime(null);
    await fetchTimeSlots(dateStr);
  };

  const handleTimeSelect = (slot) => {
    setSelectedTime(slot);
  };

  const handleConfirmTime = () => {
    if (selectedTime) {
      setStep("enter-details");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEvent || !selectedTime) return;

    try {
      setSubmitting(true);
      const result = await api.createPublicBooking({
        event_type_id: selectedEvent.id,
        start_time: `${selectedDate}T${selectedTime.start_time}:00`,
        timezone: timeZone,
        invitee: {
          name: formData.name,
          email: formData.email,
        },
        guests: [],
      });
      setBookingResult(result);
      setStep("confirmed");
      toast.success("Meeting scheduled successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to schedule meeting");
    } finally {
      setSubmitting(false);
    }
  };

  const goBack = () => {
    if (step === "select-time" && !slug) {
      setStep("select-event");
      setSelectedEvent(null);
      navigate(`/book/${username}`);
    }
    if (step === "enter-details") {
      setStep("select-time");
      setSelectedTime(null);
    }
  };

  const prevMonth = () => {
    const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    const now = new Date();
    if (newMonth >= new Date(now.getFullYear(), now.getMonth(), 1)) {
      setCurrentMonth(newMonth);
    }
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatShortDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  const isDateAvailable = (day) => {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return availableDates.includes(dateStr);
  };

  const isPastDate = (day) => {
    const checkDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return checkDate < today;
  };

  const isToday = (day) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    );
  };

  const getDaysInMonth = () => {
    return new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = () => {
    return new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  };

  const getLocationIcon = (locationType) => {
    switch (locationType) {
      case "zoom":
      case "google_meet":
        return Video;
      case "phone":
        return Phone;
      case "in_person":
        return MapPin;
      default:
        return Globe;
    }
  };

  // Split events into rows of 2 for grid layout
  const getEventRows = () => {
    const rows = [];
    for (let i = 0; i < eventTypes.length; i += 2) {
      rows.push(eventTypes.slice(i, i + 2));
    }
    return rows;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#0069FF]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4">
      {/* Event Selection - Calendly exact style */}
      {step === "select-event" && (
        <div className="w-full max-w-[640px]">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden relative">
            {/* Angled "Powered by Calendly" ribbon */}
            <div 
              className="absolute top-0 right-0 overflow-hidden w-[120px] h-[120px] pointer-events-none"
            >
              <div 
                className="absolute transform rotate-45 bg-[#4B5563] text-white text-[10px] font-medium py-1.5 text-center"
                style={{
                  width: '180px',
                  right: '-50px',
                  top: '25px',
                }}
              >
                POWERED BY <span className="font-bold">Calendly</span>
              </div>
            </div>

            {/* Header - Name only, no avatar */}
            <div className="px-8 pt-12 pb-6 text-center">
              <h1 className="text-[20px] font-semibold text-[#1A1A1A] mb-3">
                {hostInfo?.name || username}
              </h1>
              <p className="text-[14px] text-[#6B7280] leading-relaxed">
                Welcome to my scheduling page. Please follow the instructions to add an event to my calendar.
              </p>
            </div>

            {/* Event Types - 2 column grid with dividers */}
            <div className="px-8 pb-2">
              {getEventRows().map((row, rowIndex) => (
                <div key={rowIndex}>
                  {/* Horizontal divider */}
                  <div className="border-t border-[#E5E7EB]" />
                  
                  <div className="grid grid-cols-2">
                    {row.map((event, colIndex) => (
                      <button
                        key={event.id}
                        onClick={() => handleEventSelect(event)}
                        className={`flex items-center gap-3 py-5 px-2 hover:bg-[#F9FAFB] transition-colors group ${
                          colIndex === 0 && row.length === 2 ? 'border-r border-[#E5E7EB] pr-4' : 'pl-4'
                        } ${row.length === 1 ? 'col-span-2' : ''}`}
                      >
                        {/* Color dot */}
                        <div
                          className="w-4 h-4 rounded-full flex-shrink-0"
                          style={{ backgroundColor: event.color || '#8B5CF6' }}
                        />
                        {/* Event name */}
                        <span className="flex-1 text-[15px] font-medium text-[#1A1A1A] text-left">
                          {event.name}
                        </span>
                        {/* Arrow */}
                        <Play className="w-3 h-3 text-[#9CA3AF] fill-[#9CA3AF] flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              {/* Final divider */}
              {eventTypes.length > 0 && <div className="border-t border-[#E5E7EB]" />}
            </div>

            {/* Footer - Cookie settings */}
            <div className="px-8 py-5">
              <button className="text-[13px] text-[#0069FF] hover:underline">
                Cookie settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Date & Time Selection */}
      {step === "select-time" && selectedEvent && (
        <div className="w-full max-w-4xl">
          <div className="bg-white rounded-xl shadow-lg border border-[#E5E7EB] overflow-hidden">
            <div className="grid lg:grid-cols-3">
              {/* Left Panel - Event Info */}
              <div className="p-6 border-r border-[#E5E7EB] bg-[#FAFAFA]">
                <button
                  onClick={goBack}
                  className="w-9 h-9 rounded-full bg-[#0069FF] text-white flex items-center justify-center mb-6 hover:bg-[#0052CC] transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>

                <p className="text-[13px] text-[#6B7280] mb-1">
                  {hostInfo?.name || username}
                </p>
                <h2 className="text-[24px] font-bold text-[#1F2937] mb-5">
                  {selectedEvent.name}
                </h2>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-[14px] text-[#6B7280]">
                    <Clock className="w-5 h-5 text-[#9CA3AF]" />
                    <span>{selectedEvent.duration_minutes} min</span>
                  </div>
                  {selectedEvent.location_type && (
                    <div className="flex items-center gap-3 text-[14px] text-[#6B7280]">
                      {(() => {
                        const Icon = getLocationIcon(selectedEvent.location_type);
                        return <Icon className="w-5 h-5 text-[#9CA3AF]" />;
                      })()}
                      <span>Web conferencing details provided upon confirmation</span>
                    </div>
                  )}
                  {selectedDate && selectedTime && (
                    <div className="flex items-center gap-3 text-[14px] text-[#6B7280] pt-3 border-t border-[#E5E7EB] mt-3">
                      <Calendar className="w-5 h-5 text-[#9CA3AF]" />
                      <span>
                        {selectedTime.start_time} - {selectedTime.end_time}, {formatShortDate(selectedDate)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-[14px] text-[#6B7280]">
                    <Globe className="w-5 h-5 text-[#9CA3AF]" />
                    <span>{timeZone}</span>
                  </div>
                </div>
              </div>

              {/* Center Panel - Calendar */}
              <div className="p-6 border-r border-[#E5E7EB]">
                <h3 className="text-[18px] font-semibold text-[#1F2937] mb-5">
                  Select a Date & Time
                </h3>

                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-[16px] font-semibold text-[#1F2937]">
                    {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                  </h4>
                  <div className="flex gap-1">
                    <button
                      onClick={prevMonth}
                      className="w-8 h-8 rounded-md border border-[#D1D5DB] flex items-center justify-center hover:bg-[#F3F4F6] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      disabled={currentMonth <= new Date(new Date().getFullYear(), new Date().getMonth(), 1)}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={nextMonth}
                      className="w-8 h-8 rounded-md border border-[#D1D5DB] flex items-center justify-center hover:bg-[#F3F4F6] transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1 text-center mb-1">
                  {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((d) => (
                    <div key={d} className="text-[11px] font-semibold text-[#9CA3AF] py-2">
                      {d}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: getFirstDayOfMonth() }).map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square" />
                  ))}
                  {Array.from({ length: getDaysInMonth() }, (_, i) => {
                    const day = i + 1;
                    const available = isDateAvailable(day);
                    const past = isPastDate(day);
                    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                    const isSelected = selectedDate === dateStr;
                    const today = isToday(day);

                    return (
                      <button
                        key={day}
                        onClick={() => available && !past && handleDateSelect(day)}
                        disabled={!available || past}
                        className={`aspect-square rounded-full text-[14px] flex items-center justify-center relative transition-all ${
                          isSelected
                            ? "bg-[#0069FF] text-white font-semibold"
                            : available && !past
                            ? "text-[#0069FF] font-medium hover:bg-[#E6F2FF]"
                            : "text-[#D1D5DB] cursor-not-allowed"
                        }`}
                      >
                        {day}
                        {today && !isSelected && (
                          <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#0069FF]" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Timezone */}
                <div className="mt-5 pt-5 border-t border-[#E5E7EB]">
                  <p className="text-[12px] text-[#6B7280] mb-1">Time zone</p>
                  <button className="text-[14px] text-[#1F2937] flex items-center gap-2 hover:text-[#0069FF]">
                    <Globe className="w-4 h-4" />
                    {timeZone}
                  </button>
                </div>
              </div>

              {/* Right Panel - Time Slots */}
              <div className="p-6 bg-[#FAFAFA] max-h-[500px] overflow-y-auto">
                {selectedDate ? (
                  <>
                    <h4 className="text-[16px] font-semibold text-[#1F2937] mb-4">
                      {formatShortDate(selectedDate)}
                    </h4>
                    {timeSlots.length > 0 ? (
                      <div className="space-y-2">
                        {timeSlots.map((slot, i) => (
                          <button
                            key={i}
                            onClick={() => handleTimeSelect(slot)}
                            className={`w-full rounded-lg border-2 text-[14px] font-medium transition-all overflow-hidden ${
                              selectedTime === slot
                                ? "border-[#0069FF]"
                                : "border-[#0069FF] text-[#0069FF] hover:bg-[#0069FF] hover:text-white"
                            }`}
                          >
                            {selectedTime === slot ? (
                              <div className="flex">
                                <div className="flex-1 py-3 px-4 bg-[#6B7280] text-white">
                                  {slot.start_time}
                                </div>
                                <button
                                  onClick={handleConfirmTime}
                                  className="py-3 px-4 bg-[#0069FF] text-white font-semibold"
                                >
                                  Next
                                </button>
                              </div>
                            ) : (
                              <div className="py-3 px-4">{slot.start_time}</div>
                            )}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[14px] text-[#6B7280]">No available slots</p>
                    )}
                  </>
                ) : (
                  <p className="text-[14px] text-[#6B7280]">Select a date to view available times</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enter Details Form */}
      {step === "enter-details" && (
        <div className="w-full max-w-3xl">
          <div className="bg-white rounded-xl shadow-lg border border-[#E5E7EB] overflow-hidden">
            <div className="grid lg:grid-cols-5">
              {/* Left Panel - Summary */}
              <div className="lg:col-span-2 p-6 bg-[#F9FAFB] border-r border-[#E5E7EB]">
                <button
                  onClick={goBack}
                  className="w-9 h-9 rounded-full bg-[#0069FF] text-white flex items-center justify-center mb-6 hover:bg-[#0052CC] transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>

                <p className="text-[13px] text-[#6B7280] mb-1">
                  {hostInfo?.name || username}
                </p>
                <h2 className="text-[20px] font-bold text-[#1F2937] mb-4">
                  {selectedEvent?.name}
                </h2>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-[14px] text-[#6B7280]">
                    <Clock className="w-5 h-5 text-[#9CA3AF]" />
                    <span>{selectedEvent?.duration_minutes} min</span>
                  </div>
                  <div className="flex items-center gap-3 text-[14px] text-[#6B7280]">
                    <Calendar className="w-5 h-5 text-[#9CA3AF]" />
                    <span>
                      {selectedTime?.start_time} - {selectedTime?.end_time}, {formatShortDate(selectedDate)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[14px] text-[#6B7280]">
                    <Globe className="w-5 h-5 text-[#9CA3AF]" />
                    <span>{timeZone}</span>
                  </div>
                </div>
              </div>

              {/* Right Panel - Form */}
              <div className="lg:col-span-3 p-6">
                <h3 className="text-[22px] font-semibold text-[#1F2937] mb-6">
                  Enter Details
                </h3>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-[14px] font-medium text-[#374151] mb-2">
                      Name *
                    </label>
                    <Input
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Your full name"
                      className="h-10 border-[#D1D5DB] rounded-lg focus:border-[#0069FF] focus:ring-[#0069FF]/20"
                    />
                  </div>

                  <div>
                    <label className="block text-[14px] font-medium text-[#374151] mb-2">
                      Email *
                    </label>
                    <Input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="you@example.com"
                      className="h-10 border-[#D1D5DB] rounded-lg focus:border-[#0069FF] focus:ring-[#0069FF]/20"
                    />
                  </div>

                  <div>
                    <button
                      type="button"
                      className="text-[14px] text-[#0069FF] font-medium flex items-center gap-2 px-3 py-1.5 border border-[#0069FF] rounded-full hover:bg-[#E6F2FF] transition-colors"
                    >
                      <Users className="w-4 h-4" />
                      Add Guests
                    </button>
                  </div>

                  <div>
                    <label className="block text-[14px] font-medium text-[#374151] mb-2">
                      Please share anything that will help prepare for our meeting.
                    </label>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={4}
                      className="border-[#D1D5DB] rounded-lg focus:border-[#0069FF] focus:ring-[#0069FF]/20 resize-none"
                    />
                  </div>

                  <p className="text-[11px] text-[#6B7280] leading-relaxed">
                    By proceeding, you confirm that you have read and agree to Calendly's{" "}
                    <a href="#" className="text-[#0069FF] hover:underline">Terms of Use</a> and{" "}
                    <a href="#" className="text-[#0069FF] hover:underline">Privacy Notice</a>.
                  </p>

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-[#0069FF] hover:bg-[#0052CC] text-white rounded-full h-12 text-[15px] font-semibold"
                  >
                    {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                    Schedule Event
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation */}
      {step === "confirmed" && (
        <div className="w-full max-w-md text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 rounded-full bg-[#10B981] mx-auto mb-6 flex items-center justify-center">
            <Check className="w-10 h-10 text-white" />
          </div>

          <h2 className="text-[28px] font-bold text-[#1F2937] mb-2">
            You are scheduled
          </h2>
          <p className="text-[15px] text-[#6B7280] mb-8">
            A calendar invitation has been sent to your email address.
          </p>

          {/* Event Summary */}
          <div className="bg-white rounded-lg border border-[#E5E7EB] p-6 text-left mb-8">
            <h3 className="text-[16px] font-semibold text-[#1F2937] mb-3">
              {selectedEvent?.name}
            </h3>
            <div className="space-y-2 text-[14px] text-[#6B7280]">
              <p>
                {hostInfo?.name || username}
              </p>
              <p>
                {selectedTime?.start_time} - {selectedTime?.end_time}, {formatDate(selectedDate)}
              </p>
              <p>{timeZone}</p>
            </div>
          </div>

          {/* Sign Up Prompt */}
          <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
            <h3 className="text-[16px] font-semibold text-[#1F2937] mb-4">
              Schedule your own meetings with Calendly for free
            </h3>
            <div className="space-y-3">
              <button className="w-full py-3 px-4 border border-[#D1D5DB] rounded-lg text-[14px] font-medium text-[#374151] hover:bg-[#F9FAFB] flex items-center justify-center gap-3">
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                Sign up with Google
              </button>
              <button className="w-full py-3 px-4 border border-[#D1D5DB] rounded-lg text-[14px] font-medium text-[#374151] hover:bg-[#F9FAFB] flex items-center justify-center gap-3">
                <img src="https://www.microsoft.com/favicon.ico" alt="Microsoft" className="w-5 h-5" />
                Sign up with Microsoft
              </button>
            </div>
            <p className="text-[14px] text-[#0069FF] mt-4 hover:underline cursor-pointer">
              Sign up with work email
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
