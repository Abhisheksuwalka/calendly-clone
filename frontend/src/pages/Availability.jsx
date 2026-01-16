import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useContextProvider } from "@/context/contextProvider";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths
} from "date-fns";
import {
  Calendar,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  Globe,
  List,
  Loader2,
  Plus,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const daysOfWeek = [
  { id: 0, key: "sunday", label: "S", fullName: "Sunday" },
  { id: 1, key: "monday", label: "M", fullName: "Monday" },
  { id: 2, key: "tuesday", label: "T", fullName: "Tuesday" },
  { id: 3, key: "wednesday", label: "W", fullName: "Wednesday" },
  { id: 4, key: "thursday", label: "T", fullName: "Thursday" },
  { id: 5, key: "friday", label: "F", fullName: "Friday" },
  { id: 6, key: "saturday", label: "S", fullName: "Saturday" },
];

const timeOptions = [
  "06:00", "06:30", "07:00", "07:30", "08:00", "08:30",
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30", "19:00", "19:30", "20:00", "20:30",
  "21:00", "21:30", "22:00",
];

const timezoneOptions = [
  { value: "America/New_York", label: "Eastern Time - New York" },
  { value: "America/Chicago", label: "Central Time - Chicago" },
  { value: "America/Denver", label: "Mountain Time - Denver" },
  { value: "America/Los_Angeles", label: "Pacific Time - Los Angeles" },
  { value: "Europe/London", label: "London" },
  { value: "Europe/Paris", label: "Paris" },
  { value: "Asia/Kolkata", label: "India Standard Time" },
  { value: "Asia/Tokyo", label: "Japan Standard Time" },
  { value: "Australia/Sydney", label: "Australian Eastern Time" },
];

const formatTime = (time24) => {
  if (!time24) return "";
  const [hours, minutes] = time24.split(":");
  const h = parseInt(hours);
  const ampm = h >= 12 ? "pm" : "am";
  const h12 = h % 12 || 12;
  return `${h12}:${minutes}${ampm}`;
};

// Copy to Days Modal Component
function CopyToDaysModal({ isOpen, onClose, onCopy, sourceDayKey, currentSlots }) {
  const [selectedDays, setSelectedDays] = useState([]);

  if (!isOpen) return null;

  const toggleDay = (dayKey) => {
    setSelectedDays(prev =>
      prev.includes(dayKey)
        ? prev.filter(d => d !== dayKey)
        : [...prev, dayKey]
    );
  };

  const handleCopy = () => {
    onCopy(selectedDays, currentSlots);
    setSelectedDays([]);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-[#E5E7EB]">
          <div className="flex items-center justify-between">
            <h2 className="text-[20px] font-semibold text-[#1F2937]">Copy times to...</h2>
            <button onClick={onClose} className="action-icon-btn">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <p className="text-[14px] text-[#6B7280] mb-4">
            Select the days you want to copy these hours to:
          </p>
          <div className="grid grid-cols-7 gap-2">
            {daysOfWeek.map(day => (
              <button
                key={day.key}
                disabled={day.key === sourceDayKey}
                onClick={() => toggleDay(day.key)}
                className={`day-circle ${
                  day.key === sourceDayKey
                    ? "opacity-30 cursor-not-allowed bg-[#9CA3AF]"
                    : selectedDays.includes(day.key)
                    ? "active"
                    : "inactive"
                }`}
              >
                {day.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-[#E5E7EB] flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-[14px] font-semibold text-[#374151] bg-white border border-[#D1D5DB] rounded-full hover:bg-[#F9FAFB] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCopy}
            disabled={selectedDays.length === 0}
            className="px-5 py-2.5 text-[14px] font-semibold text-white bg-[#0069FF] rounded-full hover:bg-[#0055CC] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}

// Calendar View Component
function CalendarView({ schedule, onDateClick }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentMonth]);

  const getHoursForDate = (date) => {
    const dayOfWeek = date.getDay();
    const dayConfig = daysOfWeek.find(d => d.id === dayOfWeek);
    const dayData = schedule?.weeklyHoursMap?.[dayConfig?.key];

    if (!dayData?.enabled || !dayData?.slots?.length) return null;

    const firstSlot = dayData.slots[0];
    return `${formatTime(firstSlot.start)} - ${formatTime(firstSlot.end)}`;
  };

  return (
    <div className="bg-white rounded-lg border border-[#E5E7EB]">
      {/* Calendar Header */}
      <div className="p-4 border-b border-[#E5E7EB] flex items-center justify-between">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="w-8 h-8 flex items-center justify-center border border-[#D1D5DB] rounded-md hover:bg-[#F3F4F6] transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-[#6B7280]" />
        </button>
        <h3 className="text-[18px] font-semibold text-[#1F2937]">
          {format(currentMonth, "MMMM yyyy")}
        </h3>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="w-8 h-8 flex items-center justify-center border border-[#D1D5DB] rounded-md hover:bg-[#F3F4F6] transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-[#6B7280]" />
        </button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 border-b border-[#E5E7EB]">
        {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map(day => (
          <div key={day} className="p-2 text-center text-[12px] font-semibold text-[#6B7280]">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 p-2">
        {calendarDays.map((date, idx) => {
          const inCurrentMonth = isSameMonth(date, currentMonth);
          const hours = getHoursForDate(date);
          const isCurrentDay = isToday(date);

          return (
            <div
              key={idx}
              onClick={() => inCurrentMonth && onDateClick?.(date)}
              className={`calendar-cell min-h-[80px] ${
                !inCurrentMonth ? "opacity-30" : ""
              } ${isCurrentDay ? "today" : ""}`}
            >
              <span className={`text-[14px] font-medium ${inCurrentMonth ? "text-[#1F2937]" : "text-[#9CA3AF]"}`}>
                {format(date, "d")}
              </span>
              {hours && inCurrentMonth && (
                <>
                  <span className="text-[11px] text-[#6B7280] mt-1">{hours}</span>
                  <RefreshCw className="w-3 h-3 text-[#9CA3AF] mt-1" />
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Availability() {
  const { api, timeZone, setTimeZone } = useContextProvider();
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState("schedules");
  const [currentView, setCurrentView] = useState("list"); // 'list' | 'calendar'
  const [scheduleDropdownOpen, setScheduleDropdownOpen] = useState(false);
  const [copyModal, setCopyModal] = useState({ isOpen: false, dayKey: null, slots: [] });
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const data = await api.getSchedule();
      const weeklyHoursMap = {};
      (data.weekly_hours || []).forEach((wh) => {
        const day = daysOfWeek.find((d) => d.id === wh.day_of_week);
        if (day) {
          weeklyHoursMap[day.key] = {
            enabled: wh.is_enabled,
            slots: wh.intervals.map((i) => ({
              start: i.start_time,
              end: i.end_time,
            })),
          };
        }
      });
      daysOfWeek.forEach((day) => {
        if (!weeklyHoursMap[day.key]) {
          weeklyHoursMap[day.key] = { enabled: false, slots: [] };
        }
      });
      setSchedule({ ...data, weeklyHoursMap });
      if (data.timezone) {
        setTimeZone(data.timezone);
      }
    } catch (err) {
      toast.error("Failed to load availability schedule");
      const defaultWeeklyHoursMap = {};
      daysOfWeek.forEach((day) => {
        defaultWeeklyHoursMap[day.key] = {
          enabled: day.id >= 1 && day.id <= 5,
          slots: day.id >= 1 && day.id <= 5 ? [{ start: "09:00", end: "17:00" }] : [],
        };
      });
      setSchedule({ name: "Working hours", weeklyHoursMap: defaultWeeklyHoursMap });
    } finally {
      setLoading(false);
    }
  };

  const saveSchedule = async () => {
    if (!schedule) return;
    try {
      setSaving(true);
      const weeklyHours = daysOfWeek.map((day) => ({
        day_of_week: day.id,
        is_enabled: schedule.weeklyHoursMap[day.key]?.enabled || false,
        intervals: (schedule.weeklyHoursMap[day.key]?.slots || []).map((slot) => ({
          start_time: slot.start,
          end_time: slot.end,
        })),
      }));
      await api.updateSchedule({
        name: schedule.name || "Working hours",
        timezone: timeZone,
        weekly_hours: weeklyHours,
      });
      setSaveSuccess(true);
      setIsDirty(false);
      toast.success("Availability saved");
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      toast.error("Failed to save availability");
    } finally {
      setSaving(false);
    }
  };

  const toggleDay = (dayKey) => {
    setIsDirty(true);
    setSchedule((prev) => {
      if (!prev || !prev.weeklyHoursMap) return prev;
      return {
        ...prev,
        weeklyHoursMap: {
          ...prev.weeklyHoursMap,
          [dayKey]: {
            ...prev.weeklyHoursMap[dayKey],
            enabled: !prev.weeklyHoursMap[dayKey]?.enabled,
            slots: prev.weeklyHoursMap[dayKey]?.enabled
              ? []
              : [{ start: "09:00", end: "17:00" }],
          },
        },
      };
    });
  };

  const updateSlot = (dayKey, slotIndex, field, value) => {
    setIsDirty(true);
    setSchedule((prev) => {
      if (!prev || !prev.weeklyHoursMap) return prev;
      return {
        ...prev,
        weeklyHoursMap: {
          ...prev.weeklyHoursMap,
          [dayKey]: {
            ...prev.weeklyHoursMap[dayKey],
            slots: (prev.weeklyHoursMap[dayKey]?.slots || []).map((slot, i) =>
              i === slotIndex ? { ...slot, [field]: value } : slot
            ),
          },
        },
      };
    });
  };

  const addSlot = (dayKey) => {
    setIsDirty(true);
    setSchedule((prev) => {
      if (!prev || !prev.weeklyHoursMap) return prev;
      return {
        ...prev,
        weeklyHoursMap: {
          ...prev.weeklyHoursMap,
          [dayKey]: {
            ...prev.weeklyHoursMap[dayKey],
            slots: [
              ...(prev.weeklyHoursMap[dayKey]?.slots || []),
              { start: "09:00", end: "17:00" },
            ],
          },
        },
      };
    });
  };

  const removeSlot = (dayKey, slotIndex) => {
    setIsDirty(true);
    setSchedule((prev) => {
      if (!prev || !prev.weeklyHoursMap) return prev;
      const slots = (prev.weeklyHoursMap[dayKey]?.slots || []).filter((_, i) => i !== slotIndex);
      return {
        ...prev,
        weeklyHoursMap: {
          ...prev.weeklyHoursMap,
          [dayKey]: {
            ...prev.weeklyHoursMap[dayKey],
            enabled: slots.length > 0,
            slots: slots,
          },
        },
      };
    });
  };

  const copyToOtherDays = (targetDays, slots) => {
    setIsDirty(true);
    setSchedule((prev) => {
      if (!prev || !prev.weeklyHoursMap) return prev;
      const newWeeklyHoursMap = { ...prev.weeklyHoursMap };
      targetDays.forEach(dayKey => {
        newWeeklyHoursMap[dayKey] = {
          enabled: true,
          slots: [...slots],
        };
      });
      return { ...prev, weeklyHoursMap: newWeeklyHoursMap };
    });
    toast.success(`Copied to ${targetDays.length} day(s)`);
  };

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
        <div className="bg-white border-b border-[#E5E7EB]">
          <div className="max-w-4xl mx-auto px-6 py-6">
            <h1 className="text-[28px] font-bold text-[#1F2937]">Availability</h1>

            {/* Tabs */}
            <div className="flex gap-6 mt-6 border-b border-[#E5E7EB] -mb-[1px]">
              {[
                { id: "schedules", label: "Schedules" },
                { id: "calendar", label: "Calendar connections" },
                { id: "limits", label: "Limits" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`availability-tab pb-3 text-[14px] font-medium ${
                    activeTab === tab.id
                      ? "text-[#1F2937] active"
                      : "text-[#6B7280] hover:text-[#1F2937]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-6 py-6">
          {activeTab === "schedules" && (
            <div className="space-y-6">
              {/* Schedule Header */}
              <div className="flex items-center justify-between">
                <div className="relative">
                  <button
                    onClick={() => setScheduleDropdownOpen(!scheduleDropdownOpen)}
                    className="flex items-center gap-2 text-[20px] font-semibold text-[#0069FF] hover:text-[#0055CC] transition-colors"
                  >
                    {schedule?.name || "Working hours"} (default)
                    <ChevronDown className={`w-5 h-5 transition-transform ${scheduleDropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  {/* Schedule Dropdown */}
                  {scheduleDropdownOpen && (
                    <div className="schedule-dropdown absolute top-full left-0 mt-2 w-64 bg-white rounded-lg border border-[#E5E7EB] shadow-lg z-10">
                      <div className="py-2">
                        <button className="w-full px-4 py-2.5 flex items-center justify-between text-left text-[14px] text-[#1F2937] hover:bg-[#F3F4F6]">
                          <span>Working hours</span>
                          <Check className="w-4 h-4 text-[#0069FF]" />
                        </button>
                      </div>
                      <div className="border-t border-[#E5E7EB] py-2">
                        <button className="w-full px-4 py-2.5 flex items-center gap-2 text-left text-[14px] text-[#0069FF] hover:bg-[#F3F4F6]">
                          <Plus className="w-4 h-4" />
                          Create schedule
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  {/* View Toggle */}
                  <div className="view-toggle">
                    <button
                      onClick={() => setCurrentView("list")}
                      className={`view-toggle-btn ${currentView === "list" ? "active" : ""}`}
                    >
                      <List className="w-4 h-4" />
                      List
                    </button>
                    <button
                      onClick={() => setCurrentView("calendar")}
                      className={`view-toggle-btn ${currentView === "calendar" ? "active" : ""}`}
                    >
                      <Calendar className="w-4 h-4" />
                      Calendar
                    </button>
                  </div>

                  {/* Save Button */}
                  <Button
                    onClick={saveSchedule}
                    disabled={saving || !isDirty}
                    className={`save-btn bg-[#0069FF] hover:bg-[#0055CC] text-white rounded-full h-10 px-6 text-[14px] font-semibold ${
                      saveSuccess ? "success" : ""
                    }`}
                  >
                    {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                    {saveSuccess && <Check className="w-4 h-4 mr-2" />}
                    {saveSuccess ? "Saved" : "Save"}
                  </Button>
                </div>
              </div>

              {/* Close dropdown when clicking outside */}
              {scheduleDropdownOpen && (
                <div
                  className="fixed inset-0 z-0"
                  onClick={() => setScheduleDropdownOpen(false)}
                />
              )}

              {/* List View */}
              {currentView === "list" && (
                <>
                  {/* Weekly Hours */}
                  <div className="bg-white rounded-lg border border-[#E5E7EB] overflow-hidden">
                    <div className="p-4 border-b border-[#E5E7EB]">
                      <h3 className="text-[15px] font-semibold text-[#1F2937]">Weekly hours</h3>
                    </div>

                    {daysOfWeek.map((day, index) => {
                      const dayData = schedule?.weeklyHoursMap?.[day.key] || { enabled: false, slots: [] };
                      return (
                        <div
                          key={day.key}
                          className={`day-row flex items-start gap-4 px-5 py-4 ${
                            index < daysOfWeek.length - 1 ? "border-b border-[#E5E7EB]" : ""
                          }`}
                        >
                          {/* Day Circle */}
                          <button
                            onClick={() => toggleDay(day.key)}
                            className={`day-circle ${dayData.enabled ? "active" : "inactive"}`}
                            title={`Toggle ${day.fullName}`}
                          >
                            {day.label}
                          </button>

                          {/* Time Slots */}
                          <div className="flex-1 min-h-[36px] flex items-center">
                            {dayData.enabled && dayData.slots.length > 0 ? (
                              <div className="space-y-3 w-full">
                                {dayData.slots.map((slot, slotIndex) => (
                                  <div key={slotIndex} className="flex items-center gap-2">
                                    <Select
                                      value={slot.start}
                                      onValueChange={(value) => updateSlot(day.key, slotIndex, "start", value)}
                                    >
                                      <SelectTrigger className="time-input w-[110px] h-9">
                                        <SelectValue>{formatTime(slot.start)}</SelectValue>
                                      </SelectTrigger>
                                      <SelectContent>
                                        {timeOptions.map((time) => (
                                          <SelectItem key={time} value={time}>
                                            {formatTime(time)}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>

                                    <span className="text-[#6B7280] text-[13px] px-1">-</span>

                                    <Select
                                      value={slot.end}
                                      onValueChange={(value) => updateSlot(day.key, slotIndex, "end", value)}
                                    >
                                      <SelectTrigger className="time-input w-[110px] h-9">
                                        <SelectValue>{formatTime(slot.end)}</SelectValue>
                                      </SelectTrigger>
                                      <SelectContent>
                                        {timeOptions.map((time) => (
                                          <SelectItem key={time} value={time}>
                                            {formatTime(time)}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>

                                    {/* Action Icons */}
                                    <button
                                      onClick={() => removeSlot(day.key, slotIndex)}
                                      className="action-icon-btn delete"
                                      title="Remove time slot"
                                    >
                                      <Trash2 className="w-[18px] h-[18px]" />
                                    </button>

                                    <button
                                      onClick={() => addSlot(day.key)}
                                      className="action-icon-btn"
                                      title="Add time slot"
                                    >
                                      <Plus className="w-[18px] h-[18px]" />
                                    </button>

                                    <button
                                      onClick={() => setCopyModal({ isOpen: true, dayKey: day.key, slots: dayData.slots })}
                                      className="action-icon-btn"
                                      title="Copy to other days"
                                    >
                                      <Copy className="w-[18px] h-[18px]" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="flex items-center gap-3">
                                <span className="text-[14px] text-[#9CA3AF]">Unavailable</span>
                                <button
                                  onClick={() => toggleDay(day.key)}
                                  className="w-6 h-6 flex items-center justify-center border border-[#D1D5DB] rounded-full text-[#6B7280] hover:border-[#0069FF] hover:text-[#0069FF] transition-colors"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Timezone */}
                  <div className="timezone-section">
                    <div className="flex items-center gap-3">
                      <Globe className="w-[18px] h-[18px] text-[#6B7280]" />
                      <span className="text-[13px] font-medium text-[#6B7280]">Timezone</span>
                      <Select value={timeZone} onValueChange={(v) => { setTimeZone(v); setIsDirty(true); }}>
                        <SelectTrigger className="w-[280px] h-9 border-[#D1D5DB] text-[14px] bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {timezoneOptions.map((tz) => (
                            <SelectItem key={tz.value} value={tz.value}>
                              {tz.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </>
              )}

              {/* Calendar View */}
              {currentView === "calendar" && (
                <CalendarView
                  schedule={schedule}
                  onDateClick={(date) => toast.info(`Clicked ${format(date, "MMMM d, yyyy")}`)}
                />
              )}
            </div>
          )}

          {activeTab === "calendar" && (
            <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
              <h3 className="text-[16px] font-semibold text-[#1F2937] mb-3">Calendar connections</h3>
              <p className="text-[14px] text-[#6B7280] mb-4">
                Connect your calendar to automatically check for conflicts.
              </p>
              <Button variant="outline" className="border-[#D1D5DB] text-[#1F2937] rounded-full">
                Connect calendar
              </Button>
            </div>
          )}

          {activeTab === "limits" && (
            <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
              <h3 className="text-[16px] font-semibold text-[#1F2937] mb-3">Booking limits</h3>
              <p className="text-[14px] text-[#6B7280] mb-4">
                Set limits on how far in advance and how many meetings can be scheduled.
              </p>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-[#F9FAFB] rounded-lg">
                  <span className="text-[14px] text-[#1F2937]">Rolling period</span>
                  <span className="text-[14px] text-[#6B7280]">60 calendar days</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-[#F9FAFB] rounded-lg">
                  <span className="text-[14px] text-[#1F2937]">Minimum notice</span>
                  <span className="text-[14px] text-[#6B7280]">4 hours</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Copy to Days Modal */}
      <CopyToDaysModal
        isOpen={copyModal.isOpen}
        onClose={() => setCopyModal({ isOpen: false, dayKey: null, slots: [] })}
        onCopy={copyToOtherDays}
        sourceDayKey={copyModal.dayKey}
        currentSlots={copyModal.slots}
      />
    </DashboardLayout>
  );
}
