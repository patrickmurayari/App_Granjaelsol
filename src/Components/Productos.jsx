import { useState } from "react";
import { Search, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "../api/api";
import CardProducts from "./CardProducts";

const CATEGORIES = ['Vacunos', 'Cerdo', 'Pollos', 'Achuras']; 

const CATEGORY_DB_MAP = {
    Vacunos: 'Carnes',
    Cerdo: 'Cerdo',
    Pollos: 'Pollos',
    Achuras: 'Achuras',
};

// Componente Principal Productos

function Productos() {
    // Estado para manejar la pestaña activa (Vacunos, Cerdo, Pollos)
    const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);
    const [searchTerm, setSearchTerm] = useState("");
    
    const {
        data: productos,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ['productos'],
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

    // Mostrar todos los productos (incluidos los no disponibles)
    let productsToShow = productosNormalizados;

    if (activeCategory) {
        const dbCategory = CATEGORY_DB_MAP[activeCategory] || activeCategory;
        productsToShow = productsToShow.filter((product) => product.categoria === dbCategory);
    }
    
    // Filtrar por búsqueda
    if (searchTerm.trim()) {
        productsToShow = productsToShow.filter(product =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }

    return (
        <div className="md:mt-28 bg-gradient-to-b from-white to-gray-50 px-2 sm:px-4 md:px-8 py-12 sm:py-16" id="productos">
            <div className="text-center mb-8 sm:mb-12">
                <h1 className="text-center text-3xl sm:text-4xl md:text-5xl font-heading font-extrabold mb-3 sm:mb-4 text-text-dark">
                    Nuestros Productos
                </h1>
                <p className="text-base sm:text-lg text-text-dark/70 font-body max-w-2xl mx-auto px-2">
                    Selecciona entre nuestras categorías premium de carnes frescas
                </p>
            </div>

            {/* Barra de búsqueda mejorada */}
            <div className="flex justify-center mb-6 sm:mb-10 px-2">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-primary w-4 h-4 sm:w-5 sm:h-5" />
                    <input
                        type="text"
                        placeholder="Buscar producto..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-2.5 sm:py-3 md:py-4 rounded-xl sm:rounded-2xl border-2 border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition shadow-md hover:shadow-lg font-body text-sm sm:text-base"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm("")}
                            className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primary transition"
                        >
                            <X className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Selector de Categorías (Pestañas mejoradas) */}
            <div className="flex justify-center mb-8 sm:mb-14 px-2">
                <div className="flex flex-wrap gap-2 sm:gap-3 p-1.5 sm:p-2 md:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-gray-50 to-gray-100 shadow-lg border border-gray-200 justify-center w-full md:w-auto backdrop-blur-sm">
                    {CATEGORIES.map((category) => (
                        <button
                            key={category}
                            onClick={() => {
                                setActiveCategory(category);
                                setSearchTerm("");
                            }}
                            className={`
                                py-1.5 sm:py-2 md:py-3 px-4 sm:px-6 md:px-10 rounded-lg sm:rounded-xl text-sm sm:text-base md:text-lg font-heading font-bold transition-all duration-300 whitespace-nowrap transform hover:scale-105 relative overflow-hidden
                                ${activeCategory === category
                                    ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg scale-105' 
                                    : 'bg-white !text-black !opacity-100 hover:bg-white hover:!text-primary hover:shadow-md'
                                }
                            `}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>
            
            {/* Visualización de Productos */}
            {isLoading ? (
                <div className="text-center py-8 sm:py-10 text-lg sm:text-xl text-secondary font-heading px-4">
                    Cargando productos...
                </div>
            ) : isError ? (
                <div className="text-center py-8 sm:py-10 text-lg sm:text-xl text-secondary font-heading px-4">
                    Error al cargar productos. Verifica que el backend esté activo.
                </div>
            ) : productsToShow.length > 0 ? (
                <>
                    <div className="text-center mb-3 sm:mb-4 text-xs sm:text-sm text-text-dark/60">
                        Mostrando {productsToShow.length} producto{productsToShow.length !== 1 ? 's' : ''}
                    </div>
                    <CardProducts products={productsToShow} />
                </>
            ) : (
                <div className="text-center py-8 sm:py-10 text-lg sm:text-xl text-secondary font-heading px-4">
                    {searchTerm 
                        ? `No se encontraron productos con "${searchTerm}" en ${activeCategory}.`
                        : `No hay productos disponibles en la categoría de ${activeCategory}.`
                    }
                </div>
            )}
        </div>
    );
}

export default Productos;
