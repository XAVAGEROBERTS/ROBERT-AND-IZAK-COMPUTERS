// src/pages/WhatsAppDashboard.js
import React, { useState, useEffect } from 'react';
import { MessageCircle, Users, Phone, Clock, CheckCheck, X, Send } from 'lucide-react';

const WhatsAppDashboard = ({ businessNumber = '+256765673373' }) => {
  const [status, setStatus] = useState('disconnected');
  const [qrCode, setQrCode] = useState(null);
  const [messages, setMessages] = useState([]);
  const [activeChats, setActiveChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');

  useEffect(() => {
    // Connect to WebSocket
    const socket = io('http://localhost:3001');
    
    socket.on('business-status', (data) => {
      setStatus(data.status);
    });

    socket.on('business-qr', (data) => {
      setQrCode(data.qr);
    });

    socket.on('whatsapp-message', (message) => {
      setMessages(prev => [...prev, message]);
      // Update active chats
      updateActiveChats(message);
    });

    return () => socket.disconnect();
  }, []);

  const updateActiveChats = (message) => {
    const chatId = message.from.split('@')[0];
    setActiveChats(prev => {
      const existing = prev.find(c => c.id === chatId);
      if (existing) {
        return prev.map(c => 
          c.id === chatId 
            ? { ...c, lastMessage: message, unread: c.unread + 1 }
            : c
        );
      } else {
        return [...prev, {
          id: chatId,
          number: chatId,
          lastMessage: message,
          unread: 1,
          lastSeen: new Date()
        }];
      }
    });
  };

  const handleSendReply = () => {
    if (!replyMessage.trim() || !selectedChat) return;

    // Send via API
    fetch('/api/whatsapp/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: selectedChat,
        message: replyMessage
      })
    });

    setReplyMessage('');
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar - Active Chats */}
      <div style={{ width: '300px', borderRight: '1px solid #ddd', background: '#f8f9fa' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #ddd' }}>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <MessageCircle color="#25D366" />
            WhatsApp Business
          </h2>
          <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: status === 'connected' ? '#25D366' : '#ff4444'
            }} />
            <span>{status === 'connected' ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>

        {status !== 'connected' && qrCode && (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <h3>Scan QR Code</h3>
            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrCode}`} alt="QR Code" />
            <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
              Scan with WhatsApp on your phone
            </p>
          </div>
        )}

        <div style={{ padding: '10px' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#666' }}>Active Chats</h3>
          {activeChats.map(chat => (
            <div
              key={chat.id}
              onClick={() => setSelectedChat(chat.id)}
              style={{
                padding: '15px',
                borderBottom: '1px solid #eee',
                cursor: 'pointer',
                background: selectedChat === chat.id ? '#e8f4ff' : 'transparent'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong>{chat.number}</strong>
                {chat.unread > 0 && (
                  <span style={{
                    background: '#25D366',
                    color: 'white',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px'
                  }}>
                    {chat.unread}
                  </span>
                )}
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                {chat.lastMessage?.text?.substring(0, 30)}...
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {selectedChat ? (
          <>
            <div style={{
              padding: '20px',
              borderBottom: '1px solid #ddd',
              background: '#f8f9fa'
            }}>
              <h3 style={{ margin: 0 }}>Chat with {selectedChat}</h3>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
              {messages
                .filter(m => m.from.includes(selectedChat) || m.to.includes(selectedChat))
                .map((msg, index) => (
                  <div
                    key={index}
                    style={{
                      marginBottom: '10px',
                      textAlign: msg.type === 'outgoing' ? 'right' : 'left'
                    }}
                  >
                    <div style={{
                      display: 'inline-block',
                      background: msg.type === 'outgoing' ? '#DCF8C6' : 'white',
                      padding: '10px 15px',
                      borderRadius: '10px',
                      maxWidth: '70%'
                    }}>
                      {msg.text}
                      <div style={{ fontSize: '11px', color: '#999', marginTop: '5px' }}>
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            <div style={{
              padding: '20px',
              borderTop: '1px solid #ddd',
              display: 'flex',
              gap: '10px'
            }}>
              <input
                type="text"
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Type your reply..."
                style={{
                  flex: 1,
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
                onKeyPress={(e) => e.key === 'Enter' && handleSendReply()}
              />
              <button
                onClick={handleSendReply}
                style={{
                  padding: '10px 20px',
                  background: '#25D366',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                <Send size={18} />
              </button>
            </div>
          </>
        ) : (
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#999'
          }}>
            Select a chat to start messaging
          </div>
        )}
      </div>
    </div>
  );
};

export default WhatsAppDashboard;