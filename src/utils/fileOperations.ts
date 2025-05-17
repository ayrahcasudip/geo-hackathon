import { HazardReport, SafeShelter } from "../types";

// Function to read JSON file
export const readJsonFile = async <T>(filePath: string): Promise<T> => {
  try {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${filePath}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    throw error;
  }
};

// Function to get hazards from localStorage or fallback to JSON file
export const getHazards = async (): Promise<HazardReport[]> => {
  try {
    // Try to get from localStorage first
    const storedHazards = localStorage.getItem("hazards");
    if (storedHazards) {
      return JSON.parse(storedHazards);
    }

    // If not in localStorage, fetch from JSON file
    const data = await readJsonFile<{ hazards: HazardReport[] }>(
      "/src/data/hazards.json"
    );
    // Store in localStorage for future use
    localStorage.setItem("hazards", JSON.stringify(data.hazards));
    return data.hazards;
  } catch (error) {
    console.error("Error getting hazards:", error);
    throw error;
  }
};

// Function to append new hazard
export const appendHazard = async (newHazard: HazardReport): Promise<void> => {
  try {
    // Get current hazards
    const currentHazards = await getHazards();

    // Add new hazard
    const updatedHazards = [...currentHazards, newHazard];

    // Update localStorage
    localStorage.setItem("hazards", JSON.stringify(updatedHazards));

    console.log("New hazard added:", newHazard);
  } catch (error) {
    console.error("Error appending hazard:", error);
    throw error;
  }
};

// Function to append new shelter to shelters.json
export const appendShelter = async (newShelter: SafeShelter): Promise<void> => {
  try {
    const response = await fetch("/src/data/shelters.json");
    const data = await response.json();

    // Add new shelter
    data.shelters.push(newShelter);

    // In a real app, this would be a POST request to update the file
    // For now, we'll just update the state in the components
    console.log("New shelter added:", newShelter);
  } catch (error) {
    console.error("Error appending shelter:", error);
    throw error;
  }
};
