import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import "../css/BackButton.css"; 

const BackButton = () => {
  const navigate = useNavigate();

  return (
    <button onClick={() => navigate(-1)} className="back-button">
      <ArrowLeft size={20} />
      <span>Back</span>
    </button>
  );
};

export default BackButton;
