import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const EditEvent = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [event, setEvent] = useState(state?.event || {});
  const [managers, setManagers] = useState(event.managers || []);
  const [volunteers, setVolunteers] = useState(event.volunteers || []);
  const [managerResults, setManagerResults] = useState([]);
  const [volunteerResults, setVolunteerResults] = useState([]);

  useEffect(() => {
    if (!state?.event) {
      navigate('/dashboard'); // Fallback in case no state is passed
    }
  }, [state, navigate]);

  const handleChange = (e) => {
    setEvent({ ...event, [e.target.name]: e.target.value });
  };

  // Debounce search
  const searchUsers = (query, type) => {
    if (query.length < 2) return;

    setTimeout(async () => {
      try {
        const res = await axios.get(`http://localhost:3001/api/users?search=${query}`);
        if (type === 'manager') setManagerResults(res.data);
        if (type === 'volunteer') setVolunteerResults(res.data);
      } catch (err) {
        console.error("Failed to search users:", err);
      }
    }, 300);
  };

  const addManager = (user) => {
    if (!managers.some((m) => m._id === user._id)) {
      setManagers([...managers, user]);
    }
  };

  const addVolunteer = (user) => {
    if (!volunteers.some((v) => v._id === user._id)) {
      setVolunteers([...volunteers, user]);
    }
  };

  const handleSave = async () => {
    try {
      await axios.put(`http://localhost:3001/api/events/${event._id}`, {
        ...event,
        managers,
        volunteers
      });
      navigate('/dashboard');
    } catch (err) {
      console.error("Failed to update event:", err);
    }
  };

  return (
    <div className="edit-event">
      <h2>Edit Event</h2>
      <input name="name" value={event.name || ''} onChange={handleChange} placeholder="Event Name" />
      <textarea name="description" value={event.description || ''} onChange={handleChange} placeholder="Description" />
      <input name="date" type="date" value={event.date || ''} onChange={handleChange} />
      <input name="startTime" value={event.startTime || ''} onChange={handleChange} />
      <input name="endTime" value={event.endTime || ''} onChange={handleChange} />
      <input name="venue" value={event.venue || ''} onChange={handleChange} />

      <h3>Managers</h3>
      {managers.map((m) => (
        <div key={m._id}>{m.name}</div>
      ))}
      <input onChange={(e) => searchUsers(e.target.value, 'manager')} />

      <h3>Volunteers</h3>
      {volunteers.map((v) => (
        <div key={v._id}>{v.name}</div>
      ))}
      <input onChange={(e) => searchUsers(e.target.value, 'volunteer')} />

      <button onClick={handleSave}>Save</button>
    </div>
  );
};

export default EditEvent;
