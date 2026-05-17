import { HeartHandshake, Phone, ExternalLink, Brain, Home, Scale, Flame } from 'lucide-react';
import './Pages.css';

export default function HelpLines() {
  const lines = [
    {
      title: "Línea Amiga",
      category: "Salud mental y prevención",
      description: "Atención especializada, contención emocional y prevención del suicidio en el departamento de Casanare.",
      phone: "322 784 2874",
      icon: "Brain"
    },
    {
      title: "Bienestar Familiar (ICBF)",
      category: "Protección infantil",
      description: "Protección infantil y reporte de vulneración de derechos de niños, niñas y adolescentes en Colombia.",
      phone: "141",
      icon: "Home"
    },
    {
      title: "Fiscalía General de la Nación",
      category: "Denuncias en línea",
      description: "Plataforma oficial Sicecon Digital para registrar denuncias de delitos de forma segura y en línea.",
      link: "https://sicecon.fiscalia.gov.co/denuncia/LlenarFormulario",
      linkText: "Sicecon Digital",
      icon: "Scale"
    },
    {
      title: "Bomberos Monterrey",
      category: "Atención inmediata local",
      description: "Cuerpo de Bomberos Voluntarios de Monterrey Casanare. Atención inmediata local de emergencias.",
      phone: "312 550 0806",
      icon: "Flame"
    }
  ];

  const getIcon = (iconName) => {
    switch (iconName) {
      case 'Brain': return <Brain size={24} />;
      case 'Home': return <Home size={24} />;
      case 'Scale': return <Scale size={24} />;
      case 'Flame': return <Flame size={24} />;
      default: return <HeartHandshake size={24} />;
    }
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <h1>Líneas de Ayuda</h1>
        <p>Directorio oficial de profesionales e instituciones de apoyo gratuito y confidencial para Monterrey Casanare y Colombia.</p>
      </div>

      <div className="lines-list">
        {lines.map((line, idx) => (
          <div key={idx} className="info-card">
            <div className="info-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {getIcon(line.icon)}
            </div>
            <div className="info-content">
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent-color)', fontWeight: '700' }}>
                {line.category}
              </span>
              <h3 style={{ marginTop: '0.25rem', marginBottom: '0.5rem' }}>{line.title}</h3>
              <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>{line.description}</p>
              <div>
                {line.phone ? (
                  <a href={`tel:${line.phone.replace(/\s+/g, '')}`} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Phone size={16} /> {line.phone === "141" ? "Llamar a la Línea 141" : `Llamar al ${line.phone}`}
                  </a>
                ) : (
                  <a href={line.link} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ExternalLink size={16} /> Ir a {line.linkText}
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div style={{ marginTop: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        <p>Tu bienestar y seguridad son la máxima prioridad. Recuerda que no estás solo/a.</p>
      </div>
    </div>
  );
}
