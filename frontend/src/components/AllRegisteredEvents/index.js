import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './index.css'; // Scoped CSS

const AllRegisteredEvents = () => {
  const [allRegisteredEvents, setAllRegisteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 5;

  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchAllRegisteredEvents = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/all-registered-events/${userId}`);
        setAllRegisteredEvents(response.data);
      } catch (error) {
        console.error('Failed to fetch all registered events:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchAllRegisteredEvents();
    }
  }, [userId]);

  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = allRegisteredEvents.slice(indexOfFirstEvent, indexOfLastEvent);
  const totalPages = Math.ceil(allRegisteredEvents.length / eventsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) return <div className="are-loading">Loading...</div>;

  return (
    <div className="are-container">
      <h1 className="are-title">All Registered Events</h1>
      <div className="are-list">
        {currentEvents.length > 0 ? (
          currentEvents.map((event, index) => (
            <div key={index} className="are-card">
              <h4>{event.name}</h4>
              <p>Status: <span className={event.status === 'Approved' ? 'are-approved' : 'are-pending'}>{event.status}</span></p>
            </div>
          ))
        ) : (
          <p>No events registered yet.</p>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="are-pagination">
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              className={`are-page-btn ${currentPage === i + 1 ? 'active' : ''}`}
              onClick={() => paginate(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllRegisteredEvents;
