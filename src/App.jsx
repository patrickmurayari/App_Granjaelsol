import { useEffect } from 'react';
import ReactGA from 'react-ga4';
import { Route, Routes } from 'react-router-dom';
import Navbar from './Components/Navbar';
import Carrousel from './Components/Carrousel'
import About from './Components/About'
import Productos from './Components/Productos'
import Footer from './Components/Footer'
import Contactos from './Components/Contactos'

import Testimonios from './Components/Testimonios'
import ProductosAdicionales from './Components/ProductosAdicionales'
import MetodosPago from './Components/MetodosPago'
import Admin from './pages/Admin';
import Login from './pages/Login';
import CartDrawer from './Components/CartDrawer';
import { AuthProvider } from './context/AuthContext';

ReactGA.initialize('G-GLJTCBRGXT');

const App = () => {
    useEffect(() => {
        ReactGA.send({ hitType: 'pageview', page: window.location.pathname });
    }, []);

    return (
        <AuthProvider>
            <Routes>
                <Route
                    path="/"
                    element={
                        <div>
                            <Navbar />
                            <Carrousel />
                            <Productos />
                            <ProductosAdicionales />
                            <Testimonios />
                            <About />
                            <Contactos />
                            <MetodosPago />
                            <Footer />
                        </div>
                    }
                />
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