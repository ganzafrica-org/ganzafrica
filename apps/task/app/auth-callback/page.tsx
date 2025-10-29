"use client";

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const user = searchParams.get('user');
    const portalUrl = process.env.NEXT_PUBLIC_PORTAL_URL || 'http://localhost:3001';

    if (token && user) {
      try {
        // Store the authentication tokens
        localStorage.setItem('accessToken', token);
        
        // Store user data
        const parsedUser = JSON.parse(decodeURIComponent(user));
        localStorage.setItem('user', JSON.stringify(parsedUser));
        localStorage.setItem('task_user', JSON.stringify(parsedUser));

        toast.success('Authentication successful!');
        
        // Redirect to board
        router.push('/board');
      } catch (error: unknown) {
        logger.error('Error processing authentication:', error);
        toast.error('Authentication failed. Please try again.');
        // Redirect back to portal login
        window.location.href = `${portalUrl}/login`;
      }
    } else {
      // No authentication data, redirect to portal login
      toast.error('No authentication data received');
      window.location.href = `${portalUrl}/login`;
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Authenticating...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
