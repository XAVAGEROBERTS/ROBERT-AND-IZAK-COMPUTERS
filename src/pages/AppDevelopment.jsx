import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AppDevelopment = ({ currentLanguage, user }) => {
  const [selectedService, setSelectedService] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredButton, setHoveredButton] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [loadingService, setLoadingService] = useState(null);

  // Exchange rate: 1 USD = 3700 UGX
  const exchangeRate = 3700;

  // Calculate UGX price from USD
  const calculateUGX = (usdPrice) => {
    return Math.round(usdPrice * exchangeRate);
  };

  // Format UGX price with commas
  const formatUGX = (usdPrice) => {
    const ugxPrice = calculateUGX(usdPrice);
    return `UGX ${ugxPrice.toLocaleString()}`;
  };

  // Format USD price
  const formatUSD = (usdPrice) => {
    return `$${usdPrice.toLocaleString()}`;
  };

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const appServices = [
    {
      id: "app_ios_1",
      title: "📱 iOS Applications",
      description: "Native iOS apps built with Swift and SwiftUI for iPhones and iPads",
      features: [
        "Native iOS Development",
        "Swift & SwiftUI",
        "App Store Deployment",
        "Push Notifications",
        "Apple Pay Integration",
        "ARKit & Core ML",
        "iOS Widgets"
      ],
      priceUSD: 2500,
      priceUGX: calculateUGX(2500),
      timeline: "4-6 weeks",
      technologies: ["Swift", "SwiftUI", "Xcode", "iOS SDK"],
      icon: "📱"
    },
    {
      id: "app_android_2",
      title: "🤖 Android Applications",
      description: "Native Android apps built with Kotlin and Jetpack Compose",
      features: [
        "Native Android Development",
        "Kotlin & Java",
        "Google Play Deployment",
        "Material Design",
        "Google Pay Integration",
        "Android Widgets",
        "Background Services"
      ],
      priceUSD: 2200,
      priceUGX: calculateUGX(2200),
      timeline: "4-6 weeks",
      technologies: ["Kotlin", "Jetpack Compose", "Android Studio", "Android SDK"],
      icon: "🤖"
    },
    {
      id: "app_cross_platform_3",
      title: "🔄 Cross-Platform Apps",
      description: "Single codebase apps that run on both iOS and Android",
      features: [
        "React Native Development",
        "Single Codebase",
        "iOS & Android Support",
        "Faster Development",
        "Cost Effective",
        "Native Performance",
        "Over-the-Air Updates"
      ],
      priceUSD: 3500,
      priceUGX: calculateUGX(3500),
      timeline: "6-8 weeks",
      technologies: ["React Native", "JavaScript", "Expo", "Firebase"],
      icon: "🔄"
    },
    {
      id: "app_desktop_4",
      title: "💻 Desktop Applications",
      description: "Cross-platform desktop apps for Windows, macOS, and Linux",
      features: [
        "Electron Framework",
        "Windows, macOS, Linux",
        "Native System Integration",
        "Auto Updates",
        "System Tray Apps",
        "File System Access",
        "Hardware Integration"
      ],
      priceUSD: 2800,
      priceUGX: calculateUGX(2800),
      timeline: "5-7 weeks",
      technologies: ["Electron", "JavaScript", "Node.js", "Web Technologies"],
      icon: "💻"
    },
    {
      id: "app_games_5",
      title: "🎮 Game Development",
      description: "Mobile games and interactive applications with engaging UX",
      features: [
        "2D & 3D Games",
        "Unity Engine",
        "Physics & Animation",
        "Multiplayer Support",
        "In-App Purchases",
        "Ad Integration",
        "Game Analytics"
      ],
      priceUSD: 5000,
      priceUGX: calculateUGX(5000),
      timeline: "8-12 weeks",
      technologies: ["Unity", "C#", "Blender", "Game Services"],
      icon: "🎮"
    },
    {
      id: "app_maintenance_6",
      title: "🔧 App Maintenance",
      description: "Ongoing support, updates, and maintenance for existing applications",
      features: [
        "Bug Fixes & Updates",
        "Performance Optimization",
        "Security Updates",
        "OS Compatibility",
        "Feature Additions",
        "App Store Compliance",
        "24/7 Monitoring"
      ],
      priceUSD: 100,
      priceUGX: calculateUGX(100),
      timeline: "Ongoing",
      technologies: ["Various", "Monitoring Tools", "CI/CD", "Analytics"],
      icon: "🔧",
      isMonthly: true
    }
  ];

  // Generate service inquiry number
  const generateInquiryNumber = () => {
    const timestamp = new Date().getTime().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `RIA${timestamp}${random}`;
  };

  // Save service inquiry to database - FIXED VERSION
  const saveServiceInquiry = async (service) => {
    try {
      const inquiryData = {
        inquiry_number: generateInquiryNumber(),
        service_type: 'app_development',
        service_id: service.id,
        service_name: service.title,
        service_description: service.description,
        price_usd: service.priceUSD.toString(),
        price_ugx: service.priceUGX,
        timeline: service.timeline,
        features: service.features,
        technologies: service.technologies,
        status: 'pending',
        whatsapp_message_sent: false,
        customer_id: user?.id || null
      };

      console.log('Saving inquiry data:', inquiryData);

      const { data, error } = await supabase
        .from('service_inquiries')
        .insert([inquiryData])
        .select();

      if (error) {
        console.error('Supabase error details:', error);
        throw error;
      }

      console.log('✅ Service inquiry saved successfully:', data);
      return data[0];
    } catch (error) {
      console.error('❌ Error saving service inquiry to database:', error);
      throw error;
    }
  };

  // Update inquiry after WhatsApp message is sent
  const updateInquiryWhatsAppStatus = async (inquiryId) => {
    try {
      const { error } = await supabase
        .from('service_inquiries')
        .update({ 
          whatsapp_message_sent: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', inquiryId);

      if (error) throw error;
      console.log('✅ WhatsApp status updated for inquiry:', inquiryId);
    } catch (error) {
      console.error('Error updating inquiry WhatsApp status:', error);
    }
  };

  const handleWhatsAppOrder = async (service) => {
    setLoadingService(service.id);
    
    try {
      const savedInquiry = await saveServiceInquiry(service);
      console.log('✅ App service inquiry saved to database:', savedInquiry);

      const priceSuffix = service.isMonthly ? '/month' : '';
      const message = `📱 NEW APP DEVELOPMENT INQUIRY - ROBERT & IZAK COMPUTERS 📱\n\n` +
                     `📋 INQUIRY #: ${savedInquiry.inquiry_number}\n` +
                     `━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
                     `🎯 APP SERVICE REQUESTED:\n` +
                     `• ${service.title}\n` +
                     `• Price: ${formatUGX(service.priceUSD)}${priceSuffix} (${formatUSD(service.priceUSD)}${priceSuffix})\n` +
                     `• Timeline: ${service.timeline}\n\n` +
                     `📝 SERVICE DESCRIPTION:\n` +
                     `${service.description}\n\n` +
                     `⚙️ TECHNOLOGIES:\n` +
                     `${service.technologies.join(', ')}\n\n` +
                     `✨ KEY FEATURES:\n` +
                     `${service.features.slice(0, 5).map(feature => `• ${feature}`).join('\n')}\n` +
                     `${service.features.length > 5 ? `• ...and ${service.features.length - 5} more features` : ''}\n\n` +
                     `📱 PLATFORM SUPPORT:\n` +
                     `${service.title.includes('iOS') ? '• 📱 iOS (iPhone & iPad)' : ''}\n` +
                     `${service.title.includes('Android') ? '• 🤖 Android' : ''}\n` +
                     `${service.title.includes('Cross-Platform') ? '• 🔄 iOS & Android' : ''}\n` +
                     `${service.title.includes('Desktop') ? '• 💻 Windows, macOS, Linux' : ''}\n` +
                     `${service.title.includes('Game') ? '• 🎮 Mobile Games' : ''}\n\n` +
                     `💬 NEXT STEPS:\n` +
                     `• We'll discuss your app requirements\n` +
                     `• Provide detailed project timeline\n` +
                     `• Discuss app store deployment\n` +
                     `• Start development process\n\n` +
                     `📞 CONTACT INFO:\n` +
                     `• Inquiry #: ${savedInquiry.inquiry_number}\n` +
                     `• Service: ${service.title}\n\n` +
                     `Thank you for choosing our app development services! 🚀`;

      const encodedMessage = encodeURIComponent(message);
      const phoneNumber = "+256765673373";
      
      window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
      await updateInquiryWhatsAppStatus(savedInquiry.id);

    } catch (error) {
      console.error('❌ Error processing app service inquiry:', error);
      alert('There was an error saving your inquiry. Please try again.');
    } finally {
      setLoadingService(null);
    }
  };

  const openServiceModal = (service) => {
    setSelectedService(service);
  };

  const closeModal = () => {
    setSelectedService(null);
  };

  // Complete Styles
  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: isMobile ? '1rem 0.5rem' : '1.5rem 1rem',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
    },
    hero: {
      padding: isMobile ? '1.5rem 0.5rem' : '2rem 1rem',
      textAlign: 'center',
      color: 'white',
      background: 'rgba(0, 0, 0, 0.3)',
      backdropFilter: 'blur(10px)',
      marginBottom: '1.5rem',
      borderRadius: '15px'
    },
    heroTitle: {
      fontSize: isMobile ? '1.8rem' : '2.5rem',
      marginBottom: '0.5rem',
      background: 'linear-gradient(135deg, #fff 0%, #f0f0f0 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      fontWeight: '700',
      letterSpacing: '-0.5px',
      textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
    },
    heroSubtitle: {
      fontSize: isMobile ? '0.9rem' : '1.1rem',
      marginBottom: '1rem',
      opacity: '0.9',
      maxWidth: '500px',
      marginLeft: 'auto',
      marginRight: 'auto',
      lineHeight: '1.5'
    },
    statsContainer: {
      display: 'flex',
      justifyContent: 'center',
      gap: isMobile ? '1rem' : '2rem',
      marginTop: '1rem',
      flexWrap: isMobile ? 'wrap' : 'nowrap'
    },
    stat: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    },
    statNumber: {
      fontSize: isMobile ? '1.5rem' : '2rem',
      fontWeight: 'bold',
      marginBottom: '0.3rem'
    },
    statLabel: {
      fontSize: isMobile ? '0.7rem' : '0.8rem',
      opacity: '0.8'
    },
    servicesSection: {
      padding: isMobile ? '1rem 0.5rem' : '1.5rem 1rem',
      maxWidth: '1200px',
      margin: '0 auto'
    },
    sectionHeader: {
      textAlign: 'center',
      marginBottom: isMobile ? '1.5rem' : '2rem',
      color: 'white'
    },
    sectionTitle: {
      fontSize: isMobile ? '1.5rem' : '2rem',
      marginBottom: '0.5rem'
    },
    sectionSubtitle: {
      fontSize: isMobile ? '0.9rem' : '1rem',
      opacity: '0.9'
    },
    servicesGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(320px, 1fr))',
      gap: isMobile ? '1rem' : '1.5rem'
    },
    serviceCard: {
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      borderRadius: '15px',
      padding: isMobile ? '1.2rem' : '1.5rem',
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
      transition: 'all 0.3s ease',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      cursor: 'pointer'
    },
    serviceCardHover: {
      transform: 'translateY(-3px)',
      boxShadow: '0 15px 35px rgba(0, 0, 0, 0.25)'
    },
    serviceHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '0.8rem'
    },
    serviceTitle: {
      fontSize: isMobile ? '1.1rem' : '1.3rem',
      margin: '0',
      flex: '1',
      color: '#1f2937',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    servicePrice: {
      background: 'linear-gradient(135deg, #f59e0b, #d97706)',
      color: 'white',
      padding: isMobile ? '0.3rem 0.7rem' : '0.4rem 0.8rem',
      borderRadius: '15px',
      fontWeight: 'bold',
      fontSize: isMobile ? '0.75rem' : '0.8rem',
      textAlign: 'center',
      lineHeight: '1.2'
    },
    serviceDescription: {
      color: '#6b7280',
      marginBottom: '1rem',
      lineHeight: '1.5',
      fontSize: isMobile ? '0.85rem' : '0.9rem'
    },
    serviceTimeline: {
      marginBottom: '1rem'
    },
    timelineBadge: {
      background: '#fbbf24',
      color: '#78350f',
      padding: isMobile ? '0.3rem 0.7rem' : '0.3rem 0.8rem',
      borderRadius: '12px',
      fontSize: isMobile ? '0.7rem' : '0.75rem',
      fontWeight: '600'
    },
    serviceFeatures: {
      marginBottom: '1rem'
    },
    featuresTitle: {
      color: '#374151',
      marginBottom: '0.5rem',
      fontSize: isMobile ? '0.9rem' : '1rem'
    },
    featuresList: {
      listStyle: 'none',
      padding: '0',
      margin: '0'
    },
    featureItem: {
      padding: '0.2rem 0',
      color: '#4b5563',
      fontSize: isMobile ? '0.75rem' : '0.8rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.4rem'
    },
    serviceTechnologies: {
      marginBottom: '1.2rem'
    },
    technologiesTitle: {
      color: '#374151',
      marginBottom: '0.5rem',
      fontSize: isMobile ? '0.9rem' : '1rem'
    },
    techTags: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.4rem'
    },
    techTag: {
      background: '#e5e7eb',
      color: '#374151',
      padding: isMobile ? '0.2rem 0.5rem' : '0.25rem 0.6rem',
      borderRadius: '10px',
      fontSize: isMobile ? '0.7rem' : '0.75rem',
      fontWeight: '500'
    },
    serviceActions: {
      display: 'flex',
      gap: '0.8rem'
    },
    btnWhatsapp: {
      background: 'linear-gradient(135deg, #25d366, #128c7e)',
      color: 'white',
      padding: isMobile ? '0.6rem 1rem' : '0.7rem 1.2rem',
      border: 'none',
      borderRadius: '8px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      flex: '1',
      fontSize: isMobile ? '0.8rem' : '0.85rem',
      minHeight: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem'
    },
    btnWhatsappHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 5px 15px rgba(37, 211, 102, 0.4)'
    },
    btnLoading: {
      opacity: '0.7',
      cursor: 'not-allowed'
    },
    ctaSection: {
      background: 'rgba(0, 0, 0, 0.3)',
      backdropFilter: 'blur(10px)',
      padding: isMobile ? '1.5rem 0.5rem' : '2rem 1rem',
      textAlign: 'center',
      color: 'white',
      marginTop: '2rem',
      borderRadius: '15px'
    },
    ctaTitle: {
      fontSize: isMobile ? '1.3rem' : '1.8rem',
      marginBottom: '0.5rem'
    },
    ctaText: {
      fontSize: isMobile ? '0.9rem' : '1rem',
      marginBottom: '1.5rem',
      opacity: '0.9'
    },
    btnCta: {
      background: 'linear-gradient(135deg, #25d366, #128c7e)',
      color: 'white',
      fontSize: isMobile ? '0.9rem' : '1rem',
      padding: isMobile ? '0.8rem 1.5rem' : '0.9rem 1.8rem',
      border: 'none',
      borderRadius: '10px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      marginBottom: '1rem'
    },
    btnCtaHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 20px rgba(37, 211, 102, 0.4)'
    },
    contactInfo: {
      fontSize: isMobile ? '0.8rem' : '0.9rem'
    },
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      padding: isMobile ? '1rem' : '1.5rem'
    },
    modalContent: {
      background: 'white',
      borderRadius: '15px',
      padding: isMobile ? '1.5rem' : '2rem',
      maxWidth: '500px',
      width: '100%',
      maxHeight: '85vh',
      overflowY: 'auto',
      position: 'relative',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)'
    },
    modalClose: {
      position: 'absolute',
      top: '0.8rem',
      right: '0.8rem',
      background: 'none',
      border: 'none',
      fontSize: '1.5rem',
      cursor: 'pointer',
      color: '#6b7280',
      width: '35px',
      height: '35px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    modalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '1rem'
    },
    modalTitle: {
      fontSize: isMobile ? '1.3rem' : '1.6rem',
      margin: 0,
      flex: 1,
      color: '#1f2937',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    modalPrice: {
      background: 'linear-gradient(135deg, #f59e0b, #d97706)',
      color: 'white',
      padding: '0.4rem 0.8rem',
      borderRadius: '15px',
      fontWeight: 'bold',
      fontSize: '0.9rem',
      textAlign: 'center',
      lineHeight: '1.2'
    },
    modalDescription: {
      color: '#6b7280',
      fontSize: isMobile ? '0.9rem' : '1rem',
      lineHeight: '1.5',
      marginBottom: '1.5rem'
    },
    modalDetails: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.2rem'
    },
    detailSection: {
      marginBottom: '0.8rem'
    },
    detailTitle: {
      color: '#374151',
      marginBottom: '0.5rem',
      fontSize: isMobile ? '1rem' : '1.1rem'
    },
    modalActions: {
      marginTop: '1.5rem'
    },
    btnWhatsappLarge: {
      background: 'linear-gradient(135deg, #25d366, #128c7e)',
      color: 'white',
      fontSize: isMobile ? '0.9rem' : '1rem',
      padding: isMobile ? '0.9rem 1.5rem' : '1rem 1.8rem',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      width: '100%',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem'
    }
  };

  return (
    <div style={styles.container}>
      {/* Compact Hero Section */}
      <div style={styles.hero}>
        <div>
          <h1 style={styles.heroTitle}>App Development Services</h1>
          <p style={styles.heroSubtitle}>
            Mobile and desktop applications built with cutting-edge technologies
          </p>
          <div style={styles.statsContainer}>
            <div style={styles.stat}>
              <span style={styles.statNumber}>100+</span>
              <span style={styles.statLabel}>Apps Built</span>
            </div>
            <div style={styles.stat}>
              <span style={styles.statNumber}>4.8★</span>
              <span style={styles.statLabel}>Store Rating</span>
            </div>
            <div style={styles.stat}>
              <span style={styles.statNumber}>24/7</span>
              <span style={styles.statLabel}>Support</span>
            </div>
          </div>
        </div>
      </div>

      {/* Compact Services Section */}
      <div style={styles.servicesSection}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Our App Development Services</h2>
          <p style={styles.sectionSubtitle}>Native and cross-platform solutions for all devices</p>
        </div>

        <div style={styles.servicesGrid}>
          {appServices.map(service => {
            const priceSuffix = service.isMonthly ? '/month' : '';
            return (
              <div 
                key={service.id} 
                style={{
                  ...styles.serviceCard,
                  ...(hoveredCard === service.id && styles.serviceCardHover)
                }}
                onMouseEnter={() => !isMobile && setHoveredCard(service.id)}
                onMouseLeave={() => !isMobile && setHoveredCard(null)}
                onClick={() => openServiceModal(service)}
              >
                <div style={styles.serviceHeader}>
                  <h3 style={styles.serviceTitle}>
                    <span>{service.icon}</span>
                    {service.title}
                  </h3>
                  <div style={styles.servicePrice}>
                    <div>{formatUGX(service.priceUSD)}{priceSuffix}</div>
                    <div style={{ fontSize: '0.7rem', opacity: '0.9' }}>{formatUSD(service.priceUSD)}{priceSuffix}</div>
                  </div>
                </div>
                
                <p style={styles.serviceDescription}>{service.description}</p>
                
                <div style={styles.serviceTimeline}>
                  <span style={styles.timelineBadge}>⏱️ {service.timeline}</span>
                </div>

                <div style={styles.serviceFeatures}>
                  <h4 style={styles.featuresTitle}>Features:</h4>
                  <ul style={styles.featuresList}>
                    {service.features.slice(0, 4).map((feature, index) => (
                      <li key={index} style={styles.featureItem}>
                        <span>✓</span> {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div style={styles.serviceTechnologies}>
                  <h4 style={styles.technologiesTitle}>Technologies:</h4>
                  <div style={styles.techTags}>
                    {service.technologies.slice(0, 3).map((tech, index) => (
                      <span key={index} style={styles.techTag}>{tech}</span>
                    ))}
                    {service.technologies.length > 3 && (
                      <span style={styles.techTag}>+{service.technologies.length - 3} more</span>
                    )}
                  </div>
                </div>

                <div style={styles.serviceActions}>
                  <button 
                    style={{
                      ...styles.btnWhatsapp,
                      ...(hoveredButton === service.id && styles.btnWhatsappHover),
                      ...(loadingService === service.id && styles.btnLoading)
                    }}
                    onMouseEnter={() => !isMobile && setHoveredButton(service.id)}
                    onMouseLeave={() => !isMobile && setHoveredButton(null)}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleWhatsAppOrder(service);
                    }}
                    disabled={loadingService === service.id}
                  >
                    {loadingService === service.id ? (
                      <>
                        <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⏳</span>
                        Saving...
                      </>
                    ) : (
                      <>
                        💬 Order Now
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Compact CTA Section */}
      <div style={styles.ctaSection}>
        <div>
          <h2 style={styles.ctaTitle}>Ready to Build Your App?</h2>
          <p style={styles.ctaText}>Contact us today for a free consultation and project quote</p>
          <button 
            style={styles.btnCta}
            onMouseEnter={(e) => !isMobile && (e.target.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => !isMobile && (e.target.style.transform = 'translateY(0)')}
            onClick={() => handleWhatsAppOrder({ 
              id: 'consultation', 
              title: 'App Development Consultation',
              description: 'Free consultation for app development services',
              priceUSD: 0,
              priceUGX: 0,
              timeline: '1-2 days',
              features: ['App concept discussion', 'Platform selection', 'Quote preparation', 'Timeline estimation'],
              technologies: ['Consultation']
            })}
          >
            📱 Start Conversation
          </button>
          <div style={styles.contactInfo}>
            <p>📞 +256 765673373</p>
            <p>💬 Message us directly on WhatsApp</p>
          </div>
        </div>
      </div>

      {/* Service Detail Modal */}
      {selectedService && (
        <div style={styles.modalOverlay} onClick={closeModal}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button style={styles.modalClose} onClick={closeModal}>×</button>
            
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                <span>{selectedService.icon}</span>
                {selectedService.title}
              </h2>
              <div style={styles.modalPrice}>
                <div>{formatUGX(selectedService.priceUSD)}{selectedService.isMonthly ? '/month' : ''}</div>
                <div style={{ fontSize: '0.8rem', opacity: '0.9' }}>{formatUSD(selectedService.priceUSD)}{selectedService.isMonthly ? '/month' : ''}</div>
              </div>
            </div>

            <p style={styles.modalDescription}>{selectedService.description}</p>

            <div style={styles.modalDetails}>
              <div style={styles.detailSection}>
                <h4 style={styles.detailTitle}>📋 Features Include:</h4>
                <ul style={styles.featuresList}>
                  {selectedService.features.map((feature, index) => (
                    <li key={index} style={styles.featureItem}>
                      <span>✓</span> {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div style={styles.detailSection}>
                <h4 style={styles.detailTitle}>⚙️ Technologies:</h4>
                <div style={styles.techTags}>
                  {selectedService.technologies.map((tech, index) => (
                    <span key={index} style={styles.techTag}>{tech}</span>
                  ))}
                </div>
              </div>

              <div style={styles.detailSection}>
                <h4 style={styles.detailTitle}>⏰ Timeline:</h4>
                <p>{selectedService.timeline}</p>
              </div>

              <div style={styles.detailSection}>
                <h4 style={styles.detailTitle}>📱 Platform Support:</h4>
                <div style={styles.techTags}>
                  {selectedService.title.includes('iOS') && <span style={styles.techTag}>📱 iOS</span>}
                  {selectedService.title.includes('Android') && <span style={styles.techTag}>🤖 Android</span>}
                  {selectedService.title.includes('Cross-Platform') && <span style={styles.techTag}>🔄 Cross-Platform</span>}
                  {selectedService.title.includes('Desktop') && <span style={styles.techTag}>💻 Desktop</span>}
                  {selectedService.title.includes('Game') && <span style={styles.techTag}>🎮 Gaming</span>}
                </div>
              </div>
            </div>

            <div style={styles.modalActions}>
              <button 
                style={{
                  ...styles.btnWhatsappLarge,
                  ...(loadingService === selectedService.id && styles.btnLoading)
                }}
                onMouseEnter={(e) => !isMobile && (e.target.style.transform = 'translateY(-2px)')}
                onMouseLeave={(e) => !isMobile && (e.target.style.transform = 'translateY(0)')}
                onClick={() => {
                  handleWhatsAppOrder(selectedService);
                  closeModal();
                }}
                disabled={loadingService === selectedService.id}
              >
                {loadingService === selectedService.id ? (
                  <>
                    <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⏳</span>
                    Saving to Database...
                  </>
                ) : (
                  <>
                    💬 Order via WhatsApp
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AppDevelopment;