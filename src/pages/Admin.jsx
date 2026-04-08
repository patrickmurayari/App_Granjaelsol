import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

const Admin = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    const pass = window.prompt('Ingrese la contraseña de administración');
    if (pass !== 'granja2026') {
      navigate('/');
    }
  }, [navigate]);

  const {
    data: productos,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['productos'],
    queryFn: async () => {
      const { data } = await api.get('/productos');
      return data;
    },
  });

  const rows = useMemo(() => productos || [], [productos]);

  const [editing, setEditing] = useState(null);
  const [precio, setPrecio] = useState('');

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

  const openEdit = (p) => {
    setEditing(p);
    setPrecio(p?.precio ?? '');
  };

  const submit = (e) => {
    e.preventDefault();
    if (!editing) return;

    updateMutation.mutate({
      id: editing.id,
      payload: {
        precio: precio === '' ? null : Number(precio),
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 px-4 md:px-8 py-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl md:text-3xl font-heading font-extrabold text-text-dark">Panel de Administración</h1>
          <button
            onClick={() => navigate('/')}
            className="bg-primary text-white px-4 py-2 rounded-xl font-bold hover:bg-secondary transition"
          >
            Volver
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-10 text-lg text-secondary font-heading">Cargando productos...</div>
        ) : isError ? (
          <div className="text-center py-10 text-lg text-secondary font-heading">Error al cargar productos.</div>
        ) : (
          <div className="bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3 font-bold text-text-dark">ID</th>
                    <th className="text-left px-4 py-3 font-bold text-text-dark">Nombre</th>
                    <th className="text-left px-4 py-3 font-bold text-text-dark">Categoría</th>
                    <th className="text-left px-4 py-3 font-bold text-text-dark">Precio</th>
                    <th className="text-left px-4 py-3 font-bold text-text-dark">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((p) => (
                    <tr key={p.id} className="border-t border-gray-100">
                      <td className="px-4 py-3 text-text-dark/80">{p.id}</td>
                      <td className="px-4 py-3 text-text-dark">{p.nombre}</td>
                      <td className="px-4 py-3 text-text-dark/80">{p.categoria || '-'}</td>
                      <td className="px-4 py-3 text-text-dark font-bold">{p.precio != null ? `$${p.precio}` : '-'}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => openEdit(p)}
                          className="bg-primary text-white px-3 py-1.5 rounded-xl font-bold hover:bg-secondary transition"
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center px-4 z-50">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
            <div className="p-5">
              <h2 className="text-xl font-heading font-extrabold text-text-dark mb-1">Editar precio</h2>
              <p className="text-sm text-text-dark/70 mb-4">{editing.nombre}</p>

              <form onSubmit={submit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-text-dark mb-1">Nuevo precio</label>
                  <input
                    type="number"
                    value={precio}
                    onChange={(e) => setPrecio(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                    placeholder="Ej: 19900"
                  />
                </div>

                {updateMutation.isError && (
                  <div className="text-sm text-red-600 font-bold">No se pudo actualizar. Intenta nuevamente.</div>
                )}

                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(null);
                      setPrecio('');
                    }}
                    className="px-4 py-2 rounded-xl border-2 border-gray-200 font-bold hover:border-primary transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="bg-primary text-white px-4 py-2 rounded-xl font-bold hover:bg-secondary transition disabled:opacity-60"
                  >
                    {updateMutation.isPending ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
