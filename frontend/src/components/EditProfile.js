import React, { useState } from "react";
import "../css/EditProfile.css";

const EditProfile = ({ user, onSave, onCancel }) => {
  const [formData, setFormData] = useState(user);
  const [preview, setPreview] = useState(user.profilePic || null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      setFormData({ ...formData, profilePic: url });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
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
                {formData.name.charAt(0)}{formData.surname.charAt(0)}
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
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="edit-form-group">
          <label>Surname</label>
          <input
            type="text"
            name="surname"
            value={formData.surname}
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
          value={formData.username}
          onChange={handleChange}
          required
        />
      </div>

      <div className="edit-form-group">
        <label>Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>

      <div className="edit-form-group">
        <label>Organization</label>
        <input
          type="text"
          name="organization"
          value={formData.organization}
          onChange={handleChange}
        />
      </div>

      <div className="edit-form-group">
        <label>About</label>
        <textarea
          name="about"
          value={formData.about}
          onChange={handleChange}
          rows="4"
          placeholder="Tell us about yourself..."
        />
      </div>

      <div className="edit-form-actions">
        <button type="submit" className="edit-save-btn">Save Changes</button>
        <button type="button" onClick={onCancel} className="edit-cancel-btn">Cancel</button>
      </div>
    </form>
  );
};

export default EditProfile;
