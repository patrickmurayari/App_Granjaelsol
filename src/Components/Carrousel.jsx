import { useCallback, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { Link } from "react-scroll";
import logo2 from "../img/foto21.png";
import logo3 from "../img/foto31.png";
import logo5 from "../img/foto5.jpg";
import logo6 from "../img/foto6.jpg";

const slides = [
    { url: logo2, title: "Precios accesibles", subtitle: "Calidad garantizada, directamente a tu mesa.", icon: "💰" },
    { url: logo3, title: "¡Visítanos Hoy!", subtitle: "Conoce nuestra amplia variedad de cortes.", icon: "🏪" },
    { url: logo5, title: "¡Pedi a Domicilio!", subtitle: "Servicio de Delivery disponible.", icon: "🛵" },
    { url: logo6, title: "Combos y Ofertas", subtitle: "Consulta por nuestras ofertas y combos.", icon: "🎉" },
];

function Carrousel() {
    const carouselRef = useRef(null);
    const autoPlayRef = useRef(null);
    const isInteractingRef = useRef(false);

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
            const currentIndex = getCurrentIndex();

            let nextIndex = direction === "next" ? currentIndex + 1 : currentIndex - 1;
            if (nextIndex >= slides.length) nextIndex = 0;
            if (nextIndex < 0) nextIndex = slides.length - 1;

            scrollToIndex(nextIndex);
        },
        [getCurrentIndex, scrollToIndex]
    );

    const startAutoPlay = useCallback(() => {
        if (autoPlayRef.current) clearInterval(autoPlayRef.current);
        autoPlayRef.current = setInterval(() => {
            if (isInteractingRef.current) return;
            scroll("next");
        }, 5000);
    }, [scroll]);

    const resetAutoPlay = useCallback(() => {
        startAutoPlay();
    }, [startAutoPlay]);

    useEffect(() => {
        startAutoPlay();
        return () => {
            if (autoPlayRef.current) clearInterval(autoPlayRef.current);
        };
    }, [startAutoPlay]);

    return (
        <div className="w-full h-screen pt-14 md:pt-16 relative overflow-hidden" id="carrousel">
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
                            key={index}
                            className="w-full h-[calc(100vh-3.5rem)] md:h-[calc(100vh-4rem)] flex-shrink-0 snap-center relative overflow-hidden"
                        >
                            {/* Imagen de fondo estática (sin zoom) */}
                            <div className="absolute inset-0">
                                <img
                                    src={slide.url}
                                    alt={slide.title}
                                    className="w-full h-full object-cover"
                                    style={{ willChange: 'auto' }}
                                    loading={index === 0 ? 'eager' : 'lazy'}
                                    draggable={false}
                                />
                            </div>

                            {/* Overlay gradiente - decorativo, sin interacción */}
                            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/60 pointer-events-none"></div>

                            {/* Contenido con animación */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 md:p-8">
                                {/* Icono decorativo */}
                                <div className="text-6xl md:text-8xl mb-6 pointer-events-none select-none">
                                    {slide.icon}
                                </div>

                                {/* Título */}
                                <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-extrabold text-text-light mb-4 drop-shadow-2xl leading-tight max-w-4xl pointer-events-none select-none">
                                    {slide.title}
                                </h1>

                                {/* Línea decorativa */}
                                <div className="w-24 h-1 bg-gradient-to-r from-primary via-secondary to-primary rounded-full mb-6 pointer-events-none"></div>

                                {/* Subtítulo */}
                                <p className="text-lg md:text-2xl lg:text-3xl font-body text-text-light drop-shadow-lg max-w-3xl pointer-events-none select-none">
                                    {slide.subtitle}
                                </p>
                            </div>

                            {/* Indicador de slide - decorativo */}
                            <div className="absolute bottom-6 right-6 bg-black/50 text-white px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm pointer-events-none select-none">
                                {index + 1} / {slides.length}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Botón Anterior */}
                <button
                    onClick={() => scroll("prev")}
                    className="hidden md:flex absolute left-4 md:left-8 top-1/2 transform -translate-y-1/2 z-20 bg-white/90 hover:bg-primary text-primary hover:text-white p-3 md:p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 backdrop-blur-sm group-hover:opacity-100 opacity-0 md:opacity-100"
                    aria-label="Anterior"
                >
                    <ChevronLeft size={28} />
                </button>

                {/* Botón Siguiente */}
                <button
                    onClick={() => scroll("next")}
                    className="hidden md:flex absolute right-4 md:right-8 top-1/2 transform -translate-y-1/2 z-20 bg-white/90 hover:bg-primary text-primary hover:text-white p-3 md:p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 backdrop-blur-sm group-hover:opacity-100 opacity-0 md:opacity-100"
                    aria-label="Siguiente"
                >
                    <ChevronRight size={28} />
                </button>

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
