"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Calendar,
  Target,
  Trophy,
  Users,
  Play,
  ExternalLink,
  Check,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function NGOChallengeCard({ challenge, onJoin }) {
  const { data: session } = useSession();
  const router = useRouter();

  const [showVideo, setShowVideo] = useState(false);
  const [joining, setJoining] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const ngo = challenge.ngo;
  const userProgress = challenge.user_progress;
  const hasJoined = !!userProgress;
  const isCompleted = userProgress?.status === "completed";

  // Calculate days remaining
  const getDaysRemaining = () => {
    if (!challenge.end_date) return null;
    const end = new Date(challenge.end_date);
    const now = new Date();
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const daysRemaining = getDaysRemaining();

  // Extract video ID from YouTube/Vimeo URL
  const getVideoEmbed = (url) => {
    if (!url) return null;

    // YouTube
    const youtubeMatch = url.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }

    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }

    return url;
  };

  const handleJoin = async () => {
    if (!session) {
      router.push("/login");
      return;
    }

    setJoining(true);

    try {
      const response = await fetch("/api/challenges/ngo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeId: challenge.id }),
      });

      const data = await response.json();

      if (response.ok) {
        if (onJoin) {
          onJoin(data.challenge);
        }
      }
    } catch (err) {
      console.error("Error joining challenge:", err);
    } finally {
      setJoining(false);
    }
  };

  const progressPercent = userProgress
    ? Math.min(100, (userProgress.progress_count / userProgress.target_count) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-2xl shadow-lg overflow-hidden border-2 ${
        challenge.featured ? "border-green-500" : "border-transparent"
      }`}
    >
      {/* Featured Badge */}
      {challenge.featured && (
        <div className="bg-green-500 text-white text-center py-1 text-sm font-medium">
          Featured Challenge
        </div>
      )}

      {/* NGO Header */}
      {ngo && (
        <div className="bg-gray-50 px-4 py-3 flex items-center gap-3 border-b">
          {ngo.logo_url ? (
            <img
              src={ngo.logo_url}
              alt={ngo.name}
              className="w-10 h-10 rounded-lg object-cover"
            />
          ) : (
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-green-600" />
            </div>
          )}
          <div className="flex-1">
            <p className="font-medium text-gray-800">{ngo.name}</p>
            {ngo.website && (
              <a
                href={ngo.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-green-600 hover:underline flex items-center gap-1"
              >
                Visit website <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      )}

      {/* Challenge Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="text-xl font-bold text-gray-800 mb-2">{challenge.title}</h3>

        {/* Description */}
        <p className={`text-gray-600 ${expanded ? "" : "line-clamp-2"}`}>
          {challenge.description}
        </p>
        {challenge.description?.length > 100 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm text-green-600 hover:underline flex items-center gap-1 mt-1"
          >
            {expanded ? (
              <>
                Show less <ChevronUp className="w-4 h-4" />
              </>
            ) : (
              <>
                Read more <ChevronDown className="w-4 h-4" />
              </>
            )}
          </button>
        )}

        {/* Video Section */}
        {challenge.video_url && (
          <div className="mt-4">
            {showVideo ? (
              <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-900">
                <iframe
                  src={getVideoEmbed(challenge.video_url)}
                  title={challenge.title}
                  className="absolute inset-0 w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <button
                onClick={() => setShowVideo(true)}
                className="w-full relative aspect-video rounded-lg overflow-hidden bg-gray-100 group"
              >
                {challenge.video_thumbnail_url ? (
                  <img
                    src={challenge.video_thumbnail_url}
                    alt="Video thumbnail"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-blue-100" />
                )}

                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="w-8 h-8 text-green-600 ml-1" />
                  </div>
                </div>

                <div className="absolute bottom-3 left-3 bg-black/70 text-white text-sm px-2 py-1 rounded">
                  Watch NGO Message
                </div>
              </button>
            )}
          </div>
        )}

        {/* Challenge Details */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <Target className="w-5 h-5 text-gray-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-gray-800">
              {challenge.target_count || 1}
            </p>
            <p className="text-xs text-gray-500">Observations</p>
          </div>

          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <Trophy className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-gray-800">
              {challenge.points_reward}
            </p>
            <p className="text-xs text-gray-500">Points</p>
          </div>

          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <Calendar className="w-5 h-5 text-blue-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-gray-800">
              {daysRemaining !== null ? daysRemaining : "∞"}
            </p>
            <p className="text-xs text-gray-500">Days Left</p>
          </div>
        </div>

        {/* Progress (if joined) */}
        {hasJoined && (
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Your Progress</span>
              <span className="font-medium text-gray-800">
                {userProgress.progress_count}/{userProgress.target_count}
              </span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  isCompleted ? "bg-green-500" : "bg-green-400"
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            {isCompleted && (
              <div className="mt-2 flex items-center gap-2 text-green-600 text-sm font-medium">
                <Check className="w-4 h-4" />
                Challenge Completed! You earned {challenge.points_reward} points.
              </div>
            )}
          </div>
        )}

        {/* Action Button */}
        {!hasJoined && (
          <button
            onClick={handleJoin}
            disabled={joining}
            className="w-full mt-4 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {joining ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Joining...
              </>
            ) : (
              "Join Challenge"
            )}
          </button>
        )}

        {hasJoined && !isCompleted && (
          <button
            onClick={() => router.push(`/observations/create?challenge=${challenge.id}`)}
            className="w-full mt-4 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors"
          >
            Submit Observation
          </button>
        )}
      </div>
    </motion.div>
  );
}
