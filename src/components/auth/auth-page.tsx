"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/common/loading";

// ▸ minimal schema
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6, "Min. 6 characters"),
});
type FormValues = z.infer<typeof schema>;

export default function AuthPage({ variant }: { variant: "login" | "signup" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // pick callbackUrl from ?callbackUrl=... or default
  const callbackUrl = searchParams.get("callbackUrl") || "/rooms";

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    const res = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
      callbackUrl,
    });

    if (res?.error) {
      setError(res.error);
    } else {
      router.push(callbackUrl);
      router.refresh();
    }
    setIsLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur rounded-2xl shadow-xl p-8">
          <h1 className="text-2xl font-semibold text-center mb-6">
            {variant === "login" ? "Welcome back" : "Create your account"}
          </h1>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {error && <p className="text-sm text-red-500">{error}</p>}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loading variant="button" text={variant === "login" ? "Logging in..." : "Signing up..."} /> : (variant === "login" ? "Log in" : "Sign up & continue")}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center text-sm">
            {variant === "login" ? (
              <>
                Don't have an account?{" "}
                <a
                  href={`/signup?callbackUrl=${encodeURIComponent(
                    callbackUrl
                  )}`}
                  className="underline"
                >
                  Sign up
                </a>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <a
                  href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
                  className="underline"
                >
                  Log in
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
