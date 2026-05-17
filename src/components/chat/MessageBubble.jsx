import React from 'react';
import './Chat.css';

export default function MessageBubble({ message, isUser }) {
  const parseMessage = (text) => {
    if (!text) return "";
    
    // 1. Escapar caracteres HTML básicos para seguridad
    let html = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
      
    // 2. Convertir números de 10 dígitos (Casanare / Colombia) en links telefónicos clickeables (tel:)
    html = html.replace(/\b(3\d{2}[\s-]?\d{3}[\s-]?\d{4})\b/g, (match) => {
      const cleanNum = match.replace(/[\s-]/g, "");
      return `<a href="tel:${cleanNum}" style="color: var(--accent-color, #3b82f6); font-weight: 700; text-decoration: underline;">${match}</a>`;
    });

    // Convertir línea corta 141 (ICBF)
    html = html.replace(/\b(141)\b/g, `<a href="tel:141" style="color: var(--accent-color, #3b82f6); font-weight: 700; text-decoration: underline;">141</a>`);
    
    // 3. Convertir negritas (**texto**)
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // 4. Formatear viñetas de lista (- item)
    html = html.replace(/^-\s+([^\n]+)/gm, '• $1');

    // 5. Convertir saltos de línea en <br />
    html = html.split('\n').join('<br />');

    return <span dangerouslySetInnerHTML={{ __html: html }} />;
  };

  return (
    <div className={`message-wrapper ${isUser ? 'message-user' : 'message-faro'} animate-fade-in`}>
      {!isUser && (
        <div className="message-avatar">
          F
        </div>
      )}
      <div className="message-bubble">
        <p>{parseMessage(message)}</p>
      </div>
      {isUser && (
        <div className="message-avatar user-avatar">
          U
        </div>
      )}
    </div>
  );
}
