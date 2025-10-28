import React, { useState } from 'react';
import { X, User, ShoppingBag, Heart, Bell, History, Settings, Edit2, Save, LogOut, Package, CheckCircle, Clock, Truck } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { useAuth } from '../contexts/AuthContext';
import { useUserOrders } from '../hooks/useUserOrders';
import { useBookmarks } from '../hooks/useBookmarks';
import { useNotifications } from '../hooks/useNotifications';
import { supabase } from '../lib/supabase';
import { useCurrency } from '../contexts/CurrencyContext';
import OrdersTab from './profile/OrdersTab';
import BookmarksTab from './profile/BookmarksTab';
import NotificationsTab from './profile/NotificationsTab';

const CustomerDashboard = ({ onClose }) => {
  const { user, profile: userProfile, signOut } = useAuth();
  const { orders, loading: ordersLoading } = useUserOrders(user?.id);
  const { bookmarks, loading: bookmarksLoading } = useBookmarks(user?.id);
  const { notifications, unreadCount, loading: notificationsLoading, markAsRead, markAllAsRead } = useNotifications(user?.id);
  const { getPriceString } = useCurrency();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    full_name: userProfile?.full_name || '',
    email: userProfile?.email || '',
    phone: userProfile?.phone || '',
    address: userProfile?.address || '',
    city: userProfile?.city || '',
    country: userProfile?.country || 'Haiti'
  });
  const [saving, setSaving] = useState(false);

  const handleUpdateProfile = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          ...editedProfile,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;
      
      alert('Pwòfil ou mete ajou avèk siksè!');
      setIsEditing(false);
    } catch (error) {
      alert('Erè nan mete ajou pwòfil ou');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    onClose();
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: User },
    { id: 'orders', label: 'Kòmand', icon: ShoppingBag },
    { id: 'bookmarks', label: 'Favorit', icon: Heart },
    { id: 'notifications', label: 'Notifikasyon', icon: Bell, badge: unreadCount > 0 ? unreadCount : null }
  ];

  const stats = {
    totalOrders: orders?.length || 0,
    bookmarksCount: bookmarks?.length || 0,
    unreadNotifications: unreadCount || 0,
    recentOrders: orders?.slice(0, 3) || []
  };

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-border p-4 flex justify-between items-center z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-foreground">Kont Mwen</h1>
          {user && <Badge className="bg-green-100 text-green-700">Konekte</Badge>}
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={handleLogout} title="DeKonekte">
            <LogOut size={20} />
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X size={24} />
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Profile Summary & Navigation */}
          <div className="lg:col-span-3 space-y-4">
            {/* Profile Card */}
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <div className="flex flex-col items-center space-y-4">
                  {/* Avatar */}
                  <div className="relative">
                    {userProfile?.avatar_url ? (
                      <img 
                        src={userProfile.avatar_url} 
                        alt="Profile" 
                        className="w-24 h-24 rounded-full object-cover border-4 border-primary"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold border-4 border-primary">
                        {userProfile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>

                  {/* Name & Email */}
                  <div className="text-center w-full">
                    <h2 className="text-xl font-bold text-foreground">{userProfile?.full_name || 'Itilizatè'}</h2>
                    <p className="text-sm text-muted-foreground">{userProfile?.email || ''}</p>
                  </div>

                  {/* Edit Profile Button */}
                  {!isEditing ? (
                    <Button 
                      variant="outline" 
                      className="w-full gap-2"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit2 size={16} />
                      Modifye Pwòfil
                    </Button>
                  ) : (
                    <Button 
                      variant="default" 
                      className="w-full gap-2"
                      onClick={handleUpdateProfile}
                      disabled={saving}
                    >
                      <Save size={16} />
                      {saving ? 'An sime...' : 'Sove Chanjman'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Estatistik Rapid</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Kòmand</span>
                  <Badge variant="secondary">{stats.totalOrders}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Favorit</span>
                  <Badge variant="secondary">{stats.bookmarksCount}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Notifikasyon</span>
                  <Badge variant="secondary">{stats.unreadNotifications}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Profile Details Card - Only when editing */}
            {isEditing && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Enfòmasyon</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Non Konplè</label>
                    <input
                      type="text"
                      value={editedProfile.full_name}
                      onChange={(e) => setEditedProfile({...editedProfile, full_name: e.target.value})}
                      className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Email</label>
                    <input
                      type="email"
                      value={editedProfile.email}
                      onChange={(e) => setEditedProfile({...editedProfile, email: e.target.value})}
                      className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Telefòn</label>
                    <input
                      type="tel"
                      value={editedProfile.phone}
                      onChange={(e) => setEditedProfile({...editedProfile, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Adrès</label>
                    <input
                      type="text"
                      value={editedProfile.address}
                      onChange={(e) => setEditedProfile({...editedProfile, address: e.target.value})}
                      className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Vil</label>
                    <input
                      type="text"
                      value={editedProfile.city}
                      onChange={(e) => setEditedProfile({...editedProfile, city: e.target.value})}
                      className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column: Content Area */}
          <div className="lg:col-span-9 space-y-4">
            {/* Tabs Navigation */}
            <div className="bg-white rounded-xl shadow-md p-2 flex flex-wrap gap-2">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all ${
                      activeTab === tab.id
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'bg-transparent hover:bg-muted text-muted-foreground'
                    }`}
                  >
                    <Icon size={18} />
                    <span className="font-medium">{tab.label}</span>
                    {tab.badge && (
                      <Badge variant="destructive" className="ml-1">
                        {tab.badge}
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Tab Content */}
            <div className="min-h-[500px]">
              {activeTab === 'dashboard' && (
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle>Byenvini nan Kont Ou</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground">Kòmand Totale</p>
                              <p className="text-2xl font-bold">{stats.totalOrders}</p>
                            </div>
                            <ShoppingBag size={32} className="text-blue-600" />
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-gradient-to-br from-pink-50 to-pink-100">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground">Favorit</p>
                              <p className="text-2xl font-bold">{stats.bookmarksCount}</p>
                            </div>
                            <Heart size={32} className="text-pink-600" />
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground">Notifikasyon</p>
                              <p className="text-2xl font-bold">{stats.unreadNotifications}</p>
                            </div>
                            <Bell size={32} className="text-purple-600" />
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Recent Orders */}
                    {stats.recentOrders.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Dènye Kòmand</h3>
                        <div className="space-y-3">
                          {stats.recentOrders.map((order) => (
                            <Card key={order.id} className="border-l-4 border-l-primary">
                              <CardContent className="p-4">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="font-semibold">Kòmand #{order.id}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {new Date(order.order_date).toLocaleDateString('fr-FR')}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-bold">{getPriceString(order.total)}</p>
                                    {order.status === 'delivered' && <CheckCircle className="text-green-600 inline" size={16} />}
                                    {order.status === 'shipped' && <Truck className="text-blue-600 inline" size={16} />}
                                    {order.status === 'processing' && <Clock className="text-yellow-600 inline" size={16} />}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {activeTab === 'orders' && <OrdersTab userId={user?.id} />}
              {activeTab === 'bookmarks' && <BookmarksTab userId={user?.id} />}
              {activeTab === 'notifications' && (
                <NotificationsTab 
                  userId={user?.id}
                  onMarkAsRead={markAsRead}
                  onMarkAllAsRead={markAllAsRead}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
