import { useState, useRef, useEffect } from 'react';
import ChatInput from '../components/chat/ChatInput';
import MessageBubble from '../components/chat/MessageBubble';
import WelcomeCard from '../components/chat/WelcomeCard';
import TypingIndicator from '../components/chat/TypingIndicator';
import { getFaroResponse } from '../lib/faroPrompt';
import './Pages.css';

const MESSAGE_LIMIT = 15;

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  
  // Estado del usuario (Nombre y Edad)
  const [userName, setUserName] = useState(() => sessionStorage.getItem('faro_user_name') || '');
  const [userAge, setUserAge] = useState(() => sessionStorage.getItem('faro_user_age') || '');
  
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

  // Si el usuario ya está registrado pero el chat está vacío, iniciar con un saludo personalizado
  useEffect(() => {
    if (userName && userAge && messages.length === 0) {
      const initGreeting = {
        id: Date.now(),
        text: `¡Hola, ${userName}! 👋 Qué alegría saludarte. Sé que tienes ${userAge} años y estás buscando orientación. Estoy aquí para escucharte y apoyarte con todo mi cariño en este espacio seguro. ¿Cómo te has sentido hoy?`,
        sender: 'faro'
      };
      setMessages([initGreeting]);
    }
  }, [userName, userAge]);

  // Función para determinar el contacto recomendado según el horario actual de Colombia
  const getRecommendedEmergencyContact = () => {
    const now = new Date();
    const hours = now.getHours();
    
    // Horario de atención de orientación escolar: 7:00 AM a 2:00 PM (horas 7 a 13)
    if (hours >= 7 && hours < 14) {
      return "orientador escolar al **321 463 7057** (quien está disponible en este momento en jornada escolar)";
    } else {
      return "Línea Amiga al **322 784 2874** (atención gratuita de salud mental disponible las 24 horas fuera de jornada escolar)";
    }
  };

  const handleOnboardingSubmit = (name, age) => {
    setUserName(name);
    setUserAge(age);
    sessionStorage.setItem('faro_user_name', name);
    sessionStorage.setItem('faro_user_age', age);
  };

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

    try {
      let responseText = await getFaroResponse(text, userName, userAge);
      
      // Si el usuario llega al límite en este mensaje, le adjuntamos una nota clínica explicativa
      if (nextCount === MESSAGE_LIMIT) {
        responseText += `\n\n📢 **Nota de Faro:** He notado que hemos charlado bastante hoy. Me alegra mucho acompañarte, pero recuerda que soy un asistente de Inteligencia Artificial y tengo mis límites. **No puedo reemplazar la atención humana**.\n\nPor el horario en que nos escribes, te recomiendo enormemente que te comuniques con el ${getRecommendedEmergencyContact()}.\n\n¡Muchas gracias por confiar en mí y estaré encantado de volver a conversar en otra sesión!`;
      }
      
      const faroMsg = { id: Date.now() + 1, text: responseText, sender: 'faro' };
      setMessages((prev) => [...prev, faroMsg]);
    } catch (error) {
      console.error("Error fetching Faro response:", error);
    } finally {
      setIsTyping(false);
    }
  };

  const isOnboarded = userName !== '' && userAge !== '';

  return (
    <div className="chat-container animate-fade-in">
      <div className="chat-header">
        <h2>Orientación con Faro</h2>
        <p>
          {isOnboarded 
            ? `Espacio seguro y confidencial (${messageCount}/${MESSAGE_LIMIT} mensajes)` 
            : 'Registro Inicial'}
        </p>
      </div>
      
      <div className="chat-messages">
        {!isOnboarded ? (
          <WelcomeCard 
            isOnboarded={false}
            onSubmitOnboarding={handleOnboardingSubmit} 
          />
        ) : messages.length <= 1 ? (
          <WelcomeCard 
            isOnboarded={true}
            userName={userName}
            onActionClick={handleSendMessage} 
          />
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

      {isOnboarded && (
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
              🔒 **Límite de conversación alcanzado en esta sesión ({MESSAGE_LIMIT}/{MESSAGE_LIMIT}):**<br /><br />
              Para Faro tu bienestar es lo más importante, pero la Inteligencia Artificial nunca debe reemplazar el contacto humano.<br />
              Te invitamos de forma especial a comunicarte con el {getRecommendedEmergencyContact()} o consultar nuestro menú de **Emergencia**.<br /><br />
              ¡Muchas gracias por confiar en mí y que tengas un excelente día!
            </div>
          ) : (
            <ChatInput onSend={handleSendMessage} disabled={isTyping} />
          )}
        </div>
      )}
    </div>
  );
}
