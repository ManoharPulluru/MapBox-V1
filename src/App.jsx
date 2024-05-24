// App.js
import React, { useState } from "react";
import "./App.css";
import MapBox from "./MapBox/MapBox";
import MapBoxV1 from "./MapBox/MapBoxV1";

const App = () => {
  const [navigate, setNavigate] = useState(false);

  const handleNavigate = () => {
    setNavigate(true);
  };
  return (
    <div className="AppMain">
      {/* <MapBox navigate={navigate} /> */}
      <MapBoxV1
      navigate={navigate}
      />

      {navigate ? (
        <></>
      ) : (
        <>
          <div className="AppBody">
            <div className="detailsDiv">
              <div className="detailsTitle">FIRE-WARNING!!</div>
              <div className="detailsBody">Fire Warning at Sample location, spreading fast need immediate attention and action.</div>
            </div>
            <div onClick={handleNavigate} className="navigationDiv">
              Navigate
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default App;
