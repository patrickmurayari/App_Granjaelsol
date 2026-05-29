import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Instagram, Facebook, Send, ShoppingCart, Tag } from 'lucide-react';
import logo from "../img/logoo.webp"
import { CONTACT_INFO } from '../constants/contactInfo';
import { scrollToSection } from '../utils/scrollUtils';
import { useCart } from '../context/CartContext.jsx';

function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrollProgress, setScrollProgress] = useState(0);
    const { count, openCart } = useCart();
    const navigate = useNavigate();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            setScrolled(scrollTop > 50);
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            setScrollProgress(progress);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleMenu = () => setMenuOpen((prev) => !prev);

    const isTransparent = location.pathname === '/' && !scrolled;
    const navTextClass = isTransparent ? 'text-white' : 'text-text-dark';

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
            <nav className={`${isTransparent ? 'bg-transparent' : 'bg-base shadow-md'} py-2 px-4 md:px-8 fixed top-0 left-0 w-full z-50 font-heading transition-all duration-300`}>
            <div className="flex items-center justify-between max-w-7xl mx-auto">
                <div className="flex items-center">
                    {/* Placeholder para el Logo (simulando el Link y la imagen) */}
                    <div 
                        onClick={() => scrollToSection("carrousel")} 
                        className="cursor-pointer flex items-center"
                    >
                        {/* Sustituimos la imagen por un placeholder visualmente agradable con bg-secondary */}
                        {/* Color del texto principal actualizado a text-text-dark */}
                        <div className="flex items-center gap-2">
                            <span className={`font-extrabold text-2xl md:text-4xl transition-colors duration-300 ${navTextClass}`}>Granja el Sol</span>
                        </div>
                    </div>
                </div>

                <div className="md:hidden flex items-center gap-2">
                    <button
                        onClick={openCart}
                        className={`relative focus:outline-none w-11 h-11 flex items-center justify-center transition-colors duration-300 ${navTextClass}`}
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
                        className={`focus:outline-none w-11 h-11 flex items-center justify-center transition-colors duration-300 ${navTextClass}`}
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
                
                {/* Íconos de redes sociales */}
                <div className="hidden md:block">
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={openCart}
                            className={`relative hover:text-primary transition-colors duration-300 ${navTextClass}`}
                            aria-label="Abrir carrito"
                        >
                            <ShoppingCart className="h-8 w-8" />
                            {count > 0 && (
                                <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-extrabold rounded-full w-5 h-5 flex items-center justify-center">
                                    {count}
                                </span>
                            )}
                        </button>
                        {/* Sustitución de imágenes por íconos Lucide, usando hover:text-primary */}
                        <a href={CONTACT_INFO.whatsappUrl} target="_blank" rel="noopener noreferrer" 
                        className={`hover:text-primary transition-colors duration-300 ${navTextClass}`}
                        aria-label="WhatsApp">
                            <Send className="h-8 w-8" /> 
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
                </div>

                {/* Ítems de navegación */}
                <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
                    {[
                        { key: 'carrousel', label: 'Inicio',        action: () => scrollToSection('carrousel') },
                        { key: 'quienessomos', label: 'Quiénes Somos', action: () => navigate('/quienessomos') },
                        { key: 'productos',  label: 'Productos',     action: () => scrollToSection('productos') },
                        { key: 'ofertas',    label: 'Ofertas',       action: () => scrollToSection('ofertas'), icon: Tag, highlight: true },
                    ].map(({ key, label, action, icon: Icon, highlight }) => (
                        <div
                            key={key}
                            onClick={() => { action(); setMenuOpen(false); }}
                            className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-base transition-all duration-200 cursor-pointer ${
                                highlight
                                    ? 'text-orange-600 bg-orange-50 hover:bg-orange-100'
                                    : 'text-text-dark hover:bg-primary/10 hover:text-primary'
                            }`}
                        >
                            {Icon && <Icon className="w-4 h-4" />}
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




