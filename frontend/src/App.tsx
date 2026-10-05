import { useState } from 'react';
import type { View } from './types';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import TodoPage from './pages/TodoPage';

export default function App() {
  const { isAuthenticated } = useAuth();
  const [view, setView] = useState<View>(() => (isAuthenticated ? 'todo' : 'login'));
  const effectiveView: View = !isAuthenticated && view === 'todo' ? 'login' : view;

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text p-5">
      {effectiveView === 'login' && <LoginPage onNavigate={setView} />}
      {effectiveView === 'signup' && <SignupPage onNavigate={setView} />}
      {effectiveView === 'todo' && <TodoPage />}
    </div>
  );
}
