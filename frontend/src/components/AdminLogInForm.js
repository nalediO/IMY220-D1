import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "../css/LogInForm.css";

const AdminLogInForm = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const user = await login(formData.email, formData.password);

      // Check if the user is admin
      if (user.role !== "admin") {
        setError("Access denied: not an admin user.");
        return;
      }

      // Redirect admin to dashboard
      navigate("/admin");

    } catch (err) {
      console.error("Admin login error:", err);
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="login-form">
      {error && <div className="error-message">{error}</div>}

      <input
        type="email"
        name="email"
        value={formData.email}
        placeholder="Admin Email"
        onChange={handleChange}
        required
        disabled={loading}
      />

      <input
        type="password"
        name="password"
        value={formData.password}
        placeholder="Password"
        onChange={handleChange}
        required
        disabled={loading}
      />

      <button type="submit" disabled={loading} className={loading ? "loading" : ""}>
        {loading ? "Logging in..." : "Admin Login"}
      </button>
    </form>
  );
};

export default AdminLogInForm;
