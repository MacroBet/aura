import React, { useState } from 'react';
import { Search, UserMinus, UserPlus } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useAuth, useLanguage } from '../../lib/contexts';
import { useTranslation } from '../../lib/translations';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

export const SearchPage: React.FC = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const t = useTranslation(language);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [followStatusByUser, setFollowStatusByUser] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [actionLoadingUserId, setActionLoadingUserId] = useState<string | null>(null);

  const handleSearch = async (q: string) => {
    setQuery(q);
    if (q.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .ilike('nickname', `%${q}%`)
      .limit(20);

    if (error) {
      toast.error(error.message || t('failed_to_search_users'));
      setResults([]);
      setFollowStatusByUser({});
      setLoading(false);
      return;
    }

    const profiles = data || [];
    setResults(profiles);

    if (!user) {
      setFollowStatusByUser({});
      setLoading(false);
      return;
    }

    const targetIds = profiles
      .map((profile) => profile.id)
      .filter((profileId) => profileId !== user.id);

    if (targetIds.length === 0) {
      setFollowStatusByUser({});
      setLoading(false);
      return;
    }

    const { data: followRows, error: followError } = await supabase
      .from('follows')
      .select('following_id, status')
      .eq('follower_id', user.id)
      .in('following_id', targetIds);

    if (followError) {
      toast.error(followError.message || t('failed_to_load_follow_state'));
      setFollowStatusByUser({});
      setLoading(false);
      return;
    }

    const statusMap: Record<string, string> = {};
    (followRows || []).forEach((row) => {
      statusMap[row.following_id] = row.status;
    });
    setFollowStatusByUser(statusMap);
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
        toast.success(existingStatus === 'pending' ? t('request_cancelled') : t('unfollowed_success'));
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

        const newStatus = data?.status || (targetProfile.is_private ? 'pending' : 'accepted');
        setFollowStatusByUser((prev) => ({
          ...prev,
          [targetProfile.id]: newStatus,
        }));
        toast.success(newStatus === 'pending' ? t('follow_request_sent') : t('following_success'));
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
        <div className="flex items-center gap-2">
          <Search className="w-5 h-5 text-gray-400" />
          <Input
            placeholder={t('search_users')}
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            className="bg-white/5 border-white/10 text-white"
          />
        </div>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">{query ? t('no_results') : t('search_users')}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {results.map((profile) => (
              <div
                key={profile.id}
                className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
              >
                <Link to={`/app/profile/${profile.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-xl">
                    {profile.avatar_emoji || '✨'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold truncate">@{profile.nickname}</p>
                    <p className="text-sm text-gray-400">{profile.aura_total} aura</p>
                  </div>
                </Link>

                {user && user.id !== profile.id && (
                  <Button
                    size="sm"
                    variant={followStatusByUser[profile.id] ? 'outline' : 'default'}
                    onClick={() => handleToggleFollow(profile)}
                    disabled={actionLoadingUserId === profile.id}
                    className={
                      followStatusByUser[profile.id]
                        ? 'border-white/20'
                        : 'bg-purple-600 hover:bg-purple-700'
                    }
                  >
                    {followStatusByUser[profile.id] === 'accepted' ? (
                      <UserMinus className="w-4 h-4 mr-1" />
                    ) : (
                      <UserPlus className="w-4 h-4 mr-1" />
                    )}
                    {getFollowButtonLabel(followStatusByUser[profile.id])}
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
