import React, { useState } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { supabase } from '../lib/supabase';

const LoginModal = ({ onClose, onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '', // For registration
    confirmPassword: '' // For registration
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isLogin) {
        // Login logic with Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password
        });

        if (authError) {
          alert(`Erè: ${authError.message}`);
          setLoading(false);
          return;
        }
        
        // Create profile if doesn't exist
        if (authData.user) {
          const { data: profileData } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', authData.user.id)
            .maybeSingle();
          
          if (!profileData) {
            await supabase
              .from('user_profiles')
              .insert([{
                user_id: authData.user.id,
                email: authData.user.email,
                full_name: authData.user.user_metadata?.full_name || authData.user.email.split('@')[0]
              }]);
          }
        }
        
        if (onLoginSuccess) {
          onLoginSuccess();
        }
      } else {
        // Registration logic
        if (formData.password !== formData.confirmPassword) {
          alert('Modpas yo pa menm!');
          setLoading(false);
          return;
        }
        
        if (formData.password.length < 6) {
          alert('Modpas la dwe gen omwen 6 karaktè!');
          setLoading(false);
          return;
        }
        
        // Sign up with Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.name
            }
          }
        });

        if (authError) {
          alert(`Erè: ${authError.message}`);
          setLoading(false);
          return;
        }
        
        if (authData.user) {
          // Create user profile
          const { error: insertError } = await supabase
            .from('user_profiles')
            .insert([{
              user_id: authData.user.id,
              email: authData.user.email,
              full_name: formData.name
            }]);
          
          if (insertError) {
            console.error('Error creating profile:', insertError);
          }
        }
        
        alert('Kont ou te kreye avèk siksè! Tanpri konekte ak kont ou.');
        // Switch to login mode for user to sign in
        setIsLogin(true);
        // Clear form
        setFormData({ email: formData.email, password: '', name: '', confirmPassword: '' });
        setLoading(false);
      }
    } catch (error) {
      console.error('Error:', error);
      alert(`Erè: ${error.message || 'Erè nan pran aksyon'}`);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    console.log(`${provider} login`);
    alert(`Fonksyon ${provider} ap vini byento!`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">
            {isLogin ? 'Konekte Ak Kont Ou' : 'Kreye Yon Kont'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Non Konple
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    type="text"
                    placeholder="Ekzanp: Jean Dupont"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="pl-10"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  type="email"
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Modpas
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Antre modpas ou"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Konfime Modpas
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Antre modpas la ankò"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className="pl-10"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            {isLogin && (
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-gray-600">
                  <input type="checkbox" className="rounded" />
                  Sonje m
                </label>
                <a href="#" className="text-primary hover:underline">
                  Blije modpas ou?
                </a>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              size="lg"
              disabled={loading}
            >
              {loading ? 'Nan pran aksyon...' : (isLogin ? 'Konekte' : 'Kreye Kont')}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="text-sm text-gray-500">OSWA</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Social Login */}
          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => handleSocialLogin('Google')}
            >
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-red-500 rounded" />
                Kontinye ak Google
              </div>
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => handleSocialLogin('Facebook')}
            >
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 bg-blue-600 rounded" />
                Kontinye ak Facebook
              </div>
            </Button>
          </div>

          {/* Toggle Login/Register */}
          <div className="text-center text-sm pt-4">
            {isLogin ? (
              <p className="text-gray-600">
                Ou pa gen yon kont?{' '}
                <button
                  onClick={() => setIsLogin(false)}
                  className="text-primary font-semibold hover:underline"
                >
                  Kreye yon kont
                </button>
              </p>
            ) : (
              <p className="text-gray-600">
                Ou deja gen yon kont?{' '}
                <button
                  onClick={() => setIsLogin(true)}
                  className="text-primary font-semibold hover:underline"
                >
                  Konekte
                </button>
              </p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default LoginModal;

