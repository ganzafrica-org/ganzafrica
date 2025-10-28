"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import apiClient from '@/lib/api-client';
import { isAlumni, isAdminOrManager, fetchUserProfile } from '@/lib/auth-utils';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Attempting login with:', email);
      
      // Call the real backend API
      const response = await apiClient.post('/auth/login', {
        email,
        password,
      });
      
      console.log('Login response:', response.data);

      // Store tokens from successful login
      if (response.data.token) {
        localStorage.setItem('accessToken', response.data.token);
        
        // If a refresh token is included, store it too
        if (response.data.refreshToken) {
          localStorage.setItem('refreshToken', response.data.refreshToken);
        }
        
        // Store user data from backend response
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
          localStorage.setItem('task_user', JSON.stringify(response.data.user));
        }
        
        // Fetch complete user profile from API to get role information
        const userProfile = await fetchUserProfile();
        
        if (!userProfile) {
          setError('Failed to fetch user profile. Please try again.');
          setLoading(false);
          return;
        }
        
        // Check if user is Alumni - block access to platform
        if (isAlumni(userProfile)) {
          setError('Access Denied: Alumni users are not allowed to access the task management platform.');
          setLoading(false);
          return;
        }
        
        // Redirect based on role
        if (isAdminOrManager(userProfile)) {
          router.push('/board');
        } else {
          router.push('/my-tasks');
        }
      } else {
        setError('Login failed: No authentication token received');
        console.error('Missing token in response:', response.data);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Task Management
            </h1>
            <p className="text-gray-600">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                Contact administrator
              </Link>
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-xs text-blue-800">
                <strong>Note:</strong> Use your portal credentials to login.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-600">
          <p>
            Or{' '}
            <Link href="http://localhost:3001/login" className="text-blue-600 hover:text-blue-700 font-medium">
              login via Portal
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

