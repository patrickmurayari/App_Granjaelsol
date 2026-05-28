import { Landmark, Smartphone } from 'lucide-react';
import { FaCcMastercard, FaCcVisa } from 'react-icons/fa';
import { SiMercadopago } from 'react-icons/si';

function MetodosPago() {
    const methods = [
        { label: 'Mercado Pago', kind: 'brand', BrandIcon: SiMercadopago },
        { label: 'MODO', kind: 'chip', Icon: Smartphone },
        { label: 'Cuenta DNI', kind: 'chip', Icon: Smartphone },
        { label: 'Transferencia', kind: 'chip', Icon: Landmark },
        { label: 'Visa', kind: 'brand', BrandIcon: FaCcVisa },
        { label: 'Mastercard', kind: 'brand', BrandIcon: FaCcMastercard },
    ];

    return (
        <section className="bg-white">
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
                    <h2 className="text-text-dark font-heading font-extrabold text-xl md:text-2xl mb-4">
                        Métodos de pago
                    </h2>

                    <div className="flex flex-wrap items-center gap-3">
                        {methods.map((m) => (
                            <div
                                key={m.label}
                                className={
                                    m.kind === 'brand'
                                        ? 'flex items-center justify-center bg-text-light border border-gray-200 rounded-md px-4 py-2 shadow-sm'
                                        : 'flex items-center gap-2 bg-text-light border border-gray-200 rounded-md px-3 py-2 shadow-sm'
                                }
                                title={m.label}
                                aria-label={m.label}
                            >
                                {m.kind === 'brand' ? (
                                    <m.BrandIcon className="text-primary" size={28} />
                                ) : (
                                    <>
                                        <m.Icon className="w-4 h-4 text-primary" />
                                        <span className="text-sm font-body font-semibold text-text-dark">{m.label}</span>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
            </div>
        </section>
    );
}

export default MetodosPago;
