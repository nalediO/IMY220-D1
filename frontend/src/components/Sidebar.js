import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { projectService } from "../services/api";
import "../css/SideBar.css";

const Sidebar = () => {
  const [query, setQuery] = useState("");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllProjects();
  }, []);

  const fetchAllProjects = async () => {
    try {
      setLoading(true);
      const data = await projectService.getAllProjects();
      // Filter projects by logged-in user's ID
      const userProjects = Array.isArray(data)
        ? data.filter(
            (p) =>
              p?.owner?._id === user?._id || // for populated owner objects
              p?.ownerId === user?._id       // for plain ownerId fields
          )
        : [];
      setProjects(userProjects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      setError("Failed to load projects");
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter by search query
  const filteredProjects = projects.filter((project) => {
    if (!project) return false;
    const projectName = project.title || project.name || "";
    return projectName.toLowerCase().includes(query.toLowerCase());
  });

  if (loading) {
    return (
      <aside className="sidebar">
        <div className="sidebar-loading">Loading your projects...</div>
      </aside>
    );
  }

  if (error) {
    return (
      <aside className="sidebar">
        <div className="sidebar-error">{error}</div>
        <button onClick={fetchAllProjects} className="retry-button">
          Try Again
        </button>
      </aside>
    );
  }

  return (
    <aside className="sidebar">
      <button
        className="sidebar-button"
        onClick={() => navigate("/ProjectsCPage")}
      >
        + Create New Project
      </button>

      <input
        type="text"
        placeholder="Search your projects..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="sidebar-search"
      />

      <h2>Your Projects ({filteredProjects.length})</h2>

      <ul className="sidebar-list">
        {filteredProjects.length > 0 ? (
          filteredProjects.map((project) => {
            const projectName = project.title || project.name || "Unnamed Project";
            const projectId = project._id || project.id;
            return (
              <li
                key={projectId}
                className="sidebar-item"
                onClick={() => navigate(`/projects/${projectId}`)}
                style={{ cursor: "pointer" }}
              >
                <span className="project-name">{projectName}</span>
              </li>
            );
          })
        ) : (
          <li className="sidebar-empty">
            {query ? "No matching projects" : "You have no projects yet"}
          </li>
        )}
      </ul>
    </aside>
  );
};

export default Sidebar;
