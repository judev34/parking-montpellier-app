import { onMounted, onUnmounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useParkingStore } from '@/stores/parking';

export function useParkingData() {
  const parkingStore = useParkingStore();
  const { lastUpdated } = storeToRefs(parkingStore);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Charger les données initiales
  const fetchData = async () => {
    try {
      loading.value = true;
      error.value = null;
      await parkingStore.fetchAllParkings();
    } catch (err) {
      console.error('Erreur lors du chargement des données:', err);
      error.value = 'Impossible de charger les données des parkings. Veuillez réessayer plus tard.';
    } finally {
      loading.value = false;
    }
  };

  // Démarrer le rafraîchissement automatique
  const startAutoRefresh = () => {
    try {
      parkingStore.startAutoRefresh();
    } catch (err) {
      console.error('Erreur lors du démarrage du rafraîchissement automatique:', err);
    }
  };

  // Arrêter le rafraîchissement automatique
  const stopAutoRefresh = () => {
    try {
      parkingStore.stopAutoRefresh();
    } catch (err) {
      console.error('Erreur lors de l\'arrêt du rafraîchissement automatique:', err);
    }
  };

  // Rafraîchir manuellement les données
  const refreshData = async () => {
    try {
      loading.value = true;
      error.value = null;
      await parkingStore.refreshData();
    } catch (err) {
      console.error('Erreur lors du rafraîchissement des données:', err);
      error.value = 'Impossible de rafraîchir les données. Veuillez réessayer.';
      throw err; // Propager l'erreur pour une gestion supplémentaire si nécessaire
    } finally {
      loading.value = false;
    }
  };

  // Gestion du cycle de vie du composant
  onMounted(async () => {
    try {
      await fetchData();
      startAutoRefresh();
    } catch (err) {
      console.error('Erreur lors de l\'initialisation des données:', err);
    }
  });

  onUnmounted(() => {
    stopAutoRefresh();
  });

  return {
    loading,
    error,
    lastUpdated,
    refreshData,
    fetchData
  };
}
