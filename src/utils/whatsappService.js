// src/utils/whatsappService.js
import { io } from 'socket.io-client';

// This would connect to your backend WebSocket server
const SOCKET_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-backend-server.com' 
  : 'http://localhost:3001';

class WhatsAppService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.messageHandlers = [];
    this.connectionCallbacks = [];
  }

  // Initialize connection to your backend
  init(userId, userName, userPhone) {
    if (this.socket) return;

    console.log('Initializing WhatsApp service...');
    
    this.socket = io(SOCKET_URL, {
      query: {
        userId,
        userName,
        userPhone: userPhone || '+256765673373' // Default to your business number
      },
      transports: ['websocket']
    });

    this.socket.on('connect', () => {
      console.log('✅ Connected to WhatsApp service');
      this.isConnected = true;
      this.connectionCallbacks.forEach(cb => cb(true));
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Disconnected from WhatsApp service');
      this.isConnected = false;
      this.connectionCallbacks.forEach(cb => cb(false));
    });

    // Listen for incoming messages from WhatsApp
    this.socket.on('whatsapp-message', (message) => {
      console.log('📱 New WhatsApp message:', message);
      this.messageHandlers.forEach(handler => handler(message));
    });

    // Listen for message status updates
    this.socket.on('message-status', (status) => {
      console.log('📱 Message status:', status);
    });
  }

  // Send a message from website to WhatsApp
  sendMessage(to, message, metadata = {}) {
    if (!this.isConnected || !this.socket) {
      console.error('WhatsApp service not connected');
      return Promise.reject(new Error('Service not connected'));
    }

    return new Promise((resolve, reject) => {
      this.socket.emit('send-message', {
        to, // Your WhatsApp number or customer number
        message,
        metadata: {
          timestamp: new Date().toISOString(),
          ...metadata
        }
      }, (response) => {
        if (response.success) {
          resolve(response);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  // Register handler for incoming messages
  onMessage(handler) {
    this.messageHandlers.push(handler);
    return () => {
      this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
    };
  }

  // Register connection status callback
  onConnectionChange(callback) {
    this.connectionCallbacks.push(callback);
    if (this.isConnected !== undefined) {
      callback(this.isConnected);
    }
    return () => {
      this.connectionCallbacks = this.connectionCallbacks.filter(cb => cb !== callback);
    };
  }

  // Disconnect service
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }
}

export default new WhatsAppService();