import React, { useEffect } from 'react';
import { Coins, TrendingUp, Trophy, Clock, Gift } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import usePointsStore from '../store/usePointsStore';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

const PointsDashboard = () => {
  const { user } = useAuth();
  const { 
    points, 
    availablePoints, 
    lifetimePoints, 
    history, 
    badges, 
    loading, 
    fetchPoints,
    checkBadges 
  } = usePointsStore();

  useEffect(() => {
    if (user) {
      fetchPoints(user.id);
      checkBadges(user.id);
    }
  }, [user, fetchPoints, checkBadges]);

  const badgeInfo = {
    'first_purchase': { name: 'Premye Achat', color: 'blue', icon: '🛍️' },
    'bronze': { name: 'Bronz', color: 'orange', icon: '🥉' },
    'silver': { name: 'Ajan', color: 'gray', icon: '🥈' },
    'gold': { name: 'Lò', color: 'yellow', icon: '🥇' },
    'platinum': { name: 'Platin', color: 'cyan', icon: '💎' },
    'diamond': { name: 'Diamant', color: 'blue', icon: '💠' },
    'vip': { name: 'VIP', color: 'purple', icon: '⭐' }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Points Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pwen Disponib</p>
              <p className="text-3xl font-bold text-blue-600">{availablePoints.toLocaleString()}</p>
            </div>
            <Coins size={40} className="text-blue-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pwen Total</p>
              <p className="text-3xl font-bold text-green-600">{points.toLocaleString()}</p>
            </div>
            <TrendingUp size={40} className="text-green-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pwen Lavi</p>
              <p className="text-3xl font-bold text-purple-600">{lifetimePoints.toLocaleString()}</p>
            </div>
            <Trophy size={40} className="text-purple-600" />
          </div>
        </Card>
      </div>

      {/* Badges */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Trophy className="text-yellow-600" size={24} />
          Badj Fidelite
        </h3>
        <div className="flex flex-wrap gap-3">
          {badges.length > 0 ? (
            badges.map(badge => {
              const info = badgeInfo[badge.badge_type] || { name: badge.badge_type, color: 'gray', icon: '⭐' };
              return (
                <Badge
                  key={badge.id}
                  className={`bg-${info.color}-100 text-${info.color}-700 px-3 py-2 text-sm`}
                >
                  <span className="mr-1">{info.icon}</span>
                  {info.name}
                </Badge>
              );
            })
          ) : (
            <p className="text-gray-500">Pa gen badj pòko</p>
          )}
        </div>
      </Card>

      {/* Points History */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4">Istorik Pwen</h3>
        <div className="space-y-3">
          {history.length > 0 ? (
            history.map(item => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    item.points > 0 ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {item.points > 0 ? (
                      <Gift className="text-green-600" size={20} />
                    ) : (
                      <Clock className="text-red-600" size={20} />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{item.reason}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className={`font-bold ${
                  item.points > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {item.points > 0 ? '+' : ''}{item.points}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-8">Pa gen istorik pòko</p>
          )}
        </div>
      </Card>

      {/* How to Earn Points */}
      <Card className="p-6 bg-blue-50">
        <h3 className="text-lg font-bold mb-4">Kijan Pou Ganyen Pwen</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            Achat: 10 pwen pou chak 1000 HTG depanse
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            Rekòmandasyon: 100 pwen pou chak zanmi ou refere
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            Roulèt: Genyen pwen ak koupon
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            Bonus: Bonus espesyal kan wè sit la anonse yo
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PointsDashboard;

