import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

const usePointsStore = create(
  persist(
    (set, get) => ({
      points: 0,
      availablePoints: 0,
      lifetimePoints: 0,
      history: [],
      badges: [],
      loading: false,
      
      // Fetch user points
      fetchPoints: async (userId) => {
        if (!userId) return;
        
        try {
          set({ loading: true });
          
          // Fetch points summary
          const { data: pointsData, error } = await supabase
            .from('user_points')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();

          if (error && error.code !== 'PGRST116') throw error;

          // Fetch points history
          const { data: historyData } = await supabase
            .from('points_history')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(20);

          // Fetch badges
          const { data: badgesData } = await supabase
            .from('loyalty_badges')
            .select('*')
            .eq('user_id', userId);

          set({
            points: pointsData?.total_points || 0,
            availablePoints: pointsData?.available_points || 0,
            lifetimePoints: pointsData?.lifetime_points || 0,
            history: historyData || [],
            badges: badgesData || [],
            loading: false
          });
        } catch (error) {
          console.error('Error fetching points:', error);
          set({ loading: false });
        }
      },
      
      // Award points
      awardPoints: async (userId, points, reason, source, orderId = null) => {
        try {
          // Insert into history
          const { error: historyError } = await supabase
            .from('points_history')
            .insert([{
              user_id: userId,
              points,
              reason,
              source,
              order_id: orderId,
              expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year expiration
            }]);

          if (historyError) throw historyError;

          // Update or insert user_points
          const { data: existingPoints } = await supabase
            .from('user_points')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();

          if (existingPoints) {
            const { error: updateError } = await supabase
              .from('user_points')
              .update({
                total_points: existingPoints.total_points + points,
                available_points: existingPoints.available_points + points,
                lifetime_points: existingPoints.lifetime_points + points,
                last_updated: new Date().toISOString()
              })
              .eq('user_id', userId);

            if (updateError) throw updateError;
          } else {
            const { error: insertError } = await supabase
              .from('user_points')
              .insert([{
                user_id: userId,
                total_points: points,
                available_points: points,
                lifetime_points: points
              }]);

            if (insertError) throw insertError;
          }

          // Refresh points
          get().fetchPoints(userId);
          
          return { success: true };
        } catch (error) {
          console.error('Error awarding points:', error);
          return { success: false, error: error.message };
        }
      },
      
      // Redeem points
      redeemPoints: async (userId, points, reason) => {
        try {
          // Check if user has enough points
          const { data: userPoints } = await supabase
            .from('user_points')
            .select('available_points')
            .eq('user_id', userId)
            .maybeSingle();

          if (!userPoints || userPoints.available_points < points) {
            return { success: false, error: 'Ou pa gen ase pwen' };
          }

          // Insert redemption into history
          const { error: historyError } = await supabase
            .from('points_history')
            .insert([{
              user_id: userId,
              points: -points,
              reason,
              source: 'redemption'
            }]);

          if (historyError) throw historyError;

          // Update user points
          const { error: updateError } = await supabase
            .from('user_points')
            .update({
              total_points: userPoints.available_points - points,
              available_points: userPoints.available_points - points,
              last_updated: new Date().toISOString()
            })
            .eq('user_id', userId);

          if (updateError) throw updateError;

          // Refresh points
          get().fetchPoints(userId);
          
          return { success: true };
        } catch (error) {
          console.error('Error redeeming points:', error);
          return { success: false, error: error.message };
        }
      },
      
      // Check and award badges
      checkBadges: async (userId) => {
        try {
          const { data: userPoints } = await supabase
            .from('user_points')
            .select('lifetime_points')
            .eq('user_id', userId)
            .maybeSingle();

          if (!userPoints) return;

          const badges = [];
          const lifetimePoints = userPoints.lifetime_points;

          // Award badges based on lifetime points
          if (lifetimePoints >= 100000) badges.push('diamond');
          else if (lifetimePoints >= 50000) badges.push('platinum');
          else if (lifetimePoints >= 25000) badges.push('gold');
          else if (lifetimePoints >= 10000) badges.push('silver');
          else if (lifetimePoints >= 1000) badges.push('bronze');

          // Check for first purchase badge
          const { data: orders } = await supabase
            .from('orders')
            .select('id')
            .eq('user_id', userId)
            .limit(1);

          if (orders && orders.length > 0) {
            badges.push('first_purchase');
          }

          // Insert badges (ignoring duplicates)
          for (const badge of badges) {
            await supabase
              .from('loyalty_badges')
              .insert([{ user_id: userId, badge_type: badge }])
              .then(({ error }) => {
                if (error && error.code !== '23505') {
                  console.error('Error inserting badge:', error);
                }
              });
          }

          // Refresh badges
          get().fetchPoints(userId);
        } catch (error) {
          console.error('Error checking badges:', error);
        }
      }
    }),
    {
      name: 'points-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ points: state.points, availablePoints: state.availablePoints }),
    }
  )
);

export default usePointsStore;

