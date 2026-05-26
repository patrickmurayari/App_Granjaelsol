import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Link } from "react-scroll";

const API_BASE = import.meta.env.VITE_API_URL || 'https://app-granjaelsol-backend.vercel.app/api';

function Carrousel() {
    const [slides, setSlides] = useState([]);
    const [loading, setLoading] = useState(true);
    const slidesRef = useRef([]);
    const carouselRef = useRef(null);
    const autoPlayRef = useRef(null);
    const isInteractingRef = useRef(false);

    useEffect(() => {
        fetch(`${API_BASE}/content/carousel`)
            .then((r) => r.json())
            .then((data) => {
                slidesRef.current = data;
                setSlides(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const getSlideWidth = useCallback(() => {
        if (!carouselRef.current) return 0;
        return carouselRef.current.offsetWidth;
    }, []);

    const getCurrentIndex = useCallback(() => {
        if (!carouselRef.current) return 0;
        const width = getSlideWidth();
        if (!width) return 0;
        return Math.round(carouselRef.current.scrollLeft / width);
    }, [getSlideWidth]);

    const scrollToIndex = useCallback(
        (index) => {
            if (!carouselRef.current) return;
            const width = getSlideWidth();
            if (!width) return;

            carouselRef.current.scrollTo({
                left: index * width,
                behavior: "smooth",
            });
        },
        [getSlideWidth]
    );

    const scroll = useCallback(
        (direction) => {
            const count = slidesRef.current.length;
            if (!count) return;
            const currentIndex = getCurrentIndex();

            let nextIndex = direction === "next" ? currentIndex + 1 : currentIndex - 1;
            if (nextIndex >= count) nextIndex = 0;
            if (nextIndex < 0) nextIndex = count - 1;

            scrollToIndex(nextIndex);
        },
        [getCurrentIndex, scrollToIndex]
    );

    const startAutoPlay = useCallback(() => {
        if (autoPlayRef.current) clearInterval(autoPlayRef.current);
        autoPlayRef.current = setInterval(() => {
            if (isInteractingRef.current) return;
            scroll("next");
        }, 10000);
    }, [scroll]);

    const resetAutoPlay = useCallback(() => {
        startAutoPlay();
    }, [startAutoPlay]);

    useEffect(() => {
        if (slides.length > 0) {
            startAutoPlay();
        }
        return () => {
            if (autoPlayRef.current) clearInterval(autoPlayRef.current);
        };
    }, [slides, startAutoPlay]);

    if (loading) {
        return (
            <div className="w-full h-screen pt-14 md:pt-16 relative overflow-hidden" id="carrousel">
                <div className="w-full h-[calc(100vh-3.5rem)] md:h-[calc(100vh-4rem)] bg-gray-800 animate-pulse flex items-center justify-center">
                    <div className="space-y-4 text-center">
                        <div className="h-8 w-64 bg-gray-600 rounded-xl mx-auto animate-pulse" />
                        <div className="h-1 w-24 bg-gray-600 rounded-full mx-auto" />
                        <div className="h-5 w-48 bg-gray-600 rounded-lg mx-auto animate-pulse" />
                    </div>
                </div>
                <div className="h-1 bg-gradient-to-r from-primary via-secondary to-primary" />
            </div>
        );
    }

    if (slides.length === 0) {
        return (
            <div className="w-full h-screen pt-14 md:pt-16 relative overflow-hidden" id="carrousel">
                <div className="w-full h-[calc(100vh-3.5rem)] md:h-[calc(100vh-4rem)] bg-gray-900 flex items-center justify-center" />
                <div className="h-1 bg-gradient-to-r from-primary via-secondary to-primary" />
            </div>
        );
    }

    return (
        <div className="w-full h-screen pt-0.5 md:pt-16 relative overflow-hidden" id="carrousel">
            {/* Contenedor principal del carrusel */}
            <div className="relative group">
                {/* Carrusel con scroll horizontal */}
                <div
                    ref={carouselRef}
                    className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory touch-pan-x overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    onMouseEnter={() => {
                        if (autoPlayRef.current) clearInterval(autoPlayRef.current);
                    }}
                    onMouseLeave={resetAutoPlay}
                    onTouchStart={() => {
                        isInteractingRef.current = true;
                        if (autoPlayRef.current) clearInterval(autoPlayRef.current);
                    }}
                    onTouchEnd={() => {
                        isInteractingRef.current = false;
                        resetAutoPlay();
                    }}
                >
                    {slides.map((slide, index) => (
                        <div
                            key={slide.id ?? index}
                            className="w-full h-[calc(100vh-3.5rem)] md:h-[calc(100vh-4rem)] flex-shrink-0 snap-center relative overflow-hidden"
                        >
                            {/* Imagen de fondo dinámica desde base de datos */}
                            <div className="absolute inset-0">
                                <img
                                    src={slide.image_url}
                                    alt={slide.alt_text || slide.title || ''}
                                    className="w-full h-full object-cover"
                                    style={{ willChange: 'auto' }}
                                    loading={index === 0 ? 'eager' : 'lazy'}
                                    fetchPriority={index === 0 ? 'high' : 'auto'}
                                    decoding={index === 0 ? 'sync' : 'async'}
                                    draggable={false}
                                />
                            </div>

                            {/* Indicador de slide - decorativo */}
                            <div className="absolute bottom-6 right-6 bg-black/50 text-white px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm pointer-events-none select-none">
                                {index + 1} / {slides.length}
                            </div>
                        </div>
                    ))}
                </div>
                {/* Indicadores de progreso - decorativos, sin interacción */}
                <div className="absolute bottom-6 left-6 flex gap-2 z-20 pointer-events-none select-none">
                    {slides.map((_, index) => (
                        <div
                            key={index}
                            className="h-1 bg-white/40 rounded-full"
                            style={{
                                width: index === 0 ? "24px" : "8px",
                            }}
                        ></div>
                    ))}
                </div>

                {/* Indicador sutil para scrollear */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
                    <Link to="ofertas" spy={true} smooth={true} offset={-80} duration={500}>
                        <button
                            type="button"
                            aria-label="Ver más"
                            className="text-white/70 hover:text-white transition-all duration-300 hover:scale-110"
                        >
                            <ChevronDown className="w-7 h-7 animate-bounce" />
                        </button>
                    </Link>
                </div>
            </div>

            {/* Decoración inferior - sin interacción */}
            <div className="h-1 bg-gradient-to-r from-primary via-secondary to-primary pointer-events-none"></div>
        </div>
    );
}

export default Carrousel;
