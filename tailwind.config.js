/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Colores de la paleta sugerida
        'primary': '#8B0000',     // Borgoña Rico (Acento Principal)
        'secondary': '#8B2020',   // Marrón Cobre oscuro (Tierra/Rústico) - WCAG AA compliant
        'base': '#FAF9F6',        // Blanco Roto/Crema (Fondo de Contenido)
        'text-dark': '#333333',   // Gris Oscuro Carbón (Texto General)
        'accent-positive': '#90EE90', // Verde Menta Suave (Ofertas/Fresco)
        'text-light': '#FFFFFF',  // Blanco puro (Para textos sobre fondos oscuros)
      },
      fontFamily: {
        // Aquí puedes definir tus tipografías
        'body': ['Inter', 'sans-serif'], // Usaremos Inter/Poppins para el cuerpo
        'heading': ['Montserrat', 'sans-serif'], // Usaremos Montserrat/Oswald para los títulos
      },
    },
  },
  plugins: [],
}

