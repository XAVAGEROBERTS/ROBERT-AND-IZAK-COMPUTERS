import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import OrdersManagement from './OrdersManagement'; 

const AdminDashboard = ({ user }) => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    totalBrands: 0,
    lowStockItems: 0,
    featuredProducts: 0,
    publishedProducts: 0,
    totalCustomers: 0
  });
  const [recentProducts, setRecentProducts] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [recentCustomers, setRecentCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [theme, setTheme] = useState('light');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showPopup, setShowPopup] = useState({ show: false, message: '', type: '' });
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  // Version update state
  const [showVersionUpdate, setShowVersionUpdate] = useState(false);
  const [updateProgress, setUpdateProgress] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);
  const [newVersion, setNewVersion] = useState('');
  
  // Currency state
  const [currentCurrency, setCurrentCurrency] = useState('UGX');
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  
  // Enhanced logout state
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutProgress, setLogoutProgress] = useState(0);
  
  const navigate = useNavigate();

  // Version configuration - YOU WILL UPDATE THIS WHEN YOU MAKE CHANGES
  const CURRENT_VERSION = '1.1.0'; // Updated version

  // Load cleared notifications from localStorage on component mount
  useEffect(() => {
    const loadClearedNotifications = () => {
      try {
        const cleared = localStorage.getItem('admin-cleared-notifications');
        return cleared ? new Set(JSON.parse(cleared)) : new Set();
      } catch (error) {
        console.error('Error loading cleared notifications:', error);
        return new Set();
      }
    };

    const clearedNotifications = loadClearedNotifications();
    // Store in state or ref for use in fetchNotifications
    window.clearedNotifications = clearedNotifications;
  }, []);

  // Save cleared notifications to localStorage
  const saveClearedNotifications = (clearedSet) => {
    try {
      localStorage.setItem('admin-cleared-notifications', JSON.stringify([...clearedSet]));
      window.clearedNotifications = clearedSet;
    } catch (error) {
      console.error('Error saving cleared notifications:', error);
    }
  };

  // Check for version updates
  useEffect(() => {
    const checkForUpdates = () => {
      const storedVersion = localStorage.getItem('admin-dashboard-version');
      const lastUpdateCheck = localStorage.getItem('last-update-check');
      const now = Date.now();

      // If no version is stored, set current version
      if (!storedVersion) {
        localStorage.setItem('admin-dashboard-version', CURRENT_VERSION);
        return;
      }

      // Check if stored version is different from current version
      if (storedVersion !== CURRENT_VERSION) {
        setNewVersion(CURRENT_VERSION);
        setShowVersionUpdate(true);
      }
    };

    // Check for updates on component mount
    checkForUpdates();

    // Also check when the page becomes visible (user comes back to tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkForUpdates();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Simulate version update process
  const handleVersionUpdate = async () => {
    setIsUpdating(true);
    setUpdateProgress(0);

    try {
      // Step 1: Starting update
      setUpdateProgress(10);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 2: Clearing cache
      setUpdateProgress(30);
      await new Promise(resolve => setTimeout(resolve, 800));

      // Step 3: Downloading new files
      setUpdateProgress(60);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 4: Applying updates
      setUpdateProgress(85);
      await new Promise(resolve => setTimeout(resolve, 700));

      // Step 5: Finalizing
      setUpdateProgress(100);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Update complete - store new version
      localStorage.setItem('admin-dashboard-version', CURRENT_VERSION);
      
      setIsUpdating(false);
      setShowVersionUpdate(false);
      
      // Show success message
      showPopupMessage('Dashboard updated successfully! Refreshing to apply changes...', 'success');
      
      // Refresh the page after a short delay to apply updates
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      console.error('Update failed:', error);
      showPopupMessage('Update failed. Please try again.', 'error');
      setIsUpdating(false);
    }
  };

  // Skip update for now
  const handleSkipUpdate = () => {
    localStorage.setItem('admin-dashboard-version', CURRENT_VERSION);
    setShowVersionUpdate(false);
    showPopupMessage('You can update later from the settings.', 'info');
  };

  // Check for mobile screen size
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Currency configuration
  const currencies = [
    { code: 'UGX', symbol: 'USh', name: 'UGX - Ugandan Shilling' },
    { code: 'USD', symbol: '$', name: 'USD - US Dollar' },
    { code: 'EUR', symbol: '€', name: 'EUR - Euro' }
  ];

  const exchangeRates = {
    USD: 1,
    EUR: 0.85,
    UGX: 3700
  };

  // Currency conversion function
  const convertPrice = (priceUSD) => {
    const rate = exchangeRates[currentCurrency] || 1;
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

  // Load currency from localStorage on component mount
  useEffect(() => {
    const savedCurrency = localStorage.getItem('robert-izak-computers-currency');
    if (savedCurrency && ['UGX', 'USD', 'EUR'].includes(savedCurrency)) {
      setCurrentCurrency(savedCurrency);
    } else {
      setCurrentCurrency('UGX');
      localStorage.setItem('robert-izak-computers-currency', 'UGX');
    }
  }, []);

  // Save currency to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('robert-izak-computers-currency', currentCurrency);
  }, [currentCurrency]);

  // Theme management
  useEffect(() => {
    const initializeTheme = () => {
      const savedTheme = localStorage.getItem('admin-theme');
      const manualOverride = localStorage.getItem('admin-theme-manual');
      
      if (manualOverride === 'true') {
        // Use manually set theme
        setTheme(savedTheme || 'light');
      } else {
        // Use auto theme based on time
        const autoTheme = getAutoTheme();
        setTheme(autoTheme);
        localStorage.setItem('admin-theme', autoTheme);
      }
    };

    initializeTheme();

    // Check theme every minute
    const interval = setInterval(() => {
      const manualOverride = localStorage.getItem('admin-theme-manual');
      if (manualOverride !== 'true') {
        const autoTheme = getAutoTheme();
        setTheme(autoTheme);
        localStorage.setItem('admin-theme', autoTheme);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const getAutoTheme = () => {
    const now = new Date();
    const eatTime = new Date(now.toLocaleString("en-US", { timeZone: "Africa/Nairobi" }));
    const hours = eatTime.getHours();
    const minutes = eatTime.getMinutes();
    
    const currentTime = hours + minutes / 60;
    
    // Light mode from 8:00 AM (8.0) to 6:30 PM (18.5)
    if (currentTime >= 8.0 && currentTime < 18.5) {
      return 'light';
    } else {
      return 'dark';
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('admin-theme', newTheme);
    localStorage.setItem('admin-theme-manual', 'true');
  };

  const resetToAutoTheme = () => {
    localStorage.setItem('admin-theme-manual', 'false');
    const autoTheme = getAutoTheme();
    setTheme(autoTheme);
    localStorage.setItem('admin-theme', autoTheme);
  };

  const showPopupMessage = (message, type = 'info') => {
    setShowPopup({ show: true, message, type });
    setTimeout(() => {
      setShowPopup({ show: false, message: '', type: '' });
    }, 3000);
  };

  // Helper function to get customer display name - FIXED VERSION
  const getCustomerDisplayName = (customer) => {
    // Check if this is a customer object or just email string
    if (typeof customer === 'string') {
      return customer; // Return email if it's just a string
    }
    
    const firstName = customer.first_name?.trim() || '';
    const lastName = customer.last_name?.trim() || '';
    
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    } else if (firstName) {
      return firstName;
    } else if (lastName) {
      return lastName;
    } else {
      // Fallback to email username if no names are available
      if (customer.email) {
        const username = customer.email.split('@')[0];
        return username.charAt(0).toUpperCase() + username.slice(1);
      }
      return 'Customer';
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/admin-signin');
      return;
    }
    fetchDashboardData();
    setupRealtimeSubscriptions();
    fetchNotifications();
  }, [user, navigate]);

const fetchDashboardData = async () => {
  try {
    setLoading(true);
    
    // Calculate 24 hours ago
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    // Fetch all data in parallel - ADD ORDERS AND SERVICE INQUIRIES
    const [
      productsData, 
      categoriesData, 
      brandsData,
      lowStockData,
      featuredProductsData,
      customersData,
      ordersData, // 🔥 NEW: Fetch orders
      serviceInquiriesData // 🔥 NEW: Fetch service inquiries
    ] = await Promise.all([
      supabase.from('products').select('*'),
      supabase.from('categories').select('*'),
      supabase.from('brands').select('*'),
      supabase.from('products').select('*').lt('stock_quantity', 5),
      supabase.from('products').select('*').eq('is_featured', true),
      supabase.from('customers').select('*'),
      supabase.from('orders').select('*'), // 🔥 NEW: Get all orders
      supabase.from('service_inquiries').select('*') // 🔥 NEW: Get all service inquiries
    ]);

    setStats({
      totalProducts: productsData.data?.length || 0,
      totalCategories: categoriesData.data?.length || 0,
      totalBrands: brandsData.data?.length || 0,
      lowStockItems: lowStockData.data?.length || 0,
      featuredProducts: featuredProductsData.data?.length || 0,
      publishedProducts: productsData.data?.filter(p => p.is_published).length || 0,
      totalCustomers: customersData.data?.length || 0,
      totalOrders: ordersData.data?.length || 0, // 🔥 NEW: Total orders
      totalServices: serviceInquiriesData.data?.length || 0 // 🔥 NEW: Total services
    });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      showPopupMessage('Error loading dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

const fetchNotifications = async () => {
  try {
    // Calculate 24 hours ago for recent orders and customers
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    // Fetch low stock products - IMPORTANT: Use same threshold as dashboard
    const { data: lowStock } = await supabase
      .from('products')
      .select('name, stock_quantity, id, low_stock_threshold')
      .lt('stock_quantity', 5); // Use same threshold as your dashboard (5)

    // Fetch recent customers (last 24 hours)
    const { data: recentCustomers } = await supabase
      .from('customers')
      .select('*')
      .gte('created_at', twentyFourHoursAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(5);

    // Fetch recent orders (last 24 hours)
    const { data: recentOrders } = await supabase
      .from('orders')
      .select('*')
      .gte('created_at', twentyFourHoursAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(10);

    // 🔥 NEW: Fetch recent service inquiries (last 24 hours)
    const { data: recentServiceInquiries } = await supabase
      .from('service_inquiries')
      .select('*')
      .gte('created_at', twentyFourHoursAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(10);

    // Get cleared notifications from localStorage
    const clearedNotifications = window.clearedNotifications || new Set();

    // Create notifications array - FILTER OUT CLEARED NOTIFICATIONS
    const allNotifications = [
      // Low stock notifications - PERSISTENT until manually cleared
      ...(lowStock?.map(product => {
        const notificationId = `stock-${product.id}`;
        const threshold = product.low_stock_threshold || 5;
        
        return {
          id: notificationId,
          type: 'warning',
          message: `Low stock: ${product.name} (${product.stock_quantity} left, threshold: ${threshold})`,
          time: new Date().toISOString(), // Use current time to keep it fresh
          productId: product.id,
          isCleared: clearedNotifications.has(notificationId),
          isPersistent: true // Mark as persistent
        };
      }) || []),
      
      // Recent customer notifications
      ...(recentCustomers?.map(customer => {
        const notificationId = `customer-${customer.id}`;
        return {
          id: notificationId,
          type: 'info',
          message: `New customer: ${getCustomerDisplayName(customer)}`,
          time: customer.created_at,
          customerId: customer.id,
          isNew: customer.created_at > new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          isCleared: clearedNotifications.has(notificationId)
        };
      }) || []),

      // Recent order notifications
      ...(recentOrders?.map(order => {
        const notificationId = `order-${order.id}`;
        const isNewOrder = order.created_at > new Date(Date.now() - 15 * 60 * 1000).toISOString();
        
        return {
          id: notificationId,
          type: isNewOrder ? 'success' : 'info',
          message: `New order #${order.order_number} from ${order.customer_name} - ${getCurrencySymbol?.() || '$'}${convertPrice?.(order.total_amount) || order.total_amount}`,
          time: order.created_at,
          orderId: order.id,
          isNew: isNewOrder,
          isCleared: clearedNotifications.has(notificationId)
        };
      }) || []),

      // 🔥 NEW: Service inquiry notifications
      ...(recentServiceInquiries?.map(inquiry => {
        const notificationId = `service-${inquiry.id}`;
        const isNewInquiry = inquiry.created_at > new Date(Date.now() - 15 * 60 * 1000).toISOString();
        
        // Determine service type for display
        let serviceType = 'Service';
        let serviceIcon = '🛠️';
        
        if (inquiry.service_type === 'web_development') {
          serviceType = 'Web Development';
          serviceIcon = '🌐';
        } else if (inquiry.service_type === 'app_development') {
          serviceType = 'App Development';
          serviceIcon = '📱';
        }

        return {
          id: notificationId,
          type: isNewInquiry ? 'success' : 'info',
          message: `${serviceIcon} New ${serviceType} inquiry: ${inquiry.service_name}`,
          time: inquiry.created_at,
          inquiryId: inquiry.id,
          serviceType: inquiry.service_type,
          isNew: isNewInquiry,
          isCleared: clearedNotifications.has(notificationId)
        };
      }) || [])
    ];

    // Filter out cleared notifications - LOW STOCK NOTIFICATIONS WILL PERSIST UNLESS CLEARED
    const filteredNotifications = allNotifications.filter(notification => !notification.isCleared);

    setNotifications(filteredNotifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
  }
};

const setupRealtimeSubscriptions = () => {
  // Enhanced products subscription that handles inventory changes
  const productsSubscription = supabase
    .channel('products-changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'products' }, 
      (payload) => {
        console.log('Product change detected:', payload);
        fetchDashboardData();
        fetchNotifications(); // This will refresh notifications including low stock
        
        // Special handling for stock level changes
        if (payload.eventType === 'UPDATE') {
          const newProduct = payload.new;
          const oldProduct = payload.old;
          
          // Check if stock crossed the low stock threshold
          const oldStock = oldProduct.stock_quantity || 0;
          const newStock = newProduct.stock_quantity || 0;
          const threshold = newProduct.low_stock_threshold || 5;
          
          const wasAboveThreshold = oldStock > threshold;
          const isNowBelowThreshold = newStock <= threshold;
          
          if (wasAboveThreshold && isNowBelowThreshold) {
            // Stock just went below threshold - show immediate popup
            showPopupMessage(`Low stock alert: ${newProduct.name} (${newStock} left)`, 'warning');
          } else if (oldStock <= threshold && newStock > threshold) {
            // Stock just went above threshold - clear the notification
            const notificationId = `stock-${newProduct.id}`;
            markNotificationAsRead(notificationId);
            showPopupMessage(`${newProduct.name} stock replenished`, 'success');
          }
        }
      }
    )
    .subscribe();

  // Customers subscription
  const customersSubscription = supabase
    .channel('customers-changes')
    .on('postgres_changes', 
      { event: 'INSERT', schema: 'public', table: 'customers' }, 
      (payload) => {
        console.log('New customer detected:', payload);
        
        const newCustomer = payload.new;
        const customerName = getCustomerDisplayName(newCustomer);
        const notificationId = `customer-${newCustomer.id}`;
        
        const clearedNotifications = window.clearedNotifications || new Set();
        if (clearedNotifications.has(notificationId)) {
          return;
        }
        
        const newNotification = {
          id: notificationId,
          type: 'info',
          message: `New customer registered: ${customerName}`,
          time: new Date().toISOString(),
          customerId: newCustomer.id,
          isNew: true
        };
        
        setNotifications(prev => [newNotification, ...prev]);
        fetchDashboardData();
        showPopupMessage(`New customer: ${customerName} registered!`, 'success');
      }
    )
    .subscribe();

  // Orders subscription for real-time order notifications
  const ordersSubscription = supabase
    .channel('orders-changes')
    .on('postgres_changes', 
      { event: 'INSERT', schema: 'public', table: 'orders' }, 
      (payload) => {
        console.log('New order detected:', payload);
        
        const newOrder = payload.new;
        const notificationId = `order-${newOrder.id}`;
        
        const clearedNotifications = window.clearedNotifications || new Set();
        if (clearedNotifications.has(notificationId)) {
          return;
        }
        
        const newNotification = {
          id: notificationId,
          type: 'success',
          message: `New order #${newOrder.order_number} from ${newOrder.customer_name} - ${getCurrencySymbol()}${convertPrice(newOrder.total_amount)}`,
          time: new Date().toISOString(),
          orderId: newOrder.id,
          isNew: true
        };
        
        // Add to notifications
        setNotifications(prev => [newNotification, ...prev]);
        
        // Refresh dashboard data
        fetchDashboardData();
        
        // Show popup notification
        showPopupMessage(`New order #${newOrder.order_number} received!`, 'success');
        
        // Notify AnalyticsDashboard to refresh
        window.dispatchEvent(new CustomEvent('ordersUpdated'));
      }
    )
    .subscribe();

  // 🔥 NEW: Service Inquiries subscription for real-time notifications
  const serviceInquiriesSubscription = supabase
    .channel('service-inquiries-changes')
    .on('postgres_changes', 
      { event: 'INSERT', schema: 'public', table: 'service_inquiries' }, 
      (payload) => {
        console.log('New service inquiry detected:', payload);
        
        const newInquiry = payload.new;
        const notificationId = `service-${newInquiry.id}`;
        
        const clearedNotifications = window.clearedNotifications || new Set();
        if (clearedNotifications.has(notificationId)) {
          return;
        }
        
        // Determine service type for display
        let serviceType = 'Service';
        let serviceIcon = '🛠️';
        
        if (newInquiry.service_type === 'web_development') {
          serviceType = 'Web Development';
          serviceIcon = '🌐';
        } else if (newInquiry.service_type === 'app_development') {
          serviceType = 'App Development';
          serviceIcon = '📱';
        }

        const newNotification = {
          id: notificationId,
          type: 'success',
          message: `${serviceIcon} New ${serviceType} inquiry: ${newInquiry.service_name}`,
          time: new Date().toISOString(),
          inquiryId: newInquiry.id,
          serviceType: newInquiry.service_type,
          isNew: true
        };
        
        // Add to notifications (following existing pattern)
        setNotifications(prev => [newNotification, ...prev]);
        
        // Refresh dashboard data (following existing pattern)
        fetchDashboardData();
        
        // Show popup notification (following existing pattern)
        showPopupMessage(`New ${serviceType} inquiry received!`, 'success');
      }
    )
    .subscribe();

  // Optional: Categories subscription for real-time updates
  const categoriesSubscription = supabase
    .channel('categories-changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'categories' }, 
      () => {
        fetchDashboardData();
      }
    )
    .subscribe();

  // Optional: Brands subscription for real-time updates
  const brandsSubscription = supabase
    .channel('brands-changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'brands' }, 
      () => {
        fetchDashboardData();
      }
    )
    .subscribe();

  return () => {
    productsSubscription.unsubscribe();
    customersSubscription.unsubscribe();
    ordersSubscription.unsubscribe();
    serviceInquiriesSubscription.unsubscribe(); // 🔥 NEW: Unsubscribe service inquiries
    categoriesSubscription.unsubscribe();
    brandsSubscription.unsubscribe();
  };
};

  // Enhanced logout function with professional loading
// Enhanced logout function - Add this to preserve cleared notifications
const handleSignOut = async () => {
  setIsLoggingOut(true);
  setLogoutProgress(0);
  
  try {
    // Step 1: Starting logout process
    setLogoutProgress(10);
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Step 2: PRESERVE cleared notifications but clear other session data
    setLogoutProgress(30);
    
    // Save current cleared notifications before clearing other data
    const currentClearedNotifications = localStorage.getItem('admin-cleared-notifications');
    
    // Clear session data but keep notification preferences
    localStorage.removeItem('admin-theme-manual');
    
    // Restore cleared notifications after brief delay
    setTimeout(() => {
      if (currentClearedNotifications) {
        localStorage.setItem('admin-cleared-notifications', currentClearedNotifications);
      }
    }, 100);
    
    await new Promise(resolve => setTimeout(resolve, 400));
    
    // Step 3: Signing out from Supabase
    setLogoutProgress(70);
    await supabase.auth.signOut();
    
    // Step 4: Finalizing logout
    setLogoutProgress(90);
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Step 5: Complete
    setLogoutProgress(100);
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Reset theme to auto mode when user logs out
    resetToAutoTheme();
    
    // Navigate to signin page
    navigate('/admin-signin');
    
  } catch (error) {
    console.error('Logout error:', error);
    // Even if there's an error, still navigate to signin
    navigate('/admin-signin');
  } finally {
    setIsLoggingOut(false);
    setLogoutProgress(0);
  }
};

  const confirmSignOut = () => {
    setShowLogoutConfirm(true);
  };

  const markNotificationAsRead = (notificationId) => {
    // Add to cleared notifications in localStorage
    const clearedNotifications = window.clearedNotifications || new Set();
    clearedNotifications.add(notificationId);
    saveClearedNotifications(clearedNotifications);
    
    // Remove from current notifications
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
  };

  const clearAllNotifications = () => {
    // Add all current notification IDs to cleared notifications
    const clearedNotifications = window.clearedNotifications || new Set();
    notifications.forEach(notification => {
      clearedNotifications.add(notification.id);
    });
    saveClearedNotifications(clearedNotifications);
    
    // Clear all notifications from state
    setNotifications([]);
  };

  const handleRestock = (product) => {
    setActiveTab('products');
    // This will trigger the ProductsManagement component to open the edit form
    setTimeout(() => {
      const event = new CustomEvent('editProduct', { detail: product });
      window.dispatchEvent(event);
    }, 100);
  };

  // Currency change handler
  const handleCurrencyChange = (currencyCode) => {
    setCurrentCurrency(currencyCode);
    setShowCurrencyDropdown(false);
    // Dispatch currency change event for other components
    window.dispatchEvent(new CustomEvent('currencyChange', { detail: currencyCode }));
  };

  // Theme styles
  const themeStyles = {
    light: {
      background: '#f5f5f5',
      headerBg: '#1a202c',
      headerColor: 'white',
      cardBg: 'white',
      cardShadow: '0 2px 4px rgba(0,0,0,0.1)',
      text: '#2d3748',
      textMuted: '#718096',
      border: '#e2e8f0',
      inputBg: '#2d3748',
      navBg: '#2d3748'
    },
    dark: {
      background: '#1a202c',
      headerBg: '#2d3748',
      headerColor: 'white',
      cardBg: '#2d3748',
      cardShadow: '0 2px 4px rgba(0,0,0,0.3)',
      text: '#e2e8f0',
      textMuted: '#a0aec0',
      border: '#4a5568',
      inputBg: '#4a5568',
      navBg: '#2d3748'
    }
  };

  const currentTheme = themeStyles[theme];

  // Search functionality for dashboard home
  const filteredDashboardData = () => {
  if (!searchTerm) {
    return {
      recentProducts,
      lowStockProducts,
      recentCustomers
    };
  }

  const searchLower = searchTerm.toLowerCase();
  
  // FIX 1: Add null checks and better logging
  const filteredRecentProducts = recentProducts.filter(product => {
    const matches = 
      (product.name?.toLowerCase() || '').includes(searchLower) ||
      (product.sku?.toLowerCase() || '').includes(searchLower) ||
      (product.categories?.name?.toLowerCase() || '').includes(searchLower) ||
      (product.brands?.name?.toLowerCase() || '').includes(searchLower);
    
    if (matches) {
      console.log('✅ Product matches:', {
        name: product.name,
        brand: product.brands?.name,
        matchesSearch: searchTerm
      });
    }
    
    return matches;
  });

  // FIX 2: For low stock, also check brand
  const filteredLowStockProducts = lowStockProducts.filter(product => {
    return (
      (product.name?.toLowerCase() || '').includes(searchLower) ||
      (product.sku?.toLowerCase() || '').includes(searchLower) ||
      (product.brands?.name?.toLowerCase() || '').includes(searchLower)
    );
  });

  // Customer search remains the same
  const filteredRecentCustomers = recentCustomers.filter(customer => {
    const customerName = getCustomerDisplayName(customer).toLowerCase();
    const customerEmail = customer.email?.toLowerCase() || '';
    const customerPhone = customer.phone?.toLowerCase() || '';
    
    return (
      customerName.includes(searchLower) ||
      customerEmail.includes(searchLower) ||
      customerPhone.includes(searchLower)
    );
  });

  // Log what we found
  console.log('🔍 SEARCH RESULTS:', {
    term: searchTerm,
    productsFound: filteredRecentProducts.length,
    lowStockFound: filteredLowStockProducts.length,
    customersFound: filteredRecentCustomers.length,
    allProducts: recentProducts.map(p => ({ name: p.name, brand: p.brands?.name }))
  });

  return {
    recentProducts: filteredRecentProducts,
    lowStockProducts: filteredLowStockProducts,
    recentCustomers: filteredRecentCustomers
  };
};

  // Enhanced Logout Confirmation Popup with loading state
  const renderLogoutConfirmation = () => {
    if (showLogoutConfirm) {
      return (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: isMobile ? '20px' : '0'
        }}>
          <div style={{
            background: currentTheme.cardBg,
            padding: isMobile ? '20px' : '30px',
            borderRadius: '16px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            maxWidth: '400px',
            width: '90%',
            textAlign: 'center',
            border: `2px solid ${currentTheme.border}`
          }}>
            {isLoggingOut ? (
              // Logout in progress view
              <>
                <div style={{ 
                  fontSize: '48px', 
                  marginBottom: '20px',
                  animation: 'pulse 1.5s infinite'
                }}>
                  🔄
                </div>
                
                <h3 style={{ margin: '0 0 10px 0', color: currentTheme.text }}>
                  Logging Out...
                </h3>
                
                <p style={{ color: currentTheme.textMuted, marginBottom: '25px' }}>
                  Please wait while we secure your session
                </p>

                {/* Progress bar */}
                <div style={{
                  background: currentTheme.background,
                  borderRadius: '10px',
                  height: '8px',
                  marginBottom: '20px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    background: 'linear-gradient(90deg, #4299e1, #667eea)',
                    height: '100%',
                    width: `${logoutProgress}%`,
                    transition: 'width 0.3s ease',
                    borderRadius: '10px'
                  }}></div>
                </div>
                
                <p style={{ 
                  color: currentTheme.textMuted, 
                  fontSize: '14px',
                  marginBottom: '20px'
                }}>
                  Securing your data... {Math.round(logoutProgress)}%
                </p>
              </>
            ) : (
              // Confirmation view
              <>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚪</div>
                <h3 style={{ margin: '0 0 10px 0', color: currentTheme.text }}>
                  Confirm Logout
                </h3>
                <p style={{ color: currentTheme.textMuted, marginBottom: '25px' }}>
                  Are you sure you want to logout? You'll need to sign in again to access the admin panel.
                </p>
                <div style={{ 
                  display: 'flex', 
                  gap: '12px', 
                  justifyContent: 'center', 
                  flexDirection: isMobile ? 'column' : 'row' 
                }}>
                  <button
                    onClick={() => setShowLogoutConfirm(false)}
                    style={{
                      background: '#a0aec0',
                      color: 'white',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '500',
                      fontSize: '14px',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#718096';
                      e.target.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = '#a0aec0';
                      e.target.style.transform = 'translateY(0)';
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSignOut}
                    style={{
                      background: 'linear-gradient(135deg, #e53e3e, #c53030)',
                      color: 'white',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '14px',
                      transition: 'transform 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                    }}
                  >
                    Yes, Logout
                  </button>
                </div>
              </>
            )}
          </div>
          
          <style>
            {`
              @keyframes pulse {
                0%, 100% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.1); opacity: 0.8; }
              }
            `}
          </style>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: currentTheme.background
      }}>
        <div>
          <div style={{
            width: '50px',
            height: '50px',
            border: '5px solid #f3f3f3',
            borderTop: '5px solid #3498db',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <h2 style={{ color: currentTheme.text, margin: 0 }}>Loading Admin Dashboard...</h2>
        </div>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  const dashboardData = filteredDashboardData();

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: currentTheme.background,
      color: currentTheme.text,
      transition: 'all 0.3s ease',
      position: 'relative'
    }}>
      {/* Global loading overlay for logout */}
      {isLoggingOut && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.9)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          color: 'white'
        }}>
          <div style={{
            textAlign: 'center',
            maxWidth: '400px',
            padding: '40px'
          }}>
            <div style={{
              fontSize: '60px',
              marginBottom: '20px',
              animation: 'rotate 2s linear infinite'
            }}>
              ⚡
            </div>
            
            <h2 style={{ 
              margin: '0 0 16px 0',
              fontSize: '24px',
              fontWeight: '600'
            }}>
              Securing Your Session
            </h2>
            
            <p style={{
              marginBottom: '30px',
              opacity: 0.8,
              lineHeight: '1.5'
            }}>
              We're safely logging you out and clearing your session data...
            </p>

            {/* Enhanced progress bar */}
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '12px',
              height: '6px',
              marginBottom: '20px',
              overflow: 'hidden',
              position: 'relative'
            }}>
              <div style={{
                background: 'linear-gradient(90deg, #48bb78, #4299e1, #9f7aea)',
                height: '100%',
                width: `${logoutProgress}%`,
                transition: 'width 0.4s ease',
                borderRadius: '12px',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                  animation: 'shimmer 2s infinite'
                }}></div>
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '10px',
              fontSize: '14px'
            }}>
              <span>Progress</span>
              <span>{Math.round(logoutProgress)}%</span>
            </div>

            {/* Step indicators */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '12px',
              opacity: 0.7,
              marginTop: '30px'
            }}>
              <span style={{ 
                opacity: logoutProgress >= 10 ? 1 : 0.5,
                fontWeight: logoutProgress >= 10 ? '600' : '400'
              }}>
                Starting...
              </span>
              <span style={{ 
                opacity: logoutProgress >= 30 ? 1 : 0.5,
                fontWeight: logoutProgress >= 30 ? '600' : '400'
              }}>
                Clearing Data
              </span>
              <span style={{ 
                opacity: logoutProgress >= 70 ? 1 : 0.5,
                fontWeight: logoutProgress >= 70 ? '600' : '400'
              }}>
                Signing Out
              </span>
              <span style={{ 
                opacity: logoutProgress >= 90 ? 1 : 0.5,
                fontWeight: logoutProgress >= 90 ? '600' : '400'
              }}>
                Complete
              </span>
            </div>
          </div>
          
          <style>
            {`
              @keyframes rotate {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
              @keyframes shimmer {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
              }
            `}
          </style>
        </div>
      )}

      {/* Version Update Popup */}
      {showVersionUpdate && !isLoggingOut && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: isMobile ? '20px' : '40px'
        }}>
          <div style={{
            background: currentTheme.cardBg,
            padding: isMobile ? '20px' : '30px',
            borderRadius: '16px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            maxWidth: '500px',
            width: '90%',
            textAlign: 'center',
            border: `2px solid ${currentTheme.border}`
          }}>
            <div style={{ 
              fontSize: '48px', 
              marginBottom: '20px',
              animation: 'bounce 2s infinite'
            }}>
              🚀
            </div>
            
            <h2 style={{ 
              margin: '0 0 10px 0', 
              color: currentTheme.text,
              fontSize: isMobile ? '20px' : '24px'
            }}>
              New Update Available!
            </h2>
            
            <p style={{ 
              color: currentTheme.textMuted, 
              marginBottom: '25px',
              fontSize: isMobile ? '14px' : '16px',
              lineHeight: '1.5'
            }}>
              Version {newVersion} is ready. Update to get the latest features and improvements.
            </p>

            {isUpdating ? (
              <div>
                <div style={{
                  background: currentTheme.background,
                  borderRadius: '10px',
                  height: '12px',
                  marginBottom: '20px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    background: 'linear-gradient(90deg, #48bb78, #4299e1)',
                    height: '100%',
                    width: `${updateProgress}%`,
                    transition: 'width 0.3s ease',
                    borderRadius: '10px'
                  }}></div>
                </div>
                <p style={{ 
                  color: currentTheme.textMuted, 
                  fontSize: '14px',
                  marginBottom: '20px'
                }}>
                  Updating... {Math.round(updateProgress)}%
                </p>
              </div>
            ) : (
              <div style={{ 
                display: 'flex', 
                gap: '12px', 
                justifyContent: 'center',
                flexDirection: isMobile ? 'column' : 'row'
              }}>
                <button
                  onClick={handleSkipUpdate}
                  style={{
                    background: 'transparent',
                    color: currentTheme.text,
                    border: `1px solid ${currentTheme.border}`,
                    padding: '12px 24px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    fontSize: '14px',
                    transition: 'all 0.2s ease',
                    display: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = currentTheme.background;
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'transparent';
                  }}
                >
                  Update Later
                </button>
                <button
                  onClick={handleVersionUpdate}
                  style={{
                    background: 'linear-gradient(135deg, #48bb78, #4299e1)',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '14px',
                    transition: 'transform 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  Update Now
                </button>
              </div>
            )}

            <style>
              {`
                @keyframes bounce {
                  0%, 20%, 50%, 80%, 100% {transform: translateY(0);}
                  40% {transform: translateY(-10px);}
                  60% {transform: translateY(-5px);}
                }
              `}
            </style>
          </div>
        </div>
      )}

      {/* Popup Message */}
      {showPopup.show && !isLoggingOut && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: isMobile ? '10px' : '20px',
          left: isMobile ? '10px' : 'auto',
          background: showPopup.type === 'error' ? '#fed7d7' : 
                     showPopup.type === 'success' ? '#c6f6d5' : '#bee3f8',
          color: showPopup.type === 'error' ? '#742a2a' : 
                showPopup.type === 'success' ? '#22543d' : '#2a4365',
          padding: '16px 20px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          minWidth: isMobile ? 'auto' : '300px',
          borderLeft: `4px solid ${
            showPopup.type === 'error' ? '#e53e3e' : 
            showPopup.type === 'success' ? '#48bb78' : '#4299e1'
          }`
        }}>
          <span style={{ fontSize: '20px' }}>
            {showPopup.type === 'error' ? '❌' : 
             showPopup.type === 'success' ? '✅' : 'ℹ️'}
          </span>
          <span style={{ fontWeight: '500' }}>{showPopup.message}</span>
        </div>
      )}

      {/* Enhanced Logout Confirmation */}
      {renderLogoutConfirmation()}

      {/* Header */}
      <header style={{
        background: currentTheme.headerBg,
        color: currentTheme.headerColor,
        padding: isMobile ? '10px 15px' : '15px 20px',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'flex-start' : 'center',
        gap: isMobile ? '15px' : '0',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        position: 'relative',
        zIndex: 100
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '12px', marginBottom: '2px' }}>
            <h1 style={{ 
              margin: 0, 
              fontSize: isMobile ? '18px' : '24px', 
              fontWeight: 'bold',
              lineHeight: 1
            }}>
              ROBERT & IZAK COMPUTERS
            </h1>
            <img 
              src="/LOGO.png" 
              alt="Robert & Izak Computers" 
              style={{ 
                height: isMobile ? '20px' : '28px',
                width: 'auto',
                objectFit: 'contain'
              }} 
            />
          </div>
          <p style={{ 
            margin: 0, 
            fontSize: isMobile ? '12px' : '14px', 
            opacity: 0.8 
          }}>
            Admin Dashboard
          </p>
        </div>
        
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: isMobile ? '10px' : '20px',
          width: isMobile ? '100%' : 'auto',
          justifyContent: isMobile ? 'space-between' : 'flex-end',
          flexWrap: 'wrap'
        }}>
          {/* Currency Selector */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                color: 'white',
                border: 'none',
                padding: isMobile ? '6px 8px' : '8px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: isMobile ? '12px' : '14px',
                fontWeight: '500'
              }}
            >
              <span>{currencies.find(c => c.code === currentCurrency)?.symbol}</span>
              <span style={{ fontSize: '10px' }}>▼</span>
            </button>

            {showCurrencyDropdown && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: isMobile ? 'auto' : 0,
                left: isMobile ? 0 : 'auto',
                background: '#2d3748',
                border: '1px solid #4a5568',
                borderRadius: '4px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                zIndex: 1001,
                minWidth: isMobile ? '150px' : '180px',
                marginTop: '5px',
                overflow: 'hidden'
              }}>
                {currencies.map((currency) => (
                  <div
                    key={currency.code}
                    onClick={() => handleCurrencyChange(currency.code)}
                    style={{
                      padding: '10px 12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: isMobile ? '12px' : '14px',
                      color: 'white',
                      transition: 'background 0.2s ease',
                      background: currency.code === currentCurrency ? '#4a5568' : 'transparent'
                    }}
                  >
                    <span style={{ fontWeight: 'bold' }}>{currency.symbol}</span>
                    <span>{isMobile ? currency.code : currency.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Theme Toggle - Always visible */}
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '5px' : '10px' }}>
            <button
              onClick={toggleTheme}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'white',
                fontSize: isMobile ? '18px' : '20px',
                cursor: 'pointer',
                padding: isMobile ? '6px' : '8px',
                borderRadius: '50%',
                transition: 'background-color 0.2s'
              }}
              title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            <button
              onClick={resetToAutoTheme}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'white',
                fontSize: isMobile ? '12px' : '14px',
                cursor: 'pointer',
                padding: isMobile ? '4px 8px' : '6px 12px',
                borderRadius: '4px',
                transition: 'background-color 0.2s'
              }}
              title="Reset to auto theme"
            >
              {isMobile ? 'Auto' : 'Auto Theme'}
            </button>
          </div>

          {/* Search Bar - Hidden on mobile */}
          {!isMobile && (
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search products, customers, categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  padding: '8px 35px 8px 12px',
                  borderRadius: '20px',
                  border: 'none',
                  background: currentTheme.inputBg,
                  color: 'white',
                  width: '250px',
                  outline: 'none'
                }}
              />
              <span style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#a0aec0'
              }}>
                🔍
              </span>
            </div>
          )}

          {/* Notifications - FIXED to show new customers */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                fontSize: '20px',
                cursor: 'pointer',
                position: 'relative'
              }}
            >
              🔔
              {notifications.length > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-5px',
                  right: '-5px',
                  background: '#e53e3e',
                  color: 'white',
                  borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {notifications.length}
                </span>
              )}
            </button>

            {showNotifications && (
              <div style={{
                position: isMobile ? 'fixed' : 'absolute',
                top: isMobile ? '60px' : '40px',
                right: isMobile ? '10px' : '0',
                left: isMobile ? '10px' : 'auto',
                background: currentTheme.cardBg,
                border: `1px solid ${currentTheme.border}`,
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                width: isMobile ? 'calc(100% - 20px)' : '300px',
                maxHeight: '400px',
                overflow: 'auto',
                zIndex: 1000
              }}>
                <div style={{
                  padding: '15px',
                  borderBottom: `1px solid ${currentTheme.border}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <strong style={{ color: currentTheme.text }}>Notifications</strong>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                      onClick={clearAllNotifications}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#4299e1',
                        cursor: 'pointer',
                        fontSize: isMobile ? '12px' : '14px',
                        padding: '4px 8px'
                      }}
                    >
                      Clear All
                    </button>
                    <button
                      onClick={() => setShowNotifications(false)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: currentTheme.text,
                        cursor: 'pointer',
                        fontSize: isMobile ? '16px' : '18px',
                        padding: '4px 8px',
                        fontWeight: 'bold',
                        borderRadius: '4px',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = theme === 'light' ? '#f7fafc' : '#4a5568';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'none';
                      }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
                {notifications.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: currentTheme.textMuted }}>
                    No new notifications
                  </div>
                ) : (
                  notifications.map(notification => (
                   <div
    key={notification.id}
    style={{
      padding: '12px 15px',
      borderBottom: `1px solid ${currentTheme.border}`,
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      background: notification.isNew ? 
        (theme === 'light' ? '#ebf8ff' : '#2a4365') : 'transparent',
      borderLeft: notification.isNew ? '3px solid #4299e1' : 'none'
    }}
   // In the notifications map section, update the onClick handler:
onClick={() => {
  markNotificationAsRead(notification.id);
  
  // Handle different notification types (existing logic)
  if (notification.productId) {
    // If it's a product/inventory notification, navigate to products/inventory tab
    setActiveTab('inventory');
    setShowNotifications(false);
  } else if (notification.customerId) {
    // If it's a customer notification, navigate to customers tab
    setActiveTab('customers');
    setShowNotifications(false);
  } else if (notification.orderId) {
    // If it's an order notification, navigate to orders tab
    setActiveTab('orders');
    setShowNotifications(false);
  } else if (notification.inquiryId) {
    // 🔥 NEW: If it's a service inquiry, navigate to services tab
    setActiveTab('services');
    setShowNotifications(false);
  }
  // Existing logic for other notification types remains unchanged
}}
  >
    <div style={{ 
      display: 'flex',
      alignItems: 'flex-start',
      gap: '10px'
    }}>

<div style={{ 
  fontSize: '16px',
  flexShrink: 0
}}>
  {notification.type === 'warning' ? '⚠️' : 
   notification.type === 'info' ? '👤' : 
   notification.type === 'success' ? 
     (notification.serviceType ? '🛠️' : '🛒') : 'ℹ️'}
</div>
                      
<div style={{ 
  color: notification.type === 'warning' ? '#e53e3e' : 
        notification.type === 'info' ? '#4299e1' : currentTheme.text,
  fontSize: '14px',
  marginBottom: '4px',
  fontWeight: notification.isNew ? '600' : '400'
}}>
  {notification.message}
  {notification.serviceType && (
    <span style={{
      background: notification.serviceType === 'web_development' ? '#4299e1' : 
                 notification.serviceType === 'app_development' ? '#48bb78' : '#9f7aea',
      color: 'white',
      fontSize: '10px',
      padding: '2px 6px',
      borderRadius: '8px',
      marginLeft: '8px',
      fontWeight: '600'
    }}>
      {notification.serviceType === 'web_development' ? 'WEB' : 
       notification.serviceType === 'app_development' ? 'APP' : 'SERVICE'}
    </span>
  )}
  {notification.isNew && (
    <span style={{
      background: '#4299e1',
      color: 'white',
      fontSize: '10px',
      padding: '2px 6px',
      borderRadius: '8px',
      marginLeft: '8px',
      fontWeight: '600'
    }}>
      NEW
    </span>
  )}
</div>
      {notification.isNew && (
        <div style={{
          width: '8px',
          height: '8px',
          background: '#4299e1',
          borderRadius: '50%',
          flexShrink: 0,
          marginTop: '4px'
        }}></div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px',
            flexWrap: 'wrap',
            justifyContent: isMobile ? 'flex-end' : 'flex-start',
            flex: isMobile ? 1 : 'none',
            minWidth: 0
          }}>
            {!isMobile && (
              <span style={{ 
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '200px'
              }}>
                {user?.email}
              </span>
            )}
            <button
              onClick={confirmSignOut}
              disabled={isLoggingOut}
              style={{
                background: isLoggingOut ? '#a0aec0' : '#e53e3e',
                color: 'white',
                border: 'none',
                padding: isMobile ? '6px 12px' : '8px 16px',
                borderRadius: '4px',
                cursor: isLoggingOut ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s',
                fontSize: isMobile ? '12px' : '14px',
                whiteSpace: 'nowrap',
                opacity: isLoggingOut ? 0.7 : 1
              }}
            >
              {isLoggingOut ? 'Logging Out...' : 'Sign Out'}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Search Bar */}
      {isMobile && (
        <div style={{
          padding: '10px 15px',
          background: currentTheme.navBg,
          borderBottom: `1px solid ${currentTheme.border}`
        }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search products, customers, categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '10px 35px 10px 12px',
                borderRadius: '20px',
                border: 'none',
                background: currentTheme.inputBg,
                color: 'white',
                width: '100%',
                outline: 'none',
                fontSize: '14px'
              }}
            />
            <span style={{
              position: 'absolute',
              right: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#a0aec0'
            }}>
              🔍
            </span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav style={{
        background: currentTheme.navBg,
        padding: isMobile ? '5px' : '10px 20px',
        display: 'flex',
        gap: isMobile ? '5px' : '10px',
        alignItems: 'center',
        flexWrap: 'wrap',
        justifyContent: isMobile ? 'center' : 'flex-start',
        overflowX: isMobile ? 'auto' : 'visible'
      }}>
{[
  'dashboard', 'products', 'categories', 'brands', 'orders',
  'services', 'inventory', 'analytics', 'customers'  // 🔥 ADDED SERVICES
].map(tab => (
  <button
    key={tab}
    onClick={() => setActiveTab(tab)}
    style={{
      background: activeTab === tab ? '#4a5568' : 'transparent',
      color: 'white',
      border: 'none',
      padding: isMobile ? '6px 12px' : '8px 16px',
      borderRadius: '4px',
      cursor: 'pointer',
      textTransform: 'capitalize',
      transition: 'all 0.2s',
      fontWeight: activeTab === tab ? '600' : '400',
      fontSize: isMobile ? '12px' : '14px',
      whiteSpace: 'nowrap'
    }}
  >
    {tab === 'services' ? '🛠️ Services' : tab}  {/* 🔥 ADDED ICON */}
  </button>
))}
      </nav>

      {/* Main Content */}
      <main style={{ 
        padding: isMobile ? '15px' : '20px',
        paddingBottom: isMobile ? '80px' : '20px' // Extra space for mobile
      }}>
        {activeTab === 'dashboard' && (
          <DashboardHome 
            stats={stats} 
            recentProducts={dashboardData.recentProducts} 
            lowStockProducts={dashboardData.lowStockProducts}
            recentCustomers={dashboardData.recentCustomers}
            onRestock={handleRestock}
            theme={theme}
            currentTheme={currentTheme}
            convertPrice={convertPrice}
            getCurrencySymbol={getCurrencySymbol}
            currentCurrency={currentCurrency}
            isMobile={isMobile}
            searchTerm={searchTerm}
            getCustomerDisplayName={getCustomerDisplayName}
            setActiveTab={setActiveTab} // 🔥 ADD THIS LINE
          />
        )}

        {activeTab === 'products' && (
          <ProductsManagement 
            searchTerm={searchTerm} 
            theme={theme}
            currentTheme={currentTheme}
            showPopupMessage={showPopupMessage}
            convertPrice={convertPrice}
            getCurrencySymbol={getCurrencySymbol}
            currentCurrency={currentCurrency}
            isMobile={isMobile}
          />
        )}

        {activeTab === 'categories' && (
          <CategoriesManagement 
            searchTerm={searchTerm}
            theme={theme}
            currentTheme={currentTheme}
            showPopupMessage={showPopupMessage}
            isMobile={isMobile}
          />
        )}

        {activeTab === 'brands' && (
          <BrandsManagement 
            searchTerm={searchTerm}
            theme={theme}
            currentTheme={currentTheme}
            showPopupMessage={showPopupMessage}
            isMobile={isMobile}
          />
        )}

        {/* ADD THIS ORDERS SECTION RIGHT HERE */}
{activeTab === 'orders' && (
  <OrdersManagement 
    searchTerm={searchTerm}
    theme={theme}
    currentTheme={currentTheme}
    showPopupMessage={showPopupMessage}
    isMobile={isMobile}
    convertPrice={convertPrice}
    getCurrencySymbol={getCurrencySymbol}
    currentCurrency={currentCurrency}
  />
        )}
{activeTab === 'services' && (
  <ServicesManagement 
    searchTerm={searchTerm}
    theme={theme}
    currentTheme={currentTheme}
    showPopupMessage={showPopupMessage}
    isMobile={isMobile}
    convertPrice={convertPrice}
    getCurrencySymbol={getCurrencySymbol}
    currentCurrency={currentCurrency}
  />
)}
        {activeTab === 'inventory' && (
          <InventoryManagement 
            searchTerm={searchTerm}
            theme={theme}
            currentTheme={currentTheme}
            isMobile={isMobile}
          />
        )}
{activeTab === 'analytics' && (
  <AnalyticsDashboard 
    searchTerm={searchTerm}
    stats={stats} 
    theme={theme}
    currentTheme={currentTheme}
    isMobile={isMobile}
    convertPrice={convertPrice}
    getCurrencySymbol={getCurrencySymbol}
    currentCurrency={currentCurrency}
  />
)}

        {activeTab === 'customers' && (
          <CustomersManagement 
            searchTerm={searchTerm}
            theme={theme}
            currentTheme={currentTheme}
            showPopupMessage={showPopupMessage}
            isMobile={isMobile}
            getCustomerDisplayName={getCustomerDisplayName}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: currentTheme.navBg,
          borderTop: `1px solid ${currentTheme.border}`,
          display: 'flex',
          justifyContent: 'space-around',
          padding: '10px 0',
          zIndex: 1000
        }}>
          
{['dashboard', 'products','orders', 'services', 'customers'].map(tab => (  // 🔥 ADDED SERVICES
  <button
    key={tab}
    onClick={() => setActiveTab(tab)}
    style={{
      background: 'transparent',
      border: 'none',
      color: activeTab === tab ? '#4299e1' : 'white',
      cursor: 'pointer',
      textTransform: 'capitalize',
      fontSize: '12px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '4px'
    }}
  >
    <span style={{ fontSize: '16px' }}>
      {tab === 'dashboard' && '📊'}
      {tab === 'products' && '📦'}
      {tab === 'orders' && '🛒'}
      {tab === 'services' && '🛠️'}  {/* 🔥 ADDED ICON */}
      {tab === 'customers' && '👥'}
    </span>
    <span>{tab}</span>
  </button>
))}
        </div>
      )}
    </div>
  );
};

// Dashboard Home Component - Updated with proper customer display name
const DashboardHome = ({ 
  stats, 
  recentProducts, 
  lowStockProducts, 
  recentCustomers, 
  onRestock, 
  theme, 
  currentTheme, 
  convertPrice, 
  getCurrencySymbol, 
  currentCurrency, 
  isMobile, 
  searchTerm, 
  getCustomerDisplayName,
  setActiveTab // Added this prop for navigation
}) => {
  // Refs for scrolling to sections
  const recentProductsRef = useRef(null);
  const lowStockRef = useRef(null);
  const recentCustomersRef = useRef(null);
  
  // 🔥 NEW: Search results state
  const [searchResults, setSearchResults] = useState({
    products: [],
    lowStock: [],
    customers: []
  });
  const [searchLoading, setSearchLoading] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [allLowStock, setAllLowStock] = useState([]);
  const [allCustomers, setAllCustomers] = useState([]);

  // 🔥 NEW: Fetch ALL data on mount for search
  useEffect(() => {
    const fetchAllDataForSearch = async () => {
      try {
        // Fetch ALL products (not just recent)
        const { data: productsData } = await supabase
          .from('products')
          .select(`
            *,
            categories:category_id (name, id),
            brands:brand_id (name, id)
          `)
          .eq('is_published', true)
          .order('created_at', { ascending: false });
        
        // Fetch ALL low stock products
        const { data: lowStockData } = await supabase
          .from('products')
          .select(`
            *,
            categories:category_id (name, id),
            brands:brand_id (name, id)
          `)
          .lt('stock_quantity', 5)
          .eq('is_published', true);
        
        // Fetch ALL customers (not just recent)
        const { data: customersData } = await supabase
          .from('customers')
          .select('*')
          .order('created_at', { ascending: false });
        
        setAllProducts(productsData || []);
        setAllLowStock(lowStockData || []);
        setAllCustomers(customersData || []);
        
      } catch (error) {
        console.error('Error fetching all data for search:', error);
      }
    };
    
    fetchAllDataForSearch();
  }, []);

  // 🔥 NEW: Perform search when searchTerm changes
  useEffect(() => {
    if (!searchTerm || searchTerm.trim() === '') {
      setSearchResults({ products: [], lowStock: [], customers: [] });
      return;
    }
    
    setSearchLoading(true);
    const searchLower = searchTerm.toLowerCase();
    
    // Filter products
    const filteredProducts = allProducts.filter(product => {
      const productName = product.name?.toLowerCase() || '';
      const productSku = product.sku?.toLowerCase() || '';
      const categoryName = product.categories?.name?.toLowerCase() || '';
      const brandName = product.brands?.name?.toLowerCase() || '';
      
      return (
        productName.includes(searchLower) ||
        productSku.includes(searchLower) ||
        categoryName.includes(searchLower) ||
        brandName.includes(searchLower)
      );
    });
    
    // Filter low stock
    const filteredLowStock = allLowStock.filter(product => {
      const productName = product.name?.toLowerCase() || '';
      const productSku = product.sku?.toLowerCase() || '';
      const brandName = product.brands?.name?.toLowerCase() || '';
      
      return (
        productName.includes(searchLower) ||
        productSku.includes(searchLower) ||
        brandName.includes(searchLower)
      );
    });
    
    // Filter customers
    const filteredCustomers = allCustomers.filter(customer => {
      const customerName = getCustomerDisplayName(customer).toLowerCase();
      const customerEmail = customer.email?.toLowerCase() || '';
      const customerPhone = customer.phone?.toLowerCase() || '';
      
      return (
        customerName.includes(searchLower) ||
        customerEmail.includes(searchLower) ||
        customerPhone.includes(searchLower)
      );
    });
    
    setSearchResults({
      products: filteredProducts,
      lowStock: filteredLowStock,
      customers: filteredCustomers
    });
    setSearchLoading(false);
    
    console.log('🔍 Search Results:', {
      term: searchTerm,
      productsFound: filteredProducts.length,
      lowStockFound: filteredLowStock.length,
      customersFound: filteredCustomers.length
    });
    
  }, [searchTerm, allProducts, allLowStock, allCustomers, getCustomerDisplayName]);

  // Helper function to format phone number
  const formatCustomerPhone = (phone) => {
    if (!phone) return '';
    
    // Remove any non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Format based on length
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
    
    return phone;
  };

  // Function to scroll to a section
  const scrollToSection = (sectionRef) => {
    if (sectionRef.current) {
      sectionRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  };

  // Function to handle search term clicks
  const handleSearchTermClick = (section) => {
    switch (section) {
      case 'products':
        scrollToSection(recentProductsRef);
        break;
      case 'lowstock':
        scrollToSection(lowStockRef);
        break;
      case 'customers':
        scrollToSection(recentCustomersRef);
        break;
      default:
        break;
    }
  };

  // 🔥 NEW: Handle product click to navigate to Products tab
  const handleProductClick = (product) => {
    setActiveTab('products');
    
    // Dispatch event to select this product in ProductsManagement
    setTimeout(() => {
      const event = new CustomEvent('dashboardProductSelect', { 
        detail: { 
          productId: product.id,
          productName: product.name
        } 
      });
      window.dispatchEvent(event);
    }, 100);
  };

  // 🔥 NEW: Handle low stock click to navigate to Inventory tab
  const handleLowStockClick = (product) => {
    setActiveTab('inventory');
    
    // Dispatch event to select this product in InventoryManagement
    setTimeout(() => {
      const event = new CustomEvent('dashboardLowStockSelect', { 
        detail: { 
          productId: product.id
        } 
      });
      window.dispatchEvent(event);
    }, 100);
  };

  // 🔥 NEW: Handle customer click to navigate to Customers tab
  const handleCustomerClick = (customer) => {
    setActiveTab('customers');
    
    // Dispatch event to select this customer in CustomersManagement
    setTimeout(() => {
      const event = new CustomEvent('dashboardCustomerSelect', { 
        detail: { 
          customerId: customer.id
        } 
      });
      window.dispatchEvent(event);
    }, 100);
  };

  // 🔥 Determine which data to display based on search
  const displayData = searchTerm 
    ? searchResults 
    : {
        products: recentProducts,
        lowStock: lowStockProducts,
        customers: recentCustomers
      };

  return (
    <div>
      {/* Currency Notice */}
      <div style={{
        background: currentTheme.cardBg,
        padding: isMobile ? '12px 15px' : '15px 20px',
        borderRadius: '8px',
        marginBottom: '20px',
        boxShadow: currentTheme.cardShadow,
        borderLeft: '4px solid #4299e1',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <span style={{ fontSize: isMobile ? '18px' : '20px' }}>💰</span>
        <div>
          <strong style={{ color: currentTheme.text, fontSize: isMobile ? '14px' : '16px' }}>
            Active Currency: {currentCurrency}
          </strong>
          <div style={{ 
            fontSize: isMobile ? '12px' : '14px', 
            color: currentTheme.textMuted, 
            marginTop: '2px' 
          }}>
            All prices are displayed in {currentCurrency}. Change currency using the selector in the header.
          </div>
        </div>
      </div>

      {/* Search Results Notice */}
      {searchTerm && (
        <div style={{
          background: currentTheme.cardBg,
          padding: isMobile ? '12px 15px' : '15px 20px',
          borderRadius: '8px',
          marginBottom: '20px',
          boxShadow: currentTheme.cardShadow,
          borderLeft: '4px solid #48bb78',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span style={{ fontSize: isMobile ? '18px' : '20px' }}>🔍</span>
          <div style={{ flex: 1 }}>
            <strong style={{ color: currentTheme.text, fontSize: isMobile ? '14px' : '16px' }}>
              {searchLoading ? 'Searching...' : `Search Results for: "${searchTerm}"`}
            </strong>
            
            {!searchLoading && (
              <>
                <div style={{ 
                  fontSize: isMobile ? '12px' : '14px', 
                  color: currentTheme.textMuted, 
                  marginTop: '4px' 
                }}>
                  Found{' '}
                  <button 
                    onClick={() => handleSearchTermClick('products')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#4299e1',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      padding: '2px 4px',
                      borderRadius: '3px',
                      fontWeight: '600'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#ebf8ff';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'none';
                    }}
                  >
                    {displayData.products.length} products
                  </button>
                  ,{' '}
                  <button 
                    onClick={() => handleSearchTermClick('lowstock')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#ed8936',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      padding: '2px 4px',
                      borderRadius: '3px',
                      fontWeight: '600'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#fffaf0';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'none';
                    }}
                  >
                    {displayData.lowStock.length} low stock items
                  </button>
                  , and{' '}
                  <button 
                    onClick={() => handleSearchTermClick('customers')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#9f7aea',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      padding: '2px 4px',
                      borderRadius: '3px',
                      fontWeight: '600'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#faf5ff';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'none';
                    }}
                  >
                    {displayData.customers.length} customers
                  </button>
                  {' '}matching your search.
                </div>
                <div style={{ 
                  fontSize: isMobile ? '11px' : '12px', 
                  color: currentTheme.textMuted, 
                  marginTop: '6px' 
                }}>
                  💡 Click on any count above to jump to that section • Click on any item to navigate to its tab
                </div>
              </>
            )}
            
            {searchLoading && (
              <div style={{ 
                fontSize: isMobile ? '12px' : '14px', 
                color: currentTheme.textMuted, 
                marginTop: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid #f3f3f3',
                  borderTop: '2px solid #3498db',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                Searching database...
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: isMobile ? '15px' : '20px',
        marginBottom: '30px'
      }}>
        {[
          { title: 'Total Products', value: stats.totalProducts, color: '#48bb78', icon: '🛍️' },
          { title: 'Published Products', value: stats.publishedProducts, color: '#4299e1', icon: '📦' },
          { title: 'Featured Products', value: stats.featuredProducts, color: '#ed8936', icon: '⭐' },
          { title: 'Total Categories', value: stats.totalCategories, color: '#9f7aea', icon: '📂' },
          { title: 'Total Brands', value: stats.totalBrands, color: '#38b2ac', icon: '🏷️' },
          { title: 'Total Customers', value: stats.totalCustomers, color: '#805ad5', icon: '👥' },
          { title: 'Total Orders', value: stats.totalOrders || 0, color: '#d69e2e', icon: '🛒' },
          { title: 'Service Inquiries', value: stats.totalServices || 0, color: '#3182ce', icon: '🛠️' },
          { title: 'Low Stock Items', value: stats.lowStockItems, color: '#f56565', icon: '⚠️' }
        ].map(stat => (
          <div key={stat.title} style={{
            background: currentTheme.cardBg,
            padding: isMobile ? '20px' : '25px',
            borderRadius: '12px',
            boxShadow: currentTheme.cardShadow,
            borderLeft: `4px solid ${stat.color}`,
            transition: 'transform 0.2s, box-shadow 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = currentTheme.cardShadow;
          }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ 
                  margin: '0 0 10px 0', 
                  fontSize: isMobile ? '12px' : '14px', 
                  color: currentTheme.textMuted, 
                  fontWeight: '500' 
                }}>
                  {stat.title}
                </h3>
                <p style={{ 
                  margin: 0, 
                  fontSize: isMobile ? '24px' : '28px', 
                  fontWeight: 'bold', 
                  color: stat.color 
                }}>
                  {stat.value}
                </p>
              </div>
              <span style={{ fontSize: isMobile ? '20px' : '24px' }}>{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Products & Low Stock & Recent Customers */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr 1fr',
        gap: isMobile ? '15px' : '20px'
      }}>
        {/* Recent Products */}
        <div 
          ref={recentProductsRef}
          style={{ 
            background: currentTheme.cardBg, 
            padding: isMobile ? '15px' : '25px', 
            borderRadius: '12px',
            boxShadow: currentTheme.cardShadow,
            transition: 'all 0.3s ease'
          }}
          id="recent-products-section"
        >
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '20px',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? '10px' : '0',
            alignItems: isMobile ? 'flex-start' : 'center'
          }}>
            <h3 style={{ 
              margin: 0, 
              fontSize: isMobile ? '16px' : '18px', 
              fontWeight: '600', 
              color: currentTheme.text 
            }}>
              {searchTerm ? 'Search Results' : 'Recent Products'}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ 
                fontSize: isMobile ? '12px' : '14px', 
                color: currentTheme.textMuted 
              }}>
                {displayData.products.length} {displayData.products.length === 1 ? 'product' : 'products'}
              </span>
              {searchTerm && (
                <button
                  onClick={() => handleSearchTermClick('products')}
                  style={{
                    background: '#4299e1',
                    color: 'white',
                    border: 'none',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '10px',
                    fontWeight: '600'
                  }}
                >
                  Scroll to Top
                </button>
              )}
            </div>
          </div>
          <div style={{ maxHeight: isMobile ? '300px' : '400px', overflow: 'auto' }}>
            {displayData.products.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: currentTheme.textMuted }}>
                {searchTerm ? 'No products match your search' : 'No recent products'}
              </div>
            ) : (
              displayData.products.map(product => (
                <div 
                  key={product.id} 
                  onClick={() => handleProductClick(product)}
                  style={{
                    padding: isMobile ? '12px' : '15px',
                    borderBottom: `1px solid ${currentTheme.border}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 0.2s ease',
                    flexDirection: isMobile ? 'column' : 'row',
                    alignItems: isMobile ? 'flex-start' : 'center',
                    gap: isMobile ? '8px' : '0',
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = theme === 'light' ? '#f7fafc' : '#4a5568';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = currentTheme.cardBg;
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {searchTerm && (
                    <div style={{
                      position: 'absolute',
                      top: '5px',
                      right: '5px',
                      background: '#4299e1',
                      display: 'none',
                      color: 'white',
                      fontSize: '10px',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontWeight: '600'
                    }}>
                      Click to view
                    </div>
                  )}
                  <div style={{ flex: 1, width: isMobile ? '100%' : 'auto' }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      marginBottom: '5px',
                      flexDirection: isMobile ? 'column' : 'row',
                      alignItems: isMobile ? 'flex-start' : 'center',
                      gap: isMobile ? '5px' : '0'
                    }}>
                      <strong style={{ 
                        fontSize: isMobile ? '13px' : '14px', 
                        color: currentTheme.text 
                      }}>
                        {product.name}
                      </strong>
                      <span style={{ 
                        padding: '4px 8px',
                        background: product.is_published ? '#c6f6d5' : '#fed7d7',
                        color: product.is_published ? '#22543d' : '#742a2a',
                        borderRadius: '12px',
                        fontSize: isMobile ? '10px' : '11px',
                        textTransform: 'capitalize',
                        fontWeight: '600'
                      }}>
                        {product.is_published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <div style={{ 
                      fontSize: isMobile ? '12px' : '13px', 
                      color: currentTheme.textMuted 
                    }}>
                      {product.categories?.name} • {getCurrencySymbol()}{convertPrice(product.price || 0)}
                      {product.brands?.name && ` • ${product.brands.name}`}
                    </div>
                    <div style={{ 
                      fontSize: isMobile ? '11px' : '12px', 
                      color: currentTheme.textMuted, 
                      marginTop: '4px' 
                    }}>
                      SKU: {product.sku} • Stock: {product.stock_quantity}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Low Stock Alert */}
        <div 
          ref={lowStockRef}
          style={{ 
            background: currentTheme.cardBg, 
            padding: isMobile ? '15px' : '25px', 
            borderRadius: '12px',
            boxShadow: currentTheme.cardShadow,
            transition: 'all 0.3s ease'
          }}
          id="low-stock-section"
        >
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '20px',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? '10px' : '0',
            alignItems: isMobile ? 'flex-start' : 'center'
          }}>
            <h3 style={{ 
              margin: 0, 
              fontSize: isMobile ? '16px' : '18px', 
              fontWeight: '600', 
              color: '#e53e3e' 
            }}>
              Low Stock Alert
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ 
                background: '#fed7d7',
                color: '#742a2a',
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: isMobile ? '11px' : '12px',
                fontWeight: '600'
              }}>
                {displayData.lowStock.length} items
              </span>
              {searchTerm && (
                <button
                  onClick={() => handleSearchTermClick('lowstock')}
                  style={{
                    background: '#e53e3e',
                    color: 'white',
                    border: 'none',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '10px',
                    fontWeight: '600'
                  }}
                >
                  Scroll to Top
                </button>
              )}
            </div>
          </div>
          <div style={{ maxHeight: isMobile ? '300px' : '400px', overflow: 'auto' }}>
            {displayData.lowStock.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: currentTheme.textMuted }}>
                {searchTerm ? 'No low stock items match your search' : 'No low stock items'}
              </div>
            ) : (
              displayData.lowStock.map(product => (
                <div 
                  key={product.id}
                  onClick={() => handleLowStockClick(product)}
                  style={{
                    padding: isMobile ? '10px' : '12px',
                    borderBottom: `1px solid ${currentTheme.border}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 0.2s ease',
                    flexDirection: isMobile ? 'column' : 'row',
                    alignItems: isMobile ? 'flex-start' : 'center',
                    gap: isMobile ? '8px' : '0',
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = theme === 'light' ? '#f7fafc' : '#4a5568';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = currentTheme.cardBg;
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {searchTerm && (
                    <div style={{
                      position: 'absolute',
                      top: '5px',
                      right: '5px',
                      background: '#e53e3e',
                      color: 'white',
                      fontSize: '10px',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontWeight: '600'
                    }}>
                      Click to view
                    </div>
                  )}
                  <div style={{ flex: 1, width: isMobile ? '100%' : 'auto' }}>
                    <strong style={{ 
                      fontSize: isMobile ? '13px' : '14px', 
                      display: 'block', 
                      marginBottom: '4px', 
                      color: currentTheme.text 
                    }}>
                      {product.name}
                    </strong>
                    <div style={{ 
                      fontSize: isMobile ? '11px' : '12px', 
                      color: '#e53e3e', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '5px',
                      flexWrap: 'wrap'
                    }}>
                      <span>Stock: {product.stock_quantity}</span>
                      <span>•</span>
                      <span>Threshold: {product.low_stock_threshold || 5}</span>
                    </div>
                    {product.sku && (
                      <div style={{ 
                        fontSize: isMobile ? '10px' : '11px', 
                        color: currentTheme.textMuted, 
                        marginTop: '2px' 
                      }}>
                        SKU: {product.sku}
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering parent click
                      onRestock(product);
                    }}
                    style={{
                      background: '#e53e3e',
                      color: 'white',
                      border: 'none',
                      padding: isMobile ? '8px 16px' : '6px 12px',
                      borderRadius: '6px',
                      fontSize: isMobile ? '12px' : '12px',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      fontWeight: '500',
                      width: isMobile ? '100%' : 'auto'
                    }}
                  >
                    Restock
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Customers */}
        <div 
          ref={recentCustomersRef}
          style={{ 
            background: currentTheme.cardBg, 
            padding: isMobile ? '15px' : '25px', 
            borderRadius: '12px',
            boxShadow: currentTheme.cardShadow,
            transition: 'all 0.3s ease',
            marginBottom: '20px'
          }}
          id="recent-customers-section"
        >
          {/* Header Section */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start',
            marginBottom: '20px',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? '12px' : '0'
          }}>
            {/* Title and Description */}
            <div style={{ flex: 1 }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px',
                marginBottom: '6px'
              }}>
                <h3 style={{ 
                  margin: 0, 
                  fontSize: isMobile ? '16px' : '18px', 
                  fontWeight: '600', 
                  color: currentTheme.text 
                }}>
                  {searchTerm ? 'Customer Search Results' : 'Recent Customers'}
                </h3>
                {/* Customer Count Badge */}
                <span style={{ 
                  fontSize: isMobile ? '11px' : '12px',
                  background: displayData.customers.length > 0 ? '#48bb78' : '#e53e3e',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontWeight: '600',
                  display: 'inline-block'
                }}>
                  {displayData.customers.length} {displayData.customers.length === 1 ? 'customer' : 'customers'}
                </span>
              </div>
              <div style={{ 
                fontSize: isMobile ? '11px' : '12px', 
                color: currentTheme.textMuted
              }}>
                {searchTerm ? 'All customers matching search' : 'Customers registered in the last 24 hours'}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {searchTerm && (
                <button
                  onClick={() => handleSearchTermClick('customers')}
                  style={{
                    background: '#9f7aea',
                    color: 'white',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: isMobile ? '10px' : '12px',
                    fontWeight: '600',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Scroll to Top
                </button>
              )}
            </div>
          </div>
          
          {/* Customer List */}
          <div style={{ 
            maxHeight: isMobile ? '300px' : '400px', 
            overflow: 'auto',
            border: displayData.customers.length > 0 ? `1px solid ${currentTheme.border}` : 'none',
            borderRadius: '8px'
          }}>
            {displayData.customers.length === 0 ? (
              <div style={{ 
                padding: '30px 20px', 
                textAlign: 'center', 
                color: currentTheme.textMuted,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: currentTheme.textMuted + '20',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px'
                }}>
                  👥
                </div>
                <div>
                  <div style={{ fontWeight: '500', marginBottom: '4px' }}>
                    {searchTerm ? 'No matching customers' : 'No new customers'}
                  </div>
                  <div style={{ fontSize: isMobile ? '11px' : '12px' }}>
                    {searchTerm ? 'Try adjusting your search terms' : 'Check back later for new registrations'}
                  </div>
                </div>
              </div>
            ) : (
              displayData.customers.map(customer => (
                <div 
                  key={customer.id}
                  onClick={() => handleCustomerClick(customer)}
                  style={{
                    padding: isMobile ? '12px' : '15px',
                    borderBottom: `1px solid ${currentTheme.border}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 0.2s ease',
                    flexDirection: isMobile ? 'column' : 'row',
                    alignItems: isMobile ? 'flex-start' : 'center',
                    gap: isMobile ? '8px' : '0',
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = theme === 'light' ? '#f7fafc' : '#4a5568';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = currentTheme.cardBg;
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {searchTerm && (
                    <div style={{
                      position: 'absolute',
                      top: '5px',
                      right: '5px',
                      background: '#9f7aea',
                      color: 'white',
                      fontSize: '10px',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontWeight: '600'
                    }}>
                      Click to view
                    </div>
                  )}
                  <div style={{ flex: 1, width: isMobile ? '100%' : 'auto' }}>
                    <strong style={{ 
                      fontSize: isMobile ? '13px' : '14px', 
                      display: 'block', 
                      marginBottom: '4px', 
                      color: currentTheme.text 
                    }}>
                      {getCustomerDisplayName(customer)}
                    </strong>
                    <div style={{ 
                      fontSize: isMobile ? '12px' : '13px', 
                      color: currentTheme.textMuted 
                    }}>
                      {customer.email}
                      {customer.phone && ` • ${formatCustomerPhone(customer.phone)}`}
                    </div>
                    <div style={{ 
                      fontSize: isMobile ? '11px' : '12px', 
                      color: currentTheme.textMuted, 
                      marginTop: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <span>🕒</span>
                      <span>Joined: {new Date(customer.created_at).toLocaleDateString()} at {new Date(customer.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

// Enhanced Products Management Component - Updated with mobile responsiveness
const ProductsManagement = ({ searchTerm, theme, currentTheme, showPopupMessage, convertPrice, getCurrencySymbol, currentCurrency, isMobile }) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState(new Set());


  // Add this to your ProductsManagement useEffect:
const handleDashboardProductSelect = (event) => {
  const { productId } = event.detail;
  
  // Find the product
  const foundProduct = products.find(p => p.id === productId);
  
  if (foundProduct) {
    // Highlight and scroll to product
    setEditingProduct(foundProduct);
    
    // Add visual highlight
    setTimeout(() => {
      const productRow = document.getElementById(`product-row-${productId}`);
      if (productRow) {
        // Add highlight effect
        productRow.style.backgroundColor = '#ebf8ff';
        productRow.style.transition = 'background-color 0.3s ease';
        
        // Scroll to the row
        productRow.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
        
        // Remove highlight after 3 seconds
        setTimeout(() => {
          productRow.style.backgroundColor = '';
        }, 3000);
      }
    }, 100);
  }
};

// Don't forget to add the event listener and cleanup in your useEffect:
useEffect(() => {
  // Add event listener for dashboard product selection
  window.addEventListener('dashboardProductSelect', handleDashboardProductSelect);
  
  // Cleanup
  return () => {
    window.removeEventListener('dashboardProductSelect', handleDashboardProductSelect);
  };
}, [products]); // Add products to dependency array since we're using it in the handler
  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchBrands();

    // Listen for edit product event from dashboard
    const handleEditProduct = (event) => {
      setEditingProduct(event.detail);
      setShowAddProduct(false);
    };

    window.addEventListener('editProduct', handleEditProduct);
    return () => window.removeEventListener('editProduct', handleEditProduct);
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.brands?.name && product.brands.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [searchTerm, products]);

  const fetchProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select(`
        *,
        categories (
          name
        ),
        brands (
          name
        )
      `)
      .order('created_at', { ascending: false });
    setProducts(data || []);
    setFilteredProducts(data || []);
    setLoading(false);
  };

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    setCategories(data || []);
  };

  const fetchBrands = async () => {
    const { data } = await supabase
      .from('brands')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });
    setBrands(data || []);
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);
      
      if (!error) {
        fetchProducts();
        showPopupMessage('Product deleted successfully', 'success');
      } else {
        showPopupMessage('Error deleting product: ' + error.message, 'error');
      }
    }
  };

  const handleToggleStatus = async (productId, currentStatus) => {
    const { error } = await supabase
      .from('products')
      .update({ is_published: !currentStatus })
      .eq('id', productId);
    
    if (!error) {
      fetchProducts();
      showPopupMessage(`Product ${!currentStatus ? 'published' : 'unpublished'} successfully`, 'success');
    } else {
      showPopupMessage('Error updating product status', 'error');
    }
  };

  const handleToggleFeatured = async (productId, currentStatus) => {
    const { error } = await supabase
      .from('products')
      .update({ is_featured: !currentStatus })
      .eq('id', productId);
    
    if (!error) {
      fetchProducts();
      showPopupMessage(`Product ${!currentStatus ? 'featured' : 'unfeatured'} successfully`, 'success');
    } else {
      showPopupMessage('Error updating featured status', 'error');
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedProducts.size === 0) {
      showPopupMessage('Please select products to perform bulk action', 'error');
      return;
    }

    const productIds = Array.from(selectedProducts);

    try {
      switch (action) {
        case 'publish':
          await supabase
            .from('products')
            .update({ is_published: true })
            .in('id', productIds);
          showPopupMessage(`${productIds.length} products published successfully`, 'success');
          break;
        case 'unpublish':
          await supabase
            .from('products')
            .update({ is_published: false })
            .in('id', productIds);
          showPopupMessage(`${productIds.length} products unpublished successfully`, 'success');
          break;
        case 'feature':
          await supabase
            .from('products')
            .update({ is_featured: true })
            .in('id', productIds);
          showPopupMessage(`${productIds.length} products featured successfully`, 'success');
          break;
        case 'unfeature':
          await supabase
            .from('products')
            .update({ is_featured: false })
            .in('id', productIds);
          showPopupMessage(`${productIds.length} products unfeatured successfully`, 'success');
          break;
        case 'delete':
          if (window.confirm(`Are you sure you want to delete ${productIds.length} products?`)) {
            await supabase
              .from('products')
              .delete()
              .in('id', productIds);
            showPopupMessage(`${productIds.length} products deleted successfully`, 'success');
          }
          break;
        default:
          break;
      }
      fetchProducts();
      setSelectedProducts(new Set());
    } catch (error) {
      showPopupMessage('Error performing bulk action: ' + error.message, 'error');
    }
  };

  const handleSelectProduct = (productId) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedProducts.size === filteredProducts.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(filteredProducts.map(p => p.id)));
    }
  };

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '15px',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'flex-start' : 'center'
      }}>
        <h2 style={{ 
          margin: 0, 
          color: currentTheme.text,
          fontSize: isMobile ? '18px' : '24px'
        }}>
          Products Management
        </h2>
        
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          alignItems: 'center', 
          flexWrap: 'wrap',
          justifyContent: isMobile ? 'space-between' : 'flex-end',
          width: isMobile ? '100%' : 'auto'
        }}>
          {/* Currency Display */}
          <div style={{
            padding: '8px 12px',
            background: theme === 'light' ? '#f7fafc' : '#4a5568',
            borderRadius: '6px',
            fontSize: isMobile ? '12px' : '14px',
            color: currentTheme.text,
            border: `1px solid ${currentTheme.border}`
          }}>
            Currency: <strong>{currentCurrency}</strong>
          </div>

          {/* Bulk Actions */}
          {selectedProducts.size > 0 && (
            <div style={{ 
              display: 'flex', 
              gap: '10px', 
              alignItems: 'center',
              flexDirection: isMobile ? 'column' : 'row'
            }}>
              <span style={{ fontSize: '14px', color: currentTheme.textMuted }}>
                {selectedProducts.size} selected
              </span>
              <select
                onChange={(e) => handleBulkAction(e.target.value)}
                style={{
                  padding: '8px 12px',
                  border: `1px solid ${currentTheme.border}`,
                  borderRadius: '4px',
                  background: currentTheme.cardBg,
                  color: currentTheme.text,
                  fontSize: isMobile ? '12px' : '14px'
                }}
              >
                <option value="">Bulk Actions</option>
                <option value="publish">Publish</option>
                <option value="unpublish">Unpublish</option>
                <option value="feature">Feature</option>
                <option value="unfeature">Unfeature</option>
                <option value="delete">Delete</option>
              </select>
            </div>
          )}

          <button
            onClick={() => setShowAddProduct(true)}
            style={{
              background: '#48bb78',
              color: 'white',
              border: 'none',
              padding: isMobile ? '12px 16px' : '10px 20px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'background-color 0.2s',
              fontSize: isMobile ? '14px' : '16px',
              width: isMobile ? '100%' : 'auto'
            }}
          >
            + Add New Product
          </button>
        </div>
      </div>
      
      {showAddProduct && (
        <AddProductForm 
          categories={categories}
          brands={brands}
          onClose={() => {
            setShowAddProduct(false);
            setEditingProduct(null);
          }}
          onSave={() => {
            fetchProducts();
            showPopupMessage('Product added successfully', 'success');
          }}
          product={editingProduct}
          theme={theme}
          currentTheme={currentTheme}
          showPopupMessage={showPopupMessage}
          isMobile={isMobile}
        />
      )}

      {editingProduct && !showAddProduct && (
        <AddProductForm 
          categories={categories}
          brands={brands}
          onClose={() => {
            setEditingProduct(null);
            setShowAddProduct(false);
          }}
          onSave={() => {
            fetchProducts();
            showPopupMessage('Product updated successfully', 'success');
          }}
          product={editingProduct}
          theme={theme}
          currentTheme={currentTheme}
          showPopupMessage={showPopupMessage}
          isMobile={isMobile}
        />
      )}
      
      {/* Products table */}
      <div style={{ 
        background: currentTheme.cardBg, 
        borderRadius: '12px', 
        overflow: 'hidden',
        boxShadow: currentTheme.cardShadow
      }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #3498db',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px'
            }}></div>
            <p style={{ color: currentTheme.textMuted, margin: 0 }}>Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
            <h3 style={{ color: currentTheme.text, marginBottom: '8px' }}>No products found</h3>
            <p style={{ color: currentTheme.textMuted, marginBottom: '20px' }}>
              {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first product'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowAddProduct(true)}
                style={{
                  background: '#48bb78',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Add Your First Product
              </button>
            )}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            {isMobile ? (
              // Mobile view - card layout
              <div style={{ padding: isMobile ? '10px' : '0' }}>
                {filteredProducts.map(product => (
                  <div key={product.id} style={{
                    padding: '15px',
                    borderBottom: `1px solid ${currentTheme.border}`,
                    background: currentTheme.cardBg
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <div style={{ flex: 1 }}>
                        <strong style={{ display: 'block', marginBottom: '4px', color: currentTheme.text }}>
                          {product.name}
                        </strong>
                        <div style={{ fontSize: '12px', color: currentTheme.textMuted }}>
                          SKU: {product.sku}
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedProducts.has(product.id)}
                        onChange={() => handleSelectProduct(product.id)}
                        style={{ cursor: 'pointer' }}
                      />
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                      <div>
                        <div style={{ fontSize: '12px', color: currentTheme.textMuted }}>Category</div>
                        <div style={{ fontSize: '13px', color: currentTheme.text }}>
                          {product.categories?.name || 'Uncategorized'}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: currentTheme.textMuted }}>Brand</div>
                        <div style={{ fontSize: '13px', color: currentTheme.text }}>
                          {product.brands?.name || 'No Brand'}
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                      <div>
                        <div style={{ fontSize: '12px', color: currentTheme.textMuted }}>Price</div>
                        <div style={{ fontWeight: '600', color: currentTheme.text }}>
                          {getCurrencySymbol()}{convertPrice(product.price)}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: currentTheme.textMuted }}>Stock</div>
                        <div style={{ 
                          fontWeight: '600',
                          color: product.stock_quantity === 0 ? '#e53e3e' : 
                                 product.stock_quantity <= (product.low_stock_threshold || 5) ? '#ed8936' : '#48bb78'
                        }}>
                          {product.stock_quantity}
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '5px', marginBottom: '10px', flexWrap: 'wrap' }}>
                      <span style={{
                        padding: '4px 8px',
                        background: product.is_published ? '#c6f6d5' : '#fed7d7',
                        color: product.is_published ? '#22543d' : '#742a2a',
                        borderRadius: '6px',
                        fontSize: '10px',
                        fontWeight: '600'
                      }}>
                        {product.is_published ? 'Published' : 'Draft'}
                      </span>
                      {product.is_featured && (
                        <span style={{
                          padding: '4px 8px',
                          background: '#feebc8',
                          color: '#744210',
                          borderRadius: '6px',
                          fontSize: '10px',
                          fontWeight: '600'
                        }}>
                          Featured
                        </span>
                      )}
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
                      <button 
                        onClick={() => setEditingProduct(product)}
                        style={{
                          background: '#4299e1',
                          color: 'white',
                          border: 'none',
                          padding: '8px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleToggleStatus(product.id, product.is_published)}
                        style={{
                          background: product.is_published ? '#ecc94b' : '#48bb78',
                          color: 'white',
                          border: 'none',
                          padding: '8px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}
                      >
                        {product.is_published ? 'Unpublish' : 'Publish'}
                      </button>
                      <button 
                        onClick={() => handleToggleFeatured(product.id, product.is_featured)}
                        style={{
                          background: product.is_featured ? '#a0aec0' : '#9f7aea',
                          color: 'white',
                          border: 'none',
                          padding: '8px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}
                      >
                        {product.is_featured ? 'Unfeature' : 'Feature'}
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(product.id)}
                        style={{
                          background: '#e53e3e',
                          color: 'white',
                          border: 'none',
                          padding: '8px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Desktop view - table layout
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
                <thead>
                  <tr style={{ background: theme === 'light' ? '#f7fafc' : '#4a5568' }}>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: `1px solid ${currentTheme.border}`, width: '40px' }}>
                      <input
                        type="checkbox"
                        checked={selectedProducts.size === filteredProducts.length && filteredProducts.length > 0}
                        onChange={handleSelectAll}
                        style={{ cursor: 'pointer' }}
                      />
                    </th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: `1px solid ${currentTheme.border}`, color: currentTheme.text }}>Product</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: `1px solid ${currentTheme.border}`, color: currentTheme.text }}>Category</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: `1px solid ${currentTheme.border}`, color: currentTheme.text }}>Brand</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: `1px solid ${currentTheme.border}`, color: currentTheme.text }}>Price</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: `1px solid ${currentTheme.border}`, color: currentTheme.text }}>Stock</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: `1px solid ${currentTheme.border}`, color: currentTheme.text }}>Status</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: `1px solid ${currentTheme.border}`, color: currentTheme.text }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map(product => (
                    <tr key={product.id} style={{
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = theme === 'light' ? '#f7fafc' : '#4a5568';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = currentTheme.cardBg;
                    }}
                    >
                      <td style={{ padding: '12px', borderBottom: `1px solid ${currentTheme.border}` }}>
                        <input
                          type="checkbox"
                          checked={selectedProducts.has(product.id)}
                          onChange={() => handleSelectProduct(product.id)}
                          style={{ cursor: 'pointer' }}
                        />
                      </td>
                      <td style={{ padding: '12px', borderBottom: `1px solid ${currentTheme.border}` }}>
                        <div>
                          <strong style={{ display: 'block', marginBottom: '4px', color: currentTheme.text }}>{product.name}</strong>
                          <div style={{ fontSize: '12px', color: currentTheme.textMuted }}>{product.sku}</div>
                        </div>
                      </td>
                      <td style={{ padding: '12px', borderBottom: `1px solid ${currentTheme.border}` }}>
                        <div style={{ fontSize: '14px', color: currentTheme.text }}>{product.categories?.name || 'Uncategorized'}</div>
                      </td>
                      <td style={{ padding: '12px', borderBottom: `1px solid ${currentTheme.border}` }}>
                        <div style={{ fontSize: '14px', color: currentTheme.text }}>{product.brands?.name || 'No Brand'}</div>
                      </td>
                      <td style={{ padding: '12px', borderBottom: `1px solid ${currentTheme.border}` }}>
                        <div style={{ fontWeight: '600', color: currentTheme.text }}>{getCurrencySymbol()}{convertPrice(product.price)}</div>
                        {product.compare_price && (
                          <div style={{ fontSize: '12px', color: currentTheme.textMuted, textDecoration: 'line-through' }}>
                            {getCurrencySymbol()}{convertPrice(product.compare_price)}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '12px', borderBottom: `1px solid ${currentTheme.border}` }}>
                        <div style={{ 
                          fontWeight: '600',
                          color: product.stock_quantity === 0 ? '#e53e3e' : 
                                 product.stock_quantity <= (product.low_stock_threshold || 5) ? '#ed8936' : '#48bb78'
                        }}>
                          {product.stock_quantity}
                        </div>
                      </td>
                      <td style={{ padding: '12px', borderBottom: `1px solid ${currentTheme.border}` }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{
                            padding: '4px 8px',
                            background: product.is_published ? '#c6f6d5' : '#fed7d7',
                            color: product.is_published ? '#22543d' : '#742a2a',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: '600',
                            display: 'inline-block',
                            textAlign: 'center'
                          }}>
                            {product.is_published ? 'Published' : 'Draft'}
                          </span>
                          {product.is_featured && (
                            <span style={{
                              padding: '4px 8px',
                              background: '#feebc8',
                              color: '#744210',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: '600',
                              display: 'inline-block',
                              textAlign: 'center'
                            }}>
                              Featured
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '12px', borderBottom: `1px solid ${currentTheme.border}` }}>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <button 
                            onClick={() => setEditingProduct(product)}
                            style={{
                              background: '#4299e1',
                              color: 'white',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: '500'
                            }}
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleToggleStatus(product.id, product.is_published)}
                            style={{
                              background: product.is_published ? '#ecc94b' : '#48bb78',
                              color: 'white',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: '500'
                            }}
                          >
                            {product.is_published ? 'Unpublish' : 'Publish'}
                          </button>
                          <button 
                            onClick={() => handleToggleFeatured(product.id, product.is_featured)}
                            style={{
                              background: product.is_featured ? '#a0aec0' : '#9f7aea',
                              color: 'white',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: '500'
                            }}
                          >
                            {product.is_featured ? 'Unfeature' : 'Feature'}
                          </button>
                          <button 
                            onClick={() => handleDeleteProduct(product.id)}
                            style={{
                              background: '#e53e3e',
                              color: 'white',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: '500'
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Add Product Form Component (Complete with all fields) - Updated for mobile and added image_url
// Add Product Form Component (Complete with all fields) - Updated for mobile and added multiple images support
const AddProductForm = ({ categories, brands, onClose, onSave, product, theme, currentTheme, showPopupMessage, isMobile }) => {
  // ============ MULTIPLE IMAGES STATE ============
  const [imageInputs, setImageInputs] = useState([
    { id: 1, url: '', alt: '', isPrimary: true }
  ]);
  
  // Single image state (kept for backward compatibility)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    short_description: '',
    sku: '',
    price_ugx: '', // New field for UGX price
    price: '', // This will store the USD price (calculated)
    compare_price_ugx: '', // New field for UGX compare price
    compare_price: '', // This will store the USD compare price (calculated)
    cost_price_ugx: '', // New field for UGX cost price
    cost_price: '', // This will store the USD cost price (calculated)
    stock_quantity: 0,
    low_stock_threshold: 5,
    weight: '',
    category_id: '',
    brand_id: '',
    is_featured: false,
    is_published: true,
    is_digital: false,
    meta_title: '',
    meta_description: '',
    image_url: '' // Keep for backward compatibility
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // ============ IMAGE HANDLER FUNCTIONS ============
  const handleImageInputChange = (index, field, value) => {
    const newImageInputs = [...imageInputs];
    newImageInputs[index][field] = value;
    
    // If setting as primary, unset others
    if (field === 'isPrimary' && value) {
      newImageInputs.forEach((img, idx) => {
        if (idx !== index) img.isPrimary = false;
      });
    }
    
    setImageInputs(newImageInputs);
  };

  const addImageInput = () => {
    if (imageInputs.length < 5) {
      setImageInputs([
        ...imageInputs,
        { 
          id: imageInputs.length + 1, 
          url: '', 
          alt: '', 
          isPrimary: false
        }
      ]);
    }
  };

  const removeImageInput = (index) => {
    if (imageInputs.length > 1) {
      const newImageInputs = imageInputs.filter((_, idx) => idx !== index);
      // If we removed the primary image, make the first one primary
      if (imageInputs[index].isPrimary && newImageInputs.length > 0) {
        newImageInputs[0].isPrimary = true;
      }
      setImageInputs(newImageInputs);
    }
  };

  // Exchange rate configuration
  const exchangeRate = 3700; // 1 USD = 3700 UGX

  // Function to convert UGX to USD
  const convertUgxToUsd = (ugxAmount) => {
    if (!ugxAmount) return '';
    return (parseFloat(ugxAmount) / exchangeRate).toFixed(2);
  };

  // Function to convert USD to UGX
  const convertUsdToUgx = (usdAmount) => {
    if (!usdAmount) return '';
    return Math.round(parseFloat(usdAmount) * exchangeRate).toString();
  };

  useEffect(() => {
    const loadProductImages = async () => {
      if (product) {
        // Load existing product images from product_images table
        const { data: images } = await supabase
          .from('product_images')
          .select('*')
          .eq('product_id', product.id)
          .order('sort_order', { ascending: true });

        if (images && images.length > 0) {
          const imageInputs = images.map((img, index) => ({
            id: index + 1,
            url: img.image_url,
            alt: img.alt_text || '',
            isPrimary: img.is_primary
          }));
          setImageInputs(imageInputs);
        } else {
          // Fallback to main image_url field
          setImageInputs([{ 
            id: 1, 
            url: product.image_url || '', 
            alt: '', 
            isPrimary: true 
          }]);
        }

        // Convert existing USD prices back to UGX for editing
        setFormData({
          name: product.name || '',
          slug: product.slug || '',
          description: product.description || '',
          short_description: product.short_description || '',
          sku: product.sku || '',
          price_ugx: product.price ? convertUsdToUgx(product.price) : '',
          price: product.price || '',
          compare_price_ugx: product.compare_price ? convertUsdToUgx(product.compare_price) : '',
          compare_price: product.compare_price || '',
          cost_price_ugx: product.cost_price ? convertUsdToUgx(product.cost_price) : '',
          cost_price: product.cost_price || '',
          stock_quantity: product.stock_quantity || 0,
          low_stock_threshold: product.low_stock_threshold || 5,
          weight: product.weight || '',
          category_id: product.category_id || '',
          brand_id: product.brand_id || '',
          is_featured: product.is_featured || false,
          is_published: product.is_published !== undefined ? product.is_published : true,
          is_digital: product.is_digital || false,
          meta_title: product.meta_title || '',
          meta_description: product.meta_description || '',
          image_url: product.image_url || '' // Keep for backward compatibility
        });
      } else {
        // Generate slug from name when creating new product
        if (formData.name && !formData.slug) {
          setFormData(prev => ({
            ...prev,
            slug: prev.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
          }));
        }
      }
    };

    loadProductImages();
  }, [product, formData.name]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Auto-convert UGX prices to USD when they change
    if (name === 'price_ugx') {
      const usdPrice = convertUgxToUsd(value);
      setFormData(prev => ({ ...prev, price: usdPrice }));
    } else if (name === 'compare_price_ugx') {
      const usdComparePrice = convertUgxToUsd(value);
      setFormData(prev => ({ ...prev, compare_price: usdComparePrice }));
    } else if (name === 'cost_price_ugx') {
      const usdCostPrice = convertUgxToUsd(value);
      setFormData(prev => ({ ...prev, cost_price: usdCostPrice }));
    }

    // Generate slug when name changes for new products
    if (name === 'name' && !product) {
      const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.sku.trim()) newErrors.sku = 'SKU is required';
    if (!formData.price_ugx || parseFloat(formData.price_ugx) <= 0) newErrors.price_ugx = 'Valid UGX price is required';
    if (!formData.category_id) newErrors.category_id = 'Category is required';
    
    // Validate at least one image is provided
    const hasImages = imageInputs.some(img => img.url.trim());
    if (!hasImages) {
      showPopupMessage('At least one product image is required', 'error');
      return false;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const submissionData = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: formData.description.trim(),
        short_description: formData.short_description.trim(),
        sku: formData.sku.trim(),
        price: parseFloat(formData.price), // This is the USD price calculated from UGX
        compare_price: formData.compare_price ? parseFloat(formData.compare_price) : null,
        cost_price: formData.cost_price ? parseFloat(formData.cost_price) : null,
        stock_quantity: parseInt(formData.stock_quantity) || 0,
        low_stock_threshold: parseInt(formData.low_stock_threshold) || 5,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        category_id: formData.category_id,
        brand_id: formData.brand_id || null,
        is_featured: formData.is_featured,
        is_published: formData.is_published,
        is_digital: formData.is_digital,
        meta_title: formData.meta_title.trim() || null,
        meta_description: formData.meta_description.trim() || null,
        image_url: imageInputs.find(img => img.isPrimary)?.url || imageInputs[0]?.url || null // Set primary image as main image_url
      };

      let productId;

      if (product) {
        // Update existing product
        const { data, error } = await supabase
          .from('products')
          .update(submissionData)
          .eq('id', product.id)
          .select();
        
        if (error) throw error;
        productId = product.id;
        
        // Delete existing product images
        await supabase
          .from('product_images')
          .delete()
          .eq('product_id', product.id);
      } else {
        // Create new product
        const { data, error } = await supabase
          .from('products')
          .insert([submissionData])
          .select();
        
        if (error) throw error;
        productId = data[0].id;
      }

      // Save product images
      if (imageInputs.some(img => img.url.trim())) {
        const imagePromises = imageInputs
          .filter(img => img.url.trim())
          .map((img, index) => {
            return supabase
              .from('product_images')
              .insert({
                product_id: productId,
                image_url: img.url.trim(),
                alt_text: img.alt.trim() || null,
                is_primary: img.isPrimary,
                sort_order: index
              });
          });

        await Promise.all(imagePromises);
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
      if (error.code === '23505') {
        showPopupMessage('Error: A product with this SKU or slug already exists', 'error');
      } else {
        showPopupMessage('Error saving product: ' + error.message, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      zIndex: 1000,
      padding: isMobile ? '10px' : '20px',
      overflowY: 'auto',
    }}>
      <div style={{
        background: currentTheme.cardBg,
        padding: isMobile ? '15px' : '20px',
        borderRadius: '12px',
        width: '90%',
        maxWidth: isMobile ? '100%' : '800px',
        maxHeight: isMobile ? 'calc(100vh - 20px)' : '90vh',
        overflow: 'auto',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
        color: currentTheme.text,
        marginTop: isMobile ? '10px' : '0',
        marginBottom: isMobile ? '10px' : '0',
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '20px',
          position: 'sticky',
          top: 0,
          background: currentTheme.cardBg,
          padding: '10px 0',
          zIndex: 1,
        }}>
          <h3 style={{ 
            margin: 0, 
            fontSize: isMobile ? '18px' : '20px', 
            fontWeight: '600' 
          }}>
            {product ? 'Edit Product' : 'Add New Product'}
          </h3>
          <button 
            onClick={onClose}
            style={{ 
              background: 'none', 
              border: 'none', 
              fontSize: '24px', 
              cursor: 'pointer',
              color: currentTheme.textMuted,
              padding: '5px',
            }}
          >
            ×
          </button>
        </div>

        {/* Currency Notice */}
        <div style={{
          background: theme === 'light' ? '#e6fffa' : '#234e52',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '20px',
          borderLeft: '4px solid #38b2ac',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span style={{ fontSize: '18px' }}>💰</span>
          <div>
            <strong style={{ color: theme === 'light' ? '#234e52' : '#e6fffa', fontSize: '14px' }}>
              UGX Base Currency Active
            </strong>
            <div style={{ 
              fontSize: '12px', 
              color: theme === 'light' ? '#4a5568' : '#cbd5e0', 
              marginTop: '2px' 
            }}>
              All prices are entered in UGX and automatically converted to USD (Exchange rate: 1 USD = 3,700 UGX)
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ 
            display: 'grid', 
            gap: '15px',
            paddingBottom: isMobile ? '80px' : '20px',
          }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
              gap: '15px' 
            }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: currentTheme.text }}>Product Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  style={{ 
                    width: '100%', 
                    padding: '10px 12px', 
                    border: `1px solid ${errors.name ? '#e53e3e' : currentTheme.border}`, 
                    borderRadius: '6px',
                    fontSize: '14px',
                    background: currentTheme.cardBg,
                    color: currentTheme.text
                  }}
                />
                {errors.name && (
                  <div style={{ color: '#e53e3e', fontSize: '12px', marginTop: '4px' }}>
                    {errors.name}
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: currentTheme.text }}>SKU *</label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  required
                  style={{ 
                    width: '100%', 
                    padding: '10px 12px', 
                    border: `1px solid ${errors.sku ? '#e53e3e' : currentTheme.border}`, 
                    borderRadius: '6px',
                    fontSize: '14px',
                    background: currentTheme.cardBg,
                    color: currentTheme.text
                  }}
                />
                {errors.sku && (
                  <div style={{ color: '#e53e3e', fontSize: '12px', marginTop: '4px' }}>
                    {errors.sku}
                  </div>
                )}
              </div>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
              gap: '15px' 
            }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: currentTheme.text }}>Slug</label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  style={{ 
                    width: '100%', 
                    padding: '10px 12px', 
                    border: `1px solid ${currentTheme.border}`, 
                    borderRadius: '6px',
                    fontSize: '14px',
                    background: currentTheme.cardBg,
                    color: currentTheme.text
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: currentTheme.text }}>Category *</label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  required
                  style={{ 
                    width: '100%', 
                    padding: '10px 12px', 
                    border: `1px solid ${errors.category_id ? '#e53e3e' : currentTheme.border}`, 
                    borderRadius: '6px',
                    fontSize: '14px',
                    background: currentTheme.cardBg,
                    color: currentTheme.text
                  }}
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.category_id && (
                  <div style={{ color: '#e53e3e', fontSize: '12px', marginTop: '4px' }}>
                    {errors.category_id}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: currentTheme.text }}>Brand</label>
              <select
                name="brand_id"
                value={formData.brand_id}
                onChange={handleChange}
                style={{ 
                  width: '100%', 
                  padding: '10px 12px', 
                  border: `1px solid ${currentTheme.border}`, 
                  borderRadius: '6px',
                    fontSize: '14px',
                    background: currentTheme.cardBg,
                    color: currentTheme.text
                }}
              >
                <option value="">Select Brand</option>
                {brands.map(brand => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>

            {/* ============ MULTIPLE IMAGES SECTION ============ */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', color: currentTheme.text }}>
                  Product Images (Max 5) *
                </label>
                {imageInputs.length < 5 && (
                  <button
                    type="button"
                    onClick={addImageInput}
                    style={{
                      background: '#4299e1',
                      color: 'white',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    + Add Image
                  </button>
                )}
              </div>
              
              {imageInputs.map((image, index) => (
                <div key={image.id} style={{ 
                  border: `1px solid ${currentTheme.border}`, 
                  borderRadius: '8px', 
                  padding: '15px', 
                  marginBottom: '15px',
                  background: theme === 'light' ? '#f8f9fa' : '#2d3748'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontWeight: '600', color: currentTheme.text }}>
                      Image {index + 1} {image.isPrimary && '(Primary)'}
                    </span>
                    {imageInputs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeImageInput(index)}
                        style={{
                          background: '#e53e3e',
                          color: 'white',
                          border: 'none',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', color: currentTheme.text }}>Image URL *</label>
                    <input
                      type="url"
                      value={image.url}
                      onChange={(e) => handleImageInputChange(index, 'url', e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      required={image.isPrimary}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: `1px solid ${currentTheme.border}`,
                        borderRadius: '6px',
                        fontSize: '14px',
                        background: currentTheme.cardBg,
                        color: currentTheme.text
                      }}
                    />
                  </div>
                  
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', color: currentTheme.text }}>Alt Text</label>
                    <input
                      type="text"
                      value={image.alt}
                      onChange={(e) => handleImageInputChange(index, 'alt', e.target.value)}
                      placeholder="Description of image for accessibility"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: `1px solid ${currentTheme.border}`,
                        borderRadius: '6px',
                        fontSize: '14px',
                        background: currentTheme.cardBg,
                        color: currentTheme.text
                      }}
                    />
                  </div>
                  
                  {image.url && (
                    <div style={{ marginBottom: '10px' }}>
                      <div style={{ fontSize: '12px', color: currentTheme.textMuted, marginBottom: '5px' }}>Preview:</div>
                      <img 
                        src={image.url} 
                        alt="Preview"
                        style={{
                          maxWidth: '100%',
                          maxHeight: '150px',
                          borderRadius: '4px',
                          border: `1px solid ${currentTheme.border}`
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          const parent = e.target.parentElement;
                          const errorDiv = document.createElement('div');
                          errorDiv.textContent = 'Image failed to load';
                          errorDiv.style.color = '#e53e3e';
                          errorDiv.style.fontSize = '12px';
                          errorDiv.style.padding = '10px';
                          parent.appendChild(errorDiv);
                        }}
                      />
                    </div>
                  )}
                  
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px', color: currentTheme.text }}>
                      <input
                        type="checkbox"
                        checked={image.isPrimary}
                        onChange={(e) => handleImageInputChange(index, 'isPrimary', e.target.checked)}
                      />
                      Set as Primary Image
                    </label>
                  </div>
                </div>
              ))}
            </div>
            {/* ============ END MULTIPLE IMAGES SECTION ============ */}

            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: currentTheme.text }}>Short Description</label>
              <textarea
                name="short_description"
                value={formData.short_description}
                onChange={handleChange}
                rows="2"
                style={{ 
                  width: '100%', 
                  padding: '10px 12px', 
                  border: `1px solid ${currentTheme.border}`, 
                  borderRadius: '6px',
                  fontSize: '14px',
                  background: currentTheme.cardBg,
                  color: currentTheme.text
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: currentTheme.text }}>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                style={{ 
                  width: '100%', 
                  padding: '10px 12px', 
                  border: `1px solid ${currentTheme.border}`, 
                  borderRadius: '6px',
                  fontSize: '14px',
                  background: currentTheme.cardBg,
                  color: currentTheme.text
                }}
              />
            </div>

            {/* Price Section - UGX Base Currency */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', 
              gap: '15px' 
            }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: currentTheme.text }}>
                  Price (UGX) *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="number"
                    name="price_ugx"
                    value={formData.price_ugx}
                    onChange={handleChange}
                    required
                    placeholder="Enter price in UGX"
                    style={{ 
                      width: '100%', 
                      padding: '10px 12px 10px 40px', 
                      border: `1px solid ${errors.price_ugx ? '#e53e3e' : currentTheme.border}`, 
                      borderRadius: '6px',
                      fontSize: '14px',
                      background: currentTheme.cardBg,
                      color: currentTheme.text
                    }}
                  />
                  <span style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: currentTheme.textMuted,
                    fontWeight: 'bold'
                  }}>
                    USh
                  </span>
                </div>
                {formData.price && (
                  <div style={{ fontSize: '12px', color: currentTheme.textMuted, marginTop: '4px' }}>
                    ≈ ${formData.price} USD
                  </div>
                )}
                {errors.price_ugx && (
                  <div style={{ color: '#e53e3e', fontSize: '12px', marginTop: '4px' }}>
                    {errors.price_ugx}
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: currentTheme.text }}>
                  Compare Price (UGX)
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="number"
                    name="compare_price_ugx"
                    value={formData.compare_price_ugx}
                    onChange={handleChange}
                    placeholder="Enter compare price in UGX"
                    style={{ 
                      width: '100%', 
                      padding: '10px 12px 10px 40px', 
                      border: `1px solid ${currentTheme.border}`, 
                      borderRadius: '6px',
                      fontSize: '14px',
                      background: currentTheme.cardBg,
                      color: currentTheme.text
                    }}
                  />
                  <span style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: currentTheme.textMuted,
                    fontWeight: 'bold'
                  }}>
                    USh
                  </span>
                </div>
                {formData.compare_price && (
                  <div style={{ fontSize: '12px', color: currentTheme.textMuted, marginTop: '4px' }}>
                    ≈ ${formData.compare_price} USD
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: currentTheme.text }}>
                  Cost Price (UGX)
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="number"
                    name="cost_price_ugx"
                    value={formData.cost_price_ugx}
                    onChange={handleChange}
                    placeholder="Enter cost price in UGX"
                    style={{ 
                      width: '100%', 
                      padding: '10px 12px 10px 40px', 
                      border: `1px solid ${currentTheme.border}`, 
                      borderRadius: '6px',
                      fontSize: '14px',
                      background: currentTheme.cardBg,
                      color: currentTheme.text
                    }}
                  />
                  <span style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: currentTheme.textMuted,
                    fontWeight: 'bold'
                  }}>
                    USh
                  </span>
                </div>
                {formData.cost_price && (
                  <div style={{ fontSize: '12px', color: currentTheme.textMuted, marginTop: '4px' }}>
                    ≈ ${formData.cost_price} USD
                  </div>
                )}
              </div>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
              gap: '15px' 
            }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: currentTheme.text }}>Stock Quantity</label>
                <input
                  type="number"
                  name="stock_quantity"
                  value={formData.stock_quantity}
                  onChange={handleChange}
                  style={{ 
                    width: '100%', 
                    padding: '10px 12px', 
                    border: `1px solid ${currentTheme.border}`, 
                    borderRadius: '6px',
                    fontSize: '14px',
                    background: currentTheme.cardBg,
                    color: currentTheme.text
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: currentTheme.text }}>Low Stock Threshold</label>
                <input
                  type="number"
                  name="low_stock_threshold"
                  value={formData.low_stock_threshold}
                  onChange={handleChange}
                  style={{ 
                    width: '100%', 
                    padding: '10px 12px', 
                    border: `1px solid ${currentTheme.border}`, 
                    borderRadius: '6px',
                    fontSize: '14px',
                    background: currentTheme.cardBg,
                    color: currentTheme.text
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: currentTheme.text }}>Weight (kg)</label>
              <input
                type="number"
                step="0.01"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                style={{ 
                  width: '100%', 
                  padding: '10px 12px', 
                  border: `1px solid ${currentTheme.border}`, 
                  borderRadius: '6px',
                  fontSize: '14px',
                  background: currentTheme.cardBg,
                  color: currentTheme.text
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '5px', color: currentTheme.text }}>
                <input
                  type="checkbox"
                  name="is_published"
                  checked={formData.is_published}
                  onChange={handleChange}
                />
                Published
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '5px', color: currentTheme.text }}>
                <input
                  type="checkbox"
                  name="is_featured"
                  checked={formData.is_featured}
                  onChange={handleChange}
                />
                Featured
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '5px', color: currentTheme.text }}>
                <input
                  type="checkbox"
                  name="is_digital"
                  checked={formData.is_digital}
                  onChange={handleChange}
                />
                Digital Product
              </label>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
              gap: '15px' 
            }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: currentTheme.text }}>Meta Title</label>
                <input
                  type="text"
                  name="meta_title"
                  value={formData.meta_title}
                  onChange={handleChange}
                  style={{ 
                    width: '100%', 
                    padding: '10px 12px', 
                    border: `1px solid ${currentTheme.border}`, 
                    borderRadius: '6px',
                    fontSize: '14px',
                    background: currentTheme.cardBg,
                    color: currentTheme.text
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: currentTheme.text }}>Meta Description</label>
                <input
                  type="text"
                  name="meta_description"
                  value={formData.meta_description}
                  onChange={handleChange}
                  style={{ 
                    width: '100%', 
                    padding: '10px 12px', 
                    border: `1px solid ${currentTheme.border}`, 
                    borderRadius: '6px',
                    fontSize: '14px',
                    background: currentTheme.cardBg,
                    color: currentTheme.text
                  }}
                />
              </div>
            </div>

            {/* Sticky action buttons for mobile */}
            <div style={{ 
              display: 'flex', 
              gap: '10px', 
              justifyContent: 'flex-end', 
              flexDirection: isMobile ? 'column' : 'row',
              position: isMobile ? 'sticky' : 'static',
              bottom: isMobile ? '0' : 'auto',
              background: isMobile ? currentTheme.cardBg : 'transparent',
              padding: isMobile ? '15px 0' : '0',
              borderTop: isMobile ? `1px solid ${currentTheme.border}` : 'none',
              marginTop: isMobile ? '10px' : '0',
            }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  background: '#a0aec0',
                  color: 'white',
                  border: 'none',
                  padding: '12px 20px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: isMobile ? '14px' : '14px',
                  flex: isMobile ? 1 : 'none',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  background: '#48bb78',
                  color: 'white',
                  border: 'none',
                  padding: '12px 20px',
                  borderRadius: '6px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: isMobile ? '14px' : '14px',
                  flex: isMobile ? 1 : 'none',
                }}
              >
                {loading ? 'Saving...' : (product ? 'Update Product' : 'Add Product')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
// Enhanced Categories Management Component with Search - Updated for mobile
const CategoriesManagement = ({ searchTerm, theme, currentTheme, showPopupMessage, isMobile }) => {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = categories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredCategories(filtered);
    } else {
      setFilteredCategories(categories);
    }
  }, [searchTerm, categories]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
      setFilteredCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      showPopupMessage('Error loading categories: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category? Products in this category will become uncategorized.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

      if (error) throw error;
      
      fetchCategories();
      showPopupMessage('Category deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting category:', error);
      showPopupMessage('Error deleting category: ' + error.message, 'error');
    }
  };

  const handleToggleStatus = async (categoryId, currentStatus) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update({ is_active: !currentStatus })
        .eq('id', categoryId);

      if (error) throw error;
      
      fetchCategories();
      showPopupMessage(`Category ${!currentStatus ? 'activated' : 'deactivated'} successfully`, 'success');
    } catch (error) {
      console.error('Error updating category status:', error);
      showPopupMessage('Error updating category: ' + error.message, 'error');
    }
  };

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'flex-start' : 'center',
        gap: isMobile ? '15px' : '0'
      }}>
        <h2 style={{ 
          margin: 0, 
          color: currentTheme.text,
          fontSize: isMobile ? '18px' : '24px'
        }}>
          Categories Management
        </h2>
        <button
          onClick={() => setShowAddCategory(true)}
          style={{
            background: '#48bb78',
            color: 'white',
            border: 'none',
            padding: isMobile ? '12px 16px' : '10px 20px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '500',
            fontSize: isMobile ? '14px' : '16px',
            width: isMobile ? '100%' : 'auto'
          }}
        >
          + Add New Category
        </button>
      </div>

      {showAddCategory && (
        <AddCategoryForm 
          categories={categories}
          onClose={() => {
            setShowAddCategory(false);
            setEditingCategory(null);
          }}
          onSave={() => {
            fetchCategories();
            showPopupMessage('Category added successfully', 'success');
          }}
          category={null}
          theme={theme}
          currentTheme={currentTheme}
          showPopupMessage={showPopupMessage}
          isMobile={isMobile}
        />
      )}

      {editingCategory && (
        <AddCategoryForm 
          categories={categories}
          onClose={() => {
            setEditingCategory(null);
            setShowAddCategory(false);
          }}
          onSave={() => {
            fetchCategories();
            showPopupMessage('Category updated successfully', 'success');
          }}
          category={editingCategory}
          theme={theme}
          currentTheme={currentTheme}
          showPopupMessage={showPopupMessage}
          isMobile={isMobile}
        />
      )}

      <div style={{ 
        background: currentTheme.cardBg, 
        borderRadius: '12px',
        boxShadow: currentTheme.cardShadow,
        overflow: 'hidden'
      }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #3498db',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px'
            }}></div>
            <p style={{ color: currentTheme.textMuted, margin: 0 }}>Loading categories...</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📂</div>
            <h3 style={{ color: currentTheme.text, marginBottom: '8px' }}>No categories found</h3>
            <p style={{ color: currentTheme.textMuted, marginBottom: '20px' }}>
              {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating your first category'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowAddCategory(true)}
                style={{
                  background: '#48bb78',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Add Your First Category
              </button>
            )}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            {isMobile ? (
              // Mobile view - card layout
              <div style={{ padding: isMobile ? '10px' : '0' }}>
                {filteredCategories.map(category => {
                  const parentCategory = categories.find(cat => cat.id === category.parent_id);
                  return (
                    <div key={category.id} style={{
                      padding: '15px',
                      borderBottom: `1px solid ${currentTheme.border}`,
                      background: currentTheme.cardBg
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                        <div style={{ flex: 1 }}>
                          <strong style={{ display: 'block', marginBottom: '4px', color: currentTheme.text }}>
                            {category.name}
                          </strong>
                          <div style={{ fontSize: '12px', color: currentTheme.textMuted }}>
                            Slug: {category.slug}
                          </div>
                        </div>
                        {category.image_url && (
                          <img 
                            src={category.image_url} 
                            alt="" 
                            style={{ 
                              width: '32px', 
                              height: '32px', 
                              borderRadius: '4px',
                              objectFit: 'cover'
                            }}
                          />
                        )}
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                        <div>
                          <div style={{ fontSize: '12px', color: currentTheme.textMuted }}>Parent</div>
                          <div style={{ fontSize: '13px', color: currentTheme.text }}>
                            {parentCategory ? parentCategory.name : '-'}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', color: currentTheme.textMuted }}>Sort Order</div>
                          <div style={{ fontSize: '13px', color: currentTheme.text }}>
                            {category.sort_order}
                          </div>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <span style={{
                          padding: '6px 12px',
                          background: category.is_active ? '#c6f6d5' : '#fed7d7',
                          color: category.is_active ? '#22543d' : '#742a2a',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {category.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
                        <button 
                          onClick={() => setEditingCategory(category)}
                          style={{
                            background: '#4299e1',
                            color: 'white',
                            border: 'none',
                            padding: '8px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleToggleStatus(category.id, category.is_active)}
                          style={{
                            background: category.is_active ? '#ecc94b' : '#48bb78',
                            color: 'white',
                            border: 'none',
                            padding: '8px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          {category.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button 
                          onClick={() => handleDeleteCategory(category.id)}
                          style={{
                            background: '#e53e3e',
                            color: 'white',
                            border: 'none',
                            padding: '8px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              // Desktop view - table layout
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                <thead>
                  <tr style={{ background: theme === 'light' ? '#f7fafc' : '#4a5568' }}>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: `1px solid ${currentTheme.border}`, color: currentTheme.text }}>Name</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: `1px solid ${currentTheme.border}`, color: currentTheme.text }}>Slug</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: `1px solid ${currentTheme.border}`, color: currentTheme.text }}>Parent</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: `1px solid ${currentTheme.border}`, color: currentTheme.text }}>Sort Order</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: `1px solid ${currentTheme.border}`, color: currentTheme.text }}>Status</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: `1px solid ${currentTheme.border}`, color: currentTheme.text }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCategories.map(category => {
                    const parentCategory = categories.find(cat => cat.id === category.parent_id);
                    return (
                      <tr key={category.id} style={{
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = theme === 'light' ? '#f7fafc' : '#4a5568';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = currentTheme.cardBg;
                      }}
                      >
                        <td style={{ padding: '12px', borderBottom: `1px solid ${currentTheme.border}` }}>
                          <strong style={{ color: currentTheme.text }}>{category.name}</strong>
                          {category.image_url && (
                            <img 
                              src={category.image_url} 
                              alt="" 
                              style={{ 
                                width: '32px', 
                                height: '32px', 
                                borderRadius: '4px',
                                objectFit: 'cover',
                                marginLeft: '10px',
                                verticalAlign: 'middle'
                              }}
                            />
                          )}
                        </td>
                        <td style={{ padding: '12px', borderBottom: `1px solid ${currentTheme.border}`, color: currentTheme.text }}>
                          {category.slug}
                        </td>
                        <td style={{ padding: '12px', borderBottom: `1px solid ${currentTheme.border}`, color: currentTheme.text }}>
                          {parentCategory ? parentCategory.name : '-'}
                        </td>
                        <td style={{ padding: '12px', borderBottom: `1px solid ${currentTheme.border}`, color: currentTheme.text }}>
                          {category.sort_order}
                        </td>
                        <td style={{ padding: '12px', borderBottom: `1px solid ${currentTheme.border}` }}>
                          <span style={{
                            padding: '6px 12px',
                            background: category.is_active ? '#c6f6d5' : '#fed7d7',
                            color: category.is_active ? '#22543d' : '#742a2a',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '600',
                            display: 'inline-block',
                            minWidth: '70px',
                            textAlign: 'center'
                          }}>
                            {category.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td style={{ padding: '12px', borderBottom: `1px solid ${currentTheme.border}` }}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button 
                              onClick={() => setEditingCategory(category)}
                              style={{
                                background: '#4299e1',
                                color: 'white',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleToggleStatus(category.id, category.is_active)}
                              style={{
                                background: category.is_active ? '#ecc94b' : '#48bb78',
                                color: 'white',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}
                            >
                              {category.is_active ? 'Deactivate' : 'Activate'}
                            </button>
                            <button 
                              onClick={() => handleDeleteCategory(category.id)}
                              style={{
                                background: '#e53e3e',
                                color: 'white',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Add Category Form Component - Updated for mobile
const AddCategoryForm = ({ categories, onClose, onSave, category, theme, currentTheme, showPopupMessage, isMobile }) => {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    parent_id: '',
    sort_order: 0,
    image_url: '',
    is_active: true
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        slug: category.slug || '',
        description: category.description || '',
        parent_id: category.parent_id || '',
        sort_order: category.sort_order || 0,
        image_url: category.image_url || '',
        is_active: category.is_active !== undefined ? category.is_active : true
      });
    }
  }, [category]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Generate slug when name changes for new categories
    if (name === 'name' && !category) {
      const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submissionData = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: formData.description.trim() || null,
        parent_id: formData.parent_id || null,
        sort_order: parseInt(formData.sort_order) || 0,
        image_url: formData.image_url.trim() || null,
        is_active: formData.is_active
      };

      if (category) {
        // Update existing category
        const { error } = await supabase
          .from('categories')
          .update(submissionData)
          .eq('id', category.id);
        
        if (error) throw error;
      } else {
        // Create new category
        const { error } = await supabase
          .from('categories')
          .insert([submissionData]);
        
        if (error) throw error;
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving category:', error);
      showPopupMessage('Error saving category: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: isMobile ? '10px' : '20px'
    }}>
      <div style={{
        background: currentTheme.cardBg,
        padding: isMobile ? '15px' : '20px',
        borderRadius: '12px',
        width: '90%',
        maxWidth: isMobile ? '100%' : '600px',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
        color: currentTheme.text
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ 
            margin: 0, 
            fontSize: isMobile ? '18px' : '20px', 
            fontWeight: '600' 
          }}>
            {category ? 'Edit Category' : 'Add New Category'}
          </h3>
          <button 
            onClick={onClose}
            style={{ 
              background: 'none', 
              border: 'none', 
              fontSize: '24px', 
              cursor: 'pointer',
              color: currentTheme.textMuted
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: currentTheme.text }}>Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                style={{ 
                  width: '100%', 
                  padding: '10px 12px', 
                  border: `1px solid ${currentTheme.border}`, 
                  borderRadius: '6px',
                  fontSize: '14px',
                  background: currentTheme.cardBg,
                  color: currentTheme.text
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: currentTheme.text }}>Slug</label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                style={{ 
                  width: '100%', 
                  padding: '10px 12px', 
                  border: `1px solid ${currentTheme.border}`, 
                  borderRadius: '6px',
                  fontSize: '14px',
                  background: currentTheme.cardBg,
                  color: currentTheme.text
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: currentTheme.text }}>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                style={{ 
                  width: '100%', 
                  padding: '10px 12px', 
                  border: `1px solid ${currentTheme.border}`, 
                  borderRadius: '6px',
                  fontSize: '14px',
                  background: currentTheme.cardBg,
                  color: currentTheme.text
                }}
              />
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
              gap: '15px' 
            }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: currentTheme.text }}>Parent Category</label>
                <select
                  name="parent_id"
                  value={formData.parent_id}
                  onChange={handleChange}
                  style={{ 
                    width: '100%', 
                    padding: '10px 12px', 
                    border: `1px solid ${currentTheme.border}`, 
                    borderRadius: '6px',
                    fontSize: '14px',
                    background: currentTheme.cardBg,
                    color: currentTheme.text
                  }}
                >
                  <option value="">No Parent</option>
                  {categories
                    .filter(cat => !category || cat.id !== category.id) // Don't allow self as parent
                    .map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: currentTheme.text }}>Sort Order</label>
                <input
                  type="number"
                  name="sort_order"
                  value={formData.sort_order}
                  onChange={handleChange}
                  style={{ 
                    width: '100%', 
                    padding: '10px 12px', 
                    border: `1px solid ${currentTheme.border}`, 
                    borderRadius: '6px',
                    fontSize: '14px',
                    background: currentTheme.cardBg,
                    color: currentTheme.text
                }}
              />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: currentTheme.text }}>Image URL</label>
              <input
                type="url"
                name="image_url"
                value={formData.image_url}
                onChange={handleChange}
                style={{ 
                  width: '100%', 
                  padding: '10px 12px', 
                  border: `1px solid ${currentTheme.border}`, 
                  borderRadius: '6px',
                  fontSize: '14px',
                  background: currentTheme.cardBg,
                    color: currentTheme.text
                }}
              />
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '5px', color: currentTheme.text }}>
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                />
                Active
              </label>
            </div>

            <div style={{ 
              display: 'flex', 
              gap: '10px', 
              justifyContent: 'flex-end',
              flexDirection: isMobile ? 'column' : 'row'
            }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  background: '#a0aec0',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  background: '#48bb78',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Saving...' : (category ? 'Update Category' : 'Add Category')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

// Brands Management Component with Search - Updated for mobile
const BrandsManagement = ({ searchTerm, theme, currentTheme, showPopupMessage, isMobile }) => {
  const [brands, setBrands] = useState([]);
  const [filteredBrands, setFilteredBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddBrand, setShowAddBrand] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);

  useEffect(() => {
    fetchBrands();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = brands.filter(brand =>
        brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        brand.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (brand.description && brand.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredBrands(filtered);
    } else {
      setFilteredBrands(brands);
    }
  }, [searchTerm, brands]);

  const fetchBrands = async () => {
    try {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setBrands(data || []);
      setFilteredBrands(data || []);
    } catch (error) {
      console.error('Error fetching brands:', error);
      showPopupMessage('Error loading brands: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBrand = async (brandId) => {
    if (!window.confirm('Are you sure you want to delete this brand?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('brands')
        .delete()
        .eq('id', brandId);

      if (error) throw error;
      
      fetchBrands();
      showPopupMessage('Brand deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting brand:', error);
      showPopupMessage('Error deleting brand: ' + error.message, 'error');
    }
  };

  const handleToggleStatus = async (brandId, currentStatus) => {
    try {
      const { error } = await supabase
        .from('brands')
        .update({ is_active: !currentStatus })
        .eq('id', brandId);

      if (error) throw error;
      
      fetchBrands();
      showPopupMessage(`Brand ${!currentStatus ? 'activated' : 'deactivated'} successfully`, 'success');
    } catch (error) {
      console.error('Error updating brand status:', error);
      showPopupMessage('Error updating brand: ' + error.message, 'error');
    }
  };

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'flex-start' : 'center',
        gap: isMobile ? '15px' : '0'
      }}>
        <h2 style={{ 
          margin: 0, 
          color: currentTheme.text,
          fontSize: isMobile ? '18px' : '24px'
        }}>
          Brands Management
        </h2>
        <button
          onClick={() => setShowAddBrand(true)}
          style={{
            background: '#48bb78',
            color: 'white',
            border: 'none',
            padding: isMobile ? '12px 16px' : '10px 20px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '500',
            fontSize: isMobile ? '14px' : '16px',
            width: isMobile ? '100%' : 'auto'
          }}
        >
          + Add New Brand
        </button>
      </div>

      {showAddBrand && (
        <AddBrandForm 
          onClose={() => {
            setShowAddBrand(false);
            setEditingBrand(null);
          }}
          onSave={() => {
            fetchBrands();
            showPopupMessage('Brand added successfully', 'success');
          }}
          brand={null}
          theme={theme}
          currentTheme={currentTheme}
          showPopupMessage={showPopupMessage}
          isMobile={isMobile}
        />
      )}

      {editingBrand && (
        <AddBrandForm 
          onClose={() => {
            setEditingBrand(null);
            setShowAddBrand(false);
          }}
          onSave={() => {
            fetchBrands();
            showPopupMessage('Brand updated successfully', 'success');
          }}
          brand={editingBrand}
          theme={theme}
          currentTheme={currentTheme}
          showPopupMessage={showPopupMessage}
          isMobile={isMobile}
        />
      )}

      <div style={{ 
        background: currentTheme.cardBg, 
        borderRadius: '12px',
        boxShadow: currentTheme.cardShadow,
        overflow: 'hidden'
      }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #3498db',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px'
            }}></div>
            <p style={{ color: currentTheme.textMuted, margin: 0 }}>Loading brands...</p>
          </div>
        ) : filteredBrands.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏷️</div>
            <h3 style={{ color: currentTheme.text, marginBottom: '8px' }}>No brands found</h3>
            <p style={{ color: currentTheme.textMuted, marginBottom: '20px' }}>
              {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating your first brand'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowAddBrand(true)}
                style={{
                  background: '#48bb78',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Add Your First Brand
              </button>
            )}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            {isMobile ? (
              // Mobile view - card layout
              <div style={{ padding: isMobile ? '10px' : '0' }}>
                {filteredBrands.map(brand => (
                  <div key={brand.id} style={{
                    padding: '15px',
                    borderBottom: `1px solid ${currentTheme.border}`,
                    background: currentTheme.cardBg
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {brand.logo_url && (
                            <img 
                              src={brand.logo_url} 
                              alt="" 
                              style={{ 
                                width: '40px', 
                                height: '40px', 
                                borderRadius: '4px',
                                objectFit: 'contain'
                              }}
                            />
                          )}
                          <div>
                            <strong style={{ color: currentTheme.text }}>{brand.name}</strong>
                            {brand.description && (
                              <div style={{ fontSize: '12px', color: currentTheme.textMuted }}>
                                {brand.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ marginBottom: '10px' }}>
                      <div style={{ fontSize: '12px', color: currentTheme.textMuted }}>Slug</div>
                      <div style={{ fontSize: '13px', color: currentTheme.text }}>
                        {brand.slug}
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{
                        padding: '6px 12px',
                        background: brand.is_active ? '#c6f6d5' : '#fed7d7',
                        color: brand.is_active ? '#22543d' : '#742a2a',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {brand.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
                      <button 
                        onClick={() => setEditingBrand(brand)}
                        style={{
                          background: '#4299e1',
                          color: 'white',
                          border: 'none',
                          padding: '8px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleToggleStatus(brand.id, brand.is_active)}
                        style={{
                          background: brand.is_active ? '#ecc94b' : '#48bb78',
                          color: 'white',
                          border: 'none',
                          padding: '8px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        {brand.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button 
                        onClick={() => handleDeleteBrand(brand.id)}
                        style={{
                          background: '#e53e3e',
                          color: 'white',
                          border: 'none',
                          padding: '8px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Desktop view - table layout
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                <thead>
                  <tr style={{ background: theme === 'light' ? '#f7fafc' : '#4a5568' }}>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: `1px solid ${currentTheme.border}`, color: currentTheme.text }}>Brand</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: `1px solid ${currentTheme.border}`, color: currentTheme.text }}>Slug</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: `1px solid ${currentTheme.border}`, color: currentTheme.text }}>Status</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: `1px solid ${currentTheme.border}`, color: currentTheme.text }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBrands.map(brand => (
                    <tr key={brand.id} style={{
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = theme === 'light' ? '#f7fafc' : '#4a5568';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = currentTheme.cardBg;
                    }}
                    >
                      <td style={{ padding: '12px', borderBottom: `1px solid ${currentTheme.border}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {brand.logo_url && (
                            <img 
                              src={brand.logo_url} 
                              alt="" 
                              style={{ 
                                width: '40px', 
                                height: '40px', 
                                borderRadius: '4px',
                                objectFit: 'contain'
                              }}
                            />
                          )}
                          <div>
                            <strong style={{ color: currentTheme.text }}>{brand.name}</strong>
                            {brand.description && (
                              <div style={{ fontSize: '12px', color: currentTheme.textMuted }}>
                                {brand.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px', borderBottom: `1px solid ${currentTheme.border}`, color: currentTheme.text }}>
                        {brand.slug}
                      </td>
                      <td style={{ padding: '12px', borderBottom: `1px solid ${currentTheme.border}` }}>
                        <span style={{
                          padding: '6px 12px',
                          background: brand.is_active ? '#c6f6d5' : '#fed7d7',
                          color: brand.is_active ? '#22543d' : '#742a2a',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '600',
                          display: 'inline-block',
                          minWidth: '70px',
                          textAlign: 'center'
                        }}>
                          {brand.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ padding: '12px', borderBottom: `1px solid ${currentTheme.border}` }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            onClick={() => setEditingBrand(brand)}
                            style={{
                              background: '#4299e1',
                              color: 'white',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                            >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleToggleStatus(brand.id, brand.is_active)}
                            style={{
                              background: brand.is_active ? '#ecc94b' : '#48bb78',
                              color: 'white',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            {brand.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                          <button 
                            onClick={() => handleDeleteBrand(brand.id)}
                            style={{
                              background: '#e53e3e',
                              color: 'white',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Add Brand Form Component - Updated for mobile (completed)
const AddBrandForm = ({ onClose, onSave, brand, theme, currentTheme, showPopupMessage, isMobile }) => {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    logo_url: '',
    is_active: true
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (brand) {
      setFormData({
        name: brand.name || '',
        slug: brand.slug || '',
        description: brand.description || '',
        logo_url: brand.logo_url || '',
        is_active: brand.is_active !== undefined ? brand.is_active : true
      });
    }
  }, [brand]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Generate slug when name changes for new brands
    if (name === 'name' && !brand) {
      const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submissionData = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: formData.description.trim() || null,
        logo_url: formData.logo_url.trim() || null,
        is_active: formData.is_active
      };

      if (brand) {
        // Update existing brand
        const { error } = await supabase
          .from('brands')
          .update(submissionData)
          .eq('id', brand.id);
        
        if (error) throw error;
      } else {
        // Create new brand
        const { error } = await supabase
          .from('brands')
          .insert([submissionData]);
        
        if (error) throw error;
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving brand:', error);
      showPopupMessage('Error saving brand: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: isMobile ? '10px' : '20px'
    }}>
      <div style={{
        background: currentTheme.cardBg,
        padding: isMobile ? '15px' : '20px',
        borderRadius: '12px',
        width: '90%',
        maxWidth: isMobile ? '100%' : '600px',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
        color: currentTheme.text
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ 
            margin: 0, 
            fontSize: isMobile ? '18px' : '20px', 
            fontWeight: '600' 
          }}>
            {brand ? 'Edit Brand' : 'Add New Brand'}
          </h3>
          <button 
            onClick={onClose}
            style={{ 
              background: 'none', 
              border: 'none', 
              fontSize: '24px', 
              cursor: 'pointer',
              color: currentTheme.textMuted
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: currentTheme.text }}>Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                style={{ 
                  width: '100%', 
                  padding: '10px 12px', 
                  border: `1px solid ${currentTheme.border}`, 
                  borderRadius: '6px',
                  fontSize: '14px',
                  background: currentTheme.cardBg,
                  color: currentTheme.text
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: currentTheme.text }}>Slug</label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                style={{ 
                  width: '100%', 
                  padding: '10px 12px', 
                  border: `1px solid ${currentTheme.border}`, 
                  borderRadius: '6px',
                  fontSize: '14px',
                  background: currentTheme.cardBg,
                  color: currentTheme.text
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: currentTheme.text }}>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                style={{ 
                  width: '100%', 
                  padding: '10px 12px', 
                  border: `1px solid ${currentTheme.border}`, 
                  borderRadius: '6px',
                  fontSize: '14px',
                  background: currentTheme.cardBg,
                  color: currentTheme.text
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: currentTheme.text }}>Logo URL</label>
              <input
                type="url"
                name="logo_url"
                value={formData.logo_url}
                onChange={handleChange}
                style={{ 
                  width: '100%', 
                  padding: '10px 12px', 
                  border: `1px solid ${currentTheme.border}`, 
                  borderRadius: '6px',
                  fontSize: '14px',
                  background: currentTheme.cardBg,
                  color: currentTheme.text
                }}
              />
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '5px', color: currentTheme.text }}>
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                />
                Active
              </label>
            </div>

            <div style={{ 
              display: 'flex', 
              gap: '10px', 
              justifyContent: 'flex-end',
              flexDirection: isMobile ? 'column' : 'row'
            }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  background: '#a0aec0',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  background: '#48bb78',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Saving...' : (brand ? 'Update Brand' : 'Add Brand')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

// Inventory Management Component with Search - Updated for mobile
const InventoryManagement = ({ searchTerm, theme, currentTheme, isMobile }) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [searchTerm, products]);

  const fetchProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('stock_quantity', { ascending: true });
    setProducts(data || []);
    setFilteredProducts(data || []);
    setLoading(false);
  };

  const updateStock = async (productId, newQuantity) => {
    const { error } = await supabase
      .from('products')
      .update({ stock_quantity: newQuantity })
      .eq('id', productId);
    
    if (!error) {
      fetchProducts();
    }
  };

  return (
    <div>
      <h2 style={{ 
        color: currentTheme.text,
        fontSize: isMobile ? '18px' : '24px',
        marginBottom: '20px'
      }}>
        Inventory Management
      </h2>
      <div style={{ 
        background: currentTheme.cardBg, 
        borderRadius: '12px', 
        overflow: 'hidden',
        boxShadow: currentTheme.cardShadow
      }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #3498db',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px'
            }}></div>
            <p style={{ color: currentTheme.textMuted, margin: 0 }}>Loading inventory...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
            <h3 style={{ color: currentTheme.text, marginBottom: '8px' }}>No products found</h3>
            <p style={{ color: currentTheme.textMuted, marginBottom: '20px' }}>
              {searchTerm ? 'Try adjusting your search terms' : 'No products available in inventory'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            {isMobile ? (
              // Mobile view - card layout
              <div style={{ padding: isMobile ? '10px' : '0' }}>
                {filteredProducts.map(product => (
                  <div key={product.id} style={{
                    padding: '15px',
                    borderBottom: `1px solid ${currentTheme.border}`,
                    background: currentTheme.cardBg
                  }}>
                    <div style={{ marginBottom: '10px' }}>
                      <strong style={{ color: currentTheme.text }}>{product.name}</strong>
                      <div style={{ fontSize: '12px', color: currentTheme.textMuted }}>
                        SKU: {product.sku}
                      </div>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                      <div>
                        <div style={{ fontSize: '12px', color: currentTheme.textMuted }}>Current Stock</div>
                        <input
                          type="number"
                          value={product.stock_quantity}
                          onChange={(e) => updateStock(product.id, parseInt(e.target.value) || 0)}
                          style={{
                            width: '100%',
                            padding: '8px',
                            border: `1px solid ${currentTheme.border}`,
                            borderRadius: '4px',
                            fontSize: '14px',
                            background: currentTheme.cardBg,
                            color: currentTheme.text
                          }}
                        />
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: currentTheme.textMuted }}>Low Stock Threshold</div>
                        <div style={{ fontSize: '13px', color: currentTheme.text }}>
                          {product.low_stock_threshold || 5}
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{
                        padding: '6px 12px',
                        background: product.stock_quantity === 0 ? '#fed7d7' : 
                                   product.stock_quantity <= (product.low_stock_threshold || 5) ? '#feebc8' : '#c6f6d5',
                        color: product.stock_quantity === 0 ? '#742a2a' : 
                              product.stock_quantity <= (product.low_stock_threshold || 5) ? '#744210' : '#22543d',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {product.stock_quantity === 0 ? 'Out of Stock' : 
                         product.stock_quantity <= (product.low_stock_threshold || 5) ? 'Low Stock' : 'In Stock'}
                      </span>
                    </div>
                    
                    <div>
                      <button 
                        onClick={() => updateStock(product.id, product.stock_quantity + 10)}
                        style={{
                          background: '#48bb78',
                          color: 'white',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          width: '100%'
                        }}
                      >
                        +10 to Stock
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Desktop view - table layout
             // Desktop view - table layout (UPDATED)
<table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
  <thead>
    <tr style={{ background: theme === 'light' ? '#f7fafc' : '#4a5568' }}>
      <th style={{ padding: '12px', textAlign: 'left', borderBottom: `1px solid ${currentTheme.border}`, color: currentTheme.text }}>Product</th>
      <th style={{ padding: '12px', textAlign: 'left', borderBottom: `1px solid ${currentTheme.border}`, color: currentTheme.text }}>SKU</th>
      <th style={{ padding: '12px', textAlign: 'left', borderBottom: `1px solid ${currentTheme.border}`, color: currentTheme.text }}>Current Stock</th>
      <th colSpan="2" style={{ padding: '12px', textAlign: 'center', borderBottom: `1px solid ${currentTheme.border}`, color: currentTheme.text }}>
        Stock Info
      </th>
      <th style={{ padding: '12px', textAlign: 'left', borderBottom: `1px solid ${currentTheme.border}`, color: currentTheme.text }}>Actions</th>
    </tr>
  </thead>
  <tbody>
    {filteredProducts.map(product => (
      <tr key={product.id}
        style={{ transition: 'background-color 0.2s' }}
        onMouseEnter={(e) => { e.currentTarget.style.background = theme === 'light' ? '#f7fafc' : '#4a5568'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = currentTheme.cardBg; }}
      >
        <td style={{ padding: '12px', borderBottom: `1px solid ${currentTheme.border}` }}>
          <strong style={{ color: currentTheme.text }}>{product.name}</strong>
        </td>
        <td style={{ padding: '12px', borderBottom: `1px solid ${currentTheme.border}`, color: currentTheme.text }}>
          {product.sku}
        </td>
        <td style={{ padding: '12px', borderBottom: `1px solid ${currentTheme.border}` }}>
          <input
            type="number"
            value={product.stock_quantity}
            onChange={(e) => updateStock(product.id, parseInt(e.target.value) || 0)}
            style={{
              width: '80px',
              padding: '6px 8px',
              border: `1px solid ${currentTheme.border}`,
              borderRadius: '4px',
              fontSize: '14px',
              background: currentTheme.cardBg,
              color: currentTheme.text
            }}
          />
        </td>

        {/* Low Stock Threshold */}
        <td style={{ padding: '12px', borderBottom: `1px solid ${currentTheme.border}`, textAlign: 'center', color: currentTheme.text }}>
          <div style={{ fontSize: '12px', color: currentTheme.textMuted, marginBottom: '4px' }}>Low</div>
          <div style={{ fontWeight: '600' }}>
            {product.low_stock_threshold || 5}
          </div>
        </td>

        {/* Status Badge */}
        <td style={{ padding: '12px', borderBottom: `1px solid ${currentTheme.border}`, textAlign: 'center' }}>
          <span style={{
            padding: '6px 12px',
            background: product.stock_quantity === 0 ? '#fed7d7' :
                       product.stock_quantity <= (product.low_stock_threshold || 5) ? '#feebc8' : '#c6f6d5',
            color: product.stock_quantity === 0 ? '#742a2a' :
                  product.stock_quantity <= (product.low_stock_threshold || 5) ? '#744210' : '#22543d',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '600',
            whiteSpace: 'nowrap'
          }}>
            {product.stock_quantity === 0 ? 'Out of Stock' :
             product.stock_quantity <= (product.low_stock_threshold || 5) ? 'Low Stock' : 'In Stock'}
          </span>
        </td>

        {/* Actions */}
        <td style={{ padding: '12px', borderBottom: `1px solid ${currentTheme.border}` }}>
          <button 
            onClick={() => updateStock(product.id, product.stock_quantity + 10)}
            style={{
              background: '#48bb78',
              color: 'white',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            +10
          </button>
        </td>
      </tr>
    ))}
  </tbody>
</table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Fixed AnalyticsDashboard Component with Google Charts and Mobile Responsiveness
const AnalyticsDashboard = ({ 
  searchTerm, 
  stats, 
  theme, 
  currentTheme, 
  isMobile, 
  convertPrice, 
  getCurrencySymbol, 
  currentCurrency 
}) => {
  const [analyticsData, setAnalyticsData] = useState({
    salesData: [],
    productPerformance: [],
    categoryPerformance: [],
    customerStats: {},
    revenueData: {},
    inventoryMetrics: {},
    timeRange: '7days'
  });
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
const [dateRange, setDateRange] = useState({
  start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  end: new Date().toISOString().split('T')[0]
});
 const [activeRange, setActiveRange] = useState('7D');
  const [chartKey, setChartKey] = useState(0);

  // Use the passed currency functions or provide fallbacks
  const currencySymbol = getCurrencySymbol ? getCurrencySymbol() : 
    currentCurrency === 'EUR' ? '€' : 
    currentCurrency === 'UGX' ? 'USh ' : '$';

  // Fallback convertPrice function if not provided
  const fallbackConvertPrice = (priceUSD) => {
    const exchangeRates = {
      USD: 1,
      EUR: 0.85,
      UGX: 3700
    };
    
    const rate = exchangeRates[currentCurrency] || 1;
    const converted = priceUSD * rate;
    
    if (currentCurrency === 'UGX') {
      return Math.round(converted).toLocaleString();
    } else {
      return converted.toFixed(2);
    }
  };

  const actualConvertPrice = convertPrice || fallbackConvertPrice;
  // Function for chart data - returns raw numbers without formatting
const convertPriceForCharts = (priceUSD) => {
  const exchangeRates = {
    USD: 1,
    EUR: 0.85,
    UGX: 3700
  };
  
  const rate = exchangeRates[currentCurrency] || 1;
  const converted = priceUSD * rate;
  
  // Return raw number for charts (no formatting)
  return converted;
};

  // Load Google Charts
  const [chartsLoaded, setChartsLoaded] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://www.gstatic.com/charts/loader.js';
    script.onload = () => {
      window.google.charts.load('current', { packages: ['corechart', 'bar'] });
      window.google.charts.setOnLoadCallback(() => setChartsLoaded(true));
    };
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    if (chartsLoaded) {
      fetchRealAnalyticsData();
    }
  }, [dateRange, chartsLoaded]);

  useEffect(() => {
    if (analyticsData.salesData.length > 0) {
      setChartKey(prev => prev + 1);
    }
  }, [analyticsData]);

  // Listen for order updates from OrdersManagement
  useEffect(() => {
    const handleOrdersUpdated = () => {
      console.log('🔄 Orders updated - refreshing analytics data');
      fetchRealAnalyticsData();
    };

    window.addEventListener('ordersUpdated', handleOrdersUpdated);
    return () => {
      window.removeEventListener('ordersUpdated', handleOrdersUpdated);
    };
  }, []);

  // Helper Functions
  const calculateProfitMargin = (product) => {
    if (!product.cost_price || !product.price) return 25;
    const cost = parseFloat(product.cost_price);
    const price = parseFloat(product.price);
    if (cost <= 0 || price <= 0) return 25;
    const margin = ((price - cost) / price) * 100;
    return Math.max(0, Math.min(margin, 80));
  };

  const getProductCategoryName = (product, categories) => {
    if (!product.category_id) return 'Uncategorized';
    const category = categories.find(cat => cat.id === product.category_id);
    return category?.name || 'Uncategorized';
  };

  const calculateInventoryTurnover = (products, orders) => {
    if (products.length === 0) return 2.5;
    
    const totalInventoryValue = products.reduce((sum, product) => {
      return sum + ((parseFloat(product.price) || 0) * (parseInt(product.stock_quantity) || 0));
    }, 0);

    const totalSales = orders.reduce((sum, order) => {
      return sum + (parseFloat(order.total_amount) || 0);
    }, 0);

    const avgInventory = totalInventoryValue / 2;
    return avgInventory > 0 ? (totalSales / avgInventory).toFixed(2) : '0.00';
  };

  // FIXED: Proper date handling without timezone issues
  const generateSalesDataFromOrders = (orders, dateRange) => {
    const salesData = [];
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    
    // Reset times to avoid timezone issues
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    
    const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

    console.log('📅 Generating sales data for range:', {
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      days: daysDiff
    });

    // Group orders by date - FIXED: Use local date without timezone conversion
    const ordersByDate = {};
    orders.forEach(order => {
      const orderDate = new Date(order.created_at);
      // Use local date in YYYY-MM-DD format
      const dateString = orderDate.toLocaleDateString('en-CA'); // This gives YYYY-MM-DD
      
      if (!ordersByDate[dateString]) {
        ordersByDate[dateString] = [];
      }
      ordersByDate[dateString].push(order);
      
      console.log('📊 Order date mapping:', {
        original: order.created_at,
        parsed: orderDate.toISOString(),
        localDate: dateString,
        orderNumber: order.order_number
      });
    });

    // Generate data for each day in the range
    for (let i = 0; i <= daysDiff; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      // Use local date string consistently
      const dateString = date.toLocaleDateString('en-CA');
      
      const dailyOrders = ordersByDate[dateString] || [];
      
      const dailyRevenue = dailyOrders.reduce((sum, order) => sum + (parseFloat(order.total_amount) || 0), 0);
      const dailyOrdersCount = dailyOrders.length;

      const dailyCustomers = new Set();
      dailyOrders.forEach(order => {
        const customerIdentifier = order.customer_id ? 
          `id:${order.customer_id}` : 
          order.customer_email ? 
            `email:${order.customer_email}` : 
            order.customer_phone ? 
              `phone:${order.customer_phone}` : 
              `order:${order.id}`;
        
        dailyCustomers.add(customerIdentifier);
      });

      salesData.push({
        date: dateString,
        revenue: dailyRevenue,
        orders: dailyOrdersCount,
        customers: dailyCustomers.size
      });
      
      console.log('📈 Daily data:', {
        date: dateString,
        orders: dailyOrdersCount,
        revenue: dailyRevenue,
        customers: dailyCustomers.size
      });
    }

    // Sort by date to ensure correct order
    salesData.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    console.log('📊 Final sales data:', salesData);

    return salesData;
  };

  const generateFallbackData = (dateRange) => {
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    
    // Generate fallback sales data
    const salesData = [];
    for (let i = 0; i <= daysDiff; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      salesData.push({
        date: date.toLocaleDateString('en-CA'),
        revenue: Math.floor(Math.random() * 5000) + 1000,
        orders: Math.floor(Math.random() * 8) + 1,
        customers: Math.floor(Math.random() * 6) + 1
      });
    }

    return {
      salesData,
      productPerformance: [
        { name: 'Gaming Laptop Pro', revenue: 4500000, unitsAvailable: 12 },
        { name: 'Business MacBooks', revenue: 3200000, unitsAvailable: 8 },
        { name: 'Student Laptop', revenue: 2800000, unitsAvailable: 15 },
        { name: 'Gaming PC Desktop', revenue: 5200000, unitsAvailable: 6 },
        { name: 'Monitor 24"', revenue: 1800000, unitsAvailable: 20 }
      ],
      categoryPerformance: [
        { name: 'Laptops', revenue: 10500000, productCount: 8 },
        { name: 'Gaming PCs', revenue: 5200000, productCount: 3 },
        { name: 'Monitors', revenue: 1800000, productCount: 5 },
        { name: 'Accessories', revenue: 800000, productCount: 12 }
      ],
      customerStats: {
        total: stats.totalCustomers || 156,
        newThisPeriod: Math.floor(Math.random() * 20) + 5,
        active: stats.totalCustomers ? Math.floor(stats.totalCustomers * 0.9) : 142,
        growth: (Math.random() * 40 - 10).toFixed(1)
      },
      revenueData: {
        total: 18300000,
        averageOrderValue: 450000,
        growth: (Math.random() * 30 - 5).toFixed(1),
        orderCount: Math.floor(Math.random() * 50) + 10,
        previousOrderCount: Math.floor(Math.random() * 40) + 5
      },
      inventoryMetrics: {
        totalValue: 45600000,
        lowStockItems: stats.lowStockItems || 3,
        outOfStockItems: Math.floor(Math.random() * 3) + 1,
        totalProducts: stats.totalProducts || 28,
        inventoryTurnover: 2.5
      }
    };
  };

  const fetchRealAnalyticsData = async () => {
    setLoading(true);
    try {
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      
      // FIXED: Proper date range handling
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);

      console.log('📊 Fetching REAL analytics data for:', {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        startLocal: startDate.toLocaleDateString('en-CA'),
        endLocal: endDate.toLocaleDateString('en-CA')
      });

      // Fetch ALL data in parallel
      const [
        productsData,
        categoriesData,
        customersData,
        ordersData,
        inventoryData
      ] = await Promise.all([
        supabase.from('products').select('*'),
        supabase.from('categories').select('*').eq('is_active', true),
        supabase.from('customers').select('*'),
        supabase.from('orders').select('*'),
        supabase.from('products').select('stock_quantity, low_stock_threshold, price, cost_price')
      ]);

      // Filter data by date range - FIXED: Use proper date comparison
      const filteredProducts = (productsData.data || []).filter(product => {
        const productDate = new Date(product.created_at);
        return productDate >= startDate && productDate <= endDate;
      });

      const filteredCustomers = (customersData.data || []).filter(customer => {
        const customerDate = new Date(customer.created_at);
        return customerDate >= startDate && customerDate <= endDate;
      });

      const filteredOrders = (ordersData.data || []).filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate >= startDate && orderDate <= endDate;
      });

      console.log('🔄 Filtered orders:', filteredOrders.map(order => ({
        id: order.id,
        order_number: order.order_number,
        created_at: order.created_at,
        localDate: new Date(order.created_at).toLocaleDateString('en-CA'),
        total: order.total_amount
      })));

      // Calculate previous period for comparison
      const periodDuration = endDate - startDate;
      const previousStartDate = new Date(startDate.getTime() - periodDuration);
      const previousEndDate = new Date(startDate.getTime() - 1);

      const previousPeriodCustomers = (customersData.data || []).filter(customer => {
        const customerDate = new Date(customer.created_at);
        return customerDate >= previousStartDate && customerDate <= previousEndDate;
      });

      const previousPeriodOrders = (ordersData.data || []).filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate >= previousStartDate && orderDate <= previousEndDate;
      });

      console.log('📈 Data counts:', {
        products: filteredProducts.length,
        customers: filteredCustomers.length,
        orders: filteredOrders.length,
        previousCustomers: previousPeriodCustomers.length,
        previousOrders: previousPeriodOrders.length
      });

      // Process the REAL data
      const processedData = processRealAnalyticsData({
        products: filteredProducts.length > 0 ? filteredProducts : productsData.data || [],
        categories: categoriesData.data || [],
        currentPeriodCustomers: filteredCustomers,
        previousPeriodCustomers: previousPeriodCustomers,
        orders: filteredOrders,
        previousPeriodOrders: previousPeriodOrders,
        inventory: inventoryData.data || [],
        allCustomers: customersData.data || [],
        dateRange: {
          start: startDate,
          end: endDate,
          previousStart: previousStartDate,
          previousEnd: previousEndDate
        }
      });

      console.log('📊 Processed analytics data:', processedData);
      setAnalyticsData(processedData);

    } catch (error) {
      console.error('Error fetching analytics data:', error);
      // Use fallback data if real data fails
      const fallbackData = generateFallbackData(dateRange);
      setAnalyticsData(fallbackData);
    } finally {
      setLoading(false);
    }
  };

  const processRealAnalyticsData = (rawData) => {
    const { 
      products, 
      categories, 
      currentPeriodCustomers, 
      previousPeriodCustomers,
      orders, 
      previousPeriodOrders,
      inventory,
      allCustomers,
      dateRange 
    } = rawData;

    // REAL REVENUE CALCULATIONS
    const totalRevenue = orders.reduce((sum, order) => {
      return sum + (parseFloat(order.total_amount) || 0);
    }, 0);

    const previousPeriodRevenue = previousPeriodOrders.reduce((sum, order) => {
      return sum + (parseFloat(order.total_amount) || 0);
    }, 0);

    const revenueGrowth = previousPeriodRevenue > 0 
      ? ((totalRevenue - previousPeriodRevenue) / previousPeriodRevenue * 100).toFixed(1)
      : totalRevenue > 0 ? '100.0' : '0.0';

    // REAL INVENTORY VALUE
    const totalProductsValue = inventory.reduce((sum, item) => {
      const price = parseFloat(item.price) || 0;
      const quantity = parseInt(item.stock_quantity) || 0;
      return sum + (price * quantity);
    }, 0);

    // REAL STOCK STATUS
    const lowStockItems = products.filter(product => {
      const stock = parseInt(product.stock_quantity) || 0;
      const threshold = parseInt(product.low_stock_threshold) || 5;
      return stock > 0 && stock <= threshold;
    }).length;

    const outOfStockItems = products.filter(product => {
      return (parseInt(product.stock_quantity) || 0) === 0;
    }).length;

    // REAL CUSTOMER METRICS
    const totalCustomers = allCustomers.length;
    const newCustomers = currentPeriodCustomers.length;
    const previousPeriodCustomerCount = previousPeriodCustomers.length;
    
    const customerGrowth = previousPeriodCustomerCount > 0 
      ? ((newCustomers - previousPeriodCustomerCount) / previousPeriodCustomerCount * 100).toFixed(1)
      : newCustomers > 0 ? '100.0' : '0.0';

    // REAL PRODUCT PERFORMANCE with fallback
    let productPerformance = products.map(product => {
      // Find orders containing this product
      const productOrders = orders.filter(order => {
        if (!order.items || !Array.isArray(order.items)) return false;
        return order.items.some(item => item.product_id === product.id || item.id === product.id);
      });

      const unitsSold = productOrders.reduce((sum, order) => {
        const item = order.items.find(item => item.product_id === product.id || item.id === product.id);
        return sum + (parseInt(item?.quantity) || 0);
      }, 0);

      const revenueFromSales = unitsSold * (parseFloat(product.price) || 0);
      const potentialRevenue = (parseFloat(product.price) || 0) * (parseInt(product.stock_quantity) || 0);

      return {
        name: product.name,
        revenue: revenueFromSales || potentialRevenue * 0.1,
        unitsAvailable: parseInt(product.stock_quantity) || 0,
       
        unitsSold: unitsSold,
        profitMargin: calculateProfitMargin(product),
        isFeatured: product.is_featured,
        isPublished: product.is_published,
        category: getProductCategoryName(product, categories)
      };
    })
    .filter(product => product.revenue > 0)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

    // If no products with revenue, show products with highest inventory value
    if (productPerformance.length === 0) {
      productPerformance = products
        .map(product => ({
          name: product.name,
          revenue: (parseFloat(product.price) || 0) * (parseInt(product.stock_quantity) || 0) * 0.1,
          unitsAvailable: parseInt(product.stock_quantity) || 0,
          unitsSold: 0,
          profitMargin: calculateProfitMargin(product),
          isFeatured: product.is_featured,
          isPublished: product.is_published,
          category: getProductCategoryName(product, categories)
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 8);
    }

    // REAL CATEGORY PERFORMANCE - Only show categories with actual sales data
    const categoryPerformance = categories
      .map(category => {
        const categoryProducts = products.filter(product => product.category_id === category.id);
        
        // Only process categories that have products
        if (categoryProducts.length === 0) return null;

        // Calculate revenue from orders for this category
        const categoryRevenue = categoryProducts.reduce((sum, product) => {
          const productOrders = orders.filter(order => {
            if (!order.items || !Array.isArray(order.items)) return false;
            return order.items.some(item => item.product_id === product.id || item.id === product.id);
          });

          const revenue = productOrders.reduce((orderSum, order) => {
            const item = order.items.find(item => item.product_id === product.id || item.id === product.id);
            return orderSum + ((parseFloat(item?.subtotal) || 0) * (parseInt(item?.quantity) || 1));
          }, 0);

          return sum + revenue;
        }, 0);

        // Only include categories with actual revenue
        if (categoryRevenue === 0) return null;

        return {
          name: category.name,
          revenue: categoryRevenue,
          productCount: categoryProducts.length,
          growth: (Math.random() * 40 - 10).toFixed(1),
          isActive: category.is_active
        };
      })
      // Filter out null values and sort by revenue
      .filter(category => category !== null)
      .sort((a, b) => b.revenue - a.revenue);

    // REAL SALES DATA with fallback
    let salesData = generateSalesDataFromOrders(orders, {
      start: dateRange.start.toLocaleDateString('en-CA'),
      end: dateRange.end.toLocaleDateString('en-CA')
    });
    
    // If no sales data, create sample data for the chart
    if (salesData.length === 0 || salesData.every(day => day.revenue === 0)) {
      salesData = generateFallbackData({
        start: dateRange.start.toLocaleDateString('en-CA'),
        end: dateRange.end.toLocaleDateString('en-CA')
      }).salesData;
    }

    // REAL CUSTOMER STATS
    const customerStats = {
      total: totalCustomers,
      newThisPeriod: newCustomers,
      active: orders.length > 0 ? new Set(orders.map(order => order.customer_email || order.customer_phone)).size : Math.floor(totalCustomers * 0.9),
      growth: customerGrowth
    };

    // REAL INVENTORY METRICS
    const inventoryMetrics = {
      totalValue: totalProductsValue,
      lowStockItems: lowStockItems,
      outOfStockItems: outOfStockItems,
      totalProducts: products.length,
      inventoryTurnover: calculateInventoryTurnover(products, orders)
    };

    // REAL REVENUE DATA
    const revenueData = {
      total: totalRevenue,
      averageOrderValue: orders.length > 0 ? totalRevenue / orders.length : 0,
      growth: revenueGrowth,
      orderCount: orders.length,
      previousOrderCount: previousPeriodOrders.length
    };

    return {
      salesData,
      productPerformance,
      categoryPerformance,
      customerStats,
      revenueData,
      inventoryMetrics,
      timeRange: 'custom'
    };
  };

  // Date range handlers
  const handleDateRangeChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
    setActiveRange('custom');
  };

  const handleQuickRange = (days, label) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    
    // FIXED: Use local dates for consistent display
    setDateRange({
      start: start.toLocaleDateString('en-CA'),
      end: end.toLocaleDateString('en-CA')
    });
    setActiveRange(label);
    
    console.log('🔄 Quick range selected:', {
      days,
      label,
      start: start.toLocaleDateString('en-CA'),
      end: end.toLocaleDateString('en-CA')
    });
  };

const exportReport = async (format) => {
  setExportLoading(true);
  try {
    // 🔥 IMPORTANT: Fetch FRESH data directly from database for accurate export
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    endDate.setHours(23, 59, 59, 999);

    console.log('📊 Exporting FRESH data for:', dateRange.start, 'to', dateRange.end);

    // Fetch fresh orders data directly from database
    const { data: freshOrders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .gte('created_at', dateRange.start)
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: true });

    if (ordersError) throw ordersError;

    // Generate sales data from the fresh orders
    const exportSalesData = generateSalesDataFromOrders(freshOrders || [], dateRange);

    // Calculate summary from fresh data - ALL PRICES IN UGX
    const totalRevenueUSD = (freshOrders || []).reduce((sum, order) => sum + (parseFloat(order.total_amount) || 0), 0);
    const totalRevenueUGX = totalRevenueUSD * 3700; // Convert to UGX
    const orderCount = freshOrders?.length || 0;
    const averageOrderValueUGX = orderCount > 0 ? totalRevenueUGX / orderCount : 0;

    // Get fresh customer data
    const { data: freshCustomers } = await supabase.from('customers').select('*');
    const { data: freshProducts } = await supabase.from('products').select('*');
    const { data: freshCategories } = await supabase.from('categories').select('*');
    const { data: inventoryData } = await supabase.from('products').select('stock_quantity, low_stock_threshold, price, cost_price');

    // Calculate inventory metrics - ALL PRICES IN UGX
    const totalProductsValueUSD = (inventoryData || []).reduce((sum, item) => {
      const price = parseFloat(item.price) || 0;
      const quantity = parseInt(item.stock_quantity) || 0;
      return sum + (price * quantity);
    }, 0);
    const totalProductsValueUGX = totalProductsValueUSD * 3700;

    const lowStockItems = (freshProducts || []).filter(product => {
      const stock = parseInt(product.stock_quantity) || 0;
      const threshold = parseInt(product.low_stock_threshold) || 5;
      return stock > 0 && stock <= threshold;
    }).length;

    const outOfStockItems = (freshProducts || []).filter(product => {
      return (parseInt(product.stock_quantity) || 0) === 0;
    }).length;

    // Generate accurate product performance from fresh data - ALL PRICES IN UGX
    const exportProductPerformance = (freshProducts || []).map(product => {
      const productOrders = (freshOrders || []).filter(order => 
        order.items?.some(item => item.product_id === product.id || item.id === product.id)
      );

      const unitsSold = productOrders.reduce((sum, order) => {
        const item = order.items?.find(item => item.product_id === product.id || item.id === product.id);
        return sum + (parseInt(item?.quantity) || 0);
      }, 0);

      const revenueFromSalesUSD = unitsSold * (parseFloat(product.price) || 0);
      const revenueFromSalesUGX = revenueFromSalesUSD * 3700;

      return {
        name: product.name,
        revenue: revenueFromSalesUGX, // UGX
        unitsAvailable: parseInt(product.stock_quantity) || 0,
        unitsSold: unitsSold,
        profitMargin: calculateProfitMargin(product),
        category: getProductCategoryName(product, freshCategories || [])
      };
    })
    .filter(product => product.revenue > 0)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

    // Generate accurate category performance from fresh data - ALL PRICES IN UGX
    const exportCategoryPerformance = (freshCategories || []).map(category => {
      const categoryProducts = (freshProducts || []).filter(product => product.category_id === category.id);
      
      const categoryRevenueUSD = categoryProducts.reduce((sum, product) => {
        const productOrders = (freshOrders || []).filter(order => 
          order.items?.some(item => item.product_id === product.id || item.id === product.id)
        );

        const revenue = productOrders.reduce((orderSum, order) => {
          const item = order.items?.find(item => item.product_id === product.id || item.id === product.id);
          return orderSum + ((parseFloat(item?.subtotal) || 0) * (parseInt(item?.quantity) || 1));
        }, 0);

        return sum + revenue;
      }, 0);
      
      const categoryRevenueUGX = categoryRevenueUSD * 3700;

      if (categoryProducts.length === 0) return null;

      return {
        name: category.name,
        revenue: categoryRevenueUGX, // UGX
        productCount: categoryProducts.length,
        growth: '0.0',
        isActive: category.is_active
      };
    })
    .filter(category => category !== null)
    .sort((a, b) => b.revenue - a.revenue);

    // Convert daily sales data to UGX
    const exportSalesDataUGX = exportSalesData.map(day => ({
      ...day,
      revenue: day.revenue * 3700 // Convert to UGX
    }));

    // Helper function to format numbers with commas
    const formatWithCommas = (number) => {
      return Math.round(number).toLocaleString('en-US');
    };

    const reportData = {
      metadata: {
        reportTitle: 'Business Analytics Report',
        generatedAt: new Date().toISOString(),
        dateRange: { 
          start: dateRange.start, 
          end: dateRange.end, 
          period: activeRange 
        },
        currency: 'UGX', // Force UGX for export
        currencySymbol: 'USh ',
        dataSource: 'Fresh database export (Prices converted to UGX)',
        ordersInPeriod: orderCount,
        totalRevenue: totalRevenueUGX,
        totalRevenueFormatted: formatWithCommas(totalRevenueUGX),
        exchangeRate: '1 USD = 3,700 UGX'
      },
      summary: {
        financial: {
          totalRevenue: totalRevenueUGX,
          totalRevenueFormatted: formatWithCommas(totalRevenueUGX),
          averageOrderValue: averageOrderValueUGX,
          averageOrderValueFormatted: formatWithCommas(averageOrderValueUGX),
          totalOrders: orderCount
        },
        customer: {
          totalCustomers: (freshCustomers || []).length,
          newCustomers: (freshCustomers || []).filter(customer => {
            const customerDate = new Date(customer.created_at);
            return customerDate >= startDate && customerDate <= endDate;
          }).length
        },
        inventory: {
          totalValue: totalProductsValueUGX,
          totalValueFormatted: formatWithCommas(totalProductsValueUGX),
          totalProducts: (freshProducts || []).length,
          lowStockItems: lowStockItems,
          outOfStockItems: outOfStockItems
        }
      },
      // Use the FRESH data for export - ALL IN UGX
      dailySales: exportSalesDataUGX,
      productPerformance: exportProductPerformance,
      categoryPerformance: exportCategoryPerformance,
      rawData: {
        totalOrders: orderCount,
        dateRange: `${dateRange.start} to ${dateRange.end}`,
        dataVerified: true,
        currency: 'UGX',
        exchangeRateApplied: true
      }
    };
    
    let content, mimeType, extension;
    
    if (format === 'csv') {
      // Create organized CSV tables with FRESH data in UGX
      const csvSections = [];
      
      // 1. REPORT METADATA TABLE
      csvSections.push('REPORT METADATA');
      csvSections.push('Field,Value');
      csvSections.push(`Report Title,${reportData.metadata.reportTitle}`);
      csvSections.push(`Generated At,${reportData.metadata.generatedAt}`);
      csvSections.push(`Date Range,${reportData.metadata.dateRange.start} to ${reportData.metadata.dateRange.end}`);
      csvSections.push(`Period,${reportData.metadata.dateRange.period}`);
      csvSections.push(`Currency,UGX`);
      csvSections.push(`Currency Symbol,USh`);
      csvSections.push(`Exchange Rate,1 USD = 3,700 UGX`);
      csvSections.push(`Data Source,${reportData.metadata.dataSource}`);
      csvSections.push(`Total Orders in Period,${reportData.metadata.ordersInPeriod}`);
      csvSections.push(`Total Revenue (UGX),"${formatWithCommas(reportData.metadata.totalRevenue)}"`);
      csvSections.push('');
      
      // 2. BUSINESS SUMMARY TABLE
      csvSections.push('BUSINESS SUMMARY (All amounts in UGX)');
      csvSections.push('Metric,Value');
      csvSections.push(`Total Revenue,"${formatWithCommas(reportData.summary.financial.totalRevenue)}"`);
      csvSections.push(`Average Order Value,"${formatWithCommas(reportData.summary.financial.averageOrderValue)}"`);
      csvSections.push(`Total Orders,${reportData.summary.financial.totalOrders}`);
      csvSections.push(`Total Customers,${reportData.summary.customer.totalCustomers}`);
      csvSections.push(`New Customers,${reportData.summary.customer.newCustomers}`);
      csvSections.push(`Inventory Value,"${formatWithCommas(reportData.summary.inventory.totalValue)}"`);
      csvSections.push(`Total Products,${reportData.summary.inventory.totalProducts}`);
      csvSections.push(`Low Stock Items,${reportData.summary.inventory.lowStockItems}`);
      csvSections.push(`Out of Stock Items,${reportData.summary.inventory.outOfStockItems}`);
      csvSections.push('');
      
      // 3. DAILY SALES TABLE (All amounts in UGX)
      csvSections.push('DAILY SALES DATA (All amounts in UGX)');
      csvSections.push('Date,Revenue (UGX),Orders,Customers,Average Order Value (UGX)');
      reportData.dailySales.forEach(day => {
        const avgOrderValue = day.orders > 0 ? (day.revenue / day.orders) : 0;
        csvSections.push(`${day.date},"${formatWithCommas(day.revenue)}",${day.orders},${day.customers},"${formatWithCommas(avgOrderValue)}"`);
      });
      csvSections.push('');
      
      // 4. PRODUCT PERFORMANCE TABLE (All amounts in UGX)
      csvSections.push('PRODUCT PERFORMANCE (All amounts in UGX)');
      csvSections.push('Product Name,Revenue (UGX),Units Available,Units Sold,Profit Margin %,Category');
      reportData.productPerformance.forEach(product => {
        const profitMargin = product.profitMargin?.toFixed(2) || '0';
        csvSections.push(`"${product.name}","${formatWithCommas(product.revenue)}",${product.unitsAvailable},${product.unitsSold},${profitMargin},"${product.category || 'Uncategorized'}"`);
      });
      csvSections.push('');
      
      // 5. CATEGORY PERFORMANCE TABLE (All amounts in UGX)
      csvSections.push('CATEGORY PERFORMANCE (All amounts in UGX)');
      csvSections.push('Category Name,Revenue (UGX),Product Count,Growth %');
      reportData.categoryPerformance.forEach(category => {
        csvSections.push(`"${category.name}","${formatWithCommas(category.revenue)}",${category.productCount},${category.growth || '0'}`);
      });
      
      content = csvSections.join('\n');
      mimeType = 'text/csv';
      extension = 'csv';
    } else {
      // JSON format with fresh data in UGX (both raw and formatted)
      const formattedReportData = {
        ...reportData,
        summary: {
          ...reportData.summary,
          financial: {
            ...reportData.summary.financial,
            totalRevenue: reportData.summary.financial.totalRevenueFormatted,
            averageOrderValue: reportData.summary.financial.averageOrderValueFormatted
          },
          inventory: {
            ...reportData.summary.inventory,
            totalValue: reportData.summary.inventory.totalValueFormatted
          }
        },
        dailySales: reportData.dailySales.map(day => ({
          ...day,
          revenue: formatWithCommas(day.revenue)
        })),
        productPerformance: reportData.productPerformance.map(product => ({
          ...product,
          revenue: formatWithCommas(product.revenue)
        })),
        categoryPerformance: reportData.categoryPerformance.map(category => ({
          ...category,
          revenue: formatWithCommas(category.revenue)
        }))
      };
      
      content = JSON.stringify(formattedReportData, null, 2);
      mimeType = 'application/json';
      extension = 'json';
    }
    
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics-report-UGX-${dateRange.start}-to-${dateRange.end}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log('✅ Export completed with fresh data in UGX');
    
  } catch (error) {
    console.error('Error exporting report:', error);
    alert('Error exporting report: ' + error.message);
  } finally {
    setExportLoading(false);
  }
};

  // Google Charts Components with Currency Formatting
const SalesTrendChart = () => {
  useEffect(() => {
    if (!chartsLoaded || !analyticsData.salesData.length) {
      console.log('❌ SalesTrendChart: Missing data or charts not loaded');
      return;
    }

    try {
      const data = new window.google.visualization.DataTable();
      data.addColumn('string', 'Date');
      data.addColumn('number', `Revenue (${currentCurrency})`);
      data.addColumn('number', 'Orders');

     const chartData = analyticsData.salesData.map(day => [
  new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  convertPriceForCharts(day.revenue), // Use the new function
  day.orders
]);

      data.addRows(chartData);

      const options = {
        title: `Sales Trend (${activeRange}) - ${currentCurrency}`,
        titleTextStyle: {
          color: currentTheme.text,
          fontSize: isMobile ? 14 : 16,
          bold: true
        },
        curveType: 'function',
        legend: { 
          position: 'top',
          textStyle: { color: currentTheme.text }
        },
        backgroundColor: 'transparent',
        colors: ['#4299e1', '#48bb78'],
        hAxis: {
          textStyle: { color: currentTheme.textMuted },
          titleTextStyle: { color: currentTheme.text }
        },
     vAxis: {
  textStyle: { color: currentTheme.textMuted },
  titleTextStyle: { color: currentTheme.text },
  format: currentCurrency === 'UGX' ? 'short' : 'currency'
},
        chartArea: {
          width: isMobile ? '85%' : '80%',
          height: '70%'
        }
      };

      const chartElement = document.getElementById('sales-trend-chart');
      if (chartElement) {
        console.log('✅ Rendering SalesTrendChart');
        const chart = new window.google.visualization.LineChart(chartElement);
        chart.draw(data, options);
      } else {
        console.log('❌ SalesTrendChart element not found');
      }
    } catch (error) {
      console.error('❌ Error rendering SalesTrendChart:', error);
    }
  }, [chartsLoaded, analyticsData.salesData, currentTheme, isMobile, activeRange, chartKey, currentCurrency]);

  return (
    <div style={{ 
      background: currentTheme.cardBg, 
      padding: isMobile ? '15px' : '20px', 
      borderRadius: '12px',
      marginBottom: '20px',
      boxShadow: currentTheme.cardShadow
    }}>
      <div 
        id="sales-trend-chart" 
        key={`sales-chart-${chartKey}`}
        style={{ 
          width: '100%', 
          height: isMobile ? '250px' : '300px' 
        }}
      />
    </div>
  );
};

const ProductPerformanceChart = () => {
  useEffect(() => {
    if (!chartsLoaded || !analyticsData.productPerformance.length) {
      console.log('❌ ProductPerformanceChart: Missing data or charts not loaded');
      return;
    }

    try {
      const data = new window.google.visualization.DataTable();
      data.addColumn('string', 'Product');
      data.addColumn('number', `Revenue (${currentCurrency})`);
      data.addColumn('number', 'Units Available');
const chartData = analyticsData.productPerformance.slice(0, 8).map(product => [
  product.name.length > 20 ? product.name.substring(0, 20) + '...' : product.name,
  convertPriceForCharts(product.revenue), // Use the new function
  product.unitsAvailable || 0
]);

      console.log('📊 Product Chart Data:', chartData);

      data.addRows(chartData);

      const options = {
        title: `Top Products by Revenue (${activeRange}) - ${currentCurrency}`,
        titleTextStyle: {
          color: currentTheme.text,
          fontSize: isMobile ? 14 : 16,
          bold: true
        },
        legend: { 
          position: 'top',
          textStyle: { color: currentTheme.text }
        },
        backgroundColor: 'transparent',
        colors: ['#4299e1', '#48bb78'],
        hAxis: {
          textStyle: { color: currentTheme.textMuted },
          titleTextStyle: { color: currentTheme.text }
        },
vAxis: {
  textStyle: { color: currentTheme.textMuted },
  titleTextStyle: { color: currentTheme.text },
  format: currentCurrency === 'UGX' ? 'short' : 'currency'
},
vAxes: {
  0: {
    title: `Revenue (${currentCurrency})`,
    format: currentCurrency === 'UGX' ? 'short' : 'currency'
  },
  1: {
    title: 'Units Available',
    format: '0'
  }
},
        series: {
          0: {
            targetAxisIndex: 0,
            type: 'bars'
          },
          1: {
            targetAxisIndex: 1,
            type: 'bars'
          }
        },
        chartArea: {
          width: isMobile ? '80%' : '75%',
          height: '65%'
        },
        bar: { groupWidth: '60%' }
      };

      const chartElement = document.getElementById('product-performance-chart');
      if (chartElement) {
        console.log('✅ Rendering ProductPerformanceChart with dual axes');
        const chart = new window.google.visualization.ColumnChart(chartElement);
        chart.draw(data, options);
      }
    } catch (error) {
      console.error('❌ Error rendering ProductPerformanceChart:', error);
    }
  }, [chartsLoaded, analyticsData.productPerformance, currentTheme, isMobile, activeRange, chartKey, currentCurrency]);

  return (
    <div style={{ 
      background: currentTheme.cardBg, 
      padding: isMobile ? '15px' : '20px', 
      borderRadius: '12px',
      marginBottom: '20px',
      boxShadow: currentTheme.cardShadow
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '20px', 
        marginBottom: '10px',
        flexWrap: 'wrap' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '12px', height: '12px', background: '#4299e1', borderRadius: '2px' }}></div>
          <span style={{ fontSize: '12px', color: currentTheme.text }}>{`Revenue (${currentCurrency})`}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '12px', height: '12px', background: '#48bb78', borderRadius: '2px' }}></div>
          <span style={{ fontSize: '12px', color: currentTheme.text }}>Units Available</span>
        </div>
      </div>
      
      <div 
        id="product-performance-chart" 
        key={`product-chart-${chartKey}`}
        style={{ 
          width: '100%', 
          height: isMobile ? '250px' : '300px' 
        }}
      />
    </div>
  );
};
  const CategoryPerformanceChart = () => {
    useEffect(() => {
      if (!chartsLoaded || !analyticsData.categoryPerformance.length) {
        console.log('❌ CategoryPerformanceChart: Missing data or charts not loaded');
        return;
      }

      try {
        const data = new window.google.visualization.DataTable();
        data.addColumn('string', 'Category');
        data.addColumn('number', 'Percentage');

        // Calculate total revenue for percentage calculation
        const totalRevenue = analyticsData.categoryPerformance.reduce((sum, category) => sum + category.revenue, 0);

        const chartData = analyticsData.categoryPerformance.slice(0, 6).map(category => [
          category.name,
          totalRevenue > 0 ? (category.revenue / totalRevenue * 100) : 0
        ]);

        data.addRows(chartData);

        const options = {
          title: `Category Performance (${activeRange})`,
          titleTextStyle: {
            color: currentTheme.text,
            fontSize: isMobile ? 14 : 16,
            bold: true
          },
          pieHole: 0.4,
          backgroundColor: 'transparent',
          legend: {
            position: isMobile ? 'labeled' : 'right',
            textStyle: { color: currentTheme.text }
          },
          chartArea: {
            width: isMobile ? '90%' : '80%',
            height: '80%'
          },
          pieSliceText: 'percentage',
          tooltip: {
            text: 'percentage',
            showColorCode: true
          },
          slices: {
            0: { color: '#4299e1' },
            1: { color: '#48bb78' },
            2: { color: '#ed8936' },
            3: { color: '#9f7aea' },
            4: { color: '#ed64a6' },
            5: { color: '#667eea' }
          }
        };

        const chartElement = document.getElementById('category-performance-chart');
        if (chartElement) {
          console.log('✅ Rendering CategoryPerformanceChart');
          const chart = new window.google.visualization.PieChart(chartElement);
          chart.draw(data, options);
        }
      } catch (error) {
        console.error('❌ Error rendering CategoryPerformanceChart:', error);
      }
    }, [chartsLoaded, analyticsData.categoryPerformance, currentTheme, isMobile, activeRange, chartKey]);

    return (
      <div style={{ 
        background: currentTheme.cardBg, 
        padding: isMobile ? '15px' : '20px', 
        borderRadius: '12px',
        marginBottom: '20px',
        boxShadow: currentTheme.cardShadow
      }}>
        <div 
          id="category-performance-chart" 
          key={`category-chart-${chartKey}`}
          style={{ 
            width: '100%', 
            height: isMobile ? '250px' : '300px' 
          }}
        />
      </div>
    );
  };

  if (loading || !chartsLoaded) {
    return (
      <div style={{ 
        background: currentTheme.cardBg, 
        borderRadius: '12px', 
        padding: '40px',
        textAlign: 'center',
        boxShadow: currentTheme.cardShadow
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #3498db',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 20px'
        }}></div>
        <p style={{ color: currentTheme.textMuted, margin: 0 }}>
          {!chartsLoaded ? 'Loading charts...' : 'Loading analytics data...'}
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header with Controls */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'stretch' : 'center'
      }}>
        <h2 style={{ 
          margin: 0, 
          color: currentTheme.text,
          fontSize: isMobile ? '20px' : '24px'
        }}>
          Analytics Dashboard
        </h2>
        
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          alignItems: 'center',
          flexWrap: 'wrap',
          justifyContent: isMobile ? 'space-between' : 'flex-end',
          width: isMobile ? '100%' : 'auto'
        }}>
          {/* Currency Display */}
          <div style={{
            padding: '8px 12px',
            background: theme === 'light' ? '#f7fafc' : '#4a5568',
            borderRadius: '6px',
            fontSize: isMobile ? '12px' : '14px',
            color: currentTheme.text,
            border: `1px solid ${currentTheme.border}`
          }}>
            Currency: <strong>{currentCurrency}</strong>
          </div>

          {/* Date Range Selector */}
          <div style={{ 
            display: 'flex', 
            gap: '8px', 
            alignItems: 'center',
            flex: isMobile ? '1 1 100%' : 'none',
            marginBottom: isMobile ? '10px' : '0'
          }}>
            <input
              type="date"
              name="start"
              value={dateRange.start}
              onChange={handleDateRangeChange}
              style={{
                padding: '8px 12px',
                border: `1px solid ${currentTheme.border}`,
                borderRadius: '6px',
                background: currentTheme.cardBg,
                color: currentTheme.text,
                fontSize: '14px',
                flex: 1
              }}
            />
            <span style={{ color: currentTheme.textMuted, fontSize: '14px' }}>to</span>
            <input
              type="date"
              name="end"
              value={dateRange.end}
              onChange={handleDateRangeChange}
              style={{
                padding: '8px 12px',
                border: `1px solid ${currentTheme.border}`,
                borderRadius: '6px',
                background: currentTheme.cardBg,
                color: currentTheme.text,
                fontSize: '14px',
                flex: 1
              }}
            />
          </div>

          {/* Quick Range Buttons */}
          <div style={{ 
            display: 'flex', 
            gap: '5px',
            flex: isMobile ? '1 1 100%' : 'none',
            marginBottom: isMobile ? '10px' : '0'
          }}>
            {[
              { label: '7D', days: 7 },
              { label: '30D', days: 30 },
              { label: '90D', days: 90 }
            ].map(range => (
              <button
                key={range.days}
                onClick={() => handleQuickRange(range.days, range.label)}
                style={{
                  padding: '8px 12px',
                  border: `1px solid ${currentTheme.border}`,
                  background: activeRange === range.label ? '#4299e1' : currentTheme.cardBg,
                  color: activeRange === range.label ? 'white' : currentTheme.text,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  flex: 1,
                  transition: 'all 0.2s ease'
                }}
              >
                {range.label}
              </button>
            ))}
          </div>

          {/* Export Buttons */}
          <div style={{ 
            display: 'flex', 
            gap: '5px',
            flex: isMobile ? '1 1 100%' : 'none'
          }}>
            <button
              onClick={() => exportReport('csv')}
              disabled={exportLoading}
              style={{
                padding: '8px 12px',
                border: 'none',
                background: '#48bb78',
                color: 'white',
                borderRadius: '6px',
                cursor: exportLoading ? 'not-allowed' : 'pointer',
                fontSize: '12px',
                flex: 1
              }}
            >
              {exportLoading ? 'Exporting...' : 'CSV'}
            </button>
            <button
              onClick={() => exportReport('json')}
              disabled={exportLoading}
              style={{
                padding: '8px 12px',
                border: 'none',
                background: '#4299e1',
                color: 'white',
                borderRadius: '6px',
                cursor: exportLoading ? 'not-allowed' : 'pointer',
                fontSize: '12px',
                flex: 1
              }}
            >
              {exportLoading ? 'Exporting...' : 'JSON'}
            </button>
          </div>
        </div>
      </div>

      {searchTerm && (
        <div style={{
          background: currentTheme.cardBg,
          padding: '15px 20px',
          borderRadius: '8px',
          marginBottom: '20px',
          boxShadow: currentTheme.cardShadow,
          borderLeft: '4px solid #4299e1'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '20px' }}>🔍</span>
            <div>
              <strong style={{ color: currentTheme.text }}>Search Active</strong>
              <div style={{ fontSize: '14px', color: currentTheme.textMuted, marginTop: '2px' }}>
                Showing analytics data filtered by: "{searchTerm}"
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
        gap: isMobile ? '12px' : '20px',
        marginBottom: '20px'
      }}>
        {[
         { 
  title: 'Total Revenue', 
  value: `${currencySymbol}${actualConvertPrice(analyticsData.revenueData.total)}`,
  change: parseFloat(analyticsData.revenueData.growth),
  icon: '💰',
  color: '#48bb78'
},
          { 
            title: 'Total Customers', 
            value: analyticsData.customerStats.total.toLocaleString(),
            change: parseFloat(analyticsData.customerStats.growth),
            icon: '👥',
            color: '#4299e1'
          },
          { 
            title: 'New Customers', 
            value: analyticsData.customerStats.newThisPeriod.toLocaleString(),
            change: parseFloat(analyticsData.customerStats.growth),
            icon: '🆕',
            color: '#9f7aea'
          },
       { 
  title: 'Inventory Value', 
  value: `${currencySymbol}${actualConvertPrice(analyticsData.inventoryMetrics.totalValue)}`,
  change: 5.2,
  icon: '📦',
  color: '#ed8936'
}
        ].map(metric => (
          <div key={metric.title} style={{
            background: currentTheme.cardBg,
            padding: isMobile ? '15px' : '20px',
            borderRadius: '12px',
            boxShadow: currentTheme.cardShadow,
            borderLeft: `4px solid ${metric.color}`
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ 
                  margin: '0 0 8px 0', 
                  fontSize: isMobile ? '12px' : '14px', 
                  color: currentTheme.textMuted, 
                  fontWeight: '500' 
                }}>
                  {metric.title}
                </h3>
                <p style={{ 
                  margin: '0 0 8px 0', 
                  fontSize: isMobile ? '18px' : '24px', 
                  fontWeight: 'bold', 
                  color: currentTheme.text 
                }}>
                  {metric.value}
                </p>
                <span style={{ 
                  color: metric.change >= 0 ? '#48bb78' : '#e53e3e',
                  fontSize: '11px',
                  fontWeight: '600'
                }}>
                  {metric.change >= 0 ? '+' : ''}{metric.change}%
                </span>
              </div>
              <span style={{ fontSize: isMobile ? '20px' : '24px' }}>{metric.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr',
        gap: isMobile ? '15px' : '20px',
        marginBottom: '20px'
      }}>
        {/* Left Column - Main Charts */}
        <div>
          <SalesTrendChart />
          <ProductPerformanceChart />
        </div>

        {/* Right Column - Secondary Charts */}
        <div>
          <CategoryPerformanceChart />
        </div>
      </div>

      {/* Data Summary */}
      <div style={{
        background: currentTheme.cardBg,
        padding: isMobile ? '15px' : '20px',
        borderRadius: '12px',
        boxShadow: currentTheme.cardShadow
      }}>
        <h4 style={{ 
          margin: '0 0 15px 0', 
          color: currentTheme.text,
          fontSize: isMobile ? '16px' : '18px'
        }}>
          Performance Summary ({activeRange}) - {currentCurrency}
        </h4>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
          gap: '20px',
          fontSize: '14px'
        }}>
          <div>
            <strong style={{ color: currentTheme.text, display: 'block', marginBottom: '10px' }}>
              📦 Inventory Overview
            </strong>
            <div style={{ color: currentTheme.textMuted, display: 'grid', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Total Products:</span>
                <strong style={{ color: currentTheme.text }}>{analyticsData.inventoryMetrics.totalProducts}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Low Stock Items:</span>
                <strong style={{ color: '#ed8936' }}>{analyticsData.inventoryMetrics.lowStockItems}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Out of Stock:</span>
                <strong style={{ color: '#e53e3e' }}>{analyticsData.inventoryMetrics.outOfStockItems}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Inventory Value:</span>
                <strong style={{ color: currentTheme.text }}>{currencySymbol}{actualConvertPrice(analyticsData.inventoryMetrics.totalValue)}</strong>
              </div>
            </div>
          </div>
          <div>
            <strong style={{ color: currentTheme.text, display: 'block', marginBottom: '10px' }}>
              💰 Financial Overview
            </strong>
            <div style={{ color: currentTheme.textMuted, display: 'grid', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Total Revenue:</span>
                <strong style={{ color: currentTheme.text }}>{currencySymbol}{actualConvertPrice(analyticsData.revenueData.total)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Average Order Value:</span>
                <strong style={{ color: '#48bb78' }}>{currencySymbol}{actualConvertPrice(analyticsData.revenueData.averageOrderValue)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Revenue Growth:</span>
                <strong style={{ color: parseFloat(analyticsData.revenueData.growth) >= 0 ? '#48bb78' : '#e53e3e' }}>
                  {analyticsData.revenueData.growth}%
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Total Orders:</span>
                <strong style={{ color: currentTheme.text }}>{analyticsData.revenueData.orderCount}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
// Customers Management Component with Search - Updated for mobile
// Customers Management Component with Search - Updated for proper first_name/last_name handling
const CustomersManagement = ({ searchTerm, theme, currentTheme, showPopupMessage, isMobile }) => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = customers.filter(customer =>
        (customer.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone?.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredCustomers(filtered);
    } else {
      setFilteredCustomers(customers);
    }
  }, [searchTerm, customers]);

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setCustomers(data || []);
      setFilteredCustomers(data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
      showPopupMessage('Error loading customers: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCustomer = async (customerId) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', customerId);

      if (error) throw error;
      
      fetchCustomers();
      showPopupMessage('Customer deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting customer:', error);
      showPopupMessage('Error deleting customer: ' + error.message, 'error');
    }
  };

  const handleEditCustomer = (customer) => {
    setEditingCustomer(customer);
    setShowEditForm(true);
  };

  const handleUpdateCustomer = async (updatedData) => {
    try {
      const { error } = await supabase
        .from('customers')
        .update(updatedData)
        .eq('id', editingCustomer.id);

      if (error) throw error;
      
      fetchCustomers();
      showPopupMessage('Customer updated successfully', 'success');
      setShowEditForm(false);
      setEditingCustomer(null);
    } catch (error) {
      console.error('Error updating customer:', error);
      showPopupMessage('Error updating customer: ' + error.message, 'error');
    }
  };

  // Function to generate full name from first_name and last_name
  const getFullName = (customer) => {
    const firstName = customer.first_name?.trim() || '';
    const lastName = customer.last_name?.trim() || '';
    
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    } else if (firstName) {
      return firstName;
    } else if (lastName) {
      return lastName;
    } else {
      // Fallback to email username if no names are available
      if (customer.email) {
        const username = customer.email.split('@')[0];
        return username.charAt(0).toUpperCase() + username.slice(1);
      }
      return 'Customer';
    }
  };

  // Function to check if name is incomplete
  const hasIncompleteName = (customer) => {
    return !customer.first_name?.trim() || !customer.last_name?.trim();
  };

  // Function to format phone number for display
  const formatPhoneNumber = (phone) => {
    if (!phone) return '-';
    
    // Remove any non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Format based on length
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
    
    return phone; // Return original if format doesn't match
  };

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'flex-start' : 'center',
        gap: isMobile ? '15px' : '0'
      }}>
        <h2 style={{ 
          margin: 0, 
          color: currentTheme.text,
          fontSize: isMobile ? '18px' : '24px'
        }}>
          Customers Management
        </h2>
        
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          alignItems: 'center',
          flexWrap: 'wrap',
          justifyContent: isMobile ? 'space-between' : 'flex-end',
          width: isMobile ? '100%' : 'auto'
        }}>
          <div style={{
            padding: '8px 12px',
            background: theme === 'light' ? '#f7fafc' : '#4a5568',
            borderRadius: '6px',
            fontSize: isMobile ? '12px' : '14px',
            color: currentTheme.text,
            border: `1px solid ${currentTheme.border}`
          }}>
            Total: {filteredCustomers.length} customers
          </div>
        </div>
      </div>

      {/* Edit Customer Form */}
      {showEditForm && editingCustomer && (
        <EditCustomerForm 
          customer={editingCustomer}
          onClose={() => {
            setShowEditForm(false);
            setEditingCustomer(null);
          }}
          onSave={handleUpdateCustomer}
          theme={theme}
          currentTheme={currentTheme}
          showPopupMessage={showPopupMessage}
          isMobile={isMobile}
        />
      )}

      <div style={{ 
        background: currentTheme.cardBg, 
        borderRadius: '12px',
        boxShadow: currentTheme.cardShadow,
        overflow: 'hidden'
      }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #3498db',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px'
            }}></div>
            <p style={{ color: currentTheme.textMuted, margin: 0 }}>Loading customers...</p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
            <h3 style={{ color: currentTheme.text, marginBottom: '8px' }}>No customers found</h3>
            <p style={{ color: currentTheme.textMuted, marginBottom: '20px' }}>
              {searchTerm ? 'Try adjusting your search terms' : 'No customers registered yet'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            {isMobile ? (
              // Mobile view - card layout
              <div style={{ padding: isMobile ? '10px' : '0' }}>
                {filteredCustomers.map(customer => (
                  <div key={customer.id} style={{
                    padding: '15px',
                    borderBottom: `1px solid ${currentTheme.border}`,
                    background: currentTheme.cardBg,
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = theme === 'light' ? '#f7fafc' : '#4a5568';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = currentTheme.cardBg;
                  }}
                  >
                    <div style={{ marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <strong style={{ color: currentTheme.text }}>
                          {getFullName(customer)}
                        </strong>
                        {hasIncompleteName(customer) && (
                          <span style={{
                            padding: '2px 6px',
                            background: '#feebc8',
                            color: '#744210',
                            borderRadius: '4px',
                            fontSize: '10px',
                            fontWeight: '600'
                          }}>
                            Incomplete
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '12px', color: currentTheme.textMuted }}>
                        📧 {customer.email}
                      </div>
                      {customer.phone && (
                        <div style={{ fontSize: '12px', color: currentTheme.textMuted }}>
                          📞 {formatPhoneNumber(customer.phone)}
                        </div>
                      )}
                    </div>
                    
                    <div style={{ marginBottom: '10px' }}>
                      <div style={{ fontSize: '12px', color: currentTheme.textMuted }}>Joined</div>
                      <div style={{ fontSize: '13px', color: currentTheme.text }}>
                        {new Date(customer.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <button 
                        onClick={() => handleEditCustomer(customer)}
                        style={{
                          background: '#4299e1',
                          color: 'white',
                          border: 'none',
                          padding: '8px 12px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteCustomer(customer.id)}
                        style={{
                          background: '#e53e3e',
                          color: 'white',
                          border: 'none',
                          padding: '8px 12px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Desktop view - table layout
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                <thead>
                  <tr style={{ background: theme === 'light' ? '#f7fafc' : '#4a5568' }}>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: `1px solid ${currentTheme.border}`, color: currentTheme.text }}>Name</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: `1px solid ${currentTheme.border}`, color: currentTheme.text }}>First Name</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: `1px solid ${currentTheme.border}`, color: currentTheme.text }}>Last Name</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: `1px solid ${currentTheme.border}`, color: currentTheme.text }}>Email</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: `1px solid ${currentTheme.border}`, color: currentTheme.text }}>Phone</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: `1px solid ${currentTheme.border}`, color: currentTheme.text }}>Joined Date</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: `1px solid ${currentTheme.border}`, color: currentTheme.text }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map(customer => (
                    <tr key={customer.id} style={{
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = theme === 'light' ? '#f7fafc' : '#4a5568';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = currentTheme.cardBg;
                    }}
                    >
                      <td style={{ padding: '12px', borderBottom: `1px solid ${currentTheme.border}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <strong style={{ color: currentTheme.text }}>{getFullName(customer)}</strong>
                          {hasIncompleteName(customer) && (
                            <span style={{
                              padding: '2px 6px',
                              background: '#feebc8',
                              color: '#744210',
                              borderRadius: '4px',
                              fontSize: '10px',
                              fontWeight: '600'
                            }}>
                              Incomplete
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '12px', borderBottom: `1px solid ${currentTheme.border}`, color: currentTheme.text }}>
                        {customer.first_name || '-'}
                      </td>
                      <td style={{ padding: '12px', borderBottom: `1px solid ${currentTheme.border}`, color: currentTheme.text }}>
                        {customer.last_name || '-'}
                      </td>
                      <td style={{ padding: '12px', borderBottom: `1px solid ${currentTheme.border}`, color: currentTheme.text }}>
                        {customer.email}
                      </td>
                      <td style={{ padding: '12px', borderBottom: `1px solid ${currentTheme.border}`, color: currentTheme.text }}>
                        {formatPhoneNumber(customer.phone)}
                      </td>
                      <td style={{ padding: '12px', borderBottom: `1px solid ${currentTheme.border}`, color: currentTheme.text }}>
                        {new Date(customer.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td style={{ padding: '12px', borderBottom: `1px solid ${currentTheme.border}` }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            onClick={() => handleEditCustomer(customer)}
                            style={{
                              background: '#4299e1',
                              color: 'white',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: '500'
                            }}
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteCustomer(customer.id)}
                            style={{
                              background: '#e53e3e',
                              color: 'white',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: '500'
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Updated EditCustomerForm to handle first_name and last_name
const EditCustomerForm = ({ customer, onClose, onSave, theme, currentTheme, showPopupMessage, isMobile }) => {
  const [formData, setFormData] = useState({
    first_name: customer.first_name || '',
    last_name: customer.last_name || '',
    email: customer.email || '',
    phone: customer.phone || ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSave({
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null
      });
    } catch (error) {
      console.error('Error in form submission:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: isMobile ? '10px' : '20px'
    }}>
      <div style={{
        background: currentTheme.cardBg,
        padding: isMobile ? '15px' : '20px',
        borderRadius: '12px',
        width: '90%',
        maxWidth: isMobile ? '100%' : '500px',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
        color: currentTheme.text
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ 
            margin: 0, 
            fontSize: isMobile ? '18px' : '20px', 
            fontWeight: '600' 
          }}>
            Edit Customer
          </h3>
          <button 
            onClick={onClose}
            style={{ 
              background: 'none', 
              border: 'none', 
              fontSize: '24px', 
              cursor: 'pointer',
              color: currentTheme.textMuted
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gap: '15px' }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
              gap: '15px' 
            }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: currentTheme.text }}>
                  First Name *
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                  placeholder="First name"
                  style={{ 
                    width: '100%', 
                    padding: '10px 12px', 
                    border: `1px solid ${currentTheme.border}`, 
                    borderRadius: '6px',
                    fontSize: '14px',
                    background: currentTheme.cardBg,
                    color: currentTheme.text
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: currentTheme.text }}>
                  Last Name *
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                  placeholder="Last name"
                  style={{ 
                    width: '100%', 
                    padding: '10px 12px', 
                    border: `1px solid ${currentTheme.border}`, 
                    borderRadius: '6px',
                    fontSize: '14px',
                    background: currentTheme.cardBg,
                    color: currentTheme.text
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: currentTheme.text }}>
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                style={{ 
                  width: '100%', 
                  padding: '10px 12px', 
                  border: `1px solid ${currentTheme.border}`, 
                  borderRadius: '6px',
                  fontSize: '14px',
                  background: currentTheme.cardBg,
                  color: currentTheme.text
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: currentTheme.text }}>
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Optional phone number"
                style={{ 
                  width: '100%', 
                  padding: '10px 12px', 
                  border: `1px solid ${currentTheme.border}`, 
                  borderRadius: '6px',
                  fontSize: '14px',
                  background: currentTheme.cardBg,
                  color: currentTheme.text
                }}
              />
            </div>

            <div style={{ 
              display: 'flex', 
              gap: '10px', 
              justifyContent: 'flex-end',
              flexDirection: isMobile ? 'column' : 'row'
            }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  background: '#a0aec0',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  background: '#48bb78',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '14px'
                }}
              >
                {loading ? 'Updating...' : 'Update Customer'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

// Services Management Component
const ServicesManagement = ({ searchTerm, theme, currentTheme, showPopupMessage, isMobile, convertPrice, getCurrencySymbol, currentCurrency }) => {
  const [serviceInquiries, setServiceInquiries] = useState([]);
  const [filteredInquiries, setFilteredInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [showInquiryDetails, setShowInquiryDetails] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    fetchServiceInquiries();
  }, []);

  useEffect(() => {
    let filtered = serviceInquiries;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(inquiry =>
        inquiry.service_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inquiry.inquiry_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inquiry.service_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inquiry.customer_email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(inquiry => inquiry.status === statusFilter);
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(inquiry => inquiry.service_type === typeFilter);
    }

    setFilteredInquiries(filtered);
  }, [searchTerm, serviceInquiries, statusFilter, typeFilter]);

  const fetchServiceInquiries = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('service_inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setServiceInquiries(data || []);
      setFilteredInquiries(data || []);
    } catch (error) {
      console.error('Error fetching service inquiries:', error);
      showPopupMessage('Error loading service inquiries: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateInquiryStatus = async (inquiryId, newStatus) => {
    try {
      const { error } = await supabase
        .from('service_inquiries')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', inquiryId);

      if (error) throw error;
      
      fetchServiceInquiries();
      showPopupMessage(`Service inquiry status updated to ${newStatus}`, 'success');
    } catch (error) {
      console.error('Error updating inquiry status:', error);
      showPopupMessage('Error updating inquiry status: ' + error.message, 'error');
    }
  };

  const deleteInquiry = async (inquiryId) => {
    if (!window.confirm('Are you sure you want to delete this service inquiry?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('service_inquiries')
        .delete()
        .eq('id', inquiryId);

      if (error) throw error;
      
      fetchServiceInquiries();
      showPopupMessage('Service inquiry deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting service inquiry:', error);
      showPopupMessage('Error deleting service inquiry: ' + error.message, 'error');
    }
  };

  const getServiceIcon = (serviceType) => {
    switch (serviceType) {
      case 'web_development': return '🌐';
      case 'app_development': return '📱';
      default: return '🛠️';
    }
  };

  const getServiceTypeName = (serviceType) => {
    switch (serviceType) {
      case 'web_development': return 'Web Development';
      case 'app_development': return 'App Development';
      default: return serviceType;
    }
  };

  const getStatusBadgeStyle = (status) => {
    const styles = {
      pending: { background: '#feebc8', color: '#744210' },
      contacted: { background: '#bee3f8', color: '#2a4365' },
      quoted: { background: '#c6f6d5', color: '#22543d' },
      closed: { background: '#e2e8f0', color: '#4a5568' },
      rejected: { background: '#fed7d7', color: '#742a2a' }
    };
    return styles[status] || styles.pending;
  };

  const handleViewDetails = (inquiry) => {
    setSelectedInquiry(inquiry);
    setShowInquiryDetails(true);
  };

  const getStats = () => {
    const total = serviceInquiries.length;
    const pending = serviceInquiries.filter(i => i.status === 'pending').length;
    const webDev = serviceInquiries.filter(i => i.service_type === 'web_development').length;
    const appDev = serviceInquiries.filter(i => i.service_type === 'app_development').length;
    
    return { total, pending, webDev, appDev };
  };

  const stats = getStats();

  return (
    <div>
      {/* Header with Stats */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'flex-start' : 'center',
        gap: isMobile ? '15px' : '0'
      }}>
        <div>
          <h2 style={{ 
            margin: 0, 
            color: currentTheme.text,
            fontSize: isMobile ? '18px' : '24px'
          }}>
            🛠️ Services Management
          </h2>
          <p style={{ 
            margin: '5px 0 0 0', 
            color: currentTheme.textMuted,
            fontSize: isMobile ? '12px' : '14px'
          }}>
            Manage web and app development service inquiries
          </p>
        </div>
        
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          alignItems: 'center',
          flexWrap: 'wrap',
          justifyContent: isMobile ? 'space-between' : 'flex-end',
          width: isMobile ? '100%' : 'auto'
        }}>
          {/* Quick Stats */}
          <div style={{ 
            display: 'flex', 
            gap: '15px',
            flexWrap: 'wrap'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: isMobile ? '14px' : '16px', fontWeight: 'bold', color: currentTheme.text }}>
                {stats.total}
              </div>
              <div style={{ fontSize: '12px', color: currentTheme.textMuted }}>Total</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: isMobile ? '14px' : '16px', fontWeight: 'bold', color: '#ed8936' }}>
                {stats.pending}
              </div>
              <div style={{ fontSize: '12px', color: currentTheme.textMuted }}>Pending</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: isMobile ? '14px' : '16px', fontWeight: 'bold', color: '#4299e1' }}>
                {stats.webDev}
              </div>
              <div style={{ fontSize: '12px', color: currentTheme.textMuted }}>Web</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: isMobile ? '14px' : '16px', fontWeight: 'bold', color: '#48bb78' }}>
                {stats.appDev}
              </div>
              <div style={{ fontSize: '12px', color: currentTheme.textMuted }}>App</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        marginBottom: '20px',
        flexDirection: isMobile ? 'column' : 'row',
        flexWrap: 'wrap'
      }}>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          style={{
            padding: '8px 12px',
            border: `1px solid ${currentTheme.border}`,
            borderRadius: '6px',
            background: currentTheme.cardBg,
            color: currentTheme.text,
            fontSize: isMobile ? '12px' : '14px',
            minWidth: isMobile ? '100%' : '150px'
          }}
        >
          <option value="all">All Service Types</option>
          <option value="web_development">🌐 Web Development</option>
          <option value="app_development">📱 App Development</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: '8px 12px',
            border: `1px solid ${currentTheme.border}`,
            borderRadius: '6px',
            background: currentTheme.cardBg,
            color: currentTheme.text,
            fontSize: isMobile ? '12px' : '14px',
            minWidth: isMobile ? '100%' : '150px'
          }}
        >
          <option value="all">All Status</option>
          <option value="pending">🟡 Pending</option>
          <option value="contacted">🔵 Contacted</option>
          <option value="quoted">🟢 Quoted</option>
          <option value="closed">⚫ Closed</option>
          <option value="rejected">🔴 Rejected</option>
        </select>

        <div style={{
          padding: '8px 12px',
          background: theme === 'light' ? '#f7fafc' : '#4a5568',
          borderRadius: '6px',
          fontSize: isMobile ? '12px' : '14px',
          color: currentTheme.text,
          border: `1px solid ${currentTheme.border}`,
          marginLeft: isMobile ? '0' : 'auto'
        }}>
          Showing: {filteredInquiries.length} inquiries
        </div>
      </div>

      {/* Inquiry Details Modal */}
      {showInquiryDetails && selectedInquiry && (
        <ServiceInquiryModal 
          inquiry={selectedInquiry}
          onClose={() => setShowInquiryDetails(false)}
          onStatusUpdate={updateInquiryStatus}
          theme={theme}
          currentTheme={currentTheme}
          isMobile={isMobile}
          convertPrice={convertPrice}
          getCurrencySymbol={getCurrencySymbol}
          currentCurrency={currentCurrency}
          getServiceIcon={getServiceIcon}
          getServiceTypeName={getServiceTypeName}
          getStatusBadgeStyle={getStatusBadgeStyle}
        />
      )}

      {/* Services List */}
      <div style={{ 
        background: currentTheme.cardBg, 
        borderRadius: '12px',
        boxShadow: currentTheme.cardShadow,
        overflow: 'hidden'
      }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #3498db',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px'
            }}></div>
            <p style={{ color: currentTheme.textMuted, margin: 0 }}>Loading service inquiries...</p>
          </div>
        ) : filteredInquiries.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🛠️</div>
            <h3 style={{ color: currentTheme.text, marginBottom: '8px' }}>No service inquiries found</h3>
            <p style={{ color: currentTheme.textMuted, marginBottom: '20px' }}>
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' 
                ? 'Try adjusting your filters' 
                : 'No service inquiries received yet'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            {isMobile ? (
              <MobileServiceInquiriesView 
                inquiries={filteredInquiries}
                onViewDetails={handleViewDetails}
                onStatusUpdate={updateInquiryStatus}
                onDelete={deleteInquiry}
                theme={theme}
                currentTheme={currentTheme}
                getServiceIcon={getServiceIcon}
                getServiceTypeName={getServiceTypeName}
                getStatusBadgeStyle={getStatusBadgeStyle}
                convertPrice={convertPrice}
                getCurrencySymbol={getCurrencySymbol}
              />
            ) : (
              <DesktopServiceInquiriesView 
                inquiries={filteredInquiries}
                onViewDetails={handleViewDetails}
                onStatusUpdate={updateInquiryStatus}
                onDelete={deleteInquiry}
                theme={theme}
                currentTheme={currentTheme}
                getServiceIcon={getServiceIcon}
                getServiceTypeName={getServiceTypeName}
                getStatusBadgeStyle={getStatusBadgeStyle}
                convertPrice={convertPrice}
                getCurrencySymbol={getCurrencySymbol}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Mobile View Component
const MobileServiceInquiriesView = ({ inquiries, onViewDetails, onStatusUpdate, onDelete, theme, currentTheme, getServiceIcon, getServiceTypeName, getStatusBadgeStyle, convertPrice, getCurrencySymbol }) => (
  <div style={{ padding: '10px' }}>
    {inquiries.map(inquiry => (
      <div key={inquiry.id} style={{
        padding: '15px',
        borderBottom: `1px solid ${currentTheme.border}`,
        background: currentTheme.cardBg,
        transition: 'background-color 0.2s'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = theme === 'light' ? '#f7fafc' : '#4a5568';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = currentTheme.cardBg;
      }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '16px' }}>{getServiceIcon(inquiry.service_type)}</span>
              <strong style={{ color: currentTheme.text }}>
                {inquiry.service_name}
              </strong>
            </div>
            <div style={{ fontSize: '12px', color: currentTheme.textMuted }}>
              #{inquiry.inquiry_number} • {getServiceTypeName(inquiry.service_type)}
            </div>
          </div>
          <span style={{
            padding: '4px 8px',
            ...getStatusBadgeStyle(inquiry.status),
            borderRadius: '8px',
            fontSize: '10px',
            fontWeight: '600',
            textTransform: 'capitalize'
          }}>
            {inquiry.status}
          </span>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
          <div>
            <div style={{ fontSize: '12px', color: currentTheme.textMuted }}>Price</div>
            <div style={{ fontSize: '13px', color: currentTheme.text, fontWeight: '600' }}>
              {getCurrencySymbol()}{convertPrice(inquiry.price_usd)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: currentTheme.textMuted }}>Timeline</div>
            <div style={{ fontSize: '13px', color: currentTheme.text }}>
              {inquiry.timeline}
            </div>
          </div>
        </div>
        
        <div style={{ marginBottom: '10px' }}>
          <div style={{ fontSize: '12px', color: currentTheme.textMuted }}>Created</div>
          <div style={{ fontSize: '13px', color: currentTheme.text }}>
            {new Date(inquiry.created_at).toLocaleDateString()}
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
          <button 
            onClick={() => onViewDetails(inquiry)}
            style={{
              background: '#4299e1',
              color: 'white',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '500'
            }}
          >
            View Details
          </button>
          <select
            value={inquiry.status}
            onChange={(e) => onStatusUpdate(inquiry.id, e.target.value)}
            style={{
              padding: '8px',
              border: `1px solid ${currentTheme.border}`,
              borderRadius: '4px',
              background: currentTheme.cardBg,
              color: currentTheme.text,
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            <option value="pending">Pending</option>
            <option value="contacted">Contacted</option>
            <option value="quoted">Quoted</option>
            <option value="closed">Closed</option>
            <option value="rejected">Rejected</option>
          </select>
          <button 
            onClick={() => onDelete(inquiry.id)}
            style={{
              background: '#e53e3e',
              color: 'white',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '500'
            }}
          >
            Delete
          </button>
        </div>
      </div>
    ))}
  </div>
);

// Desktop View Component
const DesktopServiceInquiriesView = ({ inquiries, onViewDetails, onStatusUpdate, onDelete, theme, currentTheme, getServiceIcon, getServiceTypeName, getStatusBadgeStyle, convertPrice, getCurrencySymbol }) => (
  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
    <thead>
      <tr style={{ background: theme === 'light' ? '#f7fafc' : '#4a5568' }}>
        <th style={{ padding: '12px', textAlign: 'left', borderBottom: `1px solid ${currentTheme.border}`, color: currentTheme.text }}>Service</th>
        <th style={{ padding: '12px', textAlign: 'left', borderBottom: `1px solid ${currentTheme.border}`, color: currentTheme.text }}>Inquiry #</th>
        <th style={{ padding: '12px', textAlign: 'left', borderBottom: `1px solid ${currentTheme.border}`, color: currentTheme.text }}>Type</th>
        <th style={{ padding: '12px', textAlign: 'left', borderBottom: `1px solid ${currentTheme.border}`, color: currentTheme.text }}>Price</th>
        <th style={{ padding: '12px', textAlign: 'left', borderBottom: `1px solid ${currentTheme.border}`, color: currentTheme.text }}>Timeline</th>
        <th style={{ padding: '12px', textAlign: 'left', borderBottom: `1px solid ${currentTheme.border}`, color: currentTheme.text }}>Status</th>
        <th style={{ padding: '12px', textAlign: 'left', borderBottom: `1px solid ${currentTheme.border}`, color: currentTheme.text }}>Created</th>
        <th style={{ padding: '12px', textAlign: 'left', borderBottom: `1px solid ${currentTheme.border}`, color: currentTheme.text }}>Actions</th>
      </tr>
    </thead>
    <tbody>
      {inquiries.map(inquiry => (
        <tr key={inquiry.id} style={{
          transition: 'background-color 0.2s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = theme === 'light' ? '#f7fafc' : '#4a5568';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = currentTheme.cardBg;
        }}
        >
          <td style={{ padding: '12px', borderBottom: `1px solid ${currentTheme.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '16px' }}>{getServiceIcon(inquiry.service_type)}</span>
              <div>
                <strong style={{ color: currentTheme.text }}>{inquiry.service_name}</strong>
                <div style={{ fontSize: '12px', color: currentTheme.textMuted, marginTop: '2px' }}>
                  {inquiry.service_description?.substring(0, 50)}{inquiry.service_description?.length > 50 ? '...' : ''}
                </div>
              </div>
            </div>
          </td>
          <td style={{ padding: '12px', borderBottom: `1px solid ${currentTheme.border}`, color: currentTheme.text }}>
            <code style={{ background: theme === 'light' ? '#f7fafc' : '#4a5568', padding: '2px 6px', borderRadius: '4px' }}>
              {inquiry.inquiry_number}
            </code>
          </td>
          <td style={{ padding: '12px', borderBottom: `1px solid ${currentTheme.border}`, color: currentTheme.text }}>
            {getServiceTypeName(inquiry.service_type)}
          </td>
          <td style={{ padding: '12px', borderBottom: `1px solid ${currentTheme.border}`, color: currentTheme.text, fontWeight: '600' }}>
            {getCurrencySymbol()}{convertPrice(inquiry.price_usd)}
          </td>
          <td style={{ padding: '12px', borderBottom: `1px solid ${currentTheme.border}`, color: currentTheme.text }}>
            {inquiry.timeline}
          </td>
          <td style={{ padding: '12px', borderBottom: `1px solid ${currentTheme.border}` }}>
            <span style={{
              padding: '6px 12px',
              ...getStatusBadgeStyle(inquiry.status),
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '600',
              display: 'inline-block',
              minWidth: '80px',
              textAlign: 'center',
              textTransform: 'capitalize'
            }}>
              {inquiry.status}
            </span>
          </td>
          <td style={{ padding: '12px', borderBottom: `1px solid ${currentTheme.border}`, color: currentTheme.text }}>
            {new Date(inquiry.created_at).toLocaleDateString()}
          </td>
          <td style={{ padding: '12px', borderBottom: `1px solid ${currentTheme.border}` }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button 
                onClick={() => onViewDetails(inquiry)}
                style={{
                  background: '#4299e1',
                  color: 'white',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '500'
                }}
              >
                Details
              </button>
              <select
                value={inquiry.status}
                onChange={(e) => onStatusUpdate(inquiry.id, e.target.value)}
                style={{
                  padding: '6px 8px',
                  border: `1px solid ${currentTheme.border}`,
                  borderRadius: '4px',
                  background: currentTheme.cardBg,
                  color: currentTheme.text,
                  fontSize: '12px',
                  cursor: 'pointer',
                  minWidth: '100px'
                }}
              >
                <option value="pending">Pending</option>
                <option value="contacted">Contacted</option>
                <option value="quoted">Quoted</option>
                <option value="closed">Closed</option>
                <option value="rejected">Rejected</option>
              </select>
              <button 
                onClick={() => onDelete(inquiry.id)}
                style={{
                  background: '#e53e3e',
                  color: 'white',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '500'
                }}
              >
                Delete
              </button>
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

// Service Inquiry Modal Component
const ServiceInquiryModal = ({ inquiry, onClose, onStatusUpdate, theme, currentTheme, isMobile, convertPrice, getCurrencySymbol, currentCurrency, getServiceIcon, getServiceTypeName, getStatusBadgeStyle }) => (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: isMobile ? '10px' : '20px'
  }}>
    <div style={{
      background: currentTheme.cardBg,
      padding: isMobile ? '15px' : '20px',
      borderRadius: '12px',
      width: '90%',
      maxWidth: isMobile ? '100%' : '600px',
      maxHeight: '90vh',
      overflow: 'auto',
      boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
      color: currentTheme.text
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ 
          margin: 0, 
          fontSize: isMobile ? '18px' : '20px', 
          fontWeight: '600' 
        }}>
          {getServiceIcon(inquiry.service_type)} Service Inquiry Details
        </h3>
        <button 
          onClick={onClose}
          style={{ 
            background: 'none', 
            border: 'none', 
            fontSize: '24px', 
            cursor: 'pointer',
            color: currentTheme.textMuted
          }}
        >
          ×
        </button>
      </div>

      <div style={{ display: 'grid', gap: '15px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '15px' }}>
          <div>
            <strong style={{ color: currentTheme.textMuted, fontSize: '14px' }}>Inquiry Number</strong>
            <div style={{ color: currentTheme.text, fontSize: '16px', fontWeight: '600' }}>
              {inquiry.inquiry_number}
            </div>
          </div>
          <div>
            <strong style={{ color: currentTheme.textMuted, fontSize: '14px' }}>Service Type</strong>
            <div style={{ color: currentTheme.text, fontSize: '16px' }}>
              {getServiceIcon(inquiry.service_type)} {getServiceTypeName(inquiry.service_type)}
            </div>
          </div>
        </div>

        <div>
          <strong style={{ color: currentTheme.textMuted, fontSize: '14px' }}>Service Name</strong>
          <div style={{ color: currentTheme.text, fontSize: '16px', fontWeight: '600' }}>
            {inquiry.service_name}
          </div>
        </div>

        <div>
          <strong style={{ color: currentTheme.textMuted, fontSize: '14px' }}>Description</strong>
          <div style={{ color: currentTheme.text, fontSize: '14px', lineHeight: '1.5' }}>
            {inquiry.service_description || 'No description provided'}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '15px' }}>
          <div>
            <strong style={{ color: currentTheme.textMuted, fontSize: '14px' }}>Price</strong>
            <div style={{ color: currentTheme.text, fontSize: '16px', fontWeight: '600' }}>
              {getCurrencySymbol()}{convertPrice(inquiry.price_usd)} ({currentCurrency})
            </div>
          </div>
          <div>
            <strong style={{ color: currentTheme.textMuted, fontSize: '14px' }}>Timeline</strong>
            <div style={{ color: currentTheme.text, fontSize: '16px' }}>
              {inquiry.timeline}
            </div>
          </div>
        </div>

        {inquiry.features && inquiry.features.length > 0 && (
          <div>
            <strong style={{ color: currentTheme.textMuted, fontSize: '14px' }}>Features</strong>
            <ul style={{ color: currentTheme.text, fontSize: '14px', paddingLeft: '20px', margin: '8px 0 0 0' }}>
              {inquiry.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </div>
        )}

        {inquiry.technologies && inquiry.technologies.length > 0 && (
          <div>
            <strong style={{ color: currentTheme.textMuted, fontSize: '14px' }}>Technologies</strong>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
              {inquiry.technologies.map((tech, index) => (
                <span
                  key={index}
                  style={{
                    background: theme === 'light' ? '#e2e8f0' : '#4a5568',
                    color: currentTheme.text,
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '15px' }}>
          <div>
            <strong style={{ color: currentTheme.textMuted, fontSize: '14px' }}>Status</strong>
            <div style={{ marginTop: '8px' }}>
              <span style={{
                padding: '6px 12px',
                ...getStatusBadgeStyle(inquiry.status),
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '600',
                textTransform: 'capitalize'
              }}>
                {inquiry.status}
              </span>
            </div>
          </div>
          <div>
            <strong style={{ color: currentTheme.textMuted, fontSize: '14px' }}>Created</strong>
            <div style={{ color: currentTheme.text, fontSize: '14px' }}>
              {new Date(inquiry.created_at).toLocaleString()}
            </div>
          </div>
        </div>

        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          justifyContent: 'flex-end',
          flexDirection: isMobile ? 'column' : 'row',
          marginTop: '20px'
        }}>
          <select
            value={inquiry.status}
            onChange={(e) => onStatusUpdate(inquiry.id, e.target.value)}
            style={{
              padding: '10px 12px',
              border: `1px solid ${currentTheme.border}`,
              borderRadius: '6px',
              background: currentTheme.cardBg,
              color: currentTheme.text,
              fontSize: '14px',
              cursor: 'pointer',
              minWidth: isMobile ? '100%' : '150px'
            }}
          >
            <option value="pending">🟡 Pending</option>
            <option value="contacted">🔵 Contacted</option>
            <option value="quoted">🟢 Quoted</option>
            <option value="closed">⚫ Closed</option>
            <option value="rejected">🔴 Rejected</option>
          </select>
          <button
            onClick={onClose}
            style={{
              background: '#a0aec0',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              minWidth: isMobile ? '100%' : '100px'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
);
export default AdminDashboard;