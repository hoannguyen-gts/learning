export interface User {
  id: number;
  username: string;
}

export interface Todo {
  id: number;
  title: string;
  completed: boolean;
  created_at: string;
}

export interface AuthResponse {
  message: string;
  access_token: string;
  user: User;
}

export interface RegisterResponse {
  message: string;
  user: User;
}

export interface ApiError {
  message: string;
}

export type View = 'login' | 'signup' | 'todo';
