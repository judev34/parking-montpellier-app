<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useParkingStore } from '@/stores/parking';
import ParkingMap from '@/components/ParkingMap.vue';
import ParkingList from '@/components/ParkingList.vue';
import ParkingFilters from '@/components/ParkingFilters.vue';
import ParkingSorter from '@/components/ParkingSorter.vue';
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
const { sortedParkings, loading, error, lastUpdated, filters } = storeToRefs(parkingStore);

// État local
const view = ref<'map' | 'list'>('list'); // Changer la vue par défaut à 'list'
const searchInput = ref(filters.value.searchQuery); // Initialiser avec la valeur du store

// Debounce pour la recherche
let searchTimeout: number | null = null;

const handleSearch = (event: Event) => {
  const value = (event.target as HTMLInputElement).value;
  
  // Annuler le timeout précédent s'il existe
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
  
  // Définir un nouveau timeout (300ms de délai)
  searchTimeout = setTimeout(() => {
    parkingStore.setFilters({ searchQuery: value });
  }, 300) as unknown as number;
};

// Charger les données et commencer le rafraîchissement automatique
onMounted(() => {
  parkingStore.fetchAllParkings();
  parkingStore.startAutoRefresh();
});

// Arrêter le rafraîchissement automatique lors du démontage
onUnmounted(() => {
  parkingStore.stopAutoRefresh();
});

// Observer les changements de filtres pour mettre à jour le champ de recherche
watch(() => filters.value.searchQuery, (newQuery) => {
  searchInput.value = newQuery;
});

// Rafraîchir manuellement les données
const refreshData = async () => {
  await parkingStore.refreshData();
};
</script>

<template>
  <main class="container mx-auto px-4 py-8">
    <div class="mb-6">
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
    
    
    <!-- Message d'erreur -->
    <div v-if="error" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
      <p>{{ error }}</p>
    </div>
    
    <!-- Barre de recherche et tri -->
    <div class="mb-4 relative">
      <div class="flex gap-2">
        <div class="relative flex-grow">
          <input 
            type="search" 
            v-model="searchInput" 
            @input="handleSearch" 
            class="w-full p-2 pl-10 border border-gray-300 text-sm text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50"
            style="--focus-ring-color: var(--metro-blue);"
            placeholder="Rechercher un parking par nom..."
          >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            class="h-5 w-5 absolute top-1/2 transform -translate-y-1/2 left-3 text-gray-500" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <!-- Composant de tri -->
        <ParkingSorter />
      </div>
      <div v-if="filters.searchQuery" class="mt-1 text-sm text-gray-500">
        Résultats pour "{{ filters.searchQuery }}" : {{ sortedParkings.length }} parking(s) trouvé(s)
      </div>
    </div>
    
    <!-- Vue Carte -->
    <div v-if="view === 'map'" class="relative">
      <ParkingMap height="70vh" />
    </div>
    
    <!-- Vue Liste -->
    <ParkingList v-else />
  </main>
</template>
