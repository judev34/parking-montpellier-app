<script setup lang="ts">
import { RouterLink } from 'vue-router';
</script>

<template>
  <footer class="bg-gray-100 py-8 mt-12">
    <div class="container mx-auto px-4">
      <div class="flex flex-col md:flex-row justify-between">
        <div class="mb-6 md:mb-0">
          <h3 class="text-lg font-semibold mb-3">Parkings Montpellier</h3>
          <p class="text-gray-600 max-w-md">
            Application de suivi en temps réel des places disponibles dans les parkings de Montpellier. Données fournies par Montpellier Méditerranée Métropole.
          </p>
        </div>
        
        <div class="mb-6 md:mb-0">
          <h3 class="text-lg font-semibold mb-3">Liens rapides</h3>
          <ul class="space-y-2">
            <li>
              <RouterLink to="/" class="text-blue-600 hover:underline">Accueil</RouterLink>
            </li>
            <li>
              <RouterLink to="/about" class="text-blue-600 hover:underline">À propos</RouterLink>
            </li>
          </ul>
        </div>
        
        <div>
          <h3 class="text-lg font-semibold mb-3">Contact</h3>
          <p class="text-gray-600">
            Email: <a href="mailto:contact@votredomaine.com" class="text-blue-600 hover:underline">contact@votredomaine.com</a>
          </p>
        </div>
      </div>
      
      <div class="border-t border-gray-300 mt-8 pt-6 text-center text-gray-500 text-sm">
        <p>© {{ new Date().getFullYear() }} Parkings Montpellier. Tous droits réservés.</p>
        <p class="mt-2">
          Données fournies par <a href="https://data.montpellier3m.fr/" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">Montpellier Méditerranée Métropole</a>
        </p>
      </div>
    </div>
  </footer>
</template>
