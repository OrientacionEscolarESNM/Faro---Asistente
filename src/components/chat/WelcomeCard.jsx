import { useState } from 'react';
import { MessageCircle, ArrowRight } from 'lucide-react';
import './Chat.css';

export default function WelcomeCard({ onActionClick, onSubmitOnboarding, isOnboarded, userName }) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');

  const suggestions = [
    "Me siento triste últimamente",
    "Tengo problemas con un compañero",
    "Siento mucha ansiedad por los exámenes",
    "No sé cómo hablar con mis padres sobre algo importante"
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim() && age.trim() && gender) {
      onSubmitOnboarding(name.trim(), age.trim(), gender);
    }
  };

  return (
    <div className="welcome-card animate-fade-in">
      <div className="welcome-header">
        <div className="faro-icon-large">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '32px', height: '32px' }}>
            {/* Haces de luz superiores */}
            <path d="M12 7L3 4M12 7L21 4" strokeWidth="1.5" opacity="0.8" />
            {/* Haces de luz inferiores */}
            <path d="M12 7L2 8M12 7L22 8" strokeWidth="1.5" opacity="0.45" />
            
            {/* Cúpula / Techo de la linterna */}
            <path d="M10 5a2 2 0 0 1 4 0v2h-4V5z" />
            
            {/* Balcón / Galería del faro */}
            <path d="M8 7h8" />
            
            {/* Foco de luz interior */}
            <circle cx="12" cy="5.5" r="0.5" fill="currentColor" />
            
            {/* Torre del faro */}
            <path d="M9 20l1-13h4l1 13" />
            
            {/* Líneas horizontales decorativas de la torre */}
            <path d="M9.7 11h4.6M9.3 15h5.4" strokeWidth="1.5" opacity="0.8" />
            
            {/* Base del faro */}
            <path d="M8 20h8" />
            
            {/* Olas del mar de soporte a la izquierda y derecha */}
            <path d="M4 20c1.5-0.5 2.5-0.5 4 0s2.5 0.5 4 0 2.5-0.5 4 0 2.5 0.5 4 0" strokeWidth="1.5" opacity="0.5" />
          </svg>
        </div>
        <h2>{isOnboarded ? `¡Hola, ${userName}! 👋` : "Hola, soy Faro"}</h2>
        <p>
          {isOnboarded 
            ? "Estoy muy feliz de conversar contigo. Este es tu espacio seguro, confidencial y libre de juicios. ¿De qué te gustaría hablar hoy?"
            : "Estoy aquí para escucharte y orientarte en lo que necesites. Este es un espacio completamente seguro y confidencial."}
        </p>
      </div>
      
      {!isOnboarded ? (
        <form onSubmit={handleSubmit} className="onboarding-form animate-fade-in" style={{
          marginTop: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          width: '100%',
          maxWidth: '360px',
          marginInline: 'auto'
        }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', textAlign: 'center' }}>
            Para poder conversar, por favor indícame:
          </h3>
          
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', textAlign: 'left' }}>
            <label htmlFor="student-name" style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>¿Cuál es tu nombre?</label>
            <input 
              id="student-name"
              type="text" 
              placeholder="Escribe tu nombre..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="chat-textarea"
              style={{
                borderRadius: '8px',
                padding: '0.75rem',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: 'var(--text-primary)',
                fontSize: '0.95rem'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', textAlign: 'left' }}>
              <label htmlFor="student-age" style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>¿Tu edad?</label>
              <input 
                id="student-age"
                type="number" 
                min="5"
                max="100"
                placeholder="Años..."
                value={age}
                onChange={(e) => setAge(e.target.value)}
                required
                className="chat-textarea"
                style={{
                  borderRadius: '8px',
                  padding: '0.75rem',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', textAlign: 'left' }}>
              <label htmlFor="student-gender" style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>¿Tu género?</label>
              <select
                id="student-gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                required
                className="chat-textarea"
                style={{
                  borderRadius: '8px',
                  padding: '0.75rem',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem',
                  width: '100%',
                  height: '45px',
                  boxSizing: 'border-box',
                  cursor: 'pointer'
                }}
              >
                <option value="" disabled style={{ backgroundColor: '#1a1d24', color: 'var(--text-secondary)' }}>Selecciona...</option>
                <option value="Femenino" style={{ backgroundColor: '#1a1d24' }}>Femenino 👧</option>
                <option value="Masculino" style={{ backgroundColor: '#1a1d24' }}>Masculino 👦</option>
                <option value="Otro" style={{ backgroundColor: '#1a1d24' }}>Otro / Prefiero no decirlo</option>
              </select>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={!name.trim() || !age.trim() || !gender}
            style={{
              padding: '0.8rem',
              borderRadius: '8px',
              fontWeight: '600',
              marginTop: '0.5rem',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            Comenzar Orientación <ArrowRight size={18} />
          </button>
        </form>
      ) : (
        <div className="suggestions-container animate-fade-in">
          <h3>Puedes empezar diciendo:</h3>
          <div className="suggestions-grid">
            {suggestions.map((text, idx) => (
              <button 
                key={idx} 
                className="suggestion-btn"
                onClick={() => onActionClick(text)}
              >
                <MessageCircle size={16} />
                <span>{text}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
