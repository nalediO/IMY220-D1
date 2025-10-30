import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  projectService,
  checkinService,
  userService,
  friendService,
} from "../services/api";
import FilesList from "../components/FilesList";
import EditProject from "../components/EditProject";
import Nav from "../components/Nav";
import Footer from "../components/footer";
import "../css/ProjectPage.css";

const ProjectPage = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [checkins, setCheckins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isCheckedOut, setIsCheckedOut] = useState(false);

  // File states
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState("");
  const [isEditingFile, setIsEditingFile] = useState(false);

  // Check-in states
  const [newCheckinMessage, setNewCheckinMessage] = useState("");
  const [newFiles, setNewFiles] = useState([]);
  const [newVersion, setNewVersion] = useState(project?.currentVersion || "");

  // Invite friends
  const [friends, setFriends] = useState([]);
  const [selectedFriendId, setSelectedFriendId] = useState("");

  // Project types
  const [projectTypes, setProjectTypes] = useState([]);
  const [selectedType, setSelectedType] = useState("");

  // Helper: Refresh project data
  const refreshProject = async () => {
    try {
      const updatedProject = await projectService.getProject(projectId);
      setProject(updatedProject);
      setIsCheckedOut(updatedProject.isCheckedOut);
      setSelectedType(updatedProject.projectType || "");
      setNewVersion(updatedProject.currentVersion || "1.0.0");
    } catch (err) {
      console.error("Error refreshing project:", err);
    }
  };

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        // Fetch project details
        const projectData = await projectService.getProject(projectId);
        if (!projectData) {
          setError("Project not found");
          return;
        }
        setProject(projectData);
        setIsCheckedOut(projectData.isCheckedOut);
        setSelectedType(projectData.projectType || "");
        setNewVersion(projectData.currentVersion || "1.0.0");

        // Fetch project check-ins
        const checkinsData = await checkinService.getProjectCheckins(projectId);
        setCheckins(checkinsData || []);

        // Fetch friends
        const allFriends = await friendService.getFriends();
        setFriends(allFriends);

        // Fetch predefined project types
        try {
          const types = await projectService.getProjectTypes();
          setProjectTypes(types);
        } catch (err) {
          console.error("Failed to load project types:", err);
        }

      } catch (err) {
        console.error(err);
        setError("Failed to load project data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId]);

  // =================== FILE HANDLING ===================
  const handleFileSelect = async (file) => {
    setSelectedFile(file);
    setIsEditingFile(false);

    try {
      const res = await fetch(`http://localhost:5000/uploads/${file.storedName}`);
      if (!res.ok) throw new Error("Unable to load file");

      const text = await res.text();
      setFileContent(text);
    } catch (err) {
      console.error("Error reading file:", err);
      setFileContent("// Unable to preview this file");
    }
  };

  const handleSaveFile = async () => {
    try {
      if (!selectedFile || !fileContent) return;

      const blob = new Blob([fileContent], { type: "text/plain" });
      const formData = new FormData();
      formData.append("file", new File([blob], selectedFile.originalName));

      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/projects/${projectId}/files/${selectedFile.storedName}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      if (!res.ok) throw new Error("Failed to save file");
      alert("File updated successfully!");
      await refreshProject();
      setIsEditingFile(false);
      const updatedFile = project.files.find(
        (f) => f.originalName === selectedFile.originalName
      );
      if (updatedFile) handleFileSelect(updatedFile);
    } catch (err) {
      console.error("Error saving file:", err);
      alert("Could not save file changes.");
    }
  };

  const handleDownloadFile = async (file) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `http://localhost:5000/api/projects/${projectId}/files/${file.storedName}/download`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Failed to download file");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", file.originalName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Could not download file.");
    }
  };

  const handleDeleteFile = async (storedName) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/projects/${projectId}/files/${storedName}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Failed to delete file");
      await refreshProject();
      setSelectedFile(null);
      setFileContent("");
      alert("File deleted successfully");
    } catch (err) {
      console.error(err);
      alert("Could not delete file.");
    }
  };

  // =================== CHECK-OUT / CHECK-IN ===================
  const handleFileUploadChange = (e) => {
    setNewFiles(Array.from(e.target.files));
  };

  const handleCheckOut = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/projects/${projectId}/checkout`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to check out project");
      setIsCheckedOut(true);
    } catch (err) {
      console.error(err);
      alert("Could not check out project.");
    }
  };

  const handleCreateCheckin = async () => {
    if (!newCheckinMessage.trim() && newFiles.length === 0) return;

    try {
      await checkinService.createCheckin({
        projectId,
        message: newCheckinMessage,
        version: newVersion || project.currentVersion,
        files: newFiles,
      });
      await refreshProject();
      setCheckins(await checkinService.getProjectCheckins(projectId));
      setNewCheckinMessage("");
      setNewFiles([]);
      setIsCheckedOut(false);
    } catch (err) {
      console.error(err);
      alert("Check-in failed");
    }
  };

  // =================== INVITE FRIEND ===================
  const handleInviteFriend = async () => {
    if (!selectedFriendId) return;
    try {
      await projectService.addMember(projectId, selectedFriendId);
      alert("Friend invited successfully!");
      setSelectedFriendId("");
      await refreshProject();
    } catch (err) {
      console.error(err);
      alert("Could not invite friend");
    }
  };

  // =================== RENDER ===================
  if (loading)
    return (
      <main className="project-page">
        <Nav />
        <div className="loading-container">Loading project...</div>
        <Footer />
      </main>
    );

  if (error || !project)
    return (
      <main className="project-page">
        <Nav />
        <div className="error-container">{error || "Project not found."}</div>
        <Footer />
      </main>
    );

  return (
    <main className="project-page">
      <Nav />
      <section className="main-content">
        <div className="project-header">
          <h1>{project.name}</h1>
          <p>{project.description}</p>
          <div className="project-meta">
            <span>Version: {project.currentVersion}</span>
            <span>Type: {project.projectType}</span>
            <span>
              Hashtags:{" "}
              {project.hashtags?.map((h, idx) => (
                <strong key={idx}>#{h} </strong>
              ))}
            </span>
            <button className="edit-btn" onClick={() => setIsEditing(true)}>
              Edit Project
            </button>
          </div>
        </div>

        <div className="project-body">
          {/* Files Section */}
          <div className="files-section">
            <h3>Project Files</h3>
            <FilesList files={project.files || []} onSelect={handleFileSelect} />
          </div>

          {/* Content Section */}
          <div className="content-section">
            {/* File Preview */}
            {selectedFile ? (
              <div className="file-preview">
                <h4>{selectedFile.originalName}</h4>
                {isEditingFile ? (
                  <>
                    <textarea
                      className="file-textarea"
                      value={fileContent}
                      onChange={(e) => setFileContent(e.target.value)}
                      rows={15}
                    />
                    <button onClick={handleSaveFile}>Save Changes</button>
                    <button onClick={() => setIsEditingFile(false)}>Cancel</button>
                  </>
                ) : (
                  <>
                    <pre className="file-content">{fileContent}</pre>
                    <button onClick={() => setIsEditingFile(true)}>Edit</button>
                    <button onClick={() => handleDeleteFile(selectedFile.storedName)}>
                      Delete
                    </button>
                    <a 
                      className="download-btn1"
                      onClick={(e) => {
                        e.preventDefault();
                        handleDownloadFile(selectedFile);
                      }}
                      href="#"
                    >
                      Download
                    </a>
                  </>
                )}
              </div>
            ) : (
              <div className="no-file-selected">
                <p>Select a file to view its content</p>
              </div>
            )}

            {/* Invite Friends Section */}
            <div className="invite-section">
              <h3>Invite Friends</h3>
              <select
                value={selectedFriendId}
                onChange={(e) => setSelectedFriendId(e.target.value)}
              >
                <option value="">Select a friend</option>
                {friends.map((f) => (
                  <option key={f._id} value={f._id}>
                    {f.username}
                  </option>
                ))}
              </select>
              <button onClick={handleInviteFriend}>Invite</button>
            </div>

            {/* Check-ins Section */}
            <div className="checkins-section">
              <h3>Project Activity & Check-ins</h3>
              
              {!isCheckedOut ? (
                <button className="checkout-btn" onClick={handleCheckOut}>
                  Check Out Project
                </button>
              ) : (
                <div className="checkin-input">
                  <textarea
                    value={newCheckinMessage}
                    onChange={(e) => setNewCheckinMessage(e.target.value)}
                    placeholder="Check-in message..."
                    rows={3}
                  />
                  <input 
                    type="text" 
                    placeholder="Version" 
                    value={newVersion} 
                    onChange={(e) => setNewVersion(e.target.value)} 
                  />
                  <input type="file" multiple onChange={handleFileUploadChange} />
                  <button onClick={handleCreateCheckin}>Check In</button>
                </div>
              )}

              <div className="checkins-list">
                {checkins.length > 0 ? (
                  checkins.map((c) => (
                    <div key={c._id} className="checkin-item">
                      <div className="checkin-header">
                        <span className="user">{c.user?.username}</span>
                        <span className="version">v{c.version}</span>
                        <span className="date">
                          {new Date(c.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="checkin-message">{c.message}</p>
                      {c.files?.length > 0 && (
                        <div className="checkin-files">
                          <strong>Files:</strong>
                          {c.files.map((f, idx) => (
                            <a
                              key={idx}
                              className="file-tag"
                              onClick={(e) => {
                                e.preventDefault();
                                handleDownloadFile(f);
                              }}
                              href="#"
                            >
                              {f.filename}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p>No activity yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {isEditing && (
        <div className="modal">
          <div className="modal-content">
            <EditProject
              project={project}
              projectTypes={projectTypes}
              onSave={() => {
                setIsEditing(false);
                refreshProject();
              }}
              onCancel={() => setIsEditing(false)}
            />
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
};

export default ProjectPage;