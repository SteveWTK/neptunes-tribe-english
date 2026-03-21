"use client";

import React, { useState, useRef } from "react";
import { Mic, MicOff, Play, RotateCcw, Pause, Volume2 } from "lucide-react";

/**
 * AISpeechPractice - Speech recognition and pronunciation practice component
 *
 * @param {Object} props
 * @param {string} props.expectedText - The text the user should read aloud
 * @param {string} props.lessonId - Lesson identifier
 * @param {Function} props.onComplete - Callback when practice is complete (receives XP score)
 * @param {string} props.speechApiEndpoint - API endpoint for speech analysis (default: "/api/ai-speech")
 * @param {number} props.maxRecordingTime - Maximum recording time in seconds (default: 10)
 * @param {Object} props.translations - UI text translations
 */
export default function AISpeechPractice({
  expectedText,
  lessonId,
  onComplete,
  speechApiEndpoint = "/api/ai-speech",
  maxRecordingTime = 10,
  translations = {},
}) {
  const t = {
    instructions: "Activate your microphone and read the text below aloud to practice and receive feedback on your pronunciation.",
    recording: "Recording...",
    click_to_start: "Click to start recording",
    max_seconds: "Max seconds",
    play: "Play",
    pause: "Pause",
    analyzing: "Analyzing...",
    get_feedback: "Get Feedback",
    try_again: "Try Again",
    recording_ready: "Recording ready! Listen to review your pronunciation, then click \"Get Feedback\" for analysis.",
    pronunciation: "Pronunciation",
    accuracy: "Accuracy",
    overall: "Overall",
    what_we_heard: "What we heard:",
    strengths: "Strengths",
    areas_to_improve: "Areas to Improve",
    encouragement: "Encouragement",
    practice_tips: "Practice Tips",
    practice_again: "Practice Again",
    continue_next: "Continue to Next Activity",
    ...translations,
  };

  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);
  const audioRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const audioChunks = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunks, { type: "audio/wav" });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      intervalRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= maxRecordingTime - 1) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (error) {
      console.error("Failed to start recording:", error);
      alert("Could not access microphone. Please check your permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      streamRef.current?.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
      clearInterval(intervalRef.current);
    }
  };

  const playRecording = () => {
    if (!audioUrl) return;

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    } else {
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setIsPlaying(false);
      };

      audio.play();
      setIsPlaying(true);
    }
  };

  const analyzeRecording = async () => {
    if (!audioBlob) return;

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.wav");
      formData.append("lessonId", lessonId || "demo");
      formData.append("expectedText", expectedText);
      formData.append("language", "en-GB");

      const response = await fetch(speechApiEndpoint, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to analyze speech");
      }

      setTranscript(result.transcript);
      setFeedback(result.feedback);
    } catch (error) {
      console.error("Speech analysis failed:", error);
      alert(`Failed to analyze recording: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const resetRecording = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }

    setAudioBlob(null);
    setAudioUrl(null);
    setIsPlaying(false);
    setTranscript("");
    setFeedback(null);
    setRecordingTime(0);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="ai-speech-practice">
      <div className="mb-6">
        <p className="px-4 mb-4 text-primary-800 dark:text-white">
          {t.instructions}
        </p>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <div className="bg-white dark:bg-gray-800 p-3 rounded border-l-4 border-accent-500">
            <p className="font-mono text-lg text-primary-900 dark:text-white">
              &quot;{expectedText}&quot;
            </p>
          </div>
        </div>
      </div>

      {/* Recording Controls */}
      <div className="recording-controls text-center mb-6">
        {!audioBlob && (
          <div>
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-all ${
                isRecording
                  ? "bg-red-700 hover:bg-red-800 animate-pulse"
                  : "bg-accent-500 hover:bg-accent-600"
              } text-white`}
            >
              {isRecording ? (
                <MicOff className="w-8 h-8" />
              ) : (
                <Mic className="w-8 h-8" />
              )}
            </button>

            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isRecording
                ? `${t.recording} ${recordingTime}s`
                : t.click_to_start}
            </p>

            {isRecording && (
              <div className="mt-2">
                <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto">
                  <div
                    className="h-2 bg-red-500 rounded-full transition-all duration-1000"
                    style={{
                      width: `${Math.min((recordingTime / maxRecordingTime) * 100, 100)}%`,
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {t.max_seconds}: {maxRecordingTime}
                </p>
              </div>
            )}
          </div>
        )}

        {audioBlob && !feedback && (
          <div>
            <div className="flex justify-center space-x-3 mb-4">
              <button
                onClick={playRecording}
                className="bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 flex items-center space-x-2"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
                <span>{isPlaying ? t.pause : t.play}</span>
              </button>

              <button
                onClick={analyzeRecording}
                disabled={loading}
                className="bg-accent-500 text-white px-6 py-3 rounded-lg hover:bg-accent-600 disabled:opacity-50 flex items-center space-x-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Play className="w-5 h-5" />
                )}
                <span>{loading ? t.analyzing : t.get_feedback}</span>
              </button>

              <button
                onClick={resetRecording}
                className="bg-primary-500 text-white px-4 py-3 rounded-lg hover:bg-primary-600 flex items-center space-x-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{t.try_again}</span>
              </button>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t.recording_ready}
            </p>
          </div>
        )}
      </div>

      {/* Feedback Display */}
      {feedback && (
        <div className="feedback-section">
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className={`text-2xl font-bold ${getScoreColor(feedback.pronunciation_score)}`}>
                {feedback.pronunciation_score}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{t.pronunciation}</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getScoreColor(feedback.accuracy_score)}`}>
                {feedback.accuracy_score}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{t.accuracy}</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getScoreColor(feedback.overall_score)}`}>
                {feedback.overall_score}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{t.overall}</div>
            </div>
          </div>

          {transcript && (
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h4 className="font-semibold mb-1 text-gray-900 dark:text-white">{t.what_we_heard}</h4>
              <p className="font-mono text-gray-700 dark:text-gray-300">&quot;{transcript}&quot;</p>
            </div>
          )}

          <div className="space-y-4">
            {feedback.strengths?.length > 0 && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">
                  {t.strengths}
                </h4>
                <ul className="text-sm text-green-700 dark:text-green-400 space-y-1">
                  {feedback.strengths.map((strength, index) => (
                    <li key={index}>• {strength}</li>
                  ))}
                </ul>
              </div>
            )}

            {feedback.improvements?.length > 0 && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2">
                  {t.areas_to_improve}
                </h4>
                <ul className="text-sm text-yellow-700 dark:text-yellow-400 space-y-1">
                  {feedback.improvements.map((improvement, index) => (
                    <li key={index}>• {improvement}</li>
                  ))}
                </ul>
              </div>
            )}

            {feedback.encouragement && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
                  {t.encouragement}
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  {feedback.encouragement}
                </p>
              </div>
            )}

            {feedback.specific_tips?.length > 0 && (
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <h4 className="font-semibold text-purple-800 dark:text-purple-300 mb-2">
                  {t.practice_tips}
                </h4>
                <ul className="text-sm text-purple-700 dark:text-purple-400 space-y-1">
                  {feedback.specific_tips.map((tip, index) => (
                    <li key={index}>• {tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {onComplete && (
            <div className="mt-6 flex justify-center space-x-4">
              <button
                onClick={resetRecording}
                className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600"
              >
                {t.practice_again}
              </button>
              <button
                onClick={() => {
                  const xp = Math.max(20, feedback?.overall_score || 50);
                  onComplete(xp);
                }}
                className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 font-semibold"
              >
                {t.continue_next} →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
