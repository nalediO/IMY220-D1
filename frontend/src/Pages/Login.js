import React from "react";
import LogInForm from "../components/LogInForm";
import Footer from "../components/footer";
import { Link } from "react-router-dom";
import BackButton from "../components/BackButton";
import "../css/LogIn.css"; 

const Login = () => {
  return (
    <main className="login-page">
      <header className="login-header">
        <BackButton />
        <nav className="login-nav">
          <Link to="/signin" className="nav-link">Sign Up</Link>
          <Link to="/login" className="nav-link">Log In</Link>
        </nav>
      </header>

      <section className="login-content">
        <h1 className="login-title">Log In</h1>
        <LogInForm />
      </section>

      <Footer />
    </main>
  );
};

export default Login;
