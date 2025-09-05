import React from "react";
import "../css/FriendsList.css";

const FriendsList = ({ friends }) => {
  if (friends.length === 0) {
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
        {friends.map(friend => (
          <div key={friend.id} className="friend-card">
            <div className="friend-avatar">
              {friend.name.charAt(0)}
            </div>
            <div className="friend-info">
              <h4>{friend.name}</h4>
              <p>{friend.mutualProjects} mutual projects</p>
            </div>
            <button className="friend-action-btn">Message</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FriendsList;