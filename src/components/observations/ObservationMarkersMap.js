"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  Globe,
  Building,
  User,
  MapPin,
  Camera,
  ExternalLink,
  X,
} from "lucide-react";

let mapboxgl = null;

const FILTER_OPTIONS = [
  { id: "global", label: "Global Feed", icon: Globe },
  { id: "school", label: "My School", icon: Building },
  { id: "mine", label: "My Observations", icon: User },
];

export default function ObservationMarkersMap({
  compact = false,
  showFilters = true,
  initialFilter = "global",
  maxMarkers = 100,
  className = "",
  onMarkerClick,
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markersRef = useRef([]);
  const popupRef = useRef(null);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [observations, setObservations] = useState([]);
  const [activeFilter, setActiveFilter] = useState(initialFilter);
  const [selectedObservation, setSelectedObservation] = useState(null);
  const [fetchingData, setFetchingData] = useState(false);

  // Load Mapbox GL JS dynamically
  useEffect(() => {
    const loadMapbox = async () => {
      try {
        const mapboxModule = await import("mapbox-gl");
        mapboxgl = mapboxModule.default;
        await import("mapbox-gl/dist/mapbox-gl.css");

        const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
        if (!token) {
          throw new Error("Mapbox token not configured");
        }
        mapboxgl.accessToken = token;

        setMapLoaded(true);
      } catch (err) {
        console.error("Failed to load Mapbox:", err);
        setError("Failed to load map.");
        setLoading(false);
      }
    };

    loadMapbox();
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapLoaded || !mapContainer.current || map.current) return;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/outdoors-v12",
        center: [0, 20],
        zoom: compact ? 1 : 1,
        minZoom: 1,
        maxZoom: 18,
      });

      if (!compact) {
        map.current.addControl(new mapboxgl.NavigationControl(), "top-right");
      }

      map.current.on("load", () => {
        setLoading(false);
      });

      map.current.on("error", (e) => {
        console.error("Map error:", e);
      });
    } catch (err) {
      console.error("Failed to initialize map:", err);
      setError("Failed to initialize map.");
      setLoading(false);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapLoaded, compact]);

  // Fetch observations based on filter
  const fetchObservations = useCallback(async () => {
    if (!session && (activeFilter === "mine" || activeFilter === "school")) {
      setObservations([]);
      return;
    }

    setFetchingData(true);
    try {
      const response = await fetch(
        `/api/observations/map?filter=${activeFilter}&limit=${maxMarkers}`
      );
      if (response.ok) {
        const data = await response.json();
        setObservations(data.observations || []);
      }
    } catch (err) {
      console.error("Error fetching observations:", err);
    } finally {
      setFetchingData(false);
    }
  }, [activeFilter, session, maxMarkers]);

  // Fetch observations when filter changes
  useEffect(() => {
    if (mapLoaded) {
      fetchObservations();
    }
  }, [mapLoaded, fetchObservations]);

  // Clear existing markers
  const clearMarkers = useCallback(() => {
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];
    if (popupRef.current) {
      popupRef.current.remove();
      popupRef.current = null;
    }
  }, []);

  // Add markers to map
  useEffect(() => {
    if (!map.current || !mapLoaded || observations.length === 0) {
      clearMarkers();
      return;
    }

    clearMarkers();

    observations.forEach((obs) => {
      if (!obs.coordinates || obs.coordinates.length !== 2) return;

      const [lng, lat] = obs.coordinates;
      if (isNaN(lng) || isNaN(lat)) return;

      // Create marker element
      const el = document.createElement("div");
      el.className = "observation-marker";
      el.style.cssText = `
        width: ${compact ? "24px" : "32px"};
        height: ${compact ? "24px" : "32px"};
        background: ${obs.isOwn ? "#8b5cf6" : "#22c55e"};
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s;
      `;

      // Add camera icon
      el.innerHTML = `
        <svg width="${compact ? "12" : "16"}" height="${
        compact ? "12" : "16"
      }" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path>
          <circle cx="12" cy="13" r="3"></circle>
        </svg>
      `;

      el.addEventListener("mouseenter", () => {
        el.style.transform = "scale(1.2)";
      });
      el.addEventListener("mouseleave", () => {
        el.style.transform = "scale(1)";
      });

      el.addEventListener("click", (e) => {
        e.stopPropagation();

        if (onMarkerClick) {
          onMarkerClick(obs);
        } else {
          setSelectedObservation(obs);

          // Create popup
          if (popupRef.current) {
            popupRef.current.remove();
          }

          const popupContent = document.createElement("div");
          popupContent.className = "observation-popup";
          popupContent.innerHTML = `
            <div style="max-width: 200px;">
              ${
                obs.photoUrl
                  ? `<img src="${obs.photoUrl}" alt="${obs.species}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px 8px 0 0;" />`
                  : ""
              }
              <div style="padding: 8px;">
                <h4 style="margin: 0 0 4px 0; font-weight: 600; font-size: 14px; color: #1f2937;">${
                  obs.species
                }</h4>
                <p style="margin: 0 0 4px 0; font-size: 12px; color: #6b7280;">${
                  obs.location || "Unknown location"
                }</p>
                <p style="margin: 0; font-size: 11px; color: #9ca3af;">${new Date(
                  obs.date
                ).toLocaleDateString()}</p>
              </div>
            </div>
          `;

          popupRef.current = new mapboxgl.Popup({
            offset: 25,
            closeButton: true,
            closeOnClick: false,
          })
            .setLngLat([lng, lat])
            .setDOMContent(popupContent)
            .addTo(map.current);

          popupRef.current.on("close", () => {
            setSelectedObservation(null);
          });
        }
      });

      const marker = new mapboxgl.Marker(el)
        .setLngLat([lng, lat])
        .addTo(map.current);

      markersRef.current.push(marker);
    });

    // Fit bounds if we have observations
    if (observations.length > 0 && map.current) {
      const bounds = new mapboxgl.LngLatBounds();
      observations.forEach((obs) => {
        if (obs.coordinates && obs.coordinates.length === 2) {
          bounds.extend(obs.coordinates);
        }
      });

      if (!bounds.isEmpty()) {
        map.current.fitBounds(bounds, {
          padding: compact ? 30 : 50,
          maxZoom: compact ? 8 : 12,
          duration: 1000,
        });
      }
    }
  }, [observations, mapLoaded, compact, clearMarkers, onMarkerClick]);

  const handleFilterChange = (filter) => {
    if (!session && (filter === "mine" || filter === "school")) {
      return;
    }
    setActiveFilter(filter);
  };

  if (error) {
    return (
      <div
        className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}
      >
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Filters */}
      {showFilters && (
        <div className="absolute top-3 left-3 z-10 flex gap-2">
          {FILTER_OPTIONS.map((option) => {
            const Icon = option.icon;
            const isDisabled =
              !session && (option.id === "mine" || option.id === "school");
            const isActive = activeFilter === option.id;

            return (
              <button
                key={option.id}
                onClick={() => handleFilterChange(option.id)}
                disabled={isDisabled}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                  ${
                    isActive
                      ? "bg-accent-600 text-white shadow-lg"
                      : "bg-white/90 text-gray-700 hover:bg-white shadow"
                  }
                  ${
                    isDisabled
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer"
                  }
                `}
                title={isDisabled ? "Sign in to access" : option.label}
              >
                <Icon className="w-4 h-4" />
                {!compact && <span>{option.label}</span>}
              </button>
            );
          })}
        </div>
      )}

      {/* Observation count */}
      {!compact && (
        <div className="absolute top-3 right-10 z-10 bg-white/90 px-3 py-1.5 rounded-lg shadow text-sm">
          <span className="font-medium text-gray-800">
            {fetchingData ? (
              <Loader2 className="w-4 h-4 animate-spin inline" />
            ) : (
              observations.length
            )}
          </span>
          <span className="text-gray-600 ml-1">observations</span>
        </div>
      )}

      {/* Map container */}
      <div
        ref={mapContainer}
        className={`w-full rounded-lg overflow-hidden ${
          compact ? "h-[375px]" : "h-[600px]"
        }`}
      />

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-accent-600 mb-2" />
            <p className="text-sm text-gray-600">Loading map...</p>
          </div>
        </div>
      )}

      {/* Selected observation detail (for compact mode) */}
      {compact && selectedObservation && (
        <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm p-3 border-t">
          <div className="flex items-center gap-3">
            {selectedObservation.photoUrl && (
              <img
                src={selectedObservation.photoUrl}
                alt={selectedObservation.species}
                className="w-12 h-12 rounded-lg object-cover"
              />
            )}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-800 text-sm truncate">
                {selectedObservation.species}
              </h4>
              <p className="text-xs text-gray-500 truncate">
                {selectedObservation.location}
              </p>
            </div>
            <Link
              href={`/observations/${selectedObservation.id}`}
              className="p-2 text-accent-600 hover:bg-accent-50 rounded-lg"
            >
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && observations.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80 rounded-lg">
          <div className="text-center p-6">
            <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">No observations yet</p>
            <p className="text-sm text-gray-500 mt-1">
              {activeFilter === "mine"
                ? "Create your first observation!"
                : activeFilter === "school"
                ? "No school observations found"
                : "Be the first to add an observation"}
            </p>
            {activeFilter === "mine" && (
              <Link
                href="/observations/create"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-colors"
              >
                <Camera className="w-4 h-4" />
                Add Observation
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
