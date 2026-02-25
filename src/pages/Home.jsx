import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Helmet } from 'react-helmet-async'; 

const Home = ({ 
  setCurrentPage, 
  setSelectedCategory, 
  handleCategoryChange, 
  currentCurrency = 'UGX',
  convertPrice,
  getCurrencySymbol,
  currentLanguage = 'en',
  user,
  onSignIn
}) => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationInput, setLocationInput] = useState('');
  
  // Currency state
  const [effectiveCurrency, setEffectiveCurrency] = useState(currentCurrency);
  const [effectiveSymbol, setEffectiveSymbol] = useState('$');

  // Language state - sync with header
  const [effectiveLanguage, setEffectiveLanguage] = useState(currentLanguage);

  // Read location from localStorage (set by header)
  const [selectedLocation, setSelectedLocation] = useState(() => {
    return localStorage.getItem('userLocation') || 'Enter your location';
  });

  // Language translations
  const translations = {
    en: {
      // Location
      deliverTo: "Deliver to",
      enterLocation: "Enter your delivery location",
      saveLocation: "Save Location",
      removeLocation: "Remove Location",
      locationPlaceholder: "Enter your address, city, or area",
      
      // Hero Carousel
      gamingParadise: "Gaming Paradise",
      ultimateGamingSetup: "Ultimate Gaming Setup",
      shopGamingGear: "Shop Gaming Gear",
      professionalLaptops: "Professional Laptops",
      workSmarter: "Work Smarter, Not Harder",
      exploreLaptops: "Explore Laptops",
      crystalClearMonitors: "Crystal Clear Monitors",
      monitorsSubtitle: "4K & Ultra HD Displays",
      viewMonitors: "View Monitors",
      premiumAccessories: "Premium Accessories",
      completeYourSetup: "Complete Your Setup",
      discoverAccessories: "Discover Accessories",
      
      // Category Bundles
      getYourGameOn: "Get your game on",
      shopGamingPCs: "Shop Gaming PCs",
      shopLaptops: "Shop Laptops",
      seeAllLaptops: "See all Laptops",
      gamingLaptops: "Gaming Laptops",
      businessLaptops: "Business Laptops",
      macbooks: "MacBooks",
      twoInOnes: "2-in-1s",
      monitorsForEveryNeed: "Monitors for every need",
      discoverMonitors: "Discover Monitors",
      fourKMonitors: "4K Monitors",
      curved: "Curved",
      highRefreshRate: "High Refresh Rate",
      office: "Office",
      essentialAccessories: "Essential Accessories",
      shopAccessories: "Shop Accessories",
      keyboards: "Keyboards",
      mice: "Computer Mice",
      headsets: "Headsets",
      webcams: "Webcams",
      pcComponents: "PC Components",
      shopComponents: "Shop Components",
      gpus: "Graphics Cards",
      cpus: "Processors",
      ram: "Memory (RAM)",
      motherboards: "Motherboards",
      networking: "Networking",
      shopNetworking: "Shop Networking",
      routers: "Routers",
      switches: "Switches",
      wifiExtenders: "WiFi Extenders",
      modems: "Modems",
      storage: "Storage",
      shopStorage: "Shop Storage",
      ssds: "SSDs",
      hdds: "HDDs",
      externalDrives: "External Drives",
      nas: "NAS",
      software: "Software",
      shopSoftware: "Shop Software",
      windows: "Windows",
      officeSoftware: "Office",
      antivirus: "Antivirus",
      designTools: "Design Tools",
      
      // Featured Products
      featuredProducts: "Featured Products",
      seeAllFeatured: "See all featured products",
      of: "of",
      
      // Currency
      pricesIn: "Prices in",
      updatesInstantly: "Updates instantly"
    },
    es: {
      // Location
      deliverTo: "Entregar a",
      enterLocation: "Ingresa tu ubicación de entrega",
      saveLocation: "Guardar Ubicación",
      removeLocation: "Eliminar Ubicación",
      locationPlaceholder: "Ingresa tu dirección, ciudad o área",
      
      // Hero Carousel
      gamingParadise: "Paraíso Gaming",
      ultimateGamingSetup: "Configuración de Juego Definitiva",
      shopGamingGear: "Comprar Equipo Gaming",
      professionalLaptops: "Laptops Profesionales",
      workSmarter: "Trabaja Más Inteligente, No Más Duro",
      exploreLaptops: "Explorar Laptops",
      crystalClearMonitors: "Monitores de Alta Definición",
      monitorsSubtitle: "Pantallas 4K y Ultra HD",
      viewMonitors: "Ver Monitores",
      premiumAccessories: "Accesorios Premium",
      completeYourSetup: "Completa Tu Configuración",
      discoverAccessories: "Descubrir Accesorios",
      
      // Category Bundles
      getYourGameOn: "Juega al máximo",
      shopGamingPCs: "Comprar PCs Gaming",
      shopLaptops: "Comprar Laptops",
      seeAllLaptops: "Ver todas las Laptops",
      gamingLaptops: "Laptops Gaming",
      businessLaptops: "Laptops Empresariales",
      macbooks: "MacBooks",
      twoInOnes: "2-en-1",
      monitorsForEveryNeed: "Monitores para cada necesidad",
      discoverMonitors: "Descubrir Monitores",
      fourKMonitors: "Monitores 4K",
      curved: "Curvos",
      highRefreshRate: "Alta Tasa de Refresco",
      office: "Oficina",
      essentialAccessories: "Accesorios Esenciales",
      shopAccessories: "Comprar Accesorios",
      keyboards: "Teclados",
      mice: "Ratones",
      headsets: "Auriculares",
      webcams: "Cámaras Web",
      pcComponents: "Componentes de PC",
      shopComponents: "Comprar Componentes",
      gpus: "Tarjetas Gráficas",
      cpus: "Procesadores",
      ram: "Memoria (RAM)",
      motherboards: "Placas Base",
      networking: "Redes",
      shopNetworking: "Comprar Redes",
      routers: "Routers",
      switches: "Switches",
      wifiExtenders: "Extensores WiFi",
      modems: "Módems",
      storage: "Almacenamiento",
      shopStorage: "Comprar Almacenamiento",
      ssds: "SSDs",
      hdds: "HDDs",
      externalDrives: "Discos Externos",
      nas: "NAS",
      software: "Software",
      shopSoftware: "Comprar Software",
      windows: "Windows",
      officeSoftware: "Office",
      antivirus: "Antivirus",
      designTools: "Herramientas de Diseño",
      
      // Featured Products
      featuredProducts: "Productos Destacados",
      seeAllFeatured: "Ver todos los productos destacados",
      of: "de",
      
      // Currency
      pricesIn: "Precios en",
      updatesInstantly: "Actualiza al instante"
    },
    fr: {
      // Location
      deliverTo: "Livrer à",
      enterLocation: "Entrez votre lieu de livraison",
      saveLocation: "Enregistrer l'emplacement",
      removeLocation: "Supprimer l'emplacement",
      locationPlaceholder: "Entrez votre adresse, ville ou région",
      
      // Hero Carousel
      gamingParadise: "Paradis du Gaming",
      ultimateGamingSetup: "Configuration de Jeu Ultime",
      shopGamingGear: "Acheter l'Équipement de Jeu",
      professionalLaptops: "Ordinateurs Portables Professionnels",
      workSmarter: "Travaillez Plus Intelligemment, Pas Plus Dur",
      exploreLaptops: "Explorer les Ordinateurs Portables",
      crystalClearMonitors: "Moniteurs Haute Définition",
      monitorsSubtitle: "Écrans 4K et Ultra HD",
      viewMonitors: "Voir les Moniteurs",
      premiumAccessories: "Accessoires Premium",
      completeYourSetup: "Complétez Votre Configuration",
      discoverAccessories: "Découvrir les Accessoires",
      
      // Category Bundles
      getYourGameOn: "Jouez à fond",
      shopGamingPCs: "Acheter les PCs Gaming",
      shopLaptops: "Acheter des Ordinateurs Portables",
      seeAllLaptops: "Voir tous les Ordinateurs Portables",
      gamingLaptops: "Ordinateurs Portables Gaming",
      businessLaptops: "Ordinateurs Portables Professionnels",
      macbooks: "MacBooks",
      twoInOnes: "2-en-1",
      monitorsForEveryNeed: "Moniteurs pour chaque besoin",
      discoverMonitors: "Découvrir les Moniteurs",
      fourKMonitors: "Monitores 4K",
      curved: "Courbés",
      highRefreshRate: "Taux de Rafraîchissement Élevé",
      office: "Bureau",
      essentialAccessories: "Accessoires Essentiels",
      shopAccessories: "Acheter des Accessoires",
      keyboards: "Claviers",
      mice: "Souris",
      headsets: "Casques",
      webcams: "Webcams",
      pcComponents: "Composants PC",
      shopComponents: "Acheter des Composants",
      gpus: "Cartes Graphiques",
      cpus: "Processeurs",
      ram: "Mémoire (RAM)",
      motherboards: "Cartes Mères",
      networking: "Réseau",
      shopNetworking: "Acheter du Matériel Réseau",
      routers: "Routeurs",
      switches: "Switches",
      wifiExtenders: "Extendeurs WiFi",
      modems: "Modems",
      storage: "Stockage",
      shopStorage: "Acheter du Stockage",
      ssds: "SSDs",
      hdds: "HDDs",
      externalDrives: "Disques Externos",
      nas: "NAS",
      software: "Logiciels",
      shopSoftware: "Acheter des Logiciels",
      windows: "Windows",
      officeSoftware: "Office",
      antivirus: "Antivirus",
      designTools: "Outils de Conception",
      
      // Featured Products
      featuredProducts: "Produits en Vedette",
      seeAllFeatured: "Voir tous les produits en vedette",
      of: "de",
      
      // Currency
      pricesIn: "Prix en",
      updatesInstantly: "Mise à jour instantanée"
    }
  };

  // Get current translation
  const t = translations[effectiveLanguage] || translations.en;

  // Fallback placeholder
  const fallbackImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjUwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjRkZGRkZGIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NjY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';

  // Listen for language changes from Header
  useEffect(() => {
    const handleLanguageChange = () => {
      // Language changes are handled through props, but we can also listen for events if needed
      console.log('Home component - language prop updated:', currentLanguage);
      setEffectiveLanguage(currentLanguage);
    };

    // Update when prop changes
    handleLanguageChange();
  }, [currentLanguage]);

  // Listen for currency changes
  useEffect(() => {
    const handleCurrencyChange = (event) => {
      console.log('💰 Currency change in Home:', event.detail);
      setEffectiveCurrency(event.detail);
    };

    window.addEventListener('currencyChange', handleCurrencyChange);
    return () => window.removeEventListener('currencyChange', handleCurrencyChange);
  }, []);

  // Default currency conversion functions if not provided
  const getExchangeRates = () => ({
    USD: 1,
    EUR: 0.85,
    UGX: 3700
  });

  const defaultConvertPrice = (priceUSD) => {
    const rate = getExchangeRates()[effectiveCurrency] || 1;
    const converted = priceUSD * rate;
    
    if (effectiveCurrency === 'UGX') {
      return Math.round(converted).toLocaleString();
    } else {
      return converted.toFixed(2);
    }
  };

  const defaultGetCurrencySymbol = () => {
    switch(effectiveCurrency) {
      case 'EUR': return '€';
      case 'UGX': return 'USh ';
      default: return '$';
    }
  };

  // Use provided functions or defaults
  const priceConverter = convertPrice || defaultConvertPrice;
  const currencySymbol = getCurrencySymbol ? getCurrencySymbol() : defaultGetCurrencySymbol();

  // Update symbol when currency changes
  useEffect(() => {
    setEffectiveSymbol(defaultGetCurrencySymbol());
  }, [effectiveCurrency]);

  // Update window width on resize
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Responsive calculations
  const isMobile = windowWidth <= 768;
  const isSmallMobile = windowWidth <= 480;
  const isLargeScreen = windowWidth > 1200;

  // Listen for location changes from header and other components
  useEffect(() => {
    const handleLocationChange = (event) => {
      const newLocation = event.detail.location;
      setSelectedLocation(newLocation);
    };

    const handleStorageChange = () => {
      const savedLocation = localStorage.getItem('userLocation');
      if (savedLocation !== selectedLocation) {
        setSelectedLocation(savedLocation || 'Enter your location');
      }
    };

    window.addEventListener('locationChanged', handleLocationChange);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('locationChanged', handleLocationChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [selectedLocation]);

  /* -------------------------------------------------
     1. HERO CAROUSEL – Use bundle categories like Header
     ------------------------------------------------- */
  const heroCategories = [
    {
      id: 1,
      title: t.gamingParadise,
      subtitle: t.ultimateGamingSetup,
      categories: ["gaming-laptops", "gaming-desktops"],
      image: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=1600&h=600&fit=crop",
      mobileImage: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=800&h=400&fit=crop",
      ctaText: t.shopGamingGear
    },
    {
      id: 2,
      title: t.professionalLaptops,
      subtitle: t.workSmarter,
      categories: ["laptops", "business-laptops", "macbooks", "2-in-1s"],
      image: "https://sgoizomvpgtfyqefeujb.supabase.co/storage/v1/object/public/products/constants/mac%202.jpg",
      mobileImage: "https://sgoizomvpgtfyqefeujb.supabase.co/storage/v1/object/public/products/constants/mac%202.jpg",
      ctaText: t.exploreLaptops
    },
    {
      id: 3,
      title: t.crystalClearMonitors,
      subtitle: t.monitorsSubtitle,
      categories: ["monitors"],
      image: "https://sgoizomvpgtfyqefeujb.supabase.co/storage/v1/object/public/products/constants/4k.jpg?w=1600&h=600&fit=crop",
      mobileImage: "https://sgoizomvpgtfyqefeujb.supabase.co/storage/v1/object/public/products/constants/4k.jpg",
      ctaText: t.viewMonitors
    },
    {
      id: 4,
      title: t.premiumAccessories,
      subtitle: t.completeYourSetup,
      categories: ["accessories", "keyboards", "mice", "headsets", "webcams"],
      image: "https://sgoizomvpgtfyqefeujb.supabase.co/storage/v1/object/public/products/constants/MICE.jpg",
      mobileImage: "https://sgoizomvpgtfyqefeujb.supabase.co/storage/v1/object/public/products/constants/MICE.jpg",
      ctaText: t.discoverAccessories
    }
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const autoPlayRef = useRef(null);

  useEffect(() => {
    fetchCategories();
    fetchFeaturedProducts();
    
    if (isAutoPlaying) {
      autoPlayRef.current = setInterval(nextSlide, 5000);
    }
    return () => clearInterval(autoPlayRef.current);
  }, [isAutoPlaying, currentSlide]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchFeaturedProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories!inner (
            id,
            name,
            slug,
            parent_id
          ),
          brands (
            name
          )
        `)
        .eq('is_featured', true)
        .eq('is_published', true)
        .limit(12);
      
      if (error) throw error;
      console.log('🖼️ Featured Products:', data);
      setFeaturedProducts(data || []);
    } catch (err) {
      console.error('Error fetching featured products:', err);
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroCategories.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroCategories.length) % heroCategories.length);
  };

  const handleInteraction = () => {
    setIsAutoPlaying(false);
    clearInterval(autoPlayRef.current);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  // Get product image - USING THE SAME LOGIC AS PRODUCTCARD.JSX
  const getProductImage = (product) => {
    // Use the direct image_url field like ProductCard.jsx
    return product.image_url || fallbackImage;
  };

  // Handle image error - same as ProductCard.jsx
  const handleImageError = (e) => {
    if (e.target.src !== fallbackImage) {
      e.target.src = fallbackImage;
    }
  };

  // Handle hero click with array of categories - EXACTLY like Header
  const handleHeroClick = (categories) => {
    console.log('🖱️ Hero bundle clicked:', categories);
    setSelectedCategory(categories);
    setCurrentPage('products');
    navigate('/products');
    window.scrollTo(0, 0);
  };

  /* -------------------------------------------------
     2. CATEGORY BUNDLES – Use EXACT same bundles as Header.jsx
     ------------------------------------------------- */
  const categoryBundles = [
    {
      id: 1,
      title: t.getYourGameOn,
      mainImage: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=600",
      mobileImage: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=400",
      linkText: t.shopGamingPCs,
      categories: ["gaming-pcs"],
    },
    {
      id: 2,
      title: t.shopLaptops,
      linkText: t.seeAllLaptops,
      categories: ["laptops", "gaming-laptops", "business-laptops", "macbooks", "2-in-1s"],
      subCategories: [
        { name: t.gamingLaptops, image: "https://sgoizomvpgtfyqefeujb.supabase.co/storage/v1/object/public/products/constants/alienware-gaming-laptop.webp", mobileImage: "https://sgoizomvpgtfyqefeujb.supabase.co/storage/v1/object/public/products/constants/alienware-gaming-laptop.webp", categories: ["gaming-laptops"] },
        { name: t.businessLaptops, image: "https://sgoizomvpgtfyqefeujb.supabase.co/storage/v1/object/public/products/constants/business%20laptops.jpg", mobileImage: "https://sgoizomvpgtfyqefeujb.supabase.co/storage/v1/object/public/products/constants/business%20laptops.jpg", categories: ["business-laptops"] },
        { name: t.macbooks, image: "https://sgoizomvpgtfyqefeujb.supabase.co/storage/v1/object/public/products/constants/mac%202.jpg", mobileImage: "https://sgoizomvpgtfyqefeujb.supabase.co/storage/v1/object/public/products/constants/mac%202.jpg", categories: ["macbooks"] },
        { name: t.twoInOnes, image: "https://sgoizomvpgtfyqefeujb.supabase.co/storage/v1/object/public/products/constants/2-in-1s.jpg", mobileImage: "https://sgoizomvpgtfyqefeujb.supabase.co/storage/v1/object/public/products/constants/2-in-1s.jpg", categories: ["2-in-1s"] },
      ],
    },
    {
      id: 3,
      title: t.monitorsForEveryNeed,
      linkText: t.discoverMonitors,
      categories: ["monitors"],
      subCategories: [
        { name: t.fourKMonitors, image: "https://sgoizomvpgtfyqefeujb.supabase.co/storage/v1/object/public/products/constants/4k.jpg", mobileImage: "https://sgoizomvpgtfyqefeujb.supabase.co/storage/v1/object/public/products/constants/4k.jpg", categories: ["monitors"] },
        { name: t.curved, image: "https://sgoizomvpgtfyqefeujb.supabase.co/storage/v1/object/public/products/constants/curved%20monitor.webp", mobileImage: "https://sgoizomvpgtfyqefeujb.supabase.co/storage/v1/object/public/products/constants/curved%20monitor.webp", categories: ["monitors"] },
        { name: t.highRefreshRate, image: "https://sgoizomvpgtfyqefeujb.supabase.co/storage/v1/object/public/products/constants/high%20refresh%20rate.jpg", mobileImage: "https://sgoizomvpgtfyqefeujb.supabase.co/storage/v1/object/public/products/constants/high%20refresh%20rate.jpg", categories: ["monitors"] },
        { name: t.office, image: "https://sgoizomvpgtfyqefeujb.supabase.co/storage/v1/object/public/products/constants/office.jpg", mobileImage: "https://sgoizomvpgtfyqefeujb.supabase.co/storage/v1/object/public/products/constants/office.jpg", categories: ["monitors"] },
      ],
    },
    {
      id: 4,
      title: t.essentialAccessories,
      linkText: t.shopAccessories,
      categories: ["accessories", "keyboards", "mice", "headsets", "webcams"],
      subCategories: [
        { name: t.keyboards, image: "https://sgoizomvpgtfyqefeujb.supabase.co/storage/v1/object/public/products/constants/keyboard3.jpg", mobileImage: "https://sgoizomvpgtfyqefeujb.supabase.co/storage/v1/object/public/products/constants/keyboard3.jpg", categories: ["keyboards"] },
        { name: t.mice, image: "https://sgoizomvpgtfyqefeujb.supabase.co/storage/v1/object/public/products/constants/MICE.jpg", mobileImage: "https://sgoizomvpgtfyqefeujb.supabase.co/storage/v1/object/public/products/constants/MICE.jpg", categories: ["mice"] },
        { name: t.headsets, image: "https://sgoizomvpgtfyqefeujb.supabase.co/storage/v1/object/public/products/constants/headsets.jpg", mobileImage: "https://sgoizomvpgtfyqefeujb.supabase.co/storage/v1/object/public/products/constants/headsets.jpg", categories: ["headsets"] },
        { name: t.webcams, image: "https://sgoizomvpgtfyqefeujb.supabase.co/storage/v1/object/public/products/constants/webcams.jpg", mobileImage: "https://sgoizomvpgtfyqefeujb.supabase.co/storage/v1/object/public/products/constants/webcams.jpg", categories: ["webcams"] },
      ],
    },
    {
      id: 5,
      title: t.pcComponents,
      linkText: t.shopComponents,
      categories: ["components", "gpus", "cpus", "ram", "motherboards"],
      subCategories: [
        { name: t.gpus, image: "https://sgoizomvpgtfyqefeujb.supabase.co/storage/v1/object/public/products/constants/GPU%20PROCESSOR.jpg", mobileImage: "https://sgoizomvpgtfyqefeujb.supabase.co/storage/v1/object/public/products/constants/GPU%20PROCESSOR.jpg", categories: ["gpus"] },
        { name: t.cpus, image: "https://sgoizomvpgtfyqefeujb.supabase.co/storage/v1/object/public/products/constants/CPU.jpg", mobileImage: "https://sgoizomvpgtfyqefeujb.supabase.co/storage/v1/object/public/products/constants/CPU.jpg", categories: ["cpus"] },
        { name: t.ram, image: "https://sgoizomvpgtfyqefeujb.supabase.co/storage/v1/object/public/products/constants/RAM.jpg", mobileImage: "https://sgoizomvpgtfyqefeujb.supabase.co/storage/v1/object/public/products/constants/RAM.jpg", categories: ["ram"] },
        { name: t.motherboards, image: "https://sgoizomvpgtfyqefeujb.supabase.co/storage/v1/object/public/products/constants/motherboard.jpg", mobileImage: "https://sgoizomvpgtfyqefeujb.supabase.co/storage/v1/object/public/products/constants/motherboard.jpg", categories: ["motherboards"] },
      ],
    },
    {
      id: 6,
      title: t.networking,
      linkText: t.shopNetworking,
      categories: ["networking"],
      subCategories: [
        { name: t.routers, image: "https://sgoizomvpgtfyqefeujb.supabase.co/storage/v1/object/public/products/constants/routers.webp", mobileImage: "https://sgoizomvpgtfyqefeujb.supabase.co/storage/v1/object/public/products/constants/routers.webp", categories: ["networking"] },
        { name: t.switches, image: "https://sgoizomvpgtfyqefeujb.supabase.co/storage/v1/object/public/products/constants/switches%202.avif", mobileImage: "https://sgoizomvpgtfyqefeujb.supabase.co/storage/v1/object/public/products/constants/switches%202.avif", categories: ["networking"] },
        { name: t.wifiExtenders, image: "https://sgoizomvpgtfyqefeujb.supabase.co/storage/v1/object/public/products/constants/wifi%20extender.jpg", mobileImage: "https://sgoizomvpgtfyqefeujb.supabase.co/storage/v1/object/public/products/constants/wifi%20extender.jpg", categories: ["networking"] },
        { name: t.modems, image: "https://sgoizomvpgtfyqefeujb.supabase.co/storage/v1/object/public/products/constants/MODEM.webp", mobileImage: "https://sgoizomvpgtfyqefeujb.supabase.co/storage/v1/object/public/products/constants/MODEM.webp", categories: ["networking"] },
      ],
    },
    {
      id: 7,
      title: t.storage,
      linkText: t.shopStorage,
      categories: ["storage"],
      subCategories: [
        { name: t.ssds, image: "https://sgoizomvpgtfyqefeujb.supabase.co/storage/v1/object/public/products/constants/ssd.jpg", mobileImage: "https://sgoizomvpgtfyqefeujb.supabase.co/storage/v1/object/public/products/constants/ssd.jpg", categories: ["storage"] },
        { name: t.hdds, image: "https://sgoizomvpgtfyqefeujb.supabase.co/storage/v1/object/public/products/constants/HDD%20INTERNAL.jpg", mobileImage: "https://sgoizomvpgtfyqefeujb.supabase.co/storage/v1/object/public/products/constants/HDD%20INTERNAL.jpg", categories: ["storage"] },
        { name: t.externalDrives, image: "https://sgoizomvpgtfyqefeujb.supabase.co/storage/v1/object/public/products/constants/HDD2.jpg", mobileImage: "https://sgoizomvpgtfyqefeujb.supabase.co/storage/v1/object/public/products/constants/HDD2.jpg", categories: ["storage"] },
        { name: t.nas, image: "https://sgoizomvpgtfyqefeujb.supabase.co/storage/v1/object/public/products/constants/NAS.jpg", mobileImage: "https://sgoizomvpgtfyqefeujb.supabase.co/storage/v1/object/public/products/constants/NAS.jpg", categories: ["storage"] },
      ],
    },
    {
      id: 8,
      title: t.software,
      linkText: t.shopSoftware,
      categories: ["software"],
      subCategories: [
        { name: t.windows, image: "https://sgoizomvpgtfyqefeujb.supabase.co/storage/v1/object/public/products/constants/WINDOWS.png", mobileImage: "https://sgoizomvpgtfyqefeujb.supabase.co/storage/v1/object/public/products/constants/WINDOWS.png", categories: ["software"] },
        { name: t.officeSoftware, image: "https://sgoizomvpgtfyqefeujb.supabase.co/storage/v1/object/public/products/constants/office.webp", mobileImage: "https://sgoizomvpgtfyqefeujb.supabase.co/storage/v1/object/public/products/constants/office.webp", categories: ["software"] },
        { name: t.antivirus, image: "https://sgoizomvpgtfyqefeujb.supabase.co/storage/v1/object/public/products/constants/antiv.webp", mobileImage: "https://sgoizomvpgtfyqefeujb.supabase.co/storage/v1/object/public/products/constants/antiv.webp", categories: ["software"] },
        { name: t.designTools, image: "https://sgoizomvpgtfyqefeujb.supabase.co/storage/v1/object/public/products/constants/design%20tools.jpeg", mobileImage: "https://sgoizomvpgtfyqefeujb.supabase.co/storage/v1/object/public/products/constants/design%20tools.jpeg", categories: ["software"] },
      ],
    },
  ];

  /* -------------------------------------------------
     3. HORIZONTAL SCROLL FUNCTIONALITY
     ------------------------------------------------- */
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Responsive products per page
  const getProductsPerPage = () => {
    if (isSmallMobile) return 2;
    if (isMobile) return 3;
    if (windowWidth <= 1024) return 4;
    if (windowWidth <= 1440) return 5;
    return 6;
  };

  const productsPerPage = getProductsPerPage();

  const nextProducts = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    const nextIndex = currentProductIndex + productsPerPage >= featuredProducts.length 
      ? 0 
      : currentProductIndex + productsPerPage;
    
    setCurrentProductIndex(nextIndex);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const prevProducts = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    const prevIndex = currentProductIndex - productsPerPage < 0 
      ? Math.floor((featuredProducts.length - 1) / productsPerPage) * productsPerPage 
      : currentProductIndex - productsPerPage;
    
    setCurrentProductIndex(prevIndex);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const currentProducts = featuredProducts.slice(
    currentProductIndex, 
    currentProductIndex + productsPerPage
  );

  // Handle bundle navigation - pass array of categories EXACTLY like Header
  const handleBundleClick = (categories) => {
    console.log('🖱️ Home bundle clicked with categories:', categories);
    setSelectedCategory(categories);
    setCurrentPage('products');
    navigate('/products');
    window.scrollTo(0, 0);
  };

  // Handle sub-category clicks (single category)
  const handleSubCategoryClick = (categories) => {
    console.log('🖱️ Home sub-category clicked:', categories);
    setSelectedCategory(categories);
    setCurrentPage('products');
    navigate('/products');
    window.scrollTo(0, 0);
  };

  // Handle individual product click - NEW FUNCTION
  const handleProductClick = (product) => {
    console.log('🖱️ Product clicked:', product.name);
    // Navigate to product detail page
    navigate(`/product/${product.id}`);
    window.scrollTo(0, 0);
  };

  // Handle "See all featured products" click - NEW FUNCTION
  const handleSeeAllFeatured = () => {
    console.log('🖱️ See all featured products clicked');
    setSelectedCategory(['featured']);
    setCurrentPage('products');
    navigate('/products');
    window.scrollTo(0, 0);
  };

  // Handle link clicks to prevent default behavior
  const handleLinkClick = (e, categories) => {
    e.preventDefault();
    e.stopPropagation();
    handleBundleClick(categories);
  };

  // Get appropriate image based on screen size
  const getResponsiveImage = (desktopImage, mobileImage) => {
    return isMobile ? mobileImage : desktopImage;
  };

  // Handle location input and save to localStorage (syncs with header)
  const handleLocationSave = () => {
    if (locationInput.trim()) {
      const newLocation = locationInput.trim();
      
      // Update state and localStorage
      setSelectedLocation(newLocation);
      localStorage.setItem('userLocation', newLocation);
      
      // Dispatch custom event to notify Header component
      window.dispatchEvent(new CustomEvent('locationChanged', { 
        detail: { location: newLocation } 
      }));
      
      setShowLocationModal(false);
      setLocationInput('');
    }
  };

  // Handle Enter key press in location input
  const handleLocationKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLocationSave();
    }
  };

  // Handle location removal
  const handleLocationRemove = () => {
    setSelectedLocation('Enter your location');
    localStorage.removeItem('userLocation');
    
    // Dispatch custom event to notify Header component
    window.dispatchEvent(new CustomEvent('locationChanged', { 
      detail: { location: 'Enter your location' } 
    }));
  };

  // Responsive Styles
  const styles = {
    homePage: {
      backgroundColor: '#ffffff',
      minHeight: '100vh',
      position: 'relative',
    },
    // Mobile Location Bar (Header-style background)
    mobileLocationBar: {
      display: isMobile ? 'flex' : 'none',
      alignItems: 'center',
      padding: '12px 15px',
      backgroundColor: '#232f3e',
      borderBottom: '1px solid #ddd',
      fontSize: '14px',
      color: 'white',
      cursor: 'pointer',
      fontWeight: '500',
    },
    locationIcon: {
      marginRight: '8px',
      fontSize: '16px',
    },
    locationText: {
      fontWeight: '500',
    },
    locationModal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    locationModalContent: {
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '20px',
      width: '90%',
      maxWidth: '400px',
    },
    locationModalTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
      marginBottom: '15px',
      color: '#0F1111',
    },
    locationInput: {
      width: '100%',
      padding: '12px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '14px',
      marginBottom: '15px',
      boxSizing: 'border-box',
    },
    locationButton: {
      width: '100%',
      padding: '12px',
      backgroundColor: '#FF9900',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      fontSize: '14px',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
    },
    locationButtonHover: {
      backgroundColor: '#e68900',
    },
    removeLocationButton: {
      width: '100%',
      padding: '10px',
      backgroundColor: 'transparent',
      color: '#0066c0',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '14px',
      cursor: 'pointer',
      marginTop: '10px',
    },
    heroCarouselContainer: {
      marginTop: isMobile ? '-3px' : '-42px',
      position: 'relative',
      height: isSmallMobile ? '300px' : isMobile ? '400px' : '600px',
      overflow: 'hidden',
      background: isMobile ? '#ffffff' : 'linear-gradient(to bottom, #ffffff 0%, #f8fafc 20%, #e2e8f0 40%, #ffffff 100%)',
      zIndex: 2,
    },
    heroSlide: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      transition: 'opacity 0.8s ease-in-out',
      opacity: 1,
      cursor: 'pointer',
    },
    heroContent: {
      position: 'absolute',
      top: isSmallMobile? '50%' : isMobile ? '55%' : '25%',
      left: isSmallMobile ? '5%' : isMobile ? '8%' : '10%',
      transform: 'translateY(-50%)',
      zIndex: 2,
      color: 'white',
      textAlign: 'left',
      maxWidth: isSmallMobile ? '90%' : isMobile ? '400px' : '500px',
    },
    heroTitle: {
      fontSize: isSmallMobile ? '1.5rem' : isMobile ? '2rem' : '3rem',
      fontWeight: 'bold',
      marginBottom: isSmallMobile ? '0.5rem' : '1rem',
      textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
      background: 'linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      lineHeight: isSmallMobile ? '1.2' : '1.3',
    },
    heroSubtitle: {
      fontSize: isSmallMobile ? '0.9rem' : isMobile ? '1.1rem' : '1.5rem',
      marginBottom: isSmallMobile ? '1rem' : isMobile ? '1.5rem' : '2rem',
      textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
      color: '#e2e8f0',
      lineHeight: '1.4',
    },
    heroCta: {
      display: 'inline-block',
      padding: isSmallMobile ? '8px 16px' : isMobile ? '10px 20px' : '12px 24px',
      backgroundColor: '#FF9900',
      color: 'white',
      textDecoration: 'none',
      borderRadius: '4px',
      fontWeight: 'bold',
      fontSize: isSmallMobile ? '0.9rem' : isMobile ? '1rem' : '1.1rem',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
      display: 'none',
    },
    heroCtaHover: {
      backgroundColor: '#e68900',
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 8px -1px rgba(0, 0, 0, 0.4)',
    },
    heroGradientOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'linear-gradient(to right, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0) 100%)',
      zIndex: 1,
    },
    heroImageGradient: isMobile ? {} : {
      position: 'absolute',
      bottom: 0,
      left: 0,
      width: '100%',
      height: isSmallMobile ? '80px' : isMobile ? '100px' : '150px',
      background: 'linear-gradient(to bottom, transparent 0%, #ffffff 100%)',
      zIndex: 1,
    },
    heroArrow: {
      position: 'absolute',
      top: isSmallMobile? '50%' : isMobile ? '55%' : '25%',
      transform: 'translateY(-50%)',
      background: 'rgba(0, 0, 0, 0.3)',
      border: 'none',
      borderRadius: '50%',
      width: isSmallMobile ? '35px' : isMobile ? '40px' : '50px',
      height: isSmallMobile ? '35px' : isMobile ? '40px' : '50px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      zIndex: 2,
    },
    heroArrowHover: {
      background: 'rgba(0, 0, 0, 0.6)',
      transform: 'translateY(-50%) scale(1.1)',
    },
    leftArrow: {
      left: isSmallMobile ? '10px' : '20px',
    },
    rightArrow: {
      right: isSmallMobile ? '10px' : '20px',
    },
    bundlesGridContainer: {
      position: 'relative',
      marginTop: isMobile ? '20px' : isSmallMobile ? '-120px' : isMobile ? '-180px' : '-320px',
      padding: isSmallMobile ? '0 10px' : isMobile ? '0 15px' : '0 20px',
      zIndex: isMobile ? 1 : 2,
    },
    bundlesGrid: {
      display: 'grid',
      gridTemplateColumns: isSmallMobile ? '1fr' : 
                          isMobile ? 'repeat(2, 1fr)' : 
                          windowWidth <= 1024 ? 'repeat(3, 1fr)' : 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: isSmallMobile ? '15px' : '20px',
      maxWidth: '1400px',
      margin: '0 auto',
    },
    amazonCard: {
      background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      padding: isSmallMobile ? '15px' : '20px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      transition: 'all 0.3s ease',
      position: 'relative',
      overflow: 'hidden',
      cursor: 'default', // Default cursor for entire card
    },
    amazonCardHover: {
      transform: 'translateY(-4px)',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    },
    cardTitle: {
      fontSize: isSmallMobile ? '16px' : isMobile ? '17px' : '18px',
      fontWeight: '600',
      color: '#1a202c',
      marginBottom: isSmallMobile ? '10px' : '15px',
      background: 'linear-gradient(135deg, #2d3748 0%, #4a5568 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      lineHeight: '1.3',
      cursor: 'default', // Default cursor for title
    },
    cardMainImg: {
      width: '100%',
      height: isSmallMobile ? '120px' : isMobile ? '150px' : '200px',
      objectFit: 'cover',
      marginBottom: isSmallMobile ? '10px' : '15px',
      cursor: 'pointer', // Pointer for main image (only for Shop Gaming PCs)
    },
    subGrid: {
      display: 'grid',
      gridTemplateColumns: isSmallMobile ? '1fr 1fr' : '1fr 1fr',
      gap: isSmallMobile ? '8px' : '10px',
      marginBottom: isSmallMobile ? '10px' : '15px',
    },
    subItem: {
      textAlign: 'center',
    },
    subItemImg: {
      width: isSmallMobile ? '135px' : isMobile ? '110px' : '130px',
      height: isSmallMobile ? '140px' : isMobile ? '90px' : '120px',
      objectFit: 'cover',
      margin: '0 auto 5px',
      cursor: 'pointer', // Pointer for sub-category images
    },
    subItemText: {
      fontSize: isSmallMobile ? '10px' : isMobile ? '11px' : '12px',
      color: '#4a5568',
      fontWeight: '500',
      lineHeight: '1.3',
      cursor: 'default', // Default cursor for sub-item text
    },
    cardLink: {
      color: '#0066c0',
      textDecoration: 'none',
      fontSize: isSmallMobile ? '12px' : isMobile ? '13px' : '14px',
      fontWeight: '500',
      display: 'block',
      marginTop: isSmallMobile ? '8px' : '10px',
      transition: 'color 0.2s ease',
      cursor: 'pointer', // Pointer for text links
    },
    cardLinkHover: {
      color: '#052648ff',
      textDecoration: 'underline',
    },
    fullWidthProductRow: {
      gridColumn: '1 / -1',
      background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      padding: isSmallMobile ? '15px' : isMobile ? '20px' : '25px',
      marginTop: isSmallMobile ? '15px' : '20px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      position: 'relative',
      cursor: 'default', // Default cursor for entire row
    },
    rowTitle: {
      fontSize: isSmallMobile ? '16px' : isMobile ? '18px' : '20px',
      fontWeight: '600',
      color: '#1a202c',
      marginBottom: isSmallMobile ? '15px' : '20px',
      background: 'linear-gradient(135deg, #2d3748 0%, #4a5568 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      cursor: 'default', // Default cursor for row title
    },
    horizontalContainer: {
      position: 'relative',
      padding: '10px 0',
      marginBottom: isSmallMobile ? '15px' : '20px',
      overflow: 'hidden',
      cursor: 'default', // Default cursor for container
    },
    horizontalProducts: {
      display: 'grid',
      gridTemplateColumns: isSmallMobile ? 'repeat(2, 1fr)' : 
                           isMobile ? 'repeat(3, 1fr)' : 
                           windowWidth <= 1024 ? 'repeat(4, 1fr)' : 
                           windowWidth <= 1440 ? 'repeat(5, 1fr)' : 'repeat(6, 1fr)',
      gap: isSmallMobile ? '10px' : '15px',
      padding: '10px 0',
      transition: 'transform 0.3s ease-in-out',
      transform: `translateX(0px)`,
    },
    hProduct: {
      textAlign: 'center',
      padding: isSmallMobile ? '8px' : '10px',
      background: 'linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      transition: 'all 0.3s ease',
      opacity: 1,
      cursor: 'pointer', // Pointer for individual products
    },
    hProductHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    },
    hProductImg: {
      width: isSmallMobile ? '80px' : isMobile ? '90px' : '120px',
      height: isSmallMobile ? '80px' : isMobile ? '90px' : '120px',
      objectFit: 'contain',
      borderRadius: '6px',
      margin: '0 auto 8px',
      transition: 'transform 0.2s ease',
      cursor: 'pointer', // Pointer for product images
    },
    hProductName: {
      fontSize: isSmallMobile ? '11px' : isMobile ? '12px' : '14px',
      fontWeight: '500',
      color: '#2d3748',
      marginBottom: '5px',
      lineHeight: '1.3',
      height: isSmallMobile ? '2.6em' : '2.8em',
      overflow: 'hidden',
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      cursor: 'pointer', // Pointer for product names
    },
    hProductPrice: {
      fontSize: isSmallMobile ? '14px' : isMobile ? '15px' : '16px',
      fontWeight: '600',
      color: '#1a202c',
      cursor: 'pointer', // Pointer for product prices
    },
    horizontalArrow: {
      position: 'absolute',
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'rgba(255, 255, 255, 0.9)',
      border: '1px solid #d1d5db',
      borderRadius: '4px',
      width: isSmallMobile ? '25px' : isMobile ? '30px' : '40px',
      height: isSmallMobile ? '50px' : isMobile ? '60px' : '80px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      zIndex: 3,
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    },
    horizontalArrowHover: {
      background: 'rgba(255, 255, 255, 1)',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    },
    horizontalLeftArrow: {
      left: isSmallMobile ? '5px' : '10px',
    },
    horizontalRightArrow: {
      right: isSmallMobile ? '5px' : '10px',
    },
    arrowDisabled: {
      opacity: 0.3,
      cursor: 'not-allowed',
    },
    productCounter: {
      position: 'absolute',
      top: isSmallMobile ? '5px' : '10px',
      right: isSmallMobile ? '10px' : '20px',
      fontSize: isSmallMobile ? '10px' : '12px',
      color: '#6b7280',
      background: 'rgba(255, 255, 255, 0.8)',
      padding: '2px 8px',
      borderRadius: '12px',
      cursor: 'default', // Default cursor for counter
    },
    currencyNotice: {
      padding: '8px',
      backgroundColor: '#fff3cd',
      border: '1px solid #ffeaa7',
      borderRadius: '4px',
      marginBottom: '15px',
      fontSize: '12px',
      textAlign: 'center',
      color: '#856404'
    },
  };

  // State for hover effects
  const [hoverStates, setHoverStates] = useState({
    leftArrow: false,
    rightArrow: false,
    horizontalLeftArrow: false,
    horizontalRightArrow: false,
    cards: {},
    links: {},
    products: {},
    computerRow: false,
    heroCta: false,
    locationButton: false,
  });

  const handleMouseEnter = (element, id) => {
    setHoverStates(prev => ({
      ...prev,
      [element]: { ...prev[element], [id]: true }
    }));
  };

  const handleMouseLeave = (element, id) => {
    setHoverStates(prev => ({
      ...prev,
      [element]: { ...prev[element], [id]: false }
    }));
  };

  // Calculate current page for display
  const currentPage = Math.floor(currentProductIndex / productsPerPage) + 1;
  const totalPages = Math.ceil(featuredProducts.length / productsPerPage);

  /* -------------------------------------------------
     4. RENDER
     ------------------------------------------------- */
  return (
    <div className="home-page" style={styles.homePage}>
         {/* ===== SEO META TAGS ===== */}
    <Helmet>
      <title>Robert & Izak Computers Uganda | Gaming PCs, Laptops & Electronics</title>
      <meta 
        name="description" 
        content="🏆 Uganda's #1 Computer Store. Shop Gaming PCs, Laptops, Monitors, PC Components & Accessories. Best Prices • 2-Year Warranty • Free Kampala Delivery • Expert Support" 
      />
      <meta 
        name="keywords" 
        content="gaming computers uganda, laptops kampala, pc components, monitors, computer accessories, robert izak computers, electronics store uganda" 
      />
      
      {/* Open Graph Tags */}
      <meta property="og:title" content="Robert & Izak Computers Uganda | Gaming PCs & Laptops" />
      <meta property="og:description" content="Uganda's #1 Computer Store • Gaming PCs from 3.2M UGX • Laptops from 1.9M UGX • Free Delivery Kampala" />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://www.robertandizakcomputers.com" />
      <meta property="og:image" content="https://www.robertandizakcomputers.com/og-image.jpg" />
      
      {/* Canonical URL */}
      <link rel="canonical" href="https://www.robertandizakcomputers.com" />
      
      {/* Structured Data for Home Page */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ComputerStore",
          "name": "Robert & Izak Computers",
          "description": "Uganda's leading computer store for gaming PCs, laptops, and electronics",
          "url": "https://www.robertandizakcomputers.com",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Kampala",
            "addressCountry": "Uganda"
          },
          "openingHours": "Mo-Sa 08:00-19:00",
          "priceRange": "$$"
        })}
      </script>
    </Helmet>
      {/* ==== MOBILE LOCATION BAR (SYNCED WITH HEADER) ==== */}
      {isMobile && (
        <div 
          style={styles.mobileLocationBar}
          onClick={() => setShowLocationModal(true)}
        >
          <span style={styles.locationIcon}>📍</span>
          <span style={styles.locationText}>
            {t.deliverTo} {selectedLocation}
          </span>
        </div>
      )}

      {/* ==== LOCATION INPUT MODAL ==== */}
      {showLocationModal && (
        <div 
          style={styles.locationModal}
          onClick={() => setShowLocationModal(false)}
        >
          <div 
            style={styles.locationModalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={styles.locationModalTitle}>{t.enterLocation}</h3>
            <input
              type="text"
              placeholder={t.locationPlaceholder}
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              onKeyPress={handleLocationKeyPress}
              style={styles.locationInput}
              autoFocus
            />
            <button
              style={{
                ...styles.locationButton,
                ...(hoverStates.locationButton && styles.locationButtonHover)
              }}
              onClick={handleLocationSave}
              onMouseEnter={() => handleMouseEnter('locationButton', 'main')}
              onMouseLeave={() => handleMouseLeave('locationButton', 'main')}
            >
              {t.saveLocation}
            </button>
            {selectedLocation !== 'Enter your location' && (
              <button
                style={styles.removeLocationButton}
                onClick={handleLocationRemove}
              >
                {t.removeLocation}
              </button>
            )}
          </div>
        </div>
      )}

      {/* ==== HERO CAROUSEL ==== */}
      <div className="hero-carousel-container" style={styles.heroCarouselContainer}>
        {heroCategories.map((category, index) => (
          <div
            key={category.id}
            className="hero-slide"
            onClick={() => handleHeroClick(category.categories)}
            style={{
              ...styles.heroSlide,
              backgroundImage: `url(${getResponsiveImage(category.image, category.mobileImage)})`,
              opacity: index === currentSlide ? 1 : 0,
              zIndex: index === currentSlide ? 1 : 0,
            }}
          >
            {index === currentSlide && (
              <>
                <div style={styles.heroGradientOverlay} />
                {!isMobile && <div style={styles.heroImageGradient} />}
                <div style={styles.heroContent}>
                  <h1 style={styles.heroTitle}>{category.title}</h1>
                  <p style={styles.heroSubtitle}>{category.subtitle}</p>
                  <a
                    href="#"
                    style={{
                      ...styles.heroCta,
                      ...(hoverStates.heroCta && styles.heroCtaHover)
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleHeroClick(category.categories);
                    }}
                    onMouseEnter={() => handleMouseEnter('heroCta', 'main')}
                    onMouseLeave={() => handleMouseLeave('heroCta', 'main')}
                  >
                    {category.ctaText}
                  </a>
                </div>
              </>
            )}
          </div>
        ))}
        
        <button
          className="hero-arrow left"
          onClick={() => {
            prevSlide();
            handleInteraction();
          }}
          style={{
            ...styles.heroArrow,
            ...styles.leftArrow,
            ...(hoverStates.leftArrow && styles.heroArrowHover)
          }}
          onMouseEnter={() => handleMouseEnter('leftArrow', 'left')}
          onMouseLeave={() => handleMouseLeave('leftArrow', 'left')}
        >
          <svg width={isSmallMobile ? "18" : isMobile ? "20" : "24"} height={isSmallMobile ? "18" : isMobile ? "20" : "24"} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M15 18L9 12L15 6" />
          </svg>
        </button>
        <button
          className="hero-arrow right"
          onClick={() => {
            nextSlide();
            handleInteraction();
          }}
          style={{
            ...styles.heroArrow,
            ...styles.rightArrow,
            ...(hoverStates.rightArrow && styles.heroArrowHover)
          }}
          onMouseEnter={() => handleMouseEnter('rightArrow', 'right')}
          onMouseLeave={() => handleMouseLeave('rightArrow', 'right')}
        >
          <svg width={isSmallMobile ? "18" : isMobile ? "20" : "24"} height={isSmallMobile ? "18" : isMobile ? "20" : "24"} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M9 18L15 12L9 6" />
          </svg>
        </button>
      </div>

      {/* ==== BUNDLES GRID + COMPUTERS ROW ==== */}
      <div className="bundles-grid-container" style={styles.bundlesGridContainer}>
        <div className="bundles-grid" style={styles.bundlesGrid}>
          {/* First 8: Regular Grid Cards */}
          {categoryBundles.map((bundle) => (
            <div
              key={bundle.id}
              className="amazon-card"
              style={{
                ...styles.amazonCard,
                ...(hoverStates.cards[bundle.id] && styles.amazonCardHover)
              }}
              onMouseEnter={() => handleMouseEnter('cards', bundle.id)}
              onMouseLeave={() => handleMouseLeave('cards', bundle.id)}
              // REMOVED: onClick handler for the entire card
            >
              <h3 className="card-title" style={styles.cardTitle}>{bundle.title}</h3>
              {bundle.mainImage ? (
                <img 
                  src={getResponsiveImage(bundle.mainImage, bundle.mobileImage)} 
                  alt={bundle.title} 
                  style={styles.cardMainImg}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBundleClick(bundle.categories);
                  }}
                />
              ) : (
                <div style={styles.subGrid}>
                  {bundle.subCategories.map((sub, idx) => (
                    <div key={idx} style={styles.subItem}>
                      <img 
                        src={getResponsiveImage(sub.image, sub.mobileImage)} 
                        alt={sub.name} 
                        style={styles.subItemImg}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSubCategoryClick(sub.categories);
                        }}
                      />
                      <p style={styles.subItemText}>{sub.name}</p>
                    </div>
                  ))}
                </div>
              )}
              <a
                href="#"
                className="card-link"
                onClick={(e) => handleLinkClick(e, bundle.categories)}
                style={{
                  ...styles.cardLink,
                  ...(hoverStates.links[bundle.id] && styles.cardLinkHover)
                }}
                onMouseEnter={() => handleMouseEnter('links', bundle.id)}
                onMouseLeave={() => handleMouseLeave('links', bundle.id)}
              >
                {bundle.linkText}
              </a>
            </div>
          ))}

          {/* FULL-WIDTH: FEATURED PRODUCTS ROW */}
          <div
            className="full-width-product-row"
            style={{
              ...styles.fullWidthProductRow,
              ...(hoverStates.computerRow && styles.amazonCardHover)
            }}
            onMouseEnter={() => handleMouseEnter('computerRow', 'main')}
            onMouseLeave={() => handleMouseLeave('computerRow', 'main')}
          >
            <h3 className="row-title" style={styles.rowTitle}>{t.featuredProducts}</h3>
                  
            <div style={styles.productCounter}>
              {currentPage} {t.of} {totalPages}
            </div>
            
            {/* Horizontal Products with Navigation */}
            <div style={styles.horizontalContainer}>
              {/* Previous Button */}
              <button
                className="horizontal-arrow left"
                onClick={(e) => {
                  e.stopPropagation();
                  prevProducts();
                }}
                disabled={isAnimating}
                style={{
                  ...styles.horizontalArrow,
                  ...styles.horizontalLeftArrow,
                  ...(hoverStates.horizontalLeftArrow && styles.horizontalArrowHover),
                  ...(isAnimating && styles.arrowDisabled)
                }}
                onMouseEnter={() => handleMouseEnter('horizontalLeftArrow', 'left')}
                onMouseLeave={() => handleMouseLeave('horizontalLeftArrow', 'left')}
              >
                <svg width={isSmallMobile ? "12" : isMobile ? "14" : "16"} height={isSmallMobile ? "12" : isMobile ? "14" : "16"} viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2">
                  <path d="M15 18L9 12L15 6" />
                </svg>
              </button>

              {/* Products Grid - NOW USING THE SAME IMAGE LOGIC AS PRODUCTCARD.JSX */}
              <div style={styles.horizontalProducts}>
                {currentProducts.map((product) => (
                  <div 
                    key={product.id}
                    style={{
                      ...styles.hProduct,
                      ...(hoverStates.products[product.id] && styles.hProductHover)
                    }}
                    onMouseEnter={() => handleMouseEnter('products', product.id)}
                    onMouseLeave={() => handleMouseLeave('products', product.id)}
                    onClick={() => handleProductClick(product)}
                  >
                    <img 
                      src={getProductImage(product)} 
                      alt={product.name}
                      style={styles.hProductImg}
                      onError={handleImageError}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'scale(1)';
                      }}
                    />
                    <div style={styles.hProductName}>{product.name}</div>
                    <div style={styles.hProductPrice}>
                      {currencySymbol}{priceConverter(product.price)}
                    </div>
                    {product.brands && (
                      <div style={{ fontSize: isSmallMobile ? '10px' : isMobile ? '11px' : '12px', color: '#6b7280' }}>
                        {product.brands.name}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Next Button */}
              <button
                className="horizontal-arrow right"
                onClick={(e) => {
                  e.stopPropagation();
                  nextProducts();
                }}
                disabled={isAnimating}
                style={{
                  ...styles.horizontalArrow,
                  ...styles.horizontalRightArrow,
                  ...(hoverStates.horizontalRightArrow && styles.horizontalArrowHover),
                  ...(isAnimating && styles.arrowDisabled)
                }}
                onMouseEnter={() => handleMouseEnter('horizontalRightArrow', 'right')}
                onMouseLeave={() => handleMouseLeave('horizontalRightArrow', 'right')}
              >
                <svg width={isSmallMobile ? "12" : isMobile ? "14" : "16"} height={isSmallMobile ? "12" : isMobile ? "14" : "16"} viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2">
                  <path d="M9 18L15 12L9 6" />
                </svg>
              </button>
            </div>

            <a
              href="#"
              className="card-link"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSeeAllFeatured();
              }}
              style={styles.cardLink}
            >
              {t.seeAllFeatured}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;