import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Link } from 'react-router';
import { useAuth, useLanguage } from '../../lib/contexts';
import { useTranslation } from '../../lib/translations';
import { supabase } from '../../lib/supabase';
import { formatRelativeTime } from '../../lib/utils';

export const NotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const t = useTranslation(language);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    markAsRead();
  }, []);

  const fetchNotifications = async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
      .limit(50);

    setNotifications(data || []);
    setLoading(false);
  };

  const markAsRead = async () => {
    await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('user_id', user!.id)
      .is('read_at', null);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="sticky top-0 bg-black/95 backdrop-blur-lg border-b border-white/10 z-40 p-4">
        <div className="flex items-center gap-2">
          <Bell className="w-6 h-6 text-purple-500" />
          <h1 className="text-2xl font-bold">{t('notifications')}</h1>
        </div>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">{t('no_notifications')}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-4 rounded-lg ${
                  notif.read_at ? 'bg-white/5' : 'bg-purple-500/10 border border-purple-500/20'
                }`}
              >
                <p className="mb-1">{notif.data.message || 'New notification'}</p>
                <p className="text-sm text-gray-400">{formatRelativeTime(notif.created_at)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
