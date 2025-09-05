import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/SideBar.css";

const Sidebar = ({ projects }) => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const filteredProjects = projects.filter((project) =>
    project.title.toLowerCase().includes(query.toLowerCase())
  );

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
        placeholder="Search projects..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="sidebar-search"
      />

      <h2>My Projects</h2>

      <ul className="sidebar-list">
        {filteredProjects.length > 0 ? (
          filteredProjects.map((project) => (
            <li
              key={project.id}
              className="sidebar-item"
              onClick={() => navigate(`/projects/${project.id}`)} // ✅ navigate to project
              style={{ cursor: "pointer" }}
            >
              {project.title}
            </li>
          ))
        ) : (
          <li className="sidebar-empty">No projects found</li>
        )}
      </ul>
    </aside>
  );
};

export default Sidebar;
