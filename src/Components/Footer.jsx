import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Instagram, Facebook, Send, ArrowUp, Clock, Navigation } from 'lucide-react';
import logo from '../img/logoo1.webp';
import { CONTACT_INFO } from '../constants/contactInfo';

const SCHEDULE = [
    { days: 'Lunes a Sábado', hours: '8:00 – 13:00 / 16:00 – 20:00' },
    { days: 'Domingo',        hours: '8:00 – 13:00' },
];

const MAPS_LINK = 'https://maps.google.com/?q=Isla+Jorge+299,+Fatima,+Buenos+Aires,+Argentina';

const ColHeading = ({ children }) => (
    <h4 className="text-xs font-heading font-bold uppercase tracking-widest text-white mb-4">
        {children}
    </h4>
);

ColHeading.propTypes = {
    children: PropTypes.node.isRequired,
};

function Footer() {
    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    return (
        <footer className="bg-gray-900 text-white font-body">
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">

                {/* ── 4 columnas ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

                    {/* Col 1 – Marca */}
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <img src={logo} alt="Granja El Sol" className="h-14 w-14 rounded-lg" />
                            <span className="font-heading font-extrabold text-xl">Granja El Sol</span>
                        </div>
                        <p className="text-white text-sm leading-relaxed mb-5">
                            Tradición de sabor desde 2016. Cortes premium de carne fresca con calidad garantizada y atención personalizada.
                        </p>
                        <div className="flex items-center gap-3">
                            <a href={CONTACT_INFO.instagramUrlAlt} target="_blank" rel="noopener noreferrer"
                               className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition"
                               aria-label="Instagram">
                                <Instagram className="w-4 h-4" />
                            </a>
                            <a href={CONTACT_INFO.facebookUrl} target="_blank" rel="noopener noreferrer"
                               className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition"
                               aria-label="Facebook">
                                <Facebook className="w-4 h-4" />
                            </a>
                            <a href={CONTACT_INFO.tiktokUrl} target="_blank" rel="noopener noreferrer"
                               className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition"
                               aria-label="TikTok">
                                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden="true">
                                    <path d="M21 8.25c-1.74.07-3.42-.5-4.72-1.6V15.1c0 3.55-2.89 6.4-6.44 6.4A6.41 6.41 0 0 1 3.4 15.1c0-3.42 2.69-6.22 6.12-6.38v3.51a2.92 2.92 0 0 0-2.55 2.87 2.92 2.92 0 0 0 2.87 2.91 2.92 2.92 0 0 0 2.94-2.91V2.5h3.48c.13 1.19.6 2.3 1.36 3.2A5.9 5.9 0 0 0 21 7.4v.85Z" />
                                </svg>
                            </a>
                            <a href={CONTACT_INFO.whatsappUrl} target="_blank" rel="noopener noreferrer"
                               className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition"
                               aria-label="WhatsApp">
                                <Send className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    {/* Col 2 – La Empresa + Horarios */}
                    <div>
                        <ColHeading>La Empresa</ColHeading>
                        <ul className="space-y-2 mb-6">
                            <li>
                                <Link to="/quienessomos" className="text-sm text-white hover:text-white transition">
                                    Quiénes Somos
                                </Link>
                            </li>
                        </ul>
                        <ColHeading>Horarios</ColHeading>
                        <div className="space-y-3">
                            {SCHEDULE.map(({ days, hours }) => (
                                <div key={days} className="flex items-start gap-3">
                                    <Clock className="w-4 h-4 text-white/100 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <div className="text-sm font-bold text-white">{days}</div>
                                        <div className="text-xs text-white">{hours}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Col 3 – Contacto */}
                    <div>
                        <ColHeading>Contacto</ColHeading>
                        <div className="space-y-3 mb-5">
                            <a
                                href={CONTACT_INFO.whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition w-fit"
                            >
                                <Send className="w-4 h-4" />
                                Escribinos por WhatsApp
                            </a>
                            <div className="flex items-center gap-3 text-sm">
                                <Phone className="w-4 h-4 text-white flex-shrink-0" />
                                <a href={`tel:+${CONTACT_INFO.phoneRaw}`} className="text-white hover:text-white transition">
                                    {CONTACT_INFO.phone}
                                </a>
                            </div>
                            <div className="flex items-start gap-3 text-sm">
                                <MapPin className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
                                <span className="text-white">{CONTACT_INFO.address}</span>
                            </div>
                        </div>

                        {/* Botón Ver mapa — solo en mobile */}
                        <a
                            href={MAPS_LINK}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="lg:hidden flex items-center gap-2 border border-white hover:border-white text-white hover:text-white px-4 py-2.5 rounded-xl text-sm font-bold transition w-fit"
                        >
                            <Navigation className="w-4 h-4" />
                            Ver ubicación en Google Maps
                        </a>
                    </div>

                    {/* Col 4 – Mapa (solo desktop) */}
                    <div className="hidden lg:block">
                        <ColHeading>Ubicación</ColHeading>
                        <div className="rounded-xl overflow-hidden border border-white/10 h-44">
                            <iframe
                                src={CONTACT_INFO.mapEmbedUrl}
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen=""
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Ubicación Granja El Sol"
                            />
                        </div>
                    </div>

                </div>

                {/* ── Bottom bar ── */}
                <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-xs text-white">
                        &copy; 2026 Granja El Sol. Todos los derechos reservados.
                    </p>
                    <div className="flex items-center gap-5">
                        <a
                            href="/admin"
                            className="text-xs text-white hover:text-white/50 transition"
                        >
                            Admin
                        </a>
                        <button
                            onClick={scrollToTop}
                            className="flex items-center gap-1.5 text-xs text-white hover:text-white/60 transition"
                            aria-label="Volver al inicio"
                        >
                            <ArrowUp className="w-3.5 h-3.5" />
                            Inicio
                        </button>
                    </div>
                </div>

            </div>
        </footer>
    );
}

export default Footer;