import { useState } from 'react';
import type { AuthResponse, ApiError, View } from '../types';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';
import FormGroup from '../components/ui/FormGroup';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

interface LoginPageProps {
  onNavigate: (view: View) => void;
}

export default function LoginPage({ onNavigate }: LoginPageProps) {
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    const id = identifier.trim();

    if (!id || !password) {
      alert('Vui lòng nhập đầy đủ username và password');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: id, password }),
      });

      const data: AuthResponse | ApiError = await res.json();

      if (!res.ok) {
        alert((data as ApiError).message || 'Đăng nhập thất bại');
        return;
      }

      // Đổi: chỉ truyền access_token vào hàm login
      const ok = data as AuthResponse;
      login(ok.access_token);
      onNavigate('todo');
    } catch (error) {
      console.error('Login error:', error);
      alert('Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng!');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout switchLabel="Sign up" onSwitch={() => onNavigate('signup')}>
      <form onSubmit={handleSubmit}>
        <FormGroup label="Username:" htmlFor="login-username">
          <Input
            id="login-username"
            type="text"
            placeholder="Enter username..."
            autoComplete="off"
            required
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />
        </FormGroup>

        <FormGroup label="Password:" htmlFor="login-password">
          <Input
            id="login-password"
            type="password"
            placeholder="Enter password..."
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </FormGroup>

        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? '...' : 'Login'}
        </Button>
      </form>
    </AuthLayout>
  );
}
