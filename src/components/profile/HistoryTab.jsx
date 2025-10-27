import React from 'react';
import { History, ShoppingBag, Heart, User, Settings, Package, Tag, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { useActivityLogs } from '../../hooks/useActivityLogs';

const HistoryTab = ({ userId }) => {
  const { activities, loading } = useActivityLogs(userId);

  const getActivityIcon = (action) => {
    const iconMap = {
      order_placed: ShoppingBag,
      bookmark_added: Heart,
      bookmark_removed: Heart,
      profile_updated: User,
      settings_updated: Settings,
      product_viewed: Package,
      coupon_applied: Tag,
      reorder: TrendingUp
    };
    
    const Icon = iconMap[action] || History;
    return <Icon size={20} />;
  };

  const getActivityColor = (action) => {
    const colorMap = {
      order_placed: 'text-blue-600 bg-blue-50',
      bookmark_added: 'text-red-600 bg-red-50',
      bookmark_removed: 'text-gray-600 bg-gray-50',
      profile_updated: 'text-green-600 bg-green-50',
      settings_updated: 'text-purple-600 bg-purple-50',
      product_viewed: 'text-orange-600 bg-orange-50',
      coupon_applied: 'text-yellow-600 bg-yellow-50',
      reorder: 'text-indigo-600 bg-indigo-50'
    };
    
    return colorMap[action] || 'text-gray-600 bg-gray-50';
  };

  const getActivityLabel = (action) => {
    const labelMap = {
      order_placed: 'Kòmand Pase',
      bookmark_added: 'Favorit Ajoute',
      bookmark_removed: 'Favorit Retire',
      profile_updated: 'Profi Mizajou',
      settings_updated: 'Paramèt Mizajou',
      product_viewed: 'Pwodui Gade',
      coupon_applied: 'Koupon Aplike',
      reorder: 'Rekòmande'
    };
    
    return labelMap[action] || action;
  };

  const formatActivityDetails = (activity) => {
    if (!activity.meta) return '';
    
    try {
      const meta = typeof activity.meta === 'string' ? JSON.parse(activity.meta) : activity.meta;
      
      if (meta.product_id) return `Pwodui ID: ${meta.product_id}`;
      if (meta.order_id) return `Kòmand ID: ${meta.order_id}`;
      if (meta.bookmark_id) return `Favorit ID: ${meta.bookmark_id}`;
      
      return JSON.stringify(meta);
    } catch (e) {
      return '';
    }
  };

  if (loading) {
    return (
      <Card className="shadow-lg">
        <CardContent className="p-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chajman istwa aktivite yo...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card className="shadow-lg">
        <CardContent className="p-12">
          <div className="text-center">
            <History size={64} className="mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Pa gen istwa ankò</h3>
            <p className="text-muted-foreground">Aktivite ou yo ap parèt isit la</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History size={24} className="text-primary" />
          Istwa Aktivite ({activities.length})
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {activities.map((activity, index) => {
            const Icon = getActivityIcon(activity.action);
            const colorClass = getActivityColor(activity.action);
            
            return (
              <div
                key={activity.id}
                className="flex gap-4 p-4 bg-card border border-border rounded-lg hover:shadow-md transition-all"
              >
                {/* Timeline Line */}
                <div className="relative flex flex-col items-center">
                  <div className={`p-2 rounded-full ${colorClass}`}>
                    <Icon />
                  </div>
                  {index < activities.length - 1 && (
                    <div className="w-0.5 flex-1 bg-border mt-2" />
                  )}
                </div>

                {/* Activity Content */}
                <div className="flex-1 pt-1">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="font-semibold text-foreground">
                      {getActivityLabel(activity.action)}
                    </h4>
                    <Badge variant="outline" className="text-xs">
                      {new Date(activity.created_at).toLocaleDateString('ht-HT', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Badge>
                  </div>

                  {/* Activity Details */}
                  {formatActivityDetails(activity) && (
                    <p className="text-sm text-muted-foreground">
                      {formatActivityDetails(activity)}
                    </p>
                  )}

                  {/* Timestamp */}
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(activity.created_at).toLocaleString('ht-HT', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default HistoryTab;

