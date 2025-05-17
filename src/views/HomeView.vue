<script setup lang="ts">
import { ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useParkingStore } from '@/stores/parking';
import ParkingMap from '@/components/ParkingMap.vue';
import ParkingList from '@/components/ParkingList.vue';
import ParkingFilters from '@/components/ParkingFilters.vue';
import ParkingSorter from '@/components/ParkingSorter.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { useSeoMetadata } from '@/composables/useSeoMetadata';
import { useSearch } from '@/composables/useSearch';
import { useParkingData } from '@/composables/useParkingData';

// Configuration SEO
const { setSeoMetadata } = useSeoMetadata();
setSeoMetadata();

// Gestion des données de parking
const { loading, error, lastUpdated, refreshData } = useParkingData();

// Gestion de la recherche
const { searchInput, handleSearch } = useSearch();

// Utiliser le store Pinia
const parkingStore = useParkingStore();
const { sortedParkings, filters } = storeToRefs(parkingStore);

// État local
const view = ref<'map' | 'list'>('list');

// Formater la date de dernière mise à jour
const formattedLastUpdated = computed(() => {
  if (!lastUpdated.value) return '';
  return new Date(lastUpdated.value).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});
</script>

<template>
  <main class="container mx-auto px-4 py-8">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800 mb-2">Parkings de Montpellier</h1>
      <p class="text-gray-600">
        Consultez en temps réel la disponibilité des places dans les parkings de Montpellier.
      </p>
      <p class="text-xs text-red-500 mt-1">
        Note : Cette liste n'est pas exhaustive et certaines données peuvent encore manquer. Des mises à jour régulières sont prévues.
      </p>
    </div>
    
    <!-- Filtres -->
    <ParkingFilters />
    
    <!-- Contrôles d'affichage -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
      <!-- Bouton de rafraîchissement -->
      <button 
        @click="refreshData"
        :disabled="loading"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <FontAwesomeIcon :icon="['fas', 'arrows-rotate']" class="mr-2" :class="{ 'animate-spin': loading }" />
        {{ loading ? 'Chargement...' : 'Rafraîchir' }}
      </button>
      
      <!-- Sélecteur de vue -->
      <div class="inline-flex rounded-md shadow-sm" role="group">
        <button 
          @click="view = 'list'"
          :class="{ 'bg-blue-600 text-white': view === 'list', 'bg-white text-gray-700 hover:bg-gray-50': view !== 'list' }"
          class="px-4 py-2 text-sm font-medium rounded-l-lg border border-gray-200 focus:z-10 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          :disabled="loading"
        >
          <FontAwesomeIcon :icon="['fas', 'list']" class="mr-2" />
          Liste
        </button>
        <button 
          @click="view = 'map'"
          :class="{ 'bg-blue-600 text-white': view === 'map', 'bg-white text-gray-700 hover:bg-gray-50': view !== 'map' }"
          class="px-4 py-2 text-sm font-medium rounded-r-lg border-t border-b border-r border-gray-200 focus:z-10 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          :disabled="loading"
        >
          <FontAwesomeIcon :icon="['fas', 'map-location-dot']" class="mr-2" />
          Carte
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
    <div v-if="formattedLastUpdated" class="text-xs text-gray-500 text-right mb-2">
      Dernière mise à jour : {{ formattedLastUpdated }}
    </div>
    
    <!-- Message d'erreur est déjà affiché plus haut -->
    
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
