import React from "react";

const Navbar = () => {
  return (
    <nav className="navbar">
      <h1>
        Cyber <span>Scope</span>
      </h1>
      <ul>
        <li><a href="#home">Home</a></li>
        <li><a href="#services">Services</a></li>
        <li><a href="#about">About us</a></li>
      </ul>
      <a href="#" className="join-btn">Join us</a>
    </nav>
  );
};

export default Navbar;
