/**
 * Optimiza URLs de imágenes de Supabase Storage usando transformaciones nativas.
 * Reemplaza `/object/public/` por `/render/image/public/` y añade parámetros
 * de width, quality y format=webp para reducir drásticamente el peso transferido.
 *
 * Si la URL no es de Supabase Storage, la devuelve sin cambios.
 *
 * @param {string} url  - URL original de la imagen
 * @param {number} width - Ancho deseado en px (default 400)
 * @returns {string} URL optimizada
 */
export function getOptimizedImageUrl(url, width = 400) {
  if (!url || typeof url !== 'string') return url;

  // Solo transformar URLs de Supabase Storage
  if (!url.includes('/object/public/')) return url;

  const optimized = url.replace('/object/public/', '/render/image/public/');
  const separator = optimized.includes('?') ? '&' : '?';
  return `${optimized}${separator}width=${width}&quality=75&format=webp`;
}
