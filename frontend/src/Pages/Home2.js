import React, { useState } from "react";
import Feed from "../components/Feed";
import SearchInput from "../components/SearchInput";
import Footer from "../components/footer";
import Nav from "../components/Nav";
import Sidebar from "../components/Sidebar"; 
import "../css/Home.css";

const Home = () => {
  const [feedType, setFeedType] = useState("local");


  const userProjects = [
  {
    id: 1,
    title: "Weather App",   
    name: "Weather App",   
    description: "A simple app that shows weather forecasts.",
    files: [
      { id: 1, name: "App.js" },
      { id: 2, name: "WeatherService.js" },
    ],
    messages: [
      { id: 1, text: "Initial commit with basic structure" },
      { id: 2, text: "Added weather API integration" },
    ],
  },
  {
    id: 2,
    title: "Task Manager",
    name: "Task Manager",
    description: "A productivity tool to manage tasks.",
    files: [
      { id: 1, name: "index.html" },
      { id: 2, name: "tasks.js" },
    ],
    messages: [
      { id: 1, text: "Set up project scaffold" },
      { id: 2, text: "Implemented add/delete task" },
    ],
  },
  {
    id: 3,
    title: "Portfolio Website",
    name: "Portfolio Website",
    description: "A personal portfolio site.",
    files: [
      { id: 1, name: "index.html" },
      { id: 2, name: "style.css" },
    ],
    messages: [
      { id: 1, text: "Initial upload with homepage" },
      { id: 2, text: "Added project showcase section" },
    ],
  },
];


  const handleSwitchFeed = (type) => {
    setFeedType(type);
  };

  return (
    <main className="home-page">
      <Nav />

      <div className="home-content">
        {/* Sidebar on the left */}
        <Sidebar projects={userProjects} />

        {/*  Main section */}
        <div className="main-feed">
          <div className="search-container">
            <SearchInput placeholder="Search projects or users..." />
          </div>

          <div className="feed-switcher">
            <h2>Feed</h2>
            <button
              className={feedType === "local" ? "active" : ""}
              onClick={() => handleSwitchFeed("local")}
            >
              Local Feed
            </button>
            <button
              className={feedType === "global" ? "active" : ""}
              onClick={() => handleSwitchFeed("global")}
            >
              Global Feed
            </button>
          </div>

          <section className="feed-section">
            <Feed feedType={feedType} />
          </section>
        </div>
      </div>

      <Footer />
    </main>
  );
};

export default Home;
