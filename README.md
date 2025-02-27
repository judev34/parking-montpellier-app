# Parkings Montpellier - Application en temps réel

Cette application web, développée avec Vue.js 3, permet de consulter en temps réel la disponibilité des places dans les parkings de Montpellier. Elle utilise l'API publique de Montpellier Méditerranée Métropole pour récupérer les données des parkings.

## Fonctionnalités

- **Carte interactive** affichant tous les parkings de Montpellier
- **Vue liste** des parkings avec leurs informations essentielles
- **Actualisation automatique** des données toutes les 2 minutes
- **Historique d'occupation** pour chaque parking
- **Filtres** par disponibilité et distance
- **Design responsive** pour mobile et desktop

## Technologies utilisées

- **Vue.js 3** avec l'API Composition
- **Pinia** pour la gestion d'état
- **Vue Router** pour la navigation
- **Axios** pour les appels API
- **Leaflet** pour la carte interactive
- **Chart.js** pour les graphiques d'historique
- **Tailwind CSS** pour le styling

## Installation et démarrage

```sh
# Installation des dépendances
npm install

# Lancement du serveur de développement
npm run dev

# Compilation pour la production
npm run build
```

## Structure du projet

```
src/
├── assets/              # Ressources statiques
├── components/          # Composants réutilisables
│   ├── ParkingCard.vue  # Carte d'un parking
│   ├── ParkingMap.vue   # Carte des parkings
│   ├── ParkingFilters.vue # Filtres 
│   └── ParkingHistory.vue # Historique d'un parking
├── router/              # Configuration des routes
├── services/            # Services (API, etc.)
├── stores/              # Stores Pinia
├── types/               # Types TypeScript
└── views/               # Pages de l'application
    ├── HomeView.vue     # Page d'accueil
    └── ParkingDetailView.vue # Détail d'un parking
```

## API utilisée

Cette application utilise l'API Open Data de Montpellier Méditerranée Métropole:
- Base URL: `https://portail-api-data.montpellier3m.fr`
- Endpoints:
  - `/parkingspaces` : Liste des parkings
  - `/parking_timeseries/{parkingId}/attrs/availableSpotNumber` : Historique d'un parking

## Contribuer

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou à proposer une pull request.

## Licence

Ce projet est sous licence MIT.
