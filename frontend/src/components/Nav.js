import React from 'react';
import { Link } from 'react-router-dom';
import '../css/Nav.css';

const Nav = () => {
  return (
    <nav className="navbar">
      <div className="nav-logo">MiniHub</div>
      <div className="nav-links">
        <Link to="/home2">Home</Link>
        <Link to="/profile">Profile</Link>
        <Link to="/project">Projects</Link>
        <Link to="/UserPage">User</Link> 
        <Link to="/">Logout</Link>
      </div>
    </nav>
  );
};

export default Nav;
