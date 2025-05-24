// app/signup/SignupForm.tsx
"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  Label,
} from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/common/loading";

const signupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email(),
  password: z.string().min(6, "Min. 6 characters"),
});

type SignupValues = z.infer<typeof signupSchema>;

export default function SignupForm() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const callbackUrl = searchParams.get("callbackUrl") || "/analytics";

  const form = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const onSubmit = async (vals: SignupValues) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(vals),
      });

      if (!res.ok) {
        const body = await res.json();
        setError(body.error || "Signup failed");
        return;
      }

      const signInRes = await signIn("credentials", {
        email: vals.email,
        password: vals.password,
        redirect: false,
        callbackUrl,
      });

      if (signInRes?.error) {
        setError(signInRes.error);
        setIsLoading(false);
      } else {
        window.location.href = callbackUrl;
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#001085] via-[#006bff] to-[#00d2ff] p-4">
      <div className="w-full max-w-md">
        <Card className="bg-white/10 backdrop-blur-xl border-white/20">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white text-center">
              Create an account
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div className="bg-red-500/20 text-red-200 text-sm p-3 rounded-lg">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white">Name</Label>
                <Input
                  id="name"
                  {...form.register("name")}
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                />
                {form.formState.errors.name && (
                  <p className="text-red-400 text-sm">{form.formState.errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  {...form.register("email")}
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                />
                {form.formState.errors.email && (
                  <p className="text-red-400 text-sm">{form.formState.errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">Password</Label>
                <Input
                  id="password"
                  type="password"
                  {...form.register("password")}
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                />
                {form.formState.errors.password && (
                  <p className="text-red-400 text-sm">{form.formState.errors.password.message}</p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-[#00d2ff] to-[#a259ff] text-white font-bold"
                disabled={isLoading}
              >
                {isLoading ? <Loading variant="button" text="Creating account..." /> : "Create account"}
              </Button>
            </form>
            <div className="mt-4 text-center">
              <Link
                href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
                className="text-white/60 hover:text-white text-sm"
              >
                Already have an account? Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
