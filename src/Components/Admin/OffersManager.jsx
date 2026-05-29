import { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ImagePlus, Loader2, AlertCircle, Tag } from 'lucide-react';
import api from '../../api/api';

const CATEGORIES = ['Vacunos', 'Cerdo', 'Pollos', 'Achuras', 'Bebidas', 'Snacks', 'Almacén', 'Salsas'];

const OffersManager = ({ addToast }) => {
  const [title, setTitle] = useState('');
  const [linkToCategory, setLinkToCategory] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: offers, isLoading } = useQuery({
    queryKey: ['store-offers'],
    queryFn: async () => {
      const { data } = await api.get('/finance/offers');
      return data;
    },
  });

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(f));
    e.target.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { setError('Seleccioná una imagen.'); return; }
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('image', file);
      if (title) formData.append('title', title);
      if (linkToCategory) formData.append('link_to_category', linkToCategory);
      await api.post('/finance/offers/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      addToast?.('Oferta publicada correctamente');
      queryClient.invalidateQueries({ queryKey: ['store-offers'] });
      setTitle('');
      setLinkToCategory('');
      setFile(null);
      if (preview) { URL.revokeObjectURL(preview); setPreview(null); }
    } catch (err) {
      const msg = err.response?.data?.error || 'Error al subir la oferta.';
      setError(msg);
      addToast?.(msg, 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Tag className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-heading font-extrabold text-text-dark">
              Ofertas Semanales
            </h2>
            <p className="text-xs sm:text-sm text-text-dark/60">
              Las imágenes se optimizan automáticamente a WebP antes de publicarse.
            </p>
          </div>
        </div>
      </div>

      {/* Upload form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6 space-y-5">
        <h3 className="font-extrabold text-text-dark text-base">Nueva oferta</h3>

        {/* Large image picker — optimized for mobile */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            disabled={uploading}
          />
          <button
            type="button"
            onClick={() => !uploading && fileInputRef.current?.click()}
            className={`w-full rounded-2xl border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center gap-3 py-10 px-4 ${
              preview
                ? 'border-orange-300 bg-orange-50/40'
                : 'border-gray-300 bg-gray-50 hover:border-orange-400 hover:bg-orange-50/30'
            } ${uploading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer active:scale-[0.99]'}`}
          >
            {preview ? (
              <>
                <img
                  src={preview}
                  alt="Vista previa"
                  className="max-h-52 rounded-xl object-contain shadow-md"
                />
                <span className="text-xs text-text-dark/50 font-bold">Tocá para cambiar la imagen</span>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center">
                  <ImagePlus className="w-8 h-8 text-orange-500" />
                </div>
                <div className="text-center">
                  <p className="font-extrabold text-text-dark text-base">Seleccionar imagen</p>
                  <p className="text-sm text-text-dark/50 mt-1">JPG, PNG u otro formato</p>
                  <p className="text-xs text-orange-600 font-bold mt-2">
                    📱 En celular abre la cámara o galería
                  </p>
                </div>
              </>
            )}
          </button>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-bold text-text-dark mb-1.5">
            Título <span className="text-text-dark/40 font-normal">(opcional)</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="ej: Oferta de la semana — Asado"
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition text-sm font-body"
            disabled={uploading}
          />
        </div>

        {/* Category link */}
        <div>
          <label className="block text-sm font-bold text-text-dark mb-1.5">
            Vincular a categoría <span className="text-text-dark/40 font-normal">(opcional)</span>
          </label>
          <select
            value={linkToCategory}
            onChange={(e) => setLinkToCategory(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition text-sm font-body bg-white"
            disabled={uploading}
          >
            <option value="">Sin categoría</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <p className="text-xs text-text-dark/40 mt-1.5">
            Al hacer clic en la oferta, el usuario irá directo a esa categoría de productos.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <p className="text-sm font-bold text-red-700">{error}</p>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={uploading || !file}
          className={`w-full py-4 rounded-2xl font-extrabold text-base transition-all duration-200 flex items-center justify-center gap-3 ${
            uploading || !file
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-lg hover:shadow-orange-200 active:scale-[0.98]'
          }`}
        >
          {uploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Procesando imagen...
            </>
          ) : (
            <>
              <ImagePlus className="w-5 h-5" />
              Publicar Oferta
            </>
          )}
        </button>
      </form>

      {/* Offers grid */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <Tag className="w-5 h-5 text-orange-500" />
          <h3 className="font-extrabold text-text-dark text-sm sm:text-base">Ofertas activas</h3>
          {offers && offers.length > 0 && (
            <span className="ml-auto text-xs font-bold bg-orange-100 text-orange-700 px-2.5 py-1 rounded-full">
              {offers.length}
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-text-dark/50">
            <Loader2 className="w-5 h-5 animate-spin" />
            Cargando...
          </div>
        ) : !offers || offers.length === 0 ? (
          <div className="py-12 text-center text-text-dark/40">
            <ImagePlus className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Aún no hay ofertas publicadas.</p>
            <p className="text-xs mt-1">Subí la primera imagen para comenzar.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-4">
            {offers.map((offer) => (
              <div key={offer.id} className="relative rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                <img
                  src={offer.image_url}
                  alt={offer.title || 'Oferta'}
                  className="w-full aspect-square object-cover"
                  loading="lazy"
                />
                {offer.title && (
                  <div className="px-2 py-1.5 bg-white">
                    <p className="text-xs font-bold text-text-dark truncate">{offer.title}</p>
                  </div>
                )}
                {offer.link_to_category && (
                  <div className="absolute top-1.5 right-1.5">
                    <span className="text-[10px] font-bold bg-orange-500 text-white px-1.5 py-0.5 rounded-full">
                      {offer.link_to_category}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

OffersManager.propTypes = {
  addToast: PropTypes.func,
};

export default OffersManager;
