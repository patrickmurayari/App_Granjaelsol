import { MapPin, Phone, Mail, Instagram, Facebook, Copy, Check, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { CONTACT_INFO } from "../constants/contactInfo";

function Contactos() {
    const [copiedPhone, setCopiedPhone] = useState(false);
    const [copiedEmail, setCopiedEmail] = useState(false);

    const mapEmbedUrl = CONTACT_INFO.mapEmbedUrl;

    useEffect(() => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = mapEmbedUrl;
        document.head.appendChild(link);

        const preloadIframe = () => {
            const iframe = document.createElement('iframe');
            iframe.src = mapEmbedUrl;
            iframe.style.display = 'none';
            document.body.appendChild(iframe);
        };

        window.addEventListener('load', preloadIframe);
        return () => window.removeEventListener('load', preloadIframe);
    }, [mapEmbedUrl]);

    const copyToClipboard = (text, type) => {
        navigator.clipboard.writeText(text);
        if (type === 'phone') {
            setCopiedPhone(true);
            setTimeout(() => setCopiedPhone(false), 2000);
        } else {
            setCopiedEmail(true);
            setTimeout(() => setCopiedEmail(false), 2000);
        }
    };

    return (
        // Usamos bg-base o un color contrastante como bg-gray-100/50 si About ya es bg-base
        <div className='bg-base p-4 md:p-12' id="contactos">
            <div className='max-w-screen-xl mx-auto'>
                <h2 className='text-center text-4xl md:text-5xl font-heading font-extrabold text-text-dark mt-8 mb-12'>
                    Contáctanos
                </h2>

                <div className="flex flex-col md:flex-row gap-8">
                    
                    {/* COLUMNA IZQUIERDA: Mapa de Ubicación */}
                    <div className='w-full md:w-1/2'>
                        <h3 className="text-2xl font-heading font-bold mb-4 text-primary">Nuestra Ubicación</h3>
                        <div className="rounded-xl overflow-hidden shadow-2xl border-4 border-primary">
                            <iframe
                                src={mapEmbedUrl}
                                width="100%"
                                height="400"
                                style={{ border: 0 }}
                                allowFullScreen=""
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Ubicación de Granja el Sol"
                            ></iframe>
                        </div>
                    </div>

                    {/* COLUMNA DERECHA: Información de Contacto */}
                    <div className="w-full md:w-1/2 p-6 md:p-8 rounded-xl bg-text-light shadow-xl border-l-4 border-primary">
                        <h3 className="text-2xl font-heading font-bold mb-6 text-primary">Detalles de Contacto</h3>

                        <div className='text-text-dark text-lg md:text-xl space-y-6 font-body'>
                            
                            {/* Dirección */}
                            <div className='flex items-start gap-4 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition duration-300'>
                                <MapPin className="text-primary mt-1 w-6 h-6 flex-shrink-0" />
                                <p>
                                    Visítanos en: <br />
                                    <span className='font-extrabold text-text-dark'>{CONTACT_INFO.address}</span>
                                </p>
                            </div>

                            {/* Teléfono */}
                            <div className='flex items-start gap-4 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition duration-300 group'>
                                <Phone className="text-primary mt-1 w-6 h-6 flex-shrink-0" />
                                <div className="flex-1">
                                    <p className="mb-2">Llámanos:</p>
                                    <div className="flex gap-2 flex-wrap">
                                        <a href="tel:+541131666991" className='font-extrabold text-primary hover:text-secondary transition'>
                                            {CONTACT_INFO.phone}
                                        </a>
                                        <button
                                            onClick={() => copyToClipboard(CONTACT_INFO.phoneRaw, 'phone')}
                                            className="text-primary hover:text-secondary transition p-1 rounded hover:bg-white"
                                            title="Copiar número"
                                            aria-label="Copiar número de teléfono"
                                        >
                                            {copiedPhone ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Email */}
                            <div className='flex items-start gap-4 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition duration-300 group'>
                                <Mail className="text-primary mt-1 w-6 h-6 flex-shrink-0" />
                                <div className="flex-1">
                                    <p className="mb-2">Escríbenos:</p>
                                    <div className="flex gap-2 flex-wrap">
                                        <a href="mailto:granjaelsol1015@gmail.com" className='font-extrabold text-primary hover:text-secondary transition break-all'>
                                            {CONTACT_INFO.email}
                                        </a>
                                        <button
                                            onClick={() => copyToClipboard(CONTACT_INFO.email, 'email')}
                                            className="text-primary hover:text-secondary transition p-1 rounded hover:bg-white flex-shrink-0"
                                            title="Copiar email"
                                            aria-label="Copiar email"
                                        >
                                            {copiedEmail ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Horarios de Atención */}
                        <div className="mt-10 pt-6 border-t border-gray-200">
                            <div className="flex items-center gap-3 mb-6">
                                <Clock className="text-primary w-6 h-6" />
                                <h3 className="text-xl font-heading font-bold text-primary">Horarios de Atención</h3>
                            </div>
                            
                            <div className="space-y-4">
                                {/* Lunes a Viernes */}
                                <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-4 rounded-lg border-l-4 border-primary hover:shadow-md transition duration-300">
                                    <div className="flex items-start gap-3">
                                        <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                                            📅
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-text-dark mb-1">Lunes a Viernes</p>
                                            <div className="space-y-1 text-sm text-gray-700">
                                                <p className="flex items-center gap-2">
                                                    <span className="inline-block w-2 h-2 bg-primary rounded-full"></span>
                                                    08:30 - 13:30 hrs
                                                </p>
                                                <p className="flex items-center gap-2">
                                                    <span className="inline-block w-2 h-2 bg-primary rounded-full"></span>
                                                    17:30 - 20:30 hrs
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Domingos y Feriados */}
                                <div className="bg-gradient-to-r from-secondary/10 to-primary/10 p-4 rounded-lg border-l-4 border-secondary hover:shadow-md transition duration-300">
                                    <div className="flex items-start gap-3">
                                        <div className="bg-secondary text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                                            ☀️
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-text-dark mb-1">Domingos y Feriados</p>
                                            <p className="text-sm text-gray-700 flex items-center gap-2">
                                                <span className="inline-block w-2 h-2 bg-secondary rounded-full"></span>
                                                09:00 - 13:00 hrs
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Nota importante */}
                                <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-xs text-blue-700 flex items-start gap-2">
                                    <p>¡Visítanos en nuestros horarios de atención para disfrutar de los mejores productos!</p>
                                </div>
                            </div>
                        </div>

                        {/* Redes Sociales */}
                        <div className="mt-10 pt-6 border-t border-gray-200">
                            <h3 className="text-xl font-heading font-bold mb-4 text-secondary">Síguenos</h3>
                            <div className="flex space-x-6">
                                <a href={CONTACT_INFO.instagramUrl} target="_blank" rel="noopener noreferrer" 
                                   className="text-primary hover:text-secondary transition duration-300 transform hover:scale-110"
                                   aria-label="Instagram">
                                    <Instagram className="h-8 w-8" />
                                </a>
                                <a href={CONTACT_INFO.facebookUrl} target="_blank" rel="noopener noreferrer" 
                                   className="text-primary hover:text-secondary transition duration-300 transform hover:scale-110"
                                   aria-label="Facebook">
                                    <Facebook className="h-8 w-8" />
                                </a>
                                <a href={CONTACT_INFO.tiktokUrl} target="_blank" rel="noopener noreferrer"
                                   className="text-primary hover:text-secondary transition duration-300 transform hover:scale-110"
                                   aria-label="TikTok"
                                   title="TikTok">
                                    <svg
                                        viewBox="0 0 24 24"
                                        className="h-8 w-8"
                                        fill="currentColor"
                                        aria-hidden="true"
                                    >
                                        <path d="M21 8.25c-1.74.07-3.42-.5-4.72-1.6V15.1c0 3.55-2.89 6.4-6.44 6.4A6.41 6.41 0 0 1 3.4 15.1c0-3.42 2.69-6.22 6.12-6.38v3.51a2.92 2.92 0 0 0-2.55 2.87 2.92 2.92 0 0 0 2.87 2.91 2.92 2.92 0 0 0 2.94-2.91V2.5h3.48c.13 1.19.6 2.3 1.36 3.2A5.9 5.9 0 0 0 21 7.4v.85Z" />
                                    </svg>
                                </a>
                            </div> 
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Contactos;