import React, { useState } from "react";
import { friendService } from "../services/api";
import { useNavigate } from "react-router-dom";
import "../css/UserCard.css";




const UserCard = ({ user, currentRequests, onRequestSent }) => {
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // check if there's already a pending request for this user
  const pendingRequest = currentRequests.find((req) => req.toUserId === user._id);

  const handleSendRequest = async () => {
    try {
      setLoading(true);

      let response;
      if (pendingRequest) {
        // resend request
        response = await friendService.resendFriendRequest(user._id);
      } else {
        response = await friendService.sendFriendRequest(user._id);
      }


      alert(response.message);
      onRequestSent(); // refresh parent list

    } catch (err) {
      // Get backend error message if available
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Failed to send friend request";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  const buttonText = pendingRequest ? "Resend Request" : "Send Friend Request";

  return (
    <div className="user-card" onClick={() => navigate(`/profile/${user._id}`)}>
      <img
        src={
          user.profileImage
            ? `http://localhost:5000/${user.profileImage.replace(/^\/?uploads\//, 'uploads/')}`
            : "/assets/profile.png"
        }
        alt={user.username}
        className="avatar"
      />
      <div className="user-info">
        <h4>
          {user.firstName} {user.lastName}
        </h4>
        <p>@{user.username}</p>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation(); // prevent card click
          handleSendRequest();
        }}
        disabled={loading}
      >
        {loading ? "Sending..." : buttonText}
      </button>
    </div>
  );
};

export default UserCard;
