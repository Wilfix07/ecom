import React, { useState } from 'react';
import { X, User, ShoppingBag, Heart, Bell, History, Settings, Mail, Phone, MapPin, Edit2, Save, Lock, CreditCard, MapPinned } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import OrdersTab from './profile/OrdersTab';
import BookmarksTab from './profile/BookmarksTab';
import NotificationsTab from './profile/NotificationsTab';
import HistoryTab from './profile/HistoryTab';

const ProfilePage = ({ userId, userProfile, onBack, onUpdateProfile, onReorder, onAddToCart }) => {
  const [activeTab, setActiveTab] = useState('orders'); // orders, bookmarks, notifications, history
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    full_name: userProfile?.full_name || '',
    email: userProfile?.email || '',
    phone: userProfile?.phone || '',
    address: userProfile?.address || '',
    city: userProfile?.city || '',
    country: userProfile?.country || 'Haiti'
  });

  const handleSaveProfile = async () => {
    await onUpdateProfile(editedProfile);
    setIsEditing(false);
  };

  const tabs = [
    { id: 'orders', label: 'Kòmand Yo', icon: ShoppingBag, labelFr: 'Commandes', labelEn: 'Orders' },
    { id: 'bookmarks', label: 'Favorit', icon: Heart, labelFr: 'Favoris', labelEn: 'Bookmarks' },
    { id: 'notifications', label: 'Notifikasyon', icon: Bell, labelFr: 'Notifications', labelEn: 'Notifications' },
    { id: 'history', label: 'Istwa', icon: History, labelFr: 'Historique', labelEn: 'History' }
  ];

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-border p-4 flex justify-between items-center z-10 shadow-sm">
        <h1 className="text-2xl font-bold text-foreground">Profi Ou</h1>
        <Button variant="ghost" size="icon" onClick={onBack}>
          <X size={24} />
        </Button>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Responsive Layout: 3 columns on desktop, stacked on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Profile Summary */}
          <div className="lg:col-span-3 space-y-4">
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
                    <h2 className="text-xl font-bold text-foreground">{userProfile?.full_name || 'User'}</h2>
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
                      Modifye Profi
                    </Button>
                  ) : (
                    <Button 
                      variant="default" 
                      className="w-full gap-2"
                      onClick={handleSaveProfile}
                    >
                      <Save size={16} />
                      Sove Chanjman
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Profile Details Card */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Enfòmasyon Pèsonèl</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {isEditing ? (
                  <>
                    <div>
                      <label className="text-xs text-muted-foreground">Non Konplè</label>
                      <input
                        type="text"
                        value={editedProfile.full_name}
                        onChange={(e) => setEditedProfile({...editedProfile, full_name: e.target.value})}
                        className="w-full mt-1 px-3 py-2 border border-border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Email</label>
                      <input
                        type="email"
                        value={editedProfile.email}
                        onChange={(e) => setEditedProfile({...editedProfile, email: e.target.value})}
                        className="w-full mt-1 px-3 py-2 border border-border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Telefòn</label>
                      <input
                        type="tel"
                        value={editedProfile.phone}
                        onChange={(e) => setEditedProfile({...editedProfile, phone: e.target.value})}
                        className="w-full mt-1 px-3 py-2 border border-border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Adrès</label>
                      <input
                        type="text"
                        value={editedProfile.address}
                        onChange={(e) => setEditedProfile({...editedProfile, address: e.target.value})}
                        className="w-full mt-1 px-3 py-2 border border-border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Vil</label>
                      <input
                        type="text"
                        value={editedProfile.city}
                        onChange={(e) => setEditedProfile({...editedProfile, city: e.target.value})}
                        className="w-full mt-1 px-3 py-2 border border-border rounded-lg"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start gap-3">
                      <Mail size={18} className="text-muted-foreground mt-1" />
                      <div>
                        <p className="text-xs text-muted-foreground">Email</p>
                        <p className="text-sm font-medium">{userProfile?.email || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone size={18} className="text-muted-foreground mt-1" />
                      <div>
                        <p className="text-xs text-muted-foreground">Telefòn</p>
                        <p className="text-sm font-medium">{userProfile?.phone || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin size={18} className="text-muted-foreground mt-1" />
                      <div>
                        <p className="text-xs text-muted-foreground">Adrès</p>
                        <p className="text-sm font-medium">{userProfile?.address || 'N/A'}</p>
                        <p className="text-sm text-muted-foreground">{userProfile?.city || ''}</p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Center Column: Tabs Content */}
          <div className="lg:col-span-6 space-y-4">
            {/* Tabs Navigation */}
            <div className="bg-white rounded-xl shadow-md p-2 flex flex-wrap gap-2">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all ${
                      activeTab === tab.id
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'bg-transparent hover:bg-muted text-muted-foreground'
                    }`}
                  >
                    <Icon size={18} />
                    <span className="text-sm font-medium hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Content */}
            <div className="min-h-[500px]">
              {activeTab === 'orders' && <OrdersTab userId={userId} onReorder={onReorder} />}
              {activeTab === 'bookmarks' && <BookmarksTab userId={userId} onAddToCart={onAddToCart} />}
              {activeTab === 'notifications' && <NotificationsTab userId={userId} />}
              {activeTab === 'history' && <HistoryTab userId={userId} />}
            </div>
          </div>

          {/* Right Column: Quick Actions */}
          <div className="lg:col-span-3 space-y-4">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Aksyon Rapid</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Lock size={16} />
                  Chanje Modpas
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <CreditCard size={16} />
                  Mwayen Peman
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <MapPinned size={16} />
                  Kat Adrès
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Settings size={16} />
                  Paramèt Kont
                </Button>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card className="shadow-lg bg-gradient-to-br from-blue-50 to-purple-50">
              <CardHeader>
                <CardTitle className="text-lg">Estatistik</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Kòmand</span>
                  <Badge variant="secondary" className="text-lg">0</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Favorit</span>
                  <Badge variant="secondary" className="text-lg">0</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Notifikasyon</span>
                  <Badge variant="secondary" className="text-lg">0</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

