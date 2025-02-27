<script setup lang="ts">
import { ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useParkingStore } from '@/stores/parking';

const parkingStore = useParkingStore();
const { filters, sortedParkings } = storeToRefs(parkingStore);

const availabilityFilter = ref(filters.value.availability);
const maxDistanceFilter = ref(filters.value.maxDistance);
const showFilters = ref(false); // Filtres cachés par défaut

// Fonction pour afficher/masquer les filtres
function toggleFilters() {
  showFilters.value = !showFilters.value;
}

// Appliquer les filtres après un court délai pour éviter trop d'appels lors des ajustements slider
let applyTimeout: NodeJS.Timeout | null = null;

function applyFilters() {
  if (applyTimeout) clearTimeout(applyTimeout);
  applyTimeout = setTimeout(() => {
    parkingStore.setFilters({
      availability: availabilityFilter.value,
      maxDistance: maxDistanceFilter.value
    });
  }, 300);
}

watch([availabilityFilter, maxDistanceFilter], () => {
  applyFilters();
});

function resetFilters() {
  availabilityFilter.value = 0;
  maxDistanceFilter.value = 0;
  parkingStore.setFilters({
    availability: 0,
    maxDistance: 0
  });
}

const showDistanceFilter = ref(!!filters.value.userLocation);

watch(() => filters.value.userLocation, (newValue) => {
  showDistanceFilter.value = !!newValue;
});
</script>

<template>
  <div class="mb-4">
    <div class="flex items-center justify-between mb-2">
      <button 
        @click="toggleFilters" 
        class="flex items-center text-sm font-medium" 
        style="color: var(--metro-blue);"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        {{ showFilters ? 'Masquer les filtres' : 'Afficher les filtres' }}
      </button>
      
      <p class="text-sm text-gray-600">{{ sortedParkings.length }} parkings trouvés</p>
    </div>
    
    <div v-if="showFilters" class="bg-white rounded-lg shadow-sm p-3 transition-all duration-300 ease-in-out">
      <div class="space-y-3">
        <!-- Filtre de disponibilité -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Disponibilité minimum: {{ availabilityFilter }}%
          </label>
          <input 
            type="range" 
            min="0" 
            max="100" 
            step="5"
            v-model.number="availabilityFilter"
            class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            style="accent-color: var(--metro-blue);"
          />
          <div class="flex justify-between text-xs text-gray-500">
            <span>0%</span>
            <span>100%</span>
          </div>
        </div>
        
        <!-- Filtre de distance (affiché seulement si la position utilisateur est disponible) -->
        <div v-if="showDistanceFilter">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Distance maximum: {{ maxDistanceFilter ? `${maxDistanceFilter/1000} km` : 'Illimitée' }}
          </label>
          <input 
            type="range" 
            min="0" 
            max="5000" 
            step="500"
            v-model.number="maxDistanceFilter"
            class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            style="accent-color: var(--metro-blue);"
          />
          <div class="flex justify-between text-xs text-gray-500">
            <span>Illimitée</span>
            <span>5 km</span>
          </div>
        </div>
        
        <!-- Bouton de réinitialisation -->
        <div class="flex justify-end">
          <button 
            @click="resetFilters"
            class="text-sm px-3 py-1 rounded-md"
            style="color: var(--metro-blue);"
          >
            Réinitialiser
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
