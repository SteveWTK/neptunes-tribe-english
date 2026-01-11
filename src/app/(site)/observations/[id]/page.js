"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Heart,
  MessageCircle,
  Share2,
  Loader2,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Send,
  Trash2,
  Leaf,
  Info,
} from "lucide-react";

export default function ObservationDetailPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const observationId = params.id;

  const [observation, setObservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comment, setComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [comments, setComments] = useState([]);

  // Fetch observation details
  useEffect(() => {
    const fetchObservation = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/observations/${observationId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch observation");
        }

        setObservation(data.observation);
        setComments(data.comments || []);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (observationId) {
      fetchObservation();
    }
  }, [observationId]);

  // Handle like
  const handleLike = async () => {
    if (!session) {
      router.push("/auth/signin");
      return;
    }

    try {
      const response = await fetch(`/api/observations/${observationId}/like`, {
        method: "POST",
      });

      if (response.ok) {
        setObservation((prev) => ({
          ...prev,
          likes_count: prev.user_has_liked
            ? prev.likes_count - 1
            : prev.likes_count + 1,
          user_has_liked: !prev.user_has_liked,
        }));
      }
    } catch (err) {
      console.error("Like error:", err);
    }
  };

  // Handle comment submission
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!comment.trim() || !session) return;

    setSubmittingComment(true);
    try {
      const response = await fetch(
        `/api/observations/${observationId}/comments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: comment }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setComments((prev) => [data.comment, ...prev]);
        setComment("");
        setObservation((prev) => ({
          ...prev,
          comments_count: (prev.comments_count || 0) + 1,
        }));
      }
    } catch (err) {
      console.error("Comment error:", err);
    } finally {
      setSubmittingComment(false);
    }
  };

  // Handle share
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: observation.title,
          text: `Check out this ${observation.ai_species_name || "wildlife"} observation!`,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  // Get confidence badge
  const getConfidenceBadge = (confidence) => {
    switch (confidence) {
      case "high":
        return {
          icon: CheckCircle,
          label: "High Confidence",
          color: "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300",
        };
      case "medium":
        return {
          icon: AlertCircle,
          label: "Medium Confidence",
          color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300",
        };
      default:
        return {
          icon: HelpCircle,
          label: "Needs Review",
          color: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-primary-900">
        <Loader2 className="w-8 h-8 animate-spin text-accent-600" />
      </div>
    );
  }

  if (error || !observation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-primary-900">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
            Observation Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error || "This observation may have been removed or doesn't exist."}
          </p>
          <Link
            href="/observations"
            className="inline-flex items-center gap-2 text-accent-600 dark:text-accent-400 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Observations
          </Link>
        </div>
      </div>
    );
  }

  const confidenceBadge = getConfidenceBadge(observation.ai_confidence);
  const ConfidenceIcon = confidenceBadge.icon;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-primary-900">
      {/* Header */}
      <div className="bg-white dark:bg-primary-950 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Photo */}
            <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm">
              <div className="aspect-[4/3] relative">
                <img
                  src={observation.photo_url}
                  alt={observation.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Actions Bar */}
              <div className="p-4 flex items-center justify-between border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleLike}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
                      observation.user_has_liked
                        ? "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                        : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        observation.user_has_liked ? "fill-current" : ""
                      }`}
                    />
                    <span className="font-medium">
                      {observation.likes_count || 0}
                    </span>
                  </button>

                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <MessageCircle className="w-5 h-5" />
                    <span className="font-medium">
                      {observation.comments_count || 0}
                    </span>
                  </div>
                </div>

                {observation.points_earned && (
                  <div className="flex items-center gap-1 text-accent-600 dark:text-accent-400 font-medium">
                    <Leaf className="w-4 h-4" />
                    +{observation.points_earned} pts
                  </div>
                )}
              </div>
            </div>

            {/* Comments Section */}
            <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
              <h3 className="font-semibold text-gray-800 dark:text-white mb-4">
                Comments ({comments.length})
              </h3>

              {/* Comment Form */}
              {session ? (
                <form onSubmit={handleSubmitComment} className="mb-6">
                  <div className="flex gap-3">
                    <img
                      src={session.user.image || "/default-avatar.png"}
                      alt={session.user.name}
                      className="w-8 h-8 rounded-full flex-shrink-0"
                    />
                    <div className="flex-1">
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Add a comment..."
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
                      />
                      <div className="flex justify-end mt-2">
                        <button
                          type="submit"
                          disabled={!comment.trim() || submittingComment}
                          className="px-4 py-1.5 bg-accent-600 hover:bg-accent-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                        >
                          {submittingComment ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                          Post
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
                  <p className="text-gray-600 dark:text-gray-300 mb-2">
                    Sign in to leave a comment
                  </p>
                  <Link
                    href="/auth/signin"
                    className="text-accent-600 dark:text-accent-400 font-medium hover:underline"
                  >
                    Sign In
                  </Link>
                </div>
              )}

              {/* Comments List */}
              {comments.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No comments yet. Be the first!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {comments.map((c) => (
                    <div key={c.id} className="flex gap-3">
                      <img
                        src={c.user?.image || "/default-avatar.png"}
                        alt={c.user?.name}
                        className="w-8 h-8 rounded-full flex-shrink-0"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-800 dark:text-white text-sm">
                            {c.user?.name || "Anonymous"}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(c.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 text-sm">
                          {c.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-2 space-y-4">
            {/* Species Info */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    {observation.ai_species_name || observation.title}
                  </h1>
                  {observation.ai_scientific_name && (
                    <p className="text-gray-500 dark:text-gray-400 italic">
                      {observation.ai_scientific_name}
                    </p>
                  )}
                </div>
              </div>

              {/* Confidence Badge */}
              {observation.ai_confidence && (
                <div
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${confidenceBadge.color}`}
                >
                  <ConfidenceIcon className="w-4 h-4" />
                  {confidenceBadge.label}
                </div>
              )}

              {/* AI Details */}
              {(observation.ai_family || observation.ai_habitat) && (
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 space-y-2">
                  {observation.ai_family && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500 dark:text-gray-400">
                        Family:
                      </span>
                      <span className="text-gray-800 dark:text-gray-200">
                        {observation.ai_family}
                      </span>
                    </div>
                  )}
                  {observation.ai_habitat && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500 dark:text-gray-400">
                        Habitat:
                      </span>
                      <span className="text-gray-800 dark:text-gray-200">
                        {observation.ai_habitat}
                      </span>
                    </div>
                  )}
                  {observation.ai_conservation_status && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500 dark:text-gray-400">
                        Conservation:
                      </span>
                      <span className="text-gray-800 dark:text-gray-200">
                        {observation.ai_conservation_status}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Educational Note */}
              {observation.ai_educational_note && (
                <div className="mt-4 p-3 bg-accent-50 dark:bg-accent-900/30 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-accent-600 dark:text-accent-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-accent-800 dark:text-accent-200">
                      {observation.ai_educational_note}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Location & Time */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
              <h3 className="font-semibold text-gray-800 dark:text-white mb-3">
                Details
              </h3>

              <div className="space-y-3">
                {observation.location_name && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-gray-800 dark:text-gray-200 text-sm">
                        {observation.location_name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {observation.latitude?.toFixed(4)},{" "}
                        {observation.longitude?.toFixed(4)}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-gray-800 dark:text-gray-200 text-sm">
                      {new Date(
                        observation.observation_date || observation.created_at
                      ).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Observer Info */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
              <h3 className="font-semibold text-gray-800 dark:text-white mb-3">
                Observer
              </h3>

              <div className="flex items-center gap-3">
                {observation.user?.image ? (
                  <img
                    src={observation.user.image}
                    alt={observation.user.name}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-accent-100 dark:bg-accent-900 flex items-center justify-center">
                    <span className="text-accent-700 dark:text-accent-300 font-medium">
                      {observation.user?.name?.[0] || "?"}
                    </span>
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">
                    {observation.user?.name || "Anonymous"}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Naturalist
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            {observation.description && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
                <h3 className="font-semibold text-gray-800 dark:text-white mb-2">
                  Notes
                </h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  {observation.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
