
import React from "react";
import CreateProject from "./CreateProject";

const EditProject = ({ project, onSave, onCancel }) => {
  const handleSave = async (formData) => {
    await onSave(formData, project._id);
    onCancel(); 
  };

  return (
    <CreateProject
      initialData={project}
      onCreate={handleSave}
      onCancel={onCancel}
      isInline={false}
    />
  );
};

export default EditProject;
