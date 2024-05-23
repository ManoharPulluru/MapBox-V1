// MapBox/NavigationPopup.js
import React from 'react';

const NavigationPopup = ({ onNavigate }) => {
  return (
    <div className="navigation-popup">
      <h3>Current Location: Showing on Map</h3>
      <button onClick={onNavigate}>Navigate</button>
    </div>
  );
};

export default NavigationPopup;
