import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authenticateCustomer, registerCustomer } from '../utils/auth'

const ProductCard = ({ product, onAddToCart, user, currentLanguage = 'en', onSignIn, setUser }) => {
  const navigate = useNavigate()
  const [isInCart, setIsInCart] = useState(false)
  const [currentCurrency, setCurrentCurrency] = useState('UGX')
  const [exchangeRates] = useState({
    USD: 1,
    EUR: 0.85,
    UGX: 3700
  })
  const [userRating, setUserRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [productRating, setProductRating] = useState(0)
  const [reviewCount, setReviewCount] = useState(0)
  const [ratingDistribution, setRatingDistribution] = useState({})
  const [showRatingBreakdown, setShowRatingBreakdown] = useState(false)
  const [isSmallDevice, setIsSmallDevice] = useState(false)

  // Authentication modal states
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [authForm, setAuthForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: ''
  })
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState(null)
  const [showPassword, setShowPassword] = useState(false)

  // Translation dictionary for ProductCard
  const translations = {
    en: {
      yourRating: "Your rating",
      customerReviews: "Customer reviews",
      globalRatings: "global ratings",
      shareYourThoughts: "Share your thoughts",
      rateThisProduct: "Rate this product",
      signInToRate: "Sign in to rate",
      pleaseSignInToRate: "Please sign in to rate this product",
      addedToCart: "Added to cart",
      addToCart: "Add to Cart",
      viewCart: "View Cart",
      itemInCart: "Item is in cart!",
      cartHasItems: "Cart has {count} items",
      clickCartIcon: "Click the cart icon in navigation to view",
      ratingSubmitted: "Rating submitted!",
      pleaseSignInToRateProducts: "Please sign in to rate products",
      signIn: "Sign In",
      star: "star",
      stars: "stars",
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
      hidePassword: "Hide password"
    },
    es: {
      yourRating: "Tu calificación",
      customerReviews: "Opiniones de clientes",
      globalRatings: "calificaciones globales",
      shareYourThoughts: "Comparte tu opinión",
      rateThisProduct: "Calificar este producto",
      signInToRate: "Inicia sesión para calificar",
      pleaseSignInToRate: "Por favor inicia sesión para calificar este producto",
      addedToCart: "Agregado al carrito",
      addToCart: "Agregar al Carrito",
      viewCart: "Ver Carrito",
      itemInCart: "¡Artículo en el carrito!",
      cartHasItems: "El carrito tiene {count} artículos",
      clickCartIcon: "Haz clic en el icono del carrito en la navegación para ver",
      ratingSubmitted: "¡Calificación enviada!",
      pleaseSignInToRateProducts: "Por favor inicia sesión para calificar productos",
      signIn: "Iniciar Sesión",
      star: "estrella",
      stars: "estrellas",
      email: "Correo electrónico",
      password: "Contraseña",
      signInToContinue: "Inicia sesión para continuar",
      dontHaveAccount: "¿No tienes una cuenta?",
      signUp: "Regístrate",
      close: "Cerrar",
      welcomeBack: "Bienvenido de nuevo",
      signInToYourAccount: "Inicia sesión en tu cuenta para continuar",
      invalidCredentials: "Correo electrónico o contraseña inválidos",
      signInSuccess: "¡Sesión iniciada correctamente!",
      alreadyHaveAccount: "¿Ya tienes cuenta?",
      createAccount: "Crear cuenta",
      firstName: "Nombre",
      lastName: "Apellido",
      phone: "Número de teléfono",
      welcome: "Bienvenido a ROBERT & IZAK COMPUTERS",
      createNewAccount: "Crea tu cuenta",
      signUpSuccess: "¡Cuenta creada exitosamente!",
      processing: "Procesando...",
      continue: "Continuar",
      showPassword: "Mostrar contraseña",
      hidePassword: "Ocultar contraseña"
    },
    fr: {
      yourRating: "Votre note",
      customerReviews: "Avis des clients",
      globalRatings: "notes globales",
      shareYourThoughts: "Partagez votre avis",
      rateThisProduct: "Noter ce produit",
      signInToRate: "Connectez-vous pour noter",
      pleaseSignInToRate: "Veuillez vous connecter pour noter ce producto",
      addedToCart: "Ajouté au panier",
      addToCart: "Ajouter au Panier",
      viewCart: "Voir le Panier",
      itemInCart: "Article dans le panier !",
      cartHasItems: "Le panier a {count} articles",
      clickCartIcon: "Cliquez sur l'icône du panier dans la navigation pour voir",
      ratingSubmitted: "Note soumise !",
      pleaseSignInToRateProducts: "Veuillez vous connecter pour noter les productos",
      signIn: "Se Connecter",
      star: "étoile",
      stars: "étoiles",
      email: "E-mail",
      password: "Mot de passe",
      signInToContinue: "Connectez-vous pour continuar",
      dontHaveAccount: "Vous n'avez pas de compte ?",
      signUp: "S'inscrire",
      close: "Fermer",
      welcomeBack: "Bon retour",
      signInToYourAccount: "Connectez-vous à votre compte pour continuer",
      invalidCredentials: "E-mail ou mot de passe invalide",
      signInSuccess: "Connecté avec succès !",
      alreadyHaveAccount: "Vous avez déjà un compte ?",
      createAccount: "Créer un compte",
      firstName: "Prénom",
      lastName: "Nom",
      phone: "Numéro de téléphone",
      welcome: "Bienvenue chez ROBERT & IZAK COMPUTERS",
      createNewAccount: "Créez votre compte",
      signUpSuccess: "Compte créé avec succès !",
      processing: "Traitement...",
      continue: "Continuer",
      showPassword: "Afficher le mot de passe",
      hidePassword: "Masquer le mot de passe"
    }
  }

  // Translation helper function
  const t = (key, params = {}) => {
    const translation = translations[currentLanguage]?.[key] || translations.en[key] || key
    return translation.replace(/{(\w+)}/g, (match, param) => params[param] || match)
  }

  // Check screen size on mount and resize
  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallDevice(window.innerWidth <= 768)
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  // Load currency from localStorage on mount
  useEffect(() => {
    const savedCurrency = localStorage.getItem('robert-izak-computers-currency')
    if (savedCurrency && ['UGX', 'USD', 'EUR'].includes(savedCurrency)) {
      setCurrentCurrency(savedCurrency)
    } else {
      setCurrentCurrency('UGX')
      localStorage.setItem('robert-izak-computers-currency', 'UGX')
    }
  }, [])

  // Load user rating from localStorage on mount
  useEffect(() => {
    const savedRatings = localStorage.getItem('robert-izak-computers-ratings')
    if (savedRatings) {
      try {
        const ratings = JSON.parse(savedRatings)
        const productRating = ratings[product.id]
        if (productRating) {
          setUserRating(productRating)
        }
      } catch (error) {
        console.error('Error loading ratings:', error)
      }
    }
  }, [product.id])

  // Generate consistent product rating, review count, and distribution based on product ID
  useEffect(() => {
    if (product.id) {
      const generateConsistentRating = (id) => {
        let hash = 0;
        for (let i = 0; i < id.length; i++) {
          hash = ((hash << 5) - hash) + id.charCodeAt(i);
          hash = hash & hash;
        }
        const rating = 3.8 + (Math.abs(hash) % 110) / 100;
        return Math.min(rating, 4.9).toFixed(1);
      };

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

      const generateRatingDistribution = (id, avgRating) => {
        const hash = id.split('').reduce((a, b) => {
          a = ((a << 5) - a) + b.charCodeAt(0);
          return a & a;
        }, 0);
        
        const avg = parseFloat(avgRating);
        const distributions = {
          high: [2, 3, 10, 25, 60],
          medium: [5, 10, 20, 35, 30],
          low: [10, 20, 30, 25, 15]
        };
        
        let distributionType = 'medium';
        if (avg >= 4.5) distributionType = 'high';
        else if (avg <= 3.5) distributionType = 'low';
        
        const percentages = distributions[distributionType];
        const totalReviews = Math.abs(hash) % 5000 + 500;
        
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
  }, [product.id]);

  // Listen for currency changes
  useEffect(() => {
    const handleCurrencyChange = (event) => {
      setCurrentCurrency(event.detail)
    }

    window.addEventListener('currencyChange', handleCurrencyChange)
    return () => window.removeEventListener('currencyChange', handleCurrencyChange)
  }, [])

  // Listen for language changes
  useEffect(() => {
    const handleLanguageChange = (event) => {
      // This will be triggered when language changes in Header
      console.log('Language changed in ProductCard:', event.detail)
    }

    window.addEventListener('languageChange', handleLanguageChange)
    return () => window.removeEventListener('languageChange', handleLanguageChange)
  }, [])

  // Convert price
  const convertPrice = (priceUSD) => {
    const rate = exchangeRates[currentCurrency] || 1
    const converted = priceUSD * rate

    return currentCurrency === 'UGX'
      ? Math.round(converted).toLocaleString()
      : converted.toFixed(2)
  }

  // Get currency symbol
  const getCurrencySymbol = () => {
    switch (currentCurrency) {
      case 'EUR': return '€'
      case 'UGX': return 'USh '
      default: return '$'
    }
  }

  // Check if product is in cart
  useEffect(() => {
    const checkIfInCart = () => {
      try {
        const savedCart = localStorage.getItem('robert-izak-computers-cart')
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart)
          const productInCart = parsedCart.find(item => item.id === product.id)
          setIsInCart(!!productInCart)
        }
      } catch (error) {
        console.error('Error checking cart:', error)
      }
    }

    checkIfInCart()

    const handleStorageChange = (e) => {
      if (e.key === 'robert-izak-computers-cart') checkIfInCart()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('cartUpdated', checkIfInCart)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('cartUpdated', checkIfInCart)
    }
  }, [product.id])

  // Handle product click to navigate to details
  const handleProductClick = () => {
    navigate(`/product/${product.id}`)
  }

  // Save rating to localStorage
  const saveRatingToStorage = (rating) => {
    try {
      const savedRatings = localStorage.getItem('robert-izak-computers-ratings')
      const ratings = savedRatings ? JSON.parse(savedRatings) : {}
      
      ratings[product.id] = rating
      localStorage.setItem('robert-izak-computers-ratings', JSON.stringify(ratings))
      
      // Show success message for signed-in users
      if (user) {
        showToast(t('ratingSubmitted'), 'success')
      }
    } catch (error) {
      console.error('Error saving rating to localStorage:', error)
    }
  }

  // Open auth modal
  const openAuthModal = (isSignUpMode = false) => {
    setIsSignUp(isSignUpMode)
    setShowAuthModal(true)
    setAuthError(null)
    setAuthForm({ email: '', password: '', firstName: '', lastName: '', phone: '' })
  }

  // Close auth modal
  const closeAuthModal = () => {
    setShowAuthModal(false)
    setAuthForm({ email: '', password: '', firstName: '', lastName: '', phone: '' })
    setAuthError(null)
    setAuthLoading(false)
    setShowPassword(false)
  }

  // Handle auth form input changes
  const handleAuthInputChange = (e) => {
    const { name, value } = e.target
    setAuthForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  // Handle auth form submission with Supabase integration
  const handleAuthSubmit = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setAuthLoading(true)
    setAuthError(null)

    try {
      let result

      if (isSignUp) {
        // Customer registration with Supabase
        const userData = {
          firstName: authForm.firstName,
          lastName: authForm.lastName,
          phone: authForm.phone
        }
        
        result = await registerCustomer(authForm.email, authForm.password, userData)
        
        if (result.success) {
          // Auto-signin after registration
          const signInResult = await authenticateCustomer(authForm.email, authForm.password)
          if (signInResult.success) {
            const user = {
              id: signInResult.customer.id,
              email: signInResult.customer.email,
              user_metadata: {
                first_name: signInResult.customer.first_name,
                last_name: signInResult.customer.last_name
              },
              isAdmin: false
            }
            
            // Set user in parent component if provided
            if (setUser) {
              setUser(user)
            }
            
            // Store user in localStorage
            localStorage.setItem('robert-izak-computers-user', JSON.stringify(user))
            
            // Dispatch event to notify other components
            window.dispatchEvent(new CustomEvent('userSignedIn', { detail: user }))
            
            showToast(t('signUpSuccess'), 'success')
          } else {
            setAuthError('Account created! Please sign in.')
            setIsSignUp(false)
            return
          }
        } else {
          throw new Error(result.error)
        }
      } else {
        // Customer authentication with Supabase
        result = await authenticateCustomer(authForm.email, authForm.password)
        
        if (result.success) {
          const user = {
            id: result.customer.id,
            email: result.customer.email,
            user_metadata: {
              first_name: result.customer.first_name,
              last_name: result.customer.last_name
            },
            isAdmin: false
          }
          
          // Set user in parent component if provided
          if (setUser) {
            setUser(user)
          }
          
          // Store user in localStorage
          localStorage.setItem('robert-izak-computers-user', JSON.stringify(user))
          
          // Dispatch event to notify other components
          window.dispatchEvent(new CustomEvent('userSignedIn', { detail: user }))
          
          showToast(t('signInSuccess'), 'success')
        } else {
          throw new Error(result.error)
        }
      }

      // Close modal
      closeAuthModal()
    } catch (err) {
      console.error('Authentication error:', err)
      setAuthError(err.message)
    } finally {
      setAuthLoading(false)
    }
  }

  // Show toast message
  const showToast = (message, type = 'success') => {
    const toast = document.createElement('div')
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
    `
    toast.textContent = message
    document.body.appendChild(toast)

    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease'
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast)
        }
      }, 300)
    }, 3000)
  }

  // Star rating handlers
  const handleStarClick = (rating) => {
    if (!user) {
      openAuthModal(false)
      return
    }
    
    setUserRating(rating)
    saveRatingToStorage(rating)
  }

  const handleStarHover = (rating) => {
    if (!user) return
    setHoverRating(rating)
  }

  const handleMouseLeave = () => {
    if (!user) return
    setHoverRating(0)
  }

  // Calculate percentage for rating bar
  const calculatePercentage = (starCount) => {
    const total = Object.values(ratingDistribution).reduce((sum, count) => sum + count, 0)
    if (total === 0) return 0
    return Math.round((starCount / total) * 100)
  }

  // Get star text for rating breakdown
  const getStarText = (star) => {
    return star === 1 ? t('star') : t('stars')
  }

  // Render star rating display (for product rating, not interactive)
  const renderStarRating = (rating) => {
    const numericRating = parseFloat(rating);
    const fullStars = Math.floor(numericRating);
    const hasHalfStar = numericRating % 1 >= 0.3 && numericRating % 1 < 0.8;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <>
        {[...Array(fullStars)].map((_, i) => (
          <span key={`full-${i}`} style={{ color: '#ffa41c' }}>★</span>
        ))}
        
        {hasHalfStar && (
          <span style={{ color: '#ffa41c', position: 'relative' }}>
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
          <span key={`empty-${i}`} style={{ color: '#ddd' }}>★</span>
        ))}
      </>
    );
  };

  // Simple and reliable cart opening function
  const openCart = () => {
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
        element.click();
        return true;
      }
    }
    
    window.dispatchEvent(new CustomEvent('openCart', {
      detail: { productId: product.id }
    }));
    
    const cart = JSON.parse(localStorage.getItem('robert-izak-computers-cart') || '[]');
    
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

  const handleButtonClick = (e) => {
    e.stopPropagation();
    if (isInCart) {
      if (!isSmallDevice) {
        openCart();
      }
    } else {
      onAddToCart(product)
      setIsInCart(true)

      setTimeout(() => {
        const savedCart = localStorage.getItem('robert-izak-computers-cart')
        let cart = savedCart ? JSON.parse(savedCart) : []
        if (!cart.some(item => item.id === product.id)) {
          cart.push({ ...product, quantity: 1 })
          localStorage.setItem('robert-izak-computers-cart', JSON.stringify(cart))
        }
        window.dispatchEvent(new Event('cartUpdated'))
      }, 50)

      setTimeout(() => {
        showToast(t('addedToCart'), 'success')
      }, 100)
    }
  }

  // Handle rating click to prevent navigation
  const handleRatingClick = (e) => {
    e.stopPropagation();
  }

  // Get button text based on device size and cart status
  const getButtonText = () => {
    if (!isInCart) {
      return t('addToCart');
    }
    return isSmallDevice ? t('addedToCart') : t('viewCart');
  };

  // Fallback placeholder (SVG)
  const fallbackImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjUwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjRkZGRkZGIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NjY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='

  return (
    <div className="amazon-product-card" onClick={handleProductClick} style={{ 
      cursor: 'pointer',
      width: '100%',
      maxWidth: '100%',
      boxSizing: 'border-box'
    }}>
      <div className="product-image-container">
        <img
          src={product.image_url || fallbackImage}
          alt={product.name || 'Product'}
          className="product-image"
          loading="lazy"
          onError={(e) => {
            if (e.target.src !== fallbackImage) {
              e.target.src = fallbackImage
            }
          }}
        />
      </div>

      {/* REMOVED PRIME BADGE */}

      <h3 className="product-title">{product.name}</h3>

      {/* Product Short Description */}
      {product.short_description && (
        <div className="product-description" style={{
          fontSize: '14px',
          color: '#0F1111',
          lineHeight: '1.4',
          marginBottom: '8px',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          minHeight: '40px'
        }}>
          {product.short_description}
        </div>
      )}

      <div className="product-rating" onClick={handleRatingClick}>
        {userRating > 0 ? (
          <div 
            className="star-rating"
            onMouseLeave={handleMouseLeave}
          >
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`star ${(hoverRating || userRating) >= star ? 'active' : ''}`}
                onClick={() => handleStarClick(star)}
                onMouseEnter={() => handleStarHover(star)}
                style={{
                  cursor: user ? 'pointer' : 'not-allowed',
                  fontSize: '18px',
                  color: (hoverRating || userRating) >= star ? '#ffa41c' : '#ddd',
                  transition: 'color 0.2s ease',
                  marginRight: '2px',
                  opacity: user ? 1 : 0.5
                }}
                title={user ? `${t('rateThisProduct')} ${star} ${getStarText(star)}` : t('signInToRate')}
              >
                ★
              </span>
            ))}
            <span 
              className="rating-count your-rating-text" 
              style={{ marginLeft: '8px', fontSize: '14px', color: '#007185', cursor: 'pointer' }}
              onClick={() => setShowRatingBreakdown(!showRatingBreakdown)}
            >
              {t('yourRating')} • {productRating} ({reviewCount})
            </span>
          </div>
        ) : (
          <div 
            className="product-rating-display"
            style={{ cursor: 'pointer' }}
            onClick={() => setShowRatingBreakdown(!showRatingBreakdown)}
          >
            <div style={{ display: 'inline-block', marginRight: '8px' }}>
              {renderStarRating(productRating)}
            </div>
            <span className="rating-count" style={{ fontSize: '14px', color: '#007185' }}>
              {productRating} ({reviewCount})
            </span>
          </div>
        )}
      </div>

      {/* Rating Breakdown */}
      {showRatingBreakdown && (
        <div className="rating-breakdown" style={{
          background: 'white',
          border: '1px solid #ddd',
          borderRadius: '8px',
          padding: '16px',
          margin: '8px 0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          position: 'relative',
          zIndex: 10
        }} onClick={(e) => e.stopPropagation()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <strong style={{ fontSize: '14px' }}>{t('customerReviews')}</strong>
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
          
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', marginRight: '8px' }}>
              {productRating}
            </div>
            <div>
              <div>{renderStarRating(productRating)}</div>
              <div style={{ fontSize: '11px', color: '#666' }}>
                {Object.values(ratingDistribution).reduce((sum, count) => sum + count, 0).toLocaleString()} {t('globalRatings')}
              </div>
            </div>
          </div>
          
          <div style={{ marginBottom: '12px' }}>
            {[5, 4, 3, 2, 1].map(star => (
              <div key={star} style={{ display: 'flex', alignItems: 'center', marginBottom: '3px' }}>
                <div style={{ width: '30px', fontSize: '11px', color: '#666' }}>
                  {star} {getStarText(star)}
                </div>
                <div style={{ flex: 1, margin: '0 6px' }}>
                  <div style={{
                    width: '100%',
                    height: '6px',
                    backgroundColor: '#f0f0f0',
                    borderRadius: '3px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${calculatePercentage(ratingDistribution[star])}%`,
                      height: '100%',
                      backgroundColor: '#ffa41c'
                    }} />
                  </div>
                </div>
                <div style={{ width: '25px', fontSize: '11px', color: '#666', textAlign: 'right' }}>
                  {calculatePercentage(ratingDistribution[star])}%
                </div>
              </div>
            ))}
          </div>
          
          <div className="user-rating-section" style={{ borderTop: '1px solid #eee', paddingTop: '8px' }}>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '6px' }}>
              {t('shareYourThoughts')}
            </div>
            <div 
              className="star-rating-interactive"
              onMouseLeave={handleMouseLeave}
              style={{ display: 'flex', alignItems: 'center' }}
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`star ${(hoverRating || userRating) >= star ? 'active' : ''}`}
                  onClick={() => handleStarClick(star)}
                  onMouseEnter={() => handleStarHover(star)}
                  style={{
                    cursor: user ? 'pointer' : 'not-allowed',
                    fontSize: '18px',
                    color: (hoverRating || userRating) >= star ? '#ffa41c' : '#ddd',
                    transition: 'color 0.2s ease',
                    marginRight: '1px',
                    opacity: user ? 1 : 0.5
                  }}
                  title={user ? `${t('rateThisProduct')} ${star} ${getStarText(star)}` : t('signInToRate')}
                >
                  ★
                </span>
              ))}
              <span className="your-rating-text" style={{ marginLeft: '6px', fontSize: '12px', color: '#007185' }}>
                {userRating > 0 ? t('yourRating') : user ? t('rateThisProduct') : t('signInToRate')}
              </span>
            </div>
            {!user && (
              <div style={{
                fontSize: '11px',
                color: '#B12704',
                marginTop: '8px',
                padding: '8px',
                backgroundColor: '#FFF0F0',
                borderRadius: '4px',
                textAlign: 'center'
              }}>
                {t('pleaseSignInToRate')}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="product-price">
        <div className="price-main">
          {getCurrencySymbol()}{convertPrice(product.price)}
        </div>
      </div>

      <button
        className={`amazon-add-to-cart ${isInCart ? 'view-cart' : ''}`}
        onClick={handleButtonClick}
      >
        {getButtonText()}
      </button>

      {isInCart && isSmallDevice && (
        <div style={{
          textAlign: 'center',
          marginTop: '8px',
          fontSize: '12px',
          color: '#067D62',
          fontWeight: 'bold'
        }}>
          {t('addedToCart')}
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
  )
}

export default ProductCard