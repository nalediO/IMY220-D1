// src/components/EditProject.js
import React from "react";
import CreateProject from "./CreateProject";

const EditProject = ({ project, onSave, onCancel }) => {
  return (
    <CreateProject
      initialData={project}
      onCreate={(formData) => onSave(formData, project._id)}   //
      onCancel={onCancel}
      isInline={false}
    />


  );
};

export default EditProject;
