import React, {useState, useEffect} from 'react';
import { Calendar, momentLocalizer} from 'react-big-calendar';
import moment from 'moment';

import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'moment/locale/en-gb';

moment.locale('en');
const localizer = momentLocalizer(moment);

const API_BASE_URL = 'http://localhost:3000/api';

// API functions
const api = {
    // Get all events from backend
    getEvents: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/events`);
            if (!response.ok) throw new Error('Failed to fetch events');
            return await response.json();
        } catch (error) {
            console.error('Error fetching events:', error);
            return [];
        }
    },

    // Create new event
    createEvent: async (eventData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/events`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(eventData)
            });
            
            if (!response.ok) throw new Error('Failed to create event');
            return await response.json();
        } catch (error) {
            console.error('Error creating event:', error);
            throw error;
        }
    },

    // Update existing event
    updateEvent: async (eventId, eventData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(eventData)
            });
            
            if (!response.ok) throw new Error('Failed to update event');
            return await response.json();
        } catch (error) {
            console.error('Error updating event:', error);
            throw error;
        }
    },

    // Delete event
    deleteEvent: async (eventId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) throw new Error('Failed to delete event');
            return true;
        } catch (error) {
            console.error('Error deleting event:', error);
            throw error;
        }
    }
};

const MyCalendar = (props) => {
    const [events, setEvents] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [currentView, setCurrentView] = useState('day');
    const [loading, setLoading] = useState(false);

    // Helper functions
    const getCurrentHour = () => {
        return new Date().getHours();
    };

    const getMinTime = () => {
        return new Date(2024, 0, 1, 7, 0, 0); // 7:00 AM
    };

    const getMaxTime = () => {
        return new Date(2024, 0, 1, 22, 0, 0); // 10:00 PM
    };

    // Load events from backend on component mount
    useEffect(() => {
        loadEventsFromBackEnd();
    }, []);

    const loadEventsFromBackEnd = async () => {
        setLoading(true);
        try {
            const backendEvents = await api.getEvents();

            // Transformation backend data to calendar format
            const transformedEvents = backendEvents.map(event => ({
                id: event.id,
                title: event.title,
                start: new Date(event.start_time),
                end: new Date(event.end_time),
                resource: event.resource || 'point-in-time'
            }));
            setEvents(transformedEvents);
        } catch (error) {
            console.error("failed to load events:", error);
            alert('Failed to load events from server');
        } finally {
            setLoading(false);
        }
    };

    // Enhanced event handler with backend integration
    const handleSelectSlot = async ({ start, end }) => {
        const title = window.prompt('New Event name');
        if (!title) return;

        setLoading(true);
        try {
            // Prepare event data for backend
            const eventData = {
                title: title,
                start_time: start.toISOString(),
                end_time: end.toISOString(),
                description: '',
                resource: 'point-in-time'
            };

            // Send to backend
            const savedEvent = await api.createEvent(eventData);

            // Add to local state with backend ID
            const newEvent = {
                id: savedEvent.id,
                title: savedEvent.title,
                start: new Date(savedEvent.start_time),
                end: new Date(savedEvent.end_time),
                resource: savedEvent.resource
            };

            setEvents([...events, newEvent]);

            const startTime = moment(start).format('h:mm A');
            console.log(`Event "${title}" saved to database at ${startTime}`);
        } catch (error) {
            alert('Failed to save event to database');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectEvent = async (event) => {
        const startTime = moment(event.start).format('dddd, MMMM Do YYYY, h:mm A');
        const action = window.confirm(`${event.title}\nTime: ${startTime}\n\nClick OK to delete, Cancel to keep`);
        
        if (action) {
            setLoading(true);
            try {
                await api.deleteEvent(event.id);
                setEvents(events.filter(e => e.id !== event.id));
                console.log(`Event "${event.title}" deleted from database`);
            } catch (error) {
                alert('Failed to delete event from database');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleNavigate = (newDate) => {
        setCurrentDate(newDate);
    };

    const handleViewChange = (view) => {
        setCurrentView(view);
    };

    const handleScheduleEvent = async () => {
        const title = window.prompt('Event title:');
        if (!title) return;

        const date = window.prompt('Date (YYYY-MM-DD):', moment(currentDate).format('YYYY-MM-DD'));
        if (!date) return;

        const time = window.prompt('Time (HH:MM in 24h format):', '09:00');
        if (!time) return;

        // Parse the inputs
        const [hours, minutes] = time.split(':').map(num => parseInt(num));
        
        if (isNaN(hours) || isNaN(minutes)) {
            alert('Invalid time format. Please use HH:MM format (e.g., 09:30, 14:15)');
            return;
        }

        // Validate time
        const currentHour = getCurrentHour();
        if (hours < currentHour || hours > 23 || minutes < 0 || minutes > 59) {
            alert(`Invalid time. Hours should be ${currentHour}-23, minutes should be 0-59`);
            return;
        }

        // Create the event time
        const eventTime = moment(date).hour(hours).minute(minutes).second(0).toDate();

        setLoading(true);
        try {
            // Prepare data for backend
            const eventData = {
                title: title,
                start_time: eventTime.toISOString(),
                end_time: eventTime.toISOString(),
                description: '',
                resource: 'point-in-time'
            };

            // Send to backend
            const savedEvent = await api.createEvent(eventData);

            // Add to local state
            const newEvent = {
                id: savedEvent.id,
                title: savedEvent.title,
                start: new Date(savedEvent.start_time),
                end: new Date(savedEvent.end_time),
                resource: savedEvent.resource
            };

            setEvents([...events, newEvent]);

            // Show confirmation
            const timeFormatted = moment(eventTime).format('dddd, MMMM Do YYYY, h:mm A');
            alert(`Event "${title}" saved to database at: ${timeFormatted}`);

            console.log('Event saved to database:', savedEvent);

        } catch (error) {
            alert('Failed to save event to database');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="myCustomHeight text-white dark:bg-gray-700" style={{ height: '700px' }}>
            <style>
                {`
                /* Hide empty first row ONLY in day view */
                .rbc-day-view .rbc-time-header.rbc-overflowing {
                    display: none !important;
                }
                
                /* Keep the day names header visible in week view */
                .rbc-week-view .rbc-time-header.rbc-overflowing {
                    display: block !important;
                }

                /* Make all days look the same */
                .rbc-today {
                    background-color: inherit !important;
                }
                
                /* Remove current time indicator */
                .rbc-current-time-indicator {
                    display: none !important;
                }
                
                /* Simplify time slot lines - show only major hour lines */
                .rbc-time-slot {
                    border-top: none !important;
                }
                
                .rbc-timeslot-group {
                    border-bottom: 1px solid #ddd !important;
                }
                
                /* Remove weekend highlighting */
                .rbc-off-range-bg {
                    background-color: white !important;
                }
                
                /* Consistent header styling */
                .rbc-header {
                    background-color: #282c34 !important;
                    border-bottom: 1px solid #ddd !important;
                    position: relative !important;
                }
                
                /* Style for day names in week view headers */
                .rbc-header::before {
                    content: attr(data-day-name);
                    display: block;
                    font-weight: bold;
                    font-size: 14px;
                    color: #495057;
                    margin-bottom: 4px;
                }
                
                /* Clean time slot appearance */
                .rbc-day-slot .rbc-time-slot {
                    background-color: white !important;
                }
                
                /* Hide minor time slot borders */
                .rbc-time-content > * > * {
                    border-top: none !important;
                }
                
                /* Show time gutter with hour labels */
                .rbc-time-gutter {
                    background-color: #f8f9fa !important;
                    border-right: 1px solid #ddd !important;
                    width: 80px !important;
                }
                
                .rbc-time-gutter .rbc-timeslot-group {
                    background-color: #f8f9fa !important;
                }
                
                /* Style hour labels */
                .rbc-time-gutter .rbc-label {
                    color: #495057 !important;
                    font-weight: 500 !important;
                    font-size: 12px !important;
                    padding-right: 8px !important;
                    text-align: right !important;
                }

                /* Enhanced styling for week view day names */
                .rbc-time-header .rbc-header {
                    padding: 8px 4px !important;
                    text-align: center !important;
                    min-height: 60px !important;
                    display: flex !important;
                    flex-direction: column !important;
                    justify-content: center !important;
                }

                /* Add day names for week view */
                .rbc-time-view .rbc-header {
                    position: relative;
                }

                .rbc-time-view .rbc-header::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    pointer-events: none;
                }

                /* Style the date numbers to be more prominent */
                .rbc-time-view .rbc-header {
                    font-size: 16px !important;
                    font-weight: 600 !important;
                }

                /* Loading overlay */
                .loading-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: rgba(0, 0, 0, 0.3);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    color: white;
                    font-size: 18px;
                }
                `}
            </style>
            
            {/* Loading overlay */}
            {loading && (
                <div className="loading-overlay">
                    <div>Saving to database...</div>
                </div>
            )}

            {/* Custom Toolbar */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                padding: '15px',
                backgroundColor: '#191d23',
                borderBottom: '2px solid #dee2e6',
                marginBottom: '10px'
            }}>
                <div>
                    <button 
                        onClick={handleScheduleEvent}
                        disabled={loading}
                        style={{ 
                            marginRight: '8px', 
                            padding: '8px 15px',
                            backgroundColor: loading ? '#6c757d' : '#282c34',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        + Schedule Event
                    </button>
                    <button 
                        onClick={loadEventsFromBackEnd}
                        disabled={loading}
                        style={{ 
                            marginRight: '8px', 
                            padding: '8px 15px',
                            backgroundColor: loading ? '#6c757d' : '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        🔄 Refresh
                    </button>
                    <button 
                        onClick={() => {
                            const newDate = moment(currentDate).subtract(1, currentView === 'day' ? 'day' : 'week').toDate();
                            setCurrentDate(newDate);
                        }} 
                        style={{ 
                            marginRight: '8px', 
                            padding: '8px 15px',
                            backgroundColor: '#282c34',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        ← Prev
                    </button>
                    <button 
                        onClick={() => setCurrentDate(new Date())} 
                        style={{ 
                            marginRight: '8px', 
                            padding: '8px 15px',
                            backgroundColor: '#282c34',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Today
                    </button>
                    <button 
                        onClick={() => {
                            const newDate = moment(currentDate).add(1, currentView === 'day' ? 'day' : 'week').toDate();
                            setCurrentDate(newDate);
                        }} 
                        style={{ 
                            padding: '8px 15px',
                            backgroundColor: '#282c34',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Next →
                    </button>
                </div>
                
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#495057' }}>
                    {moment(currentDate).format(currentView === 'day' ? 'dddd, MMMM Do YYYY' : 'MMMM YYYY')}
                </div>
                
                <div>
                    <button 
                        onClick={() => setCurrentView('day')} 
                        style={{ 
                            marginRight: '8px', 
                            padding: '8px 15px',
                            backgroundColor: currentView === 'day' ? '#6c757d' : '#282c34',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Day View
                    </button>
                    <button 
                        onClick={() => setCurrentView('week')} 
                        style={{ 
                            padding: '8px 15px',
                            backgroundColor: currentView === 'week' ? '#6c757d' : '#282c34',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Week View
                    </button>
                </div>
            </div>

            {/* Calendar */}
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                selectable
                onSelectSlot={handleSelectSlot}
                onSelectEvent={handleSelectEvent}
                date={currentDate}
                onNavigate={handleNavigate}
                view={currentView}
                onView={handleViewChange}
                defaultView="day"
                views={['day', 'week']}
                step={5}
                timeslots={12}
                min={getMinTime()}
                max={getMaxTime()}
                showMultiDayTimes
                popup
                toolbar={false}
                formats={{
                    timeGutterFormat: 'h:mm A',
                    dayHeaderFormat: (date, culture, localizer) => {
                        const dayName = localizer.format(date, 'dddd', culture);
                        const dateNum = localizer.format(date, 'D', culture);
                        return `${dayName}\n${dateNum}`;
                    },
                    eventTimeRangeFormat: ({ start, end }, culture, localizer) => {
                        if (moment(start).isSame(moment(end))) {
                            return localizer.format(start, 'h:mm A', culture);
                        }
                        return localizer.format(start, 'h:mm A', culture) + ' - ' + 
                               localizer.format(end, 'h:mm A', culture);
                    },
                    selectRangeFormat: ({ start, end }, culture, localizer) =>
                        localizer.format(start, 'h:mm A', culture) + ' - ' + 
                        localizer.format(end, 'h:mm A', culture),
                }}
            />
        </div>
    );
};

export default MyCalendar;