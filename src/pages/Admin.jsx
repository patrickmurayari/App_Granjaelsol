import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Package, ShoppingCart, Plus, LogOut, Home, Truck, FileText, TrendingUp, Loader2, AlertCircle, CheckCircle
} from 'lucide-react';

import ProductsManager from '../Components/Admin/ProductsManager';
import OrdersManager from '../Components/Admin/OrdersManager';
import CreateProduct from '../Components/Admin/CreateProduct';
import CashClosing from '../Components/Admin/CashClosing';
import InventoryManager from '../Components/Admin/InventoryManager';
import RemitosHistory from '../Components/Admin/RemitosHistory';
import FinanceManager from '../Components/Admin/FinanceManager';

const TABS = ['Productos', 'Pedidos', 'Crear Producto', 'Cierre de Caja', 'Inventario', 'Remitos', 'Finanzas'];

const TAB_ICONS = {
  'Productos': Package,
  'Pedidos': ShoppingCart,
  'Crear Producto': Plus,
  'Cierre de Caja': Plus,
  'Inventario': Truck,
  'Remitos': FileText,
  'Finanzas': TrendingUp,
};

const Admin = () => {
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [toasts, setToasts] = useState([]);

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

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

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
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 px-3 sm:px-4 md:px-8 py-4 sm:py-6 md:py-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-heading font-extrabold text-text-dark">
            Panel de Administración
          </h1>
          <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={() => navigate('/')}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white px-3 sm:px-4 py-2 rounded-xl font-bold hover:bg-primary hover:text-white transition text-sm sm:text-base border-2 border-primary"
              style={{ color: '#8B0000' }}
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Inicio</span>
            </button>
            <button
              onClick={handleSignOut}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white px-3 sm:px-4 py-2 rounded-xl font-bold hover:bg-red-700 hover:text-white transition text-sm sm:text-base border-2 border-red-700"
              style={{ color: '#b91c1c' }}
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 sm:gap-2 mb-4 sm:mb-6 overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0">
          {TABS.map((tab) => {
            const Icon = TAB_ICONS[tab] || Plus;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
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

        {/* Contenido de tabs */}
        {renderTab()}
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
