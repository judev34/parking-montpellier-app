// Script de test pour l'API parking_timeseries
const API_BASE_URL = 'https://portail-api-data.montpellier3m.fr';

async function testApi() {
  const parkingId = 'urn:ngsi-ld:parking:001';
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - 1);
  const toDate = new Date();
  
  const url = `${API_BASE_URL}/parking_timeseries/${parkingId}/attrs/availableSpotNumber?fromDate=${fromDate.toISOString()}&toDate=${toDate.toISOString()}`;
  
  console.log(`URL de test: ${url}`);
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Afficher la structure complète de la réponse
    console.log('Structure de la réponse JSON:', JSON.stringify(data, null, 2).substring(0, 500) + '...');
    
    // Vérifier si values est présent et son type
    console.log('values existe:', 'values' in data);
    if ('values' in data) {
      console.log('Type de values:', Array.isArray(data.values) ? 'Array' : typeof data.values);
      console.log('Longueur de values:', Array.isArray(data.values) ? data.values.length : 'N/A');
      console.log('Premier élément de values:', Array.isArray(data.values) ? typeof data.values[0] : 'N/A');
    }
    
    // Vérifier tous les champs de premier niveau
    console.log('Champs de premier niveau:', Object.keys(data));
    
    // Vérifier la longueur de l'index
    console.log('Longueur de index:', data.index?.length || 'index non trouvé');
    
  } catch (error) {
    console.error('Erreur lors du test de l\'API:', error);
  }
}

// Exécuter le test
testApi();
