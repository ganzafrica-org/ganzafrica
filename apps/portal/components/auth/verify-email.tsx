"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@workspace/ui/components/card";
import { Loader } from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";

export function VerifyEmail() {
  const { verifyEmail, isLoading } = useAuth();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [status, setStatus] = React.useState<"loading" | "success" | "error">(
    "loading",
  );
  const [errorMessage, setErrorMessage] = React.useState("");

  React.useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMessage("Invalid verification link. Please request a new one.");
      return;
    }

    const verify = async () => {
      try {
        const success = await verifyEmail(token);

        if (success) {
          setStatus("success");
        } else {
          setStatus("error");
          setErrorMessage("Failed to verify email. Please try again.");
        }
      } catch (error) {
        setStatus("error");
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Failed to verify email. Please try again.",
        );
      }
    };

    verify();
  }, [token, verifyEmail]);

  if (status === "loading" || isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Verifying Your Email</CardTitle>
          <CardDescription>
            Please wait while we verify your email address...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Loader className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (status === "error") {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Verification Failed</CardTitle>
          <CardDescription>
            We were unable to verify your email address.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">{errorMessage}</p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button asChild>
            <Link href="/login">Return to login</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Email Verified!</CardTitle>
        <CardDescription>
          Your email address has been successfully verified.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-center text-muted-foreground">
          You can now log in to your account and start using all features.
        </p>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button asChild>
          <Link href="/login">Log in to your account</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
