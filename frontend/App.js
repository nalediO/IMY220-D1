import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./src/Pages/Home";
import Posts from "./src/Pages/Posts";
import SignIn from "./src/Pages/SignIn";
import Login from "./src/Pages/Login";
import Home2 from "./src/Pages/Home2";
import Profile from "./src/Pages/Profile";
import ProjectsCPage from "./src/Pages/ProjectsCPage";
import ProjectPage from "./src/Pages/ProjectPage";
import ProjectsPageAll from "./src/Pages/ProjectPageAll";
import UserPage from "./src/Pages/UserPage"; 
import UserProfilePage from "./Pages/UserProfilePage";

import { AuthProvider } from "./src/contexts/AuthContext";

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* General pages */}
          <Route path="/" element={<Home />} />
          <Route path="/posts" element={<Posts />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home2" element={<Home2 />} />
          <Route path="/Profile" element={<Profile />} />
          <Route path="/UserPage" element={<UserPage />} />
          <Route path="/profile/:userId" element={<UserProfilePage />} />

          {/* Projects pages */}
          <Route path="/ProjectsCPage" element={<ProjectsCPage />} />
          {/* List all projects */}
          <Route path="/project" element={<ProjectsPageAll />} />
          {/* Single project details (fetches from MongoDB) */}
          <Route path="/projects/:projectId" element={<ProjectPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
