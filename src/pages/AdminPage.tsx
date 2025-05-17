import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  Building2,
  Users,
  MapPin,
  Phone,
  Plus,
  Edit,
  Trash2,
  Shield,
  Activity,
  BarChart3,
} from "lucide-react";
import { getHazards } from "../utils/fileOperations";
import { HazardReport, SafeShelter } from "../types";
import sheltersData from "../data/shelters.json";

const AdminPage: React.FC = () => {
  const [hazards, setHazards] = useState<HazardReport[]>([]);
  const [shelters, setShelters] = useState<SafeShelter[]>(
    sheltersData.shelters
  );
  const [activeTab, setActiveTab] = useState<
    "hazards" | "shelters" | "analytics"
  >("hazards");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const loadedHazards = await getHazards();
        setHazards(loadedHazards);
        setLoading(false);
      } catch (error) {
        console.error("Error loading data:", error);
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getHazardStats = () => {
    const total = hazards.length;
    const verified = hazards.filter((h) => h.verified).length;
    const highSeverity = hazards.filter(
      (h) => h.severity.toLowerCase() === "high"
    ).length;
    const recent = hazards.filter((h) => {
      const reportedDate = new Date(h.reportedAt);
      const now = new Date();
      return now.getTime() - reportedDate.getTime() < 24 * 60 * 60 * 1000; // Last 24 hours
    }).length;

    return { total, verified, highSeverity, recent };
  };

  const getShelterStats = () => {
    const total = shelters.length;
    const totalCapacity = shelters.reduce(
      (sum, shelter) => sum + shelter.capacity,
      0
    );
    const availableCapacity = shelters.reduce(
      (sum, shelter) =>
        sum + (shelter.capacity - (shelter.currentOccupancy || 0)),
      0
    );
    const emergencyShelters = shelters.filter((s) =>
      s.facilities.includes("Emergency Services")
    ).length;

    return { total, totalCapacity, availableCapacity, emergencyShelters };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">
          Manage hazards, shelters, and view analytics
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Hazards</p>
              <h3 className="text-2xl font-bold">{getHazardStats().total}</h3>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm">
              <span>Verified</span>
              <span className="font-medium">{getHazardStats().verified}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>High Severity</span>
              <span className="font-medium">
                {getHazardStats().highSeverity}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Shelters</p>
              <h3 className="text-2xl font-bold">{getShelterStats().total}</h3>
            </div>
            <Building2 className="h-8 w-8 text-blue-500" />
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm">
              <span>Total Capacity</span>
              <span className="font-medium">
                {getShelterStats().totalCapacity}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Available</span>
              <span className="font-medium">
                {getShelterStats().availableCapacity}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Recent Hazards</p>
              <h3 className="text-2xl font-bold">{getHazardStats().recent}</h3>
            </div>
            <Activity className="h-8 w-8 text-yellow-500" />
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm">
              <span>Last 24 Hours</span>
              <span className="font-medium">{getHazardStats().recent}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Emergency Shelters</p>
              <h3 className="text-2xl font-bold">
                {getShelterStats().emergencyShelters}
              </h3>
            </div>
            <Shield className="h-8 w-8 text-green-500" />
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm">
              <span>With Emergency Services</span>
              <span className="font-medium">
                {getShelterStats().emergencyShelters}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab("hazards")}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === "hazards"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Hazards
            </button>
            <button
              onClick={() => setActiveTab("shelters")}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === "shelters"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Shelters
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === "analytics"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Analytics
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "hazards" && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Hazard Reports</h2>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors">
                  <Plus className="h-4 w-4" />
                  Add Hazard
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Severity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reported
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {hazards.map((hazard) => (
                      <tr key={hazard.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {hazard.type}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getSeverityColor(
                              hazard.severity
                            )}`}
                          >
                            {hazard.severity}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {hazard.location.lat.toFixed(4)},{" "}
                            {hazard.location.lng.toFixed(4)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(hazard.reportedAt).toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              hazard.verified
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {hazard.verified ? "Verified" : "Pending"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900 mr-3">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "shelters" && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Safe Shelters</h2>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors">
                  <Plus className="h-4 w-4" />
                  Add Shelter
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {shelters.map((shelter) => (
                  <div
                    key={shelter.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-medium text-lg text-blue-600">
                        {shelter.name}
                      </h3>
                      <div className="flex gap-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-500" />
                        <span>{shelter.facilityType}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span>
                          Capacity: {shelter.capacity}
                          {shelter.currentOccupancy !== undefined && (
                            <span className="text-green-600 ml-1">
                              ({shelter.currentOccupancy} available)
                            </span>
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span>
                          {shelter.location.lat.toFixed(4)},{" "}
                          {shelter.location.lng.toFixed(4)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span>{shelter.contact}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {shelter.facilities.map((facility, index) => (
                          <span
                            key={index}
                            className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded"
                          >
                            {facility}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "analytics" && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Analytics Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium mb-4">
                    Hazard Distribution
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600">
                          High Severity
                        </span>
                        <span className="text-sm font-medium">
                          {getHazardStats().highSeverity}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-red-600 h-2 rounded-full"
                          style={{
                            width: `${
                              (getHazardStats().highSeverity /
                                getHazardStats().total) *
                              100
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600">Verified</span>
                        <span className="text-sm font-medium">
                          {getHazardStats().verified}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{
                            width: `${
                              (getHazardStats().verified /
                                getHazardStats().total) *
                              100
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium mb-4">Shelter Capacity</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600">
                          Total Capacity
                        </span>
                        <span className="text-sm font-medium">
                          {getShelterStats().totalCapacity}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: "100%" }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600">Available</span>
                        <span className="text-sm font-medium">
                          {getShelterStats().availableCapacity}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{
                            width: `${
                              (getShelterStats().availableCapacity /
                                getShelterStats().totalCapacity) *
                              100
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
