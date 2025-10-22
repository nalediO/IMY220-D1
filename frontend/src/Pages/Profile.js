import React, { useEffect, useState } from "react";
import Nav from "../components/Nav";
import Footer from "../components/footer";
import ProfileInfo from "../components/ProfileInfo";
import EditProfile from "../components/EditProfile";
import ProjectList from "../components/ProjectList";
import FriendsList from "../components/FriendsList";
import CreateProject from "../components/CreateProject";
import EditProject from "../components/EditProject";
import PendingRequests from "../components/PendingRequest";
import { userService, projectService, friendService } from "../services/api";
import "../css/Profile.css";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [userProjects, setUserProjects] = useState([]);
  const [friends, setFriends] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user"));

        if (!storedUser?._id) throw new Error("User not logged in");

        // Fetch user profile
        const profile = await userService.getProfile(storedUser._id);
        setUser(profile);

        // Fetch projects owned by user
        const projects = await projectService.getAllProjects();
        const myProjects = projects.filter(
          (p) => p.owner?._id === storedUser._id || p.ownerId === storedUser._id
        );
        setUserProjects(myProjects);

        // Fetch friends
        const myFriends = await friendService.getFriends();
        setFriends(myFriends);
      } catch (err) {
        console.error("Profile fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const reloadFriends = async () => {
    try {
      const myFriends = await friendService.getFriends();
      setFriends(myFriends);
    } catch (err) {
      console.error("Reload friends failed:", err);
    }
  };

  const handleProfileUpdate = async (updatedUser) => {
    try {
      const saved = await userService.updateProfile(user._id, updatedUser);
      setUser(saved);
      localStorage.setItem("user", JSON.stringify(saved));
      setIsEditing(false);
    } catch (err) {
      console.error("Update failed:", err);
    }
  };


  const handleUpdateProject = async (formData, projectId) => {
    try {
      if (!projectId) throw new Error("Project ID is missing.");

      console.log("Updating project with ID:", projectId);
      const updated = await projectService.updateProject(projectId, formData);

      setUserProjects((prev) =>
        prev.map((p) => (p._id === updated._id ? updated : p))
      );

      setEditingProject(null);
    } catch (error) {
      console.error("Failed to update project:", error);
      alert("Failed to update project: " + (error.message || "Unknown error"));
    }
  };

  const handleProjectDelete = async (projectId) => {
    await projectService.deleteProject(projectId);
    setUserProjects((prev) => prev.filter((p) => p._id !== projectId));
  };

  const handleProjectCreate = async (newProject) => {
    try {
      const created = await projectService.createProject({
        ...newProject,
        ownerId: user._id,
      });
      setUserProjects([...userProjects, created]);
      setShowCreateProject(false);
    } catch (err) {
      console.error("Create project failed:", err);
    }
  };

  if (loading) return <div className="loading">Loading profile...</div>;
  if (!user) return <div className="error">Unable to load profile.</div>;

  return (
    <div className="profile-container">
      <Nav />

      <div className="profile-content">
        <div className="profile-header">
          <h1>Profile</h1>
          <div className="header-actions">
            {!isEditing && !showCreateProject && !editingProject && (
              <button className="primary-btn" onClick={() => setIsEditing(true)}>
                Edit Profile
              </button>
            )}
            {!isEditing && !editingProject && (
              <button
                className="secondary-btn"
                onClick={() => setShowCreateProject(!showCreateProject)}
              >
                {showCreateProject ? "Cancel" : "Create Project"}
              </button>
            )}
          </div>
        </div>

        <div className="profile-layout">
          {/* Left Column */}
          <div className="profile-left">
            {isEditing ? (
              <EditProfile
                user={user}
                onSave={handleProfileUpdate}
                onCancel={() => setIsEditing(false)}
              />
            ) : (
              <ProfileInfo user={user} onEdit={() => setIsEditing(true)} />
            )}

            <div className="section-card">
              <PendingRequests onAcceptedOrRejected={reloadFriends} />
            </div>
            <div className="section-card">
              <FriendsList friends={friends} />
            </div>
          </div>

          {/* Right Column */}
          <div className="profile-right">
            {showCreateProject && !editingProject ? (
              <div className="section-card">
                <CreateProject
                  onCreate={handleProjectCreate}
                  onCancel={() => setShowCreateProject(false)}
                />
              </div>
            ) : editingProject ? (
              <div className="section-card">
                <EditProject
                  project={editingProject}
                  onSave={handleUpdateProject}
                  onCancel={() => setEditingProject(null)}
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
                <ProjectList
                  projects={userProjects}
                  onUpdate={(p) => setEditingProject(p)}
                  onDelete={handleProjectDelete}
                />
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
