import React, { useState, useEffect } from 'react';
import { Copy, Gift, Users, TrendingUp } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useAuth, useLanguage } from '../../lib/contexts';
import { useTranslation } from '../../lib/translations';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { generateReferralCode } from '../../lib/utils';

export const InvitePage: React.FC = () => {
  const { user, profile } = useAuth();
  const { language } = useLanguage();
  const t = useTranslation(language);
  const [referralStats, setReferralStats] = useState({ count: 0, aura: 0 });
  const referralCode = user ? generateReferralCode(user.id) : '';
  const referralLink = `${window.location.origin}/setup-nickname?ref=${referralCode}`;

  useEffect(() => {
    fetchReferralStats();
  }, []);

  const fetchReferralStats = async () => {
    if (!user) return;

    const { data, count } = await supabase
      .from('referrals')
      .select('*', { count: 'exact' })
      .eq('inviter_user_id', user.id)
      .eq('awarded', true);

    const totalAura = data?.reduce((sum, ref) => sum + ref.aura_bonus, 0) || 0;
    
    setReferralStats({ count: count || 0, aura: totalAura });
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      toast.success(t('link_copied'));
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 bg-black/95 backdrop-blur-lg border-b border-white/10 z-40 p-4">
        <div className="flex items-center gap-2">
          <Gift className="w-6 h-6 text-purple-500" />
          <h1 className="text-2xl font-bold">{t('invite_friends')}</h1>
        </div>
      </div>

      <div className="p-4">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl p-6 mb-6 border border-purple-500/30">
          <h2 className="text-2xl font-bold mb-2">{t('invite_subtitle')}</h2>
          <p className="text-gray-300 mb-4">{t('invite_bonus')}</p>
          <div className="text-4xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text">
            +50 {t('aura')}
          </div>
        </div>

        {/* Referral Code */}
        <div className="bg-white/5 rounded-xl p-6 mb-6">
          <label className="block text-sm text-gray-400 mb-2">{t('your_code')}</label>
          <div className="flex gap-2">
            <div className="flex-1 bg-black/50 rounded-lg p-4 font-mono text-xl text-center border border-white/10">
              {referralCode}
            </div>
            <Button onClick={copyLink} className="bg-purple-600 hover:bg-purple-700">
              <Copy className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Copy Link */}
        <Button onClick={copyLink} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 mb-6">
          <Copy className="w-5 h-5 mr-2" />
          {t('copy_link')}
        </Button>

        {/* Stats */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">{t('referral_stats')}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-purple-400" />
                <span className="text-sm text-gray-400">{t('friends_invited')}</span>
              </div>
              <p className="text-3xl font-bold">{referralStats.count}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                <span className="text-sm text-gray-400">{t('aura_earned')}</span>
              </div>
              <p className="text-3xl font-bold text-transparent bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text">
                {referralStats.aura}
              </p>
            </div>
          </div>
        </div>

        {/* Share CTA */}
        <div className="bg-gradient-to-r from-purple-950/50 to-pink-950/50 rounded-xl p-6 border border-purple-500/20">
          <h3 className="text-lg font-semibold mb-2">Share the vibe</h3>
          <p className="text-gray-400 text-sm">
            The more friends you invite, the more aura you farm. Plus, they get to join the coolest social game on the internet.
          </p>
        </div>
      </div>
    </div>
  );
};
