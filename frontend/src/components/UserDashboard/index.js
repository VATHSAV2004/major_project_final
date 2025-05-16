import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import "./index.css"
const UserDashboard = () => {
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem('userId');  // Assuming the user ID is stored in localStorage

  useEffect(() => {
    const fetchRegisteredEvents = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/registered-events/${userId}`);
        setRegisteredEvents(response.data);
      } catch (error) {
        console.error('Failed to fetch registered events:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchRegisteredEvents();
    }
  }, [userId]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="user-dashboard">
      <h1>User Dashboard</h1>
      <p>Hello, User</p>

      <h3>Registered Events</h3>
      <div className="events-list">
        {registeredEvents.length > 0 ? (
          registeredEvents.map((event, index) => (
            <div key={index} className="event-card">
              <h4>{event.name}</h4>
              <p>Status: {event.status}</p>
            </div>
          ))
        ) : (
          <p>No events registered yet.</p>
        )}
      </div>

      {registeredEvents.length > 0 && (
        <Link to="/all-registered-events" className="see-more">
          See More
        </Link>
      )}
    </div>
  );
};

export default UserDashboard;
