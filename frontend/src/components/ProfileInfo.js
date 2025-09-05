import React from "react";
import "../css/ProfileInfo.css"

const ProfileInfo = ({ user, onEdit }) => {
  return (
    <div className="profile-info-card">
      <div className="profile-header">
        <div className="avatar">
          {user.profilePic ? (
            <img src={user.profilePic} alt="Profile" />
          ) : (
            <div className="avatar-placeholder1">
              {user.name.charAt(0)}{user.surname.charAt(0)}
            </div>
          )}
        </div>
        <h2>{user.name} {user.surname}</h2>
        <p className="username">@{user.username}</p>
      </div>

      <div className="profile-details">
        <div className="detail-item">
          <span className="label">Email</span>
          <span className="value">{user.email}</span>
        </div>
        
        <div className="detail-item">
          <span className="label">Organization</span>
          <span className="value">{user.organization}</span>
        </div>
        
        <div className="detail-item">
          <span className="label">About</span>
          <p className="value about">{user.about}</p>
        </div>
      </div>

      <button className="edit-profile-btn" onClick={onEdit}>
        Edit Profile
      </button>
    </div>
  );
};

export default ProfileInfo;