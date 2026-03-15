import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Trophy, Crown, Medal } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useAuth, useLanguage } from '../../lib/contexts';
import { useTranslation } from '../../lib/translations';
import { supabase } from '../../lib/supabase';
import { getWeekStart } from '../../lib/utils';

export const LeaderboardPage: React.FC = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const t = useTranslation(language);
  const [activeTab, setActiveTab] = useState('all-time');
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [activeTab]);

  const fetchLeaderboard = async () => {
    setLoading(true);

    if (activeTab === 'all-time') {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .order('aura_total', { ascending: false })
        .limit(50);
      
      setLeaders(data || []);
    } else if (activeTab === 'weekly') {
      const weekStart = getWeekStart().toISOString();
      
      const { data } = await supabase
        .from('actions')
        .select(`
          user_id,
          profiles!actions_user_id_fkey (*)
        `)
        .eq('status', 'scored')
        .gte('scored_at', weekStart);

      if (data) {
        const userAuraMap = new Map();
        
        data.forEach((action: any) => {
          const userId = action.user_id;
          const current = userAuraMap.get(userId) || { profile: action.profiles, weeklyAura: 0 };
          userAuraMap.set(userId, current);
        });

        const { data: weekActions } = await supabase
          .from('actions')
          .select('user_id, aura_awarded')
          .eq('status', 'scored')
          .gte('scored_at', weekStart);

        weekActions?.forEach((action: any) => {
          const current = userAuraMap.get(action.user_id);
          if (current) {
            current.weeklyAura += action.aura_awarded;
          }
        });

        const leadersList = Array.from(userAuraMap.values())
          .map((item: any) => ({
            ...item.profile,
            weekly_aura: item.weeklyAura,
          }))
          .sort((a, b) => b.weekly_aura - a.weekly_aura)
          .slice(0, 50);

        setLeaders(leadersList);
      }
    } else if (activeTab === 'friends') {
      const { data: following } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user!.id)
        .eq('status', 'accepted');

      const followingIds = following?.map(f => f.following_id) || [];
      
      if (followingIds.length > 0) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .in('id', followingIds)
          .order('aura_total', { ascending: false });
        
        setLeaders(data || []);
      } else {
        setLeaders([]);
      }
    }

    setLoading(false);
  };

  const getRankIcon = (rank: number) => {
    if (rank === 0) return <Crown className="w-6 h-6 text-yellow-400" />;
    if (rank === 1) return <Medal className="w-6 h-6 text-gray-300" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-orange-400" />;
    return null;
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 bg-black/95 backdrop-blur-lg border-b border-white/10 z-40 p-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-6 h-6 text-purple-500" />
          <h1 className="text-2xl font-bold">{t('leaderboard')}</h1>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full bg-transparent border-b border-white/10 rounded-none h-12 sticky top-16 bg-black/95 backdrop-blur-lg z-30">
          <TabsTrigger
            value="all-time"
            className="flex-1 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-purple-500"
          >
            {t('all_time')}
          </TabsTrigger>
          <TabsTrigger
            value="weekly"
            className="flex-1 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-purple-500"
          >
            {t('weekly')}
          </TabsTrigger>
          <TabsTrigger
            value="friends"
            className="flex-1 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-purple-500"
          >
            {t('friends_board')}
          </TabsTrigger>
        </TabsList>

        <div className="p-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-400">{t('loading')}</p>
            </div>
          ) : leaders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">{t('no_results')}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {leaders.map((leader, index) => {
                const aura = activeTab === 'weekly' ? leader.weekly_aura : leader.aura_total;
                const isCurrentUser = leader.id === user?.id;
                
                return (
                  <Link
                    key={leader.id}
                    to={`/app/profile/${leader.id}`}
                    className={`flex items-center gap-4 p-4 rounded-lg transition-all ${
                      isCurrentUser
                        ? 'bg-purple-500/20 border border-purple-500/30'
                        : 'bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="w-12 text-center font-bold">
                      {getRankIcon(index) || <span className="text-gray-400">#{index + 1}</span>}
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-xl flex-shrink-0">
                      {leader.avatar_emoji || '✨'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">@{leader.nickname}</p>
                      <p className="text-sm text-gray-400">{t('rank')} #{index + 1}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text">
                        {aura}
                      </p>
                      <p className="text-xs text-gray-400">{t('aura')}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </Tabs>
    </div>
  );
};
