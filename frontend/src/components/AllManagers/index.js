import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './index.css';

const AllManagers = () => {
  const [managers, setManagers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const managersPerPage = 6;
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
          throw new Error('Failed to fetch managers');
        }

        const data = await response.json();
        if (Array.isArray(data)) {
          const managerList = data.filter(user => user.role === 'manager');
          setManagers(managerList);
        }
      } catch (error) {
        console.error('Error fetching managers:', error.message);
      }
    };

    fetchManagers();
  }, []);

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

  const lastIndex = currentPage * managersPerPage;
  const firstIndex = lastIndex - managersPerPage;
  const currentManagers = managers.slice(firstIndex, lastIndex);
  const totalPages = Math.ceil(managers.length / managersPerPage);

  return (
    <div className="manager-list-container">
      <h2>All Managers</h2>
      <div className="manager-box-container">
        {currentManagers.map(manager => (
          <div key={manager._id} className="manager-box">
            <h3>{manager.name}</h3>
            <p>{manager.email}</p>
            <span className="delete-icon" onClick={() => handleDelete(manager._id)}>🗑</span>
          </div>
        ))}
      </div>
      <div className="pagination">
        <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>Prev</button>
        <span> Page {currentPage} of {totalPages} </span>
        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>Next</button>
      </div>
      <button className="back-btn" onClick={() => navigate('/')}>Back to Home</button>
    </div>
  );
};

export default AllManagers;
