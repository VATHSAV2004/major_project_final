import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './index.css';

const VolunteerList = () => {
  const [volunteers, setVolunteers] = useState([]);
  const [filteredVolunteers, setFilteredVolunteers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVolunteers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3001/volunteers', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();

        if (Array.isArray(data)) {
          setVolunteers(data);
          setFilteredVolunteers(data);
        } else {
          throw new Error('Unexpected data format');
        }
      } catch (error) {
        console.error('Error fetching volunteers:', error.message);
        setError(error.message);
      }
    };

    fetchVolunteers();
  }, []);

  useEffect(() => {
    const filtered = volunteers.filter(volunteer =>
      volunteer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      volunteer.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredVolunteers(filtered);
  }, [searchTerm, volunteers]);

  return (
    <div className="volunteer-list-container">
      <h2 style={{ color: 'white' }}>Volunteers</h2>
      <input
        type="text"
        placeholder="Search volunteers..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-bar"
      />
      {error && <p className="error-message">{error}</p>}
      <div className="volunteer-box-container">
        {filteredVolunteers.map(volunteer => (
          <div key={volunteer._id} className="volunteer-box">
            <h3>{volunteer.name}</h3>
            <p>{volunteer.email}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VolunteerList;
