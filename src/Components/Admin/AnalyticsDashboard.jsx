import { useMemo, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import PropTypes from 'prop-types';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ComposedChart, Line, Cell, ReferenceLine,
} from 'recharts';
import {
  DollarSign, Scale, Beef, FileText, Printer, Loader2, AlertCircle, CalendarRange,
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp, BarChart3, Inbox, Truck, CreditCard, ArrowLeftRight,
} from 'lucide-react';
import { getTodayLocal } from '../../utils/dateUtils';
import { KpiCard, KpiSkeleton, ChartCard, TooltipBox, ErrorBanner } from './analytics/AnalyticsCards';
import FiservSection from './analytics/FiservSection';
import CashflowSection from './analytics/CashflowSection';
import {
  currencyShortFmt, numberFmt, decimalFmt, fmtMoney, fmtKg, fmtShortDate, fmtDate,
  PRIMARY, BAR_COLORS, PAGE_SIZE, shiftDays, fetchAnalytics,
} from './analytics/analyticsUtils';

const VIEWS = [
  { key: 'compras', label: 'Compras y Proveedores', icon: Truck, title: 'Reporte de Compras y Proveedores' },
  { key: 'fiserv', label: 'Cobranzas Digitales (Fiserv)', icon: CreditCard, title: 'Reporte de Cobranzas Digitales (Fiserv)' },
  { key: 'cashflow', label: 'Flujo de Caja (Caja vs. Compras)', icon: ArrowLeftRight, title: 'Reporte de Flujo de Caja (Posnet vs. Compras)' },
];

const PRESETS = [
  { key: '30d', label: 'Últimos 30 días', days: 30 },
  { key: '3m', label: 'Últimos 3 meses', days: 91 },
  { key: 'all', label: 'Histórico completo', days: null },
];

const isHalfCarcass = (producto) => {
  const p = String(producto || '');
  return /(1\/2\s*res|media)/i.test(p) && !/s\/\s*p|sin\s*pecho/i.test(p);
};

const SupplierTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <TooltipBox>
      <p className="font-extrabold text-gray-900">{d.name}</p>
      <p>Rubro: <b>{d.rubro || '—'}</b></p>
      <p>Total gastado: <b>{fmtMoney(d.total_gastado)}</b></p>
      <p>Kilos comprados: <b>{fmtKg(d.total_kilos)}</b></p>
      <p>Participación: <b>{decimalFmt.format(d.porcentaje)}%</b> (acum. {decimalFmt.format(d.porcentaje_acumulado)}%)</p>
    </TooltipBox>
  );
};

SupplierTooltip.propTypes = { active: PropTypes.bool, payload: PropTypes.array };

const WeeklyTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <TooltipBox>
      <p className="font-extrabold text-gray-900">Semana {fmtDate(d.semana_inicio)} – {fmtDate(d.semana_fin)}</p>
      <p>Inversión: <b>{fmtMoney(d.total_invertido)}</b></p>
      <p>Kilos: <b>{fmtKg(d.total_kilos)}</b></p>
      <p>Remitos: <b>{numberFmt.format(d.cantidad_remitos)}</b></p>
    </TooltipBox>
  );
};

WeeklyTooltip.propTypes = { active: PropTypes.bool, payload: PropTypes.array };

const WeightsTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <TooltipBox>
      <p className="font-extrabold text-gray-900">{fmtDate(d.fecha)}</p>
      <p>Peso promedio: <b>{fmtKg(d.promedio)}</b></p>
      <p>Rango: <b>{fmtKg(d.minimo)}</b> – <b>{fmtKg(d.maximo)}</b></p>
      <p>Piezas: <b>{numberFmt.format(d.piezas)}</b></p>
      <p>Precio/kg prom.: <b>{fmtMoney(d.precio_kg)}</b></p>
      <p className="text-gray-500">{d.productos.join(', ')}</p>
    </TooltipBox>
  );
};

WeightsTooltip.propTypes = { active: PropTypes.bool, payload: PropTypes.array };

const AnalyticsDashboard = () => {
  const today = getTodayLocal();
  const [preset, setPreset] = useState('3m');
  const [startDate, setStartDate] = useState(shiftDays(today, 91));
  const [endDate, setEndDate] = useState(today);
  const [page, setPage] = useState(0);
  const [tableOpen, setTableOpen] = useState(true);
  const [view, setView] = useState('compras');

  const rangeInvalid = Boolean(startDate && endDate && startDate > endDate);

  const params = useMemo(() => {
    const p = {};
    if (startDate) p.startDate = startDate;
    if (endDate) p.endDate = endDate;
    return p;
  }, [startDate, endDate]);

  const queryOpts = { enabled: !rangeInvalid && view === 'compras', placeholderData: keepPreviousData, staleTime: 60_000 };

  const weeklyQuery = useQuery({
    queryKey: ['analytics', 'weekly', params],
    queryFn: () => fetchAnalytics('weekly-purchases', params),
    ...queryOpts,
  });
  const shareQuery = useQuery({
    queryKey: ['analytics', 'share', params],
    queryFn: () => fetchAnalytics('suppliers-share', params),
    ...queryOpts,
  });
  const weightsQuery = useQuery({
    queryKey: ['analytics', 'weights', params],
    queryFn: () => fetchAnalytics('weights-distribution', { ...params, onlyKg: true }),
    ...queryOpts,
  });

  const applyPreset = (p) => {
    setPreset(p.key);
    setPage(0);
    if (p.days == null) {
      setStartDate('');
      setEndDate('');
    } else {
      setStartDate(shiftDays(today, p.days));
      setEndDate(today);
    }
  };

  const onCustomDate = (setter) => (e) => {
    setter(e.target.value);
    setPreset('custom');
    setPage(0);
  };

  const kpis = weeklyQuery.data?.kpis;
  const weeklyRows = useMemo(() => weeklyQuery.data?.data || [], [weeklyQuery.data]);
  const shareRows = shareQuery.data?.data || [];

  const weeklySeries = useMemo(() => {
    const map = new Map();
    weeklyRows.forEach((r) => {
      const prev = map.get(r.semana_inicio) || {
        semana_inicio: r.semana_inicio, semana_fin: r.semana_fin, total_invertido: 0, total_kilos: 0, cantidad_remitos: 0,
      };
      prev.total_invertido += r.total_invertido || 0;
      prev.total_kilos += r.total_kilos_pesados || 0;
      prev.cantidad_remitos += r.cantidad_remitos || 0;
      map.set(r.semana_inicio, prev);
    });
    return Array.from(map.values()).sort((a, b) => a.semana_inicio.localeCompare(b.semana_inicio));
  }, [weeklyRows]);

  const weightsSeries = useMemo(() => {
    const rows = (weightsQuery.data?.data || []).filter((r) => isHalfCarcass(r.producto));
    const map = new Map();
    rows.forEach((r) => {
      const prev = map.get(r.fecha_remito) || {
        fecha: r.fecha_remito, piezas: 0, kilos: 0, importe: 0, minimo: Infinity, maximo: -Infinity, productos: [],
      };
      prev.piezas += r.cantidad_piezas || 0;
      prev.kilos += r.kilos_totales_lote || 0;
      prev.importe += r.total_linea || 0;
      prev.minimo = Math.min(prev.minimo, r.peso_minimo_pieza ?? Infinity);
      prev.maximo = Math.max(prev.maximo, r.peso_maximo_pieza ?? -Infinity);
      if (!prev.productos.includes(r.producto)) prev.productos.push(r.producto);
      map.set(r.fecha_remito, prev);
    });
    return Array.from(map.values())
      .map((d) => ({
        ...d,
        promedio: d.piezas > 0 ? Math.round((d.kilos / d.piezas) * 100) / 100 : 0,
        precio_kg: d.kilos > 0 ? Math.round(d.importe / d.kilos) : 0,
        rango: [d.minimo, d.maximo],
      }))
      .sort((a, b) => a.fecha.localeCompare(b.fecha));
  }, [weightsQuery.data]);

  const weightsStats = useMemo(() => {
    const piezas = weightsSeries.reduce((s, d) => s + d.piezas, 0);
    const kilos = weightsSeries.reduce((s, d) => s + d.kilos, 0);
    return { promedio: piezas > 0 ? kilos / piezas : 0, piezas };
  }, [weightsSeries]);

  const totalPages = Math.max(1, Math.ceil(weeklyRows.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const pageRows = weeklyRows.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  const anyError = weeklyQuery.isError || shareQuery.isError || weightsQuery.isError;
  const periodLabel = startDate || endDate
    ? `${startDate ? fmtDate(startDate) : 'inicio'} al ${endDate ? fmtDate(endDate) : 'hoy'}`
    : 'Histórico completo';
  const activeView = VIEWS.find((v) => v.key === view) || VIEWS[0];

  return (
    <div id="analytics-report" className="space-y-5">
      {/* ── Encabezado de impresión ── */}
      <div className="hidden print:flex items-end justify-between border-b-2 border-gray-800 pb-2">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900">Granja El Sol — {activeView.title}</h1>
          <p className="text-xs text-gray-600">Período: {periodLabel}</p>
        </div>
        <p className="text-xs text-gray-600">Emitido: {fmtDate(today)}</p>
      </div>

      {/* ── Filtros y acciones ── */}
      <div className="print:hidden bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex flex-col lg:flex-row lg:items-end gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h2 className="font-extrabold text-gray-900">Estadísticas y Analítica</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => applyPreset(p)}
                className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold border-2 transition ${
                  preset === p.key ? 'bg-primary border-primary text-white' : 'bg-white border-gray-200 text-gray-700 hover:border-primary'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <label className="text-xs font-bold text-gray-600">
            Desde
            <input
              type="date"
              value={startDate}
              max={endDate || undefined}
              onChange={onCustomDate(setStartDate)}
              className="block mt-1 px-3 py-2 rounded-lg border-2 border-gray-200 focus:outline-none focus:border-primary text-sm text-gray-900 bg-white"
            />
          </label>
          <label className="text-xs font-bold text-gray-600">
            Hasta
            <input
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={onCustomDate(setEndDate)}
              className="block mt-1 px-3 py-2 rounded-lg border-2 border-gray-200 focus:outline-none focus:border-primary text-sm text-gray-900 bg-white"
            />
          </label>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900 text-white font-bold text-sm hover:bg-gray-700 transition"
          >
            <Printer className="w-4 h-4" />
            Imprimir Reporte / PDF
          </button>
        </div>
      </div>

      {rangeInvalid && (
        <div className="print:hidden flex items-center gap-2 bg-amber-50 border-2 border-amber-200 rounded-xl px-4 py-3 text-sm font-bold text-amber-900">
          <AlertCircle className="w-4 h-4" />
          La fecha &quot;Desde&quot; no puede ser posterior a &quot;Hasta&quot;.
        </div>
      )}

      {/* ── Selector de vista interna ── */}
      <div className="print:hidden flex gap-2 overflow-x-auto pb-1">
        {VIEWS.map((v) => {
          const Icon = v.icon;
          return (
            <button
              key={v.key}
              type="button"
              onClick={() => setView(v.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap border-2 transition ${
                view === v.key ? 'bg-gray-900 border-gray-900 text-white shadow-md' : 'bg-white border-gray-200 text-gray-700 hover:border-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              {v.label}
            </button>
          );
        })}
      </div>

      {view === 'fiserv' && <FiservSection params={params} enabled={!rangeInvalid} />}
      {view === 'cashflow' && <CashflowSection params={params} enabled={!rangeInvalid} />}

      {view === 'compras' && (
      <>
      {anyError && <ErrorBanner />}

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 print:grid-cols-4">
        {weeklyQuery.isLoading ? (
          <KpiSkeleton count={4} />
        ) : (
          <>
            <KpiCard icon={DollarSign} label="Inversión Total Acumulada" value={fmtMoney(kpis?.total_invertido_acumulado)} badge="Pesos" accent="bg-red-100 text-red-800" />
            <KpiCard icon={Scale} label="Kilos Totales Comprados" value={fmtKg(kpis?.total_kilos_acumulados)} badge="Pesaje" accent="bg-amber-100 text-amber-800" />
            <KpiCard icon={Beef} label="Piezas / Medias Reses Descolgadas" value={`${numberFmt.format(kpis?.total_piezas_acumuladas || 0)} piezas`} badge="Piezas" accent="bg-green-100 text-green-800" />
            <KpiCard icon={FileText} label="Remitos Procesados" value={`${numberFmt.format(kpis?.total_remitos_acumulados || 0)} remitos`} badge="Remitos" accent="bg-blue-100 text-blue-800" />
          </>
        )}
      </div>

      {/* ── Gráficos ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 print:grid-cols-1">
        <ChartCard
          title="Concentración de Proveedores"
          subtitle="Participación de cada proveedor sobre la inversión total (Pareto)"
          loading={shareQuery.isLoading}
          empty={shareRows.length === 0}
        >
          <ResponsiveContainer width="100%" height={Math.max(288, shareRows.length * 34)}>
            <BarChart data={shareRows} layout="vertical" margin={{ top: 4, right: 40, left: 8, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11 }} />
              <Tooltip content={<SupplierTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
              <Bar
                dataKey="porcentaje"
                radius={[0, 6, 6, 0]}
                isAnimationActive={false}
                label={{ position: 'right', fontSize: 11, formatter: (v) => `${decimalFmt.format(v)}%` }}
              >
                {shareRows.map((r, i) => (
                  <Cell key={r.name} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Evolución Semanal de Compras"
          subtitle="Inversión en pesos (barras) y kilos comprados (línea) por semana"
          loading={weeklyQuery.isLoading}
          empty={weeklySeries.length === 0}
        >
          <ResponsiveContainer width="100%" height={288}>
            <ComposedChart data={weeklySeries} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="semana_inicio" tickFormatter={fmtShortDate} tick={{ fontSize: 11 }} minTickGap={12} />
              <YAxis yAxisId="money" tickFormatter={(v) => currencyShortFmt.format(v)} tick={{ fontSize: 11 }} width={70} />
              <YAxis yAxisId="kg" orientation="right" tickFormatter={(v) => `${numberFmt.format(v)} kg`} tick={{ fontSize: 11 }} width={64} />
              <Tooltip content={<WeeklyTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar yAxisId="money" dataKey="total_invertido" name="Inversión ($)" fill={PRIMARY} radius={[4, 4, 0, 0]} isAnimationActive={false} />
              <Line yAxisId="kg" type="monotone" dataKey="total_kilos" name="Kilos" stroke="#b45309" strokeWidth={2} dot={{ r: 2 }} isAnimationActive={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          className="lg:col-span-2 print:col-span-1"
          title="Control de Calidad de Medias Reses"
          subtitle={`Peso promedio por media res (línea) y rango mínimo–máximo por fecha de remito (barras). Promedio del período: ${fmtKg(weightsStats.promedio)} sobre ${numberFmt.format(weightsStats.piezas)} piezas.`}
          loading={weightsQuery.isLoading}
          empty={weightsSeries.length === 0}
        >
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={weightsSeries} margin={{ top: 8, right: 8, left: 8, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="fecha" tickFormatter={fmtShortDate} tick={{ fontSize: 11 }} minTickGap={12} />
              <YAxis domain={['dataMin - 10', 'dataMax + 10']} tickFormatter={(v) => `${numberFmt.format(Math.round(v))} kg`} tick={{ fontSize: 11 }} width={64} />
              <Tooltip content={<WeightsTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {weightsStats.promedio > 0 && (
                <ReferenceLine y={weightsStats.promedio} stroke="#6b7280" strokeDasharray="5 5" label={{ value: 'Prom. período', fontSize: 10, fill: '#6b7280', position: 'insideTopRight' }} />
              )}
              <Bar dataKey="rango" name="Rango mín–máx" fill="#fca5a5" barSize={14} radius={[4, 4, 4, 4]} isAnimationActive={false} />
              <Line type="monotone" dataKey="promedio" name="Peso promedio" stroke={PRIMARY} strokeWidth={2.5} dot={{ r: 3 }} isAnimationActive={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ── Tabla de auditoría ── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <button
          type="button"
          onClick={() => setTableOpen((o) => !o)}
          className="w-full flex items-center justify-between px-4 sm:px-5 py-4 text-left print:pointer-events-none"
        >
          <div className="flex items-center gap-2">
            <CalendarRange className="w-5 h-5 text-primary" />
            <h3 className="font-extrabold text-gray-900 text-sm sm:text-base">Detalle Semanal por Proveedor</h3>
            <span className="text-xs font-bold text-gray-500">({numberFmt.format(weeklyRows.length)} registros)</span>
          </div>
          <span className="print:hidden text-gray-500">
            {tableOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </span>
        </button>

        <div className={tableOpen ? '' : 'hidden print:block'}>
          {weeklyQuery.isLoading ? (
            <div className="flex items-center justify-center py-12 text-gray-500">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : weeklyRows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400 text-sm font-semibold">
              <Inbox className="w-8 h-8 mb-2" />
              No hay compras registradas para el período seleccionado.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-xs sm:text-sm">
                  <thead className="bg-gray-50 text-gray-700">
                    <tr className="text-left">
                      <th className="py-2.5 px-3 font-bold">Semana</th>
                      <th className="py-2.5 px-3 font-bold">Proveedor</th>
                      <th className="py-2.5 px-3 font-bold">Rubro</th>
                      <th className="py-2.5 px-3 font-bold text-right">Remitos</th>
                      <th className="py-2.5 px-3 font-bold text-right">Piezas</th>
                      <th className="py-2.5 px-3 font-bold text-right">Kilos Totales</th>
                      <th className="py-2.5 px-3 font-bold text-right">Importe Total</th>
                    </tr>
                  </thead>
                  {[{ rows: pageRows, cls: 'print:hidden' }, { rows: weeklyRows, cls: 'hidden print:table-row-group' }].map(({ rows, cls }) => (
                    <tbody key={cls} className={cls}>
                      {rows.map((r) => (
                        <tr key={`${r.semana_inicio}-${r.supplier_id}`} className="border-t border-gray-100 text-gray-800 break-inside-avoid">
                          <td className="py-2 px-3 whitespace-nowrap">{fmtShortDate(r.semana_inicio)} – {fmtDate(r.semana_fin)}</td>
                          <td className="py-2 px-3 font-semibold text-gray-900">{r.proveedor}</td>
                          <td className="py-2 px-3 text-gray-600">{r.rubro_proveedor || '—'}</td>
                          <td className="py-2 px-3 text-right">{numberFmt.format(r.cantidad_remitos || 0)}</td>
                          <td className="py-2 px-3 text-right">{numberFmt.format(r.total_piezas_pesadas || 0)}</td>
                          <td className="py-2 px-3 text-right">{fmtKg(r.total_kilos_pesados)}</td>
                          <td className="py-2 px-3 text-right font-bold text-gray-900">{fmtMoney(r.total_invertido)}</td>
                        </tr>
                      ))}
                    </tbody>
                  ))}
                </table>
              </div>

              {totalPages > 1 && (
                <div className="print:hidden flex items-center justify-between px-4 py-3 border-t border-gray-100 text-sm">
                  <span className="text-gray-500 font-semibold">
                    Página {safePage + 1} de {totalPages}
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      disabled={safePage === 0}
                      className="p-2 rounded-lg border border-gray-200 text-gray-700 hover:border-primary disabled:opacity-40 disabled:cursor-not-allowed"
                      aria-label="Página anterior"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                      disabled={safePage >= totalPages - 1}
                      className="p-2 rounded-lg border border-gray-200 text-gray-700 hover:border-primary disabled:opacity-40 disabled:cursor-not-allowed"
                      aria-label="Página siguiente"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      </>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
