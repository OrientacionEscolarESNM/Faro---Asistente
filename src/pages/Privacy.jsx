import { ShieldCheck, Lock, EyeOff } from 'lucide-react';
import './Pages.css';

export default function Privacy() {
  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <h1>Política de Privacidad</h1>
        <p>Tu información y tus conversaciones están protegidas.</p>
      </div>

      <div className="about-content" style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
        <p style={{ marginBottom: '2rem' }}>
          En Faro, nos tomamos muy en serio tu privacidad. Entendemos que los temas de los que hablas aquí son sensibles y personales.
        </p>

        <div className="info-card">
          <div className="info-icon">
            <Lock size={24} />
          </div>
          <div className="info-content">
            <h3>Confidencialidad de las Conversaciones</h3>
            <p>
              Tus chats con Faro son confidenciales. No se asocian a tu identidad pública ni se comparten con terceros con fines comerciales. 
            </p>
          </div>
        </div>

        <div className="info-card">
          <div className="info-icon">
            <EyeOff size={24} />
          </div>
          <div className="info-content">
            <h3>Anonimato</h3>
            <p>
              No necesitas proporcionar tu nombre real, correo ni datos personales identificables para recibir orientación básica.
            </p>
          </div>
        </div>

        <div className="info-card" style={{ borderColor: 'var(--accent-warning)', backgroundColor: 'rgba(245, 158, 11, 0.05)' }}>
          <div className="info-icon" style={{ color: 'var(--accent-warning)', backgroundColor: 'transparent' }}>
            <ShieldCheck size={24} />
          </div>
          <div className="info-content">
            <h3>Excepción de Riesgo Inminente</h3>
            <p>
              La única excepción a nuestra regla de confidencialidad es si manifiestas intenciones claras de lastimarte a ti mismo o a otros. En esos casos de fuerza mayor, el sistema está diseñado para recomendar insistentemente líneas de ayuda y, en un entorno institucional (como tu escuela), podría emitir una alerta generalizada sin revelar el contenido del chat, por tu propia seguridad vital.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
