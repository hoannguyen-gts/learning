import { useState } from 'react';
import type { RegisterResponse, ApiError, View } from '../types';
import AuthLayout from '../components/AuthLayout';
import FormGroup from '../components/ui/FormGroup';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

interface SignupPageProps {
  onNavigate: (view: View) => void;
}

export default function SignupPage({ onNavigate }: SignupPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Bản dịch của handleSignup — app.js:159-196
  async function handleSubmit(e: React.ChangeEvent<HTMLFormElement>) {
    e.preventDefault();

    const name = username.trim();

    if (!name || !password || !confirmPassword) {
      alert('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    if (password !== confirmPassword) {
      alert('Mật khẩu xác nhận không khớp');
      return;
    }
    if (password.length < 3) {
      alert('Mật khẩu quá ngắn (tối thiểu 3 ký tự)');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: name, password }),
      });

      const data: RegisterResponse | ApiError = await res.json();

      if (!res.ok) {
        alert((data as ApiError).message || 'Đăng ký thất bại');
        return;
      }

      alert(data.message || 'Đăng ký thành công! Vui lòng đăng nhập');
      onNavigate('login');
    } catch (error) {
      console.error('Signup error:', error);
      alert('Không thể kết nối đến máy chủ');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout switchLabel="Log in" onSwitch={() => onNavigate('login')}>
      <form onSubmit={handleSubmit}>
        <FormGroup label="Username:" htmlFor="signup-username">
          <Input
            id="signup-username" type="text" placeholder="Enter username..."
            autoComplete="off" required
            value={username} onChange={(e) => setUsername(e.target.value)}
          />
        </FormGroup>

        <FormGroup label="Password:" htmlFor="signup-password">
          <Input
            id="signup-password" type="password" placeholder="Enter password..." required
            value={password} onChange={(e) => setPassword(e.target.value)}
          />
        </FormGroup>

        <FormGroup label="Confirm Password:" htmlFor="signup-confirm-password">
          <Input
            id="signup-confirm-password" type="password" placeholder="Enter password..." required
            value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </FormGroup>

        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? '...' : 'Sign up'}
        </Button>
      </form>
    </AuthLayout>
  );
}
