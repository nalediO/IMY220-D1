// ProjectPreview.js
import React from "react";
import "../css/ProjectPreview.css";

const ProjectPreview = ({ project, onEdit }) => {
  return (
    <div className="project-card">
      <h3 className="project-title">{project.title}</h3>
      <p className="project-description">{project.description}</p>
      <span className="project-owner">By: {project.owner}</span>

      <div className="project-meta">
        <span className="status">Active</span>
        <span className="contributors">5 contributors</span>
      </div>

      <div className="project-actions">
        <a
          href={project.link}
          target="_blank"
          rel="noopener noreferrer"
          className="project-action-btn"
        >
          View
        </a>
        <button onClick={onEdit} className="project-action-btn">
          Edit
        </button>
        <button onClick={onEdit} className="project-action-btn">
          Check In
        </button>
      </div>
    </div>
  );
};

export default ProjectPreview;
