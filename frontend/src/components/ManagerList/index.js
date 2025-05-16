import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './index.css';

const ManagerList = () => {
  const [managers, setManagers] = useState([]);
  const [filteredManagers, setFilteredManagers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3001/users', {
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
          const managerList = data.filter(user => user.role === 'manager');
          setManagers(managerList);
          setFilteredManagers(managerList);
        } else {
          throw new Error('Unexpected data format');
        }
      } catch (error) {
        console.error('Error fetching managers:', error.message);
        setError(error.message);
      }
    };

    fetchManagers();
  }, []);

  // Filter managers based on search term
  useEffect(() => {
    const filtered = managers.filter(manager =>
      manager.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      manager.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredManagers(filtered);
  }, [searchTerm, managers]);

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/users/${id}/updateRole`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: 'user' }),
      });

      if (!response.ok) {
        throw new Error('Failed to update role');
      }

      setManagers(prevManagers => prevManagers.filter(manager => manager._id !== id));
    } catch (error) {
      console.error('Error updating role:', error.message);
    }
  };

  return (
    <div className="manager-list-container">
      <h2 style={{ color: 'white' }}>Managers</h2>

      <input
        type="text"
        placeholder="Search managers..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-bar"
      />
      {error && <p className="error-message">{error}</p>}
      <div className="manager-box-container">
        {filteredManagers.slice(0, 4).map(manager => (
          <div key={manager._id} className="manager-box">
            <h3>{manager.name}</h3>
            <p>{manager.email}</p>
            <span className="delete-icon" onClick={() => handleDelete(manager._id)}>🗑</span>
          </div>
        ))}
      </div>
      {filteredManagers.length > 4 && (
        <button className="see-more-btn" onClick={() => navigate('/all-managers')}>See More Managers</button>
      )}
    </div>
  );
};

export default ManagerList;
