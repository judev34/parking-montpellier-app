<script setup lang="ts">
import type { Parking } from '@/types/parking';
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const props = defineProps<{
  parking: Parking;
  showDetails?: boolean;
}>();

const router = useRouter();

const availableSpots = computed(() => props.parking.availableSpotNumber?.value || 0);
const totalSpots = computed(() => props.parking.totalSpotNumber?.value || 0);
const occupancyPercentage = computed(() => props.parking.occupancyPercentage || 0);

const statusColor = computed(() => {
  if (props.parking.status?.value === 'Closed') return 'status-closed';
  if (occupancyPercentage.value > 90) return 'status-full';
  if (occupancyPercentage.value > 70) return 'status-limited';
  return 'status-available';
});

const statusText = computed(() => {
  if (props.parking.status?.value === 'Closed') return 'Fermé';
  if (occupancyPercentage.value > 90) return 'Presque complet';
  if (occupancyPercentage.value > 70) return 'Assez occupé';
  return 'Disponible';
});

function goToDetails() {
  router.push({ name: 'parking-details', params: { id: props.parking.id } });
}

const parkingName = computed(() => props.parking.name?.value || 'Parking sans nom');
const parkingStatus = computed(() => props.parking.status?.value || 'Open');
const formattedDate = computed(() => {
  const timestamp = props.parking.availableSpotNumber?.metadata?.timestamp?.value;
  if (!timestamp) return 'Inconnu';

  const date = new Date(timestamp);
  return date.toLocaleString('fr-FR');
});

// Calcul optionnel de la distance si disponible
const distance = computed(() => {
  if ((props.parking as any).distance) {
    const distanceInMeters = (props.parking as any).distance;
    if (distanceInMeters < 1000) {
      return `${Math.round(distanceInMeters)} m`;
    } else {
      return `${(distanceInMeters / 1000).toFixed(1)} km`;
    }
  }
  return null;
});
</script>

<template>
  <div 
    class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
    :class="{ 'cursor-pointer': !showDetails }"
    @click="!showDetails && goToDetails()"
    itemscope
    itemtype="https://schema.org/ParkingFacility"
  >
    <div class="p-4">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-800" itemprop="name">
          <FontAwesomeIcon :icon="['fas', 'square-parking']" class="mr-2" />
          {{ parkingName }}
        </h3>
        <span v-if="distance" class="text-sm text-gray-500">
          <FontAwesomeIcon :icon="['fas', 'map-marker-alt']" class="mr-1" />
          {{ distance }}
        </span>
      </div>

      <div class="mt-2 flex items-center">
        <span :class="[statusColor, 'inline-block w-3 h-3 rounded-full mr-2']"></span>
        <span class="text-sm font-medium">{{ statusText }}</span>
        <span v-if="parkingStatus && parkingStatus !== 'Open'" class="ml-2 px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded">
          {{ parkingStatus }}
        </span>
      </div>

      <div class="mt-3">
        <div class="relative pt-1">
          <div class="flex mb-2 items-center justify-between">
            <div>
              <span class="text-xs font-semibold inline-block" style="color: var(--metro-blue);" itemprop="availableSpotNumber">
                <FontAwesomeIcon :icon="['fas', 'car-side']" class="mr-1" />
                {{ availableSpots }} places disponibles
              </span>
            </div>
            <div class="text-right">
              <span class="text-xs font-semibold inline-block" itemprop="maximumAttendeeCapacity">
                {{ totalSpots }} places totales
              </span>
            </div>
          </div>
          <div class="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
            <div
              :style="`width: ${occupancyPercentage}%`"
              :class="[statusColor, 'shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-500']"
            ></div>
          </div>
        </div>
      </div>
      
      <div class="mt-3 text-xs text-gray-500 flex justify-between">
        <span>Dernière mise à jour: <time itemprop="dateModified">{{ formattedDate }}</time></span>
      </div>
      
      <meta itemprop="address" content="Montpellier, France" />
      
      <div v-if="showDetails" class="mt-3 flex justify-end">
        <button 
          class="px-4 py-2 text-white rounded-md hover:opacity-90 transition duration-200"
          style="background-color: var(--metro-blue);"
          @click="router.push({ name: 'home' })"
        >
          Retour à la liste
        </button>
      </div>
    </div>
  </div>
</template>
