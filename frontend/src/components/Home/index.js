import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SliderComponent from '../Carosel';
import "./index.css";

const Home = () => {
  const [eventsByClub, setEventsByClub] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('http://localhost:3001/events-by-club'); // updated URL
        const data = await response.json();
        setEventsByClub(data);
      } catch (error) {
        console.error("Failed to fetch events:", error);
      }
    };

    fetchEvents();
  }, []);

  return (
    <div className="mainback">
      {eventsByClub.map((club) => (
        <div key={club._id}>
          <h3 className="departmentname">{club._id} Events</h3>
          <SliderComponent events={club.events.slice(0, 7)} />
          {club.events?.length > 0 && (
            <Link to={`/events/${club._id}`} className="view-more">
              View More
            </Link>
          )}
        </div>
      ))}
    </div>
  );
};

export default Home;
