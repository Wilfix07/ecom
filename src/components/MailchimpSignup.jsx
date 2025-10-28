import React, { useState } from 'react';
import { Mail, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import mailchimpService from '../services/mailchimpService';
import { supabase } from '../lib/supabase';
import { Button } from './ui/button';
import { Card } from './ui/card';

const MailchimpSignup = ({ variant = 'inline' }) => {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Subscribe via our service
      const result = await mailchimpService.subscribeUser(
        email || user?.email,
        user?.user_metadata?.first_name || '',
        user?.user_metadata?.last_name || ''
      );

      if (result.success) {
        setSubscribed(true);
        
        // Also add to auth metadata if user is logged in
        if (user) {
          await supabase.auth.updateUser({
            data: { mailchimp_subscribed: true }
          });
        }
      }
    } catch (error) {
      console.error('Subscription error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (subscribed) {
    return (
      <Card className="p-6 text-center">
        <Check className="mx-auto text-green-500 mb-2" size={48} />
        <h3 className="text-lg font-semibold mb-2">Mèsi pou abònman ou!</h3>
        <p className="text-gray-600">Ou ap resevwa dènye nouvèl ak promosyon nou</p>
      </Card>
    );
  }

  return (
    <Card className={`p-6 ${variant === 'modal' ? 'bg-white' : ''}`}>
      <div className="flex items-center gap-3 mb-4">
        <Mail className="text-blue-600" size={24} />
        <div>
          <h3 className="font-semibold text-lg">Abòne pou Resevwa Nouvèl</h3>
          <p className="text-sm text-gray-600">Jwenn dènye nouvèl ak promosyon</p>
        </div>
      </div>

      <form onSubmit={handleSubscribe} className="space-y-3">
        <div className="flex gap-2">
          <input
            type="email"
            value={user?.email || email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Imèl ou"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={!!user}
            required
          />
          <Button type="submit" disabled={loading}>
            {loading ? 'Abròne...' : 'Abòne'}
          </Button>
        </div>
        <p className="text-xs text-gray-500">
          Byenveni ak resevwa dènye nouvèl, promosyon ak enspire
        </p>
      </form>
    </Card>
  );
};

export default MailchimpSignup;

