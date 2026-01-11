"use client";

import { useState, useEffect, useCallback } from "react";
import { Marker } from "react-simple-maps";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, MapPin, X } from "lucide-react";

/**
 * Observation Markers for the Eco-Map
 * Renders observation points as clickable markers on react-simple-maps
 */
export default function ObservationMarkers({ onObservationClick }) {
  const [observations, setObservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredObservation, setHoveredObservation] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Fetch observations for map
  useEffect(() => {
    const fetchObservations = async () => {
      try {
        const response = await fetch("/api/observations/map?limit=100");
        const data = await response.json();

        if (response.ok) {
          setObservations(data.observations);
        }
      } catch (err) {
        console.error("Error fetching map observations:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchObservations();
  }, []);

  const handleMouseMove = useCallback((e) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  }, []);

  // Cluster nearby observations (simple grid-based clustering)
  const clusterObservations = useCallback((obs, zoomLevel = 1) => {
    if (obs.length < 10) return obs.map((o) => ({ ...o, count: 1 }));

    const gridSize = 5 / zoomLevel; // Degrees
    const clusters = {};

    obs.forEach((o) => {
      const gridX = Math.floor(o.coordinates[0] / gridSize);
      const gridY = Math.floor(o.coordinates[1] / gridSize);
      const key = `${gridX},${gridY}`;

      if (!clusters[key]) {
        clusters[key] = {
          ...o,
          count: 1,
          allObservations: [o],
        };
      } else {
        clusters[key].count++;
        clusters[key].allObservations.push(o);
        // Update coordinates to centroid
        clusters[key].coordinates = [
          clusters[key].allObservations.reduce((sum, ob) => sum + ob.coordinates[0], 0) /
            clusters[key].count,
          clusters[key].allObservations.reduce((sum, ob) => sum + ob.coordinates[1], 0) /
            clusters[key].count,
        ];
      }
    });

    return Object.values(clusters);
  }, []);

  const clusteredObservations = clusterObservations(observations);

  if (loading || observations.length === 0) return null;

  return (
    <>
      {clusteredObservations.map((obs) => {
        const isCluster = obs.count > 1;
        const markerSize = isCluster ? Math.min(16, 8 + obs.count * 2) : 8;

        return (
          <Marker
            key={obs.id}
            coordinates={obs.coordinates}
            onMouseEnter={() => setHoveredObservation(obs)}
            onMouseLeave={() => setHoveredObservation(null)}
            onClick={() => {
              if (isCluster) {
                // TODO: Zoom into cluster or show cluster popup
                console.log("Cluster clicked:", obs.count, "observations");
              } else if (onObservationClick) {
                onObservationClick(obs);
              }
            }}
            style={{ cursor: "pointer" }}
          >
            <motion.g
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              {/* Marker circle */}
              <circle
                r={markerSize}
                fill={
                  obs.confidence === "high"
                    ? "#22c55e"
                    : obs.confidence === "medium"
                    ? "#eab308"
                    : "#6b7280"
                }
                stroke="#ffffff"
                strokeWidth={2}
                style={{
                  filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))",
                }}
              />

              {/* Camera icon for single observations */}
              {!isCluster && (
                <Camera
                  x={-4}
                  y={-4}
                  width={8}
                  height={8}
                  color="white"
                />
              )}

              {/* Count for clusters */}
              {isCluster && (
                <text
                  textAnchor="middle"
                  y={4}
                  style={{
                    fontFamily: "system-ui",
                    fill: "#ffffff",
                    fontSize: markerSize * 0.8,
                    fontWeight: "bold",
                  }}
                >
                  {obs.count}
                </text>
              )}
            </motion.g>
          </Marker>
        );
      })}

      {/* Tooltip */}
      {hoveredObservation && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: mousePosition.x + 15,
            top: mousePosition.y - 10,
          }}
          onMouseMove={handleMouseMove}
        >
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden max-w-[200px]">
            {hoveredObservation.count > 1 ? (
              <div className="p-3">
                <p className="font-medium text-gray-800">
                  {hoveredObservation.count} observations
                </p>
                <p className="text-sm text-gray-500">Click to explore</p>
              </div>
            ) : (
              <>
                {hoveredObservation.photoUrl && (
                  <img
                    src={hoveredObservation.photoUrl}
                    alt={hoveredObservation.species}
                    className="w-full h-24 object-cover"
                  />
                )}
                <div className="p-2">
                  <p className="font-medium text-gray-800 text-sm">
                    {hoveredObservation.species}
                  </p>
                  {hoveredObservation.location && (
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {hoveredObservation.location.split(",")[0]}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Higher-order component to wrap EcoMapProgressOceanZones with observations
 * Usage: Import and use instead of EcoMapProgressOceanZones
 */
export function withObservationMarkers(EcoMapComponent) {
  return function EcoMapWithObservations(props) {
    const [selectedObservation, setSelectedObservation] = useState(null);

    return (
      <div className="relative">
        <EcoMapComponent {...props}>
          <ObservationMarkers
            onObservationClick={(obs) => setSelectedObservation(obs)}
          />
        </EcoMapComponent>

        {/* Observation Detail Modal */}
        <AnimatePresence>
          {selectedObservation && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setSelectedObservation(null)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {selectedObservation.photoUrl && (
                  <img
                    src={selectedObservation.photoUrl}
                    alt={selectedObservation.species}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4">
                  <h3 className="text-xl font-bold text-gray-800 mb-1">
                    {selectedObservation.species}
                  </h3>
                  <p className="text-gray-500 flex items-center gap-1 mb-4">
                    <MapPin className="w-4 h-4" />
                    {selectedObservation.location}
                  </p>
                  <button
                    onClick={() => setSelectedObservation(null)}
                    className="w-full py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };
}
