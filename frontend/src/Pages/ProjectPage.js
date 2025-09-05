import React, { useState } from "react";
import FilesList from "../components/FilesList";
import Messages from "../components/Messages";
import EditProject from "../components/EditProject";
import Nav from "../components/Nav"
import Footer from "../components/footer";
import "../css/ProjectPage.css";

const ProjectPage = ({ project }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleEdit = (updatedProject) => {
    console.log("Updated Project:", updatedProject);
    setIsEditing(false);
  };

  return (
    <main className="project-page">

      <Nav/>
      <section className="main-content">
        <div className="project-body">
          {/* Files Sidebar */}
          <div className="files-section">
            <h3>Files</h3>
            <FilesList files={project.files} onSelect={setSelectedFile} />
          </div>

          {/* File Preview + Messages */}
          <div className="content-section">
            {/* File Preview */}
            {selectedFile ? (
              <div className="file-preview">
                <h4 className="file-title">📄 {selectedFile.name}</h4>
                <textarea
                  className="file-textarea"
                  value={`// Preview of ${selectedFile.name}\n// File content would load here...`}
                  readOnly
                  rows={1}
                  onInput={(e) => {
                    e.target.style.height = "auto";
                    e.target.style.height = `${e.target.scrollHeight}px`;
                  }}
                />
              </div>
            ) : (
              <p className="no-file">Select a file to preview its content</p>
            )}

            {/* Messages Section */}
            <div className="messages-section">
              <Messages messages={project.messages} />
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

      <Footer/>
    </main>
  );
};

export default ProjectPage;
