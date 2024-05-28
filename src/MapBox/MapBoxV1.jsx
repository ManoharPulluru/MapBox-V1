import mapboxgl from "mapbox-gl";
import React, { useEffect, useRef, useState } from "react";
import Pointer from "../images/Pointer.png";
import * as turf from "@turf/turf"; // Ensure @turf/turf is installed

mapboxgl.accessToken = "pk.eyJ1IjoibWFub2hhcnB1bGx1cnUiLCJhIjoiY2xyeHB2cWl0MWFkcjJpbmFuYXkyOTZzaCJ9.AUGHU42YHgAPtHjDzdhZ7g";

const destination = [78.38598118932651, 17.44030946921754]; // Destination coordinates

const MapBoxV1 = ({ navigate, isCentered, setIsRouteFormed, alignToDirection }) => {
  const mapContainerRef = useRef(null);
  const [userLocation, setUserLocation] = useState(null);
  const [userHeading, setUserHeading] = useState(null);
  const [map, setMap] = useState(null);
  const [initialCenterSet, setInitialCenterSet] = useState(false);
  const [latestCenter, setLatestCenter] = useState([0, 0]);
  const [latestZoom, setLatestZoom] = useState(0);
  const [popup, setPopup] = useState(null);
  const [routeSteps, setRouteSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const mapInstance = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [0, 0],
      zoom: 0,
    });

    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
      trackUserLocation: true,
      showUserHeading: true,
      fitBoundsOptions: { maxZoom: 14 }
    });

    mapInstance.addControl(geolocate);

    mapInstance.on('load', () => {
      geolocate.on('geolocate', (position) => {
        const { longitude, latitude, heading } = position.coords;
        setUserLocation([longitude, latitude]);
        setUserHeading(heading);
        if (!initialCenterSet) {
          mapInstance.setCenter([longitude, latitude]);
          mapInstance.setZoom(14);
          setInitialCenterSet(true);
        }
      });
      geolocate.trigger();

      // Add custom marker at the destination
      const el = document.createElement('div');
      el.className = 'marker';
      el.style.backgroundImage = `url(${Pointer})`;
      el.style.width = '32px';
      el.style.height = '32px';
      el.style.backgroundSize = '100%';

      new mapboxgl.Marker(el)
        .setLngLat(destination)
        .addTo(mapInstance);
    });

    mapInstance.on('move', () => {
      setLatestCenter(mapInstance.getCenter().toArray());
      setLatestZoom(mapInstance.getZoom());
    });

    setMap(mapInstance);

    return () => mapInstance.remove();
  }, [initialCenterSet]);

  useEffect(() => {
    if (navigate && userLocation) {
      getRoute(userLocation);
    }
  }, [navigate, userLocation]);

  useEffect(() => {
    if (isCentered && map) {
      map.flyTo({
        center: userLocation,
        zoom: 14,
        essential: true,
        bearing: userHeading || 0, // Set bearing based on user heading
        duration: 2000,
        easing: (t) => t,
      });
    }
  }, [isCentered, userHeading]);

  useEffect(() => {
    if (alignToDirection && map && userLocation) {
      map.easeTo({
        bearing: userHeading || 0, // Use user heading
        duration: 2000,
        easing: (t) => t,
      });
    }
  }, [alignToDirection, userHeading]);

  const getRoute = (start) => {
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${destination[0]},${destination[1]}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`;

    fetch(url)
      .then(response => response.json())
      .then(data => {
        const route = data.routes[0].geometry.coordinates;
        const steps = data.routes[0].legs[0].steps;
        setRouteSteps(steps);
        setCurrentStepIndex(0); // Reset step index

        const geojson = {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: route
          }
        };

        if (map.getSource('route')) {
          map.getSource('route').setData(geojson);
        } else {
          map.addLayer({
            id: 'route',
            type: 'line',
            source: {
              type: 'geojson',
              data: geojson
            },
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': '#3887be',
              'line-width': 5,
              'line-opacity': 0.75
            }
          });
        }

        setIsRouteFormed(true);
        console.log("Route formed successfully!");

        if (steps.length > 0) {
          showNextStepPopup(steps[0].maneuver.location, steps[0].maneuver.instruction);
        }
      })
      .catch(error => {
        console.error("Error forming route:", error);
        alert("There was an issue forming the route. Please check your internet connection.");
      });
  };

  const showNextStepPopup = (location, instruction) => {
    console.log(`Next step: ${instruction} at location ${location}`);

    if (popup) {
      popup.setLngLat(location).setHTML(`Next: ${instruction}`).addTo(map);
    } else {
      const newPopup = new mapboxgl.Popup({ offset: 25 })
        .setLngLat(location)
        .setHTML(`Next: ${instruction}`)
        .addTo(map);
      setPopup(newPopup);
    }
  };

  useEffect(() => {
    if (userLocation && routeSteps.length > 0 && currentStepIndex < routeSteps.length) {
      const currentStep = routeSteps[currentStepIndex];
      const nextStep = routeSteps[currentStepIndex + 1];

      const distanceToNextStep = turf.distance(
        turf.point(userLocation),
        turf.point(currentStep.maneuver.location),
        { units: 'meters' }
      );

      console.log(`Current location: ${userLocation}`);
      console.log(`Distance to next step: ${distanceToNextStep} meters`);

      if (distanceToNextStep < 50) { // Assuming 50 meters as the threshold to show next step
        setCurrentStepIndex(currentStepIndex + 1);
        if (nextStep) {
          showNextStepPopup(nextStep.maneuver.location, `In ${distanceToNextStep.toFixed(0)} meters, ${nextStep.maneuver.instruction}`);
        }
      }
    }
  }, [userLocation, routeSteps, currentStepIndex]);

  return (
    <div>
      <div style={{ height: "100vh", width: "100vw", color: "black" }} ref={mapContainerRef}></div>
    </div>
  );
};

export default MapBoxV1;
