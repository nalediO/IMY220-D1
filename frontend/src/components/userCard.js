// components/UserCard.js
import React, { useState } from "react";
import { friendService } from "../services/api";
import "../css/UserCard.css";

const UserCard = ({ user, currentRequests, onRequestSent }) => {
  const [loading, setLoading] = useState(false);

  // check if there's already a pending request for this user
  const pendingRequest = currentRequests.find((req) => req.toUserId === user._id);

  const handleSendRequest = async () => {
    try {
      setLoading(true);
      if (pendingRequest) {
        // resend request
        await friendService.resendFriendRequest(user._id);
      } else {
        await friendService.sendFriendRequest(user._id);
      }
      onRequestSent(); // refresh parent list
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const buttonText = pendingRequest ? "Resend Request" : "Send Friend Request";

  return (
    <div className="user-card">
      <img
        src={user.profileImage || "/default-avatar.png"}
        alt={user.username}
        className="avatar"
      />
      <div className="user-info">
        <h4>
          {user.firstName} {user.lastName}
        </h4>
        <p>@{user.username}</p>
      </div>
      <button onClick={handleSendRequest} disabled={loading}>
        {loading ? "Sending..." : buttonText}
      </button>
    </div>
  );
};

export default UserCard;