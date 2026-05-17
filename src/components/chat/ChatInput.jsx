import { useState } from 'react';
import { Send, Paperclip } from 'lucide-react';
import './Chat.css';

export default function ChatInput({ onSend, disabled }) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message);
      setMessage('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form className="chat-input-form" onSubmit={handleSubmit}>
      <button type="button" className="icon-btn" title="Adjuntar archivo" disabled={disabled}>
        <Paperclip size={20} />
      </button>
      
      <textarea
        className="chat-textarea"
        placeholder="Escribe tu mensaje aquí..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        rows={1}
      />
      
      <button 
        type="submit" 
        className={`send-btn ${message.trim() ? 'active' : ''}`}
        disabled={!message.trim() || disabled}
      >
        <Send size={20} />
      </button>
    </form>
  );
}
