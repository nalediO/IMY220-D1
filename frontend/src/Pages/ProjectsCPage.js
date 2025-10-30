// src/Pages/ProjectsCPage.js
import React from "react";
import Nav from "../components/Nav";
import Footer from "../components/footer";
import CreateProject from "../components/CreateProject";
import "../css/ProjectsCPage.css";

const ProjectsCPage = () => {
  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  const ownerId = storedUser?._id || storedUser?.id || null;

  const handleProjectCreate = (newProject) => {
    console.log("Project created:", newProject);
    alert("Project created successfully!");
  };

  return (
    <div className="projects-c-page">
      <Nav />
      <div className="projects-c-content">
        <CreateProject
          onCreate={handleProjectCreate}
          isInline={false}
          ownerId={ownerId}
        />
      </div>

      <Footer />
    </div>
  );
};

export default ProjectsCPage;
