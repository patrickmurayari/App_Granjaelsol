import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL || 'https://app-granjaelsol-backend.vercel.app/api';

function HeroSection() {
    const [imageUrl, setImageUrl] = useState(null);
    const [altText, setAltText] = useState('Granja El Sol');

    useEffect(() => {
        fetch(`${API_BASE}/content/carousel`)
            .then((r) => r.json())
            .then((data) => {
                if (Array.isArray(data) && data.length > 0) {
                    setImageUrl(data[0].image_url);
                    setAltText(data[0].alt_text || 'Granja El Sol');
                }
            })
            .catch(() => {});
    }, []);

    return (
        <section id="carrousel" className="relative w-full h-screen overflow-hidden">
            {/* Gradient overlay for navbar text contrast */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/10 to-transparent z-10 pointer-events-none" />

            {imageUrl ? (
                <img
                    src={imageUrl}
                    alt={altText}
                    className="absolute inset-0 w-full h-full object-cover"
                    fetchPriority="high"
                    decoding="sync"
                    loading="eager"
                />
            ) : (
                <div className="absolute inset-0 bg-gray-900 animate-pulse" />
            )}
        </section>
    );
}

export default HeroSection;
