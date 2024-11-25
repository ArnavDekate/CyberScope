import React from "react";
import Navbar from "../components/Navbar";
import Showcase from "../components/Showcase";
import Services from "../components/Services";
import AboutUs from "../components/AboutUs";
import IncidentsCard from "../components/IncidentCards";

const App = () => {
  return (
    <>
      <Navbar />
      <Showcase />
      <IncidentsCard/>
      <Services />
      <AboutUs />
    </>
  );
};

export default App;
