<script setup lang="ts">
import { RouterView, RouterLink } from 'vue-router';
import AppFooter from '@/components/AppFooter.vue';
import DonateBanner from '@/components/DonateBanner.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import config from '@/config/env';

// Lien de donation PayPal depuis la configuration
const paypalDonationUrl = config.paypalDonationUrl;
const tipeeDonationUrl = config.tipeeDonationUrl;
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <!-- Bannière de don occasionnelle -->
    <DonateBanner />
    
    <nav class="bg-white text-gray-800 shadow-md">
      <div class="container mx-auto px-4 py-2 flex flex-col md:flex-row justify-between items-center">
        <div class="flex items-center mb-3 md:mb-0">
          <RouterLink to="/" class="flex items-center justify-center">
            <img src="/logos/montpell2.svg" alt="Logo Parkings Montpellier" class="h-16 mr-2">
            <span class="text-sm text-gray-600">Alpha version 1.1</span>
          </RouterLink>
        </div>
        <div class="flex flex-wrap justify-center">
          <RouterLink to="/" class="px-4 py-2 mx-1 mb-2 md:mb-0 hover:text-[#ea5b0c] font-bold text-[#004494]">Accueil</RouterLink>
          <RouterLink to="/about" class="px-4 py-2 mx-1 mb-2 md:mb-0 hover:text-[#ea5b0c] font-bold text-[#004494]">À propos</RouterLink>
          <RouterLink 
            to="/about#soutenez-le-projet" 
            class="px-4 py-2 mx-1 mb-2 md:mb-0 hover:text-[#ea5b0c] font-bold text-[#004494]"
          >
            Faire un don
          </RouterLink>
        </div>
      </div>
    </nav>

    <main class="flex-grow">
      <RouterView />
    </main>
    
    <AppFooter />
  </div>
</template>

<style scoped>
nav {
  line-height: 1.5;
  max-height: 100vh;
}

nav .container {
  width: 100%;
  text-align: center;
}

nav a.router-link-exact-active {
  color: #ea5b0c;
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  border-radius: 4px;
  transition: all 0.3s ease;
}

nav a:hover {
  background-color: rgba(0, 68, 148, 0.05);
}

@media (max-width: 768px) {
  nav .container {
    padding: 0.75rem 1rem;
  }
  
  nav a {
    text-align: center;
    min-width: 100px;
  }
}

@media (min-width: 768px) {
  nav {
    text-align: left;
  }
}
</style>
