import { useState } from 'react';
import PropTypes from 'prop-types';
import { Heart } from 'lucide-react';
import { useProductCard } from '../hooks/useProductCard';
import { useCart } from '../context/CartContext.jsx';

const CardProducts = ({ products }) => {
  const { favorites, toggleFavorite } = useProductCard();
  const { addItem, openCart } = useCart();

  const [unitTypeById, setUnitTypeById] = useState({});
  const [qtyById, setQtyById] = useState({});

  const getUnitType = (id) => unitTypeById[id] || 'kg';
  const getQty = (id, tipoUnidad) => {
    const v = qtyById[id];
    if (v !== undefined && v !== null && v !== '') return v;
    return tipoUnidad === 'kg' ? '0.25' : '1';
  };

  const parsePrice = (value) => {
    const raw = String(value || '').replace(/[^0-9.,-]/g, '').replace(',', '.');
    const n = Number(raw);
    return Number.isFinite(n) ? n : 0;
  };

  const getPlaceholderImage = (index, name) => {
    const colors = ['bg-gradient-to-br from-primary to-secondary', 'bg-gradient-to-br from-secondary to-primary', 'bg-gradient-to-br from-accent-positive to-primary', 'bg-gradient-to-br from-text-dark to-secondary'];
    const color = colors[index % colors.length];
    return (
      <div className={`w-full h-40 sm:h-48 md:h-56 rounded-t-2xl sm:rounded-t-3xl flex items-center justify-center text-4xl sm:text-5xl md:text-6xl font-extrabold text-text-light ${color}`}>
        {name ? name.substring(0, 1) : 'P'}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 md:gap-8 max-w-7xl mx-auto">
      {products &&
        products.map((elem, index) => (
          <div
            key={elem.id || index}
            className="relative bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg h-full flex flex-col"
          >
            {/* Imagen Container */}
            <div className="relative w-full h-40 sm:h-48 md:h-56 overflow-hidden bg-gray-200">
              {elem.image ? (
                <img
                  className="w-full h-full object-cover"
                  src={elem.image}
                  alt={elem.name}
                />
              ) : (
                getPlaceholderImage(index, elem.name)
              )}
            </div>

            {/* Badge de categoría */}
            <div className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-primary text-white px-2 sm:px-4 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs md:text-sm font-bold shadow-lg">
              Premium
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

              <div className="grid grid-cols-2 gap-2 mb-3 sm:mb-4">
                <select
                  value={getUnitType(elem.id)}
                  onChange={(e) => {
                    const next = e.target.value;
                    setUnitTypeById((prev) => ({ ...prev, [elem.id]: next }));
                    setQtyById((prev) => ({ ...prev, [elem.id]: next === 'kg' ? '0.25' : '1' }));
                  }}
                  className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm font-bold cursor-pointer"
                >
                  <option value="kg">Kilogramos</option>
                  <option value="unid">Unidades</option>
                </select>

                <input
                  type="number"
                  inputMode="decimal"
                  min={getUnitType(elem.id) === 'kg' ? 0.25 : 1}
                  step={getUnitType(elem.id) === 'kg' ? 0.25 : 1}
                  value={getQty(elem.id, getUnitType(elem.id))}
                  onChange={(e) => setQtyById((prev) => ({ ...prev, [elem.id]: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm font-bold"
                />
              </div>

              <button
                onClick={() => {
                  const result = addItem({
                    id: elem.id,
                    nombre: elem.name,
                    precio_unitario: parsePrice(elem.description),
                    cantidad: getQty(elem.id, getUnitType(elem.id)),
                    tipo_unidad: getUnitType(elem.id),
                    peso_promedio_unidad: elem.peso_promedio_unidad,
                  });
                  if (result.ok) openCart();
                }}
                className="bg-primary w-full py-2.5 rounded-xl text-white text-sm sm:text-base font-bold shadow-lg font-heading cursor-pointer"
              >
                Agregar al carrito
              </button>
            </div>
          </div>
        ))}
    </div>
  );
};

CardProducts.propTypes = {
  products: PropTypes.arrayOf(PropTypes.object),
};

export default CardProducts;