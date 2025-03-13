<script setup lang="ts">
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useParkingStore } from '@/stores/parking';
import ParkingCard from './ParkingCard.vue';
import UserLocation from './UserLocation.vue';

// Utiliser le store Pinia
const parkingStore = useParkingStore();
const { sortedParkings, loading } = storeToRefs(parkingStore);

// Référence au composant de localisation
const userLocationRef = ref<InstanceType<typeof UserLocation> | null>(null);
</script>

<template>
  <div>
    <!-- Composant de localisation (invisible) -->
    <UserLocation ref="userLocationRef" />
    
    <!-- Chargement -->
    <div v-if="loading && !sortedParkings.length" class="flex justify-center py-12">
      <svg class="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>
    
    <!-- Aucun résultat -->
    <div v-else-if="!sortedParkings.length" class="text-center py-12 text-gray-500">
      <p>Aucun parking ne correspond aux critères.</p>
    </div>
    
    <!-- Liste des parkings -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <ParkingCard 
        v-for="parking in sortedParkings" 
        :key="parking.id" 
        :parking="parking" 
      />
    </div>
  </div>
</template>
