import React, {useState, useEffect} from 'react';
import { Calendar, momentLocalizer} from 'react-big-calendar';
import moment from 'moment';

import 'react-big-calendar/lib/css/react-big-calendar.css';


import 'moment/locale/en-gb';

moment.locale('en');
const localizer = momentLocalizer(moment);


const API_BASE_URL = 'http://localhost:3000/api';

//API functions


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
    const [loading, setLoading] = useState(false);xw

    //load events from backend on component mount
    useEffect(() => {
        loadEventsFromBackEnd();
    }, []);

    const loadEventsFromBackEnd = async () => {
        setLoading(true);
        try {
            const backendEvents = await api.getEvents();

            //transformation backend data to calendar format
            const transformedEvents = backendEvents.map(event => ( {
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
    }
    // enhanced event handler with backend integration
    const handleSelectSlot = async ({ start, end}) => {
        const title = window.prompt('New Event name');
        if (!title) return;

        setLoading(true);
        try {
            //prepare event data for backend
            const eventData = {
                title: title,
                start_time: start.toISOString(),
                end_time: start.toISOString(),
                description: '',
                resource: 'point-in-time'

            };

            //send to backend
            const savedEvent = await api.createEvent(eventData);

            //add to local state with backend ID
            const newEvent = {
                id: savedEvent.id,
                title: savedEvent.title,
                start: new Date(savedEvent.start_time),
                end: new Date(savedEvent.end_time),
                resources: savedEvent.resource
            };

            setEvents([...events, newEvent]);

            const startTime = moment(start).format('h:mm A');
            console.log(`Event "${title}" saved to database at ${startTime}`);
        } catch (error) {
            alert('Failed to save event to database');
        } finally {
            setLoading(false);
        }
    }
}

const handleSelectEvent = async (event) => {
    const startTime = moment(event.start).format('dddd, MMMM Do YYYY, h:mm A');
    const action = window.confirm(`${event.title}\nTime: ${startTime}\n\nClick OK to delete, Cancel to keep`);
    
    if(action) {
        setLoading(true);
        try {
            await api.deleteEvent(event.id);
            setEvent(events.filter(e => e.id !== event.id));
            console.log('Event "${event.title}" deleted from database');
        } catch (error) {
            alert('Failed to delete event from database');
        } finally {
            setLoading(false);
        }
    }
}






export default MyCalendar;
