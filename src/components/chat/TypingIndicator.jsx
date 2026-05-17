import './Chat.css';

export default function TypingIndicator() {
  return (
    <div className="message-wrapper message-faro animate-fade-in">
      <div className="message-avatar">F</div>
      <div className="message-bubble typing-bubble">
        <div className="typing-dot"></div>
        <div className="typing-dot"></div>
        <div className="typing-dot"></div>
      </div>
    </div>
  );
}
