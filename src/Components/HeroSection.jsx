import { useEffect, useState } from "react";
import { Loader2, Tag } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || 'https://app-granjaelsol-backend.vercel.app/api';

function HeroSection() {
    const [slide, setSlide] = useState(null);
    const [showButton, setShowButton] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    useEffect(() => {
        fetch(`${API_BASE}/content/carousel`)
            .then((r) => r.json())
            .then((data) => {
                if (Array.isArray(data) && data.length > 0) {
                    setSlide(data[0]);
                }
            })
            .catch(() => {});
    }, []);

    const alt = slide?.alt_text || 'Granja El Sol';

    useEffect(() => {
        if (!slide) return;
        const t = setTimeout(() => setShowButton(true), 350);
        return () => clearTimeout(t);
    }, [slide]);

    return (
        <section id="carrousel" className="relative w-full overflow-hidden">
            {/* Gradient overlay for navbar text contrast */}
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/30 to-transparent z-10 pointer-events-none" />

            {/* CTA button */}
            <button
                onClick={() => document.getElementById('ofertas')?.scrollIntoView({ behavior: 'smooth' })}
                className={`absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-5 py-2.5 rounded-full backdrop-blur-sm bg-white/20 border border-white/50 text-white text-sm font-bold whitespace-nowrap hover:bg-white/35 hover:border-white/80 transition-all duration-300 shadow-lg ${
                    showButton ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                } transition-[opacity,transform] duration-700`}
            >
                <Tag className="w-4 h-4" />
                Ofertas Especiales
            </button>

            {slide ? (
                <div className="relative w-full">
                    {/* Loading skeleton */}
                    {!imageLoaded && (
                        <div className="absolute inset-0 z-10 bg-gray-200 animate-pulse rounded-2xl flex items-center justify-center">
                            <Loader2 className="w-10 h-10 text-gray-400 animate-spin" />
                        </div>
                    )}
                    {/* Mobile image */}
                    <img
                        src={slide.image_url}
                        alt={alt}
                        className={`block md:hidden w-full h-[80vh] object-cover transition-opacity duration-500 ${
                            imageLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                        fetchPriority="high"
                        decoding="sync"
                        loading="eager"
                        onLoad={() => setImageLoaded(true)}
                    />
                    {/* Desktop image */}
                    <img
                        src={slide.desktop_image_url}
                        alt={alt}
                        className={`hidden md:block w-full h-[93vh] object-cover transition-opacity duration-500 ${
                            imageLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                        fetchPriority="high"
                        decoding="sync"
                        loading="eager"
                        onLoad={() => setImageLoaded(true)}
                    />
                </div>
            ) : (
                <div className="w-full h-[80vh] md:h-[93vh] bg-gray-200 animate-pulse rounded-2xl flex items-center justify-center">
                    <Loader2 className="w-10 h-10 text-gray-400 animate-spin" />
                </div>
            )}
        </section>
    );
}

export default HeroSection;
