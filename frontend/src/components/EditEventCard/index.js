import React from "react";
import { FaEdit, FaTrash } from "react-icons/fa";

const EditEventCard = ({ event }) => {
  const handleEdit = () => {
    console.log("Editing event:", event.id);
  };

  const handleDelete = async () => {
    try {
      await fetch(`http://localhost:3001/api/events/${event.id}`, { method: "DELETE" });
      alert("Event deleted");
      window.location.reload();
    } catch (error) {
      console.error("Failed to delete event:", error);
    }
  };

  return (
    <div className="event-card">
      <h3>{event.name}</h3>
      <p>{event.description}</p>
      <div className="event-actions">
        <FaEdit onClick={handleEdit} />
        <FaTrash onClick={handleDelete} />
      </div>
    </div>
  );
};

export default EditEventCard;
