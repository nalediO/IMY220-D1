import React from "react";
import ProfilePreview from "./ProfilePreview";
import "../css/Feed.css";

const sampleProjects = [
  {
    id: 1,
    name: "Alice",
    bio: "Frontend Developer",
    image: "/assets/profile.png",
    title: "Weather App",
    description: "A simple React weather app.",
    link: "https://github.com/alice/weather-app",
    createdAt: "2025-09-02T12:00:00Z",
    popularity: 25,
  },
  {
    id: 2,
    name: "Bob",
    bio: "Fullstack Developer",
    image: "/assets/profile.png",
    title: "Task Manager",
    description: "Manage tasks easily with React & Node.",
    link: "https://github.com/bob/task-manager",
    createdAt: "2025-09-01T15:30:00Z",
    popularity: 40,
  },
];

const Feed = ({ feedType }) => {
  const sortedProjects = [...sampleProjects].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  return (
    <div className="feed-container">
      {sortedProjects.map((project) => (
        <div key={project.id} className="feed-item">
          <ProfilePreview profile={project} />

          <div className="project-details">
            <h3>{project.title}</h3>
            <p>{project.description}</p>
            <a href={project.link} target="_blank" rel="noopener noreferrer">
              View Project
            </a>
            <p className="project-meta">
              Created by <strong>{project.name}</strong> | Views:{" "}
              {project.popularity}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Feed;
