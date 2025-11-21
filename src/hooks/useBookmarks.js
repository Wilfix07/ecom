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
            image_url,
            image_1,
            image_2,
            image_3,
            stock,
            stock_quantity,
            rating,
            reviews,
            review_count,
            category,
            categories (
              name
            ),
            discount
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Map products to include category name and handle column mapping
      const formattedData = data.map(bookmark => ({
        ...bookmark,
        product: bookmark.products ? {
          ...bookmark.products,
          image: bookmark.products.image_url || bookmark.products.image || '📦',
          image_1: bookmark.products.image_1 || null,
          image_2: bookmark.products.image_2 || null,
          image_3: bookmark.products.image_3 || null,
          stock: bookmark.products.stock_quantity || bookmark.products.stock || 0,
          reviews: bookmark.products.review_count || bookmark.products.reviews || 0,
          category: bookmark.products.categories?.name || bookmark.products.category || 'Uncategorized',
          categories: undefined, // Remove nested object
        } : null
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

