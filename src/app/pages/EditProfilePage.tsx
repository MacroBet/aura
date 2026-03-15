import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, LogOut } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useAuth, useLanguage } from '../../lib/contexts';
import { useTranslation, Language } from '../../lib/translations';
import { supabase } from '../../lib/supabase';
import { emojiAvatars } from '../../lib/utils';
import { toast } from 'sonner';

export const EditProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { profile, refreshProfile, user } = useAuth();
  const { language, setLanguage } = useLanguage();
  const t = useTranslation(language);
  const [bio, setBio] = useState(profile?.bio || '');
  const [selectedEmoji, setSelectedEmoji] = useState(profile?.avatar_emoji || emojiAvatars[0]);
  const [isPrivate, setIsPrivate] = useState(profile?.is_private || false);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(profile?.language || 'en');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          bio,
          avatar_emoji: selectedEmoji,
          is_private: isPrivate,
          language: selectedLanguage,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user!.id);

      if (error) throw error;

      setLanguage(selectedLanguage);
      await refreshProfile();
      toast.success('Profile updated!');
      navigate(`/app/profile/${user!.id}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="sticky top-0 bg-black/95 backdrop-blur-lg border-b border-white/10 z-40 p-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-semibold">{t('edit_profile')}</h1>
          <Button onClick={handleSave} disabled={loading} className="bg-purple-600 hover:bg-purple-700">
            {loading ? t('loading') : t('save')}
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        <div>
          <Label className="mb-2 block">{t('choose_emoji')}</Label>
          <div className="grid grid-cols-10 gap-2">
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
          <Label htmlFor="bio" className="mb-2 block">Bio</Label>
          <Textarea
            id="bio"
            placeholder={t('bio_placeholder')}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
            maxLength={160}
          />
          <p className="text-xs text-gray-500 mt-1">{bio.length}/160</p>
        </div>

        <div>
          <Label className="mb-2 block">{t('language')}</Label>
          <Select value={selectedLanguage} onValueChange={(val) => setSelectedLanguage(val as Language)}>
            <SelectTrigger className="bg-white/5 border-white/10">
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
        </div>

        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
          <div>
            <Label htmlFor="private">{t('private_account')}</Label>
            <p className="text-sm text-gray-400">Require approval for new followers</p>
          </div>
          <Switch
            id="private"
            checked={isPrivate}
            onCheckedChange={setIsPrivate}
          />
        </div>

        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10"
        >
          <LogOut className="w-4 h-4 mr-2" />
          {t('logout')}
        </Button>
      </div>
    </div>
  );
};
