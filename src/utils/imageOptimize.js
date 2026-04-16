/**
 * Devuelve la URL original de la imagen sin transformaciones.
 * Las transformaciones de Supabase Storage requieren plan Pro (no activo).
 *
 * @param {string} url  - URL original de la imagen
 * @param {number} _width - Ancho deseado (ignorado, mantiene compatibilidad)
 * @returns {string} URL original sin cambios
 */
export function getOptimizedImageUrl(url) {
  return url;
}
