<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useParkingStore } from '@/stores/parking';
import ParkingMap from '@/components/ParkingMap.vue';
import ParkingCard from '@/components/ParkingCard.vue';
import ParkingHistory from '@/components/ParkingHistory.vue';
import { useHead } from '@vueuse/head';

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

// Méta-tags dynamiques pour le SEO
const updateMetaTags = () => {
  if (selectedParking.value) {
    const parkingName = selectedParking.value.name?.value || 'Parking';
    const availableSpots = selectedParking.value.availableSpotNumber?.value || 0;
    const totalParkingSpots = totalSpots.value;
    const occupancyPercentage = selectedParking.value.occupancyPercentage || 0;
    
    useHead({
      title: `${parkingName} - ${availableSpots} places disponibles | Parkings Montpellier`,
      meta: [
        {
          name: 'description',
          content: `${parkingName} à Montpellier : ${availableSpots} places disponibles sur ${totalParkingSpots} (${100-occupancyPercentage}% libre). Informations en temps réel, adresse et itinéraire.`
        },
        {
          name: 'keywords',
          content: `parking ${parkingName}, Montpellier, places disponibles, stationnement, ${parkingName}, itinéraire`
        },
        {
          property: 'og:title',
          content: `${parkingName} - ${availableSpots} places disponibles | Parkings Montpellier`
        },
        {
          property: 'og:description',
          content: `${parkingName} à Montpellier : ${availableSpots} places disponibles sur ${totalParkingSpots}. Informations en temps réel, adresse et itinéraire.`
        },
        {
          property: 'og:type',
          content: 'website'
        },
        {
          name: 'robots',
          content: 'index, follow'
        }
      ]
    });
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
};

// Mettre à jour les méta-tags quand le parking sélectionné change
watch(() => selectedParking.value, () => {
  updateMetaTags();
}, { immediate: true });

// Charger les détails du parking
onMounted(async () => {
  if (!parkingId.value) {
    router.push({ name: 'home' });
    return;
  }
  
  // Charger les détails du parking (incluant l'historique)
  await parkingStore.fetchParkingDetails(parkingId.value);
  
  // Mettre à jour les méta-tags initiaux
  updateMetaTags();
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
  <main class="container mx-auto px-4 py-8">
    <!-- Bouton retour -->
    <div class="mb-6">
      <button 
        @click="goBack" 
        class="inline-flex items-center text-blue-600 hover:text-blue-800"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Retour à la liste
      </button>
    </div>
    
    <div v-if="loading && !isLoaded" class="flex justify-center py-16">
      <svg class="animate-spin h-12 w-12 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>
    
    <div v-else-if="error" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
      <p>{{ error }}</p>
      <button 
        @click="parkingStore.fetchParkingDetails(parkingId)" 
        class="mt-2 text-sm underline"
      >
        Réessayer
      </button>
    </div>
    
    <div v-else-if="selectedParking" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Colonne gauche: détails -->
      <div class="lg:col-span-1">
        <h1 class="text-2xl font-bold text-gray-800 mb-4">{{ selectedParking.name.value }}</h1>
        
        <ParkingCard 
          :parking="selectedParking" 
          :showDetails="true" 
        />
        
        <div class="mt-6 bg-white rounded-lg shadow-md p-4">
          <h2 class="text-lg font-semibold text-gray-800 mb-3">Informations</h2>
          
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">ID:</span>
              <span class="text-sm font-medium">{{ selectedParking.id }}</span>
            </div>
            
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">Type:</span>
              <span class="text-sm font-medium">{{ selectedParking.type }}</span>
            </div>
            
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">Coordonnées:</span>
              <span class="text-sm font-medium">
                {{ selectedParking.location?.value?.coordinates[1] }}, 
                {{ selectedParking.location?.value?.coordinates[0] }}
              </span>
            </div>
            
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">Dernière mise à jour:</span>
              <span class="text-sm font-medium">
                {{ new Date(selectedParking.availableSpotNumber?.metadata?.timestamp?.value || '').toLocaleString('fr-FR') }}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Colonne droite: carte et historique -->
      <div class="lg:col-span-2">
        <ParkingMap height="40vh" :selectedParkingId="parkingId" />
        
        <ParkingHistory 
          :parkingHistory="parkingHistory" 
          :totalSpots="totalSpots" 
        />
      </div>
    </div>
    
    <div v-else class="text-center py-16 text-gray-500">
      <p>Ce parking n'existe pas ou a été supprimé.</p>
      <button 
        @click="goBack" 
        class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
      >
        Retour à la liste
      </button>
    </div>
  </main>
</template>
