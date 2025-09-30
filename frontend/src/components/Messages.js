// components/Messages.js
import React from "react";
import "../css/Messages.css"

const Messages = ({ checkins }) => {
  return (
    <div className="messages">
      <h3>Project Activity</h3>
      {checkins && checkins.length > 0 ? (
        <div className="checkins-list">
          {checkins.map((checkin) => (
            <div key={checkin._id} className="checkin-item">
              <div className="checkin-header">
                <span className="user">{checkin.user?.username || "Unknown"}</span>
                <span className="version">v{checkin.version}</span>
                <span className="date">
                  {new Date(checkin.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="checkin-message">{checkin.message}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>No activity yet.</p>
      )}
    </div>
  );
};

export default Messages;