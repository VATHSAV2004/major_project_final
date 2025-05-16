import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./index.css";

// Modal component for showing the image
const PaymentImageModal = ({ image, onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <img
          src={`data:${image.contentType};base64,${image.screenshot}`}
          alt="Payment Screenshot"
        />
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

const Approval = () => {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/events/${eventId}`);
        setEvent(response.data);
      } catch (err) {
        console.error("Failed to fetch event details:", err);
      }
    };

    const fetchRegistrations = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/registrations/${eventId}`);
        setRegistrations(response.data);
      } catch (err) {
        console.error("Failed to fetch registrations:", err);
      }
    };

    fetchEventDetails();
    fetchRegistrations();
  }, [eventId]);


const handleApprove = async (registrationId) => {
  console.log('🔵 Approval initiated for:', registrationId);

  try {
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn('🟡 No token found in localStorage');
      alert("You need to log in first.");
      return;
    }

    const startTime = performance.now();

    const res = await axios.put(
      `http://localhost:3001/api/registration/approve/${registrationId}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const endTime = performance.now();
    console.log('🟢 Server response:', {
      status: res.status,
      data: res.data,
      time: `${(endTime - startTime).toFixed(2)}ms`
    });

    setRegistrations((prev) =>
      prev.map((r) =>
        r._id === registrationId ? { ...r, approved: true } : r
      )
    );

    if (res.data.emailSent) {
      console.log('✅ Email confirmed sent by server');
      alert("✅ Registration approved and email sent.");
    } else {
      console.warn('⚠️ Email not sent according to server response:', res.data.debug);
      alert("⚠️ Registration approved but email may not have been sent.");
    }

  } catch (err) {
    console.error('❌ Approval failed:', {
      error: err.message,
      response: err.response?.data,
      config: err.config
    });

    let errorMessage = "Failed to approve registration.";
    if (err.response) {
      errorMessage += ` Server responded: ${err.response.status} - ${JSON.stringify(err.response.data)}`;
    } else if (err.request) {
      errorMessage += " No response from server.";
    } else {
      errorMessage += ` ${err.message}`;
    }

    alert(errorMessage);
  }
};

const handleSendEmail = async (registrationId) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You need to log in first.");
      return;
    }

    const res = await axios.post(
      `http://localhost:3001/api/registration/send-email/${registrationId}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (res.data.emailSent) {
      alert("✅ Email sent successfully.");
    } else {
      alert("⚠️ Failed to send email.");
    }
  } catch (err) {
    console.error("❌ Error sending email:", err);
    alert("Error sending email.");
  }
};


const handleRemove = async (registrationId) => {
  if (window.confirm("Are you sure you want to remove this registration?")) {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You need to log in first.");
        return;
      }

      await axios.delete(
        `http://localhost:3001/api/registration/${registrationId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setRegistrations((prev) =>
        prev.filter((r) => r._id !== registrationId)
      );

      alert("Registration removed and rejection email sent.");
    } catch (err) {
      console.error("Failed to remove registration:", err);
      alert("Failed to remove registration.");
    }
  }
};


  const handleShowImage = (registration) => {
    setSelectedImage(registration);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedImage(null);
  };

  if (!event) {
    return <div>Loading...</div>;
  }

  return (
    <div className="approval-page">
      <h2>Event Approval</h2>
      <h3>{event.name}</h3>
      <p>
        <strong>Date:</strong> {new Date(event.date).toLocaleDateString("en-GB")}
      </p>
      <p>
        <strong>Time:</strong> {event.startTime} - {event.endTime}
      </p>
      <p>
        <strong>Location:</strong> {event.venue}
      </p>
      <p>
        <strong>Description:</strong> {event.description}
      </p>

      <h4>Registrations:</h4>
      {registrations.length === 0 ? (
        <p>No registrations found.</p>
      ) : (
        <div className="registrations-list">
          {registrations.map((registration) => (
            <div key={registration._id} className="registration-item">
              <p>
                <strong>User:</strong> {registration.userId.name}
              </p>
              <p>
                <strong>Email:</strong> {registration.userId.email}
              </p>
              <button onClick={() => handleShowImage(registration)}>
                Show Payment Image
              </button>
              <button
                onClick={() => handleApprove(registration._id)}
                disabled={registration.approved}
              >
                {registration.approved ? "Approved" : "Approve"}
              </button>
              <button onClick={() => handleRemove(registration._id)}>
                Remove
              </button>
              <button onClick={() => handleSendEmail(registration._id)}>
  Send Email
</button>

            </div>
          ))}
        </div>
      )}

      {showModal && selectedImage && (
        <PaymentImageModal image={selectedImage} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default Approval;
