import React, { useState } from "react";
import { userService } from "../services/api";
import "../css/EditProfile.css";

const EditProfile = ({ user, onCancel, onSave }) => {
  const [formData, setFormData] = useState(user);
  const [preview, setPreview] = useState(user.profileImage ? `http://localhost:5000${user.profileImage}` : null);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      setProfileImageFile(file);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = new FormData();
      payload.append("firstName", formData.firstName || "");
      payload.append("lastName", formData.lastName || "");
      payload.append("username", formData.username || "");
      payload.append("email", formData.email || "");
      payload.append("birthday", formData.birthday || "");
      payload.append("bio", formData.bio || "");

      if (profileImageFile) {
        payload.append("profileImage", profileImageFile); // MUST match multer field
      }

      const updatedUser = await userService.updateProfile(user._id, payload, true); // true = send as multipart/form-data
      onSave(updatedUser);

      // Update preview after successful upload
      if (updatedUser.profileImage) {
        setPreview(`http://localhost:5000${updatedUser.profileImage}`);
        setProfileImageFile(null);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };


  console.log(formData);

  return (
    <form className="edit-profile-form" onSubmit={handleSubmit}>
      <h2>Edit Profile</h2>

      <div className="edit-form-group">
        <label>Profile Picture</label>
        <div className="profile-picture-upload">
          <div className="avatar-preview">
            {preview ? (
              <img src={preview} alt="Profile" />
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

      {/* Birthday Input */}
      <div className="edit-form-group">
        <label>Birthday</label>
        <input
          type="date"
          name="birthday"
          value={
            formData.birthday
              ? new Date(formData.birthday).toISOString().split("T")[0]
              : ""
          }
          onChange={handleChange}
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
