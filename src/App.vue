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
      <div class="container mx-auto px-2 flex justify-between items-center">
        <div class="flex items-center">
          <RouterLink to="/" class="flex items-center">
            <img src="/logos/montpell2.svg" alt="Logo Parkings Montpellier" class="h-16 mr-2">
            <span class="text-sm text-gray-600">version 1.0</span>
          </RouterLink>
        </div>
        <div class="flex">
          <RouterLink to="/" class="px-3 py-2 hover:text-[#ea5b0c] font-bold text-[#004494]">Accueil</RouterLink>
          <RouterLink to="/about" class="px-3 py-2 hover:text-[#ea5b0c] font-bold text-[#004494]">À propos</RouterLink>
          <RouterLink 
            to="/about#soutenez-le-projet" 
            class="px-3 py-2 hover:text-[#ea5b0c] font-bold text-[#004494]"
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
  font-size: 12px;
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
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  nav {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  nav .container {
    display: flex;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>
