import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const Checkout = ({ cart, clearCart, setCurrentPage, currentCurrency = 'UGX', convertPrice, getCurrencySymbol, user }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    notes: ''
  });

  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [effectiveCurrency, setEffectiveCurrency] = useState(currentCurrency);
  const [effectiveSymbol, setEffectiveSymbol] = useState('$');

  // Default currency functions
  const getExchangeRates = () => ({
    USD: 1,
    EUR: 0.85,
    UGX: 3700
  });

  const defaultConvertPrice = (priceUSD) => {
    const rate = getExchangeRates()[effectiveCurrency] || 1;
    const converted = priceUSD * rate;
    
    if (effectiveCurrency === 'UGX') {
      return Math.round(converted).toLocaleString();
    } else {
      return converted.toFixed(2);
    }
  };

  const defaultGetCurrencySymbol = () => {
    switch(effectiveCurrency) {
      case 'EUR': return '€';
      case 'UGX': return 'USh ';
      default: return '$';
    }
  };

  const priceConverter = convertPrice || defaultConvertPrice;
  const currencySymbol = getCurrencySymbol ? getCurrencySymbol() : defaultGetCurrencySymbol();

  // Listen for currency changes
  useEffect(() => {
    const handleCurrencyChange = (event) => {
      setEffectiveCurrency(event.detail);
    };
    window.addEventListener('currencyChange', handleCurrencyChange);
    return () => window.removeEventListener('currencyChange', handleCurrencyChange);
  }, []);

  useEffect(() => {
    setEffectiveSymbol(defaultGetCurrencySymbol());
  }, [effectiveCurrency]);

  // Generate order number
  const generateOrderNumber = () => {
    const timestamp = new Date().getTime().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `RI${timestamp}${random}`;
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const saveOrderToDatabase = async (orderData) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving order to database:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Calculate totals
      const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
      const totalAmount = subtotal; // Add shipping/tax if needed

      // Generate order data
      const orderNumber = generateOrderNumber();
      const orderData = {
        order_number: orderNumber,
        customer_name: `${formData.firstName} ${formData.lastName}`,
        customer_email: formData.email,
        customer_phone: formData.phone,
        shipping_address: {
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: 'Uganda'
        },
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image_url: item.image_url,
          subtotal: item.price * item.quantity
        })),
        subtotal: subtotal,
        total_amount: totalAmount,
        payment_method: 'whatsapp',
        notes: formData.notes,
        whatsapp_message_sent: false,
        status: 'pending'
      };

      // Save order to database
      const savedOrder = await saveOrderToDatabase(orderData);
      console.log('✅ Order saved to database:', savedOrder);

      // Process WhatsApp order with the saved order data
      await processWhatsAppOrder(savedOrder);

      // Update order to mark WhatsApp message as sent
      await supabase
        .from('orders')
        .update({ whatsapp_message_sent: true })
        .eq('id', savedOrder.id);

      setOrderNumber(orderNumber);
      setOrderPlaced(true);
      clearCart();

    } catch (error) {
      console.error('❌ Error processing order:', error);
      alert('There was an error processing your order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const processWhatsAppOrder = async (order) => {
    const businessNumber = '256765673373'; // Your WhatsApp number
    
    const orderDetails = order.items
      .map((item) => `• ${item.name} (Qty: ${item.quantity}) - ${currencySymbol}${priceConverter(item.subtotal)}`)
      .join('\n');

    const message = `🛒 NEW ORDER - ROBERT & IZAK COMPUTERS 🛒\n\n` +
                    `📋 ORDER #: ${order.order_number}\n` +
                    `━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
                    `🛍️ ORDER ITEMS:\n` +
                    `${orderDetails}\n\n` +
                    `💰 ORDER SUMMARY:\n` +
                    `• Subtotal: ${currencySymbol}${priceConverter(order.subtotal)}\n` +
                    `• Total: ${currencySymbol}${priceConverter(order.total_amount)}\n` +
                    `• Currency: ${effectiveCurrency}\n\n` +
                    `👤 CUSTOMER INFORMATION:\n` +
                    `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                    `• Name: ${order.customer_name}\n` +
                    `• Email: ${order.customer_email}\n` +
                    `• Phone: ${order.customer_phone}\n` +
                    `• Address: ${order.shipping_address.address}, ${order.shipping_address.city}, ${order.shipping_address.state} ${order.shipping_address.zipCode}\n\n` +
                    `📝 CUSTOMER NOTES:\n` +
                    `${order.notes || 'No additional notes'}\n\n` +
                    `🚚 DELIVERY:\n` +
                    `• Please contact customer to arrange delivery\n\n` +
                    `💳 PAYMENT:\n` +
                    `• To be arranged via WhatsApp\n\n` +
                    `📞 CONTACT:\n` +
                    `• Customer: ${order.customer_phone}\n` +
                    `• Email: ${order.customer_email}\n\n` +
                    `Thank you! 🙏`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${businessNumber}?text=${encodedMessage}`;

    // Open WhatsApp in new tab
    window.open(whatsappUrl, '_blank');
  };

  const totalPrice = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  if (cart.length === 0 && !orderPlaced) {
    return (
      <div className="checkout-container" style={{ marginTop: '140px', minHeight: 'calc(100vh - 140px)' }}>
        <div className="checkout-main" style={{ textAlign: 'center', padding: '40px' }}>
          <h2>Your cart is empty</h2>
          <p>Please add some products to your cart before checkout.</p>
          <button
            className="amazon-checkout-button"
            onClick={() => {
              setCurrentPage('products');
              navigate('/products');
            }}
            style={{ marginTop: '20px' }}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="checkout-container" style={{ marginTop: '140px', minHeight: 'calc(100vh - 140px)' }}>
        <div className="checkout-main" style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ color: '#067D62', fontSize: '24px', marginBottom: '20px' }}>
            ✅ Order Placed Successfully!
          </div>
          <h2>Thank you for your order!</h2>
          <p><strong>Order Number: {orderNumber}</strong></p>
          <p>Your order has been saved in our system and we've opened WhatsApp for you to confirm the details.</p>
          
          <div style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '20px', 
            borderRadius: '8px', 
            margin: '20px 0',
            textAlign: 'left'
          }}>
            <h3>📋 What happens next?</h3>
            <ul style={{ textAlign: 'left', paddingLeft: '20px' }}>
              <li><strong>Order #{orderNumber}</strong> is now in our system</li>
              <li>📞 We'll contact you within 24 hours to confirm</li>
              <li>💰 We'll discuss payment options (Mobile Money, Bank Transfer, Cash)</li>
              <li>🚚 We'll arrange delivery (Kampala & surrounding areas)</li>
              <li>📦 Delivery within 1-3 business days</li>
            </ul>
          </div>

          <div style={{ 
            backgroundColor: '#e7f3ff', 
            padding: '15px', 
            borderRadius: '8px', 
            margin: '20px 0',
            textAlign: 'center'
          }}>
            <p><strong>Didn't get redirected to WhatsApp?</strong></p>
            <button
              onClick={() => processWhatsAppOrder({ order_number: orderNumber, customer_name: formData.firstName + ' ' + formData.lastName, customer_phone: formData.phone, customer_email: formData.email, shipping_address: formData, items: cart, subtotal: totalPrice, total_amount: totalPrice })}
              className="amazon-checkout-button"
              style={{ margin: '10px' }}
            >
              Open WhatsApp Again
            </button>
          </div>

          <button
            className="amazon-checkout-button"
            onClick={() => {
              setCurrentPage('products');
              navigate('/products');
            }}
            style={{ marginTop: '20px' }}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-container" style={{ marginTop: '15px'}}>
      <div className="checkout-main">
        <h1 className="checkout-title">Checkout</h1>
        
        {/* Currency Notice */}
        <div style={{
          padding: '10px',
          backgroundColor: '#fff3cd',
          border: '1px solid #ffeaa7',
          borderRadius: '4px',
          marginBottom: '20px',
          fontSize: '14px',
          textAlign: 'center',
          color: '#856404'
        }}>
          💰 Prices displayed in {effectiveCurrency} • Order will be saved to database
        </div>

        <form onSubmit={handleSubmit}>
          {/* Shipping & Contact Information */}
          <div className="checkout-section">
            <h2 className="section-title">Shipping & Contact Information</h2>
            <div className="form-row">
              <div className="form-group">
                <input
                  type="text"
                  name="firstName"
                  placeholder="First Name *"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name *"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <input
                type="email"
                name="email"
                placeholder="Email Address *"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="form-input"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number (WhatsApp) *"
                value={formData.phone}
                onChange={handleInputChange}
                required
                className="form-input"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <input
                type="text"
                name="address"
                placeholder="Street Address *"
                value={formData.address}
                onChange={handleInputChange}
                required
                className="form-input"
                disabled={loading}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <input
                  type="text"
                  name="city"
                  placeholder="City *"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <input
                  type="text"
                  name="state"
                  placeholder="State/Region *"
                  value={formData.state}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <input
                  type="text"
                  name="zipCode"
                  placeholder="ZIP Code"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  className="form-input"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <textarea
                name="notes"
                placeholder="Additional notes (delivery instructions, special requests, etc.)"
                value={formData.notes}
                onChange={handleInputChange}
                className="form-input"
                rows="3"
                disabled={loading}
                style={{ resize: 'vertical', minHeight: '80px' }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="amazon-checkout-button"
            style={{ width: '100%', marginTop: '20px' }}
            disabled={loading}
          >
            {loading ? (
              <>
                <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite', marginRight: '10px' }}>⏳</span>
                Saving Order & Opening WhatsApp...
              </>
            ) : (
              `Place Your Order via WhatsApp - ${currencySymbol}${priceConverter(totalPrice)}`
            )}
          </button>

          <div style={{ 
            fontSize: '12px', 
            color: '#666', 
            textAlign: 'center', 
            marginTop: '10px',
            padding: '10px',
            backgroundColor: '#f8f9fa',
            borderRadius: '4px'
          }}>
            ✅ Your order will be saved to our database before opening WhatsApp
          </div>
        </form>
      </div>

      {/* Order Summary */}
      <div className="checkout-sidebar">
        <h3 className="section-title">Order Summary</h3>

        {cart.map((item) => (
          <div key={item.id} className="order-summary-item">
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <img 
                src={item.image_url} 
                alt={item.name}
                style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
              />
              <div>
                <div style={{ fontSize: '14px', marginBottom: '5px' }}>{item.name}</div>
                <div style={{ fontSize: '12px', color: '#565959' }}>Qty: {item.quantity}</div>
              </div>
            </div>
            <div style={{ fontWeight: 'bold' }}>{currencySymbol}{priceConverter(item.price * item.quantity)}</div>
          </div>
        ))}

        <div className="order-total">
          <div>Order Total:</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{currencySymbol}{priceConverter(totalPrice)}</div>
        </div>
        
        <div style={{ 
          fontSize: '12px', 
          color: '#565959', 
          marginTop: '10px', 
          padding: '10px',
          backgroundColor: '#f8f9fa',
          borderRadius: '4px',
          textAlign: 'center'
        }}>
          💾 Order will be saved to database<br/>
          💬 Then opened in WhatsApp
        </div>

        <div style={{ 
          marginTop: '15px',
          padding: '15px',
          backgroundColor: '#f0f8ff',
          borderRadius: '8px',
          border: '1px solid #bee5eb'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#0c5460' }}>🚚 Free Delivery</h4>
          <p style={{ fontSize: '12px', margin: 0, color: '#0c5460' }}>
            Free delivery within Kampala
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Checkout;