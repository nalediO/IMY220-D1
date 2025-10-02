import React, { useState } from "react";
import ProjectPreview from "./ProjectPreview";
import EditProject from "./EditProject";

import "../css/ProjectList.css";

const ProjectList = ({ projects, onUpdate, onDelete }) => {
  const [editingProject, setEditingProject] = useState(null);

  return (
    <div className="project-list">
      {projects.length === 0 && <p>No projects yet. Create your first project!</p>}
      {projects.map((project) => (
        <div key={project._id} className="project-item">
          {editingProject?._id === project._id ? (
            <EditProject
              project={editingProject}

              onSave={(formData, projectId) => {
                onUpdate(formData, projectId);
                setEditingProject(null);
              }}
              onCancel={() => setEditingProject(null)}
            />
          ) : (
            <>
              <ProjectPreview project={project} />
              <div className="project-actions fixed-width">
                <button
                  className="project-edit-btn"
                  onClick={() => setEditingProject(project)}
                >
                  Edit
                </button>
                <button
                  className="project-delete-btn"
                  onClick={() => onDelete(project._id)}
                >
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default ProjectList;
