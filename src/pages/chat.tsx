"use client";

import React, { useState, useEffect } from "react";
import { Send, User, Shield, MapPin, AlertTriangle, Home } from "lucide-react";
import {
  ChatAnalysisResponse,
  ChatAnalysisRequest,
  Location,
} from "../types/chat";

interface Message {
  id: string;
  content: string;
  sender: "user" | "system";
  timestamp: Date;
  analysis?: ChatAnalysisResponse;
}

const API_BASE_URL = "http://localhost:5000";

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "SafeRoute च्याटमा स्वागत छ! आज हामी तपाईंलाई कसरी सहायता गर्न सक्छौं?",
      sender: "system",
      timestamp: new Date(),
    },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    // Get user's location when component mounts
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          setLocationError(
            "Unable to get your location. Please enable location services."
          );
          console.error("Error getting location:", error);
        }
      );
    } else {
      setLocationError("Geolocation is not supported by your browser.");
    }
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !userLocation) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: newMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setNewMessage("");
    setIsLoading(true);

    try {
      const requestBody: ChatAnalysisRequest = {
        userInput: newMessage,
        location: userLocation,
      };

      const response = await fetch(`${API_BASE_URL}/analyze-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to analyze chat");
      }

      const analysisData: ChatAnalysisResponse = await response.json();

      const systemMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: analysisData.response,
        sender: "system",
        timestamp: new Date(),
        analysis: analysisData,
      };

      setMessages((prev) => [...prev, systemMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content:
          "Sorry, there was an error processing your request. Please try again.",
        sender: "system",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderAnalysis = (analysis: ChatAnalysisResponse) => {
    return (
      <div className="mt-3 space-y-4">
        {analysis.nearbyHazards.length > 0 && (
          <div className="bg-red-50 p-3 rounded-lg">
            <h4 className="font-medium text-red-800 mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Nearby Hazards
            </h4>
            <ul className="space-y-2">
              {analysis.nearbyHazards.map((hazard, index) => (
                <li key={index} className="text-sm text-red-700">
                  • {hazard.type} ({hazard.severity}): {hazard.description}
                </li>
              ))}
            </ul>
          </div>
        )}

        {analysis.recommendedShelters.length > 0 && (
          <div className="bg-green-50 p-3 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2 flex items-center gap-2">
              <Home className="h-4 w-4" />
              Recommended Shelters
            </h4>
            <ul className="space-y-2">
              {analysis.recommendedShelters.map((shelter, index) => (
                <li key={index} className="text-sm text-green-700">
                  • {shelter.name} ({shelter.facilityType}) -{" "}
                  {shelter.currentOccupancy}/{shelter.capacity} occupied
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold mb-2">Emergency Chat</h1>
        <p className="text-gray-600">
          Get real-time assistance and updates during emergencies.
        </p>
        {locationError && (
          <div className="mt-2 p-2 bg-red-50 text-red-700 rounded-lg text-sm">
            {locationError}
          </div>
        )}
        {userLocation && (
          <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            Location: {userLocation.lat.toFixed(4)},{" "}
            {userLocation.lng.toFixed(4)}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="h-[60vh] flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${
                  message.sender === "user" ? "flex-row-reverse" : ""
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.sender === "user"
                      ? "bg-blue-100 text-blue-600"
                      : "bg-green-100 text-green-600"
                  }`}
                >
                  {message.sender === "user" ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Shield className="h-4 w-4" />
                  )}
                </div>
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    message.sender === "user"
                      ? "bg-blue-50 text-blue-900"
                      : "bg-gray-50 text-gray-900"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  {message.analysis && renderAnalysis(message.analysis)}
                  <p className="text-xs text-gray-500 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <form
            onSubmit={handleSendMessage}
            className="border-t border-gray-200 p-4 bg-white"
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading || !userLocation}
              />
              <button
                type="submit"
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  isLoading || !userLocation
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                } text-white transition-colors`}
                disabled={isLoading || !userLocation}
              >
                <Send className="h-4 w-4" />
                {isLoading ? "Sending..." : "Send"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
