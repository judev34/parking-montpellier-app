<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useParkingStore } from '@/stores/parking';
import ParkingMap from '@/components/ParkingMap.vue';
import ParkingCard from '@/components/ParkingCard.vue';
import ParkingFilters from '@/components/ParkingFilters.vue';
import { useHead } from '@vueuse/head';

// Configuration des méta-tags pour l'amélioration du SEO
useHead({
  title: 'Parkings Montpellier - Disponibilité en temps réel',
  meta: [
    {
      name: 'description',
      content: 'Trouvez facilement un parking disponible à Montpellier. Application affichant en temps réel les places disponibles dans les parkings de la ville.'
    },
    {
      name: 'keywords',
      content: 'parking, Montpellier, places disponibles, stationnement, temps réel, carte interactive'
    },
    {
      property: 'og:title',
      content: 'Parkings Montpellier - Disponibilité en temps réel'
    },
    {
      property: 'og:description',
      content: 'Trouvez facilement un parking disponible à Montpellier. Application affichant en temps réel les places disponibles dans les parkings de la ville.'
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

// Utiliser le store Pinia
const parkingStore = useParkingStore();
const { sortedParkings, loading, error, lastUpdated } = storeToRefs(parkingStore);

// État local
const view = ref<'map' | 'list'>('list'); // Changer la vue par défaut à 'list'

// Charger les données et commencer le rafraîchissement automatique
onMounted(() => {
  parkingStore.fetchAllParkings();
  parkingStore.startAutoRefresh();
});

// Arrêter le rafraîchissement automatique lors du démontage
onUnmounted(() => {
  parkingStore.stopAutoRefresh();
});

// Formater la date de dernière mise à jour
const formattedLastUpdate = ref('');
const updateLastUpdateTime = () => {
  if (lastUpdated.value) {
    formattedLastUpdate.value = new Date(lastUpdated.value).toLocaleString('fr-FR');
  }
};

// Observer les changements de lastUpdated
watch(lastUpdated, () => {
  updateLastUpdateTime();
});

// Rafraîchir manuellement les données
const refreshData = async () => {
  await parkingStore.refreshData();
  updateLastUpdateTime();
};
</script>

<template>
  <main class="container mx-auto px-4 py-8">
    <div class="mb-6">
      <h1 class="text-2xl font-bold mb-2" style="color: var(--metro-blue);">Parkings de Montpellier</h1>
      <p class="text-gray-600">
        Consultez en temps réel la disponibilité des places dans les parkings de Montpellier.
      </p>
    </div>
    
    <!-- Filtres -->
    <ParkingFilters />
    
    <!-- Contrôles d'affichage -->
    <div class="flex justify-between items-center mb-4">
      <div class="flex space-x-2">
        <button 
          @click="view = 'map'" 
          class="px-4 py-2 rounded-lg transition-colors" 
          :class="view === 'map' ? 'text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'"
          :style="view === 'map' ? 'background-color: var(--metro-blue);' : ''"
        >
          Carte
        </button>
        <button 
          @click="view = 'list'" 
          class="px-4 py-2 rounded-lg transition-colors" 
          :class="view === 'list' ? 'text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'"
          :style="view === 'list' ? 'background-color: var(--metro-blue);' : ''"
        >
          Liste
        </button>
      </div>
      
      <div class="flex items-center">
        <button 
          @click="refreshData" 
          class="flex items-center text-sm hover:text-opacity-80"
          :disabled="loading"
          style="color: var(--metro-blue);"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            class="h-4 w-4 mr-1" 
            :class="{ 'animate-spin': loading }"
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {{ loading ? 'Actualisation...' : 'Actualiser' }}
        </button>
      </div>
    </div>
    
    <!-- État de chargement et messages d'erreur -->
    <div v-if="loading || error" class="mb-4">
      <div v-if="loading" class="bg-blue-50 p-4 rounded-lg flex items-center">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
        <span>Chargement des données des parkings...</span>
      </div>
      
      <div v-if="error" class="bg-red-50 p-4 rounded-lg flex items-center mt-2">
        <div class="h-6 w-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center mr-3">
          <span class="font-bold">!</span>
        </div>
        <div>
          <p class="text-red-700">{{ error }}</p>
          <button 
            @click="refreshData" 
            class="mt-2 px-4 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    </div>
    
    <!-- Dernière mise à jour -->
    <div class="text-sm text-gray-500 mb-4" v-if="lastUpdated">
      <span>Dernière mise à jour: {{ formattedLastUpdate }}</span>
      <button 
        @click="refreshData" 
        class="ml-2 px-2 py-1 bg-gray-200 rounded-lg hover:bg-gray-300"
        :disabled="loading"
      >
        <span>🔄</span> 
      </button>
    </div>
    
    <!-- Message d'erreur -->
    <div v-if="error" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
      <p>{{ error }}</p>
    </div>
    
    <!-- Vue Carte -->
    <div v-if="view === 'map'" class="relative">
      <ParkingMap height="70vh" />
    </div>
    
    <!-- Vue Liste -->
    <div v-else>
      <div v-if="loading && !sortedParkings.length" class="flex justify-center py-12">
        <svg class="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
      
      <div v-else-if="!sortedParkings.length" class="text-center py-12 text-gray-500">
        <p>Aucun parking ne correspond aux critères.</p>
      </div>
      
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <ParkingCard 
          v-for="parking in sortedParkings" 
          :key="parking.id" 
          :parking="parking" 
        />
      </div>
    </div>
  </main>
</template>
