<script setup lang="ts">
import { ref, computed } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import config from '@/config/env';

// Props pour personnaliser le bouton
const props = defineProps({
  buttonText: {
    type: String,
    default: 'Faire un don'
  },
  hideButton: {
    type: Boolean,
    default: false
  },
  platform: {
    type: String,
    default: 'paypal', // 'paypal' ou 'tipeee'
    validator: (value: string) => ['paypal', 'tipeee'].includes(value)
  }
});

// Liens de donation depuis la configuration
const paypalDonationUrl = config.paypalDonationUrl;
const tipeeDonationUrl = config.tipeeDonationUrl;

// Déterminer l'URL en fonction de la plateforme
const donationUrl = computed(() => {
  return props.platform === 'paypal' ? paypalDonationUrl : tipeeDonationUrl;
});
</script>

<template>
  <div>
    <!-- Bouton pour rediriger vers la plateforme de don -->
    <a
      v-if="!props.hideButton"
      :href="donationUrl"
      target="_blank"
      rel="noopener noreferrer"
      class="px-4 py-2 rounded-lg text-white transition-colors"
      :style="props.platform === 'paypal' ? 'background-color: #0079C1;' : 'background-color: #EC1651;'"
    >
      <div class="flex items-center">
        <FontAwesomeIcon v-if="props.platform === 'paypal'" :icon="['fab', 'paypal']" class="mr-2" />
        <img v-else src="/icons/tipeee.svg" alt="Tipeee" class="h-4 mr-2" />
        {{ props.buttonText }}
      </div>
    </a>
  </div>
</template>

<style scoped>
/* Styles pour le bouton */
</style>
