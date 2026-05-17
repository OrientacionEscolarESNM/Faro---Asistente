import { Sparkles, MessageCircle, HeartHandshake } from 'lucide-react';
import './Chat.css';

export default function WelcomeCard({ onActionClick }) {
  const suggestions = [
    "Me siento triste últimamente",
    "Tengo problemas con un compañero",
    "Siento mucha ansiedad por los exámenes",
    "No sé cómo hablar con mis padres sobre algo importante"
  ];

  return (
    <div className="welcome-card animate-fade-in">
      <div className="welcome-header">
        <div className="faro-icon-large">
          <Sparkles size={32} />
        </div>
        <h2>Hola, soy Faro</h2>
        <p>Estoy aquí para escucharte y orientarte en lo que necesites. Este es un espacio seguro y confidencial.</p>
      </div>
      
      <div className="suggestions-container">
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
    </div>
  );
}
