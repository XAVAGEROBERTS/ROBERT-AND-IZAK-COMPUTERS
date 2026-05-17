// backend/server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const moment = require('moment');
const bodyParser = require('body-parser');

// Load environment variables
dotenv.config();

// ============================================================================
// CONFIGURATION
// ============================================================================

const PORT = process.env.PORT || 3001;
const BUSINESS_WHATSAPP = process.env.BUSINESS_WHATSAPP || '+256741503916'; // YOUR BUSINESS NUMBER
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// WhatsApp Business API Configuration
const WHATSAPP_API_VERSION = 'v18.0'; // Use the latest version
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const WHATSAPP_BUSINESS_ACCOUNT_ID = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
const WHATSAPP_WEBHOOK_VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'robert-izak-webhook-token';

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ============================================================================
// EXPRESS APP SETUP
// ============================================================================

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// ============================================================================
// WHATSAPP BUSINESS API CLIENT
// ============================================================================

class WhatsAppBusinessClient {
  constructor() {
    this.accessToken = WHATSAPP_ACCESS_TOKEN;
    this.phoneNumberId = WHATSAPP_PHONE_NUMBER_ID;
    this.businessAccountId = WHATSAPP_BUSINESS_ACCOUNT_ID;
    this.apiVersion = WHATSAPP_API_VERSION;
    this.baseUrl = `https://graph.facebook.com/${this.apiVersion}`;
    this.status = 'connecting';
    this.lastActivity = new Date();
  }

  // Send a text message
  async sendTextMessage(to, text, options = {}) {
    try {
      const response = await axios({
        method: 'POST',
        url: `${this.baseUrl}/${this.phoneNumberId}/messages`,
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        data: {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: this.formatPhoneNumber(to),
          type: 'text',
          text: { 
            body: text,
            preview_url: options.previewUrl || false
          }
        }
      });

      this.lastActivity = new Date();
      return {
        success: true,
        messageId: response.data.messages[0].id,
        response: response.data
      };
    } catch (error) {
      console.error('Error sending WhatsApp message:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message
      };
    }
  }

  // Send a template message (for business-initiated conversations)
  async sendTemplateMessage(to, templateName, language = 'en', components = []) {
    try {
      const response = await axios({
        method: 'POST',
        url: `${this.baseUrl}/${this.phoneNumberId}/messages`,
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        data: {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: this.formatPhoneNumber(to),
          type: 'template',
          template: {
            name: templateName,
            language: {
              code: language
            },
            components: components
          }
        }
      });

      this.lastActivity = new Date();
      return {
        success: true,
        messageId: response.data.messages[0].id,
        response: response.data
      };
    } catch (error) {
      console.error('Error sending template:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message
      };
    }
  }

  // Send media message (image, document, audio, video)
  async sendMediaMessage(to, type, mediaUrl, caption = '') {
    try {
      const response = await axios({
        method: 'POST',
        url: `${this.baseUrl}/${this.phoneNumberId}/messages`,
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        data: {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: this.formatPhoneNumber(to),
          type: type,
          [type]: {
            link: mediaUrl,
            caption: caption
          }
        }
      });

      this.lastActivity = new Date();
      return {
        success: true,
        messageId: response.data.messages[0].id,
        response: response.data
      };
    } catch (error) {
      console.error(`Error sending ${type}:`, error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message
      };
    }
  }

  // Mark message as read
  async markAsRead(messageId) {
    try {
      const response = await axios({
        method: 'POST',
        url: `${this.baseUrl}/${this.phoneNumberId}/messages`,
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        data: {
          messaging_product: 'whatsapp',
          status: 'read',
          message_id: messageId
        }
      });

      return { success: true };
    } catch (error) {
      console.error('Error marking message as read:', error.response?.data || error.message);
      return { success: false };
    }
  }

  // Get business profile
  async getBusinessProfile() {
    try {
      const response = await axios({
        method: 'GET',
        url: `${this.baseUrl}/${this.phoneNumberId}/whatsapp_business_profile`,
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        },
        params: {
          fields: 'about,address,description,email,profile_picture_url,websites,vertical'
        }
      });

      return {
        success: true,
        profile: response.data.data[0]
      };
    } catch (error) {
      console.error('Error getting business profile:', error.response?.data || error.message);
      return { success: false };
    }
  }

  // Get phone numbers
  async getPhoneNumbers() {
    try {
      const response = await axios({
        method: 'GET',
        url: `${this.baseUrl}/${this.businessAccountId}/phone_numbers`,
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });

      return {
        success: true,
        phoneNumbers: response.data.data
      };
    } catch (error) {
      console.error('Error getting phone numbers:', error.response?.data || error.message);
      return { success: false };
    }
  }

  // Format phone number (remove + if present)
  formatPhoneNumber(number) {
    return number.replace('+', '');
  }

  // Check connection status
  async checkConnection() {
    try {
      const result = await this.getPhoneNumbers();
      if (result.success) {
        this.status = 'connected';
        return true;
      } else {
        this.status = 'disconnected';
        return false;
      }
    } catch (error) {
      this.status = 'error';
      return false;
    }
  }
}

// Initialize WhatsApp client
const whatsappClient = new WhatsAppBusinessClient();

// ============================================================================
// WEBHOOK HANDLER FOR INCOMING MESSAGES
// ============================================================================

// Webhook verification endpoint (GET)
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
    console.log('✅ Webhook verified successfully');
    res.status(200).send(challenge);
  } else {
    console.error('❌ Webhook verification failed');
    res.sendStatus(403);
  }
});

// Webhook for receiving messages (POST)
app.post('/webhook', async (req, res) => {
  try {
    const body = req.body;

    // Check if this is a WhatsApp webhook event
    if (body.object === 'whatsapp_business_account') {
      for (const entry of body.entry) {
        for (const change of entry.changes) {
          if (change.field === 'messages') {
            const messageData = change.value;
            
            // Process each message
            if (messageData.messages) {
              for (const message of messageData.messages) {
                await processIncomingMessage(message, messageData.contacts?.[0]);
              }
            }
            
            // Process message status updates
            if (messageData.statuses) {
              for (const status of messageData.statuses) {
                await processMessageStatus(status);
              }
            }
          }
        }
      }
      res.sendStatus(200);
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.sendStatus(500);
  }
});

// Process incoming message
async function processIncomingMessage(message, contact) {
  console.log(`📨 Incoming message: ${message.id} from ${message.from}`);

  // Extract message content based on type
  let messageContent = '';
  let messageType = message.type;

  if (message.type === 'text') {
    messageContent = message.text.body;
  } else if (message.type === 'image') {
    messageContent = message.image.caption || '📷 Image received';
  } else if (message.type === 'document') {
    messageContent = `📄 Document: ${message.document.filename || 'Unknown'}`;
  } else if (message.type === 'audio') {
    messageContent = '🎵 Audio message';
  } else if (message.type === 'video') {
    messageContent = '🎥 Video message';
  } else if (message.type === 'location') {
    messageContent = `📍 Location: ${message.location.latitude},${message.location.longitude}`;
  } else {
    messageContent = `📨 ${message.type} message`;
  }

  // Look up customer by phone number
  const phoneNumber = message.from;
  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .select('id, email, first_name, last_name')
    .eq('phone', phoneNumber)
    .maybeSingle();

  const customerId = customer?.id || null;

  // Store message in database
  const { data: dbMessage, error: dbError } = await supabase
    .from('whatsapp_messages')
    .insert([{
      from_number: message.from,
      to_number: BUSINESS_WHATSAPP,
      message: messageContent,
      message_id: message.id,
      timestamp: new Date().toISOString(),
      type: 'incoming',
      status: 'received',
      customer_id: customerId,
      metadata: {
        type: message.type,
        raw: message,
        contact: contact
      }
    }])
    .select()
    .single();

  if (dbError) {
    console.error('Error storing message:', dbError);
  }

  // Emit to connected clients
  io.emit('whatsapp-message', {
    id: dbMessage?.id || Date.now(),
    from: message.from,
    fromFormatted: phoneNumber,
    to: BUSINESS_WHATSAPP,
    text: messageContent,
    timestamp: new Date(),
    type: 'incoming',
    messageType: message.type,
    customer: customer || { phone: phoneNumber },
    customerId: customerId,
    raw: message
  });

  // If customer is online, emit to their specific room
  if (customerId) {
    io.to(`customer-${customerId}`).emit('new-message', {
      id: dbMessage?.id || Date.now(),
      from: 'agent',
      text: messageContent,
      timestamp: new Date()
    });
  }
}

// Process message status updates
async function processMessageStatus(status) {
  console.log(`📊 Message ${status.id} status: ${status.status}`);

  // Update message status in database
  await supabase
    .from('whatsapp_messages')
    .update({ status: status.status })
    .eq('message_id', status.id);

  // Emit status update
  io.emit('message-status', {
    messageId: status.id,
    status: status.status,
    timestamp: new Date()
  });
}

// ============================================================================
// SOCKET.IO CONNECTION HANDLING
// ============================================================================

io.on('connection', (socket) => {
  console.log('🔌 New client connected:', socket.id);
  
  const { userId, userType, userPhone } = socket.handshake.query;

  // Join rooms based on user type
  if (userType === 'admin') {
    socket.join('admins');
    console.log('👑 Admin connected:', socket.id);
    
    // Send current status
    socket.emit('business-status', {
      businessNumber: BUSINESS_WHATSAPP,
      status: whatsappClient.status,
      message: 'WhatsApp Business API connected'
    });
  } else if (userId) {
    socket.join(`customer-${userId}`);
    console.log('👤 Customer connected:', userId);
  }

  // Handle sending message from website to WhatsApp
  socket.on('send-message', async (data, callback) => {
    try {
      const { to, message, customerId, metadata } = data;
      
      if (whatsappClient.status !== 'connected') {
        await whatsappClient.checkConnection();
      }

      // Send via WhatsApp Business API
      const result = await whatsappClient.sendTextMessage(to, message);
      
      if (!result.success) {
        callback({ success: false, error: result.error });
        return;
      }

      // Store in database
      const { data: dbMessage, error: dbError } = await supabase
        .from('whatsapp_messages')
        .insert([{
          from_number: BUSINESS_WHATSAPP,
          to_number: to,
          message: message,
          message_id: result.messageId,
          timestamp: new Date().toISOString(),
          type: 'outgoing',
          status: 'sent',
          customer_id: customerId || userId || null,
          metadata
        }])
        .select()
        .single();

      if (dbError) {
        console.error('Error storing outgoing message:', dbError);
      }

      callback({ 
        success: true, 
        messageId: result.messageId,
        dbId: dbMessage?.id
      });

    } catch (error) {
      console.error('Error sending message:', error);
      callback({ success: false, error: error.message });
    }
  });

  // Get message history for a customer
  socket.on('get-messages', async (data, callback) => {
    try {
      const { customerId, phoneNumber, limit = 50 } = data;
      
      let query = supabase
        .from('whatsapp_messages')
        .select('*, customer:customers(id, email, first_name, last_name)')
        .order('timestamp', { ascending: false })
        .limit(limit);
      
      if (customerId) {
        query = query.eq('customer_id', customerId);
      } else if (phoneNumber) {
        query = query.or(`from_number.ilike.%${phoneNumber}%,to_number.ilike.%${phoneNumber}%`);
      }
      
      const { data: messages, error } = await query;

      if (error) throw error;

      callback({ 
        success: true, 
        messages: messages.reverse() // Return in chronological order
      });

    } catch (error) {
      console.error('Error fetching messages:', error);
      callback({ success: false, error: error.message });
    }
  });

  // Mark messages as read
  socket.on('mark-read', async (data, callback) => {
    try {
      const { messageIds, customerId } = data;
      
      const { error } = await supabase
        .from('whatsapp_messages')
        .update({ status: 'read' })
        .in('id', messageIds)
        .eq('customer_id', customerId);

      if (error) throw error;

      // Also mark as read in WhatsApp API
      for (const messageId of messageIds) {
        await whatsappClient.markAsRead(messageId);
      }

      callback({ success: true });

    } catch (error) {
      console.error('Error marking messages as read:', error);
      callback({ success: false, error: error.message });
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });
});

// ============================================================================
// API ROUTES
// ============================================================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    whatsapp: {
      status: whatsappClient.status,
      businessNumber: BUSINESS_WHATSAPP,
      phoneNumberId: WHATSAPP_PHONE_NUMBER_ID
    }
  });
});

// Get WhatsApp status
app.get('/api/whatsapp/status', async (req, res) => {
  await whatsappClient.checkConnection();
  res.json({
    status: whatsappClient.status,
    businessNumber: BUSINESS_WHATSAPP,
    lastActivity: whatsappClient.lastActivity
  });
});

// Send message via API
app.post('/api/whatsapp/send', async (req, res) => {
  try {
    const { to, message, customerId, type = 'text' } = req.body;
    
    if (!to || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    let result;
    if (type === 'text') {
      result = await whatsappClient.sendTextMessage(to, message);
    } else if (type === 'template') {
      result = await whatsappClient.sendTemplateMessage(to, message.templateName, message.language, message.components);
    } else {
      return res.status(400).json({ error: 'Invalid message type' });
    }

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    // Store in database
    const { data: dbMessage, error: dbError } = await supabase
      .from('whatsapp_messages')
      .insert([{
        from_number: BUSINESS_WHATSAPP,
        to_number: to,
        message: typeof message === 'string' ? message : JSON.stringify(message),
        message_id: result.messageId,
        timestamp: new Date().toISOString(),
        type: 'outgoing',
        status: 'sent',
        customer_id: customerId || null
      }])
      .select()
      .single();

    if (dbError) {
      console.error('Error storing message:', dbError);
    }

    res.json({ 
      success: true, 
      messageId: result.messageId,
      dbMessage
    });

  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get messages for a customer
app.get('/api/whatsapp/messages/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    const { limit = 50 } = req.query;

    let query = supabase
      .from('whatsapp_messages')
      .select('*, customer:customers(id, email, first_name, last_name)')
      .order('timestamp', { ascending: false })
      .limit(limit);
    
    // Check if identifier is UUID (customer ID) or phone number
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
    
    if (isUUID) {
      query = query.eq('customer_id', identifier);
    } else {
      query = query.or(`from_number.ilike.%${identifier}%,to_number.ilike.%${identifier}%`);
    }
    
    const { data: messages, error } = await query;

    if (error) throw error;

    res.json({ 
      success: true, 
      messages: messages.reverse() 
    });

  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all conversations (for admin)
app.get('/api/whatsapp/conversations', async (req, res) => {
  try {
    // Get unique conversations with latest message
    const { data: conversations, error } = await supabase
      .from('whatsapp_messages')
      .select(`
        *,
        customer:customers(id, email, first_name, last_name, phone)
      `)
      .order('timestamp', { ascending: false });

    if (error) throw error;

    // Group by phone number
    const grouped = {};
    conversations.forEach(msg => {
      const phone = msg.from_number.includes('@') 
        ? msg.from_number.split('@')[0] 
        : msg.from_number;
      
      if (!grouped[phone] || new Date(msg.timestamp) > new Date(grouped[phone].timestamp)) {
        grouped[phone] = {
          phone,
          lastMessage: msg,
          customer: msg.customer,
          unread: msg.status === 'received' ? 1 : 0
        };
      }
    });

    res.json({ 
      success: true, 
      conversations: Object.values(grouped)
    });

  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get business profile
app.get('/api/whatsapp/profile', async (req, res) => {
  const profile = await whatsappClient.getBusinessProfile();
  res.json(profile);
});

// Get phone numbers
app.get('/api/whatsapp/phone-numbers', async (req, res) => {
  const numbers = await whatsappClient.getPhoneNumbers();
  res.json(numbers);
});

// ============================================================================
// START SERVER
// ============================================================================

server.listen(PORT, async () => {
  console.log('\n=================================');
  console.log('🚀 WhatsApp Business API Service Started');
  console.log('=================================');
  console.log(`📱 Port: ${PORT}`);
  console.log(`📱 Business WhatsApp: ${BUSINESS_WHATSAPP}`);
  console.log(`📱 Phone Number ID: ${WHATSAPP_PHONE_NUMBER_ID || 'Not Set'}`);
  console.log(`🌐 Frontend URL: ${FRONTEND_URL}`);
  console.log(`🕒 ${moment().format('YYYY-MM-DD HH:mm:ss')}`);
  
  // Check connection status
  const connected = await whatsappClient.checkConnection();
  console.log(`📊 Connection Status: ${connected ? '✅ Connected' : '❌ Disconnected'}`);
  
  console.log('=================================\n');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM...');
  process.exit(0);
});