import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, Mail, Phone, MessageSquare, Clock, Shield, Truck, RotateCcw, 
  CreditCard, Globe, ChevronRight, Search, FileText, Headphones, Settings, 
  User, Star, ChevronDown, MapPin, ShoppingCart, X, ExternalLink, Download,
  Calendar, Package, AlertCircle, CheckCircle, MessageCircle
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const CustomerServicePage = ({
  user,
  onSignOut,
  currentLanguage,
  currentCurrency,
  cartItemCount,
  onCartClick,
  setCurrentPage
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // State variables
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [techIssues, setTechIssues] = useState([]);
  const [showLiveChat, setShowLiveChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailForm, setEmailForm] = useState({
    subject: '',
    message: '',
    priority: 'normal'
  });
  const [showRepairForm, setShowRepairForm] = useState(false);
  const [repairForm, setRepairForm] = useState({
    productName: '',
    serialNumber: '',
    issue: '',
    preferredDate: '',
    contactPhone: ''
  });
  const [drivers, setDrivers] = useState([]);
  const [stores, setStores] = useState([]);
  const [warrantyInfo, setWarrantyInfo] = useState(null);
  const [activeSupportTicket, setActiveSupportTicket] = useState(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketMessages, setTicketMessages] = useState([]);

  // Load customer data
  useEffect(() => {
    if (user) {
      loadCustomerData();
      loadSupportTickets();
    }
  }, [user]);

  const loadCustomerData = async () => {
    try {
      // Load customer orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });

      if (!ordersError && ordersData) {
        setOrders(ordersData);
      }

      // Load warranty information
      const { data: warrantyData, error: warrantyError } = await supabase
        .from('warranties')
        .select('*')
        .eq('customer_id', user.id);

      if (!warrantyError && warrantyData && warrantyData.length > 0) {
        setWarrantyInfo(warrantyData[0]);
      }

      // Load technical support tickets
      const { data: ticketsData, error: ticketsError } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });

      if (!ticketsError && ticketsData) {
        setTechIssues(ticketsData);
      }

      // Load latest drivers (from a public table or API)
      const latestDrivers = [
        { id: 1, name: 'NVIDIA GeForce RTX 40 Series Driver', version: '551.86', date: '2024-03-05', size: '850 MB' },
        { id: 2, name: 'AMD Radeon Adrenalin Edition', version: '24.2.1', date: '2024-03-01', size: '720 MB' },
        { id: 3, name: 'Intel Graphics Driver', version: '31.0.101.5522', date: '2024-02-28', size: '650 MB' },
        { id: 4, name: 'Realtek Audio Driver', version: '6.0.9600.235', date: '2024-02-25', size: '120 MB' },
      ];
      setDrivers(latestDrivers);

      // Load store locations - UPDATED WITH YOUR CONTACT
      const storeLocations = [
        { id: 1, name: 'Kampala Main Store', address: 'Shop 12, Garden City Mall, Kampala', phone: '+256 765673373', hours: '9 AM - 9 PM' },
        { id: 2, name: 'Entebbe Service Center', address: 'Plot 45, Entebbe Road', phone: '+256 765673373', hours: '8 AM - 8 PM' },
        { id: 3, name: 'Jinja Branch', address: 'Main Street, Jinja', phone: '+256 765673373', hours: '9 AM - 7 PM' },
        { id: 4, name: 'Mbale Tech Hub', address: 'Commercial Street, Mbale', phone: '+256 765673373', hours: '8 AM - 6 PM' },
      ];
      setStores(storeLocations);

    } catch (error) {
      console.error('Error loading customer data:', error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const loadSupportTickets = async () => {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*, ticket_messages(*)')
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setTechIssues(data);
      }
    } catch (error) {
      console.error('Error loading support tickets:', error);
    }
  };

  // Helper function to get translation
  const t = (key) => {
    const translations = {
      en: {
        pageTitle: "Customer Service",
        welcomeMessage: "How can we help you?",
        searchPlaceholder: "Search help topics",
        myOrders: "My Orders",
        shippingDelivery: "Shipping & Delivery",
        returnsRefunds: "Returns & Refunds",
        accountSecurity: "Account & Security",
        paymentsPricing: "Payments & Pricing",
        productSupport: "Product Support",
        quickLinks: "Quick Links",
        trackOrder: "Track Your Order",
        startReturn: "Start a Return",
        cancelOrder: "Cancel an Order",
        updateAddress: "Update Your Address",
        changePayment: "Change Payment Method",
        contactSupport: "Contact Support",
        faqs: "FAQs",
        liveChat: "Live Chat",
        callUs: "Call Us",
        emailUs: "Email Us",
        storeLocator: "Store Locator",
        warrantyInfo: "Warranty Information",
        repairServices: "Repair Services",
        techSupport: "Technical Support",
        driverDownloads: "Driver Downloads",
        customPCBuilder: "Custom PC Builder",
        businessHours: "Business Hours",
        hoursDescription: "Monday - Friday: 8am - 8pm EAT\nSaturday: 9am - 6pm EAT\nSunday: 10am - 5pm EAT",
        emergencySupport: "24/7 Emergency Tech Support",
        emergencyNumber: "+256 765673373", // UPDATED WITH YOUR NUMBER
        needImmediateHelp: "Need Immediate Help?",
        chatDescription: "Chat with our support team in real-time",
        callDescription: "Speak directly with a customer service representative",
        emailDescription: "Send us an email and we'll respond within 24 hours",
        backToHome: "Back to Home",
        viewAccount: "View Account",
        signOut: "Sign Out",
        // Order status
        orderPlaced: "Order Placed",
        processing: "Processing",
        shipped: "Shipped",
        delivered: "Delivered",
        cancelled: "Cancelled",
        // Warranty
        activeWarranty: "Active Warranty",
        expiredWarranty: "Warranty Expired",
        warrantyExpires: "Warranty Expires",
        // Technical support
        openTicket: "Open Ticket",
        resolved: "Resolved",
        inProgress: "In Progress",
        // Actions
        viewDetails: "View Details",
        download: "Download",
        callNow: "Call Now",
        sendMessage: "Send Message",
        startChat: "Start Chat",
        submitTicket: "Submit Ticket",
        scheduleRepair: "Schedule Repair",
        // Forms
        subject: "Subject",
        message: "Message",
        priority: "Priority",
        normal: "Normal",
        high: "High",
        urgent: "Urgent",
        send: "Send",
        cancel: "Cancel",
        // Repair form
        productName: "Product Name",
        serialNumber: "Serial Number",
        issueDescription: "Issue Description",
        preferredDate: "Preferred Date",
        contactPhone: "Contact Phone Number",
        schedule: "Schedule Repair",
        // Live chat
        typeMessage: "Type your message...",
        agentTyping: "Agent is typing...",
        endChat: "End Chat",
        // No data messages
        noOrders: "No orders found",
        noTickets: "No support tickets",
        noWarranty: "No warranty information found",
        // Benefits
        loginBenefits: {
          secure: "Secure access to your orders and returns",
          personalized: "Personalized technical support",
          faster: "Faster assistance with saved details",
          repair: "Access to repair and warranty services"
        }
      },
      es: {
        pageTitle: "Servicio al Cliente",
        welcomeMessage: "¿Cómo podemos ayudarte?",
        searchPlaceholder: "Buscar temas de ayuda",
        myOrders: "Mis Pedidos",
        shippingDelivery: "Envío y Entrega",
        returnsRefunds: "Devoluciones y Reembolsos",
        accountSecurity: "Cuenta y Seguridad",
        paymentsPricing: "Pagos y Precios",
        productSupport: "Soporte de Productos",
        quickLinks: "Enlaces Rápidos",
        trackOrder: "Rastrear Tu Pedido",
        startReturn: "Iniciar una Devolución",
        cancelOrder: "Cancelar un Pedido",
        updateAddress: "Actualizar Tu Dirección",
        changePayment: "Cambiar Método de Pago",
        contactSupport: "Contactar Soporte",
        faqs: "Preguntas Frecuentes",
        liveChat: "Chat en Vivo",
        callUs: "Llámanos",
        emailUs: "Escríbenos",
        storeLocator: "Localizador de Tiendas",
        warrantyInfo: "Información de Garantía",
        repairServices: "Servicios de Reparación",
        techSupport: "Soporte Técnico",
        driverDownloads: "Descargas de Controladores",
        customPCBuilder: "Constructor de PC Personalizado",
        businessHours: "Horario Comercial",
        hoursDescription: "Lunes - Viernes: 8am - 8pm EAT\nSábado: 9am - 6pm EAT\nDomingo: 10am - 5pm EAT",
        emergencySupport: "Soporte Técnico de Emergencia 24/7",
        emergencyNumber: "+256 765673373", // UPDATED WITH YOUR NUMBER
        needImmediateHelp: "¿Necesitas Ayuda Inmediata?",
        chatDescription: "Chatea con nuestro equipo de soporte en tiempo real",
        callDescription: "Habla directamente con un representante de servicio al cliente",
        emailDescription: "Envíanos un correo y responderemos dentro de 24 horas",
        backToHome: "Volver al Inicio",
        viewAccount: "Ver Cuenta",
        signOut: "Cerrar Sesión",
        // Order status
        orderPlaced: "Pedido Realizado",
        processing: "Procesando",
        shipped: "Enviado",
        delivered: "Entregado",
        cancelled: "Cancelado",
        // Warranty
        activeWarranty: "Garantía Activa",
        expiredWarranty: "Garantía Expirada",
        warrantyExpires: "La garantía expira",
        // Technical support
        openTicket: "Ticket Abierto",
        resolved: "Resuelto",
        inProgress: "En Progreso",
        // Actions
        viewDetails: "Ver Detalles",
        download: "Descargar",
        callNow: "Llamar Ahora",
        sendMessage: "Enviar Mensaje",
        startChat: "Iniciar Chat",
        submitTicket: "Enviar Ticket",
        scheduleRepair: "Programar Reparación",
        // Forms
        subject: "Asunto",
        message: "Mensaje",
        priority: "Prioridad",
        normal: "Normal",
        high: "Alta",
        urgent: "Urgente",
        send: "Enviar",
        cancel: "Cancelar",
        // Repair form
        productName: "Nombre del Producto",
        serialNumber: "Número de Serie",
        issueDescription: "Descripción del Problema",
        preferredDate: "Fecha Preferida",
        contactPhone: "Número de Teléfono de Contacto",
        schedule: "Programar Reparación",
        // Live chat
        typeMessage: "Escribe tu mensaje...",
        agentTyping: "El agente está escribiendo...",
        endChat: "Terminar Chat",
        // No data messages
        noOrders: "No se encontraron pedidos",
        noTickets: "No hay tickets de soporte",
        noWarranty: "No se encontró información de garantía",
        // Benefits
        loginBenefits: {
          secure: "Acceso seguro a tus pedidos y devoluciones",
          personalized: "Soporte técnico personalizado",
          faster: "Asistencia más rápida con detalles guardados",
          repair: "Acceso a servicios de reparación y garantía"
        }
      },
      fr: {
        pageTitle: "Service Client",
        welcomeMessage: "Comment pouvons-nous vous aider?",
        searchPlaceholder: "Rechercher des sujets d'aide",
        myOrders: "Mes Commandes",
        shippingDelivery: "Expédition et Livraison",
        returnsRefunds: "Retours et Remboursements",
        accountSecurity: "Compte et Sécurité",
        paymentsPricing: "Paiements et Tarifs",
        productSupport: "Support Produit",
        quickLinks: "Liens Rapides",
        trackOrder: "Suivre Votre Commande",
        startReturn: "Démarrer un Retour",
        cancelOrder: "Annuler une Commande",
        updateAddress: "Mettre à Jour Votre Adresse",
        changePayment: "Changer le Mode de Paiement",
        contactSupport: "Contacter le Support",
        faqs: "FAQ",
        liveChat: "Chat en Direct",
        callUs: "Appelez-nous",
        emailUs: "Envoyez-nous un Email",
        storeLocator: "Localisateur de Magasins",
        warrantyInfo: "Informations sur la Garantie",
        repairServices: "Services de Réparation",
        techSupport: "Support Technique",
        driverDownloads: "Téléchargements de Pilotes",
        customPCBuilder: "Constructeur de PC Personnalisé",
        businessHours: "Heures d'Ouverture",
        hoursDescription: "Lundi - Vendredi: 8h - 20h EAT\nSamedi: 9h - 18h EAT\nDimanche: 10h - 17h EAT",
        emergencySupport: "Support Technique d'Urgence 24/7",
        emergencyNumber: "+256 765673373", // UPDATED WITH YOUR NUMBER
        needImmediateHelp: "Besoin d'Aide Immédiate?",
        chatDescription: "Discutez avec notre équipe de support en temps réel",
        callDescription: "Parlez directement avec un représentant du service client",
        emailDescription: "Envoyez-nous un email et nous répondrons sous 24 heures",
        backToHome: "Retour à l'Accueil",
        viewAccount: "Voir le Compte",
        signOut: "Se Déconnecter",
        // Order status
        orderPlaced: "Commande Passée",
        processing: "En Traitement",
        shipped: "Expédié",
        delivered: "Livré",
        cancelled: "Annulé",
        // Warranty
        activeWarranty: "Garantie Active",
        expiredWarranty: "Garantie Expirée",
        warrantyExpires: "La garantie expire",
        // Technical support
        openTicket: "Ticket Ouvert",
        resolved: "Résolu",
        inProgress: "En Cours",
        // Actions
        viewDetails: "Voir les Détails",
        download: "Télécharger",
        callNow: "Appeler Maintenant",
        sendMessage: "Envoyer un Message",
        startChat: "Démarrer le Chat",
        submitTicket: "Soumettre un Ticket",
        scheduleRepair: "Planifier une Réparation",
        // Forms
        subject: "Sujet",
        message: "Message",
        priority: "Priorité",
        normal: "Normal",
        high: "Élevée",
        urgent: "Urgent",
        send: "Envoyer",
        cancel: "Annuler",
        // Repair form
        productName: "Nom du Produit",
        serialNumber: "Numéro de Série",
        issueDescription: "Description du Problème",
        preferredDate: "Date Préférée",
        contactPhone: "Numéro de Téléphone",
        schedule: "Planifier la Réparation",
        // Live chat
        typeMessage: "Tapez votre message...",
        agentTyping: "L'agent est en train d'écrire...",
        endChat: "Terminer le Chat",
        // No data messages
        noOrders: "Aucune commande trouvée",
        noTickets: "Aucun ticket de support",
        noWarranty: "Aucune information de garantie trouvée",
        // Benefits
        loginBenefits: {
          secure: "Accès sécurisé à vos commandes et retours",
          personalized: "Support technique personnalisé",
          faster: "Assistance plus rapide avec les détails enregistrés",
          repair: "Accès aux services de réparation et garantie"
        }
      }
    };

    return translations[currentLanguage]?.[key] || translations.en[key];
  };

  // Real functions for customer service features
  const handleStartReturn = async (orderId) => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) {
        alert('Order not found');
        return;
      }

      const { data, error } = await supabase
        .from('returns')
        .insert([{
          order_id: orderId,
          customer_id: user.id,
          status: 'requested',
          requested_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      alert(`Return requested successfully for order #${orderId}. We will contact you within 24 hours.`);
    } catch (error) {
      console.error('Error creating return:', error);
      alert('Failed to request return. Please try again.');
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;

    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', orderId)
        .eq('customer_id', user.id);

      if (error) throw error;

      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: 'cancelled' } : order
      ));

      alert('Order cancelled successfully.');
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert('Failed to cancel order. Please try again.');
    }
  };

  const handleOpenLiveChat = () => {
    setShowLiveChat(true);
    setChatMessages([
      { id: 1, sender: 'agent', text: `Hello ${user.user_metadata?.first_name || 'there'}! How can I help you today?`, timestamp: new Date() }
    ]);
  };

  const handleSendChatMessage = () => {
    if (!newMessage.trim()) return;

    // Add user message
    const userMessage = {
      id: chatMessages.length + 1,
      sender: 'user',
      text: newMessage,
      timestamp: new Date()
    };
    setChatMessages([...chatMessages, userMessage]);
    setNewMessage('');

    // Simulate agent response after 2 seconds
    setTimeout(() => {
      const responses = [
        "I understand. Let me check that for you.",
        "Thanks for the information. I'll help you with that.",
        "I can assist you with that. One moment please.",
        "Let me look into that and get back to you.",
        "I need to check some details. Please wait a moment."
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      const agentMessage = {
        id: chatMessages.length + 2,
        sender: 'agent',
        text: randomResponse,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, agentMessage]);
    }, 2000);
  };

  const handleSendEmail = async () => {
    if (!emailForm.subject.trim() || !emailForm.message.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('support_emails')
        .insert([{
          customer_id: user.id,
          subject: emailForm.subject,
          message: emailForm.message,
          priority: emailForm.priority,
          status: 'pending'
        }])
        .select()
        .single();

      if (error) throw error;

      alert('Email sent successfully! We will respond within 24 hours.');
      setShowEmailForm(false);
      setEmailForm({ subject: '', message: '', priority: 'normal' });
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email. Please try again.');
    }
  };

  const handleScheduleRepair = async () => {
    if (!repairForm.productName.trim() || !repairForm.issue.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('repair_requests')
        .insert([{
          customer_id: user.id,
          product_name: repairForm.productName,
          serial_number: repairForm.serialNumber,
          issue: repairForm.issue,
          preferred_date: repairForm.preferredDate,
          contact_phone: repairForm.contactPhone || t('emergencyNumber'), // Use form number or default
          status: 'scheduled'
        }])
        .select()
        .single();

      if (error) throw error;

      alert('Repair scheduled successfully! We will contact you to confirm the appointment.');
      setShowRepairForm(false);
      setRepairForm({
        productName: '',
        serialNumber: '',
        issue: '',
        preferredDate: '',
        contactPhone: ''
      });
    } catch (error) {
      console.error('Error scheduling repair:', error);
      alert('Failed to schedule repair. Please try again.');
    }
  };

  const handleCreateSupportTicket = async () => {
    const subject = prompt('Please enter a brief description of your issue:');
    if (!subject) return;

    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .insert([{
          customer_id: user.id,
          subject: subject,
          status: 'open',
          priority: 'normal'
        }])
        .select()
        .single();

      if (error) throw error;

      alert('Support ticket created successfully! Ticket ID: ' + data.id);
      loadSupportTickets();
    } catch (error) {
      console.error('Error creating support ticket:', error);
      alert('Failed to create support ticket. Please try again.');
    }
  };

  const handleViewTicket = async (ticket) => {
    setActiveSupportTicket(ticket);
    setShowTicketModal(true);
    
    // Load ticket messages
    if (ticket.ticket_messages) {
      setTicketMessages(ticket.ticket_messages);
    } else {
      const { data, error } = await supabase
        .from('ticket_messages')
        .select('*')
        .eq('ticket_id', ticket.id)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setTicketMessages(data);
      }
    }
  };

  const handleSendTicketMessage = async () => {
    if (!newMessage.trim() || !activeSupportTicket) return;

    try {
      const { data, error } = await supabase
        .from('ticket_messages')
        .insert([{
          ticket_id: activeSupportTicket.id,
          sender: 'customer',
          message: newMessage,
          customer_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      setTicketMessages([...ticketMessages, data]);
      setNewMessage('');

      // Simulate agent response after 3 seconds
      setTimeout(async () => {
        const responses = [
          "Thank you for the information. We are looking into this.",
          "I understand the issue. Let me check our database.",
          "Thanks for providing those details. I'll escalate this if needed.",
          "I can help you with that. Let me gather more information."
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];

        const { data: agentMessage } = await supabase
          .from('ticket_messages')
          .insert([{
            ticket_id: activeSupportTicket.id,
            sender: 'agent',
            message: randomResponse
          }])
          .select()
          .single();

        if (agentMessage) {
          setTicketMessages(prev => [...prev, agentMessage]);
        }
      }, 3000);
    } catch (error) {
      console.error('Error sending ticket message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  const handleDownloadDriver = (driver) => {
    alert(`Downloading ${driver.name} v${driver.version}...\n\nThis is a demo. In production, this would download the actual driver file.`);
    // In production: window.location.href = driver.download_url;
  };

  const handleCallStore = (phone) => {
    // This will now use your number +256 765673373
    alert(`Calling ${phone}...\n\nThis is a demo. In production, this would initiate a phone call.`);
    // In production: window.location.href = `tel:${phone}`;
  };

  const handleBackToHome = () => {
    setCurrentPage('home');
    navigate('/home');
  };

  const handleViewAccount = () => {
    setCurrentPage('account');
    navigate('/account');
  };

  const handleSignIn = () => {
    setCurrentPage('signin');
    navigate(`/signin?redirect=${encodeURIComponent('/customer-service')}`);
  };

  const handleCreateAccount = () => {
    setCurrentPage('signin');
    navigate(`/signin?action=signup&redirect=${encodeURIComponent('/customer-service')}`);
  };

  // ========== LOGIN REQUIRED COMPONENT ==========
  if (!user) {
    return (
      <>
        <style jsx global>{`
          /* Customer Service Page Styles */
          .customer-service-page {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            font-family: "Amazon Ember", Arial, sans-serif;
          }

          /* Login Required Styling */
          .cs-login-required {
            max-width: 800px;
            margin: 50px auto;
            padding: 40px 20px;
            text-align: center;
          }

          .cs-login-header {
            margin-bottom: 40px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 20px;
          }

          .cs-login-header svg {
            color: #007185;
          }

          .cs-login-header h1 {
            font-size: 32px;
            color: #0F1111;
            margin: 0;
          }

          .cs-login-content {
            background: white;
            border: 1px solid #ddd;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          }

          .cs-login-message h2 {
            font-size: 24px;
            color: #0F1111;
            margin-bottom: 15px;
          }

          .cs-login-message p {
            font-size: 16px;
            color: #666;
            margin-bottom: 30px;
            line-height: 1.6;
            max-width: 600px;
            margin-left: auto;
            margin-right: auto;
          }

          .cs-login-benefits {
            max-width: 500px;
            margin: 40px auto;
            text-align: left;
          }

          .cs-benefit {
            display: flex;
            align-items: center;
            gap: 15px;
            margin-bottom: 20px;
            padding: 15px;
            border-radius: 8px;
            background: #f8f8f8;
            border-left: 4px solid #007185;
          }

          .cs-benefit svg {
            color: #007185;
            flex-shrink: 0;
          }

          .cs-benefit span {
            font-size: 15px;
            color: #0F1111;
            font-weight: 500;
          }

          .cs-login-actions {
            margin-top: 40px;
            display: flex;
            flex-direction: column;
            gap: 15px;
            max-width: 350px;
            margin-left: auto;
            margin-right: auto;
          }

          .cs-login-btn {
            padding: 16px 24px;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .cs-login-btn.primary {
            background: #ffd814;
            color: #0F1111;
            border: 1px solid #f7ca00;
          }

          .cs-login-btn.primary:hover {
            background: #f7ca00;
          }

          .cs-login-btn.secondary {
            background: white;
            border: 2px solid #ddd;
            color: #0F1111;
          }

          .cs-login-btn.secondary:hover {
            border-color: #007185;
            color: #007185;
            background: #f8f8f8;
          }

          .cs-back-btn {
            background: none;
            border: none;
            color: #007185;
            cursor: pointer;
            font-size: 14px;
            margin-top: 20px;
            padding: 8px 16px;
            border-radius: 4px;
          }

          .cs-back-btn:hover {
            text-decoration: underline;
            background: #f0f0f0;
          }

          @media (max-width: 768px) {
            .cs-login-content {
              padding: 25px;
            }
            
            .cs-login-header h1 {
              font-size: 28px;
            }
            
            .cs-login-message h2 {
              font-size: 20px;
            }
            
            .cs-benefit {
              padding: 12px;
            }
            
            .cs-login-btn {
              padding: 14px 20px;
            }
          }
        `}</style>

        <div className="customer-service-page">
          <div className="cs-login-required">
            <div className="cs-login-header">
              <HelpCircle size={64} />
              <h1>Customer Service Login Required</h1>
            </div>
            
            <div className="cs-login-content">
              <div className="cs-login-message">
                <h2>Please Sign In to Access Customer Service</h2>
                <p>To access personalized customer service features, track your orders, and get technical support, please sign in to your account.</p>
                
                <div className="cs-login-benefits">
                  <div className="cs-benefit">
                    <Shield size={20} />
                    <span>Secure access to your orders and returns</span>
                  </div>
                  <div className="cs-benefit">
                    <MessageSquare size={20} />
                    <span>Personalized technical support</span>
                  </div>
                  <div className="cs-benefit">
                    <Clock size={20} />
                    <span>Faster assistance with saved details</span>
                  </div>
                  <div className="cs-benefit">
                    <Settings size={20} />
                    <span>Access to repair and warranty services</span>
                  </div>
                </div>
              </div>
              
              <div className="cs-login-actions">
                <button 
                  className="cs-login-btn primary"
                  onClick={handleSignIn}
                >
                  Sign In to Your Account
                </button>
                
                <button 
                  className="cs-login-btn secondary"
                  onClick={handleCreateAccount}
                >
                  Create New Account
                </button>
                
                <button 
                  className="cs-back-btn"
                  onClick={handleBackToHome}
                >
                  Back to Home
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ========== LOGGED IN USER INTERFACE ==========
  return (
    <>
      <style jsx global>{`
        /* Customer Service Page Styles */
        .customer-service-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          font-family: "Amazon Ember", Arial, sans-serif;
        }

        /* Page Header */
        .cs-page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 1px solid #ddd;
          flex-wrap: wrap;
          gap: 15px;
        }

        .cs-page-title {
          font-size: 32px;
          font-weight: bold;
          color: #0F1111;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .cs-page-actions {
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
        }

        .cs-action-btn {
          padding: 10px 20px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background: white;
          color: #0F1111;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          transition: all 0.2s ease;
        }

        .cs-action-btn:hover {
          background: #f7f7f7;
          border-color: #aaa;
        }

        .cs-action-btn.primary {
          background: #ffd814;
          border-color: #f7ca00;
        }

        .cs-action-btn.primary:hover {
          background: #f7ca00;
        }

        .cs-action-btn.danger {
          color: #c45500;
          border-color: #c45500;
        }

        .cs-action-btn.danger:hover {
          background: #fff8f2;
        }

        /* Welcome Section */
        .cs-welcome-section {
          background: linear-gradient(135deg, #232f3e, #131921);
          color: white;
          padding: 40px;
          border-radius: 8px;
          margin-bottom: 40px;
          position: relative;
          overflow: hidden;
        }

        .cs-welcome-content {
          position: relative;
          z-index: 2;
          max-width: 600px;
        }

        .cs-welcome-title {
          font-size: 36px;
          font-weight: bold;
          margin-bottom: 10px;
        }

        .cs-welcome-subtitle {
          font-size: 18px;
          opacity: 0.9;
          margin-bottom: 30px;
        }

        /* Search Bar */
        .cs-search-container {
          position: relative;
          max-width: 600px;
        }

        .cs-search-input {
          width: 100%;
          padding: 15px 20px 15px 50px;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          outline: none;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .cs-search-icon {
          position: absolute;
          left: 15px;
          top: 50%;
          transform: translateY(-50%);
          color: #666;
        }

        /* Main Content Layout */
        .cs-main-content {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 40px;
          margin-top: 40px;
        }

        @media (max-width: 768px) {
          .cs-main-content {
            grid-template-columns: 1fr;
          }
        }

        /* Orders Section */
        .cs-orders-section {
          margin-bottom: 40px;
        }

        .cs-section-title {
          font-size: 24px;
          font-weight: bold;
          color: #0F1111;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .cs-orders-list {
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          overflow: hidden;
        }

        .cs-order-item {
          padding: 20px;
          border-bottom: 1px solid #eee;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .cs-order-item:last-child {
          border-bottom: none;
        }

        .cs-order-info {
          flex: 1;
        }

        .cs-order-id {
          font-weight: bold;
          color: #0F1111;
          margin-bottom: 5px;
        }

        .cs-order-date {
          font-size: 14px;
          color: #666;
          margin-bottom: 5px;
        }

        .cs-order-status {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }

        .cs-order-status.placed { background: #e8f4ff; color: #0066c0; }
        .cs-order-status.processing { background: #fff8e1; color: #f57c00; }
        .cs-order-status.shipped { background: #e8f5e8; color: #007600; }
        .cs-order-status.delivered { background: #e8f5e8; color: #007600; }
        .cs-order-status.cancelled { background: #ffebee; color: #d32f2f; }

        .cs-order-actions {
          display: flex;
          gap: 10px;
        }

        .cs-order-action-btn {
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background: white;
          color: #007185;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.2s ease;
        }

        .cs-order-action-btn:hover {
          background: #f7f7f7;
          border-color: #007185;
        }

        .cs-order-action-btn.danger {
          color: #c45500;
          border-color: #c45500;
        }

        .cs-order-action-btn.danger:hover {
          background: #fff8f2;
        }

        /* Contact Options */
        .cs-contact-section {
          margin-bottom: 40px;
        }

        .cs-contact-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 20px;
        }

        .cs-contact-card {
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 25px;
          text-align: center;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .cs-contact-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .cs-contact-icon {
          margin-bottom: 15px;
        }

        .cs-contact-title {
          font-size: 18px;
          font-weight: bold;
          color: #0F1111;
          margin-bottom: 10px;
        }

        .cs-contact-description {
          color: #666;
          font-size: 14px;
          line-height: 1.5;
          margin-bottom: 20px;
        }

        .cs-contact-btn {
          padding: 10px 20px;
          background: #007185;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
          transition: all 0.2s ease;
        }

        .cs-contact-btn:hover {
          background: #005566;
        }

        /* Tech Services */
        .cs-tech-section {
          background: #f7f7f7;
          border-radius: 8px;
          padding: 30px;
          margin-bottom: 40px;
        }

        .cs-tech-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 20px;
        }

        .cs-tech-card {
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 20px;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .cs-tech-card:hover {
          border-color: #007185;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }

        .cs-tech-header {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 15px;
        }

        .cs-tech-icon {
          color: #007185;
        }

        .cs-tech-title {
          font-size: 16px;
          font-weight: bold;
          color: #0F1111;
          margin: 0;
        }

        .cs-tech-description {
          color: #666;
          font-size: 14px;
          line-height: 1.5;
        }

        /* Support Tickets */
        .cs-tickets-list {
          margin-top: 20px;
        }

        .cs-ticket-item {
          padding: 15px;
          border: 1px solid #ddd;
          border-radius: 8px;
          margin-bottom: 15px;
          background: white;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .cs-ticket-item:hover {
          border-color: #007185;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .cs-ticket-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .cs-ticket-subject {
          font-weight: bold;
          color: #0F1111;
        }

        .cs-ticket-status {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }

        .cs-ticket-status.open { background: #fff8e1; color: #f57c00; }
        .cs-ticket-status.resolved { background: #e8f5e8; color: #007600; }
        .cs-ticket-status.in-progress { background: #e8f4ff; color: #0066c0; }

        .cs-ticket-date {
          font-size: 12px;
          color: #666;
        }

        /* Sidebar */
        .cs-sidebar {
          position: sticky;
          top: 20px;
          height: fit-content;
        }

        .cs-sidebar-section {
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 25px;
          margin-bottom: 20px;
        }

        .cs-sidebar-title {
          font-size: 18px;
          font-weight: bold;
          color: #0F1111;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .cs-quick-links {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .cs-quick-link {
          padding: 12px 0;
          border-bottom: 1px solid #f0f0f0;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: #007185;
          transition: all 0.2s ease;
        }

        .cs-quick-link:last-child {
          border-bottom: none;
        }

        .cs-quick-link:hover {
          color: #c7511f;
        }

        .cs-quick-link:hover .cs-link-arrow {
          transform: translateX(3px);
        }

        .cs-link-arrow {
          transition: transform 0.2s ease;
        }

        /* User Info */
        .cs-user-info {
          text-align: center;
          padding: 20px;
          background: #f8f8f8;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .cs-user-avatar {
          width: 60px;
          height: 60px;
          background: #007185;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: bold;
          margin: 0 auto 15px;
        }

        .cs-user-name {
          font-size: 18px;
          font-weight: bold;
          color: #0F1111;
          margin-bottom: 5px;
        }

        .cs-user-email {
          font-size: 14px;
          color: #666;
          margin-bottom: 15px;
        }

        /* Business Hours */
        .cs-business-hours {
          background: #f8f8f8;
          border-radius: 6px;
          padding: 15px;
          margin-top: 10px;
        }

        .cs-hours-title {
          font-size: 14px;
          font-weight: bold;
          color: #0F1111;
          margin-bottom: 10px;
        }

        .cs-hours-text {
          font-size: 13px;
          color: #666;
          line-height: 1.6;
          white-space: pre-line;
        }

        /* Emergency Support - UPDATED WITH YOUR NUMBER */
        .cs-emergency-section {
          background: linear-gradient(135deg, #c45500, #e47911);
          color: white;
          border-radius: 8px;
          padding: 25px;
          margin-top: 20px;
        }

        .cs-emergency-header {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 15px;
        }

        .cs-emergency-title {
          font-size: 18px;
          font-weight: bold;
          margin: 0;
        }

        .cs-emergency-number {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 10px;
          text-decoration: none;
          color: white;
          display: block;
        }

        .cs-emergency-description {
          font-size: 14px;
          opacity: 0.9;
        }

        /* Drivers List */
        .cs-drivers-list {
          margin-top: 20px;
        }

        .cs-driver-item {
          padding: 15px;
          border: 1px solid #ddd;
          border-radius: 8px;
          margin-bottom: 15px;
          background: white;
        }

        .cs-driver-name {
          font-weight: bold;
          color: #0F1111;
          margin-bottom: 5px;
        }

        .cs-driver-details {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #666;
          margin-bottom: 10px;
        }

        .cs-driver-download-btn {
          padding: 8px 16px;
          background: #007185;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.2s ease;
        }

        .cs-driver-download-btn:hover {
          background: #005566;
        }

        /* Stores List - UPDATED WITH YOUR NUMBER */
        .cs-stores-list {
          margin-top: 20px;
        }

        .cs-store-item {
          padding: 15px;
          border: 1px solid #ddd;
          border-radius: 8px;
          margin-bottom: 15px;
          background: white;
        }

        .cs-store-name {
          font-weight: bold;
          color: #0F1111;
          margin-bottom: 5px;
        }

        .cs-store-address {
          font-size: 14px;
          color: #666;
          margin-bottom: 5px;
        }

        .cs-store-hours {
          font-size: 12px;
          color: #666;
          margin-bottom: 10px;
        }

        .cs-store-call-btn {
          padding: 8px 16px;
          background: #ffd814;
          color: #0F1111;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.2s ease;
        }

        .cs-store-call-btn:hover {
          background: #f7ca00;
        }

        /* Warranty Info */
        .cs-warranty-card {
          padding: 20px;
          border: 1px solid #ddd;
          border-radius: 8px;
          background: white;
          margin-top: 20px;
        }

        .cs-warranty-status {
          display: inline-block;
          padding: 8px 16px;
          border-radius: 4px;
          font-weight: bold;
          margin-bottom: 15px;
        }

        .cs-warranty-status.active { background: #e8f5e8; color: #007600; }
        .cs-warranty-status.expired { background: #ffebee; color: #d32f2f; }

        .cs-warranty-details {
          font-size: 14px;
          color: #666;
        }

        .cs-warranty-detail {
          margin-bottom: 8px;
        }

        /* Live Chat Modal */
        .cs-live-chat-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .cs-chat-container {
          background: white;
          border-radius: 8px;
          width: 400px;
          max-width: 90%;
          max-height: 80vh;
          display: flex;
          flex-direction: column;
        }

        .cs-chat-header {
          padding: 20px;
          background: #007185;
          color: white;
          border-radius: 8px 8px 0 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .cs-chat-messages {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
          max-height: 400px;
        }

        .cs-chat-message {
          margin-bottom: 15px;
          max-width: 80%;
        }

        .cs-chat-message.user {
          margin-left: auto;
        }

        .cs-chat-message.agent .cs-message-bubble {
          background: #f0f0f0;
          color: #333;
        }

        .cs-chat-message.user .cs-message-bubble {
          background: #007185;
          color: white;
        }

        .cs-message-bubble {
          padding: 10px 15px;
          border-radius: 18px;
          display: inline-block;
        }

        .cs-message-time {
          font-size: 11px;
          color: #666;
          margin-top: 5px;
        }

        .cs-chat-input {
          padding: 20px;
          border-top: 1px solid #ddd;
          display: flex;
          gap: 10px;
        }

        .cs-chat-input-field {
          flex: 1;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }

        .cs-chat-send-btn {
          padding: 10px 20px;
          background: #007185;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .cs-chat-end-btn {
          padding: 10px 20px;
          background: #c45500;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          margin-top: 10px;
        }

        /* Email Form Modal */
        .cs-email-form-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .cs-email-form-container {
          background: white;
          border-radius: 8px;
          width: 500px;
          max-width: 90%;
          padding: 30px;
        }

        .cs-form-group {
          margin-bottom: 20px;
        }

        .cs-form-label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
          color: #0F1111;
        }

        .cs-form-input, .cs-form-textarea, .cs-form-select {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }

        .cs-form-textarea {
          height: 150px;
          resize: vertical;
        }

        .cs-form-actions {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
          margin-top: 30px;
        }

        .cs-form-submit-btn {
          padding: 10px 20px;
          background: #007185;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .cs-form-cancel-btn {
          padding: 10px 20px;
          background: #ddd;
          color: #333;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        /* Repair Form Modal */
        .cs-repair-form-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .cs-repair-form-container {
          background: white;
          border-radius: 8px;
          width: 500px;
          max-width: 90%;
          padding: 30px;
          max-height: 80vh;
          overflow-y: auto;
        }

        /* Ticket Modal */
        .cs-ticket-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .cs-ticket-container {
          background: white;
          border-radius: 8px;
          width: 600px;
          max-width: 90%;
          max-height: 80vh;
          display: flex;
          flex-direction: column;
        }

        .cs-ticket-messages {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .cs-page-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .cs-page-actions {
            width: 100%;
          }

          .cs-action-btn {
            width: 100%;
            justify-content: center;
          }

          .cs-welcome-section {
            padding: 25px;
          }

          .cs-welcome-title {
            font-size: 28px;
          }

          .cs-order-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;
          }

          .cs-order-actions {
            width: 100%;
            justify-content: flex-start;
          }

          .cs-contact-grid {
            grid-template-columns: 1fr;
          }
        }

        /* Loading state */
        .cs-loading {
          text-align: center;
          padding: 40px;
          color: #666;
        }

        .cs-no-data {
          text-align: center;
          padding: 40px;
          color: #666;
          font-style: italic;
        }
      `}</style>

      <div className="customer-service-page">
        {/* Page Header with Actions */}
        <div className="cs-page-header">
          <div className="cs-page-title">
            <HelpCircle size={32} />
            {t('pageTitle')}
          </div>
          <div className="cs-page-actions">
            <button className="cs-action-btn" onClick={handleBackToHome}>
              <ChevronRight size={16} style={{ transform: 'rotate(180deg)' }} />
              {t('backToHome')}
            </button>
            <button className="cs-action-btn primary" onClick={handleViewAccount}>
              <User size={16} />
              {t('viewAccount')}
            </button>
            <button className="cs-action-btn danger" onClick={onSignOut}>
              {t('signOut')}
            </button>
          </div>
        </div>

        {/* Welcome Section */}
        <div className="cs-welcome-section">
          <div className="cs-welcome-content">
            <h1 className="cs-welcome-title">{t('welcomeMessage')}</h1>
            <p className="cs-welcome-subtitle">
              Welcome back, {user.user_metadata?.first_name || user.email.split('@')[0]}! How can we assist you today?
            </p>
            <div className="cs-search-container">
              <Search className="cs-search-icon" size={20} />
              <input
                type="text"
                className="cs-search-input"
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="cs-main-content">
          {/* Main Content */}
          <div className="cs-main-left">
            {/* Orders Section */}
            <div className="cs-orders-section">
              <h2 className="cs-section-title">
                <ShoppingCart size={24} />
                {t('myOrders')}
              </h2>
              
              {loadingOrders ? (
                <div className="cs-loading">Loading orders...</div>
              ) : orders.length === 0 ? (
                <div className="cs-no-data">{t('noOrders')}</div>
              ) : (
                <div className="cs-orders-list">
                  {orders.slice(0, 5).map((order) => (
                    <div key={order.id} className="cs-order-item">
                      <div className="cs-order-info">
                        <div className="cs-order-id">Order #{order.id.slice(-8)}</div>
                        <div className="cs-order-date">
                          {new Date(order.created_at).toLocaleDateString()}
                        </div>
                        <span className={`cs-order-status ${order.status}`}>
                          {t(order.status)}
                        </span>
                      </div>
                      <div className="cs-order-actions">
                        <button className="cs-order-action-btn" onClick={() => alert(`Tracking info for order #${order.id}`)}>
                          {t('trackOrder')}
                        </button>
                        {order.status === 'placed' && (
                          <button className="cs-order-action-btn danger" onClick={() => handleCancelOrder(order.id)}>
                            {t('cancelOrder')}
                          </button>
                        )}
                        {order.status === 'delivered' && (
                          <button className="cs-order-action-btn" onClick={() => handleStartReturn(order.id)}>
                            {t('startReturn')}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Contact Options */}
            <div className="cs-contact-section">
              <h2 className="cs-section-title">
                <Phone size={24} />
                {t('contactSupport')}
              </h2>
              <div className="cs-contact-grid">
                <div className="cs-contact-card" onClick={handleOpenLiveChat}>
                  <div className="cs-contact-icon">
                    <MessageSquare size={32} color="#007185" />
                  </div>
                  <h3 className="cs-contact-title">{t('liveChat')}</h3>
                  <p className="cs-contact-description">{t('chatDescription')}</p>
                  <button className="cs-contact-btn">
                    {t('startChat')}
                  </button>
                </div>

                {/* UPDATED: Call Us with YOUR number */}
                <div className="cs-contact-card" onClick={() => window.open(`tel:${t('emergencyNumber')}`, '_blank')}>
                  <div className="cs-contact-icon">
                    <Phone size={32} color="#232f3e" />
                  </div>
                  <h3 className="cs-contact-title">{t('callUs')}</h3>
                  <p className="cs-contact-description">{t('callDescription')}</p>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px', color: '#007185' }}>
                    {t('emergencyNumber')}
                  </div>
                  <button className="cs-contact-btn">
                    {t('callNow')}
                  </button>
                </div>

                <div className="cs-contact-card" onClick={() => setShowEmailForm(true)}>
                  <div className="cs-contact-icon">
                    <Mail size={32} color="#007600" />
                  </div>
                  <h3 className="cs-contact-title">{t('emailUs')}</h3>
                  <p className="cs-contact-description">{t('emailDescription')}</p>
                  <button className="cs-contact-btn">
                    {t('sendMessage')}
                  </button>
                </div>
              </div>
            </div>

            {/* Technical Support Services */}
            <div className="cs-tech-section">
              <h2 className="cs-section-title">
                <Settings size={24} />
                {t('techSupport')}
              </h2>
              
              {/* Support Tickets */}
              <div className="cs-tickets-list">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '18px', color: '#0F1111' }}>My Support Tickets</h3>
                  <button 
                    onClick={handleCreateSupportTicket}
                    style={{
                      padding: '8px 16px',
                      background: '#007185',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    {t('submitTicket')}
                  </button>
                </div>
                
                {techIssues.length === 0 ? (
                  <div className="cs-no-data">{t('noTickets')}</div>
                ) : (
                  techIssues.slice(0, 3).map((ticket) => (
                    <div key={ticket.id} className="cs-ticket-item" onClick={() => handleViewTicket(ticket)}>
                      <div className="cs-ticket-header">
                        <div className="cs-ticket-subject">{ticket.subject}</div>
                        <span className={`cs-ticket-status ${ticket.status.replace(' ', '-')}`}>
                          {t(ticket.status)}
                        </span>
                      </div>
                      <div className="cs-ticket-date">
                        Created: {new Date(ticket.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="cs-tech-grid">
                <div className="cs-tech-card" onClick={() => setShowRepairForm(true)}>
                  <div className="cs-tech-header">
                    <Settings className="cs-tech-icon" size={20} />
                    <h3 className="cs-tech-title">{t('repairServices')}</h3>
                  </div>
                  <p className="cs-tech-description">
                    Schedule repairs and check repair status for your devices
                  </p>
                </div>

                <div className="cs-tech-card" onClick={() => alert('Opening warranty information...')}>
                  <div className="cs-tech-header">
                    <Shield className="cs-tech-icon" size={20} />
                    <h3 className="cs-tech-title">{t('warrantyInfo')}</h3>
                  </div>
                  <p className="cs-tech-description">
                    Check warranty status and coverage for your products
                  </p>
                </div>
              </div>
            </div>

            {/* Driver Downloads */}
            <div className="cs-sidebar-section">
              <h3 className="cs-sidebar-title">
                <Download size={20} />
                {t('driverDownloads')}
              </h3>
              <div className="cs-drivers-list">
                {drivers.slice(0, 3).map((driver) => (
                  <div key={driver.id} className="cs-driver-item">
                    <div className="cs-driver-name">{driver.name}</div>
                    <div className="cs-driver-details">
                      <span>v{driver.version}</span>
                      <span>{driver.date}</span>
                      <span>{driver.size}</span>
                    </div>
                    <button 
                      className="cs-driver-download-btn"
                      onClick={() => handleDownloadDriver(driver)}
                    >
                      {t('download')}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="cs-sidebar">
            {/* User Info Section */}
            <div className="cs-user-info">
              <div className="cs-user-avatar">
                {user.user_metadata?.first_name?.[0] || user.email[0].toUpperCase()}
              </div>
              <div className="cs-user-name">
                {user.user_metadata?.first_name || user.email.split('@')[0]}
              </div>
              <div className="cs-user-email">{user.email}</div>
            </div>

            {/* Quick Links */}
            <div className="cs-sidebar-section">
              <h3 className="cs-sidebar-title">
                <Star size={20} />
                {t('quickLinks')}
              </h3>
              <ul className="cs-quick-links">
                {[
                  { key: 'trackOrder', action: () => alert('Opening order tracking...') },
                  { key: 'startReturn', action: () => alert('Opening return portal...') },
                  { key: 'cancelOrder', action: () => alert('Opening cancellation page...') },
                  { key: 'updateAddress', action: () => navigate('/account') },
                  { key: 'changePayment', action: () => navigate('/account') },
                  { key: 'faqs', action: () => window.open('https://help.robertizak.com', '_blank') }
                ].map(({ key, action }) => (
                  <li key={key} className="cs-quick-link" onClick={action}>
                    <span>{t(key)}</span>
                    <ChevronRight className="cs-link-arrow" size={16} />
                  </li>
                ))}
              </ul>
            </div>

            {/* Warranty Information */}
            {warrantyInfo && (
              <div className="cs-sidebar-section">
                <h3 className="cs-sidebar-title">
                  <Shield size={20} />
                  {t('warrantyInfo')}
                </h3>
                <div className="cs-warranty-card">
                  <div className={`cs-warranty-status ${warrantyInfo.status}`}>
                    {warrantyInfo.status === 'active' ? t('activeWarranty') : t('expiredWarranty')}
                  </div>
                  <div className="cs-warranty-details">
                    <div className="cs-warranty-detail">
                      <strong>Product:</strong> {warrantyInfo.product_name}
                    </div>
                    <div className="cs-warranty-detail">
                      <strong>Serial:</strong> {warrantyInfo.serial_number}
                    </div>
                    <div className="cs-warranty-detail">
                      <strong>{t('warrantyExpires')}:</strong> {new Date(warrantyInfo.expires_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Store Locations - UPDATED WITH YOUR NUMBER */}
            <div className="cs-sidebar-section">
              <h3 className="cs-sidebar-title">
                <MapPin size={20} />
                {t('storeLocator')}
              </h3>
              <div className="cs-stores-list">
                {stores.slice(0, 2).map((store) => (
                  <div key={store.id} className="cs-store-item">
                    <div className="cs-store-name">{store.name}</div>
                    <div className="cs-store-address">{store.address}</div>
                    <div className="cs-store-hours">Hours: {store.hours}</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#007185', marginBottom: '8px' }}>
                      {store.phone}
                    </div>
                    <button 
                      className="cs-store-call-btn"
                      onClick={() => handleCallStore(store.phone)}
                    >
                      {t('callNow')}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Business Hours */}
            <div className="cs-sidebar-section">
              <h3 className="cs-sidebar-title">
                <Clock size={20} />
                {t('businessHours')}
              </h3>
              <div className="cs-business-hours">
                <div className="cs-hours-title">{t('businessHours')}</div>
                <div className="cs-hours-text">{t('hoursDescription')}</div>
              </div>
            </div>

            {/* Emergency Support - UPDATED WITH YOUR NUMBER */}
            <div className="cs-emergency-section">
              <div className="cs-emergency-header">
                <AlertCircle size={24} />
                <h3 className="cs-emergency-title">{t('emergencySupport')}</h3>
              </div>
              <a href={`tel:${t('emergencyNumber')}`} className="cs-emergency-number">
                {t('emergencyNumber')}
              </a>
              <p className="cs-emergency-description">
                {t('needImmediateHelp')} Available 24/7 for critical issues.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Live Chat Modal */}
      {showLiveChat && (
        <div className="cs-live-chat-modal">
          <div className="cs-chat-container">
            <div className="cs-chat-header">
              <div>
                <h3 style={{ margin: 0 }}>{t('liveChat')}</h3>
                <p style={{ margin: '5px 0 0 0', fontSize: '12px', opacity: 0.8 }}>
                  Connected to Support Agent
                </p>
              </div>
              <button onClick={() => setShowLiveChat(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>
            <div className="cs-chat-messages">
              {chatMessages.map((msg) => (
                <div key={msg.id} className={`cs-chat-message ${msg.sender}`}>
                  <div className="cs-message-bubble">{msg.text}</div>
                  <div className="cs-message-time">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
            </div>
            <div className="cs-chat-input">
              <input
                type="text"
                className="cs-chat-input-field"
                placeholder={t('typeMessage')}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendChatMessage()}
              />
              <button className="cs-chat-send-btn" onClick={handleSendChatMessage}>
                {t('send')}
              </button>
            </div>
            <div style={{ padding: '10px 20px 20px' }}>
              <button className="cs-chat-end-btn" onClick={() => setShowLiveChat(false)}>
                {t('endChat')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Form Modal */}
      {showEmailForm && (
        <div className="cs-email-form-modal">
          <div className="cs-email-form-container">
            <h2 style={{ marginTop: 0 }}>{t('emailUs')}</h2>
            <div className="cs-form-group">
              <label className="cs-form-label">{t('subject')} *</label>
              <input
                type="text"
                className="cs-form-input"
                value={emailForm.subject}
                onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                placeholder="Brief description of your issue"
              />
            </div>
            <div className="cs-form-group">
              <label className="cs-form-label">{t('priority')}</label>
              <select 
                className="cs-form-select"
                value={emailForm.priority}
                onChange={(e) => setEmailForm({ ...emailForm, priority: e.target.value })}
              >
                <option value="normal">{t('normal')}</option>
                <option value="high">{t('high')}</option>
                <option value="urgent">{t('urgent')}</option>
              </select>
            </div>
            <div className="cs-form-group">
              <label className="cs-form-label">{t('message')} *</label>
              <textarea
                className="cs-form-textarea"
                value={emailForm.message}
                onChange={(e) => setEmailForm({ ...emailForm, message: e.target.value })}
                placeholder="Please provide detailed information about your issue..."
              />
            </div>
            <div className="cs-form-actions">
              <button className="cs-form-cancel-btn" onClick={() => setShowEmailForm(false)}>
                {t('cancel')}
              </button>
              <button className="cs-form-submit-btn" onClick={handleSendEmail}>
                {t('send')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Repair Form Modal */}
      {showRepairForm && (
        <div className="cs-repair-form-modal">
          <div className="cs-repair-form-container">
            <h2 style={{ marginTop: 0 }}>{t('scheduleRepair')}</h2>
            <div className="cs-form-group">
              <label className="cs-form-label">{t('productName')} *</label>
              <input
                type="text"
                className="cs-form-input"
                value={repairForm.productName}
                onChange={(e) => setRepairForm({ ...repairForm, productName: e.target.value })}
                placeholder="e.g., HP Laptop EliteBook 840"
              />
            </div>
            <div className="cs-form-group">
              <label className="cs-form-label">{t('serialNumber')}</label>
              <input
                type="text"
                className="cs-form-input"
                value={repairForm.serialNumber}
                onChange={(e) => setRepairForm({ ...repairForm, serialNumber: e.target.value })}
                placeholder="Usually found on the back of the device"
              />
            </div>
            <div className="cs-form-group">
              <label className="cs-form-label">{t('issueDescription')} *</label>
              <textarea
                className="cs-form-textarea"
                value={repairForm.issue}
                onChange={(e) => setRepairForm({ ...repairForm, issue: e.target.value })}
                placeholder="Describe the issue in detail..."
                rows={4}
              />
            </div>
            <div className="cs-form-group">
              <label className="cs-form-label">{t('preferredDate')}</label>
              <input
                type="date"
                className="cs-form-input"
                value={repairForm.preferredDate}
                onChange={(e) => setRepairForm({ ...repairForm, preferredDate: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="cs-form-group">
              <label className="cs-form-label">{t('contactPhone')} *</label>
              <input
                type="tel"
                className="cs-form-input"
                value={repairForm.contactPhone}
                onChange={(e) => setRepairForm({ ...repairForm, contactPhone: e.target.value })}
                placeholder="+256 765673373"
              />
              <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
                Default: {t('emergencyNumber')}
              </small>
            </div>
            <div className="cs-form-actions">
              <button className="cs-form-cancel-btn" onClick={() => setShowRepairForm(false)}>
                {t('cancel')}
              </button>
              <button className="cs-form-submit-btn" onClick={handleScheduleRepair}>
                {t('schedule')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Support Ticket Modal */}
      {showTicketModal && activeSupportTicket && (
        <div className="cs-ticket-modal">
          <div className="cs-ticket-container">
            <div className="cs-chat-header">
              <div>
                <h3 style={{ margin: 0 }}>Ticket #{activeSupportTicket.id.slice(-8)}</h3>
                <p style={{ margin: '5px 0 0 0', fontSize: '12px', opacity: 0.8 }}>
                  {activeSupportTicket.subject}
                </p>
              </div>
              <button onClick={() => {
                setShowTicketModal(false);
                setActiveSupportTicket(null);
                setTicketMessages([]);
              }} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>
            <div className="cs-ticket-messages">
              {ticketMessages.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                  No messages yet. Start the conversation!
                </div>
              ) : (
                ticketMessages.map((msg) => (
                  <div key={msg.id} className={`cs-chat-message ${msg.sender}`}>
                    <div className="cs-message-bubble">{msg.message}</div>
                    <div className="cs-message-time">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="cs-chat-input">
              <input
                type="text"
                className="cs-chat-input-field"
                placeholder={t('typeMessage')}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendTicketMessage()}
              />
              <button className="cs-chat-send-btn" onClick={handleSendTicketMessage}>
                {t('send')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CustomerServicePage;