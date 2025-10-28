import { supabase } from '../lib/supabase';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export const orderService = {
  /**
   * Create order with full workflow
   */
  async createOrder(orderData, userId) {
    try {
      const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

      // Create order
      const { data: order, error } = await supabase
        .from('orders')
        .insert({
          id: orderId,
          user_id: userId,
          customer_name: orderData.shippingAddress.name,
          total: orderData.total,
          currency: orderData.currency || 'USD',
          status: 'processing',
          payment_status: 'pending',
          delivery_option: orderData.deliveryOption || 'standard',
          shipping_address: orderData.shippingAddress,
          payment_method: orderData.paymentMethod,
        })
        .select()
        .single();

      if (error) throw error;

      // Create order items
      const orderItems = orderData.items.map(item => ({
        order_id: orderId,
        product_id: item.id,
        product_name: item.name || item.title,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
        currency: orderData.currency || 'USD',
      }));

      await supabase.from('order_items').insert(orderItems);

      // Send order confirmation notification
      await this.sendNotification(orderId, userId, 'order_confirmation', 'email');

      return { success: true, data: order };
    } catch (error) {
      console.error('Order creation error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Process payment confirmation
   */
  async confirmPayment(orderId, paymentIntentId) {
    try {
      await supabase
        .from('orders')
        .update({
          payment_status: 'completed',
          payment_intent_id: paymentIntentId,
          status: 'ready_to_ship',
        })
        .eq('id', orderId);

      // Generate invoice
      await this.generateInvoice(orderId);

      // Send payment confirmation
      const { data: order } = await supabase
        .from('orders')
        .select('user_id')
        .eq('id', orderId)
        .single();

      await this.sendNotification(orderId, order.user_id, 'payment_confirmed', 'email');

      return { success: true };
    } catch (error) {
      console.error('Payment confirmation error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Generate invoice PDF
   */
  async generateInvoice(orderId) {
    try {
      // Fetch order details
      const { data: order } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('id', orderId)
        .single();

      if (!order) throw new Error('Order not found');

      // Generate PDF
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(20);
      doc.text('INVOICE', 105, 20, { align: 'center' });
      
      // Invoice details
      doc.setFontSize(10);
      doc.text(`Invoice #: ${orderId}`, 20, 40);
      doc.text(`Date: ${new Date(order.created_at).toLocaleDateString()}`, 20, 47);
      doc.text(`Customer: ${order.customer_name}`, 20, 54);
      
      // Items table
      const tableData = order.order_items.map(item => [
        item.product_name,
        item.quantity,
        `$${item.unit_price}`,
        `$${item.total_price}`,
      ]);

      doc.autoTable({
        startY: 70,
        head: [['Product', 'Quantity', 'Price', 'Total']],
        body: tableData,
      });

      // Total
      const finalY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(12);
      doc.text(`Total: $${order.total}`, 150, finalY);

      // Save PDF as blob
      const pdfBlob = doc.output('blob');
      
      // Upload to Supabase Storage
      const fileName = `invoices/${orderId}.pdf`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, pdfBlob, {
          contentType: 'application/pdf',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName);

      // Save invoice record
      await supabase.from('invoices').insert({
        invoice_number: orderId,
        order_id: orderId,
        user_id: order.user_id,
        total_amount: order.total,
        currency: order.currency,
        issued_at: new Date().toISOString(),
        pdf_url: publicUrl,
      });

      // Update order with invoice URL
      await supabase
        .from('orders')
        .update({ invoice_url: publicUrl })
        .eq('id', orderId);

      return { success: true, url: publicUrl };
    } catch (error) {
      console.error('Invoice generation error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Send order notification
   */
  async sendNotification(orderId, userId, type, channel = 'email') {
    try {
      await supabase.from('order_notifications').insert({
        order_id: orderId,
        user_id: userId,
        notification_type: type,
        channel,
        status: 'pending',
      });

      // Trigger email/SMS service here
      // For now, just log it
      console.log(`Notification queued: ${type} for order ${orderId}`);

      return { success: true };
    } catch (error) {
      console.error('Notification error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Update order status
   */
  async updateOrderStatus(orderId, status) {
    try {
      await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      // Send appropriate notification
      const notificationMap = {
        'ready_to_ship': 'ready_to_ship',
        'shipped': 'shipped',
        'out_for_delivery': 'out_for_delivery',
        'delivered': 'delivered',
      };

      if (notificationMap[status]) {
        const { data: order } = await supabase
          .from('orders')
          .select('user_id')
          .eq('id', orderId)
          .single();

        await this.sendNotification(orderId, order.user_id, notificationMap[status], 'email');
      }

      return { success: true };
    } catch (error) {
      console.error('Status update error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get order with full details
   */
  async getOrderDetails(orderId) {
    try {
      const { data: order, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(*),
          shipping_tracking_events(*),
          delivery_confirmations(*),
          invoices(*)
        `)
        .eq('id', orderId)
        .single();

      if (error) throw error;

      return { success: true, data: order };
    } catch (error) {
      console.error('Order details error:', error);
      return { success: false, error: error.message };
    }
  },
};

