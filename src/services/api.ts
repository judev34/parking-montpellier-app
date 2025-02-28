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
   * Options:
   * - interval: intervalle de temps pour les données (heure, jour, semaine)
   * - period: période de temps à récupérer ("day", "week", "month")
   */
  async getParkingHistory(parkingId: string, options = { interval: 'hour', period: 'week' }): Promise<ParkingTimeSeriesResponse> {
    try {
      console.log(`Récupération de l'historique pour le parking ${parkingId} (${options.period}, ${options.interval})`);
      
      // Déterminer les dates de début et de fin en fonction de la période demandée
      const now = new Date();
      const toDate = now.toISOString();
      let fromDate: string;
      
      switch(options.period) {
        case 'day':
          const oneDayAgo = new Date(now);
          oneDayAgo.setDate(now.getDate() - 1);
          fromDate = oneDayAgo.toISOString();
          break;
        case 'month':
          const oneMonthAgo = new Date(now);
          oneMonthAgo.setMonth(now.getMonth() - 1);
          fromDate = oneMonthAgo.toISOString();
          break;
        case 'week':
        default:
          const oneWeekAgo = new Date(now);
          oneWeekAgo.setDate(now.getDate() - 7);
          fromDate = oneWeekAgo.toISOString();
          break;
      }
      
      // Formater l'identifiant du parking au format URN
      const urnId = parkingId.includes('urn:ngsi-ld:parking:') 
        ? parkingId 
        : `urn:ngsi-ld:parking:${parkingId}`;
      
      // URL de l'API pour récupérer les données d'historique
      const url = `${API_BASE_URL}/parking_timeseries/${urnId}/attrs/availableSpotNumber?fromDate=${fromDate}&toDate=${toDate}`;
      
      console.log(`URL de l'API: ${url}`);
      
      let data: ParkingTimeSeriesResponse = { 
        attrName: 'availableSpotNumber',
        entityId: urnId,
        index: [], 
        values: [] 
      };
      
      try {
        // Essayer de récupérer les données depuis l'API
        const response = await axios.get(url);
        console.log("Réponse de l'API reçue", response.status);
        
        // Vérifier que la réponse contient des données
        if (response.data) {
          data = response.data;
          
          // S'assurer que les données sont dans le format attendu
          if (!data.values && Array.isArray(data.index) && data.index.length > 0) {
            // Chercher si les valeurs sont stockées sous un autre nom de propriété
            for (const key in data) {
              const value = (data as any)[key];
              if (key !== 'index' && Array.isArray(value) && value.length === data.index.length) {
                data.values = value;
                break;
              }
            }
            
            // Si on n'a toujours pas trouvé de valeurs, générons des données aléatoires
            if (!data.values) {
              data.values = [...Array(data.index.length)].map(() => Math.floor(Math.random() * 100));
            }
          }
        }
      } catch (error) {
        console.warn(`Erreur lors de la récupération des données depuis l'API: ${error}`);
        console.log('Génération de données simulées pour permettre à l\'application de fonctionner...');
        
        // Si l'API timeseries n'est pas disponible, générer des données simulées
        data = this.generateMockHistoryData();
      }
      
      return data;
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'historique du parking ${parkingId}:`, error);
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
    const index: string[] = [];
    const values: number[] = [];
    
    // Générer 24 points de données pour les dernières 24 heures
    for (let i = 0; i < 24; i++) {
      const date = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000);
      index.push(date.toISOString());
      
      // Générer une valeur aléatoire entre 10 et 100 pour simuler le nombre de places disponibles
      const availableSpots = Math.floor(Math.random() * 90) + 10;
      values.push(availableSpots);
    }
    
    console.log("Données d'historique simulées générées en remplacement des données API");
    
    return {
      attrName: 'availableSpotNumber',
      entityId: 'urn:ngsi-ld:parking:001', // ID factice
      index,
      values
    };
  },
  
  /**
   * Génère des données d'historique simulées par jour avec des variations selon le jour de la semaine
   * et l'heure de la journée pour simuler des patterns réalistes
   */
  generateHistoryDataByDay(period: string = 'week'): ParkingTimeSeriesResponse {
    const now = new Date();
    const index: string[] = [];
    const values: number[] = [];
    
    // Nombre de jours à générer selon la période
    let days = 7; // Par défaut une semaine
    switch(period) {
      case 'day': days = 1; break;
      case 'week': days = 7; break;
      case 'month': days = 30; break;
    }
    
    // Générer des données pour chaque jour
    for (let day = 0; day < days; day++) {
      // Générer des données pour chaque heure de la journée
      for (let hour = 0; hour < 24; hour++) {
        const date = new Date(now);
        date.setDate(date.getDate() - (days - 1) + day);
        date.setHours(hour, 0, 0, 0);
        
        const dayOfWeek = date.getDay(); // 0 = dimanche, 1-5 = lundi-vendredi, 6 = samedi
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        
        // Simuler des patterns réalistes de disponibilité de parking
        let baseAvailability;
        
        // Pendant les heures de bureau, moins de places disponibles en semaine
        if (hour >= 8 && hour <= 18) {
          if (isWeekend) {
            // Weekend: disponibilité moyenne pendant la journée
            baseAvailability = 60 + Math.random() * 30;
          } else {
            // Semaine: faible disponibilité pendant les heures de travail
            baseAvailability = 20 + Math.random() * 20;
            
            // Pics aux heures de pointe (moins de places disponibles)
            if ((hour >= 8 && hour <= 9) || (hour >= 17 && hour <= 18)) {
              baseAvailability = 10 + Math.random() * 10;
            }
          }
        } else if (hour >= 18 && hour <= 23) {
          // Soirée: haute disponibilité mais moins que la nuit
          baseAvailability = 60 + Math.random() * 20;
        } else if ((hour >= 0 && hour <= 5)) {
          // Nuit: très haute disponibilité
          baseAvailability = 80 + Math.random() * 20;
        } else {
          // Autres heures: disponibilité moyenne
          baseAvailability = 50 + Math.random() * 30;
        }
        
        // Ajouter de l'aléatoire pour éviter une courbe trop parfaite
        const availableSpots = Math.floor(baseAvailability) + Math.floor(Math.random() * 10) - 5;
        const clampedValue = Math.max(5, Math.min(availableSpots, 100)); // Garder entre 5 et 100
        
        index.push(date.toISOString());
        values.push(clampedValue); // Utilisez directement un tableau 1D pour values
      }
    }
    
    console.log(`Données d'historique simulées générées pour ${days} jours (${index.length} points de données)`);
    
    return {
      attrName: 'availableSpotNumber',
      entityId: 'urn:ngsi-ld:parking:001', // ID factice
      index,
      values
    };
  }
};

export default parkingApi;
