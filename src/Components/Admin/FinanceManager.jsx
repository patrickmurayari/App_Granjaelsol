import { useCallback, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CloudUpload, CheckCircle2, AlertCircle, Loader2, FileSpreadsheet,
  TrendingDown, CreditCard, ArrowUpCircle, ArrowDownCircle,
} from 'lucide-react';
import api from '../../api/api';
import { formatDate } from '../../utils/dateUtils';

const fmtMoney = (n) =>
  Number(n || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const FinanceManager = ({ addToast }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const inputRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: recentSettlements, isLoading: loadingRecent } = useQuery({
    queryKey: ['recent-settlements'],
    queryFn: async () => {
      const { data } = await api.get('/finance/settlements/recent');
      return data;
    },
  });

  const processFile = useCallback(
    async (file) => {
      if (!file) return;
      if (!file.name.toLowerCase().endsWith('.csv')) {
        setUploadError('Solo se aceptan archivos con extensión .csv');
        return;
      }
      setUploading(true);
      setResult(null);
      setUploadError(null);
      try {
        const formData = new FormData();
        formData.append('file', file);
        const { data } = await api.post('/finance/settlements/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setResult(data);
        queryClient.invalidateQueries({ queryKey: ['recent-settlements'] });
        addToast?.(`${data.inserted_records} liquidaciones nuevas cargadas`);
      } catch (err) {
        const msg = err.response?.data?.error || 'Error al procesar el archivo.';
        setUploadError(msg);
        addToast?.(msg, 'error');
      } finally {
        setUploading(false);
      }
    },
    [queryClient, addToast]
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragOver(false);
      processFile(e.dataTransfer.files[0]);
    },
    [processFile]
  );

  const handleChange = (e) => {
    processFile(e.target.files[0]);
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <FileSpreadsheet className="w-5 h-5 text-blue-700" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-heading font-extrabold text-text-dark">
              Liquidaciones Fiserv
            </h2>
            <p className="text-xs sm:text-sm text-text-dark/60">
              Subí el CSV exportado desde el portal Fiserv para importar las liquidaciones automáticamente.
            </p>
          </div>
        </div>
      </div>

      {/* Dropzone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center gap-4 p-8 sm:p-12 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 select-none ${
          isDragOver
            ? 'border-blue-400 bg-blue-50 scale-[1.01]'
            : uploading
            ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
            : 'border-blue-200 bg-blue-50/40 hover:border-blue-400 hover:bg-blue-50'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handleChange}
          disabled={uploading}
        />

        {uploading ? (
          <>
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            <div className="text-center">
              <p className="font-extrabold text-text-dark text-base">Procesando archivo...</p>
              <p className="text-sm text-text-dark/50 mt-1">Esto puede tardar unos segundos.</p>
            </div>
          </>
        ) : (
          <>
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${isDragOver ? 'bg-blue-200' : 'bg-blue-100'}`}>
              <CloudUpload className={`w-8 h-8 transition-colors ${isDragOver ? 'text-blue-600' : 'text-blue-500'}`} />
            </div>
            <div className="text-center">
              <p className="font-extrabold text-text-dark text-base">
                {isDragOver ? 'Soltá el archivo acá' : 'Arrastrá el CSV o hacé clic para seleccionar'}
              </p>
              <p className="text-sm text-text-dark/50 mt-1">Solo archivos <span className="font-bold text-blue-600">.csv</span> exportados desde Fiserv</p>
            </div>
          </>
        )}
      </div>

      {/* Result banner */}
      {result && (
        <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-5 sm:p-6">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
            <p className="font-extrabold text-green-800 text-base">Procesamiento completado</p>
          </div>
          <p className="text-sm text-green-700 mb-4">
            Se procesaron <strong>{result.total_records}</strong> registros:{' '}
            <strong>{result.inserted_records}</strong> nuevos cargados y{' '}
            <strong>{result.skipped_records}</strong> omitidos (ya existían o filas vacías).
          </p>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-xl p-3 text-center">
              <div className="text-xs font-bold uppercase tracking-wide text-gray-500">Total</div>
              <div className="text-2xl font-extrabold text-text-dark mt-1">{result.total_records}</div>
            </div>
            <div className="bg-white rounded-xl p-3 text-center">
              <div className="text-xs font-bold uppercase tracking-wide text-green-500">Nuevos</div>
              <div className="text-2xl font-extrabold text-green-700 mt-1">{result.inserted_records}</div>
            </div>
            <div className="bg-white rounded-xl p-3 text-center">
              <div className="text-xs font-bold uppercase tracking-wide text-gray-400">Omitidos</div>
              <div className="text-2xl font-extrabold text-gray-500 mt-1">{result.skipped_records}</div>
            </div>
          </div>
        </div>
      )}

      {/* Error banner */}
      {uploadError && (
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm font-bold text-red-700">{uploadError}</p>
        </div>
      )}

      {/* Recent settlements table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-blue-600" />
          <h3 className="font-extrabold text-text-dark text-sm sm:text-base">Últimas 10 liquidaciones cargadas</h3>
        </div>

        {loadingRecent ? (
          <div className="flex items-center justify-center gap-2 py-10 text-text-dark/50">
            <Loader2 className="w-5 h-5 animate-spin" />
            Cargando...
          </div>
        ) : !recentSettlements || recentSettlements.length === 0 ? (
          <div className="py-12 text-center text-text-dark/40">
            <FileSpreadsheet className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Aún no hay liquidaciones cargadas.</p>
            <p className="text-xs mt-1">Subí tu primer CSV para comenzar.</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/60">
                    <th className="text-left py-3 px-4 font-bold text-text-dark/70 text-xs uppercase tracking-wide">Fecha Pago</th>
                    <th className="text-left py-3 px-4 font-bold text-text-dark/70 text-xs uppercase tracking-wide">Nro. Liquidación</th>
                    <th className="text-left py-3 px-4 font-bold text-text-dark/70 text-xs uppercase tracking-wide">Tarjeta</th>
                    <th className="text-right py-3 px-4 font-bold text-text-dark/70 text-xs uppercase tracking-wide">
                      <span className="flex items-center justify-end gap-1"><ArrowUpCircle className="w-3 h-3 text-red-400" />Bruto</span>
                    </th>
                    <th className="text-right py-3 px-4 font-bold text-text-dark/70 text-xs uppercase tracking-wide">
                      <span className="flex items-center justify-end gap-1"><TrendingDown className="w-3 h-3 text-orange-400" />Arancel</span>
                    </th>
                    <th className="text-right py-3 px-4 font-bold text-text-dark/70 text-xs uppercase tracking-wide">
                      <span className="flex items-center justify-end gap-1"><ArrowDownCircle className="w-3 h-3 text-green-500" />Neto</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentSettlements.map((s) => (
                    <tr key={s.id} className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors">
                      <td className="py-3 px-4 font-bold text-text-dark">{formatDate(s.payment_date)}</td>
                      <td className="py-3 px-4 text-text-dark/70 font-mono text-xs">{s.liquidation_number}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                          {s.card_type || '—'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-text-dark">${fmtMoney(s.gross_amount)}</td>
                      <td className="py-3 px-4 text-right font-bold text-orange-600">${fmtMoney(s.arancel_amount)}</td>
                      <td className="py-3 px-4 text-right font-extrabold text-green-700">${fmtMoney(s.net_amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden divide-y divide-gray-100">
              {recentSettlements.map((s) => (
                <div key={s.id} className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-extrabold text-sm text-text-dark">{formatDate(s.payment_date)}</div>
                      <div className="text-[10px] text-text-dark/50 font-mono mt-0.5">{s.liquidation_number}</div>
                    </div>
                    <span className="inline-flex px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                      {s.card_type || '—'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-gray-50 rounded-xl p-2">
                      <div className="text-[10px] text-gray-400 font-bold">BRUTO</div>
                      <div className="text-xs font-extrabold text-text-dark">${fmtMoney(s.gross_amount)}</div>
                    </div>
                    <div className="bg-orange-50 rounded-xl p-2">
                      <div className="text-[10px] text-orange-400 font-bold">ARANCEL</div>
                      <div className="text-xs font-extrabold text-orange-700">${fmtMoney(s.arancel_amount)}</div>
                    </div>
                    <div className="bg-green-50 rounded-xl p-2">
                      <div className="text-[10px] text-green-500 font-bold">NETO</div>
                      <div className="text-xs font-extrabold text-green-700">${fmtMoney(s.net_amount)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

FinanceManager.propTypes = {
  addToast: PropTypes.func,
};

export default FinanceManager;
