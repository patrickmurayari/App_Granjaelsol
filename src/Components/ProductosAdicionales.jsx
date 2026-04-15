import { ShoppingCart } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/api';
import CategoryRow from './CategoryRow';

const ADICIONALES_CATEGORIES = ['Bebidas', 'Snacks', 'Almacén', 'Salsas'];

function ProductosAdicionales() {
    const { data: productos, isLoading, isError } = useQuery({
        queryKey: ['productos-adicionales'],
        queryFn: async () => {
            const { data } = await api.get('/productos');
            return data;
        },
    });

    const productosNormalizados = (productos || []).map((p) => ({
        id: p.id,
        name: p.nombre,
        description: p.precio != null ? `$${p.precio}` : '',
        image: p.imagen_url || null,
        categoria: p.categoria || null,
        peso_promedio_unidad: p.peso_promedio_unidad,
        es_unidad: p.es_unidad === true,
        disponible: p.disponible,
    }));

    const disponibles = productosNormalizados.filter((p) => p.disponible !== false);

    const hasContent = ADICIONALES_CATEGORIES.some((cat) =>
        disponibles.some((p) => p.categoria === cat)
    );

    if (!hasContent && !isLoading) return null;

    return (
        <div className="w-full px-4 lg:px-10 py-16 sm:py-20 bg-gradient-to-b from-gray-50 to-base relative overflow-hidden" id="productos-adicionales">
            <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="text-center mb-8 sm:mb-12">
                    <div className="inline-flex items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-6 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full border border-primary/30">
                        <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                        <span className="text-xs sm:text-sm md:text-base font-heading font-bold text-primary uppercase tracking-widest">
                            Más Productos
                        </span>
                        <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    </div>

                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-extrabold text-text-dark mb-3 sm:mb-4 px-2">
                        Productos Adicionales
                    </h2>

                    <p className="text-base sm:text-lg text-text-dark/70 font-body max-w-3xl mx-auto px-4">
                        Complementá tu compra con bebidas, snacks y más
                    </p>
                </div>

                {isLoading ? (
                    <div className="text-center py-8 text-lg text-secondary font-heading">
                        Cargando productos...
                    </div>
                ) : isError ? (
                    <div className="text-center py-8 text-lg text-red-600 font-heading">
                        Error al cargar productos adicionales.
                    </div>
                ) : (
                    ADICIONALES_CATEGORIES.map((cat) => {
                        const prods = disponibles.filter((p) => p.categoria === cat);
                        if (prods.length === 0) return null;
                        return (
                            <CategoryRow key={cat} title={cat} products={prods} />
                        );
                    })
                )}
            </div>
        </div>
    );
}

export default ProductosAdicionales;
