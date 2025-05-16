// --- FRONTEND: React Component ---

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './index.css';

const EditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState({});
  const [poster, setPoster] = useState(null);
  const [managers, setManagers] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [managerSearchResults, setManagerSearchResults] = useState([]);
  const [volunteerSearchResults, setVolunteerSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const convertTo24HourFormat = (time) => {
    if (!time) return '';
    if (/^\d{2}:\d{2}$/.test(time)) return time;
    const match = time.match(/(\d+):(\d+) (\w+)/);
    if (!match) return time;
    const [hour, minute, period] = match.slice(1);
    return `${period === 'PM' && hour !== '12' ? +hour + 12 : hour}:${minute}`;
  };

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`http://localhost:3001/api/events/${id}`);
        setEvent({
          ...res.data,
          date: res.data.date ? new Date(res.data.date).toISOString().split('T')[0] : '',
          startTime: res.data.startTime ? convertTo24HourFormat(res.data.startTime) : '',
          endTime: res.data.endTime ? convertTo24HourFormat(res.data.endTime) : '',
        });
        setManagers(res.data.managers || []);
        setVolunteers(res.data.volunteers || []);
      } catch (err) {
        console.error('Failed to fetch event:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const handleChange = (e) => {
    setEvent({ ...event, [e.target.name]: e.target.value });
  };

  const handlePosterChange = (e) => {
    const file = e.target.files[0];
    setPoster(file);
  };

  const searchManagers = async (query) => {
    if (!query) return;
    try {
      const res = await axios.get(`http://localhost:3001/api/users/managers?search=${query}`);
      setManagerSearchResults(res.data);
    } catch (err) {
      console.error('Failed to search managers:', err);
    }
  };

  const searchVolunteers = async (query) => {
    if (!query) return;
    try {
      const res = await axios.get(`http://localhost:3001/api/users/volunteers?search=${query}`);
      setVolunteerSearchResults(res.data);
    } catch (err) {
      console.error('Failed to search volunteers:', err);
    }
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

  const removeManager = (id) => {
    setManagers(managers.filter((m) => m._id !== id));
  };

  const removeVolunteer = (id) => {
    setVolunteers(volunteers.filter((v) => v._id !== id));
  };

  const handleSave = async () => {
  setLoading(true);
  try {
    const formData = new FormData();
    Object.entries(event).forEach(([key, value]) => {
      formData.append(key, value);
    });

    if (poster) {
      formData.append('poster', poster);
    }

    // Append managers and volunteers correctly
    managers.forEach((m) => {
      formData.append('managers[]', m._id || m);  // Handles both full object or just ID
    });
    volunteers.forEach((v) => {
      formData.append('volunteers[]', v._id || v);
    });

    await axios.put(`http://localhost:3001/api/events/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    alert('Event updated successfully!');
    navigate('/dashboard');
  } catch (err) {
    console.error('Failed to update event:', err);
    alert('Failed to update event.');
  } finally {
    setLoading(false);
  }
};

  
  

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="edit-event">
      <h2>Edit Event</h2>
      <input name="name" value={event.name || ''} onChange={handleChange} placeholder="Event Name" />
      <textarea name="description" value={event.description || ''} onChange={handleChange} placeholder="Description" />
      <input name="date" type="date" value={event.date || ''} onChange={handleChange} />
      <input name="startTime" type="time" value={event.startTime || ''} onChange={handleChange} />
      <input name="endTime" type="time" value={event.endTime || ''} onChange={handleChange} />
      <input name="venue" value={event.venue || ''} onChange={handleChange} placeholder="Venue" />
      <input name="club" value={event.club || ''} onChange={handleChange} placeholder="Club" />
      <input name="department" value={event.department || ''} onChange={handleChange} placeholder="Department" />
      <input name="status" value={event.status || ''} onChange={handleChange} placeholder="Status" />
      <h3>Poster</h3>
      {event._id && event.poster && event.posterContentType && (
        <img
          src={`data:${event.posterContentType};base64,${event.poster}`}
          alt="Poster"
          style={{ maxWidth: '200px' }}
        />
      )}
      <input type="file" accept="image/*" onChange={handlePosterChange} />

      <h3>Managers</h3>
      <div className="tag-container">
        {managers.map((m) => (
          <div key={m._id} className="tag">
            {m.name}<button onClick={() => removeManager(m._id)}>✕</button>
          </div>
        ))}
      </div>
      <input type="text" placeholder="Search Managers" onChange={(e) => searchManagers(e.target.value)} />
      <div className="search-results">
        {managerSearchResults.map((user) => (
          <div key={user._id} className="result">
            {user.name}<button onClick={() => addManager(user)}>+</button>
          </div>
        ))}
      </div>

      <h3>Volunteers</h3>
      <div className="tag-container">
        {volunteers.map((v) => (
          <div key={v._id} className="tag">
            {v.name}<button onClick={() => removeVolunteer(v._id)}>✕</button>
          </div>
        ))}
      </div>
      <input type="text" placeholder="Search Volunteers" onChange={(e) => searchVolunteers(e.target.value)} />
      <div className="search-results">
        {volunteerSearchResults.map((user) => (
          <div key={user._id} className="result">
            {user.name}<button onClick={() => addVolunteer(user)}>+</button>
          </div>
        ))}
      </div>

      <button className="save-btn" onClick={handleSave} disabled={loading}>Save</button>
    </div>
  );
};

export default EditEvent;





