// src/components/WhatsAppChat.js
import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Phone, User, Clock, Check, CheckCheck } from 'lucide-react';
import whatsappService from '../utils/whatsappService';

const WhatsAppChat = ({ 
  user, 
  isOpen, 
  onClose,
  businessNumber = '+256765673373',
  businessName = 'Robert & Izak Support'
}) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Initialize WhatsApp service
  useEffect(() => {
    if (user && isOpen) {
      whatsappService.init(
        user.id,
        user.user_metadata?.first_name || user.email,
        user.user_metadata?.phone
      );

      const unsubscribe = whatsappService.onMessage((message) => {
        setMessages(prev => [...prev, {
          id: message.id,
          text: message.text,
          sender: 'agent',
          timestamp: new Date(message.timestamp),
          status: 'delivered'
        }]);
        
        // Mark as read
        setTimeout(() => {
          scrollToBottom();
        }, 100);
      });

      const onConnectionChange = whatsappService.onConnectionChange((connected) => {
        setIsConnected(connected);
        if (connected) {
          loadMessageHistory();
        }
      });

      return () => {
        unsubscribe();
        onConnectionChange();
      };
    }
  }, [user, isOpen]);

  // Load message history
  const loadMessageHistory = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/whatsapp/messages/${user.id}`);
      const data = await response.json();
      
      if (data.messages) {
        const formattedMessages = data.messages.map(msg => ({
          id: msg.id,
          text: msg.message,
          sender: msg.type === 'incoming' ? 'agent' : 'user',
          timestamp: new Date(msg.timestamp),
          status: msg.status
        })).reverse();
        
        setMessages(formattedMessages);
        setTimeout(scrollToBottom, 100);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle send message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !isConnected) return;

    const messageText = newMessage;
    setNewMessage('');

    // Add message to UI immediately
    const tempMessage = {
      id: Date.now(),
      text: messageText,
      sender: 'user',
      timestamp: new Date(),
      status: 'sending'
    };
    setMessages(prev => [...prev, tempMessage]);
    scrollToBottom();

    try {
      // Send via WhatsApp service
      const response = await whatsappService.sendMessage(
        businessNumber,
        messageText,
        { customerId: user.id }
      );

      // Update message status
      setMessages(prev => prev.map(msg => 
        msg.id === tempMessage.id 
          ? { ...msg, id: response.messageId, status: 'sent' }
          : msg
      ));

    } catch (error) {
      console.error('Error sending message:', error);
      // Show error state
      setMessages(prev => prev.map(msg => 
        msg.id === tempMessage.id 
          ? { ...msg, status: 'error' }
          : msg
      ));
    }
  };

  // Format timestamp
  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Get message status icon
  const getStatusIcon = (status) => {
    switch(status) {
      case 'sent': return <Check size={12} />;
      case 'delivered': return <CheckCheck size={12} />;
      case 'read': return <CheckCheck size={12} color="#34B7F1" />;
      case 'error': return <X size={12} color="#dc3545" />;
      default: return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '380px',
      height: '600px',
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 5px 40px rgba(0,0,0,0.16)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      zIndex: 1000,
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        background: '#075E54',
        color: 'white',
        padding: '15px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <MessageCircle size={24} />
          <div>
            <h3 style={{ margin: 0, fontSize: '16px' }}>{businessName}</h3>
            <div style={{ fontSize: '12px', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: isConnected ? '#25D366' : '#ff4444',
                display: 'inline-block'
              }} />
              {isConnected ? 'Online' : 'Connecting...'}
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            padding: '5px'
          }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Connection Status - Show QR if not connected */}
      {!isConnected && (
        <div style={{
          padding: '20px',
          textAlign: 'center',
          background: '#f8f9fa',
          borderBottom: '1px solid #dee2e6'
        }}>
          <Phone size={32} color="#6c757d" />
          <p style={{ margin: '10px 0', color: '#6c757d' }}>
            Connecting to WhatsApp...
          </p>
          <p style={{ fontSize: '12px', color: '#999' }}>
            Please ensure your WhatsApp is connected
          </p>
        </div>
      )}

      {/* Messages */}
      <div ref={chatContainerRef} style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
        background: '#e5ddd5',
        backgroundImage: 'url("https://web.whatsapp.com/img/bg-chat-tile-light_04fc847e12a190652f4907ba1b06b49e.png")',
        backgroundRepeat: 'repeat'
      }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: '#999'
          }}>
            <MessageCircle size={48} />
            <p>No messages yet. Start a conversation!</p>
            <p style={{ fontSize: '12px' }}>
              Your messages will be delivered to our WhatsApp
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                marginBottom: '10px'
              }}
            >
              <div style={{
                maxWidth: '70%',
                background: msg.sender === 'user' ? '#DCF8C6' : 'white',
                borderRadius: '10px',
                padding: '8px 12px',
                boxShadow: '0 1px 1px rgba(0,0,0,0.1)',
                position: 'relative'
              }}>
                {msg.sender === 'agent' && (
                  <div style={{ fontWeight: 'bold', color: '#075E54', fontSize: '12px', marginBottom: '4px' }}>
                    Support Agent
                  </div>
                )}
                <div style={{ wordWrap: 'break-word' }}>{msg.text}</div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  gap: '4px',
                  marginTop: '4px',
                  fontSize: '11px',
                  color: '#999'
                }}>
                  <span>{formatTime(msg.timestamp)}</span>
                  {msg.sender === 'user' && getStatusIcon(msg.status)}
                </div>
              </div>
            </div>
          ))
        )}
        {isTyping && (
          <div style={{ display: 'flex', marginBottom: '10px' }}>
            <div style={{
              background: 'white',
              borderRadius: '10px',
              padding: '8px 12px',
              boxShadow: '0 1px 1px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'flex', gap: '4px' }}>
                <span style={{ animation: 'typing 1s infinite' }}>•</span>
                <span style={{ animation: 'typing 1s infinite 0.2s' }}>•</span>
                <span style={{ animation: 'typing 1s infinite 0.4s' }}>•</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '15px',
        background: '#f0f0f0',
        borderTop: '1px solid #ddd',
        display: 'flex',
        gap: '10px'
      }}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder={isConnected ? "Type a message..." : "Connecting..."}
          disabled={!isConnected}
          style={{
            flex: 1,
            padding: '10px 15px',
            border: 'none',
            borderRadius: '20px',
            outline: 'none',
            fontSize: '14px'
          }}
        />
        <button
          onClick={handleSendMessage}
          disabled={!isConnected || !newMessage.trim()}
          style={{
            background: !isConnected || !newMessage.trim() ? '#ccc' : '#25D366',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: !isConnected || !newMessage.trim() ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <Send size={18} color="white" />
        </button>
      </div>

      {/* Typing animation style */}
      <style jsx>{`
        @keyframes typing {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default WhatsAppChat;