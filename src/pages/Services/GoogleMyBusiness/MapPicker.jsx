// ============================================
// BIT SOFTWARE — GORGEOUS MAP LOCATION PICKER
// ============================================

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, Search, Navigation, Layers, Compass, Loader2, 
  CheckCircle, Globe, ShieldCheck, Map, Image
} from 'lucide-react';
import { useAppSelector } from '@/app/hooks';

// Custom Hook to load Leaflet dynamically from CDN
function useLeaflet() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (window.L) {
      setLoaded(true);
      return;
    }

    // Insert Leaflet CSS
    let cssTag = document.getElementById('leaflet-css');
    if (!cssTag) {
      cssTag = document.createElement('link');
      cssTag.id = 'leaflet-css';
      cssTag.rel = 'stylesheet';
      cssTag.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(cssTag);
    }

    // Insert Leaflet JS
    let jsTag = document.getElementById('leaflet-js');
    if (!jsTag) {
      jsTag = document.createElement('script');
      jsTag.id = 'leaflet-js';
      jsTag.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      document.body.appendChild(jsTag);
    }

    const handleScriptLoad = () => {
      setLoaded(true);
    };

    const jsElement = document.getElementById('leaflet-js');
    if (window.L) {
      setLoaded(true);
    } else if (jsElement) {
      jsElement.addEventListener('load', handleScriptLoad);
    }

    return () => {
      if (jsElement) {
        jsElement.removeEventListener('load', handleScriptLoad);
      }
    };
  }, []);

  return loaded;
}

export default function MapPicker({ 
  latitude,
  longitude,
  onLocationSelect, 
  countryName, 
  onAddressUpdate 
}) {
  const leafletLoaded = useLeaflet();
  const themeMode = useAppSelector((state) => state.theme.mode);
  
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  
  // Search and suggestions
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  // Coordinates and details
  const [coords, setCoords] = useState({ 
    lat: latitude || 24.7136, 
    lng: longitude || 46.6753 
  }); // Centered at Riyadh by default or parent coordinates
  const [mapStyle, setMapStyle] = useState('voyager'); // 'voyager' | 'dark' | 'satellite'
  const [status, setStatus] = useState('ready'); // 'ready' | 'loading' | 'searching' | 'reverse-geocoding' | 'error'
  const [addressDetails, setAddressDetails] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);

  // Keep track of parent's country to center map
  useEffect(() => {
    if (!leafletLoaded || !mapInstanceRef.current) return;
    
    // If country changes, pan to that country (Saudi Arabia: Riyadh, US: Washington, etc.)
    const countryCoordinates = {
      'Saudi Arabia': { lat: 24.7136, lng: 46.6753 },
      'United States': { lat: 37.0902, lng: -95.7129 },
      'United Kingdom': { lat: 55.3781, lng: -3.4360 },
      'United Arab Emirates': { lat: 24.4539, lng: 54.3773 },
      'Canada': { lat: 56.1304, lng: -106.3468 },
      'Australia': { lat: -25.2744, lng: 133.7751 },
      'Germany': { lat: 51.1657, lng: 10.4515 },
      'Singapore': { lat: 1.3521, lng: 103.8198 },
      'India': { lat: 20.5937, lng: 78.9629 },
      'Bangladesh': { lat: 23.6850, lng: 90.3563 }
    };
    
    const target = countryCoordinates[countryName];
    if (target) {
      setCoords(target);
      mapInstanceRef.current.setView([target.lat, target.lng], countryName === 'Saudi Arabia' ? 12 : 5);
      updateMarker(target.lat, target.lng);
    }
  }, [countryName, leafletLoaded]);

  // Handle initialization of the Leaflet Map
  useEffect(() => {
    if (!leafletLoaded || !mapRef.current) return;
    
    // Avoid double initialization
    if (mapInstanceRef.current) {
      // Clean up tile layers or map completely
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    }

    const L = window.L;

    // Initialize Map Instance
    const initialLat = coords.lat;
    const initialLng = coords.lng;
    
    const map = L.map(mapRef.current, {
      center: [initialLat, initialLng],
      zoom: 12,
      zoomControl: false // Hide default zoom, we render it nicely
    });

    mapInstanceRef.current = map;

    // Add Zoom Control at bottom right
    L.control.zoom({
      position: 'bottomright'
    }).addTo(map);

    // Set Map Tiles based on Map Style
    updateTileLayer(mapStyle);

    // Custom Glowing DivIcon
    const customIcon = L.divIcon({
      html: `
        <div class="custom-radar-marker">
          <div class="pulse-ring"></div>
          <div class="marker-core">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="marker-svg">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          </div>
        </div>
      `,
      className: 'gmb-map-custom-icon',
      iconSize: [42, 42],
      iconAnchor: [21, 38]
    });

    // Create marker
    const marker = L.marker([initialLat, initialLng], {
      icon: customIcon,
      draggable: true
    }).addTo(map);

    markerRef.current = marker;

    // Trigger reverse-geocoding for initial position
    reverseGeocode(initialLat, initialLng);

    // Map Click Handler: Place pin on click
    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      updateMarker(lat, lng);
    });

    // Marker Drag Handler: Geocode on drag end
    marker.on('dragend', () => {
      const position = marker.getLatLng();
      updateMarker(position.lat, position.lng);
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [leafletLoaded]);

  // Sync theme or MapStyle change
  useEffect(() => {
    if (!leafletLoaded || !mapInstanceRef.current) return;
    updateTileLayer(mapStyle);
  }, [mapStyle, themeMode, leafletLoaded]);

  // Function to change Tile Layer
  const updateTileLayer = (style) => {
    if (!leafletLoaded || !mapInstanceRef.current) return;
    
    const L = window.L;
    const map = mapInstanceRef.current;
    
    // Remove existing tile layers
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    let tileUrl = '';
    let attribution = '';

    if (style === 'satellite') {
      tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      attribution = 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';
    } else if (style === 'dark' || (style === 'voyager' && themeMode === 'dark')) {
      tileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
      attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';
    } else {
      // Voyager Light Map
      tileUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
      attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';
    }

    L.tileLayer(tileUrl, {
      attribution: attribution,
      maxZoom: 20
    }).addTo(map);
  };

  // Helper to update marker position and center map
  const updateMarker = (lat, lng) => {
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    }
    setCoords({ lat, lng });
    reverseGeocode(lat, lng);

    if (onLocationSelect) {
      onLocationSelect({ lat, lng });
    }
  };

  // Fetch address details from coordinates (Reverse Geocoding)
  const reverseGeocode = async (lat, lng) => {
    setStatus('reverse-geocoding');
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      );
      if (!response.ok) throw new Error('Geocoding failed');
      const data = await response.json();
      
      if (data && data.address) {
        const addr = data.address;
        
        // Assemble a street address beautifully
        const streetParts = [
          addr.house_number || addr.building,
          addr.road,
          addr.suburb || addr.neighbourhood,
          addr.quarter
        ].filter(Boolean);
        
        const street = streetParts.length > 0 ? streetParts.join(', ') : data.display_name.split(',').slice(0, 2).join(',');
        const city = addr.city || addr.town || addr.village || addr.municipality || addr.county || '';
        const state = addr.state || addr.province || '';
        const postcode = addr.postcode || '';
        const country = addr.country || '';

        const addressObj = {
          streetAddress: street,
          city: city,
          state: state,
          postalCode: postcode,
          country: country
        };
        
        setAddressDetails(addressObj);
        setStatus('ready');

        if (onAddressUpdate) {
          onAddressUpdate(addressObj);
        }
      }
    } catch (err) {
      console.error('Reverse geocoding error:', err);
      setStatus('error');
    }
  };

  // Handle live query searching
  const handleSearchChange = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsSearching(true);
    try {
      // Prioritize searching in the selected country to make results highly relevant
      const countryQuery = countryName ? `+${countryName}` : '';
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + countryQuery)}&addressdetails=1&limit=5`
      );
      const data = await response.json();
      setSuggestions(data || []);
      setShowSuggestions(true);
    } catch (err) {
      console.error('Search Geocoding error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Select a location from search results
  const handleSelectSuggestion = (suggestion) => {
    const lat = parseFloat(suggestion.lat);
    const lon = parseFloat(suggestion.lon);
    
    setSearchQuery(suggestion.display_name);
    setShowSuggestions(false);

    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([lat, lon], 16);
      updateMarker(lat, lon);
    }
  };

  // Browser Geolocation (Detect My Location)
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setGpsLoading(true);
    setStatus('loading');
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setGpsLoading(false);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([latitude, longitude], 17);
          updateMarker(latitude, longitude);
        }
      },
      (err) => {
        setGpsLoading(false);
        setStatus('ready');
        console.error('GPS error:', err);
        alert('Could not retrieve your precise location. Please search manually.');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  return (
    <div className="gmb-map-picker-root">
      {/* Search Bar HUD */}
      <div className="gmb-map-hud-top">
        <div className="map-search-wrapper">
          <div className="map-search-icon-box">
            {isSearching ? (
              <Loader2 size={16} className="animate-spin text-primary" />
            ) : (
              <Search size={16} className="text-muted" />
            )}
          </div>
          <input 
            type="text" 
            className="map-search-input" 
            placeholder="Search address, district, or business coordinates..." 
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          />
          {searchQuery && (
            <button 
              type="button" 
              className="map-clear-btn" 
              onClick={() => { setSearchQuery(''); setSuggestions([]); }}
            >
              &times;
            </button>
          )}

          {/* Autocomplete Dropdown */}
          <AnimatePresence>
            {showSuggestions && suggestions.length > 0 && (
              <motion.div 
                className="map-search-suggestions"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
              >
                {suggestions.map((item, index) => (
                  <button
                    key={index}
                    type="button"
                    className="suggestion-item"
                    onClick={() => handleSelectSuggestion(item)}
                  >
                    <MapPin size={14} className="suggestion-icon" />
                    <div className="suggestion-text">
                      <span className="suggestion-name">{item.display_name.split(',')[0]}</span>
                      <span className="suggestion-sub">{item.display_name.split(',').slice(1).join(',')}</span>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Locate Me GPS button */}
        <button
          type="button"
          onClick={handleLocateMe}
          className={`map-hud-btn locate-me-btn ${gpsLoading ? 'loading' : ''}`}
          title="Detect Current Location"
        >
          {gpsLoading ? <Loader2 size={16} className="animate-spin" /> : <Navigation size={16} />}
          <span>Locate Me</span>
        </button>
      </div>

      {/* Main Map Canvas Canvas Container */}
      <div className="gmb-map-container-frame">
        {!leafletLoaded && (
          <div className="map-loading-overlay">
            <Loader2 className="animate-spin text-primary" size={36} />
            <p>Booting Interactive Geolocation System...</p>
          </div>
        )}
        <div ref={mapRef} className="leaflet-map-element" />

        {/* HUD Overlay: Satellite / Dark Map Style Switcher */}
        <div className="map-hud-styles">
          <button 
            type="button" 
            className={`style-btn ${mapStyle === 'voyager' ? 'active' : ''}`}
            onClick={() => setMapStyle('voyager')}
          >
            <Map size={14} />
            <span>Map</span>
          </button>
          <button 
            type="button" 
            className={`style-btn ${mapStyle === 'satellite' ? 'active' : ''}`}
            onClick={() => setMapStyle('satellite')}
          >
            <Image size={14} />
            <span>Satellite</span>
          </button>
          <button 
            type="button" 
            className={`style-btn ${mapStyle === 'dark' ? 'active' : ''}`}
            onClick={() => setMapStyle('dark')}
          >
            <Layers size={14} />
            <span>Dark</span>
          </button>
        </div>

        {/* Radar Scanner Graphic Overlay */}
        <div className="map-hud-scanner">
          <div className="scanner-line"></div>
          <div className="scanner-compass">
            <Compass size={16} className="compass-icon animate-pulse" />
          </div>
        </div>

        {/* Coordinates HUD overlay bottom-left */}
        <div className="map-hud-coordinates">
          <div className="coord-row">
            <span className="coord-lbl">LAT:</span>
            <span className="coord-val">{coords.lat.toFixed(6)}</span>
          </div>
          <div className="coord-row">
            <span className="coord-lbl">LNG:</span>
            <span className="coord-val">{coords.lng.toFixed(6)}</span>
          </div>
          <div className="coord-status">
            <span className={`status-dot ${status}`} />
            <span className="status-text">
              {status === 'ready' && 'GPS LOCKED'}
              {status === 'loading' && 'SCANNING GPS...'}
              {status === 'reverse-geocoding' && 'RETRIVIEVING ADDR...'}
              {status === 'error' && 'GEOLOCATION OFFLINE'}
            </span>
          </div>
        </div>
      </div>

      {/* Address Sync Card */}
      <AnimatePresence>
        {addressDetails && (
          <motion.div 
            className="gmb-map-address-sync-card"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="sync-header">
              <ShieldCheck size={16} className="sync-icon text-success" />
              <span>Location Matched & Geocoded</span>
              <span className="sync-badge">Auto-Filled</span>
            </div>
            <p className="sync-address-text">
              {addressDetails.streetAddress}, {addressDetails.city}, {addressDetails.country}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
