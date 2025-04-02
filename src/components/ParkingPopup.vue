<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import type { Parking } from '@/types/parking';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

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

// Vérifier si les données sont à jour (moins de 12h)
const isDataOutdated = computed(() => {
  const timestamp = props.parking.availableSpotNumber?.metadata?.timestamp?.value;
  if (!timestamp) return true;
  
  const updateDate = new Date(timestamp);
  // Soustraire 2 heures pour compenser le décalage horaire
  updateDate.setHours(updateDate.getHours() - 2);
  
  const now = new Date();
  const diffHours = (now.getTime() - updateDate.getTime()) / (1000 * 60 * 60);
  
  // Si la dernière mise à jour date de plus de 12 heures
  return diffHours > 12;
});

// Déterminer la couleur du statut
const statusColor = computed(() => {
  // Si les données sont obsolètes, utiliser une couleur grise
  if (isDataOutdated.value) return 'bg-gray-500';
  
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
  <div @click="goToDetails" class="w-64 rounded-lg overflow-hidden shadow-lg bg-white cursor-pointer hover:shadow-xl transition-shadow duration-300">
    <!-- En-tête avec nom et statut -->
    <div class="p-3 bg-gray-50 border-b flex justify-between items-center">
      <h3 class="font-semibold text-gray-800 truncate">{{ parking.name?.value || 'Parking sans nom' }}</h3>
      <span :class="[statusColor, 'inline-block w-3 h-3 rounded-full']"></span>
    </div>
    
    <!-- Corps avec informations -->
    <div class="p-3">
      <!-- Disponibilité -->
      <div class="mb-3">
        <div v-if="isDataOutdated" class="text-center py-2 text-red-600 text-sm">
          Données indisponibles pour l'instant
        </div>
        <div v-else>
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
      </div>
      
      <!-- La carte est cliquable au lieu d'avoir un bouton -->
      <!-- <div class="text-center text-xs text-gray-500 mt-1">
        <span>Cliquez sur la carte pour plus de détails</span>
      </div> -->
    </div>
  </div>
</template>
