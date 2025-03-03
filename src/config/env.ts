// Configuration des variables d'environnement

export const config = {
  // API
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'https://portail-api-data.montpellier3m.fr',
  domain: import.meta.env.VITE_DOMAIN || 'https://votredomaine.com',
  
  // Donations
  paypalDonationUrl: import.meta.env.VITE_PAYPAL_DONATION_URL || 'https://www.paypal.com/donate/?hosted_button_id=K9C2UJPKT99XW',
  tipeeDonationUrl: import.meta.env.VITE_TIPEEE_DONATION_URL || 'https://fr.tipeee.com/developpement-app-parkings-montpellier/',
};

export default config;
