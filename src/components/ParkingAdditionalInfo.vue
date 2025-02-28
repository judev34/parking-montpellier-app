<script setup lang="ts">
import { computed } from 'vue';
import type { Parking } from '@/types/parking';

const props = defineProps<{
  parking: Parking;
}>();

// Formatage de l'adresse
const formattedAddress = computed(() => {
  if (!props.parking.location?.value?.coordinates) return 'Adresse non disponible';
  return `${props.parking.location.value.coordinates[1]}, ${props.parking.location.value.coordinates[0]}`;
});

// Formatage de la date de dernière mise à jour
const formattedLastUpdate = computed(() => {
  const timestamp = props.parking.availableSpotNumber?.metadata?.timestamp?.value;
  if (!timestamp) return 'Non disponible';
  return new Date(timestamp).toLocaleString('fr-FR');
});
</script>

<template>
  <div class="bg-white rounded-lg shadow-md p-4 mt-6">
    <h2 class="text-lg font-semibold mb-3" style="color: var(--metro-blue);">Informations</h2>
    
    <div class="space-y-3">
      <!-- Description -->
      <div v-if="parking.description?.value">
        <h3 class="text-sm font-medium text-gray-700">Description</h3>
        <p class="text-gray-600">{{ parking.description.value }}</p>
      </div>
      
      <!-- Adresse -->
      <div v-if="parking.location?.value">
        <h3 class="text-sm font-medium text-gray-700">Adresse</h3>
        <p class="text-gray-600">{{ formattedAddress }}</p>
        <div class="flex space-x-2 mt-2">
          <!-- Google Maps -->
          <a 
            :href="`https://www.google.com/maps/dir/?api=1&destination=${parking.location.value.coordinates[1]},${parking.location.value.coordinates[0]}`" 
            target="_blank" 
            rel="noopener noreferrer" 
            class="inline-block px-3 py-1 rounded-md text-white text-sm"
            style="background-color: var(--metro-blue);"
          >
            <span class="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              Google Maps
            </span>
          </a>
          
          <!-- Waze -->
          <a 
            :href="`https://waze.com/ul?ll=${parking.location.value.coordinates[1]},${parking.location.value.coordinates[0]}&navigate=yes`" 
            target="_blank" 
            rel="noopener noreferrer" 
            class="inline-block px-3 py-1 rounded-md text-white text-sm"
            style="background-color: #33ccff;"
          >
            <span class="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1.5C6.21 1.5 1.5 6.21 1.5 12c0 5.79 4.71 10.5 10.5 10.5 5.79 0 10.5-4.71 10.5-10.5 0-5.79-4.71-10.5-10.5-10.5zM12 3c4.97 0 9 4.03 9 9 0 4.97-4.03 9-9 9-4.97 0-9-4.03-9-9 0-4.97 4.03-9 9-9z"/>
                <circle cx="12" cy="12" r="3"/>
                <path d="M6.34 17.66c1.64 1.64 3.84 2.34 6.16 2.34 2.32 0 4.52-.7 6.16-2.34"/>
              </svg>
              Waze
            </span>
          </a>
        </div>
      </div>
      
      <!-- Hauteur maximale -->
      <div v-if="parking.maxHeight?.value">
        <h3 class="text-sm font-medium text-gray-700">Hauteur maximale</h3>
        <p class="text-gray-600">{{ parking.maxHeight.value }} mètres</p>
      </div>
      
      <!-- Nombre d'étages -->
      <div v-if="parking.levelNumber?.value">
        <h3 class="text-sm font-medium text-gray-700">Nombre d'étages</h3>
        <p class="text-gray-600">{{ parking.levelNumber.value }}</p>
      </div>
      
      <!-- Dernière mise à jour -->
      <div>
        <h3 class="text-sm font-medium text-gray-700">Dernière mise à jour</h3>
        <p class="text-gray-600">{{ formattedLastUpdate }}</p>
      </div>
    </div>
  </div>
</template>
