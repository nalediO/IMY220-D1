import React from "react";
import "../css/FilesList.css";

const FilesList = ({ files, onSelect }) => {
  return (
    <div className="files-list">
      {files && files.length > 0 ? (
        <ul>
          {files.map((file, index) => (
            <li
              key={file._id || file.id || index}
              className="file-item"
              onClick={() => onSelect(file)}
            >
              📄 {file.filename || file.name}
            </li>
          ))}
        </ul>
      ) : (
        <p>No files in this project yet.</p>
      )}
    </div>
  );
};

export default FilesList;