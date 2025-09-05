import React from "react";
import "../css/ProfilePreview.css"; 

const ProfilePreview = ({ profile }) => {
  if (!profile) return null; 

  return (
    <div className="profile-preview">
      <img
        src={profile.image || "/assets/profile.png"}
        alt={profile.name}
        className="profile-preview-image"
      />
      <div className="profile-preview-info">
        <h3 className="profile-preview-name">{profile.name}</h3>
        <p className="profile-preview-bio">{profile.bio}</p>
        {profile.link && (
          <a
            href={profile.link}
            target="_blank"
            rel="noopener noreferrer"
            className="profile-preview-link"
          >
            View Profile
          </a>
        )}
      </div>
    </div>
  );
};

export default ProfilePreview;
