import React, {useState, useEffect, useContext, useCallback} from 'react';
import { Calendar, momentLocalizer} from 'react-big-calendar';
import moment from 'moment';
import { AuthContext } from '../context/AuthContext'; // Import your AuthContext

import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'moment/locale/en-gb';

moment.locale('en');
const localizer = momentLocalizer(moment);

// Updated to match your server URL and port
const API_BASE_URL = 'http://127.0.0.1:5000/api';

// API functions updated for your server response format with enhanced debugging
const api = {
    // Get all events from backend
    getEvents: async () => {
        try {
            console.log('📅 GET EVENTS API - Fetching all events');
            const response = await fetch(`${API_BASE_URL}/events`);
            if (!response.ok) throw new Error('Failed to fetch events');
            const data = await response.json();
            console.log('📅 GET EVENTS API - Response:', data);
            console.log('📅 GET EVENTS API - Events count:', data.events?.length || 0);
            return data.events || [];
        } catch (error) {
            console.error('📅 GET EVENTS API - Error:', error);
            return [];
        }
    },

    // Get events for specific user
    getUserEvents: async (userId) => {
        try {
            console.log('👤 GET USER EVENTS API - User ID:', userId, 'Type:', typeof userId);
            const response = await fetch(`${API_BASE_URL}/users/${userId}/events`);
            if (!response.ok) throw new Error('Failed to fetch user events');
            const data = await response.json();
            console.log('👤 GET USER EVENTS API - Response:', data);
            console.log('👤 GET USER EVENTS API - Events count:', data.events?.length || 0);
            return data.events || [];
        } catch (error) {
            console.error('👤 GET USER EVENTS API - Error:', error);
            return [];
        }
    },

    // Create new event - ENHANCED WITH DEBUGGING
    createEvent: async (eventData) => {
        try {
            console.log('=== 🆕 CREATE EVENT API DEBUG START ===');
            console.log('📤 Sending event data:', JSON.stringify(eventData, null, 2));
            console.log('📤 User ID being sent:', eventData.user_id);
            console.log('📤 User ID type:', typeof eventData.user_id);
            console.log('📤 Event data keys:', Object.keys(eventData));
            
            const response = await fetch(`${API_BASE_URL}/events`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(eventData)
            });
            
            console.log('📡 Response status:', response.status);
            console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
            
            const responseText = await response.text();
            console.log('📡 Raw response text:', responseText);
            
            if (!response.ok) {
                let errorData;
                try {
                    errorData = JSON.parse(responseText);
                } catch (e) {
                    errorData = { error: responseText };
                }
                console.error('❌ CREATE EVENT API - Server error:', errorData);
                throw new Error(errorData.error || 'Failed to create event');
            }
            
            const data = JSON.parse(responseText);
            console.log('✅ CREATE EVENT API - Success response:', data);
            console.log('✅ Created event user_id:', data.event?.user_id);
            console.log('✅ Created event user_id type:', typeof data.event?.user_id);
            console.log('=== 🆕 CREATE EVENT API DEBUG END ===');
            
            return data.event;
        } catch (error) {
            console.error('💥 CREATE EVENT API - Exception:', error);
            throw error;
        }
    },

    // Update existing event
    updateEvent: async (eventId, eventData) => {
        try {
            console.log('✏️ UPDATE EVENT API - ID:', eventId, 'Data:', eventData);
            const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(eventData)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                console.error('✏️ UPDATE EVENT API - Error:', errorData);
                throw new Error(errorData.error || 'Failed to update event');
            }
            const data = await response.json();
            console.log('✏️ UPDATE EVENT API - Success:', data);
            return data.event;
        } catch (error) {
            console.error('✏️ UPDATE EVENT API - Exception:', error);
            throw error;
        }
    },

    // Delete event
    deleteEvent: async (eventId) => {
        try {
            console.log('🗑️ DELETE EVENT API - ID:', eventId);
            const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                console.error('🗑️ DELETE EVENT API - Error:', errorData);
                throw new Error(errorData.error || 'Failed to delete event');
            }
            console.log('🗑️ DELETE EVENT API - Success');
            return true;
        } catch (error) {
            console.error('🗑️ DELETE EVENT API - Exception:', error);
            throw error;
        }
    }
};

const MyCalendar = (props) => {
    const [events, setEvents] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [currentView, setCurrentView] = useState('day');
    const [loading, setLoading] = useState(false);
    const [showUserEvents, setShowUserEvents] = useState(false);

    // 🔧 USE AUTH CONTEXT - REMOVED UNUSED 'login'
    const { currentUser, logout } = useContext(AuthContext);

    // 🔧 FIXED: Moved loadEventsFromBackEnd to useCallback to fix dependency warning
    const loadEventsFromBackEnd = useCallback(async () => {
        console.log('=== 🔄 LOADING EVENTS ===');
        console.log('Show user events:', showUserEvents);
        console.log('Current user:', currentUser);
        
        setLoading(true);
        try {
            let backendEvents;
            
            if (showUserEvents && currentUser) {
                console.log('Loading events for user:', currentUser.id);
                backendEvents = await api.getUserEvents(currentUser.id);
                console.log(`Loaded ${backendEvents.length} events for user ${currentUser.username}`);
            } else {
                console.log('Loading all events');
                backendEvents = await api.getEvents();
                console.log('Loaded all events from server:', backendEvents.length);
            }

            // Transformation backend data to calendar format
            const transformedEvents = backendEvents.map(event => {
                console.log('Transforming event:', event);
                return {
                    id: event.id,
                    title: event.title,
                    start: new Date(event.start_time),
                    end: new Date(event.end_time),
                    resource: event.resource || 'point-in-time',
                    description: event.description,
                    username: event.username,
                    userId: event.user_id
                };
            });
            
            setEvents(transformedEvents);
            console.log(`✅ Successfully loaded ${transformedEvents.length} events`);
            console.log('Events with user_id:', transformedEvents.filter(e => e.userId).length);
            console.log('Events without user_id:', transformedEvents.filter(e => !e.userId).length);
            console.log('=== END LOADING EVENTS ===');
        } catch (error) {
            console.error("❌ Failed to load events:", error);
            alert('Failed to load events from server. Please make sure the server is running on http://127.0.0.1:5000');
        } finally {
            setLoading(false);
        }
    }, [showUserEvents, currentUser]); // Added dependencies

    // Debug current user state whenever it changes
    useEffect(() => {
        console.log('=== 👤 USER STATE CHANGE (FROM CONTEXT) ===');
        console.log('Current user:', currentUser);
        console.log('User ID:', currentUser?.id);
        console.log('User ID type:', typeof currentUser?.id);
        console.log('Username:', currentUser?.username);
        console.log('Show user events:', showUserEvents);
        console.log('=== END USER STATE ===');
    }, [currentUser, showUserEvents]);

    // Helper functions
    const getMinTime = () => {
        return new Date(2024, 0, 1, 7, 0, 0); // 7:00 AM
    };

    const getMaxTime = () => {
        return new Date(2024, 0, 1, 22, 0, 0); // 10:00 PM
    };

    // 🔧 FIXED: Now includes loadEventsFromBackEnd in dependency array properly
    useEffect(() => {
        loadEventsFromBackEnd();
    }, [loadEventsFromBackEnd]);

    // 🔧 SIMPLIFIED LOGOUT - USE CONTEXT
    const handleLogout = () => {
        console.log('🚪 User logging out');
        logout(); // Use context logout
        setShowUserEvents(false);
        loadEventsFromBackEnd(); // Reload all events
        alert('You have been logged out.');
    };

    // Enhanced event handler with user_id integration and EXTENSIVE DEBUGGING
    const handleSelectSlot = async ({ start, end }) => {
        console.log('=== 🎯 HANDLE SELECT SLOT DEBUG START ===');
        console.log('Current user from context:', currentUser);
        console.log('Current user ID:', currentUser?.id);
        console.log('Current user ID type:', typeof currentUser?.id);
        
        const title = window.prompt('New Event name');
        if (!title) {
            console.log('❌ No title provided, canceling event creation');
            return;
        }

        const description = window.prompt('Event description (optional):') || '';

        setLoading(true);
        try {
            // Prepare event data for backend - NOW WITH USER_ID FROM CONTEXT!
            const eventData = {
                title: title,
                start_time: start.toISOString(),
                end_time: start.toISOString(), // Same as start for point-in-time events
                description: description,
                resource: 'point-in-time',
                user_id: currentUser ? currentUser.id : null // USE CONTEXT USER_ID!
            };

            console.log('📤 Prepared event data:', JSON.stringify(eventData, null, 2));
            console.log('📤 User ID being sent:', eventData.user_id);
            console.log('📤 User ID type:', typeof eventData.user_id);
            console.log('📤 Current user object from context:', currentUser);

            // Send to backend
            console.log('🚀 Sending event to backend...');
            const savedEvent = await api.createEvent(eventData);
            console.log('✅ Event saved to database:', savedEvent);
            console.log('✅ Saved event user_id:', savedEvent.user_id);

            // Add to local state with backend data
            const newEvent = {
                id: savedEvent.id,
                title: savedEvent.title,
                start: new Date(savedEvent.start_time),
                end: new Date(savedEvent.end_time),
                resource: savedEvent.resource,
                description: savedEvent.description,
                userId: savedEvent.user_id
            };

            console.log('📋 Adding event to local state:', newEvent);
            setEvents([...events, newEvent]);

            const startTime = moment(start).format('h:mm A');
            const userInfo = currentUser ? ` (assigned to ${currentUser.username})` : ' (no user assigned)';
            console.log(`✅ Event "${title}" saved to database at ${startTime}${userInfo}`);
            alert(`Event "${title}" created successfully${userInfo}!`);
            console.log('=== 🎯 HANDLE SELECT SLOT DEBUG END ===');
        } catch (error) {
            console.error('💥 Error saving event:', error);
            alert(`Failed to save event: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectEvent = async (event) => {
        console.log('=== 🔍 EVENT SELECTED ===');
        console.log('Selected event:', event);
        console.log('Event user ID:', event.userId);
        console.log('Event username:', event.username);
        console.log('=== END EVENT SELECTED ===');
        
        const startTime = moment(event.start).format('dddd, MMMM Do YYYY, h:mm A');
        let eventDetails = `${event.title}\nTime: ${startTime}`;
        
        if (event.description) {
            eventDetails += `\nDescription: ${event.description}`;
        }
        if (event.username) {
            eventDetails += `\nCreated by: ${event.username}`;
        } else if (event.userId) {
            eventDetails += `\nUser ID: ${event.userId}`;
        } else {
            eventDetails += `\nNo user assigned`;
        }
        
        const action = window.confirm(`${eventDetails}\n\nClick OK to delete, Cancel to keep`);
        
        if (action) {
            setLoading(true);
            try {
                await api.deleteEvent(event.id);
                setEvents(events.filter(e => e.id !== event.id));
                console.log(`✅ Event "${event.title}" deleted from database`);
                alert(`Event "${event.title}" deleted successfully!`);
            } catch (error) {
                console.error('❌ Error deleting event:', error);
                alert(`Failed to delete event: ${error.message}`);
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
        console.log('=== 📅 HANDLE SCHEDULE EVENT DEBUG START ===');
        console.log('Current user from context:', currentUser);
        console.log('Current user ID:', currentUser?.id);
        
        const title = window.prompt('Event title:');
        if (!title) return;

        const date = window.prompt('Date (YYYY-MM-DD):', moment(currentDate).format('YYYY-MM-DD'));
        if (!date) return;

        const time = window.prompt('Time (HH:MM in 24h format):', '09:00');
        if (!time) return;

        const description = window.prompt('Event description (optional):') || '';

        // Parse the inputs
        const [hours, minutes] = time.split(':').map(num => parseInt(num));
        
        if (isNaN(hours) || isNaN(minutes)) {
            alert('Invalid time format. Please use HH:MM format (e.g., 09:30, 14:15)');
            return;
        }

        if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
            alert('Invalid time. Hours should be 0-23, minutes should be 0-59');
            return;
        }

        // Create the event time
        const eventTime = moment(date).hour(hours).minute(minutes).second(0).toDate();

        setLoading(true);
        try {
            // Prepare data for backend - NOW WITH USER_ID FROM CONTEXT!
            const eventData = {
                title: title,
                start_time: eventTime.toISOString(),
                end_time: eventTime.toISOString(),
                description: description,
                resource: 'point-in-time',
                user_id: currentUser ? currentUser.id : null // USE CONTEXT USER_ID!
            };

            console.log('📤 Scheduled event data:', JSON.stringify(eventData, null, 2));
            console.log('📤 User ID being sent:', eventData.user_id);
            console.log('📤 User ID type:', typeof eventData.user_id);

            // Send to backend
            const savedEvent = await api.createEvent(eventData);
            console.log('✅ Scheduled event saved to database:', savedEvent);

            // Add to local state
            const newEvent = {
                id: savedEvent.id,
                title: savedEvent.title,
                start: new Date(savedEvent.start_time),
                end: new Date(savedEvent.end_time),
                resource: savedEvent.resource,
                description: savedEvent.description,
                userId: savedEvent.user_id
            };

            setEvents([...events, newEvent]);

            // Show confirmation
            const timeFormatted = moment(eventTime).format('dddd, MMMM Do YYYY, h:mm A');
            const userInfo = currentUser ? ` (assigned to ${currentUser.username})` : ' (no user assigned)';
            alert(`Event "${title}" saved to database at: ${timeFormatted}${userInfo}`);
            console.log('=== 📅 HANDLE SCHEDULE EVENT DEBUG END ===');

        } catch (error) {
            console.error('💥 Error saving scheduled event:', error);
            alert(`Failed to save event: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Test server connection
    const testServerConnection = async () => {
        try {
            console.log('🔍 Testing server connection...');
            const response = await fetch(`${API_BASE_URL.replace('/api', '')}/api/health`);
            if (response.ok) {
                const data = await response.json();
                console.log('✅ Server health check:', data);
                alert(`Server Status: ${data.status}\nDatabase: ${data.database}\nTime: ${data.timestamp}`);
            } else {
                throw new Error('Server not responding');
            }
        } catch (error) {
            console.error('❌ Server connection failed:', error);
            alert('Cannot connect to server. Please make sure your server is running on http://127.0.0.1:5000');
        }
    };

    // Debug function to show current state
    const showDebugInfo = () => {
        console.log('=== 🐛 DEBUG INFO ===');
        console.log('Current user from context:', currentUser);
        console.log('Current user ID:', currentUser?.id);
        console.log('Current user ID type:', typeof currentUser?.id);
        console.log('Events count:', events.length);
        console.log('Events with user_id:', events.filter(e => e.userId).length);
        console.log('Events without user_id:', events.filter(e => !e.userId).length);
        console.log('Show user events:', showUserEvents);
        console.log('All events:', events);
        console.log('=== END DEBUG INFO ===');
        
        alert(`Debug Info:
Current User: ${currentUser?.username || 'Not logged in'}
User ID: ${currentUser?.id || 'N/A'} (${typeof currentUser?.id})
Total Events: ${events.length}
Events with User ID: ${events.filter(e => e.userId).length}
Events without User ID: ${events.filter(e => !e.userId).length}
Show User Events: ${showUserEvents}

Check console for detailed logs!`);
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

                /* User events styling */
                .user-event {
                    background-color: #28a745 !important;
                    border-color: #28a745 !important;
                }

                .anonymous-event {
                    background-color: #6c757d !important;
                    border-color: #6c757d !important;
                }

                /* Debug button styling */
                .debug-button {
                    background-color: #ff6b35 !important;
                    animation: pulse 2s infinite;
                }

                @keyframes pulse {
                    0% { opacity: 1; }
                    50% { opacity: 0.7; }
                    100% { opacity: 1; }
                }
                `}
            </style>
            
            {/* Loading overlay */}
            {loading && (
                <div className="loading-overlay">
                    <div>Connecting to database...</div>
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
                    
                    {/* DEBUG BUTTON - HIGHLY VISIBLE */}
                    <button 
                        onClick={showDebugInfo}
                        className="debug-button"
                        style={{ 
                            marginRight: '8px', 
                            padding: '8px 15px',
                            backgroundColor: '#ff6b35',
                            color: 'white',
                            border: '2px solid #ff4500',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '14px'
                        }}
                    >
                        🐛 DEBUG INFO
                    </button>
                    
                    {/* SIMPLIFIED AUTH BUTTONS - USE CONTEXT */}
                    {!currentUser ? (
                        <div style={{ display: 'inline-block', padding: '8px 15px', backgroundColor: '#dc3545', color: 'white', borderRadius: '4px' }}>
                            ⚠️ Please login from main app to create events
                        </div>
                    ) : (
                        <>
                            <button 
                                onClick={() => setShowUserEvents(!showUserEvents)}
                                style={{ 
                                    marginRight: '8px', 
                                    padding: '8px 15px',
                                    backgroundColor: showUserEvents ? '#dc3545' : '#17a2b8',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                {showUserEvents ? 'Show All Events' : 'My Events Only'}
                            </button>
                            <button 
                                onClick={handleLogout}
                                style={{ 
                                    marginRight: '8px', 
                                    padding: '8px 15px',
                                    backgroundColor: '#dc3545',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                🚪 Logout
                            </button>
                        </>
                    )}
                    
                    <button 
                        onClick={testServerConnection}
                        style={{ 
                            marginRight: '8px', 
                            padding: '8px 15px',
                            backgroundColor: '#17a2b8',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        🔍 Test Server
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
                
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#495057', textAlign: 'center' }}>
                    <div>{moment(currentDate).format(currentView === 'day' ? 'dddd, MMMM Do YYYY' : 'MMMM YYYY')}</div>
                    {currentUser && (
                        <div style={{ fontSize: '14px', color: '#28a745' }}>
                            👤 {currentUser.username} (ID: {currentUser.id}) {showUserEvents && '(My Events)'}
                        </div>
                    )}
                    <div style={{ fontSize: '12px', color: '#6c757d' }}>
                        {events.length} events loaded from database
                        {currentUser && ` • Events will be assigned to ${currentUser.username}`}
                    </div>
                    <div style={{ fontSize: '10px', color: '#28a745' }}>
                        With User: {events.filter(e => e.userId).length} | Without User: {events.filter(e => !e.userId).length}
                    </div>
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
                eventPropGetter={(event) => ({
                    className: event.userId ? 'user-event' : 'anonymous-event',
                    style: event.userId ? {
                        backgroundColor: '#28a745',
                        borderColor: '#28a745',
                        color: 'white'
                    } : {
                        backgroundColor: '#6c757d',
                        borderColor: '#6c757d',
                        color: 'white'
                    }
                })}
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