"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import Image from "next/image";

import { Button } from "@workspace/ui/components/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";

import { useAuth } from "@/components/auth/auth-provider";

export function SignupForm() {
  const { signup, isLoading } = useAuth();

  // Signup form
  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  // Handle signup submission
  const handleSignup = async (data: {
    name: string;
    email: string;
    password: string;
  }) => {
    await signup(data.name, data.email, data.password);
  };

  return (
    <div className="flex overflow-hidden rounded-lg shadow-xl mx-auto max-w-4xl">
      {/* Left panel - green with "Create Account" */}
      <div className="w-1/2 bg-primary-green text-white p-8 flex flex-col items-center justify-center">
        <div className="mb-6">
          <Image
            src="/images/logoLight.png"
            alt="Logo"
            width={100}
            height={30}
            className="object-contain"
            priority
          />
        </div>
        <h1 className="text-3xl font-bold mb-4 text-center">Create Account</h1>
        <p className="text-sm text-center mb-8">
          Join our community and start your journey with us
        </p>

        <Link
          href="/login"
          className="border border-white rounded-full px-8 py-2 hover:bg-white hover:text-green-800 transition-colors"
        >
          LOG IN
        </Link>
      </div>

      {/* Right panel - white with signup form */}
      <div className="w-2/3 bg-white p-8">
        <div className="max-w-md mx-auto">
          <h2 className="text-2xl font-semibold text-center mb-2">
            Create Account
          </h2>
          <p className="text-gray-500 text-center mb-6">
            Join our community and start your journey with us
          </p>

          <div className="flex justify-center space-x-4 mb-6">
            <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#000">
                <path d="M9.198 21.5h4v-8.01h3.604l.396-3.98h-4V7.5a1 1 0 0 1 1-1h3v-4h-3a5 5 0 0 0-5 5v2.01h-2l-.396 3.98h2.396v8.01z" />
              </svg>
            </button>
            <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#000">
                <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-1.5 19.05c-3.584-.167-6.55-3.133-6.717-6.717.166-3.584 3.133-6.55 6.717-6.716 1.5.9 2.717 3.15 2.967 5.417h-1.967v2.5h4.883c-.567 2.9-3.383 5.483-5.883 5.516z" />
              </svg>
            </button>
            <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#000">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
              </svg>
            </button>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSignup)}
              className="space-y-5"
            >
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="John Doe"
                    className="pl-10 py-2 block w-full border border-gray-200 rounded"
                    {...form.register("name")}
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                      />
                    </svg>
                  </div>
                  <input
                    type="email"
                    placeholder="email@example.com"
                    className="pl-10 py-2 block w-full border border-gray-200 rounded"
                    {...form.register("email")}
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="pl-10 py-2 block w-full border border-gray-200 rounded"
                    {...form.register("password")}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full py-2 rounded-md text-white bg-primary-green"
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : "Sign Up"}
              </Button>

              <div className="text-center mt-4">
                <p className="text-sm text-primary-green">
                  Already have an account?{" "}
                  <Link href="/login" className="text-blue-600 hover:underline">
                    Log in
                  </Link>
                </p>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
