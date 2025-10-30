
import React from "react";
import { Link } from "react-router-dom";
import Footer from "../components/footer";
import '../css/SplashPage.css';



const SplashPage = () => {
  return (
    <main className="splash-main">
      {/* Navbar */}
      <header className="splash-header">
        <h1>MiniHub</h1>
        <nav>
          <Link to="/login">Log In</Link>
          <Link to="/signin" className="signup-btn">
            Sign Up
          </Link>
          <Link to="/admin-login">Admin</Link> 
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <h1>
          Welcome to <span>MiniHub</span>
        </h1>
        <p>
          Discover and showcase amazing projects from developers around the
          world. Join our community to share your own work, collaborate with
          others, and take your coding skills to the next level.
        </p>
        <Link to="/signin" className="get-started-btn">
          Get Started
        </Link>

        <img src="/assets/freepik__background__173.png" alt="Hero" className="hero-image" />
      </section>

      {/* Info Section */}
      <section className="info-section">
        <h3>Start Your Journey</h3>
        <p>
          Create an account to explore projects, follow developers, and build
          your own portfolio today.
        </p>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  );
};

export default SplashPage;
