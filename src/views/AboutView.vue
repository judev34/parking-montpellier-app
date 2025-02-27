<script setup lang="ts">
import { useHead } from '@vueuse/head';

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
    <h1 class="text-3xl font-bold mb-6">À propos de Parkings Montpellier</h1>
    
    <section class="mb-8">
      <h2 class="text-2xl font-semibold mb-4">Notre mission</h2>
      <p class="mb-4">
        Bienvenue sur l'application Parkings Montpellier, votre solution pour trouver facilement des places de stationnement dans la ville de Montpellier. Notre application vous permet de consulter en temps réel la disponibilité des places dans les différents parkings de la ville.
      </p>
      <p class="mb-4">
        Grâce aux données ouvertes fournies par Montpellier Méditerranée Métropole, nous vous offrons une information fiable et actualisée pour vous aider à planifier vos déplacements et réduire le temps passé à chercher une place de stationnement.
      </p>
    </section>
    
    <section class="mb-8">
      <h2 class="text-2xl font-semibold mb-4">Fonctionnalités</h2>
      <ul class="list-disc pl-5 mb-4">
        <li class="mb-2">Visualisation en temps réel de la disponibilité des places dans les parkings</li>
        <li class="mb-2">Carte interactive pour localiser facilement les parkings</li>
        <li class="mb-2">Historique de fréquentation pour anticiper la disponibilité</li>
        <li class="mb-2">Interface simple et intuitive pour une utilisation rapide</li>
        <li class="mb-2">Mise à jour automatique des données toutes les 5 minutes</li>
      </ul>
    </section>
    
    <section class="mb-8">
      <h2 class="text-2xl font-semibold mb-4">Sources de données</h2>
      <p class="mb-4">
        Les données utilisées par notre application proviennent de l'API ouverte de Montpellier Méditerranée Métropole. Nous utilisons spécifiquement les endpoints suivants :
      </p>
      <ul class="list-disc pl-5 mb-4">
        <li class="mb-2"><code>/offstreetparking</code> pour les données en temps réel</li>
        <li class="mb-2"><code>/offstreetparking/timeseries</code> pour les données historiques (lorsque disponible)</li>
      </ul>
      <p class="mb-4">
        Pour plus d'informations sur les données ouvertes de Montpellier, vous pouvez consulter le <a href="https://data.montpellier3m.fr/" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">portail open data de Montpellier Méditerranée Métropole</a>.
      </p>
    </section>
    
    <section class="mb-8">
      <h2 class="text-2xl font-semibold mb-4">Contact</h2>
      <p class="mb-4">
        Pour toute question, suggestion ou signalement de problème, n'hésitez pas à nous contacter à l'adresse suivante : <a href="mailto:contact@votredomaine.com" class="text-blue-600 hover:underline">contact@votredomaine.com</a>
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
