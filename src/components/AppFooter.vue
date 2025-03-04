<script setup lang="ts">
import { RouterLink } from 'vue-router';
import DonateButton from './DonateButton.vue';
import config from '@/config/env';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

// Liens de donation depuis la configuration
const paypalDonationUrl = config.paypalDonationUrl;
const tipeeDonationUrl = config.tipeeDonationUrl;
</script>

<template>
  <footer class="bg-white py-8 mt-12 border-t border-gray-200">
    <div class="container mx-auto px-4">
      <div class="flex flex-col md:flex-row justify-between">
        <div class="mb-6 md:mb-0">
          <div class="flex items-center mb-3">
            <img src="/logos/montpell2.svg" alt="Logo Parkings Montpellier" class="h-14 mr-2">
          </div>
          <p class="text-gray-600 max-w-md">
            Application de suivi en temps réel des places disponibles dans les parkings de Montpellier. Données fournies par Montpellier Méditerranée Métropole.
          </p>
        </div>
        
        <div class="mb-6 md:mb-0">
          <h3 class="text-lg font-semibold mb-3" style="color: var(--metro-blue);">Liens rapides</h3>
          <ul class="space-y-2">
            <li>
              <RouterLink to="/" class="hover:underline" style="color: var(--metro-blue);">Accueil</RouterLink>
            </li>
            <li>
              <RouterLink to="/about" class="hover:underline" style="color: var(--metro-blue);">À propos</RouterLink>
            </li>
          </ul>
        </div>
        
        <div>
          <!-- <h3 class="text-lg font-semibold mb-3" style="color: var(--metro-blue);">Contact</h3>
          <p class="text-gray-600">
            Email: <a href="mailto:contact@votredomaine.com" class="hover:underline" style="color: var(--metro-blue);">contact@votredomaine.com</a>
          </p> -->
          <div class="mt-4">
            <h4 class="text-sm font-medium text-gray-700 mb-2">Soutenir le projet :</h4>
            <div class="flex items-center space-x-3">
              <a 
                :href="paypalDonationUrl" 
                target="_blank" 
                rel="noopener noreferrer" 
                class="bg-[#0079C1] hover:bg-[#005d96] text-white px-3 py-2 rounded flex items-center"
              >
                <FontAwesomeIcon :icon="['fab', 'paypal']" class="mr-2" />
                PayPal
              </a>
              <a 
                :href="tipeeDonationUrl" 
                target="_blank" 
                rel="noopener noreferrer" 
                class="bg-[#EC1651] hover:bg-[#d01447] text-white px-3 py-2 rounded flex items-center"
              >
                <img src="/icons/tipeee.svg" alt="Tipeee" class="h-4 w-4 mr-2" />
                Tipeee
              </a>
            </div>
          </div>
        </div>
      </div>
      
      <div class="border-t border-gray-300 mt-8 pt-6 text-center text-gray-500 text-sm">
        <p>&copy; {{ new Date().getFullYear() }} Parkings Montpellier. Tous droits réservés.</p>
        <p class="mt-2">
          Données fournies par <a href="https://data.montpellier3m.fr/" target="_blank" rel="noopener noreferrer" class="hover:underline" style="color: var(--metro-blue);">Montpellier Méditerranée Métropole</a>
        </p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
/* Styles pour le footer */
</style>
