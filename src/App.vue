<script setup lang="ts">
import { RouterView } from 'vue-router';
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <nav class="bg-blue-600 text-white shadow-md">
      <div class="container mx-auto px-4 py-3 flex justify-between items-center">
        <div class="flex items-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3"/>
          </svg>
          <h1 class="text-xl font-bold">Parkings Montpellier</h1>
        </div>
        <div class="text-sm">
          <span>Données fournies par Montpellier Méditerranée Métropole</span>
        </div>
      </div>
    </nav>

    <RouterView />

    <footer class="mt-12 py-6 bg-gray-800 text-white">
      <div class="container mx-auto px-4">
        <div class="flex flex-col md:flex-row justify-between items-center">
          <div class="mb-4 md:mb-0">
            <h3 class="text-lg font-semibold">Parkings Montpellier</h3>
            <p class="text-sm text-gray-400">Application en temps réel de suivi des parkings</p>
          </div>
          <div class="text-sm text-gray-400">
            <p> 2025 - Données fournies par l'API Open Data de Montpellier</p>
            <p>
              <a href="https://data.montpellier3m.fr/" class="text-blue-300 hover:text-blue-200 underline" target="_blank">
                Portail Open Data
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
nav {
  line-height: 1.5;
  max-height: 100vh;
}

nav svg {
  display: block;
  margin: 0 auto 2rem;
}

nav .container {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
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

  nav svg {
    margin: 0 2rem 0 0;
  }

  nav .container {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
  }
}
</style>
