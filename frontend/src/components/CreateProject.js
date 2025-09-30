// src/components/CreateProject.js
import React, { useState, useEffect } from "react";
import { projectService } from "../services/api";
import "../css/CreateProject.css";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const CreateProject = ({
  onCancel,
  onCreate,
  ownerId,
  initialData = null,
  isInline = false,
}) => {
  const [project, setProject] = useState({
    name: "",
    type: "",
    description: "",
    version: "",
    hashtags: [], // renamed from tags
  });

  const [tagInput, setTagInput] = useState("");
  const [files, setFiles] = useState([]);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showImageOverlay, setShowImageOverlay] = useState(false);

  // Initialize form with existing data
  useEffect(() => {
    if (initialData) {
      setProject({
        name: initialData.name || "",
        type: initialData.type || "",
        description: initialData.description || "",
        version: initialData.version || "",
        hashtags: initialData.hashtags || [], // populate hashtags
      });

      if (initialData.imageUrl || initialData.image) {
        setPreview(initialData.imageUrl || initialData.image || null);
      }

      if (initialData.files) {
        setFiles(initialData.files.map(f => ({ 
          name: f.filename || f.name, 
          existing: true, 
          fileUrl: f.fileUrl 
        })));
      }
    }
  }, [initialData]);

  // Handle input changes
  const handleChange = (e) => {
    setProject({ ...project, [e.target.name]: e.target.value });
  };

  // Hashtag handlers
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

  // File handlers
  const handleFileAdd = (e) => {
    const newFiles = Array.from(e.target.files);
    const mapped = newFiles.map((f) => ({ file: f, name: f.name, existing: false }));
    setFiles((prev) => [...prev, ...mapped]);
    e.target.value = null;
  };

  const handleRemoveFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Image handlers
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > MAX_IMAGE_SIZE) {
      alert("Image exceeds 5MB");
      return;
    }
    setImage(file);
    setPreview(URL.createObjectURL(file));
    e.target.value = null;
  };

  // Submit project
const submitWithFormData = async (url, method = "POST") => {
  const token = localStorage.getItem("token");
  const form = new FormData();

  form.append("project", JSON.stringify(project)); // send hashtags here

  files.forEach(fObj => {
    if (!fObj.existing && fObj.file) form.append("files", fObj.file, fObj.name);
  });

  if (image) form.append("image", image, image.name);

  const res = await fetch(url, {
    method,
    headers: { Authorization: token ? `Bearer ${token}` : "" },
    body: form,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Upload request failed");
  }

  return res.json();
};


const handleSubmit = async (e) => {
  e.preventDefault();
  setSaving(true);

  try {
    let response;

    // Always use FormData for updates to handle files/images
    const formData = new FormData();
    formData.append("project", JSON.stringify(project));

    files.forEach(fObj => {
      if (!fObj.existing && fObj.file) {
        formData.append("files", fObj.file, fObj.name);
      }
    });

    if (image) {
      formData.append("image", image, image.name);
    }

    const token = localStorage.getItem("token");
    const options = {
      method: initialData && initialData._id ? "PUT" : "POST",
      headers: { Authorization: token ? `Bearer ${token}` : "" },
      body: formData
    };

    const url = initialData && initialData._id
      ? `/api/projects/${initialData._id}`
      : "/api/projects";

    const res = await fetch(url, options);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Server error");
    }

    response = await res.json();
    if (onCreate) onCreate(response);

    // Reset form if not inline editing
    if (!isInline) {
      setProject({ name: "", type: "", description: "", version: "", hashtags: [] });
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
        <h2>{initialData ? "Edit Project" : isInline ? "Add Project" : "Create Project"}</h2>

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
            <select name="type" value={project.type} onChange={handleChange} required>
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

        <div className="form-right">
          <label>
            Version
            <input 
              type="text" 
              name="version" 
              value={project.version} 
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
              <button type="button" onClick={handleTagAdd} className="tag-add-btn">Add</button>
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

          <label>
            Upload Files
            <div className="upload-box">
              <span>Click to browse or drag & drop files</span>
              <input 
                type="file" 
                multiple 
                onChange={handleFileAdd} 
                className="file-input"
              />
            </div>
            {files.length > 0 && (
              <div className="file-list">
                <h4>Selected Files:</h4>
                <ul>
                  {files.map((fileObj, index) => (
                    <li key={index}>
                      <span className="file-name">{fileObj.name}</span>
                      {fileObj.existing ? (
                        <span className="file-status">(existing)</span>
                      ) : (
                        <button 
                          type="button" 
                          onClick={() => handleRemoveFile(index)}
                          className="file-remove-btn"
                        >
                          Remove
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </label>
        </div>

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
                  src={preview} 
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
            {saving ? "Saving..." : (initialData ? "Save Changes" : "Create Project")}
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
