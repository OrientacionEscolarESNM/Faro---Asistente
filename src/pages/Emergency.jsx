import { Phone, AlertTriangle, ShieldAlert } from 'lucide-react';
import './Pages.css';

export default function Emergency() {
  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <h1>Centro de Emergencia</h1>
        <p>Si tú o alguien que conoces está en peligro inmediato, busca ayuda profesional ahora.</p>
      </div>

      <div className="emergency-alert">
        <AlertTriangle size={48} color="var(--accent-emergency)" style={{ marginBottom: '1rem' }} />
        <h2>¿Estás en una situación de crisis?</h2>
        <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
          No estás solo. Faro es un asistente de orientación, pero en casos de emergencia vital, 
          debes contactar a los servicios de emergencia de tu localidad.
        </p>
        <button className="emergency-btn-large">
          <Phone size={24} />
          Llamar al 911 (Emergencias)
        </button>
      </div>

      <h3 style={{ marginBottom: '1rem', marginTop: '2rem' }}>Contactos Inmediatos</h3>
      
      <div className="info-card">
        <div className="info-icon" style={{ color: 'var(--accent-emergency)', backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
          <ShieldAlert size={24} />
        </div>
        <div className="info-content">
          <h3>Línea de Prevención del Suicidio</h3>
          <p>Atención gratuita, confidencial y disponible 24/7. Un especialista te escuchará sin juzgarte.</p>
          <a href="tel:135" className="btn btn-outline" style={{ borderColor: 'var(--accent-emergency)', color: 'var(--accent-emergency)' }}>
            <Phone size={16} /> Llamar ahora
          </a>
        </div>
      </div>
    </div>
  );
}
