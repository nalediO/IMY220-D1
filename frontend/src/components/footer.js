import React from "react";
import { Mail, Phone, Linkedin, Github, Facebook, Instagram } from "lucide-react";
import "../css/Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <h2>MiniHub</h2>
          <p>© {new Date().getFullYear()} All rights reserved.</p>
        </div>

        <div className="footer-links">
          <a href="mailto:example@email.com" className="email" aria-label="Email">
            <Mail size={22} />
          </a>
          <a href="tel:+123456789" className="phone" aria-label="Phone">
            <Phone size={22} />
          </a>
          <a href="https://linkedin.com/in/yourprofile" target="_blank" rel="noreferrer" className="linkedin" aria-label="LinkedIn">
            <Linkedin size={22} />
          </a>
          <a href="https://github.com/yourprofile" target="_blank" rel="noreferrer" className="github" aria-label="GitHub">
            <Github size={22} />
          </a>
          <a href="https://facebook.com/yourprofile" target="_blank" rel="noreferrer" className="facebook" aria-label="Facebook">
            <Facebook size={22} />
          </a>
          <a href="https://instagram.com/yourprofile" target="_blank" rel="noreferrer" className="instagram" aria-label="Instagram">
            <Instagram size={22} />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
