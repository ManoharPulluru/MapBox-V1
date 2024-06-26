// App.js
import React, { useState } from "react";
import "./App.css";
import MapBox from "./MapBox/MapBox";
import MapBoxV1 from "./MapBox/MapBoxV1";

const App = () => {
  const [navigate, setNavigate] = useState(false);
  const [isCentered, setIsCentered] = useState(false);
  const [isRouteFormed, setIsRouteFormed] = useState(false);
  const [alignToDirection, setAlignToDirection] = useState(false);
  const [userLocation, setUserLocation] = useState(null);


  const handleNavigate = () => {
    setNavigate(true);
  };
  const handleReCenter = () => {
    setIsCentered(true);
    setTimeout(() => {
      setIsCentered(false);
    }, 100); // No need for brackets around 1000
  };

  const handleDirection = () => {
    setAlignToDirection(true);
    setTimeout(() => {
      setAlignToDirection(false);
    }, 100); // No need for brackets around 1000
  }

  console.log(userLocation, 989)

  return (
    <div className="AppMain">
      {/* <MapBox navigate={navigate} /> */}
      <MapBoxV1 userLocation={userLocation} setUserLocation={setUserLocation} alignToDirection={alignToDirection} isCentered={isCentered} setIsRouteFormed={setIsRouteFormed} navigate={navigate} />
      <>
        <div className="reCenterButton">
          <button onClick={handleReCenter}>Re-Center</button>
        </div>
        <div className="userLatLngDetails">
          <div>Lat:{userLocation? userLocation[1] : "fetching..."}</div>
          <div>Lng:{userLocation? userLocation[0]: ""}</div>
        </div>
        <div className="alignToDirectionButton">
          <button onClick={handleDirection}>Align to Direction</button>  
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
              {!isRouteFormed && navigate ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
                  <circle fill="#FFFFFF" stroke="#FFFFFF" stroke-width="15" r="15" cx="40" cy="65">
                    <animate attributeName="cy" calcMode="spline" dur="2" values="65;135;65;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="-.4"></animate>
                  </circle>
                  <circle fill="#FFFFFF" stroke="#FFFFFF" stroke-width="15" r="15" cx="100" cy="65">
                    <animate attributeName="cy" calcMode="spline" dur="2" values="65;135;65;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="-.2"></animate>
                  </circle>
                  <circle fill="#FFFFFF" stroke="#FFFFFF" stroke-width="15" r="15" cx="160" cy="65">
                    <animate attributeName="cy" calcMode="spline" dur="2" values="65;135;65;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="0"></animate>
                  </circle>
                </svg>
              ) : (
                "Navigate"
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default App;
