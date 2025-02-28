<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useParkingStore } from '@/stores/parking';
import ParkingMap from '@/components/ParkingMap.vue';
import ParkingCard from '@/components/ParkingCard.vue';
import ParkingHistoryWeekly from '@/components/ParkingHistoryWeekly.vue';
import ParkingHistoryTimeslots from '@/components/ParkingHistoryTimeslots.vue';
import { useHead } from '@vueuse/head';
import { generateParkingMetaTags } from '@/plugins/seo';

const route = useRoute();
const router = useRouter();
const parkingId = computed(() => route.params.id as string);

const parkingStore = useParkingStore();
const { selectedParking, parkingHistory, loading, error } = storeToRefs(parkingStore);

// Vérifier si le parking est chargé
const isLoaded = computed(() => !!selectedParking.value);
const totalSpots = computed(() => selectedParking.value?.totalSpotNumber?.value || 0);

// Préparation des données JSON-LD pour Schema.org
const jsonLdData = computed(() => {
  if (!selectedParking.value) return {};
  
  return {
    "@context": "https://schema.org",
    "@type": "ParkingFacility",
    "name": selectedParking.value.name?.value || 'Parking',
    "description": `Parking à Montpellier avec ${selectedParking.value.availableSpotNumber?.value || 0} places disponibles sur ${totalSpots.value}`,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Montpellier",
      "addressRegion": "Occitanie",
      "addressCountry": "FR"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": selectedParking.value.location?.value?.coordinates[1] || 0,
      "longitude": selectedParking.value.location?.value?.coordinates[0] || 0
    },
    "openingHours": "Mo-Su 00:00-23:59",
    "maximumAttendeeCapacity": totalSpots.value,
    "availableSpotNumber": selectedParking.value.availableSpotNumber?.value || 0
  };
});

// Mettre à jour les méta-tags quand le parking sélectionné change
watch(() => selectedParking.value, () => {
  if (selectedParking.value) {
    // Utiliser la fonction helper pour générer les méta-tags
    useHead(generateParkingMetaTags(selectedParking.value));
  } else {
    // Méta-tags par défaut si le parking n'est pas chargé
    useHead({
      title: 'Détails du parking | Parkings Montpellier',
      meta: [
        {
          name: 'description',
          content: 'Informations détaillées sur les parkings de Montpellier. Consultez les places disponibles, l\'adresse et l\'itinéraire.'
        },
        {
          name: 'robots',
          content: 'index, follow'
        }
      ]
    });
  }
}, { immediate: true });

// Charger les détails du parking
onMounted(async () => {
  if (!parkingId.value) {
    router.push({ name: 'home' });
    return;
  }
  
  // Charger les détails du parking (incluant l'historique)
  await parkingStore.fetchParkingDetails(parkingId.value);
});

// Arrêter le rafraîchissement automatique lors du démontage
onUnmounted(() => {
  parkingStore.stopAutoRefresh();
});

// Fonction pour revenir en arrière
function goBack() {
  router.push({ name: 'home' });
}
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <!-- En-tête avec le nom du parking -->
    <div v-if="selectedParking" class="mb-6">
      <div class="flex items-center mb-2">
        <button 
          @click="router.push({ name: 'home' })" 
          class="mr-3 flex items-center text-sm font-medium"
          style="color: var(--metro-blue);"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Retour
        </button>
        <h1 class="text-2xl font-bold" style="color: var(--metro-blue);">{{ selectedParking.name?.value }}</h1>
      </div>
      <p class="text-gray-600">
        Consultez les détails et la disponibilité en temps réel de ce parking.
      </p>
    </div>

    <!-- État de chargement -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2" style="border-color: var(--metro-blue);"></div>
    </div>

    <!-- Message d'erreur -->
    <div v-else-if="error" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
      <p>{{ error }}</p>
      <button 
        @click="router.push({ name: 'home' })" 
        class="mt-2 px-4 py-2 rounded-md text-white"
        style="background-color: var(--metro-blue);"
      >
        Retour à la liste
      </button>
    </div>

    <!-- Contenu principal -->
    <div v-else-if="selectedParking" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Carte du parking -->
      <div class="lg:col-span-2">
        <div class="bg-white rounded-lg shadow-md p-4 mb-6">
          <h2 class="text-lg font-semibold mb-3" style="color: var(--metro-blue);">Localisation</h2>
          <ParkingMap :height="'50vh'" :selectedParkingId="parkingId" />
        </div>
        
        <!-- Historique d'occupation -->
        <div class="bg-white rounded-lg shadow-md p-4 mb-6">
          <h2 class="text-lg font-semibold mb-3" style="color: var(--metro-blue);">Historique d'occupation</h2>
          <div class="space-y-6">
            <ParkingHistoryWeekly :parkingId="parkingId" />
            <ParkingHistoryTimeslots :parkingId="parkingId" />
          </div>
        </div>
      </div>
      
      <!-- Détails du parking -->
      <div>
        <ParkingCard :parking="selectedParking" :showDetails="true" />
        
        <!-- Informations supplémentaires -->
        <div class="bg-white rounded-lg shadow-md p-4 mt-6">
          <h2 class="text-lg font-semibold mb-3" style="color: var(--metro-blue);">Informations</h2>
          
          <div class="space-y-3">
            <div v-if="selectedParking.description?.value">
              <h3 class="text-sm font-medium text-gray-700">Description</h3>
              <p class="text-gray-600">{{ selectedParking.description.value }}</p>
            </div>
            
            <div v-if="selectedParking.location?.value">
              <h3 class="text-sm font-medium text-gray-700">Adresse</h3>
              <p class="text-gray-600">{{ selectedParking.location.value.coordinates[1] }}, {{ selectedParking.location.value.coordinates[0] }}</p>
              <a 
                :href="`https://www.google.com/maps/dir/?api=1&destination=${selectedParking.location.value.coordinates[1]},${selectedParking.location.value.coordinates[0]}`" 
                target="_blank" 
                rel="noopener noreferrer" 
                class="inline-block mt-2 px-3 py-1 rounded-md text-white text-sm"
                style="background-color: var(--metro-blue);"
              >
                Itinéraire
              </a>
            </div>
            
            <div>
              <h3 class="text-sm font-medium text-gray-700">Dernière mise à jour</h3>
              <p class="text-gray-600">{{ new Date(selectedParking.availableSpotNumber?.metadata?.timestamp?.value || '').toLocaleString('fr-FR') }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Parking non trouvé -->
    <div v-else-if="!loading" class="text-center py-12">
      <p class="text-xl text-gray-600 mb-4">Parking non trouvé</p>
      <button 
        @click="router.push({ name: 'home' })" 
        class="px-4 py-2 rounded-md text-white"
        style="background-color: var(--metro-blue);"
      >
        Retour à la liste
      </button>
    </div>
  </div>
</template>
