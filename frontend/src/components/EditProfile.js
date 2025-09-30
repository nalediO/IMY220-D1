import React, { useState } from "react";
import { userService } from "../services/api";
import "../css/EditProfile.css";

const EditProfile = ({ user, onCancel, onUpdate }) => {
  const [formData, setFormData] = useState(user);
  const [preview, setPreview] = useState(user.profileImage || null);
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      setFormData({ ...formData, profileImage: url });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updatedUser = await userService.updateProfile(user._id, formData);
      onUpdate(updatedUser); // Update Profile.js state
    } catch (err) {
      console.error("Profile update failed:", err);
      alert("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="edit-profile-form" onSubmit={handleSubmit}>
      <h2>Edit Profile</h2>

      <div className="edit-form-group">
        <label>Profile Picture</label>
        <div className="profile-picture-upload">
          <div className="avatar-preview">
            {preview ? (
              <img src={preview} alt="Preview" />
            ) : (
              <div className="avatar-placeholder">
                {formData.firstName?.charAt(0)}
                {formData.lastName?.charAt(0)}
              </div>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="edit-file-input"
          />
        </div>
      </div>

      <div className="edit-form-row">
        <div className="edit-form-group">
          <label>First Name</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName || ""}
            onChange={handleChange}
            required
          />
        </div>
        <div className="edit-form-group">
          <label>Last Name</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName || ""}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="edit-form-group">
        <label>Username</label>
        <input
          type="text"
          name="username"
          value={formData.username || ""}
          onChange={handleChange}
          required
        />
      </div>

      <div className="edit-form-group">
        <label>Email</label>
        <input
          type="email"
          name="email"
          value={formData.email || ""}
          onChange={handleChange}
          required
        />
      </div>

      <div className="edit-form-group">
        <label>About</label>
        <textarea
          name="bio"
          value={formData.bio || ""}
          onChange={handleChange}
          rows="4"
          placeholder="Tell us about yourself..."
        />
      </div>

      <div className="edit-form-actions">
        <button type="submit" className="edit-save-btn" disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
        <button type="button" onClick={onCancel} className="edit-cancel-btn">
          Cancel
        </button>
      </div>
    </form>
  );
};

export default EditProfile;
