// Types and interfaces for the application

export enum HazardType {
  FLOOD = 'flood',
  FIRE = 'fire',
  EARTHQUAKE = 'earthquake',
  LANDSLIDE = 'landslide',
  STORM = 'storm',
  OTHER = 'other'
}

export enum HazardSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum ConnectionStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  LORA = 'lora'
}

export enum UserRole {
  ADMIN = 'admin',
  TRUSTED = 'trusted',
  GENERAL = 'general'
}

export interface Location {
  lat: number;
  lng: number;
}

export interface HazardReport {
  id: string;
  type: HazardType;
  severity: HazardSeverity;
  location: Location;
  description: string;
  reportedBy: string;
  reportedAt: Date;
  verified: boolean;
  upvotes: number;
  image?: string;
}

export interface SafeShelter {
  id: string;
  name: string;
  location: Location;
  capacity: number;
  facilityType: string;
  contact: string;
  currentOccupancy?: number;
}

export interface SafeRoute {
  id: string;
  origin: Location;
  destination: Location;
  waypoints: Location[];
  hazardsAvoided: string[];
  distance: number;
  estimatedTime: number;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  trustLevel: number;
  reportCount: number;
  verifiedReportCount: number;
}