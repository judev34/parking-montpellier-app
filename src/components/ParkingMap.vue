<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useParkingStore } from '@/stores/parking';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { createApp } from 'vue';
import ParkingPopup from './ParkingPopup.vue';
import type { Parking } from '@/types/parking';

// Importer les images de marqueurs (à ajouter dans le dossier public)
// Fix pour l'icône de Leaflet qui n'est pas chargée par défaut
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

// Fix pour l'icône de Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

const props = defineProps({
  height: {
    type: String,
    default: '500px'
  },
  selectedParkingId: {
    type: String,
    default: ''
  }
});

// Référence à l'élément DOM de la carte
const mapRef = ref<HTMLElement | null>(null);
// Référence à l'instance de la carte Leaflet
const map = ref<L.Map | null>(null);
// Référence à la couche de marqueurs
const markersLayer = ref<L.LayerGroup | null>(null);
// Référence à la position utilisateur
const userLocationMarker = ref<L.Marker | null>(null);

// Utiliser le store Pinia
const parkingStore = useParkingStore();
const { sortedParkings, loading } = storeToRefs(parkingStore);

// Coordonnées par défaut (centre de Montpellier)
const defaultCenter: [number, number] = [43.610769, 3.876716];
const defaultZoom = 14;

// Initialiser la carte
function initMap() {
  if (!mapRef.value) return;
  
  // Créer la carte
  map.value = L.map(mapRef.value).setView(defaultCenter, defaultZoom);
  
  // Ajouter la couche OpenStreetMap en deux étapes
  const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });
  tileLayer.addTo(map.value as L.Map);
  
  // Créer la couche de marqueurs en deux étapes
  markersLayer.value = L.layerGroup();
  markersLayer.value.addTo(map.value as L.Map);
  
  // Récupérer la position de l'utilisateur
  getUserLocation();
}

// Nettoyer la carte lorsque le composant est démonté
function cleanupMap() {
  if (map.value) {
    map.value.remove();
    map.value = null;
  }
}

// Récupérer la position de l'utilisateur
function getUserLocation() {
  if (!map.value) return;
  
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (map.value) {
          const { latitude, longitude } = position.coords;
          
          // Supprimer le marqueur précédent s'il existe
          if (userLocationMarker.value) {
            userLocationMarker.value.remove();
          }
          
          // Créer un marqueur pour la position actuelle
          if (map.value) {
            // Centrer la carte sur la position
            map.value.setView([latitude, longitude], 15);
            
            // Créer une icône personnalisée pour le marqueur utilisateur
            const userIcon = L.divIcon({
              className: 'user-marker',
              html: `<div class="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-md"></div>`,
              iconSize: [20, 20],
              iconAnchor: [10, 10]
            });
            
            const newMarker = L.marker([latitude, longitude], { icon: userIcon });
            userLocationMarker.value = newMarker;
            newMarker.addTo(map.value as L.Map).bindPopup('Votre position');
          }
          
          // Mettre à jour les distances dans le store
          parkingStore.updateDistances(latitude, longitude);
        }
      },
      (error) => {
        console.error('Erreur de géolocalisation:', error);
      }
    );
  }
}

// Créer un marqueur pour un parking
function createParkingMarker(parking: Parking) {
  if (!map.value || !markersLayer.value) return;
  
  // Déterminer la couleur du marqueur en fonction du statut
  let color = 'green';
  const availableSpots = parking.availableSpotNumber?.value || 0;
  const totalSpots = parking.totalSpotNumber?.value || 0;
  
  // Vérification supplémentaire - si status n'existe pas ou n'est pas défini, traiter comme ouvert
  const isClosed = parking.status?.value === 'closed' || false;
  
  if (isClosed) {
    color = 'gray';
  } else if (totalSpots === 0) {
    color = 'gray';
  } else {
    const occupancyPercentage = Math.round(100 * (1 - availableSpots / totalSpots));
    if (occupancyPercentage >= 90) color = 'red';
    else if (occupancyPercentage >= 70) color = 'orange';
  }
  
  // Créer une icône personnalisée pour le marqueur
  const icon = L.divIcon({
    className: 'parking-marker',
    html: `<div class="w-6 h-6 rounded-full flex items-center justify-center text-white font-bold border-2 border-white shadow-md" style="background-color: ${color === 'green' ? '#10B981' : color === 'orange' ? '#F59E0B' : color === 'red' ? '#EF4444' : '#6B7280'}">P</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
  
  // Coordonnées du parking
  const coordinates = parking.location?.value?.coordinates || [];
  if (coordinates.length < 2) return;
  
  // Créer le marqueur et l'ajouter à la couche en deux étapes
  const marker = L.marker([coordinates[1], coordinates[0]], { icon });
  const layerGroup = markersLayer.value as L.LayerGroup;
  marker.addTo(layerGroup);
  
  // Créer un composant Vue pour le popup
  const popupContent = document.createElement('div');
  
  // Créer une nouvelle instance de l'application Vue avec le composant ParkingPopup
  const popupApp = createApp(ParkingPopup, { parking });
  popupApp.mount(popupContent);
  
  // Attacher le popup au marqueur
  marker.bindPopup(popupContent);
  
  // Ouvrir automatiquement le popup si c'est le parking sélectionné
  if (props.selectedParkingId && parking.id === props.selectedParkingId) {
    setTimeout(() => {
      marker.openPopup();
      map.value?.setView([coordinates[1], coordinates[0]], 16);
    }, 500);
  }
  
  return marker;
}

// Mettre à jour les marqueurs sur la carte
function updateMarkers() {
  if (!markersLayer.value) return;
  
  // Effacer tous les marqueurs existants
  markersLayer.value.clearLayers();
  
  // Ajouter les nouveaux marqueurs
  if (sortedParkings.value) {
    sortedParkings.value.forEach((parking: Parking) => {
      createParkingMarker(parking);
    });
  }
}

// Cycle de vie du composant
onMounted(() => {
  initMap();
  updateMarkers();
});

onUnmounted(() => {
  cleanupMap();
});

// Observer les changements des parkings filtrés
watch(sortedParkings, () => {
  updateMarkers();
}, { deep: true });

// Observer le selectedParkingId
watch(() => props.selectedParkingId, () => {
  updateMarkers();
});
</script>

<template>
  <div class="relative rounded-lg overflow-hidden shadow-md">
    <!-- Spinner de chargement -->
    <div v-if="loading" class="absolute top-0 left-0 w-full h-full z-10 flex items-center justify-center bg-white bg-opacity-50">
      <div class="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
    </div>
    
    <!-- Conteneur de la carte -->
    <div 
      ref="mapRef" 
      class="w-full"
      :style="{ height: props.height }"
    ></div>
  </div>
</template>

<style scoped>
/* Personnalisation des marqueurs de Leaflet */
:deep(.parking-marker) {
  display: flex;
  justify-content: center;
  align-items: center;
}

:deep(.user-marker) {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
