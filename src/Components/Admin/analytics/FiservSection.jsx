import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import {
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import { CreditCard, Landmark, Percent, Layers, CalendarRange, Inbox, Loader2 } from 'lucide-react';
import { KpiCard, KpiSkeleton, ChartCard, TooltipBox, ErrorBanner } from './AnalyticsCards';
import {
  fetchAnalytics, fmtMoney, fmtPct, fmtMonth, numberFmt, currencyShortFmt, BAR_COLORS,
} from './analyticsUtils';

const PaymentTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <TooltipBox>
      <p className="font-extrabold text-gray-900">{d.card_type}</p>
      <p>Operaciones: <b>{numberFmt.format(d.operaciones)}</b></p>
      <p>Total bruto: <b>{fmtMoney(d.total_bruto)}</b></p>
      <p>Participación: <b>{fmtPct(d.participacion_porcentaje)}</b></p>
    </TooltipBox>
  );
};

PaymentTooltip.propTypes = { active: PropTypes.bool, payload: PropTypes.array };

const MonthlyTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <TooltipBox>
      <p className="font-extrabold text-gray-900">{fmtMonth(d.mes_periodo)}</p>
      <p>Bruto: <b>{fmtMoney(d.total_bruto)}</b></p>
      <p>Neto cobrado: <b>{fmtMoney(d.total_neto_cobrado)}</b></p>
      <p>Descuentos: <b>{fmtMoney(d.total_descuentos)}</b> ({fmtPct(d.porcentaje_descuentos)})</p>
      <p>Liquidaciones: <b>{numberFmt.format(d.cantidad_liquidaciones)}</b></p>
    </TooltipBox>
  );
};

MonthlyTooltip.propTypes = { active: PropTypes.bool, payload: PropTypes.array };

const FiservSection = ({ params, enabled }) => {
  const queryOpts = { enabled, placeholderData: keepPreviousData, staleTime: 60_000 };

  const monthlyQuery = useQuery({
    queryKey: ['analytics', 'fiserv-monthly', params],
    queryFn: () => fetchAnalytics('fiserv-monthly', params),
    ...queryOpts,
  });
  const methodsQuery = useQuery({
    queryKey: ['analytics', 'fiserv-payment-methods'],
    queryFn: () => fetchAnalytics('fiserv-payment-methods'),
    ...queryOpts,
  });

  const kpis = monthlyQuery.data?.kpis;
  const methods = methodsQuery.data?.data || [];
  const monthlyAsc = useMemo(
    () => [...(monthlyQuery.data?.data || [])].sort((a, b) => a.mes.localeCompare(b.mes)),
    [monthlyQuery.data]
  );

  return (
    <div className="space-y-5">
      {(monthlyQuery.isError || methodsQuery.isError) && <ErrorBanner />}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 print:grid-cols-4">
        {monthlyQuery.isLoading ? (
          <KpiSkeleton count={4} />
        ) : (
          <>
            <KpiCard icon={CreditCard} label="Total Bruto Ventas Tarjeta" value={fmtMoney(kpis?.total_bruto_acumulado)} badge="Bruto" accent="bg-blue-100 text-blue-800" />
            <KpiCard icon={Landmark} label="Neto Depositado en Banco" value={fmtMoney(kpis?.total_neto_acumulado)} badge="Acreditado" accent="bg-green-100 text-green-800" />
            <KpiCard icon={Percent} label="Retenciones y Descuentos" value={fmtMoney(kpis?.total_descuentos_acumulado)} badge={`Tasa ${fmtPct(kpis?.porcentaje_descuento_promedio)}`} accent="bg-red-100 text-red-800" />
            <KpiCard icon={Layers} label="Liquidaciones Procesadas" value={`${numberFmt.format(kpis?.cantidad_liquidaciones_total || 0)} lotes`} badge="Lotes" accent="bg-amber-100 text-amber-800" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 print:grid-cols-1">
        <ChartCard
          title="Participación por Medio de Pago"
          subtitle="Distribución del monto bruto por tarjeta/marca (histórico completo, no se filtra por fecha)"
          loading={methodsQuery.isLoading}
          empty={methods.length === 0}
        >
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={methods}
                dataKey="total_bruto"
                nameKey="card_type"
                innerRadius="50%"
                outerRadius="80%"
                paddingAngle={1}
                isAnimationActive={false}
                label={({ participacion_porcentaje: p }) => (p >= 3 ? fmtPct(p) : '')}
                labelLine={false}
              >
                {methods.map((m, i) => (
                  <Cell key={m.card_type} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<PaymentTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Evolución Mensual de Cobranzas"
          subtitle="Neto cobrado y descuentos por mes (la suma de ambos equivale al bruto)"
          loading={monthlyQuery.isLoading}
          empty={monthlyAsc.length === 0}
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyAsc} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="mes_periodo" tickFormatter={fmtMonth} tick={{ fontSize: 11 }} minTickGap={8} />
              <YAxis tickFormatter={(v) => currencyShortFmt.format(v)} tick={{ fontSize: 11 }} width={70} />
              <Tooltip content={<MonthlyTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="total_neto_cobrado" name="Neto cobrado" stackId="a" fill="#15803d" isAnimationActive={false} />
              <Bar dataKey="total_descuentos" name="Descuentos" stackId="a" fill="#dc2626" radius={[4, 4, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden break-inside-avoid">
        <div className="flex items-center gap-2 px-4 sm:px-5 py-4">
          <CalendarRange className="w-5 h-5 text-primary" />
          <h3 className="font-extrabold text-gray-900 text-sm sm:text-base">Desglose Mensual de Liquidaciones</h3>
        </div>
        {monthlyQuery.isLoading ? (
          <div className="flex items-center justify-center py-12 text-gray-500">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : monthlyAsc.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400 text-sm font-semibold">
            <Inbox className="w-8 h-8 mb-2" />
            No hay liquidaciones registradas para el período seleccionado.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead className="bg-gray-50 text-gray-700">
                <tr className="text-left">
                  <th className="py-2.5 px-3 font-bold">Período</th>
                  <th className="py-2.5 px-3 font-bold text-right">Liquidaciones</th>
                  <th className="py-2.5 px-3 font-bold text-right">Monto Bruto</th>
                  <th className="py-2.5 px-3 font-bold text-right">Arancel</th>
                  <th className="py-2.5 px-3 font-bold text-right">IVA</th>
                  <th className="py-2.5 px-3 font-bold text-right">Retención IIBB</th>
                  <th className="py-2.5 px-3 font-bold text-right">Total Descuentos</th>
                  <th className="py-2.5 px-3 font-bold text-right">Neto Cobrado</th>
                  <th className="py-2.5 px-3 font-bold text-right">% Retención</th>
                </tr>
              </thead>
              <tbody>
                {monthlyAsc.map((r) => (
                  <tr key={r.mes} className="border-t border-gray-100 text-gray-800 break-inside-avoid">
                    <td className="py-2 px-3 font-semibold text-gray-900 whitespace-nowrap">{fmtMonth(r.mes_periodo)}</td>
                    <td className="py-2 px-3 text-right">{numberFmt.format(r.cantidad_liquidaciones || 0)}</td>
                    <td className="py-2 px-3 text-right">{fmtMoney(r.total_bruto)}</td>
                    <td className="py-2 px-3 text-right">{fmtMoney(r.total_arancel)}</td>
                    <td className="py-2 px-3 text-right">{fmtMoney(r.total_iva)}</td>
                    <td className="py-2 px-3 text-right">{fmtMoney(r.total_retenciones)}</td>
                    <td className="py-2 px-3 text-right text-red-700">{fmtMoney(r.total_descuentos)}</td>
                    <td className="py-2 px-3 text-right font-bold text-gray-900">{fmtMoney(r.total_neto_cobrado)}</td>
                    <td className="py-2 px-3 text-right">{fmtPct(r.porcentaje_descuentos)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

FiservSection.propTypes = {
  params: PropTypes.object.isRequired,
  enabled: PropTypes.bool.isRequired,
};

export default FiservSection;
