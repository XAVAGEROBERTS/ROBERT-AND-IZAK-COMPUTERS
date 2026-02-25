// src/utils/auth.js
import { supabase } from '../supabaseClient';

// ============================================================================
// STORAGE KEYS - COMPLETELY SEPARATE FOR CUSTOMER AND ADMIN
// ============================================================================

const CUSTOMER_KEYS = {
  USER: 'customer_user',
  SESSION: 'customer_session',
  TYPE: 'customer_type',
  TIMESTAMP: 'customer_login_time'
};

const ADMIN_KEYS = {
  USER: 'admin_user', 
  SESSION: 'admin_session',
  TYPE: 'admin_type',
  TIMESTAMP: 'admin_login_time'
};

// ============================================================================
// STORAGE MANAGEMENT - COMPLETELY SEPARATE
// ============================================================================

const CustomerStorage = {
  setUser: (userData) => {
    localStorage.setItem(CUSTOMER_KEYS.USER, JSON.stringify(userData));
    localStorage.setItem(CUSTOMER_KEYS.TYPE, 'customer');
    localStorage.setItem(CUSTOMER_KEYS.TIMESTAMP, new Date().toISOString());
    
    // Clear ALL admin data when customer logs in
    localStorage.removeItem(ADMIN_KEYS.USER);
    localStorage.removeItem(ADMIN_KEYS.SESSION);
    localStorage.removeItem(ADMIN_KEYS.TYPE);
    localStorage.removeItem(ADMIN_KEYS.TIMESTAMP);
    
    console.log('✅ Customer session stored separately');
  },
  
  getUser: () => {
    // Only return customer if customer type is set
    const userType = localStorage.getItem(CUSTOMER_KEYS.TYPE);
    if (userType !== 'customer') return null;
    
    const userData = localStorage.getItem(CUSTOMER_KEYS.USER);
    return userData ? JSON.parse(userData) : null;
  },
  
  clear: () => {
    localStorage.removeItem(CUSTOMER_KEYS.USER);
    localStorage.removeItem(CUSTOMER_KEYS.SESSION);
    localStorage.removeItem(CUSTOMER_KEYS.TYPE);
    localStorage.removeItem(CUSTOMER_KEYS.TIMESTAMP);
    console.log('✅ Customer session cleared');
  },
  
  isLoggedIn: () => {
    const userType = localStorage.getItem(CUSTOMER_KEYS.TYPE);
    const userData = localStorage.getItem(CUSTOMER_KEYS.USER);
    return userType === 'customer' && !!userData;
  }
};

const AdminStorage = {
  setUser: (userData) => {
    localStorage.setItem(ADMIN_KEYS.USER, JSON.stringify(userData));
    localStorage.setItem(ADMIN_KEYS.TYPE, 'admin');
    localStorage.setItem(ADMIN_KEYS.TIMESTAMP, new Date().toISOString());
    
    // Clear ALL customer data when admin logs in
    localStorage.removeItem(CUSTOMER_KEYS.USER);
    localStorage.removeItem(CUSTOMER_KEYS.SESSION);
    localStorage.removeItem(CUSTOMER_KEYS.TYPE);
    localStorage.removeItem(CUSTOMER_KEYS.TIMESTAMP);
    
    console.log('✅ Admin session stored separately');
  },
  
  getUser: () => {
    // Only return admin if admin type is set
    const userType = localStorage.getItem(ADMIN_KEYS.TYPE);
    if (userType !== 'admin') return null;
    
    const userData = localStorage.getItem(ADMIN_KEYS.USER);
    return userData ? JSON.parse(userData) : null;
  },
  
  clear: () => {
    localStorage.removeItem(ADMIN_KEYS.USER);
    localStorage.removeItem(ADMIN_KEYS.SESSION);
    localStorage.removeItem(ADMIN_KEYS.TYPE);
    localStorage.removeItem(ADMIN_KEYS.TIMESTAMP);
    console.log('✅ Admin session cleared');
  },
  
  isLoggedIn: () => {
    const userType = localStorage.getItem(ADMIN_KEYS.TYPE);
    const userData = localStorage.getItem(ADMIN_KEYS.USER);
    return userType === 'admin' && !!userData;
  }
};

// ============================================================================
// AUTHENTICATION TYPE CHECKERS
// ============================================================================

export const getCurrentAuthType = () => {
  if (AdminStorage.isLoggedIn()) return 'admin';
  if (CustomerStorage.isLoggedIn()) return 'customer';
  return null;
};

export const isAdminLoggedIn = () => {
  return AdminStorage.isLoggedIn();
};

export const isCustomerLoggedIn = () => {
  return CustomerStorage.isLoggedIn();
};

// ============================================================================
// PASSWORD UTILITIES
// ============================================================================

export const hashPassword = async (password) => {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  } catch (error) {
    console.error('Password hashing error:', error);
    // Fallback hashing for compatibility
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }
};

export const verifyPassword = async (password, hashedPassword) => {
  try {
    const hashedInput = await hashPassword(password);
    return hashedInput === hashedPassword;
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
};

export const hashAdminPassword = async (password) => {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  } catch (error) {
    console.error('Password hashing error:', error);
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }
};

export const verifyAdminPassword = async (password, hashedPassword) => {
  try {
    const hashedInput = await hashAdminPassword(password);
    return hashedInput === hashedPassword;
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
};

// ============================================================================
// GOOGLE SIGN-IN FUNCTIONS - FIXED VERSION
// ============================================================================

// Main Google sign-in function - uses access token to fetch user info
export const signInWithGoogle = async (accessToken) => {
  try {
    console.log('🔐 Processing Google sign-in with access token');
    
    // Clear any existing sessions first
    CustomerStorage.clear();
    AdminStorage.clear();
    
    // Fetch user info from Google using the access token
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!userInfoResponse.ok) {
      throw new Error('Failed to fetch user info from Google');
    }
    
    const userInfo = await userInfoResponse.json();
    console.log('✅ Google user info fetched:', userInfo.email);
    
    if (!userInfo || !userInfo.email) {
      throw new Error('Invalid Google user info');
    }
    
    // Check if user exists in your database
    const { data: existingCustomer, error: checkError } = await supabase
      .from('customers')
      .select('*')
      .eq('email', userInfo.email.toLowerCase().trim())
      .maybeSingle();
    
    let user;
    
    if (existingCustomer) {
      // User exists, update last login and Google info
      console.log('✅ Existing customer found, updating info');
      
      const { data: updatedCustomer, error: updateError } = await supabase
        .from('customers')
        .update({ 
          last_login: new Date().toISOString(),
          google_id: userInfo.sub,
          picture: userInfo.picture,
          email_verified: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingCustomer.id)
        .select()
        .single();
      
      if (updateError) {
        console.error('Error updating customer:', updateError);
        user = existingCustomer; // Fall back to existing data
      } else {
        user = updatedCustomer;
      }
    } else {
      // Create new user from Google data
      console.log('✅ No existing customer found, creating new account');
      
      const nameParts = userInfo.name ? userInfo.name.split(' ') : ['', ''];
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      const { data: newCustomer, error: insertError } = await supabase
        .from('customers')
        .insert({
          email: userInfo.email.toLowerCase().trim(),
          first_name: firstName,
          last_name: lastName,
          google_id: userInfo.sub,
          picture: userInfo.picture,
          is_active: true,
          email_verified: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_login: new Date().toISOString()
        })
        .select()
        .single();
      
      if (insertError) {
        console.error('Error creating customer:', insertError);
        throw new Error(insertError.message || 'Failed to create customer account');
      }
      
      user = newCustomer;
    }
    
    // Store user in customer storage (remove sensitive data)
    const { password_hash, ...safeUserData } = user;
    CustomerStorage.setUser(safeUserData);
    
    console.log('✅ Google sign-in successful for:', safeUserData.email);
    
    return {
      success: true,
      user: safeUserData
    };
  } catch (error) {
    console.error('❌ Google sign-in error:', error);
    return {
      success: false,
      error: error.message || 'Google sign-in failed. Please try again.'
    };
  }
};

// Alternative function if you have an ID token
export const signInWithGoogleIdToken = async (idToken) => {
  try {
    console.log('🔐 Processing Google ID token');
    
    // Clear any existing sessions first
    CustomerStorage.clear();
    AdminStorage.clear();
    
    // Decode the JWT token to get user info
    const decodeJWT = (token) => {
      try {
        const base64Url = token.split('.')[1];
        // Fix base64 padding
        let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        // Add padding if needed
        while (base64.length % 4) {
          base64 += '=';
        }
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
      } catch (e) {
        console.error('Error decoding JWT:', e);
        return null;
      }
    };
    
    const userInfo = decodeJWT(idToken);
    
    if (!userInfo || !userInfo.email) {
      throw new Error('Failed to decode Google token or missing email');
    }
    
    console.log('✅ Google token decoded successfully for:', userInfo.email);
    
    // Check if user exists in your database
    const { data: existingCustomer, error: checkError } = await supabase
      .from('customers')
      .select('*')
      .eq('email', userInfo.email.toLowerCase().trim())
      .maybeSingle();
    
    let user;
    
    if (existingCustomer) {
      // User exists, update last login and Google info
      console.log('✅ Existing customer found, updating info');
      
      const { data: updatedCustomer, error: updateError } = await supabase
        .from('customers')
        .update({ 
          last_login: new Date().toISOString(),
          google_id: userInfo.sub,
          picture: userInfo.picture,
          email_verified: userInfo.email_verified || true,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingCustomer.id)
        .select()
        .single();
      
      if (updateError) {
        console.error('Error updating customer:', updateError);
        user = existingCustomer; // Fall back to existing data
      } else {
        user = updatedCustomer;
      }
    } else {
      // Create new user from Google data
      console.log('✅ No existing customer found, creating new account');
      
      const nameParts = userInfo.name ? userInfo.name.split(' ') : ['', ''];
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      const { data: newCustomer, error: insertError } = await supabase
        .from('customers')
        .insert({
          email: userInfo.email.toLowerCase().trim(),
          first_name: firstName,
          last_name: lastName,
          google_id: userInfo.sub,
          picture: userInfo.picture,
          is_active: true,
          email_verified: userInfo.email_verified || true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_login: new Date().toISOString()
        })
        .select()
        .single();
      
      if (insertError) {
        console.error('Error creating customer:', insertError);
        throw new Error(insertError.message || 'Failed to create customer account');
      }
      
      user = newCustomer;
    }
    
    // Store user in customer storage (remove sensitive data)
    const { password_hash, ...safeUserData } = user;
    CustomerStorage.setUser(safeUserData);
    
    console.log('✅ Google sign-in successful for:', safeUserData.email);
    
    return {
      success: true,
      user: safeUserData
    };
  } catch (error) {
    console.error('❌ Google sign-in error:', error);
    return {
      success: false,
      error: error.message || 'Google sign-in failed. Please try again.'
    };
  }
};

// ============================================================================
// CUSTOMER AUTHENTICATION
// ============================================================================

export const registerCustomer = async (email, password, userData) => {
  try {
    console.log('📝 Registering new customer:', email);
    
    // Clear any existing sessions first
    CustomerStorage.clear();
    AdminStorage.clear();
    
    // Validate password length
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    // Hash password using simple SHA-256
    const passwordHash = await hashPassword(password);

    // Check if customer already exists
    const { data: existingCustomer, error: checkError } = await supabase
      .from('customers')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .eq('is_active', true)
      .maybeSingle();

    if (existingCustomer) {
      throw new Error('Customer with this email already exists');
    }

    // Insert new customer
    const { data: customer, error } = await supabase
      .from('customers')
      .insert({
        email: email.toLowerCase().trim(),
        password_hash: passwordHash,
        first_name: userData.firstName || '',
        last_name: userData.lastName || '',
        phone: userData.phone || '',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.log('❌ Customer registration error:', error);
      if (error.code === '23505') {
        return { success: false, error: 'Customer with this email already exists' };
      }
      throw new Error(error.message);
    }

    console.log('✅ Customer registered successfully:', customer.email);
    
    // Store in customer storage only
    const { password_hash, ...customerData } = customer;
    CustomerStorage.setUser(customerData);
    
    return {
      success: true,
      customer: customerData
    };

  } catch (error) {
    console.error('❌ Customer registration error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const authenticateCustomer = async (email, password) => {
  try {
    console.log('🔐 Authenticating customer:', email);
    
    // Clear any existing sessions first
    CustomerStorage.clear();
    AdminStorage.clear();
    
    // Find customer by email
    const { data: customer, error } = await supabase
      .from('customers')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (error || !customer) {
      console.log('❌ Customer not found:', email);
      throw new Error('Invalid email or password');
    }

    // Check if account is active
    if (!customer.is_active) {
      console.log('❌ Customer account inactive:', email);
      throw new Error('Account is deactivated. Please contact support.');
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, customer.password_hash);
    
    if (!isPasswordValid) {
      console.log('❌ Invalid password for customer:', email);
      throw new Error('Invalid email or password');
    }

    // Update last login timestamp
    await supabase
      .from('customers')
      .update({ last_login: new Date().toISOString() })
      .eq('id', customer.id);

    console.log('✅ Customer authentication successful:', customer.email);
    
    // Store in customer storage only
    const { password_hash, ...customerData } = customer;
    CustomerStorage.setUser(customerData);
    
    return {
      success: true,
      customer: customerData
    };

  } catch (error) {
    console.error('❌ Customer authentication error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const getCustomerById = async (customerId) => {
  try {
    const { data: customer, error } = await supabase
      .from('customers')
      .select('id, email, first_name, last_name, phone, created_at, last_login, is_active, google_id, picture')
      .eq('id', customerId)
      .eq('is_active', true)
      .single();

    if (error) {
      throw new Error('Customer not found');
    }

    return {
      success: true,
      customer: customer
    };
  } catch (error) {
    console.error('❌ Get customer by ID error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const updateCustomerProfile = async (customerId, updateData) => {
  try {
    const { firstName, lastName, phone } = updateData;
    
    const { data: customer, error } = await supabase
      .from('customers')
      .update({
        first_name: firstName,
        last_name: lastName,
        phone: phone,
        updated_at: new Date().toISOString()
      })
      .eq('id', customerId)
      .eq('is_active', true)
      .select()
      .single();

    if (error) {
      throw new Error('Customer not found');
    }

    console.log('✅ Customer profile updated successfully:', customerId);
    
    // Update local storage if this is the current user
    const currentUser = await getCurrentUser();
    if (currentUser && currentUser.type === 'customer' && currentUser.user.id === customerId) {
      CustomerStorage.setUser(customer);
    }
    
    return {
      success: true,
      customer: customer
    };

  } catch (error) {
    console.error('❌ Update customer profile error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const changeCustomerPassword = async (customerId, currentPassword, newPassword) => {
  try {
    // Get current password hash
    const { data: customer, error: fetchError } = await supabase
      .from('customers')
      .select('password_hash')
      .eq('id', customerId)
      .eq('is_active', true)
      .single();

    if (fetchError) {
      throw new Error('Customer not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await verifyPassword(
      currentPassword, 
      customer.password_hash
    );

    if (!isCurrentPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Validate new password length
    if (newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters long');
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password
    await supabase
      .from('customers')
      .update({ 
        password_hash: newPasswordHash, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', customerId);

    console.log('✅ Customer password changed successfully:', customerId);
    
    return {
      success: true,
      message: 'Password updated successfully'
    };

  } catch (error) {
    console.error('❌ Change customer password error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Password reset functionality
export const requestPasswordReset = async (email) => {
  try {
    // Check if customer exists
    const { data: customer, error } = await supabase
      .from('customers')
      .select('id, email')
      .eq('email', email.toLowerCase().trim())
      .eq('is_active', true)
      .maybeSingle();

    if (error || !customer) {
      // Don't reveal if email exists or not for security
      return {
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      };
    }

    // In a real implementation, you would:
    // 1. Generate a reset token
    // 2. Store it in a password_reset_tokens table with expiration
    // 3. Send email with reset link
    
    console.log('✅ Password reset requested for:', email);
    
    return {
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    };

  } catch (error) {
    console.error('❌ Request password reset error:', error);
    return {
      success: false,
      error: 'Failed to process password reset request'
    };
  }
};

// ============================================================================
// ADMIN AUTHENTICATION
// ============================================================================

export const authenticateAdmin = async (email, password) => {
  try {
    console.log('🔐 Authenticating admin:', email);
    
    // Clear any existing sessions first
    AdminStorage.clear();
    CustomerStorage.clear();
    
    const { data: admin, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .eq('is_active', true)
      .single();

    if (error || !admin) {
      console.log('❌ Admin not found:', email);
      return { success: false, error: 'Invalid email or password' };
    }

    console.log('✅ Admin found, verifying password...');
    const isPasswordValid = await verifyAdminPassword(password, admin.password_hash);
    
    if (!isPasswordValid) {
      console.log('❌ Password invalid for admin:', email);
      return { success: false, error: 'Invalid email or password' };
    }

    console.log('✅ Password valid, admin authentication successful');
    
    // Update last login
    await supabase
      .from('admin_users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', admin.id);

    // Store in admin storage only
    AdminStorage.setUser(admin);
    
    return { success: true, admin };

  } catch (error) {
    console.error('❌ Admin authentication error:', error);
    return { success: false, error: 'Authentication failed. Please try again.' };
  }
};

export const registerAdmin = async (email, password, adminData = {}) => {
  try {
    console.log('📝 Registering new admin:', email);
    
    // Clear any existing sessions first
    AdminStorage.clear();
    CustomerStorage.clear();
    
    const passwordHash = await hashAdminPassword(password);
    console.log('✅ Password hashed successfully');
    
    const { data: admin, error } = await supabase
      .from('admin_users')
      .insert({
        email: email.toLowerCase().trim(),
        password_hash: passwordHash,
        first_name: adminData.firstName || '',
        last_name: adminData.lastName || '',
        role: adminData.role || 'staff',
        permissions: adminData.permissions || {},
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.log('❌ Admin registration error:', error);
      if (error.code === '23505') {
        return { success: false, error: 'Email already exists. Please use a different email.' };
      }
      return { success: false, error: error.message };
    }

    console.log('✅ Admin registered successfully:', admin.id);
    
    // Store in admin storage only
    AdminStorage.setUser(admin);
    
    return { success: true, admin };

  } catch (error) {
    console.error('❌ Admin registration error:', error);
    return { success: false, error: 'Registration failed. Please try again.' };
  }
};

// ============================================================================
// COMMON FUNCTIONS
// ============================================================================

export const signOutUser = async (userType = null) => {
  try {
    if (userType === 'admin' || AdminStorage.isLoggedIn()) {
      AdminStorage.clear();
      console.log('✅ Admin signed out');
    } else if (userType === 'customer' || CustomerStorage.isLoggedIn()) {
      CustomerStorage.clear();
      console.log('✅ Customer signed out');
    } else {
      // Clear everything if no type specified
      AdminStorage.clear();
      CustomerStorage.clear();
      console.log('✅ All users signed out');
    }
    
    // Clear any auth token
    localStorage.removeItem('authToken');
    
    return true;
  } catch (error) {
    console.error('Sign out error:', error);
    return false;
  }
};

export const getCurrentUser = async () => {
  try {
    // Check admin first, then customer
    const adminUser = AdminStorage.getUser();
    if (adminUser) {
      return { user: adminUser, type: 'admin' };
    }
    
    const customerUser = CustomerStorage.getUser();
    if (customerUser) {
      return { user: customerUser, type: 'customer' };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

export const getCurrentSession = async () => {
  try {
    const current = await getCurrentUser();
    return current ? { user: current.user, type: current.type } : null;
  } catch (error) {
    console.error('Error getting current session:', error);
    return null;
  }
};

// Update user profile (for customers)
export const updateUserProfile = async (updates) => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.type !== 'customer') {
      return { success: false, error: 'No customer logged in' };
    }

    const result = await updateCustomerProfile(currentUser.user.id, updates);
    return result;
  } catch (error) {
    return { success: false, error: 'Failed to update profile' };
  }
};

// Check if email exists (for form validation)
export const checkEmailExists = async (email) => {
  try {
    const { data: customer, error } = await supabase
      .from('customers')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .eq('is_active', true)
      .maybeSingle();

    return {
      exists: !!customer,
      success: true
    };
  } catch (error) {
    console.error('❌ Check email exists error:', error);
    return {
      exists: false,
      success: false,
      error: error.message
    };
  }
};

// Clear all authentication data
export const clearAllAuthData = () => {
  CustomerStorage.clear();
  AdminStorage.clear();
  localStorage.removeItem('authToken');
  console.log('✅ All authentication data cleared');
};

// Check if any user is logged in
export const isAnyUserLoggedIn = () => {
  return isAdminLoggedIn() || isCustomerLoggedIn();
};

// Get user display name
export const getUserDisplayName = () => {
  const currentUser = getCurrentUser();
  if (!currentUser) return null;
  
  if (currentUser.type === 'customer') {
    const customer = currentUser.user;
    if (customer.first_name && customer.last_name) {
      return `${customer.first_name} ${customer.last_name}`;
    }
    return customer.email;
  } else if (currentUser.type === 'admin') {
    const admin = currentUser.user;
    if (admin.first_name && admin.last_name) {
      return `${admin.first_name} ${admin.last_name}`;
    }
    return admin.email;
  }
  
  return null;
};

// Check if user signed up with Google
export const isGoogleUser = (user) => {
  return user && user.google_id ? true : false;
};

// Link Google account to existing customer
export const linkGoogleAccount = async (customerId, googleId, googleEmail) => {
  try {
    const { error } = await supabase
      .from('customers')
      .update({
        google_id: googleId,
        email_verified: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', customerId)
      .eq('email', googleEmail.toLowerCase().trim());

    if (error) {
      throw new Error(error.message);
    }

    console.log('✅ Google account linked successfully:', customerId);
    
    return {
      success: true,
      message: 'Google account linked successfully'
    };
  } catch (error) {
    console.error('❌ Link Google account error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};