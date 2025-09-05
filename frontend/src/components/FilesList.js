
import React from "react";
import "../css/FilesList.css";

const FilesList = ({ files, onSelect  }) => {
  return (
    <div className="files-list">
      {files && files.length > 0 ? (
        <ul>
          {files.map((file) => (
            <li
              key={file.id}
              className="file-item"
              onClick={() => onSelect(file)}
            >
              📄 {file.name}
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
