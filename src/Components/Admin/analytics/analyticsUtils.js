import api from '../../../api/api';

const currencyFmt = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' });
export const currencyShortFmt = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', notation: 'compact', maximumFractionDigits: 1 });
export const numberFmt = new Intl.NumberFormat('es-AR');
export const decimalFmt = new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const fmtMoney = (n) => currencyFmt.format(Number(n) || 0);
export const fmtKg = (n) => `${decimalFmt.format(Number(n) || 0)} kg`;
export const fmtPct = (n) => `${decimalFmt.format(Number(n) || 0)}%`;
export const fmtShortDate = (iso) => (iso ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}` : '');
export const fmtDate = (iso) => (iso ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}` : '—');

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
export const fmtMonth = (period) => {
  if (!period) return '';
  const [y, m] = period.split('-');
  return `${MONTHS[Number(m) - 1] || m} ${y}`;
};

export const PRIMARY = '#8B0000';
export const BAR_COLORS = ['#8B0000', '#b45309', '#15803d', '#1d4ed8', '#7c3aed', '#0f766e', '#be185d', '#4b5563'];
export const PAGE_SIZE = 10;

export const shiftDays = (isoDate, days) => {
  const [y, m, d] = isoDate.split('-').map(Number);
  const dt = new Date(y, m - 1, d - days);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
};

export const fetchAnalytics = async (path, params) => {
  const { data } = await api.get(`/analytics/${path}`, { params });
  return data;
};
