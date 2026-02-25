import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

const Footer = ({ currentLanguage }) => {
  // State for hover effects and back to top
  const [hoverStates, setHoverStates] = useState({});
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [backToTopHover, setBackToTopHover] = useState(false);

  // Get current year dynamically
  const currentYear = new Date().getFullYear();

  // Show back to top button when scrolled down
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMouseEnter = (linkId) => {
    setHoverStates((prev) => ({ ...prev, [linkId]: true }));
  };

  const handleMouseLeave = (linkId) => {
    setHoverStates((prev) => ({ ...prev, [linkId]: false }));
  };

  // Footer translations - language controlled by header
  const translations = {
    en: {
      backToTop: "Back to top",
      shopComputers: "Shop Computers",
      componentsUpgrades: "Components & Upgrades",
      supportServices: "Support & Services",
      aboutCompany: "About ROBERT & IZAK",
      laptops: "Laptops",
      desktops: "Desktops",
      monitors: "Monitors",
      accessories: "Accessories",
      gpus: "Graphics Cards",
      cpus: "Processors",
      ram: "Memory (RAM)",
      storage: "Storage Drives",
      techSupport: "Technical Support",
      warranty: "Warranty Information",
      repairs: "Repair Services",
      setup: "Setup Guides",
      aboutUs: "Our Story",
      contact: "Contact Us",
      storeLocator: "Store Locator",
      careers: "Careers",
      copyright: `© 1996-${currentYear} ROBERT & IZAK COMPUTERS. All rights reserved.`
    },
    es: {
      backToTop: "Volver arriba",
      shopComputers: "Comprar Computadoras",
      componentsUpgrades: "Componentes y Mejoras",
      supportServices: "Soporte y Servicios",
      aboutCompany: "Acerca de ROBERT & IZAK",
      laptops: "Portátiles",
      desktops: "Escritorio",
      monitors: "Monitores",
      accessories: "Accesorios",
      gpus: "Tarjetas Gráficas",
      cpus: "Procesadores",
      ram: "Memoria (RAM)",
      storage: "Unidades de Almacenamiento",
      techSupport: "Soporte Técnico",
      warranty: "Información de Garantía",
      repairs: "Servicios de Reparación",
      setup: "Guías de Configuración",
      aboutUs: "Nuestra Historia",
      contact: "Contáctenos",
      storeLocator: "Localizador de Tiendas",
      careers: "Carreras",
      copyright: `© 1996-${currentYear} ROBERT & IZAK COMPUTERS. Todos los derechos reservados.`
    },
    fr: {
      backToTop: "Retour en haut",
      shopComputers: "Acheter des Ordinateurs",
      componentsUpgrades: "Composants et Améliorations",
      supportServices: "Support et Services",
      aboutCompany: "À propos de ROBERT & IZAK",
      laptops: "Ordinateurs portables",
      desktops: "Ordinateurs de bureau",
      monitors: "Moniteurs",
      accessories: "Accessoires",
      gpus: "Cartes graphiques",
      cpus: "Processeurs",
      ram: "Mémoire (RAM)",
      storage: "Disques de stockage",
      techSupport: "Support Technique",
      warranty: "Informations sur la Garantie",
      repairs: "Services de Réparation",
      setup: "Guides d'Installation",
      aboutUs: "Notre Histoire",
      contact: "Nous Contacter",
      storeLocator: "Localisateur de Magasins",
      careers: "Carrières",
      copyright: `© 1996-${currentYear} ROBERT & IZAK COMPUTERS. Tous droits réservés.`
    }
  };

  // Helper function for translations
  const t = (key) => {
    return translations[currentLanguage]?.[key] || translations.en[key];
  };

  // Computer-focused footer sections - now translated based on header language
  const footerSections = [
    {
      title: t('shopComputers'),
      links: [
        { id: 'laptops', text: t('laptops'), href: '#' },
        { id: 'desktops', text: t('desktops'), href: '#' },
        { id: 'monitors', text: t('monitors'), href: '#' },
        { id: 'accessories', text: t('accessories'), href: '#' },
      ],
    },
    {
      title: t('componentsUpgrades'),
      links: [
        { id: 'gpus', text: t('gpus'), href: '#' },
        { id: 'cpus', text: t('cpus'), href: '#' },
        { id: 'ram', text: t('ram'), href: '#' },
        { id: 'storage', text: t('storage'), href: '#' },
      ],
    },
    {
      title: t('supportServices'),
      links: [
        { id: 'tech-support', text: t('techSupport'), href: '#' },
        { id: 'warranty', text: t('warranty'), href: '#' },
        { id: 'repairs', text: t('repairs'), href: '#' },
        { id: 'setup', text: t('setup'), href: '#' },
      ],
    },
    {
      title: t('aboutCompany'),
      links: [
        { id: 'about-us', text: t('aboutUs'), href: '#' },
        { id: 'contact', text: t('contact'), href: '#' },
        { id: 'store-locator', text: t('storeLocator'), href: '#' },
        { id: 'careers', text: t('careers'), href: '#' },
      ],
    },
  ];

  // Internal Styles - Fixed for full width back to top
  const styles = {
    footer: {
      backgroundColor: '#131921',
      color: '#ffffff',
      padding: '0px 0px 20px 0px',
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      lineHeight: '1.5',
      marginTop: 'auto', // This is KEY - pushes footer to bottom
      width: '100%',
    },
    backToTop: {
      backgroundColor: '#37475A',
      color: 'white',
      textAlign: 'center',
      padding: '15px 0',
      cursor: 'pointer',
      transition: 'background-color 0.2s ease',
      border: 'none',
      width: '100%',
      fontSize: '13px',
      fontWeight: '500',
      marginBottom: '40px',
    },
    backToTopHover: {
      backgroundColor: '#485769',
    },
    footerContent: {
      maxWidth: '1400px',
      margin: '0 auto',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '20px',
      padding: '0px 20px 30px 20px',
      borderBottom: '1px solid #3a4553',
    },
    footerColumn: {
      display: 'flex',
      flexDirection: 'column',
    },
    columnTitle: {
      fontSize: '16px',
      fontWeight: '700',
      color: '#ffffff',
      marginBottom: '15px',
    },
    footerLink: {
      color: '#dddddd',
      textDecoration: 'none',
      fontSize: '13px',
      marginBottom: '8px',
      transition: 'color 0.2s ease',
    },
    footerLinkHover: {
      color: '#ff9900',
    },
    footerBottom: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '20px 20px 0px 20px',
      textAlign: 'center',
    },
    footerBottomText: {
      fontSize: '12px',
      color: '#999999',
    },
  };

  return (
    <footer style={styles.footer}>
      {/* Amazon-style Full Width Back to Top Button */}
      {showBackToTop && (
        <button
          style={{
            ...styles.backToTop,
            ...(backToTopHover ? styles.backToTopHover : {})
          }}
          onMouseEnter={() => setBackToTopHover(true)}
          onMouseLeave={() => setBackToTopHover(false)}
          onClick={scrollToTop}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <ChevronUp size={16} />
            {t('backToTop')}
          </div>
        </button>
      )}

      <div style={styles.footerContent}>
        {footerSections.map((section, index) => (
          <div key={index} style={styles.footerColumn}>
            <h3 style={styles.columnTitle}>{section.title}</h3>
            {section.links.map((link) => (
              <a
                key={link.id}
                href={link.href}
                style={{
                  ...styles.footerLink,
                  ...(hoverStates[link.id] ? styles.footerLinkHover : {}),
                }}
                onMouseEnter={() => handleMouseEnter(link.id)}
                onMouseLeave={() => handleMouseLeave(link.id)}
                onClick={(e) => e.preventDefault()}
              >
                {link.text}
              </a>
            ))}
          </div>
        ))}
      </div>

      <div style={styles.footerBottom}>
        <p style={styles.footerBottomText}>
          {t('copyright')}
        </p>
      </div>
    </footer>
  );
};

export default Footer;