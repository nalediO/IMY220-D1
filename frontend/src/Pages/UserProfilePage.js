import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { userService, friendService } from "../services/api";

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
      <div className="flex justify-center items-center h-screen text-gray-500">
        Loading profile...
      </div>
    );

  if (!user)
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        User not found.
      </div>
    );

  return (
    <main className="min-h-screen flex flex-col bg-gray-50">
      {/* Profile Header */}
      <div className="flex flex-col items-center mt-10 px-6">
        <div className="bg-white rounded-2xl shadow-lg w-full max-w-2xl p-6 text-center">
          <img
            src={user.profileImage || "/default-avatar.png"}
            alt={user.username}
            className="w-32 h-32 rounded-full mx-auto border-4 border-blue-500 shadow-md"
          />
          <h2 className="text-2xl font-semibold mt-4 text-gray-800">
            {user.firstName} {user.lastName}
          </h2>
          <p className="text-gray-500">@{user.username}</p>

          <div className="mt-4">
            {isFriend ? (
              <button
                onClick={handleUnfriend}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl transition-all"
              >
                Unfriend
              </button>
            ) : (
              <p className="text-sm text-gray-400 italic">
                (You are not friends)
              </p>
            )}
          </div>
        </div>

        {/* Profile Details */}
        <div className="bg-white rounded-2xl shadow-md w-full max-w-2xl mt-6 p-6">
          {isFriend ? (
            <>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                Full Profile
              </h3>
              <div className="text-gray-600 space-y-2">
                <p>
                  <span className="font-medium text-gray-800">Email:</span>{" "}
                  {user.email}
                </p>
                <p>
                  <span className="font-medium text-gray-800">Bio:</span>{" "}
                  {user.bio || "No bio yet"}
                </p>
                <p>
                  <span className="font-medium text-gray-800">Birthday:</span>{" "}
                  {user.birthday || "Not provided"}
                </p>
              </div>

              {/* Projects */}
              <div className="mt-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  Projects
                </h3>
                {user.projects?.length ? (
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {user.projects.map((p) => (
                      <li
                        key={p._id}
                        className="p-4 bg-blue-50 rounded-xl border border-blue-200 shadow-sm hover:bg-blue-100 transition"
                      >
                        <h4 className="font-semibold text-gray-800">
                          {p.title}
                        </h4>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {p.description || "No description provided."}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No projects available.</p>
                )}
              </div>

              {/* Friends */}
              <div className="mt-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  Friends
                </h3>
                {user.friends?.length ? (
                  <ul className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {user.friends.map((f) => (
                      <li
                        key={f._id}
                        className="flex flex-col items-center bg-gray-50 p-3 rounded-lg shadow-sm hover:shadow-md transition"
                      >
                        <Link to={`/profile/${f._id}`} className="flex flex-col items-center">
                          <img
                            src={f.profileImage || "/default-avatar.png"}
                            alt={f.username}
                            className="w-16 h-16 rounded-full border border-gray-300"
                          />
                          <p className="mt-2 text-sm text-gray-700 font-medium">
                            {f.firstName} {f.lastName}
                          </p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No friends yet.</p>
                )}
              </div>
            </>
          ) : (
            <div className="text-center text-gray-500">
              <p className="text-lg">
                Only name and profile picture are visible for non-friends.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default UserProfilePage;
