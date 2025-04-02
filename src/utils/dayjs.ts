import dayjs from 'dayjs';
import 'dayjs/locale/fr'; // Import de la locale française
import weekOfYear from 'dayjs/plugin/weekOfYear'; // Pour obtenir le numéro de semaine
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'; // Pour les comparaisons de dates
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'; // Pour les comparaisons de dates
import customParseFormat from 'dayjs/plugin/customParseFormat'; // Pour parser des formats personnalisés
import utc from 'dayjs/plugin/utc'; // Pour gérer l'UTC
import timezone from 'dayjs/plugin/timezone'; // Pour gérer les fuseaux horaires

// Extension des plugins
dayjs.extend(weekOfYear);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

// Configuration de la locale par défaut
dayjs.locale('fr');

export default dayjs;
