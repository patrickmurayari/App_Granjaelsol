import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../api/api';
import {
  Search, X, ToggleLeft, ToggleRight, Loader2, AlertCircle, Trash2,
} from 'lucide-react';

const ADMIN_CATEGORIES = ['Todas', 'Carnes', 'Cerdo', 'Pollos', 'Achuras', 'Bebidas', 'Snacks', 'Almacén', 'Salsas'];

const EMPTY_EDIT = { nombre: '', precio: '', categoria: '', es_unidad: false, peso_promedio_unidad: '' };

const ProductsManager = ({ addToast }) => {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [searchProd, setSearchProd] = useState('');
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY_EDIT);
  const [togglingId, setTogglingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const {
    data: productos,
    isLoading: loadingProductos,
    isError: errorProductos,
  } = useQuery({
    queryKey: ['productos', selectedCategory],
    queryFn: async () => {
      const params = {};
      if (selectedCategory !== 'Todas') params.categoria = selectedCategory;
      const { data } = await api.get('/productos', { params });
      return data;
    },
  });

  const rows = useMemo(() => {
    const all = productos || [];
    if (!searchProd.trim()) return all;
    const term = searchProd.toLowerCase().trim();
    return all.filter((p) =>
      p.nombre?.toLowerCase().includes(term)
    );
  }, [productos, searchProd]);

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }) => {
      const { data } = await api.put(`/productos/${id}`, payload);
      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['productos'] });
      setEditing(null);
      setEditForm(EMPTY_EDIT);
      addToast?.('Producto actualizado correctamente');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/productos/${id}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['productos'] });
      setConfirmDelete(null);
      addToast?.('Producto eliminado correctamente');
    },
    onError: () => {
      addToast?.('Error al eliminar el producto', 'error');
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, disponible }) => {
      const { data } = await api.put(`/productos/${id}`, { disponible });
      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['productos'] });
      setTogglingId(null);
    },
  });

  const handleToggleDisponible = (p) => {
    setTogglingId(p.id);
    const nuevoEstado = p.disponible === false ? true : false;
    toggleMutation.mutate({ id: p.id, disponible: nuevoEstado });
  };

  const openEdit = (p) => {
    setEditing(p);
    setEditForm({
      nombre: p.nombre || '',
      precio: p.precio ?? '',
      categoria: p.categoria || '',
      es_unidad: p.es_unidad || false,
      peso_promedio_unidad: p.peso_promedio_unidad ?? '',
    });
  };

  const set = (field, value) => setEditForm((prev) => ({ ...prev, [field]: value }));

  const submitEdit = (e) => {
    e.preventDefault();
    if (!editing) return;
    updateMutation.mutate({
      id: editing.id,
      payload: {
        nombre: editForm.nombre.trim() || undefined,
        precio: editForm.precio === '' ? null : Number(editForm.precio),
        categoria: editForm.categoria || undefined,
        es_unidad: editForm.es_unidad,
        peso_promedio_unidad: editForm.peso_promedio_unidad === '' ? null : Number(editForm.peso_promedio_unidad),
      },
    });
  };

  if (loadingProductos) {
    return (
      <div className="text-center py-10 text-lg text-secondary font-heading flex items-center justify-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin" />
        Cargando productos...
      </div>
    );
  }

  if (errorProductos) {
    return (
      <div className="text-center py-10 text-lg text-red-600 font-heading flex items-center justify-center gap-2">
        <AlertCircle className="w-5 h-5" />
        Error al cargar productos.
      </div>
    );
  }

  return (
    <>
      {/* Filtros: categoría + buscador */}
      <div className="mb-4 flex flex-col sm:flex-row gap-3">
        <select
          value={selectedCategory}
          onChange={(e) => { setSelectedCategory(e.target.value); setSearchProd(''); }}
          className="px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition text-sm font-bold text-gray-900 bg-white cursor-pointer"
        >
          {ADMIN_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar producto por nombre..."
            value={searchProd}
            onChange={(e) => setSearchProd(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition text-sm font-bold text-gray-900 placeholder:text-gray-400"
          />
          {searchProd && (
            <button
              onClick={() => setSearchProd('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primary transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {rows.length === 0 && searchProd.trim() ? (
        <div className="bg-white shadow-lg rounded-2xl border border-gray-200 p-8 text-center text-text-dark/60 font-heading">
          No se encontraron productos con ese nombre
        </div>
      ) : (
      <div className="bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs sm:text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-3 sm:px-4 py-2 sm:py-3 font-bold text-text-dark">ID</th>
                <th className="text-left px-3 sm:px-4 py-2 sm:py-3 font-bold text-text-dark">Nombre</th>
                <th className="text-left px-3 sm:px-4 py-2 sm:py-3 font-bold text-text-dark hidden sm:table-cell">Categoría</th>
                <th className="text-left px-3 sm:px-4 py-2 sm:py-3 font-bold text-text-dark">Precio</th>
                <th className="text-left px-3 sm:px-4 py-2 sm:py-3 font-bold text-text-dark hidden sm:table-cell">Tipo</th>
                <th className="text-left px-3 sm:px-4 py-2 sm:py-3 font-bold text-text-dark hidden md:table-cell">Peso Prom.</th>
                <th className="text-left px-3 sm:px-4 py-2 sm:py-3 font-bold text-text-dark">Stock</th>
                <th className="text-left px-3 sm:px-4 py-2 sm:py-3 font-bold text-text-dark">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => {
                const isDisponible = p.disponible !== false;
                const isToggling = togglingId === p.id;
                return (
                  <tr
                    key={p.id}
                    className={`border-t border-gray-100 transition-opacity ${!isDisponible ? 'opacity-50 bg-gray-50' : ''}`}
                  >
                    <td className="px-3 sm:px-4 py-2 sm:py-3 text-text-dark/80">{p.id}</td>
                    <td className="px-3 sm:px-4 py-2 sm:py-3 text-text-dark font-medium">
                      {p.nombre}
                      {!isDisponible && <span className="ml-2 text-xs text-red-500 font-bold">(Sin stock)</span>}
                    </td>
                    <td className="px-3 sm:px-4 py-2 sm:py-3 text-text-dark/80 hidden sm:table-cell">{p.categoria || '-'}</td>
                    <td className="px-3 sm:px-4 py-2 sm:py-3 text-text-dark font-bold">{p.precio != null ? `$${p.precio}` : '-'}</td>
                    <td className="px-3 sm:px-4 py-2 sm:py-3 hidden sm:table-cell">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold ${p.es_unidad ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                        {p.es_unidad ? 'Unidad' : 'Peso'}
                      </span>
                    </td>
                    <td className="px-3 sm:px-4 py-2 sm:py-3 text-text-dark/70 hidden md:table-cell">
                      {p.peso_promedio_unidad > 0 ? `${Number(p.peso_promedio_unidad).toFixed(3)} kg` : '—'}
                    </td>
                    <td className="px-3 sm:px-4 py-2 sm:py-3">
                      <button
                        onClick={() => handleToggleDisponible(p)}
                        disabled={isToggling}
                        className={`flex items-center gap-1 px-2 py-1 rounded-lg transition text-xs font-bold ${
                          isDisponible
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        } ${isToggling ? 'opacity-50 cursor-wait' : ''}`}
                        title={isDisponible ? 'Click para deshabilitar' : 'Click para habilitar'}
                      >
                        {isToggling ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : isDisponible ? (
                          <ToggleRight className="w-5 h-5" />
                        ) : (
                          <ToggleLeft className="w-5 h-5" />
                        )}
                        <span className="hidden sm:inline">{isDisponible ? 'On' : 'Off'}</span>
                      </button>
                    </td>
                    <td className="px-3 sm:px-4 py-2 sm:py-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openEdit(p)}
                          className="bg-primary text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg font-bold hover:bg-secondary transition text-xs sm:text-sm"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => setConfirmDelete(p)}
                          className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 transition"
                          title="Eliminar producto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 sm:px-4">
          <div className="w-full sm:max-w-sm bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-5 pt-6 pb-2 flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-base font-heading font-extrabold text-text-dark">
                ¿Eliminar producto?
              </h2>
              <p className="text-sm text-text-dark/60">
                Vas a eliminar permanentemente{' '}
                <strong className="text-text-dark">{confirmDelete.nombre}</strong>.
                Esta acción no se puede deshacer.
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
                className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-700 transition disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {deleteMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Eliminando...</>
                ) : (
                  <><Trash2 className="w-4 h-4" /> Eliminar</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de edición */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 sm:px-4">
          <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <p className="text-[10px] text-text-dark/40 font-semibold uppercase tracking-wider">ID #{editing.id}</p>
                <h2 className="text-base font-heading font-extrabold text-text-dark">Editar Producto</h2>
              </div>
              <button
                onClick={() => setEditing(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-text-dark/40 hover:text-text-dark hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={submitEdit} className="px-5 py-5 space-y-4 overflow-y-auto max-h-[72vh]">

              {/* Nombre */}
              <div>
                <label className="block text-xs font-bold text-text-dark mb-1.5">Nombre *</label>
                <input
                  type="text"
                  value={editForm.nombre}
                  onChange={(e) => set('nombre', e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition text-sm"
                  placeholder="Nombre del producto"
                />
              </div>

              {/* Precio */}
              <div>
                <label className="block text-xs font-bold text-text-dark mb-1.5">Precio ($)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  value={editForm.precio}
                  onChange={(e) => set('precio', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition text-sm"
                  placeholder="Ej: 2500"
                />
              </div>

              {/* Categoría */}
              <div>
                <label className="block text-xs font-bold text-text-dark mb-1.5">Categoría</label>
                <select
                  value={editForm.categoria}
                  onChange={(e) => set('categoria', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition text-sm bg-white"
                >
                  <option value="">Seleccionar...</option>
                  <optgroup label="Carnicería">
                    <option value="Carnes">Carnes (Vacunos)</option>
                    <option value="Cerdo">Cerdo</option>
                    <option value="Pollos">Pollos</option>
                    <option value="Achuras">Achuras</option>
                  </optgroup>
                  <optgroup label="Almacén y Adicionales">
                    <option value="Bebidas">Bebidas</option>
                    <option value="Snacks">Snacks</option>
                    <option value="Almacén">Almacén</option>
                    <option value="Salsas">Salsas</option>
                  </optgroup>
                </select>
              </div>

              {/* ¿Venta por unidad? */}
              <div className="flex items-center justify-between py-1">
                <label className="text-xs font-bold text-text-dark">¿Venta por unidad?</label>
                <button
                  type="button"
                  role="switch"
                  aria-checked={editForm.es_unidad}
                  onClick={() => set('es_unidad', !editForm.es_unidad)}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                    editForm.es_unidad ? 'bg-primary' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                      editForm.es_unidad ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Peso promedio — solo si es_unidad */}
              {editForm.es_unidad && (
                <div>
                  <label className="block text-xs font-bold text-text-dark mb-1.5">
                    Peso promedio por unidad (kg)
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.001"
                    value={editForm.peso_promedio_unidad}
                    onChange={(e) => set('peso_promedio_unidad', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition text-sm"
                    placeholder="Ej: 0.250"
                  />
                </div>
              )}

              {/* Error */}
              {updateMutation.isError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  Error al guardar. Intentá nuevamente.
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-1 pb-1">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="flex-1 py-3 rounded-xl border-2 border-gray-200 font-bold text-sm hover:border-primary transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="flex-1 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-secondary transition disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {updateMutation.isPending ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</>
                  ) : 'Guardar cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

ProductsManager.propTypes = {
  addToast: PropTypes.func,
};

export default ProductsManager;
