import { ShoppingCart, Wine, Leaf } from 'lucide-react';

import asado from "../img/carnes/asado.jpg";
import americano from "../img/carnes/americano.jpg";
import matambre from "../img/carnes/Matambre.jpg";
import entraña from "../img/carnes/entraña.jpg";
import vacio from "../img/carnes/vacio.jpg";
import lomo from "../img/carnes/lomo.jpg";
import bifeangosto from "../img/carnes/bifeangosto.jpg";
import bifeancho from "../img/carnes/bifeancho.jpg";
import palomita from "../img/carnes/palomita.jpg";
import roastbeff from "../img/carnes/roastbeef.jpg";
import tapadeasado from "../img/carnes/tapadeasado.jpg";
import tapadenalga from "../img/carnes/tapadenalga.png";
import osobuco from "../img/carnes/osobuco.jpg";
import paleta from "../img/carnes/paleta.jpg";
import peceto from "../img/carnes/peceto.jpg";
import picaña from "../img/carnes/picaña.jpg";
import ojodebife from "../img/carnes/ojodebife.png";
import colitacuadril from "../img/carnes/colitacuadril.jpg";
import cuadrada from "../img/carnes/cuadrada.png";
import cuadril from "../img/carnes/cuadril.png";
import faldaparrillera from "../img/carnes/faldaparrillera.jpg";
import nalga from "../img/carnes/nalga.png";
import boladelomo from "../img/carnes/boladelomo.png";
import bifedechorizo from "../img/carnes/bifedechorizo.jpg";
import espinazo from "../img/carnes/espinazo.jpg";
import tortuguita from "../img/carnes/tortuguita.jpg";
import faldapuchero from "../img/carnes/faldapuchero.jpg";
import hamburguesas from "../img/carnes/hamburguesas.png";
import miladecarne from "../img/carnes/miladecarne.jpg";
import picadaespecial from "../img/carnes/picada.jpg";
import bondiola from "../img/cerdo/bondiola.jpg";
import carre from "../img/cerdo/carre.jpg";
import churrasquito from "../img/cerdo/churrasquito.jpg";
import matambrito from "../img/cerdo/matambrito.jpg";
import pechito from "../img/cerdo/pechito.png";
import mila from "../img/pollo/mila.png";
import patamuslo from "../img/pollo/patamuslo.jpg";
import pollo from "../img/pollo/pollo.png";
import suprema from "../img/pollo/suprema.jpg";

import pataMuslo from '../img/pollo/patamuslo.jpg';
import bifeAncho from '../img/carnes/bifeancho.jpg';
import falda from '../img/carnes/faldaparrillera.jpg';
import costillar from '../img/cerdo/bondiola.jpg';
import alitas from '../img/pollo/Alitas.jpg';

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

export const Ofertas = [
    {decripcion:"Pata y muslo", Kilos:"3Kg", Precio:"10500", descuento: "25%", original: "14000", imagen: pataMuslo},
    {decripcion:"Bife ancho", Kilos:"kg", Precio:"14500", descuento: "30%", original: "20700", imagen: bifeAncho},
    {decripcion:"Falda", Kilos:"2kg", Precio:"22000", descuento: "20%", original: "27500", imagen: falda},
    {decripcion:"Carre de cerdo", Kilos:"2kg", Precio:"15000", descuento: "28%", original: "20800", imagen: carre},
    {decripcion:"Costillar de cerdo", Kilos:"Kg", Precio:"6990", descuento: "35%", original: "10750", imagen: costillar},
    {decripcion:"Alitas", Kilos:"3Kg", Precio:"7000", descuento: "22%", original: "8970", imagen: alitas},
    {decripcion:"Asado de orilla", Kilos:"Kg", Precio:"13900", descuento: "32%", original: "20440", imagen: asado}
]

export const carne = [
    {id: 1, image: `${asado}`,name: "Asado", description: "$19350"}, //
    {id: 2, image: `${americano}`, name: "Americano", description: "$20900"}, //
    {id: 3, image: `${matambre}`, name: "Matambre", description: "$16500"}, //
    {id: 4, image: `${entraña}`, name: "Entraña", description: "$32500"},//
    {id: 5, image: `${vacio}`, name: "Vacio", description: "$23900"},//
    {id: 6, image: `${lomo}`, name: "Lomo", description: "$33900"},// 
    {id: 7, image: `${bifeangosto}`, name: "Bife angosto", description: "$20900"},
    {id: 8, image: `${bifeancho}`, name: "Bife ancho", description: "$18500"},//
    {id: 9, image: `${palomita}`, name: "Palomita", description: "$18900"},//
    {id: 10, image: `${roastbeff}`, name: "Roastbeff", description: "$17350"},//
    {id: 11, image: `${tapadeasado}`, name: "Tapa de asado", description: "$18900"}, //
    {id: 12, image: `${tapadenalga}`, name: "Tapa de nalga", description: "$20900"},
    {id: 13, image: `${osobuco}`, name: "Osobuco", description: "$10150"},//
    {id: 14, image: `${paleta}`, name: "Paleta", description: "$17350"}, //
    {id: 15, image: `${peceto}`, name: "Peceto", description: "$26400"}, //
    {id: 16, image: `${ojodebife}`, name: "Ojo de bife", description: "$30900"}, //
    {id: 17, image: `${picaña}`, name: "Picaña", description: "$30100"},//
    {id: 19, image: `${colitacuadril}`, name: "Colita de cuadril", description: "$28900"}, //
    {id: 20, image: `${cuadrada}`, name: "Cuadrada", description: "$20900"}, //
    {id: 21, image: `${cuadril}`, name: "Cuadril", description: "$22900"}, //
    {id: 22, image: `${faldaparrillera}`, name: "Falda parrillera", description: "$15900"}, //
    {id: 23, image: `${nalga}`, name: "Nalga", description: "$23500"}, //
    {id: 24, image: `${boladelomo}`, name: "Bola de lomo", description: "$20400"}, //
    {id: 25, image: `${bifedechorizo}`, name: "Bife de chorizo", description: "$29900"}, //
    {id: 26, image: `${espinazo}`, name: "Espinazo", description: "$6900"},
    {id: 27, image: `${tortuguita}`, name: "Tortuguita", description: "$18900"},//
    {id: 28, image: `${faldapuchero}`, name: "Falda puchero", description: "$15400"},//
    {id: 29, image: `${hamburguesas}`, name: "hamburguesas", description: "$15950"},
    {id: 30, image: `${miladecarne}`, name: "Milanesa de carne", description: "$21850"},
    {id: 31, image: `${picadaespecial}`, name: "Picada comun", description: "$14900"}];// 

export const cerdo = [
    {id: 32, image: `${bondiola}`, name: "Bondiola", description: "$13500"},
    {id: 33, image: `${carre}`, name: "Carre", description: "$10500"},
    {id: 34, image: `${churrasquito}`, name: "Churrasquito", description: "$13900"},//
    {id: 35, image: `${matambrito}`, name: "Matambrito", description: "$21600"},
    {id: 36, image: `${pechito}`, name: "Pechito", description: "$10500"}];//

export const pollos = [
    {id: 37, image: `${mila}`, name: "Milanesa de pollo", description: "$9850"},
    {id: 38, image: `${patamuslo}`, name: "Pata y muslo", description: "$5290"},
    {id: 39, image: `${pollo}`, name: "Pollo entero", description: "$5690"},
    {id: 40, image: `${suprema}`, name: "Suprema", description: "$10900"}];