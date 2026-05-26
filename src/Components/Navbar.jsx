import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { X, Instagram, Facebook, Send, ShoppingCart } from 'lucide-react';
import logo from "../img/logoo.webp"
import { CONTACT_INFO } from '../constants/contactInfo';
import { scrollToSection } from '../utils/scrollUtils';
import { useCart } from '../context/CartContext.jsx';

function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrollProgress, setScrollProgress] = useState(0);
    const { count, openCart } = useCart();

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrolled = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            setScrollProgress(scrolled);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleMenu = () => setMenuOpen((prev) => !prev);

    useEffect(() => {
        if (menuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [menuOpen]);

    // Componente de enlace de navegación adaptado para el scroll simulado
    const NavLink = ({ to, children }) => (
        <div 
            onClick={() => {
                scrollToSection(to);
                setMenuOpen(false); // Cierra el menú en móvil después de hacer clic
            }} 
            // Clases de estilo del enlace
            className="text-text-dark text-base md:text-lg hover:text-primary transition duration-300 cursor-pointer block py-1.5 md:py-0"
        >
            {children}
        </div>
    );

    NavLink.propTypes = {
        to: PropTypes.string.isRequired,
        children: PropTypes.node.isRequired,
    };

    return (
        // Aplicamos bg-base y font-heading con sombra mejorada
        <>
            <nav className={`bg-base py-2 px-4 md:px-8 fixed top-0 left-0 w-full z-50 font-heading shadow-md transition-shadow duration-300 ${menuOpen ? 'shadow-lg' : 'md:shadow-md'}`}>
            <div className="flex items-center justify-between max-w-7xl mx-auto">
                <div className="flex items-center">
                    {/* Placeholder para el Logo (simulando el Link y la imagen) */}
                    <div 
                        onClick={() => scrollToSection("carrousel")} 
                        className="cursor-pointer flex items-center"
                    >
                        {/* Sustituimos la imagen por un placeholder visualmente agradable con bg-secondary */}
                        <div className="h-10 w-10 md:h-12 md:w-12 mr-2 rounded-lg flex items-center justify-center text-text-light text-2xl font-black object-cover">
                            <img src={logo} alt="Logo" className="h-10 w-10 md:h-12 md:w-12 rounded-sm" />
                        </div>
                        {/* Color del texto principal actualizado a text-text-dark */}
                        <div className="flex items-center gap-2">
                            <span className="text-text-dark font-extrabold text-base md:text-lg">Granja el Sol</span>
                        </div>
                    </div>
                </div>

                <div className="md:hidden flex items-center gap-2">
                    <button
                        onClick={openCart}
                        className="relative text-text-dark focus:outline-none w-11 h-11 flex items-center justify-center"
                        aria-label="Abrir carrito"
                        type="button"
                    >
                        <ShoppingCart className="h-6 w-6" />
                        {count > 0 && (
                            <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-extrabold rounded-full w-5 h-5 flex items-center justify-center">
                                {count}
                            </span>
                        )}
                    </button>

                    {/* Ícono hamburguesa animado → X */}
                    <button
                        className="text-text-dark focus:outline-none w-11 h-11 flex items-center justify-center"
                        onClick={toggleMenu}
                        aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
                        type="button"
                    >
                        <div className="relative w-6 h-5 flex flex-col justify-between">
                            <span className={`block w-full h-0.5 bg-current origin-center transition-all duration-300 ease-in-out ${menuOpen ? 'rotate-45 translate-y-[9px]' : ''}`} />
                            <span className={`block w-full h-0.5 bg-current transition-all duration-300 ease-in-out ${menuOpen ? 'opacity-0 scale-x-0' : ''}`} />
                            <span className={`block w-full h-0.5 bg-current origin-center transition-all duration-300 ease-in-out ${menuOpen ? '-rotate-45 -translate-y-[9px]' : ''}`} />
                        </div>
                    </button>
                </div>

                {/* Menú desktop (horizontal) */}
                <ul className="hidden md:flex md:space-x-6 md:mt-0 items-center justify-center">
                    <li><NavLink to="carrousel">Inicio</NavLink></li>
                    <li><NavLink to="about">Quienes Somos</NavLink></li>
                    <li><NavLink to="productos">Productos</NavLink></li>
                    <li><NavLink to="contactos">Contáctanos</NavLink></li>
                </ul>
                
                {/* Íconos de redes sociales */}
                <div className="hidden md:block">
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={openCart}
                            className="relative text-text-dark hover:text-primary transition duration-300"
                            aria-label="Abrir carrito"
                        >
                            <ShoppingCart className="h-5 w-5" />
                            {count > 0 && (
                                <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-extrabold rounded-full w-5 h-5 flex items-center justify-center">
                                    {count}
                                </span>
                            )}
                        </button>
                        {/* Sustitución de imágenes por íconos Lucide, usando hover:text-primary */}
                        <a href={CONTACT_INFO.instagramUrl} target="_blank" rel="noopener noreferrer" 
                        className="text-text-dark hover:text-primary transition duration-300"
                        aria-label="Instagram">
                            <Instagram className="h-5 w-5" />
                        </a>
                        <a href={CONTACT_INFO.facebookUrl} target="_blank" rel="noopener noreferrer" 
                        className="text-text-dark hover:text-primary transition duration-300"
                        aria-label="Facebook">
                            <Facebook className="h-5 w-5" />
                        </a>
                        <a href={CONTACT_INFO.whatsappUrl} target="_blank" rel="noopener noreferrer" 
                        className="text-text-dark hover:text-primary transition duration-300"
                        aria-label="WhatsApp">
                            <Send className="h-5 w-5" /> 
                        </a>
                    </div>
                </div>
            </div>
            </nav>
            
            {/* Indicador de progreso de scroll */}
            <div 
                className="fixed top-0 left-0 h-1 bg-gradient-to-r from-primary to-secondary z-50 transition-all duration-300"
                style={{ width: `${scrollProgress}%` }}
            ></div>

            {/* ── Mobile Drawer ── */}
            {/* Backdrop con fade */}
            <div
                className={`fixed inset-0 z-40 md:hidden transition-opacity duration-300 ease-in-out ${menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setMenuOpen(false)}
                aria-hidden="true"
            >
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            </div>

            {/* Panel deslizante */}
            <div
                className={`fixed top-0 left-0 h-full w-72 max-w-[80vw] bg-base z-50 md:hidden shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}
                aria-label="Menú de navegación"
            >
                {/* Header del drawer */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                        <img src={logo} alt="Logo" className="h-9 w-9 rounded-sm" />
                        <span className="text-text-dark font-extrabold text-base">Granja el Sol</span>
                    </div>
                    <button
                        onClick={() => setMenuOpen(false)}
                        className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition text-text-dark"
                        aria-label="Cerrar menú"
                        type="button"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Ítems de navegación */}
                <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
                    {[
                        { to: 'carrousel', label: 'Inicio' },
                        { to: 'about', label: 'Quiénes Somos' },
                        { to: 'productos', label: 'Productos' },
                        { to: 'contactos', label: 'Contáctanos' },
                    ].map(({ to, label }) => (
                        <div
                            key={to}
                            onClick={() => { scrollToSection(to); setMenuOpen(false); }}
                            className="flex items-center px-4 py-3 rounded-xl text-text-dark font-semibold text-base hover:bg-primary/10 hover:text-primary transition-all duration-200 cursor-pointer"
                        >
                            {label}
                        </div>
                    ))}
                </nav>

                {/* Redes sociales */}
                <div className="px-5 py-5 border-t border-gray-200">
                    <p className="text-xs text-text-dark/50 font-semibold uppercase tracking-wider mb-3">Seguinos</p>
                    <div className="flex items-center gap-4">
                        <a href={CONTACT_INFO.instagramUrlAlt} target="_blank" rel="noopener noreferrer"
                            className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-text-dark hover:bg-primary hover:text-white transition-all duration-200"
                            aria-label="Instagram">
                            <Instagram className="h-5 w-5" />
                        </a>
                        <a href={CONTACT_INFO.facebookUrl} target="_blank" rel="noopener noreferrer"
                            className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-text-dark hover:bg-primary hover:text-white transition-all duration-200"
                            aria-label="Facebook">
                            <Facebook className="h-5 w-5" />
                        </a>
                        <a href={CONTACT_INFO.whatsappUrl} target="_blank" rel="noopener noreferrer"
                            className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-text-dark hover:bg-primary hover:text-white transition-all duration-200"
                            aria-label="WhatsApp">
                            <Send className="h-5 w-5" />
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Navbar;




