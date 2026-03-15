import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Sparkles } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useLanguage, useAuth } from '../../lib/contexts';
import { useTranslation } from '../../lib/translations';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { emojiAvatars } from '../../lib/utils';

export const NicknameSetupPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();
  const { user, profile, loading: authLoading, refreshProfile } = useAuth();
  const t = useTranslation(language);
  const [nickname, setNickname] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState(emojiAvatars[0]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const referralFromUrl = new URLSearchParams(location.search).get('ref');
    if (referralFromUrl) {
      localStorage.setItem('pending_referral_code', referralFromUrl);
    }
  }, [location.search]);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      const referralCode = localStorage.getItem('pending_referral_code');
      if (referralCode) {
        navigate(`/auth?ref=${encodeURIComponent(referralCode)}`, { replace: true });
      } else {
        navigate('/auth', { replace: true });
      }
      return;
    }

    if (profile) {
      navigate('/app/feed', { replace: true });
    }
  }, [authLoading, user, profile, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nickname || nickname.length < 3) {
      toast.error('Nickname must be at least 3 characters');
      return;
    }

    if (!user) {
      toast.error('Not authenticated');
      navigate('/auth');
      return;
    }

    setLoading(true);

    try {
      // Check if nickname is taken
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('nickname', nickname)
        .maybeSingle();

      if (existing) {
        toast.error(t('nickname_taken'));
        setLoading(false);
        return;
      }

      // Check for referral code in URL
      const referralCode = localStorage.getItem('pending_referral_code');

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          nickname,
          avatar_emoji: selectedEmoji,
          language,
        });

      if (profileError) throw profileError;

      // If there's a referral code, create referral record
      if (referralCode) {
        const { data: inviter } = await supabase
          .from('profiles')
          .select('id')
          .eq('nickname', referralCode.toLowerCase())
          .maybeSingle();

        if (inviter && inviter.id !== user.id) {
          await supabase.from('referrals').insert({
            inviter_user_id: inviter.id,
            invitee_user_id: user.id,
            referral_code: referralCode,
          });

          // Award referral bonus
          await supabase.rpc('award_referral_bonus', {
            p_inviter_id: inviter.id,
            p_invitee_id: user.id,
          });
        }
      }

      await refreshProfile();
      localStorage.removeItem('pending_referral_code');
      toast.success('Welcome to Aura!');
      navigate('/app/feed');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-12 h-12 text-purple-500" />
            <span className="text-4xl font-bold">Aura</span>
          </div>
          <h1 className="text-2xl font-semibold mb-2">{t('choose_nickname')}</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              {t('choose_emoji')}
            </label>
            <div className="grid grid-cols-10 gap-2 mb-4">
              {emojiAvatars.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setSelectedEmoji(emoji)}
                  className={`text-2xl p-2 rounded-lg transition-all ${
                    selectedEmoji === emoji
                      ? 'bg-purple-500/30 ring-2 ring-purple-500'
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Input
              type="text"
              placeholder={t('nickname_placeholder')}
              value={nickname}
              onChange={(e) => setNickname(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              disabled={loading}
              maxLength={20}
            />
            <p className="text-xs text-gray-500 mt-1">
              3-20 characters, lowercase, numbers, and underscores only
            </p>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            disabled={loading || nickname.length < 3}
          >
            {loading ? t('loading') : t('start_journey')}
          </Button>
        </form>
      </div>
    </div>
  );
};
