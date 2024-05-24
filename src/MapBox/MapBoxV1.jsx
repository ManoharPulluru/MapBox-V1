import mapboxgl from "mapbox-gl";
import React, { useEffect, useRef, useState } from "react";

mapboxgl.accessToken = "pk.eyJ1IjoibWFub2hhcnB1bGx1cnUiLCJhIjoiY2xyeHB2cWl0MWFkcjJpbmFuYXkyOTZzaCJ9.AUGHU42YHgAPtHjDzdhZ7g";

const destination = [78.38598118932651, 17.44030946921754]; // Destination coordinates

const MapBoxV1 = ({navigate}) => {
  const mapContainerRef = useRef(null);
  // const [navigate, setNavigate] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [map, setMap] = useState(null);
  const [initialCenterSet, setInitialCenterSet] = useState(false); // Track if initial center is set

  useEffect(() => {
    const mapInstance = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [78.361771, 17.441989], // Set a reasonable initial center
      zoom: 14, // Set a reasonable initial zoom
    });

    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
      trackUserLocation: true,
      showUserHeading: true,
      fitBoundsOptions: { maxZoom: 14 } // Prevents the geolocate control from automatically re-centering the map
    });

    mapInstance.addControl(geolocate);

    mapInstance.on('load', () => {
      geolocate.on('geolocate', (position) => {
        const { longitude, latitude } = position.coords;
        setUserLocation([longitude, latitude]);
        if (!initialCenterSet) {
          mapInstance.setCenter([longitude, latitude]);
          mapInstance.setZoom(14);
          setInitialCenterSet(true); // Mark initial center as set
        }
      });
      geolocate.trigger();
    });

    setMap(mapInstance);

    return () => mapInstance.remove();
  }, [initialCenterSet]);

  useEffect(() => {
    if (navigate && userLocation) {
      getRoute(userLocation);
    }
  }, [navigate, userLocation]);

  const getRoute = (start) => {
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${destination[0]},${destination[1]}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`;

    fetch(url)
      .then(response => response.json())
      .then(data => {
        const route = data.routes[0].geometry.coordinates;
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
      });
  };

  return (
    <div>
      <div style={{ height: "100vh", width: "100vw" }} ref={mapContainerRef}></div>
    </div>
  );
};

export default MapBoxV1;
