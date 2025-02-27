// SEO helpers pour l'application
import { useHead } from '@vueuse/head';
import type { Router } from 'vue-router';

// Configuration SEO globale
export function setupSEO(router: Router) {
  // Définir les méta-tags par défaut
  useHead({
    title: 'Parkings Montpellier - Disponibilité en temps réel',
    meta: [
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1.0'
      },
      {
        name: 'description',
        content: 'Trouvez facilement des places de stationnement à Montpellier. Application en temps réel pour consulter la disponibilité des parkings.'
      },
      {
        name: 'keywords',
        content: 'parking, Montpellier, stationnement, places disponibles, temps réel'
      },
      {
        name: 'author',
        content: 'Parkings Montpellier'
      },
      {
        property: 'og:type',
        content: 'website'
      },
      {
        property: 'og:site_name',
        content: 'Parkings Montpellier'
      },
      {
        name: 'twitter:card',
        content: 'summary_large_image'
      }
    ],
    link: [
      {
        rel: 'icon',
        href: '/favicon.ico'
      }
    ]
  });

  // Mettre à jour les méta-tags à chaque changement de route
  router.beforeEach((to, from, next) => {
    // Ajouter un délai pour permettre aux composants de charger
    setTimeout(() => {
      // Forcer la mise à jour des balises meta pour les moteurs de recherche
      const metaRobots = document.querySelector('meta[name="robots"]');
      if (metaRobots) {
        metaRobots.setAttribute('content', 'index, follow');
      } else {
        const meta = document.createElement('meta');
        meta.name = 'robots';
        meta.content = 'index, follow';
        document.head.appendChild(meta);
      }
    }, 100);
    
    next();
  });
}

// Fonction pour générer des méta-tags dynamiques pour les pages de détail
export function generateParkingMetaTags(parking: any) {
  if (!parking) return {};
  
  const parkingName = parking.name?.value || 'Parking';
  const availableSpots = parking.availableSpotNumber?.value || 0;
  const totalSpots = parking.totalSpotNumber?.value || 0;
  const occupancyPercentage = parking.occupancyPercentage || 0;
  
  return {
    title: `${parkingName} - ${availableSpots} places disponibles | Parkings Montpellier`,
    meta: [
      {
        name: 'description',
        content: `${parkingName} à Montpellier : ${availableSpots} places disponibles sur ${totalSpots} (${100-occupancyPercentage}% libre). Informations en temps réel, adresse et itinéraire.`
      },
      {
        name: 'keywords',
        content: `parking ${parkingName}, Montpellier, places disponibles, stationnement, ${parkingName}, itinéraire`
      },
      {
        property: 'og:title',
        content: `${parkingName} - ${availableSpots} places disponibles | Parkings Montpellier`
      },
      {
        property: 'og:description',
        content: `${parkingName} à Montpellier : ${availableSpots} places disponibles sur ${totalSpots}. Informations en temps réel, adresse et itinéraire.`
      },
      {
        name: 'robots',
        content: 'index, follow'
      }
    ]
  };
}
