/**
 * Returns today's date in YYYY-MM-DD format using the LOCAL timezone,
 * avoiding the UTC offset bug that toISOString() introduces.
 */
export const getTodayLocal = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Formats a date string (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss) as DD/MM/YYYY
 * without using Date object parsing, avoiding timezone conversion bugs.
 */
export const formatDate = (dateString) => {
  if (!dateString) return '—';
  const [year, month, day] = dateString.split('T')[0].split('-');
  return `${day}/${month}/${year}`;
};
