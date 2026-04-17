import { CheckCircle } from "lucide-react"; // Usamos Lucide para los íconos
import logo from "../img/logoo.webp"

function About() {
    return (
        <div className="bg-gradient-to-b from-gray-50 to-white px-4 md:px-16 py-16 relative overflow-hidden" id="about">
            <h2 className="text-center text-4xl md:text-5xl font-heading font-extrabold mb-4 text-text-dark">
                ¿Quiénes Somos?
            </h2>
            <p className="text-center text-lg text-text-dark/70 font-body max-w-2xl mx-auto mb-12">
                Conoce la historia y valores de Granja El Sol
            </p>

            <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:mt-16 justify-between items-center gap-8">
                
                {/* INYECTAMOS EL TAG <img> CON LOS ESTILOS MODERNOS */}
                <div className="w-full md:w-5/12 pr-0 md:pr-10 mt-0 md:mt-0 flex justify-center">
                    <img
                        src={logo}
                        alt="Logo Original Granja El Sol"
                        className="w-64 h-64 md:w-96 md:h-96 rounded-3xl object-cover"
                        loading="lazy"
                        decoding="async"
                    />
                </div>

                <div className="w-full md:w-7/12 mt-10 md:mt-0 text-text-dark">
                    
                    <div className="font-body text-lg md:text-xl rounded-2xl p-8 leading-relaxed bg-text-light shadow-lg border-l-4 border-primary hover:shadow-xl transition-shadow duration-300" id="quienes-somos">
                        <p className="mb-4">
                            En <span className="text-primary font-extrabold">Granja El Sol</span>, creemos que la calidad y el buen trato hacen la diferencia. Nos dedicamos a ofrecer cortes de carne de excelencia, seleccionados cuidadosamente para llevar a tu mesa sabor, frescura y confianza.
                        </p>
                        <p className="italic font-medium">
                            Nuestro compromiso es con vos y tu familia, brindándote atención cercana y productos que reflejan el cariño con el que trabajamos cada día. Somos una tradición de sabor.
                        </p>
                    </div>

                    <div className="mt-10 flex flex-col gap-5 text-lg md:text-xl font-heading font-semibold">
                        <div className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-300">
                            <CheckCircle className="text-primary w-7 h-7 flex-shrink-0" /> 
                            <span>Carne de calidad superior</span>
                        </div>
                        <div className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-300">
                            <CheckCircle className="text-primary w-7 h-7 flex-shrink-0" />
                            <span>Selección Premium de Pollo y Cerdo</span>
                        </div>
                        <div className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-300">
                            <CheckCircle className="text-primary w-7 h-7 flex-shrink-0" />
                            <span>Excelente Atención Personalizada</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default About;

