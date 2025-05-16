import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaTrash, FaCheckCircle, FaUsers } from "react-icons/fa";
import axios from "axios";
import "./index.css";

const EventsList = ({ userRole }) => {
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get("http://localhost:3001/api/events");
        setEvents(response.data);
      } catch (err) {
        console.error("Failed to fetch events:", err);
      }
    };
    fetchEvents();
  }, []);

  const handleDelete = async (eventId) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await axios.delete(`http://localhost:3001/api/events/${eventId}`);
        setEvents(events.filter((event) => event._id !== eventId));
      } catch (err) {
        console.error("Failed to delete event:", err);
      }
    }
  };

  const handleEdit = (event) => {
    navigate(`/edit-event/${event._id}`, { state: { event } });
  };

  const handleApprovalClick = (eventId) => {
    navigate(`/approval/${eventId}`);
  };

  const handleTrackAttendees = (eventId) => {
    navigate(`/track-attendees/${eventId}`);
  };

  const filteredEvents = events.filter((event) =>
    event.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="events-wrapper">
      <h2 className="events-heading" style={{color:"white"}}>Events</h2>

      {/* Search Bar */}
      <div className="search-bar-card">
        <input
          type="text"
          placeholder="Search events..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="events-container">
        {filteredEvents.slice(0, 4).map((event) => (
          <div key={event._id} className="event-card">
            <div className="event-content">
              <h3 className="event-title">{event.name || "Untitled Event"}</h3>
              <p className="event-detail">
                <strong>Date:</strong>{" "}
                {event.date
                  ? new Date(event.date).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "TBA"}
              </p>
              <p className="event-detail">
                <strong>Time:</strong>{" "}
                {event.startTime && event.endTime
                  ? `${event.startTime} - ${event.endTime}`
                  : "TBA"}
              </p>
              <p className="event-detail">
                <strong>Location:</strong> {event.venue || "TBA"}
              </p>
            </div>

            {(userRole === "admin" || userRole === "manager") && (
              <div className="event-actions">
                {/* Approval */}
                <FaCheckCircle
                  className="approval-icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleApprovalClick(event._id);
                  }}
                  style={{ cursor: "pointer", fontSize: "24px", color: "green" }}
                />

                {/* Edit */}
                <FaEdit
                  className="edit-icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(event);
                  }}
                  style={{ cursor: "pointer", fontSize: "20px" }}
                />

                {/* Delete */}
                <FaTrash
                  className="delete-icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(event._id);
                  }}
                  style={{ cursor: "pointer", fontSize: "20px" }}
                />

                {/* Track Attendees */}
                <FaUsers
                  className="track-icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTrackAttendees(event._id);
                  }}
                  style={{ cursor: "pointer", fontSize: "22px", color: "#007bff" }}
                  title="Track Attendees"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <button className="see-more" onClick={() => navigate("/events")}>
        See More
      </button>
    </div>
  );
};

export default EventsList;
