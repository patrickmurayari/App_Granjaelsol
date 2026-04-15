import { useState } from 'react';
import PropTypes from 'prop-types';
import { ChevronDown, ChevronUp, Heart } from 'lucide-react';
import { useProductCard } from '../hooks/useProductCard';
import { useCart } from '../context/CartContext.jsx';

const CardProducts = ({ products }) => {
  const { favorites, toggleFavorite } = useProductCard();
  const { addItem, openCart } = useCart();

  const [unitTypeById, setUnitTypeById] = useState({});
  const [qtyById, setQtyById] = useState({});

  const getUnitType = (id, esUnidad) => esUnidad ? 'unid' : (unitTypeById[id] || 'kg');
  const getQty = (id, tipoUnidad) => {
    const v = qtyById[id];
    if (v !== undefined && v !== null && v !== '') return v;
    return tipoUnidad === 'kg' ? '0.25' : '1';
  };

  const getStep = (tipoUnidad) => (tipoUnidad === 'kg' ? 0.25 : 1);
  const getMin = (tipoUnidad) => (tipoUnidad === 'kg' ? 0.25 : 1);

  const parseQty = (raw) => {
    if (raw === '' || raw == null) return null;
    const n = Number(String(raw).replace(',', '.'));
    return Number.isFinite(n) ? n : null;
  };

  const normalizeOnBlur = (id, tipoUnidad) => {
    const raw = qtyById[id];
    if (raw === undefined) return;

    const parsed = parseQty(raw);
    if (parsed == null) {
      setQtyById((prev) => ({ ...prev, [id]: tipoUnidad === 'kg' ? '0.25' : '1' }));
      return;
    }

    if (tipoUnidad === 'kg') {
      const min = 0.25;
      const clamped = parsed < min ? min : parsed;
      const normalized = Math.round(clamped / 0.25) * 0.25;
      setQtyById((prev) => ({ ...prev, [id]: normalized.toFixed(2) }));
      return;
    }

    const min = 1;
    const clamped = parsed < min ? min : parsed;
    const normalized = Math.floor(clamped);
    setQtyById((prev) => ({ ...prev, [id]: String(normalized) }));
  };

  const adjustQty = (id, tipoUnidad, deltaSteps) => {
    const step = getStep(tipoUnidad);
    const min = getMin(tipoUnidad);
    const currentRaw = getQty(id, tipoUnidad);
    const current = parseQty(currentRaw);

    const base = current == null ? min : current;
    const next = base + deltaSteps * step;

    if (tipoUnidad === 'kg') {
      const clamped = next < min ? min : next;
      const normalized = Math.round(clamped / 0.25) * 0.25;
      setQtyById((prev) => ({ ...prev, [id]: normalized.toFixed(2) }));
      return;
    }

    const clamped = next < min ? min : next;
    const normalized = Math.floor(clamped);
    setQtyById((prev) => ({ ...prev, [id]: String(normalized) }));
  };

  const parsePrice = (value) => {
    const raw = String(value || '').replace(/[^0-9.,-]/g, '').replace(',', '.');
    const n = Number(raw);
    return Number.isFinite(n) ? n : 0;
  };

  const getPlaceholderImage = (index, name) => {
    const colors = [
      'bg-gradient-to-br from-primary to-secondary',
      'bg-gradient-to-br from-secondary to-primary',
      'bg-gradient-to-br from-accent-positive to-primary',
      'bg-gradient-to-br from-text-dark to-secondary',
    ];
    const color = colors[index % colors.length];
    return (
      <div
        className={`w-full h-40 sm:h-48 md:h-56 rounded-t-2xl sm:rounded-t-3xl flex items-center justify-center text-4xl sm:text-5xl md:text-6xl font-extrabold text-text-light ${color}`}
      >
        {name ? name.substring(0, 1) : 'P'}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 md:gap-8 max-w-7xl mx-auto">
      {products &&
        products.map((elem, index) => {
          const sinStock = elem.disponible === false;
          const esUnidad = elem.es_unidad === true;
          const unitType = getUnitType(elem.id, esUnidad);
          return (
            <div
              key={elem.id || index}
              className={`relative bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg h-full flex flex-col ${sinStock ? 'opacity-60' : ''}`}
            >
              {/* Imagen Container */}
              <div className={`relative w-full overflow-hidden bg-gray-200 ${esUnidad ? 'h-32 sm:h-40' : 'h-40 sm:h-48 md:h-56'}`}>
                {elem.image ? (
                  <img
                    className={`w-full h-full object-cover ${sinStock ? 'grayscale' : ''}`}
                    src={elem.image}
                    alt={elem.name}
                  />
                ) : (
                  <div className={sinStock ? 'grayscale' : ''}>
                    {getPlaceholderImage(index, elem.name)}
                  </div>
                )}
                {/* Badge SIN STOCK */}
                {sinStock && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="bg-red-600 text-white px-4 py-1.5 rounded-lg text-sm sm:text-base font-extrabold shadow-lg tracking-wide">
                      SIN STOCK
                    </span>
                  </div>
                )}
              </div>

              {/* Badge de categoría */}
              <div className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-primary text-white px-2 sm:px-4 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs md:text-sm font-bold shadow-lg">
                {esUnidad ? 'Unidad' : 'Premium'}
              </div>

              {/* Botón de favorito */}
              <button
                onClick={() => toggleFavorite(elem.id)}
                className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-white/90 text-primary p-1.5 sm:p-2 rounded-full shadow-lg cursor-pointer"
              >
                <Heart
                  size={16}
                  className={`sm:w-5 sm:h-5 ${favorites.has(elem.id) ? "fill-current" : ""}`}
                />
              </button>

              {/* Contenido de la tarjeta */}
              <div className="flex flex-col flex-grow p-3 sm:p-5 md:p-6">
                {/* Nombre del producto */}
                <h3 className="text-sm sm:text-lg md:text-xl font-heading font-bold text-text-dark mb-1 sm:mb-2 line-clamp-2">
                  {elem.name}
                </h3>

                {/* Descripción/Precio */}
                <div className="flex items-baseline gap-2 mb-2 sm:mb-4">
                  <span className="text-lg sm:text-2xl md:text-3xl font-bold text-primary">
                    {elem.description}
                  </span>
                </div>

                <div className={`${sinStock ? 'pointer-events-none opacity-50' : ''} mb-3 sm:mb-4`}>
                  {!esUnidad && (
                    <select
                      value={unitType}
                      onChange={(e) => {
                        const next = e.target.value;
                        setUnitTypeById((prev) => ({ ...prev, [elem.id]: next }));
                        setQtyById((prev) => ({ ...prev, [elem.id]: next === 'kg' ? '0.25' : '1' }));
                      }}
                      className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm font-bold cursor-pointer mb-2"
                    >
                      <option value="kg">Kilogramos</option>
                      <option value="unid">Unidades</option>
                    </select>
                  )}

                  <div className={`flex items-stretch rounded-xl border-2 border-gray-200 overflow-hidden ${esUnidad ? '' : 'sm:grid sm:grid-cols-1'}`}>
                    <div className="flex-1 flex items-center justify-center">
                      <input
                        type="text"
                        inputMode={unitType === 'kg' ? 'decimal' : 'numeric'}
                        pattern={unitType === 'kg' ? undefined : '[0-9]*'}
                        value={getQty(elem.id, unitType)}
                        onChange={(e) => {
                          const next = e.target.value;
                          setQtyById((prev) => ({ ...prev, [elem.id]: next }));
                        }}
                        onBlur={() => normalizeOnBlur(elem.id, unitType)}
                        className="w-full px-3 py-2 focus:outline-none text-sm font-bold"
                        aria-label="Cantidad"
                      />
                    </div>

                    <div className="flex flex-col border-l-2 border-gray-200">
                      <button
                        type="button"
                        onClick={() => adjustQty(elem.id, unitType, 1)}
                        className="w-11 h-7 flex items-center justify-center"
                        aria-label="Incrementar"
                        tabIndex={-1}
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <div className="h-px bg-gray-200" />
                      <button
                        type="button"
                        onClick={() => adjustQty(elem.id, unitType, -1)}
                        className="w-11 h-7 flex items-center justify-center"
                        aria-label="Decrementar"
                        tabIndex={-1}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  disabled={sinStock}
                  onClick={sinStock ? undefined : () => {
                    const result = addItem({
                      id: elem.id,
                      nombre: elem.name,
                      precio_unitario: parsePrice(elem.description),
                      cantidad: getQty(elem.id, unitType),
                      tipo_unidad: unitType,
                      peso_promedio_unidad: elem.peso_promedio_unidad,
                      es_unidad: esUnidad,
                    });
                    if (result.ok) openCart();
                  }}
                  className={`w-full py-3.5 rounded-xl text-sm sm:text-base font-bold shadow-lg font-heading ${sinStock ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-primary text-white cursor-pointer'}`}
                >
                  {sinStock ? 'No disponible' : 'Agregar al carrito'}
                </button>
              </div>
            </div>
          );
        })}
    </div>
  );
};

CardProducts.propTypes = {
  products: PropTypes.arrayOf(PropTypes.object),
};

export default CardProducts;