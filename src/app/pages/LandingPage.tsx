import React, { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Sparkles, Zap, TrendingUp, Clock, Users, Gift } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useLanguage } from '../../lib/contexts';
import { useTranslation, Language } from '../../lib/translations';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useAuth } from '../../lib/contexts';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();
  const t = useTranslation(language);
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    if (!loading && user && profile) {
      navigate('/app/feed');
    }
  }, [user, profile, loading, navigate]);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-purple-500" />
            <span className="text-2xl font-bold">Aura</span>
          </div>
          <div className="flex items-center gap-4">
            <Select value={language} onValueChange={(val) => setLanguage(val as Language)}>
              <SelectTrigger className="w-32 bg-white/5 border-white/10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="it">Italiano</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="ja">日本語</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => navigate('/auth')} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              {t('sign_in')}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
            {t('hero_title')}
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 mb-8">
            {t('hero_subtitle')}
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate('/auth')}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg px-8 py-6"
          >
            {t('cta_start')}
          </Button>
          <p className="mt-6 text-gray-500">
            {t('tagline')}
          </p>
        </div>
      </section>

      {/* Live Preview Cards */}
      <section className="py-16 px-4 bg-gradient-to-b from-black to-purple-950/20">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center text-xl">
                ⚡
              </div>
              <div>
                <p className="font-semibold">@fastrunner</p>
                <p className="text-sm text-gray-400">Health</p>
              </div>
            </div>
            <p className="mb-4">Ran 5km this morning!</p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-purple-400">12h left</span>
              <span className="text-green-400">+100 aura</span>
            </div>
            <div className="mt-2 text-sm text-gray-400">
              5 confirmations
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-pink-500/20 rounded-full flex items-center justify-center text-xl">
                💎
              </div>
              <div>
                <p className="font-semibold">@kindness_queen</p>
                <p className="text-sm text-gray-400">Kindness</p>
              </div>
            </div>
            <p className="mb-4">Helped elderly neighbor with groceries</p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-purple-400">8h left</span>
              <span className="text-green-400">+80 aura</span>
            </div>
            <div className="mt-2 text-sm text-gray-400">
              8 confirmations
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center text-xl">
                🌟
              </div>
              <div>
                <p className="font-semibold">@eco_warrior</p>
                <p className="text-sm text-gray-400">Environment</p>
              </div>
            </div>
            <p className="mb-4">Cleaned up park with volunteers</p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-purple-400">3h left</span>
              <span className="text-green-400">+250 aura</span>
            </div>
            <div className="mt-2 text-sm text-gray-400">
              10 confirmations
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">{t('how_it_works')}</h2>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4">{t('step1_title')}</h3>
              <p className="text-gray-400">{t('step1_desc')}</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-pink-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4">{t('step2_title')}</h3>
              <p className="text-gray-400">{t('step2_desc')}</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4">{t('step3_title')}</h3>
              <p className="text-gray-400">{t('step3_desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Addictive */}
      <section className="py-20 px-4 bg-gradient-to-b from-purple-950/20 to-black">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">{t('why_addictive')}</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <Clock className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" />
              <div>
                <p className="text-lg">{t('viral_point1')}</p>
              </div>
            </div>
            <div className="flex gap-4">
              <Users className="w-6 h-6 text-pink-400 flex-shrink-0 mt-1" />
              <div>
                <p className="text-lg">{t('viral_point2')}</p>
              </div>
            </div>
            <div className="flex gap-4">
              <Gift className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
              <div>
                <p className="text-lg">{t('viral_point3')}</p>
              </div>
            </div>
            <div className="flex gap-4">
              <TrendingUp className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
              <div>
                <p className="text-lg">{t('viral_point4')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">{t('faq_title')}</h2>
          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-2">{t('faq_q1')}</h3>
              <p className="text-gray-400">{t('faq_a1')}</p>
            </div>
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-2">{t('faq_q2')}</h3>
              <p className="text-gray-400">{t('faq_a2')}</p>
            </div>
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-2">{t('faq_q3')}</h3>
              <p className="text-gray-400">{t('faq_a3')}</p>
            </div>
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-2">{t('faq_q4')}</h3>
              <p className="text-gray-400">{t('faq_a4')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            {t('hero_subtitle')}
          </h2>
          <Button 
            size="lg" 
            onClick={() => navigate('/auth')}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg px-8 py-6"
          >
            {t('cta_start')}
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-4">
        <div className="max-w-6xl mx-auto text-center text-gray-500">
          <p>&copy; 2026 Aura. Built for the internet.</p>
        </div>
      </footer>
    </div>
  );
};
