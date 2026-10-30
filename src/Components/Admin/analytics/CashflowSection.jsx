import PropTypes from 'prop-types';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import {
  ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine,
} from 'recharts';
import { ArrowDownCircle, ArrowUpCircle, PieChart as PieIcon, Scale, Info } from 'lucide-react';
import { KpiCard, KpiSkeleton, ChartCard, TooltipBox, ErrorBanner } from './AnalyticsCards';
import { fetchAnalytics, fmtMoney, fmtPct, fmtDate, fmtShortDate, numberFmt, currencyShortFmt } from './analyticsUtils';

const CashflowTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <TooltipBox>
      <p className="font-extrabold text-gray-900">Semana {fmtDate(d.semana_inicio)} – {fmtDate(d.semana_fin)}</p>
      <p>Ingresos Posnet: <b className="text-green-700">{fmtMoney(d.ingresos_posnet_netos)}</b></p>
      <p>Egresos compras: <b className="text-orange-700">{fmtMoney(d.egresos_compras_mercaderia)}</b></p>
      <p>Balance: <b className={d.balance_semanal >= 0 ? 'text-green-700' : 'text-red-700'}>{fmtMoney(d.balance_semanal)}</b></p>
    </TooltipBox>
  );
};

CashflowTooltip.propTypes = { active: PropTypes.bool, payload: PropTypes.array };

const CashflowSection = ({ params, enabled }) => {
  const cashflowQuery = useQuery({
    queryKey: ['analytics', 'cashflow', params],
    queryFn: () => fetchAnalytics('cashflow', params),
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });

  const rows = cashflowQuery.data?.data || [];
  const totals = cashflowQuery.data?.totals;
  const ingresos = totals?.ingresos_acumulados || 0;
  const egresos = totals?.egresos_acumulados || 0;
  const cobertura = egresos > 0 ? (ingresos / egresos) * 100 : null;

  return (
    <div className="space-y-5">
      {cashflowQuery.isError && <ErrorBanner />}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 print:grid-cols-4">
        {cashflowQuery.isLoading ? (
          <KpiSkeleton count={4} />
        ) : (
          <>
            <KpiCard icon={ArrowUpCircle} label="Ingresos Posnet Acumulados" value={fmtMoney(ingresos)} badge="Neto Fiserv" accent="bg-green-100 text-green-800" />
            <KpiCard icon={ArrowDownCircle} label="Egresos Mercadería Acumulados" value={fmtMoney(egresos)} badge="Compras" accent="bg-orange-100 text-orange-800" />
            <KpiCard icon={PieIcon} label="Aporte Digital a Compras" value={cobertura === null ? '—' : fmtPct(cobertura)} badge="Cobertura" accent="bg-blue-100 text-blue-800" />
            <KpiCard
              icon={Scale}
              label="Balance del Período"
              value={fmtMoney(totals?.neto_periodo)}
              badge={`${numberFmt.format(totals?.semanas_positivas || 0)}/${numberFmt.format(totals?.semanas || 0)} sem. +`}
              accent={(totals?.neto_periodo || 0) >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
            />
          </>
        )}
      </div>

      <ChartCard
        title="Balance Semanal: Posnet vs. Compras"
        subtitle="Ingresos netos acreditados por Fiserv frente a compras de mercadería a proveedores, semana a semana"
        loading={cashflowQuery.isLoading}
        empty={rows.length === 0}
      >
        <ResponsiveContainer width="100%" height={340}>
          <ComposedChart data={rows} margin={{ top: 8, right: 8, left: 8, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="semana_inicio" tickFormatter={fmtShortDate} tick={{ fontSize: 11 }} minTickGap={12} />
            <YAxis tickFormatter={(v) => currencyShortFmt.format(v)} tick={{ fontSize: 11 }} width={74} />
            <Tooltip content={<CashflowTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <ReferenceLine y={0} stroke="#9ca3af" />
            <Bar dataKey="ingresos_posnet_netos" name="Ingresos Posnet" fill="#16a34a" radius={[4, 4, 0, 0]} isAnimationActive={false} />
            <Bar dataKey="egresos_compras_mercaderia" name="Egresos compras" fill="#ea580c" radius={[4, 4, 0, 0]} isAnimationActive={false} />
            <Line type="monotone" dataKey="balance_semanal" name="Balance semanal" stroke="#1e3a8a" strokeWidth={2} dot={{ r: 2 }} isAnimationActive={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-xs sm:text-sm text-blue-900 break-inside-avoid">
        <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <p>
          <b>Nota:</b> Los egresos contemplan la totalidad de compras a proveedores; las ventas diarias cobradas en efectivo no están reflejadas en los ingresos de Posnet.
        </p>
      </div>
    </div>
  );
};

CashflowSection.propTypes = {
  params: PropTypes.object.isRequired,
  enabled: PropTypes.bool.isRequired,
};

export default CashflowSection;
