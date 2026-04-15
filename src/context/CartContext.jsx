import { createContext, useContext, useMemo, useReducer } from 'react';
import PropTypes from 'prop-types';

const CartContext = createContext(null);

const roundToTwo = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

const normalizePesoPromedioUnidad = (peso_promedio_unidad) => {
  const n = Number(peso_promedio_unidad);
  if (!Number.isFinite(n) || n <= 0) return 1.0;
  return n;
};

const normalizeCantidad = (cantidad, tipoUnidad) => {
  if (tipoUnidad === 'kg') {
    const n = Number(cantidad);
    if (!Number.isFinite(n) || n <= 0) return null;
    return roundToTwo(n);
  }

  const n = Number(cantidad);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.floor(n);
};

const buildKey = (id, tipoUnidad) => `${id}::${tipoUnidad}`;

const initialState = {
  items: [],
  isOpen: false,
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'OPEN':
      return { ...state, isOpen: true };
    case 'CLOSE':
      return { ...state, isOpen: false };
    case 'TOGGLE':
      return { ...state, isOpen: !state.isOpen };
    case 'CLEAR':
      return { ...state, items: [] };
    case 'REMOVE': {
      const { id, tipo_unidad } = action.payload;
      const key = buildKey(id, tipo_unidad);
      return { ...state, items: state.items.filter((i) => buildKey(i.id, i.tipo_unidad) !== key) };
    }
    case 'ADD_OR_UPDATE': {
      const item = action.payload;
      const key = buildKey(item.id, item.tipo_unidad);
      const nextItems = [...state.items];
      const idx = nextItems.findIndex((i) => buildKey(i.id, i.tipo_unidad) === key);
      if (idx >= 0) nextItems[idx] = item;
      else nextItems.push(item);
      return { ...state, items: nextItems };
    }
    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const addItem = ({ id, nombre, precio_unitario, cantidad, tipo_unidad, peso_promedio_unidad, es_unidad }) => {
    const normalizedCantidad = normalizeCantidad(cantidad, tipo_unidad);
    if (normalizedCantidad == null) return { ok: false };

    const precio = Number(precio_unitario);
    if (!Number.isFinite(precio) || precio < 0) return { ok: false };

    const pesoProm = normalizePesoPromedioUnidad(peso_promedio_unidad);
    const peso_estimado_kg =
      tipo_unidad === 'kg' ? roundToTwo(normalizedCantidad) : roundToTwo(normalizedCantidad * pesoProm);

    const subtotal_estimado =
      tipo_unidad === 'kg'
        ? roundToTwo(precio * normalizedCantidad)
        : roundToTwo(precio * (normalizedCantidad * pesoProm));

    dispatch({
      type: 'ADD_OR_UPDATE',
      payload: {
        id,
        nombre,
        precio_unitario: precio,
        cantidad: normalizedCantidad,
        tipo_unidad,
        peso_promedio_unidad: pesoProm,
        es_unidad: es_unidad === true,
        peso_estimado_kg,
        subtotal_estimado,
        subtotal_item: subtotal_estimado,
      },
    });

    return { ok: true };
  };

  const removeItem = (id, tipo_unidad) => dispatch({ type: 'REMOVE', payload: { id, tipo_unidad } });
  const clearCart = () => dispatch({ type: 'CLEAR' });
  const openCart = () => dispatch({ type: 'OPEN' });
  const closeCart = () => dispatch({ type: 'CLOSE' });
  const toggleCart = () => dispatch({ type: 'TOGGLE' });

  const total = useMemo(() => {
    return roundToTwo(state.items.reduce((acc, i) => acc + Number(i.subtotal_estimado || 0), 0));
  }, [state.items]);

  const count = useMemo(() => state.items.length, [state.items]);

  const value = useMemo(
    () => ({
      items: state.items,
      isOpen: state.isOpen,
      count,
      total,
      addItem,
      removeItem,
      clearCart,
      openCart,
      closeCart,
      toggleCart,
    }),
    [state.items, state.isOpen, count, total]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

CartProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart debe usarse dentro de CartProvider');
  return ctx;
};
