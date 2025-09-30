import React from "react";
import "../css/FriendsList.css";

const FriendsList = ({ friends = [] }) => {
  if (!friends || friends.length === 0) {
    return (
      <div className="empty-state">
        <p>No friends yet. Connect with other users!</p>
      </div>
    );
  }

  return (
    <div className="friends-list">
      <h3>Friends ({friends.length})</h3>
      <div className="friends-grid">
        {friends.map(friend => {
          // Safely derive display name
          const displayName =
            friend.username || `${friend.firstName || ""} ${friend.lastName || ""}`.trim();
          return (
            <div key={friend._id || friend.id} className="friend-card">
              <div className="friend-avatar">{displayName?.charAt(0)}</div>
              <div className="friend-info">
                <h4>{displayName}</h4>
                <p>{friend.mutualProjects || 0} mutual projects</p>
              </div>
              <button className="friend-action-btn">Message</button>
            </div>
          );
        })}
      </div>
    </div>
  );
};


export default FriendsList;