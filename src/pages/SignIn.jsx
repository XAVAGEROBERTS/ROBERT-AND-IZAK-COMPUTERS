// src/pages/SignIn.js
import React, { useState, useEffect } from 'react';
import { authenticateCustomer, registerCustomer } from '../utils/auth';
import { useNavigate, useLocation } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';

// Check if running on mobile (Capacitor) or web
const isNative = Capacitor.isNativePlatform();

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
  const [redirectPath, setRedirectPath] = useState('/home');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');
    const redirect = urlParams.get('redirect');

    if (action === 'signup') {
      setIsSignUp(true);
    } else {
      setIsSignUp(false);
    }

    if (redirect) {
      setRedirectPath(redirect);
    }

    setTimeout(() => {
      const cleanUrl = redirect ?
        `${window.location.pathname}?redirect=${encodeURIComponent(redirect)}` :
        window.location.pathname;
      window.history.replaceState({}, '', cleanUrl);
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
      firstName: "First Name",
      lastName: "Last Name",
      phone: "Phone Number",
      showPassword: "Show password",
      hidePassword: "Hide password",
      signInWithGoogle: "Sign in with Google",
      createWithGoogle: "Create account with Google",
      alreadyHaveAccount: "Already have an account? Sign in",
      newCustomer: "New customer?",
      startHere: "Start here."
    },
    es: {
      title: "ROBERT & IZAK COMPUTERS",
      signIn: "Iniciar sesión",
      createAccount: "Crear cuenta",
      email: "Correo electrónico",
      password: "Contraseña",
      continue: "Continuar",
      firstName: "Nombre",
      lastName: "Apellido",
      phone: "Número de teléfono",
      showPassword: "Mostrar contraseña",
      hidePassword: "Ocultar contraseña",
      signInWithGoogle: "Iniciar sesión con Google",
      createWithGoogle: "Crear cuenta con Google",
      alreadyHaveAccount: "¿Ya tienes una cuenta? Inicia sesión",
      newCustomer: "¿Nuevo cliente?",
      startHere: "Comienza aquí."
    },
    fr: {
      title: "ROBERT & IZAK COMPUTERS",
      signIn: "Se connecter",
      createAccount: "Créer un compte",
      email: "E-mail",
      password: "Mot de passe",
      continue: "Continuer",
      firstName: "Prénom",
      lastName: "Nom",
      phone: "Numéro de téléphone",
      showPassword: "Afficher le mot de passe",
      hidePassword: "Masquer le mot de passe",
      signInWithGoogle: "Se connecter avec Google",
      createWithGoogle: "Créer un compte avec Google",
      alreadyHaveAccount: "Vous avez déjà un compte ? Connectez-vous",
      newCustomer: "Nouveau client ?",
      startHere: "Commencez ici."
    }
  };

  const checkDarkTheme = () => {
    const now = new Date();
    const eatOffset = 3 * 60;
    const localOffset = now.getTimezoneOffset();
    const eatTime = new Date(now.getTime() + (localOffset + eatOffset) * 60000);
    const hours = eatTime.getHours();
    const minutes = eatTime.getMinutes();
    const totalMinutes = hours * 60 + minutes;
    const eveningStart = 18 * 60 + 30;
    const morningEnd = 8 * 60;
    return totalMinutes >= eveningStart || totalMinutes < morningEnd;
  };

  useEffect(() => {
    setIsDarkTheme(checkDarkTheme());
    const interval = setInterval(() => setIsDarkTheme(checkDarkTheme()), 60000);
    return () => clearInterval(interval);
  }, []);

  const t = (key) => translations[currentLanguage]?.[key] || translations.en[key];
  const currentYear = new Date().getFullYear();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let result;

      if (isSignUp) {
        result = await registerCustomer(email, password, userData);
        if (result.success) {
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
            navigate(redirectPath || '/home');
          } else {
            setError('Account created! Please sign in.');
            setIsSignUp(false);
          }
        } else {
          throw new Error(result.error);
        }
      } else {
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

  // ============================================================================
  // GOOGLE SIGN-IN - Using @codetrix-studio/capacitor-google-auth
  // ============================================================================
  const handleGoogleSignIn = async () => {
    console.log('Google Sign-In button clicked');
    setGoogleLoading(true);
    setError(null);

    try {
      console.log('Calling GoogleAuth.signIn()...');
      const result = await GoogleAuth.signIn();
      console.log('GoogleAuth result:', result);

      if (result && result.idToken) {
        // Successfully signed in with Google
        const user = {
          id: result.email,
          email: result.email,
          user_metadata: {
            first_name: result.givenName,
            last_name: result.familyName,
            picture: result.imageUrl
          },
          isAdmin: false
        };
        setUser(user);
        navigate(redirectPath || '/home');
      } else {
        throw new Error('No ID token received');
      }
    } catch (err) {
      console.error('Google Sign-In error:', err);
      setError(err.message || 'Google sign-in failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

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
      googleButtonBorder: '#dadce0',
      footerBackground: '#f3f3f3',
      footerBorder: '#ddd',
      footerText: '#555',
      footerLink: '#0066c0',
      footerLinkHover: '#c45500'
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
      googleButtonBorder: '#718096',
      footerBackground: '#2d3748',
      footerBorder: '#4a5568',
      footerText: '#cbd5e0',
      footerLink: '#63b3ed',
      footerLinkHover: '#90cdf4'
    }
  };

  const currentTheme = isDarkTheme ? themeStyles.dark : themeStyles.light;

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: currentTheme.background, transition: 'background 0.3s ease', overflow: 'hidden' }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px', overflowY: 'auto' }}>
        <div style={{ background: currentTheme.cardBackground, padding: isSignUp ? '20px' : '30px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', width: '100%', maxWidth: '400px', border: `1px solid ${currentTheme.borderColor}`, transition: 'all 0.3s ease' }}>
          
          <div style={{ textAlign: 'center', marginBottom: isSignUp ? '15px' : '20px' }}>
            <h2 style={{ color: currentTheme.textColor, marginBottom: '5px', fontSize: isSignUp ? '22px' : '24px', fontWeight: 'bold' }}>{t('title')}</h2>
            <p style={{ color: currentTheme.secondaryText, fontSize: '16px', fontWeight: '500' }}>{isSignUp ? t('createAccount') : t('signIn')}</p>
          </div>

          {error && (
            <div style={{ background: currentTheme.errorBackground, color: isDarkTheme ? '#fc8181' : '#c33', padding: '8px', borderRadius: '4px', marginBottom: '15px', fontSize: '13px', border: `1px solid ${currentTheme.errorBorder}` }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {isSignUp && (
              <>
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', marginBottom: '3px', fontWeight: '600', color: currentTheme.textColor, fontSize: '13px' }}>{t('firstName')}</label>
                  <input type="text" name="firstName" value={userData.firstName} onChange={handleInputChange} placeholder={t('firstName')} style={{ width: '100%', padding: '8px', border: `1px solid ${currentTheme.inputBorder}`, borderRadius: '4px', fontSize: '13px', boxSizing: 'border-box', backgroundColor: isDarkTheme ? '#4a5568' : 'white', color: currentTheme.textColor, transition: 'all 0.3s ease' }} required={isSignUp} />
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', marginBottom: '3px', fontWeight: '600', color: currentTheme.textColor, fontSize: '13px' }}>{t('lastName')}</label>
                  <input type="text" name="lastName" value={userData.lastName} onChange={handleInputChange} placeholder={t('lastName')} style={{ width: '100%', padding: '8px', border: `1px solid ${currentTheme.inputBorder}`, borderRadius: '4px', fontSize: '13px', boxSizing: 'border-box', backgroundColor: isDarkTheme ? '#4a5568' : 'white', color: currentTheme.textColor, transition: 'all 0.3s ease' }} required={isSignUp} />
                </div>
              </>
            )}

            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '3px', fontWeight: '600', color: currentTheme.textColor, fontSize: '13px' }}>{t('email')}</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" style={{ width: '100%', padding: '8px', border: `1px solid ${currentTheme.inputBorder}`, borderRadius: '4px', fontSize: '13px', boxSizing: 'border-box', backgroundColor: isDarkTheme ? '#4a5568' : 'white', color: currentTheme.textColor, transition: 'all 0.3s ease' }} required />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '3px', fontWeight: '600', color: currentTheme.textColor, fontSize: '13px' }}>{t('password')}</label>
              <div style={{ position: 'relative' }}>
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" style={{ width: '100%', padding: '8px 35px 8px 8px', border: `1px solid ${currentTheme.inputBorder}`, borderRadius: '4px', fontSize: '13px', boxSizing: 'border-box', backgroundColor: isDarkTheme ? '#4a5568' : 'white', color: currentTheme.textColor, transition: 'all 0.3s ease' }} required />
                <button type="button" onClick={togglePasswordVisibility} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: currentTheme.secondaryText, cursor: 'pointer', padding: '3px', borderRadius: '3px', fontSize: '11px', fontWeight: '500' }}>
                  {showPassword ? t('hidePassword') : t('showPassword')}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading || (isSignUp && password.length < 6)} style={{ width: '100%', padding: '10px', background: loading || (isSignUp && password.length < 6) ? (isDarkTheme ? '#4a5568' : '#ccc') : currentTheme.buttonBackground, color: loading || (isSignUp && password.length < 6) ? (isDarkTheme ? '#a0aec0' : '#666') : currentTheme.buttonColor, border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: (loading || (isSignUp && password.length < 6)) ? 'not-allowed' : 'pointer', transition: 'all 0.3s ease', marginBottom: '10px' }}>
              {loading ? '...' : (isSignUp ? t('createAccount') : t('continue'))}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', textAlign: 'center', color: currentTheme.secondaryText, margin: '10px 0' }}>
              <hr style={{ flex: 1, border: 'none', borderTop: `1px solid ${currentTheme.borderColor}` }} />
              <span style={{ padding: '0 8px', fontSize: '11px' }}>OR</span>
              <hr style={{ flex: 1, border: 'none', borderTop: `1px solid ${currentTheme.borderColor}` }} />
            </div>

            <button type="button" onClick={handleGoogleSignIn} disabled={googleLoading} style={{ width: '100%', padding: '8px', background: currentTheme.googleButtonBackground, color: currentTheme.googleButtonColor, border: `1px solid ${currentTheme.googleButtonBorder}`, borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: googleLoading ? 'not-allowed' : 'pointer', transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              {googleLoading ? '...' : (isSignUp ? t('createWithGoogle') : t('signInWithGoogle'))}
            </button>
          </form>

          <div style={{ marginTop: '15px', textAlign: 'center', fontSize: '12px' }}>
            <button onClick={() => { setIsSignUp(!isSignUp); setError(null); }} style={{ background: 'none', border: 'none', color: currentTheme.linkColor, cursor: 'pointer', textDecoration: 'underline', fontSize: '13px' }}>
              {isSignUp ? t('alreadyHaveAccount') : `${t('newCustomer')} ${t('startHere')}`}
            </button>
          </div>
        </div>
      </div>

      <footer style={{ textAlign: 'center', padding: '12px 0', borderTop: `1px solid ${currentTheme.borderColor}`, background: currentTheme.footerBackground, fontSize: '11px', color: currentTheme.footerText, width: '100%', flexShrink: 0 }}>
        <div>© 1996-{currentYear} ROBERT & IZAK</div>
      </footer>
    </div>
  );
};

export default SignIn;