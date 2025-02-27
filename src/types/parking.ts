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

// Interface pour les séries temporelles avec le format standard NGSI-LD
export interface ParkingTimeSeriesResponse {
  attributeNames: string[];
  index: string[];  // Liste des timestamps
  values: number[][]; // Tableau 2D des valeurs pour chaque timestamp et attribut
}
