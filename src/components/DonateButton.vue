<script setup lang="ts">
import { ref, watch } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

// Props pour personnaliser le bouton
const props = defineProps({
  buttonText: {
    type: String,
    default: 'Faire un don'
  },
  paypalEmail: {
    type: String,
    default: 'votre-email@exemple.com' // Remplacer par votre email PayPal
  },
  amounts: {
    type: Array,
    default: () => [5, 10, 20]
  },
  currency: {
    type: String,
    default: 'EUR'
  },
  showModal: {
    type: Boolean,
    default: false
  },
  hideButton: {
    type: Boolean,
    default: false
  }
});

// Émettre des événements
const emit = defineEmits(['close-modal']);

// État local pour gérer l'affichage du modal
const isModalOpen = ref(props.showModal);

// Observer les changements de la prop showModal
watch(() => props.showModal, (newValue) => {
  isModalOpen.value = newValue;
});

// Méthode pour ouvrir le modal
const openModal = () => {
  isModalOpen.value = true;
};

// Exposition de la méthode openModal pour l'accès externe
defineExpose({
  openModal
});

// Méthode pour fermer le modal
const closeModal = () => {
  isModalOpen.value = false;
  emit('close-modal');
};

// Méthode pour créer un lien PayPal avec un montant spécifique
const createPaypalLink = (amount: number) => {
  return `https://www.paypal.com/donate/?business=${encodeURIComponent(props.paypalEmail)}&amount=${amount}&currency_code=${props.currency}`;
};
</script>

<template>
  <div>
    <!-- Bouton pour ouvrir le modal -->
    <button 
      v-if="!props.hideButton && !isModalOpen"
      @click="openModal" 
      class="px-4 py-2 rounded-lg text-white transition-colors"
      style="background-color: var(--metro-blue);"
    >
      <div class="flex items-center">
        <FontAwesomeIcon :icon="['fab', 'paypal']" class="mr-2" />
        {{ buttonText }}
      </div>
    </button>
    
    <!-- Modal de donation -->
    <div v-if="isModalOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
        <!-- Bouton de fermeture -->
        <button 
          @click="closeModal" 
          class="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <FontAwesomeIcon :icon="['fas', 'xmark']" />
        </button>
        
        <!-- Contenu du modal -->
        <div class="text-center">
          <h3 class="text-xl font-semibold mb-4" style="color: var(--metro-blue);">Soutenez l'application Parkings Montpellier</h3>
          
          <p class="text-gray-600 mb-6">
            Votre contribution nous aide à maintenir et améliorer cette application gratuite. Merci pour votre soutien !
          </p>
          
          <!-- Options de montants -->
          <div class="grid grid-cols-3 gap-4 mb-6">
            <a 
              v-for="amount in amounts" 
              :key="amount"
              :href="createPaypalLink(amount)"
              target="_blank"
              rel="noopener noreferrer"
              class="px-4 py-3 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span class="font-semibold" style="color: var(--metro-blue);">{{ amount }}€</span>
            </a>
          </div>
          
          <!-- Lien pour montant personnalisé -->
          <a 
            :href="`https://www.paypal.com/donate/?business=${encodeURIComponent(props.paypalEmail)}&currency_code=${props.currency}`"
            target="_blank"
            rel="noopener noreferrer"
            class="text-sm hover:underline"
            style="color: var(--metro-blue);"
          >
            Choisir un autre montant
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Ajouter des animations pour le modal */
.fixed {
  animation: fadeIn 0.2s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
