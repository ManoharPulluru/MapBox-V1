import React, { useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css';
import directionsPlugin from '@mapbox/mapbox-sdk/services/directions';

const MapBox = ({ navigate }) => {
  const [map, setMap] = useState(null);
  const [routeLayer, setRouteLayer] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [prevLocation, setPrevLocation] = useState(null);

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
        const newLocation = [userLng, userLat];
        setUserLocation(newLocation);

        if (!map.getLayer('route')) {
          map.setCenter(newLocation);
          map.setZoom(14);
        }

        if (navigate) {
          if (routeLayer) {
            updateRoute(map, newLocation, destination);
          } else {
            addRoute(map, newLocation, destination);
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
    if (navigate && map) {
      map.flyTo({
        center: userLocation,
        zoom: 18,
        pitch: 60,
        bearing: 0,
        speed: 1.2, // Make the flying animation slower or faster
        curve: 1, // Change the curvature of the flight path
        essential: true // This animation is considered essential with respect to prefers-reduced-motion
      });
      addRoute(map, userLocation, destination);
    }
  }, [navigate, userLocation, map]);

  useEffect(() => {
    if (map && navigate) {
      const updateLocation = (e) => {
        const userLng = e.coords.longitude;
        const userLat = e.coords.latitude;
        const newLocation = [userLng, userLat];

        if (!prevLocation || (Math.abs(newLocation[0] - prevLocation[0]) > 0.0001 || Math.abs(newLocation[1] - prevLocation[1]) > 0.0001)) {
          setPrevLocation(newLocation);
          setUserLocation(newLocation);

          map.flyTo({
            center: newLocation,
            zoom: 18,
            pitch: 60,
            bearing: map.getBearing() + 45, // Rotate the map for better visual experience
            speed: 1.2,
            curve: 1,
            essential: true,
          });
        }
      };

      const geolocate = map._controls.find(control => control instanceof mapboxgl.GeolocateControl);
      if (geolocate) {
        geolocate.on('geolocate', updateLocation);
      }

      return () => {
        if (geolocate) {
          geolocate.off('geolocate', updateLocation);
        }
      };
    }
  }, [map, navigate, prevLocation]);

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
      if (!map.getLayer('route')) {
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
        setRouteLayer(true);
      }
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
