import React from "react";
import Nav from "../components/Nav";
import Footer from "../components/footer";
import CreateProject from "../components/CreateProject";
import "../css/ProjectsCPage.css";
 
const ProjectsCPage = () => {
  const handleProjectCreate = (newProject) => {
    console.log("Project created:", newProject);
    alert("Project created successfully!");
    // You can add navigation logic here
  };

  return (
    <div className="projects-c-page">
      <Nav />
      
      <div className="projects-c-content">
        <CreateProject 
          onCreate={handleProjectCreate}
          isInline={false}
        />
      </div>
      
      <Footer />
    </div>
  );
};

export default ProjectsCPage;