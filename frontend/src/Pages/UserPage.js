// pages/UsersPage.js
import React, { useEffect, useState } from "react";
import { userService } from "../services/api";   // only userService here
import { friendService } from "../services/api"; // ✅ import friendService separately
import UserCard from "../components/userCard";
import Nav from "../components/Nav";
import Footer from "../components/footer";
import "../css/UserPage.css";

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);

      // ✅ Get all users
      const allUsers = await userService.getAllUsers();
      setUsers(allUsers);

      // ✅ Get all requests
      const requests = await friendService.getRequests();

      // Distinguish incoming vs outgoing
      const userId = localStorage.getItem("userId"); // or decode token if you prefer
      const incoming = requests.filter((req) => req.toUserId === userId);
      const outgoing = requests.filter((req) => req.fromUserId === userId);

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

  // ✅ Accept incoming request
  const handleAccept = async (requestId) => {
    try {
      await friendService.acceptFriendRequest(requestId);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  // ✅ Reject incoming request
  const handleReject = async (requestId) => {
    try {
      await friendService.rejectFriendRequest(requestId);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <p>Loading users...</p>;

  return (
    <main className="users-page">
      <Nav />
      <h2>All Users</h2>
      <div className="users-list">
        {users.map((user) => (
          <UserCard
            key={user._id}
            user={user}
            currentRequests={pendingRequests}
            onRequestSent={fetchData}
          />
        ))}
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

      <Footer />
    </main>
  );
};

export default UsersPage;
