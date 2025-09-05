
import React from "react";
import ProjectPreview from "./ProjectPreview";

const ProjectList = ({ projects }) => {
  if (!projects || projects.length === 0) {
    return (
      <div className="empty-state">
        <p>No projects yet. Create your first project!</p>
      </div>
    );
  }

  return (
    <div className="project-list">
      {projects.map((project) => (
        <ProjectPreview
          key={project.id}
          project={project}
          onEdit={project.onEdit} 
        />
      ))}
    </div>
  );
};

export default ProjectList;
