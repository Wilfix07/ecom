import { supabase } from '../lib/supabase';

// Mailchimp API configuration
const MAILCHIMP_API_KEY = import.meta.env.VITE_MAILCHIMP_API_KEY || '';
const MAILCHIMP_SERVER = import.meta.env.VITE_MAILCHIMP_SERVER || '';
const MAILCHIMP_LIST_ID = import.meta.env.VITE_MAILCHIMP_LIST_ID || '';

const mailchimpService = {
  
  // Subscribe user to Mailchimp
  async subscribeUser(email, firstName, lastName, tags = []) {
    try {
      // Save to our database first
      const { error: dbError } = await supabase
        .from('mailchimp_subscribers')
        .upsert([{
          email,
          first_name: firstName,
          last_name: lastName,
          status: 'subscribed',
          tags
        }], {
          onConflict: 'email'
        });

      if (dbError) throw dbError;

      // Subscribe to Mailchimp via API (if configured)
      if (MAILCHIMP_API_KEY && MAILCHIMP_LIST_ID) {
        await this.addToList(email, firstName, lastName, tags);
      }

      return { success: true };
    } catch (error) {
      console.error('Error subscribing user:', error);
      return { success: false, error: error.message };
    }
  },

  // Add user to Mailchimp list via API
  async addToList(email, firstName, lastName, tags = []) {
    try {
      const baseUrl = `https://${MAILCHIMP_SERVER}.api.mailchimp.com/3.0`;
      
      const response = await fetch(`${baseUrl}/lists/${MAILCHIMP_LIST_ID}/members`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${MAILCHIMP_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email_address: email,
          status: 'subscribed',
          merge_fields: {
            FNAME: firstName || '',
            LNAME: lastName || ''
          },
          tags: tags
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Mailchimp subscription failed');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Mailchimp API error:', error);
      return { success: false, error: error.message };
    }
  },

  // Send welcome email via Mailchimp
  async sendWelcomeEmail(userId, email, firstName) {
    try {
      // This would trigger a Mailchimp automation
      // For now, we'll just send a transactional email
      const { error } = await supabase
        .from('email_notifications')
        .insert([{
          user_id: userId,
          type: 'welcome',
          recipient_email: email,
          subject: `Byenveni nan TechMart Haiti, ${firstName}!`,
          body: `Mèsi pou ou rejistre! Esperans nou se pou ofri ou eksperyans acha eksepsyonèl.`,
          status: 'pending',
          meta: { userId, email }
        }]);

      if (error) throw error;

      // If Mailchimp is configured, send via automation
      if (MAILCHIMP_API_KEY && MAILCHIMP_LIST_ID) {
        await this.triggerAutomation(email, 'welcome');
      }

      return { success: true };
    } catch (error) {
      console.error('Error sending welcome email:', error);
      return { success: false, error: error.message };
    }
  },

  // Trigger Mailchimp automation
  async triggerAutomation(email, automationType) {
    try {
      const baseUrl = `https://${MAILCHIMP_SERVER}.api.mailchimp.com/3.0`;
      
      // Map automation types to Mailchimp automation IDs
      const automationMap = {
        welcome: import.meta.env.VITE_MAILCHIMP_AUTOMATION_WELCOME || '',
        order_confirmation: import.meta.env.VITE_MAILCHIMP_AUTOMATION_ORDER || '',
        promotional: import.meta.env.VITE_MAILCHIMP_AUTOMATION_PROMO || ''
      };

      const automationId = automationMap[automationType];
      if (!automationId) return { success: false, error: 'Automation not configured' };

      const response = await fetch(`${baseUrl}/lists/${MAILCHIMP_LIST_ID}/members/${email}/actions/trigger/${automationId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${MAILCHIMP_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Automation trigger failed');
      }

      return { success: true };
    } catch (error) {
      console.error('Error triggering automation:', error);
      return { success: false, error: error.message };
    }
  },

  // Update user subscription status
  async updateSubscription(email, status) {
    try {
      const { error } = await supabase
        .from('mailchimp_subscribers')
        .update({ status })
        .eq('email', email);

      if (error) throw error;

      // Update in Mailchimp if configured
      if (MAILCHIMP_API_KEY && MAILCHIMP_LIST_ID) {
        await this.updateMailchimpStatus(email, status);
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating subscription:', error);
      return { success: false, error: error.message };
    }
  },

  // Update status in Mailchimp
  // Note: This requires MD5 hashing which is not available in browser crypto API
  // For production, this should be done server-side or use a library like crypto-js
  async updateMailchimpStatus(email, status) {
    try {
      // Use the official Mailchimp Marketing API client instead
      // This method should use @mailchimp/mailchimp_marketing package
      throw new Error('updateMailchimpStatus: Use @mailchimp/mailchimp_marketing client instead');
      
      const response = await fetch(`${baseUrl}/lists/${MAILCHIMP_LIST_ID}/members/${emailHash}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${MAILCHIMP_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) throw new Error('Mailchimp update failed');
      return { success: true };
    } catch (error) {
      console.error('Mailchimp update error:', error);
      return { success: false, error: error.message };
    }
  },

  // Get subscription status
  async getSubscriptionStatus(email) {
    try {
      const { data, error } = await supabase
        .from('mailchimp_subscribers')
        .select('status')
        .eq('email', email)
        .single();

      if (error) throw error;
      return { success: true, data: data?.status || 'not_subscribed' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

export default mailchimpService;

