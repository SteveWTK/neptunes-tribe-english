"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MapPin, Crosshair, Search, X, Loader2, MapPinOff } from "lucide-react";

// Mapbox GL JS needs to be loaded dynamically to avoid SSR issues
let mapboxgl = null;

// Default center: Brasilia, Brazil
const DEFAULT_CENTER = [-47.8822, -15.7942];
const DEFAULT_ZOOM = 4;

export default function LocationPicker({
  onLocationSelect,
  initialLocation = null,
  className = "",
}) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [gettingCurrentLocation, setGettingCurrentLocation] = useState(false);
  const [locationPermission, setLocationPermission] = useState("prompt"); // 'prompt', 'granted', 'denied'
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [initialLocationAttempted, setInitialLocationAttempted] = useState(false);

  // Load Mapbox GL JS dynamically
  useEffect(() => {
    const loadMapbox = async () => {
      try {
        // Import mapbox-gl dynamically
        const mapboxModule = await import("mapbox-gl");
        mapboxgl = mapboxModule.default;

        // Import CSS
        await import("mapbox-gl/dist/mapbox-gl.css");

        // Set access token
        const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
        if (!token) {
          throw new Error("Mapbox token not configured");
        }
        mapboxgl.accessToken = token;

        setMapLoaded(true);
      } catch (err) {
        console.error("Failed to load Mapbox:", err);
        setError("Failed to load map. Please check your Mapbox configuration.");
        setLoading(false);
      }
    };

    loadMapbox();
  }, []);

  // Initialize map once Mapbox is loaded
  useEffect(() => {
    if (!mapLoaded || !mapContainer.current || map.current) return;

    try {
      // Use initial location if provided, otherwise use default
      const defaultCenter = initialLocation
        ? [initialLocation.lng, initialLocation.lat]
        : DEFAULT_CENTER;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/outdoors-v12", // Nature-focused style
        center: defaultCenter,
        zoom: initialLocation ? 12 : DEFAULT_ZOOM,
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

      // Add scale control
      map.current.addControl(
        new mapboxgl.ScaleControl({ unit: "metric" }),
        "bottom-left"
      );

      // Handle map clicks
      map.current.on("click", (e) => {
        handleLocationSelect(e.lngLat.lat, e.lngLat.lng);
      });

      // Map loaded
      map.current.on("load", () => {
        setLoading(false);

        // If initial location provided, add marker
        if (initialLocation) {
          addMarker(initialLocation.lat, initialLocation.lng);
        } else {
          // No initial location - try to get user's current location automatically
          requestUserLocation();
        }
      });

      // Handle errors
      map.current.on("error", (e) => {
        console.error("Map error:", e);
        setError("Map error occurred. Please try again.");
      });
    } catch (err) {
      console.error("Failed to initialize map:", err);
      setError("Failed to initialize map.");
      setLoading(false);
    }

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapLoaded, initialLocation]);

  // Add or update marker
  const addMarker = useCallback((lat, lng) => {
    if (!map.current || !mapboxgl) return;

    // Remove existing marker
    if (marker.current) {
      marker.current.remove();
    }

    // Create custom marker element
    const el = document.createElement("div");
    el.className = "custom-marker";
    el.innerHTML = `
      <div style="
        width: 40px;
        height: 40px;
        background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <svg style="transform: rotate(45deg); width: 20px; height: 20px; color: white;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
      </div>
    `;

    // Add marker
    marker.current = new mapboxgl.Marker(el)
      .setLngLat([lng, lat])
      .addTo(map.current);
  }, []);

  // Handle location selection
  const handleLocationSelect = useCallback(
    async (lat, lng) => {
      addMarker(lat, lng);

      // Get location name via reverse geocoding
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}&types=place,locality,neighborhood`
        );
        const data = await response.json();

        let locationName = "Unknown location";
        let regionCode = null;

        if (data.features && data.features.length > 0) {
          locationName = data.features[0].place_name;

          // Extract country code from context
          const countryContext = data.features[0].context?.find((c) =>
            c.id.startsWith("country")
          );
          if (countryContext) {
            regionCode = countryContext.short_code?.toUpperCase();
          }
        }

        const locationData = {
          lat,
          lng,
          locationName,
          regionCode,
        };

        setSelectedLocation(locationData);
        onLocationSelect?.(locationData);
      } catch (err) {
        console.error("Reverse geocoding failed:", err);
        const locationData = {
          lat,
          lng,
          locationName: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
          regionCode: null,
        };
        setSelectedLocation(locationData);
        onLocationSelect?.(locationData);
      }
    },
    [addMarker, onLocationSelect]
  );

  // Request user's location automatically when map loads
  const requestUserLocation = useCallback(async () => {
    // Don't request again if already attempted
    if (initialLocationAttempted) return;
    setInitialLocationAttempted(true);

    // Check if geolocation is supported
    if (!navigator.geolocation) {
      console.log("Geolocation not supported");
      setShowLocationPrompt(true);
      return;
    }

    // Check permission status if available (modern browsers)
    if (navigator.permissions) {
      try {
        const permissionStatus = await navigator.permissions.query({ name: "geolocation" });
        setLocationPermission(permissionStatus.state);

        // Listen for permission changes
        permissionStatus.onchange = () => {
          setLocationPermission(permissionStatus.state);
        };

        // If permission already denied, show prompt to enable manually
        if (permissionStatus.state === "denied") {
          setShowLocationPrompt(true);
          return;
        }
      } catch (err) {
        // Permission API not supported, continue with geolocation request
        console.log("Permissions API not supported, trying geolocation directly");
      }
    }

    // Try to get current location
    setGettingCurrentLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocationPermission("granted");

        // Fly to user's location
        if (map.current) {
          map.current.flyTo({
            center: [longitude, latitude],
            zoom: 14,
            essential: true,
          });
        }

        // Select this location
        handleLocationSelect(latitude, longitude);
        setGettingCurrentLocation(false);
      },
      (err) => {
        console.log("Geolocation error:", err.code, err.message);
        setGettingCurrentLocation(false);

        if (err.code === 1) {
          // Permission denied
          setLocationPermission("denied");
          setShowLocationPrompt(true);
        } else {
          // Other error (timeout, position unavailable)
          setShowLocationPrompt(true);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000, // Accept cached position up to 1 minute old
      }
    );
  }, [initialLocationAttempted, handleLocationSelect]);

  // Get current location
  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setGettingCurrentLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        // Fly to location
        if (map.current) {
          map.current.flyTo({
            center: [longitude, latitude],
            zoom: 14,
            essential: true,
          });
        }

        handleLocationSelect(latitude, longitude);
        setGettingCurrentLocation(false);
      },
      (err) => {
        console.error("Geolocation error:", err);
        setError("Could not get your location. Please select manually.");
        setGettingCurrentLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, [handleLocationSelect]);

  // Search for locations
  const searchLocation = useCallback(async (query) => {
    if (!query || query.length < 3) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          query
        )}.json?access_token=${
          process.env.NEXT_PUBLIC_MAPBOX_TOKEN
        }&types=place,locality,neighborhood,address&limit=5`
      );
      const data = await response.json();

      setSearchResults(data.features || []);
    } catch (err) {
      console.error("Search failed:", err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Handle search input
  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      searchLocation(searchQuery);
    }, 300);

    return () => clearTimeout(debounceTimeout);
  }, [searchQuery, searchLocation]);

  // Select search result
  const selectSearchResult = useCallback(
    (result) => {
      const [lng, lat] = result.center;

      if (map.current) {
        map.current.flyTo({
          center: [lng, lat],
          zoom: 14,
          essential: true,
        });
      }

      handleLocationSelect(lat, lng);
      setSearchQuery("");
      setSearchResults([]);
    },
    [handleLocationSelect]
  );

  if (error) {
    return (
      <div
        className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}
      >
        <p className="text-red-600 text-sm">{error}</p>
        <button
          onClick={() => {
            setError(null);
            setLoading(true);
          }}
          className="mt-2 text-sm text-red-700 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Search bar */}
      <div className="absolute top-3 left-3 right-3 z-10">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for a location..."
            className="w-full px-4 py-2 pl-10 pr-10 bg-white text-gray-800 rounded-lg shadow-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSearchResults([]);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Search results dropdown */}
        {searchResults.length > 0 && (
          <div className="mt-1 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            {searchResults.map((result) => (
              <button
                key={result.id}
                onClick={() => selectSearchResult(result)}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
              >
                <div className="font-medium text-gray-800">{result.text}</div>
                <div className="text-xs text-gray-500 truncate">
                  {result.place_name}
                </div>
              </button>
            ))}
          </div>
        )}

        {isSearching && (
          <div className="mt-1 bg-white rounded-lg shadow-lg border border-gray-200 p-3 text-center">
            <Loader2 className="w-4 h-4 animate-spin mx-auto text-gray-400" />
          </div>
        )}
      </div>

      {/* Map container */}
      <div
        ref={mapContainer}
        className="w-full h-[400px] rounded-lg overflow-hidden"
      />

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-green-600 mb-2" />
            <p className="text-sm text-gray-600">Loading map...</p>
          </div>
        </div>
      )}

      {/* Getting location overlay */}
      {!loading && gettingCurrentLocation && !selectedLocation && (
        <div className="absolute inset-0 bg-white/80 rounded-lg flex items-center justify-center z-20">
          <div className="text-center">
            <Crosshair className="w-8 h-8 animate-pulse mx-auto text-green-600 mb-2" />
            <p className="text-sm text-gray-700 font-medium">Detecting your location...</p>
            <p className="text-xs text-gray-500 mt-1">Please allow location access when prompted</p>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="absolute bottom-3 right-3 z-10 flex flex-col gap-2">
        {/* Get current location button */}
        <button
          onClick={getCurrentLocation}
          disabled={gettingCurrentLocation}
          className="p-2 bg-white rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          title="Use my current location"
        >
          {gettingCurrentLocation ? (
            <Loader2 className="w-5 h-5 animate-spin text-green-600" />
          ) : (
            <Crosshair className="w-5 h-5 text-green-600" />
          )}
        </button>
      </div>

      {/* Selected location info */}
      {selectedLocation && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-2">
            <MapPin className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-800">
                Selected Location
              </p>
              <p className="text-sm text-green-700">
                {selectedLocation.locationName}
              </p>
              <p className="text-xs text-green-600 mt-1">
                {selectedLocation.lat.toFixed(6)},{" "}
                {selectedLocation.lng.toFixed(6)}
                {selectedLocation.regionCode && (
                  <span className="ml-2 px-1.5 py-0.5 bg-green-200 rounded text-green-800">
                    {selectedLocation.regionCode}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Location Permission Prompt */}
      {showLocationPrompt && !selectedLocation && !loading && (
        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-2">
            <MapPinOff className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800 mb-1">
                Location access not available
              </p>
              <p className="text-sm text-amber-700">
                {locationPermission === "denied"
                  ? "You've denied location access. To use your current location, please enable it in your browser settings."
                  : "We couldn't detect your location automatically. Please select a location manually on the map or use the search bar."}
              </p>
              <button
                onClick={() => setShowLocationPrompt(false)}
                className="mt-2 text-xs text-amber-600 hover:text-amber-800 underline"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      {!selectedLocation && !loading && !showLocationPrompt && (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>Tip:</strong> Click on the map to select where you made your
            observation, or use the button to detect your current location.
          </p>
        </div>
      )}
    </div>
  );
}
