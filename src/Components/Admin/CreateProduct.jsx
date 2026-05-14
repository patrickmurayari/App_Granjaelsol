import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/api';
import {
  Plus, Loader2, AlertCircle, CheckCircle
} from 'lucide-react';

const CreateProduct = () => {
  const queryClient = useQueryClient();
  const [newProduct, setNewProduct] = useState({
    nombre: '',
    precio: '',
    categoria: '',
    peso_promedio_unidad: '',
    descripcion: '',
    imagen_url: '',
    es_unidad: false,
  });

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
        es_unidad: false,
      });
    },
  });

  const submitNewProduct = (e) => {
    e.preventDefault();
    createProductMutation.mutate(newProduct);
  };

  return (
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
            onChange={(e) => {
              const cat = e.target.value;
              const adicionales = ['Bebidas', 'Snacks', 'Almacén', 'Salsas'];
              const esAdicional = adicionales.includes(cat);
              setNewProduct({ ...newProduct, categoria: cat, es_unidad: esAdicional ? true : newProduct.es_unidad });
            }}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition text-sm"
          >
            <option value="">Seleccionar...</option>
            <optgroup label="Carnicería">
              <option value="Carnes">Carnes (Vacunos)</option>
              <option value="Cerdo">Cerdo</option>
              <option value="Pollos">Pollos</option>
              <option value="Achuras">Achuras</option>
            </optgroup>
            <optgroup label="Almacén y Adicionales">
              <option value="Bebidas">Bebidas</option>
              <option value="Snacks">Snacks</option>
              <option value="Almacén">Almacén</option>
              <option value="Salsas">Salsas</option>
            </optgroup>
          </select>
        </div>

        <div className="flex items-center justify-between py-2">
          <label className="text-xs sm:text-sm font-bold text-text-dark">
            ¿Venta por unidad?
          </label>
          <button
            type="button"
            role="switch"
            aria-checked={newProduct.es_unidad}
            onClick={() => setNewProduct({ ...newProduct, es_unidad: !newProduct.es_unidad })}
            className={`relative inline-flex h-6 sm:h-7 w-11 sm:w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 ${newProduct.es_unidad ? 'bg-primary' : 'bg-gray-300'}`}
          >
            <span
              className={`inline-block h-4 sm:h-5 w-4 sm:w-5 transform rounded-full bg-white shadow transition-transform ${newProduct.es_unidad ? 'translate-x-5 sm:translate-x-6' : 'translate-x-1'}`}
            />
          </button>
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
  );
};

export default CreateProduct;
