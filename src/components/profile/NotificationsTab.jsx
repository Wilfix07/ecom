import React from 'react';
import { Bell, Mail, Check, CheckCheck, Trash2, Settings, Package, Tag, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { useNotifications } from '../../hooks/useNotifications';

const NotificationsTab = ({ userId }) => {
  const { 
    notifications, 
    settings, 
    loading, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    updateSettings 
  } = useNotifications(userId);

  const [showSettings, setShowSettings] = React.useState(false);

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'order':
        return <Package size={20} className="text-blue-600" />;
      case 'promo':
        return <Tag size={20} className="text-green-600" />;
      case 'system':
        return <AlertCircle size={20} className="text-orange-600" />;
      default:
        return <Bell size={20} className="text-gray-600" />;
    }
  };

  const handleToggleSetting = async (key, value) => {
    const result = await updateSettings({ [key]: value });
    if (!result.success) {
      alert('Erè nan mizajou paramèt yo');
    }
  };

  if (loading) {
    return (
      <Card className="shadow-lg">
        <CardContent className="p-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chajman notifikasyon yo...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Settings Toggle */}
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Settings size={20} />
              Paramèt Notifikasyon
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              {showSettings ? 'Kache' : 'Afiche'}
            </Button>
          </div>
        </CardHeader>
        
        {showSettings && settings && (
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3">
                <Mail size={20} className="text-muted-foreground" />
                <div>
                  <p className="font-medium">Email Notifikasyon</p>
                  <p className="text-xs text-muted-foreground">Resevwa notifikasyon pa email</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.email_enabled}
                  onChange={(e) => handleToggleSetting('email_enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3">
                <Bell size={20} className="text-muted-foreground" />
                <div>
                  <p className="font-medium">Notifikasyon In-App</p>
                  <p className="text-xs text-muted-foreground">Afiche notifikasyon nan app la</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.in_app_enabled}
                  onChange={(e) => handleToggleSetting('in_app_enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3">
                <Package size={20} className="text-muted-foreground" />
                <div>
                  <p className="font-medium">Mizajou Kòmand</p>
                  <p className="text-xs text-muted-foreground">Notifikasyon sou kòmand ou yo</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.order_updates}
                  onChange={(e) => handleToggleSetting('order_updates', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3">
                <Tag size={20} className="text-muted-foreground" />
                <div>
                  <p className="font-medium">Promosyon</p>
                  <p className="text-xs text-muted-foreground">Resevwa òf espesyal</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.promotional}
                  onChange={(e) => handleToggleSetting('promotional', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Notifications List */}
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell size={24} className="text-primary" />
              Notifikasyon ({notifications.length})
              {unreadCount > 0 && (
                <Badge className="bg-red-500 text-white">{unreadCount}</Badge>
              )}
            </CardTitle>
            {unreadCount > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-1"
                onClick={markAllAsRead}
              >
                <CheckCheck size={16} />
                Make Tout Kòm Li
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell size={64} className="mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Pa gen notifikasyon</h3>
              <p className="text-muted-foreground">Ou ap resevwa notifikasyon isit la</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border transition-all ${
                    notification.is_read
                      ? 'bg-card border-border'
                      : 'bg-blue-50 border-blue-200 shadow-sm'
                  }`}
                >
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-foreground">
                          {notification.title}
                        </h4>
                        {!notification.is_read && (
                          <Badge variant="default" className="text-xs">Nouvo</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {notification.body}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(notification.created_at).toLocaleDateString('ht-HT', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>

                    {!notification.is_read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                        className="flex-shrink-0"
                      >
                        <Check size={16} />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationsTab;

