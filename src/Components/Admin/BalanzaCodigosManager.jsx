import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../api/api';
import {
  Search, Plus, Printer, Loader2, AlertCircle, Pencil, Trash2, X, Scale,
} from 'lucide-react';

const CATEGORIES = ['Carnes', 'Pollos', 'Cerdo', 'Achuras', 'Congelados', 'Pescados', 'Ofertas', 'Varios'];
const FILTERS = ['Todas', ...CATEGORIES];
const QUERY_KEY = ['balanza-codigos'];
const EMPTY_FORM = { codigo: '', nombre: '', categoria: CATEGORIES[0] };

const categoryOrder = (cat) => {
  const idx = CATEGORIES.findIndex((c) => c.toLowerCase() === String(cat).toLowerCase());
  return idx === -1 ? CATEGORIES.length : idx;
};

const Switch = ({ checked, onChange, disabled, label }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    disabled={disabled}
    onClick={onChange}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 ${
      checked ? 'bg-green-500' : 'bg-gray-300'
    }`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
        checked ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </button>
);

Switch.propTypes = {
  checked: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  label: PropTypes.string,
};

const BalanzaCodigosManager = ({ addToast }) => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  const { data: codigos, isLoading, isError } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const { data } = await api.get('/balanza-codigos');
      return data;
    },
  });

  const all = useMemo(() => codigos || [], [codigos]);

  const visibleRows = useMemo(() => {
    const term = search.toLowerCase().trim();
    return all.filter((c) => {
      if (selectedCategory !== 'Todas' && c.categoria !== selectedCategory) return false;
      if (!term) return true;
      return c.nombre?.toLowerCase().includes(term) || String(c.codigo).includes(term);
    });
  }, [all, search, selectedCategory]);

  const categoryRows = useMemo(
    () => (selectedCategory === 'Todas' ? [] : all.filter((c) => c.categoria === selectedCategory)),
    [all, selectedCategory]
  );
  const categoryAllActive = categoryRows.length > 0 && categoryRows.every((c) => c.activo);

  const printTotal = all.filter((c) => c.activo === true).length;
  const printDense = printTotal > 90;

  const printGroups = useMemo(() => {
    const groups = {};
    all.filter((c) => c.activo === true).forEach((c) => {
      (groups[c.categoria] = groups[c.categoria] || []).push(c);
    });
    return Object.entries(groups)
      .sort(([a], [b]) => categoryOrder(a) - categoryOrder(b) || a.localeCompare(b))
      .map(([categoria, items]) => [categoria, [...items].sort((x, y) => x.codigo - y.codigo)]);
  }, [all]);

  const toggleMutation = useMutation({
    mutationFn: async (id) => {
      const { data } = await api.patch(`/balanza-codigos/${id}/toggle`);
      return data;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY });
      const previous = queryClient.getQueryData(QUERY_KEY);
      queryClient.setQueryData(QUERY_KEY, (old) =>
        (old || []).map((c) => (c.id === id ? { ...c, activo: !c.activo } : c))
      );
      return { previous };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(QUERY_KEY, ctx.previous);
      addToast?.('No se pudo cambiar el estado', 'error');
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  const toggleCategoryMutation = useMutation({
    mutationFn: async ({ categoria, activo }) => {
      const { data } = await api.patch('/balanza-codigos/toggle-categoria', { categoria, activo });
      return data;
    },
    onMutate: async ({ categoria, activo }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY });
      const previous = queryClient.getQueryData(QUERY_KEY);
      queryClient.setQueryData(QUERY_KEY, (old) =>
        (old || []).map((c) => (c.categoria === categoria ? { ...c, activo } : c))
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(QUERY_KEY, ctx.previous);
      addToast?.('No se pudo actualizar la categoría', 'error');
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  const saveMutation = useMutation({
    mutationFn: async (payload) => {
      if (editing) {
        const { data } = await api.put(`/balanza-codigos/${editing.id}`, payload);
        return data;
      }
      const { data } = await api.post('/balanza-codigos', payload);
      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      addToast?.(editing ? 'Código actualizado' : 'Código creado');
      closeModal();
    },
    onError: (err) => {
      setFormError(err?.response?.data?.error || 'No se pudo guardar. Intentá nuevamente.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/balanza-codigos/${id}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      setConfirmDelete(null);
      addToast?.('Código eliminado');
    },
    onError: () => addToast?.('No se pudo eliminar el código', 'error'),
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM, categoria: selectedCategory !== 'Todas' ? selectedCategory : CATEGORIES[0] });
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (c) => {
    setEditing(c);
    setForm({ codigo: String(c.codigo), nombre: c.nombre || '', categoria: c.categoria || CATEGORIES[0] });
    setFormError('');
    setModalOpen(true);
  };

  function closeModal() {
    setModalOpen(false);
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError('');
  }

  const submitForm = (e) => {
    e.preventDefault();
    const codigoNum = Number(form.codigo);
    if (!Number.isInteger(codigoNum) || codigoNum <= 0) {
      setFormError('El código debe ser un número entero positivo');
      return;
    }
    if (!form.nombre.trim()) {
      setFormError('El nombre es obligatorio');
      return;
    }
    saveMutation.mutate({
      codigo: codigoNum,
      nombre: form.nombre.trim(),
      categoria: form.categoria,
      activo: editing ? editing.activo : true,
    });
  };

  const inputClass =
    'w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition text-base md:text-sm text-gray-900 bg-white font-medium placeholder:text-gray-400';

  return (
    <>
      <style>{`
        .print-sheet-wrapper { display: none; }
        @media print {
          @page { size: A4 portrait; margin: 8mm 6mm; }
          body * { visibility: hidden !important; }
          .print-sheet-wrapper, .print-sheet-wrapper * { visibility: visible !important; }
          .print-sheet-wrapper { display: block; position: absolute; left: 0; top: 0; width: 100%; }
          .print-sheet {
            width: 100%;
            column-count: 3;
            column-gap: 16px;
            column-fill: auto;
            font-family: sans-serif;
            color: #000;
            font-size: 14.5px;
            line-height: 1.35;
          }
          .print-sheet.print-dense {
            column-count: 4;
            column-gap: 12px;
            font-size: 13.5px;
          }
          .print-category-block { break-inside: avoid; margin-bottom: 12px; }
          .print-category-block.print-flow { break-inside: auto; }
          .print-category-title {
            font-size: 16px;
            font-weight: 800;
            text-transform: uppercase;
            border-bottom: 1px solid #000;
            padding-bottom: 4px;
            margin-bottom: 6px;
            break-after: avoid;
          }
          .print-item { break-inside: avoid; line-height: 1.35; }
          .print-item strong { font-weight: 800; margin-right: 6px; }
        }
      `}</style>

      <div className="print:hidden space-y-4">
        <div className="bg-white shadow-lg rounded-2xl border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <Scale className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-heading font-extrabold text-text-dark">Códigos de Balanza</h2>
              <p className="text-xs sm:text-sm text-text-dark/60">Gestioná los números de balanza e imprimí la hoja A4</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre o código..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition text-base md:text-sm font-bold text-gray-900 placeholder:text-gray-400"
              />
            </div>
            <button
              onClick={openCreate}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-primary font-bold text-sm bg-white hover:bg-primary hover:text-white transition"
              style={{ color: '#8B0000' }}
            >
              <Plus className="w-4 h-4" />
              Nuevo Código
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-secondary transition"
            >
              <Printer className="w-4 h-4" />
              Imprimir Hoja A4
            </button>
          </div>

          <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
            {FILTERS.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-primary text-white shadow'
                    : 'bg-white text-gray-900 border border-gray-200 hover:border-primary'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {selectedCategory !== 'Todas' && categoryRows.length > 0 && (
            <div className="mt-4 flex items-center justify-between gap-3 bg-gray-50 rounded-xl px-4 py-3">
              <span className="text-sm font-bold text-text-dark">
                {categoryAllActive ? 'Desactivar toda la categoría' : 'Activar toda la categoría'}
                <span className="ml-2 text-xs font-medium text-text-dark/50">({categoryRows.length} códigos)</span>
              </span>
              <Switch
                checked={categoryAllActive}
                label="Activar o desactivar toda la categoría"
                disabled={toggleCategoryMutation.isPending}
                onChange={() => toggleCategoryMutation.mutate({ categoria: selectedCategory, activo: !categoryAllActive })}
              />
            </div>
          )}
        </div>

        <div className="bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-200">
          {isLoading ? (
            <div className="text-center py-10 flex items-center justify-center gap-2 text-text-dark/60">
              <Loader2 className="w-5 h-5 animate-spin" />
              Cargando códigos...
            </div>
          ) : isError ? (
            <div className="text-center py-10 text-red-600 flex items-center justify-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Error al cargar los códigos de balanza.
            </div>
          ) : visibleRows.length === 0 ? (
            <div className="text-center py-10 text-text-dark/60">No hay códigos para mostrar.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs sm:text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-3 sm:px-4 py-2 sm:py-3 font-bold text-text-dark">Código</th>
                    <th className="text-left px-3 sm:px-4 py-2 sm:py-3 font-bold text-text-dark">Nombre</th>
                    <th className="text-left px-3 sm:px-4 py-2 sm:py-3 font-bold text-text-dark hidden sm:table-cell">Categoría</th>
                    <th className="text-left px-3 sm:px-4 py-2 sm:py-3 font-bold text-text-dark">Estado</th>
                    <th className="text-left px-3 sm:px-4 py-2 sm:py-3 font-bold text-text-dark">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.map((c) => (
                    <tr key={c.id} className={`border-t border-gray-100 ${!c.activo ? 'opacity-50 bg-gray-50' : ''}`}>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 font-extrabold text-text-dark">{c.codigo}</td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-text-dark font-medium">{c.nombre}</td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-text-dark/80 hidden sm:table-cell">{c.categoria}</td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3">
                        <Switch
                          checked={!!c.activo}
                          label={`Alternar ${c.nombre}`}
                          onChange={() => toggleMutation.mutate(c.id)}
                        />
                      </td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => openEdit(c)}
                            className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition"
                            title="Editar"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setConfirmDelete(c)}
                            className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 transition"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {modalOpen && (
        <div className="print:hidden fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 sm:px-4">
          <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-base font-heading font-extrabold text-text-dark">
                {editing ? 'Editar Código' : 'Nuevo Código'}
              </h2>
              <button
                onClick={closeModal}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-text-dark/40 hover:text-text-dark hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={submitForm} className="px-5 py-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-dark mb-1.5">Código *</label>
                <input
                  type="number"
                  inputMode="numeric"
                  min="1"
                  step="1"
                  value={form.codigo}
                  onChange={(e) => setForm((p) => ({ ...p, codigo: e.target.value }))}
                  required
                  className={inputClass}
                  placeholder="Ej: 120"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-dark mb-1.5">Nombre *</label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))}
                  required
                  className={inputClass}
                  placeholder="Ej: T-Bone"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-dark mb-1.5">Categoría *</label>
                <select
                  value={form.categoria}
                  onChange={(e) => setForm((p) => ({ ...p, categoria: e.target.value }))}
                  className={inputClass}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              {formError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {formError}
                </div>
              )}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-3 rounded-xl border-2 border-gray-200 font-bold text-sm hover:border-primary transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="flex-1 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-secondary transition disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {saveMutation.isPending ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</>
                  ) : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="print:hidden fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 sm:px-4">
          <div className="w-full sm:max-w-sm bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-5 pt-6 pb-2 text-center">
              <h2 className="text-base font-heading font-extrabold text-text-dark">¿Eliminar código?</h2>
              <p className="text-sm text-text-dark/60 mt-2">
                Vas a eliminar <strong className="text-text-dark">{confirmDelete.codigo} {confirmDelete.nombre}</strong>.
              </p>
            </div>
            <div className="flex gap-3 px-5 py-5">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                disabled={deleteMutation.isPending}
                className="flex-1 py-3 rounded-xl border-2 border-gray-200 font-bold text-sm hover:border-primary transition disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => deleteMutation.mutate(confirmDelete.id)}
                disabled={deleteMutation.isPending}
                className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-700 transition disabled:opacity-60"
              >
                {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="print-sheet-wrapper hidden print:block">
        <div className={`print-sheet${printDense ? ' print-dense' : ''}`}>
          {printGroups.map(([categoria, items]) => (
            <div key={categoria} className={`print-category-block${items.length > 20 ? ' print-flow' : ''}`}>
              <div className="print-category-title">
                {categoria}
              </div>
              {items.map((c) => (
                <div key={c.id} className="print-item">
                  <strong>{c.codigo}</strong> {c.nombre}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

BalanzaCodigosManager.propTypes = {
  addToast: PropTypes.func,
};

export default BalanzaCodigosManager;
