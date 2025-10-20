// api.js
const API_BASE_URL = 'http://localhost:5000/api';
import axios from 'axios';

// Helper function for non-file requests
const apiRequest = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'API request failed');
  }

  return await response.json();
};

// ====================== USER SERVICE ======================
export const userService = {
  login: (credentials) =>
    apiRequest('/users/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  register: (userData) =>
    apiRequest('/users/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  getProfile: async (id) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`http://localhost:5000/api/users/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error("Server error");
    return res.json();
  },

  // updateProfile: async (id, data) => {
  //   const token = localStorage.getItem("token");
  //   const res = await fetch(`http://localhost:5000/api/users/${id}`, {
  //     method: "PUT",
  //     headers: {
  //       "Content-Type": "application/json",
  //       Authorization: `Bearer ${token}`,
  //     },
  //     body: JSON.stringify(data),
  //   });
  //   if (!res.ok) throw new Error("Server error");
  //   return res.json();
  // },


  updateProfile: async (id, data, isFormData = false) => {
    const token = localStorage.getItem("token");
  
    const headers = {
      Authorization: `Bearer ${token}`,
    };
  

    if (!isFormData) {
      headers["Content-Type"] = "application/json";
    }
  
    const res = await fetch(`http://localhost:5000/api/users/${id}`, {
      method: "PUT",
      headers,
      body: isFormData ? data : JSON.stringify(data),
    });
  
    if (!res.ok) throw new Error("Server error");
    return res.json();
  },

  getAllUsers: async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE_URL}/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error("Failed to fetch users");
    return res.json();
  },

  getUserById: async (id) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`http://localhost:5000/api/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to fetch user");
    return res.json();
  },
  
};

// ====================== FRIEND SERVICE ======================
export const friendService = {
  //  Send friend request
  sendFriendRequest: async (friendId) => {
    if (!friendId) throw new Error("friendId is required");

    const token = localStorage.getItem("token");
    const res = await axios.post(
      `${API_BASE_URL}/friends/request`,
      { toUserId: friendId },
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json",
        },
      }
    );
    return res.data;
  },

  //  Re-send a friend request
  resendFriendRequest: async (friendId) => {
    if (!friendId) throw new Error("friendId is required");

    const token = localStorage.getItem("token");

    // Optional: First cancel any old request to avoid duplicate errors
    try {
      await axios.delete(`${API_BASE_URL}/friends/request/${friendId}`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
    } catch (err) {
      // Ignore if request does not exist
      console.warn("No existing request to cancel before resending:", err.message);
    }

    // Now send again
    const res = await axios.post(
      `${API_BASE_URL}/friends/request`,
      { toUserId: friendId },
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json",
        },
      }
    );
    return res.data;
  },

  //  Accept a friend request
  acceptFriendRequest: async (requestId) => {
    if (!requestId) throw new Error("requestId is required");
    const token = localStorage.getItem("token");
    const res = await axios.post(
      `${API_BASE_URL}/friends/request/${requestId}/accept`,
      {},
      { headers: { Authorization: token ? `Bearer ${token}` : "" } }
    );
    return res.data;
  },

  //  Reject a friend request
  rejectFriendRequest: async (requestId) => {
    if (!requestId) throw new Error("requestId is required");
    const token = localStorage.getItem("token");
    const res = await axios.post(
      `${API_BASE_URL}/friends/request/${requestId}/reject`,
      {},
      { headers: { Authorization: token ? `Bearer ${token}` : "" } }
    );
    return res.data;
  },

  //  Cancel your own outgoing request
  cancelFriendRequest: async (requestId) => {
    if (!requestId) throw new Error("requestId is required");
    const token = localStorage.getItem("token");
    const res = await axios.delete(
      `${API_BASE_URL}/friends/request/${requestId}`,
      { headers: { Authorization: token ? `Bearer ${token}` : "" } }
    );
    return res.data;
  },

  //  Get all friends of current user
  getFriends: () => apiRequest("/friends"),

  //  Remove an existing friend
  unfriend: async (friendId) => {
    const token = localStorage.getItem("token");
    const res = await axios.delete(`${API_BASE_URL}/friends/${friendId}`, {
      headers: { Authorization: token ? `Bearer ${token}` : "" },
    });
    return res.data;
  },

  //  Get all pending friend requests (incoming & outgoing)
  getRequests: async () => {
    const token = localStorage.getItem("token");
    const res = await axios.get(`${API_BASE_URL}/friends/requests`, {
      headers: { Authorization: token ? `Bearer ${token}` : "" },
    });
    return res.data;
  },

  getOutgoingRequests: async () => {
    const token = localStorage.getItem("token");
    const res = await axios.get(`${API_BASE_URL}/friends/requests/outgoing`, {
      headers: { Authorization: token ? `Bearer ${token}` : "" },
    });
    return res.data;
  },


};


// ====================== PROJECT SERVICE ======================
export const projectService = {
  
  getAllProjects: () => apiRequest('/projects'),

  getProject: (projectId) => apiRequest(`/projects/${projectId}`),

  createProject: async (projectData) => {
    const token = localStorage.getItem('token');
    const formData = new FormData();

    // Append text fields
    formData.append('name', projectData.name);
    formData.append('type', projectData.type);
    formData.append('description', projectData.description);
    formData.append('version', projectData.version);
    formData.append('ownerId', projectData.ownerId);

    // Append tags
    if (Array.isArray(projectData.tags)) {
      projectData.tags.forEach((tag) => formData.append('tags', tag));
    }

    // Append files
    if (Array.isArray(projectData.files)) {
      projectData.files.forEach((file) => formData.append('files', file));
    }

    // Append image
    if (projectData.image) {
      formData.append('image', projectData.image);
    }

    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to create project');
    }

    return await response.json();
  },

updateProject: async (project, token) => {
  //  Validate input
  const projectId = project._id || project.id;
  if (!projectId) {
    console.error("updateProject called without a valid ID:", project);
    throw new Error("Project ID is missing.");
  }

  console.log("updateProject received:", project._id);

  //  Build form data
  const formData = new FormData();
  // Send the project data (excluding files and image) as JSON
  const { newFiles, newImage, ...projectData } = project;
  formData.append("project", JSON.stringify(projectData));


  if (Array.isArray(newFiles) && newFiles.length > 0) {
    newFiles.forEach(file => formData.append("files", file));
  }

  if (newImage) {
    formData.append("image", newImage);
  }

  const res = await axios.put(
    `${API_BASE_URL}/projects/${project._id}`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return res.data;
},


  deleteProject: async (id) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/projects/${id}`, {
      method: "DELETE",
      headers: { Authorization: token ? `Bearer ${token}` : "" },
    });
    if (!res.ok) throw new Error("Failed to delete project");
    return res.json();
  },

  searchProjects: (query) => apiRequest(`/projects/search/${query}`),
};

// ====================== CHECKIN SERVICE ======================
export const checkinService = {
  getProjectCheckins: async (projectId) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE_URL}/checkins/project/${projectId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to fetch checkins");
    return res.json();
  },

  createCheckin: async ({ projectId, message, version, files = [] }) => {
    const token = localStorage.getItem("token");
    const formData = new FormData();

    //  Attach message + version
    formData.append("message", message);
    formData.append("version", version);

    //  Attach files
    files.forEach((file) => {
      formData.append("files", file);
    });

    const res = await fetch(`${API_BASE_URL}/projects/${projectId}/checkin`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        //  Do NOT set Content-Type manually – browser will set multipart boundary
      },
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to create checkin");
    }

    return res.json();
  },
};
