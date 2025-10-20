import React from "react";
import "../css/ProfileInfo.css";

const ProfileInfo = ({ user, onEdit }) => {
  if (!user) return null;

  const firstLetter = user.firstName?.charAt(0) || "";
  const lastLetter = user.lastName?.charAt(0) || "";

  const birthday = user.birthday ? new Date(user.birthday).toLocaleDateString() : "N/A";
  const programmingLanguages = user.programmingLanguages?.length
    ? user.programmingLanguages.join(", ")
    : "None";

    console.log(user);

  return (
    <div className="profile-info-card">
      <div className="profile-header">
        <div className="avatar">
          {user.profileImage ? (
            <img
              src={`http://localhost:5000/${user.profileImage.replace(/^\/uploads\//, 'uploads/')}`}
              alt="Profile"
            />
          ) : (
            <div className="avatar-placeholder1">{firstLetter}{lastLetter}</div>
          )}
        </div>
        <h2>{user.firstName || "N/A"} {user.lastName || ""}</h2>
        <p className="username">@{user.username || "unknown"}</p>
      </div>

      <div className="profile-details">
        <div className="detail-item">
          <span className="label">Email: </span>
          <span className="value">{user.email || "N/A"}</span>
        </div>

        <div className="detail-item">
          <span className="label">Birthday: </span>
          <span className="value">{birthday}</span>
        </div>

        <div className="detail-item">
          <span className="label">About: </span>
          <p className="value about">{user.bio || "No bio available."}</p>
        </div>

        <div className="detail-item">
          <span className="label">Programming Languages: </span>
          <span className="value">{programmingLanguages}</span>
        </div>
      </div>

      <button className="edit-profile-btn" onClick={onEdit}>
        Edit Profile
      </button>
    </div>
  );
};

export default ProfileInfo;
