"use client";

import React, { useEffect } from "react";

export default function LoginPage(): React.JSX.Element {
  useEffect(() => {
    // Redirect to portal login page
    // After login, user will go to platform-selection and can choose task management
    const portalUrl = process.env.NEXT_PUBLIC_PORTAL_URL || "http://localhost:3001";
    window.location.href = `${portalUrl}/login`;
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting to login...</p>
      </div>
    </div>
  );
}
