<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import type { Parking } from '@/types/parking';

const props = defineProps<{
  parking: Parking;
}>();

const router = useRouter();

// Calcul des informations d'occupation
const availableSpots = computed(() => props.parking.availableSpotNumber?.value || 0);
const totalSpots = computed(() => props.parking.totalSpotNumber?.value || 0);
const occupancyPercentage = computed(() => {
  if (totalSpots.value === 0) return 0;
  return Math.round(100 * (1 - availableSpots.value / totalSpots.value));
});

// Déterminer la couleur du statut
const statusColor = computed(() => {
  if (props.parking.status?.value === 'closed') return 'bg-gray-500';
  if (totalSpots.value === 0) return 'bg-gray-300';
  
  const percentage = occupancyPercentage.value;
  if (percentage >= 90) return 'bg-red-500';
  if (percentage >= 70) return 'bg-orange-500';
  return 'bg-green-500';
});

// Naviguer vers la page de détail du parking
function goToDetails() {
  router.push({ name: 'parking-details', params: { id: props.parking.id } });
}
</script>

<template>
  <div class="w-64 rounded-lg overflow-hidden shadow-lg bg-white">
    <!-- En-tête avec nom et statut -->
    <div class="p-3 bg-gray-50 border-b flex justify-between items-center">
      <h3 class="font-semibold text-gray-800 truncate">{{ parking.name.value }}</h3>
      <span :class="[statusColor, 'inline-block w-3 h-3 rounded-full']"></span>
    </div>
    
    <!-- Corps avec informations -->
    <div class="p-3">
      <!-- Disponibilité -->
      <div class="mb-3">
        <div class="flex justify-between text-sm mb-1">
          <span class="text-gray-600">Disponibilité:</span>
          <span class="font-medium">
            {{ availableSpots }} / {{ totalSpots }} places
          </span>
        </div>
        
        <!-- Barre de progression -->
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div 
            class="h-full rounded-full" 
            :class="statusColor"
            :style="{ width: `${occupancyPercentage}%` }"
          ></div>
        </div>
      </div>
      
      <!-- Bouton pour plus de détails -->
      <button 
        @click="goToDetails"
        class="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition duration-200"
      >
        Voir les détails
      </button>
    </div>
  </div>
</template>
