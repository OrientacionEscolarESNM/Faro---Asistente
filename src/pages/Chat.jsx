import { useState, useRef, useEffect } from 'react';
import ChatInput from '../components/chat/ChatInput';
import MessageBubble from '../components/chat/MessageBubble';
import WelcomeCard from '../components/chat/WelcomeCard';
import TypingIndicator from '../components/chat/TypingIndicator';
import { getFaroResponse } from '../lib/faroPrompt';
import { getUserLocation } from '../lib/geolocation';
import './Pages.css';

const MESSAGE_LIMIT = 15;

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  
  // Estado del usuario
  const [userName, setUserName] = useState(() => sessionStorage.getItem('faro_user_name') || '');
  const [userAge, setUserAge] = useState(() => sessionStorage.getItem('faro_user_age') || '');
  const [userGender, setUserGender] = useState(() => sessionStorage.getItem('faro_user_gender') || '');
  
  // Estado de Ubicación
  const [locationData, setLocationData] = useState(() => {
    const saved = sessionStorage.getItem('faro_location');
    return saved ? JSON.parse(saved) : null;
  });

  const [messageCount, setMessageCount] = useState(() => {
    const saved = sessionStorage.getItem('faro_message_count');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [sessionId] = useState(() => {
    let saved = sessionStorage.getItem('faro_session_id');
    if (!saved) {
      saved = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('faro_session_id', saved);
    }
    return saved;
  });

  const messagesEndRef = useRef(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (userName && userAge && userGender && messages.length === 0) {
      const initGreeting = {
        id: Date.now(),
        text: `Hola, ${userName}. Gracias por escribir. Estoy aquí para escucharte y acompañarte en lo que necesites. ¿Cómo te has sentido?`,
        sender: 'faro'
      };
      setMessages([initGreeting]);
    }
  }, [userName, userAge, userGender]);

  const getRecommendedEmergencyContact = () => {
    const now = new Date();
    const hours = now.getHours();
    if (hours >= 7 && hours < 14) {
      return "orientador escolar al **321 463 7057** (quien está disponible en este momento en jornada escolar)";
    } else {
      return "Línea Amiga al **322 784 2874** (atención gratuita de salud mental disponible las 24 horas fuera de jornada escolar)";
    }
  };

  const handleOnboardingSubmit = async (name, age, gender) => {
    setUserName(name);
    setUserAge(age);
    setUserGender(gender);
    sessionStorage.setItem('faro_user_name', name);
    sessionStorage.setItem('faro_user_age', age);
    sessionStorage.setItem('faro_user_gender', gender);

    // Intentar obtener ubicación al inicio
    const loc = await getUserLocation();
    setLocationData(loc);
    sessionStorage.setItem('faro_location', JSON.stringify(loc));
  };

  const retryLocation = async () => {
    const loc = await getUserLocation();
    setLocationData(loc);
    sessionStorage.setItem('faro_location', JSON.stringify(loc));
    if (loc.coords) {
      // Notificar al sistema con un mensaje en la UI
      setMessages(prev => [...prev, { id: Date.now(), text: "✅ Ubicación compartida exitosamente por el usuario.", sender: 'faro' }]);
    } else {
      setMessages(prev => [...prev, { id: Date.now(), text: "❌ Aún no hemos podido acceder a la ubicación. Asegúrate de desbloquearla tocando el candado.", sender: 'faro' }]);
    }
  };

  const handleSendMessage = async (text) => {
    if (!text.trim()) return;
    if (messageCount >= MESSAGE_LIMIT) return;

    const nextCount = messageCount + 1;
    setMessageCount(nextCount);
    sessionStorage.setItem('faro_message_count', nextCount.toString());
    
    const userMsg = { id: Date.now(), text, sender: 'user' };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    // Intentar recuperar la ubicación dinámicamente si no está en memoria
    let currentLocation = locationData;
    if (!currentLocation || !currentLocation.coords) {
      currentLocation = await getUserLocation();
      setLocationData(currentLocation);
      sessionStorage.setItem('faro_location', JSON.stringify(currentLocation));
    }

    try {
      // Obtener últimos 30 mensajes del historial (excluyendo el actual que se envía aparte) para no perder contexto
      const historyToPass = messages.slice(-30).map(m => ({ text: m.text, sender: m.sender }));
      
      // location puede ser null o tener datos
      let responseObj = await getFaroResponse(text, userName, userAge, currentLocation?.coords || currentLocation?.status || "No solicitada", sessionId, userGender, historyToPass);
      let responseText = responseObj.text;
      const isEmergency = responseObj.isEmergency;
      
      if (isEmergency) {
        responseText += `\n\n📌 **Por favor, recuerda que no estás solo y hay personas maravillosas listas para escucharte y apoyarte ahora mismo. Comunícate con ellas con total confianza:**\n\n` +
                       `📞 **Línea Amiga Casanare:** [322 784 2874](tel:3227842874) *(Disponible las 24 horas, llamada o WhatsApp)*\n` +
                       `📞 **Orientación Escolar ESNM:** [321 463 7057](tel:3214637057) *(Disponible en jornada escolar)*\n` +
                       `📞 **Bomberos Monterrey:** [312 550 0806](tel:3125500806) *(Para emergencias vitales inmediatas)*\n\n` +
                       `*Ellos te atenderán de manera 100% confidencial, libre de juicios y con mucho cariño.*`;
      }
      
      if (nextCount === MESSAGE_LIMIT) {
        responseText += `\n\n📢 **Nota de Faro:** He notado que hemos charlado bastante hoy. Me alegra mucho acompañarte, pero recuerda que soy un asistente de Inteligencia Artificial y tengo mis límites. **No puedo reemplazar la atención humana**.\n\nPor el horario en que nos escribes, te recomiendo enormemente que te comuniques con el ${getRecommendedEmergencyContact()}.\n\n¡Muchas gracias por confiar en mí y estaré encantado de volver a conversar en otra sesión!`;
      }
      
      const faroMsg = { id: Date.now() + 1, text: responseText, sender: 'faro' };
      setMessages((prev) => [...prev, faroMsg]);

      // Si es emergencia y la ubicación fue bloqueada o no está disponible, insistir fuertemente
      if (isEmergency && (!currentLocation || !currentLocation.coords)) {
        setTimeout(() => {
          const insistMsg = {
            id: Date.now() + 2,
            text: "⚠️ **IMPORTANTE:** Para poder brindarte la ayuda necesaria y proteger tu integridad, **necesitamos conocer tu ubicación**. Hemos detectado que el acceso está bloqueado.\n\nPor favor, toca el ícono del **candado 🔒** en la barra de direcciones de tu navegador, cambia el permiso de ubicación a 'Permitir' y luego actualiza esta página o intenta enviar otro mensaje.",
            sender: 'faro'
          };
          setMessages((prev) => [...prev, insistMsg]);
        }, 1500); // Pequeño retraso para que lea el primer mensaje
      }

    } catch (error) {
      console.error("Error fetching Faro response:", error);
    } finally {
      setIsTyping(false);
    }
  };

  const isOnboarded = userName !== '' && userAge !== '' && userGender !== '';

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
