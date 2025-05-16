import React from "react";

const ManagerRequestCard = ({ request }) => {
  const handleAccept = async () => {
    try {
      await fetch(`/api/manager-requests/${request.id}/accept`, { method: "POST" });
      alert("Request accepted");
      window.location.reload();
    } catch (error) {
      console.error("Failed to accept request:", error);
    }
  };

  const handleReject = async () => {
    try {
      await fetch(`/api/manager-requests/${request.id}/reject`, { method: "POST" });
      alert("Request rejected");
      window.location.reload();
    } catch (error) {
      console.error("Failed to reject request:", error);
    }
  };

  return (
    <div className="manager-request-card">
      <p>{request.managerName}</p>
      <div>
        <button onClick={handleAccept} className="accept-btn">Accept</button>
        <button onClick={handleReject} className="reject-btn">Reject</button>
      </div>
    </div>
  );
};

export default ManagerRequestCard;
