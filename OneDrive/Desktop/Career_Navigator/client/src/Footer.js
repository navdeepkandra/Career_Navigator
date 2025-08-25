import React from 'react';
// Import the icons you want to use
import { FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="Footer">
      <div className="FooterText">
        Made with ❤️ by Navdeep
      </div>
      <div className="Socials">
        {/* Replace '#' with your actual profile URLs */}
        <a href="https://github.com/navdeepkandra" target="_blank" rel="noopener noreferrer"><FaGithub /></a>
        <a href="https://www.linkedin.com/in/navdeep-c-093020259/" target="_blank" rel="noopener noreferrer"><FaLinkedin /></a>
        <a href="https://x.com/Navdeep9079" target="_blank" rel="noopener noreferrer"><FaTwitter /></a>
      </div>
    </footer>
  );
};

export default Footer;