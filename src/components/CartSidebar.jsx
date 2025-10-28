import React from 'react';
import { X, ShoppingCart, Minus, Plus, Trash2, CreditCard } from 'lucide-react';
import useCartStore from '../store/useCartStore';
import { useNavigate } from 'react-router-dom';
import { useCurrency } from '../contexts/CurrencyContext';

const CartSidebar = () => {
  const navigate = useNavigate();
  const { getPriceString } = useCurrency();
  const { 
    items, 
    isOpen, 
    closeCart, 
    updateQuantity, 
    removeFromCart, 
    getTotal, 
    getItemCount,
    clearCart 
  } = useCartStore();

  const total = getTotal();
  const itemCount = getItemCount();

  const handleCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={closeCart}
      />
      
      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <ShoppingCart className="text-blue-600" size={24} />
            <h2 className="text-xl font-bold">Panyè Ou</h2>
            {itemCount > 0 && (
              <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                {itemCount}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <ShoppingCart size={64} className="text-gray-300 mb-4" />
              <p className="text-lg font-semibold text-gray-700">Panyè ou vid</p>
              <p className="text-gray-500">Ajoute kèk pwodwi nan panyè ou</p>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 border border-gray-200 rounded-lg">
                  {/* Product Image */}
                  <img
                    src={item.image}
                    alt={item.title || item.name}
                    className="w-20 h-20 object-cover rounded"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/80x80?text=No+Image';
                    }}
                  />

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {item.title || item.name}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-1">
                      {item.category}
                    </p>
                    
                    {/* Price */}
                    <div className="mt-2">
                      {item.discount > 0 ? (
                        <>
                          <div className="text-sm font-bold text-blue-600">
                            {getPriceString(item.price * (1 - item.discount / 100))}
                          </div>
                          <div className="text-xs text-gray-500 line-through">
                            {getPriceString(item.price)}
                          </div>
                        </>
                      ) : (
                        <div className="text-sm font-bold text-blue-600">
                          {getPriceString(item.price)}
                        </div>
                      )}
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 border border-gray-300 rounded hover:bg-gray-50"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="text-sm font-medium w-8 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 border border-gray-300 rounded hover:bg-gray-50"
                      >
                        <Plus size={16} />
                      </button>
                      
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="ml-auto p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Retire"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer with Total and Checkout */}
        {items.length > 0 && (
          <div className="border-t p-4 space-y-3">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total</span>
              <span className="text-blue-600">{getPriceString(total)}</span>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleCheckout}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                <CreditCard size={20} />
                Fè Kòmann
              </button>
            </div>
            
            <button
              onClick={clearCart}
              className="w-full text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Vide Panyè
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartSidebar;

