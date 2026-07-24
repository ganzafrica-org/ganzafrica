"use client";

import { useEffect } from "react";

const PORTAL_URL = process.env.NEXT_PUBLIC_PORTAL_URL || "http://localhost:3001";

export default function LoginRedirect() {
  useEffect(() => {
    const login = new URL(`${PORTAL_URL}/login`);
    login.searchParams.set("next", window.location.origin);
    window.location.href = login.toString();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-600">Redirecting to sign in…</p>
    </div>
  );
}
