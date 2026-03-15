import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { PlusCircle, Sparkles, Search, Gift } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ActionCard } from '../components/ActionCard';
import { useAuth, useLanguage } from '../../lib/contexts';
import { useTranslation } from '../../lib/translations';
import { supabase } from '../../lib/supabase';

export const FeedPage: React.FC = () => {
  const { user, profile } = useAuth();
  const { language } = useLanguage();
  const t = useTranslation(language);
  const [activeTab, setActiveTab] = useState('for-you');
  const [actions, setActions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchActions();
  }, [activeTab, user]);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order');
    
    if (data) setCategories(data);
  };

  const fetchActions = async () => {
    if (!user) return;
    
    setLoading(true);

    try {
      let query = supabase
        .from('actions')
        .select(`
          *,
          profiles!actions_user_id_fkey (*)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (activeTab === 'friends') {
        // Get following user IDs
        const { data: following } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', user.id)
          .eq('status', 'accepted');

        const followingIds = following?.map(f => f.following_id) || [];
        
        if (followingIds.length === 0) {
          setActions([]);
          setLoading(false);
          return;
        }

        query = query.in('user_id', followingIds);
      } else if (activeTab === 'rising') {
        // Get actions created in last 12 hours with high confirmation count
        const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString();
        query = query
          .gte('created_at', twelveHoursAgo)
          .gte('confirmation_count', 3)
          .order('confirmation_count', { ascending: false });
      } else {
        // For You - public actions
        query = query.eq('visibility', 'public');
      }

      const { data, error } = await query;

      if (error) throw error;

      // Process expired actions and score them
      const processedActions = await Promise.all(
        (data || []).map(async (action) => {
          if (
            action.status === 'active' &&
            action.user_id === user.id &&
            categories.length > 0 &&
            new Date(action.expires_at) < new Date()
          ) {
            // Score this action
            const auraAwarded = action.confirmation_count > 0
              ? (categories.find(c => c.id === action.category_id)?.base_points || 0) * action.confirmation_count
              : 0;

            const { error: updateError } = await supabase
              .from('actions')
              .update({
                status: action.confirmation_count > 0 ? 'scored' : 'void',
                aura_awarded: auraAwarded,
                scored_at: new Date().toISOString(),
              })
              .eq('id', action.id);

            if (updateError) {
              return action;
            }

            if (auraAwarded > 0) {
              // Update user's total aura
              await supabase.rpc('increment_aura', {
                user_id: action.user_id,
                amount: auraAwarded,
              });
            }

            return { ...action, status: action.confirmation_count > 0 ? 'scored' : 'void', aura_awarded: auraAwarded };
          }
          return action;
        })
      );

      setActions(processedActions);
    } catch (error) {
      console.error('Error fetching actions:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 bg-black/95 backdrop-blur-lg border-b border-white/10 z-40">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-purple-500" />
            <span className="text-2xl font-bold">Aura</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/app/invite">
                <Gift className="w-5 h-5" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link to="/app/search">
                <Search className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full bg-transparent border-b border-white/10 rounded-none h-12">
            <TabsTrigger
              value="for-you"
              className="flex-1 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-purple-500"
            >
              {t('for_you')}
            </TabsTrigger>
            <TabsTrigger
              value="friends"
              className="flex-1 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-purple-500"
            >
              {t('friends')}
            </TabsTrigger>
            <TabsTrigger
              value="rising"
              className="flex-1 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-purple-500"
            >
              {t('rising')}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Feed Content */}
      <div className="p-4">
        {/* Create Action Button */}
        <Button
          asChild
          className="w-full mb-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          <Link to="/app/create">
            <PlusCircle className="w-5 h-5 mr-2" />
            {t('post_action')}
          </Link>
        </Button>

        {/* Actions List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">{t('loading')}</p>
          </div>
        ) : actions.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">{t('no_actions')}</h3>
            <p className="text-gray-400 mb-6">{t('no_actions_desc')}</p>
            <Button asChild className="bg-purple-600 hover:bg-purple-700">
              <Link to="/app/create">{t('post_action')}</Link>
            </Button>
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
                onUpdate={fetchActions}
              />
            );
          })
        )}
      </div>
    </div>
  );
};
