import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Menu, X, Instagram, Facebook, Send, ShoppingCart } from 'lucide-react';
import logo from "../img/logoo.png"
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

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

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

                <div className="md:hidden flex items-center gap-2"> {/* Mostrar solo en dispositivos móviles */}
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

                    {/* Ícono de menú */}
                    <button
                        className="text-text-dark focus:outline-none w-11 h-11 flex items-center justify-center"
                        onClick={toggleMenu}
                        aria-label="Abrir menú"
                        type="button"
                    >
                        {menuOpen ? (
                            <X className="h-6 w-6" />
                        ) : (
                            <Menu className="h-6 w-6" />
                        )}
                    </button>
                </div>

                {/* Menú de navegación */}
                <ul className={`md:flex ${menuOpen ? 'flex flex-col absolute top-full left-0 w-full bg-base shadow-lg p-3 border-t border-gray-200' : 'hidden'} md:space-x-6 md:mt-0 items-center justify-center`}>
                    <li>
                        <NavLink to="carrousel">Inicio</NavLink>
                    </li>
                    <li>
                        <NavLink to="about">Quienes Somos</NavLink>
                    </li>
                    <li>
                        <NavLink to="productos">Productos</NavLink>
                    </li>
                    <li>
                        <NavLink to="contactos">Contáctanos</NavLink>
                    </li>
                    
                    {/* Redes sociales en menú móvil */}
                    {menuOpen && (
                        <li className="md:hidden border-t border-gray-200 pt-3 mt-3 w-full">
                            <div className="flex items-center justify-center space-x-6">
                                <a href={CONTACT_INFO.instagramUrlAlt} target="_blank" rel="noopener noreferrer" 
                                   className="text-text-dark hover:text-primary transition duration-300 transform hover:scale-125">
                                    <Instagram className="h-5 w-5" />
                                </a>
                                <a href={CONTACT_INFO.facebookUrl} target="_blank" rel="noopener noreferrer" 
                                   className="text-text-dark hover:text-primary transition duration-300 transform hover:scale-125">
                                    <Facebook className="h-5 w-5" />
                                </a>
                                <a href={CONTACT_INFO.whatsappUrl} target="_blank" rel="noopener noreferrer" 
                                   className="text-text-dark hover:text-primary transition duration-300 transform hover:scale-125">
                                    <Send className="h-5 w-5" /> 
                                </a>
                            </div>
                        </li>
                    )}
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
                        className="text-text-dark hover:text-primary transition duration-300">
                            <Instagram className="h-5 w-5" />
                        </a>
                        <a href={CONTACT_INFO.facebookUrl} target="_blank" rel="noopener noreferrer" 
                        className="text-text-dark hover:text-primary transition duration-300">
                            <Facebook className="h-5 w-5" />
                        </a>
                        <a href={CONTACT_INFO.whatsappUrl} target="_blank" rel="noopener noreferrer" 
                        className="text-text-dark hover:text-primary transition duration-300">
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
        </>
    );
}

export default Navbar;




