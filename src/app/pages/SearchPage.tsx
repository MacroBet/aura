import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Link } from 'react-router';
import { Input } from '../components/ui/input';
import { useLanguage } from '../../lib/contexts';
import { useTranslation } from '../../lib/translations';
import { supabase } from '../../lib/supabase';

export const SearchPage: React.FC = () => {
  const { language } = useLanguage();
  const t = useTranslation(language);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (q: string) => {
    setQuery(q);
    if (q.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .ilike('nickname', `%${q}%`)
      .limit(20);

    setResults(data || []);
    setLoading(false);
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
              <Link
                key={profile.id}
                to={`/app/profile/${profile.id}`}
                className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-xl">
                  {profile.avatar_emoji || '✨'}
                </div>
                <div>
                  <p className="font-semibold">@{profile.nickname}</p>
                  <p className="text-sm text-gray-400">{profile.aura_total} aura</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
