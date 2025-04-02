import dayjs from './dayjs';

/**
 * Formate une date au format français (JJ/MM/AAAA)
 * @param date Date à formater
 * @returns Date formatée
 */
export function formatDate(date: Date | string): string {
  return dayjs(date).format('DD/MM/YYYY');
}

/**
 * Obtient la date de début et de fin de la semaine en cours
 * @returns Objet contenant les dates de début et fin de semaine
 */
export function getCurrentWeekRange() {
  const now = dayjs();
  const startOfWeek = now.startOf('week');
  const endOfWeek = now.endOf('week');
  
  return {
    start: formatDate(startOfWeek.toDate()),
    end: formatDate(endOfWeek.toDate())
  };
}

/**
 * Obtient la date de début et de fin de la même semaine mais de l'année précédente
 * @returns Objet contenant les dates de début et fin de semaine de l'année précédente
 */
export function getPreviousYearSameWeekRange() {
  const now = dayjs();
  const lastYear = now.subtract(1, 'year');
  
  // Même semaine que maintenant mais année précédente
  const weekNumber = now.week();
  const lastYearSameWeek = lastYear.week(weekNumber);
  
  const startOfWeek = lastYearSameWeek.startOf('week');
  const endOfWeek = lastYearSameWeek.endOf('week');
  
  return {
    start: formatDate(startOfWeek.toDate()),
    end: formatDate(endOfWeek.toDate())
  };
}

/**
 * Ajoute ou soustrait des jours à une date
 * @param date Date de départ
 * @param days Nombre de jours à ajouter (positif) ou soustraire (négatif)
 * @returns Nouvelle date
 */
export function addDays(date: Date | string, days: number): Date {
  return dayjs(date).add(days, 'day').toDate();
}

/**
 * Vérifie si deux dates sont le même jour
 * @param date1 Première date
 * @param date2 Seconde date
 * @returns true si les dates sont le même jour
 */
export function isSameDay(date1: Date | string, date2: Date | string): boolean {
  return dayjs(date1).isSame(dayjs(date2), 'day');
}
