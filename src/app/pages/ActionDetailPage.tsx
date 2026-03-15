import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Send } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ActionCard } from '../components/ActionCard';
import { useAuth, useLanguage } from '../../lib/contexts';
import { useTranslation } from '../../lib/translations';
import { supabase } from '../../lib/supabase';
import { formatRelativeTime } from '../../lib/utils';
import { toast } from 'sonner';

export const ActionDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language } = useLanguage();
  const t = useTranslation(language);
  const [action, setAction] = useState<any>(null);
  const [category, setCategory] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    fetchAction();
    fetchComments();
  }, [id]);

  const fetchAction = async () => {
    const { data: actionData } = await supabase
      .from('actions')
      .select('*')
      .eq('id', id)
      .single();

    if (actionData) {
      setAction(actionData);

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', actionData.user_id)
        .single();
      
      setProfile(profileData);

      const { data: categoryData } = await supabase
        .from('categories')
        .select('*')
        .eq('id', actionData.category_id)
        .single();
      
      setCategory(categoryData);
    }

    setLoading(false);
  };

  const fetchComments = async () => {
    const { data } = await supabase
      .from('comments')
      .select(`
        *,
        profiles (*)
      `)
      .eq('action_id', id)
      .order('created_at', { ascending: true });

    if (data) setComments(data);
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim()) return;

    setPosting(true);

    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          action_id: id,
          user_id: user!.id,
          body: newComment.trim(),
        });

      if (error) throw error;

      setNewComment('');
      fetchComments();
      toast.success('Comment posted!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to post comment');
    } finally {
      setPosting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!action || !profile || !category) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-gray-400">Action not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 bg-black/95 backdrop-blur-lg border-b border-white/10 z-40 p-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-semibold">Action</h1>
        </div>
      </div>

      <div className="p-4">
        {/* Action Card */}
        <ActionCard
          action={action}
          category={category}
          profile={profile}
          onUpdate={fetchAction}
        />

        {/* Comments Section */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-4">{t('comment')}s</h2>
          
          {/* Comments List */}
          <div className="space-y-4 mb-6">
            {comments.map((comment) => (
              <div key={comment.id} className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-sm">
                    {comment.profiles?.avatar_emoji || '✨'}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">@{comment.profiles?.nickname}</p>
                    <p className="text-xs text-gray-500">{formatRelativeTime(comment.created_at)}</p>
                  </div>
                </div>
                <p className="text-sm">{comment.body}</p>
              </div>
            ))}
            
            {comments.length === 0 && (
              <p className="text-center text-gray-500 py-8">No comments yet. Be the first!</p>
            )}
          </div>

          {/* Comment Input */}
          <form onSubmit={handlePostComment} className="flex gap-2">
            <Input
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              disabled={posting}
            />
            <Button
              type="submit"
              disabled={posting || !newComment.trim()}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
