import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { aiChatbotService } from '../services/aiChatbotService';

export const useRecommendations = (userId) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadRecommendations();
    }
  }, [userId]);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      
      // Get recommendations from database
      const { data: dbRecs } = await supabase
        .from('product_recommendations')
        .select('*, products(*)')
        .eq('user_id', userId)
        .order('score', { ascending: false })
        .limit(10);

      if (dbRecs && dbRecs.length > 0) {
        setRecommendations(dbRecs.map(rec => ({
          ...rec.products,
          score: rec.score,
          reason: rec.reason
        })));
      } else {
        // Generate new recommendations
        const aiRecs = await aiChatbotService.getRecommendations(userId, 10);
        
        // Save to database
        for (const product of aiRecs.data) {
          await supabase
            .from('product_recommendations')
            .insert([{
              user_id: userId,
              product_id: product.id,
              score: 0.8, // Default score
              reason: 'Recommended for you'
            }]);
        }
        
        setRecommendations(aiRecs.data);
      }
    } catch (error) {
      console.error('Error loading recommendations:', error);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshRecommendations = async () => {
    // Delete old recommendations
    await supabase
      .from('product_recommendations')
      .delete()
      .eq('user_id', userId);
    
    // Load fresh recommendations
    loadRecommendations();
  };

  return {
    recommendations,
    loading,
    refreshRecommendations
  };
};

