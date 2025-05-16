import React, { useState } from "react";
import "./index.css";
import { FaThumbsUp } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const EventCard = ({ eventId, image, name, description }) => {
  const [likes, setLikes] = useState(0);
  const navigate = useNavigate();

  return (
    <div className="event-card">
      <div className="event-image-container">
        <img src={image} alt={name} className="event-image" />
      </div>
      <h3 className="event-name">{name}</h3>
      <p className="event-description">
        {description.length > 100 ? description.slice(0, 100) + '...' : description}
      </p>
      <div className="event-actions">
        <button className="like-button" onClick={() => setLikes(likes + 1)}>
          <FaThumbsUp /> {likes}
        </button>
        <button className="know-more-button" onClick={() => navigate(`/event/${eventId}`)}>
          Know More
        </button>
      </div>
    </div>
  );
};

export default EventCard;
