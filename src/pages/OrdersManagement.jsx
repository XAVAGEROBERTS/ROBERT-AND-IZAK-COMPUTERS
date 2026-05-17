import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const OrdersManagement = ({ searchTerm, theme, currentTheme, showPopupMessage, isMobile, convertPrice, getCurrencySymbol, currentCurrency }) => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = orders.filter(order =>
        order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOrders(filtered);
    } else {
      setFilteredOrders(orders);
    }
  }, [searchTerm, orders]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
      setFilteredOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      showPopupMessage('Error loading orders: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to extract product ID from different item structures
  const getProductId = (item) => {
    // Try different possible field names
    return item.product_id || item.id || item.productId || item.product?.id || null;
  };

  // Helper function to get quantity from different item structures
  const getQuantity = (item) => {
    return item.quantity || item.qty || item.Quantity || 1;
  };

  // Helper function to get product name for logging
  const getProductName = (item) => {
    return item.product_name || item.name || item.title || item.product?.name || 'Unknown Product';
  };

  // 🔥 MAIN FUNCTION: Updates order status AND decreases inventory when confirmed/delivered
  const updateOrderStatus = async (orderId, newStatus, currentStatus) => {
    // If status didn't change, do nothing
    if (newStatus === currentStatus) return;
    
    try {
      // Check if we need to update inventory (when changing to confirmed or delivered)
      const needsInventoryUpdate = (newStatus === 'confirmed' || newStatus === 'delivered') && 
                                    (currentStatus !== 'confirmed' && currentStatus !== 'delivered');
      
      let orderItems = null;
      
      if (needsInventoryUpdate) {
        // Get order items first
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .select('items, order_number')
          .eq('id', orderId)
          .single();
          
        if (!orderError && order) {
          orderItems = order?.items || [];
          console.log('📦 Order items structure:', orderItems);
        }
      }
      
      // Update order status
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;
      
      // Decrease inventory for each product in the order
      if (needsInventoryUpdate && orderItems && orderItems.length > 0) {
        let successCount = 0;
        
        for (const item of orderItems) {
          const productId = getProductId(item);
          const quantity = getQuantity(item);
          const productName = getProductName(item);
          
          if (!productId) {
            console.warn('⚠️ No product ID found for item:', item);
            continue;
          }
          
          try {
            console.log(`🔄 Attempting to decrease stock for ${productName} (ID: ${productId}) by ${quantity}`);
            
            const { data: stockResult, error: stockError } = await supabase.rpc('decrease_product_stock', {
              p_product_id: productId,
              p_quantity: quantity
            });
            
            if (!stockError) {
              successCount++;
              console.log(`✅ Stock decreased: ${productName} -${quantity}`);
            } else {
              console.error(`❌ Failed to update stock for ${productName}:`, stockError);
            }
          } catch (err) {
            console.error(`❌ Error updating stock for ${productName}:`, err);
          }
        }
        
        if (successCount > 0) {
          showPopupMessage(`✅ Order ${newStatus}! Inventory updated (${successCount} product${successCount > 1 ? 's' : ''})`, 'success');
        } else if (needsInventoryUpdate && orderItems.length > 0) {
          showPopupMessage(`⚠️ Order status updated to ${newStatus} but inventory update failed. Check product IDs.`, 'warning');
        }
      } else if (!needsInventoryUpdate) {
        showPopupMessage(`Order status updated to ${newStatus}`, 'success');
      } else if (needsInventoryUpdate && (!orderItems || orderItems.length === 0)) {
        showPopupMessage(`Order status updated to ${newStatus} (No items to update inventory)`, 'success');
      }
      
      fetchOrders();
      
      // Notify other components to refresh
      window.dispatchEvent(new CustomEvent('ordersUpdated'));
      window.dispatchEvent(new CustomEvent('inventoryUpdated'));
      
    } catch (error) {
      console.error('Error updating order status:', error);
      showPopupMessage('Error updating order: ' + error.message, 'error');
    }
  };

  const deleteOrder = async (orderId) => {
    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (error) throw error;
      
      setOrders(orders.filter(order => order.id !== orderId));
      setFilteredOrders(filteredOrders.filter(order => order.id !== orderId));
      
      setShowDeleteConfirm(false);
      setOrderToDelete(null);
      showPopupMessage('Order deleted successfully', 'success');
      window.dispatchEvent(new CustomEvent('ordersUpdated'));
      
    } catch (error) {
      console.error('Error deleting order:', error);
      showPopupMessage('Error deleting order: ' + error.message, 'error');
    }
  };

  const confirmDeleteOrder = (order) => {
    setOrderToDelete(order);
    setShowDeleteConfirm(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': '#ed8936',
      'confirmed': '#4299e1',
      'processing': '#9f7aea',
      'shipped': '#38b2ac',
      'delivered': '#48bb78',
      'cancelled': '#e53e3e'
    };
    return colors[status] || '#a0aec0';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  // Fix for the JSX warning - remove the jsx prop from style tag
  if (loading) {
    return (
      <div style={{ 
        background: currentTheme.cardBg, 
        borderRadius: '12px', 
        padding: '40px',
        textAlign: 'center',
        boxShadow: currentTheme.cardShadow
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #3498db',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 20px'
        }}></div>
        <p style={{ color: currentTheme.textMuted, margin: 0 }}>Loading orders...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'flex-start' : 'center',
        gap: isMobile ? '15px' : '0'
      }}>
        <h2 style={{ 
          margin: 0, 
          color: currentTheme.text,
          fontSize: isMobile ? '18px' : '24px'
        }}>
          Orders Management
        </h2>
        
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          alignItems: 'center',
          flexWrap: 'wrap',
          justifyContent: isMobile ? 'space-between' : 'flex-end',
          width: isMobile ? '100%' : 'auto'
        }}>
          <div style={{
            padding: '8px 12px',
            background: theme === 'light' ? '#f7fafc' : '#4a5568',
            borderRadius: '6px',
            fontSize: isMobile ? '12px' : '14px',
            color: currentTheme.text,
            border: `1px solid ${currentTheme.border}`
          }}>
            Total: {filteredOrders.length} orders
          </div>
        </div>
      </div>

      <div style={{ 
        background: currentTheme.cardBg, 
        borderRadius: '12px',
        boxShadow: currentTheme.cardShadow,
        overflow: 'hidden'
      }}>
        {filteredOrders.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
            <h3 style={{ color: currentTheme.text, marginBottom: '8px' }}>No orders found</h3>
            <p style={{ color: currentTheme.textMuted, marginBottom: '20px' }}>
              {searchTerm ? 'Try adjusting your search terms' : 'No orders have been placed yet'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            {isMobile ? (
              <div style={{ padding: '10px' }}>
                {filteredOrders.map(order => (
                  <div key={order.id} style={{
                    padding: '15px',
                    borderBottom: `1px solid ${currentTheme.border}`,
                    background: currentTheme.cardBg
                  }}>
                    <div style={{ marginBottom: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                        <strong style={{ color: currentTheme.text }}>
                          #{order.order_number}
                        </strong>
                        <span style={{
                          padding: '4px 8px',
                          background: getStatusColor(order.status),
                          color: 'white',
                          borderRadius: '12px',
                          fontSize: '10px',
                          fontWeight: '600',
                          textTransform: 'capitalize'
                        }}>
                          {order.status}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: currentTheme.textMuted }}>
                        {order.customer_name} • {order.customer_phone}
                      </div>
                      <div style={{ fontSize: '12px', color: currentTheme.textMuted }}>
                        {formatDate(order.created_at)}
                      </div>
                    </div>
                    
                    <div style={{ marginBottom: '10px' }}>
                      <div style={{ fontSize: '12px', color: currentTheme.textMuted }}>Total</div>
                      <div style={{ fontSize: '13px', color: currentTheme.text, fontWeight: '600' }}>
                        {getCurrencySymbol?.() || '$'}{convertPrice?.(order.total_amount) || order.total_amount}
                      </div>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <button 
                        onClick={() => viewOrderDetails(order)}
                        style={{
                          background: '#4299e1',
                          color: 'white',
                          border: 'none',
                          padding: '8px 12px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}
                      >
                        View Details
                      </button>
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value, order.status)}
                        style={{
                          padding: '8px',
                          border: `1px solid ${currentTheme.border}`,
                          borderRadius: '4px',
                          background: currentTheme.cardBg,
                          color: currentTheme.text,
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    
                    <div style={{ marginTop: '8px' }}>
                      <button 
                        onClick={() => confirmDeleteOrder(order)}
                        style={{
                          background: '#e53e3e',
                          color: 'white',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '11px',
                          fontWeight: '500',
                          width: '100%'
                        }}
                      >
                        Delete Order
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                <thead>
                  <tr style={{ background: theme === 'light' ? '#f7fafc' : '#4a5568' }}>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: `1px solid ${currentTheme.border}`, color: currentTheme.text }}>Order #</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: `1px solid ${currentTheme.border}`, color: currentTheme.text }}>Customer</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: `1px solid ${currentTheme.border}`, color: currentTheme.text }}>Date</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: `1px solid ${currentTheme.border}`, color: currentTheme.text }}>Total</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: `1px solid ${currentTheme.border}`, color: currentTheme.text }}>Status</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: `1px solid ${currentTheme.border}`, color: currentTheme.text }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(order => (
                    <tr key={order.id} style={{
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = theme === 'light' ? '#f7fafc' : '#4a5568';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = currentTheme.cardBg;
                    }}
                    >
                      <td style={{ padding: '12px', borderBottom: `1px solid ${currentTheme.border}` }}>
                        <strong style={{ color: currentTheme.text }}>#{order.order_number}</strong>
                      </td>
                      <td style={{ padding: '12px', borderBottom: `1px solid ${currentTheme.border}`, color: currentTheme.text }}>
                        <div>
                          <div style={{ fontWeight: '500' }}>{order.customer_name}</div>
                          <div style={{ fontSize: '12px', color: currentTheme.textMuted }}>{order.customer_phone}</div>
                          <div style={{ fontSize: '12px', color: currentTheme.textMuted }}>{order.customer_email}</div>
                        </div>
                      </td>
                      <td style={{ padding: '12px', borderBottom: `1px solid ${currentTheme.border}`, color: currentTheme.text }}>
                        {formatDate(order.created_at)}
                      </td>
                      <td style={{ padding: '12px', borderBottom: `1px solid ${currentTheme.border}`, color: currentTheme.text, fontWeight: '600' }}>
                        {getCurrencySymbol?.() || '$'}{convertPrice?.(order.total_amount) || order.total_amount}
                      </td>
                      <td style={{ padding: '12px', borderBottom: `1px solid ${currentTheme.border}` }}>
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value, order.status)}
                          style={{
                            padding: '6px 8px',
                            border: `1px solid ${currentTheme.border}`,
                            borderRadius: '4px',
                            background: currentTheme.cardBg,
                            color: currentTheme.text,
                            fontSize: '12px',
                            cursor: 'pointer',
                            minWidth: '100px'
                          }}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td style={{ padding: '12px', borderBottom: `1px solid ${currentTheme.border}` }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            onClick={() => viewOrderDetails(order)}
                            style={{
                              background: '#4299e1',
                              color: 'white',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: '500'
                            }}
                          >
                            View Details
                          </button>
                          <button 
                            onClick={() => confirmDeleteOrder(order)}
                            style={{
                              background: '#e53e3e',
                              color: 'white',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: '500'
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <OrderDetailsModal 
          order={selectedOrder}
          onClose={() => {
            setShowOrderDetails(false);
            setSelectedOrder(null);
          }}
          theme={theme}
          currentTheme={currentTheme}
          convertPrice={convertPrice}
          getCurrencySymbol={getCurrencySymbol}
          isMobile={isMobile}
          updateOrderStatus={updateOrderStatus}
          onDelete={() => confirmDeleteOrder(selectedOrder)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && orderToDelete && (
        <DeleteConfirmationModal 
          order={orderToDelete}
          onClose={() => {
            setShowDeleteConfirm(false);
            setOrderToDelete(null);
          }}
          onConfirm={() => deleteOrder(orderToDelete.id)}
          theme={theme}
          currentTheme={currentTheme}
          isMobile={isMobile}
        />
      )}
    </div>
  );
};

// Delete Confirmation Modal Component
const DeleteConfirmationModal = ({ order, onClose, onConfirm, theme, currentTheme, isMobile }) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: isMobile ? '10px' : '20px'
    }}>
      <div style={{
        background: currentTheme.cardBg,
        padding: isMobile ? '15px' : '20px',
        borderRadius: '12px',
        width: '90%',
        maxWidth: isMobile ? '100%' : '400px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
        color: currentTheme.text
      }}>
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ 
            margin: '0 0 10px 0', 
            fontSize: isMobile ? '18px' : '20px', 
            fontWeight: '600',
            color: currentTheme.text
          }}>
            Delete Order
          </h3>
          <p style={{ 
            margin: 0, 
            color: currentTheme.textMuted,
            lineHeight: '1.5'
          }}>
            Are you sure you want to delete order <strong>#{order.order_number}</strong>? 
            This action cannot be undone.
          </p>
        </div>

        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          justifyContent: 'flex-end',
          flexDirection: isMobile ? 'column' : 'row'
        }}>
          <button
            onClick={onClose}
            style={{
              background: '#a0aec0',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              background: '#e53e3e',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Delete Order
          </button>
        </div>
      </div>
    </div>
  );
};

// Order Details Modal Component
const OrderDetailsModal = ({ order, onClose, theme, currentTheme, convertPrice, getCurrencySymbol, isMobile, updateOrderStatus, onDelete }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': '#ed8936',
      'confirmed': '#4299e1',
      'processing': '#9f7aea',
      'shipped': '#38b2ac',
      'delivered': '#48bb78',
      'cancelled': '#e53e3e'
    };
    return colors[status] || '#a0aec0';
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: isMobile ? '10px' : '20px'
    }}>
      <div style={{
        background: currentTheme.cardBg,
        padding: isMobile ? '15px' : '20px',
        borderRadius: '12px',
        width: '90%',
        maxWidth: isMobile ? '100%' : '800px',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
        color: currentTheme.text
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ 
            margin: 0, 
            fontSize: isMobile ? '18px' : '20px', 
            fontWeight: '600' 
          }}>
            Order Details - #{order.order_number}
          </h3>
          <button 
            onClick={onClose}
            style={{ 
              background: 'none', 
              border: 'none', 
              fontSize: '24px', 
              cursor: 'pointer',
              color: currentTheme.textMuted
            }}
          >
            ×
          </button>
        </div>

        <div style={{ display: 'grid', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: currentTheme.text }}>
              Order Status
            </label>
            <select
              value={order.status}
              onChange={(e) => updateOrderStatus(order.id, e.target.value, order.status)}
              style={{
                padding: '8px 12px',
                border: `1px solid ${currentTheme.border}`,
                borderRadius: '6px',
                background: currentTheme.cardBg,
                color: currentTheme.text,
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <h4 style={{ margin: '0 0 10px 0', color: currentTheme.text }}>Customer Information</h4>
            <div style={{ 
              background: theme === 'light' ? '#f7fafc' : '#4a5568',
              padding: '15px',
              borderRadius: '8px'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '10px' }}>
                <div><strong>Name:</strong> {order.customer_name}</div>
                <div><strong>Email:</strong> {order.customer_email}</div>
                <div><strong>Phone:</strong> {order.customer_phone}</div>
                <div><strong>Order Date:</strong> {formatDate(order.created_at)}</div>
              </div>
            </div>
          </div>

          <div>
            <h4 style={{ margin: '0 0 10px 0', color: currentTheme.text }}>Shipping Address</h4>
            <div style={{ 
              background: theme === 'light' ? '#f7fafc' : '#4a5568',
              padding: '15px',
              borderRadius: '8px'
            }}>
              <div>
                {order.shipping_address?.address && <div>{order.shipping_address.address}</div>}
                {order.shipping_address?.city && <div>{order.shipping_address.city}</div>}
                {order.shipping_address?.state && <div>{order.shipping_address.state}</div>}
                {order.shipping_address?.zipCode && <div>{order.shipping_address.zipCode}</div>}
                {order.shipping_address?.country && <div>{order.shipping_address.country}</div>}
              </div>
            </div>
          </div>

          <div>
            <h4 style={{ margin: '0 0 10px 0', color: currentTheme.text }}>Order Items</h4>
            <div style={{ 
              background: theme === 'light' ? '#f7fafc' : '#4a5568',
              padding: '15px',
              borderRadius: '8px'
            }}>
              {order.items?.map((item, index) => (
                <div key={index} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '10px 0',
                  borderBottom: index < order.items.length - 1 ? `1px solid ${currentTheme.border}` : 'none'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {item.image_url && (
                      <img 
                        src={item.image_url} 
                        alt={item.name}
                        style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                      />
                    )}
                    <div>
                      <div style={{ fontWeight: '500' }}>{item.name}</div>
                      <div style={{ fontSize: '12px', color: currentTheme.textMuted }}>
                        Qty: {item.quantity} × {getCurrencySymbol?.() || '$'}{convertPrice?.(item.price) || item.price}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontWeight: '600' }}>
                    {getCurrencySymbol?.() || '$'}{convertPrice?.(item.subtotal) || item.subtotal}
                  </div>
                </div>
              ))}
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '15px 0 0 0',
                borderTop: `2px solid ${currentTheme.border}`,
                marginTop: '10px',
                fontWeight: 'bold',
                fontSize: '16px'
              }}>
                <div>Total Amount:</div>
                <div>{getCurrencySymbol?.() || '$'}{convertPrice?.(order.total_amount) || order.total_amount}</div>
              </div>
            </div>
          </div>

          {order.notes && (
            <div>
              <h4 style={{ margin: '0 0 10px 0', color: currentTheme.text }}>Customer Notes</h4>
              <div style={{ 
                background: theme === 'light' ? '#f7fafc' : '#4a5568',
                padding: '15px',
                borderRadius: '8px',
                fontStyle: 'italic'
              }}>
                {order.notes}
              </div>
            </div>
          )}
        </div>

        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          justifyContent: 'flex-end',
          marginTop: '20px',
          flexDirection: isMobile ? 'column' : 'row'
        }}>
          <button
            onClick={onDelete}
            style={{
              background: '#e53e3e',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Delete Order
          </button>
          <button
            onClick={onClose}
            style={{
              background: '#a0aec0',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrdersManagement;