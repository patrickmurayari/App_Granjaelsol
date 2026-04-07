import { ShoppingCart, Wine, Leaf } from 'lucide-react';

import vino1 from '../img/varios/vino1.jpg';
import vino2 from '../img/varios/vinos2.jpg';
import vino3 from '../img/varios/vinos3.jpg';

import snacks1 from '../img/varios/snacks1.jpg';
import snacks2 from '../img/varios/snacks2.jpg';
import snacks3 from '../img/varios/snacks3.jpg';

import salame1 from '../img/varios/salame1.jpg';
import salame2 from '../img/varios/salame2.jpg';
import salame3 from '../img/varios/salame3.png';

import apargatas1 from '../img/varios/apargatas1.jpg';
import apargatas2 from '../img/varios/apargatas2.jpg';
import apargatas3 from '../img/varios/apargatas3.jpg';

import bebidas1 from '../img/varios2/bebidas1.jpg';
import bebidas2 from '../img/varios2/bebidas2.jpg';
import bebidas3 from '../img/varios2/bebidas3.jpg';

import provoleta1 from '../img/varios2/provoleta1.png';
import provoleta2 from '../img/varios2/provoleta2.png';
import provoleta3 from '../img/varios2/provoleta3.png';

export const productosAdicionales = [
    {id: 1, nombre: "Vinos", descripcion: "Selección de vinos premium para acompañar tus comidas", icon: Wine, color: "from-red-600 to-red-800", imagenes: [vino1, vino2, vino3]},
    {id: 2,nombre: "Snacks",descripcion: "Variedad de snacks deliciosos y saludables",icon: ShoppingCart,color: "from-amber-600 to-amber-800",imagenes: [snacks1, snacks2, snacks3]},
    {id: 3,nombre: "Salames",descripcion: "Salames artesanales de excelente calidad",icon: Leaf,color: "from-orange-600 to-orange-800",imagenes: [salame1, salame2, salame3]},
    {id: 4,nombre: "Apargatas",descripcion: "Apargatas tradicionales y cómodas",icon: ShoppingCart,color: "from-yellow-600 to-yellow-800",imagenes: [apargatas1, apargatas2, apargatas3]},
    {id: 5,nombre: "Bebidas",descripcion: "Bebidas para acompañar tu compra",icon: ShoppingCart,color: "from-blue-600 to-blue-800",imagenes: [bebidas1, bebidas2, bebidas3]},
    {id: 6,nombre: "Provoletas",descripcion: "Provoletas ideales para la parrilla",icon: Leaf,color: "from-emerald-600 to-emerald-800",imagenes: [provoleta1, provoleta2, provoleta3]}
];

