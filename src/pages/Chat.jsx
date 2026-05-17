import { useState, useRef, useEffect } from 'react';
import ChatInput from '../components/chat/ChatInput';
import MessageBubble from '../components/chat/MessageBubble';
import WelcomeCard from '../components/chat/WelcomeCard';
import TypingIndicator from '../components/chat/TypingIndicator';
import { getFaroResponse } from '../lib/faroPrompt';
import './Pages.css';

const MESSAGE_LIMIT = 20;

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [messageCount, setMessageCount] = useState(() => {
    const saved = sessionStorage.getItem('faro_message_count');
    return saved ? parseInt(saved, 10) : 0;
  });

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (text) => {
    if (!text.trim()) return;
    if (messageCount >= MESSAGE_LIMIT) return;

    // Incrementar y guardar el contador
    const nextCount = messageCount + 1;
    setMessageCount(nextCount);
    sessionStorage.setItem('faro_message_count', nextCount.toString());
    
    // Add user message
    const userMsg = { id: Date.now(), text, sender: 'user' };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    // Simulate API call to get Faro's response
    try {
      let responseText = await getFaroResponse(text);
      
      // Si el usuario llega al límite en este mensaje, le adjuntamos una nota clínica explicativa
      if (nextCount === MESSAGE_LIMIT) {
        responseText += "\n\n📢 **Nota de Faro:** He notado que hemos charlado bastante hoy. Me alegra mucho acompañarte, pero recuerda que soy un asistente de Inteligencia Artificial y tengo mis límites. **No puedo reemplazar la atención humana**. Te recomiendo enormemente que hables de cómo te sientes con tu **orientador escolar (321 463 7057)** o con un adulto protector. Si te encuentras en una crisis, consulta el menú de **Emergencia** en el lateral. ¡Estaré encantado de volver a conversar en otra sesión!";
      }
      
      const faroMsg = { id: Date.now() + 1, text: responseText, sender: 'faro' };
      setMessages((prev) => [...prev, faroMsg]);
    } catch (error) {
      console.error("Error fetching Faro response:", error);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="chat-container animate-fade-in">
      <div className="chat-header">
        <h2>Orientación con Faro</h2>
        <p>Espacio seguro y confidencial ({messageCount}/{MESSAGE_LIMIT} mensajes)</p>
      </div>
      <div className="chat-messages">
        {messages.length === 0 ? (
          <WelcomeCard onActionClick={handleSendMessage} />
        ) : (
          <div className="messages-list">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg.text} isUser={msg.sender === 'user'} />
            ))}
            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      <div className="chat-input-wrapper">
        {messageCount >= MESSAGE_LIMIT ? (
          <div className="limit-warning-box animate-fade-in" style={{
            padding: '1.25rem',
            textAlign: 'center',
            backgroundColor: 'rgba(59, 130, 246, 0.08)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            borderRadius: '12px',
            color: 'var(--text-secondary)',
            fontSize: '0.9rem',
            lineHeight: '1.5'
          }}>
            🔒 **Límite de conversación alcanzado en esta sesión ({MESSAGE_LIMIT}/{MESSAGE_LIMIT}):**<br />
            Para Faro tu bienestar es lo más importante, pero la Inteligencia Artificial nunca debe reemplazar el contacto humano. 
            Te invitamos a conversar con tu orientador escolar al **321 463 7057** o consultar nuestro menú de **Emergencia**. 
            ¡Muchas gracias por confiar en mí!
          </div>
        ) : (
          <ChatInput onSend={handleSendMessage} disabled={isTyping} />
        )}
      </div>
    </div>
  );
}
