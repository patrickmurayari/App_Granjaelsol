import { useMemo, useState } from 'react';
import { X, Trash2, Send } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import api from '../api/api';
import { useCart } from '../context/CartContext.jsx';

const CartDrawer = () => {
  const { isOpen, closeCart, items, total, removeItem, clearCart } = useCart();
  const [comentarios, setComentarios] = useState('');

  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '549[TU_NUMERO_AQUI]';

  const cleanWhatsAppNumber = useMemo(() => String(whatsappNumber || '').replace(/\D/g, ''), [whatsappNumber]);

  const buildWhatsAppUrl = (text) => {
    return `https://wa.me/${cleanWhatsAppNumber}?text=${encodeURIComponent(text)}`;
  };

  const message = useMemo(() => {
    const lines = [];
    lines.push('Pedido Granja El Sol');
    lines.push('');

    items.forEach((i) => {
      const unidad = i.tipo_unidad === 'kg' ? 'kg' : 'unid';
      const cantidad = i.tipo_unidad === 'kg' ? Number(i.cantidad).toFixed(2) : i.cantidad;
      const subtotalNumber = Number(i.subtotal_item ?? i.subtotal_estimado ?? 0);
      const subtotal = `$${subtotalNumber.toFixed(2)}`;
      const pesoAprox =
        i.tipo_unidad === 'unid' ? ` (aprox. ${Number(i.peso_estimado_kg || 0).toFixed(2)} kg)` : '';
      lines.push(`- ${cantidad} ${unidad} ${i.nombre}${pesoAprox} - ${subtotal}`);
    });

    lines.push('');
    if (comentarios.trim()) {
      lines.push('Comentarios:');
      lines.push(comentarios.trim());
      lines.push('');
    }

    lines.push('Total Estimado - El peso final y precio se confirmarán en balanza');
    lines.push(`Total: $${Number(total || 0).toFixed(2)}`);

    return lines.join('\n');
  }, [items, total, comentarios]);

  const createPedido = useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post('/pedidos', payload);
      return data;
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={closeCart}></div>

      <div className="absolute right-0 top-0 h-full w-full sm:w-[420px] bg-white shadow-2xl flex flex-col">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-heading font-extrabold text-text-dark">Tu carrito</h2>
          <button
            onClick={closeCart}
            className="p-2 rounded-xl hover:bg-gray-100 transition"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-10 text-secondary font-heading">El carrito está vacío.</div>
          ) : (
            items.map((i) => (
              <div key={`${i.id}-${i.tipo_unidad}`} className="border border-gray-200 rounded-2xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-bold text-text-dark">{i.nombre}</div>
                    <div className="text-sm text-text-dark/70">
                      {i.tipo_unidad === 'kg'
                        ? `${Number(i.cantidad).toFixed(2)} kg`
                        : `${i.cantidad} unid (aprox. ${Number(i.peso_estimado_kg || 0).toFixed(2)} kg)`}
                      {' · '}
                      $ {i.precio_unitario} / {i.tipo_unidad === 'kg' ? 'kg' : 'unid'}
                    </div>
                    <div className="font-extrabold text-primary mt-1">$ {Number(i.subtotal_item ?? i.subtotal_estimado ?? 0).toFixed(2)}</div>
                  </div>
                  <button
                    onClick={() => removeItem(i.id, i.tipo_unidad)}
                    className="p-2 rounded-xl border border-gray-200 hover:border-primary hover:text-primary transition"
                    aria-label="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}

          <div className="pt-2">
            <label className="block text-sm font-bold text-text-dark mb-2">Comentarios</label>
            <textarea
              value={comentarios}
              onChange={(e) => setComentarios(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
              placeholder="Ej: el asado con poca grasa / la milanesa finita"
            />
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 space-y-3">
          <div className="flex items-center justify-between font-extrabold text-text-dark">
            <span>Total estimado</span>
            <span className="text-primary">$ {total}</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={clearCart}
              disabled={items.length === 0}
              className="px-4 py-3 rounded-2xl border-2 border-gray-200 font-bold hover:border-primary transition disabled:opacity-60"
            >
              Vaciar
            </button>
            <button
              onClick={() => {
                const payload = {
                  items: items.map((i) => ({
                    ...i,
                    subtotal_item: Number(i.subtotal_item ?? i.subtotal_estimado ?? 0),
                    peso_estimado_kg: Number(i.peso_estimado_kg ?? (i.tipo_unidad === 'kg' ? i.cantidad : 0) ?? 0),
                  })),
                  total_estimado: Number(total || 0),
                  comentarios,
                };

                // Disparar el guardado sin bloquear el hilo del click
                createPedido.mutate(payload);

                // Limpiar UI antes de navegar (mejor UX y evita doble click)
                clearCart();
                closeCart();
                setComentarios('');

                // Navegación SINCRÓNICA en el mismo gesto del usuario (evita bloqueos de popup en mobile)
                const url = buildWhatsAppUrl(message);
                window.location.assign(url);
              }}
              disabled={items.length === 0 || createPedido.isPending}
              className="bg-primary text-white px-4 py-3 rounded-2xl font-bold hover:bg-secondary transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              {createPedido.isPending ? 'Enviando...' : 'WhatsApp'}
            </button>
          </div>

          {createPedido.isError && (
            <div className="text-sm text-red-600 font-bold">No se pudo registrar el pedido. Intenta nuevamente.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
