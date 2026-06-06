// src/App.js
import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import '@ionic/react/css/core.css'; // Import for ionBackButton event
import Header from './components/Header';
import Home from './pages/Home';
import Products from './pages/Products';
import Checkout from './pages/Checkout';
import SignIn from './pages/SignIn';
import AdminSignIn from './pages/AdminSignIn';
import SignInFooter from './components/SignInFooter';
import Footer from './components/Footer';
import AdminDashboard from './pages/AdminDashboard';
import { supabase } from './supabaseClient';
import './index.css';
import ProductDetail from './pages/ProductDetail';
import { HelmetProvider } from 'react-helmet-async';
import CustomerServicePage from './components/CustomerServicePage';
import Portal from './pages/Portal';
import WebDevelopment from './pages/WebDevelopment';
import AppDevelopment from './pages/AppDevelopment';

// ============================================================================
// CAPACITOR BACK BUTTON HANDLER
// ============================================================================
// Check if we're running in Capacitor (mobile app) environment
const isCapacitor = () => {
  return window.Capacitor !== undefined;
};

// ============================================================================
// VITE ENVIRONMENT VARIABLES
// ============================================================================
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID_HERE';

// For debugging - remove in production
console.log('Google Client ID loaded:', GOOGLE_CLIENT_ID ? '✓' : '✗');

// ============================================================================
// CONSTANTS
// ============================================================================
const CART_STORAGE_KEY = 'robert-izak-computers-cart';
const LANGUAGE_STORAGE_KEY = 'robert-izak-computers-language';
const USER_STORAGE_KEY = 'robert-izak-computers-user';
const CURRENCY_STORAGE_KEY = 'robert-izak-computers-currency';

function AppContent({
  currentPage,
  setCurrentPage,
  cart,
  setCart,
  isCartOpen,
  setIsCartOpen,
  isLoaded,
  setIsLoaded,
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
  cartRef,
  currentLanguage,
  setCurrentLanguage,
  user,
  setUser
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentCurrency, setCurrentCurrency] = useState('UGX');
  const [forceUpdate, setForceUpdate] = useState(0);

  // ============================================================================
  // DISABLE WEBVIEW DEFAULT BACK BEHAVIOR (PREVENTS CONFLICTS)
  // ============================================================================
  useEffect(() => {
    if (!isCapacitor()) return;

    // Push an initial state to block WebView's native back
    history.pushState(null, '', window.location.href);

    const handlePopState = (event) => {
      // Prevent the default WebView back from happening
      history.pushState(null, '', window.location.href);
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // ============================================================================
  // CAPACITOR BACK BUTTON HANDLER - USING IONIC BACK BUTTON EVENT (PRIORITY BASED)
  // ============================================================================
  useEffect(() => {
    if (!isCapacitor()) return;

    const handleHardwareBack = () => {
      const pathname = window.location.pathname;
      console.log('Back button pressed, current path:', pathname);

      // PRIORITY 1: Close cart sidebar if open
      if (isCartOpen) {
        setIsCartOpen(false);
        console.log('Cart sidebar closed');
        return;
      }

      // PRIORITY 2: Close any open modals/dialogs
      const modals = document.querySelectorAll('.modal-open, .dialog-open, [data-modal="open"], [role="dialog"]');
      if (modals.length > 0) {
        console.log('Closing modal');
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        return;
      }

      // PRIORITY 3: Check for popups or dropdowns
      const popups = document.querySelectorAll('[data-popup="open"], .popup-open, .dropdown-open');
      if (popups.length > 0) {
        const closeBtn = document.querySelector('.close-btn, [data-dismiss]');
        if (closeBtn) closeBtn.click();
        console.log('Closed popup');
        return;
      }

      // PRIORITY 4: Check if we can go back in history
      const homeRoutes = ['/', '/home', '/portal'];
      const isHomePage = homeRoutes.includes(pathname);

      if (!isHomePage && window.history.length > 1) {
        console.log('Navigating back to previous page');
        window.history.back();
        return;
      }

      // PRIORITY 5: Exit the app (only when no other action is possible)
      console.log('Exiting app');
      const exitApp = async () => {
        try {
          const { App } = await import('@capacitor/app');
          await App.exitApp();
        } catch (err) {
          console.error('Failed to exit app:', err);
        }
      };
      exitApp();
    };

    // Use the ionBackButton event for better priority handling
    const handleIonBackButton = (event) => {
      // Register with high priority (lower number = higher priority)
      // Priority -1 runs before default handlers
      event.detail.register(-1, handleHardwareBack);
    };

    document.addEventListener('ionBackButton', handleIonBackButton);

    return () => {
      document.removeEventListener('ionBackButton', handleIonBackButton);
    };
  }, [isCartOpen, setIsCartOpen]);

  useEffect(() => {
    console.log('Current URL:', location.pathname);
    const pathToPage = {
      '/': 'portal',
      '/home': 'home',
      '/products': 'products',
      '/checkout': 'checkout',
      '/signin': 'signin',
      '/admin-signin': 'admin-signin',
      '/admin-dashboard': 'admin-dashboard',
      '/confirm-email': 'confirm-email',
      '/web-development': 'web-development',
      '/app-development': 'app-development'
    };
    const newPage = pathToPage[location.pathname] || 'portal';
    if (newPage !== currentPage) {
      console.log(`Updating currentPage to: ${newPage}`);
      setCurrentPage(newPage);
    }
  }, [location, currentPage, setCurrentPage]);

  // Load currency from localStorage
  useEffect(() => {
    const savedCurrency = localStorage.getItem(CURRENCY_STORAGE_KEY);
    if (savedCurrency && ['UGX', 'USD', 'EUR'].includes(savedCurrency)) {
      setCurrentCurrency(savedCurrency);
    } else {
      setCurrentCurrency('UGX');
      localStorage.setItem(CURRENCY_STORAGE_KEY, 'UGX');
    }
  }, []);

  // Listen for currency changes from Header
  useEffect(() => {
    const handleCurrencyChange = (event) => {
      console.log('Currency change detected in App:', event.detail);
      setCurrentCurrency(event.detail);
      setForceUpdate(prev => prev + 1);
    };

    window.addEventListener('currencyChange', handleCurrencyChange);
    return () => window.removeEventListener('currencyChange', handleCurrencyChange);
  }, []);

  // Save currency to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(CURRENCY_STORAGE_KEY, currentCurrency);
      console.log('Currency saved to localStorage:', currentCurrency);
    }
  }, [currentCurrency, isLoaded]);

  // Currency conversion helper functions
  const getExchangeRates = () => ({
    USD: 1,
    EUR: 0.85,
    UGX: 3700
  });

  const convertPrice = (priceUSD) => {
    const rate = getExchangeRates()[currentCurrency] || 1;
    const converted = priceUSD * rate;
    
    if (currentCurrency === 'UGX') {
      return Math.round(converted).toLocaleString();
    } else {
      return converted.toFixed(2);
    }
  };

  const getCurrencySymbol = () => {
    switch(currentCurrency) {
      case 'EUR': return '€';
      case 'UGX': return 'USh ';
      default: return '$';
    }
  };

  const addToCart = (product) => {
    console.log('Adding to cart:', product.name, 'with quantity:', product.quantity || 1);
    setCart(currentCart => {
      const existingItem = currentCart.find(item => item.id === product.id);
      let newCart;
      
      if (existingItem) {
        const newQuantity = existingItem.quantity + (product.quantity || 1);
        newCart = currentCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: newQuantity }
            : item
        );
      } else {
        newCart = [...currentCart, { 
          ...product, 
          quantity: product.quantity || 1 
        }];
      }
      
      console.log('New cart after add:', newCart.length, 'items');
      
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newCart));
      
      setTimeout(() => {
        window.dispatchEvent(new Event('cartUpdated'));
        window.dispatchEvent(new Event('storage'));
      }, 100);
      
      return newCart;
    });
  };

  const removeFromCart = (productId) => {
    console.log('Removing from cart:', productId);
    setCart(currentCart => {
      const newCart = currentCart.filter(item => item.id !== productId);
      console.log('New cart after remove:', newCart.length, 'items');
      
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newCart));
      
      setTimeout(() => {
        window.dispatchEvent(new Event('cartUpdated'));
        window.dispatchEvent(new Event('storage'));
      }, 100);
      
      return newCart;
    });
  };

  const updateQuantity = (productId, quantity) => {
    console.log('Updating quantity:', productId, quantity);
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }
    setCart(currentCart => {
      const newCart = currentCart.map(item =>
        item.id === productId ? { ...item, quantity } : item
      );
      console.log('New cart after quantity update:', newCart.length, 'items');
      
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newCart));
      
      setTimeout(() => {
        window.dispatchEvent(new Event('cartUpdated'));
        window.dispatchEvent(new Event('storage'));
      }, 100);
      
      return newCart;
    });
  };

  const getTotalItems = () => {
    const total = cart.reduce((total, item) => total + item.quantity, 0);
    return total;
  };

  const getTotalPrice = () => {
    const total = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    return total;
  };

  const getConvertedTotalPrice = () => {
    const totalUSD = getTotalPrice();
    return convertPrice(totalUSD);
  };

  const clearCart = () => {
    console.log('Clearing cart');
    setCart([]);
    localStorage.removeItem(CART_STORAGE_KEY);
    window.dispatchEvent(new Event('cartUpdated'));
    window.dispatchEvent(new Event('storage'));
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage('products');
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const handleSignIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      if (data.user) {
        setUser(data.user);
        return data.user;
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const handleSignOut = async () => {
    try {
      setUser(null);
      localStorage.removeItem(USER_STORAGE_KEY);
      console.log('User signed out successfully');
      
      navigate('/');
      setCurrentPage('portal');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const renderPage = () => {
    console.log('Rendering page:', currentPage);
    switch (currentPage) {
      case 'products':
        return (
          <Products 
            addToCart={addToCart} 
            selectedCategory={selectedCategory}
            searchQuery={searchQuery}
            currentLanguage={currentLanguage}
          />
        );
      case 'checkout':
        return (
          <Checkout 
            cart={cart} 
            clearCart={clearCart} 
            setCurrentPage={setCurrentPage}
            currentLanguage={currentLanguage}
            user={user}
            currentCurrency={currentCurrency}
            convertPrice={convertPrice}
            getCurrencySymbol={getCurrencySymbol}
          />
        );
      case 'signin':
        return (
          <>
            <SignIn currentLanguage={currentLanguage} setUser={setUser} />
            <SignInFooter currentLanguage={currentLanguage} />
          </>
        );
      case 'admin-signin':
        return (
          <>
            <AdminSignIn currentLanguage={currentLanguage} setUser={setUser} />
            <SignInFooter currentLanguage={currentLanguage} />
          </>
        );
      case 'admin-dashboard':
        return <AdminDashboard user={user} setUser={setUser} />;
      case 'portal':
        return (
          <Portal 
            setCurrentPage={setCurrentPage}
            setSelectedCategory={setSelectedCategory}
            currentLanguage={currentLanguage}
            user={user}
          />
        );
      case 'web-development':
        return <WebDevelopment currentLanguage={currentLanguage} />;
      case 'app-development':
        return <AppDevelopment currentLanguage={currentLanguage} />;
      default:
        return (
          <Home 
            setCurrentPage={setCurrentPage}
            setSelectedCategory={setSelectedCategory}
            handleCategoryChange={handleCategoryChange}
            currentLanguage={currentLanguage}
            user={user}
          />
        );
    }
  };

  if (!isLoaded) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        Loading...
      </div>
    );
  }

  const isShopPage = location.pathname.startsWith('/products') || 
                     location.pathname.startsWith('/checkout') || 
                     location.pathname.startsWith('/home') ||
                     location.pathname.startsWith('/product/');
  const isAuthPage = location.pathname === '/signin' || 
                     location.pathname === '/admin-signin' || 
                     location.pathname === '/admin-dashboard';

  return (
    <div className="App">
      {isShopPage && !isAuthPage && (
        <Header 
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          cartItemCount={getTotalItems()}
          onCartClick={() => setIsCartOpen(true)}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          currentLanguage={currentLanguage}
          setCurrentLanguage={setCurrentLanguage}
          user={user}
          onSignOut={handleSignOut}
        />
      )}
      
      <main>
        <Routes>
          <Route path="/customer-service" element={
            <CustomerServicePage
              user={user}
              onSignOut={handleSignOut}
              currentLanguage={currentLanguage}
              currentCurrency={currentCurrency}
              cartItemCount={getTotalItems()}
              onCartClick={() => setIsCartOpen(true)}
              setCurrentPage={setCurrentPage}
            />
          } />
          <Route path="/" element={
            <Portal 
              setCurrentPage={setCurrentPage}
              setSelectedCategory={setSelectedCategory}
              currentLanguage={currentLanguage}
              user={user}
            />
          } />
          <Route path="/home" element={
            <Home 
              setCurrentPage={setCurrentPage}
              setSelectedCategory={setSelectedCategory}
              handleCategoryChange={handleCategoryChange}
              currentLanguage={currentLanguage}
              user={user}
              setUser={setUser}
              onSignIn={handleSignIn}
            />
          } />
          <Route path="/products" element={
            <Products 
              addToCart={addToCart} 
              selectedCategory={selectedCategory}
              searchQuery={searchQuery}
              currentLanguage={currentLanguage}
              user={user} 
              setUser={setUser}
              onSignIn={handleSignIn} 
            />
          } />
          <Route path="/product/:id" element={
            <ProductDetail 
              addToCart={addToCart}
              currentCurrency={currentCurrency}
              convertPrice={convertPrice}
              getCurrencySymbol={getCurrencySymbol}
              user={user} 
              setUser={setUser}
              currentLanguage={currentLanguage}
              onSignIn={handleSignIn}
            />
          } />
          <Route path="/web-development" element={
            <WebDevelopment currentLanguage={currentLanguage} />
          } />
          <Route path="/app-development" element={
            <AppDevelopment currentLanguage={currentLanguage} />
          } />
          <Route path="/checkout" element={
            <Checkout 
              cart={cart} 
              clearCart={clearCart} 
              setCurrentPage={setCurrentPage}
              currentLanguage={currentLanguage}
              user={user}
              currentCurrency={currentCurrency}
              convertPrice={convertPrice}
              getCurrencySymbol={getCurrencySymbol}
            />
          } />
          <Route path="/signin" element={
            <>
              <SignIn currentLanguage={currentLanguage} setUser={setUser} />
              <SignInFooter currentLanguage={currentLanguage} />
            </>
          } />
          <Route path="/admin-signin" element={
            <>
              <AdminSignIn currentLanguage={currentLanguage} setUser={setUser} />
              <SignInFooter currentLanguage={currentLanguage} />
            </>
          } />
          <Route path="/admin-dashboard" element={<AdminDashboard user={user} setUser={setUser} />} />
          <Route path="/confirm-email" element={
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <h2>Please check your email to confirm your account</h2>
              <p>We've sent a confirmation link to your email address.</p>
            </div>
          } />
        </Routes>
      </main>

      {isShopPage && !isAuthPage && (
        <Footer currentLanguage={currentLanguage} />
      )}

      {isCartOpen && isShopPage && (
        <CartSidebar 
          cart={cart}
          isCartOpen={isCartOpen}
          setIsCartOpen={setIsCartOpen}
          cartRef={cartRef}
          removeFromCart={removeFromCart}
          updateQuantity={updateQuantity}
          getTotalItems={getTotalItems}
          getConvertedTotalPrice={getConvertedTotalPrice}
          convertPrice={convertPrice}
          getCurrencySymbol={getCurrencySymbol}
          currentCurrency={currentCurrency}
          setCurrentPage={setCurrentPage}
          navigate={navigate}
        />
      )}
    </div>
  );
}

// ============================================================================
// CART SIDEBAR COMPONENT WITH STOCK VALIDATION
// ============================================================================
const CartSidebar = ({ 
  cart, 
  isCartOpen, 
  setIsCartOpen, 
  cartRef, 
  removeFromCart, 
  updateQuantity, 
  getTotalItems, 
  getConvertedTotalPrice,
  convertPrice,
  getCurrencySymbol,
  currentCurrency,
  setCurrentPage,
  navigate 
}) => {
  const [localCurrency, setLocalCurrency] = useState(currentCurrency);
  const [stockData, setStockData] = useState({});
  const [loadingStock, setLoadingStock] = useState(false);

  useEffect(() => {
    const handleCurrencyChange = (event) => {
      console.log('Currency change in CartSidebar:', event.detail);
      setLocalCurrency(event.detail);
    };

    window.addEventListener('currencyChange', handleCurrencyChange);
    return () => window.removeEventListener('currencyChange', handleCurrencyChange);
  }, []);

  // Fetch stock for all cart items
  const fetchStockForCartItems = async () => {
    if (!cart || cart.length === 0) return;
    
    setLoadingStock(true);
    try {
      const productIds = cart.map(item => item.id);
      const { data, error } = await supabase
        .from('products')
        .select('id, stock_quantity, name')
        .in('id', productIds);
      
      if (error) throw error;
      
      const stockMap = {};
      data.forEach(product => {
        stockMap[product.id] = {
          available: product.stock_quantity,
          name: product.name
        };
      });
      
      setStockData(stockMap);
      
      // Check if any cart item exceeds stock and auto-correct
      for (const item of cart) {
        const stockInfo = stockMap[item.id];
        if (stockInfo && item.quantity > stockInfo.available && stockInfo.available > 0) {
          updateQuantity(item.id, stockInfo.available);
        } else if (stockInfo && stockInfo.available === 0 && item.quantity > 0) {
          // If out of stock, remove from cart
          removeFromCart(item.id);
        }
      }
      
    } catch (error) {
      console.error('Error fetching stock:', error);
    } finally {
      setLoadingStock(false);
    }
  };

  // Fetch stock when cart changes
  useEffect(() => {
    fetchStockForCartItems();
  }, [cart]);

  // Handle quantity increase with stock validation
  const handleIncreaseQuantity = async (item) => {
    const currentStock = stockData[item.id]?.available || 0;
    const newQuantity = item.quantity + 1;
    
    if (newQuantity > currentStock) {
      alert(`⚠️ Cannot add more than ${currentStock} of "${item.name}". Only ${currentStock} left in stock!`);
      return;
    }
    
    updateQuantity(item.id, newQuantity);
  };

  // Handle quantity decrease
  const handleDecreaseQuantity = (item) => {
    if (item.quantity > 1) {
      updateQuantity(item.id, item.quantity - 1);
    } else {
      removeFromCart(item.id);
    }
  };

  const effectiveCurrency = localCurrency || currentCurrency;
  const effectiveSymbol = getCurrencySymbol();
  const effectiveConvertPrice = convertPrice;

  return (
    <div className={`cart-overlay ${isCartOpen ? 'open' : ''}`}>
      <div className="cart-sidebar" ref={cartRef}>
        <div className="cart-header">
          <h2>Shopping Cart ({getTotalItems()} items)</h2>
          <button 
            onClick={() => setIsCartOpen(false)}
            style={{ 
              background: 'none', 
              border: 'none', 
              fontSize: '1.5rem', 
              cursor: 'pointer',
              color: '#666',
              padding: '5px',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#f5f5f5'}
            onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            ×
          </button>
        </div>
        
        {loadingStock && (
          <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
            <div style={{
              width: '30px',
              height: '30px',
              border: '3px solid #f3f3f3',
              borderTop: '3px solid #3498db',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 10px'
            }}></div>
            Checking stock availability...
          </div>
        )}
        
        {!loadingStock && cart.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <p>Your R&I Cart is empty</p>
            <button 
              className="continue-shopping"
              onClick={() => setIsCartOpen(false)}
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          !loadingStock && (
            <>
              <div className="cart-currency-notice" style={{
                padding: '10px',
                backgroundColor: '#fff3cd',
                border: '1px solid #ffeaa7',
                borderRadius: '4px',
                margin: '10px',
                fontSize: '12px',
                textAlign: 'center',
                color: '#856404'
              }}>
                💰 Prices in {effectiveCurrency} • Updates instantly
              </div>
              
              {cart.map(item => {
                const stockInfo = stockData[item.id];
                const availableStock = stockInfo?.available || 0;
                const isLowStock = availableStock <= 5 && availableStock > 0;
                const isOutOfStock = availableStock === 0;
                const isAtMaxStock = item.quantity >= availableStock && availableStock > 0;
                
                return (
                  <div key={item.id} className="cart-item">
                    <img 
                      src={item.image_url} 
                      alt={item.name}
                      className="cart-item-image"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjRkZGRkZGIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NjY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
                      }}
                    />
                    <div className="cart-item-details">
                      <div className="cart-item-title">{item.name}</div>
                      <div className="cart-item-price">
                        {effectiveSymbol}{effectiveConvertPrice(item.price)} each
                      </div>
                      
                      {/* Stock Status Indicator */}
                      {isOutOfStock && (
                        <div style={{ color: '#e53e3e', fontSize: '12px', marginTop: '4px', fontWeight: '500' }}>
                          ⚠️ OUT OF STOCK - Please remove
                        </div>
                      )}
                      {isLowStock && !isOutOfStock && (
                        <div style={{ color: '#ed8936', fontSize: '12px', marginTop: '4px' }}>
                          ⚠️ Only {availableStock} left in stock!
                        </div>
                      )}
                      
                      <div className="cart-item-controls">
                        <button 
                          className="quantity-btn"
                          onClick={() => handleDecreaseQuantity(item)}
                          disabled={isOutOfStock}
                          style={{
                            opacity: isOutOfStock ? 0.5 : 1,
                            cursor: isOutOfStock ? 'not-allowed' : 'pointer'
                          }}
                        >
                          -
                        </button>
                        <span className="quantity-display">Qty: {item.quantity}</span>
                        <button 
                          className="quantity-btn"
                          onClick={() => handleIncreaseQuantity(item)}
                          disabled={isOutOfStock || isAtMaxStock}
                          style={{
                            opacity: (isOutOfStock || isAtMaxStock) ? 0.5 : 1,
                            cursor: (isOutOfStock || isAtMaxStock) ? 'not-allowed' : 'pointer'
                          }}
                          title={isAtMaxStock ? `Maximum ${availableStock} available` : ''}
                        >
                          +
                        </button>
                        <button 
                          className="remove-btn"
                          onClick={() => removeFromCart(item.id)}
                        >
                          Delete
                        </button>
                      </div>
                      <div className="cart-item-total">
                        Total: {effectiveSymbol}{effectiveConvertPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              <div className="cart-total">
                <div className="total-amount">
                  Subtotal ({getTotalItems()} items): {effectiveSymbol}{getConvertedTotalPrice()}
                </div>
              </div>
              
              <button 
                className="amazon-checkout-button"
                onClick={() => {
                  console.log('Proceed to Checkout clicked');
                  setCurrentPage('checkout');
                  setIsCartOpen(false);
                  navigate('/checkout');
                }}
              >
                Proceed to Checkout
              </button>
              
              <button 
                className="continue-shopping"
                onClick={() => setIsCartOpen(false)}
              >
                Continue Shopping
              </button>
            </>
          )
        )}
      </div>
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================
function App() {
  const [currentPage, setCurrentPage] = useState('portal');
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [user, setUser] = useState(null);
  const cartRef = useRef(null);

  // Safe JSON parse function
  const safeJSONParse = (item, defaultValue = null) => {
    if (!item || item === 'null' || item === 'undefined' || item === '') {
      return defaultValue;
    }
    try {
      return JSON.parse(item);
    } catch (error) {
      console.error('Error parsing JSON:', error);
      return defaultValue;
    }
  };

  // Load user, cart, and language from localStorage on component mount
  useEffect(() => {
    console.log('Loading data from localStorage...');
    try {
      // Load user data with safe parsing
      const savedUser = localStorage.getItem(USER_STORAGE_KEY);
      console.log('Raw user data from localStorage:', savedUser);
      
      const parsedUser = safeJSONParse(savedUser, null);
      if (parsedUser && parsedUser.id) {
        console.log('Setting user from localStorage:', parsedUser.email);
        setUser(parsedUser);
      } else {
        console.log('No valid user data found in localStorage');
        setUser(null);
      }

      // Load cart data with safe parsing
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      console.log('Raw cart data from localStorage:', savedCart);
      
      const parsedCart = safeJSONParse(savedCart, []);
      if (Array.isArray(parsedCart) && parsedCart.length > 0) {
        console.log('Setting cart with', parsedCart.length, 'items');
        setCart(parsedCart);
      } else {
        console.log('No valid cart data found in localStorage, setting empty array');
        setCart([]);
      }

      // Load language data (no parsing needed as it's a string)
      const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      console.log('Loading language from localStorage:', savedLanguage);
      
      if (savedLanguage && ['en', 'es', 'fr'].includes(savedLanguage)) {
        console.log('Setting language to:', savedLanguage);
        setCurrentLanguage(savedLanguage);
      } else {
        console.log('Using default language: en');
        setCurrentLanguage('en');
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      setUser(null);
      setCart([]);
      setCurrentLanguage('en');
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save user to localStorage whenever user changes
  useEffect(() => {
    if (isLoaded) {
      console.log('Saving user to localStorage:', user);
      try {
        if (user && user.id) {
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
          console.log('User saved successfully!');
        } else {
          localStorage.removeItem(USER_STORAGE_KEY);
          console.log('User cleared from localStorage');
        }
      } catch (error) {
        console.error('Error saving user to localStorage:', error);
      }
    }
  }, [user, isLoaded]);

  // Save cart to localStorage whenever cart changes
  useEffect(() => {
    if (isLoaded) {
      console.log('Saving cart to localStorage:', cart);
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
        console.log('Cart saved successfully! Items:', cart.length);
      } catch (error) {
        console.error('Error saving cart to localStorage:', error);
      }
    }
  }, [cart, isLoaded]);

  // Save language to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      console.log('Saving language to localStorage:', currentLanguage);
      try {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, currentLanguage);
        console.log('Language saved successfully!');
      } catch (error) {
        console.error('Error saving language to localStorage:', error);
      }
    }
  }, [currentLanguage, isLoaded]);

  // Close cart when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isCartOpen && cartRef.current && !cartRef.current.contains(event.target)) {
        setIsCartOpen(false);
      }
    };

    if (isCartOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCartOpen]);

  return (
    <HelmetProvider>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <BrowserRouter>
          <AppContent 
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            cart={cart}
            setCart={setCart}
            isCartOpen={isCartOpen}
            setIsCartOpen={setIsCartOpen}
            isLoaded={isLoaded}
            setIsLoaded={setIsLoaded}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            cartRef={cartRef}
            currentLanguage={currentLanguage}
            setCurrentLanguage={setCurrentLanguage}
            user={user}
            setUser={setUser}
          />
        </BrowserRouter>
      </GoogleOAuthProvider>
    </HelmetProvider>
  );
}

export default App;