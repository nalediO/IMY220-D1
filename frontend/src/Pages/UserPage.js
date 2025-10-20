// pages/UsersPage.js
import React, { useEffect, useState } from "react";
import { userService } from "../services/api";
import { friendService } from "../services/api";
import UserCard from "../components/UserCard";
import Nav from "../components/Nav";
import Footer from "../components/footer";
import "../css/UserPage.css";

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(""); // ✅ search state

  const fetchData = async () => {
    try {
      setLoading(true);

      // Get all users
      const allUsers = await userService.getAllUsers();
      setUsers(allUsers);

      // Get incoming requests
      const incoming = await friendService.getRequests();

      // Get outgoing requests
      const outgoing = await friendService.getOutgoingRequests();

      setIncomingRequests(incoming);
      setPendingRequests(outgoing);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAccept = async (requestId) => {
    try {
      await friendService.acceptFriendRequest(requestId);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleReject = async (requestId) => {
    try {
      await friendService.rejectFriendRequest(requestId);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <p>Loading users...</p>;

  // ✅ Filter users based on search
  const filteredUsers = users.filter((user) => {
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    return (
      fullName.includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <main>
      <Nav />

      <div className="users-page">
        <h2>All Users</h2>

        {/* ✅ Search input */}
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        <div className="users-list">
          {filteredUsers.length === 0 ? (
            <p>No users found</p>
          ) : (
            filteredUsers.map((user) => (
              <UserCard
                key={user._id}
                user={user}
                currentRequests={pendingRequests}
                onRequestSent={fetchData}
              />
            ))
          )}
        </div>

        <h2>Incoming Friend Requests</h2>
        {incomingRequests.length === 0 && <p>No incoming requests</p>}
        <div className="incoming-requests">
          {incomingRequests.map((req) => (
            <div key={req._id} className="incoming-request-card">
              <img
                src={req.from?.profileImage || "/default-avatar.png"}
                alt={req.from?.username}
                className="avatar"
              />
              <div className="request-info">
                <h4>
                  {req.from?.firstName} {req.from?.lastName}
                </h4>
                <p>@{req.from?.username}</p>
              </div>
              <div className="request-actions">
                <button onClick={() => handleAccept(req._id)}>Accept</button>
                <button onClick={() => handleReject(req._id)}>Reject</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </main>
  );
};

export default UsersPage;
