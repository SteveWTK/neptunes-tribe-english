"use client";

import { useState, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Camera,
  Upload,
  Loader2,
  MapPin,
  Sparkles,
  Check,
  X,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Leaf,
  Info,
} from "lucide-react";
import LocationPicker from "./LocationPicker";

const VISIBILITY_OPTIONS = [
  {
    value: "public",
    label: "Public",
    description: "Everyone can see this observation",
  },
  {
    value: "school",
    label: "School Only",
    description: "Only your school can see this",
  },
  { value: "private", label: "Private", description: "Only you can see this" },
];

export default function CreateObservationForm({
  challengeId = null,
  onSuccess,
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const fileInputRef = useRef(null);

  // Form state
  const [step, setStep] = useState(1); // 1: Photo, 2: Location, 3: AI ID, 4: Details
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Photo
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState(null);

  // Location
  const [location, setLocation] = useState(null);

  // AI Identification
  const [identifying, setIdentifying] = useState(false);
  const [identification, setIdentification] = useState(null);
  const [showAlternatives, setShowAlternatives] = useState(false);

  // Details
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [observationDate, setObservationDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // Handle photo selection
  const handlePhotoSelect = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/heic",
      "image/heif",
    ];
    if (!allowedTypes.includes(file.type)) {
      setError("Please select a valid image file (JPEG, PNG, WebP, or HEIC)");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Image must be less than 10MB");
      return;
    }

    setError(null);
    setPhotoFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPhotoPreview(e.target.result);
    };
    reader.readAsDataURL(file);
  }, []);

  // Upload photo
  const uploadPhoto = useCallback(async () => {
    if (!photoFile) return null;

    setUploadingPhoto(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", photoFile);

      const response = await fetch("/api/observations/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to upload photo");
      }

      setUploadedPhotoUrl(data.url);
      return data.url;
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.message);
      return null;
    } finally {
      setUploadingPhoto(false);
    }
  }, [photoFile]);

  // Handle location selection
  const handleLocationSelect = useCallback((locationData) => {
    setLocation(locationData);
  }, []);

  // Run AI identification
  const runIdentification = useCallback(async (photoUrl) => {
    if (!photoUrl) return;

    setIdentifying(true);
    setError(null);

    try {
      const response = await fetch("/api/species-identification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: photoUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to identify species");
      }

      setIdentification(data.identification);

      // Auto-fill title if species identified
      if (
        data.identification.species_name &&
        data.identification.species_name !== "Unknown"
      ) {
        setTitle(data.identification.species_name);
      }
    } catch (err) {
      console.error("Identification error:", err);
      setError(err.message);
    } finally {
      setIdentifying(false);
    }
  }, []);

  // Move to next step
  const goToNextStep = useCallback(async () => {
    setError(null);

    if (step === 1) {
      if (!photoFile) {
        setError("Please select a photo first");
        return;
      }

      // Upload photo
      const url = await uploadPhoto();
      if (url) {
        setStep(2);
      }
    } else if (step === 2) {
      if (!location) {
        setError("Please select a location");
        return;
      }

      // Run AI identification
      await runIdentification(uploadedPhotoUrl);
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    }
  }, [
    step,
    photoFile,
    location,
    uploadPhoto,
    uploadedPhotoUrl,
    runIdentification,
  ]);

  // Submit observation
  const handleSubmit = useCallback(async () => {
    if (!title.trim()) {
      setError("Please enter a title");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/observations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          photoUrl: uploadedPhotoUrl,
          latitude: location.lat,
          longitude: location.lng,
          locationName: location.locationName,
          regionCode: location.regionCode,
          observationDate,
          visibility,
          challengeId,
          // AI data
          aiSpeciesName: identification?.species_name,
          aiScientificName: identification?.scientific_name,
          aiConfidence: identification?.confidence,
          aiAlternatives: identification?.alternatives,
          aiEducationalNote: identification?.educational_note,
          aiFamily: identification?.family,
          aiHabitat: identification?.habitat,
          aiConservationStatus: identification?.conservation_status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create observation");
      }

      setSuccess(data);

      // Call success callback or redirect
      if (onSuccess) {
        onSuccess(data);
      } else {
        // Redirect after short delay
        setTimeout(() => {
          router.push("/observations");
        }, 2000);
      }
    } catch (err) {
      console.error("Submit error:", err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    title,
    description,
    uploadedPhotoUrl,
    location,
    observationDate,
    visibility,
    challengeId,
    identification,
    onSuccess,
    router,
  ]);

  // Success state
  if (success) {
    return (
      <div className="bg-accent-50 dark:bg-accent-900/30 border border-accent-200 dark:border-accent-700 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 bg-accent-100 dark:bg-accent-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-accent-600 dark:text-accent-400" />
        </div>
        <h3 className="text-xl font-bold text-accent-800 dark:text-accent-200 mb-2">
          Observation Created!
        </h3>
        <p className="text-accent-700 dark:text-accent-300 mb-4">
          You earned <strong>{success.pointsEarned} points</strong> for this
          observation.
        </p>
        {identification?.species_name &&
          identification.species_name !== "Unknown" && (
            <p className="text-sm text-accent-600 dark:text-accent-400">
              Species identified: {identification.species_name}
            </p>
          )}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
      {/* Progress Steps */}
      <div className="bg-gradient-to-r from-accent-500 to-accent-700 px-6 py-4">
        <div className="flex items-center justify-between">
          {[
            { num: 1, label: "Photo" },
            { num: 2, label: "Location" },
            { num: 3, label: "Identify" },
            { num: 4, label: "Details" },
          ].map((s, i) => (
            <div key={s.num} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  step >= s.num
                    ? "bg-white text-accent-600"
                    : "bg-accent-400/30 text-white/70"
                }`}
              >
                {step > s.num ? <Check className="w-4 h-4" /> : s.num}
              </div>
              <span
                className={`ml-2 text-sm font-medium hidden sm:inline ${
                  step >= s.num ? "text-white" : "text-white/70"
                }`}
              >
                {s.label}
              </span>
              {i < 3 && (
                <div
                  className={`w-8 sm:w-16 h-0.5 mx-2 ${
                    step > s.num ? "bg-white" : "bg-accent-400/30"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-6 mt-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto">
            <X className="w-4 h-4 text-red-400 hover:text-red-600 dark:hover:text-red-300" />
          </button>
        </div>
      )}

      {/* Step Content */}
      <div className="p-6">
        {/* Step 1: Photo Upload */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              Take or upload a photo
            </h2>

            {photoPreview ? (
              <div className="relative">
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="w-full h-64 object-cover rounded-lg"
                />
                <button
                  onClick={() => {
                    setPhotoFile(null);
                    setPhotoPreview(null);
                    setUploadedPhotoUrl(null);
                  }}
                  className="absolute top-2 right-2 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-accent-500 hover:bg-accent-50/50 dark:hover:bg-accent-900/20 transition-colors"
              >
                <Camera className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-300 font-medium">
                  Click to upload or take a photo
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  JPEG, PNG, WebP or HEIC (max 10MB)
                </p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
              onChange={handlePhotoSelect}
              className="hidden"
              capture="environment"
            />

            {photoPreview && (
              <button
                onClick={goToNextStep}
                disabled={uploadingPhoto}
                className="w-full py-3 bg-accent-600 hover:bg-accent-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {uploadingPhoto ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    Continue to Location
                    <MapPin className="w-5 h-5" />
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {/* Step 2: Location */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              Where did you see this?
            </h2>

            <LocationPicker
              onLocationSelect={handleLocationSelect}
              initialLocation={location}
            />

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Back
              </button>
              <button
                onClick={goToNextStep}
                disabled={!location}
                className="flex-1 py-3 bg-accent-600 hover:bg-accent-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                Identify Species
                <Sparkles className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: AI Identification */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              Species Identification
            </h2>

            {identifying ? (
              <div className="text-center py-8">
                <Loader2 className="w-12 h-12 animate-spin text-accent-600 dark:text-accent-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-300 font-medium">
                  Analyzing your photo...
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Our AI is identifying the species
                </p>
              </div>
            ) : identification ? (
              <div className="space-y-4">
                {/* Photo preview */}
                <img
                  src={uploadedPhotoUrl}
                  alt="Observation"
                  className="w-full h-48 object-cover rounded-lg"
                />

                {/* Main identification */}
                <div className="bg-accent-50 dark:bg-accent-900/30 border border-accent-200 dark:border-accent-700 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-accent-100 dark:bg-accent-800 rounded-full flex items-center justify-center shrink-0">
                      <Leaf className="w-5 h-5 text-accent-600 dark:text-accent-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-accent-800 dark:text-accent-200 text-lg">
                          {identification.species_name || "Unknown Species"}
                        </h3>
                        {identification.confidence && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              identification.confidence === "high"
                                ? "bg-green-200 dark:bg-green-900/50 text-green-800 dark:text-green-200"
                                : identification.confidence === "medium"
                                ? "bg-yellow-200 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200"
                                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                            }`}
                          >
                            {identification.confidence} confidence
                          </span>
                        )}
                      </div>
                      {identification.scientific_name && (
                        <p className="text-sm text-accent-700 dark:text-accent-300 italic mb-2">
                          {identification.scientific_name}
                        </p>
                      )}
                      {identification.family && (
                        <p className="text-sm text-accent-600 dark:text-accent-400">
                          Family: {identification.family}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Educational note */}
                {identification.educational_note && (
                  <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <Info className="w-5 h-5 text-blue-500 dark:text-blue-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-800 dark:text-blue-200 text-sm mb-1">
                          Did you know?
                        </p>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          {identification.educational_note}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Fun fact */}
                {identification.fun_fact && (
                  <div className="bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                    <p className="text-sm text-purple-700 dark:text-purple-300">
                      <span className="font-medium">Fun fact:</span>{" "}
                      {identification.fun_fact}
                    </p>
                  </div>
                )}

                {/* Alternatives */}
                {identification.alternatives?.length > 0 && (
                  <div>
                    <button
                      onClick={() => setShowAlternatives(!showAlternatives)}
                      className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white text-sm"
                    >
                      {showAlternatives ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                      {showAlternatives ? "Hide" : "Show"} alternative
                      suggestions
                    </button>

                    {showAlternatives && (
                      <div className="mt-2 space-y-2">
                        {identification.alternatives.map((alt, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                          >
                            {alt.photo_url && (
                              <img
                                src={alt.photo_url}
                                alt={alt.name}
                                className="w-10 h-10 object-cover rounded"
                              />
                            )}
                            <div>
                              <p className="font-medium text-gray-800 dark:text-white text-sm">
                                {alt.name}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                                {alt.scientific_name}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-500" />
                <p>
                  Could not identify species. Please continue and add details
                  manually.
                </p>
              </div>
            )}

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setStep(2)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Back
              </button>
              <button
                onClick={goToNextStep}
                className="flex-1 py-3 bg-accent-600 hover:bg-accent-700 text-white font-medium rounded-lg transition-colors"
              >
                Continue to Details
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Details */}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              Final Details
            </h2>

            {/* Preview row */}
            <div className="flex gap-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <img
                src={uploadedPhotoUrl}
                alt="Preview"
                className="w-20 h-20 object-cover rounded"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-800 dark:text-white">
                  {identification?.species_name || "Unknown Species"}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {location?.locationName || "Location set"}
                </p>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What did you observe?"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                maxLength={100}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add any notes about your observation..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                maxLength={500}
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Observation Date
              </label>
              <input
                type="date"
                value={observationDate}
                onChange={(e) => setObservationDate(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Visibility */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Who can see this?
              </label>
              <div className="space-y-2">
                {VISIBILITY_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      visibility === option.value
                        ? "border-accent-500 bg-accent-50 dark:bg-accent-900/30"
                        : "border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="visibility"
                      value={option.value}
                      checked={visibility === option.value}
                      onChange={(e) => setVisibility(e.target.value)}
                      className="text-accent-600 focus:ring-accent-500"
                    />
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white">
                        {option.label}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {option.description}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStep(3)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !title.trim()}
                className="flex-1 py-3 bg-accent-600 hover:bg-accent-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Create Observation
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
