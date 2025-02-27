// Script pour générer dynamiquement le sitemap.xml
const fs = require('fs');
const axios = require('axios');
const dotenv = require('dotenv');

// Charger les variables d'environnement
dotenv.config();

const API_BASE_URL = process.env.VITE_API_BASE_URL || 'https://portail-api-data.montpellier3m.fr';
const DOMAIN = process.env.VITE_DOMAIN || 'https://votredomaine.com';

async function generateSitemap() {
  try {
    // Récupérer tous les parkings depuis l'API
    const response = await axios.get(`${API_BASE_URL}/offstreetparking?limit=1000`);
    
    if (!response.data || !Array.isArray(response.data)) {
      throw new Error('Format de réponse API inattendu');
    }
    
    // Créer le contenu XML du sitemap
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Page d'accueil -->
  <url>
    <loc>${DOMAIN}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- Page "À propos" -->
  <url>
    <loc>${DOMAIN}/about</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
    
    // Ajouter une entrée pour chaque parking
    response.data.forEach(parking => {
      const id = parking.id;
      if (id) {
        sitemap += `
  <url>
    <loc>${DOMAIN}/parking/${encodeURIComponent(id)}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.8</priority>
  </url>`;
      }
    });
    
    // Fermer le XML
    sitemap += `
</urlset>`;
    
    // Écrire le fichier
    fs.writeFileSync('./public/sitemap.xml', sitemap);
    console.log(`Sitemap généré avec ${response.data.length} parkings`);
  } catch (error) {
    console.error('Erreur lors de la génération du sitemap:', error);
  }
}

// Exécuter la fonction
generateSitemap();
