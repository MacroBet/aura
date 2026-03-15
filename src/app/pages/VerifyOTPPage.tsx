import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Sparkles } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useLanguage } from '../../lib/contexts';
import { useTranslation } from '../../lib/translations';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '../components/ui/input-otp';

const MIN_OTP_LENGTH = 6;
const MAX_OTP_LENGTH = 8;

export const VerifyOTPPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();
  const t = useTranslation(language);
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const getReferralCode = () => {
    const referralFromUrl = new URLSearchParams(location.search).get('ref');
    return referralFromUrl || localStorage.getItem('pending_referral_code');
  };

  useEffect(() => {
    const pendingEmail = localStorage.getItem('pending_email');
    if (!pendingEmail) {
      navigate('/auth');
      return;
    }
    setEmail(pendingEmail);
  }, [navigate]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleVerify = async () => {
    if (otp.length < MIN_OTP_LENGTH || otp.length > MAX_OTP_LENGTH) {
      toast.error('Please enter the code from your email');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email',
      });

      if (error) throw error;

      // Check if user has a profile
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      localStorage.removeItem('pending_email');
      const referralCode = getReferralCode();

      if (!profile) {
        if (referralCode) {
          navigate(`/setup-nickname?ref=${encodeURIComponent(referralCode)}`);
        } else {
          navigate('/setup-nickname');
        }
      } else {
        localStorage.removeItem('pending_referral_code');
        navigate('/app/feed');
      }
    } catch (error: any) {
      toast.error(error.message || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    if (!email) {
      toast.error('Missing email. Please try again.');
      navigate('/auth');
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
        },
      });

      if (error) throw error;

      setResendCooldown(60);
      toast.success('Code resent!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to resend code');
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
          <h1 className="text-2xl font-semibold mb-2">{t('enter_code')}</h1>
          <p className="text-gray-400">
            {t('code_sent_to')} {email}
          </p>
        </div>

        <div className="flex justify-center mb-6">
          <InputOTP
            maxLength={MAX_OTP_LENGTH}
            value={otp}
            onChange={setOtp}
            onComplete={(value) => {
              if (value.length >= MIN_OTP_LENGTH) {
                handleVerify();
              }
            }}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} className="bg-white/5 border-white/10 text-white" />
              <InputOTPSlot index={1} className="bg-white/5 border-white/10 text-white" />
              <InputOTPSlot index={2} className="bg-white/5 border-white/10 text-white" />
              <InputOTPSlot index={3} className="bg-white/5 border-white/10 text-white" />
            </InputOTPGroup>
            <InputOTPSeparator className="text-gray-500" />
            <InputOTPGroup>
              <InputOTPSlot index={4} className="bg-white/5 border-white/10 text-white" />
              <InputOTPSlot index={5} className="bg-white/5 border-white/10 text-white" />
              <InputOTPSlot index={6} className="bg-white/5 border-white/10 text-white" />
              <InputOTPSlot index={7} className="bg-white/5 border-white/10 text-white" />
            </InputOTPGroup>
          </InputOTP>
        </div>

        <Button
          onClick={handleVerify}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 mb-4"
          disabled={loading || otp.length < MIN_OTP_LENGTH}
        >
          {loading ? t('loading') : t('verify')}
        </Button>

        <div className="text-center">
          <Button
            variant="ghost"
            onClick={handleResend}
            disabled={resendCooldown > 0}
            className="text-gray-400 hover:text-white"
          >
            {resendCooldown > 0 
              ? `${t('resend_code')} (${resendCooldown}s)` 
              : t('resend_code')}
          </Button>
        </div>

        <div className="mt-8 text-center">
          <Button
            variant="ghost"
            onClick={() => navigate('/auth')}
            className="text-gray-400 hover:text-white"
          >
            ← Back
          </Button>
        </div>
      </div>
    </div>
  );
};
