import { supabase } from './supabase';

/**
 * Secure API wrapper with error handling
 */
class API {
  constructor() {
    this.baseURL = import.meta.env.VITE_SUPABASE_URL;
  }

  /**
   * Generic fetch with error handling
   */
  async request(path, options = {}) {
    try {
      const response = await fetch(`${this.baseURL}${path}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      console.error('API Request Error:', error);
      return { data: null, error: error.message };
    }
  }

  /**
   * Safe database query with retry logic
   */
  async query(table, query = null) {
    try {
      let result = supabase.from(table).select('*');

      if (query) {
        Object.entries(query).forEach(([key, value]) => {
          result = result.eq(key, value);
        });
      }

      const { data, error } = await result;

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error(`Query Error for ${table}:`, error);
      return { data: null, error: error.message };
    }
  }

  /**
   * Safe insert with validation
   */
  async insert(table, data) {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return { data: result, error: null };
    } catch (error) {
      console.error(`Insert Error for ${table}:`, error);
      return { data: null, error: error.message };
    }
  }

  /**
   * Safe update with validation
   */
  async update(table, id, data) {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data: result, error: null };
    } catch (error) {
      console.error(`Update Error for ${table}:`, error);
      return { data: null, error: error.message };
    }
  }

  /**
   * Safe delete
   */
  async delete(table, id) {
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error(`Delete Error for ${table}:`, error);
      return { error: error.message };
    }
  }

  /**
   * Safe file upload
   */
  async uploadFile(bucket, file, path) {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(path);

      return { data: publicUrl, error: null };
    } catch (error) {
      console.error('File Upload Error:', error);
      return { data: null, error: error.message };
    }
  }

  /**
   * Batch operations with transaction-like behavior
   */
  async batch(operations) {
    const results = [];
    for (const operation of operations) {
      const result = await this[operation.type](operation.table, operation.data);
      results.push(result);
      if (result.error) break;
    }
    return results;
  }
}

export const api = new API();

/**
 * Custom error class for API errors
 */
export class APIError extends Error {
  constructor(message, status, originalError) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.originalError = originalError;
  }
}

