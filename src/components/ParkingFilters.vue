<script setup lang="ts">
import { ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useParkingStore } from '@/stores/parking';

const parkingStore = useParkingStore();
const { sortedParkings, filters } = storeToRefs(parkingStore);
const { availableServices, toggleServiceFilter, resetServiceFilters } = parkingStore;

const showFilters = ref(false); // Filtres cachés par défaut

// Fonction pour afficher/masquer les filtres
function toggleFilters() {
  showFilters.value = !showFilters.value;
}

// Fonction pour basculer un service dans les filtres
function toggleService(serviceId: string) {
  toggleServiceFilter(serviceId);
}

// Fonction pour réinitialiser les filtres
function resetFilters() {
  resetServiceFilters();
}

// Vérifier si un service est sélectionné
const isServiceSelected = (serviceId: string) => {
  return filters.value.selectedServices.includes(serviceId);
};

// Convertir l'objet des services en tableau pour l'itération dans le template
const servicesArray = computed(() => {
  return Object.entries(availableServices).map(([id, service]) => ({
    id,
    ...service
  }));
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
        <!-- Filtres par services -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Services disponibles
          </label>
          <div class="flex flex-wrap gap-2">
            <button 
              v-for="service in servicesArray" 
              :key="service.id"
              @click="toggleService(service.id)"
              class="px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 flex items-center gap-1"
              :class="{
                'text-white': isServiceSelected(service.id),
                'text-gray-700 bg-gray-100 hover:bg-gray-200': !isServiceSelected(service.id)
              }"
              :style="{
                backgroundColor: isServiceSelected(service.id) ? service.color : '',
                borderColor: service.color,
                borderWidth: '1px'
              }"
            >
              <span v-if="isServiceSelected(service.id)" class="w-3 h-3 rounded-full bg-white flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-2 h-2" :style="{color: service.color}">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </span>
              {{ service.label }}
            </button>
          </div>
        </div>
        
        <!-- Bouton de réinitialisation -->
        <div class="flex justify-end" v-if="filters.selectedServices.length > 0">
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
