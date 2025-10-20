// src/components/exercises/AIConversationPractice.js
"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Loader2,
  Mic,
  MicOff,
  Volume2,
  RotateCcw,
  MessageSquare,
  User,
  Bot,
  AlertCircle,
} from "lucide-react";

export default function AIConversationPractice({
  scenario,
  conversationStarters,
  lessonId,
  onComplete,
  maxTurns = 6,
  englishVariant = "british",
  voiceGender = "male",
}) {
  // Storage keys for persisting content
  const storageKeyInput = `ai-conversation-${lessonId}-input`;
  const storageKeyMessages = `ai-conversation-${lessonId}-messages`;
  const storageKeyTurnCount = `ai-conversation-${lessonId}-turnCount`;
  const storageKeyErrors = `ai-conversation-${lessonId}-errors`;

  // Function to create initial messages
  const createInitialMessages = () => {
    const initial = [
      {
        role: "system",
        content: scenario,
        timestamp: new Date().toISOString(),
      },
    ];

    // Add initial coach message if we have conversation starters
    if (conversationStarters && conversationStarters.length > 0) {
      initial.push({
        role: "assistant",
        content:
          "Hello! I'm your academy coach. Let's have a conversation about your football journey. Feel free to use one of the conversation starters below, or start with your own introduction.",
        timestamp: new Date().toISOString(),
      });
    }

    return initial;
  };

  // Initialize state with localStorage data if available
  const [messages, setMessages] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(storageKeyMessages);
      if (saved) {
        try {
          const parsedMessages = JSON.parse(saved);
          // Validate that the saved messages match the current scenario
          if (
            parsedMessages &&
            Array.isArray(parsedMessages) &&
            parsedMessages.length > 0
          ) {
            // Check if the first system message matches the current scenario
            const savedSystemMessage = parsedMessages.find(
              (m) => m.role === "system"
            );
            if (savedSystemMessage && savedSystemMessage.content === scenario) {
              return parsedMessages;
            }
          }
        } catch (error) {
          console.error("Error loading saved messages:", error);
        }
      }
    }
    return createInitialMessages();
  });

  const [input, setInput] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(storageKeyInput);
      return saved || "";
    }
    return "";
  });

  const [turnCount, setTurnCount] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(storageKeyTurnCount);
      if (saved) {
        try {
          const count = parseInt(saved, 10);
          return isNaN(count) ? 0 : count;
        } catch (error) {
          console.error("Error loading saved turn count:", error);
        }
      }
    }
    return 0;
  });

  const [errors, setErrors] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(storageKeyErrors);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (error) {
          console.error("Error loading saved errors:", error);
        }
      }
    }
    return {};
  });

  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== "undefined" && messages.length > 0) {
      try {
        localStorage.setItem(storageKeyMessages, JSON.stringify(messages));
      } catch (error) {
        console.error("Error saving messages:", error);
      }
    }
  }, [messages, storageKeyMessages]);

  // Save input to localStorage as user types
  useEffect(() => {
    if (typeof window !== "undefined" && turnCount < maxTurns) {
      try {
        if (input) {
          localStorage.setItem(storageKeyInput, input);
        } else {
          localStorage.removeItem(storageKeyInput);
        }
      } catch (error) {
        console.error("Error saving input:", error);
      }
    }
  }, [input, storageKeyInput, turnCount, maxTurns]);

  // Save turn count to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(storageKeyTurnCount, turnCount.toString());
      } catch (error) {
        console.error("Error saving turn count:", error);
      }
    }
  }, [turnCount, storageKeyTurnCount]);

  // Save errors to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(storageKeyErrors, JSON.stringify(errors));
      } catch (error) {
        console.error("Error saving errors:", error);
      }
    }
  }, [errors, storageKeyErrors]);

  // Clear localStorage when conversation is completed (max turns reached)
  useEffect(() => {
    if (turnCount >= maxTurns && typeof window !== "undefined") {
      // Delay clearing to allow the user to see the final state
      const timeoutId = setTimeout(() => {
        try {
          localStorage.removeItem(storageKeyInput);
          localStorage.removeItem(storageKeyMessages);
          localStorage.removeItem(storageKeyTurnCount);
          localStorage.removeItem(storageKeyErrors);
        } catch (error) {
          console.error("Error clearing saved data on completion:", error);
        }
      }, 5000); // Clear after 5 seconds

      return () => clearTimeout(timeoutId);
    }
  }, [
    turnCount,
    maxTurns,
    storageKeyInput,
    storageKeyMessages,
    storageKeyTurnCount,
    storageKeyErrors,
  ]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = {
      role: "user",
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    // Clear saved input after sending
    try {
      localStorage.removeItem(storageKeyInput);
    } catch (error) {
      console.error("Error clearing saved input:", error);
    }
    setLoading(true);
    setTurnCount((prev) => prev + 1);

    try {
      const response = await fetch("/api/ai-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "conversation",
          content: input,
          context: `${scenario}. Turn ${turnCount + 1} of ${maxTurns}.`,
          lessonId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const aiMessage = {
          role: "assistant",
          content: data.feedback,
          timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, aiMessage]);

        // Store any errors for display
        if (data.analysis?.errors) {
          setErrors((prev) => ({
            ...prev,
            [userMessage.timestamp]: data.analysis.errors,
          }));
        }

        // Check if conversation is complete
        if (turnCount + 1 >= maxTurns && onComplete) {
          // Calculate score based on errors
          const errorCount = Object.keys(errors).length;
          const score = Math.max(50, 100 - errorCount * 10);
          setTimeout(() => onComplete(score), 2000);
        }
      }
    } catch (error) {
      console.error("Error in conversation:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "error",
          content: "Sorry, I had trouble understanding. Please try again.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const speakMessage = async (text) => {
    try {
      // Try OpenAI TTS first (if available)
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, englishVariant, voiceGender }),
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);

        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
        };

        audio.play();
      } else {
        throw new Error("TTS API not available");
      }
    } catch {
      // Fallback to browser TTS
      console.log("Using browser TTS fallback");

      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "en-GB";
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  const toggleListening = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Speech recognition is not supported in your browser.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-GB";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
      alert("Speech recognition failed. Please try again.");
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const resetConversation = () => {
    // Reset to initial messages
    const resetMessages = createInitialMessages();

    setMessages(resetMessages);
    setTurnCount(0);
    setErrors({});
    setInput("");

    // Clear all saved data from localStorage
    try {
      localStorage.removeItem(storageKeyInput);
      localStorage.removeItem(storageKeyMessages);
      localStorage.removeItem(storageKeyTurnCount);
      localStorage.removeItem(storageKeyErrors);
    } catch (error) {
      console.error("Error clearing saved data:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Scenario Header */}
      <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <MessageSquare className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Conversation Practice
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {scenario}
              </p>
            </div>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Turn {turnCount}/{maxTurns}
          </div>
        </div>
      </div>

      {/* Conversation Starters */}
      {/* {conversationStarters &&
        conversationStarters.length > 0 &&
        turnCount === 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
            <h4 className="text-gray-900 dark:text-white mb-3">
              Clique para usar a frase abaixo para iniciar a conversa - não
              esqueça de inserir seus próprios dados nos espaços em branco - ou
              digite sua própria mensagem abaixo.
            </h4>
            <div className="space-y-2">
              {conversationStarters.map((starter, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setInput(starter);
                    // Auto-save the starter
                    try {
                      localStorage.setItem(storageKeyInput, starter);
                    } catch (error) {
                      console.error("Error saving starter:", error);
                    }
                  }}
                  className="block w-full text-left p-3 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-600"
                >
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {index + 1}. {starter}
                  </span>
                </button>
              ))}
            </div> */}
      {/* <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
              Use a frase inicial acima para lhe ajudar a começar a conversa, ou
              digite sua própria mensagem abaixo.
            </p> */}
      {/* </div>
        )} */}

      {/* Messages Area */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg h-96 overflow-y-auto mb-4 p-4">
        <div className="space-y-4">
          {messages.map((message, index) => {
            if (message.role === "system") return null;

            const isUser = message.role === "user";
            const error = errors[message.timestamp];

            return (
              <div
                key={index}
                className={`flex ${isUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] ${isUser ? "order-2" : "order-1"}`}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    {isUser ? (
                      <>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          You
                        </span>
                        <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      </>
                    ) : (
                      <>
                        <Bot className="w-4 h-4 text-blue-500" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Coach
                        </span>
                      </>
                    )}
                  </div>

                  <div
                    className={`rounded-lg p-3 ${
                      isUser
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>

                  {/* Error feedback for user messages */}
                  {error && (
                    <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-xs">
                      <div className="flex items-start space-x-1">
                        <AlertCircle className="w-3 h-3 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                        <p className="text-yellow-800 dark:text-yellow-300">
                          {error}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Audio button for AI messages */}
                  {!isUser && (
                    <button
                      onClick={() =>
                        speakMessage(message.content, message.timestamp)
                      }
                      className="mt-2 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center space-x-1"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>Listen</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div className="flex items-end space-x-2">
          <button
            onClick={toggleListening}
            className={`p-2 rounded-lg transition-colors ${
              isListening
                ? "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400"
            }`}
          >
            {isListening ? (
              <MicOff className="w-5 h-5" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </button>

          <div className="flex-1">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message... (or use the microphone)"
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows="2"
              disabled={loading || turnCount >= maxTurns}
            />
          </div>

          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading || turnCount >= maxTurns}
            className={`p-2 rounded-lg transition-colors ${
              input.trim() && !loading && turnCount < maxTurns
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>

          <button
            onClick={resetConversation}
            className="p-2 bg-gray-100 text-gray-600 hover:bg-gray-200 
                     dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600 
                     rounded-lg transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        {turnCount >= maxTurns && (
          <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-sm text-green-800 dark:text-green-300">
              Great job! You&apos;ve completed the conversation practice.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
