import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Papa from 'papaparse';
import PropTypes from 'prop-types';
import {
  ArrowLeft, Send, Printer, Loader2, AlertCircle, CalendarClock, Package, Truck, Receipt, Phone, MapPin, Mail, RefreshCw,
} from 'lucide-react';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import logo from '../img/logoo1.webp';
import { CONTACT_INFO } from '../constants/contactInfo';

const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQuvqIaO5dncFcHfcU9QiC7d23LO39aMRSjFDIdwXWGNjmZzw4aF8aFviSVD28cnpmJMrEUcsMTT-Vl/pub?gid=0&single=true&output=csv';

const WHATSAPP_MESSAGE = 'Hola Granja El Sol! Soy un comercio / gastronómico y quiero hacer un pedido mayorista de la lista de precios:';
const WHATSAPP_URL = `https://wa.me/${CONTACT_INFO.phoneRaw}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

const COLUMN_ALIASES = {
  producto: ['producto', 'nombre', 'nombre_producto', 'articulo', 'corte'],
  nota: ['nota', 'notas', 'descripcion', 'detalle', 'observacion', 'observaciones'],
  presentacion: ['presentacion', 'formato', 'unidad', 'empaque'],
  precioRegular: ['precio_regular', 'precio_regular_kilo', 'precio_regular_kg', 'precio_kilo', 'precio_kg', 'precio_lista', 'precio'],
  precioMayorista: ['precio_mayorista', 'precio_mayorista_efectivo', 'precio_efectivo', 'mayorista', 'precio_gastronomico'],
  categoria: ['categoria', 'rubro', 'tipo'],
  vigencia: ['vigencia', 'fecha', 'fecha_vigencia', 'actualizado'],
};

const normalizeKey = (key) => String(key || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9]+/g, '_')
  .replace(/^_|_$/g, '');

const pickField = (row, aliases) => {
  for (const alias of aliases) {
    const value = row[alias];
    if (value != null && String(value).trim() !== '') return String(value).trim();
  }
  return '';
};

const parsePrice = (value) => {
  if (value == null) return null;
  let str = String(value).replace(/[^\d.,-]/g, '');
  if (!str) return null;
  const hasDot = str.includes('.');
  const hasComma = str.includes(',');
  if (hasDot && hasComma) {
    str = str.lastIndexOf(',') > str.lastIndexOf('.')
      ? str.replace(/\./g, '').replace(',', '.')
      : str.replace(/,/g, '');
  } else if (hasComma) {
    str = str.replace(',', '.');
  } else if (hasDot && /^\d{1,3}(\.\d{3})+$/.test(str)) {
    str = str.replace(/\./g, '');
  }
  const num = Number(str);
  return Number.isFinite(num) && num > 0 ? num : null;
};

const fmtPrice = (n) => (n == null ? '—' : `$${n.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`);

const calcSavings = (regular, wholesale) => {
  if (!regular || !wholesale || wholesale >= regular) return null;
  return Math.round((1 - wholesale / regular) * 100);
};

const mapRow = (rawRow, idx) => {
  const row = {};
  Object.entries(rawRow).forEach(([k, v]) => { row[normalizeKey(k)] = v; });
  const precioRegular = parsePrice(pickField(row, COLUMN_ALIASES.precioRegular));
  const precioMayorista = parsePrice(pickField(row, COLUMN_ALIASES.precioMayorista));
  return {
    id: `${idx}-${pickField(row, COLUMN_ALIASES.producto)}`,
    producto: pickField(row, COLUMN_ALIASES.producto),
    nota: pickField(row, COLUMN_ALIASES.nota),
    presentacion: pickField(row, COLUMN_ALIASES.presentacion),
    categoria: pickField(row, COLUMN_ALIASES.categoria) || 'Otros',
    vigencia: pickField(row, COLUMN_ALIASES.vigencia),
    precioRegular,
    precioMayorista,
    ahorro: calcSavings(precioRegular, precioMayorista),
  };
};

const PriceTable = ({ rows }) => (
  <table className="w-full text-sm border-collapse">
    <thead>
      <tr className="border-b-2 border-gray-300 text-left text-gray-900">
        <th className="py-3 px-3 font-bold">Producto</th>
        <th className="py-3 px-3 font-bold">Presentación</th>
        <th className="py-3 px-3 font-bold text-right">Precio Regular / Kilo</th>
        <th className="py-3 px-3 font-bold text-right">Mayorista Efectivo</th>
        <th className="py-3 px-3 font-bold text-right">Ahorro</th>
      </tr>
    </thead>
    <tbody>
      {rows.map((p) => (
        <tr key={p.id} className="border-b border-gray-100 align-top break-inside-avoid">
          <td className="py-3 px-3">
            <div className="font-bold text-gray-900">{p.producto}</div>
            {p.nota && <div className="text-xs text-gray-500 mt-0.5">{p.nota}</div>}
          </td>
          <td className="py-3 px-3 text-gray-700">{p.presentacion || '—'}</td>
          <td className="py-3 px-3 text-right text-gray-400 line-through">{fmtPrice(p.precioRegular)}</td>
          <td className="py-3 px-3 text-right font-extrabold text-green-700 text-base">{fmtPrice(p.precioMayorista)}</td>
          <td className="py-3 px-3 text-right">
            {p.ahorro != null ? (
              <span className="inline-block px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-xs font-bold">-{p.ahorro}%</span>
            ) : <span className="text-gray-300">—</span>}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

PriceTable.propTypes = {
  rows: PropTypes.arrayOf(PropTypes.object).isRequired,
};

const CONDITIONS = [
  { icon: Package, title: 'Pedido mínimo bonificado', text: 'Precios mayoristas desde 5 kg por producto. Bonificación adicional en pedidos desde 10 kg.' },
  { icon: Truck, title: 'Entregas programadas', text: 'Coordinamos entregas en días fijos para tu comercio o retiro por sucursal.' },
  { icon: Receipt, title: 'Facturación', text: 'Precios finales para pago contado efectivo o transferencia inmediata. Consultar cotización para Factura A / B.' },
];

const WholesalePricing = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.body.classList.add('print-wholesale');
    return () => document.body.classList.remove('print-wholesale');
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(SHEET_CSV_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then((csvText) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: false,
          complete: (results) => {
            if (cancelled) return;
            setProducts(results.data.map(mapRow).filter((p) => p.producto));
            setLoading(false);
          },
          error: (err) => {
            console.error('Error parseando CSV:', err);
            if (cancelled) return;
            setError('No se pudo interpretar la lista de precios.');
            setLoading(false);
          },
        });
      })
      .catch((err) => {
        console.error('Error descargando lista de precios:', err);
        if (cancelled) return;
        setError('No se pudo cargar la lista de precios. Intentá nuevamente en unos minutos.');
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [reloadKey]);

  const categories = useMemo(
    () => ['Todos', ...Array.from(new Set(products.map((p) => p.categoria)))],
    [products]
  );

  const filteredProducts = useMemo(
    () => (activeCategory === 'Todos' ? products : products.filter((p) => p.categoria === activeCategory)),
    [products, activeCategory]
  );

  const groupedAll = useMemo(() => {
    const groups = new Map();
    products.forEach((p) => {
      if (!groups.has(p.categoria)) groups.set(p.categoria, []);
      groups.get(p.categoria).push(p);
    });
    return Array.from(groups.entries());
  }, [products]);

  const vigencia = useMemo(() => {
    const fromSheet = products.find((p) => p.vigencia)?.vigencia;
    return fromSheet || new Date().toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' });
  }, [products]);

  return (
    <div className="bg-gray-50 min-h-screen print:bg-white">
      <div className="print:hidden">
        <Navbar />
      </div>

      <main id="wholesale-print-area" className="pt-14 md:pt-16 print:pt-0">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 print:p-0 print:max-w-none">
          <Link
            to="/"
            className="print:hidden inline-flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-primary transition mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>

          {/* ── Encabezado institucional ── */}
          <header className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 md:p-8 print:shadow-none print:border-0 print:border-b-2 print:border-gray-800 print:rounded-none print:px-0 print:pb-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 print:flex-row print:items-center print:justify-between">
              <div className="flex items-center gap-4">
                <img src={logo} alt="Granja El Sol" className="h-16 w-16 rounded-xl" />
                <div>
                  <h1 className="text-2xl md:text-3xl font-heading font-extrabold text-gray-900 leading-tight">
                    Granja El Sol
                  </h1>
                  <p className="text-base md:text-lg font-semibold text-gray-700">
                    Atención a Comercios y Gastronomía
                  </p>
                  <span className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
                    <CalendarClock className="w-3.5 h-3.5" />
                    Precios vigentes: {vigencia}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 print:hidden">
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl font-bold text-sm transition"
                >
                  <Send className="w-4 h-4" />
                  Contactar por WhatsApp
                </a>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center justify-center gap-2 border-2 border-gray-300 hover:border-gray-900 text-gray-900 px-5 py-3 rounded-xl font-bold text-sm transition bg-white"
                >
                  <Printer className="w-4 h-4" />
                  Imprimir / Guardar en PDF
                </button>
              </div>

              <div className="hidden print:block text-right text-xs text-gray-700 leading-relaxed">
                <div>{CONTACT_INFO.phone}</div>
                <div>{CONTACT_INFO.email}</div>
                <div>{CONTACT_INFO.address}</div>
              </div>
            </div>
          </header>

          {/* ── Contenido ── */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-600">
              <Loader2 className="w-8 h-8 animate-spin mb-3" />
              <span className="font-semibold">Cargando lista de precios...</span>
            </div>
          ) : error ? (
            <div className="mt-6 flex flex-col items-center gap-3 bg-red-50 border-2 border-red-200 rounded-2xl p-6 text-center">
              <AlertCircle className="w-8 h-8 text-red-600" />
              <p className="font-bold text-red-800">{error}</p>
              <button
                type="button"
                onClick={() => setReloadKey((k) => k + 1)}
                className="print:hidden inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-700 transition"
              >
                <RefreshCw className="w-4 h-4" />
                Reintentar
              </button>
            </div>
          ) : products.length === 0 ? (
            <div className="mt-6 text-center py-16 text-gray-500 font-semibold">
              No hay productos publicados en este momento.
            </div>
          ) : (
            <>
              {/* Filtros */}
              <div className="print:hidden mt-6 flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold border-2 transition ${
                      activeCategory === cat
                        ? 'bg-gray-900 border-gray-900 text-white'
                        : 'bg-white border-gray-200 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Tabla (desktop, pantalla) */}
              <div className="print:hidden hidden md:block mt-4 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <PriceTable rows={filteredProducts} />
              </div>

              {/* Tarjetas (mobile, pantalla) */}
              <div className="print:hidden md:hidden mt-4 space-y-3">
                {filteredProducts.map((p) => (
                  <div key={p.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <div className="font-bold text-gray-900">{p.producto}</div>
                        {p.nota && <div className="text-xs text-gray-500 mt-0.5">{p.nota}</div>}
                        {p.presentacion && (
                          <div className="text-xs font-semibold text-gray-700 mt-1.5">{p.presentacion}</div>
                        )}
                      </div>
                      {p.ahorro != null && (
                        <span className="shrink-0 px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-xs font-bold">-{p.ahorro}%</span>
                      )}
                    </div>
                    <div className="mt-3 flex items-end justify-between border-t border-gray-100 pt-3">
                      <div>
                        <div className="text-[10px] uppercase tracking-wide text-gray-500 font-bold">Regular / kg</div>
                        <div className="text-sm text-gray-400 line-through">{fmtPrice(p.precioRegular)}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] uppercase tracking-wide text-green-700 font-bold">Mayorista efectivo</div>
                        <div className="text-xl font-extrabold text-green-700">{fmtPrice(p.precioMayorista)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Lista completa (solo impresión) */}
              <div className="hidden print:block mt-4">
                {groupedAll.map(([cat, rows]) => (
                  <section key={cat} className="mb-4">
                    <h2 className="text-sm font-extrabold uppercase tracking-wider text-gray-900 border-b border-gray-400 pb-1 mb-1">{cat}</h2>
                    <PriceTable rows={rows} />
                  </section>
                ))}
              </div>
            </>
          )}

          {/* ── Condiciones comerciales ── */}
          <section className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 print:grid-cols-3 print:mt-4 print:gap-2 break-inside-avoid">
            {CONDITIONS.map(({ icon: Icon, title, text }) => (
              <div key={title} className="bg-white rounded-2xl border-2 border-amber-200 p-4 print:rounded-lg print:p-2 print:border">
                <div className="flex items-center gap-2 mb-1.5">
                  <Icon className="w-5 h-5 text-amber-700 print:w-4 print:h-4" />
                  <h3 className="font-extrabold text-gray-900 text-sm">{title}</h3>
                </div>
                <p className="text-sm text-gray-700 print:text-xs">{text}</p>
              </div>
            ))}
          </section>

          {/* ── Contacto ── */}
          <section className="mt-6 bg-gray-900 text-white rounded-2xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3 print:bg-white print:text-gray-900 print:border-t-2 print:border-gray-800 print:rounded-none print:px-0 print:mt-4 print:flex-row break-inside-avoid">
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <span className="inline-flex items-center gap-2"><Phone className="w-4 h-4" />{CONTACT_INFO.phone}</span>
              <span className="inline-flex items-center gap-2"><Mail className="w-4 h-4" />{CONTACT_INFO.email}</span>
              <span className="inline-flex items-center gap-2"><MapPin className="w-4 h-4" />{CONTACT_INFO.address}</span>
            </div>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="print:hidden inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition"
            >
              <Send className="w-4 h-4" />
              Hacer pedido
            </a>
          </section>
        </div>
      </main>

      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
};

export default WholesalePricing;
