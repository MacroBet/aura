import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { UserMinus, UserPlus } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useAuth, useLanguage } from '../../lib/contexts';
import { useTranslation } from '../../lib/translations';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

export const FollowingPage: React.FC = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { language } = useLanguage();
  const t = useTranslation(language);
  const [following, setFollowing] = useState<any[]>([]);
  const [followStatusByUser, setFollowStatusByUser] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [actionLoadingUserId, setActionLoadingUserId] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchFollowing();
    }
  }, [id, user?.id]);

  useEffect(() => {
    if (!id) return;

    const channel = supabase
      .channel(`following-list-${id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'follows',
          filter: `follower_id=eq.${id}`,
        },
        () => {
          fetchFollowing();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, user?.id]);

  const fetchFollowing = async () => {
    if (!id) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('follows')
      .select(`
        following_id,
        profiles!follows_following_id_fkey (*)
      `)
      .eq('follower_id', id)
      .eq('status', 'accepted')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error(error.message || t('failed_to_load_following'));
      setFollowing([]);
      setLoading(false);
      return;
    }

    const rows = data || [];
    setFollowing(rows);

    if (!user) {
      setFollowStatusByUser({});
      setLoading(false);
      return;
    }

    const targetIds = rows
      .map((row) => row.following_id)
      .filter((followingId: string) => followingId !== user.id);

    if (targetIds.length === 0) {
      setFollowStatusByUser({});
      setLoading(false);
      return;
    }

    const { data: relations, error: relationError } = await supabase
      .from('follows')
      .select('following_id, status')
      .eq('follower_id', user.id)
      .in('following_id', targetIds);

    if (relationError) {
      toast.error(relationError.message || t('failed_to_load_follow_state'));
      setFollowStatusByUser({});
      setLoading(false);
      return;
    }

    const relationMap: Record<string, string> = {};
    (relations || []).forEach((relation) => {
      relationMap[relation.following_id] = relation.status;
    });
    setFollowStatusByUser(relationMap);
    setLoading(false);
  };

  const handleToggleFollow = async (targetProfile: any) => {
    if (!user || actionLoadingUserId) return;

    const existingStatus = followStatusByUser[targetProfile.id];
    setActionLoadingUserId(targetProfile.id);

    try {
      if (existingStatus) {
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', targetProfile.id);
        if (error) throw error;

        setFollowStatusByUser((prev) => {
          const next = { ...prev };
          delete next[targetProfile.id];
          return next;
        });
      } else {
        const { data, error } = await supabase
          .from('follows')
          .insert({
            follower_id: user.id,
            following_id: targetProfile.id,
            status: 'accepted',
          })
          .select('status')
          .maybeSingle();
        if (error) throw error;

        setFollowStatusByUser((prev) => ({
          ...prev,
          [targetProfile.id]: data?.status || (targetProfile.is_private ? 'pending' : 'accepted'),
        }));
      }
    } catch (error: any) {
      toast.error(error.message || t('follow_update_failed'));
    } finally {
      setActionLoadingUserId(null);
    }
  };

  const getFollowButtonLabel = (status?: string) => {
    if (!status) return t('follow');
    if (status === 'pending') return t('follow_requested');
    return t('unfollow');
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="sticky top-0 bg-black/95 backdrop-blur-lg border-b border-white/10 z-40 p-4">
        <h1 className="text-2xl font-bold">{t('following')}</h1>
      </div>
      <div className="p-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : following.length === 0 ? (
          <p className="text-center text-gray-400 py-12">{t('empty_following')}</p>
        ) : (
          <div className="space-y-2">
            {following.map((row) => {
              const targetProfile = row.profiles;
              return (
                <div key={targetProfile.id} className="flex items-center gap-3 p-4 bg-white/5 rounded-lg">
                  <Link to={`/app/profile/${targetProfile.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-xl">
                      {targetProfile.avatar_emoji || '✨'}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold truncate">@{targetProfile.nickname}</p>
                      <p className="text-sm text-gray-400">{targetProfile.aura_total} {t('aura')}</p>
                    </div>
                  </Link>
                  {user && user.id !== targetProfile.id && (
                    <Button
                      size="sm"
                      variant={followStatusByUser[targetProfile.id] ? 'outline' : 'default'}
                      onClick={() => handleToggleFollow(targetProfile)}
                      disabled={actionLoadingUserId === targetProfile.id}
                      className={followStatusByUser[targetProfile.id] ? 'border-white/20' : 'bg-purple-600 hover:bg-purple-700'}
                    >
                      {followStatusByUser[targetProfile.id] === 'accepted' ? (
                        <UserMinus className="w-4 h-4 mr-1" />
                      ) : (
                        <UserPlus className="w-4 h-4 mr-1" />
                      )}
                      {getFollowButtonLabel(followStatusByUser[targetProfile.id])}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
