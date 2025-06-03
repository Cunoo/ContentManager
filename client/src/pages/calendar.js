import React, { useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

import 'moment/locale/en-gb'; 

// Setup the localizer by providing the moment Object
moment.locale('en'); // Set default locale
const localizer = momentLocalizer(moment);

// Sample events data with specific times (no duration)
const myEventsList = [
  {
    id: 0,
    title: 'Send Report',
    start: new Date(2025, 4, 29, 9, 0, 0),
    end: new Date(2025, 4, 29, 9, 0, 0), // Same time as start
    resource: 'point-in-time'
  },
  {
    id: 1,
    title: 'Check Status',
    start: new Date(2025, 4, 29, 14, 30, 0),
    end: new Date(2025, 4, 29, 14, 30, 0), // Same time as start
    resource: 'point-in-time'
  },
  {
    id: 2,
    title: 'Daily Notification',
    start: new Date(2025, 4, 30, 10, 15, 0),
    end: new Date(2025, 4, 30, 10, 15, 0), // Same time as start
    resource: 'point-in-time'
  },
  {
    id: 3,
    title: 'Backup Data',
    start: new Date(2025, 4, 30, 18, 0, 0),
    end: new Date(2025, 4, 30, 18, 0, 0), // Same time as start
    resource: 'point-in-time'
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

    // Create the event time (exact same start and end time)
    const eventTime = moment(date).hour(hours).minute(minutes).second(0).toDate();
    const eventEndTime = eventTime; // Exact same time, no duration

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
      <style>
        {`
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
            background-color: #f8f9fa !important;
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
        `}
      </style>
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
            style={{ 
              marginRight: '8px', 
              padding: '8px 15px',
              backgroundColor: '#282c34',
              color: 'white',
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
        min={new Date(2025, 1, 0, 6, 0, 0)}
        max={new Date(2025, 1, 0, 22, 0, 0)}
        showMultiDayTimes
        popup
        toolbar={false}
        formats={{
          timeGutterFormat: 'h:mm A',
          dayHeaderFormat: (date, culture, localizer) => {
            // Custom format for week view headers to show day name + date
            const dayName = localizer.format(date, 'dddd', culture);
            const dateNum = localizer.format(date, 'D', culture);
            return `${dayName}\n${dateNum}`;
          },
          eventTimeRangeFormat: ({ start, end }, culture, localizer) => {
            // Check if this is a point-in-time event (same start and end time)
            if (moment(start).isSame(moment(end))) {
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