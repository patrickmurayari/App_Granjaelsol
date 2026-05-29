import { useQuery } from '@tanstack/react-query';
import api from '../api/api';

function StoreOffers() {
  const { data: offers, isLoading } = useQuery({
    queryKey: ['store-offers-public'],
    queryFn: async () => {
      const { data } = await api.get('/finance/offers');
      return data;
    },
  });

  if (isLoading || !offers || offers.length === 0) return null;

  const handleOfferClick = (category) => {
    window.dispatchEvent(new CustomEvent('selectProductCategory', { detail: category }));
    document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="ofertas" className="w-full bg-white">
      <div className="text-center pt-8 pb-4 px-4">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-extrabold text-text-dark">
          Ofertas de la Semana
        </h2>
      </div>
      <div className="max-w-7xl md:mx-auto md:px-8 md:pb-14">

        <div className="grid grid-cols-2 md:grid-cols-4 gap-[2px] md:gap-4">
          {offers.map((offer) =>
            offer.link_to_category ? (
              <button
                key={offer.id}
                type="button"
                onClick={() => handleOfferClick(offer.link_to_category)}
                className="relative rounded-none md:rounded-xl overflow-hidden group cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40"
                aria-label={`Ver ofertas de ${offer.link_to_category}`}
              >
                <img
                  src={offer.image_url}
                  alt={offer.title || `Oferta ${offer.link_to_category}`}
                  className="w-full h-auto block md:group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-black/0 md:group-hover:bg-black/10 transition-colors duration-300" />
              </button>
            ) : (
              <div
                key={offer.id}
                className="relative rounded-none md:rounded-xl overflow-hidden"
              >
                <img
                  src={offer.image_url}
                  alt={offer.title || 'Oferta'}
                  className="w-full h-auto block"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
}

export default StoreOffers;
