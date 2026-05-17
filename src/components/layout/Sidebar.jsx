import { NavLink } from 'react-router-dom';
import { MessageSquare, Phone, HeartHandshake, Info, Shield, Menu, X, Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';
import './Layout.css';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('faro-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDark(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      setIsDark(false);
      document.documentElement.removeAttribute('data-theme');
    }
  }, []);

  const toggleSidebar = () => setIsOpen(!isOpen);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('faro-theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('faro-theme', 'dark');
      setIsDark(true);
    }
  };

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
          <button 
            className="theme-toggle btn btn-outline" 
            onClick={toggleTheme}
            style={{ width: '100%', marginBottom: '1rem', justifyContent: 'center' }}
            title={`Cambiar a ${isDark ? 'modo claro' : 'modo oscuro'}`}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
            <span>{isDark ? 'Modo Claro' : 'Modo Oscuro'}</span>
          </button>
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
