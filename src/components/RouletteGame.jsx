import React, { useState } from 'react';
import { Gift, Star, Coins, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import usePointsStore from '../store/usePointsStore';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

const RouletteGame = () => {
  const { user } = useAuth();
  const { availablePoints, fetchPoints, redeemPoints } = usePointsStore();
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const COST_PER_SPIN = 100; // Points cost per spin

  // Prizes configuration
  const prizes = [
    { id: 1, type: 'points', label: '50 Pwen', value: 50, color: 'bg-yellow-400', probability: 30 },
    { id: 2, type: 'points', label: '100 Pwen', value: 100, color: 'bg-orange-400', probability: 20 },
    { id: 3, type: 'points', label: '200 Pwen', value: 200, color: 'bg-red-400', probability: 10 },
    { id: 4, type: 'points', label: '500 Pwen', value: 500, color: 'bg-purple-400', probability: 5 },
    { id: 5, type: 'points', label: '1000 Pwen', value: 1000, color: 'bg-blue-400', probability: 1 },
    { id: 6, type: 'coupon', label: 'Koupon 10%', value: 10, color: 'bg-green-400', probability: 15 },
    { id: 7, type: 'nothing', label: 'Pa gen anyen', value: 0, color: 'bg-gray-400', probability: 15 },
    { id: 8, type: 'points', label: '25 Pwen', value: 25, color: 'bg-pink-400', probability: 34 }
  ];

  // Calculate weighted random prize
  const spinRoulette = () => {
    const totalProbability = prizes.reduce((sum, prize) => sum + prize.probability, 0);
    let random = Math.random() * totalProbability;
    
    for (const prize of prizes) {
      random -= prize.probability;
      if (random <= 0) return prize;
    }
    
    return prizes[0];
  };

  const handleSpin = async () => {
    if (!user) {
      alert('Tanpri konekte pou jwe');
      return;
    }

    if (availablePoints < COST_PER_SPIN) {
      alert(`Ou bezwen ${COST_PER_SPIN} pwen pou jwe. Ou gen ${availablePoints} pwen.`);
      return;
    }

    setSpinning(true);
    setShowResult(false);

    // Deduct points
    const redeemResult = await redeemPoints(user.id, COST_PER_SPIN, 'Roulette Game Entry');
    
    if (!redeemResult.success) {
      alert(redeemResult.error || 'Erè nan retire pwen');
      setSpinning(false);
      return;
    }

    // Simulate spinning animation
    setTimeout(() => {
      const prize = spinRoulette();
      setResult(prize);
      
      // Award prize if points
      if (prize.type === 'points' && prize.value > 0) {
        // Award points
        supabase
          .from('points_history')
          .insert([{
            user_id: user.id,
            points: prize.value,
            reason: `Pri Roulette: ${prize.label}`,
            source: 'roulette'
          }])
          .then(() => {
            // Update user_points
            supabase
              .from('user_points')
              .select('available_points, total_points, lifetime_points')
              .eq('user_id', user.id)
              .maybeSingle()
              .then(({ data }) => {
                if (data) {
                  supabase
                    .from('user_points')
                    .update({
                      total_points: data.total_points + prize.value,
                      available_points: data.available_points + prize.value,
                      lifetime_points: data.lifetime_points + prize.value,
                      last_updated: new Date().toISOString()
                    })
                    .eq('user_id', user.id);
                }
              });
          });
      }

      // Save to roulette_results
      supabase
        .from('roulette_results')
        .insert([{
          user_id: user.id,
          points_won: prize.value,
          prize_type: prize.type
        }]);

      setSpinning(false);
      setShowResult(true);
      fetchPoints(user.id);
    }, 2000);
  };

  if (!user) {
    return (
      <Card className="p-6 text-center">
        <p className="text-gray-600">Konekte pou jwe roulette!</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">🎰 Roulèt Chance</h2>
        <Badge className="bg-blue-100 text-blue-700">
          {availablePoints} Pwen Disponib
        </Badge>
      </div>

      <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg p-8 mb-6">
        <div className="text-center text-white">
          <Coins size={48} className="mx-auto mb-4" />
          <p className="text-lg font-semibold mb-2">
            Koute {COST_PER_SPIN} pwen pou jwe
          </p>
          <p className="text-sm opacity-90">
            Genyen kèk pwen, koupon, oswa yon pwodwi gratis!
          </p>
        </div>
      </div>

      {/* Spinning Animation or Result */}
      <div className="bg-gray-100 rounded-lg p-12 mb-6 min-h-[200px] flex items-center justify-center">
        {spinning ? (
          <div className="animate-spin text-6xl">🎰</div>
        ) : showResult && result ? (
          <div className="text-center">
            <div className={`inline-block p-8 rounded-full ${result.color} text-white mb-4`}>
              <Gift size={64} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {result.label}
            </h3>
            {result.value > 0 && result.type === 'points' && (
              <p className="text-blue-600 font-semibold">
                +{result.value} pwen ajoute nan kont ou!
              </p>
            )}
            {result.type === 'coupon' && (
              <p className="text-green-600 font-semibold">
                Koupon {result.value}% disponib nan kont ou!
              </p>
            )}
          </div>
        ) : (
          <div className="text-center text-gray-500">
            <p className="text-lg">Klike sou "Jwe" pou kòmanse</p>
          </div>
        )}
      </div>

      {/* Spin Button */}
      <Button
        onClick={handleSpin}
        disabled={spinning || availablePoints < COST_PER_SPIN}
        className="w-full py-6 text-lg font-bold"
      >
        {spinning ? 'Nan Jwe...' : `Jwe Roulèt (${COST_PER_SPIN} Pwen)`}
      </Button>

      {availablePoints < COST_PER_SPIN && (
        <p className="text-center text-sm text-gray-500 mt-2">
          Ou pa gen ase pwen. Fè kèk achat pou ganyen pwen!
        </p>
      )}

      {/* Prize List */}
      <div className="mt-6">
        <h3 className="text-lg font-bold mb-3">Pri Disponib</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {prizes.map(prize => (
            <div
              key={prize.id}
              className={`${prize.color} p-3 rounded-lg text-white text-center text-sm`}
            >
              {prize.label}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default RouletteGame;

