<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useParkingStore } from '@/stores/parking';
import L from 'leaflet';

const props = defineProps<{
  map?: L.Map | null
}>();

// Référence au marqueur de position utilisateur
const userLocationMarker = ref<L.Marker | null>(null);

// Utiliser le store Pinia
const parkingStore = useParkingStore();

// Émission d'événements
const emit = defineEmits(['location-updated']);

// Récupérer la position de l'utilisateur
function getUserLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        // Supprimer le marqueur précédent s'il existe
        if (userLocationMarker.value) {
          userLocationMarker.value.remove();
        }
        
        // Si une carte est fournie, ajouter un marqueur
        if (props.map) {
          // Centrer la carte sur la position
          props.map.setView([latitude, longitude], 15);
          
          // Créer une icône personnalisée pour le marqueur utilisateur
          const userIcon = L.divIcon({
            className: 'user-marker',
            html: `<div class="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-md"></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          });
          
          const newMarker = L.marker([latitude, longitude], { icon: userIcon });
          userLocationMarker.value = newMarker;
          newMarker.addTo(props.map).bindPopup('Votre position');
        }
        
        // Mettre à jour les distances dans le store
        parkingStore.updateDistances(latitude, longitude);
        
        // Émettre un événement avec les coordonnées
        emit('location-updated', { latitude, longitude });
      },
      (error) => {
        console.error('Erreur de géolocalisation:', error);
      }
    );
  }
}

// Demander automatiquement la position au chargement du composant
onMounted(() => {
  getUserLocation();
});

// Exposer la fonction pour qu'elle puisse être appelée par le composant parent
defineExpose({
  getUserLocation
});
</script>

<template>
  <!-- Aucun contenu visible, la géolocalisation est demandée automatiquement -->
</template>
