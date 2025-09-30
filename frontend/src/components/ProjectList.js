import React, { useState } from "react";
import ProjectPreview from "./ProjectPreview";
import EditProject from "./EditProject";

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
              <div className="project-actions">
                <button onClick={() => setEditingProject(project)}>Edit</button>
                <button onClick={() => onDelete(project._id)}>Delete</button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default ProjectList;
