import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Navbar from '../Components/Navbar';
import About from '../Components/About';
import Footer from '../Components/Footer';

const QuienesSomos = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div>
            <Navbar />
            <div className="pt-14 md:pt-16">
                <div className="max-w-7xl mx-auto px-4 md:px-16 pt-8">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-sm font-bold text-text-dark/60 hover:text-primary transition mb-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Volver al inicio
                    </Link>
                </div>
                <About />
            </div>
            <Footer />
        </div>
    );
};

export default QuienesSomos;
