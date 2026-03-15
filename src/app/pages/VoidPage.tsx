import React, { useState, useEffect } from 'react';
import { Ghost } from 'lucide-react';
import { ActionCard } from '../components/ActionCard';
import { useAuth, useLanguage } from '../../lib/contexts';
import { useTranslation } from '../../lib/translations';
import { supabase } from '../../lib/supabase';

export const VoidPage: React.FC = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const t = useTranslation(language);
  const [actions, setActions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVoidActions();
    fetchCategories();
  }, []);

  const fetchVoidActions = async () => {
    const { data } = await supabase
      .from('actions')
      .select(`
        *,
        profiles!actions_user_id_fkey (*)
      `)
      .eq('user_id', user!.id)
      .eq('status', 'void')
      .order('expires_at', { ascending: false });

    setActions(data || []);
    setLoading(false);
  };

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*');
    setCategories(data || []);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="sticky top-0 bg-black/95 backdrop-blur-lg border-b border-white/10 z-40 p-4">
        <div className="flex items-center gap-2">
          <Ghost className="w-6 h-6 text-gray-500" />
          <h1 className="text-2xl font-bold">Lost in the Void</h1>
        </div>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : actions.length === 0 ? (
          <div className="text-center py-12">
            <Ghost className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">{t('empty_void')}</h3>
            <p className="text-gray-400">{t('empty_void_desc')}</p>
          </div>
        ) : (
          actions.map((action) => {
            const category = categories.find(c => c.id === action.category_id);
            return (
              <ActionCard
                key={action.id}
                action={action}
                category={category}
                profile={action.profiles}
              />
            );
          })
        )}
      </div>
    </div>
  );
};
