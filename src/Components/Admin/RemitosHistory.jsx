import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import PropTypes from 'prop-types';
import api from '../../api/api';
import {
  FileText, DollarSign, Loader2, AlertCircle, X, Search, Pencil, Trash2, CheckCircle, CreditCard, Wallet
} from 'lucide-react';

const RemitosHistory = ({ addToast }) => {
  const queryClient = useQueryClient();
  const [remitosSupplier, setRemitosSupplier] = useState(null);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItemId, setEditingItemId] = useState(null);
  const [editForm, setEditForm] = useState({ product_name: '', weights: '', unit_price: '', unit_type: 'kg' });
  const [deletingItemId, setDeletingItemId] = useState(null);
  const [supplierTab, setSupplierTab] = useState('remitos');
  const [editingPaymentId, setEditingPaymentId] = useState(null);
  const [editPaymentForm, setEditPaymentForm] = useState({ payment_date: '', method: '', amount_haber: '' });
  const [deletingPaymentId, setDeletingPaymentId] = useState(null);
  const [deletingEntryId, setDeletingEntryId] = useState(null);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [adjustmentForm, setAdjustmentForm] = useState({
    entry_date: new Date().toISOString().split('T')[0],
    total_debe: '',
    adjustment_notes: '',
  });

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

  const {
    data: supplierEntries,
    isLoading: loadingEntries,
    isError: errorEntries,
  } = useQuery({
    queryKey: ['supplier-entries', remitosSupplier],
    queryFn: async () => {
      const { data } = await api.get(`/inventory/entries/supplier/${remitosSupplier}`);
      return data;
    },
    enabled: !!remitosSupplier,
  });

  const {
    data: entryDetail,
    isLoading: loadingDetail,
  } = useQuery({
    queryKey: ['entry-detail', selectedEntry],
    queryFn: async () => {
      const { data } = await api.get(`/inventory/entries/${selectedEntry}/details`);
      return data;
    },
    enabled: !!selectedEntry,
  });

  const {
    data: supplierPayments,
    isLoading: loadingPayments,
    isError: errorPayments,
  } = useQuery({
    queryKey: ['supplier-payments', remitosSupplier],
    queryFn: async () => {
      const { data } = await api.get(`/inventory/payments/supplier/${remitosSupplier}`);
      return data;
    },
    enabled: !!remitosSupplier && supplierTab === 'pagos',
  });

  const filteredEntries = useMemo(() => {
    const all = supplierEntries || [];
    if (!searchTerm.trim()) return all;
    const term = searchTerm.toLowerCase().trim();
    return all.filter((entry) =>
      (entry.invoice_number || '').toLowerCase().includes(term)
    );
  }, [supplierEntries, searchTerm]);

  const updateItemMutation = useMutation({
    mutationFn: async ({ itemId, payload }) => {
      const { data } = await api.put(`/inventory/items/${itemId}`, payload);
      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['entry-detail', selectedEntry] });
      await queryClient.invalidateQueries({ queryKey: ['supplier-entries', remitosSupplier] });
      setEditingItemId(null);
      addToast('Producto actualizado correctamente');
    },
    onError: () => {
      addToast('Error al actualizar producto. Verificá los datos.', 'error');
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (itemId) => {
      const { data } = await api.delete(`/inventory/items/${itemId}`);
      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['entry-detail', selectedEntry] });
      await queryClient.invalidateQueries({ queryKey: ['supplier-entries', remitosSupplier] });
      setDeletingItemId(null);
      addToast('Producto eliminado correctamente');
    },
    onError: () => {
      addToast('Error al eliminar producto. Intenta nuevamente.', 'error');
    },
  });

  const deleteEntryMutation = useMutation({
    mutationFn: async (entryId) => {
      const { data } = await api.delete(`/inventory/entries/${entryId}`);
      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['supplier-entries', remitosSupplier] });
      await queryClient.invalidateQueries({ queryKey: ['supplier-balance', remitosSupplier] });
      setSelectedEntry(null);
      setDeletingEntryId(null);
      addToast('Remito eliminado correctamente');
    },
    onError: () => {
      addToast('Error al eliminar remito. Intenta nuevamente.', 'error');
    },
  });

  const createAdjustmentMutation = useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post('/inventory/entries', payload);
      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['supplier-entries', remitosSupplier] });
      await queryClient.invalidateQueries({ queryKey: ['supplier-balance', remitosSupplier] });
      setShowAdjustmentModal(false);
      setAdjustmentForm({
        entry_date: new Date().toISOString().split('T')[0],
        total_debe: '',
        adjustment_notes: '',
      });
      addToast('Ajuste de saldo registrado correctamente');
    },
    onError: () => {
      addToast('Error al registrar ajuste. Verificá los datos.', 'error');
    },
  });

  const handleStartEdit = (item) => {
    const weights = Array.isArray(item.weights) ? item.weights : [];
    const ut = item.unit_type || 'kg';
    setEditForm({
      product_name: item.product_name || '',
      weights: ut === 'u' ? (weights[0]?.toString() || '') : weights.join(', '),
      unit_price: item.unit_price?.toString() || '',
      unit_type: ut,
    });
    setEditingItemId(item.id);
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setEditForm({ product_name: '', weights: '', unit_price: '', unit_type: 'kg' });
  };

  const handleSubmitEdit = (e) => {
    e.preventDefault();
    const ut = editForm.unit_type || 'kg';
    if (ut === 'u') {
      const qty = Number(editForm.weights);
      if (!editForm.product_name.trim() || qty <= 0 || !editForm.unit_price) return;
      updateItemMutation.mutate({
        itemId: editingItemId,
        payload: {
          product_name: editForm.product_name.trim(),
          unit_type: 'u',
          quantity: qty,
          unit_price: Number(editForm.unit_price),
        },
      });
    } else {
      const weights = editForm.weights
        .split(/[,;\s-]+/)
        .map(Number)
        .filter((n) => !isNaN(n) && n > 0);
      if (!editForm.product_name.trim() || weights.length === 0 || !editForm.unit_price) return;
      updateItemMutation.mutate({
        itemId: editingItemId,
        payload: {
          product_name: editForm.product_name.trim(),
          unit_type: 'kg',
          weights,
          unit_price: Number(editForm.unit_price),
        },
      });
    }
  };

  const handleConfirmDelete = () => {
    if (deletingItemId) {
      deleteItemMutation.mutate(deletingItemId);
    }
  };

  const updatePaymentMutation = useMutation({
    mutationFn: async ({ paymentId, payload }) => {
      const { data } = await api.put(`/inventory/payments/${paymentId}`, payload);
      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['supplier-payments', remitosSupplier] });
      await queryClient.invalidateQueries({ queryKey: ['supplier-balance', remitosSupplier] });
      setEditingPaymentId(null);
      addToast('Pago actualizado correctamente');
    },
    onError: () => {
      addToast('Error al actualizar pago. Verificá los datos.', 'error');
    },
  });

  const deletePaymentMutation = useMutation({
    mutationFn: async (paymentId) => {
      const { data } = await api.delete(`/inventory/payments/${paymentId}`);
      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['supplier-payments', remitosSupplier] });
      await queryClient.invalidateQueries({ queryKey: ['supplier-balance', remitosSupplier] });
      setDeletingPaymentId(null);
      addToast('Pago eliminado correctamente');
    },
    onError: () => {
      addToast('Error al eliminar pago. Intenta nuevamente.', 'error');
    },
  });

  const handleStartEditPayment = (pay) => {
    setEditPaymentForm({
      payment_date: pay.payment_date ? pay.payment_date.split('T')[0] : '',
      method: pay.method || '',
      amount_haber: pay.amount_haber?.toString() || '',
    });
    setEditingPaymentId(pay.id);
  };

  const handleCancelEditPayment = () => {
    setEditingPaymentId(null);
    setEditPaymentForm({ payment_date: '', method: '', amount_haber: '' });
  };

  const handleSubmitEditPayment = (e) => {
    e.preventDefault();
    const amount = Number(editPaymentForm.amount_haber);
    if (amount <= 0 || isNaN(amount)) return;
    if (!editPaymentForm.payment_date) return;
    const validMethods = ['efectivo', 'transferencia'];
    if (!validMethods.includes(editPaymentForm.method.toLowerCase().trim())) return;
    updatePaymentMutation.mutate({
      paymentId: editingPaymentId,
      payload: {
        payment_date: editPaymentForm.payment_date,
        method: editPaymentForm.method.toLowerCase().trim(),
        amount_haber: amount,
      },
    });
  };

  const handleConfirmDeletePayment = () => {
    if (deletingPaymentId) {
      deletePaymentMutation.mutate(deletingPaymentId);
    }
  };

  const fmtMoney = (n) => Number(n).toLocaleString('es-AR', { minimumFractionDigits: 2 });
  const fmtMethod = (m) => (m ? m.charAt(0).toUpperCase() + m.slice(1) : '—');

  return (
    <>
      <div className="space-y-6">
        <div className="bg-white shadow-lg rounded-2xl border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-700" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg sm:text-xl font-heading font-extrabold text-text-dark">Cuenta Corriente</h2>
              <p className="text-xs sm:text-sm text-text-dark/60">Seleccioná un proveedor para ver su cuenta corriente</p>
            </div>
            {remitosSupplier && (
              <button
                onClick={() => { setRemitosSupplier(null); setSelectedEntry(null); setSearchTerm(''); setSupplierTab('remitos'); }}
                className="px-3 py-2 rounded-xl border-2 border-gray-200 font-bold text-xs sm:text-sm hover:border-primary transition"
                style={{ color: '#111827' }}
              >
                ← Volver
              </button>
            )}
          </div>

          {!remitosSupplier ? (
            loadingSuppliers ? (
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
                    onClick={() => setRemitosSupplier(s.id)}
                    className="p-4 rounded-xl border-2 border-gray-200 hover:border-primary/40 bg-white text-left transition-all"
                  >
                    <div className="font-extrabold text-sm sm:text-base" style={{ color: '#111827' }}>{s.name}</div>
                    <div className="text-xs mt-1" style={{ color: '#6b7280' }}>{s.category || 'Sin categoría'}</div>
                  </button>
                ))}
              </div>
            )
          ) : (
            <>
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setSupplierTab('remitos')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                    supplierTab === 'remitos'
                      ? 'bg-primary text-white shadow-lg'
                      : 'bg-white text-gray-900 border border-gray-200 hover:border-primary'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  Remitos
                </button>
                <button
                  onClick={() => setSupplierTab('pagos')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                    supplierTab === 'pagos'
                      ? 'bg-primary text-white shadow-lg'
                      : 'bg-white text-gray-900 border border-gray-200 hover:border-primary'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  Historial de Pagos
                </button>
              </div>

              {supplierTab === 'remitos' && (
                <>
                  {loadingEntries ? (
                    <div className="text-center py-6 flex items-center justify-center gap-2 text-text-dark/60">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Cargando remitos...
                    </div>
                  ) : errorEntries ? (
                    <div className="text-center py-6 text-red-600 flex items-center justify-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      Error al cargar remitos.
                    </div>
                  ) : (supplierEntries || []).length === 0 ? (
                    <div className="text-center py-8 text-text-dark/50">
                      <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
                      No hay remitos registrados para este proveedor.
                    </div>
                  ) : (
                    <>
                      <div className="relative mb-4 flex gap-2">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            type="text"
                            placeholder="Buscar por número de remito..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-10 py-2.5 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition text-sm font-bold text-gray-900 placeholder:text-gray-400"
                          />
                          {searchTerm && (
                            <button
                              onClick={() => setSearchTerm('')}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primary transition"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        <button
                          onClick={() => setShowAdjustmentModal(true)}
                          className="px-3 py-2.5 rounded-xl font-bold text-xs bg-primary text-white hover:bg-secondary transition flex items-center gap-1.5 whitespace-nowrap"
                        >
                          <Wallet className="w-4 h-4" />
                          + Ajuste / Saldo Inicial
                        </button>
                      </div>

                      {filteredEntries.length === 0 ? (
                        <div className="text-center py-8 text-text-dark/50">
                          <Search className="w-10 h-10 mx-auto mb-2 opacity-30" />
                          No se encontraron remitos con ese número.
                        </div>
                      ) : (
                        <>
                          <div className="hidden sm:block overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b-2 border-gray-200">
                                  <th className="text-left py-3 px-4 font-bold" style={{ color: '#111827' }}>Fecha</th>
                                  <th className="text-left py-3 px-4 font-bold" style={{ color: '#111827' }}>N° Remito</th>
                                  <th className="text-right py-3 px-4 font-bold" style={{ color: '#111827' }}>Monto Total</th>
                                  <th className="text-right py-3 px-4 font-bold" style={{ color: '#111827' }}>Acción</th>
                                </tr>
                              </thead>
                              <tbody>
                                {filteredEntries.map((entry) => {
                                  const isAdj = entry.is_adjustment === true;
                                  return (
                                  <tr
                                    key={entry.id}
                                    className={`border-b border-gray-100 hover:bg-gray-50 transition ${isAdj ? 'bg-amber-50/50' : ''}`}
                                  >
                                    <td
                                      className="py-3 px-4 font-bold cursor-pointer"
                                      style={{ color: '#111827' }}
                                      onClick={() => !isAdj && setSelectedEntry(entry.id)}
                                    >
                                      {new Date(entry.entry_date).toLocaleDateString('es-AR')}
                                    </td>
                                    <td
                                      className="py-3 px-4 cursor-pointer"
                                      style={{ color: '#6b7280' }}
                                      onClick={() => !isAdj && setSelectedEntry(entry.id)}
                                    >
                                      {isAdj ? (
                                        <span className="inline-flex items-center gap-1.5">
                                          <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-amber-200 text-amber-800 uppercase tracking-wide">Ajuste</span>
                                          {entry.adjustment_notes || '—'}
                                        </span>
                                      ) : (entry.invoice_number || '—')}
                                    </td>
                                    <td
                                      className="py-3 px-4 text-right font-extrabold cursor-pointer"
                                      style={{ color: '#8B0000' }}
                                      onClick={() => !isAdj && setSelectedEntry(entry.id)}
                                    >
                                      ${fmtMoney(entry.total_debe)}
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                      <div className="flex items-center justify-end gap-2">
                                        {isAdj ? (
                                          <span className="text-xs text-amber-700 font-bold italic">
                                            Ajuste manual
                                          </span>
                                        ) : (
                                          <button
                                            onClick={() => setSelectedEntry(entry.id)}
                                            className="text-xs font-bold px-2 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 transition"
                                            style={{ color: '#8B0000' }}
                                          >
                                            Ver detalle
                                          </button>
                                        )}
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setDeletingEntryId(entry.id);
                                          }}
                                          className="p-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition"
                                          title="Eliminar remito"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>

                          <div className="sm:hidden space-y-3">
                            {filteredEntries.map((entry) => {
                              const isAdj = entry.is_adjustment === true;
                              return (
                              <div
                                key={entry.id}
                                className={`p-4 rounded-xl border-2 border-gray-200 hover:border-primary/40 transition-all ${isAdj ? 'bg-amber-50/50 border-amber-200' : 'bg-white'}`}
                              >
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <div className="font-bold text-sm" style={{ color: '#111827' }}>
                                      {new Date(entry.entry_date).toLocaleDateString('es-AR')}
                                    </div>
                                    {isAdj ? (
                                      <div className="flex items-center gap-1.5 mt-0.5">
                                        <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-amber-200 text-amber-800 uppercase tracking-wide">Ajuste</span>
                                        <span className="text-xs" style={{ color: '#6b7280' }}>{entry.adjustment_notes || ''}</span>
                                      </div>
                                    ) : (
                                      <div className="text-xs mt-0.5" style={{ color: '#6b7280' }}>
                                        Remito: {entry.invoice_number || '—'}
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="text-right">
                                      <div className="font-extrabold text-base" style={{ color: '#8B0000' }}>
                                        ${fmtMoney(entry.total_debe)}
                                      </div>
                                      {isAdj ? (
                                        <div className="text-[10px] font-bold mt-0.5 text-amber-700 italic">
                                          Ajuste manual
                                        </div>
                                      ) : (
                                        <button
                                          onClick={() => setSelectedEntry(entry.id)}
                                          className="text-[10px] font-bold mt-0.5"
                                          style={{ color: '#8B0000' }}
                                        >
                                          Ver detalle →
                                        </button>
                                      )}
                                    </div>
                                    <button
                                      onClick={() => setDeletingEntryId(entry.id)}
                                      className="p-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition"
                                      title="Eliminar remito"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </>
                  )}
                </>
              )}

              {supplierTab === 'pagos' && (
                <>
                  {loadingPayments ? (
                    <div className="text-center py-6 flex items-center justify-center gap-2 text-text-dark/60">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Cargando pagos...
                    </div>
                  ) : errorPayments ? (
                    <div className="text-center py-6 text-red-600 flex items-center justify-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      Error al cargar pagos.
                    </div>
                  ) : (supplierPayments || []).length === 0 ? (
                    <div className="text-center py-8 text-text-dark/50">
                      <Wallet className="w-10 h-10 mx-auto mb-2 opacity-30" />
                      No se registraron pagos para este proveedor todavía.
                    </div>
                  ) : (
                    <>
                      <div className="hidden sm:block overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b-2 border-gray-200">
                              <th className="text-left py-3 px-4 font-bold" style={{ color: '#111827' }}>Fecha de Pago</th>
                              <th className="text-left py-3 px-4 font-bold" style={{ color: '#111827' }}>Método</th>
                              <th className="text-right py-3 px-4 font-bold" style={{ color: '#111827' }}>Monto (Haber)</th>
                              <th className="text-right py-3 px-4 font-bold" style={{ color: '#111827' }}>Acción</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(supplierPayments || []).map((pay) => {
                              const isEditing = editingPaymentId === pay.id;
                              if (isEditing) {
                                return (
                                  <tr key={pay.id}>
                                    <td colSpan={4} className="py-3 px-4">
                                      <form onSubmit={handleSubmitEditPayment} className="bg-blue-50 rounded-xl p-3 border-2 border-blue-200 space-y-3">
                                        <div className="flex items-center justify-between mb-1">
                                          <span className="font-extrabold text-sm" style={{ color: '#111827' }}>Editando pago</span>
                                          <button type="button" onClick={handleCancelEditPayment} className="text-gray-400 hover:text-gray-600">
                                            <X className="w-4 h-4" />
                                          </button>
                                        </div>
                                        <div className="grid grid-cols-3 gap-3">
                                          <div>
                                            <label className="block text-xs font-bold mb-1" style={{ color: '#111827' }}>Fecha *</label>
                                            <input
                                              type="date"
                                              value={editPaymentForm.payment_date}
                                              onChange={(e) => setEditPaymentForm((prev) => ({ ...prev, payment_date: e.target.value }))}
                                              className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition text-sm"
                                              style={{ color: '#111827' }}
                                              required
                                            />
                                          </div>
                                          <div>
                                            <label className="block text-xs font-bold mb-1" style={{ color: '#111827' }}>Método *</label>
                                            <select
                                              value={editPaymentForm.method}
                                              onChange={(e) => setEditPaymentForm((prev) => ({ ...prev, method: e.target.value }))}
                                              className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition text-sm"
                                              style={{ color: '#111827' }}
                                              required
                                            >
                                              <option value="efectivo">Efectivo</option>
                                              <option value="transferencia">Transferencia</option>
                                            </select>
                                          </div>
                                          <div>
                                            <label className="block text-xs font-bold mb-1" style={{ color: '#111827' }}>Monto ($) *</label>
                                            <input
                                              type="number"
                                              inputMode="decimal"
                                              value={editPaymentForm.amount_haber}
                                              onChange={(e) => setEditPaymentForm((prev) => ({ ...prev, amount_haber: e.target.value }))}
                                              className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition text-sm"
                                              style={{ color: '#111827' }}
                                              required
                                            />
                                          </div>
                                        </div>
                                        <div className="flex gap-2 justify-end pt-1">
                                          <button
                                            type="button"
                                            onClick={handleCancelEditPayment}
                                            className="px-3 py-1.5 rounded-lg border-2 border-gray-200 font-bold text-xs hover:border-primary transition"
                                            style={{ color: '#111827' }}
                                          >
                                            Cancelar
                                          </button>
                                          <button
                                            type="submit"
                                            disabled={updatePaymentMutation.isPending}
                                            className="px-4 py-1.5 rounded-lg font-bold text-xs bg-primary text-white hover:bg-secondary transition disabled:opacity-60 flex items-center gap-1.5"
                                          >
                                            {updatePaymentMutation.isPending ? (
                                              <>
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                Guardando...
                                              </>
                                            ) : (
                                              <>
                                                <CheckCircle className="w-3.5 h-3.5" />
                                                Guardar
                                              </>
                                            )}
                                          </button>
                                        </div>
                                      </form>
                                    </td>
                                  </tr>
                                );
                              }
                              return (
                                <tr key={pay.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                                  <td className="py-3 px-4 font-bold" style={{ color: '#111827' }}>
                                    {new Date(pay.payment_date).toLocaleDateString('es-AR')}
                                  </td>
                                  <td className="py-3 px-4" style={{ color: '#6b7280' }}>
                                    {fmtMethod(pay.method)}
                                  </td>
                                  <td className="py-3 px-4 text-right font-extrabold" style={{ color: '#16a34a' }}>
                                    ${fmtMoney(pay.amount_haber)}
                                  </td>
                                  <td className="py-3 px-4 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                      <button
                                        onClick={() => handleStartEditPayment(pay)}
                                        className="p-1.5 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
                                        title="Editar"
                                      >
                                        <Pencil className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => setDeletingPaymentId(pay.id)}
                                        className="p-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition"
                                        title="Eliminar"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      <div className="sm:hidden space-y-3">
                        {(supplierPayments || []).map((pay) => {
                          const isEditing = editingPaymentId === pay.id;
                          if (isEditing) {
                            return (
                              <form key={pay.id} onSubmit={handleSubmitEditPayment} className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200 space-y-3">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-extrabold text-sm" style={{ color: '#111827' }}>Editando pago</span>
                                  <button type="button" onClick={handleCancelEditPayment} className="text-gray-400 hover:text-gray-600">
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                                <div className="space-y-3">
                                  <div>
                                    <label className="block text-xs font-bold mb-1" style={{ color: '#111827' }}>Fecha *</label>
                                    <input
                                      type="date"
                                      value={editPaymentForm.payment_date}
                                      onChange={(e) => setEditPaymentForm((prev) => ({ ...prev, payment_date: e.target.value }))}
                                      className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition text-sm"
                                      style={{ color: '#111827' }}
                                      required
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-bold mb-1" style={{ color: '#111827' }}>Método *</label>
                                    <select
                                      value={editPaymentForm.method}
                                      onChange={(e) => setEditPaymentForm((prev) => ({ ...prev, method: e.target.value }))}
                                      className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition text-sm"
                                      style={{ color: '#111827' }}
                                      required
                                    >
                                      <option value="efectivo">Efectivo</option>
                                      <option value="transferencia">Transferencia</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="block text-xs font-bold mb-1" style={{ color: '#111827' }}>Monto ($) *</label>
                                    <input
                                      type="number"
                                      inputMode="decimal"
                                      value={editPaymentForm.amount_haber}
                                      onChange={(e) => setEditPaymentForm((prev) => ({ ...prev, amount_haber: e.target.value }))}
                                      className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition text-sm"
                                      style={{ color: '#111827' }}
                                      required
                                    />
                                  </div>
                                </div>
                                <div className="flex gap-2 justify-end pt-1">
                                  <button
                                    type="button"
                                    onClick={handleCancelEditPayment}
                                    className="px-3 py-1.5 rounded-lg border-2 border-gray-200 font-bold text-xs hover:border-primary transition"
                                    style={{ color: '#111827' }}
                                  >
                                    Cancelar
                                  </button>
                                  <button
                                    type="submit"
                                    disabled={updatePaymentMutation.isPending}
                                    className="px-4 py-1.5 rounded-lg font-bold text-xs bg-primary text-white hover:bg-secondary transition disabled:opacity-60 flex items-center gap-1.5"
                                  >
                                    {updatePaymentMutation.isPending ? (
                                      <>
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        Guardando...
                                      </>
                                    ) : (
                                      <>
                                        <CheckCircle className="w-3.5 h-3.5" />
                                        Guardar
                                      </>
                                    )}
                                  </button>
                                </div>
                              </form>
                            );
                          }
                          return (
                            <div key={pay.id} className="p-4 rounded-xl border-2 border-gray-200 bg-white">
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="font-bold text-sm" style={{ color: '#111827' }}>
                                    {new Date(pay.payment_date).toLocaleDateString('es-AR')}
                                  </div>
                                  <div className="text-xs mt-0.5" style={{ color: '#6b7280' }}>
                                    {fmtMethod(pay.method)}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="font-extrabold text-base" style={{ color: '#16a34a' }}>
                                    ${fmtMoney(pay.amount_haber)}
                                  </span>
                                  <button
                                    onClick={() => handleStartEditPayment(pay)}
                                    className="p-1.5 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
                                    title="Editar"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => setDeletingPaymentId(pay.id)}
                                    className="p-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition"
                                    title="Eliminar"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>

      {selectedEntry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center px-4 z-50" onClick={() => setSelectedEntry(null)}>
          <div className="w-full max-w-lg max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {loadingDetail ? (
              <div className="flex items-center justify-center py-12 gap-2 text-text-dark/60">
                <Loader2 className="w-5 h-5 animate-spin" />
                Cargando detalle...
              </div>
            ) : entryDetail ? (
              <>
                <div className="p-4 sm:p-5 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg sm:text-xl font-heading font-extrabold" style={{ color: '#111827' }}>Detalle del Remito</h2>
                      <p className="text-xs sm:text-sm mt-0.5" style={{ color: '#6b7280' }}>
                        {new Date(entryDetail.entry.entry_date).toLocaleDateString('es-AR')}
                        {entryDetail.entry.invoice_number ? ` — ${entryDetail.entry.invoice_number}` : ''}
                      </p>
                    </div>
                    <button onClick={() => setSelectedEntry(null)} className="text-gray-400 hover:text-gray-600">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="mt-3 flex items-center gap-2 bg-red-50 rounded-xl px-3 py-2">
                    <DollarSign className="w-4 h-4 text-red-700" />
                    <span className="font-extrabold text-red-700">
                      Total: ${fmtMoney(entryDetail.entry.total_debe)}
                    </span>
                  </div>
                </div>
                <div className="p-4 sm:p-5 overflow-y-auto max-h-[55vh] space-y-3">
                  {entryDetail.items.map((item, idx) => {
                    const isEditing = editingItemId === item.id;
                    const weights = Array.isArray(item.weights) ? item.weights : [];
                    const ut = item.unit_type || 'kg';
                    const totalWeight = weights.reduce((s, w) => s + Number(w), 0);

                    if (isEditing) {
                      return (
                        <form key={item.id} onSubmit={handleSubmitEdit} className="bg-blue-50 rounded-xl p-3 sm:p-4 border-2 border-blue-200 space-y-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-extrabold text-sm" style={{ color: '#111827' }}>
                              Editando: {item.product_name}
                            </span>
                            <button type="button" onClick={handleCancelEdit} className="text-gray-400 hover:text-gray-600">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-xs font-bold mb-1" style={{ color: '#111827' }}>Nombre *</label>
                              <input
                                type="text"
                                value={editForm.product_name}
                                onChange={(e) => setEditForm((prev) => ({ ...prev, product_name: e.target.value }))}
                                className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition text-sm"
                                style={{ color: '#111827' }}
                                required
                              />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <label className="block text-xs font-bold" style={{ color: '#111827' }}>
                                  {editForm.unit_type === 'u' ? 'Cantidad (u)' : 'Pesos (kg)'} *
                                </label>
                                <div className="flex rounded-lg border-2 border-gray-200 overflow-hidden">
                                  <button
                                    type="button"
                                    onClick={() => setEditForm((prev) => ({ ...prev, unit_type: 'kg' }))}
                                    className={`px-2 py-0.5 text-[10px] font-bold transition ${
                                      editForm.unit_type !== 'u'
                                        ? 'bg-primary text-white'
                                        : 'bg-white text-gray-500 hover:bg-gray-50'
                                    }`}
                                  >
                                    Kg
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditForm((prev) => ({ ...prev, unit_type: 'u' }))}
                                    className={`px-2 py-0.5 text-[10px] font-bold transition ${
                                      editForm.unit_type === 'u'
                                        ? 'bg-primary text-white'
                                        : 'bg-white text-gray-500 hover:bg-gray-50'
                                    }`}
                                  >
                                    U
                                  </button>
                                </div>
                              </div>
                              {editForm.unit_type === 'u' ? (
                                <input
                                  type="number"
                                  step="0.01"
                                  inputMode="decimal"
                                  value={editForm.weights}
                                  onChange={(e) => setEditForm((prev) => ({ ...prev, weights: e.target.value }))}
                                  className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition text-sm"
                                  style={{ color: '#111827' }}
                                  placeholder="3"
                                  required
                                />
                              ) : (
                                <input
                                  type="text"
                                  value={editForm.weights}
                                  onChange={(e) => setEditForm((prev) => ({ ...prev, weights: e.target.value }))}
                                  className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition text-sm"
                                  style={{ color: '#111827' }}
                                  placeholder="94, 95, 99"
                                  required
                                />
                              )}
                            </div>
                            <div>
                              <label className="block text-xs font-bold mb-1" style={{ color: '#111827' }}>
                                Precio/{editForm.unit_type === 'u' ? 'u' : 'kg'} ($) *
                              </label>
                              <input
                                type="number"
                                inputMode="decimal"
                                value={editForm.unit_price}
                                onChange={(e) => setEditForm((prev) => ({ ...prev, unit_price: e.target.value }))}
                                className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition text-sm"
                                style={{ color: '#111827' }}
                                required
                              />
                            </div>
                          </div>
                          <div className="flex gap-2 justify-end pt-1">
                            <button
                              type="button"
                              onClick={handleCancelEdit}
                              className="px-3 py-1.5 rounded-lg border-2 border-gray-200 font-bold text-xs hover:border-primary transition"
                              style={{ color: '#111827' }}
                            >
                              Cancelar
                            </button>
                            <button
                              type="submit"
                              disabled={updateItemMutation.isPending}
                              className="px-4 py-1.5 rounded-lg font-bold text-xs bg-primary text-white hover:bg-secondary transition disabled:opacity-60 flex items-center gap-1.5"
                            >
                              {updateItemMutation.isPending ? (
                                <>
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  Guardando...
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="w-3.5 h-3.5" />
                                  Guardar
                                </>
                              )}
                            </button>
                          </div>
                        </form>
                      );
                    }

                    return (
                      <div key={item.id} className="bg-gray-50 rounded-xl p-3 sm:p-4 border border-gray-200">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-extrabold text-sm sm:text-base" style={{ color: '#111827' }}>
                            {idx + 1}. {item.product_name}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm" style={{ color: '#8B0000' }}>
                              ${fmtMoney(item.total_item)}
                            </span>
                            <button
                              onClick={() => handleStartEdit(item)}
                              className="p-1.5 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
                              title="Editar"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeletingItemId(item.id)}
                              className="p-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition"
                              title="Eliminar"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs" style={{ color: '#6b7280' }}>
                          {ut === 'u' ? (
                            <>
                              <div>
                                <span className="font-bold">Cantidad:</span> {totalWeight} u
                              </div>
                              <div>
                                <span className="font-bold">Precio/u:</span> ${fmtMoney(item.unit_price)}
                              </div>
                            </>
                          ) : (
                            <>
                              <div>
                                <span className="font-bold">Pesos:</span>{' '}
                                {weights.length > 0 ? weights.join(', ') : '—'}
                              </div>
                              <div>
                                <span className="font-bold">Total kg:</span> {totalWeight.toFixed(2)}
                              </div>
                              <div>
                                <span className="font-bold">Precio/kg:</span> ${fmtMoney(item.unit_price)}
                              </div>
                            </>
                          )}
                          <div>
                            <span className="font-bold">Subtotal:</span>{' '}
                            <span style={{ color: '#8B0000' }}>${fmtMoney(item.total_item)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}

      {deletingEntryId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center px-4 z-[60]" onClick={() => setDeletingEntryId(null)}>
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-gray-200 p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-700" />
              </div>
              <h3 className="text-base sm:text-lg font-heading font-extrabold" style={{ color: '#111827' }}>
                ¿Eliminar remito completo?
              </h3>
            </div>
            <p className="text-sm text-text-dark/70 mb-5">
              Esta acción no se puede deshacer. Se eliminarán todos los productos cargados en el remito y el saldo del proveedor se actualizará automáticamente.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeletingEntryId(null)}
                className="px-4 py-2 rounded-xl border-2 border-gray-200 font-bold text-sm hover:border-primary transition"
                style={{ color: '#111827' }}
              >
                Cancelar
              </button>
              <button
                onClick={() => deleteEntryMutation.mutate(deletingEntryId)}
                disabled={deleteEntryMutation.isPending}
                className="px-4 py-2 rounded-xl font-bold text-sm bg-red-700 text-white hover:bg-red-800 transition disabled:opacity-60 flex items-center gap-2"
              >
                {deleteEntryMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Eliminar remito
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {deletingItemId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center px-4 z-[60]" onClick={() => setDeletingItemId(null)}>
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-gray-200 p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-700" />
              </div>
              <h3 className="text-base sm:text-lg font-heading font-extrabold" style={{ color: '#111827' }}>
                ¿Eliminar producto?
              </h3>
            </div>
            <p className="text-sm text-text-dark/70 mb-5">
              Esta acción no se puede deshacer. El producto será eliminado del remito y el total se recalculará automáticamente.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeletingItemId(null)}
                className="px-4 py-2 rounded-xl border-2 border-gray-200 font-bold text-sm hover:border-primary transition"
                style={{ color: '#111827' }}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleteItemMutation.isPending}
                className="px-4 py-2 rounded-xl font-bold text-sm bg-red-700 text-white hover:bg-red-800 transition disabled:opacity-60 flex items-center gap-2"
              >
                {deleteItemMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {deletingPaymentId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center px-4 z-[60]" onClick={() => setDeletingPaymentId(null)}>
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-gray-200 p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-700" />
              </div>
              <h3 className="text-base sm:text-lg font-heading font-extrabold" style={{ color: '#111827' }}>
                ¿Eliminar pago?
              </h3>
            </div>
            <p className="text-sm text-text-dark/70 mb-5">
              Esta acción no se puede deshacer. El pago será eliminado y el saldo pendiente se actualizará automáticamente.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeletingPaymentId(null)}
                className="px-4 py-2 rounded-xl border-2 border-gray-200 font-bold text-sm hover:border-primary transition"
                style={{ color: '#111827' }}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDeletePayment}
                disabled={deletePaymentMutation.isPending}
                className="px-4 py-2 rounded-xl font-bold text-sm bg-red-700 text-white hover:bg-red-800 transition disabled:opacity-60 flex items-center gap-2"
              >
                {deletePaymentMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showAdjustmentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center px-4 z-[60]" onClick={() => setShowAdjustmentModal(false)}>
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <Wallet className="w-5 h-5 text-amber-700" />
              </div>
              <h3 className="text-base sm:text-lg font-heading font-extrabold" style={{ color: '#111827' }}>
                Cargar Ajuste / Saldo Inicial
              </h3>
            </div>
            <p className="text-sm text-text-dark/70 mb-4">
              Registra un ajuste manual en la cuenta corriente del proveedor. No requiere carga de productos.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const amount = Number(adjustmentForm.total_debe);
                if (!amount) return;
                createAdjustmentMutation.mutate({
                  supplier_id: remitosSupplier,
                  is_adjustment: true,
                  entry_date: adjustmentForm.entry_date,
                  total_debe: amount,
                  adjustment_notes: adjustmentForm.adjustment_notes.trim() || null,
                });
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-xs font-bold mb-1" style={{ color: '#111827' }}>Fecha *</label>
                <input
                  type="date"
                  value={adjustmentForm.entry_date}
                  onChange={(e) => setAdjustmentForm((prev) => ({ ...prev, entry_date: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition text-sm"
                  style={{ color: '#111827' }}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1" style={{ color: '#111827' }}>Monto del Ajuste ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  inputMode="decimal"
                  value={adjustmentForm.total_debe}
                  onChange={(e) => setAdjustmentForm((prev) => ({ ...prev, total_debe: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition text-sm"
                  style={{ color: '#111827' }}
                  placeholder="Ej: 150000 o -50000"
                  required
                />
                <p className="text-[10px] text-text-dark/50 mt-1">Usá valor positivo (deuda) o negativo (descuento)</p>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1" style={{ color: '#111827' }}>Observaciones / Notas</label>
                <textarea
                  value={adjustmentForm.adjustment_notes}
                  onChange={(e) => setAdjustmentForm((prev) => ({ ...prev, adjustment_notes: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition text-sm resize-none"
                  style={{ color: '#111827' }}
                  rows={2}
                  placeholder="Ej: Saldo de arrastre previo al sistema"
                />
              </div>
              <div className="flex gap-3 justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setShowAdjustmentModal(false)}
                  className="px-4 py-2 rounded-xl border-2 border-gray-200 font-bold text-sm hover:border-primary transition"
                  style={{ color: '#111827' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createAdjustmentMutation.isPending || !adjustmentForm.total_debe}
                  className="px-4 py-2 rounded-xl font-bold text-sm bg-amber-600 text-white hover:bg-amber-700 transition disabled:opacity-60 flex items-center gap-2"
                >
                  {createAdjustmentMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Wallet className="w-4 h-4" />
                      Registrar Ajuste
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

RemitosHistory.propTypes = {
  addToast: PropTypes.func.isRequired,
};

export default RemitosHistory;
