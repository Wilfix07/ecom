import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      setLoading(true);
      // Fetch products with category join - include all columns
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name,
            slug
          )
        `)
        .order('id', { ascending: true });

      if (error) throw error;
      
      // Map database structure to expected format
      const formattedData = data.map(product => {
        // Extract category name from join or use direct category field
        const categoryName = product.categories?.name || product.category || 'Uncategorized';
        
        // Create formatted product object
        const formattedProduct = {
          ...product,
          // Map category_id to category name for backward compatibility
          category: categoryName,
          // Map column names (support both old and new column names)
          image: product.image_url || product.image || '📦',
          stock: product.stock_quantity || product.stock || 0,
          reviews: product.review_count || product.reviews || 0,
          sales: product.sales || 0,
          discount: product.discount || 0,
          // Ensure numeric fields are numbers
          price: parseFloat(product.price) || 0,
          rating: parseFloat(product.rating) || 0,
        };
        
        // Remove the nested categories object to keep data clean
        delete formattedProduct.categories;
        
        return formattedProduct;
      });
      
      setProducts(formattedData);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return { products, loading, error, refetch: fetchProducts };
}

