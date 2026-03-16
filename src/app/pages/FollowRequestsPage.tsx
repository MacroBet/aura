import React, { useState, useEffect } from 'react';
import { UserPlus, Check, X } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '../components/ui/button';
import { useAuth, useLanguage } from '../../lib/contexts';
import { useTranslation } from '../../lib/translations';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

export const FollowRequestsPage: React.FC = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const t = useTranslation(language);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchRequests();
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`follow-requests-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'follows',
          filter: `following_id=eq.${user.id}`,
        },
        () => {
          fetchRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const fetchRequests = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('follows')
      .select(`
        *,
        profiles!follows_follower_id_fkey (*)
      `)
      .eq('following_id', user.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error(error.message || t('failed_to_load_requests'));
      setLoading(false);
      return;
    }

    setRequests(data || []);
    setLoading(false);
  };

  const handleRequest = async (id: string, accept: boolean) => {
    if (processingId) return;
    setProcessingId(id);
    try {
      if (accept) {
        const { error } = await supabase
          .from('follows')
          .update({ status: 'accepted' })
          .eq('id', id);
        if (error) throw error;
        toast.success(t('request_accepted'));
      } else {
        const { error } = await supabase.from('follows').delete().eq('id', id);
        if (error) throw error;
        toast.success(t('request_declined'));
      }
      await fetchRequests();
    } catch (error: any) {
      toast.error(error.message || t('failed_to_update_request'));
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="sticky top-0 bg-black/95 backdrop-blur-lg border-b border-white/10 z-40 p-4">
        <div className="flex items-center gap-2">
          <UserPlus className="w-6 h-6 text-purple-500" />
          <h1 className="text-2xl font-bold">{t('follow_requests')}</h1>
        </div>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12">
            <UserPlus className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">{t('no_pending_requests')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((request) => (
              <div key={request.id} className="flex items-center gap-3 p-4 bg-white/5 rounded-lg">
                <Link to={`/app/profile/${request.profiles.id}`} className="flex items-center gap-3 flex-1">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-xl">
                    {request.profiles.avatar_emoji || '✨'}
                  </div>
                  <div>
                    <p className="font-semibold">@{request.profiles.nickname}</p>
                    <p className="text-sm text-gray-400">{request.profiles.aura_total} aura</p>
                  </div>
                </Link>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleRequest(request.id, true)}
                    className="bg-green-600 hover:bg-green-700"
                    disabled={processingId === request.id}
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRequest(request.id, false)}
                    className="border-white/20"
                    disabled={processingId === request.id}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
