import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const useEmailNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  // Send order confirmation email
  const sendOrderConfirmation = async (userId, orderId) => {
    try {
      setLoading(true);
      
      // Get order details
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .maybeSingle();

      if (orderError) throw orderError;

      // Get order items
      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);

      if (itemsError) throw itemsError;

      // Get user profile
      const { data: userData } = await supabase
        .from('user_profiles')
        .select('email, full_name')
        .eq('user_id', userId)
        .maybeSingle();

      // Create email notification record
      const emailBody = `
        Bonjour ${userData?.full_name || 'Customer'},
        
        Mèsi anpil pou lòd ou!
        
        Detay Lòd:
        Lòd ID: ${orderId}
        Dat: ${new Date(orderData.order_date).toLocaleDateString()}
        Total: ${orderData.total} HTG
        
        Items:
        ${itemsData?.map(item => `- ${item.product_name} x${item.quantity}`).join('\n')}
        
        Nou ap trete lòd ou an kout tan posib.
        
        Tanpri konekte sou sit nou pou swiv lòd ou.
        
        Ak kondisyon,
        TechMart Haiti
      `;

      const { error: notificationError } = await supabase
        .from('email_notifications')
        .insert([{
          user_id: userId,
          order_id: orderId,
          email_type: 'order_confirmation',
          subject: 'Konfimasyon Lòd Ou - TechMart Haiti',
          body: emailBody,
          status: 'pending'
        }]);

      if (notificationError) throw notificationError;

      // Mark email sent on order
      await supabase
        .from('orders')
        .update({ email_sent: true })
        .eq('id', orderId);

      // In production, you would integrate with SendGrid, Resend, or similar
      // For now, we'll just log it
      console.log('Email notification queued:', {
        to: userData?.email,
        subject: 'Konfimasyon Lòd Ou',
        body: emailBody
      });

      return { success: true };
    } catch (error) {
      console.error('Error sending order confirmation:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Send shipping notification
  const sendShippingNotification = async (userId, orderId, trackingNumber) => {
    try {
      const { data: userData } = await supabase
        .from('user_profiles')
        .select('email, full_name')
        .eq('user_id', userId)
        .maybeSingle();

      const emailBody = `
        Bonjour ${userData?.full_name || 'Customer'},
        
        Bon nouvèl! Lòd ou ekspedye.
        
        Nimewo Suivi: ${trackingNumber}
        Lòd ID: ${orderId}
        
        Ou ka swiv lòd ou nan kont ou.
        
        Bon chans,
        TechMart Haiti
      `;

      await supabase
        .from('email_notifications')
        .insert([{
          user_id: userId,
          order_id: orderId,
          email_type: 'shipping_notification',
          subject: 'Lòd Ou Ekspedye - TechMart Haiti',
          body: emailBody,
          status: 'pending'
        }]);

      console.log('Shipping notification queued');
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Get notification history for user
  const getNotifications = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('email_notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: [], error: error.message };
    }
  };

  return {
    sendOrderConfirmation,
    sendShippingNotification,
    getNotifications,
    loading
  };
};

