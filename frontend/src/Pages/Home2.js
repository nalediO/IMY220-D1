import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { projectService, userService, friendService } from "../services/api";
import Feed from "../components/Feed";
import SearchInput from "../components/SearchInput";
import Footer from "../components/footer";
import Nav from "../components/Nav";
import Sidebar from "../components/Sidebar";
import "../css/Home.css";

// Simple fuzzy match helper (handles incomplete / misspelled searches)
const fuzzyMatch = (source, target) => {
  if (!source || !target) return false;
  const s = source.toLowerCase();
  const t = target.toLowerCase();
  return s.includes(t) || t.split("").every((ch) => s.includes(ch));
};

const Home = () => {
  const [feedType, setFeedType] = useState("local");
  const [projects, setProjects] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        // Fetch all projects
        const projectsData = await projectService.getAllProjects();
        setAllProjects(projectsData);

        // Local feed = only your and friends' projects
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

        // Fetch all users
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

  //  Main Search Logic
  const handleSearch = (query) => {
    setSearchQuery(query);

    if (!query.trim()) {
      setProjects(allProjects);
      setSuggestions([]);
      return;
    }

    const q = query.toLowerCase();

    // 🔍 Search Projects
    const filteredProjects = allProjects.filter((project) => {
      const title = project.name?.toLowerCase() || "";
      const desc = project.description?.toLowerCase() || "";
      const tags = project.hashtags?.map((t) => t.toLowerCase()) || [];

      return (
        title.includes(q) ||
        desc.includes(q) ||
        tags.some((tag) => tag.includes(q)) ||
        fuzzyMatch(title, q) ||
        fuzzyMatch(desc, q)
      );
    });

    // 👥 Search Users
    const filteredUsers = users.filter((u) => {
      const username = u.username?.toLowerCase() || "";
      const name = u.name?.toLowerCase() || "";
      return (
        username.includes(q) ||
        name.includes(q) ||
        fuzzyMatch(username, q) ||
        fuzzyMatch(name, q)
      );
    });

    // 🧠 Autocomplete suggestions (top 5)
    const projectSuggestions = filteredProjects.slice(0, 3).map((p) => ({
      type: "project",
      label: p.name,
      id: p._id,
    }));
    const userSuggestions = filteredUsers.slice(0, 2).map((u) => ({
      type: "user",
      label: u.username || u.name,
      id: u._id,
    }));
    setSuggestions([...userSuggestions, ...projectSuggestions]);

    // Update feed with found projects
    setProjects(filteredProjects);
  };

  // 🔁 Handle hashtag click
  const handleHashtagSearch = (tag) => {
    handleSearch(`#${tag}`);
  };

  //  Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion.label);
    setSuggestions([]);
    if (suggestion.type === "project") {
      const selectedProject = allProjects.find((p) => p._id === suggestion.id);
      if (selectedProject) setProjects([selectedProject]);
    } else if (suggestion.type === "user") {
      const selectedUser = users.find((u) => u._id === suggestion.id);
      if (selectedUser) {
        // filter projects by that user
        const userProjects = allProjects.filter(
          (p) => p.owner?._id === selectedUser._id
        );
        setProjects(userProjects);
      }
    }
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
          {/*  Search with autocomplete */}
          <div className="search-container">
            <SearchInput
              placeholder="Search projects, users, or hashtags..."
              value={searchQuery}
              onChange={handleSearch}
            />
            {suggestions.length > 0 && (
              <ul className="autocomplete-list">
                {suggestions.map((s, index) => (
                  <li
                    key={index}
                    onClick={() => handleSuggestionClick(s)}
                    className="autocomplete-item"
                  >
                    {s.type === "user" ? "👤 " : "📁 "}
                    {s.label}
                  </li>
                ))}
              </ul>
            )}
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
                ? "Showing activity from your friends’ projects"
                : "Showing activity from all projects"}
            </p>
          </div>

          <section className="feed-section">
            <Feed
              feedType={feedType}
              projects={projects}
              onSearch={handleHashtagSearch}
              searchQuery={searchQuery}
            />
          </section>
        </div>
      </div>
      <Footer />
    </main>
  );
};

export default Home;
