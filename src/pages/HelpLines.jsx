import { HeartHandshake, Phone, ExternalLink } from 'lucide-react';
import './Pages.css';

export default function HelpLines() {
  const lines = [
    {
      title: "Línea de Apoyo Psicológico Estudiantil",
      description: "Orientación profesional para el manejo del estrés, ansiedad académica y problemas familiares.",
      phone: "01-800-AYUDA-01",
      hours: "Lunes a Viernes, 8:00 AM - 8:00 PM"
    },
    {
      title: "Centro de Orientación Juvenil",
      description: "Asesoramiento para jóvenes en situaciones de riesgo, adicciones o violencia escolar.",
      phone: "800-JOVEN-22",
      hours: "Disponible 24 horas"
    },
    {
      title: "Atención a Víctimas de Bullying",
      description: "Reporte y acompañamiento psicológico y legal para casos de acoso escolar.",
      phone: "800-NO-ACOSO",
      hours: "Lunes a Domingo, 9:00 AM - 6:00 PM"
    }
  ];

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <h1>Líneas de Ayuda</h1>
        <p>Directorio de profesionales e instituciones dispuestas a escucharte y apoyarte de forma gratuita y confidencial.</p>
      </div>

      <div className="lines-list">
        {lines.map((line, idx) => (
          <div key={idx} className="info-card">
            <div className="info-icon">
              <HeartHandshake size={24} />
            </div>
            <div className="info-content">
              <h3>{line.title}</h3>
              <p>{line.description}</p>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <a href={`tel:${line.phone}`} className="btn btn-primary">
                  <Phone size={16} /> {line.phone}
                </a>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {line.hours}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div style={{ marginTop: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        <p>¿No encuentras lo que buscas? Faro puede ayudarte a identificar la línea adecuada para ti.</p>
      </div>
    </div>
  );
}
