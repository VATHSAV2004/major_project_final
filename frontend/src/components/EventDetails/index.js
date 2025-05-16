import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import SliderComponent from "../Carosel";
import "./index.css";

const EventDetails = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("loading"); // <-- Important change
  const [showModal, setShowModal] = useState(false);
  const [screenshot, setScreenshot] = useState(null);
  const [recommendedEvents, setRecommendedEvents] = useState([]);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        console.log("Fetching event details...");
        const response = await axios.get(`http://localhost:3001/api/events/${id}`);
        console.log("Event details fetched:", response.data);
        setEvent(response.data);

        console.log("Fetching recommendations...");
        const recommendationResponse = await axios.get(
          `http://localhost:5000/api/events/recommend/${response.data.name}`
        );
        setRecommendedEvents(recommendationResponse.data);
        console.log("Recommended events fetched:", recommendationResponse.data);

        if (userId) {
          console.log("Fetching registration status for user:", userId);
          const res = await axios.get(
            `http://localhost:3001/api/registration/status/${id}/${userId}`
          );
          console.log("Registration status response:", res.data);
          setStatus(res.data.status); // status = "not-registered", "registered", or "approved"
        } else {
          console.log("No userId found in localStorage");
          setStatus("not-registered");
        }
      } catch (err) {
        console.error("Error during fetching:", err);
        setError("Failed to fetch event details.");
        setStatus("error");
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [id, userId]);

  const handleRegister = async () => {
    if (!screenshot) {
      alert("Please upload a payment screenshot before submitting!");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result.split(",")[1];

      try {
        const res = await axios.post(
          "http://localhost:3001/api/registration/register",
          {
            eventId: id,
            userId,
            screenshot: base64String,
            contentType: screenshot.type,
          },
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        alert(res.data.msg);
        setStatus("registered"); // After registering
        setShowModal(false);
        setScreenshot(null);
      } catch (err) {
        console.error("Registration Error:", err.response?.data?.msg || err.message);
        alert(err.response?.data?.msg || "Registration failed");
      }
    };

    reader.readAsDataURL(screenshot);
  };

  if (loading) return <div className="loading">Loading event details...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!event) return <div>No event found.</div>;

  console.log("Current userId:", userId);
  console.log("Current registration status:", status);

  return (
    <>
    <div className="event-details">
      <h2>{event.name}</h2>

      {event.poster && (
        <img
          src={`data:${event.posterContentType};base64,${event.poster}`}
          alt="Event Poster"
          className="event-poster"
        />
      )}

      <p><strong>Description:</strong> {event.description}</p>
      <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
      <p><strong>Time:</strong> {`${event.startTime} - ${event.endTime}`}</p>
      <p><strong>Venue:</strong> {event.venue}</p>
      <p><strong>Club:</strong> {event.club}</p>
      <p><strong>Department:</strong> {event.department}</p>
      <p><strong>Status:</strong> {event.status}</p>

      <div className="people-section">
        <h3>Managers</h3>
        {event.managers?.length ? (
          <ul>{event.managers.map((m) => <li key={m._id}>{m.name}</li>)}</ul>
        ) : (
          <p>No managers assigned.</p>
        )}

        <h3>Volunteers</h3>
        {event.volunteers?.length ? (
          <ul>{event.volunteers.map((v) => <li key={v._id}>{v.name}</li>)}</ul>
        ) : (
          <p>No volunteers assigned.</p>
        )}
      </div>

      {/* Register Section */}
      {userId && (
        <div className="register-section">
          <h3>Registration Status</h3>
          {status === "loading" && <p>Checking registration status...</p>}
          {status === "not-registered" && (
            <button onClick={() => setShowModal(true)}>Register</button>
          )}
          {status === "registered" && (
            <p style={{ color: "orange", fontWeight: "bold" }}>
              ❌ Registration Pending Approval
            </p>
          )}
          {status === "approved" && (
            <p style={{ color: "green", fontWeight: "bold" }}>
              ✅ Registration Approved
            </p>
          )}
          {status === "error" && (
            <p style={{ color: "red", fontWeight: "bold" }}>
              ⚠️ Failed to fetch registration status
            </p>
          )}
        </div>
      )}

      {/* Modal for Payment Screenshot Upload */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Upload Payment Screenshot</h3>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setScreenshot(e.target.files[0])}
            />
            <div className="modal-buttons">
              <button onClick={handleRegister}>Submit Registration</button>
              <button onClick={() => { setShowModal(false); setScreenshot(null); }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Carousel for Recommended Events */}
      
    </div>
    <h3>Recommended Events</h3>
      <SliderComponent events={recommendedEvents} />
    </>
  );
};

export default EventDetails;
