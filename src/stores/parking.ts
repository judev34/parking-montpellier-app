import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import type { Parking, ParkingTimeSeriesResponse } from '@/types/parking';
import { parkingApi } from '@/services/api';

// Récupérer la recherche sauvegardée dans le localStorage
const getSavedSearchQuery = (): string => {
  try {
    return localStorage.getItem('parkingSearchQuery') || '';
  } catch (e) {
    return '';
  }
};

// Sauvegarder la recherche dans le localStorage
const saveSearchQuery = (query: string): void => {
  try {
    localStorage.setItem('parkingSearchQuery', query);
  } catch (e) {
    console.error('Erreur lors de la sauvegarde de la recherche:', e);
  }
};

export const useParkingStore = defineStore('parking', () => {
  // État
  const parkings = ref<Parking[]>([]);
  const selectedParking = ref<Parking | null>(null);
  const parkingHistory = ref<ParkingTimeSeriesResponse | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const lastUpdated = ref<Date | null>(null);
  const filters = ref({
    availability: 0, // % minimum de places disponibles
    maxDistance: 0, // distance maximum en mètres (0 = pas de limite)
    userLocation: null as { lat: number; lng: number } | null, // Position de l'utilisateur
    searchQuery: getSavedSearchQuery(), // Initialiser avec la valeur sauvegardée
  });

  // Getters
  const sortedParkings = computed(() => {
    let result = [...parkings.value];
    
    // Filtrer par nom si une recherche est en cours
    if (filters.value.searchQuery) {
      const query = filters.value.searchQuery.toLowerCase().trim();
      result = result.filter(p => {
        const parkingName = p.name?.value?.toLowerCase() || '';
        return parkingName.includes(query);
      });
    }
    
    // Filtrer par disponibilité
    if (filters.value.availability > 0) {
      result = result.filter(p => {
        const available = p.availableSpotNumber?.value || 0;
        const total = p.totalSpotNumber?.value || 0;
        if (total === 0) return false;
        const availPercentage = (available / total) * 100;
        return availPercentage >= filters.value.availability;
      });
    }
    
    // Filtrer et trier par distance si la position de l'utilisateur est disponible
    if (filters.value.userLocation) {
      result = result.map(p => {
        const coordinates = p.location?.value?.coordinates || [0, 0];
        const distance = calculateDistance(
          filters.value.userLocation!.lat, 
          filters.value.userLocation!.lng,
          coordinates[1], 
          coordinates[0]
        );
        return { ...p, distance };
      });
      
      // Appliquer le filtre de distance maximum si défini
      if (filters.value.maxDistance > 0) {
        result = result.filter(p => (p as any).distance <= filters.value.maxDistance);
      }
      
      // Trier par distance
      result.sort((a, b) => (a as any).distance - (b as any).distance);
    } else {
      // Sinon, trier par disponibilité (plus de places disponibles en premier)
      result.sort((a, b) => (b.availableSpotNumber?.value || 0) - (a.availableSpotNumber?.value || 0));
    }
    
    return result;
  });
  
  // Actions
  async function fetchAllParkings() {
    try {
      loading.value = true;
      error.value = null;
      
      console.log('Store: Démarrage de la récupération de tous les parkings');
      parkings.value = await parkingApi.getAllParkings();
      
      if (parkings.value.length === 0) {
        // Si l'API retourne un tableau vide, considérer cela comme une erreur
        error.value = "Aucune donnée de parking n'a été trouvée. Vérifiez votre connexion ou réessayez plus tard.";
        console.warn('Store: Aucun parking récupéré');
      } else {
        console.log(`Store: ${parkings.value.length} parkings récupérés avec succès`);
        lastUpdated.value = new Date();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur inconnue";
      error.value = `Erreur lors du chargement des parkings: ${errorMessage}`;
      console.error('Store: Erreur lors de la récupération des parkings', err);
    } finally {
      loading.value = false;
    }
  }
  
  async function fetchParkingDetails(parkingId: string) {
    try {
      loading.value = true;
      error.value = null;
      selectedParking.value = await parkingApi.getParkingById(parkingId);
      
      console.log(`Récupération des détails du parking ${parkingId} réussie`);
      
      // Activer la récupération de l'historique
      try {
        await fetchParkingHistory(parkingId);
      } catch (historyError) {
        console.warn("Erreur lors de la récupération de l'historique", historyError);
        parkingHistory.value = null;
      }
    } catch (err) {
      error.value = "Erreur lors du chargement des détails du parking. Veuillez réessayer.";
      console.error(err);
    } finally {
      loading.value = false;
    }
  }
  
  /**
   * Récupère l'historique des places disponibles pour un parking
   */
  async function fetchParkingHistory(parkingId: string, options = { interval: 'hour', period: 'week' }) {
    try {
      console.log(`Récupération de l'historique pour le parking ${parkingId}`);
      parkingHistory.value = await parkingApi.getParkingHistory(parkingId, options);
      console.log(`Historique récupéré avec ${parkingHistory.value?.index?.length || 0} points de données`);
      return parkingHistory.value;
    } catch (err) {
      console.error("Erreur lors de la récupération de l'historique", err);
      // En cas d'erreur, tenter d'utiliser des données simulées
      parkingHistory.value = parkingApi.generateHistoryDataByDay(options.period);
      return parkingHistory.value;
    }
  }
  
  function setFilters(newFilters: Partial<typeof filters.value>) {
    filters.value = { ...filters.value, ...newFilters };
    // Sauvegarder la recherche si elle est modifiée
    if ('searchQuery' in newFilters) {
      saveSearchQuery(newFilters.searchQuery);
    }
  }
  
  function refreshData() {
    return fetchAllParkings();
  }
  
  // Mettre à jour la position de l'utilisateur et recalculer les distances
  function updateDistances(latitude: number, longitude: number) {
    console.log('Mise à jour des distances avec position:', latitude, longitude);
    filters.value.userLocation = {
      lat: latitude,
      lng: longitude
    };
    // Les distances seront automatiquement recalculées via le computed sortedParkings
  }
  
  // Fonction utilitaire pour calculer la distance en mètres entre deux points de coordonnées
  function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Rayon terrestre en mètres
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance en mètres
  }
  
  // Mettre en place le rafraîchissement automatique des données toutes les 2 minutes
  let refreshInterval: number | null = null;
  
  function startAutoRefresh() {
    if (refreshInterval) return;
    
    // Utiliser setInterval pour actualiser les données toutes les 2 minutes
    refreshInterval = window.setInterval(() => {
      fetchAllParkings();
    }, 2 * 60 * 1000);
  }
  
  function stopAutoRefresh() {
    if (refreshInterval) {
      clearInterval(refreshInterval);
      refreshInterval = null;
    }
  }

  return {
    parkings,
    selectedParking,
    parkingHistory,
    loading,
    error,
    lastUpdated,
    filters,
    sortedParkings,
    fetchAllParkings,
    fetchParkingDetails,
    fetchParkingHistory,
    setFilters,
    refreshData,
    updateDistances,
    startAutoRefresh,
    stopAutoRefresh
  };
});
