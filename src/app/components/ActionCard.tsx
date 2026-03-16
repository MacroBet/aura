import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { ThumbsUp, MessageCircle, Share2, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth, useLanguage } from '../../lib/contexts';
import { useTranslation } from '../../lib/translations';
import { supabase } from '../../lib/supabase';
import { formatTimeRemaining, getTimeRemaining, calculateAura, isActionExpired } from '../../lib/utils';
import { toast } from 'sonner';

interface ActionCardProps {
  action: any;
  category: any;
  profile: any;
  onUpdate?: () => void;
}

export const ActionCard: React.FC<ActionCardProps> = ({ action, category, profile, onUpdate }) => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const t = useTranslation(language);
  const [timeLeft, setTimeLeft] = useState(getTimeRemaining(action.expires_at));
  const [hasConfirmed, setHasConfirmed] = useState(false);
  const [confirmCount, setConfirmCount] = useState(action.confirmation_count);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeRemaining(action.expires_at));
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [action.expires_at]);

  useEffect(() => {
    const checkConfirmation = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('action_confirmations')
        .select('id')
        .eq('action_id', action.id)
        .eq('user_id', user.id)
        .maybeSingle();
      
      setHasConfirmed(!!data);
    };
    
    checkConfirmation();
  }, [action.id, user]);

  const handleConfirm = async () => {
    if (!user || hasConfirmed || confirming) return;
    if (user.id === action.user_id) {
      toast.error('Cannot confirm your own action');
      return;
    }

    setConfirming(true);

    try {
      const { error } = await supabase
        .from('action_confirmations')
        .insert({
          action_id: action.id,
          user_id: user.id,
        });

      if (error) throw error;

      setHasConfirmed(true);
      setConfirmCount(confirmCount + 1);
      toast.success(t('confirmed'));
      onUpdate?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to confirm');
    } finally {
      setConfirming(false);
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/app/action/${action.id}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${profile?.nickname || 'User'}'s action on Aura`,
          text: action.body,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success('Link copied!');
      }
    } catch (error) {
      // User cancelled or error
    }
  };

  const expired = isActionExpired(action.expires_at);
  const categoryBasePoints = category?.base_points ?? 0;
  const categorySlug = category?.slug;
  const potentialAura = calculateAura(categoryBasePoints, confirmCount || 1);
  const isVoid = expired && confirmCount === 0;

  return (
    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-4 mb-4">
      {/* Header */}
      <Link to={`/app/profile/${profile?.id || action.user_id}`} className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-xl">
          {profile?.avatar_emoji || '✨'}
        </div>
        <div>
          <p className="font-semibold">@{profile?.nickname || 'user'}</p>
          <p className="text-sm text-gray-400">
            {categorySlug ? t(`cat_${categorySlug}`) : 'Category'}
          </p>
        </div>
      </Link>

      {/* Body */}
      <Link to={`/app/action/${action.id}`}>
        <p className="mb-3 text-lg">{action.body}</p>
      </Link>

      {/* Status Bar */}
      <div className="flex items-center justify-between mb-3 text-sm">
        {expired ? (
          <span className={isVoid ? 'text-red-400' : 'text-green-400'}>
            {isVoid ? t('lost_in_void') : `${t('earned')} ${action.aura_awarded} ${t('aura')}`}
          </span>
        ) : (
          <span className="text-purple-400 flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {formatTimeRemaining(timeLeft)} {t('time_left')}
          </span>
        )}
        <span className={confirmCount > 0 ? 'text-green-400' : 'text-gray-400'}>
          {expired ? (
            <>{action.aura_awarded} {t('aura')}</>
          ) : (
            <>{t('will_earn')} {potentialAura} {t('aura')}</>
          )}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant={hasConfirmed ? 'secondary' : 'default'}
          onClick={handleConfirm}
          disabled={hasConfirmed || expired || user?.id === action.user_id || confirming}
          className={hasConfirmed ? 'bg-green-500/20 text-green-400' : 'bg-purple-500/20 text-purple-400'}
        >
          <ThumbsUp className="w-4 h-4 mr-1" />
          {confirmCount} {t('confirmations')}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          asChild
          className="text-gray-400"
        >
          <Link to={`/app/action/${action.id}`}>
            <MessageCircle className="w-4 h-4 mr-1" />
            {t('comment')}
          </Link>
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleShare}
          className="text-gray-400 ml-auto"
        >
          <Share2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
