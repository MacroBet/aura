import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AuthProvider, LanguageProvider } from '../lib/contexts';
import { Toaster } from './components/ui/sonner';

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <RouterProvider router={router} />
        <Toaster position="top-center" />
      </AuthProvider>
    </LanguageProvider>
  );
}