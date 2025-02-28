<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { Line } from 'vue-chartjs';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import type { ParkingTimeSeriesResponse } from '@/types/parking';
import { useParkingStore } from '@/stores/parking';

// Enregistrement des composants requis par ChartJS
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const props = defineProps<{
  parkingId: string;
}>();

const parkingStore = useParkingStore();
const loading = ref(true);
const error = ref<string | null>(null);
const weekdayData = ref<any>(null);
const weekendData = ref<any>(null);
const selectedView = ref<'weekday' | 'weekend' | 'week'>('week');
const viewOptions = ref([
  { value: 'week', label: 'Vue hebdomadaire' },
  { value: 'weekday', label: 'Jours ouvrés' },
  { value: 'weekend', label: 'Week-end' }
]);

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
    // Initialiser les dates d'analyse
    startDateAnalyzed.value = historyDateRange.value.start;
    endDateAnalyzed.value = historyDateRange.value.end;

    // Récupérer les données pour ce parking
    await parkingStore.fetchParkingHistory(props.parkingId, { interval: 'hour', period: 'week' });
    processHistoryData();
  } catch (err) {
    error.value = "Impossible de charger les données d'historique";
    console.error(err);
  } finally {
    loading.value = false;
  }
});

// Fonction pour calculer l'occupation moyenne par heure pour les jours de semaine et les week-ends
function processHistoryData() {
  if (!parkingStore.parkingHistory?.values || parkingStore.parkingHistory.values.length === 0) {
    error.value = "Aucune donnée d'historique disponible";
    return;
  }

  const historyData = parkingStore.parkingHistory;
  
  // Nous n'avons plus besoin de chercher l'index dans attributeNames
  // Les valeurs sont directement accessibles dans le tableau values
  
  // Tableaux pour stocker les données par jour et par heure
  const weekdayHourlyData: Record<number, number[]> = {};
  const weekendHourlyData: Record<number, number[]> = {};
  
  // Initialiser les tableaux pour chaque heure
  for (let hour = 0; hour < 24; hour++) {
    weekdayHourlyData[hour] = [];
    weekendHourlyData[hour] = [];
  }

  // Traiter chaque point de données
  for (let i = 0; i < historyData.index.length; i++) {
    const dateStr = historyData.index[i];
    const date = new Date(dateStr);
    const dayOfWeek = date.getDay(); // 0 = dimanche, 1-5 = lundi-vendredi, 6 = samedi
    const hour = date.getHours();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const availableSpots = historyData.values[i]; // Maintenant values est un tableau 1D
    
    // Ajouter au bon tableau selon le jour de la semaine
    if (isWeekend) {
      weekendHourlyData[hour].push(availableSpots);
    } else {
      weekdayHourlyData[hour].push(availableSpots);
    }
  }

  // Calculer les moyennes pour chaque heure
  const weekdayAverages = [];
  const weekendAverages = [];
  const hourLabels = [];

  for (let hour = 0; hour < 24; hour++) {
    // Formater l'heure pour l'affichage
    const formattedHour = `${hour}h`;
    hourLabels.push(formattedHour);
    
    // Calculer la moyenne pour cette heure (jours de semaine)
    const weekdayValues = weekdayHourlyData[hour];
    if (weekdayValues.length > 0) {
      const sum = weekdayValues.reduce((acc, val) => acc + val, 0);
      weekdayAverages.push(Math.round(sum / weekdayValues.length));
    } else {
      weekdayAverages.push(0);
    }
    
    // Calculer la moyenne pour cette heure (week-end)
    const weekendValues = weekendHourlyData[hour];
    if (weekendValues.length > 0) {
      const sum = weekendValues.reduce((acc, val) => acc + val, 0);
      weekendAverages.push(Math.round(sum / weekendValues.length));
    } else {
      weekendAverages.push(0);
    }
  }

  // Préparer les données pour le graphique
  weekdayData.value = {
    labels: hourLabels,
    datasets: [
      {
        label: 'Moyenne (jours ouvrés)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 2,
        fill: true,
        pointRadius: 3,
        pointHoverRadius: 5,
        tension: 0.4,
        data: weekdayAverages
      }
    ]
  };
  
  weekendData.value = {
    labels: hourLabels,
    datasets: [
      {
        label: 'Moyenne (week-end)',
        backgroundColor: 'rgba(255, 159, 64, 0.2)',
        borderColor: 'rgba(255, 159, 64, 1)',
        borderWidth: 2,
        fill: true,
        pointRadius: 3,
        pointHoverRadius: 5,
        tension: 0.4,
        data: weekendAverages
      }
    ]
  };
}

// Fonction pour traiter les données d'historique
function formatChartData(data: ParkingTimeSeriesResponse | null) {
  if (!data || !data.index || data.index.length === 0) {
    return {
      labels: [],
      datasets: []
    };
  }
  
  // Utiliser directement le tableau values
  const availableSpots = data.values;
  
  // Regroupement des données par jour
  const dayMap = new Map<string, number[]>();
  const dates = data.index.map(date => new Date(date));
  
  // Initialiser la map des jours
  for (let i = 0; i < dates.length; i++) {
    const date = dates[i];
    const day = date.toISOString().split('T')[0]; // YYYY-MM-DD
    
    if (!dayMap.has(day)) {
      dayMap.set(day, []);
    }
    
    dayMap.get(day)?.push(availableSpots[i] || 0);
  }
  
  // Calculer la moyenne par jour
  const days: string[] = [];
  const averages: number[] = [];
  
  dayMap.forEach((values, day) => {
    const sum = values.reduce((acc, val) => acc + val, 0);
    const avg = Math.round(sum / values.length);
    
    days.push(day);
    averages.push(avg);
  });
  
  // Tri des jours par ordre chronologique
  const sortedIndices = Array.from(days.keys()).sort(
    (a, b) => new Date(days[a]).getTime() - new Date(days[b]).getTime()
  );
  
  const sortedDays = sortedIndices.map(idx => {
    const date = new Date(days[idx]);
    // Format: "Lun 28/02"
    return `${date.toLocaleDateString('fr-FR', { weekday: 'short' })} ${date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}`;
  });
  
  const sortedAverages = sortedIndices.map(idx => averages[idx]);
  
  // Mettre à jour les dates d'analyse
  if (sortedDays.length > 0) {
    const startDate = new Date(days[sortedIndices[0]]);
    const endDate = new Date(days[sortedIndices[sortedIndices.length - 1]]);
    
    startDateAnalyzed.value = startDate.toLocaleDateString('fr-FR');
    endDateAnalyzed.value = endDate.toLocaleDateString('fr-FR');
  }
  
  return {
    labels: sortedDays,
    datasets: [{
      label: 'Places disponibles (moyenne journalière)',
      backgroundColor: '#2563eb',
      data: sortedAverages
    }]
  };
}

// Options pour le graphique
const chartOptions = computed(() => {
  const totalSpots = parkingStore.selectedParking?.totalSpotNumber?.value || 100;
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.raw;
            const percentage = Math.round((value / totalSpots) * 100);
            return `Places disponibles: ${value}/${totalSpots} (${percentage}%)`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: totalSpots,
        title: {
          display: true,
          text: 'Places disponibles'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Jour'
        }
      }
    }
  };
});

// Données combinées pour la vue hebdomadaire
const weekData = computed(() => {
  if (!weekdayData.value || !weekendData.value) return null;
  
  return {
    labels: weekdayData.value.labels,
    datasets: [
      {
        ...weekdayData.value.datasets[0],
        label: 'Jours ouvrés'
      },
      {
        ...weekendData.value.datasets[0],
        label: 'Week-end'
      }
    ]
  };
});

// Données à afficher selon la vue sélectionnée
const displayData = computed(() => {
  switch (selectedView.value) {
    case 'weekday':
      return weekdayData.value;
    case 'weekend':
      return weekendData.value;
    case 'week':
    default:
      return weekData.value;
  }
});

// Texte explicatif selon la vue sélectionnée
const explanationText = computed(() => {
  switch (selectedView.value) {
    case 'weekday':
      return "Ce graphique montre la disponibilité moyenne des places par heure pendant les jours ouvrés (lundi au vendredi). Utilisez ces données pour planifier vos déplacements en semaine.";
    case 'weekend':
      return "Ce graphique montre la disponibilité moyenne des places par heure pendant les week-ends (samedi et dimanche). Utilisez ces données pour planifier vos sorties le week-end.";
    case 'week':
    default:
      return "Ce graphique compare la disponibilité moyenne des places entre les jours ouvrés et les week-ends. Observez les différences pour mieux planifier vos stationnements.";
  }
});

// Fonction pour changer la vue
function changeView(view: 'weekday' | 'weekend' | 'week') {
  selectedView.value = view;
}

// Dates d'analyse
const startDateAnalyzed = ref<string | null>(null);
const endDateAnalyzed = ref<string | null>(null);
</script>

<template>
  <div class="bg-white rounded-lg shadow-md p-4">
    <div class="flex flex-col md:flex-row justify-between items-center mb-4">
      <h2 class="text-lg font-semibold" style="color: var(--metro-blue);">Historique hebdomadaire</h2>
      
      <!-- Sélecteur de vue -->
      <div class="flex space-x-2 mt-2 md:mt-0">
        <button 
          v-for="option in viewOptions" 
          :key="option.value"
          @click="changeView(option.value as any)"
          class="px-2 py-1 text-sm rounded-md"
          :class="selectedView === option.value ? 'text-white' : 'text-gray-700 bg-gray-100 hover:bg-gray-200'"
          :style="selectedView === option.value ? 'background-color: var(--metro-blue);' : ''"
        >
          {{ option.label }}
        </button>
      </div>
    </div>
    
    <!-- Périodes d'analyse -->
    <div class="text-sm text-gray-600 mb-3">
      <p>Période analysée : du <strong>{{ startDateAnalyzed }}</strong> au <strong>{{ endDateAnalyzed }}</strong></p>
    </div>
    
    <!-- Explication du graphique -->
    <p class="text-sm text-gray-600 mb-3">{{ explanationText }}</p>
    
    <!-- État de chargement -->
    <div v-if="loading" class="h-80 flex items-center justify-center">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2" style="border-color: var(--metro-blue);"></div>
    </div>
    
    <!-- Message d'erreur -->
    <div v-else-if="error" class="h-80 flex items-center justify-center text-red-500">
      <p>{{ error }}</p>
    </div>
    
    <!-- Graphique -->
    <div v-else-if="displayData" class="h-80">
      <Line :data="displayData" :options="chartOptions" />
    </div>
    
    <!-- Pas de données -->
    <div v-else class="h-80 flex items-center justify-center flex-col text-gray-500">
      <p>Aucune donnée d'historique disponible</p>
      <p class="text-sm mt-2">Essayez de revenir plus tard ou contactez le support.</p>
    </div>
    
    <!-- Légende en dessous du graphique -->
    <div class="mt-4 text-xs text-gray-500">
      <p>Les données représentent la moyenne sur une semaine. Chaque point correspond à la disponibilité moyenne à cette heure.</p>
      <p>Pour des résultats optimaux, consultez ces tendances avant de vous déplacer.</p>
    </div>
  </div>
</template>
