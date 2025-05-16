import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "../Header";
import EventCard from "../Card3";
import "./index.css";

const CategoryPage = () => {
  const { categoryId } = useParams();
  const [events, setEvents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 4;

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`http://localhost:3001/events/${categoryId}`);
        const data = await response.json();
        console.log("Fetched Events:", data); // ✅ Check fetched data structure
        setEvents(data);
      } catch (error) {
        console.error("Failed to fetch events:", error);
      }
    };

    fetchEvents();
  }, [categoryId]);

  // Pagination logic
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = events.slice(indexOfFirstEvent, indexOfLastEvent);

  const totalPages = Math.max(Math.ceil(events.length / eventsPerPage), 1);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
      <Header />
      <div className="category-back">
        <h3 className="category-name">{categoryId} Events</h3>
        <div className="events-list">
          {currentEvents.map((event) => (
            <EventCard
              key={event._id}
              image={event.image || "/placeholder.jpg"}
              name={event.title || event.name || "No Title"} // ✅ Adjusted to match possible API fields
              description={event.description || "No description available"}
            />
          ))}
        </div>

        {/* Pagination Controls */}
        <div className="pagination">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              className={`page-button ${currentPage === i + 1 ? "active" : ""}`}
              onClick={() => handlePageChange(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default CategoryPage;
