// Install this package first: npm install react-icons
import React from 'react';
import { FaPhone, FaEnvelope, FaLinkedin, FaGithub, FaTwitter } from 'react-icons/fa';
import { SiLeetcode } from 'react-icons/si';
import './contact.css';
import { Link } from 'wouter';

const ContactSection = () => {
  return (
    <div className="contact-container">
      <div className="contact-content">
        <h1>Get In Touch</h1>
        <div className="contact-links">
          <a href="tel:+91-9405XXXXXX" className="contact-link-item">
            <FaPhone />
            <span>+91-9405XXXXXX</span>
          </a>
          <a href="mailto:samar.shetye03@gmail.com" className="contact-link-item">
            <FaEnvelope />
            <span>Email</span>
          </a>
          <a href="https://www.linkedin.com/in/samar-shetye-86295432b?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" target="_blank" rel="noopener noreferrer" className="contact-link-item">
            <FaLinkedin />
            <span>LinkedIn</span>
          </a>
          <a href="https://github.com/Samar-365" target="_blank" rel="noopener noreferrer" className="contact-link-item">
            <FaGithub />
            <span>GitHub</span>
          </a> {/* Corrected: Added the closing </a> tag here */}
          <a href="https://x.com/samarshetye?t=k_bubdt1LJSDfQImIH6Jvg&s=09" target="_blank" rel="noopener noreferrer" className="contact-link-item">
            <FaTwitter />
            <span>Twitter</span>
          </a>
        </div>
      </div>
      
    </div>
  );
};

export default ContactSection;