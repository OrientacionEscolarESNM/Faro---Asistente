import React from 'react';
import './Chat.css';

export default function MessageBubble({ message, isUser }) {
  return (
    <div className={`message-wrapper ${isUser ? 'message-user' : 'message-faro'} animate-fade-in`}>
      {!isUser && (
        <div className="message-avatar">
          F
        </div>
      )}
      <div className="message-bubble">
        <p>{message}</p>
      </div>
      {isUser && (
        <div className="message-avatar user-avatar">
          U
        </div>
      )}
    </div>
  );
}
