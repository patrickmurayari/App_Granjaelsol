import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../api/api';
import { getTodayLocal, formatDate } from '../../utils/dateUtils';
import {
  Calculator, DollarSign, FileText, CreditCard, Calendar, Loader2, AlertCircle, CheckCircle, X, Pencil
} from 'lucide-react';

const CashClosing = () => {
  const queryClient = useQueryClient();
  const [cierreForm, setCierreForm] = useState({
    venta_total_balanza: '',
    venta_posnet: '',
    venta_transferencias: '',
    gastos_del_dia: '',
    notas: '',
  });
  const [editingCierreId, setEditingCierreId] = useState(null);

  const {
    data: cierres,
    isLoading: loadingCierres,
    isError: errorCierres,
  } = useQuery({
    queryKey: ['cierres'],
    queryFn: async () => {
      const { data } = await api.get('/cierres?limite=7');
      return data;
    },
  });

  const saveCierreMutation = useMutation({
    mutationFn: async ({ payload, id }) => {
      if (id) {
        const { data } = await api.put(`/cierres/${id}`, payload);
        return data;
      } else {
        const { data } = await api.post('/cierres', payload);
        return data;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['cierres'] });
      setCierreForm({
        venta_total_balanza: '',
        venta_posnet: '',
        venta_transferencias: '',
        gastos_del_dia: '',
        notas: '',
      });
      setEditingCierreId(null);
    },
  });

  const hoy = getTodayLocal();
  const cierreHoy = cierres?.find((c) => c.fecha === hoy);

  useEffect(() => {
    if (cierreHoy && !editingCierreId) {
      setCierreForm({
        venta_total_balanza: cierreHoy.venta_total_balanza?.toString() || '',
        venta_posnet: cierreHoy.venta_posnet?.toString() || '',
        venta_transferencias: cierreHoy.venta_transferencias?.toString() || '',
        gastos_del_dia: cierreHoy.gastos_del_dia?.toString() || '',
        notas: cierreHoy.notas || '',
      });
    }
  }, [cierreHoy, editingCierreId]);

  const submitCierre = (e) => {
    e.preventDefault();
    const payload = {
      venta_total_balanza: Number(cierreForm.venta_total_balanza),
      venta_posnet: Number(cierreForm.venta_posnet) || 0,
      venta_transferencias: Number(cierreForm.venta_transferencias) || 0,
      gastos_del_dia: Number(cierreForm.gastos_del_dia) || 0,
      notas: cierreForm.notas,
    };
    saveCierreMutation.mutate({ payload, id: editingCierreId });
  };

  const handleEditCierre = (c) => {
    setEditingCierreId(c.id);
    setCierreForm({
      venta_total_balanza: c.venta_total_balanza?.toString() || '',
      venta_posnet: c.venta_posnet?.toString() || '',
      venta_transferencias: c.venta_transferencias?.toString() || '',
      gastos_del_dia: c.gastos_del_dia?.toString() || '',
      notas: c.notas || '',
    });
  };

  const cancelEditCierre = () => {
    setEditingCierreId(null);
    setCierreForm({
      venta_total_balanza: '',
      venta_posnet: '',
      venta_transferencias: '',
      gastos_del_dia: '',
      notas: '',
    });
  };

  const calculosCierre = useMemo(() => {
    const ventaBalanza = Number(cierreForm.venta_total_balanza) || 0;
    const posnet = Number(cierreForm.venta_posnet) || 0;
    const transferencias = Number(cierreForm.venta_transferencias) || 0;
    const gastos = Number(cierreForm.gastos_del_dia) || 0;

    const efectivoNeto = ventaBalanza - (posnet + transferencias) - gastos;

    return { efectivoNeto };
  }, [cierreForm]);

  return (
    <div className="space-y-6">
      {/* Formulario de cierre */}
      <div className="bg-white shadow-lg rounded-2xl border border-gray-200 p-4 sm:p-6 max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <Calculator className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg sm:text-xl font-heading font-extrabold text-text-dark">
              Cierre de Caja
            </h2>
            <p className="text-xs sm:text-sm text-text-dark/60">
              {editingCierreId ? 'Editando cierre existente' : cierreHoy ? 'Editando cierre de hoy' : 'Nuevo cierre del día'}
            </p>
          </div>
          {editingCierreId && (
            <button
              onClick={cancelEditCierre}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <form onSubmit={submitCierre} className="space-y-5">
          {/* Sección: Ventas Totales */}
          <div className="bg-blue-50 rounded-xl p-3 sm:p-4">
            <h4 className="text-xs sm:text-sm font-bold text-blue-800 mb-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              VENTAS TOTALES
            </h4>
            <div>
              <label className="block text-xs font-bold text-text-dark mb-1">
                Total Balanza (ticket)
              </label>
              <input
                type="number"
                inputMode="decimal"
                required
                value={cierreForm.venta_total_balanza}
                onChange={(e) => setCierreForm({ ...cierreForm, venta_total_balanza: e.target.value })}
                className="w-full px-4 py-3 text-lg sm:text-xl font-bold text-gray-900 text-center rounded-lg border-2 border-blue-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition placeholder:text-gray-400"
                placeholder="0"
              />
            </div>
          </div>

          {/* Sección: Pagos Digitales */}
          <div className="bg-purple-50 rounded-xl p-3 sm:p-4">
            <h4 className="text-xs sm:text-sm font-bold text-purple-800 mb-3 flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              PAGOS DIGITALES
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-text-dark mb-1">
                  Posnet
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  value={cierreForm.venta_posnet}
                  onChange={(e) => setCierreForm({ ...cierreForm, venta_posnet: e.target.value })}
                  className="w-full px-3 py-2.5 text-base sm:text-lg font-bold text-gray-900 text-center rounded-lg border-2 border-purple-200 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition placeholder:text-gray-400"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-dark mb-1">
                  Transferencias
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  value={cierreForm.venta_transferencias}
                  onChange={(e) => setCierreForm({ ...cierreForm, venta_transferencias: e.target.value })}
                  className="w-full px-3 py-2.5 text-base sm:text-lg font-bold text-gray-900 text-center rounded-lg border-2 border-purple-200 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition placeholder:text-gray-400"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Sección: Gastos */}
          <div className="bg-red-50 rounded-xl p-3 sm:p-4">
            <h4 className="text-xs sm:text-sm font-bold text-red-800 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              GASTOS DEL DÍA
            </h4>
            <div>
              <label className="block text-xs font-bold text-text-dark mb-1">
                Total Gastos
              </label>
              <input
                type="number"
                inputMode="decimal"
                value={cierreForm.gastos_del_dia}
                onChange={(e) => setCierreForm({ ...cierreForm, gastos_del_dia: e.target.value })}
                className="w-full px-4 py-3 text-lg sm:text-xl font-bold text-gray-900 text-center rounded-lg border-2 border-red-200 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition placeholder:text-gray-400"
                placeholder="0"
              />
            </div>
          </div>

          {/* Resumen de Cálculos */}
          <div className="bg-gray-100 rounded-xl p-4 space-y-3">
            <h4 className="text-xs sm:text-sm font-bold text-text-dark/70 mb-2">
              RESUMEN AUTOMÁTICO
            </h4>
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-text-dark">Efectivo Neto Estimado:</span>
              <span className="text-xl sm:text-2xl font-extrabold text-blue-700">
                ${calculosCierre.efectivoNeto.toLocaleString('es-AR')}
              </span>
            </div>
          </div>

          {/* Notas opcionales */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-text-dark mb-2">
              Notas (opcional)
            </label>
            <textarea
              value={cierreForm.notas}
              onChange={(e) => setCierreForm({ ...cierreForm, notas: e.target.value })}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition text-sm resize-none"
              rows="2"
              placeholder="Observaciones del día..."
            />
          </div>

          {saveCierreMutation.isError && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              <AlertCircle className="w-4 h-4" />
              Error al guardar. Intenta nuevamente.
            </div>
          )}

          {saveCierreMutation.isSuccess && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
              <CheckCircle className="w-4 h-4" />
              {editingCierreId ? 'Cierre actualizado correctamente.' : 'Cierre guardado correctamente.'}
            </div>
          )}

          <button
            type="submit"
            disabled={saveCierreMutation.isPending}
            className="w-full bg-primary text-white py-4 sm:py-5 rounded-xl font-bold text-base sm:text-lg hover:bg-secondary transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saveCierreMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                {editingCierreId ? 'Actualizar Cierre' : 'Guardar Cierre'}
              </>
            )}
          </button>
        </form>
      </div>

      {/* Historial de cierres */}
      <div className="bg-white shadow-lg rounded-2xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-base sm:text-lg font-heading font-extrabold text-text-dark flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Últimos 7 Cierres
          </h3>
        </div>

        {loadingCierres ? (
          <div className="p-6 text-center text-text-dark/60 flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Cargando historial...
          </div>
        ) : errorCierres ? (
          <div className="p-6 text-center text-red-600">Error al cargar historial.</div>
        ) : cierres?.length === 0 ? (
          <div className="p-6 text-center text-text-dark/60">No hay cierres registrados.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs sm:text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-3 sm:px-4 py-2 sm:py-3 font-bold text-text-dark">Fecha</th>
                  <th className="text-right px-3 sm:px-4 py-2 sm:py-3 font-bold text-text-dark">Balanza</th>
                  <th className="text-right px-3 sm:px-4 py-2 sm:py-3 font-bold text-text-dark">Digital</th>
                  <th className="text-right px-3 sm:px-4 py-2 sm:py-3 font-bold text-text-dark">Ef. Estimado</th>
                  <th className="text-right px-3 sm:px-4 py-2 sm:py-3 font-bold text-text-dark">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {cierres?.map((c) => {
                  const efectivoNeto = (c.venta_total_balanza || 0) - (c.venta_posnet || 0) - (c.venta_transferencias || 0) - (c.gastos_del_dia || 0);
                  const esHoy = c.fecha === hoy;
                  return (
                    <tr
                      key={c.id}
                      className={`border-t border-gray-100 ${esHoy ? 'bg-primary/5' : ''}`}
                    >
                      <td className="px-3 sm:px-4 py-2 sm:py-3 font-medium">
                        {formatDate(c.fecha)}
                        {esHoy && (
                          <span className="ml-2 text-xs bg-primary text-white px-2 py-0.5 rounded-full">
                            Hoy
                          </span>
                        )}
                      </td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-right font-bold text-blue-700">
                        ${c.venta_total_balanza?.toLocaleString('es-AR') || 0}
                      </td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-right">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center justify-end gap-1.5">
                            <span className="text-[10px] sm:text-xs text-gray-500">P</span>
                            <span className="font-bold text-purple-700 text-xs sm:text-sm">
                              ${(c.venta_posnet || 0).toLocaleString('es-AR')}
                            </span>
                          </div>
                          <div className="flex items-center justify-end gap-1.5">
                            <span className="text-[10px] sm:text-xs text-gray-500">T</span>
                            <span className="font-bold text-indigo-600 text-xs sm:text-sm">
                              ${(c.venta_transferencias || 0).toLocaleString('es-AR')}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className={`px-3 sm:px-4 py-2 sm:py-3 text-right font-extrabold ${efectivoNeto >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${efectivoNeto.toLocaleString('es-AR')}
                      </td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3">
                        <button
                          onClick={() => handleEditCierre(c)}
                          className="bg-primary/10 text-primary px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg font-bold hover:bg-primary/20 transition text-xs sm:text-sm flex items-center gap-1"
                        >
                          <Pencil className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="hidden sm:inline">Editar</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CashClosing;
