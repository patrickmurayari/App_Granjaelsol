import { useState } from 'react';
import { ChevronDown, ChevronUp, Heart } from 'lucide-react';
import { useProductCard } from '../hooks/useProductCard';
import { useCart } from '../context/CartContext.jsx';
import PropTypes from 'prop-types';

function CompactCard({ elem }) {
  const { favorites, toggleFavorite } = useProductCard();
  const { addItem, openCart } = useCart();

  const sinStock = elem.disponible === false;
  const esUnidad = elem.es_unidad === true;
  const [qty, setQty] = useState('1');

  const parsePrice = (value) => {
    const raw = String(value || '').replace(/[^0-9.,-]/g, '').replace(',', '.');
    const n = Number(raw);
    return Number.isFinite(n) ? n : 0;
  };

  const adjustQty = (delta) => {
    const current = parseInt(qty, 10) || 1;
    const next = current + delta;
    if (next >= 1) setQty(String(next));
  };

  const handleAdd = () => {
    if (sinStock) return;
    const result = addItem({
      id: elem.id,
      nombre: elem.name,
      precio_unitario: parsePrice(elem.description),
      cantidad: qty,
      tipo_unidad: esUnidad ? 'unid' : 'kg',
      peso_promedio_unidad: elem.peso_promedio_unidad,
      es_unidad: esUnidad,
    });
    if (result.ok) openCart();
  };

  return (
    <div className={`relative flex-shrink-0 w-40 sm:w-48 bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow snap-start ${sinStock ? 'opacity-60' : ''}`} style={{ minHeight: '280px' }}>
      {/* Imagen - contenedor más alto con más aire */}
      <div className="relative w-full h-36 sm:h-52 overflow-hidden bg-gray-200">
        {elem.image ? (
          <img
            className={`w-full h-full object-cover ${sinStock ? 'grayscale' : ''}`}
            src={elem.image}
            alt={elem.name}
            loading="lazy"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-3xl font-extrabold text-text-light ${sinStock ? 'grayscale' : ''}`}>
            {elem.name ? elem.name.substring(0, 1) : 'P'}
          </div>
        )}
        {sinStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <span className="bg-red-600 text-white px-2 py-1 rounded-md text-[10px] sm:text-xs font-extrabold shadow-lg">SIN STOCK</span>
          </div>
        )}
        {esUnidad && !sinStock && (
          <span className="absolute top-1 left-1 bg-secondary text-white px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold shadow">U</span>
        )}
      </div>

      {/* Info - más espacio vertical y aire */}
      <div className="p-3 sm:p-4 flex flex-col gap-2 flex-1">
        <h3 className="text-xs sm:text-sm font-bold text-text-dark line-clamp-1 leading-tight pt-1">{elem.name}</h3>
        <span className="text-sm sm:text-lg font-extrabold text-primary pb-1">{elem.description}</span>

        {/* Cantidad + Agregar - reposicionados al fondo, ancho igual 50/50 */}
        <div className={`flex items-center gap-2 mt-auto pt-2 ${sinStock ? 'pointer-events-none opacity-50' : ''}`}>
          <div className="flex-1 flex items-stretch rounded-lg border border-gray-200 overflow-hidden">
            <button
              type="button"
              onClick={() => adjustQty(-1)}
              className="w-6 h-8 flex items-center justify-center active:bg-gray-100"
              aria-label="Decrementar"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={qty}
              onChange={(e) => {
                const v = e.target.value;
                if (v === '' || /^[1-9]\d*$/.test(v)) setQty(v || '1');
              }}
              onBlur={() => {
                const n = parseInt(qty, 10);
                setQty(n >= 1 ? String(n) : '1');
              }}
              className="flex-1 min-w-0 text-center text-xs font-bold focus:outline-none"
              aria-label="Cantidad"
            />
            <button
              type="button"
              onClick={() => adjustQty(1)}
              className="w-6 h-8 flex items-center justify-center active:bg-gray-100"
              aria-label="Incrementar"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            disabled={sinStock}
            onClick={handleAdd}
            className={`flex-1 py-2 rounded-lg text-[10px] sm:text-xs font-bold min-h-[32px] ${
              sinStock ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-primary text-white active:scale-95 transition-transform'
            }`}
          >
            {sinStock ? 'No disp.' : 'Agregar'}
          </button>
        </div>
      </div>

      {/* Favorito - reposicionado más arriba */}
      <button
        onClick={() => toggleFavorite(elem.id)}
        className="absolute top-1 right-1 bg-white/80 text-primary p-1 rounded-full shadow cursor-pointer"
      >
        <Heart size={12} className={favorites.has(elem.id) ? 'fill-current' : ''} />
      </button>
    </div>
  );
}

CompactCard.propTypes = {
  elem: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    description: PropTypes.string,
    image: PropTypes.string,
    es_unidad: PropTypes.bool,
    disponible: PropTypes.bool,
    peso_promedio_unidad: PropTypes.number,
  }).isRequired,
};

function CategoryRow({ title, products }) {
  if (!products || products.length === 0) return null;

  return (
    <div className="mb-6 sm:mb-8">
      <h3 className="text-lg sm:text-xl md:text-2xl font-heading font-bold text-text-dark mb-3 sm:mb-4 px-1">
        {title}
      </h3>
      <div
        className="flex gap-3 sm:gap-4 overflow-x-auto pb-3 -mx-2 px-2 scrollbar-hide"
        style={{
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {products.map((p) => (
          <CompactCard key={p.id} elem={p} />
        ))}
      </div>
    </div>
  );
}

CategoryRow.propTypes = {
  title: PropTypes.string.isRequired,
  products: PropTypes.arrayOf(PropTypes.object),
};

export default CategoryRow;
