import React, { useState, useEffect } from "react";
import ProjectList from "../components/ProjectList";
import Nav from "../components/Nav";
import { projectService } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import "../css/ProjectsPageAll.css";

const ProjectsPageAll = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user: loggedInUser } = useAuth();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const data = await projectService.getAllProjects();
        const userProjects = Array.isArray(data)
          ? data.filter(
              (p) =>
                p?.owner?._id === loggedInUser?._id ||
                p?.owner === loggedInUser?._id
            )
          : [];
        setProjects(userProjects);
      } catch (err) {
        console.error("Error fetching projects:", err);
        setError("Failed to load projects.");
      } finally {
        setLoading(false);
      }
    };
    if (loggedInUser?._id) fetchProjects();
  }, [loggedInUser]);

  const handleDelete = async (projectId) => {
    try {
      await projectService.deleteProject(projectId);
      setProjects((prev) => prev.filter((p) => p._id !== projectId));
    } catch (err) {
      console.error("Failed to delete project:", err);
      alert("Error deleting project.");
    }
  };

const handleUpdate = async (formData, projectId) => {
  const userToken = localStorage.getItem("token"); // 🟢 Retrieve your token here

  if (!userToken) {
    console.error("User token is missing");
    alert("You are not logged in.");
    return;
  }

  if (!projectId) {
    console.error("updateProject called without a valid ID:", projectId);
    alert("Project ID is missing.");
    return;
  }

  try {
    // Build project object
    const project = { _id: projectId };

    if (formData instanceof FormData) {
      const projectData = JSON.parse(formData.get("project"));
      project._id = projectData._id || projectId;
      project.newFiles = formData.getAll("files");
      project.newImage = formData.get("image");
      Object.assign(project, projectData);
    }

    // ✅ Pass token here
    await projectService.updateProject(project, userToken);

    // Refresh projects
    const data = await projectService.getAllProjects();
    setProjects(
      data.filter(
        (p) => p?.owner?._id === loggedInUser?._id || p?.owner === loggedInUser?._id
      )
    );
  } catch (err) {
    console.error("Failed to update project:", err);
    alert("Error saving project.");
  }
};


  if (loading) return <div>Loading projects...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="projects-page">
      <Nav />
      <h1>My Projects</h1>
      <ProjectList
        projects={projects}
        onDelete={handleDelete}
        onUpdate={handleUpdate}
      />
    </div>
  );
};

export default ProjectsPageAll;
