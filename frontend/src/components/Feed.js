// src/components/Feed.js
import React, { useState, useEffect, useCallback } from "react";
import { checkinService, friendService } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import "../css/Feed.css";

const Feed = ({ feedType, projects = [], onSearch }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortOption, setSortOption] = useState("recent");
  const { user } = useAuth(); // logged-in user

  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      if (!projects || projects.length === 0) {
        setActivities([]);
        return;
      }

      let allCheckins = [];

      if (feedType === "local") {
        const userProjectIds = projects.map((p) => p._id);
        const results = await Promise.all(
          userProjectIds.map((id) => checkinService.getProjectCheckins(id))
        );
        allCheckins = results.flat().filter(Boolean);
      } else {

        const recentCheckins = [];
        for (const project of projects) {
          try {
            const checkins = await checkinService.getProjectCheckins(project._id);
            recentCheckins.push(...checkins.slice(0, 3));
          } catch (err) {
            console.error(`Error fetching checkins for project ${project._id}:`, err);
          }
        }
        allCheckins = recentCheckins.filter(Boolean);
      }

      if (feedType === "local" && user) {
        const friends = await friendService.getFriends();
        const friendIds = friends.map((f) => f._id.toString());

        allCheckins = allCheckins.filter(
          (checkin) =>
            checkin.user && friendIds.includes(checkin.user._id.toString())
        );
      }

      const sorted = allCheckins.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setActivities(sorted);
    } catch (err) {
      console.error("Error fetching activities:", err);
      setError("Failed to load activity feed. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [feedType, projects.map((p) => p._id).join(",")]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const handleSortChange = (option) => {
    setSortOption(option);
    if (option === "recent") {
      setActivities((prev) =>
        [...prev].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      );
    } else if (option === "popular") {
      setActivities((prev) => [...prev].sort((a, b) => (b.likes || 0) - (a.likes || 0)));
    }
  };

  const handleTagClick = (tag) => {
    if (onSearch) onSearch(`#${tag}`);
  };

  const handleUserClick = (username) => {
    if (onSearch) onSearch(username);
  };

  // send friend request
  const handleAddFriend = async (targetUser) => {
    console.log("Sending friend request to:", targetUser._id)
    try {
      if (!user) {
        alert("You must be logged in to send friend requests.");
        return;
      }
      if (!targetUser || !targetUser._id) {
        alert("Invalid user.");
        return;
      }
      // quick local check
      const isFriend = (user.friends || []).some((id) => id.toString() === targetUser._id.toString());
      if (isFriend) {
        alert("Already friends.");
        return;
      }

      // Call service
      const resp = await friendService.sendFriendRequest(targetUser._id);
      // mark requestSent on activities for this user
      setActivities((prev) =>
        prev.map((act) =>
          act.user && act.user._id && act.user._id.toString() === targetUser._id.toString()
            ? { ...act, requestSent: true }
            : act
        )
      );
      alert(resp.message || `Friend request sent to ${targetUser.username || "user"}`);
    } catch (err) {
      console.error("Failed to send friend request:", err);
      // Show server message if present (axios error shape)
      const serverMsg = err?.response?.data?.message || err?.message || "Error sending friend request";
      alert(serverMsg);
    }
  };

  if (loading) {
    return (
      <div className="feed-loading">
        <div className="loading-spinner"></div>
        <p>Loading activities...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="feed-error">
        <p>{error}</p>
        <button onClick={fetchActivities} className="retry-btn">Try Again</button>
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="feed-empty">
        <h3>No activity yet</h3>
        <p>
          {feedType === "local"
            ? "No recent activity in your projects. Check in some changes to see them here!"
            : "No recent activity across all projects."}
        </p>
      </div>
    );
  }

  return (
    <div className="feed-container">
      <div className="feed-header">
        <h2>{feedType === "local" ? "Your Project Activity" : "Global Activity"}</h2>
        <div className="sort-options">
          <label>Sort by: </label>
          <select value={sortOption} onChange={(e) => handleSortChange(e.target.value)}>
            <option value="recent">Most Recent</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>
      </div>

      {activities.map((activity) => (
        <ActivityItem
          key={activity._id || Math.random()}
          activity={activity}
          onTagClick={handleTagClick}
          onUserClick={handleUserClick}
          onAddFriend={handleAddFriend}
          currentUser={user}
        />
      ))}
    </div>
  );
};

const ActivityItem = ({ activity, onTagClick, onUserClick, onAddFriend, currentUser }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const targetUser = activity.user || {};
  const canAddFriend =
    targetUser._id &&
    currentUser &&
    targetUser._id.toString() !== (currentUser._id || "").toString() &&
    !((currentUser.friends || []).map(String).includes(targetUser._id.toString()));

  return (
    <div className="activity-item">
      <div className="activity-header">
        <div className="user-info">

          <img
            src={
              targetUser.profileImage
                ? `http://localhost:5000/uploads/${targetUser.profileImage.replace(/^\/?uploads\//, "")}`
                : "/assets/profile.png"
            }
            alt={targetUser.username || "User"}
            className="user-avatar"
            onError={(e) => (e.target.src = "/assets/profile.png")}
          />
          <div className="user-details">
            <span className="username clickable" onClick={() => onUserClick(targetUser.username)}>
              {targetUser.username || "Unknown"}
            </span>
            <span className="activity-time">{formatDate(activity.createdAt)}</span>
          </div>
        </div>

        {canAddFriend && !activity.requestSent && (
          <button className="add-friend-btn" onClick={() => onAddFriend(targetUser)}>➕ Add Friend</button>
        )}
        {canAddFriend && activity.requestSent && (
          <button className="add-friend-btn pending" disabled>⏳ Request Sent</button>
        )}

        <span className="type-badge">{activity.type || "Check-in"}</span>
      </div>

      <div className="activity-content">
        <p className="activity-message">{activity.message || "checked in"}</p>

        {activity.project?.image && (
          <img src={activity.project.imageUrl} alt={activity.project.name || "Project"} className="project-image" />
        )}

        {Array.isArray(activity.files) && activity.files.length > 0 && (
          <div className="files-list1">
            <span className="files-label">Files updated:</span>
            {activity.files.slice(0, 3).map((file, index) => (
              <span key={index} className="file-tag">{file.filename}</span>
            ))}
            {activity.files.length > 3 && <span className="more-files">+{activity.files.length - 3} more</span>}
          </div>
        )}

        {activity.version && (
          <div className="version-info">
            <span className="version-label">Version:</span>
            <span className="version-number">v{activity.version}</span>
          </div>
        )}
      </div>

      <div className="activity-footer">
        <div className="project-info">
          <span className="project-name1">{activity.project?.name || "Unnamed Project"}</span>
          {activity.project?.hashtags?.length > 0 && (
            <div className="project-tags">
              {activity.project.hashtags.slice(0, 3).map((tag, idx) => (
                <button key={idx} className="tag" onClick={() => onTagClick(tag)}>#{tag}</button>
              ))}
            </div>
          )}
        </div>

        <div className="activity-actions">
          <button className="action-btn">👍</button>
          <button className="action-btn">💬</button>
          <button className="action-btn">↗️</button>
        </div>
      </div>
    </div>
  );
};

export default Feed;
