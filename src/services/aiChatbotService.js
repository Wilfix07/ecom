import { supabase } from '../lib/supabase';

// Simulated AI chatbot using rule-based system
// In production, replace with OpenAI API

export const aiChatbotService = {
  
  // Get AI response based on query
  async getResponse(query, context = {}) {
    const lowerQuery = query.toLowerCase();
    
    // Product information queries
    if (lowerQuery.includes('product') || lowerQuery.includes('pwodwi')) {
      const { data: products } = await supabase
        .from('products')
        .select('*')
        .limit(5);
      
      return {
        response: `Nou gen ${products?.length || 0} pwodwi disponib. Yon depatman kliyan ka ede ou jwenn sa ou chèche!`,
        type: 'product_suggestion',
        data: products
      };
    }

    // Order inquiries
    if (lowerQuery.includes('lòd') || lowerQuery.includes('order')) {
      return {
        response: 'Ou ka wè tout lòd ou nan paj "Kòmand" nan kont ou. Si ou gen kesyon sou yon lòd espesifik, yon depatman chèch ap ede ou!',
        type: 'help',
        data: null
      };
    }

    // Shipping queries
    if (lowerQuery.includes('ekspedisyon') || lowerQuery.includes('shipping') || lowerQuery.includes('livrezon')) {
      return {
        response: 'Ekspedisyon an fèt nan 24-48 è. Lòd ou ap vin ak yon nimewo suivi. Ou ka swiv lòd ou nan kont ou!',
        type: 'help',
        data: null
      };
    }

    // Returns and refunds
    if (lowerQuery.includes('retounen') || lowerQuery.includes('remboursman') || lowerQuery.includes('refund')) {
      return {
        response: 'Ou gen 14 jou pou retounen yon pwodwi. Remboursman an pral fèt nan 5-7 jou apre nou resevwa pwodwi a. Gade paj "Retou ak Remboursman" pou plis enfòmasyon.',
        type: 'help',
        data: null
      };
    }

    // Greetings
    if (lowerQuery.includes('bonjou') || lowerQuery.includes('hello') || lowerQuery.includes('alò') || lowerQuery.includes('sak pase')) {
      return {
        response: 'Bonjou! Kouman mwen ka ede ou jodi a?',
        type: 'greeting',
        data: null
      };
    }

    // Pricing queries
    if (lowerQuery.includes('pri') || lowerQuery.includes('prix') || lowerQuery.includes('price') || lowerQuery.includes('koute')) {
      return {
        response: 'Pri yo montre sou chak pwodwi. Ou gen opsyon pou peye nan HTG oswa USD. Si ou gen kesyon sou pri yon pwodwi, gade l nan paj pwodwi a!',
        type: 'help',
        data: null
      };
    }

    // Cart queries
    if (lowerQuery.includes('panyè') || lowerQuery.includes('cart')) {
      return {
        response: 'Ou ka wè panyè ou nan tèt paj la. Ou ka ajoute pwodwi, retire yo, oswa adjust kantite. Klike sou ikon panyè pou jere items!',
        type: 'help',
        data: null
      };
    }

    // Default response
    return {
      response: 'Mwen pa sèten mwen konprann kesyon ou. Yon depatman kliyan ap ede ou pi bon. Vle ou chat ak yon ajan?',
      type: 'escalate',
      data: null
    };
  },

  // Get product recommendations based on context
  async getRecommendations(userId, limit = 5) {
    try {
      // Get user preferences
      const { data: preferences } = await supabase
        .from('user_preferences')
        .select('preferred_categories, purchase_history, viewed_products')
        .eq('user_id', userId)
        .maybeSingle();

      if (!preferences) {
        // Default recommendations
        const { data: popularProducts } = await supabase
          .from('products')
          .select('*')
          .order('sales', { ascending: false })
          .limit(limit);

        return { data: popularProducts || [] };
      }

      // Get products based on user's purchase history and preferences
      const categories = preferences.preferred_categories || [];
      const purchaseHistory = preferences.purchase_history || [];

      // Get products from preferred categories
      const { data: recommendedProducts } = await supabase
        .from('products')
        .select('*')
        .in('category', categories)
        .not('id', 'in', `(${purchaseHistory.join(',')})`)
        .order('sales', { ascending: false })
        .limit(limit);

      return { data: recommendedProducts || [] };
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return { data: [] };
    }
  },

  // Save user search/view/preference
  async saveUserActivity(userId, activityType, data) {
    try {
      const { data: existing } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (existing) {
        // Update existing preferences
        let updatedData = { ...existing };

        if (activityType === 'view') {
          updatedData.viewed_products = [...(existing.viewed_products || []), data];
        } else if (activityType === 'purchase') {
          updatedData.purchase_history = [...(existing.purchase_history || []), data];
        } else if (activityType === 'category') {
          updatedData.preferred_categories = data;
        } else if (activityType === 'search') {
          updatedData.search_history = [...(existing.search_history || []), data];
        }

        await supabase
          .from('user_preferences')
          .update(updatedData)
          .eq('user_id', userId);
      } else {
        // Create new preferences
        const prefs = {
          user_id: userId,
          preferred_categories: activityType === 'category' ? data : [],
          viewed_products: activityType === 'view' ? [data] : [],
          purchase_history: activityType === 'purchase' ? [data] : [],
          search_history: activityType === 'search' ? [data] : []
        };

        await supabase
          .from('user_preferences')
          .insert([prefs]);
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

