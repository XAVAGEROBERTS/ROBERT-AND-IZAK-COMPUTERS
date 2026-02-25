import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ChevronLeft, ShoppingCart, Heart, Star, Clock, Settings, HelpCircle, Mail, Shield, CreditCard, MapPin, Globe, DollarSign, X } from 'lucide-react';

const AccountPage = ({
  user,
  onSignOut,
  currentLanguage,
  setCurrentLanguage,
  currentCurrency,
  setCurrentCurrency,
  cartItemCount,
  onCartClick,
  setCurrentPage,
  onClose
}) => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('main');
  const [showSignInPrompt, setShowSignInPrompt] = useState(false);

  // Translations
  const translations = {
    en: {
      yourAccount: "Your Account",
      helloSignIn: "Hello, Sign In",
      signIn: "Sign In",
      signOut: "Sign Out",
      newCustomer: "New customer?",
      startHere: "Start here.",
      yourLists: "Your Lists",
      createList: "Create a List",
      findList: "Find a List or Registry",
      account: "Account",
      orders: "Orders",
      recommendations: "Recommendations",
      browsingHistory: "Browsing History",
      shoppingPreferences: "Your Shopping preferences",
      contactUs: "Contact Us",
      myComputerConfigs: "My Computer Configurations",
      repairWarranty: "Repair and Warranty",
      techSupport: "Tech Support",
      driverDownloads: "Driver Downloads",
      hardwareUpgrades: "Hardware Upgrades",
      customPCBuilder: "Custom PC Builder",
      helloUser: "Hello, {name}",
      language: "Language",
      currency: "Currency",
      changeLanguage: "Change Language",
      changeCurrency: "Change Currency",
      currentLanguage: "English",
      currentCurrency: "UGX - Ugandan Shilling",
      settings: "Settings",
      customerService: "Customer Service",
      yourOrders: "Your Orders",
      yourCart: "Your Cart",
      yourWishList: "Your Wish List",
      yourReviews: "Your Reviews",
      recentlyViewed: "Recently Viewed",
      manageAddresses: "Manage Addresses",
      paymentOptions: "Payment Options",
      security: "Security",
      close: "Close",
      signInRequired: "Sign In Required",
      pleaseSignIn: "Please sign in to access this feature.",
      goToSignIn: "Go to Sign In",
      cancel: "Cancel"
    },
    es: {
      yourAccount: "Tu Cuenta",
      helloSignIn: "Hola, Inicia Sesión",
      signIn: "Iniciar Sesión",
      signOut: "Cerrar Sesión",
      newCustomer: "¿Nuevo cliente?",
      startHere: "Comienza aquí.",
      yourLists: "Tus Listas",
      createList: "Crear una Lista",
      findList: "Buscar una Lista o Registro",
      account: "Cuenta",
      orders: "Pedidos",
      recommendations: "Recomendaciones",
      browsingHistory: "Historial de Navegación",
      shoppingPreferences: "Tus Preferencias de Compra",
      contactUs: "Contáctanos",
      myComputerConfigs: "Mis Configuraciones de Computadora",
      repairWarranty: "Reparación y Garantía",
      techSupport: "Soporte Técnico",
      driverDownloads: "Descargas de Controladores",
      hardwareUpgrades: "Actualizaciones de Hardware",
      customPCBuilder: "Constructor de PC Personalizado",
      helloUser: "Hola, {name}",
      language: "Idioma",
      currency: "Moneda",
      changeLanguage: "Cambiar Idioma",
      changeCurrency: "Cambiar Moneda",
      currentLanguage: "Español",
      currentCurrency: "UGX - Chelín Ugandés",
      settings: "Configuración",
      customerService: "Servicio al Cliente",
      yourOrders: "Tus Pedidos",
      yourCart: "Tu Carrito",
      yourWishList: "Tu Lista de Deseos",
      yourReviews: "Tus Reseñas",
      recentlyViewed: "Visto Recientemente",
      manageAddresses: "Gestionar Direcciones",
      paymentOptions: "Opciones de Pago",
      security: "Seguridad",
      close: "Cerrar",
      signInRequired: "Inicio de Sesión Requerido",
      pleaseSignIn: "Por favor inicia sesión para acceder a esta función.",
      goToSignIn: "Ir a Iniciar Sesión",
      cancel: "Cancelar"
    },
    fr: {
      yourAccount: "Votre Compte",
      helloSignIn: "Bonjour, Connectez-vous",
      signIn: "Se Connecter",
      signOut: "Se Déconnecter",
      newCustomer: "Nouveau client ?",
      startHere: "Commencez ici.",
      yourLists: "Vos Listas",
      createList: "Créer une Liste",
      findList: "Trouver une Liste ou un Registre",
      account: "Compte",
      orders: "Commandes",
      recommendations: "Recommandations",
      browsingHistory: "Historique de Navigation",
      shoppingPreferences: "Vos Préférences d'Achat",
      contactUs: "Contactez-nous",
      myComputerConfigs: "Mes Configurations d'Ordinateur",
      repairWarranty: "Réparation et Garantie",
      techSupport: "Support Technique",
      driverDownloads: "Téléchargements de Pilotes",
      hardwareUpgrades: "Mises à Niveau Matérielles",
      customPCBuilder: "Constructeur de PC Personnalisé",
      helloUser: "Bonjour, {name}",
      language: "Langue",
      currency: "Devise",
      changeLanguage: "Changer de Langue",
      changeCurrency: "Changer de Devise",
      currentLanguage: "Français",
      currentCurrency: "UGX - Shilling Ougandais",
      settings: "Paramètres",
      customerService: "Service Client",
      yourOrders: "Vos Commandes",
      yourCart: "Votre Panier",
      yourWishList: "Votre Liste de Souhaits",
      yourReviews: "Vos Avis",
      recentlyViewed: "Récemment Consulté",
      manageAddresses: "Gérer les Adresses",
      paymentOptions: "Options de Paiement",
      security: "Sécurité",
      close: "Fermer",
      signInRequired: "Connexion Requise",
      pleaseSignIn: "Veuillez vous connecter pour accéder à cette fonctionnalité.",
      goToSignIn: "Aller à la Connexion",
      cancel: "Annuler"
    }
  };

  const t = (key) => {
    const translation = translations[currentLanguage][key] || translations.en[key];
    if (user && user.user_metadata && translation && translation.includes('{name}')) {
      const firstName = user.user_metadata.first_name || user.email.split('@')[0];
      return translation.replace('{name}', firstName);
    }
    return translation;
  };

  // Languages
  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' }
  ];

  // Currencies
  const currencies = [
    { code: 'UGX', symbol: 'USh', name: 'UGX - Ugandan Shilling' },
    { code: 'USD', symbol: '$', name: 'USD - US Dollar' },
    { code: 'EUR', symbol: '€', name: 'EUR - Euro' }
  ];

  const handleSignIn = () => {
    setCurrentPage('signin');
    navigate('/signin');
    onClose();
  };

  const handleSignOut = () => {
    onSignOut();
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  const handleBack = () => {
    if (activeSection === 'main') {
      onClose();
    } else {
      setActiveSection('main');
    }
  };

  // NEW: Function to handle feature access with popup
  const handleFeatureAccess = (featureName) => {
    if (!user) {
      setShowSignInPrompt(true);
      return false;
    }
    return true;
  };

  // NEW: Function to handle feature clicks with authentication check
  const createFeatureHandler = (featureName, action) => {
    return () => {
      if (handleFeatureAccess(featureName)) {
        action();
      }
    };
  };

  // NEW: Handle sign in from popup
  const handlePopupSignIn = () => {
    setShowSignInPrompt(false);
    handleSignIn();
  };

  // NEW: Handle cancel from popup
  const handlePopupCancel = () => {
    setShowSignInPrompt(false);
  };

  const mainMenuItems = [
    {
      id: 'orders',
      title: t('yourOrders'),
      icon: ShoppingCart,
      description: 'View your orders',
      action: () => alert('Orders - Coming Soon!')
    },
    {
      id: 'cart',
      title: t('yourCart'),
      icon: ShoppingCart,
      description: `${cartItemCount} items`,
      action: () => {
        onClose();
        onCartClick();
      }
    },
    {
      id: 'wishlist',
      title: t('yourWishList'),
      icon: Heart,
      description: 'Your saved items',
      action: () => alert('Wish List - Coming Soon!')
    },
    {
      id: 'reviews',
      title: t('yourReviews'),
      icon: Star,
      description: 'Your product reviews',
      action: () => alert('Reviews - Coming Soon!')
    },
    {
      id: 'recently-viewed',
      title: t('recentlyViewed'),
      icon: Clock,
      description: 'Your browsing history',
      action: () => alert('Recently Viewed - Coming Soon!')
    }
  ].map(item => ({
    ...item,
    action: createFeatureHandler(item.title, item.action)
  }));

  const accountMenuItems = [
    {
      id: 'addresses',
      title: t('manageAddresses'),
      icon: MapPin,
      action: () => alert('Manage Addresses - Coming Soon!')
    },
    {
      id: 'payments',
      title: t('paymentOptions'),
      icon: CreditCard,
      action: () => alert('Payment Options - Coming Soon!')
    },
    {
      id: 'security',
      title: t('security'),
      icon: Shield,
      action: () => alert('Security - Coming Soon!')
    },
    {
      id: 'language',
      title: t('language'),
      icon: Globe,
      description: `${languages.find(l => l.code === currentLanguage)?.name}`,
      action: () => setActiveSection('language')
    },
    {
      id: 'currency',
      title: t('currency'),
      icon: DollarSign,
      description: `${currencies.find(c => c.code === currentCurrency)?.name}`,
      action: () => setActiveSection('currency')
    }
  ].map(item => ({
    ...item,
    action: createFeatureHandler(item.title, item.action)
  }));

  const serviceMenuItems = [
    {
      id: 'configs',
      title: t('myComputerConfigs'),
      icon: Settings,
      action: () => alert('My Computer Configurations - Coming Soon!')
    },
    {
      id: 'pc-builder',
      title: t('customPCBuilder'),
      icon: Settings,
      action: () => alert('Custom PC Builder - Coming Soon!')
    },
    {
      id: 'repair',
      title: t('repairWarranty'),
      icon: Settings,
      action: () => alert('Repair and Warranty - Coming Soon!')
    },
    {
      id: 'support',
      title: t('techSupport'),
      icon: HelpCircle,
      action: () => alert('Tech Support - Coming Soon!')
    },
    {
      id: 'drivers',
      title: t('driverDownloads'),
      icon: Settings,
      action: () => alert('Driver Downloads - Coming Soon!')
    },
    {
      id: 'upgrades',
      title: t('hardwareUpgrades'),
      icon: Settings,
      action: () => alert('Hardware Upgrades - Coming Soon!')
    }
  ].map(item => ({
    ...item,
    action: createFeatureHandler(item.title, item.action)
  }));

  // NEW: Customer service handler with auth check
  const handleCustomerService = createFeatureHandler(
    t('customerService'),
    () => alert('Customer Service - Coming Soon!')
  );

  // NEW: Render sign in prompt popup
  const renderSignInPrompt = () => (
    <div className="popup-overlay">
      <div className="signin-popup">
        <div className="popup-header">
          <h3 className="popup-title">{t('signInRequired')}</h3>
          <button className="popup-close" onClick={handlePopupCancel}>
            <X size={20} />
          </button>
        </div>
        <div className="popup-content">
          <div className="popup-icon">
            <User size={48} className="user-icon" />
          </div>
          <p className="popup-message">{t('pleaseSignIn')}</p>
        </div>
        <div className="popup-actions">
          <button className="popup-btn cancel-btn" onClick={handlePopupCancel}>
            {t('cancel')}
          </button>
          <button className="popup-btn signin-btn" onClick={handlePopupSignIn}>
            {t('goToSignIn')}
          </button>
        </div>
      </div>
    </div>
  );

  const renderMainSection = () => (
    <div className="account-main-section">
      {/* User Info Section */}
      <div className="user-info-section">
        <div className="user-avatar">
          <User size={40} />
        </div>
        <div className="user-details">
          {user ? (
            <>
              <h2 className="user-greeting">{t('helloUser')}</h2>
              <p className="user-email">{user.email}</p>
            </>
          ) : (
            <>
              <h2 className="user-greeting">{t('helloSignIn')}</h2>
              <p className="sign-in-prompt">{t('newCustomer')} {t('startHere')}</p>
            </>
          )}
        </div>
      </div>

      {/* Sign In/Out Button */}
      <div className="auth-section">
        {user ? (
          <button className="sign-out-btn" onClick={handleSignOut}>
            {t('signOut')}
          </button>
        ) : (
          <button className="sign-in-btn" onClick={handleSignIn}>
            {t('signIn')}
          </button>
        )}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h3 className="section-title">Quick Actions</h3>
        <div className="quick-actions-grid">
          {mainMenuItems.map((item) => (
            <div
              key={item.id}
              className="quick-action-item"
              onClick={item.action}
            >
              <item.icon size={24} className="action-icon" />
              <span className="action-title">{item.title}</span>
              {item.description && (
                <span className="action-description">{item.description}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Account Settings */}
      <div className="account-section">
        <h3 className="section-title">{t('yourAccount')}</h3>
        <div className="menu-list">
          {accountMenuItems.map((item) => (
            <div
              key={item.id}
              className="menu-item"
              onClick={item.action}
            >
              <div className="menu-item-content">
                <item.icon size={20} className="menu-icon" />
                <div className="menu-text">
                  <span className="menu-title">{item.title}</span>
                  {item.description && (
                    <span className="menu-description">{item.description}</span>
                  )}
                </div>
              </div>
              <ChevronLeft size={16} className="menu-arrow" />
            </div>
          ))}
        </div>
      </div>

      {/* Services */}
      <div className="services-section">
        <h3 className="section-title">ROBERT & IZAK SERVICES</h3>
        <div className="menu-list">
          {serviceMenuItems.map((item) => (
            <div
              key={item.id}
              className="menu-item"
              onClick={item.action}
            >
              <div className="menu-item-content">
                <item.icon size={20} className="menu-icon" />
                <span className="menu-title">{item.title}</span>
              </div>
              <ChevronLeft size={16} className="menu-arrow" />
            </div>
          ))}
        </div>
      </div>

      {/* Customer Service */}
      <div className="customer-service-section">
        <div className="menu-item" onClick={handleCustomerService}>
          <div className="menu-item-content">
            <HelpCircle size={20} className="menu-icon" />
            <span className="menu-title">{t('customerService')}</span>
          </div>
          <ChevronLeft size={16} className="menu-arrow" />
        </div>
      </div>
    </div>
  );

  const renderLanguageSection = () => (
    <div className="settings-section">
      <h3 className="section-title">{t('changeLanguage')}</h3>
      <div className="settings-list">
        {languages.map((language) => (
          <div
            key={language.code}
            className={`settings-item ${language.code === currentLanguage ? 'selected' : ''}`}
            onClick={() => {
              setCurrentLanguage(language.code);
              setActiveSection('main');
            }}
          >
            <span className="language-flag">{language.flag}</span>
            <div className="settings-text">
              <span className="settings-title">{language.name}</span>
            </div>
            {language.code === currentLanguage && (
              <div className="selected-indicator">✓</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderCurrencySection = () => (
    <div className="settings-section">
      <h3 className="section-title">{t('changeCurrency')}</h3>
      <div className="settings-list">
        {currencies.map((currency) => (
          <div
            key={currency.code}
            className={`settings-item ${currency.code === currentCurrency ? 'selected' : ''}`}
            onClick={() => {
              setCurrentCurrency(currency.code);
              setActiveSection('main');
            }}
          >
            <DollarSign size={20} className="currency-icon" />
            <div className="settings-text">
              <span className="settings-title">{currency.name}</span>
              <span className="settings-description">{currency.symbol}</span>
            </div>
            {currency.code === currentCurrency && (
              <div className="selected-indicator">✓</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <style jsx>{`
        .account-page {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: white;
          z-index: 1100;
          overflow-y: auto;
          padding-bottom: 20px;
        }

        .account-header {
          position: sticky;
          top: 0;
          background: #232f3e;
          color: white;
          padding: 15px;
          display: flex;
          align-items: center;
          gap: 15px;
          z-index: 10;
          border-bottom: 1px solid #ddd;
        }

        .back-button {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px;
          border-radius: 3px;
        }

        .back-button:active {
          background: rgba(255, 255, 255, 0.1);
        }

        .account-title {
          font-size: 18px;
          font-weight: bold;
          color: white;
          flex: 1;
        }

        .close-button {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          padding: 8px 12px;
        }

        .close-button:active {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }

        .account-content {
          padding: 0;
        }

        .user-info-section {
          padding: 20px;
          background: linear-gradient(135deg, #232f3e, #37475a);
          color: white;
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .user-avatar {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .user-details {
          flex: 1;
        }

        .user-greeting {
          font-size: 20px;
          font-weight: bold;
          margin: 0 0 5px 0;
        }

        .user-email {
          font-size: 14px;
          opacity: 0.9;
          margin: 0;
        }

        .sign-in-prompt {
          font-size: 14px;
          opacity: 0.9;
          margin: 5px 0 0 0;
        }

        .auth-section {
          padding: 15px 20px;
          border-bottom: 1px solid #eee;
        }

        .sign-in-btn, .sign-out-btn {
          width: 100%;
          padding: 12px;
          border: 1px solid #d5d9d9;
          border-radius: 8px;
          background: #ffd814;
          color: #0f1111;
          font-weight: bold;
          cursor: pointer;
          font-size: 14px;
        }

        .sign-in-btn:active, .sign-out-btn:active {
          background: #f7ca00;
        }

        .section-title {
          font-size: 16px;
          font-weight: bold;
          color: #0f1111;
          margin: 0 0 10px 0;
          padding: 0 20px;
        }

        .quick-actions-section {
          padding: 20px 0;
          border-bottom: 1px solid #eee;
        }

        .quick-actions-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          padding: 0 20px;
        }

        .quick-action-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 15px 10px;
          border: 1px solid #e7e7e7;
          border-radius: 8px;
          cursor: pointer;
          text-align: center;
          background: white;
        }

        .quick-action-item:active {
          background: #f7f7f7;
        }

        .action-icon {
          color: #232f3e;
          margin-bottom: 8px;
        }

        .action-title {
          font-size: 12px;
          font-weight: 500;
          color: #0f1111;
          margin-bottom: 4px;
        }

        .action-description {
          font-size: 10px;
          color: #666;
        }

        .account-section, .services-section, .customer-service-section {
          padding: 20px 0;
          border-bottom: 1px solid #eee;
        }

        .customer-service-section {
          border-bottom: none;
        }

        .menu-list {
          padding: 0;
        }

        .menu-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 15px 20px;
          cursor: pointer;
          border-bottom: 1px solid #f0f0f0;
        }

        .menu-item:last-child {
          border-bottom: none;
        }

        .menu-item:active {
          background: #f7f7f7;
        }

        .menu-item-content {
          display: flex;
          align-items: center;
          gap: 15px;
          flex: 1;
        }

        .menu-icon {
          color: #666;
        }

        .menu-text {
          display: flex;
          flex-direction: column;
        }

        .menu-title {
          font-size: 14px;
          color: #0f1111;
          font-weight: 500;
        }

        .menu-description {
          font-size: 12px;
          color: #666;
          margin-top: 2px;
        }

        .menu-arrow {
          color: #666;
          transform: rotate(180deg);
        }

        .settings-section {
          padding: 20px;
        }

        .settings-list {
          border: 1px solid #e7e7e7;
          border-radius: 8px;
          overflow: hidden;
        }

        .settings-item {
          display: flex;
          align-items: center;
          padding: 15px;
          cursor: pointer;
          border-bottom: 1px solid #f0f0f0;
          background: white;
        }

        .settings-item:last-child {
          border-bottom: none;
        }

        .settings-item:active {
          background: #f7f7f7;
        }

        .settings-item.selected {
          background: #fffaf4;
          border-left: 3px solid #f7a24c;
        }

        .language-flag {
          font-size: 20px;
          margin-right: 15px;
        }

        .currency-icon {
          margin-right: 15px;
          color: #666;
        }

        .settings-text {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .settings-title {
          font-size: 14px;
          color: #0f1111;
          font-weight: 500;
        }

        .settings-description {
          font-size: 12px;
          color: #666;
          margin-top: 2px;
        }

        .selected-indicator {
          color: #f7a24c;
          font-weight: bold;
        }

        /* Popup Styles */
        .popup-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1200;
          padding: 20px;
        }

        .signin-popup {
          background: white;
          border-radius: 12px;
          width: 100%;
          max-width: 400px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
          overflow: hidden;
        }

        .popup-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 20px 0 20px;
        }

        .popup-title {
          font-size: 18px;
          font-weight: bold;
          color: #0f1111;
          margin: 0;
        }

        .popup-close {
          background: none;
          border: none;
          cursor: pointer;
          color: #666;
          padding: 5px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .popup-close:active {
          background: #f7f7f7;
        }

        .popup-content {
          padding: 20px;
          text-align: center;
        }

        .popup-icon {
          margin-bottom: 15px;
        }

        .user-icon {
          color: #232f3e;
        }

        .popup-message {
          font-size: 16px;
          color: #0f1111;
          line-height: 1.4;
          margin: 0;
        }

        .popup-actions {
          display: flex;
          gap: 10px;
          padding: 0 20px 20px 20px;
        }

        .popup-btn {
          flex: 1;
          padding: 12px 16px;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .cancel-btn {
          background: #f0f0f0;
          color: #0f1111;
          border: 1px solid #d5d9d9;
        }

        .cancel-btn:active {
          background: #e7e7e7;
        }

        .signin-btn {
          background: #ffd814;
          color: #0f1111;
          border: 1px solid #f7ca00;
        }

        .signin-btn:active {
          background: #f7ca00;
        }

        @media (max-width: 480px) {
          .quick-actions-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .user-greeting {
            font-size: 18px;
          }
          
          .account-title {
            font-size: 16px;
          }

          .popup-overlay {
            padding: 15px;
          }

          .popup-actions {
            flex-direction: column;
          }
        }
      `}</style>

      <div className="account-page">
        <div className="account-header">
          <button className="back-button" onClick={handleBack}>
            <ChevronLeft size={24} />
          </button>
          <h1 className="account-title">
            {activeSection === 'language' ? t('changeLanguage') :
             activeSection === 'currency' ? t('changeCurrency') :
             t('yourAccount')}
          </h1>
          {activeSection === 'main' && (
            <button className="close-button" onClick={handleClose}>
              {t('close')}
            </button>
          )}
        </div>

        <div className="account-content">
          {activeSection === 'main' && renderMainSection()}
          {activeSection === 'language' && renderLanguageSection()}
          {activeSection === 'currency' && renderCurrencySection()}
        </div>

        {/* Sign In Prompt Popup */}
        {showSignInPrompt && renderSignInPrompt()}
      </div>
    </>
  );
};

export default AccountPage;