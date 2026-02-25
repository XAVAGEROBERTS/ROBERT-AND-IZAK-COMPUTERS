// src/pages/SignIn.js
import React, { useState, useEffect } from 'react';
import { authenticateCustomer, registerCustomer, signInWithGoogle } from '../utils/auth';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';

const SignIn = ({ currentLanguage, setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    phone: ''
  });
  const navigate = useNavigate();
  const location = useLocation();
  
  // ADDED: Redirect path state
  const [redirectPath, setRedirectPath] = useState('/home');

  // Handle URL parameters to determine which form to show
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');
    const redirect = urlParams.get('redirect'); // ADDED: Get redirect parameter
    
    console.log('SignIn URL action:', action);
    console.log('SignIn URL redirect:', redirect); // ADDED: Log redirect
    
    if (action === 'signup') {
      setIsSignUp(true);
      console.log('Showing Create Account form');
    } else {
      setIsSignUp(false);
      console.log('Showing Sign In form');
    }
    
    // ADDED: Parse redirect parameter
    if (redirect) {
      setRedirectPath(redirect);
      console.log('Setting redirect path to:', redirect);
    }
    
    // Clean up the URL after a short delay
    setTimeout(() => {
      // MODIFIED: Keep redirect parameter if exists
      const cleanUrl = redirect ? 
        `${window.location.pathname}?redirect=${encodeURIComponent(redirect)}` : 
        window.location.pathname;
      window.history.replaceState({}, '', cleanUrl);
      console.log('URL updated');
    }, 100);
  }, []);

  const translations = {
    en: {
      title: "ROBERT & IZAK COMPUTERS",
      signIn: "Sign in",
      createAccount: "Create account",
      email: "Email",
      password: "Password",
      continue: "Continue",
      conditions: "By continuing, you agree to ROBERT & IZAK COMPUTERS's Conditions of Use and Privacy Notice.",
      needHelp: "Need help?",
      newCustomer: "New customer?",
      startHere: "Start here.",
      alreadyHaveAccount: "Already have an account? Sign in",
      businessAccount: "Buying for work? Create a free business account",
      conditionsText: "Conditions of Use",
      privacyText: "Privacy Notice",
      helpText: "Help",
      copyright: "© 1996-2025, ROBERT & IZAK COMPUTERS, Inc. or its affiliates",
      firstName: "First Name",
      lastName: "Last Name",
      phone: "Phone Number",
      showPassword: "Show password",
      hidePassword: "Hide password",
      signInWithGoogle: "Sign in with Google",
      createWithGoogle: "Create account with Google"
    },
    es: {
      title: "ROBERT & IZAK COMPUTERS",
      signIn: "Iniciar sesión",
      createAccount: "Crear cuenta",
      email: "Correo electrónico",
      password: "Contraseña",
      continue: "Continuar",
      conditions: "Al continuar, aceptas las Condiciones de Uso y el Aviso de Privacidad de ROBERT & IZAK COMPUTERS.",
      needHelp: "¿Necesitas ayuda?",
      newCustomer: "¿Nuevo cliente?",
      startHere: "Comienza aquí.",
      alreadyHaveAccount: "¿Ya tienes una cuenta? Inicia sesión",
      businessAccount: "¿Compras para trabajo? Crea una cuenta de negocio gratuita",
      conditionsText: "Condiciones de Uso",
      privacyText: "Aviso de Privacidad",
      helpText: "Ayuda",
      copyright: "© 1996-2025, ROBERT & IZAK COMPUTERS, Inc. o sus afiliados",
      firstName: "Nombre",
      lastName: "Apellido",
      phone: "Número de teléfono",
      showPassword: "Mostrar contraseña",
      hidePassword: "Ocultar contraseña",
      signInWithGoogle: "Iniciar sesión con Google",
      createWithGoogle: "Crear cuenta con Google"
    },
    fr: {
      title: "ROBERT & IZAK COMPUTERS",
      signIn: "Se connecter",
      createAccount: "Créer un compte",
      email: "E-mail",
      password: "Mot de passe",
      continue: "Continuer",
      conditions: "En continuant, vous acceptez les Conditions d'Utilisation et la Notice de Confidentialité de ROBERT & IZAK COMPUTERS.",
      needHelp: "Besoin d'aide ?",
      newCustomer: "Nouveau client ?",
      startHere: "Commencez ici.",
      alreadyHaveAccount: "Vous avez déjà un compte ? Connectez-vous",
      businessAccount: "Achat professionnel ? Créez un compte entreprise gratuit",
      conditionsText: "Conditions d'Utilisation",
      privacyText: "Notice de Confidentialité",
      helpText: "Aide",
      copyright: "© 1996-2025, ROBERT & IZAK COMPUTERS, Inc. ou ses affiliés",
      firstName: "Prénom",
      lastName: "Nom",
      phone: "Numéro de téléphone",
      showPassword: "Afficher le mot de passe",
      hidePassword: "Masquer le mot de passe",
      signInWithGoogle: "Se connecter avec Google",
      createWithGoogle: "Créer un compte avec Google"
    }
  };

  // Function to check if current time is in dark theme period (6:30 PM to 8:00 AM EAT)
  const checkDarkTheme = () => {
    const now = new Date();
    
    // Convert to East Africa Time (UTC+3)
    const eatOffset = 3 * 60; // UTC+3 in minutes
    const localOffset = now.getTimezoneOffset();
    const eatTime = new Date(now.getTime() + (localOffset + eatOffset) * 60000);
    
    const hours = eatTime.getHours();
    const minutes = eatTime.getMinutes();
    const totalMinutes = hours * 60 + minutes;
    
    // Dark theme from 6:30 PM (18:30) to 8:00 AM (8:00)
    const eveningStart = 18 * 60 + 30; // 6:30 PM in minutes
    const morningEnd = 8 * 60; // 8:00 AM in minutes
    
    // Check if current time is between 6:30 PM and midnight OR between midnight and 8:00 AM
    const isDark = totalMinutes >= eveningStart || totalMinutes < morningEnd;
    
    return isDark;
  };

  useEffect(() => {
    // Check theme on component mount
    setIsDarkTheme(checkDarkTheme());
    
    // Set up interval to check theme every minute
    const interval = setInterval(() => {
      setIsDarkTheme(checkDarkTheme());
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const t = (key) => translations[currentLanguage]?.[key] || translations.en[key];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let result;

      if (isSignUp) {
        // Customer registration
        result = await registerCustomer(email, password, userData);
        
        if (result.success) {
          // Auto-signin after registration
          const signInResult = await authenticateCustomer(email, password);
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
            setUser(user);
            // UPDATED: Navigate to redirectPath or '/home'
            console.log('Redirecting after sign up to:', redirectPath);
            navigate(redirectPath || '/home');
          } else {
            setError('Account created! Please sign in.');
            setIsSignUp(false);
          }
        } else {
          throw new Error(result.error);
        }
      } else {
        // Customer authentication
        result = await authenticateCustomer(email, password);
        
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
          setUser(user);
          // UPDATED: Navigate to redirectPath or '/home'
          console.log('Redirecting after sign in to:', redirectPath);
          navigate(redirectPath || '/home');
        } else {
          throw new Error(result.error);
        }
      }

    } catch (err) {
      setError(err.message);
      console.error('Authentication error:', err);
    } finally {
      setLoading(false);
    }
  };

  // ADDED: Google Sign-In handler
  const handleGoogleSignIn = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true);
      setError(null);
      
      try {
        // Call your backend to handle Google sign-in
        const result = await signInWithGoogle(tokenResponse.access_token);
        
        if (result.success) {
          const user = {
            id: result.user.id,
            email: result.user.email,
            user_metadata: {
              first_name: result.user.first_name,
              last_name: result.user.last_name,
              picture: result.user.picture
            },
            isAdmin: false
          };
          setUser(user);
          console.log('Redirecting after Google sign in to:', redirectPath);
          navigate(redirectPath || '/home');
        } else {
          throw new Error(result.error);
        }
      } catch (err) {
        setError(err.message);
        console.error('Google sign-in error:', err);
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: (error) => {
      console.error('Google Sign-In Error:', error);
      setError('Google sign-in failed. Please try again.');
    },
    flow: 'implicit',
    scope: 'openid email profile',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Theme styles
  const themeStyles = {
    light: {
      background: 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)',
      cardBackground: 'white',
      textColor: '#333',
      secondaryText: '#666',
      borderColor: '#ddd',
      inputBorder: '#a6a6a6',
      errorBackground: '#fee',
      errorBorder: '#fcc',
      buttonBackground: '#FFD814',
      buttonColor: '#0F1111',
      linkColor: '#007185',
      googleButtonBackground: '#ffffff',
      googleButtonColor: '#3c4043',
      googleButtonBorder: '#dadce0'
    },
    dark: {
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
      cardBackground: '#2d3748',
      textColor: '#f7fafc',
      secondaryText: '#cbd5e0',
      borderColor: '#4a5568',
      inputBorder: '#718096',
      errorBackground: '#742a2a',
      errorBorder: '#c53030',
      buttonBackground: '#d69e2e',
      buttonColor: '#1a202c',
      linkColor: '#63b3ed',
      googleButtonBackground: '#4a5568',
      googleButtonColor: '#f7fafc',
      googleButtonBorder: '#718096'
    }
  };

  const currentTheme = isDarkTheme ? themeStyles.dark : themeStyles.light;

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: currentTheme.background,
      padding: '20px',
      transition: 'background 0.3s ease'
    }}>
      <div style={{
        background: currentTheme.cardBackground,
        padding: '40px',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '450px',
        border: `1px solid ${currentTheme.borderColor}`,
        transition: 'all 0.3s ease'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ 
            color: currentTheme.textColor, 
            marginBottom: '10px',
            fontSize: '28px',
            fontWeight: 'bold'
          }}>
            {t('title')}
          </h2>
          <p style={{ 
            color: currentTheme.secondaryText, 
            fontSize: '18px',
            fontWeight: '500'
          }}>
            {isSignUp ? t('createAccount') : t('signIn')}
          </p>
        </div>

        {error && (
          <div style={{
            background: currentTheme.errorBackground,
            color: isDarkTheme ? '#fc8181' : '#c33',
            padding: '12px',
            borderRadius: '4px',
            marginBottom: '20px',
            fontSize: '14px',
            border: `1px solid ${currentTheme.errorBorder}`
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {isSignUp && (
            <>
              <div style={{ marginBottom: '15px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '5px',
                  fontWeight: '600',
                  color: currentTheme.textColor,
                  fontSize: '14px'
                }}>
                  {t('firstName')}
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={userData.firstName}
                  onChange={handleInputChange}
                  placeholder={t('firstName')}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: `1px solid ${currentTheme.inputBorder}`,
                    borderRadius: '4px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    backgroundColor: isDarkTheme ? '#4a5568' : 'white',
                    color: currentTheme.textColor,
                    transition: 'all 0.3s ease'
                  }}
                  required={isSignUp}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '5px',
                  fontWeight: '600',
                  color: currentTheme.textColor,
                  fontSize: '14px'
                }}>
                  {t('lastName')}
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={userData.lastName}
                  onChange={handleInputChange}
                  placeholder={t('lastName')}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: `1px solid ${currentTheme.inputBorder}`,
                    borderRadius: '4px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    backgroundColor: isDarkTheme ? '#4a5568' : 'white',
                    color: currentTheme.textColor,
                    transition: 'all 0.3s ease'
                  }}
                  required={isSignUp}
                />
              </div>
            </>
          )}

          <div style={{ marginBottom: '15px' }}>
            <label style={{
              display: 'block',
              marginBottom: '5px',
              fontWeight: '600',
              color: currentTheme.textColor,
              fontSize: '14px'
            }}>
              {t('email')}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              style={{
                width: '100%',
                padding: '10px',
                border: `1px solid ${currentTheme.inputBorder}`,
                borderRadius: '4px',
                fontSize: '14px',
                boxSizing: 'border-box',
                backgroundColor: isDarkTheme ? '#4a5568' : 'white',
                color: currentTheme.textColor,
                transition: 'all 0.3s ease'
              }}
              required
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '5px',
              fontWeight: '600',
              color: currentTheme.textColor,
              fontSize: '14px'
            }}>
              {t('password')}
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '10px 45px 10px 10px',
                  border: `1px solid ${currentTheme.inputBorder}`,
                  borderRadius: '4px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  backgroundColor: isDarkTheme ? '#4a5568' : 'white',
                  color: currentTheme.textColor,
                  transition: 'all 0.3s ease'
                }}
                required
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
                  color: currentTheme.secondaryText,
                  cursor: 'pointer',
                  padding: '5px',
                  borderRadius: '3px',
                  fontSize: '12px',
                  fontWeight: '500',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = isDarkTheme ? '#4a5568' : '#f7fafc';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                }}
              >
                {showPassword ? t('hidePassword') : t('showPassword')}
              </button>
            </div>
            {isSignUp && (
              <p style={{ 
                fontSize: '12px', 
                color: currentTheme.secondaryText, 
                marginTop: '5px' 
              }}>
                Password must be at least 6 characters long
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || (isSignUp && password.length < 6)}
            style={{
              width: '100%',
              padding: '12px',
              background: loading || (isSignUp && password.length < 6) 
                ? (isDarkTheme ? '#4a5568' : '#ccc') 
                : currentTheme.buttonBackground,
              color: loading || (isSignUp && password.length < 6) 
                ? (isDarkTheme ? '#a0aec0' : '#666')
                : currentTheme.buttonColor,
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: (loading || (isSignUp && password.length < 6)) ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
              marginBottom: '15px'
            }}
            onMouseEnter={(e) => {
              if (!loading && !(isSignUp && password.length < 6)) {
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading && !(isSignUp && password.length < 6)) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
              }
            }}
          >
            {loading ? 'Processing...' : (isSignUp ? t('createAccount') : t('continue'))}
          </button>

          {/* ADDED: Divider */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            textAlign: 'center',
            color: currentTheme.secondaryText,
            margin: '20px 0'
          }}>
            <hr style={{
              flex: 1,
              border: 'none',
              borderTop: `1px solid ${currentTheme.borderColor}`
            }} />
            <span style={{ padding: '0 10px', fontSize: '12px' }}>OR</span>
            <hr style={{
              flex: 1,
              border: 'none',
              borderTop: `1px solid ${currentTheme.borderColor}`
            }} />
          </div>

          {/* ADDED: Google Sign-In Button */}
          <button
            type="button"
            onClick={() => handleGoogleSignIn()}
            disabled={googleLoading}
            style={{
              width: '100%',
              padding: '12px',
              background: currentTheme.googleButtonBackground,
              color: currentTheme.googleButtonColor,
              border: `1px solid ${currentTheme.googleButtonBorder}`,
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: googleLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
            onMouseEnter={(e) => {
              if (!googleLoading) {
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
              }
            }}
            onMouseLeave={(e) => {
              if (!googleLoading) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
              }
            }}
          >
            {/* Google G icon */}
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {googleLoading ? 'Processing...' : (isSignUp ? t('createWithGoogle') : t('signInWithGoogle'))}
          </button>
        </form>

        <div style={{ 
          marginTop: '20px', 
          textAlign: 'center',
          fontSize: '12px',
          color: currentTheme.secondaryText
        }}>
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: currentTheme.linkColor,
              cursor: 'pointer',
              textDecoration: 'underline',
              fontSize: '14px',
              marginBottom: '15px'
            }}
          >
            {isSignUp ? t('alreadyHaveAccount') : `${t('newCustomer')} ${t('startHere')}`}
          </button>

          <p style={{ fontSize: '12px', color: currentTheme.secondaryText, lineHeight: '1.4' }}>
            {t('conditions')}
          </p>
          
          <p style={{ fontSize: '12px', color: currentTheme.secondaryText, marginTop: '10px' }}>
            {t('needHelp')}
          </p>
        </div>

        <div style={{ 
          textAlign: 'center', 
          marginTop: '30px', 
          fontSize: '12px', 
          color: currentTheme.secondaryText,
          borderTop: `1px solid ${currentTheme.borderColor}`,
          paddingTop: '20px'
        }}>
          <div style={{ marginBottom: '10px' }}>
            <a href="#" style={{ 
              color: currentTheme.linkColor, 
              textDecoration: 'none', 
              margin: '0 8px' 
            }}>
              {t('conditionsText')}
            </a> | 
            <a href="#" style={{ 
              color: currentTheme.linkColor, 
              textDecoration: 'none', 
              margin: '0 8px' 
            }}>
              {t('privacyText')}
            </a> | 
            <a href="#" style={{ 
              color: currentTheme.linkColor, 
              textDecoration: 'none', 
              margin: '0 8px' 
            }}>
              {t('helpText')}
            </a>
          </div>
          <p style={{ margin: 0 }}>
            {t('copyright')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;