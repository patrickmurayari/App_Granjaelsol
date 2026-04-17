import { Star } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import RenderStars from './RenderStars';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const testimonios = [
    {id: 1, nombre: "Martín Colombres", rol: "Cliente verificado", foto: "https://api.dicebear.com/7.x/avataaars/svg?seed=santiago", calificacion: 5, tiempo: "Hace un año", comentario: "Muy buena calidad y precios. Excelente atención de Armando, su dueño.", opiniones: 4},
    {id: 2,nombre: "Andrés Molinario",rol: "Guía Local",foto: "https://api.dicebear.com/7.x/avataaars/svg?seed=sol",calificacion: 4,tiempo: "Hace 5 años",comentario: "Muy buena calidad de los productos y el dueño que atiende es muy amable.",opiniones: 9},
    {id: 3,nombre: "Pablo Marafuschi",rol: "Cliente verificado",foto: "https://api.dicebear.com/7.x/avataaars/svg?seed=maria",calificacion: 5,tiempo: "Hace 2 meses",comentario: "Excelente calidad, atencion y precios.",opiniones: 3},
    {id: 4,nombre: "Elizabet Arzamendia",rol: "Cliente verificado",foto: "https://api.dicebear.com/7.x/avataaars/svg?seed=mariano",calificacion: 5,tiempo: "Hace 3 años",comentario: "Calidad, variedad e higiene. Muy recomendable.",opiniones: 5},
    {id: 5,nombre: "Guillermo Alonso",rol: "Cliente verificado",foto: "https://api.dicebear.com/7.x/avataaars/svg?seed=maria",calificacion: 5,tiempo: "Hace 1 mes",comentario: "Excelente! Atencion y mercaderia.",opiniones: 2}];

function Testimonios() {
    return (
        <div className="w-full px-4 lg:px-10 py-20 bg-gradient-to-b from-base to-gray-50" id="testimonios">
            {/* Elementos decorativos */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-secondary/5 rounded-full blur-3xl"></div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Encabezado */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center justify-center gap-3 mb-6 px-6 py-3 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full border border-primary/30">
                        <Star className="w-5 h-5 text-primary fill-primary" />
                        <span className="text-sm md:text-base font-heading font-bold text-primary uppercase tracking-widest">
                            Lo que dicen nuestros clientes
                        </span>
                        <Star className="w-5 h-5 text-primary fill-primary" />
                    </div>

                    <h2 className="text-4xl md:text-5xl font-heading font-extrabold text-text-dark mb-4">
                        Testimonios de Clientes
                    </h2>

                    <p className="text-lg text-text-dark/70 font-body max-w-3xl mx-auto">
                        Descubre lo que nuestros clientes satisfechos opinan sobre la calidad de nuestros productos y servicio
                    </p>
                </div>

                {/* Carrusel de testimonios */}
                <div className="relative">
                    <Swiper
                        modules={[Navigation, Pagination, Autoplay]}
                        spaceBetween={24}
                        slidesPerView={1}
                        breakpoints={{
                            640: { slidesPerView: 1 },
                            768: { slidesPerView: 2 },
                            1024: { slidesPerView: 3 }
                        }}
                        navigation={{
                            nextEl: '.swiper-button-next-testimonios',
                            prevEl: '.swiper-button-prev-testimonios',
                        }}
                        pagination={{ clickable: true, dynamicBullets: true }}
                        autoplay={{ delay: 5000, disableOnInteraction: false }}
                        className="pb-16"
                    >
                        {testimonios.map((testimonio) => (
                            <SwiperSlide key={testimonio.id}>
                                <div className="h-full bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden group">
                                    {/* Barra superior decorativa */}
                                    <div className="h-1 bg-gradient-to-r from-primary to-secondary"></div>

                                    <div className="p-8 flex flex-col h-full">
                                        {/* Calificación */}
                                        <div className="mb-4">
                                            <RenderStars calificacion={testimonio.calificacion} />
                                        </div>

                                        {/* Comentario */}
                                        <p className="text-text-dark font-body text-base leading-relaxed mb-6 flex-grow italic">
                                            &ldquo;{testimonio.comentario}&rdquo;
                                        </p>

                                        {/* Separador */}
                                        <div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent mb-6"></div>

                                        {/* Info del cliente */}
                                        <div className="flex items-center gap-4">
                                            <img
                                                src={testimonio.foto}
                                                alt={testimonio.nombre}
                                                className="w-14 h-14 rounded-full border-2 border-primary/30 object-cover"
                                                loading="lazy"
                                                decoding="async"
                                            />
                                            <div className="flex-grow">
                                                <h3 className="font-heading font-bold text-text-dark text-sm">
                                                    {testimonio.nombre}
                                                </h3>
                                                <p className="text-xs text-text-dark/60 font-body">
                                                    {testimonio.rol}
                                                </p>
                                                <p className="text-xs text-text-dark/50 font-body">
                                                    {testimonio.tiempo}
                                                </p>
                                            </div>
                                            {testimonio.opiniones && (
                                                <div className="text-right">
                                                    <p className="text-xs font-heading font-bold text-primary">
                                                        {testimonio.opiniones}
                                                    </p>
                                                    <p className="text-xs text-text-dark/60">opiniones</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>

                    {/* Botones de navegación */}
                    <button className="swiper-button-prev-testimonios absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-8 z-20 w-10 h-10 md:w-12 md:h-12 bg-primary hover:bg-primary/90 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-300 group" aria-label="Testimonio anterior">
                        <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button className="swiper-button-next-testimonios absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-8 z-20 w-10 h-10 md:w-12 md:h-12 bg-primary hover:bg-primary/90 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-300 group" aria-label="Testimonio siguiente">
                        <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>

                {/* Estadísticas */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
                    <div className="text-center p-6 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <p className="text-3xl md:text-4xl font-heading font-bold text-primary mb-2">4.8</p>
                        <p className="text-sm text-text-dark/70 font-body">Calificación Promedio</p>
                    </div>
                    <div className="text-center p-6 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <p className="text-3xl md:text-4xl font-heading font-bold text-primary mb-2">500+</p>
                        <p className="text-sm text-text-dark/70 font-body">Clientes Satisfechos</p>
                    </div>
                    <div className="text-center p-6 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <p className="text-3xl md:text-4xl font-heading font-bold text-primary mb-2">10+</p>
                        <p className="text-sm text-text-dark/70 font-body">Años de Trayectoria</p>
                    </div>
                    <div className="text-center p-6 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <p className="text-3xl md:text-4xl font-heading font-bold text-primary mb-2">100%</p>
                        <p className="text-sm text-text-dark/70 font-body">Recomendado</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Testimonios;
