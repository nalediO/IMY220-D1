import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "../css/LogInForm.css";

const LogInForm = () => {
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
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Use the auth context login function
      await login(formData.email, formData.password);

      // Redirect to home page on success
      navigate("/home2");

    } catch (err) {
      console.error("Login error:", err);
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
        placeholder="Email Address"
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
        {loading ? "Logging in..." : "Log In"}
      </button>

      <p className="signup-redirect">
        Don't have an account? <a href="/signin">Sign up here</a>
      </p>
      
    </form>
  );
};

export default LogInForm;