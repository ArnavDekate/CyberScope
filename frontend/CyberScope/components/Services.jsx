import React from "react";

const Services = () => {
  return (
    <section className="services-section" id="services">
      <h2 className="section-title">Our Services</h2>
      <div className="services-grid">
        <div className="service-card">
          <img
            src="../src/assets/cyber1.jpg"
            alt="Analyze Service"
          />
          <h3>Analyze</h3>
          <p>Engage in personalized assessments to improve your cybersecurity stance.</p>
        </div>
        <div className="service-card">
          <img
            src="../src/assets/cyberimg.jpg"
            alt="Detect Service"
          />
          <h3>Detect</h3>
          <p>Identify potential threats with real-time detection and monitoring systems.</p>
        </div>
        <div className="service-card">
          <img
            src="../src/assets/cyber5.jpg"
            alt="Develop Service"
          />
          <h3>Develop</h3>
          <p>Build resilient systems with our tailored security solutions.</p>
        </div>
      </div>
    </section>
  );
};

export default Services;
