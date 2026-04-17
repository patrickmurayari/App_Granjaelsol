import { MapPin, Phone, Mail, Instagram, Facebook, Send, ArrowUp } from 'lucide-react';
import { CONTACT_INFO } from '../constants/contactInfo';

function Footer() {
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <footer className="bg-secondary text-text-light font-body relative overflow-hidden">
            {/* Contenido Principal del Footer */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    
                    {/* Columna 1: Sobre Nosotros */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <h3 className="text-xl font-heading font-bold text-text-light">Granja El Sol</h3>
                        </div>
                        <p className="text-text-light/80 text-sm leading-relaxed">
                            Tradición de sabor desde 2016. Ofrecemos cortes de carne premium con calidad garantizada y atención personalizada.
                        </p>
                    </div>

                    {/* Columna 2: Contacto Rápido */}
                    <div>
                        <h3 className="text-xl font-heading font-bold mb-4 text-text-light">Contacto</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 flex-shrink-0" />
                                <span className="text-text-light/80">Isla Jorge 299, Buenos Aires</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 flex-shrink-0" />
                                <a href={`tel:+${CONTACT_INFO.phoneRaw}`} className="text-text-light/80 hover:text-text-light transition">
                                    {CONTACT_INFO.phone}
                                </a>
                            </div>
                            <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 flex-shrink-0" />
                                <a href={`mailto:${CONTACT_INFO.email}`} className="text-text-light/80 hover:text-text-light transition">
                                    {CONTACT_INFO.email}
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Columna 3: Redes Sociales */}
                    <div>
                        <h3 className="text-xl font-heading font-bold mb-4 text-text-light">Síguenos</h3>
                        <div className="flex gap-4">
                            <a href={CONTACT_INFO.instagramUrlAlt} target="_blank" rel="noopener noreferrer" 
                               className="text-text-light/80 hover:text-text-light transition transform hover:scale-110"
                               aria-label="Instagram">
                                <Instagram className="w-6 h-6" />
                            </a>
                            <a href={CONTACT_INFO.facebookUrl} target="_blank" rel="noopener noreferrer" 
                               className="text-text-light/80 hover:text-text-light transition transform hover:scale-110"
                               aria-label="Facebook">
                                <Facebook className="w-6 h-6" />
                            </a>
                            <a href={CONTACT_INFO.tiktokUrl} target="_blank" rel="noopener noreferrer" 
                               className="text-text-light/80 hover:text-text-light transition transform hover:scale-110"
                               aria-label="TikTok"
                               title="TikTok">
                                <svg
                                    viewBox="0 0 24 24"
                                    className="w-6 h-6"
                                    fill="currentColor"
                                    aria-hidden="true"
                                >
                                    <path d="M21 8.25c-1.74.07-3.42-.5-4.72-1.6V15.1c0 3.55-2.89 6.4-6.44 6.4A6.41 6.41 0 0 1 3.4 15.1c0-3.42 2.69-6.22 6.12-6.38v3.51a2.92 2.92 0 0 0-2.55 2.87 2.92 2.92 0 0 0 2.87 2.91 2.92 2.92 0 0 0 2.94-2.91V2.5h3.48c.13 1.19.6 2.3 1.36 3.2A5.9 5.9 0 0 0 21 7.4v.85Z" />
                                </svg>
                            </a>
                            <a href={CONTACT_INFO.whatsappUrl} target="_blank" rel="noopener noreferrer" 
                               className="text-text-light/80 hover:text-text-light transition transform hover:scale-110"
                               aria-label="WhatsApp">
                                <Send className="w-6 h-6" />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Línea divisoria */}
                <div className="border-t border-text-light/20 pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center text-sm text-text-light/70">
                        <p>&copy; 2024 Granja El Sol. Todos los derechos reservados.</p>
                        <p className="mt-4 md:mt-0">Diseño web &copy; Pauin Tech</p>
                    </div>
                    
                    {/* Botón Volver al Inicio */}
                    <div className="flex justify-center mt-6">
                        <button
                            onClick={scrollToTop}
                            className="flex items-center gap-2 bg-text-light/10 hover:bg-text-light/20 text-text-light px-4 py-2 rounded-full transition duration-300 transform hover:scale-110"
                            title="Volver al inicio"
                            aria-label="Volver al inicio"
                        >
                            <ArrowUp className="w-4 h-4" />
                            <span className="text-xs">Volver al inicio</span>
                        </button>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer