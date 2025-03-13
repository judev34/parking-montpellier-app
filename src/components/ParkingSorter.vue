<template>
  <div class="relative">
    <button 
      @click="toggleDropdown"
      class="p-2 rounded-lg border border-gray-300 text-gray-700 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-opacity-50"
      style="--focus-ring-color: var(--metro-blue);"
      aria-label="Trier les parkings"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        class="h-5 w-5" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path 
          stroke-linecap="round" 
          stroke-linejoin="round" 
          stroke-width="2" 
          d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" 
        />
      </svg>
    </button>
    
    <!-- Dropdown menu -->
    <div 
      v-if="showDropdown" 
      class="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-20 overflow-hidden"
    >
      <div class="py-1">
        <button 
          v-for="option in sortOptions" 
          :key="option.value"
          @click="selectSortOption(option.value)"
          class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center justify-between"
          :class="{ 'font-semibold': currentSort === option.value }"
        >
          <span>{{ option.label }}</span>
          <svg 
            v-if="currentSort === option.value" 
            xmlns="http://www.w3.org/2000/svg" 
            class="h-4 w-4" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
            style="color: var(--metro-blue);"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useParkingStore } from '@/stores/parking';

const parkingStore = useParkingStore();

// Options de tri disponibles
const sortOptions = [
  { label: 'Par défaut (Distance)', value: 'default' },
  { label: 'Plus occupé', value: 'availability-asc' },
  { label: 'Moins occupé', value: 'availability-desc' },
  // { label: 'Capacité (croissant)', value: 'capacity-asc' },
  // { label: 'Capacité (décroissant)', value: 'capacity-desc' }
];

const showDropdown = ref(false);
const currentSort = ref('default');

// Fonction pour basculer l'affichage du dropdown
function toggleDropdown() {
  showDropdown.value = !showDropdown.value;
}

// Fonction pour sélectionner une option de tri
function selectSortOption(sortValue: string) {
  currentSort.value = sortValue;
  parkingStore.setSortOption(sortValue);
  showDropdown.value = false;
}

// Fermer le dropdown si on clique ailleurs sur la page
function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement;
  if (!target.closest('.relative')) {
    showDropdown.value = false;
  }
}

// Ajouter et supprimer l'écouteur d'événement pour les clics en dehors du dropdown
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>
