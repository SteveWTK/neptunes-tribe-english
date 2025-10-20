"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Globe,
  TreePine,
  Mountain,
  Waves,
  MapPin,
  ChevronRight,
  Award,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import ProtectedRoute from "@/components/ProtectedRoute";
import { getAllWorlds } from "@/data/worldsConfig";
import { motion } from "framer-motion";

// Icon mapping for Lucide icons
const ICON_MAP = {
  TreePine: TreePine,
  Mountain: Mountain,
  Waves: Waves,
  Globe: Globe,
  Snowflake: Waves, // Using Waves as placeholder for Snowflake
};

function WorldsContent() {
  const router = useRouter();
  const { user } = useAuth();
  const [worlds, setWorlds] = useState([]);
  const [hoveredWorld, setHoveredWorld] = useState(null);

  useEffect(() => {
    // Load worlds from config
    const allWorlds = getAllWorlds();
    setWorlds(allWorlds);
  }, []);

  const getIcon = (iconName) => {
    const IconComponent = ICON_MAP[iconName] || Globe;
    return IconComponent;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-primary-900 dark:to-primary-800">
      {/* Hero Section */}
      <div className=" text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-3 mb-6">
              {/* <Globe className="w-12 h-12" /> */}
              <h1 className="text-4xl md:text-5xl font-bold">
                Explore Our World
              </h1>
            </div>
            <p className="text-xl text-white/90 max-w-3xl mx-auto mb-2">
              Journey through 8 incredible regions of our planet.
            </p>

            {/* Quick Stats */}
            {/* <div className="flex flex-wrap justify-center gap-6 mt-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3">
                <div className="text-3xl font-bold">7</div>
                <div className="text-sm text-white/80">Worlds</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3">
                <div className="text-3xl font-bold">28</div>
                <div className="text-sm text-white/80">Adventures</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3">
                <div className="text-3xl font-bold">100+</div>
                <div className="text-sm text-white/80">Units & Lessons</div>
              </div>
            </div> */}
          </motion.div>
        </div>
      </div>

      {/* Worlds Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {worlds.map((world, index) => {
            const IconComponent = getIcon(world.icon);
            const isHovered = hoveredWorld === world.id;

            return (
              <motion.div
                key={world.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onHoverStart={() => setHoveredWorld(world.id)}
                onHoverEnd={() => setHoveredWorld(null)}
                onClick={() => router.push(`/worlds/${world.slug}`)}
                className="group cursor-pointer"
              >
                <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden h-full">
                  {/* Colored Header Band */}
                  <div
                    className="h-2"
                    style={{ backgroundColor: world.color.primary }}
                  />

                  {/* World Number Badge */}
                  <div className="absolute top-6 left-6 z-10">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg"
                      style={{ backgroundColor: world.color.primary }}
                    >
                      {world.order}
                    </div>
                  </div>

                  {/* Image/Map Placeholder */}
                  <div
                    className="h-48 relative overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${world.color.light} 0%, ${world.color.primary}20 100%)`,
                    }}
                  >
                    {world.imageUrl ? (
                      <img
                        src={world.imageUrl}
                        alt={world.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <IconComponent
                          className="w-24 h-24 opacity-30"
                          style={{ color: world.color.primary }}
                        />
                      </div>
                    )}

                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

                    {/* Icon in corner */}
                    <div className="absolute bottom-4 right-4">
                      <div
                        className="bg-white/90 dark:bg-gray-800/90 rounded-full p-3 shadow-lg"
                        style={{ color: world.color.primary }}
                      >
                        <IconComponent className="w-6 h-6" />
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 flex items-center justify-between">
                      {world.name}
                      <ChevronRight
                        className={`w-6 h-6 text-gray-400 transition-transform ${
                          isHovered ? "translate-x-1" : ""
                        }`}
                      />
                    </h3>

                    <p className="text-gray-600 dark:text-gray-300 mb-6 line-clamp-3">
                      {world.description}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-6">
                      <div className="flex items-center gap-1">
                        <Sparkles className="w-4 h-4" />
                        <span>{world.adventures.length} Adventures</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        <span>4 Weeks</span>
                      </div>
                    </div>

                    {/* Adventure Preview */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                        Adventures Include:
                      </p>
                      <div className="space-y-1">
                        {world.adventures.slice(0, 2).map((adventure) => (
                          <div
                            key={adventure.id}
                            className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2"
                          >
                            <div
                              className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                              style={{ backgroundColor: world.color.primary }}
                            />
                            <span className="line-clamp-1">
                              {adventure.name}
                            </span>
                          </div>
                        ))}
                        {world.adventures.length > 2 && (
                          <div className="text-sm text-gray-500 dark:text-gray-400 pl-3.5">
                            +{world.adventures.length - 2} more...
                          </div>
                        )}
                      </div>
                    </div>

                    {/* CTA Button */}
                    <button
                      className="mt-6 w-full py-3 rounded-lg font-medium text-white transition-all duration-200 flex items-center justify-center gap-2 group-hover:shadow-lg"
                      style={{
                        backgroundColor: world.color.primary,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor =
                          world.color.secondary;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor =
                          world.color.primary;
                      }}
                    >
                      <span>Start Exploring</span>
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Coming Soon - 8th World */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: worlds.length * 0.1 }}
          className="mt-8"
        >
          <div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-2xl shadow-lg p-8 text-center border-2 border-dashed border-gray-300 dark:border-gray-600">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white dark:bg-gray-600 rounded-full mb-4">
              <Sparkles className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">
              More Worlds Coming Soon!
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Our 8th world is currently under development. Stay tuned for more
              exciting adventures!
            </p>
          </div>
        </motion.div>

        {/* Educational Context Section */}
        <div className="mt-16 bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 rounded-2xl p-8 border border-primary-200 dark:border-primary-800">
          <div className="flex items-start gap-6">
            <div className="hidden md:block">
              <Award className="w-16 h-16 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                A Year-Long Journey Around Our Planet
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Each World represents approximately 4 weeks of classroom
                learning. Students will explore diverse ecosystems, learn
                environmental vocabulary, and develop a deeper understanding of
                our planet&apos;s interconnected systems.
              </p>
              <div className="grid md:grid-cols-3 gap-4 mt-6">
                <div className="flex items-start gap-3">
                  <div className="bg-primary-100 dark:bg-primary-900 rounded-lg p-2">
                    <BookOpen className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      Structured Learning
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      4 weekly Adventures per World
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-accent-100 dark:bg-accent-900 rounded-lg p-2">
                    <Sparkles className="w-5 h-5 text-accent-600 dark:text-accent-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      Engaging Content
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Interactive lessons & activities
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-green-100 dark:bg-green-900 rounded-lg p-2">
                    <Globe className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      Global Perspective
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Understand our interconnected world
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WorldsPage() {
  return (
    <ProtectedRoute>
      <WorldsContent />
    </ProtectedRoute>
  );
}
