import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

// Import des icônes solid
import { 
  faParking, 
  faCarSide, 
  faMapMarkerAlt, 
  faCalendarAlt, 
  faChartLine, 
  faInfoCircle,
  faArrowLeft,
  faBuilding,
  faRulerVertical,
  faLayerGroup,
  faClock,
  faSquareParking,
  faXmark
} from '@fortawesome/free-solid-svg-icons';

// Import des icônes brands
import { 
  faGoogle,
  faGooglePlusG,
  faWaze,
  faPaypal
} from '@fortawesome/free-brands-svg-icons';

// Ajout des icônes à la bibliothèque
library.add(
  // Solid icons
  faParking,
  faCarSide,
  faMapMarkerAlt,
  faCalendarAlt,
  faChartLine,
  faInfoCircle,
  faArrowLeft,
  faBuilding,
  faRulerVertical,
  faLayerGroup,
  faClock,
  faSquareParking,
  faXmark,
  
  // Brand icons
  faGoogle,
  faGooglePlusG,
  faWaze,
  faPaypal
);

// Export pour l'utilisation globale
export { FontAwesomeIcon };
