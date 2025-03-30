// src/lib/types/POITypes.ts
export interface POI {
    id: string;
    name: string;
    description: string;
    category: string;
    subcategory: string;
    latitude: number;
    longitude: number;
    elevation?: number;
    source: string;
    icon: string;
    images?: string[];
    tags?: string[];
    properties: {
      [key: string]: any;
      seasonStart?: number; // Monat 1-12
      seasonEnd?: number; // Monat 1-12
      accessibility?: string;
      lastVerified?: string; // ISO-Datum
      verifiedBy?: string;
      contactInfo?: string;
      website?: string;
      openingHours?: string;
      ratings?: number; // 1-5
      reviews?: Review[];
      waterQuality?: WaterQuality;
      campingAttributes?: CampingAttributes;
      gatheringAttributes?: GatheringAttributes;
      safetyWarning?: SafetyWarning;
      naturalHazard?: NaturalHazard;
      communityAttributes?: CommunityAttributes;
      eventAttributes?: EventAttributes;
      serviceAttributes?: ServiceAttributes;
    };
    temporaryEvent?: boolean;
    eventStart?: string; // ISO-Datum
    eventEnd?: string; // ISO-Datum
    isActive?: boolean; // Ob POI aktuell aktiv/verfügbar ist
    distance?: number; // Entfernung vom aktuellen Standort (wird dynamisch berechnet)
    travelTime?: number; // Geschätzte Reisezeit (wird dynamisch berechnet)
}

export interface Review {
  user: string;
  date: string;
  rating: number;
  comment: string;
}

// Detaillierte Informationen zu Wasserquellen
export interface WaterQuality {
  type: 'tap' | 'spring' | 'river' | 'lake' | 'filtered';
  drinkable: boolean;
  treatmentRecommended: boolean;
  flowRate?: 'high' | 'medium' | 'low' | 'seasonal';
  lastTestedDate?: string;
  lastTestedResult?: 'excellent' | 'good' | 'average' | 'poor' | 'unsafe';
  temperature?: number; // in °C
  minerals?: string[];
  notes?: string;
}

// Attribute für Camping-Spots
export interface CampingAttributes {
  groundType: 'grass' | 'forest' | 'sand' | 'rock' | 'mixed';
  shelter: 'none' | 'partial' | 'good';
  capacity: number;
  sunExposure: 'full' | 'partial' | 'shaded';
  windProtection: 'exposed' | 'partial' | 'sheltered';
  facilities: ('fireplace' | 'table' | 'trash' | 'toilet')[];
  mobileSignal: 'none' | 'weak' | 'moderate' | 'good';
  noiseLevel: 'silent' | 'quiet' | 'moderate' | 'noisy';
  privacyLevel: 'isolated' | 'secluded' | 'moderate' | 'busy';
  legalStatus: 'legal' | 'tolerated' | 'unclear' | 'prohibited';
  permissions?: string;
  nearbyWater?: boolean;
  notes?: string;
}

// Attribute für Sammelplätze (Nahrung/Pflanzen)
export interface GatheringAttributes {
  species: string[];
  quantity: 'sparse' | 'moderate' | 'abundant';
  harvestSeason: {
    from: number; // Monat 1-12
    to: number; // Monat 1-12
  };
  edible: boolean;
  medicinal: boolean;
  cautions?: string[];
  lastVisited?: string; // ISO-Datum
  cultivation: 'wild' | 'semi-wild' | 'cultivated';
  publicAccess: boolean;
  permissionRequired?: boolean;
  notes?: string;
}

// Sicherheitswarnungen
export interface SafetyWarning {
  type: 'wildlife' | 'weather' | 'terrain' | 'human' | 'other';
  severity: 'low' | 'moderate' | 'high' | 'extreme';
  animalSpecies?: string; // Bei wildlife
  weatherCondition?: string; // Bei weather
  terrainHazard?: string; // Bei terrain
  humanHazard?: string; // Bei human
  description: string;
  seasonality?: {
    from: number; // Monat 1-12
    to: number; // Monat 1-12
  };
  active: boolean;
  reportDate: string; // ISO-Datum
  reportedBy?: string;
  mitigation?: string;
}

// Natürliche Gefahren
export interface NaturalHazard {
  type: 'avalanche' | 'rockfall' | 'flood' | 'wildfire' | 'storm' | 'lightning' | 'other';
  risk: 'low' | 'moderate' | 'high' | 'extreme';
  frequency: 'rare' | 'occasional' | 'common' | 'seasonal';
  season?: {
    from: number; // Monat 1-12
    to: number; // Monat 1-12
  };
  lastOccurrence?: string; // ISO-Datum
  safetyInstructions?: string;
}

// Community- und Alternative Lebensformen-Attribute
export interface CommunityAttributes {
  type: 'intentional' | 'ecovillage' | 'commune' | 'cohousing' | 'farm' | 'hostel' | 'shared';
  focus: string[];
  population: number;
  established: number; // Jahr
  openToVisitors: boolean;
  stayOptions: ('day' | 'overnight' | 'workaway' | 'membership')[];
  contactPerson?: string;
  requirements?: string[];
  activities?: string[];
  philosophy?: string;
}

// Veranstaltungsattribute
export interface EventAttributes {
  type: 'festival' | 'gathering' | 'workshop' | 'market' | 'ceremony' | 'other';
  recurring: boolean;
  recurringPattern?: 'weekly' | 'monthly' | 'yearly' | 'seasonal';
  expectedAttendance: number;
  organizer?: string;
  cost: 'free' | 'donation' | 'paid';
  priceRange?: string;
  familyFriendly: boolean;
  registrationRequired: boolean;
  accommodationAvailable: boolean;
  foodAvailable: boolean;
}

// Service-Attribute (für RadService, Apotheken, usw.)
export interface ServiceAttributes {
  type: 'bike' | 'health' | 'food' | 'tech' | 'repair' | 'other';
  services: string[];
  professional: boolean;
  costLevel: 'free' | 'low' | 'moderate' | 'high';
  languages: string[];
  paymentOptions: ('cash' | 'card' | 'exchange' | 'other')[];
  emergencyService: boolean;
  certification?: string[];
  equipmentAvailable?: string[];
}