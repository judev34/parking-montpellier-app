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
