import React, { useState } from "react";
import Nav from "../components/Nav";
import Footer from "../components/footer";
import ProfileInfo from "../components/ProfileInfo";
import EditProfile from "../components/EditProfile";
import ProjectList from "../components/ProjectList";
import FriendsList from "../components/FriendsList";
import CreateProject from "../components/CreateProject";
import "../css/Profile.css";

const Profile = () => {
  // User data state
  const [user, setUser] = useState({
    username: "johndoe",
    name: "John",
    surname: "Doe",
    email: "email@deposit.com",
    about: "Developer passionate about React and Node.js",
    organization: "Computer News",
    profilePic: null
  });

  // UI state
  const [isEditing, setIsEditing] = useState(false);
  const [showCreateProject, setShowCreateProject] = useState(false);
  
  // Sample data
  const [userProjects, setUserProjects] = useState([
    { id: 1, title: "Weather App", description: "A React-based weather application" },
    { id: 2, title: "Task Manager", description: "Project management tool with drag-and-drop" },
    { id: 3, title: "Portfolio Website", description: "Personal portfolio built with React" },
  ]);

  const [friends, setFriends] = useState([
    { id: 1, name: "Alice Smith", mutualProjects: 3 },
    { id: 2, name: "Bob Johnson", mutualProjects: 2 },
    { id: 3, name: "Charlie Brown", mutualProjects: 5 },
  ]);

  // Handle profile updates
  const handleProfileUpdate = (updatedUser) => {
    setUser(updatedUser);
    setIsEditing(false);
  };

  // Handle project creation
  const handleProjectCreate = (newProject) => {
    setUserProjects([...userProjects, { 
      id: userProjects.length + 1, 
      ...newProject 
    }]);
    setShowCreateProject(false);
  };

  return (
    <div className="profile-container">
      <Nav />
      
      <div className="profile-content">
        <div className="profile-header">
          <h1>Profile</h1>
          <div className="header-actions">
            {!isEditing && !showCreateProject && (
              <button 
                className="primary-btn"
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </button>
            )}
            {!isEditing && (
              <button 
                className="secondary-btn"
                onClick={() => setShowCreateProject(!showCreateProject)}
              >
                {showCreateProject ? 'Cancel' : 'Create Project'}
              </button>
            )}
          </div>
        </div>

        <div className="profile-layout">
          {/* Left Column - Profile Info */}
          <div className="profile-left">
            {isEditing ? (
              <EditProfile 
                user={user} 
                onSave={handleProfileUpdate}
                onCancel={() => setIsEditing(false)}
              />
            ) : (
              <ProfileInfo 
                user={user} 
                onEdit={() => setIsEditing(true)}
              />
            )}
            
            {/* Friends List */}
            <div className="section-card">
              <FriendsList friends={friends} />
            </div>
          </div>

          {/* Right Column - Projects */}
          <div className="profile-right">
            {showCreateProject ? (
              <div className="section-card">
                <CreateProject 
                  onCreate={handleProjectCreate}
                  onCancel={() => setShowCreateProject(false)}
                />
              </div>
            ) : (
              <div className="section-card">
                <div className="section-header">
                  <h2>My Projects</h2>
                  <button 
                    className="icon-btn"
                    onClick={() => setShowCreateProject(true)}
                    title="Create new project"
                  >
                    +
                  </button>
                </div>
                <ProjectList projects={userProjects} />
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Profile;