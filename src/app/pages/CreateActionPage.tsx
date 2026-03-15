import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Clock, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Label } from '../components/ui/label';
import { useAuth, useLanguage } from '../../lib/contexts';
import { useTranslation } from '../../lib/translations';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

export const CreateActionPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language } = useLanguage();
  const t = useTranslation(language);
  const [body, setBody] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [categories, setCategories] = useState<any[]>([]);
  const [actionsToday, setActionsToday] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchTodayActions();
  }, []);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order');
    
    if (data) {
      setCategories(data);
      if (data.length > 0) setCategoryId(data[0].id);
    }
  };

  const fetchTodayActions = async () => {
    if (!user) return;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { count } = await supabase
      .from('actions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', todayStart.toISOString());

    setActionsToday(count || 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!body.trim()) {
      toast.error('Please write something');
      return;
    }

    if (body.length > 280) {
      toast.error('Keep it short! Max 280 characters');
      return;
    }

    if (!categoryId) {
      toast.error('Please select a category');
      return;
    }

    if (actionsToday >= 3) {
      toast.error(t('max_actions'));
      return;
    }

    setLoading(true);

    try {
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      const { error } = await supabase
        .from('actions')
        .insert({
          user_id: user!.id,
          category_id: categoryId,
          body: body.trim(),
          visibility,
          expires_at: expiresAt,
        });

      if (error) throw error;

      toast.success('Action posted!');
      navigate('/app/feed');
    } catch (error: any) {
      toast.error(error.message || 'Failed to post action');
    } finally {
      setLoading(false);
    }
  };

  const remainingActions = Math.max(0, 3 - actionsToday);
  const selectedCategory = categories.find(c => c.id === categoryId);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 bg-black/95 backdrop-blur-lg border-b border-white/10 z-40 p-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-semibold">{t('create_action')}</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-4">
        {/* Actions Remaining */}
        <div className={`mb-6 p-4 rounded-lg border ${
          remainingActions === 0
            ? 'bg-red-500/10 border-red-500/20'
            : 'bg-purple-500/10 border-purple-500/20'
        }`}>
          <div className="flex items-center gap-2">
            {remainingActions === 0 ? (
              <AlertCircle className="w-5 h-5 text-red-400" />
            ) : (
              <Clock className="w-5 h-5 text-purple-400" />
            )}
            <span>
              <strong>{remainingActions}</strong> {t('actions_remaining')}
            </span>
          </div>
        </div>

        {/* Category Select */}
        <div className="mb-6">
          <Label className="mb-2 block">{t('choose_category')}</Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger className="bg-white/5 border-white/10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {t(`cat_${cat.slug}`)} (+{cat.base_points} {t('aura')} per confirmation)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Action Body */}
        <div className="mb-6">
          <Textarea
            placeholder={t('action_placeholder')}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 min-h-32 resize-none"
            maxLength={280}
          />
          <div className="flex justify-between mt-2 text-sm text-gray-400">
            <span>{t('expires_24h')}</span>
            <span>{body.length}/280</span>
          </div>
        </div>

        {/* Potential Aura */}
        {selectedCategory && (
          <div className="mb-6 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
            <p className="text-sm text-gray-400 mb-1">{t('will_earn')}</p>
            <p className="text-2xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text">
              {selectedCategory.base_points}+ {t('aura')}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {selectedCategory.base_points} × {t('confirmations').toLowerCase()}
            </p>
          </div>
        )}

        {/* Visibility */}
        <div className="mb-6">
          <Label className="mb-3 block">{t('visibility')}</Label>
          <RadioGroup value={visibility} onValueChange={setVisibility}>
            <div className="flex items-center space-x-2 mb-2">
              <RadioGroupItem value="public" id="public" />
              <Label htmlFor="public" className="cursor-pointer">
                {t('public')}
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="followers" id="followers" />
              <Label htmlFor="followers" className="cursor-pointer">
                {t('followers_only')}
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          disabled={loading || remainingActions === 0 || !body.trim()}
        >
          {loading ? t('loading') : t('post')}
        </Button>
      </form>
    </div>
  );
};
