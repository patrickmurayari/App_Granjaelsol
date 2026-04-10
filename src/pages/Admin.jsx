import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import {
  Package, ShoppingCart, Plus, LogOut, Home, ChevronDown, ChevronUp,
  Clock, CheckCircle, Loader2, AlertCircle, X, ToggleLeft, ToggleRight,
  Calculator, DollarSign, FileText, Calendar, CreditCard, Pencil
} from 'lucide-react';

const TABS = ['Productos', 'Pedidos', 'Crear Producto', 'Cierre de Caja'];

const ESTADOS = {
  pendiente: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: Clock },
  preparando: { label: 'Preparando', color: 'bg-blue-100 text-blue-800 border-blue-300', icon: Loader2 },
  entregado: { label: 'Entregado', color: 'bg-green-100 text-green-800 border-green-300', icon: CheckCircle },
};

const Admin = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, loading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [editing, setEditing] = useState(null);
  const [precio, setPrecio] = useState('');
  const [expandedPedido, setExpandedPedido] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  // Form state para crear producto
  const [newProduct, setNewProduct] = useState({
    nombre: '',
    precio: '',
    categoria: '',
    peso_promedio_unidad: '',
    descripcion: '',
    imagen_url: '',
  });

  // Form state para cierre de caja
  const [cierreForm, setCierreForm] = useState({
    efectivo: '',
    tarjeta: '',
    gastos: '',
    notas: '',
  });
  const [editingCierreId, setEditingCierreId] = useState(null);

  // Redirigir si no está autenticado
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  // Query de productos
  const {
    data: productos,
    isLoading: loadingProductos,
    isError: errorProductos,
  } = useQuery({
    queryKey: ['productos'],
    queryFn: async () => {
      const { data } = await api.get('/productos');
      return data;
    },
  });

  // Query de pedidos
  const {
    data: pedidos,
    isLoading: loadingPedidos,
    isError: errorPedidos,
  } = useQuery({
    queryKey: ['pedidos'],
    queryFn: async () => {
      const { data } = await api.get('/pedidos');
      return data;
    },
  });

  const rows = useMemo(() => productos || [], [productos]);

  // Mutación para actualizar producto
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

  // Mutación para toggle disponibilidad
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

  // Mutación para crear producto
  const createProductMutation = useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post('/productos', payload);
      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['productos'] });
      setNewProduct({
        nombre: '',
        precio: '',
        categoria: '',
        peso_promedio_unidad: '',
        descripcion: '',
        imagen_url: '',
      });
    },
  });

  // Mutación para actualizar estado de pedido
  const updatePedidoMutation = useMutation({
    mutationFn: async ({ id, estado }) => {
      const { data } = await api.put(`/pedidos/${id}`, { estado });
      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['pedidos'] });
    },
  });

  // Query de cierres
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

  // Mutación para guardar cierre
  const saveCierreMutation = useMutation({
    mutationFn: async ({ payload, id }) => {
      if (id) {
        // Actualizar cierre existente por ID
        const { data } = await api.put(`/cierres/${id}`, payload);
        return data;
      } else {
        // Crear o actualizar cierre del día
        const { data } = await api.post('/cierres', payload);
        return data;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['cierres'] });
      setCierreForm({ efectivo: '', tarjeta: '', gastos: '', notas: '' });
      setEditingCierreId(null);
    },
  });

  // Detectar cierre de hoy para edición
  const hoy = new Date().toISOString().split('T')[0];
  const cierreHoy = cierres?.find((c) => c.fecha === hoy);

  // Cargar cierre de hoy en el formulario si existe
  useEffect(() => {
    if (cierreHoy) {
      setCierreForm({
        efectivo: cierreHoy.monto_efectivo?.toString() || '',
        tarjeta: cierreHoy.monto_tarjeta?.toString() || '',
        gastos: cierreHoy.gastos_diarios?.toString() || '',
        notas: cierreHoy.notas || '',
      });
    }
  }, [cierreHoy]);

  const submitCierre = (e) => {
    e.preventDefault();
    saveCierreMutation.mutate({ payload: cierreForm, id: editingCierreId });
  };

  const handleEditCierre = (c) => {
    setEditingCierreId(c.id);
    setCierreForm({
      efectivo: c.monto_efectivo?.toString() || '',
      tarjeta: c.monto_tarjeta?.toString() || '',
      gastos: c.gastos_diarios?.toString() || '',
      notas: c.notas || '',
    });
  };

  const cancelEditCierre = () => {
    setEditingCierreId(null);
    setCierreForm({ efectivo: '', tarjeta: '', gastos: '', notas: '' });
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

  const submitNewProduct = (e) => {
    e.preventDefault();
    createProductMutation.mutate(newProduct);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 px-3 sm:px-4 md:px-8 py-4 sm:py-6 md:py-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-heading font-extrabold text-text-dark">
            Panel de Administración
          </h1>
          <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={() => navigate('/')}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gray-100 text-text-dark px-3 sm:px-4 py-2 rounded-xl font-bold hover:bg-gray-200 transition text-sm sm:text-base"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Inicio</span>
            </button>
            <button
              onClick={handleSignOut}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-red-100 text-red-700 px-3 sm:px-4 py-2 rounded-xl font-bold hover:bg-red-200 transition text-sm sm:text-base"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 sm:gap-2 mb-4 sm:mb-6 overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0">
          {TABS.map((tab) => {
            const Icon = tab === 'Productos' ? Package : tab === 'Pedidos' ? ShoppingCart : Plus;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
                  activeTab === tab
                    ? 'bg-primary text-white shadow-lg'
                    : 'bg-white text-text-dark border border-gray-200 hover:border-primary'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab}
              </button>
            );
          })}
        </div>

        {/* Contenido de tabs */}
        {activeTab === 'Productos' && (
          <>
            {loadingProductos ? (
              <div className="text-center py-10 text-lg text-secondary font-heading flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Cargando productos...
              </div>
            ) : errorProductos ? (
              <div className="text-center py-10 text-lg text-red-600 font-heading flex items-center justify-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Error al cargar productos.
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
          </>
        )}

        {activeTab === 'Pedidos' && (
          <>
            {loadingPedidos ? (
              <div className="text-center py-10 text-lg text-secondary font-heading flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Cargando pedidos...
              </div>
            ) : errorPedidos ? (
              <div className="text-center py-10 text-lg text-red-600 font-heading flex items-center justify-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Error al cargar pedidos.
              </div>
            ) : pedidos?.length === 0 ? (
              <div className="text-center py-10 text-lg text-text-dark/60 font-heading">
                No hay pedidos registrados aún.
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {pedidos?.map((pedido) => {
                  const EstadoIcon = ESTADOS[pedido.estado]?.icon || Clock;
                  const isExpanded = expandedPedido === pedido.id;

                  return (
                    <div
                      key={pedido.id}
                      className="bg-white shadow-lg rounded-xl sm:rounded-2xl border border-gray-200 overflow-hidden"
                    >
                      {/* Header del pedido - siempre visible */}
                      <div
                        className="p-3 sm:p-4 cursor-pointer hover:bg-gray-50 transition"
                        onClick={() => setExpandedPedido(isExpanded ? null : pedido.id)}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                          <div className="flex items-center gap-3">
                            <div className="text-xs sm:text-sm text-text-dark/60">
                              #{pedido.id}
                            </div>
                            <div className={`flex items-center gap-1.5 px-2 sm:px-3 py-1 rounded-full text-xs font-bold border ${ESTADOS[pedido.estado]?.color || 'bg-gray-100 text-gray-800'}`}>
                              <EstadoIcon className={`w-3 h-3 ${pedido.estado === 'preparando' ? 'animate-spin' : ''}`} />
                              {ESTADOS[pedido.estado]?.label || pedido.estado}
                            </div>
                          </div>
                          <div className="flex items-center justify-between sm:justify-end gap-4">
                            <div className="text-xs sm:text-sm text-text-dark/70">
                              {formatDate(pedido.created_at)}
                            </div>
                            <div className="font-bold text-primary text-sm sm:text-base">
                              ${pedido.total_estimado?.toLocaleString('es-AR') || '0'}
                            </div>
                            {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                          </div>
                        </div>
                      </div>

                      {/* Detalle expandido */}
                      {isExpanded && (
                        <div className="border-t border-gray-100 p-3 sm:p-4 bg-gray-50/50">
                          {/* Selector de estado */}
                          <div className="mb-4">
                            <label className="block text-xs sm:text-sm font-bold text-text-dark mb-2">
                              Cambiar estado:
                            </label>
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(ESTADOS).map(([key, { label, color }]) => (
                                <button
                                  key={key}
                                  onClick={() => updatePedidoMutation.mutate({ id: pedido.id, estado: key })}
                                  disabled={pedido.estado === key || updatePedidoMutation.isPending}
                                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold border transition disabled:opacity-50 ${
                                    pedido.estado === key ? color : 'bg-white border-gray-200 hover:border-primary'
                                  }`}
                                >
                                  {label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Items del pedido */}
                          <div className="mb-4">
                            <h4 className="text-xs sm:text-sm font-bold text-text-dark mb-2">Productos:</h4>
                            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                              {Array.isArray(pedido.items) && pedido.items.map((item, idx) => (
                                <div
                                  key={idx}
                                  className="flex justify-between items-center p-2 sm:p-3 border-b last:border-b-0 text-xs sm:text-sm"
                                >
                                  <div>
                                    <span className="font-medium">{item.nombre}</span>
                                    <span className="text-text-dark/60 ml-2">
                                      x{item.cantidad} {item.tipo_unidad}
                                    </span>
                                  </div>
                                  <div className="font-bold">
                                    ${item.subtotal_item?.toLocaleString('es-AR') || '0'}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Comentarios */}
                          {pedido.comentarios && (
                            <div className="mb-4">
                              <h4 className="text-xs sm:text-sm font-bold text-text-dark mb-2">Comentarios:</h4>
                              <div className="bg-white rounded-lg border border-gray-200 p-2 sm:p-3 text-xs sm:text-sm text-text-dark/80">
                                {pedido.comentarios}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {activeTab === 'Crear Producto' && (
          <div className="bg-white shadow-lg rounded-2xl border border-gray-200 p-4 sm:p-6 max-w-lg mx-auto">
            <h2 className="text-lg sm:text-xl font-heading font-extrabold text-text-dark mb-4 sm:mb-6">
              Agregar Nuevo Producto
            </h2>

            <form onSubmit={submitNewProduct} className="space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-bold text-text-dark mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={newProduct.nombre}
                  onChange={(e) => setNewProduct({ ...newProduct, nombre: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition text-sm"
                  placeholder="Ej: Chorizo Criollo"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-text-dark mb-1">
                    Precio ($)
                  </label>
                  <input
                    type="number"
                    value={newProduct.precio}
                    onChange={(e) => setNewProduct({ ...newProduct, precio: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition text-sm"
                    placeholder="Ej: 2500"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-text-dark mb-1">
                    Peso prom. (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newProduct.peso_promedio_unidad}
                    onChange={(e) => setNewProduct({ ...newProduct, peso_promedio_unidad: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition text-sm"
                    placeholder="Ej: 0.5"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-bold text-text-dark mb-1">
                  Categoría
                </label>
                <select
                  value={newProduct.categoria}
                  onChange={(e) => setNewProduct({ ...newProduct, categoria: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition text-sm"
                >
                  <option value="">Seleccionar...</option>
                  <option value="Carnes">Carnes (Vacunos)</option>
                  <option value="Cerdo">Cerdo</option>
                  <option value="Pollos">Pollos</option>
                  <option value="Achuras">Achuras</option>
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-bold text-text-dark mb-1">
                  URL de imagen
                </label>
                <input
                  type="url"
                  value={newProduct.imagen_url}
                  onChange={(e) => setNewProduct({ ...newProduct, imagen_url: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition text-sm"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-bold text-text-dark mb-1">
                  Descripción
                </label>
                <textarea
                  value={newProduct.descripcion}
                  onChange={(e) => setNewProduct({ ...newProduct, descripcion: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition text-sm resize-none"
                  rows="3"
                  placeholder="Descripción del producto..."
                />
              </div>

              {createProductMutation.isError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  <AlertCircle className="w-4 h-4" />
                  Error al crear producto. Intenta nuevamente.
                </div>
              )}

              {createProductMutation.isSuccess && (
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
                  <CheckCircle className="w-4 h-4" />
                  Producto creado exitosamente.
                </div>
              )}

              <button
                type="submit"
                disabled={createProductMutation.isPending}
                className="w-full bg-primary text-white py-3 sm:py-3.5 rounded-xl font-bold text-sm sm:text-base hover:bg-secondary transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {createProductMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Crear Producto
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'Cierre de Caja' && (
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

              <form onSubmit={submitCierre} className="space-y-4">
                {/* Campos numéricos grandes */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-text-dark mb-2">
                      <DollarSign className="w-4 h-4 inline mr-1" />
                      Efectivo
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={cierreForm.efectivo}
                      onChange={(e) => setCierreForm({ ...cierreForm, efectivo: e.target.value })}
                      className="w-full px-4 py-4 sm:py-5 text-xl sm:text-2xl font-bold text-center rounded-xl border-2 border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-text-dark mb-2">
                      <CreditCard className="w-4 h-4 inline mr-1" />
                      Tarjeta/Posnet
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={cierreForm.tarjeta}
                      onChange={(e) => setCierreForm({ ...cierreForm, tarjeta: e.target.value })}
                      className="w-full px-4 py-4 sm:py-5 text-xl sm:text-2xl font-bold text-center rounded-xl border-2 border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-text-dark mb-2">
                      <FileText className="w-4 h-4 inline mr-1" />
                      Gastos
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={cierreForm.gastos}
                      onChange={(e) => setCierreForm({ ...cierreForm, gastos: e.target.value })}
                      className="w-full px-4 py-4 sm:py-5 text-xl sm:text-2xl font-bold text-center rounded-xl border-2 border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Total calculado */}
                <div className="bg-gray-50 rounded-xl p-3 sm:p-4 text-center">
                  <span className="text-xs sm:text-sm text-text-dark/60">Total del día:</span>
                  <span className="text-xl sm:text-2xl font-extrabold text-primary ml-2">
                    ${(
                      (Number(cierreForm.efectivo) || 0) +
                      (Number(cierreForm.tarjeta) || 0) -
                      (Number(cierreForm.gastos) || 0)
                    ).toLocaleString('es-AR')}
                  </span>
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
                    {cierreHoy ? 'Cierre actualizado correctamente.' : 'Cierre guardado correctamente.'}
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
                        <th className="text-right px-3 sm:px-4 py-2 sm:py-3 font-bold text-text-dark">Efectivo</th>
                        <th className="text-right px-3 sm:px-4 py-2 sm:py-3 font-bold text-text-dark">Tarjeta</th>
                        <th className="text-right px-3 sm:px-4 py-2 sm:py-3 font-bold text-text-dark">Gastos</th>
                        <th className="text-right px-3 sm:px-4 py-2 sm:py-3 font-bold text-text-dark">Total</th>
                        <th className="text-right px-3 sm:px-4 py-2 sm:py-3 font-bold text-text-dark">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cierres?.map((c) => {
                        const total = c.total_calculado || 0;
                        const esHoy = c.fecha === hoy;
                        return (
                          <tr
                            key={c.id}
                            className={`border-t border-gray-100 ${esHoy ? 'bg-primary/5' : ''}`}
                          >
                            <td className="px-3 sm:px-4 py-2 sm:py-3 font-medium">
                              {(() => {
                                const fecha = c.fecha instanceof Date ? c.fecha : new Date(c.fecha);
                                return fecha.toLocaleDateString('es-AR', {
                                  weekday: 'short',
                                  day: '2-digit',
                                  month: 'short',
                                });
                              })()}
                              {esHoy && (
                                <span className="ml-2 text-xs bg-primary text-white px-2 py-0.5 rounded-full">
                                  Hoy
                                </span>
                              )}
                            </td>
                            <td className="px-3 sm:px-4 py-2 sm:py-3 text-right font-bold text-green-700">
                              ${c.monto_efectivo?.toLocaleString('es-AR') || 0}
                            </td>
                            <td className="px-3 sm:px-4 py-2 sm:py-3 text-right font-bold text-blue-700">
                              ${c.monto_tarjeta?.toLocaleString('es-AR') || 0}
                            </td>
                            <td className="px-3 sm:px-4 py-2 sm:py-3 text-right font-bold text-red-700">
                              -${c.gastos_diarios?.toLocaleString('es-AR') || 0}
                            </td>
                            <td className="px-3 sm:px-4 py-2 sm:py-3 text-right font-extrabold text-primary">
                              ${total.toLocaleString('es-AR')}
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
        )}
      </div>

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
              <p className="text-sm text-text-dark/70 mb-4">{editing.nombre}</p>

              <form onSubmit={submitEdit} className="space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-text-dark mb-1">Nuevo precio</label>
                  <input
                    type="number"
                    value={precio}
                    onChange={(e) => setPrecio(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition text-sm"
                    placeholder="Ej: 19900"
                  />
                </div>

                {updateMutation.isError && (
                  <div className="text-xs sm:text-sm text-red-600 font-bold">No se pudo actualizar. Intenta nuevamente.</div>
                )}

                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(null);
                      setPrecio('');
                    }}
                    className="px-3 sm:px-4 py-2 rounded-xl border-2 border-gray-200 font-bold hover:border-primary transition text-sm"
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
    </div>
  );
};

export default Admin;
