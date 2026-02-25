import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { authenticateCustomer, registerCustomer } from '../utils/auth';

const ProductDetail = ({ 
  addToCart, 
  currentCurrency = 'UGX', 
  convertPrice, 
  getCurrencySymbol, 
  user,
  setUser,
  currentLanguage = 'en',
  setCurrentLanguage,
  onSignIn
}) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => { window.scrollTo(0, 0); }, [location.pathname]);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [effectiveCurrency, setEffectiveCurrency] = useState(currentCurrency);
  const [effectiveSymbol, setEffectiveSymbol] = useState('$');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [productImages, setProductImages] = useState([]);
  const [isInCart, setIsInCart] = useState(false);
  
  // Zoom functionality states
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [zoomLevel, setZoomLevel] = useState(2);
  const [showZoomModal, setShowZoomModal] = useState(false);
  const imageRef = useRef(null);
  const zoomRef = useRef(null);

  // Star rating states
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [productRating, setProductRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [ratingDistribution, setRatingDistribution] = useState({});
  const [showRatingBreakdown, setShowRatingBreakdown] = useState(false);

  // Authentication modal states (updated from sign-in modal)
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [authForm, setAuthForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: ''
  });
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // Share modal states
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Social Media Icons as SVG Components
  const WhatsAppIcon = ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893c0-3.18-1.24-6.169-3.495-8.424"/>
    </svg>
  );

  const FacebookIcon = ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );

  const TwitterIcon = ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.016 10.016 0 01-3.127 1.184 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.937 4.937 0 004.604 3.417 9.868 9.868 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.054 0 13.999-7.496 13.999-13.986 0-.209 0-.42-.015-.63a9.936 9.936 0 002.46-2.543l-.047-.02z"/>
    </svg>
  );

  const LinkedInIcon = ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );

  const TelegramIcon = ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm4.441 16.892c-2.102.144-6.784.944-9.639 1.387-.964.151-1.851-.345-1.851-1.297 0-.625.311-1.214.824-1.521 2.973-1.729 6.307-3.67 9.031-5.489.612-.408.723-1.177.322-1.745-.402-.566-1.22-.625-1.752-.231-2.293 1.528-4.556 3.03-6.678 4.47-1.417.968-2.17.61-2.17-.61V7.491c0-.566.311-1.214.824-1.521 10.986-6.524 14.237-5.336 14.237-5.336.402-.193.964-.151 1.297.322.332.473.251 1.155-.181 1.491-1.135.944-5.971 4.008-8.645 5.75h-.002c-.191.126-.301.512-.241.824.06.312.311.573.654.573 2.893 0 6.134-1.297 8.645-2.102.723-.241 1.297.151 1.155.944-.181 1.155-2.412 5.971-4.736 9.395-.402.654-.964.784-1.567.573z"/>
    </svg>
  );

  const EmailIcon = ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12 12.713l-11.985-9.713h23.97l-11.985 9.713zm0 2.574l-12-9.725v15.438h24v-15.438l-12 9.725z"/>
    </svg>
  );

  const CopyIcon = ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
    </svg>
  );

  const ShareIcon = ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
    </svg>
  );

  // Translation dictionary for ProductDetail
  const translations = {
    en: {
      loading: "Loading product...",
      notFound: "Product not found",
      home: "Home",
      products: "Products",
      brand: "Brand",
      description: "Description",
      quantity: "Quantity",
      addToCart: "Add to Cart",
      viewCart: "View Cart",
      addedToCart: "Added to Cart",
      buyNow: "Buy Now",
      youMightAlsoLike: "You might also like",
      ourStore: "our store",
      browseMore: "Browse more products in",
      rateThisProduct: "Rate this product",
      youRated: "You rated {rating} stars",
      clickToRate: "Click to rate",
      signInToRate: "Sign in to rate",
      ratingBreakdown: "Rating Breakdown",
      shareYourThoughts: "Share your thoughts",
      outOf5: "out of 5",
      ratings: "ratings",
      star: "star",
      pleaseSignIn: "Please sign in to rate this product",
      addedToCartMessage: "Added to cart!",
      ratingSubmitted: "Rating submitted!",
      itemInCart: "Item is in cart!",
      cartHasItems: "Cart has {count} items",
      clickCartIcon: "Click the cart icon in navigation to view",
      inStock: "In Stock",
      outOfStock: "Out of Stock",
      features: "Features",
      specifications: "Specifications",
      reviews: "Reviews",
      questions: "Questions & Answers",
      shipping: "Shipping & Returns",
      warranty: "Warranty",
      relatedProducts: "Related Products",
      recentlyViewed: "Recently Viewed",
      compareSimilar: "Compare with similar items",
      share: "Share this product",
      shareProduct: "Share this product",
      copyLink: "Copy Link",
      linkCopied: "Link Copied!",
      shareViaWhatsApp: "Share via WhatsApp",
      shareViaFacebook: "Share via Facebook",
      shareViaTwitter: "Share via Twitter",
      shareViaLinkedIn: "Share via LinkedIn",
      shareViaTelegram: "Share via Telegram",
      shareViaEmail: "Share via Email",
      orCopyLink: "Or copy the link below",
      shareMessage: "Check out this amazing product: {productName}",
      email: "Email",
      password: "Password",
      signInToContinue: "Sign in to continue",
      dontHaveAccount: "Don't have an account?",
      signUp: "Sign Up",
      close: "Close",
      welcomeBack: "Welcome Back",
      signInToYourAccount: "Sign in to your account to continue",
      invalidCredentials: "Invalid email or password",
      signInSuccess: "Signed in successfully!",
      signIn: "Sign In",
      alreadyHaveAccount: "Already have an account?",
      createAccount: "Create account",
      firstName: "First Name",
      lastName: "Last Name",
      phone: "Phone Number",
      welcome: "Welcome to ROBERT & IZAK COMPUTERS",
      createNewAccount: "Create your account",
      signUpSuccess: "Account created successfully!",
      processing: "Processing...",
      continue: "Continue",
      showPassword: "Show password",
      hidePassword: "Hide password",
      zoom: "Zoom",
      clickToZoom: "Click to zoom",
      pinchToZoom: "Pinch to zoom on mobile",
      zoomIn: "Zoom In",
      zoomOut: "Zoom Out",
      resetZoom: "Reset Zoom",
      fullscreen: "Fullscreen",
      exitFullscreen: "Exit Fullscreen"
    },
    es: {
      // ... existing Spanish translations ...
      zoom: "Zoom",
      clickToZoom: "Haz clic para hacer zoom",
      pinchToZoom: "Pellizca para hacer zoom en móvil",
      zoomIn: "Acercar",
      zoomOut: "Alejar",
      resetZoom: "Restablecer zoom",
      fullscreen: "Pantalla completa",
      exitFullscreen: "Salir de pantalla completa",
      shareViaWhatsApp: "Compartir por WhatsApp",
      shareViaFacebook: "Compartir por Facebook",
      shareViaTwitter: "Compartir por Twitter",
      shareViaLinkedIn: "Compartir por LinkedIn",
      shareViaTelegram: "Compartir por Telegram",
      shareViaEmail: "Compartir por Correo"
    },
    fr: {
      // ... existing French translations ...
      zoom: "Zoom",
      clickToZoom: "Cliquez pour zoomer",
      pinchToZoom: "Pincez pour zoomer sur mobile",
      zoomIn: "Zoomer",
      zoomOut: "Dézoomer",
      resetZoom: "Réinitialiser le zoom",
      fullscreen: "Plein écran",
      exitFullscreen: "Quitter le plein écran",
      shareViaWhatsApp: "Partager via WhatsApp",
      shareViaFacebook: "Partager via Facebook",
      shareViaTwitter: "Partager via Twitter",
      shareViaLinkedIn: "Partager via LinkedIn",
      shareViaTelegram: "Partager via Telegram",
      shareViaEmail: "Partager par Email"
    }
  };

  // Helper function to get translated text
  const t = (key, params = {}) => {
    let translation = translations[currentLanguage][key] || translations.en[key] || key;
    
    // Replace placeholders with actual values
    Object.keys(params).forEach(param => {
      translation = translation.replace(`{${param}}`, params[param]);
    });
    
    return translation;
  };

  // Zoom functionality handlers
  const handleImageMouseMove = (e) => {
    if (!isZoomed || !imageRef.current) return;

    const { left, top, width, height } = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;

    setZoomPosition({ x, y });
  };

  const handleImageClick = () => {
    if (isMobile) {
      setShowZoomModal(true);
    } else {
      setIsZoomed(!isZoomed);
    }
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.5, 5));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.5, 1));
  };

  const handleResetZoom = () => {
    setZoomLevel(2);
    setIsZoomed(false);
  };

  const handleFullscreen = () => {
    setShowZoomModal(true);
  };

  const closeZoomModal = () => {
    setShowZoomModal(false);
    setZoomLevel(2);
  };

  // Touch events for mobile zoom
  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && showZoomModal) {
      e.preventDefault();
      // Basic pinch-to-zoom simulation
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      
      // You can implement more sophisticated pinch-to-zoom here
      if (distance > 100) {
        setZoomLevel(prev => Math.min(prev + 0.1, 5));
      } else if (distance < 80) {
        setZoomLevel(prev => Math.max(prev - 0.1, 1));
      }
    }
  };

  // Handle responsive breakpoints
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close zoom on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        if (showZoomModal) {
          closeZoomModal();
        } else if (isZoomed) {
          setIsZoomed(false);
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showZoomModal, isZoomed]);

  // Check if product is in cart
  useEffect(() => {
    const checkIfInCart = () => {
      try {
        const savedCart = localStorage.getItem('robert-izak-computers-cart');
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          const productInCart = parsedCart.find(item => item.id === product?.id);
          setIsInCart(!!productInCart);
        }
      } catch (error) {
        console.error('Error checking cart:', error);
      }
    };

    if (product?.id) {
      checkIfInCart();
    }

    const handleStorageChange = (e) => {
      if (e.key === 'robert-izak-computers-cart' && product?.id) checkIfInCart();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('cartUpdated', checkIfInCart);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartUpdated', checkIfInCart);
    };
  }, [product?.id]);

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

  // Listen for currency changes
  useEffect(() => {
    const handleCurrencyChange = (event) => {
      console.log('💰 Currency change in ProductDetail:', event.detail);
      setEffectiveCurrency(event.detail);
    };

    window.addEventListener('currencyChange', handleCurrencyChange);
    return () => window.removeEventListener('currencyChange', handleCurrencyChange);
  }, []);

  // Listen for language changes
  useEffect(() => {
    const handleLanguageChange = (event) => {
      console.log('🌐 Language change in ProductDetail:', event.detail);
      if (setCurrentLanguage) {
        setCurrentLanguage(event.detail);
      }
    };

    window.addEventListener('languageChange', handleLanguageChange);
    return () => window.removeEventListener('languageChange', handleLanguageChange);
  }, [setCurrentLanguage]);

  // Update symbol when currency changes
  useEffect(() => {
    setEffectiveSymbol(defaultGetCurrencySymbol());
  }, [effectiveCurrency]);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  // Load user rating from localStorage on mount
  useEffect(() => {
    const savedRatings = localStorage.getItem('robert-izak-computers-ratings');
    if (savedRatings) {
      try {
        const ratings = JSON.parse(savedRatings);
        const productRating = ratings[product?.id];
        if (productRating) {
          setUserRating(productRating);
        }
      } catch (error) {
        console.error('Error loading ratings:', error);
      }
    }
  }, [product?.id]);

  // Generate consistent product rating, review count, and distribution based on product ID
  useEffect(() => {
    if (product?.id) {
      // Create consistent rating based on product ID (hash function)
      const generateConsistentRating = (id) => {
        let hash = 0;
        for (let i = 0; i < id.length; i++) {
          hash = ((hash << 5) - hash) + id.charCodeAt(i);
          hash = hash & hash;
        }
        const rating = 3.8 + (Math.abs(hash) % 110) / 100;
        return Math.min(rating, 4.9).toFixed(1);
      };

      // Generate consistent review count based on product ID
      const generateConsistentReviewCount = (id) => {
        let hash = 0;
        for (let i = 0; i < id.length; i++) {
          hash = ((hash << 7) - hash) + id.charCodeAt(i);
          hash = hash & hash;
        }
        const baseCount = 150 + (Math.abs(hash) % 2350);
        
        if (baseCount >= 1000) {
          return (baseCount / 1000).toFixed(1) + 'k';
        }
        return baseCount.toLocaleString();
      };

      // Generate realistic rating distribution based on product ID
      const generateRatingDistribution = (id, avgRating) => {
        const hash = id.split('').reduce((a, b) => {
          a = ((a << 5) - a) + b.charCodeAt(0);
          return a & a;
        }, 0);
        
        const avg = parseFloat(avgRating);
        const distributions = {
          // High quality product distribution (more 4-5 star ratings)
          high: [2, 3, 10, 25, 60],
          // Medium quality product distribution
          medium: [5, 10, 20, 35, 30],
          // Lower quality product distribution
          low: [10, 20, 30, 25, 15]
        };
        
        let distributionType = 'medium';
        if (avg >= 4.5) distributionType = 'high';
        else if (avg <= 3.5) distributionType = 'low';
        
        const percentages = distributions[distributionType];
        const totalReviews = Math.abs(hash) % 5000 + 500; // 500-5500 reviews
        
        return {
          5: Math.round((percentages[4] / 100) * totalReviews),
          4: Math.round((percentages[3] / 100) * totalReviews),
          3: Math.round((percentages[2] / 100) * totalReviews),
          2: Math.round((percentages[1] / 100) * totalReviews),
          1: Math.round((percentages[0] / 100) * totalReviews)
        };
      };

      const consistentRating = generateConsistentRating(product.id);
      const consistentReviewCount = generateConsistentReviewCount(product.id);
      const distribution = generateRatingDistribution(product.id, consistentRating);

      setProductRating(consistentRating);
      setReviewCount(consistentReviewCount);
      setRatingDistribution(distribution);
    }
  }, [product?.id]);

const fetchProduct = async () => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories (
          id,
          name,
          slug
        ),
        product_images (
          id,
          image_url,
          is_primary,
          alt_text,
          sort_order
        ),
        brands (
          name
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    
    setProduct(data);
    
    // Process and set product images
    if (data.product_images && data.product_images.length > 0) {
      // Sort images: primary first, then by sort_order
      const sortedImages = [...data.product_images].sort((a, b) => {
        if (a.is_primary && !b.is_primary) return -1;
        if (!a.is_primary && b.is_primary) return 1;
        return (a.sort_order || 0) - (b.sort_order || 0);
      });
      setProductImages(sortedImages);
    } else {
      // If no images in product_images, use the main product image_url as fallback
      setProductImages([{ image_url: data.image_url, is_primary: true }]);
    }
    
  } catch (err) {
    console.error('Error fetching product:', err);
  } finally {
    setLoading(false);
  }
};

  // Save rating to localStorage
  const saveRatingToStorage = (rating) => {
    try {
      const savedRatings = localStorage.getItem('robert-izak-computers-ratings');
      const ratings = savedRatings ? JSON.parse(savedRatings) : {};
      
      ratings[product.id] = rating;
      localStorage.setItem('robert-izak-computers-ratings', JSON.stringify(ratings));
      console.log(`Rating ${rating} saved for product ${product.id}`);
      
      // Show success message
      showToast(t('ratingSubmitted'), 'success');
    } catch (error) {
      console.error('Error saving rating to localStorage:', error);
    }
  };

  // Show toast message
  const showToast = (message, type = 'success') => {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 100px;
      right: 20px;
      background: ${type === 'success' ? '#067D62' : '#B12704'};
      color: white;
      padding: 12px 20px;
      border-radius: 4px;
      z-index: 10000;
      font-weight: bold;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
      animation: slideIn 0.3s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 300);
    }, 2000);
  };

  // Share functionality
  const getShareUrl = () => {
    return window.location.href;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(getShareUrl());
      setCopiedLink(true);
      showToast(t('linkCopied'), 'success');
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = getShareUrl();
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedLink(true);
      showToast(t('linkCopied'), 'success');
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const shareOnWhatsApp = () => {
    const message = t('shareMessage', { productName: product?.name });
    const url = `https://wa.me/?text=${encodeURIComponent(message + ' ' + getShareUrl())}`;
    window.open(url, '_blank');
  };

  const shareOnFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getShareUrl())}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareOnTwitter = () => {
    const message = t('shareMessage', { productName: product?.name });
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(getShareUrl())}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareOnLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(getShareUrl())}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareOnTelegram = () => {
    const message = t('shareMessage', { productName: product?.name });
    const url = `https://t.me/share/url?url=${encodeURIComponent(getShareUrl())}&text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareViaEmail = () => {
    const subject = t('shareProduct');
    const body = t('shareMessage', { productName: product?.name }) + '\n\n' + getShareUrl();
    const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = url;
  };

  const openShareModal = () => {
    setShowShareModal(true);
  };

  const closeShareModal = () => {
    setShowShareModal(false);
    setCopiedLink(false);
  };

  // Open auth modal
  const openAuthModal = (isSignUpMode = false) => {
    setIsSignUp(isSignUpMode);
    setShowAuthModal(true);
    setAuthError(null);
    setAuthForm({ email: '', password: '', firstName: '', lastName: '', phone: '' });
  };

  // Close auth modal
  const closeAuthModal = () => {
    setShowAuthModal(false);
    setAuthForm({ email: '', password: '', firstName: '', lastName: '', phone: '' });
    setAuthError(null);
    setAuthLoading(false);
    setShowPassword(false);
  };

  // Handle auth form input changes
  const handleAuthInputChange = (e) => {
    const { name, value } = e.target;
    setAuthForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Handle auth form submission with Supabase integration
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setAuthLoading(true);
    setAuthError(null);

    try {
      let result;

      if (isSignUp) {
        // Customer registration with Supabase
        const userData = {
          firstName: authForm.firstName,
          lastName: authForm.lastName,
          phone: authForm.phone
        };
        
        result = await registerCustomer(authForm.email, authForm.password, userData);
        
        if (result.success) {
          // Auto-signin after registration
          const signInResult = await authenticateCustomer(authForm.email, authForm.password);
          if (signInResult.success) {
            const user = {
              id: signInResult.customer.id,
              email: signInResult.customer.email,
              user_metadata: {
                first_name: signInResult.customer.first_name,
                last_name: signInResult.customer.last_name
              },
              isAdmin: false
            };
            
            // Set user in parent component if provided
            if (setUser) {
              setUser(user);
            }
            
            // Store user in localStorage
            localStorage.setItem('robert-izak-computers-user', JSON.stringify(user));
            
            // Dispatch event to notify other components
            window.dispatchEvent(new CustomEvent('userSignedIn', { detail: user }));
            
            showToast(t('signUpSuccess'), 'success');
          } else {
            setAuthError('Account created! Please sign in.');
            setIsSignUp(false);
            return;
          }
        } else {
          throw new Error(result.error);
        }
      } else {
        // Customer authentication with Supabase
        result = await authenticateCustomer(authForm.email, authForm.password);
        
        if (result.success) {
          const user = {
            id: result.customer.id,
            email: result.customer.email,
            user_metadata: {
              first_name: result.customer.first_name,
              last_name: result.customer.last_name
            },
            isAdmin: false
          };
          
          // Set user in parent component if provided
          if (setUser) {
            setUser(user);
          }
          
          // Store user in localStorage
          localStorage.setItem('robert-izak-computers-user', JSON.stringify(user));
          
          // Dispatch event to notify other components
          window.dispatchEvent(new CustomEvent('userSignedIn', { detail: user }));
          
          showToast(t('signInSuccess'), 'success');
        } else {
          throw new Error(result.error);
        }
      }

      // Close modal
      closeAuthModal();
    } catch (err) {
      console.error('Authentication error:', err);
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  // Star rating handlers - COMPLETELY DISABLED when not signed in
  const handleStarClick = (rating) => {
    if (!user) {
      openAuthModal(false);
      return; // Completely prevent rating when not signed in
    }
    
    setUserRating(rating);
    saveRatingToStorage(rating);
  };

  const handleStarHover = (rating) => {
    if (!user) return; // Disable hover effects when not signed in
    setHoverRating(rating);
  };

  const handleMouseLeave = () => {
    if (!user) return; // Disable hover effects when not signed in
    setHoverRating(0);
  };

  // Calculate percentage for rating bar
  const calculatePercentage = (starCount) => {
    const total = Object.values(ratingDistribution).reduce((sum, count) => sum + count, 0);
    if (total === 0) return 0;
    return Math.round((starCount / total) * 100);
  };

  // Render star rating display (for product rating, not interactive)
  const renderStarRating = (rating) => {
    const numericRating = parseFloat(rating);
    const fullStars = Math.floor(numericRating);
    const hasHalfStar = numericRating % 1 >= 0.3 && numericRating % 1 < 0.8;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <>
        {[...Array(fullStars)].map((_, i) => (
          <span key={`full-${i}`} style={{ color: '#ffa41c', fontSize: '20px' }}>★</span>
        ))}
        
        {hasHalfStar && (
          <span style={{ color: '#ffa41c', fontSize: '20px', position: 'relative' }}>
            ★
            <span style={{
              position: 'absolute',
              left: 0,
              width: '50%',
              overflow: 'hidden',
              color: '#ddd'
            }}>★</span>
          </span>
        )}
        
        {[...Array(emptyStars)].map((_, i) => (
          <span key={`empty-${i}`} style={{ color: '#ddd', fontSize: '20px' }}>★</span>
        ))}
      </>
    );
  };

  // Simple and reliable cart opening function
  const openCart = () => {
    console.log('Opening cart...');
    
    // Method 1: Try to find and click any cart element
    const cartSelectors = [
      '.nav-cart',
      '.cart-icon',
      '.shopping-cart',
      '[data-cart]',
      '.cart-button',
      '.header-cart',
      '#cart-button',
      '.cart-toggle',
      '.mini-cart'
    ];
    
    for (const selector of cartSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        console.log('Found cart element:', selector);
        element.click();
        return true;
      }
    }
    
    // Method 2: Dispatch custom event for other components to handle
    window.dispatchEvent(new CustomEvent('openCart', {
      detail: { productId: product.id }
    }));
    
    // Method 3: Fallback - show cart items in console and alert
    const cart = JSON.parse(localStorage.getItem('robert-izak-computers-cart') || '[]');
    console.log('Cart items:', cart);
    
    // Show a temporary message
    const message = document.createElement('div');
    message.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #067D62;
      color: white;
      padding: 20px;
      border-radius: 8px;
      z-index: 10000;
      font-weight: bold;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      text-align: center;
    `;
    message.innerHTML = `
      <div>${t('itemInCart')}</div>
      <div style="font-size: 14px; margin-top: 8px;">${t('cartHasItems', { count: cart.length })}</div>
      <div style="font-size: 12px; margin-top: 5px; opacity: 0.8;">${t('clickCartIcon')}</div>
    `;
    document.body.appendChild(message);
    
    setTimeout(() => {
      if (document.body.contains(message)) {
        document.body.removeChild(message);
      }
    }, 3000);
    
    return false;
  };

  // Get button text based on device size and cart status
  const getAddToCartButtonText = () => {
    if (!isInCart) {
      return t('addToCart');
    }
    
    // For small devices, show "Added to Cart" when item is in cart
    // For larger devices, show "View Cart" when item is in cart
    return isMobile ? t('addedToCart') : t('viewCart');
  };

 const handleAddToCart = () => {
  if (isInCart) {
    // Only open cart on larger devices, small devices just show "Added to Cart"
    if (!isMobile) {
      openCart();
    }
    return;
  }
  
  if (product && addToCart) {
    // Create cart item with proper structure including the selected quantity
    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: getProductImage(),
      quantity: quantity, // This should be the selected quantity
      short_description: product.short_description
    };
   
    console.log('🛒 Adding to cart:', cartItem.name, 'Quantity:', quantity);
    
    // Call addToCart with the item
    addToCart(cartItem);
    setIsInCart(true);
    
    // Update localStorage and dispatch event
    setTimeout(() => {
      const savedCart = localStorage.getItem('robert-izak-computers-cart');
      let cart = savedCart ? JSON.parse(savedCart) : [];
      
      // Check if item already exists in cart
      const existingItemIndex = cart.findIndex(item => item.id === product.id);
      if (existingItemIndex !== -1) {
        // Update quantity if item exists
        cart[existingItemIndex].quantity += quantity;
      } else {
        // Add new item with selected quantity
        cart.push({ ...cartItem, quantity: quantity });
      }
      
      localStorage.setItem('robert-izak-computers-cart', JSON.stringify(cart));
      console.log('Cart saved to localStorage with quantity:', quantity);
    }, 50);
    
    // Show success feedback
    setTimeout(() => {
      showToast(t('addedToCartMessage'), 'success');
    }, 100);
  } else {
    console.error('❌ Product data or addToCart function not available');
  }
};

 const handleBuyNow = () => {
  if (product && addToCart) {
    // Add product to cart first with the selected quantity
    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: getProductImage(),
      quantity: quantity, // Use the selected quantity
      short_description: product.short_description
    };
   
    console.log('⚡ Buy Now:', cartItem.name, 'Quantity:', quantity);
    addToCart(cartItem);
    setIsInCart(true);
   
    // Update localStorage immediately
    setTimeout(() => {
      const savedCart = localStorage.getItem('robert-izak-computers-cart');
      let cart = savedCart ? JSON.parse(savedCart) : [];
      
      const existingItemIndex = cart.findIndex(item => item.id === product.id);
      if (existingItemIndex !== -1) {
        cart[existingItemIndex].quantity += quantity;
      } else {
        cart.push({ ...cartItem, quantity: quantity });
      }
      
      localStorage.setItem('robert-izak-computers-cart', JSON.stringify(cart));
    }, 50);
   
    // Navigate to checkout immediately
    navigate('/checkout');
    window.scrollTo(0, 0);
  }
};

  const getProductImage = () => {
    if (productImages.length > 0) {
      return productImages[selectedImage]?.image_url || productImages[0]?.image_url;
    }
    return product?.image_url || 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=200';
  };

  // Fallback placeholder (SVG)
  const fallbackImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjUwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjRkZGRkZGIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NjY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';

  // Responsive styles
  const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: isMobile ? '16px' : '20px',
    backgroundColor: '#fff',
    marginTop: '0px',
    marginBottom: isMobile ? '20px' : '40px',
    minHeight: 'calc(100vh - 140px)'
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
    gap: isMobile ? '24px' : '40px',
    marginBottom: isMobile ? '30px' : '40px'
  };

  const imageContainerStyle = {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: isMobile ? '12px' : '20px',
    marginBottom: isMobile ? '16px' : '20px',
    textAlign: 'center',
    backgroundColor: '#fafafa',
    position: 'relative',
    overflow: 'hidden',
    cursor: isZoomed ? 'zoom-out' : (isMobile ? 'pointer' : 'zoom-in')
  };

  const mainImageStyle = {
    maxWidth: '100%',
    maxHeight: isMobile ? '300px' : '400px',
    objectFit: 'contain',
    width: '100%',
    height: 'auto',
    transition: 'transform 0.3s ease',
    transform: isZoomed ? `scale(${zoomLevel})` : 'scale(1)',
    transformOrigin: isZoomed ? `${zoomPosition.x}% ${zoomPosition.y}%` : 'center center'
  };

  const titleStyle = {
    fontSize: isMobile ? '20px' : '24px',
    fontWeight: '500',
    marginBottom: isMobile ? '8px' : '10px',
    color: '#0F1111',
    lineHeight: '1.3'
  };

  const priceStyle = {
    fontSize: isMobile ? '24px' : '28px',
    color: '#B12704',
    marginBottom: isMobile ? '16px' : '20px',
    fontWeight: '500'
  };

  const buttonContainerStyle = {
    display: 'flex',
    flexDirection: isMobile ? 'column' : 'row',
    gap: isMobile ? '12px' : '15px',
    marginBottom: isMobile ? '24px' : '30px'
  };

  const buttonStyle = {
    padding: isMobile ? '14px 20px' : '12px 24px',
    backgroundColor: '#FFD814',
    border: 'none',
    borderRadius: '20px',
    fontSize: isMobile ? '15px' : '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    flex: 1
  };

  const buyNowButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#FFA41C'
  };

  const shareButtonStyle = {
    padding: isMobile ? '12px 16px' : '10px 20px',
    backgroundColor: '#f0f0f0',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: isMobile ? '14px' : '13px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#0F1111'
  };

  // Zoom controls style
  const zoomControlsStyle = {
    position: 'absolute',
    bottom: '10px',
    right: '10px',
    display: 'flex',
    gap: '5px',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: '5px',
    borderRadius: '4px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
  };

  const zoomButtonStyle = {
    padding: '5px 8px',
    backgroundColor: '#007185',
    color: 'white',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 'bold'
  };

  // Social share button style
  const socialButtonStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: isMobile ? '14px' : '16px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    background: 'white',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    gap: '8px',
    minHeight: isMobile ? '70px' : '80px',
    width: '100%'
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        fontSize: isMobile ? '16px' : '18px',
        color: '#666',
        marginTop: '140px'
      }}>
        {t('loading')}
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        fontSize: isMobile ? '16px' : '18px',
        color: '#666',
        marginTop: '140px'
      }}>
        {t('notFound')}
      </div>
    );
  }

  const mainImage = getProductImage();

  return (
    <div style={containerStyle}>   
      {/* Breadcrumb */}
      <div style={{ 
        marginBottom: isMobile ? '16px' : '20px', 
        fontSize: isMobile ? '12px' : '14px', 
        color: '#666',
        lineHeight: '1.4'
      }}>
        <span 
          style={{ cursor: 'pointer', color: '#0066c0' }}
          onClick={() => navigate('/')}
        >
          {t('home')}
        </span>
        {' > '}
        <span 
          style={{ cursor: 'pointer', color: '#0066c0' }}
          onClick={() => navigate('/products')}
        >
          {product.categories?.name || t('products')}
        </span>
        {' > '}
        <span>{product.name}</span>
      </div>

      <div style={gridStyle}>
        {/* Product Images */}

{/* Product Images */}
<div>
  <div 
    style={imageContainerStyle}
    onMouseMove={handleImageMouseMove}
    onClick={handleImageClick}
    onTouchStart={handleTouchStart}
    onTouchMove={handleTouchMove}
    ref={imageRef}
  >
    <img 
      src={getProductImage()} 
      alt={product.name}
      style={mainImageStyle}
      loading="lazy"
      onError={(e) => {
        if (e.target.src !== fallbackImage) {
          e.target.src = fallbackImage;
        }
      }}
    />
    
    {/* Zoom Controls */}
    {!isMobile && (
      <div style={zoomControlsStyle}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleZoomIn();
          }}
          style={zoomButtonStyle}
          title={t('zoomIn')}
        >
          +
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleZoomOut();
          }}
          style={zoomButtonStyle}
          title={t('zoomOut')}
        >
          -
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleResetZoom();
          }}
          style={zoomButtonStyle}
          title={t('resetZoom')}
        >
          ⟲
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleFullscreen();
          }}
          style={zoomButtonStyle}
          title={t('fullscreen')}
        >
          ⛶
        </button>
      </div>
    )}
    
    {/* Zoom hint for desktop */}
    {!isMobile && !isZoomed && (
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        padding: '5px 10px',
        borderRadius: '4px',
        fontSize: '12px',
        pointerEvents: 'none'
      }}>
        {t('clickToZoom')}
      </div>
    )}
  </div>
  
  {/* Thumbnail Images */}
  {productImages.length > 1 && (
    <div style={{ 
      display: 'flex', 
      gap: '8px', 
      flexWrap: isMobile ? 'nowrap' : 'wrap',
      overflowX: isMobile ? 'auto' : 'visible',
      paddingBottom: isMobile ? '8px' : '0',
      justifyContent: 'center'
    }}>
      {productImages.map((image, index) => (
        <img
          key={image.id || index}
          src={image.image_url}
          alt={image.alt_text || `${product.name} ${index + 1}`}
          style={{
            width: isMobile ? '60px' : '80px',
            height: isMobile ? '60px' : '80px',
            objectFit: 'cover',
            border: selectedImage === index ? '2px solid #FF9900' : '1px solid #ddd',
            borderRadius: '4px',
            cursor: 'pointer',
            flexShrink: 0
          }}
          onClick={() => {
            setSelectedImage(index);
            setIsZoomed(false);
          }}
          onError={(e) => {
            if (e.target.src !== fallbackImage) {
              e.target.src = fallbackImage;
            }
          }}
        />
      ))}
    </div>
  )}
</div>
 
        {/* Product Info */}
        <div>
          <h1 style={titleStyle}>
            {product.name}
          </h1>
          
          {product.brands && (
            <p style={{ 
              fontSize: isMobile ? '13px' : '14px', 
              color: '#007185',
              marginBottom: isMobile ? '8px' : '10px'
            }}>
              {t('brand')}: {product.brands.name}
            </p>
          )}

          <div style={priceStyle}>
            {currencySymbol}{priceConverter(product.price)}
            <span style={{ 
              fontSize: isMobile ? '12px' : '14px', 
              color: '#565959', 
              marginLeft: '8px' 
            }}>
              ({effectiveCurrency})
            </span>
          </div>

          {/* Share Button */}
          <div style={{ marginBottom: isMobile ? '16px' : '20px' }}>
            <button
              onClick={openShareModal}
              style={shareButtonStyle}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#e8e8e8'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#f0f0f0'}
            >
              <ShareIcon size={16} color="#666" />
              {t('share')}
            </button>
          </div>

          {/* Product Rating Section */}
          <div style={{ 
            marginBottom: isMobile ? '20px' : '25px',
            padding: isMobile ? '15px' : '20px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            backgroundColor: '#fafafa'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
              <div style={{ marginRight: '15px' }}>
                <div style={{ fontSize: isMobile ? '28px' : '32px', fontWeight: 'bold', color: '#0F1111' }}>
                  {productRating}
                </div>
                <div style={{ fontSize: isMobile ? '13px' : '14px', color: '#666' }}>
                  {t('outOf5')}
                </div>
              </div>
              <div>
                <div style={{ marginBottom: '5px' }}>
                  {renderStarRating(productRating)}
                </div>
                <div style={{ fontSize: isMobile ? '13px' : '14px', color: '#007185', cursor: 'pointer' }}
                     onClick={() => setShowRatingBreakdown(!showRatingBreakdown)}>
                  {reviewCount} {t('ratings')}
                </div>
              </div>
            </div>

            {/* User Rating Section */}
            <div style={{ borderTop: '1px solid #eee', paddingTop: '15px' }}>
              <div style={{ fontSize: isMobile ? '14px' : '16px', fontWeight: '500', marginBottom: '10px' }}>
                {t('rateThisProduct')}
              </div>
              <div 
                className="star-rating"
                onMouseLeave={handleMouseLeave}
                style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}
              >
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`star ${(hoverRating || userRating) >= star ? 'active' : ''}`}
                    onClick={() => handleStarClick(star)}
                    onMouseEnter={() => handleStarHover(star)}
                    style={{
                      cursor: user ? 'pointer' : 'not-allowed',
                      fontSize: isMobile ? '24px' : '28px',
                      color: user ? ((hoverRating || userRating) >= star ? '#ffa41c' : '#ddd') : '#ddd',
                      transition: 'color 0.2s ease',
                      marginRight: '5px',
                      opacity: user ? 1 : 0.5
                    }}
                    title={user ? `${t('star')} ${star}` : t('signInToRate')}
                  >
                    ★
                  </span>
                ))}
                <span style={{ 
                  marginLeft: '10px', 
                  fontSize: isMobile ? '13px' : '14px', 
                  color: user ? '#007185' : '#666' 
                }}>
                  {userRating > 0 ? t('youRated', { rating: userRating }) : user ? t('clickToRate') : t('signInToRate')}
                </span>
              </div>
            </div>

            {/* Rating Breakdown */}
            {showRatingBreakdown && (
              <div style={{
                background: 'white',
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '16px',
                marginTop: '15px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <strong style={{ fontSize: '16px' }}>{t('ratingBreakdown')}</strong>
                  <button 
                    onClick={() => setShowRatingBreakdown(false)}
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      fontSize: '18px', 
                      cursor: 'pointer',
                      color: '#666'
                    }}
                  >
                    ×
                  </button>
                </div>
                
                <div style={{ marginBottom: '12px' }}>
                  {[5, 4, 3, 2, 1].map(star => (
                    <div key={star} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ width: '40px', fontSize: '14px', color: '#666' }}>
                        {star} {t('star')}
                      </div>
                      <div style={{ flex: 1, margin: '0 10px' }}>
                        <div style={{
                          width: '100%',
                          height: '8px',
                          backgroundColor: '#f0f0f0',
                          borderRadius: '4px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            width: `${calculatePercentage(ratingDistribution[star])}%`,
                            height: '100%',
                            backgroundColor: '#ffa41c'
                          }} />
                        </div>
                      </div>
                      <div style={{ width: '40px', fontSize: '12px', color: '#666', textAlign: 'right' }}>
                        {calculatePercentage(ratingDistribution[star])}%
                      </div>
                    </div>
                  ))}
                </div>
                
                <div style={{ borderTop: '1px solid #eee', paddingTop: '12px' }}>
                  <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                    {t('shareYourThoughts')}
                  </div>
                  <div 
                    className="star-rating"
                    onMouseLeave={handleMouseLeave}
                    style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}
                  >
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`star ${(hoverRating || userRating) >= star ? 'active' : ''}`}
                        onClick={() => handleStarClick(star)}
                        onMouseEnter={() => handleStarHover(star)}
                        style={{
                          cursor: user ? 'pointer' : 'not-allowed',
                          fontSize: '20px',
                          color: user ? ((hoverRating || userRating) >= star ? '#ffa41c' : '#ddd') : '#ddd',
                          transition: 'color 0.2s ease',
                          marginRight: '3px',
                          opacity: user ? 1 : 0.5
                        }}
                        title={user ? `${t('star')} ${star}` : t('signInToRate')}
                      >
                        ★
                      </span>
                    ))}
                    <span style={{ 
                      marginLeft: '8px', 
                      fontSize: '13px', 
                      color: user ? '#007185' : '#666' 
                    }}>
                      {userRating > 0 ? t('youRated', { rating: userRating }) : user ? t('clickToRate') : t('signInToRate')}
                    </span>
                  </div>
                  {!user && (
                    <div style={{
                      fontSize: '12px',
                      color: '#B12704',
                      marginTop: '8px',
                      padding: '8px',
                      backgroundColor: '#FFF0F0',
                      borderRadius: '4px',
                      textAlign: 'center'
                    }}>
                      {t('pleaseSignIn')}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Short Description Preview */}
          {product.short_description && (
            <div style={{ 
              marginBottom: isMobile ? '12px' : '16px',
              lineHeight: '1.4'
            }}>
              <p style={{ 
                fontSize: isMobile ? '14px' : '15px', 
                color: '#0F1111',
                fontStyle: 'italic'
              }}>
                {product.short_description}
              </p>
            </div>
          )}

          {/* Full Description */}
          {product.description && (
            <div style={{ 
              marginBottom: isMobile ? '16px' : '20px',
              lineHeight: '1.5'
            }}>
              <h3 style={{ 
                fontSize: isMobile ? '15px' : '16px', 
                marginBottom: '6px',
                fontWeight: '500'
              }}>
                {t('description')}
              </h3>
              <p style={{ 
                fontSize: isMobile ? '13px' : '14px', 
                color: '#0F1111',
                lineHeight: '1.6'
              }}>
                {product.description}
              </p>
            </div>
          )}

          {/* Quantity Selector */}
          <div style={{ marginBottom: isMobile ? '16px' : '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '6px',
              fontWeight: '500',
              fontSize: isMobile ? '14px' : 'inherit'
            }}>
              {t('quantity')}:
            </label>
            <select
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              style={{
                padding: isMobile ? '10px 12px' : '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: isMobile ? '14px' : '14px',
                width: isMobile ? '100%' : 'auto',
                maxWidth: '100px'
              }}
            >
              {[...Array(10).keys()].map(num => (
                <option key={num + 1} value={num + 1}>
                  {num + 1}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div style={buttonContainerStyle}>
            <button
              onClick={handleAddToCart}
              style={buttonStyle}
              onMouseEnter={(e) => !isInCart && (e.target.style.backgroundColor = '#F7CA00')}
              onMouseLeave={(e) => !isInCart && (e.target.style.backgroundColor = '#FFD814')}
            >
              {getAddToCartButtonText()}
            </button>
            
            <button
              onClick={handleBuyNow}
              style={buyNowButtonStyle}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#FA8900'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#FFA41C'}
            >
              {t('buyNow')}
            </button>
          </div>

          {/* Added to cart confirmation for mobile */}
          {isInCart && isMobile && (
            <div style={{
              textAlign: 'center',
              marginTop: '8px',
              fontSize: '14px',
              color: '#067D62',
              fontWeight: 'bold'
            }}>
              ✓ {t('addedToCart')}
            </div>
          )}
        </div>
      </div>

      {/* Related Products Section */}
      <div style={{ 
        borderTop: '1px solid #ddd',
        paddingTop: isMobile ? '20px' : '30px',
        marginTop: isMobile ? '20px' : '30px'
      }}>
        <h3 style={{ 
          fontSize: isMobile ? '16px' : '18px', 
          marginBottom: isMobile ? '16px' : '20px',
          fontWeight: '500'
        }}>
          {t('youMightAlsoLike')}
        </h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobile ? 'repeat(auto-fit, minmax(150px, 1fr))' : 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: isMobile ? '12px' : '20px'
        }}>
          <div style={{ 
            textAlign: 'center', 
            color: '#666', 
            fontSize: isMobile ? '13px' : '14px',
            padding: isMobile ? '10px' : '0'
          }}>
            {t('browseMore')} <span 
              style={{ color: '#0066c0', cursor: 'pointer' }} 
              onClick={() => navigate('/products')}
            >
              {t('ourStore')}
            </span>
          </div>
        </div>
      </div>

      {/* Zoom Modal for Mobile */}
      {showZoomModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10001,
            padding: '20px'
          }}
          onClick={closeZoomModal}
        >
          <div 
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={mainImage} 
              alt={product.name}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                transform: `scale(${zoomLevel})`,
                transition: 'transform 0.3s ease'
              }}
              onError={(e) => {
                if (e.target.src !== fallbackImage) {
                  e.target.src = fallbackImage;
                }
              }}
            />
            
            {/* Mobile Zoom Controls */}
            <div style={{
              position: 'absolute',
              bottom: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: '10px',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              padding: '10px',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
            }}>
              <button
                onClick={handleZoomIn}
                style={{
                  padding: '10px 15px',
                  backgroundColor: '#007185',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                +
              </button>
              <button
                onClick={handleZoomOut}
                style={{
                  padding: '10px 15px',
                  backgroundColor: '#007185',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                -
              </button>
              <button
                onClick={handleResetZoom}
                style={{
                  padding: '10px 15px',
                  backgroundColor: '#007185',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                ⟲
              </button>
              <button
                onClick={closeZoomModal}
                style={{
                  padding: '10px 15px',
                  backgroundColor: '#B12704',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                {t('close')}
              </button>
            </div>
            
            {/* Zoom level indicator */}
            <div style={{
              position: 'absolute',
              top: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
              {Math.round(zoomLevel * 100)}%
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10000,
            padding: isMobile ? '16px' : '20px'
          }}
          onClick={closeShareModal}
        >
          <div 
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: isMobile ? '20px' : '24px',
              width: '100%',
              maxWidth: isMobile ? '100%' : '500px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
              position: 'relative',
              maxHeight: isMobile ? '90vh' : 'auto',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={closeShareModal}
              style={{
                position: 'absolute',
                top: isMobile ? '12px' : '16px',
                right: isMobile ? '12px' : '16px',
                background: 'none',
                border: 'none',
                fontSize: isMobile ? '20px' : '24px',
                cursor: 'pointer',
                color: '#666',
                width: isMobile ? '28px' : '32px',
                height: isMobile ? '28px' : '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#f5f5f5'}
              onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              ×
            </button>

            {/* Modal Header */}
            <div style={{ marginBottom: isMobile ? '20px' : '24px', textAlign: 'center' }}>
              <h2 style={{ 
                margin: '0 0 8px 0', 
                fontSize: isMobile ? '18px' : '20px', 
                fontWeight: 'bold',
                color: '#0F1111'
              }}>
                {t('shareProduct')}
              </h2>
              <p style={{ 
                margin: 0, 
                color: '#666', 
                fontSize: isMobile ? '13px' : '14px'
              }}>
                {t('shareMessage', { productName: product.name })}
              </p>
            </div>

            {/* Share Options */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', 
              gap: isMobile ? '10px' : '12px',
              marginBottom: isMobile ? '20px' : '24px'
            }}>
              {/* WhatsApp */}
              <button
                onClick={shareOnWhatsApp}
                style={{
                  ...socialButtonStyle,
                  borderColor: '#25D366'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#25D366';
                  e.target.style.color = 'white';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = 'white';
                  e.target.style.color = 'inherit';
                }}
              >
                <WhatsAppIcon size={isMobile ? 28 : 32} color="#25D366" />
                <span style={{ fontSize: isMobile ? '11px' : '12px', fontWeight: '500' }}>{t('shareViaWhatsApp')}</span>
              </button>

              {/* Facebook */}
              <button
                onClick={shareOnFacebook}
                style={{
                  ...socialButtonStyle,
                  borderColor: '#1877F2'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#1877F2';
                  e.target.style.color = 'white';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = 'white';
                  e.target.style.color = 'inherit';
                }}
              >
                <FacebookIcon size={isMobile ? 28 : 32} color="#1877F2" />
                <span style={{ fontSize: isMobile ? '11px' : '12px', fontWeight: '500' }}>{t('shareViaFacebook')}</span>
              </button>

              {/* Twitter */}
              <button
                onClick={shareOnTwitter}
                style={{
                  ...socialButtonStyle,
                  borderColor: '#1DA1F2'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#1DA1F2';
                  e.target.style.color = 'white';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = 'white';
                  e.target.style.color = 'inherit';
                }}
              >
                <TwitterIcon size={isMobile ? 28 : 32} color="#1DA1F2" />
                <span style={{ fontSize: isMobile ? '11px' : '12px', fontWeight: '500' }}>{t('shareViaTwitter')}</span>
              </button>

              {/* LinkedIn */}
              <button
                onClick={shareOnLinkedIn}
                style={{
                  ...socialButtonStyle,
                  borderColor: '#0077B5'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#0077B5';
                  e.target.style.color = 'white';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = 'white';
                  e.target.style.color = 'inherit';
                }}
              >
                <LinkedInIcon size={isMobile ? 28 : 32} color="#0077B5" />
                <span style={{ fontSize: isMobile ? '11px' : '12px', fontWeight: '500' }}>{t('shareViaLinkedIn')}</span>
              </button>

              {/* Telegram */}
              <button
                onClick={shareOnTelegram}
                style={{
                  ...socialButtonStyle,
                  borderColor: '#0088CC'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#0088CC';
                  e.target.style.color = 'white';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = 'white';
                  e.target.style.color = 'inherit';
                }}
              >
                <TelegramIcon size={isMobile ? 28 : 32} color="#0088CC" />
                <span style={{ fontSize: isMobile ? '11px' : '12px', fontWeight: '500' }}>{t('shareViaTelegram')}</span>
              </button>

              {/* Email */}
              <button
                onClick={shareViaEmail}
                style={{
                  ...socialButtonStyle,
                  borderColor: '#EA4335'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#EA4335';
                  e.target.style.color = 'white';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = 'white';
                  e.target.style.color = 'inherit';
                }}
              >
                <EmailIcon size={isMobile ? 28 : 32} color="#EA4335" />
                <span style={{ fontSize: isMobile ? '11px' : '12px', fontWeight: '500' }}>{t('shareViaEmail')}</span>
              </button>
            </div>

            {/* Copy Link Section */}
            <div>
              <p style={{ 
                fontSize: isMobile ? '13px' : '14px', 
                color: '#666', 
                marginBottom: isMobile ? '10px' : '12px',
                textAlign: 'center'
              }}>
                {t('orCopyLink')}
              </p>
              <div style={{ 
                display: 'flex', 
                flexDirection: isMobile ? 'column' : 'row', 
                gap: isMobile ? '10px' : '8px',
                alignItems: 'stretch'
              }}>
                <div style={{ 
                  flex: 1,
                  position: 'relative',
                  minHeight: isMobile ? '44px' : 'auto'
                }}>
                  <input
                    type="text"
                    value={getShareUrl()}
                    readOnly
                    style={{
                      width: '100%',
                      padding: isMobile ? '12px 40px 12px 12px' : '12px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: isMobile ? '14px' : '14px',
                      backgroundColor: '#f9f9f9',
                      color: '#666',
                      boxSizing: 'border-box',
                      height: isMobile ? '44px' : 'auto',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  />
                  {/* Mobile copy icon */}
                  {isMobile && (
                    <button
                      onClick={copyToClipboard}
                      style={{
                        position: 'absolute',
                        right: '8px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: copiedLink ? '#067D62' : '#666',
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: '4px',
                        fontSize: '16px'
                      }}
                    >
                      <CopyIcon size={16} color={copiedLink ? '#067D62' : '#666'} />
                    </button>
                  )}
                </div>
                {!isMobile && (
                  <button
                    onClick={copyToClipboard}
                    style={{
                      padding: isMobile ? '12px 16px' : '12px 20px',
                      backgroundColor: copiedLink ? '#067D62' : '#007185',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: isMobile ? '14px' : '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      whiteSpace: 'nowrap',
                      minWidth: '100px',
                      height: isMobile ? '44px' : 'auto',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                    onMouseOver={(e) => !copiedLink && (e.target.style.backgroundColor = '#005a6e')}
                    onMouseOut={(e) => !copiedLink && (e.target.style.backgroundColor = '#007185')}
                  >
                    <CopyIcon size={16} color="white" />
                    {copiedLink ? t('linkCopied') : t('copyLink')}
                  </button>
                )}
              </div>
              {isMobile && (
                <button
                  onClick={copyToClipboard}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    backgroundColor: copiedLink ? '#067D62' : '#007185',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                    marginTop: '10px',
                    height: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <CopyIcon size={16} color="white" />
                  {copiedLink ? t('linkCopied') : t('copyLink')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10000,
            padding: '20px'
          }}
          onClick={closeAuthModal}
        >
          <div 
            style={{
              background: 'white',
              borderRadius: '8px',
              padding: '24px',
              width: '100%',
              maxWidth: '400px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={closeAuthModal}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'none',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                color: '#666',
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#f5f5f5'}
              onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              ×
            </button>

            {/* Modal Header */}
            <div style={{ marginBottom: '24px', textAlign: 'center' }}>
              <h2 style={{ 
                margin: '0 0 8px 0', 
                fontSize: '24px', 
                fontWeight: 'bold',
                color: '#0F1111'
              }}>
                {isSignUp ? t('welcome') : t('welcomeBack')}
              </h2>
              <p style={{ 
                margin: 0, 
                color: '#666', 
                fontSize: '14px'
              }}>
                {isSignUp ? t('createNewAccount') : t('signInToYourAccount')}
              </p>
            </div>

            {/* Error Message */}
            {authError && (
              <div style={{
                background: '#fee',
                color: '#c33',
                padding: '12px',
                borderRadius: '4px',
                marginBottom: '16px',
                fontSize: '14px',
                border: '1px solid #fcc'
              }}>
                {authError}
              </div>
            )}

            {/* Auth Form */}
            <form onSubmit={handleAuthSubmit}>
              {isSignUp && (
                <>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{
                      display: 'block',
                      marginBottom: '6px',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      color: '#0F1111'
                    }}>
                      {t('firstName')}
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={authForm.firstName}
                      onChange={handleAuthInputChange}
                      required={isSignUp}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '14px',
                        boxSizing: 'border-box',
                        transition: 'border-color 0.2s ease'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#007185'}
                      onBlur={(e) => e.target.style.borderColor = '#ddd'}
                      placeholder={t('firstName')}
                    />
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{
                      display: 'block',
                      marginBottom: '6px',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      color: '#0F1111'
                    }}>
                      {t('lastName')}
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={authForm.lastName}
                      onChange={handleAuthInputChange}
                      required={isSignUp}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '14px',
                        boxSizing: 'border-box',
                        transition: 'border-color 0.2s ease'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#007185'}
                      onBlur={(e) => e.target.style.borderColor = '#ddd'}
                      placeholder={t('lastName')}
                    />
                  </div>
                </>
              )}

              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: '#0F1111'
                }}>
                  {t('email')}
                </label>
                <input
                  type="email"
                  name="email"
                  value={authForm.email}
                  onChange={handleAuthInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#007185'}
                  onBlur={(e) => e.target.style.borderColor = '#ddd'}
                  placeholder="your@email.com"
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: '#0F1111'
                }}>
                  {t('password')}
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={authForm.password}
                    onChange={handleAuthInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 45px 12px 12px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.2s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#007185'}
                    onBlur={(e) => e.target.style.borderColor = '#ddd'}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#666',
                      cursor: 'pointer',
                      padding: '5px',
                      borderRadius: '3px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#f7fafc';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                    }}
                  >
                    {showPassword ? t('hidePassword') : t('showPassword')}
                  </button>
                </div>
                {isSignUp && (
                  <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                    Password must be at least 6 characters long
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={authLoading || (isSignUp && authForm.password.length < 6)}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: authLoading || (isSignUp && authForm.password.length < 6) ? '#ccc' : '#FFD814',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: authLoading || (isSignUp && authForm.password.length < 6) ? '#666' : '#0F1111',
                  cursor: authLoading || (isSignUp && authForm.password.length < 6) ? 'not-allowed' : 'pointer',
                  marginBottom: '16px',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseOver={(e) => {
                  if (!authLoading && !(isSignUp && authForm.password.length < 6)) {
                    e.target.style.backgroundColor = '#F7CA00'
                  }
                }}
                onMouseOut={(e) => {
                  if (!authLoading && !(isSignUp && authForm.password.length < 6)) {
                    e.target.style.backgroundColor = '#FFD814'
                  }
                }}
              >
                {authLoading ? t('processing') : (isSignUp ? t('createAccount') : t('continue'))}
              </button>
            </form>

            {/* Auth Toggle */}
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '14px', color: '#666' }}>
                {isSignUp ? t('alreadyHaveAccount') : t('dontHaveAccount')}{' '}
                <button
                  onClick={() => setIsSignUp(!isSignUp)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#007185',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  {isSignUp ? t('signIn') : t('signUp')}
                </button>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;