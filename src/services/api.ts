import axios from 'axios';
import type { Parking, ParkingTimeSeriesResponse } from '@/types/parking';

const API_BASE_URL = 'https://portail-api-data.montpellier3m.fr';
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes en millisecondes

// Cache pour stocker les réponses de l'API
interface CacheItem<T> {
  data: T;
  timestamp: number;
}

const cache: Record<string, CacheItem<any>> = {};

// Fonction utilitaire pour obtenir des données avec mise en cache
async function getWithCache<T>(url: string): Promise<T> {
  const cacheKey = url;
  const now = Date.now();
  
  // Si nous avons des données en cache et qu'elles sont encore valides
  if (cache[cacheKey] && now - cache[cacheKey].timestamp < CACHE_DURATION) {
    return cache[cacheKey].data;
  }
  
  // Sinon, nous faisons un nouvel appel API
  try {
    console.log(`Appel API: ${url}`); // Ajouter un log pour déboguer
    const response = await axios.get<T>(url);
    
    // Ajouter un log pour les premières données brutes pour déboguer
    console.log('Structure de la réponse brute:', typeof response.data);
    if (Array.isArray(response.data) && response.data.length > 0) {
      console.log('Premier élément (brut):', response.data[0]);
    } else if (typeof response.data === 'object' && response.data !== null) {
      // Si c'est un objet avec une propriété qui contient la liste des parkings
      console.log('Propriétés de la réponse:', Object.keys(response.data));
    }
    
    // Mettre à jour le cache
    cache[cacheKey] = {
      data: response.data,
      timestamp: now
    };
    
    console.log(`Réponse API reçue pour ${url}`, response.status);
    
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de l'appel API: ${url}`, error);
    throw error;
  }
}

export const parkingApi = {
  /**
   * Récupère la liste de tous les parkings
   */
  async getAllParkings(): Promise<Parking[]> {
    const url = `${API_BASE_URL}/offstreetparking?limit=1000`;
    
    console.log('Tentative de récupération des parkings...');
    try {
      const parkings = await getWithCache<Parking[]>(url);
      console.log(`Récupération réussie de ${parkings.length} parkings`);
      
      // Statistiques sur les parkings
      const parkingStats = {
        total: parkings.length,
        withAvailableSpots: parkings.filter(p => p.availableSpotNumber?.value !== undefined).length,
        withTotalSpots: parkings.filter(p => p.totalSpotNumber?.value !== undefined).length,
        withName: parkings.filter(p => p.name?.value !== undefined).length,
        withStatus: parkings.filter(p => p.status?.value !== undefined).length,
        withLocation: parkings.filter(p => p.location?.value?.coordinates !== undefined).length
      };
      console.log('Statistiques des parkings:', parkingStats);
      
      // Log détaillé des 5 premiers parkings pour debug
      if (parkings.length > 0) {
        console.log('Exemple des 5 premiers parkings:', parkings.slice(0, 5).map(parking => ({
          id: parking.id,
          name: parking.name?.value,
          status: parking.status?.value,
          availableSpots: parking.availableSpotNumber?.value,
          totalSpots: parking.totalSpotNumber?.value,
          location: parking.location?.value?.coordinates
        })));
      }
      
      // Enrichir les données avec des calculs supplémentaires
      return parkings.map(parking => {
        const available = parking.availableSpotNumber?.value || 0;
        const total = parking.totalSpotNumber?.value || 0;
        
        return {
          ...parking,
          occupancyPercentage: total ? Math.round(((total - available) / total) * 100) : 0,
          remainingSpots: available
        };
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des parkings:', error);
      // Retourner un tableau vide en cas d'erreur pour éviter les crashs
      return [];
    }
  },
  
  /**
   * Récupère les détails d'un parking spécifique par son ID
   */
  async getParkingById(parkingId: string): Promise<Parking> {
    // Extraire l'identifiant numérique si l'ID a déjà le préfixe
    let numericId = parkingId;
    
    // Si l'ID commence par le préfixe, extraire juste la partie numérique
    if (parkingId.startsWith('urn:ngsi-ld:parking:')) {
      // Extraire la partie après le dernier ":"
      numericId = parkingId.split(':').pop() || parkingId;
    }
    
    // Formater correctement l'ID
    const formattedId = `urn:ngsi-ld:parking:${numericId}`;
    
    console.log(`ID original: ${parkingId}, ID formaté: ${formattedId}`);
    
    const url = `${API_BASE_URL}/offstreetparking?id=${encodeURIComponent(formattedId)}`;
    
    console.log(`Tentative de récupération du parking ${formattedId}...`);
    try {
      const parkings = await getWithCache<Parking[]>(url);
      
      if (!parkings || parkings.length === 0) {
        console.warn(`Aucun parking trouvé avec l'ID ${formattedId}`);
        throw new Error(`Aucun parking trouvé avec l'ID ${formattedId}`);
      }
      
      const parking = parkings[0];
      console.log(`Parking récupéré: ${parking.name?.value || 'Sans nom'}`);
      
      // Calculer des données supplémentaires
      const available = parking.availableSpotNumber?.value || 0;
      const total = parking.totalSpotNumber?.value || 0;
      
      return {
        ...parking,
        occupancyPercentage: total ? Math.round(((total - available) / total) * 100) : 0,
        remainingSpots: available
      };
    } catch (error) {
      console.error(`Erreur lors de la récupération du parking ${formattedId}:`, error);
      throw error;
    }
  },
  
  /**
   * Récupère l'historique des places disponibles pour un parking spécifique
   */
  async getParkingHistory(parkingId: string): Promise<ParkingTimeSeriesResponse> {
    // Extraire l'identifiant numérique si l'ID a déjà le préfixe
    let numericId = parkingId;
    
    // Si l'ID commence par le préfixe, extraire juste la partie numérique
    if (parkingId.startsWith('urn:ngsi-ld:parking:')) {
      // Extraire la partie après le dernier ":"
      numericId = parkingId.split(':').pop() || parkingId;
    }
    
    // Formater correctement l'ID
    const formattedId = `urn:ngsi-ld:parking:${numericId}`;
    
    console.log(`ID original pour historique: ${parkingId}, ID formaté: ${formattedId}`);
    
    try {
      // Essayer d'abord l'endpoint timeseries
      const url = `${API_BASE_URL}/offstreetparking/timeseries?id=${encodeURIComponent(formattedId)}&attrs=availableSpotNumber&lastN=24`;
      
      console.log(`Tentative de récupération de l'historique du parking ${formattedId}...`);
      let data: ParkingTimeSeriesResponse;
      
      try {
        data = await getWithCache<ParkingTimeSeriesResponse>(url);
      } catch (error) {
        console.warn(`L'endpoint /offstreetparking/timeseries n'est pas disponible. Utilisation de données simulées.`, error);
        
        // Si l'API timeseries n'est pas disponible, générer des données simulées
        // pour permettre à l'application de continuer à fonctionner
        data = this.generateMockHistoryData();
      }
      
      console.log(`Historique récupéré avec ${data?.values?.length || 0} points de données`);
      
      // Log détaillé de la structure de la réponse
      if (data && data.values && data.values.length > 0) {
        console.log('Structure des données temporelles:', {
          index: data.index.slice(0, 3), // Afficher les 3 premiers timestamps
          attributeNames: data.attributeNames,
          valuesSample: data.values.slice(0, 3) // Afficher les 3 premiers points de données
        });
      }
      
      return data;
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'historique du parking ${formattedId}:`, error);
      // En cas d'erreur, retourner des données simulées pour éviter que l'application ne plante
      return this.generateMockHistoryData();
    }
  },
  
  /**
   * Génère des données d'historique simulées pour un parking
   * Utilisé quand l'API d'historique n'est pas disponible
   */
  generateMockHistoryData(): ParkingTimeSeriesResponse {
    const now = new Date();
    const attributeNames = ['availableSpotNumber'];
    const index: string[] = [];
    const values: number[][] = [];
    
    // Générer 24 points de données pour les dernières 24 heures
    for (let i = 0; i < 24; i++) {
      const date = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000);
      index.push(date.toISOString());
      
      // Générer une valeur aléatoire entre 10 et 100 pour simuler le nombre de places disponibles
      const availableSpots = Math.floor(Math.random() * 90) + 10;
      values.push([availableSpots]);
    }
    
    console.log("Données d'historique simulées générées en remplacement des données API");
    
    return {
      attributeNames,
      index,
      values
    };
  }
};

export default parkingApi;
