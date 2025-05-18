import React, { useState, useCallback } from "react";
import {
  AlertTriangle,
  Mic,
  MapPin,
  Camera,
  Send,
  Upload,
  X,
} from "lucide-react";
import { HazardType, HazardSeverity, Location } from "../../types";
import { GoogleGenAI } from "@google/genai";

interface HazardReportFormProps {
  userLocation?: Location;
  onSubmit: (reportData: {
    type: HazardType;
    severity: HazardSeverity;
    description: string;
    location: Location;
  }) => void;
}

const GEMINI_API_KEY = "AIzaSyDbc820MW8C3Ite0SRGCchH0bU6Ci9iShg";

const HazardReportForm: React.FC<HazardReportFormProps> = ({
  userLocation,
  onSubmit,
}) => {
  const [type, setType] = useState<HazardType>(HazardType.OTHER);
  const [severity, setSeverity] = useState<HazardSeverity>(
    HazardSeverity.MEDIUM
  );
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState<Location | undefined>(userLocation);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleVoiceRecord = () => {
    setIsRecordingVoice(!isRecordingVoice);

    if (!isRecordingVoice) {
      setTimeout(() => {
        setDescription(
          "Fire spotted near the main road with large smoke clouds visible"
        );
        setType(HazardType.FIRE);
        setIsRecordingVoice(false);
      }, 2000);
    }
  };

  const handleImageUpload = useCallback(async (file: File) => {
    if (!file) return;

    setSelectedImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) {
        handleImageUpload(file);
      }
    },
    [handleImageUpload]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleImageUpload(file);
      }
    },
    [handleImageUpload]
  );

  const analyzeImage = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

      // Convert image to base64
      const reader = new FileReader();
      reader.readAsDataURL(selectedImage);

      reader.onloadend = async () => {
        const base64Image = reader.result as string;
        const base64Data = base64Image.split(",")[1];

        console.log("Sending request to Gemini AI...");
        const response = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: [
            {
              parts: [
                {
                  text: "Analyze this image of a disaster or hazard. Provide a brief description (about 30 words) of what you see, including the type of hazard, severity, and any notable details. Focus on identifying the disaster type and its potential impact.",
                },
                {
                  inlineData: {
                    mimeType: selectedImage.type,
                    data: base64Data,
                  },
                },
              ],
            },
          ],
        });

        console.log("Raw Gemini AI Response:", response);

        // Get the response text
        const analysis =
          response.response?.text() ||
          response.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!analysis) {
          console.error("No analysis text found in response:", response);
          throw new Error("No analysis text found in response");
        }

        console.log("Analysis result:", analysis);
        setDescription(analysis);

        // Try to determine hazard type from analysis
        const analysisLower = analysis.toLowerCase();
        if (analysisLower.includes("fire")) {
          setType(HazardType.FIRE);
        } else if (analysisLower.includes("flood")) {
          setType(HazardType.FLOOD);
        } else if (analysisLower.includes("earthquake")) {
          setType(HazardType.EARTHQUAKE);
        } else if (analysisLower.includes("landslide")) {
          setType(HazardType.LANDSLIDE);
        }

        // Try to determine severity
        if (
          analysisLower.includes("severe") ||
          analysisLower.includes("critical") ||
          analysisLower.includes("extreme")
        ) {
          setSeverity(HazardSeverity.HIGH);
        } else if (
          analysisLower.includes("moderate") ||
          analysisLower.includes("medium")
        ) {
          setSeverity(HazardSeverity.MEDIUM);
        } else if (
          analysisLower.includes("minor") ||
          analysisLower.includes("low")
        ) {
          setSeverity(HazardSeverity.LOW);
        }
      };
    } catch (error) {
      console.error("Error analyzing image:", error);
      setDescription(
        "Error analyzing image. Please try again or enter description manually."
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!location) {
      alert("Location is required");
      return;
    }

    onSubmit({
      type,
      severity,
      description,
      location,
    });

    // Reset form
    setType(HazardType.OTHER);
    setSeverity(HazardSeverity.MEDIUM);
    setDescription("");
    setSelectedImage(null);
    setImagePreview(null);
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-4">
      <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
        <AlertTriangle className="h-5 w-5 text-red-500" />
        Report Hazard
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Hazard Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as HazardType)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {Object.values(HazardType).map((hazardType) => (
                <option key={hazardType} value={hazardType}>
                  {hazardType.charAt(0).toUpperCase() + hazardType.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Severity</label>
            <div className="grid grid-cols-4 gap-2">
              {Object.values(HazardSeverity).map((severityLevel) => (
                <button
                  key={severityLevel}
                  type="button"
                  className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                    severity === severityLevel
                      ? severityLevel === HazardSeverity.LOW
                        ? "bg-blue-100 text-blue-700"
                        : severityLevel === HazardSeverity.MEDIUM
                        ? "bg-yellow-100 text-yellow-700"
                        : severityLevel === HazardSeverity.HIGH
                        ? "bg-orange-100 text-orange-700"
                        : "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  onClick={() => setSeverity(severityLevel)}
                >
                  {severityLevel.charAt(0).toUpperCase() +
                    severityLevel.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <div className="relative">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Describe the hazard..."
              />

              <div className="absolute right-2 bottom-2 flex gap-2">
                <button
                  type="button"
                  className={`p-2 rounded-full ${
                    isRecordingVoice
                      ? "bg-red-100 text-red-600 animate-pulse"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  onClick={handleVoiceRecord}
                >
                  <Mic className="h-5 w-5" />
                </button>

                <label className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileInput}
                  />
                  <Camera className="h-5 w-5" />
                </label>
              </div>
            </div>

            {isRecordingVoice && (
              <div className="mt-2 text-sm text-red-600 flex items-center gap-1.5">
                <span className="h-2 w-2 bg-red-600 rounded-full animate-ping" />
                Recording voice... Speak clearly
              </div>
            )}
          </div>

          {/* Image Upload and Preview Section */}
          <div
            className={`mt-4 border-2 border-dashed rounded-lg p-4 ${
              isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Hazard preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  type="button"
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  onClick={() => {
                    setSelectedImage(null);
                    setImagePreview(null);
                  }}
                >
                  <X className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className={`mt-2 w-full py-2 rounded-lg text-white font-medium ${
                    isAnalyzing
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                  onClick={analyzeImage}
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? "Analyzing..." : "Analyze Image"}
                </button>
              </div>
            ) : (
              <div className="text-center">
                <Upload className="h-8 w-8 mx-auto text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">
                  Drag and drop an image here, or click the camera icon above
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-gray-500" />
              <span className="text-sm text-gray-700">
                {location
                  ? `Lat: ${location.lat.toFixed(
                      6
                    )}, Lng: ${location.lng.toFixed(6)}`
                  : "Location not available"}
              </span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-red-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-red-700 transition-colors"
          >
            <Send className="h-5 w-5" />
            Submit Report
          </button>
        </div>
      </form>
    </div>
  );
};

export default HazardReportForm;
