import React from "react";
import "../css/ProjectPreview.css";

const ProjectPreview = ({ project }) => {
  return (
    <div className="project-preview-card">
      {/* Image Preview */}
      {project.imageUrl && (
        <div className="project-image1">
          <img
            src={`http://localhost:5000/uploads/${project.imageUrl.replace(/^\/?uploads\//, "")}`}
            alt={project.name}
            onError={(e) => (e.target.src = "http://localhost:5000/uploads/default-pic.png")}
          />
        </div>
      )}

      <div className="project-details">
        <h3 className="project-title">
          {project.name}
          {project.currentVersion && ` v${project.currentVersion}`}
        </h3>

        {project.description && (
          <p className="project-description">{project.description}</p>
        )}

        {project.hashtags && project.hashtags.length > 0 && (
          <div className="project-tags">
            {project.hashtags.map((tag, index) => (
              <span key={index} className="project-tag">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectPreview;
