<script setup lang="ts">
import { RouterView } from 'vue-router';
import AppFooter from '@/components/AppFooter.vue';
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <nav class="bg-white text-gray-800 shadow-md">
      <div class="container mx-auto px-2 flex justify-between items-center">
        <div class="flex items-center">
          <img src="/logos/metro_largeur_RVB.jpg" alt="Logo Montpellier Méditerranée Métropole" class="h-14 mr-4">
          <h1 class="text-xl font-bold" style="color: var(--metro-blue);">Parkings</h1>
        </div>
        <div class="flex">
          <router-link to="/" class="hover:text-metro-blue">Accueil</router-link>
          <router-link to="/about" class="hover:text-metro-blue">À propos</router-link>
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

  nav .container {
    display: flex;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
  }
}

/* Couleurs personnalisées pour TailwindCSS */
.text-metro-blue {
  color: var(--metro-blue);
}
.bg-metro-blue {
  background-color: var(--metro-blue);
}
.hover\:text-metro-blue:hover {
  color: var(--metro-blue);
}
</style>
