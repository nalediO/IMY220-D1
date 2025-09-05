import React, { useState } from "react";
import "../css/EditProject.css"; 

const EditProject = ({ project, onSave, onCancel }) => {
  const [updatedProject, setUpdatedProject] = useState(project);

  const handleChange = (e) => {
    setUpdatedProject({ ...updatedProject, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(updatedProject);
  };

  return (
    <form className="edit-project-form" onSubmit={handleSubmit}>
      <h2 className="edit-project-title">Edit Project</h2>

      <label className="edit-label">
        Title
        <input
          type="text"
          name="title"
          value={updatedProject.title}
          onChange={handleChange}
          className="edit-input"
        />
      </label>

      <label className="edit-label">
        Description
        <textarea
          name="description"
          value={updatedProject.description}
          onChange={handleChange}
          className="edit-textarea"
        />
      </label>

      <label className="edit-label">
        Version
        <input
          type="text"
          name="version"
          value={updatedProject.version}
          onChange={handleChange}
          className="edit-input"
        />
      </label>

      <div className="form-actions">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-cancel"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-save"
        >
          Save
        </button>
      </div>
    </form>
  );
};

export default EditProject;
