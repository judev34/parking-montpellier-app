<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useParkingStore } from '@/stores/parking';

const props = defineProps<{
  parkingId: string;
}>();

const parkingStore = useParkingStore();
const loading = ref(true);
const error = ref<string | null>(null);
const timeslotData = ref<Record<string, any>>({});

// Définition des plages horaires
const timeSlots = [
  { id: 'early_morning', label: 'Petit matin (5h-8h)', start: 5, end: 8 },
  { id: 'morning', label: 'Matin (8h-12h)', start: 8, end: 12 },
  { id: 'noon', label: 'Midi (12h-14h)', start: 12, end: 14 },
  { id: 'afternoon', label: 'Après-midi (14h-18h)', start: 14, end: 18 },
  { id: 'evening', label: 'Soirée (18h-23h)', start: 18, end: 23 },
  { id: 'night', label: 'Nuit (23h-5h)', start: 23, end: 5 }
];

// Jours de la semaine
const weekDays = computed(() => {
  const now = new Date();
  const today = now.getDay(); // 0 = dimanche, 1-6 = lundi-dimanche
  
  // Trouver la date du lundi de la semaine dernière
  const mondayLastWeek = new Date(now);
  mondayLastWeek.setDate(mondayLastWeek.getDate() - 7 - (today === 0 ? 6 : today - 1));
  
  // Générer les dates pour chaque jour
  const days = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(mondayLastWeek);
    date.setDate(date.getDate() + i);
    
    const dayOfWeek = date.getDay();
    let label;
    
    switch (dayOfWeek) {
      case 0: label = 'Dimanche'; break;
      case 1: label = 'Lundi'; break;
      case 2: label = 'Mardi'; break;
      case 3: label = 'Mercredi'; break;
      case 4: label = 'Jeudi'; break;
      case 5: label = 'Vendredi'; break;
      case 6: label = 'Samedi'; break;
      default: label = '';
    }
    
    // Formater la date (jour/mois)
    const formattedDate = date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'numeric'
    });
    
    days.push({
      id: dayOfWeek,
      label,
      date: formattedDate,
      fullDate: date
    });
  }
  
  // Trier les jours dans l'ordre habituel (lundi à dimanche)
  days.sort((a, b) => {
    // Dimanche (0) doit être à la fin
    const orderA = a.id === 0 ? 7 : a.id;
    const orderB = b.id === 0 ? 7 : b.id;
    return orderA - orderB;
  });
  
  return days;
});

// Dates de la semaine (pour l'affichage)
const historyDateRange = computed(() => {
  const now = new Date();
  const endDate = new Date(now);
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - 7);
  
  // Formater les dates au format jour/mois/année
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric'
    });
  };
  
  return {
    start: formatDate(startDate),
    end: formatDate(endDate)
  };
});

// Récupérer les données d'historique au chargement du composant
onMounted(async () => {
  loading.value = true;
  try {
    await parkingStore.fetchParkingHistory(props.parkingId, { interval: 'hour', period: 'week' });
    processTimeslotData();
  } catch (err) {
    error.value = "Impossible de charger les données d'historique";
    console.error(err);
  } finally {
    loading.value = false;
  }
});

// Fonction pour calculer l'occupation moyenne par plage horaire et par jour
function processTimeslotData() {
  if (!parkingStore.parkingHistory?.index || parkingStore.parkingHistory.index.length === 0) {
    error.value = "Aucune donnée d'historique disponible";
    return;
  }

  const historyData = parkingStore.parkingHistory;
  const availableSpots = historyData.values; // Utiliser directement le tableau de values
  
  // Initialiser la structure de données pour les moyennes par jour et plage horaire
  const daySlotData: Record<number, Record<string, number[]>> = {};
  
  // Initialiser pour chaque jour de la semaine
  for (const day of weekDays.value) {
    daySlotData[day.id] = {};
    
    // Initialiser pour chaque plage horaire
    for (const slot of timeSlots) {
      daySlotData[day.id][slot.id] = [];
    }
  }

  // Traiter chaque point de données
  for (let i = 0; i < historyData.index.length; i++) {
    const dateStr = historyData.index[i];
    const date = new Date(dateStr);
    const dayOfWeek = date.getDay(); // 0-6, 0 étant dimanche
    const hour = date.getHours();
    const availableSpot = availableSpots[i];
    
    // Déterminer à quelle plage horaire appartient cette heure
    for (const slot of timeSlots) {
      if (slot.id === 'night') {
        // Cas spécial pour la nuit (traverse minuit)
        if (hour >= slot.start || hour < slot.end) {
          daySlotData[dayOfWeek][slot.id].push(availableSpot);
        }
      } else if (hour >= slot.start && hour < slot.end) {
        daySlotData[dayOfWeek][slot.id].push(availableSpot);
      }
    }
  }

  // Calculer les moyennes pour chaque jour/plage horaire
  const result: Record<string, any> = {};
  
  for (const day of weekDays.value) {
    result[day.id] = {};
    
    for (const slot of timeSlots) {
      const values = daySlotData[day.id][slot.id];
      if (values.length > 0) {
        const sum = values.reduce((acc, val) => acc + val, 0);
        const avg = Math.round(sum / values.length);
        result[day.id][slot.id] = avg;
      } else {
        result[day.id][slot.id] = null; // Aucune donnée pour cette combinaison
      }
    }
  }
  
  timeslotData.value = result;
}

// Obtenir le statut de disponibilité basé sur le pourcentage d'occupation
function getAvailabilityStatus(availableSpots: number | null): string {
  if (availableSpots === null) return 'unknown';
  
  const totalSpots = parkingStore.selectedParking?.totalSpotNumber?.value || 100;
  const occupancyPercentage = ((totalSpots - availableSpots) / totalSpots) * 100;
  
  if (occupancyPercentage > 90) return 'critical';
  if (occupancyPercentage > 70) return 'limited';
  return 'good';
}

// Calculer la couleur de fond en fonction du statut
function getStatusColor(status: string): string {
  switch (status) {
    case 'good': return 'bg-green-500';
    case 'limited': return 'bg-orange-500';
    case 'critical': return 'bg-red-500';
    default: return 'bg-gray-300';
  }
}

// Calculer la couleur de texte en fonction du statut
function getStatusTextColor(status: string): string {
  return status === 'unknown' ? 'text-gray-500' : 'text-white';
}

// Obtenir le texte descriptif en fonction du statut
function getStatusText(status: string): string {
  switch (status) {
    case 'good': return 'Disponible';
    case 'limited': return 'Limité';
    case 'critical': return 'Saturé';
    default: return 'Inconnu';
  }
}

// Afficher le nombre de places disponibles avec pourcentage
function getAvailabilityText(availableSpots: number | null): string {
  if (availableSpots === null) return 'Pas de données';
  
  const totalSpots = parkingStore.selectedParking?.totalSpotNumber?.value || 100;
  const percentage = Math.round((availableSpots / totalSpots) * 100);
  
  return `${availableSpots}/${totalSpots} (${percentage}%)`;
}

// Pour déterminer si des données sont disponibles
const hasData = computed(() => {
  return Object.keys(timeslotData.value).length > 0;
});
</script>

<template>
  <div class="bg-white rounded-lg shadow-md p-4">
    <h2 class="text-lg font-semibold mb-3" style="color: var(--metro-blue);">Disponibilité par plage horaire</h2>
    
    <div class="text-sm text-gray-600 mb-2">
      <p>Période analysée : du <strong>{{ historyDateRange.start }}</strong> au <strong>{{ historyDateRange.end }}</strong></p>
    </div>
    
    <p class="text-sm text-gray-600 mb-4">
      Ce tableau présente la disponibilité moyenne des places par jour et par plage horaire, basée sur l'historique de la semaine dernière.
      Utilisez ces informations pour planifier au mieux votre stationnement.
    </p>
    
    <!-- État de chargement -->
    <div v-if="loading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2" style="border-color: var(--metro-blue);"></div>
    </div>
    
    <!-- Message d'erreur -->
    <div v-else-if="error" class="text-red-500 py-8 text-center">
      <p>{{ error }}</p>
    </div>
    
    <!-- Tableau des plages horaires -->
    <div v-else-if="hasData" class="overflow-x-auto">
      <table class="min-w-full bg-white">
        <thead>
          <tr class="bg-gray-100">
            <th class="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plage horaire</th>
            <th 
              v-for="day in weekDays" 
              :key="day.id"
              class="py-2 px-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              <div>{{ day.label }}</div>
              <div class="font-normal text-gray-400">{{ day.date }}</div>
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="slot in timeSlots" :key="slot.id" class="hover:bg-gray-50">
            <td class="py-3 px-3 text-sm font-medium text-gray-900">
              {{ slot.label }}
            </td>
            <td 
              v-for="day in weekDays" 
              :key="`${day.id}-${slot.id}`"
              class="py-3 px-3 text-sm text-center"
            >
              <div v-if="timeslotData[day.id] && timeslotData[day.id][slot.id] !== null">
                <div class="flex flex-col items-center">
                  <div 
                    :class="[
                      getStatusColor(getAvailabilityStatus(timeslotData[day.id][slot.id])), 
                      getStatusTextColor(getAvailabilityStatus(timeslotData[day.id][slot.id])),
                      'px-2 py-1 rounded-md text-xs font-medium w-24'
                    ]"
                  >
                    {{ getStatusText(getAvailabilityStatus(timeslotData[day.id][slot.id])) }}
                  </div>
                  <div class="text-xs text-gray-500 mt-1">
                    {{ getAvailabilityText(timeslotData[day.id][slot.id]) }}
                  </div>
                </div>
              </div>
              <div v-else class="text-gray-400 text-xs">
                Pas de données
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Pas de données -->
    <div v-else class="py-8 text-center text-gray-500">
      <p>Aucune donnée d'historique disponible</p>
      <p class="text-sm mt-2">Essayez de revenir plus tard ou contactez le support.</p>
    </div>
    
    <!-- Légende -->
    <div class="mt-6 flex flex-wrap gap-3 justify-center">
      <div class="flex items-center">
        <div class="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
        <span class="text-xs text-gray-600">Disponible</span>
      </div>
      <div class="flex items-center">
        <div class="w-4 h-4 rounded-full bg-orange-500 mr-2"></div>
        <span class="text-xs text-gray-600">Limité</span>
      </div>
      <div class="flex items-center">
        <div class="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
        <span class="text-xs text-gray-600">Saturé</span>
      </div>
      <div class="flex items-center">
        <div class="w-4 h-4 rounded-full bg-gray-300 mr-2"></div>
        <span class="text-xs text-gray-600">Données insuffisantes</span>
      </div>
    </div>
  </div>
</template>
