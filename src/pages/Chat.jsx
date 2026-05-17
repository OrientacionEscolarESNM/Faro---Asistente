import { useState, useRef, useEffect } from 'react';
import ChatInput from '../components/chat/ChatInput';
import MessageBubble from '../components/chat/MessageBubble';
import WelcomeCard from '../components/chat/WelcomeCard';
import TypingIndicator from '../components/chat/TypingIndicator';
import { getFaroResponse } from '../lib/faroPrompt';
import './Pages.css';

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (text) => {
    if (!text.trim()) return;
    
    // Add user message
    const userMsg = { id: Date.now(), text, sender: 'user' };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    // Simulate API call to get Faro's response
    try {
      const responseText = await getFaroResponse(text);
      
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
        <p>Espacio seguro y confidencial</p>
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
        <ChatInput onSend={handleSendMessage} disabled={isTyping} />
      </div>
    </div>
  );
}
