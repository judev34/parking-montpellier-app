<script setup lang="ts">
import { ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useParkingStore } from '@/stores/parking';

const parkingStore = useParkingStore();
const { filters, sortedParkings } = storeToRefs(parkingStore);

const availabilityFilter = ref(filters.value.availability);
const maxDistanceFilter = ref(filters.value.maxDistance);

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
  <div class="bg-white rounded-lg shadow-md p-4 mb-6">
    <h2 class="text-lg font-semibold text-gray-800 mb-3">Filtres</h2>
    
    <div class="space-y-4">
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
        />
        <div class="flex justify-between text-xs text-gray-500">
          <span>Illimitée</span>
          <span>5 km</span>
        </div>
      </div>
    </div>
    
    <!-- Affichage des résultats -->
    <div class="mt-4 pt-3 border-t border-gray-200">
      <div class="flex justify-between items-center">
        <p class="text-sm text-gray-600">{{ sortedParkings.length }} parkings trouvés</p>
        <button 
          @click="resetFilters"
          class="text-sm text-blue-600 hover:text-blue-800"
        >
          Réinitialiser
        </button>
      </div>
    </div>
  </div>
</template>
