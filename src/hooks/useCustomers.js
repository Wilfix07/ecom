import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  async function fetchCustomers() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;
      
      // Convert string decimals to numbers and format dates
      const formattedData = data.map(customer => ({
        ...customer,
        spent: parseFloat(customer.spent),
        joined: new Date(customer.joined).toISOString().split('T')[0],
      }));
      
      setCustomers(formattedData);
    } catch (error) {
      setError(error.message);
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  }

  return { customers, loading, error, refetch: fetchCustomers };
}

