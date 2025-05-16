import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './index.css';

const AdminList = () => {
  const [admins, setAdmins] = useState([]);
  const [filteredAdmins, setFilteredAdmins] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdmins = async () => {
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
          const adminList = data.filter(user => user.role === 'admin');
          setAdmins(adminList);
          setFilteredAdmins(adminList);
        } else {
          throw new Error('Unexpected data format');
        }
      } catch (error) {
        console.error('Error fetching admins:', error.message);
        setError(error.message);
      }
    };

    fetchAdmins();
  }, []);

  // Filter admins based on search term
  useEffect(() => {
    const filtered = admins.filter(admin =>
      admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredAdmins(filtered);
  }, [searchTerm, admins]);

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

      setAdmins(prevAdmins => prevAdmins.filter(admin => admin._id !== id));
    } catch (error) {
      console.error('Error updating role:', error.message);
    }
  };

  return (
    <div className="admin-list-container">
      <h2 style={{ color: 'white' }}>Admins</h2>
      <input
        type="text"
        placeholder="Search admins..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-bar"
      />
      {error && <p className="error-message">{error}</p>}
      <div className="admin-box-container">
        {filteredAdmins.slice(0, 4).map(admin => (
          <div key={admin._id} className="admin-box">
            <h3>{admin.name}</h3>
            <p>{admin.email}</p>
            <span className="delete-icon" onClick={() => handleDelete(admin._id)}>🗑</span>
          </div>
        ))}
      </div>
      {filteredAdmins.length > 4 && (
        <button className="see-more-btn" onClick={() => navigate('/all-admins')}>See More Admins</button>
      )}
    </div>
  );
};

export default AdminList;
