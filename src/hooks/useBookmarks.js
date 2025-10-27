import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useBookmarks(userId) {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userId) {
      fetchBookmarks();
    } else {
      setLoading(false);
      setBookmarks([]);
    }
  }, [userId]);

  async function fetchBookmarks() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bookmarks')
        .select(`
          id,
          product_id,
          created_at,
          products (
            id,
            name,
            price,
            image,
            image_1,
            stock,
            rating,
            category,
            discount
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedData = data.map(bookmark => ({
        ...bookmark,
        product: bookmark.products
      }));

      setBookmarks(formattedData);
    } catch (error) {
      setError(error.message);
      console.error('Error fetching bookmarks:', error);
    } finally {
      setLoading(false);
    }
  }

  async function addBookmark(productId) {
    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .insert([{ user_id: userId, product_id: productId }])
        .select();

      if (error) throw error;

      // Log activity
      await supabase
        .from('activity_logs')
        .insert([{
          user_id: userId,
          action: 'bookmark_added',
          meta: { product_id: productId }
        }]);

      await fetchBookmarks();
      return { success: true };
    } catch (error) {
      console.error('Error adding bookmark:', error);
      return { success: false, error: error.message };
    }
  }

  async function removeBookmark(bookmarkId) {
    try {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('id', bookmarkId);

      if (error) throw error;

      // Log activity
      await supabase
        .from('activity_logs')
        .insert([{
          user_id: userId,
          action: 'bookmark_removed',
          meta: { bookmark_id: bookmarkId }
        }]);

      setBookmarks(bookmarks.filter(b => b.id !== bookmarkId));
      return { success: true };
    } catch (error) {
      console.error('Error removing bookmark:', error);
      return { success: false, error: error.message };
    }
  }

  return {
    bookmarks,
    loading,
    error,
    addBookmark,
    removeBookmark,
    refetch: fetchBookmarks
  };
}

