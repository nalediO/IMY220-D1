import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { projectService, checkinService } from "../services/api";
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
  const [selectedFile, setSelectedFile] = useState(null);
  const [newCheckinMessage, setNewCheckinMessage] = useState("");
  const [newFiles, setNewFiles] = useState([]);
  const [isCheckedOut, setIsCheckedOut] = useState(false);

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        setLoading(true);
        setError("");

        // Fetch project details
        const projectData = await projectService.getProject(projectId);
        if (!projectData || !projectData._id) {
          setError("Project not found.");
          return;
        }
        setProject(projectData);
        setIsCheckedOut(projectData.isCheckedOut);

        // Fetch checkins for this project
        const checkinsData = await checkinService.getProjectCheckins(projectId);
        setCheckins(checkinsData || []);
      } catch (err) {
        console.error("Error fetching project data:", err);
        setError("Failed to load project.");
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [projectId]);

  const handleEdit = (updatedProject) => {
    setProject(updatedProject);
    setIsEditing(false);
  };

  const handleFileSelect = (file) => {
    setSelectedFile(file);
  };

  const handleFileUploadChange = (e) => {
    setNewFiles(Array.from(e.target.files));
  };

  const handleCheckOut = async () => {
    try {
      // backend route: PUT /projects/:id/checkout
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/projects/${projectId}/checkout`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to check out project");
      setIsCheckedOut(true);
    } catch (error) {
      console.error("Checkout failed:", error);
      alert("Could not check out project.");
    }
  };

  const handleCreateCheckin = async () => {
    if (!newCheckinMessage.trim() && newFiles.length === 0) return;

    try {
      const newCheckin = await checkinService.createCheckin({
        projectId,
        message: newCheckinMessage,
        version: project.currentVersion || "1.0.0",
        files: newFiles,
      });

      setCheckins([newCheckin, ...checkins]);
      setNewCheckinMessage("");
      setNewFiles([]);
      setIsCheckedOut(false); // reset lock
    } catch (error) {
      console.error("Error creating checkin:", error);
    }
  };

  if (loading) {
    return (
      <main className="project-page">
        <Nav />
        <div className="loading-container">Loading project...</div>
        <Footer />
      </main>
    );
  }

  if (error || !project) {
    return (
      <main className="project-page">
        <Nav />
        <div className="error-container">{error || "Project not found."}</div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="project-page">
      <Nav />
      <section className="main-content">
        <div className="project-header">
          <h1>{project.name}</h1>
          <p>{project.description}</p>
          <div className="project-meta">
            <span>Version: {project.currentVersion || "1.0.0"}</span>
            <span>Type: {project.projectType}</span>
            <button onClick={() => setIsEditing(true)} className="edit-btn">
              Edit Project
            </button>
          </div>
        </div>

        <div className="project-body">
          {/* Files Sidebar */}
          <div className="files-section">
            <h3>Project Files</h3>
            <FilesList files={project.files || []} onSelect={handleFileSelect} />
          </div>

          {/* Main Content Area */}
          <div className="content-section">
            {/* File Preview */}
            {selectedFile ? (
              <div className="file-preview">
                <h4>{selectedFile.filename || selectedFile.name}</h4>
                <a
                  href={`http://localhost:5000${selectedFile.fileUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="download-btn"
                >
                  Download File
                </a>
              </div>
            ) : (
              <div className="no-file-selected">
                <p>Select a file to view its content</p>
              </div>
            )}

            {/* Checkins/Messages Section */}
            <div className="checkins-section">
              <h3>Project Activity & Messages</h3>

              {/* Checkout / Checkin */}
              {!isCheckedOut ? (
                <button className="checkout-btn" onClick={handleCheckOut}>
                  Check Out Project
                </button>
              ) : (
                <div className="checkin-input">
                  <textarea
                    value={newCheckinMessage}
                    onChange={(e) => setNewCheckinMessage(e.target.value)}
                    placeholder="What did you work on? Add a message about your changes..."
                    rows={3}
                  />
                  <input type="file" multiple onChange={handleFileUploadChange} />
                  <button onClick={handleCreateCheckin}>Check In</button>
                </div>
              )}

              {/* Display Checkins */}
              <div className="checkins-list">
                {checkins.length > 0 ? (
                  checkins.map((checkin) => (
                    <div key={checkin._id} className="checkin-item">
                      <div className="checkin-header">
                        <span className="user">{checkin.user?.username || "Unknown"}</span>
                        <span className="version">v{checkin.version}</span>
                        <span className="date">
                          {new Date(checkin.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="checkin-message">{checkin.message}</p>
                      {checkin.files && checkin.files.length > 0 && (
                        <div className="checkin-files">
                          <strong>Files updated:</strong>
                          {checkin.files.map((file, index) => (
                            <a
                              key={index}
                              href={`http://localhost:5000${file.fileUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="file-tag"
                            >
                              {file.filename}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p>No activity yet. Be the first to check in!</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Edit Modal */}
      {isEditing && (
        <div className="modal">
          <div className="modal-content">
            <EditProject
              project={project}
              onSave={handleEdit}
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
