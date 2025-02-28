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
        <a 
          :href="`https://www.google.com/maps/dir/?api=1&destination=${parking.location.value.coordinates[1]},${parking.location.value.coordinates[0]}`" 
          target="_blank" 
          rel="noopener noreferrer" 
          class="inline-block mt-2 px-3 py-1 rounded-md text-white text-sm"
          style="background-color: var(--metro-blue);"
        >
          Itinéraire
        </a>
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
