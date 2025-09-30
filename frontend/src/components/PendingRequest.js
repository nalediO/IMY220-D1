// src/components/PendingRequests.js
import React, { useEffect, useState } from "react";
import { friendService } from "../services/api";

const PendingRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await friendService.getRequests();
        setRequests(data || []);
      } catch (err) {
        console.error("Error fetching friend requests:", err);
        setError("Failed to load friend requests.");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleAccept = async (id) => {
    try {
      await friendService.acceptFriendRequest(id);
      setRequests((prev) => prev.filter((r) => r._id !== id));

      if (onAcceptedOrRejected) onAcceptedOrRejected();
    } catch (err) {
      console.error("Error accepting request:", err);
      alert("Could not accept request.");
    }
  };

  const handleReject = async (id) => {
    try {
      await friendService.rejectFriendRequest(id);
      setRequests((prev) => prev.filter((r) => r._id !== id));
      if (onAcceptedOrRejected) onAcceptedOrRejected();
    } catch (err) {
      console.error("Error rejecting request:", err);
      alert("Could not reject request.");
    }
  };

  if (loading) return <p>Loading requests...</p>;
  if (error) return <p>{error}</p>;
  if (requests.length === 0) return <p>No pending friend requests.</p>;

  return (
    <div className="pending-requests">
      <h3>Pending Friend Requests</h3>
      <ul>
        {requests.map((req) => (
          <li key={req._id}>
            {req.from?.username || "Unknown user"}
            <button onClick={() => handleAccept(req._id)}>Accept</button>
            <button onClick={() => handleReject(req._id)}>Reject</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PendingRequests;
