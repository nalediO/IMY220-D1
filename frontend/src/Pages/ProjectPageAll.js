import React, { useState } from "react";
import ProjectList from "../components/ProjectList";
import EditProject from "../components/EditProject";
import Nav from "../components/Nav";
import "../css/ProjectsPageAll.css"; 
const ProjectsPageAll = ({ projectsData }) => {
  const [projects, setProjects] = useState(projectsData || []);
  const [editingProject, setEditingProject] = useState(null);

  const handleEdit = (project) => {
    setEditingProject(project);
  };

  const handleSave = (updatedProject) => {
    setProjects(projects.map((p) => (p.id === updatedProject.id ? updatedProject : p)));
    setEditingProject(null);
  };

  const handleCancel = () => {
    setEditingProject(null);
  };

  return (
    <div className="projects-page">
      <Nav />
      <h1 className="projects-title">My Projects</h1>

      {editingProject ? (
        <EditProject
          project={editingProject}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      ) : (
        <ProjectList
          projects={projects.map((p) => ({
            ...p,
            onEdit: () => handleEdit(p), // pass edit handler to each card
          }))}
        />
      )}
    </div>
  );
};

export default ProjectsPageAll;
