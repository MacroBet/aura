import { createBrowserRouter, Navigate } from 'react-router';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { VerifyOTPPage } from './pages/VerifyOTPPage';
import { NicknameSetupPage } from './pages/NicknameSetupPage';
import { MainLayout } from './components/MainLayout';
import { FeedPage } from './pages/FeedPage';
import { CreateActionPage } from './pages/CreateActionPage';
import { ActionDetailPage } from './pages/ActionDetailPage';
import { ProfilePage } from './pages/ProfilePage';
import { EditProfilePage } from './pages/EditProfilePage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { InvitePage } from './pages/InvitePage';
import { SearchPage } from './pages/SearchPage';
import { FollowRequestsPage } from './pages/FollowRequestsPage';
import { VoidPage } from './pages/VoidPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/auth',
    element: <AuthPage />,
  },
  {
    path: '/verify-otp',
    element: <VerifyOTPPage />,
  },
  {
    path: '/setup-nickname',
    element: <NicknameSetupPage />,
  },
  {
    path: '/app',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/app/feed" replace />,
      },
      {
        path: 'feed',
        element: <FeedPage />,
      },
      {
        path: 'create',
        element: <CreateActionPage />,
      },
      {
        path: 'action/:id',
        element: <ActionDetailPage />,
      },
      {
        path: 'profile/:id',
        element: <ProfilePage />,
      },
      {
        path: 'edit-profile',
        element: <EditProfilePage />,
      },
      {
        path: 'leaderboard',
        element: <LeaderboardPage />,
      },
      {
        path: 'notifications',
        element: <NotificationsPage />,
      },
      {
        path: 'invite',
        element: <InvitePage />,
      },
      {
        path: 'search',
        element: <SearchPage />,
      },
      {
        path: 'follow-requests',
        element: <FollowRequestsPage />,
      },
      {
        path: 'void',
        element: <VoidPage />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
