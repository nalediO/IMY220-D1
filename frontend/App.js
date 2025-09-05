import React from "react";
import { BrowserRouter, Routes, Route, useParams } from "react-router-dom";
import Home from "./src/Pages/Home";
import Posts from "./src/Pages/Posts";
import SignIn from "./src/Pages/SignIn";
import Login from "./src/Pages/Login";
import Home2 from "./src/Pages/Home2";
import Profile from "./src/Pages/Profile";
import ProjectsCPage from "./src/Pages/ProjectsCPage";
import ProjectPage from "./src/Pages/ProjectPage";
import ProjectsPageAll from "./src/Pages/ProjectPageAll";


import { userProjects } from "./src/data/projects"; 

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/posts" element={<Posts />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home2" element={<Home2 />} />
        <Route path="/ProjectsCPage" element={<ProjectsCPage />} />
        <Route path="/Profile" element={<Profile />} />
        <Route path="/project" element={<ProjectsPageAll projectsData={userProjects} />} />

        {/*Project details route */}
        <Route
          path="/projects/:id"
          element={<ProjectPageWrapper projects={userProjects} />}
        />
      </Routes>
    </BrowserRouter>
  );
};


const ProjectPageWrapper = ({ projects }) => {
  const { id } = useParams();
  const project = projects.find((p) => p.id === parseInt(id));

  if (!project) return <h2>Project not found</h2>;

  return <ProjectPage project={project} />;
};

export default App;
