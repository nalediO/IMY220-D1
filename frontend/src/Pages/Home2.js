import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { projectService, userService, friendService } from "../services/api";
import Feed from "../components/Feed";
import SearchInput from "../components/SearchInput";
import Footer from "../components/footer";
import Nav from "../components/Nav";
import Sidebar from "../components/Sidebar";
import "../css/Home.css";

const Home = () => {
  const [feedType, setFeedType] = useState("local");
  const [projects, setProjects] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        // ✅ Get all projects
        const projectsData = await projectService.getAllProjects();
        setAllProjects(projectsData);

        // ✅ Filter for local feed if required
        if (feedType === "local" && user) {
          const friends = await friendService.getFriends();
          const friendIds = friends.map((f) => f._id);

          const friendProjects = projectsData.filter(
            (project) =>
              friendIds.includes(project.owner?._id) ||
              project.members?.some((m) => friendIds.includes(m._id))
          );

          setProjects(friendProjects);
        } else {
          setProjects(projectsData);
        }

        // ✅ Get all users
        const usersData = await userService.getAllUsers();
        setUsers(usersData);

      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [feedType, user]);

  // ✅ Search function
  const handleSearch = (query) => {
    setSearchQuery(query);

    // Filter projects
    const filteredProjects = allProjects.filter((project) => {
      const searchLower = query.toLowerCase();
      const messageMatch = project.message?.toLowerCase().includes(searchLower);
      const typeMatch = project.projectType?.toLowerCase().includes(searchLower);
      const hashtagMatch = project.hashtags?.some((tag) =>
        tag.toLowerCase().includes(searchLower)
      );

      return messageMatch || typeMatch || hashtagMatch;
    });

    setProjects(filteredProjects);

    // Optional: Filter users (if you want to show user search results)
    // const filteredUsers = users.filter((u) => {
    //   const searchLower = query.toLowerCase();
    //   return (
    //     u.username.toLowerCase().includes(searchLower) ||
    //     u.firstName.toLowerCase().includes(searchLower) ||
    //     u.lastName.toLowerCase().includes(searchLower) ||
    //     u.email?.toLowerCase().includes(searchLower)
    //   );
    // });
    // setUsers(filteredUsers);
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
              <button
                onClick={() => window.location.reload()}
                className="retry-button"
              >
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
            <SearchInput
              placeholder="Search projects or users..."
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>

          <div className="feed-switcher">
            <h2>Activity Feed</h2>
            <div className="feed-buttons">
              <button
                className={feedType === "local" ? "active" : ""}
                onClick={() => setFeedType("local")}
              >
                Local Feed
              </button>
              <button
                className={feedType === "global" ? "active" : ""}
                onClick={() => setFeedType("global")}
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
