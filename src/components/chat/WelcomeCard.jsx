import { useState } from 'react';
import { Sparkles, MessageCircle, ArrowRight } from 'lucide-react';
import './Chat.css';

export default function WelcomeCard({ onActionClick, onSubmitOnboarding, isOnboarded, userName }) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');

  const suggestions = [
    "Me siento triste últimamente",
    "Tengo problemas con un compañero",
    "Siento mucha ansiedad por los exámenes",
    "No sé cómo hablar con mis padres sobre algo importante"
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim() && age.trim()) {
      onSubmitOnboarding(name.trim(), age.trim());
    }
  };

  return (
    <div className="welcome-card animate-fade-in">
      <div className="welcome-header">
        <div className="faro-icon-large">
          <Sparkles size={32} />
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

          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', textAlign: 'left' }}>
            <label htmlFor="student-age" style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>¿Cuántos años tienes?</label>
            <input 
              id="student-age"
              type="number" 
              min="5"
              max="100"
              placeholder="Escribe tu edad..."
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
                fontSize: '0.95rem'
              }}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={!name.trim() || !age.trim()}
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
