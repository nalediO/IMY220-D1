// src/components/CreateProject.js
import React, { useState, useEffect } from "react";
import "../css/CreateProject.css";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const CreateProject = ({
  onCancel,
  onCreate, // callback after create or edit success
  owner,
  initialData = null,
  isInline = false,
}) => {
  const [project, setProject] = useState({
    name: "",
    projectType: "",
    description: "",
    currentVersion: "1.0.0",
    hashtags: [],
  });

  const [tagInput, setTagInput] = useState("");
  const [files, setFiles] = useState([]);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showImageOverlay, setShowImageOverlay] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Initialize form with existing data (for editing)
  useEffect(() => {
    if (initialData) {
      setProject({
        name: initialData.name || "",
        projectType: initialData.projectType || "",
        description: initialData.description || "",
        currentVersion: initialData.currentVersion || "1.0.0",
        hashtags: initialData.hashtags || [],
      });

      if (initialData.imageUrl) {
        const fixedUrl = initialData.imageUrl.startsWith("/uploads/")
          ? `http://localhost:5000${initialData.imageUrl}`
          : initialData.imageUrl;
        setPreview(fixedUrl);
      }

      if (initialData.files && initialData.files.length > 0) {
        setFiles(
          initialData.files.map((f) => ({
            name: f.originalName || f.name,
            existing: true,
            fileUrl: f.fileUrl,
            storedName: f.storedName,
          }))
        );
      } else {
        setFiles([]);
      }
    }
  }, [initialData]);

  const handleChange = (e) =>
    setProject({ ...project, [e.target.name]: e.target.value });

  const handleTagAdd = () => {
    const value = tagInput.trim();
    if (!value) return;
    if (!project.hashtags.includes(value)) {
      setProject({ ...project, hashtags: [...project.hashtags, value] });
    }
    setTagInput("");
  };

  const handleTagRemove = (index) => {
    setProject({
      ...project,
      hashtags: project.hashtags.filter((_, i) => i !== index),
    });
  };

  const handleTagInputKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleTagAdd();
    }
  };

  // File handling
  const handleFileAdd = (e) => {
    const newFiles = Array.from(e.target.files).map((f) => ({
      file: f,
      name: f.name,
      existing: false,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
    e.target.value = null;
  };

  const handleRemoveFile = (index) =>
    setFiles((prev) => prev.filter((_, i) => i !== index));

  // Image handling
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > MAX_IMAGE_SIZE) {
      alert("Image exceeds 5MB limit");
      return;
    }
    setImage(file);
    setPreview(URL.createObjectURL(file));
    e.target.value = null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const formData = new FormData();
      const projectData = { ...project };

      if (initialData && initialData._id) {
        projectData._id = initialData._id;
        const existingFiles = files
          .filter((f) => f.existing)
          .map((f) => ({
            originalName: f.name,
            storedName: f.storedName,
            fileUrl: f.fileUrl,
          }));
        projectData.existingFiles = existingFiles;
      }

      formData.append("project", JSON.stringify(projectData));
      files.forEach((fObj) => {
        if (!fObj.existing && fObj.file) {
          formData.append("files", fObj.file, fObj.name);
        }
      });

      if (image) {
        formData.append("image", image, image.name);
      }

      let url = "/api/projects";
      let method = "POST";
      if (initialData && initialData._id) {
        url = `/api/projects/${initialData._id}`;
        method = "PUT";
      }

      const token = localStorage.getItem("token");
      const res = await fetch(url, {
        method,
        headers: { Authorization: token ? `Bearer ${token}` : "" },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Server error");
      }

      const response = await res.json();
      console.log(" Project saved successfully:", response);

      if (onCreate) onCreate(response);

      // Reset form only if creating (not editing)
      if (!isInline && !initialData) {
        setProject({
          name: "",
          projectType: "",
          description: "",
          currentVersion: "1.0.0",
          hashtags: [],
        });
        setFiles([]);
        setImage(null);
        setPreview(null);
        setTagInput("");
      }
    } catch (err) {
      console.error("Failed to create/update project:", err);
      alert(err.message || "Failed to create/update project");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`create-project ${isInline ? "inline" : "standalone"}`}>
      <form className="create-form" onSubmit={handleSubmit}>
        <h2>{initialData ? "Edit Project" : "Create Project"}</h2>

        {/* LEFT */}
        <div className="form-left">
          <label>
            Project Name
            <input
              type="text"
              name="name"
              value={project.name}
              onChange={handleChange}
              required
              placeholder="Enter project name"
            />
          </label>

          <label>
            Project Type
            <select
              name="projectType"
              value={project.projectType}
              onChange={handleChange}
              required
            >
              <option value="">Select Type</option>
              <option value="Web">Web</option>
              <option value="Mobile">Mobile</option>
              <option value="Desktop">Desktop</option>
              <option value="Framework">Framework</option>
              <option value="Library">Library</option>
            </select>
          </label>

          <label>
            Description
            <textarea
              name="description"
              value={project.description}
              onChange={handleChange}
              required
              placeholder="Describe your project..."
            />
          </label>
        </div>

        {/* RIGHT */}
        <div className="form-right">
          <label>
            Version
            <input
              type="text"
              name="currentVersion"
              value={project.currentVersion}
              onChange={handleChange}
              required
              placeholder="e.g., 1.0.0"
            />
          </label>

          <label>
            Hashtags
            <div className="tag-input-container">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInputKeyDown}
                placeholder="Enter hashtag and press Enter/Add"
              />
              <button type="button" onClick={handleTagAdd} className="tag-add-btn">
                Add
              </button>
            </div>
            <div className="tag-list">
              {project.hashtags.map((tag, index) => (
                <span key={index} className="tag-item">
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleTagRemove(index)}
                    className="tag-remove"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </label>

          {/* FILE UPLOAD */}
          <label>
            Upload Files
            <div
              className={`upload-box ${dragActive ? "drag-active" : ""}`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragActive(false);
                const droppedFiles = Array.from(e.dataTransfer.files).map((f) => ({
                  file: f,
                  name: f.name,
                  existing: false,
                }));
                setFiles((prev) => [...prev, ...droppedFiles]);
              }}
            >
              <span>Click to browse or drag & drop files</span>
              <input type="file" multiple onChange={handleFileAdd} className="file-input" />
            </div>

            {files.length > 0 && (
              <div className="file-list">
                <h4>Files:</h4>
                <ul>
                  {files.map((fileObj, index) => (
                    <li key={index}>
                      {fileObj.existing ? (
                        <a href={fileObj.fileUrl} target="_blank" rel="noreferrer">
                          {fileObj.name} (existing)
                        </a>
                      ) : (
                        <>
                          {fileObj.name}
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(index)}
                            className="file-remove-btn"
                          >
                            Remove
                          </button>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </label>
        </div>

        {/* IMAGE UPLOAD */}
        <div className="upload-section">
          <label>
            Project Image
            <div className="upload-box">
              <span>Click to browse or drag & drop an image</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="file-input"
              />
            </div>
            {preview && (
              <div className="image-preview">
                <img
                  src={
                    preview.startsWith("/uploads/")
                      ? `http://localhost:5000${preview}`
                      : preview
                  }
                  alt="Preview"
                  className="preview-img"
                  onClick={() => setShowImageOverlay(true)}
                />
                <button
                  type="button"
                  onClick={() => {
                    setPreview(null);
                    setImage(null);
                  }}
                  className="image-remove-btn"
                >
                  Remove Image
                </button>
              </div>
            )}
          </label>
        </div>

        <div className="form-actions">
          {onCancel && (
            <button type="button" onClick={onCancel} className="cancel-btn">
              Cancel
            </button>
          )}
          <button type="submit" disabled={saving} className="create-btn">
            {saving ? "Saving..." : initialData ? "Save Changes" : "Create Project"}
          </button>
        </div>
      </form>

      {showImageOverlay && preview && (
        <div className="overlay" onClick={() => setShowImageOverlay(false)}>
          <img src={preview} alt="Enlarged preview" className="enlarged-img" />
        </div>
      )}
    </div>
  );
};

export default CreateProject;
