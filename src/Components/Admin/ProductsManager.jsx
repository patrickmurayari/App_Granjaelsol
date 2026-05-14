import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../api/api';
import {
  Search, X, ToggleLeft, ToggleRight, Loader2, AlertCircle
} from 'lucide-react';

const ADMIN_CATEGORIES = ['Todas', 'Carnes', 'Cerdo', 'Pollos', 'Achuras', 'Bebidas', 'Snacks', 'Almacén', 'Salsas'];

const ProductsManager = () => {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [searchProd, setSearchProd] = useState('');
  const [editing, setEditing] = useState(null);
  const [precio, setPrecio] = useState('');
  const [togglingId, setTogglingId] = useState(null);

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
      setPrecio('');
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
    setPrecio(p?.precio ?? '');
  };

  const submitEdit = (e) => {
    e.preventDefault();
    if (!editing) return;
    updateMutation.mutate({
      id: editing.id,
      payload: { precio: precio === '' ? null : Number(precio) },
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
                      <button
                        onClick={() => openEdit(p)}
                        className="bg-primary text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg font-bold hover:bg-secondary transition text-xs sm:text-sm"
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Modal de edición */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center px-4 z-50">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
            <div className="p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h2 className="text-lg sm:text-xl font-heading font-extrabold text-text-dark">Editar precio</h2>
                <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-text-dark/70 mb-4">
                {editing.nombre} — Precio actual: <strong>${editing.precio ?? '—'}</strong>
              </p>
              <form onSubmit={submitEdit}>
                <input
                  type="number"
                  inputMode="decimal"
                  value={precio}
                  onChange={(e) => setPrecio(e.target.value)}
                  className="w-full px-4 py-3 text-lg font-bold text-center rounded-xl border-2 border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition mb-4"
                  placeholder="Nuevo precio"
                  autoFocus
                />
                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => setEditing(null)}
                    className="px-4 py-2 rounded-xl border-2 border-gray-200 font-bold text-sm hover:border-primary transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="bg-primary text-white px-3 sm:px-4 py-2 rounded-xl font-bold hover:bg-secondary transition disabled:opacity-60 text-sm"
                  >
                    {updateMutation.isPending ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductsManager;
