import React, { useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Import moment locales if needed
import 'moment/locale/en-gb'; // or your preferred locale

// Setup the localizer by providing the moment Object
moment.locale('en'); // Set default locale
const localizer = momentLocalizer(moment);

// Sample events data with precise times
const myEventsList = [
  {
    id: 0,
    title: 'Morning Meeting',
    start: new Date(2025, 4, 29, 9, 15, 0), // Today at 9:15 AM
    end: new Date(2025, 4, 29, 10, 45, 0), // Today at 10:45 AM
  },
  {
    id: 1,
    title: 'Coffee Break',
    start: new Date(2025, 4, 29, 10, 45, 0), // Today at 10:45 AM
    end: new Date(2025, 4, 29, 11, 0, 0), // Today at 11:00 AM
  },
  {
    id: 2,
    title: 'Project Review',
    start: new Date(2025, 4, 29, 14, 30, 0), // Today at 2:30 PM
    end: new Date(2025, 4, 29, 16, 15, 0), // Today at 4:15 PM
  },
  {
    id: 3,
    title: 'Team Call',
    start: new Date(2025, 4, 29, 16, 30, 0), // Today at 4:30 PM
    end: new Date(2025, 4, 29, 17, 0, 0), // Today at 5:00 PM
  },
];

const MyCalendar = (props) => {
  const [events, setEvents] = useState(myEventsList);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState('day');

  // Enhanced event handler with precise time selection
  const handleSelectSlot = ({ start, end }) => {
    const title = window.prompt('New Event name');
    if (title) {
      // Show the exact time selected
      const startTime = moment(start).format('h:mm A');
      const endTime = moment(end).format('h:mm A');
      console.log(`Event "${title}" scheduled from ${startTime} to ${endTime}`);
      
      setEvents([
        ...events,
        {
          id: events.length,
          start,
          end,
          title,
        },
      ]);
    }
  };

  const handleSelectEvent = (event) => {
    const startTime = moment(event.start).format('dddd, MMMM Do YYYY, h:mm A');
    const endTime = moment(event.end).format('h:mm A');
    window.alert(`${event.title}\nTime: ${startTime} - ${endTime}`);
  };

  const handleNavigate = (newDate) => {
    setCurrentDate(newDate);
  };

  const handleViewChange = (view) => {
    setCurrentView(view);
  };

  const handleScheduleEvent = () => {
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
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      alert('Invalid time. Hours should be 0-23, minutes should be 0-59');
      return;
    }

    // Create the event time (same start and end time for point-in-time events)
    const eventTime = moment(date).hour(hours).minute(minutes).second(0).toDate();
    const eventEndTime = moment(eventTime).add(1, 'minute').toDate(); // Just 1 minute for minimal display

    // Add the event
    setEvents([
      ...events,
      {
        id: events.length,
        title,
        start: eventTime,
        end: eventEndTime,
        allDay: false,
        resource: 'point-in-time' // Mark this as a point-in-time event
      },
    ]);

    // Show confirmation with exact time
    const timeFormatted = moment(eventTime).format('dddd, MMMM Do YYYY, h:mm A');
    
    alert(`Event "${title}" scheduled at: ${timeFormatted}`);
    
    // Here you would send the data: title, date, and exact time
    console.log('Event data to send:', {
      title: title,
      date: moment(eventTime).format('YYYY-MM-DD'),
      time: moment(eventTime).format('HH:mm'),
      timestamp: eventTime
    });
  };

  return (
    <div className="myCustomHeight text-white dark:bg-gray-700" style={{ height: '700px' }}>
      {/* Custom Toolbar */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '15px',
        backgroundColor: '#f8f9fa',
        borderBottom: '2px solid #dee2e6',
        marginBottom: '10px'
      }}>
        <div>
          <button 
            onClick={handleScheduleEvent}
            style={{ 
              marginRight: '8px', 
              padding: '8px 15px',
              backgroundColor: '#ffc107',
              color: '#212529',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            + Schedule Event
          </button>
          <button 
            onClick={() => {
              const newDate = moment(currentDate).subtract(1, currentView === 'day' ? 'day' : 'week').toDate();
              setCurrentDate(newDate);
            }} 
            style={{ 
              marginRight: '8px', 
              padding: '8px 15px',
              backgroundColor: '#007bff',
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
              backgroundColor: '#28a745',
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
              backgroundColor: '#007bff',
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
              backgroundColor: currentView === 'day' ? '#dc3545' : '#6c757d',
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
              backgroundColor: currentView === 'week' ? '#dc3545' : '#6c757d',
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
        min={new Date(2025, 1, 0, 6, 0, 0)}
        max={new Date(2025, 1, 0, 22, 0, 0)}
        showMultiDayTimes
        popup
        toolbar={false}
        formats={{
          timeGutterFormat: 'h:mm A',
          eventTimeRangeFormat: ({ start, end }, culture, localizer) => {
            // Check if this is a point-in-time event (1 minute difference)
            const duration = moment(end).diff(moment(start), 'minutes');
            if (duration <= 1) {
              return localizer.format(start, 'h:mm A', culture); // Show only start time
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