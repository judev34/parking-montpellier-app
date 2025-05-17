import { ref, watch, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useParkingStore } from '@/stores/parking';

export function useSearch() {
  const parkingStore = useParkingStore();
  const { filters } = storeToRefs(parkingStore);
  const searchInput = ref('');
  let searchTimeout: ReturnType<typeof setTimeout> | null = null;

  // Initialiser avec la valeur du store
  onMounted(() => {
    searchInput.value = filters.value.searchQuery || '';
  });

  const handleSearch = (event: Event) => {
    const value = (event.target as HTMLInputElement).value;
    
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    searchTimeout = setTimeout(() => {
      if (filters.value) {
        parkingStore.setFilters({ searchQuery: value });
      }
    }, 300);
  };

  // Synchroniser la valeur du store avec le champ de recherche
  watch(() => filters.value?.searchQuery, (newQuery) => {
    if (newQuery !== undefined && newQuery !== searchInput.value) {
      searchInput.value = newQuery;
    }
  }, { immediate: true });

  return {
    searchInput,
    handleSearch
  };
}
