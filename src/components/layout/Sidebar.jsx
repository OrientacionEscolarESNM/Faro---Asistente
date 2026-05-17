import { NavLink } from 'react-router-dom';
import { MessageSquare, Phone, HeartHandshake, Info, Shield, Menu, X } from 'lucide-react';
import { useState } from 'react';
import './Layout.css';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  const navItems = [
    { path: '/chat', icon: <MessageSquare size={20} />, label: 'Chat con Faro' },
    { path: '/helplines', icon: <HeartHandshake size={20} />, label: 'Líneas de Ayuda' },
    { path: '/emergency', icon: <Phone size={20} />, label: 'Emergencia', isEmergency: true },
    { path: '/about', icon: <Info size={20} />, label: 'Acerca de Faro' },
    { path: '/privacy', icon: <Shield size={20} />, label: 'Privacidad' },
  ];

  return (
    <>
      <button className="mobile-toggle" onClick={toggleSidebar}>
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div className={`sidebar ${isOpen ? 'open' : ''} glass-panel`}>
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo-icon flex-center">F</div>
            <h2>Faro</h2>
          </div>
          <p className="subtitle">Tu asistente de orientación</p>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `nav-item ${isActive ? 'active' : ''} ${item.isEmergency ? 'emergency-nav' : ''}`
              }
              onClick={() => setIsOpen(false)}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <p>© {new Date().getFullYear()} Faro</p>
        </div>
      </div>
      
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
