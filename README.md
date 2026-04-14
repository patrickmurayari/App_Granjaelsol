# 🥩 Granja El Sol — Frontend

> Progressive Web App (PWA) para la gestión digital de una carnicería y almacén. Diseñada para profesionalizar la operación diaria con herramientas intuitivas y accesibles desde cualquier dispositivo.

---

## 📋 Descripción

**Granja El Sol** es una aplicación web progresiva que transforma la experiencia de compra y gestión de una carnicería tradicional. El frontend ofrece una interfaz mobile-first que permite a los clientes navegar el catálogo, armar pedidos y contactar al negocio, mientras que el panel de administración brinda control total sobre inventario, pedidos y cierres de caja.

El proyecto resuelve un problema real: la falta de digitalización en comercios de barrio, donde el conteo manual de efectivo y la gestión en papel generan errores y pérdida de información.

---

## 🛠️ Tecnologías

| Tecnología | Uso |
|---|---|
| **React 18** | Biblioteca principal de UI con hooks y contextos |
| **Vite** | Bundler ultrarrápido con HMR |
| **TailwindCSS** | Sistema de diseño utility-first, responsive |
| **React Query** | Gestión de estado servidor con cache y revalidación |
| **React Router v6** | Navegación SPA con rutas protegidas |
| **Firebase Auth** | Autenticación segura del panel admin |
| **Axios** | Cliente HTTP con interceptor de baseURL |
| **Lucide React** | Iconografía consistente y ligera |
| **AOS** | Animaciones de scroll para la landing |
| **Swiper** | Carruseles táctiles para productos y testimonios |
| **PWA (Manifest + Service Worker)** | Instalación y soporte offline |

---

## ⭐ Características Principales

### 🛒 Experiencia del Cliente
- **Catálogo en tiempo real** con filtrado por categoría (Vacunos, Cerdo, Pollos, Achuras) y búsqueda por nombre
- **Tarjetas de producto** con selector de unidad (kg/unidades), ajuste de cantidad y precio dinámico
- **Carrito lateral (CartDrawer)** con resumen, subtotales y envío directo a WhatsApp
- **Indicadores de stock**: productos sin stock se muestran en escala de grises con badge "SIN STOCK" y botón deshabilitado

### 📱 Progressive Web App
- **Instalable en iOS y Android** con ícono de la carnicería en la pantalla de inicio
- **Meta tags de Apple** (`apple-mobile-web-app-capable`, `apple-touch-icon`) para experiencia nativa en iPhone
- **Manifest.json** con `display: standalone` y `theme_color` de marca
- **Funciona offline** gracias al Service Worker con estrategia de cache

### 🔐 Panel de Administración (`/admin`)
- **Autenticación con Firebase** — ruta protegida que redirige a `/login`
- **Gestión de Productos**: CRUD completo, toggle de disponibilidad (stock on/off), filtro por categoría y buscador en tiempo real
- **Gestión de Pedidos**: lista con estados (pendiente → preparando → entregado), actualización con un click
- **Cierre de Caja Inteligente**: formulario que calcula automáticamente la diferencia de caja comparando efectivo teórico vs. real, con validación de gastos
- **Historial de Cierres**: tabla de los últimos 7 cierres con desglose de ventas (balanza, posnet, transferencias) y diferencia

### 🎨 Diseño y UX
- **Mobile-first**: toda la UI está optimizada para pantallas pequeñas con breakpoints progresivos
- **Accesibilidad**: labels semánticos, `aria-labels`, contraste alto en inputs numéricos
- **Animaciones sutiles**: transiciones en botones, tarjetas y modales para feedback visual inmediato

---

## 📁 Estructura del Proyecto

```
frontend/
├── public/
│   ├── manifest.json          # Configuración PWA
│   ├── logo-192.jpg           # Ícono PWA 192x192
│   └── logo-512.jpg           # Ícono PWA 512x512
├── src/
│   ├── api/
│   │   └── api.js             # Instancia Axios con baseURL dinámica
│   ├── Components/
│   │   ├── CardProducts.jsx   # Tarjeta de producto con lógica de stock
│   │   ├── CartDrawer.jsx     # Carrito lateral deslizable
│   │   ├── Productos.jsx      # Catálogo con filtros y búsqueda
│   │   ├── Navbar.jsx         # Navegación responsive
│   │   ├── Footer.jsx         # Pie de página con contacto
│   │   └── ...                # About, Carrousel, Testimonios, etc.
│   ├── context/
│   │   ├── AuthContext.jsx    # Provider de Firebase Auth
│   │   └── CartContext.jsx    # Estado global del carrito + reducer
│   ├── hooks/
│   │   └── useProductCard.js  # Lógica de favoritos y expansión
│   ├── pages/
│   │   ├── Admin.jsx          # Panel completo de administración
│   │   └── Login.jsx          # Pantalla de login con Firebase
│   ├── constants/
│   ├── utils/
│   └── main.jsx               # Entry point
├── index.html                 # HTML con meta tags PWA y iOS
├── vercel.json                # Rewrites para SPA + proxy /api
└── tailwind.config.js         # Tema personalizado de marca
```

---

## 🚀 Instalación

```bash
# Clonar el repositorio
git clone https://github.com/patrickmurayari/App_Granjaelsol.git
cd App_Granjaelsol/frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores:
# VITE_API_URL=http://localhost:3001/api
# VITE_WHATSAPP_NUMBER=5491131666991
# VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
# VITE_SUPABASE_ANON_KEY=tu-anon-key

# Iniciar servidor de desarrollo
npm run dev
```

La app estará disponible en `http://localhost:5173`.

---

## 🌐 Vista Previa

| Vista | Descripción |
|---|---|
| **Landing** | Página principal con carrusel, catálogo, testimonios y contacto |
| **Catálogo** | Productos filtrados por categoría con búsqueda en tiempo real |
| **Carrito** | Drawer lateral con resumen y envío a WhatsApp |
| **Admin** | Panel completo con productos, pedidos y cierre de caja |
| **PWA en iPhone** | Ícono en pantalla de inicio, experiencia standalone |

**Producción**: [https://granjaelsol.com.ar](https://granjaelsol.com.ar)

---

## 🏗️ Decisiones Técnicas

- **React Query sobre useEffect+useState**: evita race conditions, provee cache automático y revalidación en foco
- **CartContext con useReducer**: el carrito tiene lógica compleja (agregar, actualizar, eliminar, calcular subtotales) que se beneficia de un reducer puro
- **PWA manual (sin vite-plugin-pwa)**: se optó por un manifest y meta tags estáticos para evitar conflictos de compatibilidad con Node.js en el entorno de build
- **Fallback de API dinámico**: `api.js` usa `VITE_API_URL` con fallback a la URL de producción, asegurando que la app funcione tanto en local como en preview deployments

---

*Desarrollado con 💪 para profesionalizar el comercio de barrio.*
