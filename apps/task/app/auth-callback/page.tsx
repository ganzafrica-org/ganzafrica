"use client";

import React, { useEffect, Suspense, useState } from 'react';
import React, { useEffect, Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    // Ensure we're on the client side
    if (typeof window === 'undefined') {
      return;
    }

    const processAuth = () => {
      try {
        const token = searchParams.get('token');
        const user = searchParams.get('user');
        const portalUrl = process.env.NEXT_PUBLIC_PORTAL_URL || 'http://localhost:3001';
    // Ensure we're on the client side
    if (typeof window === 'undefined') {
      return;
    }

    const processAuth = () => {
      try {
        const token = searchParams.get('token');
        const user = searchParams.get('user');
        const portalUrl = process.env.NEXT_PUBLIC_PORTAL_URL || 'http://localhost:3001';

        if (token && user) {
          try {
            // Store the authentication tokens
            localStorage.setItem('accessToken', token);
            
            // Store user data - safely parse the user data
            let parsedUser;
            try {
              const decodedUser = decodeURIComponent(user);
              parsedUser = JSON.parse(decodedUser);
            } catch (parseError) {
              console.error('Error parsing user data:', parseError);
              toast.error('Invalid user data received');
              window.location.href = `${portalUrl}/login`;
              return;
            }

            localStorage.setItem('user', JSON.stringify(parsedUser));
            localStorage.setItem('task_user', JSON.stringify(parsedUser));
        if (token && user) {
          try {
            // Store the authentication tokens
            localStorage.setItem('accessToken', token);
            
            // Store user data - safely parse the user data
            let parsedUser;
            try {
              const decodedUser = decodeURIComponent(user);
              parsedUser = JSON.parse(decodedUser);
            } catch (parseError) {
              console.error('Error parsing user data:', parseError);
              toast.error('Invalid user data received');
              window.location.href = `${portalUrl}/login`;
              return;
            }

            localStorage.setItem('user', JSON.stringify(parsedUser));
            localStorage.setItem('task_user', JSON.stringify(parsedUser));

            toast.success('Authentication successful!');
            
            // Redirect to my-tasks
            setTimeout(() => {
              router.push('/my-tasks');
            }, 500);
          } catch (error: unknown) {
            console.error('Error processing authentication:', error);
            toast.error('Authentication failed. Please try again.');
            // Redirect back to portal login
            const portalUrl = process.env.NEXT_PUBLIC_PORTAL_URL || 'http://localhost:3001';
            window.location.href = `${portalUrl}/login`;
          }
        } else {
          // No authentication data, redirect to portal login
          toast.error('No authentication data received');
          const portalUrl = process.env.NEXT_PUBLIC_PORTAL_URL || 'http://localhost:3001';
          window.location.href = `${portalUrl}/login`;
        }
      } catch (error: unknown) {
        console.error('Error in auth callback:', error);
        const portalUrl = process.env.NEXT_PUBLIC_PORTAL_URL || 'http://localhost:3001';
        window.location.href = `${portalUrl}/login`;
      } finally {
        setIsProcessing(false);
      }
    };

    processAuth();
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

export default function AuthCallbackPage(): React.JSX.Element {
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
