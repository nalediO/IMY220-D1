import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "../css/SignInForm.css";

const SignInForm = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { signup } = useAuth();
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

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      // Use the auth context signup function
      await signup({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName
      });
      
      // Redirect to home page on success
      navigate("/home2");
      
    } catch (err) {
      console.error("Signup error:", err);
      
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        setError("Cannot connect to server. Please make sure the backend is running on port 5000.");
      } else {
        setError(err.message || "Signup failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="signin-form">
      {error && <div className="error-message">{error}</div>}
      
      <div className="form-row">
        <input
          type="text"
          name="firstName"
          value={formData.firstName}
          placeholder="First Name"
          onChange={handleChange}
          required
          disabled={loading}
        />
        <input
          type="text"
          name="lastName"
          value={formData.lastName}
          placeholder="Last Name"
          onChange={handleChange}
          required
          disabled={loading}
        />
      </div>

      <input
        type="text"
        name="username"
        value={formData.username}
        placeholder="Username"
        onChange={handleChange}
        required
        disabled={loading}
        minLength={3}
      />

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
        placeholder="Password (min 6 characters)"
        onChange={handleChange}
        required
        disabled={loading}
        minLength={6}
      />

      <input
        type="password"
        name="confirmPassword"
        value={formData.confirmPassword}
        placeholder="Confirm Password"
        onChange={handleChange}
        required
        disabled={loading}
        minLength={6}
      />

      <button type="submit" disabled={loading} className={loading ? "loading" : ""}>
        {loading ? "Creating Account..." : "Sign Up"}
      </button>

      <p className="login-redirect">
        Already have an account? <a href="/login">Log in here</a>
      </p>
    </form>
  );
};

export default SignInForm;