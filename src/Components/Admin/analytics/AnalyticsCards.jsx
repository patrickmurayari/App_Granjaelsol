import PropTypes from 'prop-types';
import { AlertCircle, Inbox } from 'lucide-react';

export const KpiCard = ({ icon: Icon, label, value, badge, accent }) => (
  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-5 break-inside-avoid">
    <div className="flex items-center justify-between mb-3">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${accent}`}>
        <Icon className="w-5 h-5" />
      </div>
      <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
        {badge}
      </span>
    </div>
    <p className="text-xs sm:text-sm font-semibold text-gray-500">{label}</p>
    <p className="text-lg sm:text-2xl font-extrabold text-gray-900 mt-0.5 break-words">{value}</p>
  </div>
);

KpiCard.propTypes = {
  icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  badge: PropTypes.string.isRequired,
  accent: PropTypes.string.isRequired,
};

export const KpiSkeleton = ({ count = 4 }) =>
  Array.from({ length: count }).map((_, i) => (
    <div key={i} className="h-32 rounded-2xl bg-gray-100 animate-pulse" />
  ));

KpiSkeleton.propTypes = { count: PropTypes.number };

export const ChartCard = ({ title, subtitle, loading, empty, children, className = '' }) => (
  <div className={`bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-5 break-inside-avoid ${className}`}>
    <div className="mb-3">
      <h3 className="font-extrabold text-gray-900 text-sm sm:text-base">{title}</h3>
      {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
    </div>
    {loading ? (
      <div className="h-72 rounded-xl bg-gray-100 animate-pulse" />
    ) : empty ? (
      <div className="h-72 flex flex-col items-center justify-center text-gray-400 text-sm font-semibold">
        <Inbox className="w-8 h-8 mb-2" />
        Sin datos para el período seleccionado
      </div>
    ) : (
      children
    )}
  </div>
);

ChartCard.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  loading: PropTypes.bool,
  empty: PropTypes.bool,
  children: PropTypes.node,
  className: PropTypes.string,
};

export const TooltipBox = ({ children }) => (
  <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-3 py-2 text-xs text-gray-800 space-y-0.5">{children}</div>
);

TooltipBox.propTypes = { children: PropTypes.node };

export const ErrorBanner = ({ message = 'No se pudieron cargar algunas estadísticas. Verificá la conexión e intentá nuevamente.' }) => (
  <div className="flex items-center gap-2 bg-red-50 border-2 border-red-200 rounded-xl px-4 py-3 text-sm font-bold text-red-800">
    <AlertCircle className="w-4 h-4" />
    {message}
  </div>
);

ErrorBanner.propTypes = { message: PropTypes.string };
