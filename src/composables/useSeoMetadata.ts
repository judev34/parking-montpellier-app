import { useHead } from '@vueuse/head';

export function useSeoMetadata() {
  const setSeoMetadata = (customTitle: string = '', customDescription: string = '') => {
    const defaultTitle = 'Parkings Montpellier - Disponibilité en temps réel';
    const defaultDescription = 'Trouvez facilement un parking disponible à Montpellier. Application affichant en temps réel les places disponibles dans les parkings de la ville.';
    
    const title = customTitle ? `${customTitle} | ${defaultTitle}` : defaultTitle;
    const description = customDescription || defaultDescription;
    
    useHead({
      title,
      meta: [
        {
          name: 'description',
          content: description
        },
        {
          name: 'keywords',
          content: 'parking, Montpellier, places disponibles, stationnement, temps réel, carte interactive'
        },
        {
          property: 'og:title',
          content: title
        },
        {
          property: 'og:description',
          content: description
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
  };

  return {
    setSeoMetadata
  };
}
