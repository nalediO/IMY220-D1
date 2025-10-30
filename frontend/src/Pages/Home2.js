import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { projectService, userService, friendService } from "../services/api";
import Feed from "../components/Feed";
import SearchInput from "../components/SearchInput";
import Footer from "../components/footer";
import Nav from "../components/Nav";
import Sidebar from "../components/Sidebar";
import "../css/Home.css";

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
  // 🔍 Main Search Logic (only username + hashtags)
  const handleSearch = (query) => {
    setSearchQuery(query);

    if (!query.trim()) {
      setProjects(allProjects);
      setSuggestions([]);
      return;
    }

    const q = query.toLowerCase();

    // 👥 Search Users (username only)
    const filteredUsers = users.filter((u) => {
      const username = u.username?.toLowerCase() || "";
      return username.includes(q) || fuzzyMatch(username, q);
    });

    // 🏷️ Search Hashtags (from all projects)
    const hashtagProjects = allProjects.filter((project) =>
      project.hashtags?.some((tag) => tag.toLowerCase().includes(q.replace("#", "")))
    );

    // 🧠 Autocomplete suggestions (usernames + hashtags)
    const userSuggestions = filteredUsers.slice(0, 3).map((u) => ({
      type: "user",
      label: u.username,
      id: u._id,
    }));

    // collect unique hashtags
    const hashtagSuggestions = [];
    allProjects.forEach((project) => {
      project.hashtags?.forEach((tag) => {
        if (tag.toLowerCase().includes(q.replace("#", ""))) {
          if (!hashtagSuggestions.some((h) => h.label === `#${tag}`)) {
            hashtagSuggestions.push({
              type: "hashtag",
              label: `#${tag}`,
            });
          }
        }
      });
    });

    setSuggestions([...userSuggestions, ...hashtagSuggestions.slice(0, 3)]);

    // 🎯 When user types a hashtag, update feed to show matching projects
    if (q.startsWith("#")) {
      setProjects(hashtagProjects);
    } else {
      // otherwise, show projects by user (owner)
      const selectedUsernames = filteredUsers.map((u) => u._id);
      const userProjects = allProjects.filter(
        (p) => selectedUsernames.includes(p.owner?._id)
      );
      setProjects(userProjects);
    }
  };

  //  Handle hashtag click
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
