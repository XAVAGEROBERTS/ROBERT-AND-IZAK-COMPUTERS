// src/pages/AdminSignIn.js
import React, { useState, useEffect } from 'react';
import { authenticateAdmin, registerAdmin } from '../utils/auth';
import { supabase, testConnection } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

const AdminSignIn = ({ currentLanguage, setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [adminData, setAdminData] = useState({
    firstName: '',
    lastName: '',
    role: 'staff'
  });
  const navigate = useNavigate();

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

  // Theme styles
  const themeStyles = {
    light: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      cardBackground: 'white',
      textColor: '#333',
      secondaryText: '#666',
      borderColor: '#ddd',
      inputBorder: '#ddd',
      errorBackground: '#fee',
      errorBorder: '#fcc',
      successBackground: '#d4edda',
      successBorder: '#c3e6cb',
      successText: '#155724',
      buttonBackground: '#667eea',
      buttonColor: 'white',
      linkColor: '#667eea',
      debugBackground: '#f8f9fa',
      debugBorder: '#dee2e6',
      debugText: '#333',
      devToolsBackground: '#fff3cd',
      devToolsBorder: '#ffeaa7',
      devToolsText: '#856404'
    },
    dark: {
      background: 'linear-gradient(135deg, #2d3748 0%, #4a5568 100%)',
      cardBackground: '#2d3748',
      textColor: '#f7fafc',
      secondaryText: '#cbd5e0',
      borderColor: '#4a5568',
      inputBorder: '#718096',
      errorBackground: '#742a2a',
      errorBorder: '#c53030',
      successBackground: '#22543d',
      successBorder: '#2f855a',
      successText: '#68d391',
      buttonBackground: '#4c51bf',
      buttonColor: '#f7fafc',
      linkColor: '#63b3ed',
      debugBackground: '#4a5568',
      debugBorder: '#718096',
      debugText: '#e2e8f0',
      devToolsBackground: '#744210',
      devToolsBorder: '#d69e2e',
      devToolsText: '#faf089'
    }
  };

  const currentTheme = isDarkTheme ? themeStyles.dark : themeStyles.light;

  const handleAdminSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setDebugInfo('Starting authentication process...');

    try {
      console.log('🔄 Starting admin authentication...');
      
      let result;

      if (isSignUp) {
        // Admin registration
        setDebugInfo('Starting admin registration...');
        console.log('📝 Registering new admin:', email);
        
        result = await registerAdmin(email, password, adminData);
        
        if (result.success) {
          setDebugInfo('Admin registration successful!');
          setError('Admin account created successfully! You can now sign in.');
          setIsSignUp(false);
          setLoading(false);
          return;
        } else {
          setDebugInfo(`Registration failed: ${result.error}`);
          throw new Error(result.error);
        }
      } else {
        // Admin authentication
        setDebugInfo('Starting admin authentication...');
        console.log('🔐 Authenticating admin:', email);
        
        result = await authenticateAdmin(email, password);
        
        if (result.success) {
          setDebugInfo('Authentication successful!');
          
          // Create user object compatible with your existing system
          const user = {
            id: result.admin.id,
            email: result.admin.email,
            user_metadata: {
              first_name: result.admin.first_name,
              last_name: result.admin.last_name
            },
            role: result.admin.role,
            isAdmin: true
          };

          // Set user in parent component
          setUser(user);
          
          console.log('✅ Admin signed in successfully:', result.admin.email);
          setDebugInfo('Redirecting to admin dashboard...');
          
          // Small delay to show success message
          setTimeout(() => {
            navigate('/admin-dashboard');
          }, 500);
          
        } else {
          setDebugInfo(`Authentication failed: ${result.error}`);
          throw new Error(result.error);
        }
      }

    } catch (err) {
      console.error('❌ Admin authentication error:', err);
      setError(err.message);
      setDebugInfo(prev => prev + `\nError: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAdminData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleTestConnection = async () => {
    try {
      setDebugInfo('Testing database connection...');
      const success = await testConnection();
      if (success) {
        setDebugInfo('✅ Database connection successful!');
      } else {
        setDebugInfo('❌ Database connection failed');
      }
    } catch (err) {
      setDebugInfo(`❌ Connection test error: ${err.message}`);
    }
  };

  const checkTables = async () => {
    try {
      setDebugInfo('Checking database tables...');
      
      // Check admin_users table
      const { data: admins, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .limit(5);

      if (adminError) {
        setDebugInfo(`❌ admin_users table error: ${adminError.message}`);
      } else {
        setDebugInfo(prev => prev + `\n✅ admin_users table: ${admins?.length || 0} records`);
      }

      // Check customers table
      const { data: customers, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .limit(5);

      if (customerError) {
        setDebugInfo(prev => prev + `\n❌ customers table error: ${customerError.message}`);
      } else {
        setDebugInfo(prev => prev + `\n✅ customers table: ${customers?.length || 0} records`);
      }

    } catch (err) {
      setDebugInfo(prev => prev + `\n❌ Table check error: ${err.message}`);
    }
  };

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
        borderRadius: '10px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '500px',
        transition: 'all 0.3s ease'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ 
            color: currentTheme.textColor, 
            marginBottom: '10px',
            transition: 'color 0.3s ease'
          }}>
            ROBERT & IZAK COMPUTERS
          </h2>
          <p style={{ 
            color: currentTheme.secondaryText, 
            fontSize: '14px',
            transition: 'color 0.3s ease'
          }}>
            {isSignUp ? 'Admin Registration' : 'Admin Dashboard'}
          </p>
        </div>

        {error && (
          <div style={{
            background: error.includes('successfully') ? currentTheme.successBackground : currentTheme.errorBackground,
            color: error.includes('successfully') ? currentTheme.successText : (isDarkTheme ? '#fc8181' : '#c33'),
            padding: '12px',
            borderRadius: '5px',
            marginBottom: '20px',
            fontSize: '14px',
            border: `1px solid ${error.includes('successfully') ? currentTheme.successBorder : currentTheme.errorBorder}`,
            transition: 'all 0.3s ease'
          }}>
            <strong>{error.includes('successfully') ? 'Success!' : 'Error:'}</strong> {error}
          </div>
        )}

        {/* Debug info */}
        {debugInfo && (
          <div style={{
            background: currentTheme.debugBackground,
            color: currentTheme.debugText,
            padding: '10px',
            borderRadius: '5px',
            marginBottom: '20px',
            fontSize: '11px',
            border: `1px solid ${currentTheme.debugBorder}`,
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap',
            maxHeight: '150px',
            overflow: 'auto',
            transition: 'all 0.3s ease'
          }}>
            <strong>Debug Info:</strong>\n{debugInfo}
          </div>
        )}

        <form onSubmit={handleAdminSignIn}>
          {isSignUp && (
            <>
              <div style={{ marginBottom: '15px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '5px',
                  fontWeight: '600',
                  color: currentTheme.textColor,
                  fontSize: '14px',
                  transition: 'color 0.3s ease'
                }}>
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={adminData.firstName}
                  onChange={handleInputChange}
                  placeholder="First Name"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: `1px solid ${currentTheme.inputBorder}`,
                    borderRadius: '5px',
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
                  fontSize: '14px',
                  transition: 'color 0.3s ease'
                }}>
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={adminData.lastName}
                  onChange={handleInputChange}
                  placeholder="Last Name"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: `1px solid ${currentTheme.inputBorder}`,
                    borderRadius: '5px',
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
                  fontSize: '14px',
                  transition: 'color 0.3s ease'
                }}>
                  Role
                </label>
                <select
                  name="role"
                  value={adminData.role}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: `1px solid ${currentTheme.inputBorder}`,
                    borderRadius: '5px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    backgroundColor: isDarkTheme ? '#4a5568' : 'white',
                    color: currentTheme.textColor,
                    transition: 'all 0.3s ease'
                  }}
                >
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
            </>
          )}

          <div style={{ marginBottom: '15px' }}>
            <label style={{
              display: 'block',
              marginBottom: '5px',
              fontWeight: '600',
              color: currentTheme.textColor,
              fontSize: '14px',
              transition: 'color 0.3s ease'
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              style={{
                width: '100%',
                padding: '10px',
                border: `1px solid ${currentTheme.inputBorder}`,
                borderRadius: '5px',
                fontSize: '14px',
                boxSizing: 'border-box',
                backgroundColor: isDarkTheme ? '#4a5568' : 'white',
                color: currentTheme.textColor,
                transition: 'all 0.3s ease'
              }}
              required
            />
          </div>

          <div style={{ marginBottom: '25px' }}>
            <label style={{
              display: 'block',
              marginBottom: '5px',
              fontWeight: '600',
              color: currentTheme.textColor,
              fontSize: '14px',
              transition: 'color 0.3s ease'
            }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                style={{
                  width: '100%',
                  padding: '10px 45px 10px 10px',
                  border: `1px solid ${currentTheme.inputBorder}`,
                  borderRadius: '5px',
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
                {showPassword ? '🙈 Hide' : '👁️ Show'}
              </button>
            </div>
            {isSignUp && (
              <p style={{ 
                fontSize: '12px', 
                color: currentTheme.secondaryText, 
                marginTop: '5px',
                transition: 'color 0.3s ease'
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
              borderRadius: '5px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: (loading || (isSignUp && password.length < 6)) ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
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
                e.target.style.boxShadow = 'none';
              }
            }}
          >
            {loading ? '🔄 Processing...' : (isSignUp ? 'Create Admin Account' : 'Sign In to Admin Dashboard')}
          </button>
        </form>

        {/* Development tools */}
        <div style={{ 
          marginBottom: '15px',
          padding: '10px',
          background: currentTheme.devToolsBackground,
          borderRadius: '5px',
          border: `1px dashed ${currentTheme.devToolsBorder}`,
          transition: 'all 0.3s ease'
        }}>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '5px' }}>
            <button
              onClick={handleTestConnection}
              style={{
                flex: 1,
                padding: '8px',
                background: isDarkTheme ? '#2b6cb0' : '#17a2b8',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'background 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.opacity = '0.9';
              }}
              onMouseLeave={(e) => {
                e.target.style.opacity = '1';
              }}
            >
              Test Connection
            </button>
            <button
              onClick={checkTables}
              style={{
                flex: 1,
                padding: '8px',
                background: isDarkTheme ? '#553c9a' : '#6f42c1',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'background 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.opacity = '0.9';
              }}
              onMouseLeave={(e) => {
                e.target.style.opacity = '1';
              }}
            >
              Check Tables
            </button>
          </div>
          <p style={{ 
            margin: 0, 
            fontSize: '10px', 
            color: currentTheme.devToolsText,
            transition: 'color 0.3s ease'
          }}>
            Development Tools
          </p>
        </div>

        <div style={{ 
          marginTop: '20px', 
          textAlign: 'center',
          fontSize: '12px',
          color: currentTheme.secondaryText,
          transition: 'color 0.3s ease'
        }}>
          <p>© 2025 ROBERT & IZAK COMPUTERS. Admin Access Only.</p>
          
          <p style={{ marginTop: '10px' }}>
            <a 
              href="/signin" 
              style={{ 
                color: currentTheme.linkColor, 
                textDecoration: 'none',
                transition: 'color 0.3s ease'
              }}
              onClick={(e) => {
                e.preventDefault();
                navigate('/signin');
              }}
              onMouseEnter={(e) => {
                e.target.style.textDecoration = 'underline';
              }}
              onMouseLeave={(e) => {
                e.target.style.textDecoration = 'none';
              }}
            >
              Regular User Sign In
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminSignIn;