// App.js
import React, { useState } from "react";
import "./App.css";
import MapBox from "./MapBox/MapBox";
import MapBoxV1 from "./MapBox/MapBoxV1";

const App = () => {
  const [navigate, setNavigate] = useState(false);
  const [isCentered, setIsCentered] = useState(false);
  const [isRouteFormed, setIsRouteFormed] = useState(false)

  const handleNavigate = () => {
    setNavigate(true);
  };
  const handleReCenter = () => {
    setIsCentered(true);
    setTimeout(() => {
      setIsCentered(false);
    }, 100); // No need for brackets around 1000
  };
  
  return (
    <div className="AppMain">
      {/* <MapBox navigate={navigate} /> */}
      <MapBoxV1
      isCentered={isCentered}
      setIsRouteFormed={setIsRouteFormed}
      navigate={navigate}
      />
      <>
      <div className="reCenterButton">
        <button onClick={handleReCenter}>Re-Center</button>
      </div>
      </>
      {navigate && isRouteFormed ? (
        <></>
      ) : (
        <>
          <div className="AppBody">
            <div className="detailsDiv">
              <div className="detailsTitle">FIRE-WARNING!!</div>
              <div className="detailsBody">Fire Warning at Sample location, spreading fast need immediate attention and action.</div>
            </div>
            <div onClick={handleNavigate} className="navigationDiv">
              {/* Navigate */}
              {
                (!isRouteFormed && navigate) ? "..." : "Navigate"
              }
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default App;
