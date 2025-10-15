export const metadata = {
  title: "Task Management",
  description: "Trello-style task management"
}

import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}


