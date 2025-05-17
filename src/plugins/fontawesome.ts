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
  faXmark,
  faLocationDot,
  faPhone,
  faEuroSign,
  faWheelchair,
  faBookmark,
  faCreditCard,
  faChild,
  faChargingStation,
  faBicycle,
  faBus,
  faDroplet,
  faArrowsRotate,
  faList,
  faMapLocationDot
} from '@fortawesome/free-solid-svg-icons';

// Import des icônes brands
import { 
  faGoogle,
  faGooglePlusG,
  faWaze,
  faPaypal
} from '@fortawesome/free-brands-svg-icons';

// Import des icônes regular
import {
  faClock as faClockRegular
} from '@fortawesome/free-regular-svg-icons';

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
  faLocationDot,
  faPhone,
  faEuroSign,
  faWheelchair,
  faBookmark,
  faCreditCard,
  faChild,
  faChargingStation,
  faBicycle,
  faBus,
  faDroplet,
  faArrowsRotate,
  faList,
  faMapLocationDot,
  
  // Regular icons
  faClockRegular,
  
  // Brand icons
  faGoogle,
  faGooglePlusG,
  faWaze,
  faPaypal
);

// Export pour l'utilisation globale
export { FontAwesomeIcon };
