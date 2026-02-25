import React from 'react';
import { Link } from 'react-router-dom';
import './Portal.css';

const Portal = ({ 
  setCurrentPage, 
  setSelectedCategory, 
  currentLanguage, 
  user 
}) => {
  const businessSections = [
    {
      id: 1,
      title: "🛒 Shop",
      description: "Browse and purchase computers, gaming PCs, laptops, monitors, and accessories",
      path: "/home",
      color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      features: [
        { name: "Gaming PCs", icon: "🎮" },
        { name: "Laptops", icon: "💻" },
        { name: "Monitors", icon: "🖥️" },
        { name: "Accessories", icon: "⌨️" }
      ]
    },
    {
      id: 2,
      title: "🌐 Web Development",
      description: "Custom websites, e-commerce platforms, and web applications",
      path: "/web-development",
      color: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
      features: [
        { name: "Corporate Websites", icon: "🏢" },
        { name: "E-commerce", icon: "🛒" },
        { name: "Web Apps", icon: "⚡" },
        { name: "LMS", icon: "🎓" }
      ]
    },
    {
      id: 3,
      title: "📱 App Development",
      description: "Mobile and desktop applications for various platforms",
      path: "/app-development",
      color: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
      features: [
        { name: "iOS Apps", icon: "📱" },
        { name: "Android Apps", icon: "🤖" },
        { name: "Cross-Platform", icon: "🔄" },
        { name: "Desktop", icon: "💻" }
      ]
    }
  ];

  const handleNavigation = (path) => {
    // Scroll to top before navigation
    window.scrollTo(0, 0);
    
    // Reset category when navigating to shop home
    if (path === '/home') {
      setSelectedCategory('all');
      setCurrentPage('home');
    }
  };

  return (
    <div className="portal-container">
      <div className="portal-header">
        <div className="logo-container">
          <img 
            src="/LOGO.png" 
            alt="Robert & Izak Computers" 
            className="portal-logo"
          />
        </div>
        <h1>Robert & Izak Computers</h1>
        <p>Your complete technology solution provider</p>
      </div>
      
      <div className="portal-grid">
        {businessSections.map(section => (
          <Link 
            to={section.path} 
            key={section.id} 
            className="portal-card"
            onClick={() => handleNavigation(section.path)}
          >
            <div 
              className="card-header" 
              style={{ background: section.color }}
            >
              <h2>{section.title}</h2>
            </div>
            <div className="card-body">
              <p>{section.description}</p>
              <ul className="features-grid">
                {section.features.map((feature, index) => (
                  <li key={index} className="feature-item">
                    <span className="feature-icon">{feature.icon}</span>
                    <span className="feature-text">{feature.name}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="card-footer">
              <span>Explore Services</span>
              <svg className="arrow-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Portal;