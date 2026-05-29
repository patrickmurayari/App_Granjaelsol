import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Package, ShoppingCart, Plus, LogOut, Home, Truck, FileText, TrendingUp, Tag,
  Loader2, AlertCircle, CheckCircle, X, Menu,
} from 'lucide-react';

import ProductsManager from '../Components/Admin/ProductsManager';
import OrdersManager from '../Components/Admin/OrdersManager';
import CreateProduct from '../Components/Admin/CreateProduct';
import CashClosing from '../Components/Admin/CashClosing';
import InventoryManager from '../Components/Admin/InventoryManager';
import RemitosHistory from '../Components/Admin/RemitosHistory';
import FinanceManager from '../Components/Admin/FinanceManager';
import OffersManager from '../Components/Admin/OffersManager';

const TABS = ['Productos', 'Pedidos', 'Crear Producto', 'Cierre de Caja', 'Inventario', 'Remitos', 'Finanzas', 'Ofertas'];

const TAB_ICONS = {
  'Productos': Package,
  'Pedidos': ShoppingCart,
  'Crear Producto': Plus,
  'Cierre de Caja': Plus,
  'Inventario': Truck,
  'Remitos': FileText,
  'Finanzas': TrendingUp,
  'Ofertas': Tag,
};

const Admin = () => {
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [toasts, setToasts] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const selectTab = (tab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    if (!loading && !user) navigate('/login');
  }, [user, loading, navigate]);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const renderTab = () => {
    switch (activeTab) {
      case 'Productos': return <ProductsManager />;
      case 'Pedidos': return <OrdersManager />;
      case 'Crear Producto': return <CreateProduct />;
      case 'Cierre de Caja': return <CashClosing />;
      case 'Inventario': return <InventoryManager addToast={addToast} />;
      case 'Remitos': return <RemitosHistory addToast={addToast} />;
      case 'Finanzas': return <FinanceManager addToast={addToast} />;
      case 'Ofertas': return <OffersManager addToast={addToast} />;
      default: return null;
    }
  };

  const ActiveIcon = TAB_ICONS[activeTab] || Package;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">

      {/* ── Mobile top bar ───────────────────────────────────── */}
      <div className="sticky top-0 z-30 md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center">
            <ActiveIcon className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-[10px] text-text-dark/40 font-semibold uppercase tracking-wider leading-none mb-0.5">
              Panel Admin
            </p>
            <h1 className="font-heading font-extrabold text-text-dark text-sm leading-none">
              {activeTab}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => navigate('/')}
            className="w-8 h-8 flex items-center justify-center text-text-dark/50 hover:text-primary rounded-lg hover:bg-gray-100 transition"
            aria-label="Ir al inicio"
          >
            <Home className="w-4 h-4" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="w-9 h-9 flex items-center justify-center text-text-dark rounded-xl bg-gray-100 hover:bg-primary/10 hover:text-primary transition"
            aria-label="Abrir menú"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ── Mobile overlay ───────────────────────────────────── */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* ── Mobile sidebar drawer ────────────────────────────── */}
      <div
        className={`fixed top-0 left-0 h-full w-72 max-w-[85vw] bg-white z-50 md:hidden shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Package className="w-4 h-4 text-primary" />
            </div>
            <span className="font-heading font-extrabold text-text-dark">Panel Admin</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-text-dark/40 hover:text-text-dark hover:bg-gray-100 transition"
            aria-label="Cerrar menú"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {TABS.map((tab) => {
            const Icon = TAB_ICONS[tab] || Plus;
            return (
              <button
                key={tab}
                onClick={() => selectTab(tab)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left font-semibold text-sm transition-all duration-200 ${
                  activeTab === tab
                    ? 'bg-primary text-white shadow-md'
                    : 'text-text-dark hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {tab}
              </button>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="px-3 py-4 border-t border-gray-100 space-y-1">
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-text-dark font-semibold text-sm hover:bg-gray-100 transition"
          >
            <Home className="w-5 h-5 text-text-dark/50" />
            Ir al inicio
          </button>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 font-semibold text-sm hover:bg-red-50 transition"
          >
            <LogOut className="w-5 h-5" />
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────────── */}
      <div className="px-3 sm:px-4 md:px-8 pt-4 md:pt-10 pb-8">
        <div className="max-w-6xl mx-auto">

          {/* Desktop header — hidden on mobile */}
          <div className="hidden md:flex items-center justify-between gap-4 mb-6">
            <h1 className="text-2xl md:text-3xl font-heading font-extrabold text-text-dark">
              Panel de Administración
            </h1>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl font-bold hover:bg-primary hover:text-white transition text-sm border-2 border-primary"
                style={{ color: '#8B0000' }}
              >
                <Home className="w-4 h-4" />
                Inicio
              </button>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl font-bold hover:bg-red-700 hover:text-white transition text-sm border-2 border-red-700"
                style={{ color: '#b91c1c' }}
              >
                <LogOut className="w-4 h-4" />
                Salir
              </button>
            </div>
          </div>

          {/* Desktop tabs — hidden on mobile */}
          <div className="hidden md:flex gap-2 mb-6 overflow-x-auto pb-2">
            {TABS.map((tab) => {
              const Icon = TAB_ICONS[tab] || Plus;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
                    activeTab === tab
                      ? 'bg-primary text-white shadow-lg'
                      : 'bg-white text-text-dark border border-gray-200 hover:border-primary'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab}
                </button>
              );
            })}
          </div>

          {/* Tab content */}
          {renderTab()}
        </div>
      </div>

      {/* ── Toasts ── */}
      <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:w-96 z-[60] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border text-sm font-bold animate-[slideIn_0.2s_ease-out] ${
              t.type === 'error'
                ? 'bg-red-50 border-red-200 text-red-700'
                : 'bg-green-50 border-green-200 text-green-700'
            }`}
          >
            {t.type === 'error' ? (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            ) : (
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
            )}
            {t.message}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Admin;
