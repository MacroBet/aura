import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { Settings, UserPlus, UserMinus, Lock } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ActionCard } from '../components/ActionCard';
import { useAuth, useLanguage } from '../../lib/contexts';
import { useTranslation } from '../../lib/translations';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

export const ProfilePage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language } = useLanguage();
  const t = useTranslation(language);
  const [profile, setProfile] = useState<any>(null);
  const [actions, setActions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followStatus, setFollowStatus] = useState<string | null>(null);
  const [stats, setStats] = useState({ followers: 0, following: 0, actionsCount: 0, confirmationsReceived: 0 });
  const [loading, setLoading] = useState(true);
  const isOwnProfile = user?.id === id;

  useEffect(() => {
    fetchProfile();
    fetchFollowStatus();
    fetchActions();
    fetchCategories();
  }, [id]);

  const fetchProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();
    
    setProfile(data);
    setLoading(false);
  };

  const fetchFollowStatus = async () => {
    if (!user || isOwnProfile) return;

    const { data } = await supabase
      .from('follows')
      .select('status')
      .eq('follower_id', user.id)
      .eq('following_id', id)
      .maybeSingle();

    if (data) {
      setIsFollowing(true);
      setFollowStatus(data.status);
    }
  };

  const fetchActions = async () => {
    const { data } = await supabase
      .from('actions')
      .select('*')
      .eq('user_id', id)
      .order('created_at', { ascending: false })
      .limit(20);

    const fetchedActions = data || [];
    setActions(fetchedActions);
    fetchStats(fetchedActions.map((action: any) => action.id));
  };

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*');
    setCategories(data || []);
  };

  const fetchStats = async (actionIds?: string[]) => {
    let ids = actionIds || [];

    if (ids.length === 0) {
      const { data: profileActions } = await supabase
        .from('actions')
        .select('id')
        .eq('user_id', id);
      ids = profileActions?.map((action) => action.id) || [];
    }

    const [followers, following, actionsData, confirmations] = await Promise.all([
      supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', id).eq('status', 'accepted'),
      supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', id).eq('status', 'accepted'),
      supabase.from('actions').select('*', { count: 'exact', head: true }).eq('user_id', id),
      ids.length > 0
        ? supabase.from('action_confirmations').select('*', { count: 'exact', head: true }).in('action_id', ids)
        : Promise.resolve({ count: 0 }),
    ]);

    setStats({
      followers: followers.count || 0,
      following: following.count || 0,
      actionsCount: actionsData.count || 0,
      confirmationsReceived: confirmations.count || 0,
    });
  };

  const handleFollow = async () => {
    if (!user) return;

    try {
      if (isFollowing) {
        await supabase.from('follows').delete().eq('follower_id', user.id).eq('following_id', id);
        setIsFollowing(false);
        setFollowStatus(null);
        toast.success('Unfollowed');
      } else {
        const status = profile?.is_private ? 'pending' : 'accepted';
        await supabase.from('follows').insert({
          follower_id: user.id,
          following_id: id,
          status,
        });
        setIsFollowing(true);
        setFollowStatus(status);
        toast.success(status === 'pending' ? 'Follow request sent' : 'Following');
      }
      fetchStats();
    } catch (error: any) {
      toast.error(error.message || 'Failed to follow');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-gray-400">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-b from-purple-950/50 to-black p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-4xl">
            {profile.avatar_emoji || '✨'}
          </div>
          {isOwnProfile ? (
            <Button asChild variant="outline" className="border-white/20">
              <Link to="/app/edit-profile">
                <Settings className="w-4 h-4 mr-2" />
                {t('edit_profile')}
              </Link>
            </Button>
          ) : (
            <Button
              onClick={handleFollow}
              variant={isFollowing ? 'outline' : 'default'}
              className={isFollowing ? 'border-white/20' : 'bg-purple-600 hover:bg-purple-700'}
            >
              {isFollowing ? (
                followStatus === 'pending' ? (
                  <>{t('follow_requested')}</>
                ) : (
                  <><UserMinus className="w-4 h-4 mr-2" />{t('unfollow')}</>
                )
              ) : (
                <><UserPlus className="w-4 h-4 mr-2" />{t('follow')}</>
              )}
            </Button>
          )}
        </div>

        <div className="mb-4">
          <h1 className="text-2xl font-bold mb-1">@{profile.nickname}</h1>
          {profile.is_private && (
            <div className="flex items-center gap-1 text-sm text-gray-400 mb-2">
              <Lock className="w-4 h-4" />
              <span>{t('private_account')}</span>
            </div>
          )}
          {profile.bio && <p className="text-gray-300">{profile.bio}</p>}
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text">
              {profile.aura_total}
            </p>
            <p className="text-sm text-gray-400">{t('total_aura')}</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{stats.followers}</p>
            <p className="text-sm text-gray-400">{t('followers')}</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{stats.following}</p>
            <p className="text-sm text-gray-400">{t('following')}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 rounded-lg p-3">
            <p className="text-sm text-gray-400">{t('actions_posted')}</p>
            <p className="text-xl font-bold">{stats.actionsCount}</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <p className="text-sm text-gray-400">{t('confirmations_received')}</p>
            <p className="text-xl font-bold">{stats.confirmationsReceived}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">Actions</h2>
        {actions.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No actions yet</p>
        ) : (
          actions.map((action) => {
            const category = categories.find(c => c.id === action.category_id);
            return (
              <ActionCard
                key={action.id}
                action={action}
                category={category}
                profile={profile}
                onUpdate={fetchActions}
              />
            );
          })
        )}
      </div>
    </div>
  );
};
