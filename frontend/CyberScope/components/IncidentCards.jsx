import React, { useState, useEffect } from "react";
import axios from "axios";

const IncidentsCard = () => {
  const [incidents, setIncidents] = useState([]);

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/incidents");
        console.log(response.data); // Debugging: log data
        setIncidents(response.data);
      } catch (error) {
        console.error("Error fetching incidents:", error);
      }
    };

    fetchIncidents();
  }, []);

  return (
    <section className="incidents-section">
      <h2 className="section-title">Recent Cybersecurity Updates</h2>
      <div className="incidents-grid">
        {incidents.length > 0 ? (
          incidents.map((incident) => (
            <div className="incident-card" key={incident.id}>
              <h3>Incident #{incident.id}</h3>
              <small>
                {incident.date
                  ? new Date(incident.date).toLocaleDateString()
                  : "Date not available"}
              </small>
              <p>{incident.text}</p>
              <a
                href={incident.url}
                target="_blank"
                rel="noopener noreferrer"
                className="incident-link"
              >
                Read more
              </a>
            </div>
          ))
        ) : (
          <p>No incidents to display at the moment.</p>
        )}
      </div>
    </section>
  );
};

export default IncidentsCard;
