import { createContext, useContext, useEffect, useState } from "react";

// --- API Client ---

const BASE_URL = import.meta.env.VITE_API_URL + "/api/v1";

async function fetchApi(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const headers = {
        'Content-Type': 'application/json',

        ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });

    // Handle 204 No Content or empty response
    if (response.status === 204 || response.headers.get('content-length') === '0') {
        return null;
    }

    // Safely parse JSON - handle empty responses
    let data;
    const text = await response.text();
    try {
        data = text ? JSON.parse(text) : null;
    } catch (e) {
        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
        }
        return null;
    }

    if (!response.ok) {
        // Backend uses { detail: "..." } for errors
        throw new Error(data?.detail || data?.message || data?.error?.message || 'API Error');
    }

    // Backend returns raw data directly (no { success: true, data: ... } wrapper)
    // But also handle wrapped responses for compatibility
    if (data?.success && data.data !== undefined) {
        return data.data;
    }

    return data;
}

// Helper for 204s (no longer needed as fetchApi handles it, but kept for explicit DELETE calls)
async function fetchVoid(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const headers = {
        'Content-Type': 'application/json',

        ...options.headers,
    };
    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.detail || data.message || data.error?.message || 'API Error');
    }
}

export const api = {
    // 2. Auth & User
    getMe: () => fetchApi('/me'),

    // 3. Event Types
    getEventTypes: (params) => {
        const query = new URLSearchParams(params).toString();
        return fetchApi(`/event-types?${query}`);
    },
    getEventTypeById: (id) => fetchApi(`/event-types/${id}`),
    createEventType: (data) =>
        fetchApi('/event-types', { method: 'POST', body: JSON.stringify(data) }),
    updateEventType: (id, data) =>
        fetchApi(`/event-types/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteEventType: (id) => fetchVoid(`/event-types/${id}`, { method: 'DELETE' }),
    toggleEventType: (id) => fetchApi(`/event-types/${id}/toggle`, { method: 'PATCH' }),
    duplicateEventType: (id) => fetchApi(`/event-types/${id}/duplicate`, { method: 'POST' }),

    // 4. Availability
    getSchedule: (scheduleId) => {
        const query = scheduleId ? `?schedule_id=${scheduleId}` : '';
        return fetchApi(`/availability/schedule${query}`);
    },
    updateSchedule: (data) =>
        fetchApi('/availability/schedule', { method: 'PUT', body: JSON.stringify(data) }),
    getAllSchedules: () => fetchApi('/availability/schedules'),
    createSchedule: (data) =>
        fetchApi('/availability/schedules', { method: 'POST', body: JSON.stringify(data) }),
    addDateOverride: (data) =>
        fetchApi('/availability/date-overrides', { method: 'POST', body: JSON.stringify(data) }),
    deleteDateOverride: (id) => fetchVoid(`/availability/date-overrides/${id}`, { method: 'DELETE' }),
    updateTimezone: (timezone) =>
        fetchApi('/availability/schedule/timezone', { method: 'PATCH', body: JSON.stringify({ timezone }) }),

    // 5. Public Booking
    getPublicEventType: (username, slug) =>
        fetchApi(`/public/${username}/${slug}`),
    getPublicAvailableDates: (eventTypeId, month, timezone) => {
        const query = new URLSearchParams({ event_type_id: eventTypeId, month, ...(timezone && { timezone }) }).toString();
        return fetchApi(`/public/available-dates?${query}`);
    },
    getPublicSlots: (eventTypeId, date, timezone) => {
        const query = new URLSearchParams({ event_type_id: eventTypeId, date, ...(timezone && { timezone }) }).toString();
        return fetchApi(`/public/slots?${query}`);
    },
    createPublicBooking: (data) =>
        fetchApi('/public/bookings', { method: 'POST', body: JSON.stringify(data) }),
    getPublicBooking: (id) => fetchApi(`/public/bookings/${id}`),

    // 6. Meetings
    getMeetings: (params = {}) => {
        const qParams = { ...params };
        if (params.date_range) {
            qParams.start_date = params.date_range.start;
            qParams.end_date = params.date_range.end;
            delete qParams.date_range;
        }
        const query = new URLSearchParams(qParams).toString();
        return fetchApi(`/meetings?${query}`);
    },
    getMeetingById: (id) => fetchApi(`/meetings/${id}`),
    cancelMeeting: (id, reason) =>
        fetchApi(`/meetings/${id}/cancel`, { method: 'POST', body: JSON.stringify({ reason }) }),
    updateMeetingNotes: (id, content) =>
        fetchApi(`/meetings/${id}/notes`, { method: 'PUT', body: JSON.stringify({ content }) }),
    deleteMeetingNotes: (id) => fetchVoid(`/meetings/${id}/notes`, { method: 'DELETE' }),
};

// --- Context & Provider ---

const Context_here = createContext(undefined);

export function ContextProvider({ children }) {
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [timeZone, setTimeZone] = useState("UTC");
    const [user, setUser] = useState(null);
    const [userLoading, setUserLoading] = useState(true);

    // Auto-fetch user on mount - silently fail if backend unavailable
    useEffect(() => {
        let mounted = true;
        const fetchUser = async () => {
            try {
                const userData = await api.getMe();
                if (mounted && userData) {
                    setUser(userData);
                    if (userData.timezone) {
                        setTimeZone(userData.timezone);
                    }
                }
            } catch (err) {
                // Silently handle error - backend may not be running
                console.warn("Could not fetch user:", err?.message || err);
            } finally {
                if (mounted) {
                    setUserLoading(false);
                }
            }
        };
        fetchUser();
        return () => { mounted = false; };
    }, []);

    const resetBooking = () => {
        setSelectedDate(null);
        setSelectedSlot(null);
    };

    const value = {
        selectedDate,
        selectedSlot,
        timeZone,
        user,
        userLoading,
        setSelectedDate,
        setSelectedSlot,
        setTimeZone,
        setUser,
        resetBooking,
        api
    };

    return (
        <Context_here.Provider value={value}>
            {children}
        </Context_here.Provider>
    );
}

export function useContextProvider() {
    const context = useContext(Context_here);
    if (context === undefined) {
        throw new Error("useContextProvider must be used within a ContextProvider");
    }

    return context;
}