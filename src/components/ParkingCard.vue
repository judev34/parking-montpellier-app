<script setup lang="ts">
import type { Parking } from '@/types/parking';
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import dayjs from '@/utils/dayjs';

const props = defineProps<{
  parking: Parking;
  showDetails?: boolean;
}>();

const router = useRouter();

const availableSpots = computed(() => props.parking.availableSpotNumber?.value || 0);
const totalSpots = computed(() => props.parking.totalSpotNumber?.value || 0);
const occupancyPercentage = computed(() => props.parking.occupancyPercentage || 0);

const statusColor = computed(() => {
  // Si les données sont obsolètes, utiliser une couleur grise
  if (isDataOutdated.value) return 'status-closed';
  
  if (props.parking.status?.value === 'Closed') return 'status-closed';
  if (occupancyPercentage.value > 90) return 'status-full';
  if (occupancyPercentage.value > 70) return 'status-limited';
  return 'status-available';
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

const statusText = computed(() => {
  // Si les données sont obsolètes, afficher un message spécifique
  if (isDataOutdated.value) return 'Données indisponibles';
  
  if (props.parking.status?.value === 'Closed') return 'Fermé';
  if (occupancyPercentage.value === 100) return 'Complet';
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

  // Ajuster manuellement le décalage horaire (UTC+2 pour l'heure d'été en France)
  const date = new Date(timestamp);
  // Soustraire 2 heures pour compenser le décalage
  date.setHours(date.getHours() - 2);
  return dayjs(date).format('DD/MM/YYYY HH:mm');
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
          <FontAwesomeIcon :icon="['fas', 'square-parking']" class="mr-2" :style="{ color: parking.isRelais ? 'var(--metro-orange)' : 'var(--metro-blue)' }" />
          {{ parkingName }}
          <span v-if="parking.isRelais" class="ml-2 text-xs text-white bg-orange-500 px-2 py-0.5 rounded-full">P+Tram</span>
        </h3>
        <span v-if="distance" class="text-sm text-gray-500">
          <FontAwesomeIcon :icon="['fas', 'map-marker-alt']" class="mr-1" />
          {{ distance }}
        </span>
      </div>
      
      <!-- Les icônes de services sont affichées ici à la place de l'adresse -->
      <div v-if="parking.details?.services" class="mt-1 flex flex-wrap gap-1">
        <span v-if="parking.details.services.pmr" class="text-blue-600" title="Accès PMR">
          <FontAwesomeIcon :icon="['fas', 'wheelchair']" />
        </span>
        <span v-if="parking.details.services.ve" class="text-green-600" title="Recharge véhicule électrique">
          <FontAwesomeIcon :icon="['fas', 'charging-station']" />
        </span>
        <span v-if="parking.details.services.places_famille" class="text-pink-600" title="Places familles">
          <FontAwesomeIcon :icon="['fas', 'child']" />
        </span>
        <span v-if="parking.details.services.lavage" class="text-cyan-600" title="Service de lavage">
          <FontAwesomeIcon :icon="['fas', 'droplet']" />
        </span>
        <span v-if="parking.details.services.parking_velos" class="text-amber-600" title="Parking vélos">
          <FontAwesomeIcon :icon="['fas', 'bicycle']" />
        </span>
      </div>

      <div class="mt-2 flex items-center">
        <span :class="[statusColor, 'inline-block w-3 h-3 rounded-full mr-2']"></span>
        <span class="text-sm font-medium">{{ statusText }}</span>
      </div>

      <div class="mt-3">
        <div v-if="isDataOutdated" class="text-center py-2 text-red-600 text-sm">
          Données indisponibles pour l'instant
        </div>
        <div v-else class="relative pt-1">
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
      
      <!-- Informations supplémentaires si disponibles -->
      <div v-if="parking.details && showDetails" class="mt-3 border-t pt-3">
        <!-- Horaires -->
        <div v-if="parking.details.horaires" class="flex items-center mb-2">
          <FontAwesomeIcon :icon="['far', 'clock']" class="mr-2 text-gray-600" />
          <span class="text-sm">{{ parking.details.horaires }}</span>
        </div>
        
        <!-- Téléphone -->
        <div v-if="parking.details.telephone" class="flex items-center mb-2">
          <FontAwesomeIcon :icon="['fas', 'phone']" class="mr-2 text-gray-600" />
          <span class="text-sm">{{ parking.details.telephone }}</span>
        </div>

        <!-- Tarifs si disponibles -->
        <div v-if="parking.details.tarifs" class="mb-3">
          <h4 class="text-sm font-bold mb-1 text-gray-700 flex items-center">
            <FontAwesomeIcon :icon="['fas', 'euro-sign']" class="mr-2 text-gray-600" /> Tarifs
          </h4>
          <div class="grid grid-cols-4 gap-2 text-xs">
            <div v-for="(tarif, duree) in parking.details.tarifs" :key="duree" class="bg-gray-100 rounded p-2 text-center">
              <div class="font-semibold">{{ duree }}</div>
              <div>{{ tarif !== undefined ? (tarif / 100).toFixed(2) : 'N/A' }}€</div>
            </div>
          </div>
          <div v-if="parking.details.abonnements" class="text-xs mt-1 text-gray-600">
            <span class="italic">Abonnements: {{ parking.details.abonnements }}</span>
          </div>
        </div>
        
        <!-- Services disponibles -->
        <div v-if="parking.details.services" class="mb-3">
          <h4 class="text-sm font-bold mb-2 text-gray-700 flex items-center">
            <FontAwesomeIcon :icon="['fas', 'info-circle']" class="mr-2 text-gray-600" /> Services
          </h4>
          <div class="flex flex-wrap gap-2">
            <span v-if="parking.details.services.pmr" class="inline-flex items-center bg-blue-100 text-blue-800 text-xs rounded px-2 py-1">
              <FontAwesomeIcon :icon="['fas', 'wheelchair']" class="mr-1" /> PMR
              <span v-if="parking.details.services.nb_pmr" class="ml-1">({{ parking.details.services.nb_pmr }})</span>
            </span>
            <span v-if="parking.details.services.resaplace" class="inline-flex items-center bg-green-100 text-green-800 text-xs rounded px-2 py-1">
              <FontAwesomeIcon :icon="['fas', 'bookmark']" class="mr-1" /> Réservation
            </span>
            <span v-if="parking.details.services.telepeage" class="inline-flex items-center bg-purple-100 text-purple-800 text-xs rounded px-2 py-1">
              <FontAwesomeIcon :icon="['fas', 'credit-card']" class="mr-1" /> Télépéage
            </span>
            <span v-if="parking.details.services.lavage" class="inline-flex items-center bg-cyan-100 text-cyan-800 text-xs rounded px-2 py-1">
              <FontAwesomeIcon :icon="['fas', 'droplet']" class="mr-1" /> Lavage
            </span>
            <span v-if="parking.details.services.places_famille" class="inline-flex items-center bg-pink-100 text-pink-800 text-xs rounded px-2 py-1">
              <FontAwesomeIcon :icon="['fas', 'child']" class="mr-1" /> Places famille
            </span>
            <span v-if="parking.details.services.ve" class="inline-flex items-center bg-teal-100 text-teal-800 text-xs rounded px-2 py-1">
              <FontAwesomeIcon :icon="['fas', 'charging-station']" class="mr-1" /> Recharge VE
            </span>
            <span v-if="parking.details.services.parking_velos" class="inline-flex items-center bg-amber-100 text-amber-800 text-xs rounded px-2 py-1">
              <FontAwesomeIcon :icon="['fas', 'bicycle']" class="mr-1" /> Parking vélos
            </span>
          </div>
        </div>
        
        <!-- Accès transports -->
        <div v-if="parking.details.acces" class="mb-2">
          <h4 class="text-sm font-bold mb-2 text-gray-700 flex items-center">
            <FontAwesomeIcon :icon="['fas', 'bus']" class="mr-2 text-gray-600" /> Accès transports
          </h4>
          <div class="flex flex-wrap gap-2 mb-1">
            <span v-if="parking.details.acces.tramway && parking.details.acces.tramway.length > 0" 
              v-for="ligne in parking.details.acces.tramway" :key="'tram-'+ligne"
              class="inline-flex items-center bg-blue-100 text-blue-800 text-xs rounded-full w-6 h-6 justify-center">
              T{{ ligne }}
            </span>
            <span v-if="parking.details.acces.bus && parking.details.acces.bus.length > 0" 
              v-for="ligne in parking.details.acces.bus" :key="'bus-'+ligne"
              class="inline-flex items-center bg-orange-100 text-orange-800 text-xs rounded-full w-6 h-6 justify-center">
              {{ ligne }}
            </span>
          </div>
          <div v-if="parking.details.acces.arret" class="text-xs text-gray-600">
            <span>Arrêt: {{ parking.details.acces.arret }}</span>
          </div>
        </div>
      </div>
      
      <meta itemprop="address" :content="parking.details?.entree || 'Montpellier, France'" />
      
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
