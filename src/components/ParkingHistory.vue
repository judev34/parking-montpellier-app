<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { Line } from 'vue-chartjs';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import type { ParkingTimeSeriesResponse } from '@/types/parking';

// Enregistrement des composants requis par ChartJS
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const props = defineProps<{
  parkingHistory: ParkingTimeSeriesResponse | null;
  totalSpots: number;
}>();

const chartData = ref({
  labels: [] as string[],
  datasets: [
    {
      label: 'Places disponibles',
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 2,
      pointRadius: 1,
      pointHoverRadius: 5,
      pointHitRadius: 10,
      data: [] as number[],
      fill: true,
    }
  ]
});

const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
    },
    tooltip: {
      callbacks: {
        label: (context: any) => {
          return `Places disponibles: ${context.raw}/${props.totalSpots} (${Math.round((context.raw / props.totalSpots) * 100)}%)`;
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      suggestedMax: props.totalSpots,
      title: {
        display: true,
        text: 'Places disponibles'
      }
    },
    x: {
      title: {
        display: true,
        text: 'Heure'
      }
    }
  }
});

// Fonction pour formater les données d'historique pour l'affichage dans le graphique
function processHistoryData() {
  if (!props.parkingHistory?.values || props.parkingHistory.values.length === 0) return;
  
  // Vérifier d'abord si les structures de données nécessaires sont présentes
  if (!props.parkingHistory.index || !props.parkingHistory.attributeNames) {
    console.error('Format de données d\'historique invalide:', props.parkingHistory);
    return;
  }
  
  // Indice de l'attribut "availableSpotNumber" dans le tableau attributeNames
  const availableSpotIndex = props.parkingHistory.attributeNames.findIndex(
    name => name === 'availableSpotNumber'
  );
  
  if (availableSpotIndex === -1) {
    console.error('Attribut availableSpotNumber non trouvé dans les données');
    return;
  }
  
  // Limiter à 50 points maximum pour la lisibilité (si plus)
  const valueCount = props.parkingHistory.index.length;
  const step = valueCount > 50 ? Math.floor(valueCount / 50) : 1;
  
  // Créer les libellés et les données
  const labels: string[] = [];
  const data: number[] = [];
  
  // Extraire les données en utilisant le bon format
  for (let i = 0; i < valueCount; i += step) {
    if (i < props.parkingHistory.index.length && i < props.parkingHistory.values.length) {
      // Formater la date pour l'axe X
      const timestamp = props.parkingHistory.index[i];
      const date = new Date(timestamp);
      const label = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      
      // Récupérer la valeur de places disponibles pour ce timestamp
      const availableSpots = props.parkingHistory.values[i][availableSpotIndex];
      
      labels.push(label);
      data.push(availableSpots);
    }
  }
  
  // Mettre à jour les données du graphique
  chartData.value.labels = labels;
  chartData.value.datasets[0].data = data;
}

// Traiter les données lorsqu'elles changent
watch(() => props.parkingHistory, () => {
  processHistoryData();
}, { deep: true });

// Traiter les données au montage du composant
onMounted(() => {
  processHistoryData();
});

// Afficher un message si aucune donnée n'est disponible
const noDataAvailable = computed(() => {
  return !props.parkingHistory?.values || props.parkingHistory.values.length === 0;
});
</script>

<template>
  <div class="bg-white rounded-lg shadow p-4 mb-6">
    <h3 class="text-lg font-semibold mb-4">Historique des places disponibles</h3>
    
    <div v-if="parkingHistory && parkingHistory.values && parkingHistory.values.length > 0" class="h-80">
      <Line :data="chartData" :options="chartOptions" />
    </div>
    <div v-else class="h-80 flex items-center justify-center flex-col text-gray-500">
      <p>Données d'historique non disponibles</p>
      <p class="text-sm mt-2">La fonctionnalité d'historique est temporairement désactivée.</p>
    </div>
  </div>
</template>
