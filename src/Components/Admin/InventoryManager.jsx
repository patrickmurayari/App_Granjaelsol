import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../api/api';
import PropTypes from 'prop-types';
import {
  Truck, Plus, FileText, Scale, Banknote, CreditCard, Loader2, AlertCircle, Trash2
} from 'lucide-react';

const InventoryManager = ({ addToast }) => {
  const queryClient = useQueryClient();
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [showNewSupplier, setShowNewSupplier] = useState(false);
  const [newSupplierForm, setNewSupplierForm] = useState({ name: '', category: 'Carne' });
  const [entryForm, setEntryForm] = useState({
    supplier_id: '',
    invoice_number: '',
    entry_date: new Date().toISOString().split('T')[0],
    items: [{ product_name: '', weights: '', unit_price: '' }],
    iva_21: '',
    percepcion_iva: '',
    percepcion_iibb: '',
  });
  const [paymentForm, setPaymentForm] = useState({
    supplier_id: '',
    payment_date: new Date().toISOString().split('T')[0],
    method: 'efectivo',
    amount_haber: '',
  });

  // Query de proveedores
  const {
    data: suppliers,
    isLoading: loadingSuppliers,
    isError: errorSuppliers,
  } = useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      const { data } = await api.get('/inventory/suppliers');
      return data;
    },
  });

  // Query de saldo del proveedor seleccionado
  const {
    data: balanceData,
    isLoading: loadingBalance,
  } = useQuery({
    queryKey: ['supplier-balance', selectedSupplier],
    queryFn: async () => {
      const { data } = await api.get(`/inventory/balance/${selectedSupplier}`);
      return data;
    },
    enabled: !!selectedSupplier,
  });

  // Mutación para crear entrada
  const createEntryMutation = useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post('/inventory/entries', payload);
      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['supplier-balance', selectedSupplier] });
      setEntryForm({
        supplier_id: entryForm.supplier_id,
        invoice_number: '',
        entry_date: new Date().toISOString().split('T')[0],
        items: [{ product_name: '', weights: '', unit_price: '' }],
        iva_21: '',
        percepcion_iva: '',
        percepcion_iibb: '',
      });
      addToast('Remito registrado correctamente');
    },
    onError: () => {
      addToast('Error al registrar remito. Verificá los datos.', 'error');
    },
  });

  // Mutación para crear pago
  const createPaymentMutation = useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post('/inventory/payments', payload);
      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['supplier-balance', selectedSupplier] });
      setPaymentForm({
        ...paymentForm,
        amount_haber: '',
      });
      addToast('Pago registrado correctamente');
    },
    onError: () => {
      addToast('Error al registrar pago. Intenta nuevamente.', 'error');
    },
  });

  // Mutación para crear proveedor
  const createSupplierMutation = useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post('/inventory/suppliers', payload);
      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      setNewSupplierForm({ name: '', category: 'Carne' });
      setShowNewSupplier(false);
      addToast('Proveedor registrado correctamente');
    },
    onError: () => {
      addToast('Error al registrar proveedor. Intenta nuevamente.', 'error');
    },
  });

  // Cálculo en tiempo real del subtotal neto (suma de items)
  const subtotalNeto = useMemo(() => {
    return entryForm.items.reduce((sum, item) => {
      const weights = item.weights
        .split(/[,;\s-]+/)
        .map(Number)
        .filter((n) => !isNaN(n) && n > 0);
      const totalWeight = weights.reduce((s, w) => s + w, 0);
      const price = Number(item.unit_price) || 0;
      return sum + Math.round(totalWeight * price * 100) / 100;
    }, 0);
  }, [entryForm.items]);

  // Total factura con impuestos
  const totalFactura = useMemo(() => {
    const iva = Number(entryForm.iva_21) || 0;
    const percIva = Number(entryForm.percepcion_iva) || 0;
    const percIibb = Number(entryForm.percepcion_iibb) || 0;
    return Math.round((subtotalNeto + iva + percIva + percIibb) * 100) / 100;
  }, [subtotalNeto, entryForm.iva_21, entryForm.percepcion_iva, entryForm.percepcion_iibb]);

  const handleSelectSupplier = (id) => {
    setSelectedSupplier(id);
    setEntryForm((prev) => ({ ...prev, supplier_id: id }));
    setPaymentForm((prev) => ({ ...prev, supplier_id: id }));
  };

  const handleEntryItemChange = (index, field, value) => {
    const updated = [...entryForm.items];
    updated[index] = { ...updated[index], [field]: value };
    setEntryForm((prev) => ({ ...prev, items: updated }));
  };

  const addEntryItem = () => {
    setEntryForm((prev) => ({
      ...prev,
      items: [...prev.items, { product_name: '', weights: '', unit_price: '' }],
    }));
  };

  const removeEntryItem = (index) => {
    if (entryForm.items.length <= 1) return;
    setEntryForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const submitEntry = (e) => {
    e.preventDefault();
    const processedItems = entryForm.items.map((item) => {
      const weights = item.weights
        .split(/[,;\s-]+/)
        .map(Number)
        .filter((n) => !isNaN(n) && n > 0);
      return {
        product_name: item.product_name.trim(),
        weights,
        unit_price: Number(item.unit_price),
      };
    }).filter((item) => item.product_name && item.weights.length > 0 && item.unit_price > 0);

    if (processedItems.length === 0) return;

    createEntryMutation.mutate({
      supplier_id: entryForm.supplier_id,
      invoice_number: entryForm.invoice_number || null,
      entry_date: entryForm.entry_date,
      items: processedItems,
      iva_21: Number(entryForm.iva_21) || 0,
      percepcion_iva: Number(entryForm.percepcion_iva) || 0,
      percepcion_iibb: Number(entryForm.percepcion_iibb) || 0,
    });
  };

  const submitPayment = (e) => {
    e.preventDefault();
    if (!paymentForm.supplier_id || !paymentForm.amount_haber) return;
    createPaymentMutation.mutate({
      supplier_id: paymentForm.supplier_id,
      payment_date: paymentForm.payment_date,
      method: paymentForm.method,
      amount_haber: Number(paymentForm.amount_haber),
    });
  };

  return (
    <div className="space-y-6">
      {/* ── Proveedores ── */}
      <div className="bg-white shadow-lg rounded-2xl border border-gray-200 p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg sm:text-xl font-heading font-extrabold text-text-dark">Proveedores</h2>
            <p className="text-xs sm:text-sm text-text-dark/60">Seleccioná un proveedor para ver su cuenta corriente</p>
          </div>
          <button
            onClick={() => setShowNewSupplier(!showNewSupplier)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs sm:text-sm border-2 border-primary bg-white hover:bg-primary hover:text-white transition"
            style={{ color: '#8B0000' }}
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nuevo</span>
          </button>
        </div>

        {/* ── Formulario Nuevo Proveedor ── */}
        {showNewSupplier && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!newSupplierForm.name.trim()) return;
              createSupplierMutation.mutate({
                name: newSupplierForm.name.trim(),
                category: newSupplierForm.category,
              });
            }}
            className="mb-4 p-4 bg-gray-50 rounded-xl border-2 border-dashed border-primary/30 space-y-3"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs sm:text-sm font-bold mb-1" style={{ color: '#111827' }}>Nombre del Proveedor</label>
                <input
                  type="text"
                  value={newSupplierForm.name}
                  onChange={(e) => setNewSupplierForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition text-sm"
                  style={{ color: '#111827' }}
                  placeholder="Ej: Lema e Hijos"
                  required
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-bold mb-1" style={{ color: '#111827' }}>Categoría</label>
                <select
                  value={newSupplierForm.category}
                  onChange={(e) => setNewSupplierForm((prev) => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition text-sm font-bold cursor-pointer"
                  style={{ color: '#111827' }}
                >
                  <option value="Carne">Carne</option>
                  <option value="Pollo">Pollo</option>
                  <option value="Cerdo">Cerdo</option>
                  <option value="Achuras">Achuras</option>
                  <option value="Pescado">Pescado</option>
                  <option value="Almacén">Almacén</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => { setShowNewSupplier(false); setNewSupplierForm({ name: '', category: 'Carne' }); }}
                className="px-3 py-2 rounded-xl border-2 border-gray-200 font-bold text-xs sm:text-sm hover:border-primary transition"
                style={{ color: '#111827' }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={createSupplierMutation.isPending || !newSupplierForm.name.trim()}
                className="px-4 py-2 rounded-xl font-bold text-xs sm:text-sm bg-primary text-white hover:bg-secondary transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                {createSupplierMutation.isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Guardando...
                  </>
                ) : 'Guardar'}
              </button>
            </div>
          </form>
        )}

        {loadingSuppliers ? (
          <div className="text-center py-6 flex items-center justify-center gap-2 text-text-dark/60">
            <Loader2 className="w-5 h-5 animate-spin" />
            Cargando proveedores...
          </div>
        ) : errorSuppliers ? (
          <div className="text-center py-6 text-red-600 flex items-center justify-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Error al cargar proveedores.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(suppliers || []).map((s) => (
              <button
                key={s.id}
                onClick={() => handleSelectSupplier(s.id)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  selectedSupplier === s.id
                    ? 'border-primary bg-primary/5 shadow-lg'
                    : 'border-gray-200 hover:border-primary/40 bg-white'
                }`}
              >
                <div className="font-extrabold text-sm sm:text-base" style={{ color: '#111827' }}>{s.name}</div>
                <div className="text-xs mt-1" style={{ color: '#6b7280' }}>{s.category || 'Sin categoría'}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Saldo del proveedor ── */}
      {selectedSupplier && (
        <div className="bg-white shadow-lg rounded-2xl border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <Scale className="w-5 h-5 sm:w-6 sm:h-6 text-amber-700" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg sm:text-xl font-heading font-extrabold text-text-dark">
                Cuenta Corriente
              </h2>
              <p className="text-xs sm:text-sm text-text-dark/60">
                {balanceData?.supplier?.name || 'Proveedor'}
              </p>
            </div>
          </div>

          {loadingBalance ? (
            <div className="text-center py-4 flex items-center justify-center gap-2 text-text-dark/60">
              <Loader2 className="w-5 h-5 animate-spin" />
              Calculando saldo...
            </div>
          ) : balanceData ? (
            <div className="flex flex-col sm:grid sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="bg-red-50 rounded-xl p-3 sm:p-4 flex sm:flex-col items-center sm:text-center justify-between sm:justify-start gap-2">
                <div className="text-xs sm:text-sm font-bold text-red-800">Debe</div>
                <div className="text-lg sm:text-2xl font-extrabold text-red-700">
                  ${balanceData.total_debe.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div className="bg-green-50 rounded-xl p-3 sm:p-4 flex sm:flex-col items-center sm:text-center justify-between sm:justify-start gap-2">
                <div className="text-xs sm:text-sm font-bold text-green-800">Haber</div>
                <div className="text-lg sm:text-2xl font-extrabold text-green-700">
                  ${balanceData.total_haber.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div className={`rounded-xl p-3 sm:p-4 flex sm:flex-col items-center sm:text-center justify-between sm:justify-start gap-2 ${balanceData.saldo_pendiente > 0 ? 'bg-amber-50' : 'bg-gray-50'}`}>
                <div className="text-xs sm:text-sm font-bold text-text-dark/70">Saldo</div>
                <div className={`text-lg sm:text-2xl font-extrabold ${balanceData.saldo_pendiente > 0 ? 'text-amber-700' : 'text-text-dark/40'}`}>
                  ${Math.abs(balanceData.saldo_pendiente).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </div>
                {balanceData.saldo_pendiente > 0 && (
                  <div className="text-[10px] sm:text-xs text-amber-600 font-bold mt-1">PENDIENTE</div>
                )}
                {balanceData.saldo_pendiente <= 0 && (
                  <div className="text-[10px] sm:text-xs text-green-600 font-bold mt-1">SALDADO</div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* ── Formulario de Remito ── */}
      {selectedSupplier && (
        <div className="bg-white shadow-lg rounded-2xl border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-700" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-heading font-extrabold text-text-dark">Cargar Remito</h2>
              <p className="text-xs sm:text-sm text-text-dark/60">Ingresá los productos del remito</p>
            </div>
          </div>

          <form onSubmit={submitEntry} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs sm:text-sm font-bold text-text-dark mb-1">N° Remito</label>
                <input
                  type="text"
                  value={entryForm.invoice_number}
                  onChange={(e) => setEntryForm((prev) => ({ ...prev, invoice_number: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition text-sm"
                  placeholder="REM-001"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-bold text-text-dark mb-1">Fecha</label>
                <input
                  type="date"
                  value={entryForm.entry_date}
                  onChange={(e) => setEntryForm((prev) => ({ ...prev, entry_date: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition text-sm"
                />
              </div>
            </div>

            {/* Items dinámicos */}
            <div className="space-y-3">
              {entryForm.items.map((item, idx) => (
                <div key={idx} className="bg-gray-50 rounded-xl p-3 sm:p-4 border border-gray-200 relative">
                  {entryForm.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeEntryItem(idx)}
                      className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition"
                      aria-label="Eliminar producto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-text-dark mb-1">Producto *</label>
                      <input
                        type="text"
                        value={item.product_name}
                        onChange={(e) => handleEntryItemChange(idx, 'product_name', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition text-sm"
                        placeholder="Ej: Asado"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-text-dark mb-1">Pesos (kg) *</label>
                      <input
                        type="text"
                        inputMode="text"
                        value={item.weights}
                        onChange={(e) => handleEntryItemChange(idx, 'weights', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition text-sm"
                        placeholder="94, 95, 99"
                        required
                      />
                      <p className="text-[10px] text-text-dark/50 mt-1">Separá con comas o guiones</p>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-text-dark mb-1">Precio/kg ($) *</label>
                      <input
                        type="text"
                        inputMode="text"
                        value={item.unit_price}
                        onChange={(e) => handleEntryItemChange(idx, 'unit_price', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition text-sm"
                        placeholder="8500"
                        required
                      />
                    </div>
                  </div>
                  {/* Subtotal del item en tiempo real */}
                  {item.weights && item.unit_price && (() => {
                    const weights = item.weights.split(/[,;\s-]+/).map(Number).filter((n) => !isNaN(n) && n > 0);
                    const totalW = weights.reduce((s, w) => s + w, 0);
                    const sub = Math.round(totalW * Number(item.unit_price) * 100) / 100;
                    return totalW > 0 ? (
                      <div className="mt-2 text-xs sm:text-sm font-bold text-primary">
                        {totalW.toFixed(2)} kg × ${Number(item.unit_price).toLocaleString('es-AR')} = ${sub.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                      </div>
                    ) : null;
                  })()}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addEntryItem}
              className="flex items-center gap-2 text-primary font-bold text-sm hover:text-secondary transition"
            >
              <Plus className="w-4 h-4" />
              Añadir otro producto
            </button>

            {/* ── Totales e Impuestos ── */}
            <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <Banknote className="w-4 h-4 text-gray-700" />
                <span className="text-sm sm:text-base font-extrabold" style={{ color: '#111827' }}>Totales e Impuestos</span>
              </div>

              {/* Subtotal Neto (solo lectura) */}
              <div className="flex justify-between items-center bg-white rounded-lg px-3 py-2 border border-gray-200">
                <span className="text-xs sm:text-sm font-bold" style={{ color: '#111827' }}>Subtotal Neto</span>
                <span className="text-sm sm:text-base font-extrabold" style={{ color: '#111827' }}>
                  ${subtotalNeto.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* IVA 21% */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <label className="text-xs sm:text-sm font-bold" style={{ color: '#111827' }}>IVA (21%)</label>
                  <button
                    type="button"
                    onClick={() => {
                      const calc = Math.round(subtotalNeto * 0.21 * 100) / 100;
                      setEntryForm((prev) => ({ ...prev, iva_21: calc.toString() }));
                    }}
                    className="text-[10px] sm:text-xs px-2 py-0.5 rounded-lg bg-blue-100 text-blue-700 font-bold hover:bg-blue-200 transition"
                  >
                    Calcular 21%
                  </button>
                </div>
                <input
                  type="number"
                  step="0.01"
                  inputMode="decimal"
                  value={entryForm.iva_21}
                  onChange={(e) => setEntryForm((prev) => ({ ...prev, iva_21: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition text-sm"
                  style={{ color: '#111827' }}
                  placeholder="0.00"
                />
              </div>

              {/* Percepción IVA */}
              <div>
                <label className="block text-xs sm:text-sm font-bold mb-1" style={{ color: '#111827' }}>Perc. IVA</label>
                <input
                  type="number"
                  step="0.01"
                  inputMode="decimal"
                  value={entryForm.percepcion_iva}
                  onChange={(e) => setEntryForm((prev) => ({ ...prev, percepcion_iva: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition text-sm"
                  style={{ color: '#111827' }}
                  placeholder="0.00"
                />
              </div>

              {/* Percepción IIBB */}
              <div>
                <label className="block text-xs sm:text-sm font-bold mb-1" style={{ color: '#111827' }}>Perc. IIBB</label>
                <input
                  type="number"
                  step="0.01"
                  inputMode="decimal"
                  value={entryForm.percepcion_iibb}
                  onChange={(e) => setEntryForm((prev) => ({ ...prev, percepcion_iibb: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition text-sm"
                  style={{ color: '#111827' }}
                  placeholder="0.00"
                />
              </div>

              {/* Total Factura (Debe) */}
              <div className="flex justify-between items-center bg-amber-50 rounded-lg px-3 py-2.5 border-2 border-amber-200">
                <span className="text-sm sm:text-base font-bold text-amber-800">Total Factura (Debe)</span>
                <span className="text-lg sm:text-xl font-extrabold text-amber-700">
                  ${totalFactura.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={createEntryMutation.isPending || totalFactura === 0}
              className="w-full bg-primary text-white py-3 sm:py-3.5 rounded-xl font-bold text-sm sm:text-base hover:bg-secondary transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {createEntryMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Registrando...
                </>
              ) : (
                <>
                  <Truck className="w-4 h-4" />
                  Confirmar Remito
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* ── Formulario de Pago ── */}
      {selectedSupplier && (
        <div className="bg-white shadow-lg rounded-2xl border border-gray-200 p-4 sm:p-6 max-w-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Banknote className="w-5 h-5 sm:w-6 sm:h-6 text-green-700" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-heading font-extrabold text-text-dark">Registrar Pago</h2>
              <p className="text-xs sm:text-sm text-text-dark/60">Pago a cuenta del proveedor</p>
            </div>
          </div>

          <form onSubmit={submitPayment} className="space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-bold text-text-dark mb-1">Fecha</label>
              <input
                type="date"
                value={paymentForm.payment_date}
                onChange={(e) => setPaymentForm((prev) => ({ ...prev, payment_date: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition text-sm"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold text-text-dark mb-2">Método de pago</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'efectivo', label: 'Efectivo', icon: Banknote },
                  { key: 'transferencia', label: 'Transferencia', icon: CreditCard },
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setPaymentForm((prev) => ({ ...prev, method: key }))}
                    className={`flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl border-2 font-bold text-xs transition-all ${
                      paymentForm.method === key
                        ? 'border-primary bg-primary/10 text-primary shadow-sm'
                        : 'border-gray-200 text-text-dark/70 hover:border-primary/40'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold text-text-dark mb-1">Monto ($)</label>
              <input
                type="number"
                inputMode="decimal"
                value={paymentForm.amount_haber}
                onChange={(e) => setPaymentForm((prev) => ({ ...prev, amount_haber: e.target.value }))}
                className="w-full px-4 py-3 text-lg font-bold text-center rounded-xl border-2 border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                placeholder="500000"
                required
              />
            </div>

            <button
              type="submit"
              disabled={createPaymentMutation.isPending || !paymentForm.amount_haber}
              className="w-full bg-green-700 text-white py-3.5 rounded-xl font-bold text-sm sm:text-base hover:bg-green-800 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {createPaymentMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Registrando...
                </>
              ) : (
                <>
                  <Banknote className="w-4 h-4" />
                  Registrar Pago
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

InventoryManager.propTypes = {
  addToast: PropTypes.func.isRequired,
};

export default InventoryManager;
