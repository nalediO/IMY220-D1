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

  // File states
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState("");
  const [isEditingFile, setIsEditingFile] = useState(false);

  // Check-in states
  const [newCheckinMessage, setNewCheckinMessage] = useState("");
  const [newFiles, setNewFiles] = useState([]);
  const [isCheckedOut, setIsCheckedOut] = useState(false);

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        setLoading(true);
        setError("");

        const projectData = await projectService.getProject(projectId);
        if (!projectData || !projectData._id) {
          setError("Project not found.");
          return;
        }
        setProject(projectData);
        setIsCheckedOut(projectData.isCheckedOut);

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
      // ✅ field name must match multer.single('file')
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

      const updated = await projectService.getProject(projectId);
      setProject(updated);
      setIsEditingFile(false);
    } catch (err) {
      console.error("Error saving file:", err);
      alert("Could not save file changes.");
    }
  };


  const handleDeleteFile = async (storedName) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/projects/${projectId}/files/${storedName}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Failed to delete file");

      alert("File deleted!");
      setSelectedFile(null);

      const updated = await projectService.getProject(projectId);
      setProject(updated);
    } catch (err) {
      console.error("Error deleting file:", err);
    }
  };

  // =================== PROJECT CHECKIN ===================
  const handleFileUploadChange = (e) => {
    setNewFiles(Array.from(e.target.files));
  };

  const handleCheckOut = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/projects/${projectId}/checkout`,
        { method: "PUT", headers: { Authorization: `Bearer ${token}` } }
      );
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
      setIsCheckedOut(false);

      const updated = await projectService.getProject(projectId);
      setProject(updated);
    } catch (error) {
      console.error("Error creating checkin:", error);
    }
  };

  // =================== UI RENDER ===================
  if (loading) return (
    <main className="project-page">
      <Nav />
      <div className="loading-container">Loading project...</div>
      <Footer />
    </main>
  );

  if (error || !project) return (
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
            <span>Version: {project.currentVersion || "1.0.0"}</span>
            <span>Type: {project.projectType}</span>
            <button onClick={() => setIsEditing(true)} className="edit-btn">
              Edit Project
            </button>
          </div>
        </div>

        <div className="project-body">
          <div className="files-section">
            <h3>Project Files</h3>
            <FilesList
              files={project.files || []}
              onSelect={handleFileSelect}
            />
          </div>

          <div className="content-section">
            {selectedFile ? (
              <div className="file-preview">
                <h4>{selectedFile.originalName}</h4>

                {isEditingFile ? (
                  <>
                    <textarea
                      value={fileContent}
                      onChange={(e) => setFileContent(e.target.value)}
                      rows={15}
                      className="file-textarea"
                    />
                    <button onClick={handleSaveFile}>Save Changes</button>
                    <button onClick={() => setIsEditingFile(false)}>Cancel</button>
                  </>
                ) : (
                  <>
                    <pre className="file-content">{fileContent}</pre>
                    <button onClick={() => setIsEditingFile(true)}>Edit File</button>
                    <button onClick={() => handleDeleteFile(selectedFile.storedName)}>Delete File</button>
                    <a
                      href={`http://localhost:5000/uploads/${selectedFile.storedName}`}
                      download={selectedFile.originalName}
                      className="download-btn"
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

            <div className="checkins-section">
              <h3>Project Activity & Messages</h3>
              {!isCheckedOut ? (
                <button className="checkout-btn" onClick={handleCheckOut}>
                  Check Out Project
                </button>
              ) : (
                <div className="checkin-input">
                  <textarea
                    value={newCheckinMessage}
                    onChange={(e) => setNewCheckinMessage(e.target.value)}
                    placeholder="What did you work on? Add a message..."
                    rows={3}
                  />
                  <input type="file" multiple onChange={handleFileUploadChange} />
                  <button onClick={handleCreateCheckin}>Check In</button>
                </div>
              )}

              <div className="checkins-list">
                {checkins.length > 0 ? (
                  checkins.map((checkin) => (
                    <div key={checkin._id} className="checkin-item">
                      <div className="checkin-header">
                        <span className="user">{checkin.user?.username || "Unknown"}</span>
                        <span className="version">v{checkin.version}</span>
                        <span className="date">{new Date(checkin.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="checkin-message">{checkin.message}</p>
                      {checkin.files && checkin.files.length > 0 && (
                        <div className="checkin-files">
                          <strong>Files updated:</strong>
                          {checkin.files.map((file, index) => (
                            <a
                              key={index}
                              href={`http://localhost:5000/uploads/${file.storedName}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="file-tag"
                            >
                              {file.originalName}
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

      {isEditing && (
        <div className="modal">
          <div className="modal-content">
            <EditProject
              project={project}
              onSave={() => setIsEditing(false)}
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
