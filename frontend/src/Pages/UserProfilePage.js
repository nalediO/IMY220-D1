import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { userService, friendService } from "../services/api";
import Nav from "../components/Nav";
import Footer from "../components/footer";
import "../css/UserProfile.css";

const UserProfilePage = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [isFriend, setIsFriend] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const userData = await userService.getUserById(userId);
      setUser(userData);

      // Check friendship
      const friends = await friendService.getFriends();
      const isUserFriend = friends.some((f) => f._id === userId);
      setIsFriend(isUserFriend);
    } catch (err) {
      console.error("Error fetching profile:", err);
      alert("Failed to load profile");
      navigate("/users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const handleUnfriend = async () => {
    try {
      if (window.confirm("Are you sure you want to unfriend this user?")) {
        await friendService.unfriend(userId);
        alert("User unfriended successfully");
        setIsFriend(false);
      }
    } catch (err) {
      alert("Failed to unfriend user");
    }
  };

  if (loading)
    return (
      <div className="user-profile-loading">
        Loading profile...
      </div>
    );

  if (!user)
    return (
      <div className="user-profile-error">
        User not found.
      </div>
    );

  return (
    <main className="user-profile-container">
      <Nav />

      <div className="user-profile-content">
        {/* Profile Header */}
        <div className="profile-header-card">
          <img
            src={user.profileImage ? `http://localhost:5000/${user.profileImage.replace(/^\/?uploads\//, 'uploads/')}` : "/assets/profile.png"}
            alt={user.username}
            className="profile-image"
          />
          <h2 className="profile-name">
            {user.firstName} {user.lastName}
          </h2>
          <p className="profile-username">@{user.username}</p>

          <div className="friend-status-container">
            {isFriend ? (
              <button
                onClick={handleUnfriend}
                className="unfriend-button"
              >
                Unfriend
              </button>
            ) : (
              <p className="not-friends-text">
                (You are not friends)
              </p>
            )}
          </div>
        </div>

        {/* Profile Details */}
        <div className="profile-details-card">
          {isFriend ? (
            <>
              <h3 className="profile-section-title">
                Full Profile
              </h3>
              <div className="profile-info">
                <p>
                  <span className="info-label">Email:</span>{" "}
                  {user.email}
                </p>
                <p>
                  <span className="info-label">Bio:</span>{" "}
                  {user.bio || "No bio yet"}
                </p>
                <p>
                  <span className="info-label">Birthday:</span>{" "}
                  {user.birthday || "Not provided"}
                </p>
              </div>

              {/* Projects */}
              <div style={{ marginTop: '1.5rem' }}>
                <h3 className="profile-section-title">
                  Projects
                </h3>
                {user.projects?.length ? (
                  <ul className="projects-grid">
                    {user.projects.map((p) => (
                      <li
                        key={p._id}
                        className="project-card"
                      >
                        <h4 className="project-title">
                          {p.title}
                        </h4>
                        <p className="project-description">
                          {p.description || "No description provided."}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="no-projects-text">No projects available.</p>
                )}
              </div>

              {/* Friends */}
              <div style={{ marginTop: '1.5rem' }}>
                <h3 className="profile-section-title">
                  Friends
                </h3>
                {user.friends?.length ? (
                  <ul className="friends-grid">
                    {user.friends.map((f) => (
                      <li
                        key={f._id}
                        className="friend-card"
                      >
                        <a href={`/profile/${f._id}`}>
                          <img
                            src={f.profileImage ? `http://localhost:5000/${f.profileImage.replace(/^\/?uploads\//, 'uploads/')}` : "/assets/profile.png"}
                            alt={f.username}
                            className="friend-image"
                          />
                          <p className="friend-name">
                            {f.firstName} {f.lastName}
                          </p>
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="no-friends-text">No friends yet.</p>
                )}
              </div>
            </>
          ) : (
            <div className="non-friends-message">
              <p className="non-friends-text">
                Only name and profile picture are visible for non-friends.
              </p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
};

export default UserProfilePage;