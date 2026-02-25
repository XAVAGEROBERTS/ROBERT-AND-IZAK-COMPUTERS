import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, MapPin, Search, Menu, ChevronDown, X, HelpCircle, Settings, User, Star, Mail, DollarSign, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AccountPage from './AccountPage'; 

const Header = ({
  currentPage,
  setCurrentPage,
  cartItemCount,
  onCartClick,
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
  currentLanguage,
  setCurrentLanguage,
  user,
  onSignOut
}) => {
  const navigate = useNavigate();

  // Currency support - UGX as default
  const currencies = [
    { code: 'UGX', symbol: 'USh', name: 'UGX - Ugandan Shilling' },
    { code: 'USD', symbol: '$', name: 'USD - US Dollar' },
    { code: 'EUR', symbol: '€', name: 'EUR - Euro' }
  ];

  // Language support
  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' }
  ];

  // Translation dictionary with currency support
  const translations = {
    en: {
      logo: "ROBERT & IZAK COMPUTERS",
      deliverTo: "Deliver to",
      selectAddress: "Select your address",
      searchPlaceholder: "Search ROBERT & IZAK COMPUTERS",
      all: "All",
      home: "Home", // ADDED: Home tab
      todayDeals: "Today's Deals",
      helloSignIn: "Hello, sign in",
      accountLists: "Account & Lists",
      returns: "Returns",
      orders: "& Orders",
      cart: "Cart",
      popularSearches: "Popular searches",
      searchFor: "Search for",
      clearSearch: "Clear search",
      addAddress: "Add",
      enterAddress: "Enter street address, city, or zip code",
      noSavedAddresses: "No saved addresses yet. Add one above.",
      default: "Default",
      helloSignInMenu: "Hello, Sign In",
      bestSellers: "Best Sellers",
      todayDealsMenu: "Today's Deals",
      yourAccount: "Your Account",
      customerService: "Customer Service",
      contactUs: "Contact Us",
      settings: "Settings",
      searchResultsFor: "Search results for:",
      signIn: "Sign in",
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
      signOut: "Sign Out",
      currency: "Currency",
      language: "Language",
      changeLanguage: "Change Language",
      changeCurrency: "Change Currency",
      currentLanguage: "Current Language",
      currentCurrency: "Current Currency",
      laptops: "Laptops",
      gaming: "Gaming",
      monitors: "Monitors",
      accessories: "Accessories",
      pcComponents: "PC Components",
      networking: "Networking",
      storage: "Storage",
      software: "Software",
    },
    es: {
      logo: "ROBERT & IZAK COMPUTERS",
      deliverTo: "Entregar a",
      selectAddress: "Selecciona tu dirección",
      searchPlaceholder: "Buscar en ROBERT & IZAK COMPUTERS",
      all: "Todos",
      home: "Inicio", // ADDED: Home tab
      todayDeals: "Ofertas del día",
      helloSignIn: "Hola, inicia sesión",
      accountLists: "Cuenta y listas",
      returns: "Devoluciones",
      orders: "y Pedidos",
      cart: "Carrito",
      popularSearches: "Búsquedas populares",
      searchFor: "Buscar",
      clearSearch: "Borrar búsqueda",
      addAddress: "Agregar",
      enterAddress: "Ingresa calle, ciudad o código postal",
      noSavedAddresses: "Aún no hay direcciones guardadas. Agrega arriba.",
      default: "Predeterminada",
      helloSignInMenu: "Hola, Inicia Sesión",
      bestSellers: "Más Vendidos",
      todayDealsMenu: "Ofertas del día",
      yourAccount: "Tu cuenta",
      customerService: "Servicio al cliente",
      contactUs: "Contáctanos",
      settings: "Configuración",
      searchResultsFor: "Resultados de búsqueda para:",
      signIn: "Iniciar sesión",
      newCustomer: "¿Nuevo cliente?",
      startHere: "Comienza aquí.",
      yourLists: "Tus Listas",
      createList: "Crear una Lista",
      findList: "Buscar una Lista o Registro",
      account: "Cuenta",
      orders: "Pedidos",
      recommendations: "Recomendaciones",
      browsingHistory: "Historial de navegación",
      shoppingPreferences: "Tus preferencias de compra",
      contactUs: "Contáctanos",
      myComputerConfigs: "Mis Configuraciones de Computadora",
      repairWarranty: "Reparación y Garantía",
      techSupport: "Soporte Técnico",
      driverDownloads: "Descargas de Controladores",
      hardwareUpgrades: "Actualizaciones de Hardware",
      customPCBuilder: "Constructor de PC Personalizado",
      helloUser: "Hola, {name}",
      signOut: "Cerrar sesión",
      currency: "Moneda",
      language: "Idioma",
      changeLanguage: "Cambiar Idioma",
      changeCurrency: "Cambiar Moneda",
      currentLanguage: "Idioma Actual",
      currentCurrency: "Moneda Actual",
      laptops: "Portátiles",
      gaming: "Gaming",
      monitors: "Monitores",
      accessories: "Accesorios",
      pcComponents: "Componentes PC",
      networking: "Redes",
      storage: "Almacenamiento",
      software: "Software",
    },
    fr: {
      logo: "ROBERT & IZAK COMPUTERS",
      deliverTo: "Livrer à",
      selectAddress: "Sélectionnez votre adresse",
      searchPlaceholder: "Rechercher dans ROBERT & IZAK COMPUTERS",
      all: "Tous",
      home: "Accueil", // ADDED: Home tab
      todayDeals: "Offres du jour",
      helloSignIn: "Bonjour, connectez-vous",
      accountLists: "Compte et listes",
      returns: "Retours",
      orders: "et Commandes",
      cart: "Panier",
      popularSearches: "Recherches populaires",
      searchFor: "Rechercher",
      clearSearch: "Effacer la recherche",
      addAddress: "Ajouter",
      enterAddress: "Entrez rue, ville ou code postal",
      noSavedAddresses: "Aucune adresse enregistrée. Ajoutez-en une ci-dessus.",
      default: "Par défaut",
      helloSignInMenu: "Bonjour, Connectez-vous",
      bestSellers: "Meilleures ventes",
      todayDealsMenu: "Offres du jour",
      yourAccount: "Votre compte",
      customerService: "Service client",
      contactUs: "Contactez-nous",
      settings: "Paramètres",
      searchResultsFor: "Résultats de recherche pour :",
      signIn: "Se connecter",
      newCustomer: "Nouveau client ?",
      startHere: "Commencez ici.",
      yourLists: "Vos Listes",
      createList: "Créer une Liste",
      findList: "Trouver une Liste ou un Registre",
      account: "Compte",
      orders: "Commandes",
      recommendations: "Recomendations",
      browsingHistory: "Historique de navigation",
      shoppingPreferences: "Vos préférences d'achat",
      contactUs: "Contactez-nous",
      myComputerConfigs: "Mes Configurations d'Ordinateur",
      repairWarranty: "Réparation et Garantie",
      techSupport: "Support Technique",
      driverDownloads: "Téléchargements de Pilotes",
      hardwareUpgrades: "Mises à Niveau Matérielles",
      customPCBuilder: "Constructeur de PC Personnalisé",
      helloUser: "Bonjour, {name}",
      signOut: "Se déconnecter",
      currency: "Devise",
      language: "Langue",
      changeLanguage: "Changer de Langue",
      changeCurrency: "Changer de Devise",
      currentLanguage: "Langue Actuelle",
      currentCurrency: "Devise Actuelle",
      laptops: "Ordinateurs portables",
      gaming: "Gaming",
      monitors: "Moniteurs",
      accessories: "Accessoires",
      pcComponents: "Composants PC",
      networking: "Réseau",
      storage: "Stockage",
      software: "Logiciels",
    }
  };

  // Bundle categories - EXACTLY like Home.jsx
  const bundleCategories = [
    {
      id: 'gaming-bundle',
      name: { en: 'Gaming', es: 'Gaming', fr: 'Gaming' },
      categories: ["gaming-pcs", "gaming-laptops", "gaming-desktops"],
    },
    {
      id: 'laptops-bundle',
      name: { en: 'Laptops', es: 'Portátiles', fr: 'Ordinateurs portables' },
      categories: ["laptops", "laptops", "business-laptops", "macbooks", "2-in-1s"],
    },
    {
      id: 'monitors-bundle',
      name: { en: 'Monitors', es: 'Monitores', fr: 'Moniteurs' },
      categories: ["monitors", "4k-monitors", "curved-monitors", "high-refresh-monitors", "office-monitors"],
    },
    {
      id: 'accessories-bundle',
      name: { en: 'Accessories', es: 'Accesorios', fr: 'Accessoires' },
      categories: ["accessories", "keyboards", "mice", "headsets", "webcams"],
    },
    {
      id: 'components-bundle',
      name: { en: 'PC Components', es: 'Componentes PC', fr: 'Composants PC' },
      categories: ["components", "gpus", "cpus", "ram", "motherboards"],
    },
    {
      id: 'networking-bundle',
      name: { en: 'Networking', es: 'Redes', fr: 'Réseau' },
      categories: ["networking", "routers", "switches", "wifi-extenders", "modems"],
    },
    {
      id: 'storage-bundle',
      name: { en: 'Storage', es: 'Almacenamiento', fr: 'Stockage' },
      categories: ["storage", "ssds", "hdds", "external-drives", "nas"],
    },
    {
      id: 'software-bundle',
      name: { en: 'Software', es: 'Software', fr: 'Logiciels' },
      categories: ["software", "windows", "office", "antivirus", "design-tools"],
    }
  ];

  // Regular single categories
  const singleCategories = [
    { id: 'all', name: { en: 'All', es: 'Todos', fr: 'Tous' } },
    { id: 'best-sellers', name: { en: 'Best Sellers', es: 'Más Vendidos', fr: 'Meilleures ventes' } },
    { id: 'computers', name: { en: 'Computers', es: 'Computadoras', fr: 'Ordinateurs' } }
  ];

  // All categories for display (single + bundles)
  const allCategories = [
    ...singleCategories,
    ...bundleCategories
  ];

  const popularSearches = [
    "gaming pc", "laptop", "monitor", "keyboard", "mouse", "computer",
    "gaming laptop", "windows 11", "ssd", "wifi router", "rtx 4070",
    "ryzen 7", "mechanical keyboard", "wireless mouse", "4k monitor"
  ];

  // State
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showAllMenu, setShowAllMenu] = useState(false);
  const [selectedSearchCategory, setSelectedSearchCategory] = useState('all');
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressInput, setAddressInput] = useState('');
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [isHeaderHidden, setIsHeaderHidden] = useState(false);
  const [currentCurrency, setCurrentCurrency] = useState('UGX'); // UGX as default
  const [isMobile, setIsMobile] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  // Welcome Modal State
const [showWelcomeModal, setShowWelcomeModal] = useState(false);
const [hasSeenWelcome, setHasSeenWelcome] = useState(false);
const [showSignupBanner, setShowSignupBanner] = useState(false);

  // Refs
  const searchRef = useRef(null);
  const categoryDropdownRef = useRef(null);
  const allMenuRef = useRef(null);
  const addressModalRef = useRef(null);
  const languageDropdownRef = useRef(null);
  const currencyDropdownRef = useRef(null);
  const accountDropdownRef = useRef(null);
  const headerRef = useRef(null);
  const lastScrollY = useRef(0);
  const languageTimeoutRef = useRef(null);
  const currencyTimeoutRef = useRef(null);
  const accountTimeoutRef = useRef(null);

  // Check mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);



  // Load currency from localStorage on component mount
  useEffect(() => {
    const savedCurrency = localStorage.getItem('robert-izak-computers-currency');
    if (savedCurrency && ['UGX', 'USD', 'EUR'].includes(savedCurrency)) {
      setCurrentCurrency(savedCurrency);
    } else {
      // Set UGX as default if no currency is saved
      setCurrentCurrency('UGX');
      localStorage.setItem('robert-izak-computers-currency', 'UGX');
    }
  }, []);
// Welcome Modal and Banner Logic - UPDATED VERSION
useEffect(() => {
  // Show banner every time user visits if not logged in
  if (!user) {
    const bannerTimer = setTimeout(() => {
      setShowSignupBanner(true);
    }, 2000); // Show after 2 seconds
    
    return () => clearTimeout(bannerTimer);
  } else {
    // Hide banner if user logs in
    setShowSignupBanner(false);
    setShowWelcomeModal(false);
  }
}, [user]);

// Exit intent detection - show welcome modal on mouse leave within 24 hours
useEffect(() => {
  const handleMouseLeave = (e) => {
    // Show modal when mouse leaves top of screen and user is not logged in
    if (e.clientY < 0 && !user && !showWelcomeModal && !showSignupBanner) {
      const lastWelcomeTime = localStorage.getItem('robert-izak-welcome-last-shown');
      const now = new Date().getTime();
      
      // Show modal if never shown before OR if last shown more than 24 hours ago
      if (!lastWelcomeTime || (now - parseInt(lastWelcomeTime)) > (24 * 60 * 60 * 1000)) {
        console.log('Exit intent detected - showing welcome modal');
        setShowWelcomeModal(true);
        localStorage.setItem('robert-izak-welcome-last-shown', now.toString());
      }
    }
  };

  document.addEventListener('mouseleave', handleMouseLeave);
  return () => document.removeEventListener('mouseleave', handleMouseLeave);
}, [user, showWelcomeModal, showSignupBanner]);

// Also show welcome modal on first page load within 24 hours
useEffect(() => {
  if (!user) {
    const lastWelcomeTime = localStorage.getItem('robert-izak-welcome-last-shown');
    const now = new Date().getTime();
    
    // Show welcome modal after a delay if never shown OR if last shown more than 24 hours ago
    if (!lastWelcomeTime || (now - parseInt(lastWelcomeTime)) > (24 * 60 * 60 * 1000)) {
      const welcomeTimer = setTimeout(() => {
        console.log('Showing welcome modal - within 24 hour window');
        setShowWelcomeModal(true);
        localStorage.setItem('robert-izak-welcome-last-shown', now.toString());
      }, 3000); // Show after 3 seconds
      
      return () => clearTimeout(welcomeTimer);
    }
  }
}, [user]);
  // Listen for location changes from Home component and other instances
  useEffect(() => {
    const handleLocationChange = (event) => {
      const newLocation = event.detail.location;
      
      // Update selectedAddress if it exists in savedAddresses
      if (savedAddresses.length > 0) {
        const foundAddress = savedAddresses.find(addr => addr.text === newLocation);
        if (foundAddress) {
          setSelectedAddress(foundAddress);
        } else if (newLocation !== 'Enter your location') {
          // Create a temporary address object for display
          setSelectedAddress({ id: 'temp', text: newLocation, isDefault: false });
        } else {
          // Reset to first saved address or null
          setSelectedAddress(savedAddresses[0] || null);
        }
      } else if (newLocation !== 'Enter your location') {
        // Create temporary address when no saved addresses exist
        setSelectedAddress({ id: 'temp', text: newLocation, isDefault: false });
      } else {
        setSelectedAddress(null);
      }
    };

    const handleStorageChange = () => {
      const userLocation = localStorage.getItem('userLocation');
      if (userLocation && savedAddresses.length > 0) {
        const foundAddress = savedAddresses.find(addr => addr.text === userLocation);
        if (foundAddress && foundAddress.id !== selectedAddress?.id) {
          setSelectedAddress(foundAddress);
        }
      }
    };

    window.addEventListener('locationChanged', handleLocationChange);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('locationChanged', handleLocationChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [savedAddresses, selectedAddress]);

  // Listen for cart updates to refresh cart count
  useEffect(() => {
    const handleCartUpdate = () => {
      // This will force the header to re-render and update cart count
      console.log('🔄 Cart update received in header');
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    window.addEventListener('storage', handleCartUpdate);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
      window.removeEventListener('storage', handleCartUpdate);
    };
  }, []);

  // Save currency to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('robert-izak-computers-currency', currentCurrency);
    // Dispatch currency change event for other components
    window.dispatchEvent(new CustomEvent('currencyChange', { detail: currentCurrency }));
  }, [currentCurrency]);

  // Scroll handler for header hide/show
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsHeaderHidden(true);
      } else if (currentScrollY < lastScrollY.current || currentScrollY <= 100) {
        setIsHeaderHidden(false);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Load saved addresses from localStorage and sync with Home component
  useEffect(() => {
    const savedAddressesData = localStorage.getItem('savedAddresses');
    const userLocation = localStorage.getItem('userLocation');
    
    if (savedAddressesData) {
      const addresses = JSON.parse(savedAddressesData);
      setSavedAddresses(addresses);
      
      if (addresses.length > 0) {
        // If there's a userLocation from Home component, find matching address
        if (userLocation) {
          const foundAddress = addresses.find(addr => addr.text === userLocation);
          setSelectedAddress(foundAddress || addresses[0]);
        } else {
          setSelectedAddress(addresses[0]);
          // Sync with Home component
          localStorage.setItem('userLocation', addresses[0].text);
        }
      }
    }
  }, []);

  // Save addresses to localStorage
  useEffect(() => {
    if (savedAddresses.length > 0) {
      localStorage.setItem('savedAddresses', JSON.stringify(savedAddresses));
    }
  }, [savedAddresses]);

  // Body scroll lock for modals
  useEffect(() => {
    const openModals = showAllMenu || showAddressModal || showLanguageDropdown || showCurrencyDropdown || showAccountDropdown || showLanguageModal || showCurrencyModal;
    if (openModals) {
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${getScrollbarWidth()}px`;
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      document.documentElement.style.overflow = '';
    };
  }, [showAllMenu, showAddressModal, showLanguageDropdown, showCurrencyDropdown, showAccountDropdown, showLanguageModal, showCurrencyModal]);

  // Calculate scrollbar width
  const getScrollbarWidth = () => {
    const outer = document.createElement('div');
    outer.style.visibility = 'hidden';
    outer.style.overflow = 'scroll';
    document.body.appendChild(outer);
    const inner = document.createElement('div');
    outer.appendChild(inner);
    const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;
    outer.parentNode.removeChild(outer);
    return scrollbarWidth;
  };

  // Search suggestions
  useEffect(() => {
    if (localSearchQuery.trim().length > 0) {
      const query = localSearchQuery.toLowerCase();
      const matching = popularSearches
        .filter(term => term.toLowerCase().includes(query))
        .slice(0, 8);
      setSearchSuggestions(matching);
      setShowSuggestions(true);
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  }, [localSearchQuery]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) setShowSuggestions(false);
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) setShowCategoryDropdown(false);
      if (addressModalRef.current && !addressModalRef.current.contains(event.target)) setShowAddressModal(false);
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target)) {
        clearTimeout(languageTimeoutRef.current);
        setShowLanguageDropdown(false);
      }
      if (currencyDropdownRef.current && !currencyDropdownRef.current.contains(event.target)) {
        clearTimeout(currencyTimeoutRef.current);
        setShowCurrencyDropdown(false);
      }
      if (accountDropdownRef.current && !accountDropdownRef.current.contains(event.target)) {
        clearTimeout(accountTimeoutRef.current);
        setShowAccountDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Helpers
  const t = (key) => {
    const translation = translations[currentLanguage][key] || translations.en[key];
    // Replace {name} placeholder with actual user name
    if (user && user.user_metadata && translation && translation.includes('{name}')) {
      const firstName = user.user_metadata.first_name || user.email.split('@')[0];
      return translation.replace('{name}', firstName);
    }
    return translation;
  };

  const getCatName = (catId) => {
    const cat = allCategories.find(c => c.id === catId);
    return cat ? (typeof cat.name === 'object' ? cat.name[currentLanguage] : cat.name) : t('all');
  };

  // Menu items - MOVED INSIDE COMPONENT AFTER STATE INITIALIZATION
  const getMenuItems = () => [
     {
    title: { en: "Trending", es: "Tendencias", fr: "Tendances" },
    items: [
      { id: 'home', name: { en: "Home", es: "Inicio", fr: "Accueil" }, icon: User },
      { id: 'best-sellers', name: { en: "Best Sellers", es: "Más Vendidos", fr: "Meilleures ventes" }, icon: Star }
    ]
  },
    {
      title: { en: "Shop By Department", es: "Comprar por Departamento", fr: "Acheter par Département" },
      items: allCategories.filter(cat => cat.id !== 'all').map(cat => ({
        ...cat,
        name: cat.name
      }))
    },
    {
      title: { en: "Computer Services", es: "Servicios de Computadoras", fr: "Services Informatiques" },
      items: [
        { name: { en: "My Computer Configurations", es: "Mis Configuraciones de Computadora", fr: "Mes Configurations d'Ordinateur" }, icon: User },
        { name: { en: "Custom PC Builder", es: "Constructor de PC Personalizado", fr: "Constructeur de PC Personnalisé" }, icon: User },
        { name: { en: "Repair and Warranty", es: "Reparación y Garantía", fr: "Réparation et Garantie" }, icon: User },
        { name: { en: "Tech Support", es: "Soporte Técnico", fr: "Support Technique" }, icon: User },
        { name: { en: "Driver Downloads", es: "Descargas de Controladores", fr: "Téléchargements de Pilotes" }, icon: User },
        { name: { en: "Hardware Upgrades", es: "Actualizaciones de Hardware", fr: "Mises à Niveau Matérielles" }, icon: User }
      ]
    },
    {
      title: { en: "Help & Settings", es: "Ayuda y Configuración", fr: "Aide & Paramètres" },
      items: [
        { name: { en: "Your Account", es: "Tu cuenta", fr: "Votre compte" }, icon: User },
        { name: { en: "Customer Service", es: "Servicio al cliente", fr: "Service client" }, icon: HelpCircle },
        { name: { en: "Contact Us", es: "Contáctanos", fr: "Contactez-nous" }, icon: Mail },
        { name: { en: "Settings", es: "Configuración", fr: "Paramètres" }, icon: Settings }
      ]
    },
    // NEW: Language and Currency Sections
    {
      title: { en: "Language & Currency", es: "Idioma y Moneda", fr: "Langue et Devise" },
      items: [
        { 
          name: { 
            en: `Language: ${languages.find(l => l.code === currentLanguage)?.name}`, 
            es: `Idioma: ${languages.find(l => l.code === currentLanguage)?.name}`,
            fr: `Langue: ${languages.find(l => l.code === currentLanguage)?.name}`
          }, 
          type: 'language',
          icon: Globe
        },
        { 
          name: { 
            en: `Currency: ${currencies.find(c => c.code === currentCurrency)?.name}`, 
            es: `Moneda: ${currencies.find(c => c.code === currentCurrency)?.name}`,
            fr: `Devise: ${currencies.find(c => c.code === currentCurrency)?.name}`
          }, 
          type: 'currency',
          icon: DollarSign
        }
      ]
    }
  ];

  // Handlers - UPDATED TO MATCH HOME.JSX LOGIC
const handleCategoryChange = (categoryId) => {
  console.log('🖱️ Header category clicked:', categoryId);
  
  // ADD SPECIAL HANDLING FOR HOME
  if (categoryId === 'home') {
    handleHomeClick();
    return;
  }
  
  // Check if it's a bundle category
  const bundle = bundleCategories.find(b => b.id === categoryId);
  if (bundle) {
      // Pass array of categories for bundles - EXACTLY like Home.jsx
      setSelectedCategory(bundle.categories);
      console.log('📦 Bundle selected, passing categories:', bundle.categories);
    } else {
      // Pass single category for regular categories
      setSelectedCategory(categoryId);
      console.log('📁 Single category selected:', categoryId);
    }
    
    setCurrentPage('products');
    setShowSuggestions(false);
    setShowCategoryDropdown(false);
    setShowAllMenu(false);
    navigate('/products');
    window.scrollTo(0, 0);
  };
// Welcome Modal Handlers - UPDATED VERSION
const handleWelcomeClose = () => {
  setShowWelcomeModal(false);
  // Don't update localStorage here - we want it to show again after 24 hours
};

const handleBannerClose = () => {
  setShowSignupBanner(false);
  // Banner logic remains the same (shows every time)
};

// "Sign up for free" button - opens Create Account form
const handleSignUpClick = () => {
  setShowWelcomeModal(false);
  setShowSignupBanner(false);
  // Navigate to signin page with signup parameter
  setCurrentPage('signin');
  navigate('/signin?action=signup');
};

// "Sign in" link - opens regular Sign In form
const handleSignInClickFromModal = () => {
  setShowWelcomeModal(false);
  setShowSignupBanner(false);
  // Navigate to signin page without any parameters
  setCurrentPage('signin');
  navigate('/signin');
};
  // ADDED: Handle Home navigation
  const handleHomeClick = () => {
    console.log('🏠 Home tab clicked - navigating to shop homepage');
    setCurrentPage('home');
    setSelectedCategory('all');
    navigate('/home');
    window.scrollTo(0, 0);
  };

  const handleAllMenuClick = (e) => {
    e.stopPropagation();
    setShowAllMenu(!showAllMenu);
    setShowSuggestions(false);
    setShowCategoryDropdown(false);
    setShowLanguageDropdown(false);
    setShowCurrencyDropdown(false);
    setShowAccountDropdown(false);
  };

  const closeAllMenu = () => setShowAllMenu(false);

  const handleSearch = (e) => {
    e.preventDefault();
    const query = localSearchQuery.trim();
    if (query) {
      setSearchQuery(query);
      setCurrentPage('products');
      
      // Handle search category selection - UPDATED TO MATCH HOME.JSX
      if (selectedSearchCategory !== 'all') {
        const bundle = bundleCategories.find(b => b.id === selectedSearchCategory);
        if (bundle) {
          setSelectedCategory(bundle.categories);
        } else {
          setSelectedCategory(selectedSearchCategory);
        }
      } else {
        setSelectedCategory('all');
      }
      
      setShowSuggestions(false);
      navigate('/products');
      window.scrollTo(0, 0);
    }
  };

  const handleKeyPress = (e) => { if (e.key === 'Enter') handleSearch(e); };

  const handleSuggestionClick = (suggestion) => {
    setLocalSearchQuery(suggestion);
    setSearchQuery(suggestion);
    setCurrentPage('products');
    
    // Handle search category selection - UPDATED TO MATCH HOME.JSX
    if (selectedSearchCategory !== 'all') {
      const bundle = bundleCategories.find(b => b.id === selectedSearchCategory);
      if (bundle) {
        setSelectedCategory(bundle.categories);
      } else {
        setSelectedCategory(selectedSearchCategory);
      }
    } else {
      setSelectedCategory('all');
    }
    
    setShowSuggestions(false);
    navigate('/products');
    window.scrollTo(0, 0);
  };

  const clearSearch = () => {
    setLocalSearchQuery('');
    setSearchQuery('');
    setShowSuggestions(false);
  };

  const toggleCategoryDropdown = (e) => {
    e.stopPropagation();
    setShowCategoryDropdown(!showCategoryDropdown);
    setShowSuggestions(false);
    setShowAllMenu(false);
  };

  const handleSearchCategorySelect = (categoryId) => {
    setSelectedSearchCategory(categoryId);
    setShowCategoryDropdown(false);
  };

  const handleMenuCategoryClick = (categoryId) => {
    handleCategoryChange(categoryId);
    setShowAllMenu(false);
  };

  const handleMenuItemClick = (itemNameKey) => {
    const itemName = t(itemNameKey);
    console.log(`Clicked: ${itemName}`);
    setShowAllMenu(false);
    switch (itemNameKey) {
      case 'todayDealsMenu':
        setCurrentPage('products');
        setSelectedCategory('all');
        navigate('/products');
        break;
      case 'bestSellers':
        setCurrentPage('products');
        setSelectedCategory('best-sellers');
        navigate('/products');
        break;
 case 'customerService':
  if (user) {
    setCurrentPage('customer-service');
    navigate('/customer-service');
  } else {
    // Show sign in modal or redirect to signin
    setCurrentPage('signin');
    navigate('/signin?redirect=/customer-service');
  }
  break;
      case 'yourAccount':
      case 'settings':
      case 'myComputerConfigs':
      case 'customPCBuilder':
      case 'repairWarranty':
      case 'techSupport':
      case 'driverDownloads':
      case 'hardwareUpgrades':
        alert(`${t(itemNameKey)} - Coming Soon!`);
        break;
      default:
        break;
    }
  };

  // NEW: Handle menu item clicks for language and currency
  const handleMenuSettingClick = (type) => {
    setShowAllMenu(false);
    if (type === 'language') {
      setShowLanguageModal(true);
    } else if (type === 'currency') {
      setShowCurrencyModal(true);
    }
  };

  // Address Modal - UPDATED TO SYNC WITH HOME COMPONENT
  const openAddressModal = (e) => {
    e.stopPropagation();
    setShowAddressModal(true);
    setShowAllMenu(false);
    setShowSuggestions(false);
    setShowCategoryDropdown(false);
    setShowLanguageDropdown(false);
    setShowCurrencyDropdown(false);
    setShowAccountDropdown(false);
  };

  const closeAddressModal = () => setShowAddressModal(false);

  // Add this function to dispatch location changes
  const dispatchLocationChange = (location) => {
    window.dispatchEvent(new CustomEvent('locationChanged', { 
      detail: { location } 
    }));
  };

  // Update addAddress function
  const addAddress = () => {
    if (addressInput.trim()) {
      const newAddr = {
        id: Date.now(),
        text: addressInput.trim(),
        isDefault: savedAddresses.length === 0
      };
      const updatedAddresses = [...savedAddresses, newAddr];
      setSavedAddresses(updatedAddresses);
      setSelectedAddress(newAddr);
      setAddressInput('');
      
      // Save to localStorage and notify other components
      localStorage.setItem('savedAddresses', JSON.stringify(updatedAddresses));
      localStorage.setItem('userLocation', newAddr.text);
      dispatchLocationChange(newAddr.text);
      
      closeAddressModal();
    }
  };

  // Update selectSavedAddress function
  const selectSavedAddress = (addr) => {
    setSelectedAddress(addr);
    
    // Save to localStorage and notify other components
    localStorage.setItem('userLocation', addr.text);
    dispatchLocationChange(addr.text);
    
    closeAddressModal();
  };

  // Handle location removal
  const removeAddress = (id, e) => {
    e.stopPropagation();
    const updated = savedAddresses.filter(a => a.id !== id);
    setSavedAddresses(updated);
    
    if (selectedAddress?.id === id) {
      const newSelected = updated[0] || null;
      setSelectedAddress(newSelected);
      
      if (newSelected) {
        localStorage.setItem('userLocation', newSelected.text);
        dispatchLocationChange(newSelected.text);
      } else {
        localStorage.removeItem('userLocation');
        dispatchLocationChange('Enter your location');
      }
    }
  };

  // Language Dropdown (Hover + Click) - For both desktop and touch devices
  const handleLanguageMouseEnter = () => {
    if (isMobile) return;
    clearTimeout(languageTimeoutRef.current);
    setShowLanguageDropdown(true);
    setShowAllMenu(false);
    setShowAddressModal(false);
    setShowCurrencyDropdown(false);
    setShowAccountDropdown(false);
  };

  const handleLanguageMouseLeave = () => {
    if (isMobile) return;
    languageTimeoutRef.current = setTimeout(() => {
      setShowLanguageDropdown(false);
    }, 200);
  };

  const handleLanguageItemMouseEnter = () => {
    if (isMobile) return;
    clearTimeout(languageTimeoutRef.current);
  };

  // ADDED: Click handler for language selector
  const handleLanguageClick = (e) => {
    e.stopPropagation();
    if (isMobile) return;
    setShowLanguageDropdown(!showLanguageDropdown);
    setShowCurrencyDropdown(false);
    setShowAccountDropdown(false);
  };

  const changeLanguage = (langCode, e) => {
    if (e) e.stopPropagation();
    setCurrentLanguage(langCode);
    setShowLanguageDropdown(false);
    setShowLanguageModal(false);
  };

  // Currency Dropdown (Hover + Click) - For both desktop and touch devices
  const handleCurrencyMouseEnter = () => {
    if (isMobile) return;
    clearTimeout(currencyTimeoutRef.current);
    setShowCurrencyDropdown(true);
    setShowAllMenu(false);
    setShowAddressModal(false);
    setShowLanguageDropdown(false);
    setShowAccountDropdown(false);
  };

  const handleCurrencyMouseLeave = () => {
    if (isMobile) return;
    currencyTimeoutRef.current = setTimeout(() => {
      setShowCurrencyDropdown(false);
    }, 200);
  };

  const handleCurrencyItemMouseEnter = () => {
    if (isMobile) return;
    clearTimeout(currencyTimeoutRef.current);
  };

  // ADDED: Click handler for currency selector
  const handleCurrencyClick = (e) => {
    e.stopPropagation();
    if (isMobile) return;
    setShowCurrencyDropdown(!showCurrencyDropdown);
    setShowLanguageDropdown(false);
    setShowAccountDropdown(false);
  };

  const changeCurrency = (currencyCode, e) => {
    if (e) e.stopPropagation();
    setCurrentCurrency(currencyCode);
    setShowCurrencyDropdown(false);
    setShowCurrencyModal(false);
    // Dispatch custom event for currency change
    window.dispatchEvent(new CustomEvent('currencyChange', { detail: currencyCode }));
  };

  // Account Dropdown (Hover + Click) - For both desktop and touch devices
  const handleAccountMouseEnter = () => {
    if (isMobile) return;
    clearTimeout(accountTimeoutRef.current);
    setShowAccountDropdown(true);
    setShowAllMenu(false);
    setShowAddressModal(false);
    setShowLanguageDropdown(false);
    setShowCurrencyDropdown(false);
  };

  const handleAccountMouseLeave = () => {
    if (isMobile) return;
    accountTimeoutRef.current = setTimeout(() => {
      setShowAccountDropdown(false);
    }, 200);
  };

  const handleAccountItemMouseEnter = () => {
    if (isMobile) return;
    clearTimeout(accountTimeoutRef.current);
  };

  // ADDED: Click handler for account dropdown
  const handleAccountClick = (e) => {
    e.stopPropagation();
    if (isMobile) return;
    setShowAccountDropdown(!showAccountDropdown);
    setShowLanguageDropdown(false);
    setShowCurrencyDropdown(false);
  };

// Navigation to SignIn page (from account dropdown, etc.)
const handleSignInClick = (e) => {
  e?.stopPropagation();
  console.log('Navigating to SignIn page - regular sign in');
  setCurrentPage('signin');
  navigate('/signin'); // No parameters = regular sign in form
  setShowAccountDropdown(false);
};
  // Navigation to SignIn page for Returns & Orders
  const handleReturnsClick = () => {
    console.log('Navigating to SignIn page for Returns & Orders');
    setCurrentPage('signin');
    navigate('/signin');
  };

  // Handle sign out
  const handleSignOutClick = (e) => {
  e.stopPropagation();
  onSignOut();
  setShowAccountDropdown(false);
  // CHANGED: Navigate to portal after sign out
  navigate('/');
};

  // Mobile handlers
  const handleMobileMenuClick = (e) => {
    e.stopPropagation();
    setShowAllMenu(true);
  };

// Add this state to your Header component
const [showAccountPage, setShowAccountPage] = useState(false);

const handleMobileAccountClick = (e) => {
  e.stopPropagation();
  setShowAccountPage(true);
};

  const handleMobileCartClick = (e) => {
    e.stopPropagation();
    onCartClick();
  };

  const handleLogoClick = () => {
    navigate('/');
    setCurrentPage('portal');
    setSelectedCategory('all');
    clearSearch();
  };

  // Get menu items - this function is called in render
  const menuItems = getMenuItems();

  return (
    <>
      <style jsx global>{`
        /* === HEADER SCROLL BEHAVIOR === */
        .amazon-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          width: 100%;
          transition: transform 0.3s ease-in-out;
          will-change: transform;
          touch-action: none;
          -webkit-transform: translateZ(0);
          transform: translateZ(0);
          height: auto;
          
        }

        .amazon-header.hidden {
          transform: translateY(-100%);
        }

        .amazon-header.visible {
          transform: translateY(0);
        }

        /* Prevent content overlap */
        body {
          padding-top: 140px;
        }

        @media (max-width: 768px) {
          .amazon-header {
            min-height: 120px;
          }
          body {
            padding-top: 120px;
          }
        }

        .amazon-header * {
          -webkit-tap-highlight-color: transparent;
          touch-action: pan-y;
          box-sizing: border-box;
        }

        .amazon-header a,
        .amazon-header button,
        .amazon-header div[role="button"],
        .amazon-header .nav-delivery,
        .amazon-header .language-selector,
        .amazon-header .currency-selector,
        .amazon-header .nav-all,
        .amazon-header .nav-cart,
        .amazon-header .nav-account,
        .amazon-header .nav-returns {
          -webkit-appearance: none;
          outline: none;
          user-select: none;
          pointer-events: auto;
        }

        /* === MOBILE LAYOUT === */
        .mobile-top-row {
          display: none;
          align-items: center;
          justify-content: space-between;
          padding: 8px 10px;
          background: var(--amazon-primary);
          height: 50px;
        }

        .mobile-brand {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .mobile-menu-btn {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          padding: 8px;
          border-radius: 3px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .mobile-menu-btn:active {
          background: rgba(255, 255, 255, 0.1);
        }

        .mobile-logo {
          font-size: 18px;
          font-weight: bold;
          color: white;
          font-family: "Amazon Ember", Arial, sans-serif;
          text-decoration: none;
          cursor: pointer;
        }

        .mobile-logo:active {
          opacity: 0.8;
        }

        .mobile-right {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .mobile-account,
        .mobile-cart {
          display: flex;
          flex-direction: column;
          align-items: center;
          color: white;
          font-size: 12px;
          cursor: pointer;
          background: none;
          border: none;
          padding: 6px;
          border-radius: 3px;
        }

        .mobile-account:active,
        .mobile-cart:active {
          background: rgba(255, 255, 255, 0.1);
        }

        .mobile-cart {
          position: relative;
        }

        .mobile-cart-count {
          position: absolute;
          top: 0;
          right: -5px;
          background: var(--amazon-orange);
          color: var(--amazon-primary);
          border-radius: 50%;
          width: 18px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: bold;
        }

        /* === DESKTOP NAV BELT === */
        .nav-belt {
          display: flex;
          align-items: center;
          padding: 8px 10px;
          height: 60px;
          background: var(--amazon-primary);
          gap: 15px;
        }

        .nav-left {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .logo-link {
          padding: 5px 8px;
          border-radius: 2px;
          margin-right: 10px;
          text-decoration: none;
          cursor: pointer;
        }

        .logo-link:hover {
          outline: 1px solid white;
        }

        .logo {
          font-size: 24px;
          font-weight: bold;
          color: white;
          font-family: "Amazon Ember", Arial, sans-serif;
        }

        .nav-delivery {
          padding: 5px 8px;
          border-radius: 2px;
          margin-right: 10px;
          cursor: pointer;
        }

        .nav-delivery:hover {
          outline: 1px solid white;
        }

        .delivery-text {
          display: flex;
          flex-direction: column;
          margin-left: 5px;
        }

        .delivery-to {
          font-size: 12px;
          color: #cccccc;
        }

        .delivery-location {
          font-size: 14px;
          font-weight: bold;
        }

        /* === SEARCH BAR === */
        .nav-search {
          display: flex;
          flex: 1;
          max-width: 800px;
          height: 40px;
        }

        .mobile-search {
          display: none;
          padding: 8px 10px;
          background: var(--amazon-primary);
        }

        .mobile-search .nav-search {
          width: 100%;
          max-width: 100%;
        }

        .search-category-dropdown {
          background: #f3f3f3;
          border-top-left-radius: 4px;
          border-bottom-left-radius: 4px;
          padding: 10px;
          font-size: 12px;
          color: #0f1111;
          cursor: pointer;
          position: relative;
          min-width: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .search-category-dropdown:hover {
          background: #ccc;
        }

        .search-input {
          flex: 1;
          padding: 10px;
          border: none;
          font-size: 15px;
          outline: none;
          color: #0f1111;
        }

        .search-icon-container {
          background: #febd69;
          border-top-right-radius: 4px;
          border-bottom-right-radius: 4px;
          width: 45px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .search-icon-container:hover {
          background: #f7a24c;
        }

        .search-icon {
          color: #0f1111;
        }

        .search-suggestions {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: white;
          border: 1px solid #ddd;
          border-top: none;
          border-bottom-left-radius: 4px;
          border-bottom-right-radius: 4px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          z-index: 999;
          padding-top: 5px;
        }

        .suggestion-item {
          padding: 8px 15px;
          cursor: pointer;
          font-size: 14px;
          color: #0f1111;
        }

        .suggestion-item:hover {
          background: #f0f0f0;
        }

        .popular-searches-title {
          padding: 5px 15px;
          font-size: 12px;
          color: #555;
          font-weight: 700;
          border-bottom: 1px solid #eee;
        }

        .search-clear-btn {
          background: none;
          border: none;
          color: #007185;
          cursor: pointer;
          font-size: 13px;
          padding: 5px 15px 10px;
          text-align: right;
          width: 100%;
        }

        .search-clear-btn:hover {
          text-decoration: underline;
        }

        /* === LANGUAGE SELECTOR === */
        .language-selector {
          position: relative;
          padding: 5px 8px;
          width: 55px;
          min-width: 55px;
          flex-shrink: 0;
          border-radius: 2px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          background: rgba(255, 255, 255, 0.15);
          color: white;
          white-space: nowrap;
        }

        .language-selector:hover {
          background: rgba(255, 255, 255, 0.25);
          outline: 1px solid rgba(255, 255, 255, 0.5);
        }

        .language-flag {
          font-size: 16px;
          font-weight: bold;
        }

        .language-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          background: #232f3e;
          border: 1px solid #444;
          border-radius: 4px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          z-index: 1001;
          min-width: 160px;
          margin-top: 2px;
          overflow: hidden;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.2s ease, visibility 0.2s ease;
        }

        .language-selector:hover .language-dropdown,
        .language-dropdown:hover {
          opacity: 1;
          visibility: visible;
        }

        .language-item {
          padding: 10px 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: white;
          transition: background 0.2s ease;
        }

        .language-item:hover {
          background: #37475a;
        }

        .language-item.selected {
          background: #febd69;
          color: #131921;
          font-weight: 600;
        }

        /* === CURRENCY SELECTOR === */
        .currency-selector {
          position: relative;
          padding: 5px 8px;
          width: 60px;
          min-width: 60px;
          flex-shrink: 0;
          border-radius: 2px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          background: rgba(255, 255, 255, 0.15);
          color: white;
          white-space: nowrap;
        }

        .currency-selector:hover {
          background: rgba(255, 255, 255, 0.25);
          outline: 1px solid rgba(255, 255, 255, 0.5);
        }

        .currency-symbol {
          font-size: 14px;
          font-weight: bold;
        }

        .currency-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          background: #232f3e;
          border: 1px solid #444;
          border-radius: 4px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          z-index: 1001;
          min-width: 180px;
          margin-top: 2px;
          overflow: hidden;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.2s ease, visibility 0.2s ease;
        }

        .currency-selector:hover .currency-dropdown,
        .currency-dropdown:hover {
          opacity: 1;
          visibility: visible;
        }

        .currency-item {
          padding: 10px 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: white;
          transition: background 0.2s ease;
        }

        .currency-item:hover {
          background: #37475a;
        }

        .currency-item.selected {
          background: #febd69;
          color: #131921;
          font-weight: 600;
        }

        /* === ACCOUNT DROPDOWN === */
        .nav-account {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          width: 130px;
          min-width: 130px;
          flex-shrink: 0;
          cursor: pointer;
          font-weight: 700;
          line-height: 1.2;
          padding: 4px 8px;
          border-radius: 2px;
        }

        .nav-account:hover {
          outline: 1px solid rgba(255,255,255,0.6);
        }

        .nav-account .nav-line1,
        .nav-account .nav-line2 {
          font-size: 13px;
          font-weight: 700;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
        }

        .account-dropdown {
          position: absolute;
          top: 100%;
          right: -80px;
          background: white;
          border: 1px solid #ddd;
          border-radius: 4px;
          box-shadow: 0 6px 12px rgba(0,0,0,0.15);
          z-index: 1001;
          width: 500px;
          margin-top: 2px;
          overflow: hidden;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.2s ease, visibility 0.2s ease;
        }

        .nav-account:hover .account-dropdown,
        .account-dropdown:hover {
          opacity: 1;
          visibility: visible;
        }

        .account-signin-section {
          padding: 16px;
          text-align: center;
          border-bottom: 1px solid #eee;
        }

        .account-signin-btn {
          background: #ffd814;
          color: #0f1111;
          border: none;
          border-radius: 8px;
          padding: 8px 24px;
          font-weight: 700;
          font-size: 13px;
          cursor: pointer;
          width: 100%;
          margin-bottom: 8px;
        }

        .account-signin-btn:hover {
          background: #f7ca00;
        }

        .account-new-customer {
          font-size: 13px;
          color: #0f1111;
        }

        .account-new-customer a {
          color: #007185;
          text-decoration: none;
          cursor: pointer;
        }

        .account-new-customer a:hover {
          text-decoration: underline;
          color: #c7511f;
        }

        .account-columns {
          display: flex;
          border-top: 1px solid #eee;
        }

        .account-column {
          flex: 1;
          padding: 16px;
          border-right: 1px solid #ddd;
        }

        .account-column:last-child {
          border-right: none;
        }

        .account-column-title {
          font-weight: 700;
          font-size: 13px;
          marginBottom: 8px;
          color: #0f1111;
        }

        .account-column-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .account-column-item {
          margin-bottom: 6px;
        }

        .account-column-item a {
          color: #007185;
          font-size: 13px;
          text-decoration: none;
          display: block;
        }

        .account-column-item a:hover {
          text-decoration: underline;
          color: #c7511f;
        }

        /* Sign Out Button */
        .sign-out-btn {
          background: #ffd814;
          color: #0f1111;
          border: none;
          border-radius: 8px;
          padding: 8px 16px;
          font-weight: 700;
          font-size: 13px;
          cursor: pointer;
          width: 100%;
          margin: 10px 0;
        }

        .sign-out-btn:hover {
          background: #f7ca00;
        }

        /* === NAV RIGHT === */
        .nav-right {
          display: flex;
          align-items: center;
          gap: 5px;
          flex-shrink: 0;
          flex-wrap: nowrap;
        }

        /* === NAV RETURNS AND CART === */
        .nav-returns {
          padding: 4px 8px;
          width: 70px;
          min-width: 70px;
          flex-shrink: 0;
          border-radius: 2px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          font-weight: 700;
          line-height: 1.2;
        }

        .nav-returns:hover {
          outline: 1px solid rgba(255,255,255,0.6);
        }

        .nav-cart {
          padding: 5px 8px;
          width: 80px;
          min-width: 80px;
          flex-shrink: 0;
          border-radius: 2px;
          position: relative;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .nav-cart:hover {
          outline: 1px solid white;
        }

        /* UPDATED: Desktop cart count with circle background */
        .cart-count {
          position: absolute;
          top: 2px;
          left: 20px;
          background: var(--amazon-orange);
          color: var(--amazon-primary);
          border-radius: 50%;
          width: 18px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: bold;
        }

        /* === CATEGORY DROPDOWN === */
        .category-dropdown-menu {
          position: absolute;
          top: 100%;
          left: 0;
          background: #fff;
          border: 1px solid #ddd;
          border-radius: 4px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          z-index: 1001;
          min-width: 160px;
          margin-top: 2px;
          overflow: hidden;
        }

        .category-dropdown-item {
          padding: 10px 12px;
          cursor: pointer;
          font-size: 14px;
          color: #0f1111;
          transition: background 0.2s ease;
        }

        .category-dropdown-item:hover {
          background: #f7f7f7;
        }

        .category-dropdown-item.selected {
          background: #febd69;
          font-weight: 600;
        }

        .bundle-indicator {
          font-size: 10px;
          color: #007185;
          margin-left: 5px;
          font-weight: normal;
        }

        /* === OTHER STYLES === */
        :root {
          --amazon-primary: #131921;
          --amazon-secondary: #232f3e;
          --amazon-orange: #febd69;
          --amazon-text-light: white;
        }

        /* SECONDARY NAV BAR */
        .nav-sub-bar {
          display: flex;
          align-items: center;
          height: 38px;
          background: var(--amazon-secondary);
          padding: 0 10px;
          font-size: 14px;
          color: white;
        }

        .nav-all {
          display: flex;
          align-items: center;
          gap: 5px;
          font-weight: 700;
          padding: 8px 9px;
          border-radius: 2px;
          cursor: pointer;
        }

        .nav-all:hover {
          outline: 1px solid white;
        }

        .nav-sub-item {
          padding: 8px 9px;
          border-radius: 2px;
          cursor: pointer;
          white-space: nowrap;
        }

        .nav-sub-item:hover {
          outline: 2px solid white;
          outline-offset: -2px;
        }

        .nav-sub-links {
          display: flex;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          gap: 10px;
        }

        .nav-sub-links::-webkit-scrollbar {
          display: none;
        }

        /* ALL MENU OVERLAY */
        .all-menu-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          z-index: 1050;
          display: flex;
          transition: opacity 0.3s ease;
        }

        .all-menu-sidebar {
          width: 365px;
          max-width: 100%;
          background: white;
          height: 100%;
          overflow-y: auto;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
          transform: translateX(-100%);
          transition: transform 0.3s ease;
        }

        .all-menu-overlay.open .all-menu-sidebar {
          transform: translateX(0);
        }

        .all-menu-header {
          background: #232f3e;
          color: white;
          padding: 10px 20px;
          font-size: 20px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        /* UPDATED: X button inside menu header for small screens */
        .all-menu-close {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          z-index: 1060;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
          border-radius: 3px;
        }

        .all-menu-close:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        /* UPDATED: External close button positioning - fixed on bigger screens */
        .all-menu-close.external {
          position: fixed;
          top: 10px;
          left: 375px;
          background: rgba(0, 0, 0, 0.7);
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* UPDATED: Hide internal close button on bigger screens, show on small screens */
        @media (max-width: 500px) {
          .all-menu-close.external {
            display: none;
          }
          .all-menu-close.internal {
            display: flex;
          }
        }

        /* UPDATED: Hide internal close button on larger screens */
        @media (min-width: 501px) {
          .all-menu-close.internal {
            display: none;
          }
        }

        .all-menu-section {
          padding: 15px 0;
          border-bottom: 1px solid #ddd;
        }

        .all-menu-section-title {
          font-size: 18px;
          font-weight: 700;
          color: #0f1111;
          padding: 0 20px 5px;
        }

        .all-menu-item {
          padding: 10px 20px;
          font-size: 14px;
          color: #0f1111;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .all-menu-item:hover {
          background: #f0f0f0;
        }

        /* NEW: Settings item with special styling */
        .settings-menu-item {
          padding: 12px 20px;
          font-size: 14px;
          color: #0f1111;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #f0f0f0;
        }

        .settings-menu-item:hover {
          background: #f8f8f8;
        }

        .settings-menu-item:last-child {
          border-bottom: none;
        }

        .settings-item-content {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
        }

        .settings-item-icon {
          color: #666;
        }

        .settings-item-text {
          display: flex;
          flex-direction: column;
        }

        .settings-item-main {
          font-weight: 500;
          color: #0f1111;
        }

        .settings-item-sub {
          font-size: 12px;
          color: #666;
          margin-top: 2px;
        }
          /* Combined Logo with Text Styles */
.logo-link {
  padding: 5px 8px;
  border-radius: 2px;
  margin-right: 10px;
  text-decoration: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  height: 40px;
}

.logo-image {
  height: 28px; /* Reduced size */
  width: auto;
  object-fit: contain;
}

.logo-text {
  font-size: 18px; /* Slightly smaller text */
  font-weight: bold;
  color: white;
  font-family: "Amazon Ember", Arial, sans-serif;
  white-space: nowrap;
}

/* Mobile combined logo */
.mobile-logo {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 100%;
}

.mobile-logo-image {
  height: 22px; /* Reduced size for mobile */
  width: auto;
  object-fit: contain;
  
}

.mobile-logo-text {
  font-size: 16px; /* Smaller for mobile */
  font-weight: bold;
  color: white;
  font-family: "Amazon Ember", Arial, sans-serif;
  white-space: nowrap;
}

/* Ensure proper hover states */
.logo-link:hover {
  outline: 1px solid white;
}

.logo-link:hover .logo-image,
.mobile-logo:hover .mobile-logo-image {
  opacity: 0.9;
}

        /* NEW: Language and Currency Modals */
        .settings-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 1050;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .settings-modal-content {
          background: white;
          padding: 20px;
          border-radius: 8px;
          width: 400px;
          max-width: 90%;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          position: relative;
        }

        .settings-modal-close {
          position: absolute;
          top: 10px;
          right: 10px;
          background: none;
          border: none;
          cursor: pointer;
          color: #666;
        }

        .settings-modal-title {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 20px;
          color: #0F1111;
        }

        .settings-option-list {
          max-height: 300px;
          overflow-y: auto;
        }

        .settings-option-item {
          padding: 12px 15px;
          border: 1px solid #ddd;
          border-radius: 4px;
          margin-bottom: 10px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 14px;
          transition: all 0.2s ease;
        }

        .settings-option-item:hover {
          border-color: #f7a24c;
          background: #fffaf4;
        }

        .settings-option-item.selected {
          border-color: #f7a24c;
          background: #fffaf4;
          font-weight: 600;
        }

        .settings-option-flag {
          font-size: 18px;
        }

        .settings-option-details {
          display: flex;
          flex-direction: column;
        }

        .settings-option-name {
          font-weight: 500;
          color: #0f1111;
        }

        .settings-option-code {
          font-size: 12px;
          color: #666;
          margin-top: 2px;
        }

        /* ADDRESS MODAL */
        .address-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 1050;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .address-modal-content {
          background: white;
          padding: 20px;
          border-radius: 8px;
          width: 400px;
          max-width: 90%;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          position: relative;
        }

        .address-modal-close {
          position: absolute;
          top: 10px;
          right: 10px;
          background: none;
          border: none;
          cursor: pointer;
        }

        .address-input-group {
          margin-bottom: 15px;
          display: flex;
          gap: 10px;
        }

        .address-input-group input {
          flex: 1;
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 4px;
        }

        .address-input-group button {
          background: #ffd814;
          border: none;
          padding: 10px 15px;
          border-radius: 4px;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
        }

        .address-list {
          max-height: 200px;
          overflow-y: auto;
          border-top: 1px solid #eee;
          padding-top: 10px;
        }

        .address-item {
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          margin-bottom: 10px;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 14px;
        }

        .address-item.selected {
          border-color: #f7a24c;
          background: #fffaf4;
        }

        .address-remove-btn {
          color: #c45500;
          cursor: pointer;
          font-size: 12px;
          margin-left: 10px;
        }

        .address-item-details {
          display: flex;
          flex-direction: column;
        }

        .address-default-badge {
          font-size: 10px;
          font-weight: bold;
          color: #007185;
        }

        /* === RESPONSIVE DESIGN === */
        @media (max-width: 1000px) {
          .nav-delivery, .language-selector, .currency-selector, .nav-returns {
            display: none;
          }
          .nav-belt {
            gap: 10px;
          }
          .nav-account {
            width: auto;
            min-width: auto;
          }
        }

        @media (max-width: 768px) {
          /* Show mobile layout */
          .mobile-top-row {
            display: flex;
          }

          .mobile-search {
            display: block;
          }

          /* Hide desktop elements */
          .nav-belt {
            display: none;
          }

          .nav-sub-bar {
            display: none;
          }

          /* Adjust body padding for mobile */
          body {
            padding-top: 120px;
          }

          .amazon-header {
            min-height: 120px;
          }

          /* Mobile search adjustments */
          .mobile-search .nav-search {
            max-width: 100%;
            height: 36px;
          }

          /* Hide category dropdown on mobile search */
          .mobile-search .search-category-dropdown {
            display: none;
          }

          /* Disable hover effects on mobile */
          .language-selector:hover .language-dropdown,
          .currency-selector:hover .currency-dropdown,
          .nav-account:hover .account-dropdown {
            opacity: 0;
            visibility: hidden;
          }

          .language-selector:hover,
          .currency-selector:hover,
          .nav-account:hover,
          .nav-returns:hover,
          .nav-cart:hover,
          .logo-link:hover,
          .nav-delivery:hover,
          .nav-all:hover,
          .nav-sub-item:hover {
            outline: none;
          }
        }

        @media (max-width: 480px) {
          .mobile-logo {
            font-size: 16px;
          }
          
          .mobile-right {
            gap: 10px;
          }
          
          .mobile-account, .mobile-cart {
            font-size: 10px;
          }
        }
      `}</style>

      <header ref={headerRef} className={`amazon-header ${isHeaderHidden ? 'hidden' : 'visible'}`}>
        {/* Mobile Top Row - Brand, Menu, Account, Cart */}
        {isMobile && (
          <>
            <div className="mobile-top-row">
              <div className="mobile-brand">
                <button className="mobile-menu-btn" onClick={handleMobileMenuClick}>
                  <Menu size={20} />
                </button>
                <div className="mobile-logo" onClick={handleLogoClick}>
  
                  <span className="mobile-logo-text">ROBERT & IZAK</span>
                  <img src="/LOGO.png" alt="Robert & Izak" className="mobile-logo-image" />
</div>
              </div>
              
              <div className="mobile-right">
                <button className="mobile-account" onClick={handleMobileAccountClick}>
                  <User size={20} />
                  <span>{user ? 'Account' : 'Sign In'}</span>
                </button>
                
                <button className="mobile-cart" onClick={handleMobileCartClick}>
                  <ShoppingCart size={20} />
                  <span>Cart</span>
                  <span className="mobile-cart-count">{cartItemCount}</span>
                </button>
              </div>
            </div>

            {/* Mobile Search Bar - Simplified without category dropdown */}
            <div className="mobile-search">
              <div className="nav-search" ref={searchRef}>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search products..."
                  value={localSearchQuery}
                  onChange={(e) => setLocalSearchQuery(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  onKeyPress={handleKeyPress}
                />
                <div className="search-icon-container" onClick={handleSearch}>
                  <Search size={20} className="search-icon" />
                </div>

                {showSuggestions && (localSearchQuery.trim().length > 0 || searchSuggestions.length > 0) && (
                  <div className="search-suggestions">
                    {localSearchQuery.trim().length > 0 && (
                      <div
                        className="suggestion-item"
                        onClick={() => handleSuggestionClick(localSearchQuery)}
                      >
                        <Search size={16} style={{ marginRight: '8px', color: '#555' }} />
                        <strong>{localSearchQuery}</strong>
                      </div>
                    )}
                    {searchSuggestions.length > 0 && (
                      <>
                        <div className="popular-searches-title">Popular searches</div>
                        {searchSuggestions.map((suggestion) => (
                          <div
                            key={suggestion}
                            className="suggestion-item"
                            onClick={() => handleSuggestionClick(suggestion)}
                          >
                            {suggestion}
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Desktop Navigation - Full features with hover effects */}
        {!isMobile && (
          <>
            <div className="nav-belt">
              <div className="nav-left">
                {/* Logo */}
               {/* Logo */}
<div className="logo-link" onClick={handleLogoClick}>
  
                  <span className="logo-text">{t('logo')}</span>
                  <img src="/LOGO.png" alt="Robert & Izak Computers" className="logo-image" />
</div>

                {/* Delivery Address */}
                <div className="nav-delivery" onClick={openAddressModal}>
                  <MapPin size={18} />
                  <div className="delivery-text">
                    <span className="delivery-to">{t('deliverTo')}</span>
                    <span className="delivery-location">
                      {selectedAddress ? selectedAddress.text.split(',')[0].trim() : t('selectAddress')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Search Bar with Category Dropdown */}
              <div className="nav-search" ref={searchRef}>
                <div
                  className="search-category-dropdown"
                  onClick={toggleCategoryDropdown}
                  ref={categoryDropdownRef}
                >
                  <span>{getCatName(selectedSearchCategory)}</span>
                  <ChevronDown size={16} />
                  {showCategoryDropdown && (
                    <div className="category-dropdown-menu">
                      {allCategories.map((cat) => (
                        <div
                          key={cat.id}
                          className={`category-dropdown-item ${cat.id === selectedSearchCategory ? 'selected' : ''}`}
                          onClick={(e) => { e.stopPropagation(); handleSearchCategorySelect(cat.id); }}
                        >
                          {typeof cat.name === 'object' ? cat.name[currentLanguage] : cat.name}
                          {bundleCategories.find(b => b.id === cat.id) && <span className="bundle-indicator">(Bundle)</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <input
                  type="text"
                  className="search-input"
                  placeholder={t('searchPlaceholder')}
                  value={localSearchQuery}
                  onChange={(e) => setLocalSearchQuery(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  onKeyPress={handleKeyPress}
                />
                <div className="search-icon-container" onClick={handleSearch}>
                  <Search size={20} className="search-icon" />
                </div>

                {showSuggestions && (localSearchQuery.trim().length > 0 || searchSuggestions.length > 0) && (
                  <div className="search-suggestions">
                    {localSearchQuery.trim().length > 0 && (
                      <div
                        className="suggestion-item"
                        onClick={() => handleSuggestionClick(localSearchQuery)}
                      >
                        <Search size={16} style={{ marginRight: '8px', color: '#555' }} />
                        <strong>{localSearchQuery}</strong> in {getCatName(selectedSearchCategory)}
                      </div>
                    )}
                    {searchSuggestions.length > 0 && (
                      <>
                        <div className="popular-searches-title">{t('popularSearches')}</div>
                        {searchSuggestions.map((suggestion) => (
                          <div
                            key={suggestion}
                            className="suggestion-item"
                            onClick={() => handleSuggestionClick(suggestion)}
                          >
                            {suggestion}
                          </div>
                        ))}
                      </>
                    )}
                    <button className="search-clear-btn" onClick={clearSearch}>
                      {t('clearSearch')}
                    </button>
                  </div>
                )}
              </div>

              {/* Right Navigation with Hover Effects */}
              <div className="nav-right">
                {/* Currency Selector (Hover + Click enabled) */}
                <div
                  className="currency-selector"
                  onMouseEnter={handleCurrencyMouseEnter}
                  onMouseLeave={handleCurrencyMouseLeave}
                  onClick={handleCurrencyClick}
                  ref={currencyDropdownRef}
                >
                  <span className="currency-symbol">{currencies.find(c => c.code === currentCurrency)?.symbol}</span>
                  <ChevronDown size={14} style={{ color: '#aaa' }} />
                  {showCurrencyDropdown && (
                    <div className="currency-dropdown" onMouseEnter={handleCurrencyItemMouseEnter}>
                      {currencies.map((currency) => (
                        <div
                          key={currency.code}
                          className={`currency-item ${currency.code === currentCurrency ? 'selected' : ''}`}
                          onClick={(e) => changeCurrency(currency.code, e)}
                        >
                          <DollarSign size={16} />
                          {currency.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Language Selector (Hover + Click enabled) */}
                <div
                  className="language-selector"
                  onMouseEnter={handleLanguageMouseEnter}
                  onMouseLeave={handleLanguageMouseLeave}
                  onClick={handleLanguageClick}
                  ref={languageDropdownRef}
                >
                  <span className="language-flag">{languages.find(l => l.code === currentLanguage)?.flag}</span>
                  <ChevronDown size={14} style={{ color: '#aaa' }} />
                  {showLanguageDropdown && (
                    <div className="language-dropdown" onMouseEnter={handleLanguageItemMouseEnter}>
                      {languages.map((lang) => (
                        <div
                          key={lang.code}
                          className={`language-item ${lang.code === currentLanguage ? 'selected' : ''}`}
                          onClick={(e) => changeLanguage(lang.code, e)}
                        >
                          <span style={{ fontSize: '18px' }}>{lang.flag}</span>
                          {lang.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Account & Lists (Hover + Click enabled) */}
                <div
                  className="nav-account"
                  onMouseEnter={handleAccountMouseEnter}
                  onMouseLeave={handleAccountMouseLeave}
                  onClick={handleAccountClick}
                  ref={accountDropdownRef}
                >
                  <span className="nav-line1">
                    {user ? t('helloUser') : t('helloSignIn')}
                  </span>
                  <span className="nav-line2">{t('accountLists')} <ChevronDown size={14} style={{ marginLeft: '2px' }} /></span>
                  {showAccountDropdown && (
                    <div className="account-dropdown" onMouseEnter={handleAccountItemMouseEnter}>
                      {user ? (
                        <>
                          {/* Signed In User Section */}
                          <div className="account-signin-section">
                            <div style={{ textAlign: 'left', marginBottom: '15px' }}>
                              <strong style={{ fontSize: '16px' }}>
                                Hello, {user.user_metadata?.first_name || user.email.split('@')[0]}
                              </strong>
                              <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#666' }}>
                                {user.email}
                              </p>
                            </div>
                            <button className="sign-out-btn" onClick={handleSignOutClick}>
                              {t('signOut')}
                            </button>
                          </div>

                          {/* User Menu Columns */}
                          <div className="account-columns">
                            <div className="account-column">
                              <div className="account-column-title">{t('yourLists')}</div>
                              <ul className="account-column-list">
                                <li className="account-column-item"><a onClick={() => alert('Create List - Coming Soon!')}>{t('createList')}</a></li>
                                <li className="account-column-item"><a onClick={() => alert('Find List - Coming Soon!')}>{t('findList')}</a></li>
                              </ul>
                            </div>
                            <div className="account-column">
                              <div className="account-column-title">{t('yourAccount')}</div>
                              <ul className="account-column-list">
                                <li className="account-column-item"><a onClick={() => alert('Account - Coming Soon!')}>{t('account')}</a></li>
                                <li className="account-column-item"><a onClick={() => alert('Orders - Coming Soon!')}>{t('orders')}</a></li>
                                <li className="account-column-item"><a onClick={() => alert('Recommendations - Coming Soon!')}>{t('recommendations')}</a></li>
                                <li className="account-column-item"><a onClick={() => alert('Browsing History - Coming Soon!')}>{t('browsingHistory')}</a></li>
                                <li className="account-column-item"><a onClick={() => alert('Shopping Preferences - Coming Soon!')}>{t('shoppingPreferences')}</a></li>
                                <li className="account-column-item"><a onClick={() => alert('Contact Us - Coming Soon!')}>{t('contactUs')}</a></li>
                              </ul>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          {/* Sign In Section for non-logged in users */}
                          <div className="account-signin-section">
                            <button className="account-signin-btn" onClick={handleSignInClick}>
                              {t('signIn')}
                            </button>
                            <div className="account-new-customer">
                              {t('newCustomer')} <a onClick={handleSignInClick}>{t('startHere')}</a>
                            </div>
                          </div>

                          {/* Columns for non-logged in users */}
                          <div className="account-columns">
                            <div className="account-column">
                              <div className="account-column-title">{t('yourLists')}</div>
                              <ul className="account-column-list">
                                <li className="account-column-item"><a onClick={handleSignInClick}>{t('createList')}</a></li>
                                <li className="account-column-item"><a onClick={handleSignInClick}>{t('findList')}</a></li>
                              </ul>
                            </div>
                            <div className="account-column">
                              <div className="account-column-title">{t('yourAccount')}</div>
                              <ul className="account-column-list">
                                <li className="account-column-item"><a onClick={handleSignInClick}>{t('account')}</a></li>
                                <li className="account-column-item"><a onClick={handleSignInClick}>{t('orders')}</a></li>
                                <li className="account-column-item"><a onClick={handleSignInClick}>{t('recommendations')}</a></li>
                                <li className="account-column-item"><a onClick={handleSignInClick}>{t('browsingHistory')}</a></li>
                                <li className="account-column-item"><a onClick={handleSignInClick}>{t('shoppingPreferences')}</a></li>
                                <li className="account-column-item"><a onClick={handleSignInClick}>{t('contactUs')}</a></li>
                              </ul>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Returns & Orders */}
                <div className="nav-returns" onClick={user ? () => alert('Returns & Orders - Coming Soon!') : handleReturnsClick}>
                  <span className="nav-line1">{t('returns')}</span>
                  <span className="nav-line2">{t('orders')}</span>
                </div>

                {/* Cart */}
                <div className="nav-cart" onClick={onCartClick}>
                  <span className="cart-count">{cartItemCount}</span>
                  <ShoppingCart size={32} />
                  <span className="nav-line2">{t('cart')}</span>
                </div>
              </div>
            </div>

            {/* Secondary Navigation Bar */}
            <div className="nav-sub-bar">
              <div className="nav-all" onClick={handleAllMenuClick}>
                <Menu size={20} />
                {t('all')}
              </div>
              <div className="nav-sub-links">
                {/* ADDED: Home Tab */}
                <div className="nav-sub-item" onClick={handleHomeClick}>
                  {t('home')}
                </div>
                <div className="nav-sub-item" onClick={() => handleMenuItemClick('todayDealsMenu')}>{t('todayDeals')}</div>
                <div className="nav-sub-item" onClick={() => handleMenuItemClick('customerService')}>{t('customerService')}</div>
                <div className="nav-sub-item" onClick={() => handleMenuCategoryClick('laptops-bundle')}>{t('laptops')}</div>
                <div className="nav-sub-item" onClick={() => handleMenuCategoryClick('gaming-bundle')}>{t('gaming')}</div>
                <div className="nav-sub-item" onClick={() => handleMenuCategoryClick('monitors-bundle')}>{t('monitors')}</div>
                <div className="nav-sub-item" onClick={() => handleMenuCategoryClick('accessories-bundle')}>{t('accessories')}</div>
                <div className="nav-sub-item" onClick={() => handleMenuCategoryClick('components-bundle')}>{t('pcComponents')}</div>
                <div className="nav-sub-item" onClick={() => handleMenuCategoryClick('networking-bundle')}>{t('networking')}</div>
                <div className="nav-sub-item" onClick={() => handleMenuCategoryClick('storage-bundle')}>{t('storage')}</div>
                <div className="nav-sub-item" onClick={() => handleMenuCategoryClick('software-bundle')}>{t('software')}</div>
              </div>
            </div>
          </>
        )}
      </header>

      {/* All Menu Sidebar - Works for both mobile and desktop */}
      {showAllMenu && (
        <div className={`all-menu-overlay ${showAllMenu ? 'open' : ''}`} onClick={closeAllMenu}>
          {/* External close button - positioned correctly on bigger screens */}
          <button className="all-menu-close external" onClick={closeAllMenu}>
            <X size={30} />
          </button>
          <div className="all-menu-sidebar" ref={allMenuRef} onClick={(e) => e.stopPropagation()}>
            <div className="all-menu-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <User size={24} />
                {user ? `Hello, ${user.user_metadata?.first_name || user.email.split('@')[0]}` : t('helloSignInMenu')}
              </div>
              {/* Internal close button - shown on small screens */}
              <button className="all-menu-close internal" onClick={closeAllMenu}>
                <X size={24} />
              </button>
            </div>

            {menuItems.map((section, index) => (
              <div key={index} className="all-menu-section">
                <div className="all-menu-section-title">{section.title[currentLanguage]}</div>
                {section.items.map((item, itemIndex) => (
                  <div
                    key={itemIndex}
                    className={item.type ? "settings-menu-item" : "all-menu-item"}
                    onClick={() => {
                      if (item.type) {
                        handleMenuSettingClick(item.type);
                      } else if (item.id) {
                        handleMenuCategoryClick(item.id);
                      } else {
                        handleMenuItemClick(Object.keys(translations.en).find(key => translations.en[key] === item.name.en));
                      }
                    }}
                  >
                    {item.type ? (
                      <>
                        <div className="settings-item-content">
                          {item.icon && <item.icon size={18} className="settings-item-icon" />}
                          <div className="settings-item-text">
                            <span className="settings-item-main">
                              {typeof item.name === 'object' ? item.name[currentLanguage] : item.name}
                            </span>
                            <span className="settings-item-sub">
                              {item.type === 'language' ? t('changeLanguage') : t('changeCurrency')}
                            </span>
                          </div>
                        </div>
                        <ChevronDown size={14} style={{ transform: 'rotate(-90deg)' }} />
                      </>
                    ) : (
                      <>
                        <span>{typeof item.name === 'object' ? item.name[currentLanguage] : item.name}</span>
                        <ChevronDown size={14} style={{ transform: 'rotate(-90deg)' }} />
                      </>
                    )}
                  </div>
                ))}
              </div>
            ))}

            {/* Additional Services */}
            <div className="all-menu-section">
              <div className="all-menu-section-title">ROBERT & IZAK SERVICES</div>
              {['myComputerConfigs', 'customPCBuilder', 'repairWarranty', 'techSupport', 'driverDownloads', 'hardwareUpgrades'].map((key) => (
                <div
                  key={key}
                  className="all-menu-item"
                  onClick={() => handleMenuItemClick(key)}
                >
                  <span>{t(key)}</span>
                  <ChevronDown size={14} style={{ transform: 'rotate(-90deg)' }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Address Modal */}
      {showAddressModal && (
        <div className="address-modal-overlay" onClick={closeAddressModal}>
          <div className="address-modal-content" ref={addressModalRef} onClick={(e) => e.stopPropagation()}>
            <button className="address-modal-close" onClick={closeAddressModal}>
              <X size={24} color="#0f1111" />
            </button>
            <h2>{t('selectAddress')}</h2>
            <div className="address-input-group">
              <input
                type="text"
                placeholder={t('enterAddress')}
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
                onKeyPress={(e) => { if (e.key === 'Enter') addAddress(); }}
              />
              <button onClick={addAddress}>{t('addAddress')}</button>
            </div>

            <div className="address-list">
              {savedAddresses.length > 0 ? (
                savedAddresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`address-item ${selectedAddress?.id === addr.id ? 'selected' : ''}`}
                    onClick={() => selectSavedAddress(addr)}
                  >
                    <div className="address-item-details">
                      <span>{addr.text}</span>
                      {addr.isDefault && <span className="address-default-badge">({t('default')})</span>}
                    </div>
                    <span className="address-remove-btn" onClick={(e) => removeAddress(addr.id, e)}>
                      Remove
                    </span>
                  </div>
                ))
              ) : (
                <p style={{ fontSize: '13px', color: '#555' }}>{t('noSavedAddresses')}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Language Selection Modal */}
      {showLanguageModal && (
        <div className="settings-modal-overlay" onClick={() => setShowLanguageModal(false)}>
          <div className="settings-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="settings-modal-close" onClick={() => setShowLanguageModal(false)}>
              <X size={24} />
            </button>
            <h3 className="settings-modal-title">{t('changeLanguage')}</h3>
            <div className="settings-option-list">
              {languages.map((language) => (
                <div
                  key={language.code}
                  className={`settings-option-item ${language.code === currentLanguage ? 'selected' : ''}`}
                  onClick={() => changeLanguage(language.code)}
                >
                  <span className="settings-option-flag">{language.flag}</span>
                  <div className="settings-option-details">
                    <span className="settings-option-name">{language.name}</span>
                    <span className="settings-option-code">{language.code.toUpperCase()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Currency Selection Modal */}
      {showCurrencyModal && (
        <div className="settings-modal-overlay" onClick={() => setShowCurrencyModal(false)}>
          <div className="settings-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="settings-modal-close" onClick={() => setShowCurrencyModal(false)}>
              <X size={24} />
            </button>
            <h3 className="settings-modal-title">{t('changeCurrency')}</h3>
            <div className="settings-option-list">
              {currencies.map((currency) => (
                <div
                  key={currency.code}
                  className={`settings-option-item ${currency.code === currentCurrency ? 'selected' : ''}`}
                  onClick={() => changeCurrency(currency.code)}
                >
                  <DollarSign size={20} className="settings-option-flag" />
                  <div className="settings-option-details">
                    <span className="settings-option-name">{currency.name}</span>
                    <span className="settings-option-code">{currency.symbol}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
{showAccountPage && (
  <AccountPage
    user={user}
    onSignOut={onSignOut}
    currentLanguage={currentLanguage}
    setCurrentLanguage={setCurrentLanguage}
    currentCurrency={currentCurrency}
    setCurrentCurrency={setCurrentCurrency}
    cartItemCount={cartItemCount}
    onCartClick={() => {
      setShowAccountPage(false);
      onCartClick();
    }}
    setCurrentPage={setCurrentPage}
    onClose={() => setShowAccountPage(false)} // Add this line
  />
      )}
      
{/* Welcome Sign-up Modal */}
{showWelcomeModal && (
  <div className="welcome-modal-overlay">
    <div className="welcome-modal-content">
      {/* ... existing header ... */}
      
      <div className="welcome-modal-body">
        <p>Sign up for an enhanced shopping experience:</p>
        <ul className="welcome-benefits">
          {/* ... benefits list ... */}
        </ul>
        
        <div className="welcome-modal-actions">
          <button 
            className="welcome-signup-btn"
            onClick={handleSignUpClick}  // This opens CREATE ACCOUNT form
          >
            Sign up for free
          </button>
          <button 
            className="welcome-later-btn"
            onClick={handleWelcomeClose}
          >
            Maybe later
          </button>
        </div>
        
        <div className="welcome-login-prompt">
          Already have an account? <span onClick={handleSignInClickFromModal}>Sign in</span> {/* This opens SIGN IN form */}
        </div>
      </div>
    </div>
  </div>
)}
{/* Amazon-style Bottom Banner */}
{showSignupBanner && (
  <div className="signup-banner">
    <div className="signup-banner-content">
      <div className="banner-text">
        <strong>Sign up for the best shopping experience</strong>
        <span>Get personalized recommendations, faster checkout, and exclusive deals</span>
      </div>
      <div className="banner-actions">
        <button 
          className="banner-signup-btn"
          onClick={handleSignUpClick}
        >
          Sign up free
        </button>
        {/* ADD THIS SIGN IN BUTTON */}
        <button 
          className="banner-signin-btn"
          onClick={handleSignInClickFromModal}
        >
          Sign in
        </button>
        <button 
          className="banner-close-btn"
          onClick={handleBannerClose}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  </div>
)}
    </>
  );
};

export default Header;