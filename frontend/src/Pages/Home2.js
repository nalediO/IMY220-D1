import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { projectService, friendService } from "../services/api";
import Feed from "../components/Feed";
import SearchInput from "../components/SearchInput";
import Footer from "../components/footer";
import Nav from "../components/Nav";
import Sidebar from "../components/Sidebar";
import "../css/Home.css";

const Home = () => {
  const [feedType, setFeedType] = useState("local");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError("");

        const allProjects = await projectService.getAllProjects();

        if (feedType === "local" && user) {

          const friends = await friendService.getFriends();
          const friendIds = friends.map((f) => f._id);

          const friendProjects = allProjects.filter(
          (project) =>
            friendIds.includes(project.owner?._id) ||
            project.members?.some((m) => friendIds.includes(m._id))
          );
          
          console.log(friendProjects);
          console.log("was not right22");
          console.log(allProjects);
          setProjects(friendProjects);
        } else {
           console.log("was not right22");

          setProjects(allProjects);
        }
      } catch (err) {
        console.error("Error fetching projects:", err);
        setError("Failed to load projects. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [feedType, user]);

  const handleSwitchFeed = (type) => setFeedType(type);

  const handleSearch = (query) => {
    console.log("Search for:", query);
    // Add routing or search functionality here
  };

  if (loading) {
    return (
      <main className="home-page">
        <Nav />
        <div className="home-content">
          <Sidebar />
          <div className="main-feed">
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading projects...</p>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  if (error) {
    return (
      <main className="home-page">
        <Nav />
        <div className="home-content">
          <Sidebar />
          <div className="main-feed">
            <div className="error-container">
              <p className="error-message">{error}</p>
              <button onClick={() => window.location.reload()} className="retry-button">
                Try Again
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="home-page">
      <Nav />
      <div className="home-content">
        <Sidebar />

        <div className="main-feed">
          <div className="search-container">
            <SearchInput placeholder="Search projects or users..." />
          </div>

          <div className="feed-switcher">
            <h2>Activity Feed</h2>
            <div className="feed-buttons">
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
            <p className="feed-info">
              {feedType === "local"
                ? "Showing activity from your projects"
                : "Showing activity from all projects"}
            </p>
          </div>

          <section className="feed-section">
            <Feed feedType={feedType} projects={projects} onSearch={handleSearch} />
          </section>
        </div>
      </div>
      <Footer />
    </main>
  );
};

export default Home;
