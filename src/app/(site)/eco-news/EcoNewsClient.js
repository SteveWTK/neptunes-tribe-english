"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  ExternalLink,
  User,
  Globe,
  Bookmark,
  Filter,
  FishSymbol,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function EcoNewsClient() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [newsData, setNewsData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Categories for filtering
  const categories = [
    { id: "all", label: "All News", icon: "" },
    { id: "oceans", label: "Oceans", icon: "" },
    { id: "wildlife", label: "Wildlife", icon: "" },
    { id: "climate", label: "Climate", icon: "" },
    { id: "conservation", label: "Conservation", icon: "" },
    { id: "policy", label: "Policy", icon: "" },
    { id: "innovation", label: "Innovation", icon: "" },
    { id: "education", label: "Education", icon: "" },
  ];

  useEffect(() => {
    fetchNews();
  }, [selectedCategory]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const categoryParam =
        selectedCategory === "all" ? "" : `?category=${selectedCategory}`;
      const response = await fetch(`/api/eco-news${categoryParam}`);

      if (response.ok) {
        const data = await response.json();
        console.log("Fetched news data:", data);
        setNewsData(data);
      } else {
        console.error("Failed to fetch news, using mock data");
        // Fallback to mock data
        setNewsData(getMockData());
      }
    } catch (error) {
      console.error("Error fetching news, using mock data:", error);
      // Fallback to mock data
      setNewsData(getMockData());
    } finally {
      setLoading(false);
    }
  };

  // Mock data fallback
  const getMockData = () => [
    {
      id: 1,
      type: "news",
      title: "Antarctic Ice Sheet Melting Accelerates",
      summary:
        "New research shows Antarctic ice loss has tripled since 2012, contributing significantly to global sea level rise. Scientists warn of potential tipping points.",
      source_name: "Nature Climate Change",
      published_date: "2024-01-15",
      category: "climate",
      region_code: "AQ",
      source_url: "https://example.com/antarctic-ice",
      featured: true,
      read_time_minutes: 4,
    },
    {
      id: 2,
      type: "blog",
      title: "Teaching Environmental Literacy in the Digital Age",
      summary:
        "How modern educators can use technology and storytelling to make environmental issues accessible to young learners.",
      author_name: "Dr. Michael Watkins",
      published_date: "2024-01-14",
      category: "education",
      read_time_minutes: 5,
      featured: false,
    },
    {
      id: 3,
      type: "news",
      title: "Coral Reef Restoration Success in Great Barrier Reef",
      summary:
        "Scientists report positive signs in coral recovery efforts, with new techniques showing promise for large-scale restoration.",
      source_name: "Marine Biology Journal",
      published_date: "2024-01-13",
      category: "oceans",
      region_code: "AU",
      source_url: "https://example.com/coral-restoration",
      read_time_minutes: 3,
    },
    {
      id: 4,
      type: "student_submission",
      title: "How My School Reduced Plastic Waste by 80%",
      summary:
        "A student's innovative approach to tackling plastic pollution in their school cafeteria, with practical steps other schools can follow.",
      author_name: "Maria Santos, Age 16",
      published_date: "2024-01-12",
      category: "innovation",
      region_code: "BR",
      read_time_minutes: 6,
    },
  ];

  const filteredNews =
    selectedCategory === "all"
      ? newsData
      : newsData.filter((item) => item.category === selectedCategory);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getPostTypeIcon = (type) => {
    switch (type) {
      case "news":
        return "📰";
      case "blog":
        return "✍️";
      case "student_submission":
        return "🎓";
      default:
        return "📝";
    }
  };

  const getPostTypeLabel = (type) => {
    switch (type) {
      case "news":
        return "Latest News";
      case "blog":
        return "Editorial";
      case "student_submission":
        return "Student Voice";
      default:
        return "Article";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <section className="py-6 mt-1 mx-2 md:mx-4 lg:mx-6 text-[#1B3C53] dark:text-primary-50 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950 rounded-xl shadow-md hover:shadow-lg transition-shadow">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Habitat Eco News
            </h1>
            <p className="text-sm lg:text-[16px] font-semibold opacity-90 max-w-4xl mx-auto">
              Stay updated with the latest environmental news, expert insights,
              and inspiring student solutions from around the globe
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category Filter */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                  selectedCategory === category.id
                    ? "bg-[#273F4F] text-white shadow-lg"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-gray-700"
                }`}
              >
                {/* <span>{category.icon}</span> */}
                <span className="font-medium">{category.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">
              Loading latest eco-news...
            </p>
          </div>
        )}

        {/* News Feed */}
        {!loading && (
          <motion.div
            className="grid gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            {filteredNews.map((item, index) => (
              <motion.article
                key={item.id}
                className={`bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden ${
                  item.featured ? "ring-2 ring-green-500" : ""
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {getPostTypeIcon(item.type)}
                      </span>
                      <div>
                        <Badge className="mb-1">
                          {getPostTypeLabel(item.type)}
                        </Badge>
                        {item.featured && (
                          <Badge className="ml-2 bg-green-500">Featured</Badge>
                        )}
                      </div>
                    </div>

                    {item.region_code && (
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Globe className="w-4 h-4" />
                        <span>{item.region_code}</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {item.title}
                  </h2>

                  <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                    {item.summary}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(item.published_date)}</span>
                      </div>

                      {item.source_name && (
                        <div className="flex items-center gap-1">
                          <span>Source: {item.source_name}</span>
                        </div>
                      )}

                      {item.author_name && (
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>{item.author_name}</span>
                        </div>
                      )}

                      {item.read_time_minutes && (
                        <span>• {item.read_time_minutes} min read</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {item.source_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(item.source_url, "_blank")}
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          Read Full Story
                        </Button>
                      )}

                      {item.type === "blog" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            /* Navigate to full blog post */
                          }}
                        >
                          Read More
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && filteredNews.length === 0 && (
          <div className="text-center py-12">
            <Globe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No news in this category yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Check back soon for updates in{" "}
              {categories.find((c) => c.id === selectedCategory)?.label}
            </p>
          </div>
        )}

        {/* Call to Action */}
        <motion.div
          className="mt-16 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950 rounded-xl p-8 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="text-2xl font-bold mb-4">Want to contribute?</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Have an environmental story to share? We welcome submissions from
            students, educators, and environmental advocates.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-green-600 hover:bg-green-700">
              Submit Your Story
            </Button>
            <Button variant="outline">Suggest News Sources</Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
