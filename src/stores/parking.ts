import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import type { Parking, ParkingTimeSeriesResponse, ParkingDetails } from '@/types/parking';
import { parkingApi } from '@/services/api';
import parkingDetailsData from '@/docs/parkings_details.json';

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
    userLocation: null as { lat: number; lng: number } | null, // Position de l'utilisateur
    searchQuery: getSavedSearchQuery(), // Initialiser avec la valeur sauvegardée
    selectedServices: [] as string[], // Services sélectionnés pour le filtrage
    sortOption: 'default', // Option de tri par défaut
  });

  // Liste des services disponibles avec leurs couleurs
  const availableServices = {
    pmr: { label: 'Accès PMR', color: '#1E88E5' }, // Bleu
    resaplace: { label: 'Réservation', color: '#43A047' }, // Vert
    // accompagnement_place: { label: 'Accompagnement', color: '#FB8C00' }, // Orange
    // telepeage: { label: 'Télépéage', color: '#E53935' }, // Rouge
    lavage: { label: 'Lavage', color: '#8E24AA' }, // Violet
    places_famille: { label: 'Places famille', color: '#3949AB' }, // Indigo
    ve: { label: 'Recharge VE', color: '#00ACC1' }, // Cyan
    depot_minute: { label: 'Dépôt minute', color: '#F4511E' }, // Orange foncé
    parking_velos: { label: 'Velopark', color: '#6D4C41' } // Marron
  };

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
    
    // Filtrer par services sélectionnés
    if (filters.value.selectedServices.length > 0) {
      result = result.filter(p => {
        // Vérifier si le parking a tous les services sélectionnés
        return filters.value.selectedServices.every(service => {
          return p.details?.services && p.details.services[service as keyof typeof p.details.services] === true;
        });
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
      
      // Trier par distance si aucune autre option de tri n'est sélectionnée
      if (filters.value.sortOption === 'default') {
        result.sort((a, b) => (a as any).distance - (b as any).distance);
      }
    } else if (filters.value.sortOption === 'default') {
      // Sinon, trier par disponibilité (plus de places disponibles en premier) par défaut
      result.sort((a, b) => (b.availableSpotNumber?.value || 0) - (a.availableSpotNumber?.value || 0));
    }
    
    // Appliquer les tris spécifiques quelle que soit la position de l'utilisateur
    switch (filters.value.sortOption) {
      case 'availability-asc':
        // Trier par pourcentage de disponibilité croissant
        result.sort((a, b) => {
          const aAvail = a.availableSpotNumber?.value || 0;
          const aTotal = a.totalSpotNumber?.value || 1;
          const bAvail = b.availableSpotNumber?.value || 0;
          const bTotal = b.totalSpotNumber?.value || 1;
          return (aAvail / aTotal) - (bAvail / bTotal);
        });
        break;
      case 'availability-desc':
        // Trier par pourcentage de disponibilité décroissant
        result.sort((a, b) => {
          const aAvail = a.availableSpotNumber?.value || 0;
          const aTotal = a.totalSpotNumber?.value || 1;
          const bAvail = b.availableSpotNumber?.value || 0;
          const bTotal = b.totalSpotNumber?.value || 1;
          return (bAvail / bTotal) - (aAvail / aTotal);
        });
        break;
      case 'capacity-asc':
        // Trier par capacité totale croissante
        result.sort((a, b) => (a.totalSpotNumber?.value || 0) - (b.totalSpotNumber?.value || 0));
        break;
      case 'capacity-desc':
        // Trier par capacité totale décroissante
        result.sort((a, b) => (b.totalSpotNumber?.value || 0) - (a.totalSpotNumber?.value || 0));
        break;
    }
    
    return result;
  });
  
  // Actions
  // Fonction pour enrichir les parkings avec les données supplémentaires
  function enrichParkingsWithDetails(parkingsList: Parking[]) {
    // Créer un mapping rapide des détails par ID
    const detailsMap = new Map<string, ParkingDetails>();
    
    (parkingDetailsData.parkings as ParkingDetails[]).forEach(detail => {
      detailsMap.set(detail.id, detail);
    });
    
    // Enrichir chaque parking avec ses détails s'ils existent
    return parkingsList.map(parking => {
      const details = detailsMap.get(parking.id);
      
      if (details) {
        return {
          ...parking,
          details,
          // Certains identifiants peuvent contenir des mots-clés pour identifier les parkings relais
          isRelais: parking.name?.value.toLowerCase().includes('relais') || 
                   parking.name?.value.toLowerCase().includes('tram') ||
                   parking.description?.value.toLowerCase().includes('relais') || false
        };
      }
      
      return parking;
    });
  }

  async function fetchAllParkings() {
    try {
      loading.value = true;
      error.value = null;
      
      // Récupérer les données de parkings de l'API
      const rawParkings = await parkingApi.getAllParkings();
      
      if (rawParkings.length === 0) {
        // Si l'API retourne un tableau vide, considérer cela comme une erreur
        error.value = "Aucune donnée de parking n'a été trouvée. Vérifiez votre connexion ou réessayez plus tard.";
      } else {
        // Enrichir les parkings avec les données supplémentaires
        parkings.value = enrichParkingsWithDetails(rawParkings);
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
      const parking = await parkingApi.getParkingById(parkingId);
      
      if (!parking) {
        error.value = `Impossible de trouver le parking avec l'ID: ${parkingId}`;
        selectedParking.value = null;
        return;
      }
      
      // Rechercher les détails supplémentaires pour ce parking
      const parkingDetails = (parkingDetailsData.parkings as ParkingDetails[]).find(
        detail => detail.id === parkingId
      );
      
      // Enrichir le parking avec les détails si disponibles
      selectedParking.value = {
        ...parking,
        details: parkingDetails,
        isRelais: parking.name?.value.toLowerCase().includes('relais') || 
                 parking.name?.value.toLowerCase().includes('tram') ||
                 parking.description?.value.toLowerCase().includes('relais') || false
      };
      
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
      // console.log(`Récupération de l'historique pour le parking ${parkingId}`);
      parkingHistory.value = await parkingApi.getParkingHistory(parkingId, options);
      // console.log(`Historique récupéré avec ${parkingHistory.value?.index?.length || 0} points de données`);
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
    if ('searchQuery' in newFilters && newFilters.searchQuery !== undefined) {
      saveSearchQuery(newFilters.searchQuery);
    }
  }
  
  function refreshData() {
    return fetchAllParkings();
  }
  
  // Mettre à jour la position de l'utilisateur et recalculer les distances
  function updateDistances(latitude: number, longitude: number) {
    // console.log('Mise à jour des distances avec position:', latitude, longitude);
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
  
  // Mettre en place le rafraîchissement automatique des données toutes les 5 minutes
  let refreshInterval: number | null = null;
  
  function startAutoRefresh() {
    if (refreshInterval) return;
    
    // Utiliser setInterval pour actualiser les données toutes les 5 minutes
    refreshInterval = window.setInterval(() => {
      fetchAllParkings();
    }, 5 * 60 * 1000);
  }
  
  function stopAutoRefresh() {
    if (refreshInterval) {
      clearInterval(refreshInterval);
      refreshInterval = null;
    }
  }

  // Méthode pour basculer un service dans les filtres
  function toggleServiceFilter(serviceId: string) {
    const index = filters.value.selectedServices.indexOf(serviceId);
    if (index === -1) {
      // Ajouter le service s'il n'est pas déjà sélectionné
      filters.value.selectedServices.push(serviceId);
    } else {
      // Retirer le service s'il est déjà sélectionné
      filters.value.selectedServices.splice(index, 1);
    }
  }

  // Méthode pour réinitialiser les filtres de services
  function resetServiceFilters() {
    filters.value.selectedServices = [];
  }
  
  // Méthode pour définir l'option de tri
  function setSortOption(option: string) {
    filters.value.sortOption = option;
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
    availableServices,
    fetchAllParkings,
    fetchParkingDetails,
    fetchParkingHistory,
    setFilters,
    refreshData,
    updateDistances,
    toggleServiceFilter,
    resetServiceFilters,
    setSortOption,
    startAutoRefresh,
    stopAutoRefresh
  };
});
