import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './index.css';

const UpdateUserToManager = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
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
          const userList = data.filter(user => user.role === 'user');
          setUsers(userList);
          setFilteredUsers(userList);
        } else {
          throw new Error('Unexpected data format');
        }
      } catch (error) {
        console.error('Error fetching users:', error.message);
        setError(error.message);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const filtered = users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const handlePromote = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/users/${id}/updateRole`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: 'manager' }),
      });

      if (!response.ok) {
        throw new Error('Failed to update role');
      }

      setUsers(prevUsers => prevUsers.filter(user => user._id !== id));
    } catch (error) {
      console.error('Error updating role:', error.message);
    }
  };

  return (
    <div className="manager-list-container">
      <h2 style={{ color: 'white' }}>Add Managers</h2>
      <input
        type="text"
        placeholder="Search users..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-bar"
      />
      {error && <p className="error-message">{error}</p>}
      <div className="manager-box-container">
        {filteredUsers.slice(0, 4).map(user => (
          <div key={user._id} className="manager-box">
            <h3>{user.name}</h3>
            <p>{user.email}</p>
            <span className="add-icon" onClick={() => handlePromote(user._id)}>➕</span>
          </div>
        ))}
      </div>
      {filteredUsers.length > 4 && (
        <button className="see-more-btn" onClick={() => navigate('/all-users')}>See More Users</button>
      )}
    </div>
  );
};

export default UpdateUserToManager;