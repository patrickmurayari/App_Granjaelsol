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
import CartDrawer from './Components/CartDrawer';

ReactGA.initialize('G-GLJTCBRGXT');

const App = () => {
    useEffect(() => {
        ReactGA.send({ hitType: 'pageview', page: window.location.pathname });
    }, []);

    return (
        <>
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
                <Route path="/admin" element={<Admin />} />
            </Routes>
            <CartDrawer />
        </>
    );
}

export default App;

/*

<div data-aos="zoom-in-right" data-aos-duration="1500" className="mt-12 md:mt-44 flex justify-center text-3xl md:text-5xl">
        <h1>Nuestras Ofertas</h1>
    </div>
<Ofertas />

*/