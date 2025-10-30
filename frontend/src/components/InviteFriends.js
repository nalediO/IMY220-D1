import React, { useState, useEffect } from "react";
import { friendService, projectService } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

function InviteFriends({ projectId }) {
  const { user } = useAuth();
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState("");

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const data = await friendService.getFriends();
        setFriends(data);
      } catch (err) {
        console.error("Failed to fetch friends:", err);
      }
    };
    fetchFriends();
  }, []);

  const handleInvite = async () => {
    if (!selectedFriend) return alert("Please select a friend");
    try {
      await projectService.addMember(projectId, selectedFriend);
      alert("Friend added to project!");
      setSelectedFriend("");
    } catch (err) {
      console.error("Error adding member:", err);
      alert(err.message || "Failed to add member");
    }
  };

  return (
    <div className="invite-friends">
      <h4>Invite Friend to Project</h4>
      <select
        value={selectedFriend}
        onChange={(e) => setSelectedFriend(e.target.value)}
      >
        <option value="">-- Select a Friend --</option>
        {friends.map((f) => (
          <option key={f._id} value={f._id}>
            {f.firstName} {f.lastName}
          </option>
        ))}
      </select>
      <button onClick={handleInvite}>Add</button>
    </div>
  );
}

export default InviteFriends;
