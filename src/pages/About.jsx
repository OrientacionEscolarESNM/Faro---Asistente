import { Info, Shield, BookOpen } from 'lucide-react';
import './Pages.css';

export default function About() {
  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <h1>Acerca de Faro</h1>
        <p>Conoce más sobre tu asistente de orientación personal.</p>
      </div>

      <div className="about-content" style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Info size={24} color="var(--brand-primary)" /> ¿Qué es Faro?
          </h2>
          <p>
            Faro es un asistente virtual diseñado específicamente para ofrecer apoyo, orientación y un espacio de escucha activa a estudiantes y jóvenes. Su nombre proviene de la idea de ser una luz guía en momentos de incertidumbre, estrés o confusión.
          </p>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookOpen size={24} color="var(--brand-primary)" /> Enfoque Pedagógico
          </h2>
          <p>
            Faro no es un sustituto de la terapia psicológica profesional, sino un puente de primer contacto. Está programado con principios de escucha activa, empatía y comunicación no violenta.
          </p>
          <ul style={{ paddingLeft: '1.5rem', marginTop: '1rem' }}>
            <li>Ayuda a identificar y nombrar emociones.</li>
            <li>Ofrece técnicas básicas de regulación emocional (como respiración).</li>
            <li>Deriva a líneas de ayuda profesionales cuando identifica factores de riesgo.</li>
          </ul>
        </div>

        <div className="info-card" style={{ marginTop: '3rem' }}>
          <div className="info-icon" style={{ backgroundColor: 'var(--bg-primary)' }}>
            <Shield size={24} color="var(--accent-success)" />
          </div>
          <div className="info-content">
            <h3>Espacio Seguro</h3>
            <p>
              Tus conversaciones con Faro están diseñadas para ser privadas. No juzgamos, solo escuchamos y orientamos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
