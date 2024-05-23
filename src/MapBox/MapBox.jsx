import React, { useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css';
import directionsPlugin from '@mapbox/mapbox-sdk/services/directions';
import Pointer from '../images/Pointer.svg'; // Ensure you have the correct path to your SVG file

const MapBox = ({ navigate }) => {
  const [map, setMap] = useState(null);
  const [routeLayer, setRouteLayer] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [userMarker, setUserMarker] = useState(null);

  mapboxgl.accessToken = 'pk.eyJ1IjoibWFub2hhcnB1bGx1cnUiLCJhIjoiY2xyeHB2cWl0MWFkcjJpbmFuYXkyOTZzaCJ9.AUGHU42YHgAPtHjDzdhZ7g';

  const destination = [78.38598118932651, 17.44030946921754]; // Destination coordinates

  useEffect(() => {
    const initializeMap = ({ setMap, mapContainer }) => {
      const map = new mapboxgl.Map({
        container: mapContainer,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [0, 0],
        zoom: 2,
      });

      const geolocate = new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: true,
        showUserHeading: true,
      });

      map.addControl(geolocate);

      map.on('load', () => {
        geolocate.trigger();
      });

      geolocate.on('geolocate', (e) => {
        const userLng = e.coords.longitude;
        const userLat = e.coords.latitude;
        setUserLocation([userLng, userLat]);

        if (!map.getLayer('route')) {
          map.setCenter([userLng, userLat]);
          map.setZoom(14);
        }

        if (navigate) {
          if (routeLayer) {
            updateRoute(map, [userLng, userLat], destination);
          } else {
            addRoute(map, [userLng, userLat], destination);
          }
        }
      });

      setMap(map);
    };

    if (!map) {
      initializeMap({ setMap, mapContainer: 'map' });
    }

    return () => {
      if (map) map.remove();
    };
  }, [map]);

  useEffect(() => {
    if (navigate && userLocation && map) {
      map.flyTo({
        center: userLocation,
        zoom: 18,
        pitch: 60,
        bearing: 0,
        essential: true,
      });
      addRoute(map, userLocation, destination);

      // Add custom marker
      if (userMarker) {
        userMarker.remove();
      }
      const marker = new mapboxgl.Marker({
        element: createCustomMarker(),
      })
        .setLngLat(userLocation)
        .addTo(map);
      setUserMarker(marker);
    }
  }, [navigate, map]);

  const createCustomMarker = () => {
    const el = document.createElement('div');
    el.className = 'custom-marker';
    el.style.backgroundImage = `url(${Pointer})`;
    el.style.width = '50px';
    el.style.height = '50px';
    el.style.backgroundSize = '100%';
    return el;
  };

  const addRoute = (map, start, end) => {
    const directionsClient = directionsPlugin({ accessToken: mapboxgl.accessToken });

    directionsClient.getDirections({
      profile: 'driving',
      geometries: 'geojson',
      waypoints: [
        {
          coordinates: start,
        },
        {
          coordinates: end,
        },
      ],
    })
      .send()
      .then(response => {
        const data = response.body;
        const route = data.routes[0].geometry;
        if (map.getSource('route')) {
          map.getSource('route').setData({
            type: 'Feature',
            properties: {},
            geometry: route,
          });
        } else {
          map.addLayer({
            id: 'route',
            type: 'line',
            source: {
              type: 'geojson',
              data: {
                type: 'Feature',
                properties: {},
                geometry: route,
              },
            },
            layout: {
              'line-join': 'round',
              'line-cap': 'round',
            },
            paint: {
              'line-color': '#3887be',
              'line-width': 5,
              'line-opacity': 0.75,
            },
          });
        }
        setRouteLayer(true);
      })
      .catch(error => {
        console.error('Error fetching directions:', error);
      });
  };

  const updateRoute = (map, start, end) => {
    const directionsClient = directionsPlugin({ accessToken: mapboxgl.accessToken });

    directionsClient.getDirections({
      profile: 'driving',
      geometries: 'geojson',
      waypoints: [
        {
          coordinates: start,
        },
        {
          coordinates: end,
        },
      ],
    })
      .send()
      .then(response => {
        const data = response.body;
        const route = data.routes[0].geometry;
        if (map.getSource('route')) {
          map.getSource('route').setData({
            type: 'Feature',
            properties: {},
            geometry: route,
          });
        } else {
          addRoute(map, start, end);
        }
      })
      .catch(error => {
        console.error('Error fetching directions:', error);
      });
  };

  return <div id="map" style={{ position: 'absolute', top: 0, bottom: 0, width: '100%' }} />;
};

export default MapBox;
