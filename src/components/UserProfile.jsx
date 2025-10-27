import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, MapPin, Calendar, Globe, Camera, Edit2, Save, Package, ShoppingCart, DollarSign, Truck, CheckCircle, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { supabase } from '../lib/supabase';
import { useUserOrders } from '../hooks/useUserOrders';
import { useCurrency } from '../contexts/CurrencyContext';
import CustomerDashboard from './CustomerDashboard';

const UserProfile = ({ userId, onClose, favoriteProducts = [] }) => {
  const { getPriceString } = useCurrency();
  const { orders: userOrders, loading: ordersLoading } = useUserOrders(userId);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard'); // 'dashboard', 'profile', or 'orders'
  const [profile, setProfile] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: 'Haiti',
    birth_date: '',
    preferred_language: 'Kreyòl',
    avatar_url: ''
  });

  const getStatusBadge = (status) => {
    switch(status?.toLowerCase()) {
      case 'delivered':
        return <Badge className="bg-green-100 text-green-700">Livre</Badge>;
      case 'shipped':
        return <Badge className="bg-blue-100 text-blue-700">Anvolè</Badge>;
      case 'processing':
        return <Badge className="bg-yellow-100 text-yellow-700">Nan Tretman</Badge>;
      case 'pending':
        return <Badge className="bg-gray-100 text-gray-700">An Jantèy</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-700">{status}</Badge>;
    }
  };

  const getStatusIcon = (status) => {
    switch(status?.toLowerCase()) {
      case 'delivered':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'shipped':
        return <Truck size={16} className="text-blue-600" />;
      case 'processing':
        return <Clock size={16} className="text-yellow-600" />;
      default:
        return <Package size={16} className="text-gray-600" />;
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
      }

      if (data) {
        setProfile(data);
        setFormData({
          full_name: data.full_name || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          city: data.city || '',
          country: data.country || 'Haiti',
          birth_date: data.birth_date || '',
          preferred_language: data.preferred_language || 'Kreyòl',
          avatar_url: data.avatar_url || ''
        });
        setAvatarUrl(data.avatar_url || null);
      } else {
        // Create new profile if doesn't exist
        initializeProfile();
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeProfile = () => {
    setFormData({
      full_name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      country: 'Haiti',
      birth_date: '',
      preferred_language: 'Kreyòl'
    });
    setIsEditing(true);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match('image.*')) {
      alert('Se sèlman imaj ki ka uploade!');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5242880) {
      alert('Fichye a twò gwo! Max 5MB.');
      return;
    }

    try {
      setUploading(true);

      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const newAvatarUrl = urlData.publicUrl;

      // Update form data
      setFormData(prev => ({ ...prev, avatar_url: newAvatarUrl }));
      setAvatarUrl(newAvatarUrl);

      // Update in database
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ 
          avatar_url: newAvatarUrl,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (updateError) throw updateError;

      alert('Foto avata ou mete ajou avèk siksè!');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert(`Erè nan uploade foto a: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const profileData = {
        user_id: userId,
        ...formData,
        updated_at: new Date().toISOString()
      };

      if (profile) {
        // Update existing profile
        const { error } = await supabase
          .from('user_profiles')
          .update(profileData)
          .eq('user_id', userId);

        if (error) throw error;
        alert('Profilin ou mete ajou avèk siksè!');
      } else {
        // Insert new profile
        const { error } = await supabase
          .from('user_profiles')
          .insert([profileData]);

        if (error) throw error;
        alert('Profilin ou kreye avèk siksè!');
      }

      setIsEditing(false);
      await fetchProfile(); // Refresh profile data
    } catch (error) {
      console.error('Error saving profile:', error);
      alert(`Erè nan ekonomi profil la: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Chajman profil...</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-3 rounded-full">
                <User size={24} className="text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Profilin Ou</h2>
                <p className="text-sm text-gray-600">Jere enfòmasyon kont ou</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!isEditing && activeSection === 'profile' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="gap-2"
                >
                  <Edit2 size={16} />
                  Modifye
                </Button>
              )}
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-gray-200 -mb-6 overflow-x-auto">
            <button
              onClick={() => setActiveSection('dashboard')}
              className={`px-4 py-2 border-b-2 font-semibold transition-colors whitespace-nowrap ${
                activeSection === 'dashboard'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              <TrendingUp size={18} className="inline mr-2" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveSection('profile')}
              className={`px-4 py-2 border-b-2 font-semibold transition-colors whitespace-nowrap ${
                activeSection === 'profile'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              <User size={18} className="inline mr-2" />
              Profilin
            </button>
            <button
              onClick={() => setActiveSection('orders')}
              className={`px-4 py-2 border-b-2 font-semibold transition-colors whitespace-nowrap ${
                activeSection === 'orders'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              <ShoppingCart size={18} className="inline mr-2" />
              Kòmand Yo ({userOrders?.length || 0})
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Dashboard Section */}
          {activeSection === 'dashboard' && (
            <CustomerDashboard
              userId={userId}
              orders={userOrders}
              favoriteProducts={favoriteProducts}
            />
          )}
          {/* Orders Section */}
          {activeSection === 'orders' && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Package size={24} />
                Istwa Kòmand Ou
              </h3>

              {ordersLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Chajman kòmand yo...</p>
                  </div>
                </div>
              ) : userOrders && userOrders.length > 0 ? (
                <div className="space-y-3">
                  {userOrders.map(order => (
                    <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            {getStatusIcon(order.status)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">Kòmand #{order.id}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(order.order_date).toLocaleDateString('ht-HT', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-primary">
                            {getPriceString(order.total)}
                          </p>
                          {getStatusBadge(order.status)}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600 pt-3 border-t border-gray-200">
                        <div className="flex items-center gap-2">
                          <Package size={16} />
                          <span>{order.items} atik</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign size={16} />
                          <span>Total: {getPriceString(order.total)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border border-gray-200 rounded-lg bg-gray-50">
                  <ShoppingCart size={48} className="mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-600">Ou pa gen okenn kòmand ankò</p>
                  <p className="text-sm text-gray-500 mt-2">Kòmanse achte pou wè kòmand ou yo isi a!</p>
                </div>
              )}
            </div>
          )}

          {/* Profile Section - Avatar and Form */}
          {activeSection === 'profile' && (
            <>
              {/* Avatar Section */}
              <div className="flex items-center gap-4 pb-6 border-b border-gray-200">
                {avatarUrl ? (
                  <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200">
                    <img 
                      src={avatarUrl} 
                      alt={formData.full_name || 'Avatar'} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                    {formData.full_name ? formData.full_name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-800">
                    {formData.full_name || 'Utilizatè'}
                  </h3>
                  <p className="text-gray-600">{formData.email || 'Pa gen email'}</p>
                </div>
                {isEditing && (
              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  id="avatar-upload"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={uploading}
                />
                <label htmlFor="avatar-upload">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2 cursor-pointer"
                    disabled={uploading}
                    as="span"
                  >
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Camera size={16} />
                        Chanje Foto
                      </>
                    )}
                  </Button>
                </label>
              </div>
            )}
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <User size={16} className="inline mr-2" />
                Non Konple
              </label>
              {isEditing ? (
                <Input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  placeholder="Ekzanp: Jean Baptiste"
                />
              ) : (
                <p className="px-3 py-2 bg-gray-50 rounded-lg">{formData.full_name || '-'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Mail size={16} className="inline mr-2" />
                Email
              </label>
              {isEditing ? (
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="email@example.com"
                />
              ) : (
                <p className="px-3 py-2 bg-gray-50 rounded-lg">{formData.email || '-'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Phone size={16} className="inline mr-2" />
                Telefòn
              </label>
              {isEditing ? (
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+509 1234-5678"
                />
              ) : (
                <p className="px-3 py-2 bg-gray-50 rounded-lg">{formData.phone || '-'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Calendar size={16} className="inline mr-2" />
                Dat Nesans
              </label>
              {isEditing ? (
                <Input
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) => handleInputChange('birth_date', e.target.value)}
                />
              ) : (
                <p className="px-3 py-2 bg-gray-50 rounded-lg">
                  {formData.birth_date ? new Date(formData.birth_date).toLocaleDateString() : '-'}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <MapPin size={16} className="inline mr-2" />
                Adrès
              </label>
              {isEditing ? (
                <Input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Ekzanp: 123 Main St"
                />
              ) : (
                <p className="px-3 py-2 bg-gray-50 rounded-lg">{formData.address || '-'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <MapPin size={16} className="inline mr-2" />
                Vil
              </label>
              {isEditing ? (
                <Input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="Ekzanp: Pòtoprens"
                />
              ) : (
                <p className="px-3 py-2 bg-gray-50 rounded-lg">{formData.city || '-'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <MapPin size={16} className="inline mr-2" />
                Peyi
              </label>
              {isEditing ? (
                <Input
                  type="text"
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  placeholder="Haiti"
                />
              ) : (
                <p className="px-3 py-2 bg-gray-50 rounded-lg">{formData.country || 'Haiti'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Globe size={16} className="inline mr-2" />
                Lang Prefere
              </label>
              {isEditing ? (
                <select
                  value={formData.preferred_language}
                  onChange={(e) => handleInputChange('preferred_language', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Kreyòl">Kreyòl</option>
                  <option value="Français">Français</option>
                  <option value="English">English</option>
                </select>
              ) : (
                <p className="px-3 py-2 bg-gray-50 rounded-lg">{formData.preferred_language}</p>
              )}
            </div>
          </div>
            </>
          )}

          {/* Orders Section */}
          {activeSection === 'orders' && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Package size={24} />
                Istwa Kòmand Ou
              </h3>

              {ordersLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Chajman kòmand yo...</p>
                  </div>
                </div>
              ) : userOrders && userOrders.length > 0 ? (
                <div className="space-y-3">
                  {userOrders.map(order => (
                    <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            {getStatusIcon(order.status)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">Kòmand #{order.id}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(order.order_date).toLocaleDateString('ht-HT', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-primary">
                            {getPriceString(order.total)}
                          </p>
                          {getStatusBadge(order.status)}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600 pt-3 border-t border-gray-200">
                        <div className="flex items-center gap-2">
                          <Package size={16} />
                          <span>{order.items} atik</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign size={16} />
                          <span>Total: {getPriceString(order.total)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border border-gray-200 rounded-lg bg-gray-50">
                  <ShoppingCart size={48} className="mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-600">Ou pa gen okenn kòmand ankò</p>
                  <p className="text-sm text-gray-500 mt-2">Kòmanse achte pou wè kòmand ou yo isi a!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default UserProfile;

