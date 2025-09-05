import React, { useState } from "react";
import "../css/CreateProject.css";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

const CreateProject = ({ onCancel, onCreate, isInline = false }) => {
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [files, setFiles] = useState([]);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [enlarged, setEnlarged] = useState(false);

  const [project, setProject] = useState({
    name: "",
    type: "",
    description: "",
    version: "",
  });

  // Tag handling
  const handleTagAdd = () => {
    if (tagInput.trim() && !tags.includes(tagInput)) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  // File handling
  const handleFileAdd = (e) => {
    const newFiles = Array.from(e.target.files);
    setFiles([...files, ...newFiles.map((f) => f.name)]);
  };

  // Image handling
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > MAX_IMAGE_SIZE) {
        alert("Image size exceeds 5MB. Please upload a smaller file.");
        return;
      }
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleChange = (e) => {
    setProject({ ...project, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newProject = { ...project, tags, files, image };
    
    if (onCreate) {
      onCreate(newProject);
    } else {
      console.log("New Project:", newProject);
      alert("Project Created!");
    }
    
    if (!isInline) {
      setProject({ name: "", type: "", description: "", version: "" });
      setTags([]);
      setFiles([]);
      setImage(null);
      setPreview(null);
    }
  };

  const handleCancelClick = () => {
    if (onCancel) onCancel();
  };

  return (
    <main className={`create-project ${isInline ? "inline" : "standalone"}`}>
      <form className="create-form" onSubmit={handleSubmit}>
        <h2>{isInline ? "Add New Project" : "Create A Project"}</h2>

        {/* Upload Image */}
        <div className="upload-section">
          <label className="upload-box">
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                className="preview-img"
                onClick={() => setEnlarged(true)}
              />
            ) : (
              "Drag and drop or click here"
            )}
            <input type="file" accept="image/*" hidden onChange={handleImageUpload} />
          </label>

          {/* Enlarged view */}
          {enlarged && (
            <div className="overlay" onClick={() => setEnlarged(false)}>
              <img src={preview} alt="Enlarged" className="enlarged-img" />
            </div>
          )}
        </div>

        {/* Left side inputs */}
        <div className="form-left">
          <label>
            Name
            <input
              type="text"
              name="name"
              value={project.name}
              onChange={handleChange}
              placeholder="Enter project name"
              required
            />
          </label>

          <label>
            Type
            <select
              name="type"
              value={project.type}
              onChange={handleChange}
              required
            >
              <option value="">Select Type</option>
              <option value="Web">Web</option>
              <option value="Mobile">Mobile</option>
              <option value="Desktop">Desktop</option>
              <option value="framework">Framework</option>
              <option value="library">Library</option>
            </select>
          </label>

          <label>
            Description
            <textarea
              name="description"
              value={project.description}
              onChange={handleChange}
              placeholder="Enter description"
              required
            />
          </label>

          <label>
            Version
            <input
              type="text"
              name="version"
              value={project.version}
              onChange={handleChange}
              placeholder="e.g. 1.0.0"
              required
            />
          </label>

          <label>
            Tags
            <div className="tag-input">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Enter tag"
              />
              <button type="button" onClick={handleTagAdd}>
                Add
              </button>
            </div>
            <ul className="tag-list">
              {tags.map((t, i) => (
                <li key={i} className="tag-item">
                  {t}
                </li>
              ))}
            </ul>
          </label>
        </div>

        {/* Right side - files */}
        <div className="form-right">
          <label>
            Add Files
            <input type="file" multiple onChange={handleFileAdd} />
            <ul>
              {files.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          </label>
        </div>

        {/* Action buttons */}
        <div className="form-actions">
          {onCancel && (
            <button
              type="button"
              className="cancel-btn"
              onClick={handleCancelClick}
            >
              Cancel
            </button>
          )}
          <button type="submit" className="create-btn">
            {isInline ? "Add Project" : "Create Project"}
          </button>
        </div>
      </form>
    </main>
  );
};

export default CreateProject;
