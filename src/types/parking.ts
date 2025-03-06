export interface ParkingLocation {
  type: string;
  coordinates: [number, number]; // Longitude, Latitude
}

export interface ParkingMetadata {
  timestamp?: {
    type: string;
    value: string;
  };
}

export interface ParkingValue<T> {
  type: string;
  value: T;
  metadata?: ParkingMetadata;
}

// Type pour les informations supplémentaires des parkings depuis /parkingspaces
export interface ParkingSpace {
  id: string;
  name: string;
  maxHeight?: number;
  levelNumber?: number;
  [key: string]: any; // Pour les autres propriétés que nous pourrions vouloir utiliser plus tard
}

export interface ParkingDetails {
  id: string;
  nom: string;
  entree: string;
  horaires: string;
  services: {
    pmr: boolean;
    nb_pmr?: number | string;
    resaplace: boolean;
    accompagnement_place: boolean;
    telepeage: boolean;
    lavage: boolean;
    places_famille: boolean;
    ve: boolean;
    depot_minute: boolean;
    parking_velos: boolean;
  };
  tarifs: {
    [key: string]: number | undefined;
    "30min"?: number;
    "1h"?: number;
    "3h"?: number;
    "24h"?: number;
    forfait_ptram?: number;
  };
  abonnements?: string;
  acces?: {
    tramway?: string[];
    bus?: string[];
    arret?: string;
  };
  telephone?: string;
}

export interface Parking {
  id: string;
  type: string;
  name?: ParkingValue<string>;
  location?: {
    type: string;
    value: {
      type: string;
      coordinates: number[];
    };
    metadata?: ParkingMetadata;
  };
  status?: ParkingValue<string>;
  availableSpotNumber?: ParkingValue<number>;
  totalSpotNumber?: ParkingValue<number>;
  occupancyPercentage?: number; // Calculé côté client
  remainingSpots?: number; // Calculé côté client
  // Informations supplémentaires
  maxHeight?: { type: string; value: number };
  levelNumber?: { type: string; value: number };
  description?: ParkingValue<string>; // Ajout de la propriété description
  // Nouvelles données enrichies
  details?: ParkingDetails;
  isRelais?: boolean; // Pour identifier les parkings relais
}

export interface ParkingHistoryPoint {
  attrName: string;
  attrType: string;
  attrValue: number;
  recvTime: string;
}

// Interface pour la réponse de l'API temporelle NGSI-LD
export interface ParkingTimeSeriesResponse {
  attrName: string;
  entityId: string;
  entityType?: string;
  index: string[];  // Liste des timestamps
  values: number[]; // Tableau simple des valeurs pour chaque timestamp
}
