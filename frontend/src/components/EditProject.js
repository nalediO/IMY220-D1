import React, { useState, useEffect } from "react";
import "../css/EditProject.css";

const EditProject = ({ project, onSave, onCancel }) => {
  const [updatedProject, setUpdatedProject] = useState({
    _id: "",
    name: "",
    description: "",
    currentVersion: "",
    hashtags: [],
    imageUrl: "",
    files: []
  });

  const [newImage, setNewImage] = useState(null);
  const [newFiles, setNewFiles] = useState([]);

  // Load project values into local state
  useEffect(() => {
    if (project) {
      setUpdatedProject({
        _id: project._id,
        name: project.name || "",
        description: project.description || "",
        currentVersion: project.currentVersion || "1.0.0",
        hashtags: project.hashtags || [],
        imageUrl: project.imageUrl || "",
        files: project.files || []
      });
    }
  }, [project]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedProject((prev) => ({ ...prev, [name]: value }));
  };

  const handleHashtagsChange = (e) => {
    const tags = e.target.value
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t !== "");
    setUpdatedProject((prev) => ({ ...prev, hashtags: tags }));
  };

  const handleImageChange = (e) => {
    if (e.target.files?.[0]) setNewImage(e.target.files[0]);
  };

  const handleFilesChange = (e) => {
    if (e.target.files) setNewFiles(Array.from(e.target.files));
  };

  const removeExistingFile = (index) => {
    setUpdatedProject((prev) => {
      const updatedFiles = [...prev.files];
      updatedFiles.splice(index, 1);
      return { ...prev, files: updatedFiles };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const mergedProject = {
      ...project,
      ...updatedProject,
    };

    const formData = new FormData();
    formData.append("project", JSON.stringify(mergedProject));
    if (newImage) formData.append("image", newImage);
    newFiles.forEach((file) => formData.append("files", file));

    onSave(formData, mergedProject._id);
  };

  if (!project) return <p>No project selected.</p>;

  return (
    <div className="edit-project-container">
      <form className="edit-project-form" onSubmit={handleSubmit}>
        <h2 className="edit-project-title">Edit Project</h2>

        <label className="edit-label">
          Project Name
          <input
            className="edit-input"
            name="name"
            value={updatedProject.name}
            onChange={handleChange}
            required
          />
        </label>

        <label className="edit-label">
          Description
          <textarea
            className="edit-textarea"
            name="description"
            value={updatedProject.description}
            onChange={handleChange}
            rows="4"
            required
          />
        </label>

        <label className="edit-label">
          Version
          <input
            className="edit-input"
            name="currentVersion"
            value={updatedProject.currentVersion}
            onChange={handleChange}
            required
          />
        </label>

        <label className="edit-label">
          Hashtags (comma separated)
          <input
            className="edit-input"
            value={updatedProject.hashtags.join(", ")}
            onChange={handleHashtagsChange}
          />
        </label>

        {/* Current image */}
        {updatedProject.imageUrl && !newImage && (
          <div className="current-image">
            <img
              src={updatedProject.imageUrl}
              alt="Current"
              className="current-image-preview"
            />
          </div>
        )}

        <label className="edit-label">
          Project Image
          <input type="file" accept="image/*" onChange={handleImageChange} className="file-input" />
        </label>

        {/* Existing files */}
        <div className="existing-files">
          <h4>Existing Files</h4>
          {updatedProject.files.length === 0 ? (
            <p>No files attached.</p>
          ) : (
            <ul>
              {updatedProject.files.map((f, idx) => (
                <li key={idx}>
                  <a href={f.fileUrl} target="_blank" rel="noreferrer" className="file-link">
                    {f.filename}
                  </a>
                  <button 
                    type="button" 
                    onClick={() => removeExistingFile(idx)}
                    className="remove-file-btn"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Add new files */}
        <label className="edit-label">
          Add New Files
          <input type="file" multiple onChange={handleFilesChange} className="file-input" />
          {newFiles.length > 0 && (
            <ul className="new-files-list">
              {newFiles.map((f, i) => (
                <li key={i}>{f.name}</li>
              ))}
            </ul>
          )}
        </label>

        <div className="form-actions">
          <button type="button" onClick={onCancel} className="btn btn-cancel">
            Cancel
          </button>
          <button type="submit" className="btn btn-save">Save</button>
        </div>
      </form>
    </div>
  );
};

export default EditProject;
