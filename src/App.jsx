import React, { useState, useEffect } from "react";
import "./App.css";

const App = () => {
  const [currDate, setCurrDate] = useState(new Date());
  const [events, setEvents] = useState(JSON.parse(localStorage.getItem("events")) || []);
  const [modalActive, setModalActive] = useState(false);
  const [eventDate, setEventDate] = useState("");
  const [eventName, setEventName] = useState("");
  const [timer, setTimer] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [priority, setPriority] = useState("low");
  const [progress, setProgress] = useState(0);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const currYear = currDate.getFullYear();
  const currMonth = currDate.getMonth();

  useEffect(() => {
    localStorage.setItem("events", JSON.stringify(events));
  }, [events]);

  const createCalendarDays = () => {
    const days = [];
    const lastDateOfMonth = new Date(currYear, currMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currYear, currMonth, 1).getDay();
    const lastDateOfPrevMonth = new Date(currYear, currMonth, 0).getDate();
    const lastDayOfMonth = new Date(currYear, currMonth + 1, 0).getDay();

    for (let i = firstDayOfMonth; i > 0; i--) {
      days.push(
        <div key={`prev-${i}`} className="inactive">
          {lastDateOfPrevMonth - i + 1}
        </div>
      );
    }

    for (let i = 1; i <= lastDateOfMonth; i++) {
      const paddedMonth = (currMonth + 1).toString().padStart(2, "0");
      const paddedDay = i.toString().padStart(2, "0");
      const dayEvents = events.filter(event => event.date === `${currYear}-${paddedMonth}-${paddedDay}`);

      days.push(
        <div
          key={`curr-${i}`}
          className={`day ${dayEvents.length > 0 ? "event-day" : ""}`}
          data-date={`${currYear}-${paddedMonth}-${paddedDay}`}
          onClick={() => openEventModal(`${currYear}-${paddedMonth}-${paddedDay}`)}
        >
          <span>{i}</span>
          {dayEvents.map((event, index) => (
            <div key={index} className="event-style">
              {event.name}
            </div>
          ))}
        </div>
      );
    }

    for (let i = 1; i <= 6 - lastDayOfMonth; i++) {
      days.push(
        <div key={`next-${i}`} className="inactive">
          {i}
        </div>
      );
    }

    return days;
  };

  const openEventModal = (date) => {
    setEventDate(date);
    const eventsForDate = events.filter(event => event.date === date);
    setSelectedEvents(eventsForDate);
    setModalActive(true);
  };

  const closeModal = () => {
    setModalActive(false);
    setEventName("");
    setTimer({ hours: 0, minutes: 0, seconds: 0 });
    setPriority("low");
    setProgress(0);
  };

  const addEvent = (e) => {
    e.preventDefault();
    const newEvent = {
      date: eventDate,
      name: eventName,
      timer: { ...timer },
      priority,
      progress,
    };
    setEvents([...events, newEvent]);
    setEventName("");
    setTimer({ hours: 0, minutes: 0, seconds: 0 });
    setPriority("low");
    setProgress(0);
  };

  const updateTimer = (event, updatedTimer) => {
    const updatedEvents = events.map(ev =>
      ev === event ? { ...ev, timer: updatedTimer } : ev
    );
    setEvents(updatedEvents);
  };

  const deleteEvent = (eventToDelete) => {
    const updatedEvents = events.filter(event => event !== eventToDelete);
    setEvents(updatedEvents);
    setModalActive(false);
    setEventDate("");
    setEventName("");
    setTimer({ hours: 0, minutes: 0, seconds: 0 });
    setPriority("low");
    setProgress(0);
  };

  const changeMonth = (direction) => {
    const newDate = new Date(currDate.setMonth(currMonth + direction));
    setCurrDate(newDate);
  };

  return (
    <div className="container">
      <header>
        <p className="current-date">{`${months[currMonth]} ${currYear}`}</p>
        <div className="icons">
          <div id="prev" className="icon" onClick={() => changeMonth(-1)}>
            <i className="fa-solid fa-chevron-left"></i>
          </div>
          <div id="next" className="icon" onClick={() => changeMonth(1)}>
            <i className="fa-solid fa-chevron-right"></i>
          </div>
        </div>
      </header>
      <div className="calendar">
        <ul className="weeks">
          <li>Sun</li>
          <li>Mon</li>
          <li>Tue</li>
          <li>Wed</li>
          <li>Thu</li>
          <li>Fri</li>
          <li>Sat</li>
        </ul>
        <div className="days">{createCalendarDays()}</div>
      </div>
      {modalActive && (
        <div id="eventModal" className="modal active">
          <span className="close-btn" onClick={closeModal}>
            X
          </span>
          <h3>Events for {eventDate}</h3>
          <div className="event-list">
            {selectedEvents.map((event, index) => (
              <div key={index} className="event">
                <p className="event-name">{`Event: ${event.name}`}</p>

                <span className={`Priority ${event.priority}`}>Priority: {event.priority}</span>
                
                {event.timer && (
                  <Timer
                    initialTime={event.timer}
                    onUpdate={(updatedTimer) => updateTimer(event, updatedTimer)}
                  />
                )}
                <button
                  className="delete-btn"
                  onClick={() => deleteEvent(event)} // Delete event
                >
                  Delete Task
                </button>
              </div>
            ))}
          </div>
          <form id="eventForm" onSubmit={addEvent}>
            <label htmlFor="eventName">Add New Task:</label>
            <input
              type="text"
              id="eventName"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="Task name"
            />
            <label htmlFor="priority">Priority:</label>
            <select
              id="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            
            <div className="timer-inputs">
              <input
                type="number"
                min="0"
                placeholder="hrs"
                onChange={(e) => setTimer({ ...timer, hours: +e.target.value })}
              />
              <input
                type="number"
                min="0"
                placeholder="mins"
                onChange={(e) => setTimer({ ...timer, minutes: +e.target.value })}
              />
              <input
                type="number"
                min="0"
                placeholder="secs"
                onChange={(e) => setTimer({ ...timer, seconds: +e.target.value })}
              />
            </div>
            <button type="submit" id="add-event">Add Task</button>
          </form>
        </div>
      )}
    </div>
  );
};

const Timer = ({ initialTime, onUpdate }) => {
  const [time, setTime] = useState(initialTime);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    let interval;
    if (running) {
      interval = setInterval(() => {
        setTime((prev) => {
          const updatedTime = {
            hours: prev.hours,
            minutes: prev.minutes,
            seconds: prev.seconds - 1,
          };
          if (updatedTime.seconds < 0) {
            updatedTime.seconds = 59;
            updatedTime.minutes -= 1;
          }
          if (updatedTime.minutes < 0) {
            updatedTime.minutes = 59;
            updatedTime.hours -= 1;
          }
          if (updatedTime.hours < 0) {
            clearInterval(interval);
            return prev;
          }
          onUpdate(updatedTime);
          return updatedTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [running, onUpdate]);

  return (
    <div className="timer">
      <span>{`${time.hours}h ${time.minutes}m ${time.seconds}s`}</span>
      <div className="timer-controls">
        <button onClick={() => setRunning(true)}>Start</button>
        <button onClick={() => setRunning(false)}>Stop</button>
        <button
          onClick={() => {
            setRunning(false);
            setTime(initialTime);
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default App;
