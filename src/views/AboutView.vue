<script setup lang="ts">
import { useHead } from '@vueuse/head';
import DonateButton from '@/components/DonateButton.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import config from '@/config/env';

// Liens de donation depuis la configuration
const paypalDonationUrl = config.paypalDonationUrl;
const tipeeDonationUrl = config.tipeeDonationUrl;

// Configurer l'email PayPal pour les dons
const paypalEmail = 'votre-email@exemple.com'; // Remplacez par votre email PayPal

// Définir les méta-tags pour la page À propos
useHead({
  title: 'À propos | Parkings Montpellier',
  meta: [
    {
      name: 'description',
      content: 'Découvrez notre application de suivi des parkings à Montpellier. Informations en temps réel sur la disponibilité des places de stationnement dans toute la ville.'
    },
    {
      name: 'keywords',
      content: 'parkings Montpellier, stationnement Montpellier, places disponibles, application parking, Montpellier'
    },
    {
      property: 'og:title',
      content: 'À propos | Parkings Montpellier'
    },
    {
      property: 'og:description',
      content: 'Application de suivi des parkings à Montpellier. Informations en temps réel sur la disponibilité des places de stationnement.'
    },
    {
      property: 'og:type',
      content: 'website'
    },
    {
      name: 'robots',
      content: 'index, follow'
    }
  ]
});
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6" style="color: var(--metro-blue);">À propos de Parkings Montpellier</h1>
    
    <section class="mb-8">
      <h2 class="text-2xl font-semibold mb-4" style="color: var(--metro-blue);">Notre mission</h2>
      <p class="mb-4">
        Bienvenue sur l'application Parkings Montpellier, votre solution pour trouver facilement des places de stationnement dans la ville de Montpellier. Notre application vous permet de consulter en temps réel la disponibilité des places dans les différents parkings de la ville.
      </p>
      <p class="mb-4">
        Grâce aux données ouvertes fournies par Montpellier Méditerranée Métropole, nous vous offrons une information fiable et actualisée pour vous aider à planifier vos déplacements et réduire le temps passé à chercher une place de stationnement.
      </p>
    </section>
    
    <section class="mb-8">
      <h2 class="text-2xl font-semibold mb-4" style="color: var(--metro-blue);">Fonctionnalités</h2>
      <ul class="list-disc pl-5 mb-4">
        <li class="mb-2">Visualisation en temps réel de la disponibilité des places dans les parkings</li>
        <li class="mb-2">Carte interactive pour localiser facilement les parkings</li>
        <li class="mb-2">Historique de fréquentation pour anticiper la disponibilité</li>
        <li class="mb-2">Interface simple et intuitive pour une utilisation rapide</li>
        <li class="mb-2">Mise à jour automatique des données toutes les 5 minutes</li>
      </ul>
    </section>
    
    <section class="mb-8" id="soutenez-le-projet">
      <h2 class="text-2xl font-semibold mb-4" style="color: var(--metro-blue);">Soutenez le projet</h2>
      <div class="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <div>
          <h3 class="text-xl font-semibold mb-3" style="color: var(--metro-blue);">Pourquoi faire un don ?</h3>
          <p class="mb-3">
            Cette application est entièrement gratuite et sans publicité. Votre soutien nous permet de :
          </p>
          <ul class="list-disc pl-5 mb-4">
            <li class="mb-1">Couvrir les frais d'hébergement et de maintenance</li>
            <li class="mb-1">Développer de nouvelles fonctionnalités</li>
            <li class="mb-1">Améliorer l'expérience utilisateur</li>
            <li class="mb-1">Garantir la pérennité du service</li>
          </ul>
          <p class="text-sm text-gray-600 mb-6">
            Même un petit don fait une grande différence ! Merci pour votre soutien.
          </p>
          
          <div class="flex flex-wrap items-center">
            <a 
              :href="paypalDonationUrl" 
              target="_blank" 
              rel="noopener noreferrer" 
              class="bg-[#0079C1] hover:bg-[#005d96] text-white px-4 py-2 rounded flex items-center mb-3 mr-4"
            >
              <FontAwesomeIcon :icon="['fab', 'paypal']" class="mr-2" />
              Donner via PayPal
            </a>
            <a 
              :href="tipeeDonationUrl" 
              target="_blank" 
              rel="noopener noreferrer" 
              class="bg-[#EC1651] hover:bg-[#d01447] text-white px-4 py-2 rounded flex items-center mb-3"
            >
              <img src="/icons/tipeee.svg" alt="Tipeee" class="h-4 w-4 mr-2" />
              Donner via Tipeee
            </a>
          </div>
        </div>
      </div>
    </section>
    
    <section class="mb-8">
      <h2 class="text-2xl font-semibold mb-4" style="color: var(--metro-blue);">Sources de données</h2>
      <p class="mb-4">
        Les données utilisées par notre application proviennent de l'API ouverte de Montpellier Méditerranée Métropole. Nous utilisons spécifiquement les endpoints suivants :
      </p>
      <ul class="list-disc pl-5 mb-4">
        <li class="mb-2"><code>/offstreetparking</code> pour les données en temps réel</li>
        <li class="mb-2"><code>/offstreetparking/timeseries</code> pour les données historiques (lorsque disponible)</li>
      </ul>
      <p class="mb-4">
        Pour plus d'informations sur les données ouvertes de Montpellier, vous pouvez consulter le <a href="https://data.montpellier3m.fr/" target="_blank" rel="noopener noreferrer" style="color: var(--metro-blue);" class="hover:underline">portail open data de Montpellier Méditerranée Métropole</a>.
      </p>
    </section>
    
    <section class="mb-8">
      <h2 class="text-2xl font-semibold mb-4" style="color: var(--metro-blue);">Contact</h2>
      <p class="mb-4">
        Pour toute question, suggestion ou signalement de problème, n'hésitez pas à nous contacter à l'adresse suivante : <a href="mailto:contact@votredomaine.com" style="color: var(--metro-blue);" class="hover:underline">contact@votredomaine.com</a>
      </p>
    </section>
  </div>
</template>

<style>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
  }
}
</style>
