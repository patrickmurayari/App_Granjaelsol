import { useEffect } from 'react';
import ReactGA from 'react-ga4';
import confetti from 'canvas-confetti';
import { Route, Routes } from 'react-router-dom';
import Navbar from './Components/Navbar';
import HeroSection from './Components/HeroSection'
import Productos from './Components/Productos'
import Footer from './Components/Footer'

import ProductosAdicionales from './Components/ProductosAdicionales'
import StoreOffers from './Components/StoreOffers'
import MetodosPago from './Components/MetodosPago'
import Admin from './pages/Admin';
import QuienesSomos from './pages/QuienesSomos';
import Login from './pages/Login';
import CartDrawer from './Components/CartDrawer';
import { AuthProvider } from './context/AuthContext';

ReactGA.initialize('G-GLJTCBRGXT');

const App = () => {
    useEffect(() => {
        ReactGA.send({ hitType: 'pageview', page: window.location.pathname });
    }, []);

    useEffect(() => {
        const timeout = setTimeout(() => {
            const duration = 3000;
            const end = Date.now() + duration;
            const colors = ['#74ACDF', '#FFFFFF', '#FFD700'];

            const frame = () => {
                confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0, y: 0.8 }, colors });
                confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1, y: 0.8 }, colors });
                if (Date.now() < end) requestAnimationFrame(frame);
            };
            frame();
        }, 500);
        return () => clearTimeout(timeout);
    }, []);

    return (
        <AuthProvider>
            <Routes>
                <Route
                    path="/"
                    element={
                        <div>
                            <Navbar />
                            <HeroSection />
                            <Productos />
                            <ProductosAdicionales />
                            <StoreOffers />
                            <MetodosPago />
                            <Footer />
                        </div>
                    }
                />
                <Route path="/quienessomos" element={<QuienesSomos />} />
                <Route path="/login" element={<Login />} />
                <Route path="/admin" element={<Admin />} />
            </Routes>
            <CartDrawer />
        </AuthProvider>
    );
}

export default App;

/*

<div data-aos="zoom-in-right" data-aos-duration="1500" className="mt-12 md:mt-44 flex justify-center text-3xl md:text-5xl">
        <h1>Nuestras Ofertas</h1>
    </div>
<Ofertas />

*/