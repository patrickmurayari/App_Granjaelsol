import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../api/api';
import {
  Clock, CheckCircle, Loader2, AlertCircle, ChevronDown, ChevronUp
} from 'lucide-react';

const ESTADOS = {
  pendiente: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: Clock },
  preparando: { label: 'Preparando', color: 'bg-blue-100 text-blue-800 border-blue-300', icon: Loader2 },
  entregado: { label: 'Entregado', color: 'bg-green-100 text-green-800 border-green-300', icon: CheckCircle },
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

const OrdersManager = () => {
  const queryClient = useQueryClient();
  const [expandedPedido, setExpandedPedido] = useState(null);

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

  const updatePedidoMutation = useMutation({
    mutationFn: async ({ id, estado }) => {
      const { data } = await api.put(`/pedidos/${id}`, { estado });
      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['pedidos'] });
    },
  });

  if (loadingPedidos) {
    return (
      <div className="text-center py-10 text-lg text-secondary font-heading flex items-center justify-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin" />
        Cargando pedidos...
      </div>
    );
  }

  if (errorPedidos) {
    return (
      <div className="text-center py-10 text-lg text-red-600 font-heading flex items-center justify-center gap-2">
        <AlertCircle className="w-5 h-5" />
        Error al cargar pedidos.
      </div>
    );
  }

  if (pedidos?.length === 0) {
    return (
      <div className="text-center py-10 text-lg text-text-dark/60 font-heading">
        No hay pedidos registrados aún.
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {pedidos?.map((pedido) => {
        const EstadoIcon = ESTADOS[pedido.estado]?.icon || Clock;
        const isExpanded = expandedPedido === pedido.id;

        return (
          <div
            key={pedido.id}
            className="bg-white shadow-lg rounded-xl sm:rounded-2xl border border-gray-200 overflow-hidden"
          >
            {/* Header del pedido */}
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
  );
};

export default OrdersManager;
