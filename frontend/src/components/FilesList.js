import React from "react";
import "../css/FilesList.css";

const FilesList = ({ files = [], onSelect }) => {
  if (files.length === 0) {
    return <p className="no-files">No files uploaded yet.</p>;
  }

  return (
    <ul className="files-list">
      {files.map((file) => (
        <li
          key={file.storedName || file.originalName}
          className="file-item"
          onClick={() => onSelect(file)}
        >
          <span className="file-name">{file.originalName}</span>
          <span className="file-date">
            {new Date(file.uploadDate).toLocaleDateString()}
          </span>
        </li>
      ))}
    </ul>
  );
};

export default FilesList;
